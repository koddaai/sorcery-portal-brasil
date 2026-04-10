// ============================================
// TOP CARDS - CARTAS MAIS USADAS EM DECKS
// Fonte: sorcerycard.io/top - Baseado em 20,000+ decks
// ============================================

// Top cards data with usage statistics
const TOP_CARDS_DATA = {
    // Last updated
    lastUpdated: '2026-04-10',

    // Most played cards this week (from sorcerycard.io)
    thisWeek: [
        { name: 'Ring of Morrigan', decks: 9, views: 220, type: 'Artifact', elements: ['Air'] },
        { name: 'Toolbox', decks: 9, views: 235, type: 'Artifact', elements: [] },
        { name: 'Lightning Bolt', decks: 6, views: 180, type: 'Magic', elements: ['Air'] },
        { name: 'Torshammar Trinket', decks: 5, views: 150, type: 'Artifact', elements: [] },
        { name: 'Grapple Shot', decks: 4, views: 120, type: 'Magic', elements: ['Air'] },
        { name: 'Daperyll Vampire', decks: 4, views: 140, type: 'Minion', elements: ['Air', 'Water'] },
        { name: 'The Great Famine', decks: 4, views: 95, type: 'Magic', elements: ['Earth'] },
        { name: 'Boudicca', decks: 4, views: 110, type: 'Minion', elements: ['Earth', 'Fire'] },
        { name: 'Colicky Dragonettes', decks: 4, views: 130, type: 'Minion', elements: ['Fire'] },
        { name: 'Morgana le Fay', decks: 4, views: 125, type: 'Minion', elements: ['Air', 'Water'] },
        { name: 'Grandmaster Wizard', decks: 4, views: 115, type: 'Minion', elements: ['Air'] },
        { name: 'Browse', decks: 4, views: 100, type: 'Magic', elements: ['Air'] },
        { name: 'Disintegrate', decks: 3, views: 90, type: 'Magic', elements: ['Air'] },
        { name: 'Balor of the Evil Eye', decks: 3, views: 85, type: 'Minion', elements: ['Fire'] }
    ],

    // Top cards by element (aggregated from competitive decks)
    byElement: {
        'Fire': [
            { name: 'Colicky Dragonettes', usage: 78, type: 'Minion', description: 'Agressão rápida com burrow' },
            { name: 'Blaze', usage: 72, type: 'Magic', description: 'Mobilidade e dano direto' },
            { name: 'Sacred Scarabs', usage: 68, type: 'Minion', description: 'Eficiência de custo' },
            { name: 'Fireball', usage: 65, type: 'Magic', description: 'Remoção versátil' },
            { name: 'Quarrelsome Kobolds', usage: 55, type: 'Minion', description: 'Early game agressivo' },
            { name: 'Incinerate', usage: 52, type: 'Magic', description: 'Remoção direta' },
            { name: 'Boudicca', usage: 48, type: 'Minion', description: 'Finisher poderoso' },
            { name: 'Active Volcano', usage: 85, type: 'Site', description: 'Threshold de Fire' },
            { name: 'River of Flame', usage: 70, type: 'Site', description: 'Draw e threshold' }
        ],
        'Earth': [
            { name: 'Bosk Troll', usage: 82, type: 'Minion', description: 'Corpo grande e reach' },
            { name: 'Border Militia', usage: 78, type: 'Magic', description: 'Proteção de sites' },
            { name: 'Autumn Unicorn', usage: 75, type: 'Minion', description: 'Valor consistente' },
            { name: 'Slumbering Giantess', usage: 70, type: 'Minion', description: 'Finisher econômico' },
            { name: 'Landslide', usage: 65, type: 'Magic', description: 'Remoção de sites' },
            { name: 'Entangle', usage: 62, type: 'Magic', description: 'Removal versátil' },
            { name: 'The Great Famine', usage: 45, type: 'Magic', description: 'Board wipe condicional' },
            { name: 'Ordinary Village', usage: 88, type: 'Site', description: 'Geração de tokens' },
            { name: 'Fertile Earth', usage: 80, type: 'Site', description: 'Ramp e threshold' }
        ],
        'Air': [
            { name: 'Lightning Bolt', usage: 88, type: 'Magic', description: 'A melhor remoção do jogo' },
            { name: 'Blink', usage: 82, type: 'Magic', description: 'Proteção e combate' },
            { name: 'Grim Reaper', usage: 72, type: 'Minion', description: 'Finisher evasivo' },
            { name: 'Phase Assassin', usage: 68, type: 'Minion', description: 'Evasão e dano' },
            { name: 'Chain Lightning', usage: 65, type: 'Magic', description: 'Remoção multi-target' },
            { name: 'Grandmaster Wizard', usage: 55, type: 'Minion', description: 'Card advantage' },
            { name: 'Grapple Shot', usage: 52, type: 'Magic', description: 'Removal flexível' },
            { name: 'Ring of Morrigan', usage: 75, type: 'Artifact', description: 'Recursão poderosa' },
            { name: 'Observatory', usage: 78, type: 'Site', description: 'Threshold e scry' }
        ],
        'Water': [
            { name: 'Skirmishers of Mu', usage: 75, type: 'Minion', description: 'Evasão aérea' },
            { name: 'Frost Bolt', usage: 70, type: 'Magic', description: 'Remoção e tempo' },
            { name: 'Daperyll Vampire', usage: 68, type: 'Minion', description: 'Lifelink agressivo' },
            { name: 'Merfolk Scout', usage: 55, type: 'Minion', description: 'Filtro de draws' },
            { name: 'Geyser', usage: 52, type: 'Magic', description: 'Bounce e dano' },
            { name: 'Morgana le Fay', usage: 50, type: 'Minion', description: 'Card advantage' },
            { name: 'Coral Reef', usage: 82, type: 'Site', description: 'Threshold de Water' },
            { name: 'Tidal Pool', usage: 70, type: 'Site', description: 'Ramp e threshold' }
        ],
        'Neutral': [
            { name: 'Toolbox', usage: 85, type: 'Artifact', description: 'Busca de artefatos' },
            { name: 'Torshammar Trinket', usage: 70, type: 'Artifact', description: 'Boost de ataque' },
            { name: 'Gnome Hollows', usage: 78, type: 'Site', description: 'Mana fixing universal' },
            { name: 'Perilous Bridge', usage: 65, type: 'Site', description: 'Draw adicional' }
        ]
    },

    // Top cards by type
    byType: {
        'Minion': [
            { name: 'Bosk Troll', usage: 82, elements: ['Earth'] },
            { name: 'Colicky Dragonettes', usage: 78, elements: ['Fire'] },
            { name: 'Autumn Unicorn', usage: 75, elements: ['Earth'] },
            { name: 'Skirmishers of Mu', usage: 75, elements: ['Air', 'Water'] },
            { name: 'Grim Reaper', usage: 72, elements: ['Air'] },
            { name: 'Slumbering Giantess', usage: 70, elements: ['Earth'] },
            { name: 'Phase Assassin', usage: 68, elements: ['Air'] },
            { name: 'Daperyll Vampire', usage: 68, elements: ['Air', 'Water'] },
            { name: 'Sacred Scarabs', usage: 68, elements: ['Fire'] }
        ],
        'Magic': [
            { name: 'Lightning Bolt', usage: 88, elements: ['Air'] },
            { name: 'Blink', usage: 82, elements: ['Air'] },
            { name: 'Border Militia', usage: 78, elements: ['Earth'] },
            { name: 'Blaze', usage: 72, elements: ['Fire'] },
            { name: 'Frost Bolt', usage: 70, elements: ['Water'] },
            { name: 'Chain Lightning', usage: 65, elements: ['Air'] },
            { name: 'Fireball', usage: 65, elements: ['Fire'] },
            { name: 'Landslide', usage: 65, elements: ['Earth'] },
            { name: 'Entangle', usage: 62, elements: ['Earth'] }
        ],
        'Site': [
            { name: 'Ordinary Village', usage: 88, elements: ['Earth'] },
            { name: 'Active Volcano', usage: 85, elements: ['Fire'] },
            { name: 'Coral Reef', usage: 82, elements: ['Water'] },
            { name: 'Fertile Earth', usage: 80, elements: ['Earth'] },
            { name: 'Observatory', usage: 78, elements: ['Air'] },
            { name: 'Gnome Hollows', usage: 78, elements: [] },
            { name: 'Tidal Pool', usage: 70, elements: ['Water'] },
            { name: 'River of Flame', usage: 70, elements: ['Fire'] }
        ],
        'Artifact': [
            { name: 'Toolbox', usage: 85, elements: [] },
            { name: 'Ring of Morrigan', usage: 75, elements: ['Air'] },
            { name: 'Torshammar Trinket', usage: 70, elements: [] },
            { name: 'Ruby', usage: 55, elements: ['Fire'] },
            { name: 'Emerald', usage: 52, elements: ['Earth'] },
            { name: 'Sapphire', usage: 50, elements: ['Water'] },
            { name: 'Amethyst', usage: 48, elements: ['Air'] }
        ]
    },

    // Budget alternatives for expensive staples
    budgetAlternatives: {
        'Lightning Bolt': ['Firebolts', 'Chain Lightning'],
        'Grim Reaper': ['Phase Assassin', 'Headless Haunt'],
        'Morgana le Fay': ['Grandmaster Wizard', 'Apprentice Wizard'],
        'Bosk Troll': ['Atlas Wanderers', 'Siege Giant'],
        'Ring of Morrigan': ['Onyx', 'Chains of Prometheus']
    }
};

// Calculate card popularity from decks in recommended-decks.js
function calculateCardUsageFromDecks() {
    if (typeof RECOMMENDED_DECKS === 'undefined' && typeof TOURNAMENT_DECKS === 'undefined') {
        return null;
    }

    const cardUsage = {};
    const allDecks = [
        ...(typeof RECOMMENDED_DECKS !== 'undefined' ? RECOMMENDED_DECKS : []),
        ...(typeof TOURNAMENT_DECKS !== 'undefined' ? TOURNAMENT_DECKS : [])
    ];

    allDecks.forEach(deck => {
        if (!deck.decklist) return;

        const allCards = [
            ...(deck.decklist.minions || []),
            ...(deck.decklist.spells || []),
            ...(deck.decklist.sites || []),
            ...(deck.decklist.artifacts || [])
        ];

        allCards.forEach(card => {
            if (!cardUsage[card.name]) {
                cardUsage[card.name] = { count: 0, totalQty: 0, decks: [] };
            }
            cardUsage[card.name].count++;
            cardUsage[card.name].totalQty += (card.qty || 1);
            cardUsage[card.name].decks.push(deck.name);
        });
    });

    // Convert to sorted array
    return Object.entries(cardUsage)
        .map(([name, data]) => ({
            name,
            deckCount: data.count,
            avgQty: (data.totalQty / data.count).toFixed(1),
            decks: data.decks
        }))
        .sort((a, b) => b.deckCount - a.deckCount);
}

// Initialize top cards view
function initTopCardsView() {
    renderThisWeekCards();
    renderTopCardsFilters();
    renderTopCards('all');
}

// Render filter buttons
function renderTopCardsFilters() {
    const container = document.getElementById('top-cards-filters');
    if (!container) return;

    container.innerHTML = `
        <button class="filter-btn active" data-filter="all">
            <i data-lucide="layers"></i> Todos
        </button>
        <button class="filter-btn" data-filter="Fire">
            <img src="assets/elements/fire.png" alt="Fire" class="element-icon-img"> Fire
        </button>
        <button class="filter-btn" data-filter="Earth">
            <img src="assets/elements/earth.png" alt="Earth" class="element-icon-img"> Earth
        </button>
        <button class="filter-btn" data-filter="Air">
            <img src="assets/elements/air.png" alt="Air" class="element-icon-img"> Air
        </button>
        <button class="filter-btn" data-filter="Water">
            <img src="assets/elements/water.png" alt="Water" class="element-icon-img"> Water
        </button>
        <button class="filter-btn" data-filter="Neutral">
            <i data-lucide="circle"></i> Neutros
        </button>
    `;

    // Add event listeners
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTopCards(btn.dataset.filter);
        });
    });

    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Render top cards list
function renderTopCards(elementFilter = 'all') {
    const container = document.getElementById('top-cards-list');
    if (!container) return;

    let cards = [];

    if (elementFilter === 'all') {
        // Combine all top cards from different types
        cards = TOP_CARDS_DATA.byType.Minion
            .concat(TOP_CARDS_DATA.byType.Magic)
            .concat(TOP_CARDS_DATA.byType.Site.slice(0, 5))
            .concat(TOP_CARDS_DATA.byType.Artifact.slice(0, 5))
            .sort((a, b) => b.usage - a.usage);
    } else if (TOP_CARDS_DATA.byElement[elementFilter]) {
        cards = TOP_CARDS_DATA.byElement[elementFilter];
    }

    if (cards.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhuma carta encontrada.</div>';
        return;
    }

    container.innerHTML = cards.map((card, index) => {
        const elements = card.elements || [];
        const elementIcons = elements.map(el =>
            `<img src="assets/elements/${el.toLowerCase()}.png" alt="${el}" class="element-icon-img small">`
        ).join('');

        // Find card in allCards to get image
        const cardData = typeof allCards !== 'undefined' ? allCards.find(c => c.name === card.name) : null;
        const imageUrl = cardData ? getCardImageUrl(cardData) : '';

        return `
            <div class="top-card-item" onclick="openCardByName('${card.name.replace(/'/g, "\\'")}')">
                <div class="top-card-rank">#${index + 1}</div>
                ${imageUrl ? `<div class="top-card-image"><img src="${imageUrl}" alt="${card.name}" loading="lazy"></div>` : ''}
                <div class="top-card-info">
                    <div class="top-card-name">${card.name}</div>
                    <div class="top-card-meta">
                        <span class="top-card-type">${card.type || ''}</span>
                        ${elementIcons}
                    </div>
                    ${card.description ? `<div class="top-card-desc">${card.description}</div>` : ''}
                </div>
                <div class="top-card-usage">
                    <div class="usage-bar">
                        <div class="usage-fill" style="width: ${card.usage}%"></div>
                    </div>
                    <span class="usage-text">${card.usage}%</span>
                </div>
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
    }
}

// Render this week's popular cards
function renderThisWeekCards() {
    const container = document.getElementById('top-cards-this-week');
    if (!container) return;

    const cards = TOP_CARDS_DATA.thisWeek.slice(0, 10);

    container.innerHTML = cards.map((card, index) => {
        const elements = card.elements || [];
        const elementIcons = elements.map(el =>
            `<img src="assets/elements/${el.toLowerCase()}.png" alt="${el}" class="element-icon-img small">`
        ).join('');

        return `
            <div class="week-card-item" onclick="openCardByName('${card.name.replace(/'/g, "\\'")}')">
                <span class="week-rank">#${index + 1}</span>
                <span class="week-name">${card.name}</span>
                ${elementIcons}
                <span class="week-decks">${card.decks} decks</span>
            </div>
        `;
    }).join('');
}

// Open card modal by name
function openCardByName(cardName) {
    if (typeof allCards === 'undefined' || !allCards.length) return;

    const card = allCards.find(c => c.name === cardName);
    if (card) {
        openCard(card);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TOP_CARDS_DATA, initTopCardsView, calculateCardUsageFromDecks };
}
