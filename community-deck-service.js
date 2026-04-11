// ============================================
// COMMUNITY DECK SERVICE
// Manages shared decks in the community
// ============================================
// ⚠️ SEGURANÇA: Veja security-config.js para recomendações
// ============================================

class CommunityDeckService {
    constructor() {
        // Usar configuração centralizada se disponível
        const config = typeof SecurityConfig !== 'undefined' ? SecurityConfig.api : null;
        this.baseUrl = config?.baseUrl || 'https://dados.kodda.ai';
        this.apiToken = config?.token || 'GcWFEnNtNLcuubiYMDGlACXr_Sls7c15SEYKe72-';
        this.baseId = config?.baseId || 'pybbgkutded1ay0';
        this.tableName = 'community_decks';
        this.cachedDecks = [];
        this.lastFetch = null;
        this.cacheTime = 5 * 60 * 1000; // 5 minutes cache
    }

    getHeaders() {
        return {
            'xc-token': this.apiToken,
            'Content-Type': 'application/json'
        };
    }

    getTableUrl() {
        return `${this.baseUrl}/api/v1/db/data/noco/${this.baseId}/${this.tableName}`;
    }

    // Save a deck to the community
    async saveDeck(deck) {
        try {
            const response = await fetch(this.getTableUrl(), {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    name: deck.name,
                    author: deck.author,
                    author_id: deck.authorId,
                    format: deck.format,
                    tier: deck.tier,
                    description: deck.description,
                    strategy: deck.strategy,
                    matchups: deck.matchups,
                    elements: JSON.stringify(deck.elements),
                    key_cards: JSON.stringify(deck.keyCards),
                    avatar: deck.avatar,
                    decklist: JSON.stringify(deck.decklist),
                    views: 0,
                    likes: 0,
                    created_at: new Date().toISOString(),
                    source: 'user-submitted'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error saving deck:', errorText);
                throw new Error('Failed to save deck');
            }

            const savedDeck = await response.json();

            // Clear cache to force refresh
            this.lastFetch = null;

            return savedDeck;
        } catch (error) {
            console.error('Error in saveDeck:', error);
            throw error;
        }
    }

    // Get all community decks
    async getDecks(forceRefresh = false) {
        // Return cached if available and not expired
        if (!forceRefresh && this.cachedDecks.length > 0 && this.lastFetch) {
            const elapsed = Date.now() - this.lastFetch;
            if (elapsed < this.cacheTime) {
                return this.cachedDecks;
            }
        }

        try {
            const response = await fetch(`${this.getTableUrl()}?limit=200&sort=-created_at`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                console.error('Error fetching community decks');
                return this.cachedDecks; // Return cached on error
            }

            const data = await response.json();
            const rawDecks = data.list || data || [];

            // Transform to match expected deck format
            this.cachedDecks = rawDecks.map(deck => this.transformDeck(deck));
            this.lastFetch = Date.now();

            return this.cachedDecks;
        } catch (error) {
            console.error('Error fetching community decks:', error);
            return this.cachedDecks;
        }
    }

    // Transform NocoDB record to deck object
    transformDeck(record) {
        let elements = [];
        let keyCards = [];
        let decklist = null;

        try {
            elements = record.elements ? JSON.parse(record.elements) : [];
        } catch (e) {
            elements = [];
        }

        try {
            keyCards = record.key_cards ? JSON.parse(record.key_cards) : [];
        } catch (e) {
            keyCards = [];
        }

        try {
            decklist = record.decklist ? JSON.parse(record.decklist) : null;
        } catch (e) {
            decklist = null;
        }

        return {
            id: `community-${record.Id || record.id}`,
            name: record.name,
            author: record.author,
            authorId: record.author_id,
            format: record.format || 'Constructed',
            tier: record.tier,
            description: record.description,
            strategy: record.strategy,
            matchups: record.matchups,
            elements,
            keyCards,
            avatar: record.avatar,
            decklist,
            views: record.views || 0,
            likes: record.likes || 0,
            createdAt: record.created_at,
            source: 'user-submitted',
            isCommunityDeck: true
        };
    }

    // Increment view count
    async incrementViews(deckId) {
        const numericId = deckId.replace('community-', '');
        try {
            // First get current views
            const response = await fetch(`${this.getTableUrl()}/${numericId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (response.ok) {
                const deck = await response.json();
                const newViews = (deck.views || 0) + 1;

                // Update views
                await fetch(`${this.getTableUrl()}/${numericId}`, {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ views: newViews })
                });
            }
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }

    // Like a deck
    async likeDeck(deckId) {
        const numericId = deckId.replace('community-', '');
        try {
            const response = await fetch(`${this.getTableUrl()}/${numericId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (response.ok) {
                const deck = await response.json();
                const newLikes = (deck.likes || 0) + 1;

                await fetch(`${this.getTableUrl()}/${numericId}`, {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ likes: newLikes })
                });

                return newLikes;
            }
        } catch (error) {
            console.error('Error liking deck:', error);
        }
        return null;
    }

    // Delete a community deck (only by author)
    async deleteDeck(deckId, authorId) {
        const numericId = deckId.replace('community-', '');
        try {
            // Verify ownership
            const response = await fetch(`${this.getTableUrl()}/${numericId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (response.ok) {
                const deck = await response.json();
                if (deck.author_id !== authorId) {
                    throw new Error('Not authorized to delete this deck');
                }

                // Delete
                await fetch(`${this.getTableUrl()}/${numericId}`, {
                    method: 'DELETE',
                    headers: this.getHeaders()
                });

                // Clear cache
                this.lastFetch = null;
                return true;
            }
        } catch (error) {
            console.error('Error deleting community deck:', error);
            throw error;
        }
        return false;
    }
}

// Create global instance
const communityDeckService = new CommunityDeckService();
