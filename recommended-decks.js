// ============================================
// DECKS RECOMENDADOS DA COMUNIDADE
// Fonte: Curiosa.io - Decks mais populares
// ============================================

const RECOMMENDED_DECKS = [
    {
        id: 'a-feast-for-crows',
        name: 'A Feast for Crows (Gothic Update)',
        author: '@Assorted Animals (Anthony)',
        url: 'https://curiosa.io/decks/cm6xsgyny000jjx03c7jrcgwa',
        views: 2058,
        likes: 38,
        format: 'Constructed',
        isPrimer: true,
        description: 'Um dos decks mais populares da comunidade com atualização para Gothic.',
        avatar: 'Custom',
        elements: ['Air', 'Earth'],
        tier: 'S',
        estimatedPrice: 85,
        keyCards: ['Grim Reaper', 'Phase Assassin', 'Autumn Unicorn', 'Rolling Boulder', 'Ordinary Village']
    },
    {
        id: 'a-giant-pita',
        name: 'A Giant PITA',
        author: '@Gr4ppl3r',
        url: 'https://curiosa.io/decks/cm310uikh008qnvkabhwjog9n',
        views: 2043,
        likes: 31,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck agressivo focado em criaturas grandes.',
        avatar: 'Geomancer',
        elements: ['Earth'],
        tier: 'S',
        estimatedPrice: 72,
        keyCards: ['Slumbering Giantess', 'Bosk Troll', 'Border Militia', 'Landslide', 'Entangle']
    },
    {
        id: 'dark-depths',
        name: 'Dark Depths (Top 32 Ira\'s League)',
        author: '@CanCount210',
        url: 'https://curiosa.io/decks/cmja9e76o4rah1afqb0gyg247',
        views: 1270,
        likes: 16,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck competitivo que chegou ao Top 32 na Ira\'s League.',
        avatar: 'Custom',
        elements: ['Water', 'Air'],
        tier: 'A',
        estimatedPrice: 95,
        keyCards: ['Daperyll Vampire', 'Chain Lightning', 'Blink', 'Skirmishers of Mu', 'Chaos Twister']
    },
    {
        id: 'boots-walking',
        name: 'These Boots Are Made for Walkin\'',
        author: '@Sgamba',
        url: 'https://curiosa.io/decks/cmk9l8p9s005304k3rtcgs1sm',
        views: 719,
        likes: 8,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck brasileiro popular com estratégia única.',
        avatar: 'Custom',
        elements: ['Fire', 'Earth'],
        tier: 'A',
        estimatedPrice: 68,
        keyCards: ['Blaze', 'Fireball', 'Colicky Dragonettes', 'Autumn Unicorn', 'Sacred Scarabs']
    },
    {
        id: 'village-idiots',
        name: 'Village Idiots',
        author: '@bailey_boy59',
        url: 'https://curiosa.io/decks/cmmaq9bep004p04juv6w3wr0a',
        views: 362,
        likes: 9,
        format: 'Constructed',
        isPrimer: false,
        description: 'Deck focado em sinergias de Village.',
        avatar: 'Geomancer',
        elements: ['Earth'],
        tier: 'A',
        estimatedPrice: 45,
        keyCards: ['Ordinary Village', 'Border Militia', 'Bosk Troll', 'Entangle']
    },
    {
        id: 'haphephobia',
        name: 'Haphephobia',
        author: '@ojichibontsu_',
        url: 'https://curiosa.io/decks/cmmyjbp9i004g04l8k89clksu',
        views: 252,
        likes: 2,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck com estratégia de controle.',
        avatar: 'Custom',
        elements: ['Air', 'Water'],
        tier: 'A',
        estimatedPrice: 78,
        keyCards: ['Lightning Bolt', 'Blink', 'Chain Lightning', 'Grapple Shot']
    },
    {
        id: 'grasp-of-undeath',
        name: 'Grasp of Undeath',
        author: '@Loki-',
        url: 'https://curiosa.io/decks/cmn58l430010g04l49woa2vcm',
        views: 125,
        likes: 0,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck de Undead/Necromancer para Gothic.',
        avatar: 'Necromancer',
        elements: ['Air', 'Earth'],
        tier: 'B',
        estimatedPrice: 55,
        keyCards: ['Grim Reaper', 'Devil\'s Egg', 'Phase Assassin', 'Rolling Boulder']
    },
    {
        id: 'faerie-flood',
        name: 'Faerie Flood',
        author: '@Bad@Game',
        url: 'https://curiosa.io/decks/cmjsjcsau4rfh2bf3faqxvbaa',
        views: 128,
        likes: 1,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck focado em Faeries com flood de criaturas.',
        avatar: 'Custom',
        elements: ['Air', 'Water'],
        tier: 'B',
        estimatedPrice: 42,
        keyCards: ['Skirmishers of Mu', 'Blink', 'Chain Lightning']
    },
    {
        id: 'undead-geomancer',
        name: 'Undead Geomancer (Earth/Air)',
        author: '@Igwis',
        url: 'https://curiosa.io/decks/cmmwmpq2600lx04jwedqskblc',
        views: 77,
        likes: 3,
        format: 'Constructed',
        isPrimer: false,
        description: 'Combinação de Earth com mecânicas Undead.',
        avatar: 'Geomancer',
        elements: ['Earth', 'Air'],
        tier: 'B',
        estimatedPrice: 52,
        keyCards: ['Bosk Troll', 'Grim Reaper', 'Autumn Unicorn', 'Devil\'s Egg']
    },
    {
        id: 'persecute-angels',
        name: 'Persecute! Angels Vs Evil',
        author: '@Ck Singapore',
        url: 'https://curiosa.io/decks/cmmk7z64f008z04jv31selz6r',
        views: 121,
        likes: 2,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck temático de Persecutor com Angels.',
        avatar: 'Persecutor',
        elements: ['Fire', 'Air'],
        tier: 'B',
        estimatedPrice: 65,
        keyCards: ['Angel\'s Egg', 'Blaze', 'Lightning Bolt', 'Fireball']
    },
    {
        id: 'wrath-of-amoeba',
        name: 'Wrath of the Amoeba',
        author: '@Tony with a T',
        url: 'https://curiosa.io/decks/cls3nibxh009y1mkkksmpzte9',
        views: 120,
        likes: 0,
        format: 'Constructed',
        isPrimer: false,
        description: 'Deck com estratégia de tokens/swarm.',
        avatar: 'Custom',
        elements: ['Water'],
        tier: 'B',
        estimatedPrice: 38,
        keyCards: ['Skirmishers of Mu', 'Blink']
    },
    {
        id: 'flamecaller-burn',
        name: 'Flamecaller Burn',
        author: '@Zorgoth',
        url: 'https://curiosa.io/decks/cmnnxzi7j00qb04jj1q7lqvn5',
        views: 1,
        likes: 0,
        format: 'Constructed',
        isPrimer: false,
        description: 'Deck agressivo de Fire com dano direto.',
        avatar: 'Flamecaller',
        elements: ['Fire'],
        tier: 'B',
        beginner: true,
        estimatedPrice: 35,
        keyCards: ['Blaze', 'Fireball', 'Incinerate', 'Sacred Scarabs']
    },
    {
        id: 'archimago-burn',
        name: 'Archimago Burn',
        author: '@Katz',
        url: 'https://curiosa.io/decks/cmmx5h3z200a304l2n7a3x729',
        views: 60,
        likes: 0,
        format: 'Constructed',
        isPrimer: false,
        description: 'Variação de burn com Archimago.',
        avatar: 'Custom',
        elements: ['Fire'],
        tier: 'B',
        estimatedPrice: 40,
        keyCards: ['Blaze', 'Fireball', 'Lightning Bolt']
    }
];

// Decks campeões de torneios
const TOURNAMENT_DECKS = [
    {
        id: 'sorcerycon-champion',
        name: 'Let Sleeping Giants Lie (SorceryCon Champion)',
        tournament: 'SorceryCon 2024',
        player: 'Gilbert Medeiros',
        url: 'https://sorcerytcg.com/news/gilbert-mederios-sorcerycon-constructed-champion-deck',
        avatar: 'Sorcerer',
        elements: ['Earth', 'Fire'],
        description: 'Deck hiper-agressivo de Earth/Fire que utiliza o Sorcerer como motor de draw.',
        keyCards: ['Colicky Dragonettes', 'Slumbering Giantess', 'Bosk Troll', 'Autumn Unicorns', 'Blaze'],
        estimatedPrice: 110,
        tier: 'S',
        views: 5000,
        likes: 150
    },
    {
        id: 'gencon-champion',
        name: 'Hot Springs Druid (Gen Con 2025 Champion)',
        tournament: 'Gen Con 2025 Crossroads',
        player: 'Nate "Duo" Smith',
        url: 'https://sorcerytcg.com/news/gen-con-2025-crossroads-champion-deck-breakdown',
        avatar: 'Druid',
        elements: ['Water', 'Fire'],
        description: 'Deck Water/Fire "Hot Springs" que utiliza Pond para flexibilidade.',
        keyCards: ['Redcap Powries', 'Monstrous Lion', 'Wyvern', 'Sir Agravaine', 'Morgana le Fay', 'Geyser'],
        estimatedPrice: 125,
        tier: 'S',
        views: 4500,
        likes: 120
    }
];

// Cartas staples por elemento (mais usadas em decks competitivos)
const STAPLE_CARDS = {
    'Air': [
        'Lightning Bolt',
        'Grim Reaper',
        'Phase Assassin',
        'Skirmishers of Mu',
        'Daperyll Vampire',
        'Chain Lightning',
        'Blink',
        'Angel\'s Egg',
        'Devil\'s Egg',
        'Chaos Twister',
        'Grapple Shot',
        'Rolling Boulder'
    ],
    'Earth': [
        'Autumn Unicorn',
        'Border Militia',
        'Bosk Troll',
        'Slumbering Giantess',
        'Colicky Dragonettes',
        'Landslide',
        'Entangle',
        'Ordinary Village'
    ],
    'Fire': [
        'Blaze',
        'Fireball',
        'Lightning Bolt',
        'Incinerate',
        'Sacred Scarabs',
        'Colicky Dragonettes',
        'Quarrelsome Kobolds',
        'Flamecaller'
    ],
    'Water': [
        'Frost Bolt',
        'Freeze',
        'Diluvian Kraken',
        'Mermaid',
        'Polar Explorers',
        'Geyser',
        'Riptide'
    ],
    'Multi/Neutral': [
        'Rolling Boulder',
        'Pact with the Devil',
        'Disintegrate',
        'Polymorph',
        'Selfsame Simulacrum',
        'Morgana le Fay',
        'Sir Agravaine',
        'Wyvern'
    ]
};

// Decks para iniciantes (usando cartas dos precons)
const BEGINNER_UPGRADES = {
    'beta-fire': {
        name: 'Fire Precon Upgrades',
        description: 'Melhorias sugeridas para o precon de Fire',
        cardsToAdd: [
            { name: 'Blaze', qty: 2, reason: 'Mobilidade e dano' },
            { name: 'Disintegrate', qty: 1, reason: 'Remoção eficiente' },
            { name: 'Quarrelsome Kobolds', qty: 2, reason: 'Mais agressão early game' }
        ],
        cardsToRemove: [
            { name: 'Major Explosion', qty: 1, reason: 'Muito caro' },
            { name: 'Infernal Legion', qty: 1, reason: 'Muito caro para aggro' }
        ]
    },
    'beta-air': {
        name: 'Air Precon Upgrades',
        description: 'Melhorias sugeridas para o precon de Air',
        cardsToAdd: [
            { name: 'Grim Reaper', qty: 1, reason: 'Finisher poderoso' },
            { name: 'Phase Assassin', qty: 2, reason: 'Evasion e dano' },
            { name: 'Angel\'s Egg', qty: 2, reason: 'Value card' }
        ],
        cardsToRemove: [
            { name: 'Highland Clansmen', qty: 1, reason: 'Muito caro' },
            { name: 'Roaming Monster', qty: 1, reason: 'Inconsistente' }
        ]
    },
    'gothic-necromancer': {
        name: 'Necromancer Precon Upgrades',
        description: 'Melhorias para o precon Necromancer',
        cardsToAdd: [
            { name: 'Grim Reaper', qty: 1, reason: 'Sinergia com undead' },
            { name: 'Raise Dead', qty: 2, reason: 'Recursão' }
        ],
        cardsToRemove: []
    }
};

// Export para uso no app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RECOMMENDED_DECKS, TOURNAMENT_DECKS, STAPLE_CARDS, BEGINNER_UPGRADES };
}
