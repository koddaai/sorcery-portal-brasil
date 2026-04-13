// ============================================
// SORCERY PORTAL BRASIL - OFFLINE MANAGER
// PWA Offline Support & Install Prompt
// ============================================

// Storage key constants
const SYNC_QUEUE_PREFIX = 'sorcery-sync-queue';

// Get user-specific storage key for sync queue
function getSyncQueueStorageKey() {
    let userId = null;
    if (typeof nocoDBService !== 'undefined' && nocoDBService.currentUser) {
        userId = nocoDBService.currentUser.id || nocoDBService.currentUser.Id;
    }
    if (!userId) {
        try {
            const session = localStorage.getItem('sorcery-session');
            if (session) {
                const user = JSON.parse(session);
                userId = user.id || user.Id;
            }
        } catch (e) {}
    }
    return userId ? `${SYNC_QUEUE_PREFIX}-${userId}` : SYNC_QUEUE_PREFIX;
}

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.deferredPrompt = null;
        this.lastSyncTime = this.getLastSyncTime();

        this.init();
    }

    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Listen for beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => this.handleInstallPrompt(e));

        // Listen for app installed
        window.addEventListener('appinstalled', () => this.handleAppInstalled());

        // Initial state
        this.updateConnectionStatus();

        // Load sync queue from storage
        this.loadSyncQueue();

        // Check if we should show install prompt
        this.checkInstallPrompt();

        console.log('[Offline] Manager initialized. Online:', this.isOnline);
    }

    // ============================================
    // CONNECTION HANDLING
    // ============================================

    handleOnline() {
        console.log('[Offline] Back online!');
        this.isOnline = true;
        this.hideOfflineIndicator();
        this.updateConnectionStatus();

        // Process queued actions
        this.processSyncQueue();

        // Refresh data
        this.refreshData();
    }

    handleOffline() {
        console.log('[Offline] Gone offline');
        this.isOnline = false;
        this.showOfflineIndicator();
        this.updateConnectionStatus();
    }

    showOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            // Re-initialize icon
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    updateConnectionStatus() {
        // Update any connection status indicators in the UI
        const statusDots = document.querySelectorAll('.connection-status .status-dot');
        statusDots.forEach(dot => {
            dot.classList.toggle('offline', !this.isOnline);
        });
    }

    // ============================================
    // SYNC QUEUE
    // ============================================

    queueAction(action) {
        this.syncQueue.push({
            id: Date.now(),
            action,
            timestamp: new Date().toISOString()
        });
        this.saveSyncQueue();
        console.log('[Offline] Action queued:', action.type);
    }

    async processSyncQueue() {
        if (this.syncQueue.length === 0) return;

        console.log('[Offline] Processing sync queue:', this.syncQueue.length, 'items');

        const queue = [...this.syncQueue];
        this.syncQueue = [];

        for (const item of queue) {
            try {
                await this.processAction(item.action);
                console.log('[Offline] Synced:', item.action.type);
            } catch (error) {
                console.error('[Offline] Sync failed:', item.action.type, error);
                // Re-queue failed actions
                this.syncQueue.push(item);
            }
        }

        this.saveSyncQueue();
        this.updateLastSyncTime();
    }

    async processAction(action) {
        switch (action.type) {
            case 'ADD_TO_COLLECTION':
                // Will be implemented with cloud sync
                break;
            case 'REMOVE_FROM_COLLECTION':
                break;
            case 'UPDATE_QUANTITY':
                break;
            default:
                console.warn('[Offline] Unknown action type:', action.type);
        }
    }

    loadSyncQueue() {
        const storageKey = getSyncQueueStorageKey();
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            this.syncQueue = JSON.parse(saved);
            console.log('[Offline] Loaded sync queue from', storageKey, ':', this.syncQueue.length, 'items');
        }
        // Also try to migrate from global key if user-specific is empty
        this.migrateSyncQueue();
    }

    migrateSyncQueue() {
        const userKey = getSyncQueueStorageKey();
        const globalKey = SYNC_QUEUE_PREFIX;

        // Only migrate if we have a user-specific key and global data exists
        if (userKey !== globalKey) {
            const globalData = localStorage.getItem(globalKey);
            if (globalData && this.syncQueue.length === 0) {
                try {
                    this.syncQueue = JSON.parse(globalData);
                    this.saveSyncQueue();
                    console.log('[Offline] Migrated sync queue from global to', userKey);
                } catch (e) {
                    console.error('[Offline] Failed to migrate sync queue:', e);
                }
            }
        }
    }

    saveSyncQueue() {
        const storageKey = getSyncQueueStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(this.syncQueue));
    }

    getLastSyncTime() {
        // Get user-specific sync time if logged in
        let userId = null;
        try {
            const session = localStorage.getItem('sorcery-session');
            if (session) {
                const user = JSON.parse(session);
                // IMPORTANT: Use lowercase 'id' first for consistency
                userId = user.id || user.Id;
            }
        } catch (e) {}
        const key = userId ? `sorcery-last-sync-${userId}` : 'sorcery-last-sync';
        return localStorage.getItem(key);
    }

    updateLastSyncTime() {
        // Save user-specific sync time if logged in
        let userId = null;
        try {
            const session = localStorage.getItem('sorcery-session');
            if (session) {
                const user = JSON.parse(session);
                // IMPORTANT: Use lowercase 'id' first for consistency
                userId = user.id || user.Id;
            }
        } catch (e) {}
        const now = new Date().toISOString();
        const key = userId ? `sorcery-last-sync-${userId}` : 'sorcery-last-sync';
        localStorage.setItem(key, now);
        this.lastSyncTime = now;
    }

    // ============================================
    // DATA REFRESH
    // ============================================

    async refreshData() {
        console.log('[Offline] Refreshing data...');

        // Notify the app to refresh
        if (typeof loadCardsDatabase === 'function') {
            try {
                await loadCardsDatabase();
                console.log('[Offline] Cards database refreshed');
            } catch (error) {
                console.error('[Offline] Failed to refresh cards:', error);
            }
        }

        // Refresh prices if available
        if (typeof priceService !== 'undefined' && priceService.initNocodbPrices) {
            try {
                await priceService.initNocodbPrices();
                console.log('[Offline] Prices refreshed');
            } catch (error) {
                console.error('[Offline] Failed to refresh prices:', error);
            }
        }
    }

    // ============================================
    // INSTALL PROMPT
    // ============================================

    handleInstallPrompt(e) {
        // Prevent Chrome's default install prompt
        e.preventDefault();

        // Save the event for later
        this.deferredPrompt = e;

        // Check if we should show our custom prompt
        if (this.shouldShowInstallPrompt()) {
            this.showInstallPrompt();
        }
    }

    shouldShowInstallPrompt() {
        // Don't show if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return false;
        }

        // Don't show if dismissed recently
        const dismissed = localStorage.getItem('sorcery-install-dismissed');
        if (dismissed) {
            const dismissedDate = new Date(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return false;
            }
        }

        // Don't show on first visit
        const visitCount = parseInt(localStorage.getItem('sorcery-visit-count') || '0');
        if (visitCount < 2) {
            localStorage.setItem('sorcery-visit-count', (visitCount + 1).toString());
            return false;
        }

        return true;
    }

    checkInstallPrompt() {
        // Increment visit count
        const visitCount = parseInt(localStorage.getItem('sorcery-visit-count') || '0');
        localStorage.setItem('sorcery-visit-count', (visitCount + 1).toString());
    }

    showInstallPrompt() {
        const prompt = document.getElementById('install-prompt');
        if (prompt) {
            prompt.classList.remove('hidden');

            // Setup install button
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.addEventListener('click', () => this.installApp());
            }
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.log('[Offline] No install prompt available');
            return;
        }

        // Show the prompt
        this.deferredPrompt.prompt();

        // Wait for user response
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[Offline] Install outcome:', outcome);

        // Clear the prompt
        this.deferredPrompt = null;

        // Hide our custom prompt
        this.dismissInstallPrompt();
    }

    handleAppInstalled() {
        console.log('[Offline] App installed!');

        // Hide install prompt
        this.dismissInstallPrompt();

        // Track installation
        localStorage.setItem('sorcery-installed', 'true');
        localStorage.setItem('sorcery-install-date', new Date().toISOString());

        // Show success message
        if (typeof showToast === 'function') {
            showToast('App instalado com sucesso!', 'success');
        }
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================

    async getCacheSize() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                usageFormatted: this.formatBytes(estimate.usage),
                quotaFormatted: this.formatBytes(estimate.quota),
                percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
            };
        }
        return null;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async clearCache() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            registration.active.postMessage({ type: 'CLEAR_CACHE' });
        }

        // Also clear localStorage caches
        const keysToKeep = ['sorcery-collection', 'sorcery-wishlist', 'sorcery-decks'];
        const allKeys = Object.keys(localStorage);

        allKeys.forEach(key => {
            if (key.startsWith('sorcery-') && !keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });

        console.log('[Offline] Cache cleared');
    }

    // ============================================
    // STATUS & INFO
    // ============================================

    getStatus() {
        return {
            isOnline: this.isOnline,
            isInstalled: window.matchMedia('(display-mode: standalone)').matches,
            hasSyncQueue: this.syncQueue.length > 0,
            syncQueueCount: this.syncQueue.length,
            lastSyncTime: this.lastSyncTime,
            canInstall: !!this.deferredPrompt
        };
    }
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

// Dismiss install prompt
function dismissInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
        prompt.classList.add('hidden');
    }
    localStorage.setItem('sorcery-install-dismissed', new Date().toISOString());
}

// Show update available
function showUpdateAvailable() {
    const toast = document.getElementById('update-toast');
    if (toast) {
        toast.classList.remove('hidden');
    }
}

// Dismiss update toast
function dismissUpdateToast() {
    const toast = document.getElementById('update-toast');
    if (toast) {
        toast.classList.add('hidden');
    }
}

// Check if app is installed
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           localStorage.getItem('sorcery-installed') === 'true';
}

// Get offline status
function isOffline() {
    return !navigator.onLine;
}

// ============================================
// INITIALIZE
// ============================================

// Create global instance
const offlineManager = new OfflineManager();

// Expose to window for debugging
window.offlineManager = offlineManager;

// Export functions
window.dismissInstallPrompt = dismissInstallPrompt;
window.showUpdateAvailable = showUpdateAvailable;
window.dismissUpdateToast = dismissUpdateToast;
window.isAppInstalled = isAppInstalled;
window.isOffline = isOffline;

console.log('[Offline] Module loaded');
