/**
 * Variant Tracker - Multi-variant tracking system for Sorcery cards
 * Tracks individual card variants by slug with finish type, product, and quantity
 */

// Storage key for localStorage
const VARIANT_STORAGE_KEY = 'sorcery_variant_collection';

/**
 * Parse a card slug to extract set, card name, product type, and finish
 * Slug format: {set}-{card_name}-{product}-{finish}
 * Example: alp-card_name-b-s (Alpha, card_name, Booster, Standard)
 *
 * @param {string} slug - The variant slug to parse
 * @returns {Object} Parsed slug components
 */
function parseSlug(slug) {
    if (!slug || typeof slug !== 'string') {
        throw new Error('Invalid slug: slug must be a non-empty string');
    }

    const parts = slug.split('-');
    if (parts.length < 4) {
        throw new Error(`Invalid slug format: ${slug}. Expected format: {set}-{card_name}-{product}-{finish}`);
    }

    const set = parts[0];
    const finish = parts[parts.length - 1];
    const product = parts[parts.length - 2];
    const cardName = parts.slice(1, -2).join('-');

    // Map product codes to full names
    const productMap = {
        'b': 'Booster',
        'p': 'Precon',
        's': 'Starter',
        'pr': 'Promo',
        'box': 'Box Topper'
    };

    // Map finish codes to full names
    const finishMap = {
        's': 'Standard',
        'f': 'Foil',
        'r': 'Rainbow'
    };

    // Map set codes to full names
    const setMap = {
        'alp': 'Alpha',
        'bet': 'Beta',
        'aaw': 'Arthurian Legends',
        'art': 'Arthurian Legends',
        'gth': 'Gothic',
        'got': 'Gothic',
        'dra': 'Dragonlord',
        'drg': 'Dragonlord',
        'pro': 'Promotional',
        'prm': 'Promotional',
        'aah': 'Alpha Art Horizons',
        'bah': 'Beta Art Horizons'
    };

    return {
        set: set,
        setName: setMap[set.toLowerCase()] || set.toUpperCase(),
        cardName: cardName.replace(/_/g, ' '),
        cardSlug: cardName,
        product: product,
        productName: productMap[product.toLowerCase()] || product,
        finish: finish,
        finishName: finishMap[finish.toLowerCase()] || finish
    };
}

/**
 * Generate the image URL for a variant based on its slug
 *
 * @param {string} slug - The variant slug
 * @param {string} size - Image size (sm, md, lg)
 * @returns {string} The image URL
 */
function getVariantImage(slug, size = 'md') {
    if (!slug || typeof slug !== 'string') {
        throw new Error('Invalid slug for image generation');
    }

    const sizeMap = {
        'sm': 'small',
        'md': 'medium',
        'lg': 'large'
    };

    const imageSize = sizeMap[size] || 'medium';

    // Base URL for Sorcery card images
    const baseUrl = 'https://card.sorcery.link/cards';

    return `${baseUrl}/${imageSize}/${slug}.webp`;
}

/**
 * Get the badge color for a finish type
 *
 * @param {string} finish - The finish type (Standard, Foil, Rainbow)
 * @returns {Object} Color configuration for the badge
 */
function getFinishBadgeColor(finish) {
    const colors = {
        'Standard': {
            background: '#6b7280',
            text: '#ffffff',
            border: '#4b5563',
            gradient: null
        },
        'Foil': {
            background: '#fbbf24',
            text: '#1f2937',
            border: '#f59e0b',
            gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)'
        },
        'Rainbow': {
            background: '#8b5cf6',
            text: '#ffffff',
            border: '#7c3aed',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)'
        },
        's': {
            background: '#6b7280',
            text: '#ffffff',
            border: '#4b5563',
            gradient: null
        },
        'f': {
            background: '#fbbf24',
            text: '#1f2937',
            border: '#f59e0b',
            gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)'
        },
        'r': {
            background: '#8b5cf6',
            text: '#ffffff',
            border: '#7c3aed',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)'
        }
    };

    return colors[finish] || colors['Standard'];
}

/**
 * VariantTracker class - Main class for managing card variant collections
 */
class VariantTracker {
    constructor() {
        this.collection = {};
        this.loadFromStorage();
    }

    /**
     * Load collection from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
            if (stored) {
                this.collection = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading variant collection from storage:', error);
            this.collection = {};
        }
    }

    /**
     * Save collection to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(VARIANT_STORAGE_KEY, JSON.stringify(this.collection));
        } catch (error) {
            console.error('Error saving variant collection to storage:', error);
            throw new Error('Failed to save collection to storage');
        }
    }

    /**
     * Normalize card name for consistent storage keys
     *
     * @param {string} cardName - The card name to normalize
     * @returns {string} Normalized card name
     */
    normalizeCardName(cardName) {
        if (!cardName || typeof cardName !== 'string') {
            throw new Error('Invalid card name');
        }
        return cardName.toLowerCase().trim().replace(/\s+/g, '_');
    }

    /**
     * Add a variant to the collection
     *
     * @param {string} cardName - The name of the card
     * @param {string} slug - The variant slug
     * @param {string} finish - The finish type (Standard, Foil, Rainbow)
     * @param {number} qty - Quantity to add (default: 1)
     * @returns {Object} The updated variant entry
     */
    addToCollection(cardName, slug, finish, qty = 1) {
        if (!cardName || !slug) {
            throw new Error('Card name and slug are required');
        }

        if (typeof qty !== 'number' || qty < 1) {
            throw new Error('Quantity must be a positive number');
        }

        const normalizedName = this.normalizeCardName(cardName);
        const parsedSlug = parseSlug(slug);

        // Initialize card entry if it doesn't exist
        if (!this.collection[normalizedName]) {
            this.collection[normalizedName] = {};
        }

        // Check if variant already exists
        if (this.collection[normalizedName][slug]) {
            // Update existing variant
            this.collection[normalizedName][slug].qty += qty;
            this.collection[normalizedName][slug].updatedAt = new Date().toISOString();
        } else {
            // Create new variant entry
            this.collection[normalizedName][slug] = {
                finish: finish || parsedSlug.finishName,
                product: parsedSlug.productName,
                set: parsedSlug.setName,
                qty: qty,
                addedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }

        this.saveToStorage();
        return this.collection[normalizedName][slug];
    }

    /**
     * Remove a variant from the collection
     *
     * @param {string} cardName - The name of the card
     * @param {string} slug - The variant slug
     * @param {number} qty - Quantity to remove (default: 1, use -1 for all)
     * @returns {Object|null} The updated variant entry or null if removed completely
     */
    removeFromCollection(cardName, slug, qty = 1) {
        if (!cardName || !slug) {
            throw new Error('Card name and slug are required');
        }

        const normalizedName = this.normalizeCardName(cardName);

        // Check if card exists in collection
        if (!this.collection[normalizedName]) {
            throw new Error(`Card "${cardName}" not found in collection`);
        }

        // Check if variant exists
        if (!this.collection[normalizedName][slug]) {
            throw new Error(`Variant "${slug}" not found for card "${cardName}"`);
        }

        const variant = this.collection[normalizedName][slug];

        // Remove all if qty is -1, or remove specified quantity
        if (qty === -1 || variant.qty <= qty) {
            delete this.collection[normalizedName][slug];

            // Clean up card entry if no variants remain
            if (Object.keys(this.collection[normalizedName]).length === 0) {
                delete this.collection[normalizedName];
            }

            this.saveToStorage();
            return null;
        } else {
            variant.qty -= qty;
            variant.updatedAt = new Date().toISOString();
            this.saveToStorage();
            return variant;
        }
    }

    /**
     * Get all variants owned of a specific card
     *
     * @param {string} cardName - The name of the card
     * @returns {Object|null} All variants of the card or null if not found
     */
    getCollectionByCard(cardName) {
        if (!cardName) {
            throw new Error('Card name is required');
        }

        const normalizedName = this.normalizeCardName(cardName);
        const cardVariants = this.collection[normalizedName];

        if (!cardVariants) {
            return null;
        }

        // Return a deep copy to prevent external modifications
        const result = {
            cardName: cardName,
            normalizedName: normalizedName,
            variants: {},
            totalQuantity: 0,
            variantCount: 0
        };

        for (const [slug, variant] of Object.entries(cardVariants)) {
            result.variants[slug] = {
                ...variant,
                imageUrl: getVariantImage(slug),
                badgeColor: getFinishBadgeColor(variant.finish)
            };
            result.totalQuantity += variant.qty;
            result.variantCount++;
        }

        return result;
    }

    /**
     * Get all cards of a specific finish type
     *
     * @param {string} finish - The finish type (Standard, Foil, Rainbow)
     * @returns {Array} Array of cards with the specified finish
     */
    getCollectionByFinish(finish) {
        if (!finish) {
            throw new Error('Finish type is required');
        }

        const normalizedFinish = finish.toLowerCase();
        const finishNames = {
            'standard': 'Standard',
            's': 'Standard',
            'foil': 'Foil',
            'f': 'Foil',
            'rainbow': 'Rainbow',
            'r': 'Rainbow'
        };

        const targetFinish = finishNames[normalizedFinish];
        if (!targetFinish) {
            throw new Error(`Invalid finish type: ${finish}. Use Standard, Foil, or Rainbow`);
        }

        const results = [];

        for (const [cardName, variants] of Object.entries(this.collection)) {
            for (const [slug, variant] of Object.entries(variants)) {
                if (variant.finish === targetFinish) {
                    results.push({
                        cardName: cardName.replace(/_/g, ' '),
                        slug: slug,
                        ...variant,
                        imageUrl: getVariantImage(slug),
                        badgeColor: getFinishBadgeColor(variant.finish)
                    });
                }
            }
        }

        return results;
    }

    /**
     * Get total count of all variants owned
     *
     * @returns {Object} Total variant and quantity counts
     */
    getTotalVariants() {
        let totalVariants = 0;
        let totalQuantity = 0;
        let uniqueCards = 0;

        for (const [cardName, variants] of Object.entries(this.collection)) {
            uniqueCards++;
            for (const variant of Object.values(variants)) {
                totalVariants++;
                totalQuantity += variant.qty;
            }
        }

        return {
            uniqueCards: uniqueCards,
            totalVariants: totalVariants,
            totalQuantity: totalQuantity
        };
    }

    /**
     * Get statistics breakdown by finish type
     *
     * @returns {Object} Stats broken down by finish type
     */
    getVariantStats() {
        const stats = {
            Standard: { variants: 0, quantity: 0, cards: new Set() },
            Foil: { variants: 0, quantity: 0, cards: new Set() },
            Rainbow: { variants: 0, quantity: 0, cards: new Set() }
        };

        const bySet = {};
        const byProduct = {};

        for (const [cardName, variants] of Object.entries(this.collection)) {
            for (const [slug, variant] of Object.entries(variants)) {
                // By finish
                if (stats[variant.finish]) {
                    stats[variant.finish].variants++;
                    stats[variant.finish].quantity += variant.qty;
                    stats[variant.finish].cards.add(cardName);
                }

                // By set
                if (!bySet[variant.set]) {
                    bySet[variant.set] = { variants: 0, quantity: 0 };
                }
                bySet[variant.set].variants++;
                bySet[variant.set].quantity += variant.qty;

                // By product
                if (!byProduct[variant.product]) {
                    byProduct[variant.product] = { variants: 0, quantity: 0 };
                }
                byProduct[variant.product].variants++;
                byProduct[variant.product].quantity += variant.qty;
            }
        }

        // Convert Sets to counts
        for (const finish of Object.keys(stats)) {
            stats[finish].uniqueCards = stats[finish].cards.size;
            delete stats[finish].cards;
        }

        return {
            byFinish: stats,
            bySet: bySet,
            byProduct: byProduct,
            totals: this.getTotalVariants()
        };
    }

    /**
     * Check if a specific variant is owned
     *
     * @param {string} cardName - The name of the card
     * @param {string} slug - The variant slug
     * @returns {Object|false} The variant entry or false if not owned
     */
    hasVariant(cardName, slug) {
        if (!cardName || !slug) {
            return false;
        }

        const normalizedName = this.normalizeCardName(cardName);

        if (!this.collection[normalizedName]) {
            return false;
        }

        const variant = this.collection[normalizedName][slug];
        if (!variant) {
            return false;
        }

        return {
            owned: true,
            quantity: variant.qty,
            ...variant
        };
    }

    /**
     * Export the entire collection as JSON
     *
     * @returns {string} JSON string of the collection
     */
    exportCollection() {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            collection: this.collection,
            stats: this.getVariantStats()
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import a collection from JSON data
     *
     * @param {string|Object} data - JSON string or object to import
     * @param {boolean} merge - Whether to merge with existing collection (default: false)
     * @returns {Object} Import result summary
     */
    importCollection(data, merge = false) {
        let importData;

        try {
            if (typeof data === 'string') {
                importData = JSON.parse(data);
            } else if (typeof data === 'object') {
                importData = data;
            } else {
                throw new Error('Invalid import data type');
            }
        } catch (error) {
            throw new Error(`Failed to parse import data: ${error.message}`);
        }

        // Handle versioned export format
        const collection = importData.collection || importData;

        if (typeof collection !== 'object') {
            throw new Error('Invalid collection format');
        }

        const beforeStats = this.getTotalVariants();

        if (merge) {
            // Merge with existing collection
            for (const [cardName, variants] of Object.entries(collection)) {
                if (!this.collection[cardName]) {
                    this.collection[cardName] = {};
                }

                for (const [slug, variant] of Object.entries(variants)) {
                    if (this.collection[cardName][slug]) {
                        // Add quantities together
                        this.collection[cardName][slug].qty += variant.qty;
                        this.collection[cardName][slug].updatedAt = new Date().toISOString();
                    } else {
                        // Add new variant
                        this.collection[cardName][slug] = {
                            ...variant,
                            importedAt: new Date().toISOString()
                        };
                    }
                }
            }
        } else {
            // Replace existing collection
            this.collection = collection;
        }

        this.saveToStorage();

        const afterStats = this.getTotalVariants();

        return {
            success: true,
            merged: merge,
            importedAt: new Date().toISOString(),
            before: beforeStats,
            after: afterStats,
            added: {
                cards: afterStats.uniqueCards - beforeStats.uniqueCards,
                variants: afterStats.totalVariants - beforeStats.totalVariants,
                quantity: afterStats.totalQuantity - beforeStats.totalQuantity
            }
        };
    }

    /**
     * Clear the entire collection
     *
     * @returns {boolean} Success status
     */
    clearCollection() {
        this.collection = {};
        this.saveToStorage();
        return true;
    }

    /**
     * Get all cards in the collection
     *
     * @returns {Array} Array of all card names
     */
    getAllCards() {
        return Object.keys(this.collection).map(name => ({
            normalizedName: name,
            displayName: name.replace(/_/g, ' '),
            variantCount: Object.keys(this.collection[name]).length
        }));
    }

    /**
     * Search for cards by name
     *
     * @param {string} query - Search query
     * @returns {Array} Matching cards
     */
    searchCards(query) {
        if (!query || typeof query !== 'string') {
            return [];
        }

        const normalizedQuery = query.toLowerCase().trim();
        const results = [];

        for (const [cardName, variants] of Object.entries(this.collection)) {
            if (cardName.includes(normalizedQuery) ||
                cardName.replace(/_/g, ' ').includes(normalizedQuery)) {
                results.push({
                    normalizedName: cardName,
                    displayName: cardName.replace(/_/g, ' '),
                    variants: variants,
                    variantCount: Object.keys(variants).length
                });
            }
        }

        return results;
    }
}

/**
 * Migrate existing collection format to variant-based format
 * Handles conversion from simple {cardName: qty} or other formats
 *
 * @param {Object} oldCollection - The old collection data
 * @param {Object} options - Migration options
 * @returns {Object} Migration result
 */
function migrateToVariantFormat(oldCollection, options = {}) {
    const {
        defaultSet = 'alp',
        defaultProduct = 'b',
        defaultFinish = 'Standard',
        finishCode = 's'
    } = options;

    if (!oldCollection || typeof oldCollection !== 'object') {
        throw new Error('Invalid collection data for migration');
    }

    const newCollection = {};
    const migrationLog = {
        migratedAt: new Date().toISOString(),
        cardsProcessed: 0,
        variantsCreated: 0,
        errors: []
    };

    for (const [key, value] of Object.entries(oldCollection)) {
        try {
            migrationLog.cardsProcessed++;

            // Determine the card name and quantity based on old format
            let cardName, qty, existingVariants;

            if (typeof value === 'number') {
                // Simple format: { "card_name": 2 }
                cardName = key;
                qty = value;
                existingVariants = null;
            } else if (typeof value === 'object' && value !== null) {
                // Check if it's already in variant format
                const firstKey = Object.keys(value)[0];
                if (firstKey && value[firstKey].finish) {
                    // Already in variant format, skip migration
                    newCollection[key] = value;
                    continue;
                }

                // Object format with qty: { "card_name": { qty: 2, ... } }
                if (value.qty !== undefined) {
                    cardName = key;
                    qty = value.qty;
                } else {
                    // Unknown format, try to preserve
                    cardName = key;
                    qty = 1;
                }
            } else {
                migrationLog.errors.push(`Unknown format for key: ${key}`);
                continue;
            }

            // Normalize card name
            const normalizedName = cardName.toLowerCase().trim().replace(/\s+/g, '_');

            // Generate slug
            const slug = `${defaultSet}-${normalizedName}-${defaultProduct}-${finishCode}`;

            // Create new variant entry
            if (!newCollection[normalizedName]) {
                newCollection[normalizedName] = {};
            }

            newCollection[normalizedName][slug] = {
                finish: defaultFinish,
                product: options.productName || 'Booster',
                set: options.setName || 'Alpha',
                qty: qty,
                addedAt: new Date().toISOString(),
                migratedFrom: 'legacy'
            };

            migrationLog.variantsCreated++;

        } catch (error) {
            migrationLog.errors.push(`Error migrating ${key}: ${error.message}`);
        }
    }

    return {
        collection: newCollection,
        log: migrationLog
    };
}

/**
 * Apply migration to existing localStorage data
 *
 * @param {string} oldStorageKey - The key for the old collection in localStorage
 * @param {Object} options - Migration options
 * @returns {Object} Migration result
 */
function applyMigration(oldStorageKey = 'sorcery_collection', options = {}) {
    try {
        const oldData = localStorage.getItem(oldStorageKey);

        if (!oldData) {
            return {
                success: false,
                message: 'No existing collection found to migrate'
            };
        }

        const oldCollection = JSON.parse(oldData);
        const migrationResult = migrateToVariantFormat(oldCollection, options);

        // Create a new tracker and import the migrated data
        const tracker = new VariantTracker();
        const importResult = tracker.importCollection(migrationResult.collection, true);

        // Optionally backup old data
        if (options.backupOld !== false) {
            localStorage.setItem(`${oldStorageKey}_backup_${Date.now()}`, oldData);
        }

        return {
            success: true,
            migration: migrationResult.log,
            import: importResult,
            message: `Successfully migrated ${migrationResult.log.cardsProcessed} cards`
        };

    } catch (error) {
        return {
            success: false,
            message: `Migration failed: ${error.message}`,
            error: error
        };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VariantTracker,
        parseSlug,
        getVariantImage,
        getFinishBadgeColor,
        migrateToVariantFormat,
        applyMigration,
        VARIANT_STORAGE_KEY
    };
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.VariantTracker = VariantTracker;
    window.parseSlug = parseSlug;
    window.getVariantImage = getVariantImage;
    window.getFinishBadgeColor = getFinishBadgeColor;
    window.migrateToVariantFormat = migrateToVariantFormat;
    window.applyMigration = applyMigration;
}
