// ============================================
// SORCERY COLLECTION MANAGER - MAIN APP
// ============================================

// Global State
let allCards = [];
let filteredCards = [];
let collection = new Set();
let wishlist = new Set();
let tradeBinder = new Set();
let decks = [];
let ownedPrecons = new Set();
let activeKeywordFilters = new Set();

// Precon card lists (from Curiosa.io official lists)
const PRECONS = {
    'beta-fire': {
        name: 'Fire Precon [Beta]',
        avatar: 'Flamecaller',
        cards: [
            { name: 'Flamecaller', qty: 1 },
            { name: 'Wildfire', qty: 1 },
            { name: 'Pit Vipers', qty: 2 },
            { name: 'Raal Dromedary', qty: 2 },
            { name: 'Lava Salamander', qty: 1 },
            { name: 'Rimland Nomads', qty: 2 },
            { name: 'Sacred Scarabs', qty: 2 },
            { name: 'Wayfaring Pilgrim', qty: 2 },
            { name: 'Colicky Dragonettes', qty: 1 },
            { name: 'Ogre Goons', qty: 3 },
            { name: 'Quarrelsome Kobolds', qty: 1 },
            { name: 'Clamor of Harpies', qty: 1 },
            { name: 'Hillock Basilisk', qty: 1 },
            { name: 'Petrosian Cavalry', qty: 1 },
            { name: 'Sand Worm', qty: 2 },
            { name: 'Askelon Phoenix', qty: 1 },
            { name: 'Escyllion Cyclops', qty: 1 },
            { name: 'Infernal Legion', qty: 1 },
            { name: 'Firebolts', qty: 2 },
            { name: 'Mad Dash', qty: 1 },
            { name: 'Blaze', qty: 1 },
            { name: 'Heat Ray', qty: 1 },
            { name: 'Minor Explosion', qty: 2 },
            { name: 'Fireball', qty: 1 },
            { name: 'Incinerate', qty: 1 },
            { name: 'Cone of Flame', qty: 1 },
            { name: 'Major Explosion', qty: 1 },
            { name: 'Arid Desert', qty: 4 },
            { name: 'Cornerstone', qty: 1 },
            { name: 'Red Desert', qty: 4 },
            { name: 'Remote Desert', qty: 4 },
            { name: 'Shifting Sands', qty: 2 },
            { name: 'Vesuvius', qty: 1 }
        ]
    },
    'beta-air': {
        name: 'Air Precon [Beta]',
        avatar: 'Sparkmage',
        cards: [
            { name: 'Sparkmage', qty: 1 },
            { name: 'Thunderstorm', qty: 1 },
            { name: 'Lucky Charm', qty: 1 },
            { name: 'Sling Pixies', qty: 1 },
            { name: 'Snow Leopard', qty: 2 },
            { name: 'Cloud Spirit', qty: 2 },
            { name: 'Dead of Night Demon', qty: 2 },
            { name: 'Spectral Stalker', qty: 2 },
            { name: 'Apprentice Wizard', qty: 2 },
            { name: 'Headless Haunt', qty: 2 },
            { name: 'Kite Archer', qty: 1 },
            { name: 'Midnight Rogue', qty: 2 },
            { name: 'Plumed Pegasus', qty: 2 },
            { name: 'Spire Lich', qty: 1 },
            { name: 'Gyre Hippogriffs', qty: 1 },
            { name: 'Skirmishers of Mu', qty: 1 },
            { name: 'Roaming Monster', qty: 1 },
            { name: 'Grandmaster Wizard', qty: 1 },
            { name: 'Nimbus Jinn', qty: 1 },
            { name: 'Highland Clansmen', qty: 1 },
            { name: 'Blink', qty: 2 },
            { name: 'Chain Lightning', qty: 2 },
            { name: 'Lightning Bolt', qty: 3 },
            { name: 'Teleport', qty: 1 },
            { name: 'Raise Dead', qty: 1 },
            { name: 'Cloud City', qty: 1 },
            { name: 'Dark Tower', qty: 3 },
            { name: 'Gothic Tower', qty: 3 },
            { name: 'Lone Tower', qty: 3 },
            { name: 'Mountain Pass', qty: 2 },
            { name: 'Observatory', qty: 1 },
            { name: 'Planar Gate', qty: 1 },
            { name: 'Updraft Ridge', qty: 2 }
        ]
    },
    'beta-water': {
        name: 'Water Precon [Beta]',
        avatar: 'Waveshaper',
        cards: [
            { name: 'Waveshaper', qty: 1 },
            { name: 'Tidal Wave', qty: 1 },
            { name: 'Tufted Turtles', qty: 2 },
            { name: 'Brobdingnag Bullfrog', qty: 2 },
            { name: 'Giant Oyster', qty: 2 },
            { name: 'Sea Serpent', qty: 1 },
            { name: 'Kelp Lurker', qty: 2 },
            { name: 'Gillfolk Raiders', qty: 2 },
            { name: 'Ice Golem', qty: 1 },
            { name: 'Polar Bear', qty: 2 },
            { name: 'Dragonfish', qty: 1 },
            { name: 'Mermaid', qty: 2 },
            { name: 'Diluvian Kraken', qty: 1 },
            { name: 'Coral Golem', qty: 1 },
            { name: 'Maelstrom Elemental', qty: 1 },
            { name: 'Sea Witch', qty: 1 },
            { name: 'Leviathan', qty: 1 },
            { name: 'Frost Bolt', qty: 2 },
            { name: 'Mist', qty: 1 },
            { name: 'Freeze', qty: 2 },
            { name: 'Hailstorm', qty: 1 },
            { name: 'Riptide', qty: 1 },
            { name: 'Flood', qty: 1 },
            { name: 'Ice Storm', qty: 1 },
            { name: 'Tidal Surge', qty: 1 },
            { name: 'Coastal Village', qty: 4 },
            { name: 'Coral Reef', qty: 3 },
            { name: 'Deep Sea', qty: 4 },
            { name: 'Frozen Lake', qty: 3 },
            { name: 'Whirlpool', qty: 2 }
        ]
    },
    'beta-earth': {
        name: 'Earth Precon [Beta]',
        avatar: 'Geomancer',
        cards: [
            { name: 'Geomancer', qty: 1 },
            { name: 'Earthquake', qty: 1 },
            { name: 'Border Militia', qty: 3 },
            { name: 'Autumn Unicorn', qty: 2 },
            { name: 'Giant Spider', qty: 2 },
            { name: 'Boar', qty: 2 },
            { name: 'Stone Golem', qty: 1 },
            { name: 'Centaur', qty: 2 },
            { name: 'Dryad', qty: 2 },
            { name: 'Treant', qty: 1 },
            { name: 'Earth Elemental', qty: 1 },
            { name: 'Giant', qty: 1 },
            { name: 'Behemoth', qty: 1 },
            { name: 'Forest Guardian', qty: 1 },
            { name: 'Landslide', qty: 2 },
            { name: 'Entangle', qty: 2 },
            { name: 'Petrify', qty: 1 },
            { name: 'Regrowth', qty: 1 },
            { name: 'Nature\'s Wrath', qty: 1 },
            { name: 'Earthquake', qty: 1 },
            { name: 'Ordinary Village', qty: 4 },
            { name: 'Dense Forest', qty: 4 },
            { name: 'Mountain', qty: 4 },
            { name: 'Ancient Grove', qty: 2 },
            { name: 'Cave', qty: 2 }
        ]
    },
    'gothic-necromancer': {
        name: 'Necromancer Precon [Gothic]',
        avatar: 'Necromancer',
        cards: [
            { name: 'Necromancer', qty: 1 },
            { name: 'Fowl Bones', qty: 2 },
            { name: 'Bone Spear', qty: 2 },
            { name: 'Skeleton Warrior', qty: 3 },
            { name: 'Grave Robber', qty: 2 },
            { name: 'Zombie Horde', qty: 2 },
            { name: 'Death Knight', qty: 1 },
            { name: 'Lich', qty: 1 },
            { name: 'Raise Skeleton', qty: 2 },
            { name: 'Dark Ritual', qty: 2 },
            { name: 'Soul Drain', qty: 1 },
            { name: 'Boneyard', qty: 4 },
            { name: 'Crypt', qty: 4 },
            { name: 'Haunted Cemetery', qty: 4 },
            { name: 'Dark Castle', qty: 4 }
        ]
    },
    'gothic-harbinger': {
        name: 'Harbinger Precon [Gothic]',
        avatar: 'Harbinger',
        cards: [
            { name: 'Harbinger', qty: 1 },
            { name: 'Omen', qty: 2 },
            { name: 'Dark Prophet', qty: 2 },
            { name: 'Raven Familiar', qty: 3 },
            { name: 'Storm Crow', qty: 2 },
            { name: 'Eclipse', qty: 1 },
            { name: 'Prophecy', qty: 2 },
            { name: 'Foretell', qty: 2 },
            { name: 'Doom', qty: 1 },
            { name: 'Cursed Tower', qty: 4 },
            { name: 'Blighted Land', qty: 4 },
            { name: 'Storm Peak', qty: 4 },
            { name: 'Obsidian Spire', qty: 4 }
        ]
    },
    'gothic-persecutor': {
        name: 'Persecutor Precon [Gothic]',
        avatar: 'Persecutor',
        cards: [
            { name: 'Persecutor', qty: 1 },
            { name: 'Accuser', qty: 2 },
            { name: 'Inquisitor', qty: 2 },
            { name: 'Witch Hunter', qty: 2 },
            { name: 'Purifier', qty: 2 },
            { name: 'Holy Fire', qty: 2 },
            { name: 'Accusation', qty: 3 },
            { name: 'Judgment', qty: 1 },
            { name: 'Purge', qty: 2 },
            { name: 'Cathedral', qty: 4 },
            { name: 'Sanctum', qty: 4 },
            { name: 'Holy Ground', qty: 4 },
            { name: 'Tribunal', qty: 4 }
        ]
    },
    'gothic-savior': {
        name: 'Savior Precon [Gothic]',
        avatar: 'Savior',
        cards: [
            { name: 'Savior', qty: 1 },
            { name: 'Guardian Angel', qty: 2 },
            { name: 'Protector', qty: 2 },
            { name: 'Healer', qty: 2 },
            { name: 'Shield Bearer', qty: 2 },
            { name: 'Second Wind', qty: 2 },
            { name: 'Swap', qty: 2 },
            { name: 'Divine Shield', qty: 2 },
            { name: 'Resurrection', qty: 1 },
            { name: 'Sanctuary', qty: 4 },
            { name: 'Temple', qty: 4 },
            { name: 'Blessed Grove', qty: 4 },
            { name: 'Heaven\'s Gate', qty: 4 }
        ]
    }
};

// CDN for card images
const IMAGE_CDN = 'https://d27a44hjr9gen3.cloudfront.net/cards/';

// DOM Elements
const loadingEl = document.getElementById('loading');
const cardsGridEl = document.getElementById('cards-grid');
const collectionGridEl = document.getElementById('collection-grid');
const wishlistGridEl = document.getElementById('wishlist-grid');
const resultsCountEl = document.getElementById('results-count');
const cardModal = document.getElementById('card-modal');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    loadFromStorage();
    await loadCards();
    setupEventListeners();
    renderCards();
    updateStats();

    // Handle deep links
    handleDeepLink();

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', handleDeepLink);
});

// Load cards from API or local file
async function loadCards() {
    try {
        // Try API first
        let response;
        try {
            response = await fetch('https://api.sorcerytcg.com/api/cards');
            if (!response.ok) throw new Error('API error');
            allCards = await response.json();
        } catch (apiError) {
            console.log('API failed, trying local file...');
            // Try local file
            response = await fetch('cards-database.json');
            const data = await response.json();
            // Convert from organized format to flat array
            allCards = [];
            for (const setName in data.sets) {
                const setData = data.sets[setName];
                setData.cards.forEach(card => {
                    // Check if card already exists
                    const existing = allCards.find(c => c.name === card.name);
                    if (!existing) {
                        allCards.push({
                            name: card.name,
                            guardian: {
                                type: card.type,
                                rarity: card.rarity,
                                cost: card.cost,
                                attack: card.attack,
                                defence: card.defence,
                                rulesText: card.rulesText
                            },
                            elements: card.elements,
                            subTypes: card.subTypes,
                            sets: [{
                                name: setName,
                                variants: card.variants
                            }]
                        });
                    } else {
                        // Add set to existing card
                        if (!existing.sets.find(s => s.name === setName)) {
                            existing.sets.push({
                                name: setName,
                                variants: card.variants
                            });
                        }
                    }
                });
            }
        }
        filteredCards = [...allCards];
        loadingEl.classList.add('hidden');
        console.log(`Loaded ${allCards.length} cards`);
    } catch (error) {
        console.error('Error loading cards:', error);
        loadingEl.innerHTML = `
            <p>Error loading cards. Please refresh the page.</p>
            <p style="color: var(--text-secondary); margin-top: 1rem;">${error.message}</p>
        `;
    }
}

// Load data from localStorage
function loadFromStorage() {
    const savedCollection = localStorage.getItem('sorcery-collection');
    const savedWishlist = localStorage.getItem('sorcery-wishlist');
    const savedTradeBinder = localStorage.getItem('sorcery-trade-binder');
    const savedDecks = localStorage.getItem('sorcery-decks');
    const savedPrecons = localStorage.getItem('sorcery-precons');

    if (savedCollection) collection = new Set(JSON.parse(savedCollection));
    if (savedWishlist) wishlist = new Set(JSON.parse(savedWishlist));
    if (savedTradeBinder) tradeBinder = new Set(JSON.parse(savedTradeBinder));
    if (savedDecks) decks = JSON.parse(savedDecks);
    if (savedPrecons) {
        ownedPrecons = new Set(JSON.parse(savedPrecons));
        // Update precon checkboxes
        ownedPrecons.forEach(preconId => {
            const checkbox = document.getElementById(`precon-${preconId}`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('sorcery-collection', JSON.stringify([...collection]));
    localStorage.setItem('sorcery-wishlist', JSON.stringify([...wishlist]));
    localStorage.setItem('sorcery-trade-binder', JSON.stringify([...tradeBinder]));
    localStorage.setItem('sorcery-decks', JSON.stringify(decks));
    localStorage.setItem('sorcery-precons', JSON.stringify([...ownedPrecons]));
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation - Primary buttons
    document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Navigation - Dropdown items
    document.querySelectorAll('.nav-dropdown-item[data-view]').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
        });
    });

    // Filters
    document.getElementById('search-input').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('set-filter').addEventListener('change', applyFilters);
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    document.getElementById('element-filter').addEventListener('change', applyFilters);
    document.getElementById('rarity-filter').addEventListener('change', applyFilters);

    // Initialize keyword filter
    initKeywordFilter();

    // Collection search and filters
    document.getElementById('collection-search')?.addEventListener('input', debounce(renderCollection, 300));
    document.getElementById('collection-set-filter')?.addEventListener('change', renderCollection);
    document.getElementById('collection-finish-filter')?.addEventListener('change', renderCollection);

    // Modal close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close modal on outside click
    cardModal.addEventListener('click', (e) => {
        if (e.target === cardModal) closeModal();
    });

    // Precon checkboxes
    document.querySelectorAll('[id^="precon-"]').forEach(checkbox => {
        checkbox.addEventListener('change', handlePreconChange);
    });

    // Add to collection/wishlist buttons
    document.getElementById('add-to-collection-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        toggleCollection(cardName);
    });

    document.getElementById('add-to-wishlist-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        toggleWishlist(cardName);
    });

    document.getElementById('add-to-trade-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        toggleTradeBinder(cardName);
    });

    // Share card button
    document.getElementById('share-card-btn')?.addEventListener('click', async () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        const success = await copyCardShareLink(cardName);
        const btn = document.getElementById('share-card-btn');
        if (success) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check"></i> Copied!';
            btn.classList.add('success');
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('success');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 2000);
        }
    });

    // QR Code button
    document.getElementById('qr-card-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        toggleQRCode(cardName);
    });

    // Deck Builder buttons
    document.getElementById('save-deck-btn')?.addEventListener('click', saveDeckFromBuilder);
    document.getElementById('cancel-deck-btn')?.addEventListener('click', closeDeckBuilder);
    document.querySelector('#deck-builder-modal .close-modal')?.addEventListener('click', closeDeckBuilder);

    // Trade binder search
    document.getElementById('trade-search')?.addEventListener('input', debounce(renderTradeBinder, 300));

    // Price import/export
    document.getElementById('import-prices-btn')?.addEventListener('click', () => {
        document.getElementById('import-prices-file')?.click();
    });

    document.getElementById('import-prices-file')?.addEventListener('change', handlePriceImport);

    document.getElementById('export-prices-btn')?.addEventListener('click', () => {
        if (typeof priceService !== 'undefined') {
            const csv = priceService.exportPricesToCSV();
            downloadFile(csv, 'sorcery-prices.csv', 'text/csv');
        }
    });

    // Deck builder
    document.getElementById('new-deck-btn')?.addEventListener('click', openDeckBuilder);

    // Import deck
    document.getElementById('import-deck-btn')?.addEventListener('click', openImportDeckModal);
    document.getElementById('import-deck-cancel')?.addEventListener('click', () => closeModal('import-deck-modal'));
    document.getElementById('import-deck-submit')?.addEventListener('click', submitImportDeck);

    // Import tabs
    document.querySelectorAll('.import-tab').forEach(tab => {
        tab.addEventListener('click', () => switchImportTab(tab.dataset.tab));
    });

    // Import URL input
    document.getElementById('import-deck-url')?.addEventListener('input', debounce(handleImportUrlInput, 500));

    // Import text input
    document.getElementById('import-deck-text')?.addEventListener('input', debounce(handleImportTextInput, 300));

    // Close import modal on backdrop click
    document.getElementById('import-deck-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'import-deck-modal') closeModal('import-deck-modal');
    });
}

// Switch View
function switchView(viewName) {
    // Scroll to top when switching views
    window.scrollTo(0, 0);

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-dropdown-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-dropdown-trigger').forEach(t => t.classList.remove('has-active'));

    document.getElementById(`${viewName}-view`)?.classList.add('active');
    document.querySelector(`.nav-btn[data-view="${viewName}"]`)?.classList.add('active');

    const activeDropdownItem = document.querySelector(`.nav-dropdown-item[data-view="${viewName}"]`);
    if (activeDropdownItem) {
        activeDropdownItem.classList.add('active');
        // Mark parent dropdown trigger as having an active item
        const parentDropdown = activeDropdownItem.closest('.nav-dropdown');
        if (parentDropdown) {
            parentDropdown.querySelector('.nav-dropdown-trigger')?.classList.add('has-active');
        }
    }

    // Refresh view content
    if (viewName === 'home') initHomeView();
    if (viewName === 'collection') renderCollection();
    if (viewName === 'wishlist') renderWishlist();
    if (viewName === 'stats') updateStatsWithPrices();
    if (viewName === 'decks') renderDecks();
    if (viewName === 'trade') renderTradeBinder();
    if (viewName === 'locator') initLocatorView();
    if (viewName === 'codex') initCodexView();
    if (viewName === 'rulebook') initRulebookView();
    if (viewName === 'faq') initFAQView();
    if (viewName === 'lore') initLoreView();
    if (viewName === 'quiz') initQuizView();
    if (viewName === 'guides') initGuidesView();
    if (viewName === 'community') initCommunityView();
    if (viewName === 'meta') initMetaView();
    if (viewName === 'art') initArtView();
    if (viewName === 'artists') { switchView('art'); return; } // Redirect to unified art view
    if (viewName === 'timeline') initTimelineView();
    if (viewName === 'dust') initDustView();
    if (viewName === 'promos') initPromosView();
    if (viewName === 'news') initNewsView();
    if (viewName === 'top-cards') initTopCardsView();

    // Re-initialize Lucide icons for dynamic content
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Global function for onclick handlers in HTML
function showView(viewName) {
    switchView(viewName);
}

// Initialize Community View
function initCommunityView() {
    if (typeof renderStores === 'function') {
        renderStores();
    }
}

// Initialize Meta View
function initMetaView() {
    renderTierList();
}

// Initialize Home View
function initHomeView() {
    // Update card count
    const totalCardsEl = document.getElementById('home-total-cards');
    if (totalCardsEl && allCards.length > 0) {
        totalCardsEl.textContent = allCards.length + '+';
    }
}

// Initialize Store Locator View
function initLocatorView() {
    renderLocatorStores();
    initLocatorFilters();
}

// Render stores in locator
function renderLocatorStores(filter = {}) {
    const container = document.getElementById('locator-results');
    if (!container || typeof BRAZILIAN_STORES === 'undefined') return;

    let stores = [...BRAZILIAN_STORES];

    // Apply filters
    if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        stores = stores.filter(store =>
            store.name.toLowerCase().includes(searchTerm) ||
            (store.city && store.city.toLowerCase().includes(searchTerm)) ||
            (store.state && store.state.toLowerCase().includes(searchTerm))
        );
    }

    if (filter.state) {
        stores = stores.filter(store => store.state === filter.state);
    }

    if (filter.type) {
        stores = stores.filter(store => store.type && store.type.includes(filter.type));
    }

    if (stores.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>Nenhuma loja encontrada com os filtros selecionados.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = stores.map((store, index) => `
        <div class="locator-store-item" data-index="${index}" onclick="selectStore(${index})">
            <div class="locator-store-name">${store.name}</div>
            <div class="locator-store-type">${store.type || 'Loja'}</div>
            ${store.city ? `<div class="locator-store-address">${store.city}${store.state ? ', ' + store.state : ''}</div>` : ''}
            <div class="locator-store-links">
                <a href="${store.url}" target="_blank" onclick="event.stopPropagation()">
                    <i data-lucide="external-link"></i> Visitar Site
                </a>
            </div>
        </div>
    `).join('');

    // Re-init icons
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Select store in locator
function selectStore(index) {
    if (typeof BRAZILIAN_STORES === 'undefined') return;

    const store = BRAZILIAN_STORES[index];
    if (!store) return;

    // Update active state
    document.querySelectorAll('.locator-store-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.locator-store-item[data-index="${index}"]`)?.classList.add('active');

    // Update map (if we had coordinates, we could show a map)
    const mapContainer = document.getElementById('locator-map-container');
    if (mapContainer) {
        // For now, show store info - could integrate with Google Maps API later
        mapContainer.innerHTML = `
            <div class="map-store-info">
                <h3>${store.name}</h3>
                <p class="store-type">${store.type || 'Loja'}</p>
                ${store.city ? `<p class="store-location"><i data-lucide="map-pin"></i> ${store.city}${store.state ? ', ' + store.state : ''}</p>` : ''}
                <a href="${store.url}" target="_blank" class="btn primary">
                    <i data-lucide="external-link"></i> Ir para o Site
                </a>
            </div>
        `;
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    }
}

// Initialize locator filters
function initLocatorFilters() {
    const searchInput = document.getElementById('locator-search');
    const stateFilter = document.getElementById('locator-state-filter');
    const typeFilter = document.getElementById('locator-type-filter');

    const applyLocatorFilters = () => {
        renderLocatorStores({
            search: searchInput?.value || '',
            state: stateFilter?.value || '',
            type: typeFilter?.value || ''
        });
    };

    searchInput?.addEventListener('input', applyLocatorFilters);
    stateFilter?.addEventListener('change', applyLocatorFilters);
    typeFilter?.addEventListener('change', applyLocatorFilters);
}

// Initialize Rulebook View
function initRulebookView() {
    if (typeof renderRulebook === 'function') {
        renderRulebook();
    }
    initRulebookNavigation();
}

// Initialize rulebook navigation
function initRulebookNavigation() {
    const navLinks = document.querySelectorAll('.rulebook-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Initialize FAQ View
function initFAQView() {
    if (typeof renderFAQ === 'function') {
        renderFAQ();
    }
    // Re-init Lucide icons
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Initialize Quiz View
function initQuizView() {
    if (typeof renderQuizStart === 'function') {
        renderQuizStart('quiz-container');
    }

    // Refresh lucide icons
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Initialize Lore / Flavor Text View
function initLoreView() {
    // Initialize flavor text explorer if not done yet
    if (typeof flavorTextExplorer !== 'undefined' && allCards.length > 0) {
        if (flavorTextExplorer.cardsWithFlavor.length === 0) {
            flavorTextExplorer.init(allCards);
        }
        flavorTextExplorer.render();
    }

    // Setup event listeners
    const searchInput = document.getElementById('lore-search');
    const elementFilter = document.getElementById('lore-element-filter');

    searchInput?.addEventListener('input', debounce(() => {
        if (typeof flavorTextExplorer !== 'undefined') {
            flavorTextExplorer.search(searchInput.value);
            flavorTextExplorer.render();
        }
    }, 300));

    elementFilter?.addEventListener('change', () => {
        if (typeof flavorTextExplorer !== 'undefined') {
            flavorTextExplorer.filterByElement(elementFilter.value);
            flavorTextExplorer.render();
        }
    });

    // Refresh lucide icons
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Initialize Deck Guides View
function initGuidesView() {
    if (typeof renderDeckGuides === 'function') {
        renderDeckGuides();
    }
    initGuidesNavigation();
}

// Initialize guides navigation
function initGuidesNavigation() {
    const navLinks = document.querySelectorAll('.guide-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Art View Data Cache
let artViewData = {
    artists: [],
    artistMap: new Map(),
    cardToArtist: new Map()
};

// Initialize Unified Art View
function initArtView() {
    const container = document.getElementById('art-gallery-content');
    if (!container) return;

    // Wait for cards to load
    if (!allCards.length) {
        container.innerHTML = '<p class="empty-state">Carregando artistas...</p>';
        setTimeout(initArtView, 500);
        return;
    }

    // Build artist data with cards mapping
    buildArtistData();

    // Render initial grid
    renderArtGallery(artViewData.artists);

    // Setup search filters
    setupArtSearchFilters();

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Build artist data from cards
function buildArtistData() {
    artViewData.artistMap = new Map();
    artViewData.cardToArtist = new Map();

    allCards.forEach(card => {
        if (card.sets) {
            card.sets.forEach(set => {
                if (set.variants) {
                    set.variants.forEach(variant => {
                        if (variant.artist) {
                            const artistName = variant.artist.trim();

                            // Add to artist map
                            if (!artViewData.artistMap.has(artistName)) {
                                artViewData.artistMap.set(artistName, {
                                    name: artistName,
                                    cardCount: 0,
                                    cards: [],
                                    seenCards: new Set()
                                });
                            }

                            const artist = artViewData.artistMap.get(artistName);

                            // Only count unique card names (same art across sets)
                            if (!artist.seenCards.has(card.name)) {
                                artist.seenCards.add(card.name);
                                artist.cardCount++;
                                artist.cards.push({
                                    name: card.name,
                                    set: set.name
                                });
                            }

                            // Map card name to artists
                            const cardKey = card.name.toLowerCase();
                            if (!artViewData.cardToArtist.has(cardKey)) {
                                artViewData.cardToArtist.set(cardKey, []);
                            }
                            if (!artViewData.cardToArtist.get(cardKey).includes(artistName)) {
                                artViewData.cardToArtist.get(cardKey).push(artistName);
                            }
                        }
                    });
                }
            });
        }
    });

    // Convert to sorted array and clean up temp data
    artViewData.artists = Array.from(artViewData.artistMap.values())
        .map(a => { delete a.seenCards; return a; })
        .sort((a, b) => b.cardCount - a.cardCount);
}

// Setup search filters
function setupArtSearchFilters() {
    const artistSearch = document.getElementById('art-artist-search');
    const cardSearch = document.getElementById('art-card-search');

    if (artistSearch) {
        artistSearch.oninput = () => filterArtGallery();
    }

    if (cardSearch) {
        cardSearch.oninput = () => filterArtGallery();
    }
}

// Filter art gallery based on search inputs
function filterArtGallery() {
    const artistQuery = document.getElementById('art-artist-search')?.value.trim().toLowerCase() || '';
    const cardQuery = document.getElementById('art-card-search')?.value.trim().toLowerCase() || '';

    let filtered = artViewData.artists;

    // Filter by artist name
    if (artistQuery) {
        filtered = filtered.filter(a => a.name.toLowerCase().includes(artistQuery));
    }

    // Filter by card name (find artists who illustrated this card)
    if (cardQuery) {
        const matchingArtists = new Set();

        // Search through card-to-artist mapping
        artViewData.cardToArtist.forEach((artists, cardName) => {
            if (cardName.includes(cardQuery)) {
                artists.forEach(a => matchingArtists.add(a));
            }
        });

        // Also search through artist's card lists
        filtered.forEach(artist => {
            if (artist.cards.some(c => c.name.toLowerCase().includes(cardQuery))) {
                matchingArtists.add(artist.name);
            }
        });

        filtered = filtered.filter(a => matchingArtists.has(a.name));
    }

    renderArtGallery(filtered, cardQuery);
}

// Render art gallery grid
function renderArtGallery(artists, highlightCard = '') {
    const container = document.getElementById('art-gallery-content');
    if (!container) return;

    // Show the header, philosophy and filters when returning to gallery
    const artView = document.getElementById('art-view');
    if (artView) {
        const sectionHeader = artView.querySelector('.section-header');
        const artPhilosophy = artView.querySelector('.art-philosophy');
        const galleryHeader = artView.querySelector('.art-gallery-section > h3');
        const galleryDesc = artView.querySelector('.art-gallery-section > .section-desc');
        const searchFilters = artView.querySelector('.art-search-filters');

        if (sectionHeader) sectionHeader.style.display = '';
        if (artPhilosophy) artPhilosophy.style.display = '';
        if (galleryHeader) galleryHeader.style.display = '';
        if (galleryDesc) galleryDesc.style.display = '';
        if (searchFilters) searchFilters.style.display = '';
    }

    if (!artists || !artists.length) {
        container.innerHTML = '<p class="empty-state">Nenhum artista encontrado</p>';
        return;
    }

    container.innerHTML = `
        <div class="artists-grid">
            ${artists.slice(0, 100).map((artist, index) => {
                // Get sample cards (up to 3)
                const sampleCards = artist.cards.slice(0, 3);
                const initials = artist.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                return `
                    <div class="artist-card-full" onclick="showArtistCards('${artist.name.replace(/'/g, "\\'")}')">
                        <div class="artist-photo">${initials}</div>
                        <div class="artist-details">
                            <h4>${artist.name}</h4>
                            <span class="card-count">${artist.cardCount} ilustrações</span>
                            <div class="sample-cards">
                                ${sampleCards.map(c => `
                                    <span class="sample-card-tag">${c.name}</span>
                                `).join('')}
                                ${artist.cards.length > 3 ? `<span class="sample-card-tag">+${artist.cards.length - 3}</span>` : ''}
                            </div>
                        </div>
                        ${index < 3 ? `<span class="rank-badge rank-${index + 1}">#${index + 1}</span>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Artist bio/info database - Portuguese translations with links and photos
// Data from official Sorcery TCG artist pages: https://sorcerytcg.com/art/
const ARTIST_INFO = {
    'Adam Burke': {
        bio: 'Nascido no Oregon e criado no Noroeste do Pacífico, ilustrador profissional desde 2010. Sua arte destaca aspectos frequentemente ignorados da natureza, capturando o caos aparente nas formas naturais.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/5a2693e5a5d51eed481be2aab98d8d7b7b71723e-640x640.jpg',
        links: { instagram: 'https://www.instagram.com/nightjarillustration/' }
    },
    'Adam Kašpar': {
        bio: 'Figura de destaque na pintura realista tcheca contemporânea, conhecido por capturar a atmosfera de natureza intocada, especialmente florestas profundas. Usa câmeras, telescópios e microscópios em seu processo artístico.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/e34b77b55c6358681890ddda76c17cb6dea4babe-578x586.webp',
        links: { instagram: 'https://www.instagram.com/adamkaspar_paintings/' }
    },
    'Alan Pollack': {
        bio: 'Ilustrador de fantasia inspirado por Frank Frazetta e Boris Vallejo. Começou com uma capa para Dungeon da TSR em 1991. Trabalhou em D&D, Magic: The Gathering e Blizzard. Nominado ao Hugo Award em 2015.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/850ecb9ad88687593f7c8766843d32e09a316050-307x381.jpg',
        links: { patreon: 'https://www.patreon.com/alanpollack' }
    },
    'Andrea Modesti': {
        bio: 'Nascido em Pavia, Itália, estudou pintura tradicional na Academia de Belas Artes de Brera. Tem predileção inata por história medieval. Combina aquarela com guache sobre papel 100% algodão.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/eb50d8c33307297c4dd1629f03c78ae05c255ea4-652x838.jpg',
        links: { website: 'https://www.andreamodesti-art.blogspot.com' }
    },
    'Anson Maddocks': {
        bio: 'Nascido em 1968 no Alasca, estudou na Cornish College of the Arts. Criou mais de 120 artes para Magic: The Gathering entre 1993-2008. Trabalhou com White Wolf e Alderac Entertainment.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/3669614a197d0777b9198936adc457c64b0bb5be-109x160.jpg',
        links: { website: 'https://ansonmaddocks.com/' }
    },
    'Atlas Thorn': {
        bio: 'Pintor a óleo da Austrália especializado em arte vibrante de fantasia. Usa tintas cruelty-free e materiais reciclados. Transicionou da animação em 2017 e cria alterações de cartas para Sorcery.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/07ef226608c047e2470ae545cb830ef6e5d07e44-741x1008.png',
        links: { website: 'https://www.atlasthornart.com' }
    },
    'Brian Smith': {
        bio: 'Cresceu nos anos 70-80 influenciado por pinturas clássicas, surrealismo e capas de álbuns. Trabalha com óleo sobre madeira, criando paisagens ameaçadoras e figuras assombradas.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/26118347f1c173aefdb9a2683bbf19b0c06c7061-1452x1936.jpg',
        links: { instagram: 'https://www.instagram.com/briansmith_art/' }
    },
    'Bryon Wackwitz': {
        bio: 'Artista pioneiro entre os primeiros 49 de Magic: The Gathering e ilustrador original de Legend of the Five Rings. Diretor de arte do Doomtown (1997-1999). Baseado na Filadélfia.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/deb939eb7ae3134b13e6702a6ccea06dba475005-2160x2960.png',
        links: { website: 'https://www.bryonwart.com' }
    },
    'Caio Calazans': {
        bio: 'Artista brasileiro com paixão pela arte desde a infância. Desenvolveu seu ofício através de alterações de cartas e recursos online. Sua entrada em Sorcery marcou sua transição de hobbyista para artista reconhecido.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/1a5588e8c3c0efa6064e27ff73f135827b24706d-1340x1711.jpg',
        links: { instagram: 'https://www.instagram.com/calazansartworks' }
    },
    'Dan Seagrave': {
        bio: 'Artista britânico de Worksop (1970) especializado em capas de álbuns de death metal. Autodidata, criou sua primeira capa aos 17 anos. Atualmente mora em Toronto explorando temas de isolamento e evolução.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/de0f42108bcdbb48c06f79ab4e59b76e71e4f2a1-400x544.jpg',
        links: { website: 'https://www.danseagrave.com/' }
    },
    "David O'Connor": {
        bio: 'Estudou ilustração em Brighton desde 1975. Criou capas de livros e publicidade. Nos anos 90, contribuiu para Magic: The Gathering. Trabalha com óleo e agora contribui para Sorcery.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/63e9a7a2940fe1bf45bbddd6837a38d114349208-1200x1600.png',
        links: { website: 'https://davidoconnorstudio.com/' }
    },
    'Doug Kovacs': {
        bio: 'Cresceu nos subúrbios de Chicago jogando D&D. Graduou-se pela Columbia College em 1996. Trabalhou em D&D 3ª e 4ª edição, desenvolveu o RPG Dungeon Crawl Classics e criou os livros Hobonomicon.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/b8a551dd937841d986e11a9a646a852db74aa6b5-1200x1600.png',
        links: { website: 'http://dougkovacs.com' }
    },
    'Drew Tucker': {
        bio: 'Artista versátil de fantasia e horror, veterano de Magic: The Gathering. Conhecido por estilo expressionista e cores intensas. Trabalhou para Wizards of the Coast e Fantasy Flight.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/26118347f1c173aefdb9a2683bbf19b0c06c7061-1452x1936.jpg',
        links: { website: 'https://www.drewtuckerillustration.com/' }
    },
    'Ed Beard Jr.': {
        bio: 'Veterano de 42 anos na ilustração. Começou como artista de aerógrafo automotivo nos anos 80. Renomado por arte icônica para Magic: The Gathering e Dungeons & Dragons. Usa aerógrafo, pincel e grafite.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/6b6f1204046d90f79c0a6bb859aaef089be7b25a-1932x2576.png',
        links: { website: 'https://www.edbeardjr.com' }
    },
    'Elvira Shakirova': {
        bio: 'Estudou ilustração de livros na Universidade de Moscou. Após 8 anos no teatro, transicionou para alterações de cartas TCG. Contribui para Sorcery desde 2019, mudou-se para Londres em 2023.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/44357d63dd9717dd593b3c1dceb0aa74e1e1ff24-1400x1938.jpg',
        links: { patreon: 'https://www.patreon.com/elvirashakirova' }
    },
    'Elwira Pawlikowska': {
        bio: 'Ilustradora e designer polonesa baseada na Suécia. Mestre em arquitetura, especializa-se em ilustração arquitetônica de fantasia, mapas e desenhos técnicos. Trabalha com nanquim e aquarela.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/1982cb0c4eea7a136935a6194f1d4bc7a1d3e8b2-1440x1800.jpg',
        links: { instagram: 'https://www.instagram.com/elwirapawlikowska/' }
    },
    'Emil Idzikowski': {
        bio: 'Artista multidisciplinar polonês especializado em pintura, design, fotografia e animação. Estudou na Academia de Belas Artes de Varsóvia. Trabalha com acrílicos e óleos mesclando técnica pictórica com sátira.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/2aaa51967e6d2d70dd7e43184835875441609231-1064x1500.jpg',
        links: {}
    },
    'Francesca Baerald': {
        bio: 'Artista e cartógrafa trabalhando na indústria de games desde 2013 para Wizards of the Coast, Blizzard, Square Enix, Games Workshop e Paizo. Especializa-se em aquarela, nanquim, acrílico e óleo.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/01f6bbdc845b42dbbb5043d832aff72fa4ee6ab1-495x800.jpg',
        links: { website: 'https://www.francescabaerald.com/' }
    },
    'Gadu Duaso': {
        bio: 'Artista filipino que descobriu a criatividade através de jogos online. Treinou técnicas clássicas com o mentor Emar Lacorte. Estudou Belas Artes na Universidade das Filipinas - Cebu. Trabalha com óleo e simbolismo alegórico.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/aed3e6bbbfd6e3debe4167090ca7305c7b0233e2-1200x1800.jpg',
        links: { facebook: 'https://www.facebook.com/TheArtOfGaduDuaso' }
    },
    'Heidi Taillefer': {
        bio: 'Surrealista e simbolista de Montreal. Colaborou com Cirque du Soleil, Infiniti, NFL e Forbes. Explora a hibridização de tecnologia e humanidade. Venceu o Traditional Art Award do Beautiful Bizarre 2020.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/fbe3f089bfb633a511ceb7040f6087796e6f5158-700x974.jpg',
        links: { website: 'https://www.heiditaillefer.com' }
    },
    'Ian Miller': {
        bio: 'Lendário ilustrador britânico (1946), celebrado por estilo gótico e macabro. Ganhou destaque em Fighting Fantasy e White Dwarf da Games Workshop, além de animação para Ralph Bakshi e DreamWorks.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/4133cd0461cc97b2b57d4c80677d3bc50984f5cf-228x200.jpg',
        links: { website: 'https://www.ian-miller.org/' }
    },
    'Jeff A. Menges': {
        bio: 'Um dos 25 artistas originais de Magic: The Gathering com carreira de mais de três décadas. Autor de mais de 20 títulos sobre ilustração da Era Dourada. Trabalha com acrílicos sobre placa gessoada.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/d8fc6531cb51db2b6e162030cc5673e1dddc35d1-307x381.jpg',
        links: { facebook: 'https://www.facebook.com/MengesArt/' }
    },
    'Jeff Easley': {
        bio: 'Moldou a identidade visual de RPGs. Começou na Warren Publishing e Marvel antes de entrar na TSR em 1982, onde definiu a estética de Advanced Dungeons & Dragons.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/5ec80547089614a03815e4a3d0b928b98e17cc84-800x1067.jpg',
        links: { website: 'https://jeffeasleyart.com/' }
    },
    'Jeffrey Laubenstein': {
        bio: 'Contador de histórias visuais com quase 40 anos em RPGs e games. Passou 12 anos na FASA em Shadowrun, MechWarrior e BattleTech. Criou "Show and Tell" para Magic.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/283f97e58ed1b8a31ee4ad83b78fcf80dd764ecb-1365x1365.jpg',
        links: { twitter: 'https://x.com/IllustratorJeff' }
    },
    'Juan Machuca': {
        bio: 'Nascido em Nuevo Laredo, México. Formado em Engenharia de Energia Renovável, desenha desde a infância. Sorcery representa seu primeiro grande projeto de ilustração profissional.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/5fe7e3b83f50dacde22ad850eabc964f26b328b1-900x1200.jpg',
        links: { instagram: 'https://www.instagram.com/machucarts89/' }
    },
    'Jussi Pylkäs': {
        bio: 'Artista 2D e concept artist finlandês de Oulu, especializado em design de criaturas. Trabalha com acrílicos, marcadores e nanquim. Joga Sorcery ativamente! Criou Battlemage e Headless Haunt.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/63670890cf06a404bf3ef9eb8f2110e581750ac7-240x240.jpg',
        links: { artstation: 'https://www.artstation.com/kisufisu' }
    },
    'Lindsey Crummett': {
        bio: 'Mais de 16 anos criando arte para cinema, TV, games e colecionáveis. Trabalhou na Weta Workshop por uma década em The Hobbit e Avatar. Atualmente freelancer para Sorcery.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/7dec037bde0aa1b5253e9910cf3f4829228adae4-1428x2000.jpg',
        links: { instagram: 'https://www.instagram.com/lindsey_crums_art' }
    },
    'Liz Danforth': {
        bio: 'Figura proeminente na indústria de games desde 1976. Conhecida por Tunnels & Trolls, Magic: The Gathering (36+ cartas), Battletech e Shadowrun. Induzida no Hall da Fama GAMA em 1995.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/054d90a9d6203945389be91fd619b8d9769bf52c-400x400.png',
        links: { patreon: 'https://www.patreon.com/LizDanforth' }
    },
    'Margaret Organ-Kean': {
        bio: 'Começou com arte equestre na infância. Construiu reconhecimento em convenções de ficção científica. Trabalhou para Cricket, Iron Crown e Wizards of the Coast. Especialista em aquarela.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/4f89c7284e6f31bc7f7f1e6a155ebe25701ad668-480x320.webp',
        links: { facebook: 'https://www.facebook.com/organkean/' }
    },
    'Marta Molina': {
        bio: 'Artista autodidata que dominou reproduções de arte bizantina, gótica e renascentista antes de transicionar para alterações de Magic e contribuir para Sorcery. Mescla métodos clássicos com fantasia contemporânea.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/58ef6a65080d5902e178d5a2590270dec2e51ebd-422x640.jpg',
        links: { patreon: 'https://www.patreon.com/user?u=82742693' }
    },
    'Matt Tames': {
        bio: 'Artista e designer do Meio-Oeste baseado na Nova Inglaterra. Inspirado por The Land Before Time, pinta desde a infância. Trabalha com design de embalagens para Lindt Chocolate e arte para card games.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/723aca5003c96b6accafcdf6d25ad9cbb692781a-500x528.jpg',
        links: { website: 'https://www.matttamesart.com/' }
    },
    'Mattias Frisk': {
        bio: 'Artista, ilustrador e músico sueco com background em design gráfico. Estudou história da arte na Universidade de Linköping. Ativo na comunidade death metal com merchandise e capas de álbuns.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/1984e08c46f8139a5e212412977810d00c5006fa-993x1229.jpg',
        links: { website: 'https://mattiasfrisk.com/' }
    },
    'Melissa A. Benson': {
        bio: 'Pioneira entre ilustradores fundadores de TCGs. Uma das 25 artistas originais de Magic: The Gathering. Suas ilustrações de criaturas cativam jogadores há mais de 30 anos.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/4cfc78fad9ef8e03d5b2a6896cfab64d45944628-1080x1080.jpg',
        links: { website: 'https://www.melissabenson.com/' }
    },
    'Michal Nagypál': {
        bio: 'Especialista em pintura a óleo, também trabalha com aquarela e escultura. Sua obra abrange retratos, paisagens e composições inspiradas em mestres antigos, com temas místicos e contemporâneos.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/582ef72f4404bedf80d47180f9158419e9aef42e-903x1138.jpg',
        links: { website: 'https://michalnagypal.sk/' }
    },
    'Ossi Hiekkala': {
        bio: 'Ilustrador finlandês com quase duas décadas de experiência. Começou com RuneQuest e Call of Cthulhu. Estudou design gráfico em Rovaniemi e ilustração no Japão. Trabalha com Chaosium Inc.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/1ac5988dc6a5c5351d8b1eb84f839a7fcc3bc91c-1080x1080.jpg',
        links: { website: 'https://www.archipictor.com' }
    },
    'Rodney Matthews': {
        bio: 'Alcançou fama internacional nos anos 70 quando Big O Posters distribuiu sua arte globalmente, vendendo milhões. Criou mais de 150 capas de álbuns e trabalhou em animação com Gerry Anderson.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/dfe3ea51bcf2084c4960ea588ea530dfcafa07af-2016x3024.jpg',
        links: { website: 'https://www.rodneymatthewsstudios.com/' }
    },
    'Sam McKinnon': {
        bio: 'Artista e designer gráfico de Montreal, Canadá. Inspirações incluem história medieval, mitologia e natureza. Trabalha principalmente com pintura acrílica, testando composições digitalmente primeiro.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/e35ef4cac8605a92c75d258cf2aed8b8a0d5e75c-640x960.jpg',
        links: { website: 'https://www.sammckinnon.com/' }
    },
    'Santiago Caruso': {
        bio: 'Artista simbolista argentino especializado no gênero fantástico. Ilustrou Jane Eyre, The Dunwich Horror e The King in Yellow. Criou capas para Tartarus Press, Actes Sud e Planeta.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/8fa4cc8c606ac8205f052f980be0b0711f8fa269-1586x2093.jpg',
        links: { website: 'https://www.santiagocaruso.com.ar' }
    },
    'Seb McKinnon': {
        bio: 'Ilustrador, cineasta e músico canadense de Montreal. Ilustrou mais de 100 cartas de Magic desde 2012. Cofundou a Five Knights Production, criando a premiada série Kin Fables.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/5498b7ca9b227eed7bd06ef15a085e1b8d7225a6-960x960.jpg',
        links: { website: 'https://www.sebmckinnon.com/' }
    },
    'Séverine Pineaux': {
        bio: 'Ilustradora francesa treinada em Paris. Artista expositora retratando natureza mágica com criaturas místicas. Mora na floresta de Brocéliande. Uma das artistas originais do set Alpha desde 2018.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/14bf37c44964fc1a49ac0892418f3be771b03bf4-2616x3264.jpg',
        links: { instagram: 'https://www.instagram.com/severinepineaux/' }
    },
    'Tony Szczudlo': {
        bio: 'Artista aclamado por trabalhos em RPGs e card games. Lead artist do Birthright nos anos 90. Ilustrou capas de Greyhawk e contribuiu para Magic e Harry Potter TCG.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/02a336462bc856444893bc3760d4093b95c3fd84-768x768.jpg',
        links: { facebook: 'https://www.facebook.com/TheArtOfTonySzczudlo' }
    },
    'Truitt Parrish': {
        bio: 'Artista americano com BFA pela CU Boulder. Cresceu desenhando dinossauros. Sua tese examinou a "Jornada do Herói" na Guerra das Rosas. Colabora com Sorcery desde 2020.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/b5efab7f05e4914954a5f057c2c45436a9c632f2-2817x4024.jpg',
        links: { website: 'https://truittparrish.com' }
    },
    'Vasiliy Ermolaev': {
        bio: 'Formado pelo Moscow Academic Art Lyceum e Moscow State University of Printing. Background em ilustração de livros infantis, mosaico e pintura de miniaturas para wargames.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/0b1045548daa9c9eb2330ac3722b676fca7d191c-424x631.jpg',
        links: { instagram: 'https://www.instagram.com/itm_fff/' }
    },
    'Vincent Pompetti': {
        bio: 'Iniciou carreira em 2001 após estudos na Escola de Belas Artes St. Luc, Bélgica. Criou graphic novels como The Corsair e Conquest. Concept artist para Sorcery e professor em instituições francesas.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/fe6e2d1cdcf9c06222aaf3a63a4a7809d9964261-760x824.jpg',
        links: { website: 'https://pompetti.wordpress.com/', instagram: 'https://www.instagram.com/vincentpompetti/' }
    }
};

// Generate slug for official Sorcery TCG artist page
function getArtistSlug(artistName) {
    return artistName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Get official Sorcery artist page URL
function getOfficialArtistUrl(artistName) {
    const slug = getArtistSlug(artistName);
    return `https://sorcerytcg.com/art/${slug}`;
}

// Show artist profile with their cards
function showArtistCards(artistName) {
    const artist = artViewData.artistMap.get(artistName);
    if (!artist) return;

    const container = document.getElementById('art-gallery-content');
    if (!container) return;

    // Hide the header, philosophy and filters when showing artist detail
    const artView = document.getElementById('art-view');
    if (artView) {
        const sectionHeader = artView.querySelector('.section-header');
        const artPhilosophy = artView.querySelector('.art-philosophy');
        const galleryHeader = artView.querySelector('.art-gallery-section > h3');
        const galleryDesc = artView.querySelector('.art-gallery-section > .section-desc');
        const searchFilters = artView.querySelector('.art-search-filters');

        if (sectionHeader) sectionHeader.style.display = 'none';
        if (artPhilosophy) artPhilosophy.style.display = 'none';
        if (galleryHeader) galleryHeader.style.display = 'none';
        if (galleryDesc) galleryDesc.style.display = 'none';
        if (searchFilters) searchFilters.style.display = 'none';
    }

    // Get artist info if available
    const artistInfo = ARTIST_INFO[artistName] || {
        bio: 'Artista contribuidor de Sorcery: Contested Realm. Suas obras ajudam a dar vida ao mundo único do jogo.',
        links: {}
    };

    // Get all cards by this artist - group by card name, collect all variants
    const cardMap = new Map();

    allCards.forEach(card => {
        if (card.sets) {
            card.sets.forEach(set => {
                if (set.variants) {
                    set.variants.forEach(variant => {
                        if (variant.artist && variant.artist.trim() === artistName) {
                            if (!cardMap.has(card.name)) {
                                cardMap.set(card.name, {
                                    name: card.name,
                                    element: card.elements || 'Neutral',
                                    type: card.type || 'Unknown',
                                    rarity: variant.rarity || card.rarity || 'Ordinary',
                                    image: variant.slug ? `${IMAGE_CDN}${variant.slug}.png` : null,
                                    sets: new Set(),
                                    finishes: new Set()
                                });
                            }
                            const cardData = cardMap.get(card.name);
                            cardData.sets.add(set.name);
                            if (variant.finish) cardData.finishes.add(variant.finish);
                        }
                    });
                }
            });
        }
    });

    // Convert to array
    const artistCards = Array.from(cardMap.values()).map(c => ({
        ...c,
        sets: Array.from(c.sets),
        finishes: Array.from(c.finishes)
    }));

    // Generate initials
    const initials = artistName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const officialUrl = getOfficialArtistUrl(artistName);

    // Build links HTML - prioritize personal links over official profile
    const linkItems = [];
    if (artistInfo.links) {
        if (artistInfo.links.website) linkItems.push(`<a href="${artistInfo.links.website}" target="_blank" class="artist-link"><i data-lucide="globe"></i> Website</a>`);
        if (artistInfo.links.blog) linkItems.push(`<a href="${artistInfo.links.blog}" target="_blank" class="artist-link"><i data-lucide="book-open"></i> Blog</a>`);
        if (artistInfo.links.instagram) linkItems.push(`<a href="${artistInfo.links.instagram}" target="_blank" class="artist-link"><i data-lucide="instagram"></i> Instagram</a>`);
        if (artistInfo.links.twitter) linkItems.push(`<a href="${artistInfo.links.twitter}" target="_blank" class="artist-link"><i data-lucide="twitter"></i> Twitter/X</a>`);
        if (artistInfo.links.facebook) linkItems.push(`<a href="${artistInfo.links.facebook}" target="_blank" class="artist-link"><i data-lucide="facebook"></i> Facebook</a>`);
        if (artistInfo.links.patreon) linkItems.push(`<a href="${artistInfo.links.patreon}" target="_blank" class="artist-link"><i data-lucide="heart"></i> Patreon</a>`);
        if (artistInfo.links.artstation) linkItems.push(`<a href="${artistInfo.links.artstation}" target="_blank" class="artist-link"><i data-lucide="palette"></i> ArtStation</a>`);
    }
    // Add official profile link last
    linkItems.push(`<a href="${officialUrl}" target="_blank" class="artist-link artist-link-official"><i data-lucide="sparkles"></i> Perfil Oficial Sorcery</a>`);
    const linksHtml = `<div class="artist-links">${linkItems.join('')}</div>`;

    // Photo or initials
    const photoHtml = artistInfo.photo
        ? `<img src="${artistInfo.photo}" alt="${artistName}" class="artist-photo-img">`
        : `<span>${initials}</span>`;

    // Render profile: Cards first, artist info at bottom
    container.innerHTML = `
        <div class="artist-profile-view">
            <div class="artist-header-compact">
                <button class="btn-back" onclick="renderArtGallery(artViewData.artists)">
                    <i data-lucide="arrow-left"></i> Voltar
                </button>
                <h2 class="artist-name-header">${artistName}</h2>
                <span class="artist-card-count">${artistCards.length} ilustrações</span>
            </div>

            <div class="artist-cards-grid">
                ${artistCards.map(card => {
                    const totalVariants = card.sets.length * card.finishes.length;
                    return `
                    <div class="artist-card-item" onclick="showCardDetailByName('${card.name.replace(/'/g, "\\'")}')">
                        <div class="card-image-placeholder">
                            ${card.image ? `<img src="${card.image}" alt="${card.name}" loading="lazy">` : `<span>${card.name.substring(0, 2).toUpperCase()}</span>`}
                        </div>
                        <div class="card-info">
                            <h4>${card.name}</h4>
                            <span class="card-type-rarity">${card.type} • <span class="rarity-text rarity-${card.rarity.toLowerCase()}">${card.rarity}</span></span>
                            <div class="card-variants">
                                ${card.sets.map(s => `<span class="variant-badge set-badge">${s}</span>`).join('')}
                            </div>
                            <div class="card-finishes">
                                ${card.finishes.map(f => `<span class="variant-badge finish-badge finish-${f.toLowerCase()}">${f}</span>`).join('')}
                            </div>
                            <span class="variant-count">${totalVariants} ${totalVariants === 1 ? 'versão' : 'versões'}</span>
                        </div>
                    </div>
                `}).join('')}
            </div>

            <div class="artist-bio-section">
                <h3>Sobre o Artista</h3>
                <div class="artist-bio-content">
                    <div class="artist-photo-container">
                        ${photoHtml}
                    </div>
                    <div class="artist-bio-text">
                        <p>${artistInfo.bio}</p>
                        ${linksHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Scroll to top of container
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Helper to show card detail by name
function showCardDetailByName(cardName) {
    openCardModal(cardName);
}

// Legacy function - redirect to art view
function initArtistsView() {
    switchView('art');
}

// Legacy render function (kept for compatibility)
function renderArtistGrid(artists) {
    if (!artists || !artists.length) {
        return '<p class="empty-state">Nenhum artista encontrado</p>';
    }

    return `
        <div class="artists-grid">
            ${artists.map((artist, index) => `
                <div class="artist-card" data-artist="${artist.name}">
                    <div class="artist-avatar">${artist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                    <div class="artist-info">
                        <h4>${artist.name}</h4>
                        <span class="card-count">${artist.cardCount} cards</span>
                    </div>
                    ${index < 3 ? `<span class="rank-badge rank-${index + 1}">#${index + 1}</span>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Initialize Timeline View
function initTimelineView() {
    const container = document.getElementById('timeline-content');
    if (!container || !allCards.length) return;

    if (typeof TimelineTracker !== 'undefined') {
        const tracker = new TimelineTracker();
        const timeline = tracker.getSetTimeline(allCards);
        container.innerHTML = renderTimeline(timeline);
    } else {
        // Fallback simple timeline
        const sets = [...new Set(allCards.flatMap(c => c.sets?.map(s => s.name) || []))];
        container.innerHTML = `
            <div class="timeline-simple">
                ${sets.map(set => `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h4>${set}</h4>
                            <p>${allCards.filter(c => c.sets?.some(s => s.name === set)).length} cards</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Initialize Dust Tracker View
function initDustView() {
    const container = document.getElementById('dust-content');
    if (!container) return;

    if (typeof DustTracker !== 'undefined') {
        const tracker = new DustTracker();
        const stats = tracker.getStats();
        container.innerHTML = renderDustStats(stats);
    } else {
        container.innerHTML = `
            <div class="dust-placeholder">
                <div class="dust-meter-placeholder">
                    <div class="meter-circle">
                        <span class="meter-value">0</span>
                        <span class="meter-label">/ 250</span>
                    </div>
                    <p>Dust este mês</p>
                </div>
                <p class="hint">Adicione seus pontos Dust de eventos do Organized Play</p>
            </div>
        `;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Initialize Promos View
function initPromosView() {
    const container = document.getElementById('promos-content');
    if (!container || !allCards.length) return;

    if (typeof PromoTracker !== 'undefined') {
        const tracker = new PromoTracker();
        const promoCards = tracker.getPromoCards(allCards);
        const stats = tracker.getPromoStats(allCards, collection);
        container.innerHTML = renderPromoStats(stats) + renderPromoGrid(promoCards);

        // Initialize category tabs
        initPromoTabs(tracker);
    } else {
        container.innerHTML = '<p class="empty-state">Carregando tracker de promos...</p>';
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Initialize News View
function initNewsView() {
    if (typeof newsService !== 'undefined') {
        newsService.loadNews().then(() => {
            newsService.renderNewsView();
        });
    } else {
        const container = document.getElementById('news-content');
        if (container) {
            container.innerHTML = '<p class="empty-state">Carregando noticias...</p>';
        }
    }
}

// Initialize promo category tabs
function initPromoTabs(tracker) {
    const tabs = document.querySelectorAll('.promo-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.dataset.category;
            const container = document.getElementById('promos-content');

            let cards;
            if (category === 'all') {
                cards = tracker.getPromoCards(allCards);
            } else {
                cards = tracker.getCardsByCategory(category, allCards);
            }

            const stats = tracker.getPromoStats(allCards, collection);
            container.innerHTML = renderPromoStats(stats) + renderPromoGrid(cards);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });
}

// Render promo grid
function renderPromoGrid(cards) {
    if (!cards || !cards.length) {
        return '<p class="empty-state">Nenhum promo encontrado nesta categoria</p>';
    }

    return `
        <div class="promos-grid">
            ${cards.slice(0, 50).map(card => `
                <div class="promo-card" data-card="${card.name}">
                    <div class="promo-image">
                        <div class="card-placeholder">${card.name[0]}</div>
                    </div>
                    <div class="promo-info">
                        <h4>${card.name}</h4>
                        <span class="promo-category">${card.promoCategory || 'Promo'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Placeholder render functions (will use module functions when available)
function renderDustStats(stats) {
    const current = stats?.thisMonth || 0;
    const cap = stats?.monthlyCap || 250;
    const percentage = Math.min((current / cap) * 100, 100);

    return `
        <div class="dust-dashboard">
            <div class="dust-meter">
                <svg viewBox="0 0 100 100" class="meter-svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-surface-3)" stroke-width="8"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-gold)" stroke-width="8"
                        stroke-dasharray="${percentage * 2.83} 283" stroke-linecap="round"
                        transform="rotate(-90 50 50)"/>
                </svg>
                <div class="meter-text">
                    <span class="meter-value">${current}</span>
                    <span class="meter-cap">/ ${cap}</span>
                </div>
            </div>
            <div class="dust-info">
                <h3>Dust Este Mês</h3>
                <p>Restam <strong>${cap - current}</strong> pontos para o cap mensal</p>
            </div>
            <div class="dust-stats-grid">
                <div class="dust-stat">
                    <span class="stat-value">${stats?.totalDust || 0}</span>
                    <span class="stat-label">Total Lifetime</span>
                </div>
                <div class="dust-stat">
                    <span class="stat-value">${stats?.eventsAttended || 0}</span>
                    <span class="stat-label">Eventos</span>
                </div>
            </div>
        </div>
    `;
}

function renderPromoStats(stats) {
    return `
        <div class="promo-stats-bar">
            <div class="promo-stat">
                <span class="stat-value">${stats?.total || 0}</span>
                <span class="stat-label">Total Promos</span>
            </div>
            <div class="promo-stat">
                <span class="stat-value">${stats?.owned || 0}</span>
                <span class="stat-label">Na Coleção</span>
            </div>
            <div class="promo-stat">
                <span class="stat-value">${stats?.completion || 0}%</span>
                <span class="stat-label">Completo</span>
            </div>
        </div>
    `;
}

// Initialize Codex View
function initCodexView() {
    initCodexNavigation();
    initCodexSearch();
}

// Initialize codex navigation
function initCodexNavigation() {
    const links = document.querySelectorAll('.codex-link');
    const sections = document.querySelectorAll('.codex-section');

    links.forEach(link => {
        link.addEventListener('click', () => {
            const section = link.dataset.section;

            // Update active states
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => {
                s.classList.remove('active');
                if (s.dataset.section === section) {
                    s.classList.add('active');
                }
            });

            // Re-init icons
            if (typeof lucide !== 'undefined') {
                setTimeout(() => lucide.createIcons(), 50);
            }
        });
    });
}

// Initialize codex search
function initCodexSearch() {
    const searchInput = document.getElementById('codex-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const entries = document.querySelectorAll('.codex-entry');

        if (!searchTerm) {
            entries.forEach(entry => entry.style.display = '');
            return;
        }

        entries.forEach(entry => {
            const text = entry.textContent.toLowerCase();
            entry.style.display = text.includes(searchTerm) ? '' : 'none';
        });

        // Show all sections when searching
        if (searchTerm) {
            document.querySelectorAll('.codex-section').forEach(s => s.classList.add('active'));
            document.querySelectorAll('.codex-link').forEach(l => l.classList.remove('active'));
        }
    });
}

// Render Tier List from recommended decks
function renderTierList() {
    if (typeof RECOMMENDED_DECKS === 'undefined') return;

    const tiers = { S: [], A: [], B: [] };

    RECOMMENDED_DECKS.forEach(deck => {
        if (deck.tier && tiers[deck.tier]) {
            tiers[deck.tier].push(deck);
        }
    });

    Object.entries(tiers).forEach(([tier, decks]) => {
        const container = document.getElementById(`tier-${tier.toLowerCase()}-decks`);
        if (!container) return;

        if (decks.length === 0) {
            container.innerHTML = '<span class="tier-empty">Nenhum deck neste tier</span>';
            return;
        }

        container.innerHTML = decks.map(deck => `
            <a href="${deck.url || '#'}" target="_blank" class="tier-deck-card" title="${deck.name}">
                <span class="deck-name">${deck.name}</span>
                <div class="deck-elements">
                    ${(deck.elements || []).map(e => `<span class="element-dot ${e.toLowerCase()}"></span>`).join('')}
                </div>
            </a>
        `).join('');
    });
}

// Apply Filters
function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const setFilter = document.getElementById('set-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const elementFilter = document.getElementById('element-filter').value;
    const rarityFilter = document.getElementById('rarity-filter').value;

    // Get keyword parser instance if available
    const parser = typeof KeywordParser !== 'undefined' ? new KeywordParser() : null;

    filteredCards = allCards.filter(card => {
        // Search
        if (search && !card.name.toLowerCase().includes(search)) return false;

        // Set filter
        if (setFilter) {
            const cardSets = card.sets.map(s => s.name);
            if (!cardSets.includes(setFilter)) return false;
        }

        // Type filter
        if (typeFilter && card.guardian.type !== typeFilter) return false;

        // Element filter
        if (elementFilter) {
            const elements = card.elements || 'None';
            if (!elements.includes(elementFilter)) return false;
        }

        // Rarity filter
        if (rarityFilter && card.guardian.rarity !== rarityFilter) return false;

        // Keyword filter
        if (activeKeywordFilters.size > 0 && parser) {
            const rulesText = card.guardian?.rulesText || '';
            const cardKeywords = parser.parseRulesText(rulesText);
            const cardKeywordNames = cardKeywords.map(k => k.name.toLowerCase());

            // Card must have ALL selected keywords
            for (const keyword of activeKeywordFilters) {
                if (!cardKeywordNames.includes(keyword.toLowerCase())) {
                    return false;
                }
            }
        }

        return true;
    });

    renderCards();
}

// Initialize Keyword Filter
function initKeywordFilter() {
    const searchInput = document.getElementById('keyword-search');
    const dropdown = document.getElementById('keyword-dropdown');

    if (!searchInput || !dropdown) return;

    // Get all unique keywords from cards
    const allKeywords = getAllKeywordsFromCards();

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            dropdown.classList.add('hidden');
            return;
        }

        const matches = allKeywords.filter(k =>
            k.toLowerCase().includes(query) &&
            !activeKeywordFilters.has(k)
        ).slice(0, 10);

        if (matches.length === 0) {
            dropdown.classList.add('hidden');
            return;
        }

        dropdown.innerHTML = matches.map(k => `
            <div class="keyword-option" data-keyword="${k}">
                <span class="keyword-name">${k}</span>
            </div>
        `).join('');

        dropdown.classList.remove('hidden');

        // Add click handlers
        dropdown.querySelectorAll('.keyword-option').forEach(opt => {
            opt.addEventListener('click', () => {
                addKeywordFilter(opt.dataset.keyword);
                searchInput.value = '';
                dropdown.classList.add('hidden');
            });
        });
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.keyword-filter-container')) {
            dropdown.classList.add('hidden');
        }
    });

    // Handle Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const firstOption = dropdown.querySelector('.keyword-option');
            if (firstOption) {
                addKeywordFilter(firstOption.dataset.keyword);
                searchInput.value = '';
                dropdown.classList.add('hidden');
            }
        } else if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
            searchInput.value = '';
        }
    });
}

function getAllKeywordsFromCards() {
    if (typeof KeywordParser === 'undefined' || typeof SORCERY_KEYWORDS === 'undefined') {
        return [];
    }

    // Return all known keywords instead of parsing each card
    return Object.keys(SORCERY_KEYWORDS).sort();
}

function addKeywordFilter(keyword) {
    activeKeywordFilters.add(keyword);
    renderActiveKeywords();
    applyFilters();
}

function removeKeywordFilter(keyword) {
    activeKeywordFilters.delete(keyword);
    renderActiveKeywords();
    applyFilters();
}

function renderActiveKeywords() {
    const container = document.getElementById('active-keywords');
    if (!container) return;

    if (activeKeywordFilters.size === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = Array.from(activeKeywordFilters).map(k => `
        <span class="keyword-tag">
            ${k}
            <button class="remove-keyword" onclick="removeKeywordFilter('${k}')">&times;</button>
        </span>
    `).join('');
}

function clearAllKeywordFilters() {
    activeKeywordFilters.clear();
    renderActiveKeywords();
    applyFilters();
}

// Render Cards
function renderCards() {
    resultsCountEl.textContent = `${filteredCards.length} cards`;

    cardsGridEl.innerHTML = filteredCards.map(card => createCardHTML(card)).join('');

    // Add click listeners
    cardsGridEl.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', () => {
            const cardName = el.dataset.cardName;
            openCardModal(cardName);
        });
    });
}

// Create Card HTML
function createCardHTML(card) {
    const inCollection = collection.has(card.name);
    const inWishlist = wishlist.has(card.name);
    const imageSlug = getCardImageSlug(card);
    const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : '';

    const elementClass = (card.elements || 'None').toLowerCase().split(',')[0].trim();

    return `
        <div class="card-item ${inCollection ? 'in-collection' : ''} ${inWishlist ? 'in-wishlist' : ''}"
             data-card-name="${card.name}">
            <img class="card-image"
                 src="${imageUrl}"
                 alt="${card.name}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 280%22><rect fill=%22%231a1a1f%22 width=%22200%22 height=%22280%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23666%22 text-anchor=%22middle%22 font-size=%2214%22>${card.name}</text></svg>'">
            <div class="card-item-info">
                <div class="card-item-name">${card.name}</div>
                <div class="card-item-meta">
                    <span class="badge ${elementClass}">${card.guardian.type}</span>
                </div>
            </div>
        </div>
    `;
}

// Get card image slug
function getCardImageSlug(card) {
    if (!card.sets || card.sets.length === 0) return null;

    // Prefer Beta, then Alpha, then latest set
    const preferredSets = ['Beta', 'Alpha', 'Gothic', 'Arthurian Legends'];
    let selectedSet = card.sets[0];

    for (const setName of preferredSets) {
        const found = card.sets.find(s => s.name === setName);
        if (found) {
            selectedSet = found;
            break;
        }
    }

    if (selectedSet.variants && selectedSet.variants.length > 0) {
        // Prefer standard finish
        const standard = selectedSet.variants.find(v => v.finish === 'Standard');
        return standard ? standard.slug : selectedSet.variants[0].slug;
    }

    return null;
}

// Get card slug for deep linking
function getCardSlug(card) {
    return getCardImageSlug(card);
}

// Find card by slug (for deep linking)
function findCardBySlug(slug) {
    if (!slug) return null;

    for (const card of allCards) {
        if (!card.sets) continue;

        for (const set of card.sets) {
            if (!set.variants) continue;

            const found = set.variants.find(v => v.slug === slug);
            if (found) {
                return {
                    card: card,
                    variant: found,
                    set: set
                };
            }
        }
    }

    // Try partial match (card name part of slug)
    const slugParts = slug.split('-');
    if (slugParts.length >= 3) {
        // Extract card name (middle parts)
        const cardNameSlug = slugParts.slice(1, -2).join('_');
        const cardNameFormatted = cardNameSlug.replace(/_/g, ' ');

        const card = allCards.find(c =>
            c.name.toLowerCase() === cardNameFormatted.toLowerCase()
        );

        if (card) {
            return { card: card, variant: null, set: null };
        }
    }

    return null;
}

// Handle deep link from URL hash
function handleDeepLink() {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);

    // Check for profile deep link first (via query param)
    const profileToken = urlParams.get('profile') || urlParams.get('u');
    if (profileToken) {
        loadPublicProfile(profileToken);
        return;
    }

    // Handle card deep links (via hash)
    if (hash.startsWith('#card/')) {
        const slug = hash.replace('#card/', '');
        const result = findCardBySlug(slug);

        if (result && result.card) {
            // Open modal without updating hash (already set)
            openCardModal(result.card.name, false);
        }
    }
}

// ============================================
// PUBLIC PROFILE FUNCTIONS
// ============================================

// Load and display a public profile
async function loadPublicProfile(identifier) {
    showView('profile');

    // Show loading state
    const profileName = document.getElementById('public-profile-name');
    const profileBio = document.getElementById('public-profile-bio');
    const profileNotFound = document.getElementById('profile-not-found');
    const statsSections = document.querySelectorAll('.profile-stat-card, .profile-section');

    profileName.textContent = 'Carregando...';
    profileBio.textContent = '';
    profileNotFound.classList.add('hidden');
    statsSections.forEach(s => s.style.display = '');

    try {
        // Fetch the public profile
        const profile = await profileService.getPublicProfile(identifier);

        if (!profile) {
            // Profile not found or private
            profileName.textContent = '';
            profileNotFound.classList.remove('hidden');
            statsSections.forEach(s => s.style.display = 'none');
            lucide.createIcons();
            return;
        }

        // Display profile info
        profileName.textContent = profile.displayName;
        profileBio.textContent = profile.bio || '';

        // Fetch collection data
        const collectionData = await profileService.getPublicCollectionData(profile.userId, profile.privacySettings);

        if (collectionData) {
            // Total cards
            document.getElementById('profile-total-cards').textContent = collectionData.totalCards || 0;

            // Completion percentage
            if (profile.privacySettings.showCompletionStats && collectionData.completionPercent !== undefined) {
                document.getElementById('profile-completion').textContent = collectionData.completionPercent + '%';
                document.getElementById('profile-stat-completion').style.display = '';
            } else {
                document.getElementById('profile-stat-completion').style.display = 'none';
            }

            // Collection value
            if (profile.privacySettings.showCollectionValue && collectionData.totalValue !== undefined) {
                document.getElementById('profile-value').textContent = '$' + collectionData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                document.getElementById('profile-stat-value').style.display = '';
            } else {
                document.getElementById('profile-stat-value').style.display = 'none';
            }

            // Set completion
            if (profile.privacySettings.showCompletionStats && collectionData.setCompletion) {
                document.getElementById('profile-sets-section').style.display = '';
                renderProfileSetProgress(collectionData.setCompletion);
            } else {
                document.getElementById('profile-sets-section').style.display = 'none';
            }

            // Top cards
            if (profile.privacySettings.showTopCards && collectionData.topCards) {
                document.getElementById('profile-top-cards-section').style.display = '';
                renderProfileTopCards(collectionData.topCards);
            } else {
                document.getElementById('profile-top-cards-section').style.display = 'none';
            }
        }

        // Decks count and list
        if (profile.privacySettings.showDeckLists) {
            const decks = await nocoDBService.getPublicDecks(profile.userId);
            document.getElementById('profile-decks-count').textContent = decks.length;
            document.getElementById('profile-stat-decks').style.display = '';
            document.getElementById('profile-decks-section').style.display = '';
            renderProfileDecks(decks);
        } else {
            document.getElementById('profile-stat-decks').style.display = 'none';
            document.getElementById('profile-decks-section').style.display = 'none';
        }

        lucide.createIcons();

    } catch (error) {
        console.error('[Profile] Error loading public profile:', error);
        profileName.textContent = '';
        profileNotFound.classList.remove('hidden');
        statsSections.forEach(s => s.style.display = 'none');
        lucide.createIcons();
    }
}

// Render set progress for public profile
function renderProfileSetProgress(setCompletion) {
    const container = document.getElementById('profile-sets-progress');
    container.innerHTML = '';

    for (const [setName, data] of Object.entries(setCompletion)) {
        const item = document.createElement('div');
        item.className = 'set-progress-item';
        item.innerHTML = `
            <div class="set-name">${setName}</div>
            <div class="set-progress-bar">
                <div class="progress-fill" style="width: ${data.percent}%"></div>
            </div>
            <div class="set-progress-stats">
                <span>${data.owned}/${data.total}</span>
                <span>${data.percent}%</span>
            </div>
        `;
        container.appendChild(item);
    }
}

// Render top cards for public profile
function renderProfileTopCards(topCards) {
    const container = document.getElementById('profile-top-cards');
    container.innerHTML = '';

    topCards.slice(0, 10).forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'top-card-item';
        item.onclick = () => openCardModal(card.name);
        item.innerHTML = `
            <span class="top-card-rank">${index + 1}</span>
            <div class="top-card-info">
                <span class="top-card-name">${card.name}</span>
            </div>
            <span class="top-card-value">$${card.value.toFixed(2)}</span>
        `;
        container.appendChild(item);
    });

    if (topCards.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Nenhum card com valor registrado</p>';
    }
}

// Render public decks for public profile
function renderProfileDecks(decks) {
    const container = document.getElementById('profile-public-decks');
    container.innerHTML = '';

    if (decks.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Nenhum deck público</p>';
        return;
    }

    decks.forEach(deck => {
        const cards = JSON.parse(deck.cards_json || '[]');
        const item = document.createElement('div');
        item.className = 'public-deck-card';
        item.innerHTML = `
            <div class="public-deck-header">
                <span class="public-deck-avatar">${deck.avatar || '🎴'}</span>
                <span class="public-deck-name">${deck.deck_name}</span>
            </div>
            <div class="public-deck-stats">
                <span>${cards.length} cards</span>
            </div>
        `;
        container.appendChild(item);
    });
}

// ============================================
// PROFILE SETTINGS MODAL
// ============================================

// Open profile settings modal
function openProfileSettings() {
    if (!nocoDBService.isLoggedIn()) {
        alert('Você precisa estar logado para configurar seu perfil.');
        return;
    }

    const modal = document.getElementById('profile-modal');
    const profile = profileService.getProfile();

    if (profile) {
        // Fill in current values
        document.getElementById('profile-display-name').value = profile.displayName || '';
        document.getElementById('profile-bio').value = profile.bio || '';
        document.getElementById('bio-char-count').textContent = (profile.bio || '').length;
        document.getElementById('profile-is-public').checked = profile.isPublic || false;
        document.getElementById('profile-show-value').checked = profile.privacySettings?.showCollectionValue ?? true;
        document.getElementById('profile-show-completion').checked = profile.privacySettings?.showCompletionStats ?? true;
        document.getElementById('profile-show-top-cards').checked = profile.privacySettings?.showTopCards ?? true;
        document.getElementById('profile-show-decks').checked = profile.privacySettings?.showDeckLists ?? false;

        // Set share URL
        const shareUrl = profileService.getShareUrl();
        document.getElementById('profile-share-url').value = shareUrl || '';
        document.getElementById('profile-share-section').style.display = profile.isPublic ? '' : 'none';
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// Save profile settings
async function saveProfileSettings() {
    const displayName = document.getElementById('profile-display-name').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const isPublic = document.getElementById('profile-is-public').checked;

    const privacySettings = {
        showCollectionValue: document.getElementById('profile-show-value').checked,
        showCompletionStats: document.getElementById('profile-show-completion').checked,
        showTopCards: document.getElementById('profile-show-top-cards').checked,
        showDeckLists: document.getElementById('profile-show-decks').checked
    };

    profileService.updateProfile({
        displayName: displayName,
        bio: bio,
        isPublic: isPublic
    });

    profileService.updatePrivacy(privacySettings);

    // Sync to cloud
    const synced = await profileService.syncProfileToCloud();
    if (synced) {
        console.log('[Profile] Settings synced to cloud');
    }

    // Update share URL visibility
    document.getElementById('profile-share-section').style.display = isPublic ? '' : 'none';
    document.getElementById('profile-share-url').value = profileService.getShareUrl() || '';

    // Show success feedback
    const btn = document.getElementById('save-profile-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="check"></i> Salvo!';
    btn.style.background = 'var(--success)';
    lucide.createIcons();

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        lucide.createIcons();
    }, 2000);
}

// Copy profile share URL
async function copyProfileUrl() {
    const success = await profileService.copyShareUrl();
    const btn = document.getElementById('copy-profile-url');

    if (success) {
        btn.innerHTML = '<i data-lucide="check"></i>';
        lucide.createIcons();
        setTimeout(() => {
            btn.innerHTML = '<i data-lucide="copy"></i>';
            lucide.createIcons();
        }, 2000);
    }
}

// Generate shareable URL for a card
function getCardShareURL(cardName) {
    const card = allCards.find(c => c.name === cardName);
    if (!card) return null;

    const slug = getCardSlug(card);
    if (!slug) return null;

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#card/${slug}`;
}

// Copy card share link to clipboard
async function copyCardShareLink(cardName) {
    const url = getCardShareURL(cardName);
    if (!url) {
        console.error('Could not generate share URL for', cardName);
        return false;
    }

    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

// Generate QR code URL for a card
function getCardQRCodeURL(cardName, size = 150) {
    const shareURL = getCardShareURL(cardName);
    if (!shareURL) return null;

    // Using QR Server API (free, no key required)
    const encodedURL = encodeURIComponent(shareURL);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedURL}&bgcolor=ffffff&color=000000&margin=10`;
}

// Update price table currency
function updatePriceTableCurrency(cardName, cardData, currency) {
    if (typeof tcgPriceService === 'undefined') return;

    const priceData = tcgPriceService.getCardPrices(cardName, cardData);
    const sets = Object.keys(priceData.prices);

    sets.forEach(setName => {
        const setPrices = priceData.prices[setName];

        ['Standard', 'Foil', 'Rainbow'].forEach(finish => {
            if (setPrices[finish]) {
                const p = setPrices[finish];
                const row = document.querySelector(`.finish-row.${finish.toLowerCase()}`);
                if (row) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 4) {
                        cells[1].textContent = tcgPriceService.formatPrice(p.min, currency);
                        cells[2].textContent = tcgPriceService.formatPrice(p.mid, currency);
                        cells[3].textContent = tcgPriceService.formatPrice(p.max, currency);
                    }
                }
            }
        });
    });
}

// Toggle QR code display
function toggleQRCode(cardName) {
    const container = document.getElementById('qr-code-container');
    const img = document.getElementById('qr-code-image');

    if (!container || !img) return;

    if (container.classList.contains('hidden')) {
        const qrURL = getCardQRCodeURL(cardName);
        if (qrURL) {
            img.src = qrURL;
            container.classList.remove('hidden');
        }
    } else {
        container.classList.add('hidden');
    }
}

// Open Card Modal
function openCardModal(cardName, updateHash = true) {
    const card = allCards.find(c => c.name === cardName);
    if (!card) return;

    // Update URL hash for deep linking
    if (updateHash) {
        const slug = getCardSlug(card);
        if (slug) {
            history.pushState(null, '', `#card/${slug}`);
        }
    }

    const imageSlug = getCardImageSlug(card);
    const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : '';

    document.getElementById('modal-card-image').src = imageUrl;
    document.getElementById('modal-card-name').textContent = card.name;
    document.getElementById('modal-card-type').textContent = card.guardian.type;
    document.getElementById('modal-card-type').className = 'badge';
    document.getElementById('modal-card-rarity').textContent = card.guardian.rarity;
    document.getElementById('modal-card-rarity').className = `badge ${card.guardian.rarity?.toLowerCase()}`;

    const element = (card.elements || 'None').split(',')[0].trim();
    document.getElementById('modal-card-element').textContent = element;
    document.getElementById('modal-card-element').className = `badge ${element.toLowerCase()}`;

    // Stats
    const cost = card.guardian.cost !== null ? `Cost: ${card.guardian.cost}` : '';
    const attack = card.guardian.attack !== null ? `ATK: ${card.guardian.attack}` : '';
    const defence = card.guardian.defence !== null ? `DEF: ${card.guardian.defence}` : '';

    document.getElementById('modal-card-cost').textContent = cost;
    document.getElementById('modal-card-attack').textContent = attack;
    document.getElementById('modal-card-defence').textContent = defence;

    // Rules text
    const rulesText = card.guardian.rulesText || 'No rules text.';
    document.getElementById('modal-card-rules').textContent = rulesText.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');

    // Sets
    const setsHTML = card.sets.map(s => `<span class="badge">${s.name}</span>`).join(' ');
    document.getElementById('modal-card-sets').innerHTML = setsHTML;

    // Artist info
    const artistSection = document.getElementById('modal-artist-section');
    const artistLink = document.getElementById('modal-artist-link');
    const artistNameSpan = document.getElementById('modal-artist-name');

    // Get artist from card variants
    let artistName = null;
    if (card.sets && card.sets.length > 0) {
        for (const set of card.sets) {
            if (set.cards && set.cards.length > 0) {
                for (const variant of set.cards) {
                    if (variant.artist) {
                        artistName = variant.artist;
                        break;
                    }
                }
            }
            if (artistName) break;
        }
    }

    if (artistName && artistSection && artistLink && artistNameSpan) {
        artistSection.style.display = 'block';
        artistNameSpan.textContent = artistName;
        artistLink.onclick = (e) => {
            e.preventDefault();
            closeCardModal();
            switchView('art');
            setTimeout(() => {
                if (typeof showArtistCards === 'function') {
                    showArtistCards(artistName);
                }
            }, 100);
        };
    } else if (artistSection) {
        artistSection.style.display = 'none';
    }

    // Price information - Use new TCG Price Service
    const priceTableContainer = document.getElementById('modal-price-table');
    if (priceTableContainer && typeof tcgPriceService !== 'undefined') {
        priceTableContainer.innerHTML = tcgPriceService.generatePriceTableHTML(card.name, card);

        // Setup currency toggle
        const currencyBtns = priceTableContainer.querySelectorAll('.currency-btn');
        const rateInfo = document.getElementById('brl-rate-info');
        const rateSpan = document.getElementById('current-brl-rate');

        currencyBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const currency = btn.dataset.currency;

                // Se for BRL, buscar cotação atual
                if (currency === 'BRL') {
                    btn.textContent = 'BRL...';
                    btn.disabled = true;

                    try {
                        const rate = await tcgPriceService.fetchCurrentBRLRate();
                        btn.textContent = `BRL (${rate.toFixed(2)})`;
                        if (rateSpan) rateSpan.textContent = rate.toFixed(2);
                        if (rateInfo) rateInfo.style.display = 'inline';
                    } catch (e) {
                        btn.textContent = 'BRL';
                    } finally {
                        btn.disabled = false;
                    }
                } else {
                    // Voltar para USD
                    if (rateInfo) rateInfo.style.display = 'none';
                }

                currencyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updatePriceTableCurrency(card.name, card, currency);
            });
        });
    }

    // Update button states
    const collectionBtn = document.getElementById('add-to-collection-btn');
    const wishlistBtn = document.getElementById('add-to-wishlist-btn');
    const tradeBtn = document.getElementById('add-to-trade-btn');

    if (collection.has(cardName)) {
        collectionBtn.innerHTML = '<span class="icon">✓</span> In Collection';
        collectionBtn.classList.add('in-collection');
    } else {
        collectionBtn.innerHTML = '<span class="icon">+</span> Add to Collection';
        collectionBtn.classList.remove('in-collection');
    }

    if (wishlist.has(cardName)) {
        wishlistBtn.innerHTML = '<span class="icon">✓</span> In Wishlist';
        wishlistBtn.classList.add('in-wishlist');
    } else {
        wishlistBtn.innerHTML = '<span class="icon">♥</span> Add to Wishlist';
        wishlistBtn.classList.remove('in-wishlist');
    }

    if (tradeBtn) {
        if (tradeBinder.has(cardName)) {
            tradeBtn.innerHTML = '<span class="icon">✓</span> In Trade Binder';
            tradeBtn.classList.add('in-trade');
        } else {
            tradeBtn.innerHTML = '<span class="icon">↔</span> Add to Trade';
            tradeBtn.classList.remove('in-trade');
        }
    }

    // Render variant selector
    renderVariantSelector(card);

    // Highlight keywords in rules text
    highlightKeywordsInModal(card);

    // Hide QR code from previous card
    document.getElementById('qr-code-container')?.classList.add('hidden');

    cardModal.classList.remove('hidden');
}

// Close Modal
function closeModal() {
    cardModal.classList.add('hidden');
    document.getElementById('deck-builder-modal')?.classList.add('hidden');

    // Clear URL hash if it's a card deep link
    if (window.location.hash.startsWith('#card/')) {
        history.pushState(null, '', window.location.pathname);
    }
}

// Alias for closeModal (used by some onclick handlers)
function closeCardModal() {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    // Clear URL hash if it's a card deep link
    if (window.location.hash.startsWith('#card/')) {
        history.pushState(null, '', window.location.pathname);
    }
}
window.closeCardModal = closeCardModal;

// Render Variant Selector in Modal
function renderVariantSelector(card) {
    const variantList = document.getElementById('variant-list');
    const ownedList = document.getElementById('owned-list');
    const variantSelector = document.getElementById('variant-selector');

    if (!variantList || !card.sets) return;

    // Get all variants from all sets
    const allVariants = [];
    card.sets.forEach(set => {
        if (set.variants) {
            set.variants.forEach(v => {
                allVariants.push({
                    ...v,
                    setName: set.name
                });
            });
        }
    });

    // Group by finish
    const variantsByFinish = {
        Standard: allVariants.filter(v => v.finish === 'Standard'),
        Foil: allVariants.filter(v => v.finish === 'Foil'),
        Rainbow: allVariants.filter(v => v.finish === 'Rainbow')
    };

    // Render variant list (default to Standard)
    renderVariantList('Standard', variantsByFinish, card.name);

    // Setup tab handlers
    const tabs = document.querySelectorAll('.variant-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderVariantList(tab.dataset.finish, variantsByFinish, card.name);
        };
    });

    // Render owned variants
    if (typeof VariantTracker !== 'undefined') {
        const tracker = new VariantTracker();
        const owned = tracker.getCollectionByCard(card.name);

        if (owned && owned.variants && Object.keys(owned.variants).length > 0) {
            ownedList.innerHTML = Object.entries(owned.variants).map(([slug, data]) => `
                <div class="owned-variant-item">
                    <span class="variant-finish ${data.finish?.toLowerCase() || 'standard'}">${data.finish || 'Standard'}</span>
                    <span class="variant-set">${data.set || 'Unknown'}</span>
                    <span class="variant-qty">x${data.qty || 1}</span>
                    <button class="btn-remove-variant" onclick="removeVariantFromCollection('${card.name}', '${slug}')">
                        <i data-lucide="minus"></i>
                    </button>
                </div>
            `).join('');
            document.getElementById('owned-variants').style.display = 'block';
        } else {
            ownedList.innerHTML = '<span class="empty-text">Nenhuma variante na coleção</span>';
            document.getElementById('owned-variants').style.display = 'block';
        }
    }

    // Show variant selector
    variantSelector.style.display = 'block';

    // Re-init Lucide
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Render variant list by finish type
function renderVariantList(finish, variantsByFinish, cardName) {
    const variantList = document.getElementById('variant-list');
    const variants = variantsByFinish[finish] || [];

    if (variants.length === 0) {
        variantList.innerHTML = '<span class="empty-text">Nenhuma variante disponível</span>';
        return;
    }

    variantList.innerHTML = variants.map(v => `
        <div class="variant-item" data-slug="${v.slug}">
            <div class="variant-info">
                <span class="variant-set">${v.setName}</span>
                <span class="variant-product">${(v.product || 'Booster').replace(/_/g, ' ')}</span>
            </div>
            <button class="btn-add-variant" onclick="addVariantToCollection('${cardName}', '${v.slug}', '${finish}')">
                <i data-lucide="plus"></i>
            </button>
        </div>
    `).join('');

    // Re-init Lucide
    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Add variant to collection
function addVariantToCollection(cardName, slug, finish) {
    // Check if user is logged in
    if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
        showNotification('Faça login para adicionar cards à coleção');
        openAuthModal('login');
        return;
    }

    if (typeof VariantTracker !== 'undefined') {
        const tracker = new VariantTracker();
        tracker.addToCollection(cardName, slug, finish, 1);

        // Also add to legacy collection for compatibility
        collection.add(cardName);
        saveToStorage();

        // Refresh modal
        const card = allCards.find(c => c.name === cardName);
        if (card) renderVariantSelector(card);

        // Show feedback
        showToast(`${finish} adicionado à coleção!`);
    }
}

// Remove variant from collection
function removeVariantFromCollection(cardName, slug) {
    if (typeof VariantTracker !== 'undefined') {
        const tracker = new VariantTracker();
        tracker.removeFromCollection(cardName, slug, 1);

        // Check if any variants remain
        const remaining = tracker.getCollectionByCard(cardName);
        if (!remaining || !remaining.variants || Object.keys(remaining.variants).length === 0) {
            collection.delete(cardName);
            saveToStorage();
        }

        // Refresh modal
        const card = allCards.find(c => c.name === cardName);
        if (card) renderVariantSelector(card);

        showToast('Variante removida');
    }
}

// Show toast notification
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Highlight keywords in modal
function highlightKeywordsInModal(card) {
    const rulesEl = document.getElementById('modal-card-rules');
    if (!rulesEl || !card.guardian?.rulesText) return;

    if (typeof KeywordParser !== 'undefined') {
        const parser = new KeywordParser();
        const highlighted = parser.highlightKeywords(card.guardian.rulesText, {
            className: 'keyword-highlight',
            tooltip: true
        });
        rulesEl.innerHTML = highlighted;
    }
}

// Toggle Set Progress Section
let setProgressExpanded = false;

function toggleSetProgress() {
    setProgressExpanded = !setProgressExpanded;
    const section = document.getElementById('set-progress-section');
    const content = document.getElementById('set-progress-content');
    const icon = section?.querySelector('.toggle-icon');

    if (section) {
        section.classList.toggle('expanded', setProgressExpanded);
    }
    if (icon) {
        icon.style.transform = setProgressExpanded ? 'rotate(180deg)' : 'rotate(0)';
    }
    if (content && setProgressExpanded) {
        renderSetProgressSection();
    }
}

function renderSetProgressSection() {
    const content = document.getElementById('set-progress-content');
    if (!content) return;

    // Check if SetProgressTracker is available
    if (typeof SetProgressTracker === 'undefined') {
        content.innerHTML = '<p class="text-secondary">Set Progress module not loaded.</p>';
        return;
    }

    const tracker = new SetProgressTracker();
    const sets = ['Alpha', 'Beta', 'Arthurian Legends', 'Gothic', 'Dragonlord'];

    // Convert collection Set to array for the tracker
    const collectionArray = Array.from(collection);

    let html = '<div class="set-progress-grid">';

    sets.forEach(setName => {
        const progress = tracker.calculateSetProgress(allCards, collectionArray, setName);
        const percent = progress.total > 0 ? Math.round((progress.owned / progress.total) * 100) : 0;

        // Determine color based on percentage
        let colorClass = 'default';
        if (percent >= 100) colorClass = 'complete';
        else if (percent >= 75) colorClass = 'high';
        else if (percent >= 50) colorClass = 'medium';
        else if (percent >= 25) colorClass = 'low';

        html += `
            <div class="set-progress-card" data-set="${setName}">
                <div class="set-progress-header">
                    <h4>${setName}</h4>
                    <span class="set-percent ${colorClass}">${percent}%</span>
                </div>
                <div class="set-progress-bar">
                    <div class="set-progress-fill ${colorClass}" style="width: ${percent}%"></div>
                </div>
                <div class="set-progress-stats">
                    <span class="owned-count">${progress.owned}/${progress.total} cards</span>
                </div>
                <div class="set-rarity-breakdown">
                    ${renderRarityBreakdown(progress.byRarity)}
                </div>
                <button class="btn-small btn-outline" onclick="showMissingCards('${setName}')">
                    <i data-lucide="list"></i> Missing (${progress.total - progress.owned})
                </button>
            </div>
        `;
    });

    html += '</div>';

    // Add achievements section
    const achievements = tracker.getAchievements(allCards, collectionArray);
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    if (unlockedCount > 0) {
        html += `
            <div class="achievements-section">
                <h4><i data-lucide="trophy"></i> Achievements (${unlockedCount}/${achievements.length})</h4>
                <div class="achievements-grid">
                    ${achievements.filter(a => a.unlocked).map(a => `
                        <div class="achievement-badge unlocked">
                            <span class="achievement-icon">${a.icon}</span>
                            <span class="achievement-name">${a.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    content.innerHTML = html;

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderRarityBreakdown(byRarity) {
    if (!byRarity) return '';

    const rarities = ['Ordinary', 'Exceptional', 'Elite', 'Unique'];
    return rarities.map(rarity => {
        const data = byRarity[rarity] || { owned: 0, total: 0 };
        const percent = data.total > 0 ? Math.round((data.owned / data.total) * 100) : 0;
        const rarityClass = rarity.toLowerCase();

        return `
            <div class="rarity-item ${rarityClass}">
                <span class="rarity-name">${rarity.charAt(0)}</span>
                <div class="rarity-bar">
                    <div class="rarity-fill" style="width: ${percent}%"></div>
                </div>
                <span class="rarity-count">${data.owned}/${data.total}</span>
            </div>
        `;
    }).join('');
}

function showMissingCards(setName) {
    if (typeof SetProgressTracker === 'undefined') return;

    const tracker = new SetProgressTracker();
    const collectionArray = Array.from(collection);
    const missing = tracker.getMissingCards(allCards, collectionArray, setName);

    // Create modal content
    const modal = document.getElementById('card-modal');
    const modalContent = modal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeCardModal()">&times;</button>
        <div class="missing-cards-modal">
            <h2><i data-lucide="list"></i> Missing Cards - ${setName}</h2>
            <p class="text-secondary">${missing.length} cards missing from your collection</p>

            <div class="missing-cards-filters">
                <select id="missing-rarity-filter" onchange="filterMissingCards('${setName}')">
                    <option value="">All Rarities</option>
                    <option value="Ordinary">Ordinary</option>
                    <option value="Exceptional">Exceptional</option>
                    <option value="Elite">Elite</option>
                    <option value="Unique">Unique</option>
                </select>
            </div>

            <div class="missing-cards-list" id="missing-cards-list">
                ${renderMissingCardsList(missing)}
            </div>
        </div>
    `;

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderMissingCardsList(cards) {
    if (cards.length === 0) {
        return '<p class="text-secondary">No missing cards!</p>';
    }

    return cards.map(card => {
        const rarity = card.guardian?.rarity || 'Unknown';
        const rarityClass = rarity.toLowerCase();

        return `
            <div class="missing-card-item" onclick="openCardModal('${card.name.replace(/'/g, "\\'")}')">
                <span class="missing-card-name">${card.name}</span>
                <span class="rarity-badge ${rarityClass}">${rarity}</span>
            </div>
        `;
    }).join('');
}

function filterMissingCards(setName) {
    const rarity = document.getElementById('missing-rarity-filter')?.value;

    if (typeof SetProgressTracker === 'undefined') return;

    const tracker = new SetProgressTracker();
    const collectionArray = Array.from(collection);
    let missing = tracker.getMissingCards(allCards, collectionArray, setName);

    if (rarity) {
        missing = missing.filter(c => c.guardian?.rarity === rarity);
    }

    const list = document.getElementById('missing-cards-list');
    if (list) {
        list.innerHTML = renderMissingCardsList(missing);
    }
}

// Toggle Collection
function toggleCollection(cardName) {
    // Check login for adding (not for removing)
    if (!collection.has(cardName)) {
        if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
            showNotification('Faça login para adicionar cards à coleção');
            openAuthModal('login');
            return;
        }
    }

    if (collection.has(cardName)) {
        collection.delete(cardName);
    } else {
        collection.add(cardName);
        wishlist.delete(cardName); // Remove from wishlist if added to collection
    }
    saveToStorage();
    renderCards();
    openCardModal(cardName); // Refresh modal
}

// Toggle Wishlist
function toggleWishlist(cardName) {
    // Check login for adding (not for removing)
    if (!wishlist.has(cardName)) {
        if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
            showNotification('Faça login para adicionar cards à wishlist');
            openAuthModal('login');
            return;
        }
    }

    if (wishlist.has(cardName)) {
        wishlist.delete(cardName);
    } else {
        wishlist.add(cardName);
    }
    saveToStorage();
    renderCards();
    openCardModal(cardName); // Refresh modal
}

// Handle Precon Change
function handlePreconChange(event) {
    const checkbox = event.target;
    const preconId = checkbox.id.replace('precon-', '');

    if (checkbox.checked) {
        ownedPrecons.add(preconId);
        // Add precon cards to collection
        const precon = PRECONS[preconId];
        if (precon) {
            precon.cards.forEach(card => {
                collection.add(card.name);
            });
        }
    } else {
        ownedPrecons.delete(preconId);
        // Note: We don't remove cards from collection when unchecking
        // as user might have those cards from other sources
    }

    saveToStorage();
    updateStats();
}

// Render Collection
function renderCollection() {
    const search = document.getElementById('collection-search')?.value.toLowerCase() || '';
    const setFilter = document.getElementById('collection-set-filter')?.value || '';
    const finishFilter = document.getElementById('collection-finish-filter')?.value || '';

    // Get variant tracker if available
    const variantTracker = window.variantTracker || (typeof VariantTracker !== 'undefined' ? new VariantTracker() : null);

    let collectionCards = allCards.filter(card => {
        if (!collection.has(card.name)) return false;
        if (search && !card.name.toLowerCase().includes(search)) return false;

        // Filter by set
        if (setFilter) {
            const hasSet = card.sets?.some(s => s.name === setFilter);
            if (!hasSet) return false;
        }

        return true;
    });

    // Filter by finish using variant tracker
    if (finishFilter && variantTracker) {
        collectionCards = collectionCards.filter(card => {
            const cardVariants = variantTracker.getCollectionByCard(card.name);
            if (!cardVariants) {
                // If no variant data, show all for Standard filter
                return finishFilter === 'Standard';
            }
            // Check if any owned variant has the selected finish
            return Object.values(cardVariants.variants).some(v => v.finish === finishFilter);
        });
    }

    // Update count display
    const totalInCollection = collection.size;
    const filteredCount = collectionCards.length;
    const countText = (setFilter || finishFilter)
        ? `${filteredCount} / ${totalInCollection}`
        : totalInCollection;
    document.getElementById('collection-count').textContent = countText;

    if (collectionCards.length === 0) {
        const filterMessage = (setFilter || finishFilter)
            ? 'No cards match the current filters.'
            : 'Add cards from the Cards view or mark your precons.';
        collectionGridEl.innerHTML = `
            <div class="empty-state">
                <h3>No cards in collection</h3>
                <p>${filterMessage}</p>
            </div>
        `;
        return;
    }

    // Add finish badge to cards if filtering by finish
    collectionGridEl.innerHTML = collectionCards.map(card => {
        let html = createCardHTML(card);

        // Add finish badge if we're filtering
        if (finishFilter && variantTracker) {
            const cardVariants = variantTracker.getCollectionByCard(card.name);
            if (cardVariants) {
                const matchingVariants = Object.values(cardVariants.variants)
                    .filter(v => v.finish === finishFilter);
                const totalQty = matchingVariants.reduce((sum, v) => sum + v.qty, 0);

                if (totalQty > 0) {
                    const badgeColor = getFinishBadgeColor(finishFilter);
                    const badgeStyle = badgeColor.gradient
                        ? `background: ${badgeColor.gradient}; color: ${badgeColor.text};`
                        : `background: ${badgeColor.background}; color: ${badgeColor.text};`;

                    // Insert badge as direct child of card-item (before final closing </div>)
                    // Card structure: <div class="card-item">...<div class="card-item-info">...</div></div>
                    html = html.replace(
                        /<\/div>\s*<\/div>\s*<\/div>\s*$/,
                        `</div></div><span class="finish-badge" style="${badgeStyle}">${finishFilter} x${totalQty}</span></div>`
                    );
                }
            }
        }

        return html;
    }).join('');

    collectionGridEl.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', () => {
            const cardName = el.dataset.cardName;
            openCardModal(cardName);
        });
    });
}

// Render Wishlist
function renderWishlist() {
    const wishlistCards = allCards.filter(card => wishlist.has(card.name));

    document.getElementById('wishlist-count').textContent = `${wishlist.size} cards`;

    if (wishlistCards.length === 0) {
        wishlistGridEl.innerHTML = `
            <div class="empty-state">
                <h3>Wishlist is empty</h3>
                <p>Add cards you want from the Cards view.</p>
            </div>
        `;
        return;
    }

    wishlistGridEl.innerHTML = wishlistCards.map(card => createCardHTML(card)).join('');

    wishlistGridEl.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', () => {
            const cardName = el.dataset.cardName;
            openCardModal(cardName);
        });
    });
}

// Update Stats
function updateStats() {
    const totalCards = allCards.length;
    const collectedCount = collection.size;
    const completion = totalCards > 0 ? ((collectedCount / totalCards) * 100).toFixed(1) : 0;
    const preconsOwned = ownedPrecons.size;

    document.getElementById('stat-total').textContent = collectedCount;
    document.getElementById('stat-completion').textContent = `${completion}%`;
    document.getElementById('stat-precons').textContent = `${preconsOwned}/8`;
    document.getElementById('stat-wishlist').textContent = wishlist.size;

    // Set progress
    const sets = ['Alpha', 'Beta', 'Arthurian Legends', 'Gothic', 'Dragonlord', 'Promotional'];
    const setProgressEl = document.getElementById('set-progress');

    if (setProgressEl) {
        setProgressEl.innerHTML = sets.map(setName => {
            const setCards = allCards.filter(c => c.sets.some(s => s.name === setName));
            const ownedInSet = setCards.filter(c => collection.has(c.name)).length;
            const percent = setCards.length > 0 ? ((ownedInSet / setCards.length) * 100).toFixed(0) : 0;

            return `
                <div class="progress-item">
                    <span class="progress-label">${setName}</span>
                    <div class="progress-bar">
                        <div class="progress-fill default" style="width: ${percent}%"></div>
                    </div>
                    <span class="progress-text">${ownedInSet}/${setCards.length}</span>
                </div>
            `;
        }).join('');
    }

    // Element progress
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    const elementProgressEl = document.getElementById('element-progress');

    if (elementProgressEl) {
        elementProgressEl.innerHTML = elements.map(element => {
            const elementCards = allCards.filter(c => (c.elements || '').includes(element));
            const ownedInElement = elementCards.filter(c => collection.has(c.name)).length;
            const percent = elementCards.length > 0 ? ((ownedInElement / elementCards.length) * 100).toFixed(0) : 0;

            return `
                <div class="progress-item">
                    <span class="progress-label">${element}</span>
                    <div class="progress-bar">
                        <div class="progress-fill ${element.toLowerCase()}" style="width: ${percent}%"></div>
                    </div>
                    <span class="progress-text">${ownedInElement}/${elementCards.length}</span>
                </div>
            `;
        }).join('');
    }
}

// Render Decks
function renderDecks() {
    const decksListEl = document.getElementById('decks-list');

    if (decks.length === 0) {
        decksListEl.innerHTML = `
            <div class="empty-state">
                <h3>No decks yet</h3>
                <p>Create your first deck to get started!</p>
            </div>
        `;
        return;
    }

    decksListEl.innerHTML = decks.map((deck, index) => {
        // Calculate deck value
        let deckValue = 0;
        let cardsOwned = 0;
        let totalCards = 0;

        const allDeckCards = [...(deck.spellbook || []), ...(deck.atlas || [])];
        allDeckCards.forEach(cardEntry => {
            const qty = cardEntry.qty || 1;
            totalCards += qty;
            const card = allCards.find(c => c.name === cardEntry.name);
            if (card && typeof priceService !== 'undefined') {
                const price = priceService.getPrice(card.name) || priceService.getEstimatedPrice(card);
                deckValue += price * qty;
            }
            if (collection.has(cardEntry.name)) {
                cardsOwned += qty;
            }
        });

        const valueDisplay = typeof priceService !== 'undefined'
            ? priceService.formatPrice(deckValue)
            : '--';

        return `
            <div class="deck-card" data-deck-index="${index}">
                <h3>${deck.name}</h3>
                <div class="deck-card-meta">
                    ${deck.spellbook?.length || 0} spells / ${deck.atlas?.length || 0} sites
                </div>
                <div class="deck-value">
                    <span class="deck-value-label">Value:</span>
                    <span class="deck-value-amount">${valueDisplay}</span>
                </div>
                <div class="deck-ownership">
                    <span>Owned: ${cardsOwned}/${totalCards}</span>
                    <div class="mini-progress">
                        <div class="mini-progress-fill" style="width: ${totalCards > 0 ? (cardsOwned/totalCards)*100 : 0}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers for decks
    decksListEl.querySelectorAll('.deck-card').forEach(el => {
        el.addEventListener('click', () => {
            const index = parseInt(el.dataset.deckIndex);
            viewDeck(index);
        });
    });
}

// Open Deck Builder
function openDeckBuilder() {
    document.getElementById('deck-builder-modal').classList.remove('hidden');
}

// Close Deck Builder
function closeDeckBuilder() {
    document.getElementById('deck-builder-modal').classList.add('hidden');
    // Clear the builder
    document.getElementById('deck-name-input').value = '';
    document.getElementById('deck-spellbook').innerHTML = '';
    document.getElementById('deck-atlas').innerHTML = '';
    document.getElementById('spellbook-count').textContent = '0';
    document.getElementById('atlas-count').textContent = '0';
    document.getElementById('deck-total-value').textContent = '$0.00';
}

// Save Deck from Builder
function saveDeckFromBuilder() {
    const deck = getCurrentDeckFromBuilder();

    if (!deck.name || deck.name === 'Untitled') {
        alert('Por favor, dê um nome ao seu deck.');
        return;
    }

    if (deck.spellbook.length === 0 && deck.atlas.length === 0) {
        alert('Seu deck está vazio. Adicione algumas cartas primeiro.');
        return;
    }

    // Check if we're editing an existing deck
    const existingIndex = decks.findIndex(d => d.name === deck.name);

    if (existingIndex >= 0) {
        decks[existingIndex] = deck;
    } else {
        decks.push(deck);
    }

    // Save to localStorage
    saveLocalData();

    // Close modal and refresh deck list
    closeDeckBuilder();
    renderDecks();

    // Show success message
    console.log('[Decks] Deck saved:', deck.name);
}

// View Deck Details
function viewDeck(index) {
    const deck = decks[index];
    if (!deck) return;

    // Open deck builder with deck loaded
    document.getElementById('deck-name-input').value = deck.name;
    document.getElementById('deck-builder-modal').classList.remove('hidden');

    // Populate deck cards
    renderDeckCards(deck);
}

// Render Deck Cards in Builder
function renderDeckCards(deck) {
    const spellbookEl = document.getElementById('deck-spellbook');
    const atlasEl = document.getElementById('deck-atlas');
    const totalValueEl = document.getElementById('deck-total-value');

    let totalValue = 0;

    // Render spellbook
    if (spellbookEl && deck.spellbook) {
        spellbookEl.innerHTML = deck.spellbook.map(entry => {
            const card = allCards.find(c => c.name === entry.name);
            let price = 0;
            if (card && typeof priceService !== 'undefined') {
                price = priceService.getPrice(card.name) || priceService.getEstimatedPrice(card);
            }
            const entryValue = price * (entry.qty || 1);
            totalValue += entryValue;
            const owned = collection.has(entry.name);

            return `
                <div class="deck-card-entry ${owned ? 'owned' : 'missing'}">
                    <span class="entry-qty">${entry.qty}x</span>
                    <span class="entry-name">${entry.name}</span>
                    <span class="entry-price">${priceService ? priceService.formatPrice(entryValue) : '--'}</span>
                </div>
            `;
        }).join('');
        document.getElementById('spellbook-count').textContent = deck.spellbook.reduce((sum, e) => sum + (e.qty || 1), 0);
    }

    // Render atlas
    if (atlasEl && deck.atlas) {
        atlasEl.innerHTML = deck.atlas.map(entry => {
            const card = allCards.find(c => c.name === entry.name);
            let price = 0;
            if (card && typeof priceService !== 'undefined') {
                price = priceService.getPrice(card.name) || priceService.getEstimatedPrice(card);
            }
            const entryValue = price * (entry.qty || 1);
            totalValue += entryValue;
            const owned = collection.has(entry.name);

            return `
                <div class="deck-card-entry ${owned ? 'owned' : 'missing'}">
                    <span class="entry-qty">${entry.qty}x</span>
                    <span class="entry-name">${entry.name}</span>
                    <span class="entry-price">${priceService ? priceService.formatPrice(entryValue) : '--'}</span>
                </div>
            `;
        }).join('');
        document.getElementById('atlas-count').textContent = deck.atlas.reduce((sum, e) => sum + (e.qty || 1), 0);
    }

    // Update total value
    if (totalValueEl && typeof priceService !== 'undefined') {
        totalValueEl.textContent = priceService.formatPrice(totalValue);
    }

    // Update deck analysis if panel is visible
    if (deckAnalysisExpanded) {
        updateDeckAnalysis(deck);
    }
}

// Deck Analysis Toggle
let deckAnalysisExpanded = false;

function toggleDeckAnalysis() {
    deckAnalysisExpanded = !deckAnalysisExpanded;
    const content = document.getElementById('deck-analysis-content');
    const icon = document.getElementById('analysis-toggle-icon');

    if (content) {
        content.classList.toggle('expanded', deckAnalysisExpanded);
    }
    if (icon) {
        icon.style.transform = deckAnalysisExpanded ? 'rotate(180deg)' : 'rotate(0)';
    }

    if (deckAnalysisExpanded) {
        // Get current deck from inputs
        const deck = getCurrentDeckFromBuilder();
        updateDeckAnalysis(deck);
    }

    // Re-init icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function getCurrentDeckFromBuilder() {
    const spellbookEl = document.getElementById('deck-spellbook');
    const atlasEl = document.getElementById('deck-atlas');
    const name = document.getElementById('deck-name-input')?.value || 'Untitled';

    const spellbook = [];
    const atlas = [];

    // Parse spellbook entries
    spellbookEl?.querySelectorAll('.deck-card-entry').forEach(entry => {
        const qtyMatch = entry.querySelector('.entry-qty')?.textContent?.match(/(\d+)/);
        const name = entry.querySelector('.entry-name')?.textContent;
        if (name && qtyMatch) {
            spellbook.push({ name, qty: parseInt(qtyMatch[1]) });
        }
    });

    // Parse atlas entries
    atlasEl?.querySelectorAll('.deck-card-entry').forEach(entry => {
        const qtyMatch = entry.querySelector('.entry-qty')?.textContent?.match(/(\d+)/);
        const name = entry.querySelector('.entry-name')?.textContent;
        if (name && qtyMatch) {
            atlas.push({ name, qty: parseInt(qtyMatch[1]) });
        }
    });

    return { name, spellbook, atlas };
}

function updateDeckAnalysis(deck) {
    if (typeof ThresholdCalculator === 'undefined') {
        document.getElementById('deck-analysis-content').innerHTML =
            '<p class="text-secondary">Threshold Calculator module not loaded.</p>';
        return;
    }

    const calculator = new ThresholdCalculator();

    // Convert deck to the format expected by calculator
    const deckCards = [];
    const spellbookCards = [];
    const atlasCards = [];

    (deck.spellbook || []).forEach(entry => {
        const card = allCards.find(c => c.name === entry.name);
        if (card) {
            for (let i = 0; i < (entry.qty || 1); i++) {
                deckCards.push(card);
                spellbookCards.push(card);
            }
        }
    });

    (deck.atlas || []).forEach(entry => {
        const card = allCards.find(c => c.name === entry.name);
        if (card) {
            for (let i = 0; i < (entry.qty || 1); i++) {
                deckCards.push(card);
                atlasCards.push(card);
            }
        }
    });

    // Analyze deck (pass allCards as second argument)
    const analysis = calculator.analyzeDeck(deckCards, allCards);

    // Render threshold requirements (property is 'requirements', not 'thresholds')
    renderThresholdRequirements(analysis.requirements || {});

    // Render mana curve with spellbook cards only (Sites don't have mana cost)
    renderManaCurve(analysis.manaCurve || {}, spellbookCards.length);

    // Render element distribution (property is 'cardsByElement', not 'elementBreakdown')
    renderElementDistribution(analysis.cardsByElement || {});

    // Render site suggestions
    const siteSuggestions = calculator.suggestSiteDistribution(
        analysis.requirements || {},
        atlasCards.length || 25
    );
    renderSiteSuggestions(siteSuggestions);

    // Render deck summary stats
    renderDeckSummary(analysis, spellbookCards.length, atlasCards.length);

    // Validate deck
    const currentSites = {
        fire: 0, water: 0, earth: 0, air: 0
    };
    atlasCards.forEach(card => {
        const elements = card.elements?.toLowerCase() || '';
        if (elements.includes('fire')) currentSites.fire++;
        if (elements.includes('water')) currentSites.water++;
        if (elements.includes('earth')) currentSites.earth++;
        if (elements.includes('air')) currentSites.air++;
    });

    const validation = calculator.validateDeck(deckCards, currentSites, allCards);
    renderValidationMessages(validation);
}

function renderThresholdRequirements(thresholds) {
    const el = document.getElementById('threshold-requirements');
    if (!el) return;

    const elements = ['fire', 'water', 'earth', 'air'];
    const elementIcons = {
        fire: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
        water: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
        earth: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
        air: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">'
    };
    const maxThreshold = Math.max(...elements.map(e => thresholds[e] || 0), 1);

    el.innerHTML = `
        <div class="threshold-bars">
            ${elements.map(element => {
                const value = thresholds[element] || 0;
                const percent = (value / maxThreshold) * 100;
                return `
                    <div class="threshold-bar-item ${element}">
                        <span class="threshold-icon">${elementIcons[element]}</span>
                        <div class="threshold-bar">
                            <div class="threshold-fill" style="width: ${percent}%"></div>
                        </div>
                        <span class="threshold-value">${value}</span>
                    </div>
                `;
            }).join('')}
        </div>
        <p class="threshold-summary">Max threshold: ${Math.max(...elements.map(e => thresholds[e] || 0))}</p>
    `;
}

function renderManaCurve(manaCurve, totalSpellbookCards) {
    const el = document.getElementById('mana-curve-chart');
    if (!el) return;

    // Create enhanced bar chart
    const costs = [0, 1, 2, 3, 4, 5, 6, '7+'];
    const counts = costs.map(cost => {
        if (cost === '7+') {
            return Object.entries(manaCurve)
                .filter(([k]) => parseInt(k) >= 7)
                .reduce((sum, [, v]) => sum + v, 0);
        }
        return manaCurve[cost] || 0;
    });
    const maxCount = Math.max(...counts, 1);
    const totalCards = counts.reduce((a, b) => a + b, 0);
    const avgCost = totalCards > 0
        ? costs.reduce((sum, cost, i) => {
            const numCost = cost === '7+' ? 7 : cost;
            return sum + (numCost * counts[i]);
        }, 0) / totalCards
        : 0;

    el.innerHTML = `
        <div class="mana-curve-stats">
            <div class="curve-stat">
                <span class="stat-value">${totalSpellbookCards || totalCards}</span>
                <span class="stat-label">Spellbook</span>
            </div>
            <div class="curve-stat highlight">
                <span class="stat-value">${avgCost.toFixed(1)}</span>
                <span class="stat-label">Avg Cost</span>
            </div>
        </div>
        <div class="mana-curve-bars">
            ${costs.map((cost, i) => {
                const count = counts[i];
                const height = (count / maxCount) * 80;
                const percentage = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
                return `
                    <div class="curve-bar-container">
                        <div class="curve-bar ${count > 0 ? 'has-cards' : ''}"
                             style="height: ${Math.max(height, 4)}px"
                             title="${count} cards (${percentage}%)">
                            <span class="curve-count">${count > 0 ? count : ''}</span>
                        </div>
                        <span class="curve-label">${cost}</span>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="curve-legend">
            <span class="legend-label">Mana Cost Distribution</span>
        </div>
    `;
}

function renderElementDistribution(cardsByElement) {
    const el = document.getElementById('element-distribution');
    if (!el) return;

    const elements = ['fire', 'water', 'earth', 'air'];
    const displayNames = { fire: 'Fire', water: 'Water', earth: 'Earth', air: 'Air' };
    const colors = { fire: '#ef4444', water: '#3b82f6', earth: '#22c55e', air: '#a855f7' };
    const icons = {
        fire: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
        water: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
        earth: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
        air: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">'
    };

    // cardsByElement format: { fire: [{name, cost, threshold, quantity}], ... }
    const counts = {};
    elements.forEach(e => {
        const cards = cardsByElement[e] || [];
        counts[e] = cards.reduce((sum, c) => sum + (c.quantity || 1), 0);
    });

    // Also count multi-element and neutral
    const multiCards = cardsByElement.multi || [];
    const neutralCards = cardsByElement.neutral || [];
    const multiCount = multiCards.reduce((sum, c) => sum + (c.quantity || 1), 0);
    const neutralCount = neutralCards.reduce((sum, c) => sum + (c.quantity || 1), 0);

    const total = elements.reduce((sum, e) => sum + counts[e], 0) + multiCount + neutralCount;

    if (total === 0) {
        el.innerHTML = '<p class="text-secondary">Add cards to see element distribution</p>';
        return;
    }

    el.innerHTML = `
        <div class="element-breakdown">
            ${elements.map(element => {
                const count = counts[element];
                const percent = Math.round((count / total) * 100);
                return `
                    <div class="element-row">
                        <span class="element-icon">${icons[element]}</span>
                        <span class="element-name ${element}">${displayNames[element]}</span>
                        <div class="element-bar">
                            <div class="element-fill" style="width: ${percent}%; background: ${colors[element]}"></div>
                        </div>
                        <span class="element-count">${count}</span>
                        <span class="element-percent">(${percent}%)</span>
                    </div>
                `;
            }).join('')}
            ${multiCount > 0 ? `
                <div class="element-row multi">
                    <span class="element-icon"><i data-lucide="layers"></i></span>
                    <span class="element-name">Multi</span>
                    <div class="element-bar">
                        <div class="element-fill" style="width: ${Math.round((multiCount / total) * 100)}%; background: #9966cc"></div>
                    </div>
                    <span class="element-count">${multiCount}</span>
                    <span class="element-percent">(${Math.round((multiCount / total) * 100)}%)</span>
                </div>
            ` : ''}
            ${neutralCount > 0 ? `
                <div class="element-row neutral">
                    <span class="element-icon"><i data-lucide="circle"></i></span>
                    <span class="element-name">Neutral</span>
                    <div class="element-bar">
                        <div class="element-fill" style="width: ${Math.round((neutralCount / total) * 100)}%; background: #888"></div>
                    </div>
                    <span class="element-count">${neutralCount}</span>
                    <span class="element-percent">(${Math.round((neutralCount / total) * 100)}%)</span>
                </div>
            ` : ''}
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderSiteSuggestions(suggestions) {
    const el = document.getElementById('site-suggestions');
    if (!el) return;

    // suggestions format: { fire: 5, water: 3, earth: 0, air: 2, dualSites: {...}, total: 25 }
    if (!suggestions) {
        el.innerHTML = '<p class="text-secondary">Add cards to get site suggestions</p>';
        return;
    }

    const elements = ['fire', 'water', 'earth', 'air'];
    const displayNames = { fire: 'Fire', water: 'Water', earth: 'Earth', air: 'Air' };
    const icons = {
        fire: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
        water: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
        earth: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
        air: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">'
    };

    const activeSuggestions = elements.filter(e => suggestions[e] > 0);

    if (activeSuggestions.length === 0) {
        el.innerHTML = '<p class="text-secondary">Add cards with threshold requirements</p>';
        return;
    }

    el.innerHTML = `
        <div class="site-suggestion-grid">
            ${activeSuggestions.map(element => `
                <div class="site-suggestion ${element}">
                    <span class="site-icon">${icons[element]}</span>
                    <span class="site-element">${displayNames[element]}</span>
                    <span class="site-count">${suggestions[element]}</span>
                </div>
            `).join('')}
        </div>
        ${suggestions.dualSites && Object.keys(suggestions.dualSites).length > 0 ? `
            <div class="dual-sites-section">
                <p class="dual-label">Dual Sites:</p>
                ${Object.entries(suggestions.dualSites).map(([key, count]) => {
                    const [el1, el2] = key.split('-');
                    return `
                        <span class="dual-site-badge">
                            ${icons[el1]}${icons[el2]} x${count}
                        </span>
                    `;
                }).join('')}
            </div>
        ` : ''}
        <p class="suggestion-total">Total: ${suggestions.total || activeSuggestions.reduce((s, e) => s + suggestions[e], 0)} sites</p>
    `;
}

function renderValidationMessages(validation) {
    const el = document.getElementById('deck-validation-messages');
    if (!el) return;

    if (!validation || (validation.errors.length === 0 && validation.warnings.length === 0)) {
        el.innerHTML = validation && validation.isValid
            ? '<div class="validation-success"><i data-lucide="check-circle"></i> Deck is valid!</div>'
            : '';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    el.innerHTML = `
        ${validation.errors.map(err => `
            <div class="validation-error">
                <i data-lucide="alert-circle"></i>
                <span>${err}</span>
            </div>
        `).join('')}
        ${validation.warnings.map(warn => `
            <div class="validation-warning">
                <i data-lucide="alert-triangle"></i>
                <span>${warn}</span>
            </div>
        `).join('')}
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderDeckSummary(analysis, spellbookCount, atlasCount) {
    const el = document.getElementById('deck-summary-stats');
    if (!el) return;

    const totalCards = spellbookCount + atlasCount;
    const isValidSpellbook = spellbookCount >= 40 && spellbookCount <= 60;
    const isValidAtlas = atlasCount >= 20 && atlasCount <= 30;

    el.innerHTML = `
        <div class="deck-summary-grid">
            <div class="summary-card ${isValidSpellbook ? 'valid' : 'invalid'}">
                <div class="summary-icon"><i data-lucide="book-open"></i></div>
                <div class="summary-info">
                    <span class="summary-value">${spellbookCount}/60</span>
                    <span class="summary-label">Spellbook</span>
                </div>
            </div>
            <div class="summary-card ${isValidAtlas ? 'valid' : 'invalid'}">
                <div class="summary-icon"><i data-lucide="map"></i></div>
                <div class="summary-info">
                    <span class="summary-value">${atlasCount}/30</span>
                    <span class="summary-label">Atlas</span>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon"><i data-lucide="layers"></i></div>
                <div class="summary-info">
                    <span class="summary-value">${totalCards}</span>
                    <span class="summary-label">Total</span>
                </div>
            </div>
            <div class="summary-card highlight">
                <div class="summary-icon"><i data-lucide="zap"></i></div>
                <div class="summary-info">
                    <span class="summary-value">${analysis.averageCost?.toFixed(1) || '0.0'}</span>
                    <span class="summary-label">Avg Cost</span>
                </div>
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// COMMUNITY DECK BROWSER
// ============================================

// Deck browser state
const deckBrowserState = {
    elementFilter: 'all',
    tierFilter: 'all',
    avatarFilter: 'all',
    sortBy: 'views',
    cardSearch: '',
    preconOnly: false,
    beginnerOnly: false,
    tournamentOnly: false,
    communityOnly: false,
    primerOnly: false
};

// Get all decks combined
function getAllCommunityDecks() {
    const decks = [];

    if (typeof RECOMMENDED_DECKS !== 'undefined') {
        decks.push(...RECOMMENDED_DECKS.map(d => ({ ...d, type: 'community' })));
    }

    if (typeof TOURNAMENT_DECKS !== 'undefined') {
        decks.push(...TOURNAMENT_DECKS.map(d => ({
            ...d,
            type: 'tournament',
            author: d.player ? `Player: ${d.player}` : 'Championship'
        })));
    }

    return decks;
}

// Filter decks based on current state
function filterDecks(decks) {
    return decks.filter(deck => {
        // Element filter
        if (deckBrowserState.elementFilter !== 'all') {
            if (!deck.elements.includes(deckBrowserState.elementFilter)) {
                return false;
            }
        }

        // Tier filter
        if (deckBrowserState.tierFilter !== 'all') {
            if (deck.tier !== deckBrowserState.tierFilter) {
                return false;
            }
        }

        // Avatar filter
        if (deckBrowserState.avatarFilter !== 'all') {
            if (deck.avatar !== deckBrowserState.avatarFilter) {
                return false;
            }
        }

        // Card search
        if (deckBrowserState.cardSearch) {
            const searchLower = deckBrowserState.cardSearch.toLowerCase();
            const hasCard = deck.keyCards?.some(card =>
                card.toLowerCase().includes(searchLower)
            );
            const matchesName = deck.name.toLowerCase().includes(searchLower);
            const matchesDesc = deck.description?.toLowerCase().includes(searchLower);

            if (!hasCard && !matchesName && !matchesDesc) {
                return false;
            }
        }

        // Quick filters
        if (deckBrowserState.preconOnly && !deck.isPrecon) {
            return false;
        }

        if (deckBrowserState.beginnerOnly && !deck.beginner) {
            return false;
        }

        if (deckBrowserState.tournamentOnly && deck.type !== 'tournament') {
            return false;
        }

        if (deckBrowserState.communityOnly && deck.isPrecon) {
            return false;
        }

        if (deckBrowserState.primerOnly && !deck.primer) {
            return false;
        }

        return true;
    });
}

// Sort decks
function sortDecks(decks) {
    const sorted = [...decks];

    switch (deckBrowserState.sortBy) {
        case 'views':
            sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
        case 'likes':
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        case 'price-low':
            sorted.sort((a, b) => (a.estimatedPrice || 0) - (b.estimatedPrice || 0));
            break;
        case 'price-high':
            sorted.sort((a, b) => (b.estimatedPrice || 0) - (a.estimatedPrice || 0));
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    return sorted;
}

// Render deck card
function renderDeckCard(deck) {
    const tierClass = deck.type === 'tournament' ? 'tournament' : `tier-${deck.tier}`;
    const tierLabel = deck.type === 'tournament' ? deck.tournament : deck.tier;

    return `
        <div class="deck-card-enhanced" data-deck-id="${deck.id}" onclick="openDeckDetail('${deck.id}')">
            <div class="deck-card-header">
                <span class="deck-tier-badge ${tierClass}">${tierLabel}</span>
                ${deck.estimatedPrice ? `<span class="deck-price-badge">$${deck.estimatedPrice}</span>` : ''}
            </div>

            <h4>${deck.name}</h4>

            <div class="deck-card-meta-row">
                <span><i data-lucide="user"></i> ${deck.author || ''}</span>
                ${deck.views ? `<span><i data-lucide="eye"></i> ${deck.views.toLocaleString()}</span>` : ''}
                ${deck.likes ? `<span><i data-lucide="heart"></i> ${deck.likes}</span>` : ''}
            </div>

            <p class="deck-card-description">${deck.description || ''}</p>

            <div class="deck-card-elements">
                ${deck.elements.map(e => `
                    <span class="element-badge ${e.toLowerCase()}">
                        ${getElementIcon(e)} ${e}
                    </span>
                `).join('')}
            </div>

            <div class="deck-card-footer">
                <div class="deck-badges">
                    ${deck.isPrimer ? '<span class="deck-badge"><i data-lucide="book-open"></i> Primer</span>' : ''}
                    ${deck.beginner ? '<span class="deck-badge"><i data-lucide="sparkles"></i> Iniciante</span>' : ''}
                </div>
                <span class="deck-avatar-badge">${deck.avatar || 'Custom'}</span>
            </div>

            ${deck.keyCards?.length ? `
                <div class="deck-key-cards">
                    <div class="deck-key-cards-label">Key Cards</div>
                    <div class="deck-key-cards-list">
                        ${deck.keyCards.slice(0, 4).map(card => `<span class="key-card-tag">${card}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Get element icon
function getElementIcon(element) {
    const icons = {
        Fire: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
        Water: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
        Earth: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
        Air: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">'
    };
    return icons[element] || '<span class="element-icon-fallback">✦</span>';
}

// Open deck detail modal
function openDeckDetail(deckId) {
    const allDecks = getAllCommunityDecks();
    const deck = allDecks.find(d => d.id === deckId);

    if (!deck) {
        console.error('Deck not found:', deckId);
        return;
    }

    const modal = document.getElementById('deck-detail-modal');
    if (!modal) return;

    // Populate header
    document.getElementById('deck-detail-name').textContent = deck.name;
    document.getElementById('deck-detail-author').textContent = deck.author || '';

    // Tier badge
    const tierBadge = document.getElementById('deck-detail-tier');
    const tierClass = deck.type === 'tournament' ? 'tournament' : `tier-${deck.tier}`;
    const tierLabel = deck.type === 'tournament' ? deck.tournament : `Tier ${deck.tier}`;
    tierBadge.className = `tier-badge ${tierClass}`;
    tierBadge.textContent = tierLabel;

    // Format badge
    document.getElementById('deck-detail-format').textContent = deck.format || 'Constructed';

    // Stats
    document.getElementById('deck-detail-views').textContent = deck.views?.toLocaleString() || '0';
    document.getElementById('deck-detail-likes').textContent = deck.likes?.toString() || '0';
    document.getElementById('deck-detail-price').textContent = deck.estimatedPrice ? `$${deck.estimatedPrice}` : '-';

    // Elements
    const elementsContainer = document.getElementById('deck-detail-elements');
    elementsContainer.innerHTML = deck.elements.map(e => `
        <span class="element-badge ${e.toLowerCase()}">
            ${getElementIcon(e)} ${e}
        </span>
    `).join('');

    // Strategy
    document.getElementById('deck-detail-strategy').textContent =
        deck.strategy || deck.description || 'Estratégia não disponível.';

    // Decklist
    const getCardElements = (cardName) => {
        if (typeof allCards === 'undefined' || !allCards.length) return [];
        const card = allCards.find(c => c.name === cardName);
        if (!card || !card.elements) return [];
        return card.elements.split('/').map(e => e.trim()).filter(e => e);
    };

    const renderElementIcons = (elements) => {
        if (!elements || elements.length === 0) return '';
        return elements.map(el =>
            `<img src="assets/elements/${el.toLowerCase()}.png" alt="${el}" class="element-icon-img tiny">`
        ).join('');
    };

    const renderCardList = (cards, showElements = false) => {
        if (!cards || cards.length === 0) {
            return '<li class="no-cards">Nenhuma carta</li>';
        }
        return cards.map(card => {
            const qty = card.qty || 1;
            const elements = showElements ? getCardElements(card.name) : [];
            const elementIcons = renderElementIcons(elements);
            return `
                <li>
                    <span class="card-qty">${qty}</span>
                    <span class="card-name" onclick="searchCardByName('${card.name.replace(/'/g, "\\'")}')">${card.name}</span>
                    ${elementIcons}
                </li>
            `;
        }).join('');
    };

    // Calculate card counts
    const countCards = (cards) => cards ? cards.reduce((sum, c) => sum + (c.qty || 1), 0) : 0;

    const avatarCount = deck.decklist?.avatar ? 1 : (deck.avatar ? 1 : 0);
    const minionsCount = countCards(deck.decklist?.minions);
    const spellsCount = countCards(deck.decklist?.spells);
    const artifactsCount = countCards(deck.decklist?.artifacts);
    const sitesCount = countCards(deck.decklist?.sites);
    const spellbookTotal = minionsCount + spellsCount + artifactsCount;

    // Avatar section
    const avatarList = document.getElementById('deck-detail-avatar');
    if (deck.decklist?.avatar) {
        avatarList.innerHTML = `<li><span class="card-name avatar-card" onclick="searchCardByName('${deck.decklist.avatar}')">${deck.decklist.avatar}</span></li>`;
    } else if (deck.avatar) {
        avatarList.innerHTML = `<li><span class="card-name avatar-card" onclick="searchCardByName('${deck.avatar}')">${deck.avatar}</span></li>`;
    } else {
        avatarList.innerHTML = '<li class="no-cards">Avatar não especificado</li>';
    }
    document.getElementById('deck-avatar-count').textContent = `(${avatarCount})`;

    // Spellbook counts
    document.getElementById('deck-spellbook-count').textContent = `(${spellbookTotal})`;
    document.getElementById('deck-minions-count').textContent = minionsCount > 0 ? `(${minionsCount})` : '';
    document.getElementById('deck-spells-count').textContent = spellsCount > 0 ? `(${spellsCount})` : '';
    document.getElementById('deck-artifacts-count').textContent = artifactsCount > 0 ? `(${artifactsCount})` : '';

    // Atlas count
    document.getElementById('deck-atlas-count').textContent = `(${sitesCount})`;

    document.getElementById('deck-detail-minions').innerHTML =
        deck.decklist ? renderCardList(deck.decklist.minions, true) : '<li class="no-cards">Lista completa no Curiosa.io</li>';
    document.getElementById('deck-detail-spells').innerHTML =
        deck.decklist ? renderCardList(deck.decklist.spells, true) : '<li class="no-cards">Lista completa no Curiosa.io</li>';
    document.getElementById('deck-detail-sites').innerHTML =
        deck.decklist ? renderCardList(deck.decklist.sites, false) : '<li class="no-cards">Lista completa no Curiosa.io</li>';
    document.getElementById('deck-detail-artifacts').innerHTML =
        deck.decklist ? renderCardList(deck.decklist.artifacts, false) : '<li class="no-cards">Lista completa no Curiosa.io</li>';

    // Changelog
    const changelogSection = document.getElementById('deck-detail-changelog-section');
    const changelogList = document.getElementById('deck-detail-changelog');
    if (deck.changelog && deck.changelog.length > 0) {
        changelogSection.style.display = 'block';
        changelogList.innerHTML = deck.changelog.map(entry => `
            <li>
                <span class="changelog-date">${entry.date}</span>
                <span>${entry.note}</span>
            </li>
        `).join('');
    } else {
        changelogSection.style.display = 'none';
    }

    // Primer Section
    const primerSection = document.getElementById('deck-detail-primer-section');
    if (deck.primer && typeof DECK_GUIDES !== 'undefined' && DECK_GUIDES.deckPrimers) {
        const primer = DECK_GUIDES.deckPrimers.find(p => p.id === deck.primer);
        if (primer) {
            primerSection.style.display = 'block';

            // Overview
            document.getElementById('primer-overview').innerHTML = primer.overview || '';

            // Key Cards
            const keyCardsEl = document.getElementById('primer-key-cards');
            if (primer.keyCards && primer.keyCards.length > 0) {
                keyCardsEl.innerHTML = primer.keyCards.map(card => `
                    <li>
                        <span class="key-card-copies">${card.copies}x</span>
                        <span class="key-card-name" onclick="searchCardByName('${card.name.replace(/'/g, "\\'")}')">${card.name}</span>
                        <span class="key-card-role">${card.role}</span>
                    </li>
                `).join('');
            } else {
                keyCardsEl.innerHTML = '';
            }

            // Gameplan
            const gameplanEl = document.getElementById('primer-gameplan');
            if (primer.gameplan) {
                gameplanEl.innerHTML = `
                    <div class="gameplan-phase">
                        <span class="phase-label">Early Game</span>
                        <p>${primer.gameplan.early || ''}</p>
                    </div>
                    <div class="gameplan-phase">
                        <span class="phase-label">Mid Game</span>
                        <p>${primer.gameplan.mid || ''}</p>
                    </div>
                    <div class="gameplan-phase">
                        <span class="phase-label">Late Game</span>
                        <p>${primer.gameplan.late || ''}</p>
                    </div>
                `;
            } else {
                gameplanEl.innerHTML = '';
            }

            // Mulligan Guide
            document.getElementById('primer-mulligan').innerHTML = primer.mulliganGuide || '';

            // Matchups
            const matchupsEl = document.getElementById('primer-matchups');
            if (primer.matchups && primer.matchups.length > 0) {
                matchupsEl.innerHTML = primer.matchups.map(m => `
                    <div class="matchup-item ${m.difficulty.toLowerCase().replace(' ', '-')}">
                        <div class="matchup-header">
                            <span class="matchup-deck">${m.deck}</span>
                            <span class="matchup-difficulty">${m.difficulty}</span>
                            <span class="matchup-winrate">${m.winrate}</span>
                        </div>
                        <p class="matchup-tips">${m.tips}</p>
                    </div>
                `).join('');
            } else {
                matchupsEl.innerHTML = '';
            }
        } else {
            primerSection.style.display = 'none';
        }
    } else {
        primerSection.style.display = 'none';
    }

    // External link
    document.getElementById('deck-detail-external-link').href = deck.url;

    // Copy button
    const copyBtn = document.getElementById('deck-detail-copy');
    copyBtn.onclick = () => copyDeckList(deck);

    // Show modal
    modal.classList.remove('hidden');

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Copy deck list to clipboard
function copyDeckList(deck) {
    if (!deck.decklist) {
        // If no decklist, copy key cards
        const keyCardsList = deck.keyCards ? deck.keyCards.join('\n') : '';
        const text = `${deck.name}\nby ${deck.author}\n\nKey Cards:\n${keyCardsList}\n\nVer lista completa: ${deck.url}`;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Lista copiada!', 'success');
        });
        return;
    }

    const formatSection = (title, cards) => {
        if (!cards || cards.length === 0) return '';
        const total = cards.reduce((sum, c) => sum + (c.qty || 1), 0);
        return `${title} (${total}):\n${cards.map(c => `${c.qty}x ${c.name}`).join('\n')}\n`;
    };

    const avatar = deck.decklist?.avatar || deck.avatar || 'N/A';
    const minionsCount = deck.decklist?.minions?.reduce((s, c) => s + c.qty, 0) || 0;
    const spellsCount = deck.decklist?.spells?.reduce((s, c) => s + c.qty, 0) || 0;
    const artifactsCount = deck.decklist?.artifacts?.reduce((s, c) => s + c.qty, 0) || 0;
    const sitesCount = deck.decklist?.sites?.reduce((s, c) => s + c.qty, 0) || 0;
    const spellbookTotal = minionsCount + spellsCount + artifactsCount;

    const text = [
        `${deck.name}`,
        `by ${deck.author || deck.player || 'Unknown'}`,
        '',
        `== AVATAR (1) ==`,
        `1x ${avatar}`,
        '',
        `== SPELLBOOK (${spellbookTotal}) ==`,
        formatSection('Minions', deck.decklist.minions),
        formatSection('Magic', deck.decklist.spells),
        formatSection('Artifacts', deck.decklist.artifacts),
        `== ATLAS (${sitesCount}) ==`,
        formatSection('Sites', deck.decklist.sites),
        `Fonte: ${deck.url}`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
        showNotification('Lista copiada para clipboard!', 'success');
    });
}

// Search card by name (opens card modal)
function searchCardByName(cardName) {
    // Find card in database and open modal
    const card = allCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
    if (card) {
        // Open card modal (deck modal stays behind)
        openCardModal(card.name, false);
    } else {
        // Card not found - close deck modal and search
        document.getElementById('deck-detail-modal').classList.add('hidden');
        showView('cards');
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = cardName;
            applyFilters();
        }
    }
}

// Close deck detail modal
function closeDeckDetailModal() {
    const modal = document.getElementById('deck-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ============================================
// IMPORT DECK FUNCTIONALITY
// ============================================

let importedDeckData = null;

function openImportDeckModal() {
    const modal = document.getElementById('import-deck-modal');
    if (!modal) return;

    // Reset form
    document.getElementById('import-deck-url').value = '';
    document.getElementById('import-deck-name').value = '';
    document.getElementById('import-deck-text').value = '';
    document.getElementById('import-url-preview').innerHTML = '';
    document.getElementById('import-cards-found').textContent = '0 cartas encontradas';
    document.getElementById('import-cards-missing').textContent = '0 não encontradas';
    document.getElementById('import-deck-submit').disabled = true;
    importedDeckData = null;

    // Reset to URL tab
    switchImportTab('url');

    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function switchImportTab(tabName) {
    document.querySelectorAll('.import-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.import-tab-content').forEach(c => c.classList.remove('active'));

    document.querySelector(`.import-tab[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`import-${tabName}-tab`)?.classList.add('active');

    // Reset submit button when switching tabs
    document.getElementById('import-deck-submit').disabled = true;
    importedDeckData = null;
}

async function handleImportUrlInput(e) {
    const url = e.target.value.trim();
    const previewEl = document.getElementById('import-url-preview');
    const submitBtn = document.getElementById('import-deck-submit');

    if (!url) {
        previewEl.innerHTML = '';
        submitBtn.disabled = true;
        return;
    }

    // Validate Curiosa.io URL
    const curiosaMatch = url.match(/curiosa\.io\/decks\/([a-zA-Z0-9]+)/);
    if (!curiosaMatch) {
        previewEl.innerHTML = '<p style="color: var(--warning);">URL inválida. Use uma URL do Curiosa.io (ex: https://curiosa.io/decks/...)</p>';
        submitBtn.disabled = true;
        return;
    }

    const deckId = curiosaMatch[1];
    previewEl.innerHTML = '<div class="loading"><i data-lucide="loader-2" class="spinning"></i> Buscando deck...</div>';
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Try to find the deck in our recommended decks
    const allDecks = getAllCommunityDecks();
    const foundDeck = allDecks.find(d => d.url?.includes(deckId));

    if (foundDeck) {
        importedDeckData = {
            type: 'curiosa',
            deck: foundDeck
        };

        previewEl.innerHTML = `
            <div class="preview-deck-name">${foundDeck.name}</div>
            <div class="preview-deck-author">por ${foundDeck.author || foundDeck.player || 'Desconhecido'}</div>
            <div class="preview-stats">
                <span class="preview-stat"><i data-lucide="layers"></i> ${foundDeck.decklist ? 'Lista completa disponível' : 'Lista parcial'}</span>
                <span class="preview-stat"><i data-lucide="dollar-sign"></i> $${foundDeck.estimatedPrice || '?'}</span>
                ${foundDeck.elements ? `<span class="preview-stat">${foundDeck.elements.map(e => getElementIcon(e)).join(' ')}</span>` : ''}
            </div>
        `;
        submitBtn.disabled = false;
    } else {
        previewEl.innerHTML = `
            <p style="color: var(--warning);">Deck não encontrado em nossa base de dados.</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Use a aba "Via Texto" para importar manualmente copiando a lista de cartas do Curiosa.io.</p>
        `;
        submitBtn.disabled = true;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleImportTextInput(e) {
    const text = e.target.value.trim();
    const foundEl = document.getElementById('import-cards-found');
    const missingEl = document.getElementById('import-cards-missing');
    const submitBtn = document.getElementById('import-deck-submit');

    if (!text) {
        foundEl.textContent = '0 cartas encontradas';
        missingEl.textContent = '0 não encontradas';
        submitBtn.disabled = true;
        importedDeckData = null;
        return;
    }

    const parsed = parseDecklist(text);
    foundEl.textContent = `${parsed.found.length} cartas encontradas`;
    missingEl.textContent = `${parsed.missing.length} não encontradas`;

    if (parsed.found.length > 0) {
        importedDeckData = {
            type: 'text',
            cards: parsed.found,
            missing: parsed.missing
        };
        submitBtn.disabled = false;
    } else {
        importedDeckData = null;
        submitBtn.disabled = true;
    }
}

function parseDecklist(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const found = [];
    const missing = [];

    for (const line of lines) {
        // Skip section headers
        if (line.match(/^(Avatar|Spellbook|Atlas|Minions|Magic|Artifacts|Sites|Auras):/i)) continue;
        if (line.match(/^#+/)) continue;
        if (line.match(/^-+$/)) continue;

        // Parse "4 Lightning Bolt" or "4x Lightning Bolt" or "Lightning Bolt x4"
        let match = line.match(/^(\d+)x?\s+(.+)$/i) || line.match(/^(.+)\s+x(\d+)$/i);

        if (match) {
            const qty = parseInt(match[1]) || parseInt(match[2]) || 1;
            const cardName = (match[2] || match[1]).trim();

            // Find card in database
            const card = allCards.find(c =>
                c.name.toLowerCase() === cardName.toLowerCase() ||
                c.name.toLowerCase().includes(cardName.toLowerCase())
            );

            if (card) {
                found.push({ name: card.name, qty, card });
            } else {
                missing.push({ name: cardName, qty });
            }
        } else if (line.trim()) {
            // Single card without quantity
            const cardName = line.trim();
            const card = allCards.find(c =>
                c.name.toLowerCase() === cardName.toLowerCase()
            );

            if (card) {
                found.push({ name: card.name, qty: 1, card });
            } else {
                missing.push({ name: cardName, qty: 1 });
            }
        }
    }

    return { found, missing };
}

function submitImportDeck() {
    if (!importedDeckData) return;

    const deckName = document.getElementById('import-deck-name')?.value.trim() || 'Deck Importado';

    if (importedDeckData.type === 'curiosa' && importedDeckData.deck) {
        // Import from Curiosa deck
        const sourceDeck = importedDeckData.deck;
        const newDeck = {
            id: Date.now().toString(),
            name: sourceDeck.name + ' (Importado)',
            avatar: sourceDeck.decklist?.avatar || sourceDeck.avatar || '',
            cards: [],
            createdAt: new Date().toISOString()
        };

        // Convert decklist to cards array
        if (sourceDeck.decklist) {
            const addCards = (cards, type) => {
                if (!cards) return;
                cards.forEach(c => {
                    const card = allCards.find(ac => ac.name.toLowerCase() === c.name.toLowerCase());
                    if (card) {
                        for (let i = 0; i < c.qty; i++) {
                            newDeck.cards.push({ name: card.name, type });
                        }
                    }
                });
            };

            addCards(sourceDeck.decklist.minions, 'minion');
            addCards(sourceDeck.decklist.spells, 'spell');
            addCards(sourceDeck.decklist.artifacts, 'artifact');
            addCards(sourceDeck.decklist.sites, 'site');
        }

        decks.push(newDeck);
        saveToStorage();
        renderDecks();
        showNotification(`Deck "${newDeck.name}" importado com sucesso!`, 'success');
    } else if (importedDeckData.type === 'text') {
        // Import from text
        const newDeck = {
            id: Date.now().toString(),
            name: deckName,
            avatar: '',
            cards: [],
            createdAt: new Date().toISOString()
        };

        importedDeckData.cards.forEach(c => {
            const cardType = c.card?.guardian?.type?.toLowerCase() || 'unknown';
            for (let i = 0; i < c.qty; i++) {
                newDeck.cards.push({ name: c.name, type: cardType });
            }
        });

        decks.push(newDeck);
        saveToStorage();
        renderDecks();

        let message = `Deck "${deckName}" importado com ${importedDeckData.cards.length} cartas!`;
        if (importedDeckData.missing.length > 0) {
            message += ` (${importedDeckData.missing.length} cartas não encontradas)`;
        }
        showNotification(message, 'success');
    }

    closeModal('import-deck-modal');
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Render community decks
function renderCommunityDecks() {
    const gridEl = document.getElementById('community-decks-grid');
    const countEl = document.getElementById('deck-results-count');
    const clearBtn = document.getElementById('clear-deck-filters');

    if (!gridEl) return;

    const allDecks = getAllCommunityDecks();
    const filtered = filterDecks(allDecks);
    const sorted = sortDecks(filtered);

    // Update count
    if (countEl) {
        countEl.textContent = `${sorted.length} deck${sorted.length !== 1 ? 's' : ''} encontrado${sorted.length !== 1 ? 's' : ''}`;
    }

    // Show/hide clear button
    const hasFilters = deckBrowserState.elementFilter !== 'all' ||
                       deckBrowserState.tierFilter !== 'all' ||
                       deckBrowserState.avatarFilter !== 'all' ||
                       deckBrowserState.cardSearch ||
                       deckBrowserState.preconOnly ||
                       deckBrowserState.beginnerOnly ||
                       deckBrowserState.tournamentOnly ||
                       deckBrowserState.communityOnly ||
                       deckBrowserState.primerOnly;

    if (clearBtn) {
        clearBtn.classList.toggle('hidden', !hasFilters);
    }

    // Render cards
    if (sorted.length === 0) {
        gridEl.innerHTML = `
            <div class="no-decks-found">
                <i data-lucide="search-x"></i>
                <h4>Nenhum deck encontrado</h4>
                <p>Tente ajustar os filtros ou limpar a busca</p>
            </div>
        `;
    } else {
        gridEl.innerHTML = sorted.map(renderDeckCard).join('');
    }

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Setup deck browser event listeners
function setupDeckBrowser() {
    // Element filter buttons
    document.querySelectorAll('.element-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.element-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            deckBrowserState.elementFilter = btn.dataset.element;
            renderCommunityDecks();
        });
    });

    // Tier filter buttons
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            deckBrowserState.tierFilter = btn.dataset.tier;
            renderCommunityDecks();
        });
    });

    // Avatar filter
    document.getElementById('deck-avatar-filter')?.addEventListener('change', (e) => {
        deckBrowserState.avatarFilter = e.target.value;
        renderCommunityDecks();
    });

    // Sort select
    document.getElementById('deck-sort')?.addEventListener('change', (e) => {
        deckBrowserState.sortBy = e.target.value;
        renderCommunityDecks();
    });

    // Card search
    document.getElementById('deck-card-filter')?.addEventListener('input', debounce((e) => {
        deckBrowserState.cardSearch = e.target.value;
        renderCommunityDecks();
    }, 300));

    // Quick filter buttons
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            btn.classList.toggle('active');

            if (filter === 'precon') {
                deckBrowserState.preconOnly = btn.classList.contains('active');
            } else if (filter === 'beginner') {
                deckBrowserState.beginnerOnly = btn.classList.contains('active');
            } else if (filter === 'tournament') {
                deckBrowserState.tournamentOnly = btn.classList.contains('active');
            } else if (filter === 'community') {
                deckBrowserState.communityOnly = btn.classList.contains('active');
            } else if (filter === 'primer') {
                deckBrowserState.primerOnly = btn.classList.contains('active');
            }

            renderCommunityDecks();
        });
    });

    // Clear filters button
    document.getElementById('clear-deck-filters')?.addEventListener('click', () => {
        // Reset state
        deckBrowserState.elementFilter = 'all';
        deckBrowserState.tierFilter = 'all';
        deckBrowserState.avatarFilter = 'all';
        deckBrowserState.sortBy = 'views';
        deckBrowserState.cardSearch = '';
        deckBrowserState.preconOnly = false;
        deckBrowserState.beginnerOnly = false;
        deckBrowserState.tournamentOnly = false;
        deckBrowserState.communityOnly = false;
        deckBrowserState.primerOnly = false;

        // Reset UI
        document.querySelectorAll('.element-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.element-btn[data-element="all"]')?.classList.add('active');

        document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.tier-btn[data-tier="all"]')?.classList.add('active');

        document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));

        const avatarSelect = document.getElementById('deck-avatar-filter');
        if (avatarSelect) avatarSelect.value = 'all';

        const sortSelect = document.getElementById('deck-sort');
        if (sortSelect) sortSelect.value = 'views';

        const searchInput = document.getElementById('deck-card-filter');
        if (searchInput) searchInput.value = '';

        renderCommunityDecks();
    });
}

// Legacy function for backwards compatibility
function renderRecommendedDecks() {
    renderCommunityDecks();
    setupDeckBrowser();
}

// Setup export/import
function setupExportImport() {
    document.getElementById('export-json-btn')?.addEventListener('click', () => {
        const data = collectionTracker.exportToJSON();
        downloadFile(data, 'sorcery-collection.json', 'application/json');
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', () => {
        const data = collectionTracker.exportToCSV();
        downloadFile(data, 'sorcery-collection.csv', 'text/csv');
    });

    document.getElementById('import-btn')?.addEventListener('click', () => {
        document.getElementById('import-file')?.click();
    });

    document.getElementById('import-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (collectionTracker.importFromJSON(event.target.result)) {
                    alert('Collection imported successfully!');
                    // Sync with simple collection set
                    Object.keys(collectionTracker.collection).forEach(name => {
                        collection.add(name);
                    });
                    saveToStorage();
                    updateStats();
                    renderCards();
                } else {
                    alert('Error importing collection. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    });
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Enhanced stats with rarity
function updateStatsEnhanced() {
    updateStats();

    // Rarity progress
    const rarities = ['Ordinary', 'Elite', 'Exceptional', 'Unique'];
    const rarityProgressEl = document.getElementById('rarity-progress');

    if (rarityProgressEl && allCards.length > 0) {
        rarityProgressEl.innerHTML = rarities.map(rarity => {
            const stats = typeof collectionTracker !== 'undefined'
                ? collectionTracker.getRarityStats(allCards, rarity)
                : { totalCards: 0, ownedUnique: 0, completionPercent: 0 };

            const rarityCards = allCards.filter(c => c.guardian.rarity === rarity);
            const ownedInRarity = rarityCards.filter(c => collection.has(c.name)).length;
            const percent = rarityCards.length > 0 ? ((ownedInRarity / rarityCards.length) * 100).toFixed(0) : 0;

            return `
                <div class="progress-item">
                    <span class="progress-label">${rarity}</span>
                    <div class="progress-bar">
                        <div class="progress-fill default" style="width: ${percent}%"></div>
                    </div>
                    <span class="progress-text">${ownedInRarity}/${rarityCards.length}</span>
                </div>
            `;
        }).join('');
    }
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        renderRecommendedDecks();
        setupExportImport();
    }, 2000); // Wait for cards to load
});

// Toggle Trade Binder
function toggleTradeBinder(cardName) {
    // Check login for adding (not for removing)
    if (!tradeBinder.has(cardName)) {
        if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
            showNotification('Faça login para adicionar cards ao trade binder');
            openAuthModal('login');
            return;
        }
    }

    if (tradeBinder.has(cardName)) {
        tradeBinder.delete(cardName);
    } else {
        tradeBinder.add(cardName);
    }
    saveToStorage();
    renderCards();
    openCardModal(cardName); // Refresh modal
}

// Render Trade Binder
function renderTradeBinder() {
    const tradeGridEl = document.getElementById('trade-grid');
    const search = document.getElementById('trade-search')?.value.toLowerCase() || '';

    const tradeCards = allCards.filter(card => {
        if (!tradeBinder.has(card.name)) return false;
        if (search && !card.name.toLowerCase().includes(search)) return false;
        return true;
    });

    // Update stats
    document.getElementById('trade-count').textContent = tradeBinder.size;

    // Calculate trade value
    if (typeof priceService !== 'undefined') {
        let totalValue = 0;
        tradeBinder.forEach(cardName => {
            const card = allCards.find(c => c.name === cardName);
            if (card) {
                const price = priceService.getPrice(cardName) || priceService.getEstimatedPrice(card);
                totalValue += price;
            }
        });
        document.getElementById('trade-value').textContent = priceService.formatPrice(totalValue);
    }

    if (tradeCards.length === 0) {
        tradeGridEl.innerHTML = `
            <div class="empty-state">
                <h3>Trade Binder is empty</h3>
                <p>Add cards you want to trade from the Cards view.</p>
            </div>
        `;
        return;
    }

    tradeGridEl.innerHTML = tradeCards.map(card => createCardHTML(card)).join('');

    tradeGridEl.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', () => {
            const cardName = el.dataset.cardName;
            openCardModal(cardName);
        });
    });
}

// Handle Price Import
function handlePriceImport(e) {
    const file = e.target.files[0];
    if (file && typeof priceService !== 'undefined') {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = priceService.importPricesFromCSV(event.target.result);
                document.getElementById('price-import-status').innerHTML =
                    `<span class="success">Successfully imported ${imported} prices!</span>`;
                updateStatsWithPrices();
            } catch (error) {
                document.getElementById('price-import-status').innerHTML =
                    `<span class="error">Error: ${error.message}</span>`;
            }
        };
        reader.readAsText(file);
    }
    // Reset input
    e.target.value = '';
}

// Update Stats with Prices
function updateStatsWithPrices() {
    // Call the original stats update
    updateStats();
    updateStatsEnhanced();

    // Calculate collection value
    if (typeof priceService !== 'undefined' && allCards.length > 0) {
        // Build collection object for price calculation
        const collectionObj = {};
        collection.forEach(cardName => {
            collectionObj[cardName] = { qty: 1 };
        });

        // Use enhanced method for tracking if available
        const valueData = typeof priceService.getCollectionValueForTracking === 'function'
            ? priceService.getCollectionValueForTracking(collectionObj, allCards)
            : priceService.calculateCollectionValue(collectionObj, allCards);

        const combinedValue = parseFloat(valueData.combinedValue) || 0;
        const avgValue = parseFloat(valueData.averageCardValue) || 0;

        document.getElementById('collection-value').textContent = '$' + combinedValue.toFixed(2);
        document.getElementById('average-card-value').textContent = '$' + avgValue.toFixed(2);

        // BRL values
        const brlRate = priceService.getBRLRate();
        const brlValueEl = document.getElementById('collection-value-brl');
        if (brlValueEl) {
            brlValueEl.textContent = 'R$ ' + (combinedValue * brlRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }

        // Calculate wishlist value
        let wishlistValue = 0;
        wishlist.forEach(cardName => {
            const card = allCards.find(c => c.name === cardName);
            if (card) {
                const price = priceService.getPrice(cardName) || priceService.getEstimatedPrice(card);
                wishlistValue += price;
            }
        });
        document.getElementById('wishlist-value').textContent = priceService.formatPrice(wishlistValue);

        // Render most valuable cards in collection
        renderValuableCards(valueData.topCards);

        // Value Tracking Integration
        if (typeof valueTracker !== 'undefined') {
            updateValueTracking(valueData, brlRate);
        }
    }

    // Render achievements
    renderAchievements();

    // Render investment analytics
    renderInvestmentAnalytics();
}

// Value Tracking Integration
function updateValueTracking(valueData, brlRate) {
    // Take a snapshot if needed
    valueTracker.takeSnapshot(valueData, brlRate);

    // Get current period from active button
    const activePeriod = document.querySelector('.period-btn.active');
    const days = activePeriod ? parseInt(activePeriod.dataset.period) : 7;

    // Get trend data
    const trend = valueTracker.getValueTrend(days);

    // Update trend indicator
    const trendIndicator = document.getElementById('value-trend-indicator');
    const trendPercent = document.getElementById('value-trend-percent');

    if (trendIndicator && trendPercent) {
        trendIndicator.className = 'value-trend ' + trend.trend;

        const icon = trend.trend === 'up' ? 'trending-up' : trend.trend === 'down' ? 'trending-down' : 'minus';
        const sign = trend.changePercent >= 0 ? '+' : '';

        trendIndicator.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span>${sign}${trend.changePercent.toFixed(1)}%</span>
        `;

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Update change amount
    const changeAmountEl = document.getElementById('value-change-amount');
    const changePeriodEl = document.getElementById('value-change-period');

    if (changeAmountEl) {
        const sign = trend.change >= 0 ? '+' : '';
        changeAmountEl.textContent = sign + '$' + trend.change.toFixed(2);
        changeAmountEl.style.color = trend.trend === 'up' ? '#22c55e' : trend.trend === 'down' ? '#ef4444' : 'inherit';
    }

    if (changePeriodEl) {
        changePeriodEl.textContent = `Change (${days}D)`;
    }

    // Render sparkline chart
    renderValueSparkline(days);

    // Check for price changes
    renderPriceChanges();
}

// Render Value Sparkline Chart
function renderValueSparkline(days = 7) {
    const chartData = valueTracker.getChartData(days);

    if (chartData.length < 2) {
        // Not enough data yet
        return;
    }

    const chartRenderer = new ValueChartRenderer('value-sparkline-chart');
    chartRenderer.drawSparkline(chartData, {
        color: '#d4af37',
        fillColor: 'rgba(212, 175, 55, 0.1)',
        lineWidth: 2
    });
}

// Render Price Changes
function renderPriceChanges() {
    const changes = valueTracker.detectPriceChanges(0.20); // 20% threshold
    const section = document.getElementById('price-alerts-section');
    const list = document.getElementById('price-changes-list');

    if (!section || !list) return;

    if (changes.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    list.innerHTML = changes.slice(0, 5).map(change => `
        <div class="price-change-item ${change.trend}">
            <div class="price-change-card">
                <span class="card-name">${change.name}</span>
            </div>
            <div class="price-change-values">
                <span class="price-change-old">$${change.previousValue.toFixed(2)}</span>
                <span class="price-change-new">$${change.currentValue.toFixed(2)}</span>
                <span class="price-change-percent ${change.trend}">
                    ${change.changePercent >= 0 ? '+' : ''}${change.changePercent.toFixed(1)}%
                </span>
            </div>
        </div>
    `).join('');
}

// Period selector event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const days = parseInt(this.dataset.period);
            if (typeof valueTracker !== 'undefined') {
                const trend = valueTracker.getValueTrend(days);

                // Update trend indicator
                const trendIndicator = document.getElementById('value-trend-indicator');
                if (trendIndicator) {
                    trendIndicator.className = 'value-trend ' + trend.trend;
                    const icon = trend.trend === 'up' ? 'trending-up' : trend.trend === 'down' ? 'trending-down' : 'minus';
                    const sign = trend.changePercent >= 0 ? '+' : '';
                    trendIndicator.innerHTML = `
                        <i data-lucide="${icon}"></i>
                        <span>${sign}${trend.changePercent.toFixed(1)}%</span>
                    `;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }

                // Update change amount
                const changeAmountEl = document.getElementById('value-change-amount');
                const changePeriodEl = document.getElementById('value-change-period');
                if (changeAmountEl) {
                    const sign = trend.change >= 0 ? '+' : '';
                    changeAmountEl.textContent = sign + '$' + trend.change.toFixed(2);
                    changeAmountEl.style.color = trend.trend === 'up' ? '#22c55e' : trend.trend === 'down' ? '#ef4444' : 'inherit';
                }
                if (changePeriodEl) {
                    changePeriodEl.textContent = `Change (${days}D)`;
                }

                // Redraw chart
                renderValueSparkline(days);
            }
        });
    });
});

// Render Most Valuable Cards
function renderValuableCards(topCards) {
    const listEl = document.getElementById('valuable-cards-list');
    if (!listEl) return;

    if (!topCards || topCards.length === 0) {
        listEl.innerHTML = '<p class="empty-message">Add cards to your collection to see your most valuable cards.</p>';
        return;
    }

    listEl.innerHTML = topCards.map((card, index) => {
        const sourceClass = card.source === 'market' ? 'market-price' : 'estimated-price';
        return `
            <div class="valuable-card-item">
                <span class="rank">#${index + 1}</span>
                <span class="card-name">${card.name}</span>
                <span class="card-qty">x${card.qty}</span>
                <span class="card-price ${sourceClass}">${priceService.formatPrice(card.total)}</span>
            </div>
        `;
    }).join('');
}

// Render Investment Analytics
function renderInvestmentAnalytics() {
    if (typeof priceService === 'undefined' || allCards.length === 0) return;

    // Calculate value by set
    const setValues = {};
    const sets = ['Alpha', 'Beta', 'Arthurian Legends', 'Gothic', 'Dragonlord', 'Promotional'];
    sets.forEach(setName => {
        setValues[setName] = { value: 0, count: 0 };
    });

    // Calculate value by rarity
    const rarityValues = {
        'Unique': { value: 0, count: 0 },
        'Exceptional': { value: 0, count: 0 },
        'Elite': { value: 0, count: 0 },
        'Ordinary': { value: 0, count: 0 }
    };

    // Calculate value by element
    const elementValues = {
        'Fire': { value: 0, count: 0 },
        'Water': { value: 0, count: 0 },
        'Earth': { value: 0, count: 0 },
        'Air': { value: 0, count: 0 },
        'Neutral': { value: 0, count: 0 }
    };

    // Calculate value by type
    const typeValues = {
        'Avatar': { value: 0, count: 0 },
        'Minion': { value: 0, count: 0 },
        'Magic': { value: 0, count: 0 },
        'Artifact': { value: 0, count: 0 },
        'Aura': { value: 0, count: 0 },
        'Site': { value: 0, count: 0 }
    };

    // Analyze collection
    collection.forEach(cardName => {
        const card = allCards.find(c => c.name === cardName);
        if (!card) return;

        const price = priceService.getPrice(cardName) || priceService.getEstimatedPrice(card);

        // By set
        if (card.sets) {
            card.sets.forEach(s => {
                if (setValues[s.name]) {
                    setValues[s.name].value += price;
                    setValues[s.name].count++;
                }
            });
        }

        // By rarity
        const rarity = card.guardian?.rarity || 'Ordinary';
        if (rarityValues[rarity]) {
            rarityValues[rarity].value += price;
            rarityValues[rarity].count++;
        }

        // By element
        const elements = card.elements || '';
        if (elements.includes('Fire')) { elementValues['Fire'].value += price; elementValues['Fire'].count++; }
        else if (elements.includes('Water')) { elementValues['Water'].value += price; elementValues['Water'].count++; }
        else if (elements.includes('Earth')) { elementValues['Earth'].value += price; elementValues['Earth'].count++; }
        else if (elements.includes('Air')) { elementValues['Air'].value += price; elementValues['Air'].count++; }
        else { elementValues['Neutral'].value += price; elementValues['Neutral'].count++; }

        // By type
        const type = card.guardian?.type || 'Minion';
        if (typeValues[type]) {
            typeValues[type].value += price;
            typeValues[type].count++;
        }
    });

    // Render by set
    const setEl = document.getElementById('analytics-by-set');
    if (setEl) {
        setEl.innerHTML = Object.entries(setValues)
            .filter(([_, data]) => data.count > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([name, data]) => `
                <div class="analytics-item">
                    <span class="analytics-name">${name}</span>
                    <span class="analytics-count">${data.count} cards</span>
                    <span class="analytics-value">${priceService.formatPrice(data.value)}</span>
                </div>
            `).join('') || '<p class="empty-message">No data</p>';
    }

    // Render by rarity
    const rarityEl = document.getElementById('analytics-by-rarity');
    if (rarityEl) {
        const rarityOrder = ['Unique', 'Exceptional', 'Elite', 'Ordinary'];
        rarityEl.innerHTML = rarityOrder
            .filter(r => rarityValues[r].count > 0)
            .map(rarity => {
                const data = rarityValues[rarity];
                return `
                    <div class="analytics-item rarity-${rarity.toLowerCase()}">
                        <span class="analytics-name">${rarity}</span>
                        <span class="analytics-count">${data.count} cards</span>
                        <span class="analytics-value">${priceService.formatPrice(data.value)}</span>
                    </div>
                `;
            }).join('') || '<p class="empty-message">No data</p>';
    }

    // Render by element
    const elementEl = document.getElementById('analytics-by-element');
    if (elementEl) {
        elementEl.innerHTML = Object.entries(elementValues)
            .filter(([_, data]) => data.count > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([name, data]) => `
                <div class="analytics-item element-${name.toLowerCase()}">
                    <span class="analytics-name">${name}</span>
                    <span class="analytics-count">${data.count} cards</span>
                    <span class="analytics-value">${priceService.formatPrice(data.value)}</span>
                </div>
            `).join('') || '<p class="empty-message">No data</p>';
    }

    // Render by type
    const typeEl = document.getElementById('analytics-by-type');
    if (typeEl) {
        typeEl.innerHTML = Object.entries(typeValues)
            .filter(([_, data]) => data.count > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([name, data]) => `
                <div class="analytics-item">
                    <span class="analytics-name">${name}</span>
                    <span class="analytics-count">${data.count} cards</span>
                    <span class="analytics-value">${priceService.formatPrice(data.value)}</span>
                </div>
            `).join('') || '<p class="empty-message">No data</p>';
    }
}

// Render Achievements
function renderAchievements() {
    if (typeof gamification === 'undefined') return;

    const stats = gamification.calculateStats(
        allCards,
        collection,
        wishlist,
        tradeBinder,
        decks,
        ownedPrecons,
        typeof priceService !== 'undefined' ? priceService : null
    );

    // Check for newly unlocked achievements
    const newlyUnlocked = gamification.checkAchievements(stats);

    // Show notification for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
        showAchievementNotification(newlyUnlocked[0]);
    }

    // Update summary
    const summary = gamification.getSummary();
    const countEl = document.getElementById('achievement-count');
    if (countEl) {
        countEl.textContent = `${summary.unlocked}/${summary.total}`;
    }

    // Render achievements grid
    const gridEl = document.getElementById('achievements-grid');
    if (!gridEl) return;

    const allAchievements = gamification.getAllAchievements(stats);

    // Sort: unlocked first, then by progress
    allAchievements.sort((a, b) => {
        if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
        return b.progress - a.progress;
    });

    gridEl.innerHTML = allAchievements.map(achievement => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
            ${!achievement.unlocked ? `
                <div class="achievement-progress">
                    <div class="achievement-progress-fill" style="width: ${achievement.progress}%"></div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <span class="achievement-icon">${achievement.icon}</span>
            <div>
                <div class="achievement-notification-title">Achievement Unlocked!</div>
                <div class="achievement-notification-name">${achievement.name}</div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Export functions for debugging
window.sorceryApp = {
    allCards,
    collection,
    wishlist,
    tradeBinder,
    decks,
    ownedPrecons,
    PRECONS,
    priceService: typeof priceService !== 'undefined' ? priceService : null,
    collectionTracker: typeof collectionTracker !== 'undefined' ? collectionTracker : null,
    gamification: typeof gamification !== 'undefined' ? gamification : null
};

// ============================================
// AUTHENTICATION & CLOUD SYNC
// ============================================

// Current modal card for photo upload
let currentPhotoCardName = null;

// Initialize auth UI on page load
function initAuthUI() {
    updateAuthUI();
    setupAuthEventListeners();
}

// Update auth UI based on login state
function updateAuthUI() {
    const loggedOutSection = document.getElementById('user-logged-out');
    const loggedInSection = document.getElementById('user-logged-in');
    const userDisplayName = document.getElementById('user-display-name');

    if (nocoDBService.isLoggedIn()) {
        loggedOutSection.classList.add('hidden');
        loggedInSection.classList.remove('hidden');
        const user = nocoDBService.getCurrentUser();
        userDisplayName.textContent = user.displayName || user.email;
    } else {
        loggedOutSection.classList.remove('hidden');
        loggedInSection.classList.add('hidden');
    }
}

// Setup auth event listeners
function setupAuthEventListeners() {
    // Login button
    document.getElementById('login-btn')?.addEventListener('click', () => {
        openAuthModal('login');
    });

    // Register button
    document.getElementById('register-btn')?.addEventListener('click', () => {
        openAuthModal('register');
    });

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        nocoDBService.logout();
        updateAuthUI();
        showNotification('Logged out successfully');
    });

    // Sync button
    document.getElementById('sync-btn')?.addEventListener('click', () => {
        openSyncModal();
    });

    // Auth modal tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            switchAuthTab(tabType);
        });
    });

    // Auth modal close
    document.querySelector('#auth-modal .close-modal')?.addEventListener('click', () => {
        closeModal('auth-modal');
    });

    // Sync modal close
    document.querySelector('#sync-modal .close-modal')?.addEventListener('click', () => {
        closeModal('sync-modal');
    });

    // Photo modal close
    document.querySelector('#photo-modal .close-modal')?.addEventListener('click', () => {
        closeModal('photo-modal');
    });

    // Profile modal close
    document.querySelector('#profile-modal .close-modal')?.addEventListener('click', () => {
        closeModal('profile-modal');
    });

    // Deck detail modal close
    document.querySelector('#deck-detail-modal .close-modal')?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal('deck-detail-modal');
    });

    // Deck detail modal - close on backdrop click
    document.getElementById('deck-detail-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'deck-detail-modal') {
            closeModal('deck-detail-modal');
        }
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('deck-detail-modal');
            closeModal('card-modal');
            closeModal('auth-modal');
            closeModal('profile-modal');
        }
    });

    // Profile bio character counter
    document.getElementById('profile-bio')?.addEventListener('input', (e) => {
        document.getElementById('bio-char-count').textContent = e.target.value.length;
    });

    // Profile public toggle - show/hide share section
    document.getElementById('profile-is-public')?.addEventListener('change', (e) => {
        const shareSection = document.getElementById('profile-share-section');
        if (shareSection) {
            shareSection.style.display = e.target.checked ? '' : 'none';
        }
    });

    // Save profile button
    document.getElementById('save-profile-btn')?.addEventListener('click', saveProfileSettings);

    // Copy profile URL button
    document.getElementById('copy-profile-url')?.addEventListener('click', copyProfileUrl);

    // Login form
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);

    // Register form
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);

    // Sync upload button
    document.getElementById('sync-upload-btn')?.addEventListener('click', handleSyncUpload);

    // Sync download button
    document.getElementById('sync-download-btn')?.addEventListener('click', handleSyncDownload);

    // Add photo button in card modal
    document.getElementById('add-photo-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name')?.textContent;
        if (cardName) {
            openPhotoModal(cardName);
        }
    });

    // Photo capture button
    document.getElementById('capture-photo-btn')?.addEventListener('click', () => {
        document.getElementById('photo-file-input')?.click();
    });

    // Photo upload button
    document.getElementById('upload-photo-btn')?.addEventListener('click', () => {
        document.getElementById('photo-file-input')?.click();
    });

    // Photo file input
    document.getElementById('photo-file-input')?.addEventListener('change', handlePhotoSelect);

    // Save photo button
    document.getElementById('save-photo-btn')?.addEventListener('click', handleSavePhoto);
}

// Open auth modal
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    switchAuthTab(tab);
    
    // Clear previous errors
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('register-error').classList.add('hidden');
}

// Switch auth tab
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const user = await nocoDBService.login(email, password);
        closeModal('auth-modal');
        updateAuthUI();
        showNotification('Welcome back!');

        // Initialize profile
        if (typeof profileService !== 'undefined') {
            await profileService.loadProfileFromCloud(user.id);
            if (!profileService.getProfile()) {
                await profileService.initProfile(user.id, user.displayName);
            }
        }

        // Clear form
        e.target.reset();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const errorEl = document.getElementById('register-error');

    // Validate passwords match
    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match';
        errorEl.classList.remove('hidden');
        return;
    }

    try {
        const user = await nocoDBService.register(email, password, name);
        closeModal('auth-modal');
        updateAuthUI();
        showNotification('Account created! Welcome to Sorcery Collection Manager!');

        // Initialize profile for new user
        if (typeof profileService !== 'undefined') {
            await profileService.initProfile(user.id, name);
        }

        // Clear form
        e.target.reset();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

// Open sync modal
function openSyncModal() {
    if (!nocoDBService.isLoggedIn()) {
        showNotification('Please login first to sync your collection');
        openAuthModal('login');
        return;
    }

    const modal = document.getElementById('sync-modal');
    modal.classList.remove('hidden');

    // Update last sync time
    const lastSync = localStorage.getItem('sorcery-last-sync');
    const lastSyncEl = document.getElementById('last-sync-time');
    if (lastSync) {
        lastSyncEl.textContent = new Date(lastSync).toLocaleString();
    } else {
        lastSyncEl.textContent = 'Never';
    }

    // Hide status
    document.getElementById('sync-status').classList.add('hidden');
}

// Handle sync upload
async function handleSyncUpload() {
    const statusEl = document.getElementById('sync-status');
    const messageEl = statusEl.querySelector('.sync-message');

    statusEl.classList.remove('hidden');
    messageEl.textContent = 'Uploading collection to cloud...';

    try {
        // Convert collection Set to object format
        const collectionObj = {};
        collection.forEach(cardName => {
            collectionObj[cardName] = { qty: 1 };
        });

        const results = await nocoDBService.fullSyncToCloud(
            collectionObj,
            wishlist,
            tradeBinder,
            decks
        );

        // Save last sync time
        localStorage.setItem('sorcery-last-sync', new Date().toISOString());

        messageEl.textContent = 'Upload complete!';
        setTimeout(() => {
            closeModal('sync-modal');
            showNotification('Collection synced to cloud!');
        }, 1500);
    } catch (error) {
        messageEl.textContent = 'Error: ' + error.message;
    }
}

// Handle sync download
async function handleSyncDownload() {
    const statusEl = document.getElementById('sync-status');
    const messageEl = statusEl.querySelector('.sync-message');

    statusEl.classList.remove('hidden');
    messageEl.textContent = 'Downloading from cloud...';

    try {
        const data = await nocoDBService.fullDownloadFromCloud();

        // Update local collection
        collection.clear();
        Object.keys(data.collection).forEach(cardName => {
            collection.add(cardName);
        });

        // Update wishlist
        wishlist.clear();
        data.wishlist.forEach(cardName => {
            wishlist.add(cardName);
        });

        // Update trade binder
        tradeBinder.clear();
        data.tradeBinder.forEach(cardName => {
            tradeBinder.add(cardName);
        });

        // Update decks
        decks = data.decks;

        // Save locally
        saveLocalData();

        // Re-render
        renderCards();
        renderCollection();
        renderWishlist();
        renderTradeBinder();
        renderDecks();
        updateStats();

        // Save last sync time
        localStorage.setItem('sorcery-last-sync', new Date().toISOString());

        messageEl.textContent = 'Download complete!';
        setTimeout(() => {
            closeModal('sync-modal');
            showNotification('Collection downloaded from cloud!');
        }, 1500);
    } catch (error) {
        messageEl.textContent = 'Error: ' + error.message;
    }
}

// Open photo modal
function openPhotoModal(cardName) {
    if (!nocoDBService.isLoggedIn()) {
        showNotification('Please login to upload photos');
        openAuthModal('login');
        return;
    }

    currentPhotoCardName = cardName;
    const modal = document.getElementById('photo-modal');
    document.getElementById('photo-card-name').textContent = cardName;

    // Reset form
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('photo-placeholder').style.display = 'flex';
    document.getElementById('photo-condition').value = 'NM';
    document.getElementById('photo-notes').value = '';
    document.getElementById('save-photo-btn').disabled = true;

    // Load existing photos
    loadCardPhotos(cardName);

    modal.classList.remove('hidden');
}

// Handle photo selection
function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const preview = document.getElementById('photo-preview');
        preview.src = event.target.result;
        preview.classList.remove('hidden');
        document.getElementById('photo-placeholder').style.display = 'none';
        document.getElementById('save-photo-btn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Handle save photo
async function handleSavePhoto() {
    const preview = document.getElementById('photo-preview');
    const condition = document.getElementById('photo-condition').value;
    const notes = document.getElementById('photo-notes').value;

    if (!preview.src || !currentPhotoCardName) return;

    try {
        // Compress and convert to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = async () => {
            // Resize to max 800px
            const maxSize = 800;
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

            try {
                await nocoDBService.uploadCardPhoto(
                    currentPhotoCardName,
                    compressedBase64,
                    condition,
                    notes
                );

                showNotification('Photo saved!');
                loadCardPhotos(currentPhotoCardName);

                // Reset form
                preview.classList.add('hidden');
                document.getElementById('photo-placeholder').style.display = 'flex';
                document.getElementById('save-photo-btn').disabled = true;
                document.getElementById('photo-file-input').value = '';
            } catch (error) {
                showNotification('Error saving photo: ' + error.message);
            }
        };

        img.src = preview.src;
    } catch (error) {
        showNotification('Error processing photo');
    }
}

// Load existing card photos
async function loadCardPhotos(cardName) {
    const gridEl = document.getElementById('card-photos-grid');
    gridEl.innerHTML = '<p class="loading-text">Loading photos...</p>';

    try {
        const photos = await nocoDBService.getCardPhotos(cardName);

        if (photos.length === 0) {
            gridEl.innerHTML = '<p class="empty-message">No photos yet</p>';
            return;
        }

        gridEl.innerHTML = photos.map(photo => `
            <div class="photo-thumb" data-id="${photo.Id}">
                <img src="${photo.image_base64}" alt="Card photo">
                <button class="delete-photo" onclick="deleteCardPhoto(${photo.Id})">&times;</button>
            </div>
        `).join('');
    } catch (error) {
        gridEl.innerHTML = '<p class="error-message">Error loading photos</p>';
    }
}

// Delete card photo
async function deleteCardPhoto(photoId) {
    if (!confirm('Delete this photo?')) return;

    try {
        await nocoDBService.deleteCardPhoto(photoId);
        showNotification('Photo deleted');
        if (currentPhotoCardName) {
            loadCardPhotos(currentPhotoCardName);
        }
    } catch (error) {
        showNotification('Error deleting photo: ' + error.message);
    }
}

// Close modal helper
function closeModal(modalId) {
    document.getElementById(modalId)?.classList.add('hidden');
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Save local data helper
function saveLocalData() {
    localStorage.setItem('sorcery-collection', JSON.stringify([...collection]));
    localStorage.setItem('sorcery-wishlist', JSON.stringify([...wishlist]));
    localStorage.setItem('sorcery-trade-binder', JSON.stringify([...tradeBinder]));
    localStorage.setItem('sorcery-decks', JSON.stringify(decks));
}

// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(initAuthUI, 100);
});

// Export additional functions
window.sorceryApp.nocoDBService = typeof nocoDBService !== 'undefined' ? nocoDBService : null;
window.deleteCardPhoto = deleteCardPhoto;
