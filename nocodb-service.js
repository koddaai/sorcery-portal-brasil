// ============================================
// SORCERY NOCODB SERVICE
// Cloud sync and user management via NocoDB
// ============================================
//
// ⚠️ SEGURANÇA: Este serviço usa tokens expostos no cliente.
// Em produção, implemente um proxy backend.
// Veja security-config.js para recomendações.
// ============================================

class NocoDBService {
    constructor() {
        // Usar configuração centralizada se disponível
        const config = typeof SecurityConfig !== 'undefined' ? SecurityConfig.api : null;

        // Detectar modo de operação (proxy vs direct)
        this.isProxyMode = config?.isUsingProxy || false;
        this.baseUrl = config?.baseUrl || 'https://dados.kodda.ai';
        this.apiToken = config?.token || null;
        this.baseId = config?.baseId || 'pybbgkutded1ay0';

        // Log do modo de operação
        console.log('[NocoDB] Mode:', this.isProxyMode ? 'PROXY' : 'DIRECT');
        console.log('[NocoDB] Base URL:', this.baseUrl);

        // Table names as they appear in NocoDB
        this.tables = {
            users: 'users',
            collection: 'collection',
            wishlist: 'wishlist',
            tradeBinder: 'trade_binder',
            decks: 'decks',
            cardPhotos: 'card_photos',
            profiles: 'profiles',
            // Community tables
            forumPosts: 'forum_posts',
            forumComments: 'forum_comments',
            messages: 'messages',
            reputation: 'reputation',
            tradeListings: 'trade_listings'
        };

        this.currentUser = null;
        this.loadSession();
    }

    // Get headers for API requests
    // Em modo proxy, não enviamos o token (o proxy adiciona)
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Adicionar token apenas em modo direto
        if (!this.isProxyMode && this.apiToken) {
            headers['xc-token'] = this.apiToken;
        }

        // Adicionar headers de segurança (CSRF)
        if (typeof addSecurityHeaders === 'function') {
            return addSecurityHeaders(headers);
        }

        // Headers básicos para identificação
        headers['X-Requested-With'] = 'SorceryPortal';

        return headers;
    }

    // Build API URL for table operations (NocoDB v1 API)
    getTableUrl(tableName) {
        return `${this.baseUrl}/api/v1/db/data/noco/${this.baseId}/${tableName}`;
    }

    // Load session from localStorage
    loadSession() {
        // Use secure session loading if available
        if (typeof loadSecureSession === 'function') {
            const session = loadSecureSession();
            if (session) {
                // Normalize user ID (ensure lowercase 'id' is available)
                if (session.Id && !session.id) {
                    session.id = session.Id;
                }
                this.currentUser = session;
            }
            return;
        }

        // Fallback to direct localStorage
        const sessionStr = localStorage.getItem('sorcery-session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                // Normalize user ID (ensure lowercase 'id' is available)
                if (session.Id && !session.id) {
                    session.id = session.Id;
                }
                this.currentUser = session;
            } catch (e) {
                console.warn('[Session] Failed to parse session:', e.message);
                this.currentUser = null;
            }
        }
    }

    // Save session to localStorage (usando função segura se disponível)
    saveSession() {
        if (this.currentUser) {
            if (typeof saveSecureSession === 'function') {
                saveSecureSession(this.currentUser);
            } else {
                localStorage.setItem('sorcery-session', JSON.stringify(this.currentUser));
            }
        } else {
            if (typeof clearSecureSession === 'function') {
                clearSecureSession();
            } else {
                localStorage.removeItem('sorcery-session');
            }
        }
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    // Register a new user
    async register(email, password, displayName) {
        try {
            // Validar entrada
            if (typeof validateInput === 'function') {
                const emailValidation = validateInput(email, { type: 'email', required: true });
                if (!emailValidation.valid) {
                    throw new Error(emailValidation.error);
                }
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.valid) {
                    throw new Error(passwordValidation.errors.join(', '));
                }
            }

            // Check if user exists
            const existing = await this.findUserByEmail(email);
            if (existing) {
                throw new Error('Email already registered');
            }

            // Gerar salt único e hash seguro
            let passwordHash, salt;
            if (typeof hashPasswordSecure === 'function' && typeof generateSalt === 'function') {
                salt = generateSalt();
                passwordHash = await hashPasswordSecure(password, salt);
            } else {
                // Fallback para hash simples (não recomendado)
                passwordHash = await this.hashPassword(password);
                salt = 'legacy';
            }

            // Create user
            const response = await fetch(this.getTableUrl(this.tables.users), {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    email: email,
                    password_hash: passwordHash,
                    password_salt: salt,
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
                displayName: user.display_name,
                termsAccepted: false
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
            // Verificar rate limiting
            if (typeof rateLimiter !== 'undefined') {
                const loginCheck = rateLimiter.checkLoginAttempt(email);
                if (!loginCheck.allowed) {
                    throw new Error(`Muitas tentativas. Aguarde ${loginCheck.waitTime} segundos.`);
                }
            }

            const user = await this.findUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            // Verificar senha usando método seguro se disponível
            let passwordValid = false;
            if (typeof verifyPassword === 'function' && user.password_salt && user.password_salt !== 'legacy') {
                passwordValid = await verifyPassword(password, user.password_salt, user.password_hash);
            } else {
                // Fallback para hash simples (usuários antigos)
                const passwordHash = await this.hashPassword(password);
                passwordValid = user.password_hash === passwordHash;
            }

            if (!passwordValid) {
                throw new Error('Invalid password');
            }

            // Resetar tentativas de login após sucesso
            if (typeof rateLimiter !== 'undefined') {
                rateLimiter.resetLoginAttempts(email);
            }

            this.currentUser = {
                id: user.Id,
                email: user.email,
                displayName: user.display_name,
                avatarId: user.avatar_id || 1,
                termsAccepted: user.terms_accepted || false
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

    // Accept terms of service
    async acceptTerms() {
        if (!this.currentUser) {
            throw new Error('Must be logged in to accept terms');
        }

        try {
            await this.updateRecord(this.tables.users, this.currentUser.id, {
                terms_accepted: true,
                terms_accepted_at: new Date().toISOString()
            });

            // Update local session
            this.currentUser.termsAccepted = true;
            this.saveSession();

            return { success: true };
        } catch (error) {
            console.error('Accept terms error:', error);
            throw error;
        }
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

    // Check if user exists by email
    async checkUserExists(email) {
        const user = await this.findUserByEmail(email);
        return user !== null;
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
        // NocoDB v1 API: single record update requires ID in URL path
        const response = await fetch(`${this.getTableUrl(tableName)}/${recordId}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || 'Failed to update record');
        }

        return response.json();
    }

    async deleteRecord(tableName, recordId) {
        // NocoDB v1 API: single record delete requires ID in URL path
        const response = await fetch(`${this.getTableUrl(tableName)}/${recordId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
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

    // ==========================================
    // COMMUNITY: TRADE LISTINGS
    // ==========================================

    // Get all active trade listings (public, no auth required)
    async getTradeListings(filters = {}) {
        try {
            let whereClause = '(is_active,eq,true)';
            if (filters.type) {
                whereClause += `~and(listing_type,eq,${filters.type})`;
            }
            if (filters.cardName) {
                whereClause += `~and(card_name,like,${encodeURIComponent(filters.cardName)})`;
            }

            const url = `${this.getTableUrl(this.tables.tradeListings)}?where=${whereClause}&sort=-created_at&limit=100`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();
            return data.list || [];
        } catch (error) {
            console.error('Get trade listings error:', error);
            return [];
        }
    }

    // Create a trade listing
    async createTradeListing(listing) {
        if (!this.currentUser) throw new Error('Must be logged in');

        return this.createRecord(this.tables.tradeListings, {
            user_id: this.currentUser.id,
            listing_type: listing.type, // 'offering' or 'looking_for'
            card_name: listing.cardName,
            card_set: listing.cardSet || '',
            card_condition: listing.condition || 'NM',
            notes: listing.notes || '',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    // Deactivate a trade listing
    async deactivateTradeListing(listingId) {
        if (!this.currentUser) throw new Error('Must be logged in');
        return this.updateRecord(this.tables.tradeListings, listingId, {
            is_active: false,
            updated_at: new Date().toISOString()
        });
    }

    // Get user's own listings
    async getUserTradeListings(userId) {
        try {
            const url = `${this.getTableUrl(this.tables.tradeListings)}?where=(user_id,eq,${userId})&sort=-created_at&limit=100`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();
            return data.list || [];
        } catch (error) {
            console.error('Get user trade listings error:', error);
            return [];
        }
    }

    // ==========================================
    // COMMUNITY: FORUM
    // ==========================================

    // Get forum posts (public)
    async getForumPosts(filters = {}) {
        try {
            let whereClause = '';
            if (filters.category) {
                whereClause = `where=(category,eq,${filters.category})&`;
            }

            const sortField = filters.sort === 'popular' ? '-view_count' : '-created_at';
            const url = `${this.getTableUrl(this.tables.forumPosts)}?${whereClause}sort=${sortField}&limit=${filters.limit || 20}&offset=${filters.offset || 0}`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();
            return data.list || [];
        } catch (error) {
            console.error('Get forum posts error:', error);
            return [];
        }
    }

    // Get single post with comments
    async getForumPost(postId) {
        try {
            const url = `${this.getTableUrl(this.tables.forumPosts)}/${postId}`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Get forum post error:', error);
            return null;
        }
    }

    // Get comments for a post
    async getForumComments(postId) {
        try {
            const url = `${this.getTableUrl(this.tables.forumComments)}?where=(post_id,eq,${postId})~and(is_deleted,eq,false)&sort=created_at&limit=100`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();
            return data.list || [];
        } catch (error) {
            console.error('Get forum comments error:', error);
            return [];
        }
    }

    // Create a forum post
    async createForumPost(post) {
        if (!this.currentUser) throw new Error('Must be logged in');

        return this.createRecord(this.tables.forumPosts, {
            user_id: this.currentUser.id,
            category: post.category,
            title: post.title.substring(0, 100),
            content: post.content.substring(0, 5000),
            is_pinned: false,
            is_locked: false,
            view_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    // Create a comment
    async createForumComment(postId, content) {
        if (!this.currentUser) throw new Error('Must be logged in');

        return this.createRecord(this.tables.forumComments, {
            post_id: postId,
            user_id: this.currentUser.id,
            content: content.substring(0, 2000),
            is_deleted: false,
            created_at: new Date().toISOString()
        });
    }

    // Increment post view count
    async incrementPostViews(postId, currentCount) {
        try {
            await this.updateRecord(this.tables.forumPosts, postId, {
                view_count: (currentCount || 0) + 1
            });
        } catch (error) {
            // Silently fail - not critical
        }
    }

    // ==========================================
    // COMMUNITY: MESSAGING
    // ==========================================

    // Get inbox (received messages)
    async getInbox() {
        if (!this.currentUser) return [];

        try {
            const url = `${this.getTableUrl(this.tables.messages)}?where=(recipient_id,eq,${this.currentUser.id})~and(is_deleted_recipient,eq,false)&sort=-created_at&limit=50`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();
            return data.list || [];
        } catch (error) {
            console.error('Get inbox error:', error);
            return [];
        }
    }

    // Get sent messages
    async getSentMessages() {
        if (!this.currentUser) return [];

        try {
            const url = `${this.getTableUrl(this.tables.messages)}?where=(sender_id,eq,${this.currentUser.id})~and(is_deleted_sender,eq,false)&sort=-created_at&limit=50`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();
            return data.list || [];
        } catch (error) {
            console.error('Get sent messages error:', error);
            return [];
        }
    }

    // Get unread count
    async getUnreadCount() {
        if (!this.currentUser) return 0;

        try {
            const url = `${this.getTableUrl(this.tables.messages)}?where=(recipient_id,eq,${this.currentUser.id})~and(is_read,eq,false)~and(is_deleted_recipient,eq,false)&fields=Id`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();
            return (data.list || []).length;
        } catch (error) {
            return 0;
        }
    }

    // Send a message
    async sendMessage(recipientId, subject, content, replyToId = null) {
        if (!this.currentUser) throw new Error('Must be logged in');
        if (recipientId === this.currentUser.id) throw new Error('Cannot message yourself');

        return this.createRecord(this.tables.messages, {
            sender_id: this.currentUser.id,
            recipient_id: recipientId,
            subject: subject.substring(0, 100),
            content: content.substring(0, 2000),
            is_read: false,
            is_deleted_sender: false,
            is_deleted_recipient: false,
            reply_to_id: replyToId,
            created_at: new Date().toISOString()
        });
    }

    // Mark message as read
    async markMessageRead(messageId) {
        if (!this.currentUser) return;
        await this.updateRecord(this.tables.messages, messageId, { is_read: true });
    }

    // Delete message (soft delete)
    async deleteMessage(messageId, isSender) {
        if (!this.currentUser) return;
        const field = isSender ? 'is_deleted_sender' : 'is_deleted_recipient';
        await this.updateRecord(this.tables.messages, messageId, { [field]: true });
    }

    // ==========================================
    // COMMUNITY: REPUTATION
    // ==========================================

    // Get user reputation score
    async getUserReputation(userId) {
        try {
            const url = `${this.getTableUrl(this.tables.reputation)}?where=(recipient_id,eq,${userId})`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            const votes = data.list || [];
            const positives = votes.filter(v => v.vote_type === 'positive').length;
            const negatives = votes.filter(v => v.vote_type === 'negative').length;

            return {
                score: positives - negatives,
                positives,
                negatives,
                total: votes.length
            };
        } catch (error) {
            return { score: 0, positives: 0, negatives: 0, total: 0 };
        }
    }

    // Check if user can vote for another user (15 day rule)
    async canVoteFor(recipientId) {
        if (!this.currentUser) return { canVote: false, reason: 'not_logged_in' };
        if (this.currentUser.id === recipientId) return { canVote: false, reason: 'self_vote' };

        try {
            const url = `${this.getTableUrl(this.tables.reputation)}?where=(voter_id,eq,${this.currentUser.id})~and(recipient_id,eq,${recipientId})&sort=-created_at&limit=1`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            if (!data.list || data.list.length === 0) {
                return { canVote: true };
            }

            const lastVote = data.list[0];
            const lastVoteDate = new Date(lastVote.created_at);
            const now = new Date();
            const daysSinceVote = (now - lastVoteDate) / (1000 * 60 * 60 * 24);

            if (daysSinceVote < 15) {
                const daysLeft = Math.ceil(15 - daysSinceVote);
                return { canVote: false, reason: 'cooldown', daysLeft };
            }

            return { canVote: true };
        } catch (error) {
            return { canVote: false, reason: 'error' };
        }
    }

    // Cast a vote
    async castVote(recipientId, voteType, reason = '', tradeReference = '') {
        if (!this.currentUser) throw new Error('Must be logged in');

        const canVoteResult = await this.canVoteFor(recipientId);
        if (!canVoteResult.canVote) {
            throw new Error(canVoteResult.reason === 'cooldown'
                ? `Aguarde ${canVoteResult.daysLeft} dias para votar novamente neste usuário`
                : 'Não é possível votar'
            );
        }

        return this.createRecord(this.tables.reputation, {
            voter_id: this.currentUser.id,
            recipient_id: recipientId,
            vote_type: voteType, // 'positive' or 'negative'
            reason: reason.substring(0, 200),
            trade_reference: tradeReference.substring(0, 200),
            created_at: new Date().toISOString()
        });
    }

    // Get votes received by user (for their own viewing)
    async getReceivedVotes(userId) {
        try {
            const url = `${this.getTableUrl(this.tables.reputation)}?where=(recipient_id,eq,${userId})&sort=-created_at&limit=50`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();
            return data.list || [];
        } catch (error) {
            return [];
        }
    }

    // ==========================================
    // COMMUNITY: USER LOOKUP
    // ==========================================

    // Get user by ID (public info only)
    async getUserById(userId) {
        try {
            const url = `${this.getTableUrl(this.tables.users)}/${userId}`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            if (!response.ok) return null;

            const user = await response.json();
            // Return only public fields
            return {
                id: user.Id,
                displayName: user.display_name,
                avatarId: user.avatar_id || 1,
                createdAt: user.created_at
            };
        } catch (error) {
            return null;
        }
    }

    // Search users by display name
    async searchUsers(query) {
        try {
            const url = `${this.getTableUrl(this.tables.users)}?where=(display_name,like,%${encodeURIComponent(query)}%)&limit=10`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return (data.list || []).map(u => ({
                id: u.Id,
                displayName: u.display_name,
                avatarId: u.avatar_id || 1
            }));
        } catch (error) {
            return [];
        }
    }

    // ==========================================
    // PROFILE MANAGEMENT
    // ==========================================

    // Create a new profile
    async createProfile(profileData) {
        try {
            const response = await fetch(this.getTableUrl(this.tables.profiles), {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to create profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Create profile error:', error);
            throw error;
        }
    }

    // Update an existing profile
    async updateProfile(profileId, updateData) {
        try {
            const response = await fetch(`${this.getTableUrl(this.tables.profiles)}/${profileId}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to update profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    // Get profile by user ID
    async getProfileByUserId(userId) {
        try {
            const url = `${this.getTableUrl(this.tables.profiles)}?where=(user_id,eq,${userId})&limit=1`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return data.list && data.list.length > 0 ? data.list[0] : null;
        } catch (error) {
            console.error('Get profile by user ID error:', error);
            return null;
        }
    }

    // Get profile by share token
    async getProfileByToken(token) {
        try {
            const url = `${this.getTableUrl(this.tables.profiles)}?where=(share_token,eq,${token})&limit=1`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return data.list && data.list.length > 0 ? data.list[0] : null;
        } catch (error) {
            console.error('Get profile by token error:', error);
            return null;
        }
    }

    // Get profile by slug
    async getProfileBySlug(slug) {
        try {
            const url = `${this.getTableUrl(this.tables.profiles)}?where=(profile_slug,eq,${slug})&limit=1`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return data.list && data.list.length > 0 ? data.list[0] : null;
        } catch (error) {
            console.error('Get profile by slug error:', error);
            return null;
        }
    }

    // Get public collection for a user (for public profiles)
    async getPublicCollection(userId) {
        try {
            const url = `${this.getTableUrl(this.tables.collection)}?where=(user_id,eq,${userId})&limit=1000`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return data.list || [];
        } catch (error) {
            console.error('Get public collection error:', error);
            return [];
        }
    }

    // Get public decks for a user
    async getPublicDecks(userId) {
        try {
            const url = `${this.getTableUrl(this.tables.decks)}?where=(user_id,eq,${userId})&limit=100`;
            const response = await fetch(url, { method: 'GET', headers: this.getHeaders() });
            const data = await response.json();

            return data.list || [];
        } catch (error) {
            console.error('Get public decks error:', error);
            return [];
        }
    }
}

// Global instance
const nocoDBService = new NocoDBService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NocoDBService, nocoDBService };
}
