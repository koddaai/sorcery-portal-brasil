/**
 * TCGCSV Price Service
 * Serviço de preços automático usando dados do TCGCSV.com
 *
 * Fluxo:
 * 1. GitHub Actions baixa dados do TCGCSV diariamente às 21:00 UTC
 * 2. Dados são salvos em /data/tcgcsv/prices.json
 * 3. Este serviço carrega do arquivo local (sem problemas de CORS)
 *
 * Fonte original: https://tcgcsv.com (dados do TCGPlayer)
 */

class TCGCSVPriceService {
    constructor() {
        // URL do arquivo local (atualizado via GitHub Actions)
        this.localDataUrl = 'data/tcgcsv/prices.json';

        // Fallback: URL direta do TCGCSV (só funciona em Node.js, não no browser)
        this.categoryId = 77;
        this.baseUrl = 'https://tcgcsv.com/tcgplayer';

        // Sets do Sorcery com groupIds
        this.sets = {
            'Alpha': 23335,
            'Beta': 23336,
            'Dust Reward Promos': 23514,
            'Arthurian Legends': 23588,
            'Arthurian Legends Promo': 23778,
            'Dragonlord': 24378,
            'Gothic': 24471
        };

        // Cache
        this.products = new Map();
        this.prices = new Map();
        this.cardPrices = new Map(); // cardName -> { setName, finish, price }[]

        // Metadata
        this.lastUpdate = null;
        this.dataVersion = null;
        this.isLoading = false;
        this.loadError = null;

        // Storage key
        this.storageKey = 'sorcery-tcgcsv-prices-v2';
        this.metaKey = 'sorcery-tcgcsv-meta-v2';

        // Cache expiry: 6 hours
        this.cacheExpiry = 6 * 60 * 60 * 1000;

        // Load from cache on init
        this.loadFromCache();
    }

    /**
     * Load cached data from localStorage
     */
    loadFromCache() {
        try {
            const meta = localStorage.getItem(this.metaKey);
            if (meta) {
                const metaData = JSON.parse(meta);
                this.lastUpdate = new Date(metaData.lastUpdate);
                this.dataVersion = metaData.dataVersion;
            }

            const cached = localStorage.getItem(this.storageKey);
            if (cached) {
                const data = JSON.parse(cached);

                if (data.cardPrices) {
                    this.cardPrices = new Map(Object.entries(data.cardPrices));
                }

                console.log(`[TCGCSV] Loaded ${this.cardPrices.size} cards from cache`);
                console.log(`[TCGCSV] Data version: ${this.dataVersion || 'unknown'}`);
            }
        } catch (error) {
            console.error('[TCGCSV] Error loading cache:', error);
        }
    }

    /**
     * Save data to localStorage cache
     */
    saveToCache() {
        try {
            const cardPricesObj = Object.fromEntries(this.cardPrices);

            const data = {
                cardPrices: cardPricesObj,
                savedAt: Date.now()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));
            localStorage.setItem(this.metaKey, JSON.stringify({
                lastUpdate: this.lastUpdate?.toISOString(),
                dataVersion: this.dataVersion,
                cardCount: this.cardPrices.size
            }));

            console.log(`[TCGCSV] Saved ${this.cardPrices.size} cards to cache`);
        } catch (error) {
            console.error('[TCGCSV] Error saving cache:', error);
        }
    }

    /**
     * Check if cache needs refresh
     */
    needsRefresh() {
        if (!this.lastUpdate) return true;
        const age = Date.now() - this.lastUpdate.getTime();
        return age > this.cacheExpiry;
    }

    /**
     * Load prices from local JSON file (populated by GitHub Actions)
     */
    async loadFromLocalFile() {
        try {
            console.log('[TCGCSV] Loading from local file...');

            const response = await fetch(this.localDataUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.cards || typeof data.cards !== 'object') {
                throw new Error('Invalid data format');
            }

            // Clear existing data
            this.cardPrices.clear();

            // Process cards
            for (const [cardName, prices] of Object.entries(data.cards)) {
                const priceArray = prices.map(p => ({
                    productId: p.productId,
                    setName: p.set,
                    finish: p.finish === 'Normal' ? 'Normal' : p.finish,
                    lowPrice: p.low,
                    midPrice: p.mid,
                    highPrice: p.high,
                    marketPrice: p.market
                }));

                this.cardPrices.set(cardName, priceArray);
            }

            this.lastUpdate = new Date(data.lastUpdate);
            this.dataVersion = data.lastUpdate;

            console.log(`[TCGCSV] Loaded ${this.cardPrices.size} cards from local file`);
            console.log(`[TCGCSV] Data from: ${this.lastUpdate.toLocaleString()}`);

            this.saveToCache();

            // Dispatch event for UI update
            window.dispatchEvent(new CustomEvent('tcgcsv-prices-updated', {
                detail: {
                    cardCount: this.cardPrices.size,
                    lastUpdate: this.lastUpdate,
                    source: 'local'
                }
            }));

            return true;

        } catch (error) {
            console.warn('[TCGCSV] Local file not available:', error.message);
            return false;
        }
    }

    /**
     * Fetch products for a set (fallback - won't work in browser due to CORS)
     */
    async fetchProducts(groupId) {
        const url = `${this.baseUrl}/${this.categoryId}/${groupId}/products`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    }

    /**
     * Fetch prices for a set (fallback - won't work in browser due to CORS)
     */
    async fetchPrices(groupId) {
        const url = `${this.baseUrl}/${this.categoryId}/${groupId}/prices`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch prices: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    }

    /**
     * Fetch all data for a set and merge products + prices
     */
    async fetchSetData(setName, groupId) {
        console.log(`[TCGCSV] Fetching ${setName}...`);

        const [products, prices] = await Promise.all([
            this.fetchProducts(groupId),
            this.fetchPrices(groupId)
        ]);

        const priceMap = new Map();
        prices.forEach(p => priceMap.set(p.productId, p));

        const merged = [];
        products.forEach(product => {
            const price = priceMap.get(product.productId);
            if (price) {
                merged.push({
                    productId: product.productId,
                    name: product.cleanName || product.name,
                    setName: setName,
                    finish: price.subTypeName || 'Normal',
                    lowPrice: price.lowPrice,
                    midPrice: price.midPrice,
                    highPrice: price.highPrice,
                    marketPrice: price.marketPrice
                });
            }
        });

        console.log(`[TCGCSV] ${setName}: ${merged.length} products with prices`);
        return merged;
    }

    /**
     * Fetch all prices - tries local file first, then TCGCSV API
     */
    async fetchAllPrices(forceRefresh = false) {
        if (this.isLoading) {
            console.log('[TCGCSV] Already loading...');
            return false;
        }

        if (!forceRefresh && !this.needsRefresh() && this.cardPrices.size > 0) {
            console.log('[TCGCSV] Using cached data');
            return true;
        }

        this.isLoading = true;
        this.loadError = null;

        try {
            // 1. Try local file first (populated by GitHub Actions)
            const localSuccess = await this.loadFromLocalFile();
            if (localSuccess) {
                this.isLoading = false;
                return true;
            }

            // 2. Fallback to direct TCGCSV fetch (will fail in browser due to CORS)
            console.log('[TCGCSV] Trying direct fetch from TCGCSV...');

            this.cardPrices.clear();

            const setEntries = Object.entries(this.sets);
            const results = await Promise.all(
                setEntries.map(([setName, groupId]) =>
                    this.fetchSetData(setName, groupId).catch(err => {
                        console.error(`[TCGCSV] Error fetching ${setName}:`, err.message);
                        return [];
                    })
                )
            );

            let totalCards = 0;
            results.forEach(products => {
                products.forEach(product => {
                    const baseName = product.name
                        .replace(/\s*\(Foil\)\s*$/i, '')
                        .replace(/\s*Foil\s*$/i, '')
                        .trim();

                    if (!this.cardPrices.has(baseName)) {
                        this.cardPrices.set(baseName, []);
                    }

                    this.cardPrices.get(baseName).push({
                        productId: product.productId,
                        setName: product.setName,
                        finish: product.finish,
                        lowPrice: product.lowPrice,
                        midPrice: product.midPrice,
                        highPrice: product.highPrice,
                        marketPrice: product.marketPrice
                    });

                    totalCards++;
                });
            });

            if (this.cardPrices.size > 0) {
                this.lastUpdate = new Date();
                this.dataVersion = this.lastUpdate.toISOString();
                this.saveToCache();

                console.log(`[TCGCSV] Loaded ${totalCards} products for ${this.cardPrices.size} unique cards`);

                window.dispatchEvent(new CustomEvent('tcgcsv-prices-updated', {
                    detail: { cardCount: this.cardPrices.size, lastUpdate: this.lastUpdate, source: 'api' }
                }));

                return true;
            }

            throw new Error('No data loaded');

        } catch (error) {
            console.error('[TCGCSV] Error fetching prices:', error);
            this.loadError = error.message;
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Normalize card name for matching (remove special chars, accents, etc)
     */
    normalizeCardName(name) {
        return name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[''`]/g, '')           // Remove apostrophes
            .replace(/[–—]/g, '-')           // Normalize dashes
            .replace(/[!?]/g, '')            // Remove punctuation
            .toLowerCase()
            .trim();
    }

    /**
     * Find card prices with fuzzy matching
     */
    findCardPrices(cardName) {
        // Try exact match first
        let prices = this.cardPrices.get(cardName);
        if (prices && prices.length > 0) return prices;

        // Try normalized match
        const normalized = this.normalizeCardName(cardName);

        for (const [name, priceData] of this.cardPrices) {
            if (this.normalizeCardName(name) === normalized) {
                return priceData;
            }
        }

        // Try partial match for numbered cards (Foot Soldier 1 -> Foot Soldier)
        const baseName = cardName.replace(/\s+\d+$/, '').trim();
        if (baseName !== cardName) {
            for (const [name, priceData] of this.cardPrices) {
                if (this.normalizeCardName(name) === this.normalizeCardName(baseName)) {
                    return priceData;
                }
            }
        }

        return null;
    }

    /**
     * Get price for a card
     */
    getPrice(cardName, setName = null, finish = 'Normal') {
        const prices = this.findCardPrices(cardName);
        if (!prices || prices.length === 0) return null;

        let filtered = prices.filter(p => {
            const finishMatch = p.finish.toLowerCase() === finish.toLowerCase();
            const setMatch = !setName || p.setName === setName;
            return finishMatch && setMatch;
        });

        if (filtered.length === 0) {
            filtered = prices.filter(p => !setName || p.setName === setName);
        }

        if (filtered.length === 0) return null;

        return filtered[0].marketPrice;
    }

    /**
     * Get all prices for a card
     */
    getAllPrices(cardName) {
        return this.findCardPrices(cardName) || [];
    }

    /**
     * Get price data for a specific variant
     */
    getPriceData(cardName, setName, finish = 'Normal') {
        const prices = this.findCardPrices(cardName);
        if (!prices) return null;

        return prices.find(p =>
            p.setName === setName &&
            p.finish.toLowerCase() === finish.toLowerCase()
        ) || null;
    }

    /**
     * Get best price (lowest market price across all variants)
     */
    getBestPrice(cardName, finish = 'Normal') {
        const prices = this.findCardPrices(cardName);
        if (!prices) return null;

        const filtered = prices.filter(p =>
            p.finish.toLowerCase() === finish.toLowerCase() &&
            p.marketPrice !== null
        );

        if (filtered.length === 0) return null;

        return filtered.reduce((min, p) =>
            p.marketPrice < min.marketPrice ? p : min
        );
    }

    /**
     * Format price for display
     */
    formatPrice(price, currency = 'USD') {
        if (price === null || price === undefined) return 'N/A';

        if (currency === 'BRL') {
            const rate = typeof tcgPriceService !== 'undefined'
                ? tcgPriceService.brlRate
                : 5.80;
            return 'R$ ' + (price * rate).toFixed(2).replace('.', ',');
        }

        return 'US$ ' + price.toFixed(2);
    }

    /**
     * Get status information
     */
    getStatus() {
        return {
            isLoading: this.isLoading,
            lastUpdate: this.lastUpdate,
            lastUpdateFormatted: this.lastUpdate
                ? this.lastUpdate.toLocaleString('pt-BR')
                : 'Nunca',
            dataVersion: this.dataVersion,
            cardCount: this.cardPrices.size,
            cacheExpired: this.needsRefresh(),
            error: this.loadError,
            source: 'TCGCSV.com (via GitHub Actions)'
        };
    }

    /**
     * Search cards by name
     */
    searchCards(query, limit = 20) {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        const results = [];

        for (const [cardName, prices] of this.cardPrices) {
            if (cardName.toLowerCase().includes(lowerQuery)) {
                const normalPrice = prices.find(p => p.finish === 'Normal');
                const foilPrice = prices.find(p => p.finish === 'Foil');

                results.push({
                    name: cardName,
                    normalPrice: normalPrice?.marketPrice,
                    foilPrice: foilPrice?.marketPrice,
                    sets: [...new Set(prices.map(p => p.setName))]
                });

                if (results.length >= limit) break;
            }
        }

        return results;
    }

    /**
     * Get most expensive cards
     */
    getTopCards(limit = 20, finish = 'Normal') {
        const cards = [];

        for (const [cardName, prices] of this.cardPrices) {
            const matchingPrices = prices.filter(p =>
                p.finish.toLowerCase() === finish.toLowerCase() &&
                p.marketPrice !== null
            );

            if (matchingPrices.length > 0) {
                const best = matchingPrices.reduce((max, p) =>
                    p.marketPrice > max.marketPrice ? p : max
                );

                cards.push({ name: cardName, ...best });
            }
        }

        cards.sort((a, b) => b.marketPrice - a.marketPrice);
        return cards.slice(0, limit);
    }

    /**
     * Calculate collection value
     */
    calculateCollectionValue(collection) {
        let total = 0;
        let priced = 0;
        let unpriced = 0;
        const breakdown = [];

        for (const [cardName, data] of Object.entries(collection)) {
            const qty = typeof data === 'object' ? data.qty : 1;
            const price = this.getPrice(cardName);

            if (price !== null) {
                const value = price * qty;
                total += value;
                priced++;
                breakdown.push({ name: cardName, qty, unitPrice: price, totalValue: value });
            } else {
                unpriced++;
            }
        }

        breakdown.sort((a, b) => b.totalValue - a.totalValue);

        return {
            totalValue: total,
            pricedCards: priced,
            unpricedCards: unpriced,
            topCards: breakdown.slice(0, 10),
            breakdown
        };
    }

    /**
     * Initialize service
     */
    async init() {
        console.log('[TCGCSV] Initializing price service...');

        if (!this.needsRefresh() && this.cardPrices.size > 0) {
            console.log('[TCGCSV] Using cached prices');
            return true;
        }

        return this.fetchAllPrices();
    }

    /**
     * Force refresh prices
     */
    async refresh() {
        return this.fetchAllPrices(true);
    }
}

// Create global instance
const tcgcsvPriceService = new TCGCSVPriceService();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TCGCSVPriceService, tcgcsvPriceService };
}

// Global for browser
if (typeof window !== 'undefined') {
    window.tcgcsvPriceService = tcgcsvPriceService;

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            tcgcsvPriceService.init();
        });
    } else {
        setTimeout(() => tcgcsvPriceService.init(), 100);
    }
}

console.log('[TCGCSV] Price service loaded');
