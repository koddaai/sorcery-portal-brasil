/**
 * Flavor Text Collection - Explore the lore of Sorcery
 * Displays cards with flavor text for reading and collecting lore
 */

class FlavorTextExplorer {
    constructor() {
        this.cardsWithFlavor = [];
        this.filteredCards = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
    }

    /**
     * Initialize with card data
     */
    init(allCards) {
        // Extract cards that have flavor text
        this.cardsWithFlavor = [];

        allCards.forEach(card => {
            if (!card.sets) return;

            card.sets.forEach(set => {
                if (!set.variants) return;

                set.variants.forEach(variant => {
                    if (variant.flavorText && variant.flavorText.trim()) {
                        this.cardsWithFlavor.push({
                            cardName: card.name,
                            flavorText: variant.flavorText,
                            artist: variant.artist,
                            setName: set.name,
                            slug: variant.slug,
                            type: card.guardian?.type || 'Unknown',
                            rarity: card.guardian?.rarity || 'Unknown',
                            element: card.elements || 'None'
                        });
                    }
                });
            });
        });

        // Remove duplicates (same card name + same flavor text)
        const seen = new Set();
        this.cardsWithFlavor = this.cardsWithFlavor.filter(item => {
            const key = `${item.cardName}-${item.flavorText}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        this.filteredCards = [...this.cardsWithFlavor];
        console.log(`FlavorTextExplorer: Found ${this.cardsWithFlavor.length} cards with flavor text`);
    }

    /**
     * Filter cards by element
     */
    filterByElement(element) {
        this.currentFilter = element;
        this.applyFilters();
    }

    /**
     * Search in flavor text
     */
    search(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.applyFilters();
    }

    /**
     * Apply all filters
     */
    applyFilters() {
        this.filteredCards = this.cardsWithFlavor.filter(card => {
            // Element filter
            if (this.currentFilter !== 'all') {
                const cardElement = card.element.toLowerCase();
                if (!cardElement.includes(this.currentFilter.toLowerCase())) {
                    return false;
                }
            }

            // Search filter
            if (this.searchQuery) {
                const searchIn = `${card.cardName} ${card.flavorText} ${card.artist || ''}`.toLowerCase();
                if (!searchIn.includes(this.searchQuery)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Get random flavor text
     */
    getRandomFlavor() {
        if (this.cardsWithFlavor.length === 0) return null;
        const index = Math.floor(Math.random() * this.cardsWithFlavor.length);
        return this.cardsWithFlavor[index];
    }

    /**
     * Get flavor texts by set
     */
    getBySet(setName) {
        return this.cardsWithFlavor.filter(card => card.setName === setName);
    }

    /**
     * Get statistics
     */
    getStats() {
        const byElement = {};
        const bySet = {};
        const byType = {};
        const artists = new Set();

        this.cardsWithFlavor.forEach(card => {
            // By element
            const element = card.element.split(',')[0].trim() || 'None';
            byElement[element] = (byElement[element] || 0) + 1;

            // By set
            bySet[card.setName] = (bySet[card.setName] || 0) + 1;

            // By type
            byType[card.type] = (byType[card.type] || 0) + 1;

            // Artists
            if (card.artist) artists.add(card.artist);
        });

        return {
            total: this.cardsWithFlavor.length,
            byElement,
            bySet,
            byType,
            uniqueArtists: artists.size
        };
    }

    /**
     * Render the flavor text view
     */
    render() {
        const container = document.getElementById('flavor-text-grid');
        const countEl = document.getElementById('flavor-text-count');

        if (!container) return;

        if (countEl) {
            countEl.textContent = `${this.filteredCards.length} cards with lore`;
        }

        if (this.filteredCards.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No flavor text found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredCards.map(card => this.createFlavorCard(card)).join('');

        // Add click handlers
        container.querySelectorAll('.flavor-card').forEach(el => {
            el.addEventListener('click', () => {
                const cardName = el.dataset.cardName;
                if (typeof openCardModal === 'function') {
                    openCardModal(cardName);
                }
            });
        });
    }

    /**
     * Create HTML for a flavor card
     */
    createFlavorCard(card) {
        const elementClass = card.element.split(',')[0].trim().toLowerCase() || 'none';
        const imageUrl = `https://d27a44hjr9gen3.cloudfront.net/cards/${card.slug}.png`;

        return `
            <div class="flavor-card" data-card-name="${card.cardName}">
                <div class="flavor-card-image">
                    <img src="${imageUrl}" alt="${card.cardName}" loading="lazy"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22><rect fill=%22%23242430%22 width=%22200%22 height=%22280%22/></svg>'">
                </div>
                <div class="flavor-card-content">
                    <h4 class="flavor-card-name">${card.cardName}</h4>
                    <div class="flavor-card-meta">
                        <span class="badge ${elementClass}">${card.element}</span>
                        <span class="badge">${card.setName}</span>
                    </div>
                    <blockquote class="flavor-text-quote">
                        "${card.flavorText}"
                    </blockquote>
                    ${card.artist ? `<p class="flavor-artist">Art by ${card.artist}</p>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render daily flavor (for home page)
     */
    renderDailyFlavor(containerId = 'daily-flavor') {
        const container = document.getElementById(containerId);
        if (!container || this.cardsWithFlavor.length === 0) return;

        // Use date as seed for consistent daily selection
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const index = seed % this.cardsWithFlavor.length;
        const card = this.cardsWithFlavor[index];

        container.innerHTML = `
            <div class="daily-flavor-card" onclick="openCardModal('${card.cardName}')">
                <div class="daily-flavor-header">
                    <i data-lucide="book-open"></i>
                    <span>Lore of the Day</span>
                </div>
                <blockquote class="daily-flavor-quote">
                    "${card.flavorText}"
                </blockquote>
                <p class="daily-flavor-source">— ${card.cardName}</p>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// Global instance
const flavorTextExplorer = new FlavorTextExplorer();

// Initialize when cards are loaded
if (typeof window !== 'undefined') {
    window.flavorTextExplorer = flavorTextExplorer;

    // Auto-initialize after cards load
    const originalLoadCards = window.loadCards;
    if (typeof originalLoadCards === 'function') {
        window.loadCards = async function() {
            await originalLoadCards();
            if (typeof allCards !== 'undefined' && allCards.length > 0) {
                flavorTextExplorer.init(allCards);
            }
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FlavorTextExplorer, flavorTextExplorer };
}
