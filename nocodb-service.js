// ============================================
// SORCERY NOCODB SERVICE
// Cloud sync and user management via NocoDB
// ============================================

class NocoDBService {
    constructor() {
        this.baseUrl = 'https://dados.kodda.ai';
        this.apiToken = 'GcWFEnNtNLcuubiYMDGlACXr_Sls7c15SEYKe72-';
        this.baseId = 'pybbgkutded1ay0';

        // Table names as they appear in NocoDB
        this.tables = {
            users: 'users',
            collection: 'collection',
            wishlist: 'wishlist',
            tradeBinder: 'trade_binder',
            decks: 'decks',
            cardPhotos: 'card_photos'
        };

        this.currentUser = null;
        this.loadSession();
    }

    // Get headers for API requests
    getHeaders() {
        return {
            'xc-token': this.apiToken,
            'Content-Type': 'application/json'
        };
    }

    // Build API URL for table operations (NocoDB v1 API)
    getTableUrl(tableName) {
        return `${this.baseUrl}/api/v1/db/data/noco/${this.baseId}/${tableName}`;
    }

    // Load session from localStorage
    loadSession() {
        const session = localStorage.getItem('sorcery-session');
        if (session) {
            this.currentUser = JSON.parse(session);
        }
    }

    // Save session to localStorage
    saveSession() {
        if (this.currentUser) {
            localStorage.setItem('sorcery-session', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('sorcery-session');
        }
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    // Register a new user
    async register(email, password, displayName) {
        try {
            // Check if user exists
            const existing = await this.findUserByEmail(email);
            if (existing) {
                throw new Error('Email already registered');
            }

            // Hash password (simple hash for demo - use bcrypt in production)
            const passwordHash = await this.hashPassword(password);

            // Create user
            const response = await fetch(this.getTableUrl(this.tables.users), {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    email: email,
                    password_hash: passwordHash,
                    display_name: displayName,
                    created_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to create user');
            }

            const user = await response.json();
            this.currentUser = {
                id: user.Id,
                email: user.email,
                displayName: user.display_name
            };
            this.saveSession();
            return this.currentUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Login user
    async login(email, password) {
        try {
            const user = await this.findUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify password
            const passwordHash = await this.hashPassword(password);
            if (user.password_hash !== passwordHash) {
                throw new Error('Invalid password');
            }

            this.currentUser = {
                id: user.Id,
                email: user.email,
                displayName: user.display_name
            };
            this.saveSession();
            return this.currentUser;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        this.saveSession();
    }

    // Find user by email
    async findUserByEmail(email) {
        try {
            const url = `${this.getTableUrl(this.tables.users)}?where=(email,eq,${encodeURIComponent(email)})`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.list && data.list.length > 0 ? data.list[0] : null;
        } catch (error) {
            console.error('Find user error:', error);
            return null;
        }
    }

    // Simple password hash (for demo purposes)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'sorcery-salt-2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ==========================================
    // COLLECTION SYNC
    // ==========================================

    // Sync local collection to cloud
    async syncCollectionToCloud(localCollection) {
        if (!this.currentUser) {
            throw new Error('Must be logged in to sync');
        }

        try {
            // Get existing cloud collection
            const cloudCollection = await this.getCloudCollection();

            // Delete existing records for this user
            for (const record of cloudCollection) {
                await this.deleteRecord(this.tables.collection, record.Id);
            }

            // Upload local collection
            for (const [cardName, data] of Object.entries(localCollection)) {
                await this.createRecord(this.tables.collection, {
                    user_id: this.currentUser.id,
                    card_name: cardName,
                    quantity: typeof data === 'object' ? data.qty : 1,
                    foil: typeof data === 'object' ? (data.foil || false) : false,
                    condition: typeof data === 'object' ? (data.condition || 'NM') : 'NM',
                    notes: typeof data === 'object' ? (data.notes || '') : '',
                    synced_at: new Date().toISOString()
                });
            }

            return { success: true, count: Object.keys(localCollection).length };
        } catch (error) {
            console.error('Sync to cloud error:', error);
            throw error;
        }
    }

    // Get collection from cloud
    async getCloudCollection() {
        if (!this.currentUser) {
            return [];
        }

        try {
            const url = `${this.getTableUrl(this.tables.collection)}?where=(user_id,eq,${this.currentUser.id})&limit=1000`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch collection');
            }

            const data = await response.json();
            return data.list || [];
        } catch (error) {
            console.error('Get cloud collection error:', error);
            return [];
        }
    }

    // Download cloud collection to local format
    async downloadCollectionFromCloud() {
        const cloudCollection = await this.getCloudCollection();
        const localFormat = {};

        for (const record of cloudCollection) {
            localFormat[record.card_name] = {
                qty: record.quantity || 1,
                foil: record.foil || false,
                condition: record.condition || 'NM',
                notes: record.notes || ''
            };
        }

        return localFormat;
    }

    // ==========================================
    // WISHLIST SYNC
    // ==========================================

    async syncWishlistToCloud(localWishlist) {
        if (!this.currentUser) {
            throw new Error('Must be logged in to sync');
        }

        try {
            // Get existing cloud wishlist
            const url = `${this.getTableUrl(this.tables.wishlist)}?where=(user_id,eq,${this.currentUser.id})&limit=1000`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            // Delete existing records
            for (const record of (data.list || [])) {
                await this.deleteRecord(this.tables.wishlist, record.Id);
            }

            // Upload local wishlist
            const wishlistArray = Array.from(localWishlist);
            for (const cardName of wishlistArray) {
                await this.createRecord(this.tables.wishlist, {
                    user_id: this.currentUser.id,
                    card_name: cardName,
                    priority: 'normal',
                    synced_at: new Date().toISOString()
                });
            }

            return { success: true, count: wishlistArray.length };
        } catch (error) {
            console.error('Sync wishlist error:', error);
            throw error;
        }
    }

    async downloadWishlistFromCloud() {
        if (!this.currentUser) return new Set();

        try {
            const url = `${this.getTableUrl(this.tables.wishlist)}?where=(user_id,eq,${this.currentUser.id})&limit=1000`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return new Set((data.list || []).map(r => r.card_name));
        } catch (error) {
            console.error('Download wishlist error:', error);
            return new Set();
        }
    }

    // ==========================================
    // TRADE BINDER SYNC
    // ==========================================

    async syncTradeBinderToCloud(localTradeBinder) {
        if (!this.currentUser) {
            throw new Error('Must be logged in to sync');
        }

        try {
            const url = `${this.getTableUrl(this.tables.tradeBinder)}?where=(user_id,eq,${this.currentUser.id})&limit=1000`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            for (const record of (data.list || [])) {
                await this.deleteRecord(this.tables.tradeBinder, record.Id);
            }

            const tradeArray = Array.from(localTradeBinder);
            for (const cardName of tradeArray) {
                await this.createRecord(this.tables.tradeBinder, {
                    user_id: this.currentUser.id,
                    card_name: cardName,
                    synced_at: new Date().toISOString()
                });
            }

            return { success: true, count: tradeArray.length };
        } catch (error) {
            console.error('Sync trade binder error:', error);
            throw error;
        }
    }

    async downloadTradeBinderFromCloud() {
        if (!this.currentUser) return new Set();

        try {
            const url = `${this.getTableUrl(this.tables.tradeBinder)}?where=(user_id,eq,${this.currentUser.id})&limit=1000`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return new Set((data.list || []).map(r => r.card_name));
        } catch (error) {
            console.error('Download trade binder error:', error);
            return new Set();
        }
    }

    // ==========================================
    // DECKS SYNC
    // ==========================================

    async syncDecksToCloud(localDecks) {
        if (!this.currentUser) {
            throw new Error('Must be logged in to sync');
        }

        try {
            const url = `${this.getTableUrl(this.tables.decks)}?where=(user_id,eq,${this.currentUser.id})&limit=1000`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            for (const record of (data.list || [])) {
                await this.deleteRecord(this.tables.decks, record.Id);
            }

            for (const deck of localDecks) {
                await this.createRecord(this.tables.decks, {
                    user_id: this.currentUser.id,
                    deck_name: deck.name,
                    avatar: deck.avatar || '',
                    cards_json: JSON.stringify(deck.cards || []),
                    created_at: deck.createdAt || new Date().toISOString(),
                    synced_at: new Date().toISOString()
                });
            }

            return { success: true, count: localDecks.length };
        } catch (error) {
            console.error('Sync decks error:', error);
            throw error;
        }
    }

    async downloadDecksFromCloud() {
        if (!this.currentUser) return [];

        try {
            const url = `${this.getTableUrl(this.tables.decks)}?where=(user_id,eq,${this.currentUser.id})&limit=100`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return (data.list || []).map(r => ({
                name: r.deck_name,
                avatar: r.avatar || '',
                cards: JSON.parse(r.cards_json || '[]'),
                createdAt: r.created_at
            }));
        } catch (error) {
            console.error('Download decks error:', error);
            return [];
        }
    }

    // ==========================================
    // CARD PHOTOS
    // ==========================================

    // Upload card photo (base64 encoded)
    async uploadCardPhoto(cardName, imageBase64, condition = 'NM', notes = '') {
        if (!this.currentUser) {
            throw new Error('Must be logged in to upload photos');
        }

        try {
            const record = await this.createRecord(this.tables.cardPhotos, {
                user_id: this.currentUser.id,
                card_name: cardName,
                image_base64: imageBase64,
                condition: condition,
                notes: notes,
                uploaded_at: new Date().toISOString()
            });

            return record;
        } catch (error) {
            console.error('Upload photo error:', error);
            throw error;
        }
    }

    // Get photos for a card
    async getCardPhotos(cardName) {
        if (!this.currentUser) return [];

        try {
            const url = `${this.getTableUrl(this.tables.cardPhotos)}?where=(user_id,eq,${this.currentUser.id})~and(card_name,eq,${encodeURIComponent(cardName)})`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return data.list || [];
        } catch (error) {
            console.error('Get card photos error:', error);
            return [];
        }
    }

    // Get all user photos
    async getAllUserPhotos() {
        if (!this.currentUser) return [];

        try {
            const url = `${this.getTableUrl(this.tables.cardPhotos)}?where=(user_id,eq,${this.currentUser.id})&limit=500`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return data.list || [];
        } catch (error) {
            console.error('Get all photos error:', error);
            return [];
        }
    }

    // Delete a photo
    async deleteCardPhoto(photoId) {
        return this.deleteRecord(this.tables.cardPhotos, photoId);
    }

    // ==========================================
    // GENERIC CRUD OPERATIONS
    // ==========================================

    async createRecord(tableName, data) {
        const response = await fetch(this.getTableUrl(tableName), {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || 'Failed to create record');
        }

        return response.json();
    }

    async updateRecord(tableName, recordId, data) {
        const response = await fetch(this.getTableUrl(tableName), {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({
                Id: recordId,
                ...data
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || 'Failed to update record');
        }

        return response.json();
    }

    async deleteRecord(tableName, recordId) {
        const response = await fetch(this.getTableUrl(tableName), {
            method: 'DELETE',
            headers: this.getHeaders(),
            body: JSON.stringify({ Id: recordId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || 'Failed to delete record');
        }

        return true;
    }

    // ==========================================
    // FULL SYNC
    // ==========================================

    async fullSyncToCloud(collection, wishlist, tradeBinder, decks) {
        const results = {
            collection: null,
            wishlist: null,
            tradeBinder: null,
            decks: null,
            errors: []
        };

        try {
            results.collection = await this.syncCollectionToCloud(collection);
        } catch (e) {
            results.errors.push({ type: 'collection', error: e.message });
        }

        try {
            results.wishlist = await this.syncWishlistToCloud(wishlist);
        } catch (e) {
            results.errors.push({ type: 'wishlist', error: e.message });
        }

        try {
            results.tradeBinder = await this.syncTradeBinderToCloud(tradeBinder);
        } catch (e) {
            results.errors.push({ type: 'tradeBinder', error: e.message });
        }

        try {
            results.decks = await this.syncDecksToCloud(decks);
        } catch (e) {
            results.errors.push({ type: 'decks', error: e.message });
        }

        return results;
    }

    async fullDownloadFromCloud() {
        return {
            collection: await this.downloadCollectionFromCloud(),
            wishlist: await this.downloadWishlistFromCloud(),
            tradeBinder: await this.downloadTradeBinderFromCloud(),
            decks: await this.downloadDecksFromCloud()
        };
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Global instance
const nocoDBService = new NocoDBService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NocoDBService, nocoDBService };
}
