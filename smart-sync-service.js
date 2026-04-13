// ============================================
// SORCERY PORTAL BRASIL - SMART SYNC SERVICE
// Intelligent sync with merge strategy and conflict resolution
// ============================================

/**
 * Sync strategies for handling conflicts
 */
const SyncStrategy = {
    LOCAL_WINS: 'local_wins',      // Local data overwrites cloud
    CLOUD_WINS: 'cloud_wins',      // Cloud data overwrites local
    NEWEST_WINS: 'newest_wins',    // Most recently updated wins
    MERGE_ADD: 'merge_add',        // Take the higher quantity
    MANUAL: 'manual'               // Prompt user for conflicts
};

/**
 * Sync result types
 */
const SyncResultType = {
    ADDED: 'added',
    UPDATED: 'updated',
    DELETED: 'deleted',
    CONFLICT: 'conflict',
    UNCHANGED: 'unchanged'
};

/**
 * Smart Sync Service
 * Handles intelligent synchronization between local storage and cloud
 */
class SmartSyncService {
    constructor(nocoDBService) {
        this.db = nocoDBService;
        this.syncInProgress = false;
        this.lastSyncResult = null;
        this.conflicts = [];

        // Default strategy
        this.strategy = SyncStrategy.NEWEST_WINS;

        // Batch size for API operations
        this.batchSize = 50;

        console.log('[SmartSync] Service initialized');
    }

    /**
     * Set sync strategy
     */
    setStrategy(strategy) {
        if (Object.values(SyncStrategy).includes(strategy)) {
            this.strategy = strategy;
            console.log('[SmartSync] Strategy set to:', strategy);
        }
    }

    /**
     * Main sync function - intelligently syncs collection
     * @param {Object} localCollection - Local collection data
     * @param {Object} options - Sync options
     * @returns {Object} Sync result
     */
    async syncCollection(localCollection, options = {}) {
        if (this.syncInProgress) {
            throw new Error('Sync already in progress');
        }

        if (!this.db.currentUser) {
            throw new Error('Must be logged in to sync');
        }

        this.syncInProgress = true;
        this.conflicts = [];

        const startTime = Date.now();
        const result = {
            success: false,
            strategy: options.strategy || this.strategy,
            stats: {
                added: 0,
                updated: 0,
                deleted: 0,
                conflicts: 0,
                unchanged: 0
            },
            changes: [],
            conflicts: [],
            duration: 0,
            timestamp: new Date().toISOString()
        };

        try {
            console.log('[SmartSync] Starting sync with strategy:', result.strategy);

            // 1. Get current cloud state
            const cloudCollection = await this.getCloudCollectionMap();
            console.log('[SmartSync] Cloud records:', Object.keys(cloudCollection).length);

            // 2. Prepare local data with timestamps
            const localData = this.prepareLocalData(localCollection);
            console.log('[SmartSync] Local records:', Object.keys(localData).length);

            // 3. Calculate diff
            const diff = this.calculateDiff(localData, cloudCollection);
            console.log('[SmartSync] Diff calculated:', {
                toAdd: diff.toAdd.length,
                toUpdate: diff.toUpdate.length,
                toDelete: diff.toDelete.length,
                conflicts: diff.conflicts.length
            });

            // 4. Handle conflicts based on strategy
            const resolvedConflicts = this.resolveConflicts(
                diff.conflicts,
                options.strategy || this.strategy,
                localData,
                cloudCollection
            );

            // Merge resolved conflicts into updates
            diff.toUpdate.push(...resolvedConflicts.updates);
            result.conflicts = resolvedConflicts.unresolved;
            result.stats.conflicts = resolvedConflicts.unresolved.length;

            // If there are unresolved conflicts and strategy is MANUAL, stop
            if (result.stats.conflicts > 0 && result.strategy === SyncStrategy.MANUAL) {
                this.conflicts = result.conflicts;
                result.success = false;
                result.message = `${result.stats.conflicts} conflicts need manual resolution`;
                this.syncInProgress = false;
                this.lastSyncResult = result;
                return result;
            }

            // 5. Execute sync operations in batches
            // Add new records
            if (diff.toAdd.length > 0) {
                const addResults = await this.batchCreate(diff.toAdd);
                result.stats.added = addResults.success;
                result.changes.push(...addResults.changes);
            }

            // Update existing records
            if (diff.toUpdate.length > 0) {
                const updateResults = await this.batchUpdate(diff.toUpdate);
                result.stats.updated = updateResults.success;
                result.changes.push(...updateResults.changes);
            }

            // Delete removed records (only if option enabled)
            if (options.deleteRemoved !== false && diff.toDelete.length > 0) {
                const deleteResults = await this.batchDelete(diff.toDelete);
                result.stats.deleted = deleteResults.success;
                result.changes.push(...deleteResults.changes);
            }

            result.stats.unchanged = Object.keys(localData).length -
                result.stats.added - result.stats.updated;

            result.success = true;
            result.message = 'Sync completed successfully';

        } catch (error) {
            console.error('[SmartSync] Sync error:', error);
            result.success = false;
            result.error = error.message;
            result.message = 'Sync failed: ' + error.message;
        } finally {
            result.duration = Date.now() - startTime;
            this.syncInProgress = false;
            this.lastSyncResult = result;
            console.log('[SmartSync] Sync completed in', result.duration, 'ms');
        }

        return result;
    }

    /**
     * Get cloud collection as a map for easy lookup
     */
    async getCloudCollectionMap() {
        const records = await this.db.getCloudCollection();
        const map = {};

        for (const record of records) {
            map[record.card_name] = {
                id: record.Id,
                cardName: record.card_name,
                quantity: record.quantity || 1,
                foil: record.foil || false,
                condition: record.condition || 'NM',
                notes: record.notes || '',
                syncedAt: record.synced_at || record.created_at,
                createdAt: record.created_at,
                updatedAt: record.updated_at
            };
        }

        return map;
    }

    /**
     * Prepare local data with proper timestamps
     */
    prepareLocalData(localCollection) {
        const data = {};
        const now = new Date().toISOString();

        for (const [cardName, value] of Object.entries(localCollection)) {
            if (typeof value === 'object') {
                data[cardName] = {
                    cardName,
                    quantity: value.qty || 1,
                    foil: value.foil || false,
                    condition: value.condition || 'NM',
                    notes: value.notes || '',
                    addedAt: value.addedAt || now,
                    updatedAt: value.updatedAt || value.addedAt || now
                };
            } else {
                // Simple format (just quantity or boolean)
                data[cardName] = {
                    cardName,
                    quantity: typeof value === 'number' ? value : 1,
                    foil: false,
                    condition: 'NM',
                    notes: '',
                    addedAt: now,
                    updatedAt: now
                };
            }
        }

        return data;
    }

    /**
     * Calculate diff between local and cloud data
     */
    calculateDiff(localData, cloudData) {
        const toAdd = [];
        const toUpdate = [];
        const toDelete = [];
        const conflicts = [];

        const localCards = new Set(Object.keys(localData));
        const cloudCards = new Set(Object.keys(cloudData));

        // Cards to add (in local but not in cloud)
        for (const cardName of localCards) {
            if (!cloudCards.has(cardName)) {
                toAdd.push({
                    operation: 'create',
                    cardName,
                    data: localData[cardName]
                });
            }
        }

        // Cards to delete (in cloud but not in local)
        for (const cardName of cloudCards) {
            if (!localCards.has(cardName)) {
                toDelete.push({
                    operation: 'delete',
                    cardName,
                    cloudId: cloudData[cardName].id
                });
            }
        }

        // Cards in both - check for updates or conflicts
        for (const cardName of localCards) {
            if (cloudCards.has(cardName)) {
                const local = localData[cardName];
                const cloud = cloudData[cardName];

                // Check if data is different
                const isDifferent = this.isDataDifferent(local, cloud);

                if (isDifferent) {
                    // Check timestamps to determine conflict
                    const localTime = new Date(local.updatedAt).getTime();
                    const cloudTime = new Date(cloud.syncedAt || cloud.updatedAt).getTime();

                    // If timestamps are close (within 5 minutes), it's a conflict
                    const timeDiff = Math.abs(localTime - cloudTime);
                    if (timeDiff < 300000) { // 5 minutes
                        conflicts.push({
                            cardName,
                            local,
                            cloud,
                            localTime,
                            cloudTime
                        });
                    } else {
                        // Clear winner based on timestamp
                        toUpdate.push({
                            operation: 'update',
                            cardName,
                            cloudId: cloud.id,
                            data: localTime > cloudTime ? local : null,
                            source: localTime > cloudTime ? 'local' : 'cloud'
                        });
                    }
                }
                // If not different, no action needed
            }
        }

        return { toAdd, toUpdate, toDelete, conflicts };
    }

    /**
     * Check if local and cloud data are different
     */
    isDataDifferent(local, cloud) {
        return (
            local.quantity !== cloud.quantity ||
            local.foil !== cloud.foil ||
            local.condition !== cloud.condition ||
            local.notes !== cloud.notes
        );
    }

    /**
     * Resolve conflicts based on strategy
     */
    resolveConflicts(conflicts, strategy, localData, cloudData) {
        const updates = [];
        const unresolved = [];

        for (const conflict of conflicts) {
            let resolution = null;

            switch (strategy) {
                case SyncStrategy.LOCAL_WINS:
                    resolution = {
                        operation: 'update',
                        cardName: conflict.cardName,
                        cloudId: conflict.cloud.id,
                        data: conflict.local,
                        source: 'local',
                        reason: 'local_wins_strategy'
                    };
                    break;

                case SyncStrategy.CLOUD_WINS:
                    // No update needed, cloud already has the data
                    resolution = null;
                    break;

                case SyncStrategy.NEWEST_WINS:
                    if (conflict.localTime >= conflict.cloudTime) {
                        resolution = {
                            operation: 'update',
                            cardName: conflict.cardName,
                            cloudId: conflict.cloud.id,
                            data: conflict.local,
                            source: 'local',
                            reason: 'newest_wins_local'
                        };
                    }
                    // If cloud is newer, no update needed
                    break;

                case SyncStrategy.MERGE_ADD:
                    // Take the higher quantity, merge other fields from local
                    const mergedData = {
                        ...conflict.local,
                        quantity: Math.max(conflict.local.quantity, conflict.cloud.quantity)
                    };
                    resolution = {
                        operation: 'update',
                        cardName: conflict.cardName,
                        cloudId: conflict.cloud.id,
                        data: mergedData,
                        source: 'merged',
                        reason: 'merge_add_strategy'
                    };
                    break;

                case SyncStrategy.MANUAL:
                default:
                    // Add to unresolved for manual resolution
                    unresolved.push(conflict);
                    break;
            }

            if (resolution) {
                updates.push(resolution);
            }
        }

        return { updates, unresolved };
    }

    /**
     * Batch create records
     */
    async batchCreate(items) {
        const results = { success: 0, failed: 0, changes: [] };

        for (let i = 0; i < items.length; i += this.batchSize) {
            const batch = items.slice(i, i + this.batchSize);

            for (const item of batch) {
                try {
                    await this.db.createRecord(this.db.tables.collection, {
                        user_id: this.db.currentUser.id,
                        card_name: item.cardName,
                        quantity: item.data.quantity,
                        foil: item.data.foil,
                        condition: item.data.condition,
                        notes: item.data.notes,
                        synced_at: new Date().toISOString()
                    });

                    results.success++;
                    results.changes.push({
                        type: SyncResultType.ADDED,
                        cardName: item.cardName
                    });
                } catch (error) {
                    console.error('[SmartSync] Failed to create:', item.cardName, error);
                    results.failed++;
                }
            }

            // Small delay between batches to avoid rate limiting
            if (i + this.batchSize < items.length) {
                await this.delay(100);
            }
        }

        return results;
    }

    /**
     * Batch update records
     */
    async batchUpdate(items) {
        const results = { success: 0, failed: 0, changes: [] };

        // Filter out items where we don't need to update (cloud wins)
        const toUpdate = items.filter(item => item.data !== null);

        for (let i = 0; i < toUpdate.length; i += this.batchSize) {
            const batch = toUpdate.slice(i, i + this.batchSize);

            for (const item of batch) {
                try {
                    await this.db.updateRecord(this.db.tables.collection, item.cloudId, {
                        quantity: item.data.quantity,
                        foil: item.data.foil,
                        condition: item.data.condition,
                        notes: item.data.notes,
                        synced_at: new Date().toISOString()
                    });

                    results.success++;
                    results.changes.push({
                        type: SyncResultType.UPDATED,
                        cardName: item.cardName,
                        source: item.source
                    });
                } catch (error) {
                    console.error('[SmartSync] Failed to update:', item.cardName, error);
                    results.failed++;
                }
            }

            if (i + this.batchSize < toUpdate.length) {
                await this.delay(100);
            }
        }

        return results;
    }

    /**
     * Batch delete records
     */
    async batchDelete(items) {
        const results = { success: 0, failed: 0, changes: [] };

        for (let i = 0; i < items.length; i += this.batchSize) {
            const batch = items.slice(i, i + this.batchSize);

            for (const item of batch) {
                try {
                    await this.db.deleteRecord(this.db.tables.collection, item.cloudId);

                    results.success++;
                    results.changes.push({
                        type: SyncResultType.DELETED,
                        cardName: item.cardName
                    });
                } catch (error) {
                    console.error('[SmartSync] Failed to delete:', item.cardName, error);
                    results.failed++;
                }
            }

            if (i + this.batchSize < items.length) {
                await this.delay(100);
            }
        }

        return results;
    }

    /**
     * Download and merge cloud data into local
     */
    async downloadAndMerge(localCollection, strategy = SyncStrategy.CLOUD_WINS) {
        if (!this.db.currentUser) {
            throw new Error('Must be logged in');
        }

        console.log('[SmartSync] Downloading and merging with strategy:', strategy);

        const cloudData = await this.getCloudCollectionMap();
        const localData = this.prepareLocalData(localCollection);
        const merged = {};

        // Start with all cloud data
        for (const [cardName, cloud] of Object.entries(cloudData)) {
            merged[cardName] = {
                qty: cloud.quantity,
                foil: cloud.foil,
                condition: cloud.condition,
                notes: cloud.notes,
                addedAt: cloud.createdAt,
                updatedAt: cloud.syncedAt
            };
        }

        // Merge local data based on strategy
        for (const [cardName, local] of Object.entries(localData)) {
            if (merged[cardName]) {
                // Card exists in both
                switch (strategy) {
                    case SyncStrategy.LOCAL_WINS:
                        merged[cardName] = {
                            qty: local.quantity,
                            foil: local.foil,
                            condition: local.condition,
                            notes: local.notes,
                            addedAt: local.addedAt,
                            updatedAt: local.updatedAt
                        };
                        break;

                    case SyncStrategy.MERGE_ADD:
                        merged[cardName].qty = Math.max(
                            merged[cardName].qty,
                            local.quantity
                        );
                        break;

                    case SyncStrategy.NEWEST_WINS:
                        const localTime = new Date(local.updatedAt).getTime();
                        const cloudTime = new Date(merged[cardName].updatedAt).getTime();
                        if (localTime > cloudTime) {
                            merged[cardName] = {
                                qty: local.quantity,
                                foil: local.foil,
                                condition: local.condition,
                                notes: local.notes,
                                addedAt: local.addedAt,
                                updatedAt: local.updatedAt
                            };
                        }
                        break;

                    // CLOUD_WINS: already using cloud data, no change needed
                }
            } else {
                // Card only in local
                merged[cardName] = {
                    qty: local.quantity,
                    foil: local.foil,
                    condition: local.condition,
                    notes: local.notes,
                    addedAt: local.addedAt,
                    updatedAt: local.updatedAt
                };
            }
        }

        return merged;
    }

    /**
     * Get pending conflicts
     */
    getConflicts() {
        return this.conflicts;
    }

    /**
     * Resolve a specific conflict manually
     */
    async resolveConflict(cardName, resolution) {
        const conflict = this.conflicts.find(c => c.cardName === cardName);
        if (!conflict) {
            throw new Error('Conflict not found');
        }

        let dataToUse;
        switch (resolution) {
            case 'local':
                dataToUse = conflict.local;
                break;
            case 'cloud':
                // No update needed
                this.conflicts = this.conflicts.filter(c => c.cardName !== cardName);
                return { success: true, action: 'kept_cloud' };
            case 'merge':
                dataToUse = {
                    ...conflict.local,
                    quantity: Math.max(conflict.local.quantity, conflict.cloud.quantity)
                };
                break;
            default:
                throw new Error('Invalid resolution');
        }

        try {
            await this.db.updateRecord(this.db.tables.collection, conflict.cloud.id, {
                quantity: dataToUse.quantity,
                foil: dataToUse.foil,
                condition: dataToUse.condition,
                notes: dataToUse.notes,
                synced_at: new Date().toISOString()
            });

            this.conflicts = this.conflicts.filter(c => c.cardName !== cardName);
            return { success: true, action: 'updated', data: dataToUse };
        } catch (error) {
            throw new Error('Failed to resolve conflict: ' + error.message);
        }
    }

    /**
     * Get last sync result
     */
    getLastSyncResult() {
        return this.lastSyncResult;
    }

    /**
     * Check if sync is in progress
     */
    isSyncing() {
        return this.syncInProgress;
    }

    /**
     * Helper: delay for rate limiting
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// SYNC UI HELPERS
// ============================================

/**
 * Show sync progress modal
 */
function showSyncProgressModal(message = 'Sincronizando...') {
    let modal = document.getElementById('sync-progress-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sync-progress-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="sync-spinner" style="margin: 2rem auto;"></div>
                <p id="sync-progress-message" style="margin-bottom: 1rem;">${message}</p>
                <div id="sync-progress-bar" class="progress-bar" style="display: none;">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('sync-progress-message').textContent = message;
    modal.classList.remove('hidden');
}

/**
 * Update sync progress
 */
function updateSyncProgress(percent, message) {
    const progressBar = document.getElementById('sync-progress-bar');
    const progressFill = progressBar?.querySelector('.progress-fill');
    const messageEl = document.getElementById('sync-progress-message');

    if (progressBar) {
        progressBar.style.display = 'block';
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    }

    if (messageEl && message) {
        messageEl.textContent = message;
    }
}

/**
 * Hide sync progress modal
 */
function hideSyncProgressModal() {
    const modal = document.getElementById('sync-progress-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Show conflict resolution modal
 */
function showConflictResolutionModal(conflicts) {
    let modal = document.getElementById('conflict-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'conflict-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const conflictItems = conflicts.map(c => `
        <div class="conflict-item" data-card="${c.cardName}">
            <h4>${c.cardName}</h4>
            <div class="conflict-comparison">
                <div class="conflict-local">
                    <strong>Local</strong>
                    <p>Quantidade: ${c.local.quantity}</p>
                    <p>Foil: ${c.local.foil ? 'Sim' : 'Não'}</p>
                    <p>Condição: ${c.local.condition}</p>
                </div>
                <div class="conflict-cloud">
                    <strong>Nuvem</strong>
                    <p>Quantidade: ${c.cloud.quantity}</p>
                    <p>Foil: ${c.cloud.foil ? 'Sim' : 'Não'}</p>
                    <p>Condição: ${c.cloud.condition}</p>
                </div>
            </div>
            <div class="conflict-actions">
                <button class="btn secondary" onclick="resolveConflictUI('${c.cardName}', 'local')">
                    Usar Local
                </button>
                <button class="btn secondary" onclick="resolveConflictUI('${c.cardName}', 'cloud')">
                    Usar Nuvem
                </button>
                <button class="btn primary" onclick="resolveConflictUI('${c.cardName}', 'merge')">
                    Mesclar (Maior Qtd)
                </button>
            </div>
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Conflitos de Sincronização</h2>
                <button class="close-modal" onclick="closeConflictModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                    ${conflicts.length} carta(s) foram modificadas em ambos os lugares.
                    Escolha qual versão manter:
                </p>
                <div class="conflict-list">
                    ${conflictItems}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn secondary" onclick="resolveAllConflicts('local')">
                    Usar Todos Local
                </button>
                <button class="btn secondary" onclick="resolveAllConflicts('cloud')">
                    Usar Todos Nuvem
                </button>
                <button class="btn primary" onclick="resolveAllConflicts('merge')">
                    Mesclar Todos
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeConflictModal() {
    const modal = document.getElementById('conflict-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ============================================
// INITIALIZE
// ============================================

// Create global instance when nocoDBService is available
let smartSyncService = null;

function initSmartSync() {
    if (typeof nocoDBService !== 'undefined') {
        smartSyncService = new SmartSyncService(nocoDBService);
        window.smartSyncService = smartSyncService;
        console.log('[SmartSync] Global instance created');
    } else {
        console.warn('[SmartSync] nocoDBService not available yet');
    }
}

// Try to init immediately, or wait for DOMContentLoaded
if (typeof nocoDBService !== 'undefined') {
    initSmartSync();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initSmartSync, 100);
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SmartSyncService,
        SyncStrategy,
        SyncResultType
    };
}
