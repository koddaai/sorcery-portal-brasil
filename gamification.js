// ============================================
// SORCERY GAMIFICATION SYSTEM
// Achievements, Badges, and Progress Tracking
// ============================================

// Get per-user storage key for achievements
function getAchievementsStorageKey() {
    let userId = null;
    if (typeof nocoDBService !== 'undefined' && nocoDBService.currentUser) {
        userId = nocoDBService.currentUser.Id || nocoDBService.currentUser.id;
    }
    if (!userId) {
        try {
            const session = localStorage.getItem('sorcery-session');
            if (session) {
                const user = JSON.parse(session);
                userId = user.Id || user.id;
            }
        } catch (e) {}
    }
    return userId ? `sorcery-achievements-${userId}` : 'sorcery-achievements';
}

class GamificationSystem {
    constructor() {
        this.unlockedAchievements = new Set();
        this.loadProgress();
    }

    // All available achievements
    achievements = {
        // Collection milestones
        'first-card': {
            id: 'first-card',
            name: 'First Steps',
            description: 'Add your first card to the collection',
            icon: '🌟',
            category: 'collection',
            check: (stats) => stats.totalCards >= 1
        },
        'collector-10': {
            id: 'collector-10',
            name: 'Budding Collector',
            description: 'Collect 10 unique cards',
            icon: '📦',
            category: 'collection',
            check: (stats) => stats.totalCards >= 10
        },
        'collector-50': {
            id: 'collector-50',
            name: 'Serious Collector',
            description: 'Collect 50 unique cards',
            icon: '📦',
            category: 'collection',
            check: (stats) => stats.totalCards >= 50
        },
        'collector-100': {
            id: 'collector-100',
            name: 'Master Collector',
            description: 'Collect 100 unique cards',
            icon: '🏆',
            category: 'collection',
            check: (stats) => stats.totalCards >= 100
        },
        'collector-500': {
            id: 'collector-500',
            name: 'Legendary Collector',
            description: 'Collect 500 unique cards',
            icon: '👑',
            category: 'collection',
            check: (stats) => stats.totalCards >= 500
        },

        // Rarity achievements
        'first-unique': {
            id: 'first-unique',
            name: 'Unique Discovery',
            description: 'Collect your first Unique rarity card',
            icon: '💎',
            category: 'rarity',
            check: (stats) => stats.uniqueCards >= 1
        },
        'unique-hunter': {
            id: 'unique-hunter',
            name: 'Unique Hunter',
            description: 'Collect 10 Unique rarity cards',
            icon: '💎',
            category: 'rarity',
            check: (stats) => stats.uniqueCards >= 10
        },
        'exceptional-taste': {
            id: 'exceptional-taste',
            name: 'Exceptional Taste',
            description: 'Collect 20 Exceptional rarity cards',
            icon: '⭐',
            category: 'rarity',
            check: (stats) => stats.exceptionalCards >= 20
        },

        // Set completion
        'set-starter': {
            id: 'set-starter',
            name: 'Set Starter',
            description: 'Collect 25% of any set',
            icon: '📊',
            category: 'sets',
            check: (stats) => stats.bestSetCompletion >= 25
        },
        'set-half': {
            id: 'set-half',
            name: 'Halfway There',
            description: 'Collect 50% of any set',
            icon: '📊',
            category: 'sets',
            check: (stats) => stats.bestSetCompletion >= 50
        },
        'set-master': {
            id: 'set-master',
            name: 'Set Master',
            description: 'Complete 100% of any set',
            icon: '🎯',
            category: 'sets',
            check: (stats) => stats.bestSetCompletion >= 100
        },

        // Element mastery
        'fire-adept': {
            id: 'fire-adept',
            name: 'Fire Adept',
            description: 'Collect 25 Fire element cards',
            icon: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
            category: 'elements',
            check: (stats) => stats.fireCards >= 25
        },
        'water-adept': {
            id: 'water-adept',
            name: 'Water Adept',
            description: 'Collect 25 Water element cards',
            icon: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
            category: 'elements',
            check: (stats) => stats.waterCards >= 25
        },
        'earth-adept': {
            id: 'earth-adept',
            name: 'Earth Adept',
            description: 'Collect 25 Earth element cards',
            icon: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
            category: 'elements',
            check: (stats) => stats.earthCards >= 25
        },
        'air-adept': {
            id: 'air-adept',
            name: 'Air Adept',
            description: 'Collect 25 Air element cards',
            icon: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">',
            category: 'elements',
            check: (stats) => stats.airCards >= 25
        },
        'elemental-master': {
            id: 'elemental-master',
            name: 'Elemental Master',
            description: 'Collect 25+ cards of each element',
            icon: '🌈',
            category: 'elements',
            check: (stats) =>
                stats.fireCards >= 25 &&
                stats.waterCards >= 25 &&
                stats.earthCards >= 25 &&
                stats.airCards >= 25
        },

        // Card type achievements
        'avatar-collector': {
            id: 'avatar-collector',
            name: 'Avatar Collector',
            description: 'Collect 10 Avatar cards',
            icon: '👤',
            category: 'types',
            check: (stats) => stats.avatarCards >= 10
        },
        'site-surveyor': {
            id: 'site-surveyor',
            name: 'Site Surveyor',
            description: 'Collect 50 Site cards',
            icon: '🏰',
            category: 'types',
            check: (stats) => stats.siteCards >= 50
        },
        'minion-master': {
            id: 'minion-master',
            name: 'Minion Master',
            description: 'Collect 100 Minion cards',
            icon: '⚔️',
            category: 'types',
            check: (stats) => stats.minionCards >= 100
        },

        // Precon achievements
        'precon-owner': {
            id: 'precon-owner',
            name: 'Dono de Precon',
            description: 'Ter pelo menos um deck pré-construído',
            icon: '📦',
            category: 'precons',
            check: (stats) => stats.preconsOwned >= 1
        },
        'precon-collector': {
            id: 'precon-collector',
            name: 'Colecionador de Precons',
            description: 'Ter todos os 4 precons do Beta',
            icon: '🎴',
            category: 'precons',
            check: (stats) => stats.betaPreconsOwned >= 4
        },
        'complete-precons': {
            id: 'complete-precons',
            name: 'Completista de Precons',
            description: 'Ter todos os 8 decks pré-construídos',
            icon: '🏅',
            category: 'precons',
            check: (stats) => stats.preconsOwned >= 8
        },

        // Deck building
        'first-deck': {
            id: 'first-deck',
            name: 'Deck Builder',
            description: 'Create your first custom deck',
            icon: '📋',
            category: 'decks',
            check: (stats) => stats.decksCreated >= 1
        },
        'deck-master': {
            id: 'deck-master',
            name: 'Deck Master',
            description: 'Create 5 custom decks',
            icon: '���',
            category: 'decks',
            check: (stats) => stats.decksCreated >= 5
        },

        // Value achievements
        'hundred-dollar': {
            id: 'hundred-dollar',
            name: 'Hundred Dollar Club',
            description: 'Collection value exceeds $100',
            icon: '💵',
            category: 'value',
            check: (stats) => stats.collectionValue >= 100
        },
        'thousand-dollar': {
            id: 'thousand-dollar',
            name: 'Thousand Dollar Club',
            description: 'Collection value exceeds $1,000',
            icon: '💰',
            category: 'value',
            check: (stats) => stats.collectionValue >= 1000
        },

        // Trading
        'trader': {
            id: 'trader',
            name: 'Trader',
            description: 'Add 10 cards to your trade binder',
            icon: '🔄',
            category: 'trading',
            check: (stats) => stats.tradeBinderSize >= 10
        }
    };

    // Load progress from localStorage (per-user)
    loadProgress() {
        const storageKey = getAchievementsStorageKey();
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            this.unlockedAchievements = new Set(JSON.parse(saved));
        }
    }

    // Save progress to localStorage (per-user)
    saveProgress() {
        const storageKey = getAchievementsStorageKey();
        localStorage.setItem(storageKey, JSON.stringify([...this.unlockedAchievements]));
    }

    // Calculate current stats from app data
    calculateStats(allCards, collection, wishlist, tradeBinder, decks, ownedPrecons, priceService) {
        const stats = {
            totalCards: collection.size,
            wishlistSize: wishlist.size,
            tradeBinderSize: tradeBinder.size,
            decksCreated: decks.length,
            preconsOwned: ownedPrecons.size,
            betaPreconsOwned: 0,
            uniqueCards: 0,
            exceptionalCards: 0,
            eliteCards: 0,
            ordinaryCards: 0,
            fireCards: 0,
            waterCards: 0,
            earthCards: 0,
            airCards: 0,
            avatarCards: 0,
            minionCards: 0,
            siteCards: 0,
            magicCards: 0,
            bestSetCompletion: 0,
            collectionValue: 0
        };

        // Count Beta precons
        ['beta-fire', 'beta-air', 'beta-water', 'beta-earth'].forEach(p => {
            if (ownedPrecons.has(p)) stats.betaPreconsOwned++;
        });

        // Analyze collection
        collection.forEach(cardName => {
            const card = allCards.find(c => c.name === cardName);
            if (!card) return;

            // Rarity
            const rarity = card.guardian?.rarity;
            if (rarity === 'Unique') stats.uniqueCards++;
            else if (rarity === 'Exceptional') stats.exceptionalCards++;
            else if (rarity === 'Elite') stats.eliteCards++;
            else stats.ordinaryCards++;

            // Elements
            const elements = card.elements || '';
            if (elements.includes('Fire')) stats.fireCards++;
            if (elements.includes('Water')) stats.waterCards++;
            if (elements.includes('Earth')) stats.earthCards++;
            if (elements.includes('Air')) stats.airCards++;

            // Types
            const type = card.guardian?.type;
            if (type === 'Avatar') stats.avatarCards++;
            else if (type === 'Minion') stats.minionCards++;
            else if (type === 'Site') stats.siteCards++;
            else if (type === 'Magic') stats.magicCards++;

            // Value
            if (priceService) {
                const price = priceService.getPrice(cardName) || priceService.getEstimatedPrice(card);
                stats.collectionValue += price;
            }
        });

        // Calculate set completion
        const sets = ['Alpha', 'Beta', 'Arthurian Legends', 'Gothic', 'Dragonlord'];
        sets.forEach(setName => {
            const setCards = allCards.filter(c => c.sets?.some(s => s.name === setName));
            const ownedInSet = setCards.filter(c => collection.has(c.name)).length;
            const completion = setCards.length > 0 ? (ownedInSet / setCards.length) * 100 : 0;
            if (completion > stats.bestSetCompletion) {
                stats.bestSetCompletion = completion;
            }
        });

        return stats;
    }

    // Check all achievements and return newly unlocked ones
    checkAchievements(stats) {
        const newlyUnlocked = [];

        for (const [id, achievement] of Object.entries(this.achievements)) {
            if (!this.unlockedAchievements.has(id) && achievement.check(stats)) {
                this.unlockedAchievements.add(id);
                newlyUnlocked.push(achievement);
            }
        }

        if (newlyUnlocked.length > 0) {
            this.saveProgress();
        }

        return newlyUnlocked;
    }

    // Get all achievements with their status
    getAllAchievements(stats) {
        return Object.values(this.achievements).map(achievement => ({
            ...achievement,
            unlocked: this.unlockedAchievements.has(achievement.id),
            progress: this.getProgress(achievement, stats)
        }));
    }

    // Get progress towards an achievement (0-100)
    getProgress(achievement, stats) {
        if (this.unlockedAchievements.has(achievement.id)) return 100;

        // Calculate progress based on achievement type
        switch (achievement.id) {
            case 'collector-10': return Math.min(100, (stats.totalCards / 10) * 100);
            case 'collector-50': return Math.min(100, (stats.totalCards / 50) * 100);
            case 'collector-100': return Math.min(100, (stats.totalCards / 100) * 100);
            case 'collector-500': return Math.min(100, (stats.totalCards / 500) * 100);
            case 'unique-hunter': return Math.min(100, (stats.uniqueCards / 10) * 100);
            case 'exceptional-taste': return Math.min(100, (stats.exceptionalCards / 20) * 100);
            case 'fire-adept': return Math.min(100, (stats.fireCards / 25) * 100);
            case 'water-adept': return Math.min(100, (stats.waterCards / 25) * 100);
            case 'earth-adept': return Math.min(100, (stats.earthCards / 25) * 100);
            case 'air-adept': return Math.min(100, (stats.airCards / 25) * 100);
            case 'avatar-collector': return Math.min(100, (stats.avatarCards / 10) * 100);
            case 'site-surveyor': return Math.min(100, (stats.siteCards / 50) * 100);
            case 'minion-master': return Math.min(100, (stats.minionCards / 100) * 100);
            case 'precon-collector': return Math.min(100, (stats.betaPreconsOwned / 4) * 100);
            case 'complete-precons': return Math.min(100, (stats.preconsOwned / 8) * 100);
            case 'deck-master': return Math.min(100, (stats.decksCreated / 5) * 100);
            case 'set-starter': return Math.min(100, (stats.bestSetCompletion / 25) * 100);
            case 'set-half': return Math.min(100, (stats.bestSetCompletion / 50) * 100);
            case 'set-master': return Math.min(100, stats.bestSetCompletion);
            case 'hundred-dollar': return Math.min(100, (stats.collectionValue / 100) * 100);
            case 'thousand-dollar': return Math.min(100, (stats.collectionValue / 1000) * 100);
            case 'trader': return Math.min(100, (stats.tradeBinderSize / 10) * 100);
            default: return 0;
        }
    }

    // Get summary statistics
    getSummary() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.unlockedAchievements.size;
        return {
            total,
            unlocked,
            percentage: total > 0 ? ((unlocked / total) * 100).toFixed(0) : 0
        };
    }

    // Get achievements by category
    getByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }
}

// Global instance
const gamification = new GamificationSystem();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GamificationSystem, gamification };
}
