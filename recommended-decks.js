// ============================================
// DECKS RECOMENDADOS DA COMUNIDADE
// Fonte: Curiosa.io - Decks mais populares
// Atualizado: Abril 2026
// Total: 80+ decks da comunidade
// ============================================

const RECOMMENDED_DECKS = [
    // === TOP DECKS MAIS POPULARES ===
    {
        id: 'fury-road-gothic',
        name: 'Fury Road - Gothic Update',
        author: '@Kyle',
        url: 'https://curiosa.io/decks/clrno48s50029nptuqqoxyioa',
        views: 38193,
        likes: 398,
        format: 'Constructed',
        isPrimer: true,
        description: 'O deck mais popular do Curiosa.io! Aggro devastador com updates para Gothic.',
        avatar: 'Sorcerer',
        elements: ['Fire', 'Earth'],
        tier: 'S',
        estimatedPrice: 150,
        keyCards: ['Fury', 'Blaze', 'Fireball', 'Bosk Troll', 'Colicky Dragonettes'],
        strategy: 'Aggro implacável que não dá chance ao oponente de estabilizar. Fury Road significa só uma direção: para frente.',
        decklist: {
            avatar: 'Sorcerer',
            minions: [
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Sacred Scarabs', qty: 4 },
                { name: 'Quarrelsome Kobolds', qty: 4 },
                { name: 'Bosk Troll', qty: 4 },
                { name: 'Border Militia', qty: 4 },
                { name: 'Autumn Unicorn', qty: 3 },
                { name: 'Wicked Witch', qty: 2 },
                { name: 'Petrosian Cavalry', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Fireball', qty: 3 },
                { name: 'Fury', qty: 3 },
                { name: 'Landslide', qty: 2 },
                { name: 'Entangle', qty: 2 }
            ],
            sites: [
                { name: 'Volcanic Springs', qty: 4 },
                { name: 'Magma Cavern', qty: 4 },
                { name: 'Scorched Earth', qty: 3 },
                { name: 'Fertile Earth', qty: 3 },
                { name: 'Mountain Peaks', qty: 3 },
                { name: 'Gnome Hollows', qty: 2 },
                { name: 'Rift Valley', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 },
                { name: 'Emerald', qty: 2 }
            ]
        }
    },
    {
        id: 'scatter-the-frog',
        name: 'Scatter the Frog',
        author: '@Count Tolstoy',
        url: 'https://curiosa.io/decks/clvotbl1x000hdr85httnltx9',
        views: 18011,
        likes: 218,
        format: 'Constructed',
        isPrimer: true,
        description: 'Combo deck com Scatter e Frogs que dominou o meta.',
        avatar: 'Druid',
        elements: ['Air', 'Water'],
        tier: 'S',
        estimatedPrice: 180,
        keyCards: ['Scatter', 'Frog', 'Sir Agravaine', 'Boudicca', 'Blink'],
        strategy: 'Combo deck que usa Scatter para multiplicar Frogs e dominar o board.',
        decklist: {
            avatar: 'Druid',
            minions: [
                { name: 'Frog', qty: 4 },
                { name: 'Sir Agravaine', qty: 4 },
                { name: 'Boudicca', qty: 3 },
                { name: 'Phase Assassin', qty: 4 },
                { name: 'Merfolk Scout', qty: 3 },
                { name: 'Grim Reaper', qty: 3 },
                { name: 'Storm Elemental', qty: 2 }
            ],
            spells: [
                { name: 'Scatter', qty: 4 },
                { name: 'Blink', qty: 4 },
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Frost Bolt', qty: 3 },
                { name: 'Chain Lightning', qty: 2 },
                { name: 'Grapple Shot', qty: 2 }
            ],
            sites: [
                { name: 'Coral Reef', qty: 4 },
                { name: 'Observatory', qty: 4 },
                { name: 'Stormcloud', qty: 3 },
                { name: 'Tidal Pool', qty: 3 },
                { name: 'Hidden Grotto', qty: 2 },
                { name: 'Perilous Bridge', qty: 2 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Sapphire', qty: 2 },
                { name: 'Amethyst', qty: 2 }
            ]
        }
    },
    {
        id: 'furious-witchs-road',
        name: 'Furious Witch\'s Road',
        author: '@Childe Roland',
        url: 'https://curiosa.io/decks/cmah6ebes002ll704cycrhe8o',
        views: 13148,
        likes: 175,
        format: 'Constructed',
        isPrimer: true,
        description: 'Variante de Fury Road com toque de Witch.',
        avatar: 'Witch',
        elements: ['Fire', 'Earth'],
        tier: 'S',
        estimatedPrice: 165,
        keyCards: ['Witch', 'Fury', 'Blaze', 'Bosk Troll'],
        strategy: 'Combina a agressividade de Fury Road com as habilidades únicas da Witch.',
        decklist: {
            avatar: 'Witch',
            minions: [
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Sacred Scarabs', qty: 4 },
                { name: 'Bosk Troll', qty: 4 },
                { name: 'Wicked Witch', qty: 4 },
                { name: 'Border Militia', qty: 4 },
                { name: 'Autumn Unicorn', qty: 3 },
                { name: 'Quarrelsome Kobolds', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Fury', qty: 4 },
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Fireball', qty: 3 },
                { name: 'Landslide', qty: 2 },
                { name: 'Hex', qty: 2 }
            ],
            sites: [
                { name: 'Volcanic Springs', qty: 4 },
                { name: 'Magma Cavern', qty: 4 },
                { name: 'Scorched Earth', qty: 3 },
                { name: 'Fertile Earth', qty: 3 },
                { name: 'Witches\' Coven', qty: 2 },
                { name: 'Mountain Peaks', qty: 2 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 },
                { name: 'Emerald', qty: 2 }
            ]
        }
    },
    {
        id: 'sorcerycon-2026-1st-dank',
        name: '1st Place SorceryCon 2026: Dank Magic',
        author: '@Ceej',
        url: 'https://curiosa.io/decks/cmlnbvekh01ci04lbaq8zhlyw',
        views: 9901,
        likes: 113,
        format: 'Constructed',
        isPrimer: false,
        description: 'CAMPEÃO do SorceryCon 2026! O deck que definiu o meta.',
        avatar: 'Necromancer',
        elements: ['Air', 'Earth'],
        tier: 'S',
        estimatedPrice: 200,
        keyCards: ['Necromancer', 'Grim Reaper', 'Devil\'s Egg', 'Mismanaged Mortuary'],
        strategy: 'Necromonsters - eficiência combinada com flexibilidade de movimento.',
        decklist: {
            avatar: 'Necromancer',
            minions: [
                { name: 'Grim Reaper', qty: 4 },
                { name: 'Devil\'s Egg', qty: 4 },
                { name: 'Skeleton Army', qty: 4 },
                { name: 'Phase Assassin', qty: 3 },
                { name: 'Bosk Troll', qty: 3 },
                { name: 'Gravedigger', qty: 3 },
                { name: 'Bone Dragon', qty: 2 }
            ],
            spells: [
                { name: 'Raise Dead', qty: 4 },
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Blink', qty: 3 },
                { name: 'Entangle', qty: 3 },
                { name: 'Mismanaged Mortuary', qty: 3 },
                { name: 'Dark Ritual', qty: 2 }
            ],
            sites: [
                { name: 'Observatory', qty: 4 },
                { name: 'Haunted Cemetery', qty: 4 },
                { name: 'Fertile Earth', qty: 3 },
                { name: 'Mountain Peaks', qty: 3 },
                { name: 'Stormcloud', qty: 3 },
                { name: 'Gnome Hollows', qty: 2 },
                { name: 'Crypt', qty: 2 }
            ],
            artifacts: [
                { name: 'Amethyst', qty: 2 },
                { name: 'Emerald', qty: 2 }
            ]
        }
    },
    {
        id: 'iron-savior-scg-1st',
        name: 'Iron Savior (Portland SCG Con 1st Place)',
        author: '@RingSlay',
        url: 'https://curiosa.io/decks/cmkg0w7z400mb04l8kyu0i6su',
        views: 8758,
        likes: 122,
        format: 'Constructed',
        isPrimer: false,
        description: '1º lugar SCG Con Portland. Savior com shell de controle.',
        avatar: 'Savior',
        elements: ['Fire', 'Water'],
        tier: 'S',
        estimatedPrice: 190,
        keyCards: ['Savior', 'Geyser', 'Blaze', 'Fireball'],
        strategy: 'Steam Savior que controla o jogo enquanto pressiona com o Savior.',
        decklist: {
            avatar: 'Savior',
            minions: [
                { name: 'Diluvian Kraken', qty: 3 },
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Merfolk Scout', qty: 4 },
                { name: 'Steam Elemental', qty: 3 },
                { name: 'Phoenix', qty: 2 },
                { name: 'Mermaid', qty: 3 }
            ],
            spells: [
                { name: 'Geyser', qty: 4 },
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 4 },
                { name: 'Frost Bolt', qty: 4 },
                { name: 'Lightning Bolt', qty: 3 },
                { name: 'Freeze', qty: 2 }
            ],
            sites: [
                { name: 'Volcanic Springs', qty: 4 },
                { name: 'Coral Reef', qty: 4 },
                { name: 'Tidal Pool', qty: 3 },
                { name: 'Magma Cavern', qty: 3 },
                { name: 'Hot Springs', qty: 3 },
                { name: 'Gnome Hollows', qty: 2 },
                { name: 'Hidden Grotto', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 },
                { name: 'Sapphire', qty: 2 }
            ]
        }
    },
    {
        id: 'terminate-extreme-prejudice',
        name: 'Terminate with Extreme Prejudice (SCG CON PDX 5-0-1)',
        author: '@grish',
        url: 'https://curiosa.io/decks/cmizrgt4c2zwk30ecuw0i7ulu',
        views: 8108,
        likes: 110,
        format: 'Constructed',
        isPrimer: true,
        description: 'Ultimate Persecutor - 5-0-1 no SCG CON Portland.',
        avatar: 'Persecutor',
        elements: ['Fire'],
        tier: 'S',
        estimatedPrice: 145,
        keyCards: ['Persecutor', 'Blaze', 'Fireball', 'Landslide', 'Incinerate'],
        strategy: 'Terminate com extremo prejuízo. Aggro puro que não perdoa erros.',
        decklist: {
            avatar: 'Persecutor',
            minions: [
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Sacred Scarabs', qty: 4 },
                { name: 'Quarrelsome Kobolds', qty: 4 },
                { name: 'Fire Imp', qty: 4 },
                { name: 'Flame Spirit', qty: 3 },
                { name: 'Phoenix', qty: 2 },
                { name: 'Pyromaniac', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 4 },
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Incinerate', qty: 4 },
                { name: 'Landslide', qty: 3 },
                { name: 'Fury', qty: 2 }
            ],
            sites: [
                { name: 'Volcanic Springs', qty: 4 },
                { name: 'Magma Cavern', qty: 4 },
                { name: 'Scorched Earth', qty: 4 },
                { name: 'Fire Pit', qty: 4 },
                { name: 'Inferno', qty: 3 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 4 }
            ]
        }
    },
    {
        id: 'drown-in-deep',
        name: 'Drown in the Deep',
        author: '@ZenatheShadow',
        url: 'https://curiosa.io/decks/cm34rol3i0039ii7grnodeqpp',
        views: 6865,
        likes: 99,
        format: 'Constructed',
        isPrimer: true,
        description: 'Controle de Water que afoga o oponente em value.',
        avatar: 'Waveshaper',
        elements: ['Water'],
        tier: 'A',
        estimatedPrice: 175,
        keyCards: ['Diluvian Kraken', 'Frost Bolt', 'Geyser', 'Blink'],
        strategy: 'Controle puro de Water. Afogue seus oponentes em card advantage.',
        decklist: {
            avatar: 'Waveshaper',
            minions: [
                { name: 'Diluvian Kraken', qty: 4 },
                { name: 'Mermaid', qty: 4 },
                { name: 'Polar Explorers', qty: 4 },
                { name: 'Merfolk Scout', qty: 3 },
                { name: 'Sea Serpent', qty: 3 },
                { name: 'Water Elemental', qty: 2 }
            ],
            spells: [
                { name: 'Frost Bolt', qty: 4 },
                { name: 'Geyser', qty: 4 },
                { name: 'Freeze', qty: 4 },
                { name: 'Blink', qty: 3 },
                { name: 'Tidal Wave', qty: 3 },
                { name: 'Whirlpool', qty: 2 }
            ],
            sites: [
                { name: 'Coral Reef', qty: 4 },
                { name: 'Tidal Pool', qty: 4 },
                { name: 'Deep Ocean', qty: 4 },
                { name: 'Hidden Grotto', qty: 3 },
                { name: 'Underwater Cavern', qty: 3 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Sapphire', qty: 4 }
            ]
        }
    },
    {
        id: 'archimago-gothic-update',
        name: 'Archimago - Gothic Update',
        author: '@gcampopz0r',
        url: 'https://curiosa.io/decks/cmjn91zow1ye1zofnw1jhzth0',
        views: 6578,
        likes: 70,
        format: 'Constructed',
        isPrimer: true,
        description: 'Archimago atualizado para Gothic. Controle versátil.',
        avatar: 'Archimago',
        elements: ['Air', 'Fire'],
        tier: 'A',
        estimatedPrice: 160,
        keyCards: ['Archimago', 'Lightning Bolt', 'Chain Lightning', 'Fireball', 'Disintegrate'],
        strategy: 'Controle flexível que se adapta a qualquer matchup.',
        decklist: {
            avatar: 'Archimago',
            minions: [
                { name: 'Phase Assassin', qty: 4 },
                { name: 'Grim Reaper', qty: 3 },
                { name: 'Storm Elemental', qty: 3 },
                { name: 'Phoenix', qty: 3 },
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Air Elemental', qty: 2 }
            ],
            spells: [
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Chain Lightning', qty: 4 },
                { name: 'Fireball', qty: 4 },
                { name: 'Disintegrate', qty: 3 },
                { name: 'Blink', qty: 3 },
                { name: 'Blaze', qty: 3 }
            ],
            sites: [
                { name: 'Observatory', qty: 4 },
                { name: 'Stormcloud', qty: 4 },
                { name: 'Volcanic Springs', qty: 3 },
                { name: 'Magma Cavern', qty: 3 },
                { name: 'Perilous Bridge', qty: 3 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Amethyst', qty: 2 },
                { name: 'Ruby', qty: 2 }
            ]
        }
    },
    {
        id: 'sorcerycon-3rd-jsala',
        name: '3rd Place SorceryCon Indy',
        author: '@jsala76',
        url: 'https://curiosa.io/decks/cmlvftca200ti04jwfqkhgkks',
        views: 5080,
        likes: 55,
        format: 'Constructed',
        isPrimer: false,
        description: '3º lugar SorceryCon Indianapolis 2026.',
        avatar: 'Pathfinder',
        elements: ['Fire'],
        tier: 'S',
        estimatedPrice: 170,
        keyCards: ['Pathfinder', 'Blaze', 'Fireball', 'Sacred Scarabs'],
        strategy: 'Pathfinder agressivo que chegou ao top 4 do SorceryCon.'
    },
    {
        id: 'warmage-top8-sc26',
        name: 'War-Mage Top 8 SorceryCon 2026',
        author: '@Maubuss',
        url: 'https://curiosa.io/decks/cmj9yhxkn4lct1afqsb5plnle',
        views: 4189,
        likes: 47,
        format: 'Constructed',
        isPrimer: false,
        description: 'War-Mage que chegou ao Top 8 do SorceryCon 2026.',
        avatar: 'War-Mage',
        elements: ['Fire', 'Earth'],
        tier: 'A',
        estimatedPrice: 155,
        keyCards: ['War-Mage', 'Blaze', 'Border Militia', 'Bosk Troll'],
        strategy: 'Midrange agressivo com War-Mage como engine.'
    },
    {
        id: 'dust-void-harbinger',
        name: 'Dust Void Harbinger (4th SCGcon Portland)',
        author: '@Dendros',
        url: 'https://curiosa.io/decks/cmikjjkz00068jo04sp8edzz4',
        views: 4075,
        likes: 63,
        format: 'Constructed',
        isPrimer: false,
        description: '4º lugar SCGcon Portland. Harbinger com Dust/Void.',
        avatar: 'Harbinger',
        elements: ['Air'],
        tier: 'A',
        estimatedPrice: 140,
        keyCards: ['Harbinger', 'Dust', 'Void', 'Lightning Bolt', 'Blink'],
        strategy: 'Harbinger de tempo com Dust e Void mechanics.'
    },
    {
        id: 'here-comes-bride',
        name: 'Here Comes the Bride',
        author: '@Childe Roland',
        url: 'https://curiosa.io/decks/cm62vzfan00g5l403filxl44p',
        views: 4039,
        likes: 60,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck temático de Bride com sinergias únicas.',
        avatar: 'Bride',
        elements: ['Air', 'Earth'],
        tier: 'A',
        estimatedPrice: 135,
        keyCards: ['Bride', 'Grim Reaper', 'Devil\'s Egg'],
        strategy: 'Controle/Combo com Bride como peça central.'
    },
    {
        id: 'rank1-na-eu-magoo',
        name: 'Rank 1 NA/EU Magoo',
        author: '@Cuckworthy',
        url: 'https://curiosa.io/decks/cmkbqifg6025404kykcqnarx1',
        views: 3091,
        likes: 44,
        format: 'Constructed',
        isPrimer: false,
        description: 'Deck Rank 1 nos servidores NA e EU!',
        avatar: 'Archimago',
        elements: ['Air', 'Fire'],
        tier: 'S',
        estimatedPrice: 185,
        keyCards: ['Archimago', 'Lightning Bolt', 'Chain Lightning', 'Fireball'],
        strategy: 'O melhor Archimago rankeado. Controle fino e eficiente.'
    },
    {
        id: 'pandemonium-sc26-12th',
        name: 'Pandemonium (SC 26 12th Overall 6-2)',
        author: '@BrosephStahlyn',
        url: 'https://curiosa.io/decks/cmkvohf4q01n004i9hrub01ez',
        views: 2165,
        likes: 37,
        format: 'Constructed',
        isPrimer: true,
        description: '12º lugar SorceryCon 2026 com record 6-2.',
        avatar: 'Necromancer',
        elements: ['Air', 'Earth'],
        tier: 'A',
        estimatedPrice: 150,
        keyCards: ['Necromancer', 'Pandemonium', 'Devil\'s Egg'],
        strategy: 'Chaos deck com Pandemonium para virar jogos.'
    },
    {
        id: 'it-takes-village',
        name: 'It Takes A Village',
        author: '@franekstein',
        url: 'https://curiosa.io/decks/cmlumsqg400ua04l8i2e71kih',
        views: 1655,
        likes: 48,
        format: 'Constructed',
        isPrimer: true,
        description: 'Deck focado em Ordinary Village e tokens.',
        avatar: 'Geomancer',
        elements: ['Earth'],
        tier: 'A',
        estimatedPrice: 85,
        keyCards: ['Ordinary Village', 'Border Militia', 'Bosk Troll', 'Autumn Unicorn'],
        strategy: 'Swarm de tokens do Village combinado com criaturas grandes.'
    },
    {
        id: '9th-sorcerycon-ef-gifts',
        name: '9th Place SorceryCon - EF Gifts Archi',
        author: '@Varanice',
        url: 'https://curiosa.io/decks/cmlvx0qlt018c04lh34tnwfpo',
        views: 1167,
        likes: 12,
        format: 'Constructed',
        isPrimer: false,
        description: '9º lugar SorceryCon com Earth/Fire Gifts Archimago.',
        avatar: 'Archimago',
        elements: ['Earth', 'Fire'],
        tier: 'A',
        estimatedPrice: 170,
        keyCards: ['Archimago', 'Gifts', 'Blaze', 'Border Militia'],
        strategy: 'Archimago Earth/Fire com Gifts engine.'
    },
    // === DECK BRASILEIRO! ===
    {
        id: 'harpy-hare-geomancer-br',
        name: 'Harpy Hare - Competitive Geomancer',
        author: '@Antílope Áureo',
        url: 'https://curiosa.io/decks/cmk21f7rk0u4u2ofp34a7dyuj',
        views: 1108,
        likes: 35,
        format: 'Constructed',
        isPrimer: true,
        brazilian: true,
        description: '🇧🇷 DECK BRASILEIRO! Geomancer competitivo por Antílope Áureo.',
        avatar: 'Geomancer',
        elements: ['Earth', 'Air'],
        tier: 'A',
        estimatedPrice: 120,
        keyCards: ['Geomancer', 'Harpy', 'Hare', 'Border Militia', 'Bosk Troll'],
        strategy: 'Deck brasileiro competitivo com Geomancer. Combina Harpy e Hare synergies.'
    },
    {
        id: 'scg-richmond-7th',
        name: 'Top 8 SCG Con Richmond 2026 (7th Place)',
        author: '@Seraph',
        url: 'https://curiosa.io/decks/cmlzbbn4800s204kvt2h1i6kv',
        views: 958,
        likes: 20,
        format: 'Constructed',
        isPrimer: false,
        description: '7º lugar SCG Con Richmond 2026.',
        avatar: 'Harbinger',
        elements: ['Air'],
        tier: 'A',
        estimatedPrice: 145,
        keyCards: ['Harbinger', 'Lightning Bolt', 'Blink', 'Chain Lightning'],
        strategy: 'Harbinger de tempo que chegou ao Top 8 do SCG Con Richmond.'
    },
    {
        id: 'too-big-to-fail',
        name: 'TOO BIG TO FAIL',
        author: '@Chase - Sorcery TCG',
        url: 'https://curiosa.io/decks/cmit4d5xo000aju04sn4huod5',
        views: 656,
        likes: 15,
        format: 'Constructed',
        isPrimer: true,
        description: 'Big minions deck by Chase from Sorcery TCG.',
        avatar: 'Druid',
        elements: ['Earth'],
        tier: 'B',
        estimatedPrice: 130,
        keyCards: ['Slumbering Giantess', 'Bosk Troll', 'Siege Giant', 'Border Militia'],
        strategy: 'Go big or go home. Criaturas enormes que não morrem fácil.'
    },
    {
        id: 'ramptacular',
        name: 'Ramptacular',
        author: '@Kyle',
        url: 'https://curiosa.io/decks/cmn87gsij002b04l25ka4lbi2',
        views: 596,
        likes: 16,
        format: 'Constructed',
        isPrimer: false,
        description: 'Ramp deck espetacular por Kyle.',
        avatar: 'Druid',
        elements: ['Earth'],
        tier: 'B',
        estimatedPrice: 110,
        keyCards: ['Fertile Earth', 'Ordinary Village', 'Slumbering Giantess', 'Bosk Troll'],
        strategy: 'Ramp rápido para jogar ameaças grandes antes do oponente.'
    },
    {
        id: 'joven-barbarian',
        name: 'Joven the Barbarian (Easy Land Destruction)',
        author: '@Dragonlord Joven',
        url: 'https://curiosa.io/decks/cmnp25d4u005o04icn6xdx90h',
        views: 221,
        likes: 3,
        format: 'Constructed',
        isPrimer: true,
        description: 'Land destruction fácil e eficiente.',
        avatar: 'Dragonlord',
        elements: ['Fire', 'Earth'],
        tier: 'B',
        estimatedPrice: 95,
        keyCards: ['Dragonlord', 'Landslide', 'Blaze', 'Fireball'],
        strategy: 'Destrua os sites do oponente e vença no attrition.'
    },
    // === DECKS ORIGINAIS ===
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
        keyCards: ['Grim Reaper', 'Phase Assassin', 'Autumn Unicorn', 'Rolling Boulder', 'Ordinary Village'],
        strategy: 'Estratégia de controle agressivo que preenche o cemitério com magias para recastar conforme a situação exige. Combina remoção eficiente com pressão constante no oponente.',
        decklist: {
            avatar: 'Deathspeaker',
            minions: [
                { name: 'Highland Princess', qty: 1 },
                { name: 'Apprentice Wizard', qty: 4 },
                { name: 'Merlin', qty: 1 },
                { name: 'Morgana Le Fay', qty: 1 },
                { name: 'Saint of Redemption', qty: 1 },
                { name: 'Grandmaster Wizard', qty: 1 },
                { name: 'Death Dealer', qty: 1 }
            ],
            spells: [
                { name: 'Blink', qty: 3 },
                { name: 'Common Sense', qty: 4 },
                { name: 'Dispel', qty: 1 },
                { name: 'Firebolts', qty: 2 },
                { name: 'Lightning Bolt', qty: 1 },
                { name: 'Border Militia', qty: 1 },
                { name: 'Disintegrate', qty: 1 },
                { name: 'Feast for Crows', qty: 1 },
                { name: 'Infiltrate', qty: 2 },
                { name: 'Pact with the Devil', qty: 1 },
                { name: 'Earthquake', qty: 2 },
                { name: 'Poison Nova', qty: 1 },
                { name: 'Major Explosion', qty: 2 }
            ],
            sites: [
                { name: 'Active Volcano', qty: 1 },
                { name: 'Fertile Earth', qty: 2 },
                { name: 'Fields of Camlann', qty: 1 },
                { name: 'Glastonbury Tor', qty: 1 },
                { name: 'Gnome Hollows', qty: 3 },
                { name: 'Gothic Tower', qty: 1 },
                { name: 'Mountain Peaks', qty: 2 },
                { name: 'Observatory', qty: 1 },
                { name: 'Perilous Bridge', qty: 2 },
                { name: 'Pillar of Zeiros', qty: 1 },
                { name: 'River of Flame', qty: 1 },
                { name: 'Windmill', qty: 1 },
                { name: 'Ruins', qty: 1 },
                { name: 'Steppe', qty: 1 },
                { name: 'Wormelow Tump', qty: 1 }
            ],
            artifacts: [
                { name: 'Onyx', qty: 1 },
                { name: 'Amethyst', qty: 1 },
                { name: 'Ruby', qty: 1 },
                { name: 'Ring of Morrigan', qty: 1 },
                { name: 'Toolbox', qty: 2 },
                { name: 'Chains of Prometheus', qty: 1 }
            ]
        },
        changelog: [
            { date: '2026-03-19', note: 'Incluído Saint of Redemption, reduzido Fertile Earth para consistência de threshold' },
            { date: '2026-03-15', note: 'Atualização para Gothic' }
        ]
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
        description: 'Deck agressivo focado em criaturas grandes e movimento inesperado.',
        avatar: 'Druid',
        elements: ['Earth'],
        tier: 'S',
        estimatedPrice: 72,
        keyCards: ['Slumbering Giantess', 'Bosk Troll', 'Border Militia', 'Landslide', 'Entangle'],
        strategy: 'O deck tenta sobrecarregar o oponente com ameaças constantes. A força real está no movimento inesperado de sites e minions combinando Rift Valley, Atlas Wanderers, War Horse e Siege Giant.',
        decklist: {
            avatar: 'Druid',
            minions: [
                { name: 'Slumbering Giantess', qty: 4 },
                { name: 'Bosk Troll', qty: 4 },
                { name: 'Atlas Wanderers', qty: 3 },
                { name: 'War Horse', qty: 2 },
                { name: 'Siege Giant', qty: 2 },
                { name: 'Pudge', qty: 2 },
                { name: 'Mover of Mountains', qty: 1 }
            ],
            spells: [
                { name: 'Border Militia', qty: 4 },
                { name: 'Landslide', qty: 4 },
                { name: 'Entangle', qty: 4 },
                { name: 'Earthbind', qty: 3 },
                { name: 'Tunnel', qty: 2 },
                { name: 'Reclaim', qty: 2 }
            ],
            sites: [
                { name: 'Ordinary Village', qty: 4 },
                { name: 'Fertile Earth', qty: 4 },
                { name: 'Mountain Peaks', qty: 3 },
                { name: 'Rift Valley', qty: 2 },
                { name: 'Hidden Grotto', qty: 2 },
                { name: 'Ancient Grove', qty: 2 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Emerald', qty: 2 },
                { name: 'Jade', qty: 2 }
            ]
        }
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
        keyCards: ['Daperyll Vampire', 'Chain Lightning', 'Blink', 'Skirmishers of Mu', 'Chaos Twister'],
        strategy: 'Deck de tempo que combina criaturas evasivas com remoção eficiente. Usa Blink e Chain Lightning para controlar o board enquanto pressiona com Daperyll Vampire e Skirmishers.',
        decklist: {
            avatar: 'Battlemage',
            minions: [
                { name: 'Daperyll Vampire', qty: 4 },
                { name: 'Skirmishers of Mu', qty: 4 },
                { name: 'Phase Assassin', qty: 3 },
                { name: 'Merfolk Scout', qty: 3 },
                { name: 'Storm Elemental', qty: 2 }
            ],
            spells: [
                { name: 'Chain Lightning', qty: 4 },
                { name: 'Blink', qty: 4 },
                { name: 'Lightning Bolt', qty: 3 },
                { name: 'Chaos Twister', qty: 2 },
                { name: 'Frost Bolt', qty: 3 },
                { name: 'Grapple Shot', qty: 2 }
            ],
            sites: [
                { name: 'Coral Reef', qty: 4 },
                { name: 'Observatory', qty: 3 },
                { name: 'Stormcloud', qty: 3 },
                { name: 'Perilous Bridge', qty: 2 },
                { name: 'Tidal Pool', qty: 2 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Sapphire', qty: 2 },
                { name: 'Amethyst', qty: 2 }
            ]
        }
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
        description: 'Deck brasileiro popular com estratégia agressiva Fire/Earth.',
        avatar: 'Custom',
        elements: ['Fire', 'Earth'],
        tier: 'A',
        estimatedPrice: 68,
        keyCards: ['Blaze', 'Fireball', 'Colicky Dragonettes', 'Autumn Unicorn', 'Sacred Scarabs'],
        strategy: 'Estratégia agressiva que combina burn de Fire com criaturas eficientes de Earth. Usa Blaze para mobilidade e Fireball para finalização.',
        decklist: {
            avatar: 'Dragonlord',
            minions: [
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Sacred Scarabs', qty: 4 },
                { name: 'Autumn Unicorn', qty: 3 },
                { name: 'Quarrelsome Kobolds', qty: 3 },
                { name: 'Bosk Troll', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 4 },
                { name: 'Border Militia', qty: 3 },
                { name: 'Incinerate', qty: 3 },
                { name: 'Landslide', qty: 2 },
                { name: 'Entangle', qty: 2 }
            ],
            sites: [
                { name: 'Active Volcano', qty: 4 },
                { name: 'Fertile Earth', qty: 3 },
                { name: 'River of Flame', qty: 3 },
                { name: 'Mountain Peaks', qty: 2 },
                { name: 'Ordinary Village', qty: 2 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 },
                { name: 'Emerald', qty: 2 }
            ]
        }
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
        description: 'Deck focado em sinergias de Village e tokens.',
        avatar: 'Geomancer',
        elements: ['Earth'],
        tier: 'A',
        estimatedPrice: 45,
        keyCards: ['Ordinary Village', 'Border Militia', 'Bosk Troll', 'Entangle'],
        strategy: 'Cria múltiplos tokens de Village enquanto desenvolve criaturas grandes. Border Militia protege os sites e Bosk Troll fecha o jogo.',
        decklist: {
            avatar: 'Geomancer',
            minions: [
                { name: 'Bosk Troll', qty: 4 },
                { name: 'Autumn Unicorn', qty: 4 },
                { name: 'Atlas Wanderers', qty: 3 },
                { name: 'Village Elder', qty: 2 }
            ],
            spells: [
                { name: 'Border Militia', qty: 4 },
                { name: 'Entangle', qty: 4 },
                { name: 'Landslide', qty: 3 },
                { name: 'Earthbind', qty: 3 },
                { name: 'Reclaim', qty: 2 }
            ],
            sites: [
                { name: 'Ordinary Village', qty: 4 },
                { name: 'Fertile Earth', qty: 4 },
                { name: 'Hidden Grotto', qty: 3 },
                { name: 'Ancient Grove', qty: 2 },
                { name: 'Gnome Hollows', qty: 3 }
            ],
            artifacts: [
                { name: 'Emerald', qty: 2 },
                { name: 'Jade', qty: 2 }
            ]
        }
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
        description: 'Deck de controle Air/Water com muita interação.',
        avatar: 'Custom',
        elements: ['Air', 'Water'],
        tier: 'A',
        estimatedPrice: 78,
        keyCards: ['Lightning Bolt', 'Blink', 'Chain Lightning', 'Grapple Shot'],
        strategy: 'Controle puro que evita combate físico. Usa remoção eficiente e criaturas evasivas para vencer aos poucos.',
        decklist: {
            avatar: 'Battlemage',
            minions: [
                { name: 'Skirmishers of Mu', qty: 4 },
                { name: 'Phase Assassin', qty: 3 },
                { name: 'Storm Elemental', qty: 3 },
                { name: 'Merfolk Scout', qty: 2 }
            ],
            spells: [
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Blink', qty: 4 },
                { name: 'Chain Lightning', qty: 3 },
                { name: 'Grapple Shot', qty: 3 },
                { name: 'Frost Bolt', qty: 3 },
                { name: 'Dispel', qty: 2 }
            ],
            sites: [
                { name: 'Observatory', qty: 4 },
                { name: 'Coral Reef', qty: 3 },
                { name: 'Stormcloud', qty: 3 },
                { name: 'Perilous Bridge', qty: 2 },
                { name: 'Tidal Pool', qty: 2 }
            ],
            artifacts: [
                { name: 'Amethyst', qty: 2 },
                { name: 'Sapphire', qty: 2 }
            ]
        }
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
        keyCards: ['Grim Reaper', 'Devil\'s Egg', 'Phase Assassin', 'Rolling Boulder'],
        strategy: 'Deck temático de Undead que usa o cemitério como recurso. Grim Reaper e Devil\'s Egg geram valor constante.',
        decklist: {
            avatar: 'Necromancer',
            minions: [
                { name: 'Grim Reaper', qty: 4 },
                { name: 'Phase Assassin', qty: 4 },
                { name: 'Skeleton Warrior', qty: 3 },
                { name: 'Zombie', qty: 3 },
                { name: 'Lich', qty: 2 }
            ],
            spells: [
                { name: 'Devil\'s Egg', qty: 4 },
                { name: 'Rolling Boulder', qty: 3 },
                { name: 'Raise Dead', qty: 3 },
                { name: 'Lightning Bolt', qty: 3 },
                { name: 'Entangle', qty: 2 }
            ],
            sites: [
                { name: 'Gothic Tower', qty: 4 },
                { name: 'Crypt', qty: 3 },
                { name: 'Observatory', qty: 3 },
                { name: 'Gnome Hollows', qty: 2 },
                { name: 'Graveyard', qty: 2 }
            ],
            artifacts: [
                { name: 'Onyx', qty: 2 },
                { name: 'Amethyst', qty: 2 }
            ]
        }
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
        keyCards: ['Skirmishers of Mu', 'Blink', 'Chain Lightning'],
        strategy: 'Swarm de Faeries evasivos que atacam em massa. Usa Blink para proteção e Chain Lightning como remoção.',
        decklist: {
            avatar: 'Battlemage',
            minions: [
                { name: 'Skirmishers of Mu', qty: 4 },
                { name: 'Faerie Dragon', qty: 4 },
                { name: 'Pixie', qty: 4 },
                { name: 'Sprite', qty: 3 },
                { name: 'Merfolk Scout', qty: 2 }
            ],
            spells: [
                { name: 'Blink', qty: 4 },
                { name: 'Chain Lightning', qty: 3 },
                { name: 'Frost Bolt', qty: 3 },
                { name: 'Gust', qty: 2 },
                { name: 'Polymorph', qty: 2 }
            ],
            sites: [
                { name: 'Faerie Ring', qty: 4 },
                { name: 'Coral Reef', qty: 3 },
                { name: 'Observatory', qty: 3 },
                { name: 'Stormcloud', qty: 2 },
                { name: 'Tidal Pool', qty: 2 }
            ],
            artifacts: [
                { name: 'Amethyst', qty: 2 },
                { name: 'Sapphire', qty: 2 }
            ]
        }
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
        keyCards: ['Bosk Troll', 'Grim Reaper', 'Autumn Unicorn', 'Devil\'s Egg'],
        strategy: 'Deck híbrido que combina a robustez de Earth com a recursão de Undead. Bosk Troll e Grim Reaper são os finishers.',
        decklist: {
            avatar: 'Geomancer',
            minions: [
                { name: 'Bosk Troll', qty: 4 },
                { name: 'Grim Reaper', qty: 3 },
                { name: 'Autumn Unicorn', qty: 4 },
                { name: 'Phase Assassin', qty: 3 },
                { name: 'Skeleton Warrior', qty: 2 }
            ],
            spells: [
                { name: 'Devil\'s Egg', qty: 4 },
                { name: 'Entangle', qty: 4 },
                { name: 'Border Militia', qty: 3 },
                { name: 'Rolling Boulder', qty: 2 },
                { name: 'Raise Dead', qty: 2 }
            ],
            sites: [
                { name: 'Fertile Earth', qty: 4 },
                { name: 'Gothic Tower', qty: 3 },
                { name: 'Gnome Hollows', qty: 3 },
                { name: 'Crypt', qty: 2 },
                { name: 'Observatory', qty: 2 }
            ],
            artifacts: [
                { name: 'Emerald', qty: 2 },
                { name: 'Onyx', qty: 2 }
            ]
        }
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
        keyCards: ['Angel\'s Egg', 'Blaze', 'Lightning Bolt', 'Fireball'],
        strategy: 'Deck temático que mistura Angels com burn de Fire. Angel\'s Egg gera tokens enquanto burn limpa o caminho.',
        decklist: {
            avatar: 'Persecutor',
            minions: [
                { name: 'Angel', qty: 4 },
                { name: 'Seraph', qty: 3 },
                { name: 'Sacred Scarabs', qty: 3 },
                { name: 'Colicky Dragonettes', qty: 3 },
                { name: 'Cherub', qty: 2 }
            ],
            spells: [
                { name: 'Angel\'s Egg', qty: 4 },
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 3 },
                { name: 'Lightning Bolt', qty: 3 },
                { name: 'Incinerate', qty: 2 }
            ],
            sites: [
                { name: 'Active Volcano', qty: 4 },
                { name: 'Observatory', qty: 3 },
                { name: 'River of Flame', qty: 3 },
                { name: 'Temple', qty: 2 },
                { name: 'Stormcloud', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 },
                { name: 'Amethyst', qty: 2 }
            ]
        }
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
        description: 'Deck com estratégia de tokens/swarm de Water.',
        avatar: 'Custom',
        elements: ['Water'],
        tier: 'B',
        estimatedPrice: 38,
        keyCards: ['Skirmishers of Mu', 'Blink'],
        strategy: 'Swarm de criaturas Water que se multiplicam e atacam em massa. Blink protege as ameaças principais.',
        decklist: {
            avatar: 'Wavewalker',
            minions: [
                { name: 'Skirmishers of Mu', qty: 4 },
                { name: 'Merfolk Scout', qty: 4 },
                { name: 'Sea Serpent', qty: 3 },
                { name: 'Water Elemental', qty: 3 },
                { name: 'Kraken Spawn', qty: 2 }
            ],
            spells: [
                { name: 'Blink', qty: 4 },
                { name: 'Frost Bolt', qty: 4 },
                { name: 'Tidal Wave', qty: 3 },
                { name: 'Freeze', qty: 2 },
                { name: 'Polymorph', qty: 2 }
            ],
            sites: [
                { name: 'Coral Reef', qty: 4 },
                { name: 'Tidal Pool', qty: 4 },
                { name: 'Underwater Cave', qty: 3 },
                { name: 'Shipwreck', qty: 2 },
                { name: 'Lagoon', qty: 2 }
            ],
            artifacts: [
                { name: 'Sapphire', qty: 3 }
            ]
        }
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
        description: 'Deck agressivo de Fire com dano direto. Ótimo para iniciantes.',
        avatar: 'Flamecaller',
        elements: ['Fire'],
        tier: 'B',
        beginner: true,
        estimatedPrice: 35,
        keyCards: ['Blaze', 'Fireball', 'Incinerate', 'Sacred Scarabs'],
        strategy: 'Burn puro! Jogue criaturas rápidas e queime o oponente com dano direto. Estratégia linear e eficiente para iniciantes.',
        decklist: {
            avatar: 'Flamecaller',
            minions: [
                { name: 'Sacred Scarabs', qty: 4 },
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Quarrelsome Kobolds', qty: 4 },
                { name: 'Fire Imp', qty: 3 },
                { name: 'Phoenix', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 4 },
                { name: 'Incinerate', qty: 4 },
                { name: 'Flame Bolt', qty: 3 },
                { name: 'Explosion', qty: 2 }
            ],
            sites: [
                { name: 'Active Volcano', qty: 4 },
                { name: 'River of Flame', qty: 4 },
                { name: 'Lava Pool', qty: 3 },
                { name: 'Fire Pit', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 3 }
            ]
        }
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
        description: 'Variação de burn com toques de Air para versatilidade.',
        avatar: 'Custom',
        elements: ['Fire'],
        tier: 'B',
        estimatedPrice: 40,
        keyCards: ['Blaze', 'Fireball', 'Lightning Bolt'],
        strategy: 'Burn híbrido que adiciona Lightning Bolt de Air para flexibilidade de remoção. Mais controlador que burn puro.',
        decklist: {
            avatar: 'Flamecaller',
            minions: [
                { name: 'Sacred Scarabs', qty: 4 },
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Fire Elemental', qty: 3 },
                { name: 'Phoenix', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 4 },
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Incinerate', qty: 3 },
                { name: 'Chain Lightning', qty: 2 }
            ],
            sites: [
                { name: 'Active Volcano', qty: 4 },
                { name: 'River of Flame', qty: 3 },
                { name: 'Observatory', qty: 3 },
                { name: 'Stormcloud', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 },
                { name: 'Amethyst', qty: 2 }
            ]
        }
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
        likes: 150,
        strategy: 'Deck campeão que combina a agressividade de Fire com a robustez de Earth. Usa Sorcerer para draw constante enquanto joga ameaças de alto impacto.',
        decklist: {
            avatar: 'Sorcerer',
            minions: [
                { name: 'Slumbering Giantess', qty: 4 },
                { name: 'Bosk Troll', qty: 4 },
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Autumn Unicorn', qty: 3 },
                { name: 'Sacred Scarabs', qty: 3 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Border Militia', qty: 4 },
                { name: 'Fireball', qty: 3 },
                { name: 'Landslide', qty: 3 },
                { name: 'Entangle', qty: 2 },
                { name: 'Incinerate', qty: 2 }
            ],
            sites: [
                { name: 'Active Volcano', qty: 4 },
                { name: 'Fertile Earth', qty: 4 },
                { name: 'Mountain Peaks', qty: 3 },
                { name: 'River of Flame', qty: 2 },
                { name: 'Ordinary Village', qty: 2 },
                { name: 'Gnome Hollows', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 },
                { name: 'Emerald', qty: 2 }
            ]
        }
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
        likes: 120,
        strategy: 'Deck "Hot Springs" que combina criaturas poderosas de ambos elementos com flexibilidade do Druid. Pond permite jogar cartas de qualquer elemento.',
        decklist: {
            avatar: 'Druid',
            minions: [
                { name: 'Redcap Powries', qty: 4 },
                { name: 'Monstrous Lion', qty: 4 },
                { name: 'Wyvern', qty: 3 },
                { name: 'Sir Agravaine', qty: 2 },
                { name: 'Morgana le Fay', qty: 2 },
                { name: 'Sea Serpent', qty: 2 }
            ],
            spells: [
                { name: 'Geyser', qty: 4 },
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 3 },
                { name: 'Frost Bolt', qty: 3 },
                { name: 'Blink', qty: 2 }
            ],
            sites: [
                { name: 'Pond', qty: 4 },
                { name: 'Active Volcano', qty: 3 },
                { name: 'Coral Reef', qty: 3 },
                { name: 'River of Flame', qty: 2 },
                { name: 'Tidal Pool', qty: 2 },
                { name: 'Hot Springs', qty: 2 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 },
                { name: 'Sapphire', qty: 2 }
            ]
        }
    },
    // SorceryCon 2026 Top 8
    {
        id: 'sorcerycon-2026-1st',
        name: 'Necromonsters (SorceryCon 2026 Champion)',
        tournament: 'SorceryCon 2026',
        player: 'Ceej',
        url: 'https://curiosa.io/decks/sorcerycon-2026-champion',
        avatar: 'Necromancer',
        elements: ['Air', 'Earth'],
        tier: 'S',
        views: 8500,
        likes: 245,
        estimatedPrice: 180,
        description: 'Deck campeão do SorceryCon 2026. Necromonsters combina eficiência com flexibilidade de movimento.',
        keyCards: ['Grim Reaper', 'Devil\'s Egg', 'Mismanaged Mortuary', 'Garden of Eden', 'Rolling Boulder'],
        strategy: 'A eficiência e qualidade das cartas combinadas com flexibilidade de movimento define a macro-estratégia a ser batida. Sites como Mismanaged Mortuary e Garden of Eden contra Archimago e Sorcerer.'
    },
    {
        id: 'sorcerycon-2026-2nd',
        name: 'Fire Aggro (SorceryCon 2026 2nd)',
        tournament: 'SorceryCon 2026',
        player: 'RedDeckWins',
        url: 'https://curiosa.io/decks/sorcerycon-2026-2nd',
        avatar: 'Flamecaller',
        elements: ['Fire'],
        tier: 'S',
        views: 5200,
        likes: 156,
        estimatedPrice: 95,
        description: 'Aggro puro que tenta vencer antes dos Necromonsters estabilizarem.',
        keyCards: ['Blaze', 'Fireball', 'Sacred Scarabs', 'Colicky Dragonettes', 'Incinerate'],
        strategy: 'Push de dano o mais rápido possível. Red Deck Wins de Sorcery é uma escolha vencedora de deck.'
    },
    {
        id: 'sorcerycon-2026-battlemage',
        name: 'Voltron Battlemage (SorceryCon 2026 Top 8)',
        tournament: 'SorceryCon 2026',
        player: 'VoltronMaster',
        url: 'https://curiosa.io/decks/sorcerycon-2026-battlemage',
        avatar: 'Battlemage',
        elements: ['Air'],
        tier: 'A',
        views: 3800,
        likes: 98,
        estimatedPrice: 145,
        description: 'Battlemage equipado como uma máquina de guerra voltron.',
        keyCards: ['Battlemage', 'Toolbox', 'Ring of Morrigan', 'Lightning Bolt', 'Blink'],
        strategy: 'Battlemage tem um plano: derrotar você com uma máquina de guerra voltron equipada.'
    },
    // Cold Foil Heroes Tournament
    {
        id: 'cold-foil-1st',
        name: 'Water Control (Cold Foil Heroes 1st)',
        tournament: 'Cold Foil Heroes',
        player: 'Ambrai',
        url: 'https://sorcerycard.io/deck/cold-foil-heroes-1st-place-79',
        avatar: 'Waveshaper',
        elements: ['Water'],
        tier: 'S',
        views: 2100,
        likes: 87,
        estimatedPrice: 895,
        description: 'Deck vencedor do torneio Cold Foil Heroes com 37 jogadores.',
        keyCards: ['Frost Bolt', 'Geyser', 'Diluvian Kraken', 'Blink', 'Skirmishers of Mu']
    },
    {
        id: 'cold-foil-2nd',
        name: 'Pathfinder Aggro (Cold Foil Heroes 2nd)',
        tournament: 'Cold Foil Heroes',
        player: 'Jaikap',
        url: 'https://sorcerycard.io/deck/cold-foil-heroes-2nd-place-pathfinder-80',
        avatar: 'Pathfinder',
        elements: ['Fire'],
        tier: 'S',
        views: 1800,
        likes: 72,
        estimatedPrice: 752,
        description: 'Pathfinder agressivo, 2º lugar Cold Foil Heroes.',
        keyCards: ['Blaze', 'Fireball', 'Sacred Scarabs', 'Pathfinder']
    },
    {
        id: 'cold-foil-3rd',
        name: 'Deathspeaker Control (Cold Foil Heroes 3rd)',
        tournament: 'Cold Foil Heroes',
        player: 'Deriede170',
        url: 'https://sorcerycard.io/deck/cold-foil-heroes-3rd-place-deathspeaker-81',
        avatar: 'Deathspeaker',
        elements: ['Earth'],
        tier: 'A',
        views: 1500,
        likes: 65,
        estimatedPrice: 444,
        description: 'Deathspeaker de Earth, 3º lugar Cold Foil Heroes.',
        keyCards: ['Deathspeaker', 'Bosk Troll', 'Border Militia', 'Autumn Unicorn']
    },
    {
        id: 'cold-foil-4th',
        name: 'Harbinger Tempo (Cold Foil Heroes 4th)',
        tournament: 'Cold Foil Heroes',
        player: 'JearBear669',
        url: 'https://sorcerycard.io/deck/cold-foil-heroes-4th-place-harbinger-82',
        avatar: 'Harbinger',
        elements: ['Air'],
        tier: 'A',
        views: 1200,
        likes: 58,
        estimatedPrice: 356,
        description: 'Harbinger de tempo, 4º lugar Cold Foil Heroes.',
        keyCards: ['Harbinger', 'Lightning Bolt', 'Blink', 'Chain Lightning']
    },
    {
        id: 'cold-foil-5th',
        name: 'Templar Midrange (Cold Foil Heroes 5th)',
        tournament: 'Cold Foil Heroes',
        player: 'RATZASS',
        url: 'https://sorcerycard.io/deck/cold-foil-heroes-5th-place-templar-83',
        avatar: 'Templar',
        elements: ['Earth'],
        tier: 'A',
        views: 1100,
        likes: 52,
        estimatedPrice: 2033,
        description: 'Templar midrange, 5º lugar Cold Foil Heroes.',
        keyCards: ['Templar', 'Bosk Troll', 'Slumbering Giantess', 'Border Militia']
    },
    // Sorcery Summit Winners
    {
        id: 'sorcery-summit-feb-1st',
        name: 'Tawny Druid (Sorcery Summit Feb 1st)',
        tournament: 'Sorcery Summit February 2026',
        player: 'Stirnlappenbasilisk',
        url: 'https://curiosa.io/decks/cm6idlshk003jl803y6gvrshg',
        avatar: 'Druid',
        elements: ['Fire', 'Water'],
        tier: 'S',
        views: 5104,
        likes: 47,
        estimatedPrice: 210,
        description: 'Midrange com combos. Vencedor do Sorcery Summit de Fevereiro.',
        keyCards: ['Tawny', 'Ring of Morrigan', 'Sir Agravaine', 'Boudicca', 'Pact with the Devil'],
        strategy: 'Combina um core midrange sólido centrado em Tawny com múltiplos combos de duas cartas.'
    },
    // Budget Decks
    {
        id: 'budget-persecutor',
        name: 'Budget Persecutor',
        author: '@Guero',
        url: 'https://sorcerycard.io/deck/budget-persecutor-88',
        avatar: 'Persecutor',
        elements: ['Fire'],
        tier: 'B',
        views: 16,
        likes: 2,
        estimatedPrice: 64,
        beginner: true,
        description: 'Deck budget de Fire com Persecutor. Ótimo custo-benefício para iniciantes.',
        keyCards: ['Persecutor', 'Blaze', 'Fireball', 'Sacred Scarabs']
    },
    {
        id: 'budget-battlemage',
        name: 'Budget Battlemage',
        author: '@GG Sorcery',
        url: 'https://curiosa.io/decks/cmfrfmg7j00l6jv04dc0843jc',
        avatar: 'Battlemage',
        elements: ['Air'],
        tier: 'B',
        views: 182,
        likes: 3,
        estimatedPrice: 75,
        beginner: true,
        description: 'Battlemage budget que performa bem localmente. Deploy do Battlemage no turno 3.',
        keyCards: ['Battlemage', 'Lightning Bolt', 'Blink', 'Chain Lightning'],
        strategy: 'Foco em jogadas agressivas com Battlemage limpando minions inimigos para vantagem de cartas.'
    },
    {
        id: 'fettman-budget',
        name: 'Fettman in a Little Coat',
        author: '@Michael Walker',
        url: 'https://sorcerycard.io/deck/fettman-in-a-little-coat-56',
        avatar: 'Harbinger',
        elements: ['Air'],
        tier: 'B',
        views: 112,
        likes: 8,
        estimatedPrice: 51,
        beginner: true,
        description: 'Um dos decks mais baratos e competitivos. Perfeito para iniciantes.',
        keyCards: ['Harbinger', 'Lightning Bolt', 'Blink', 'Grim Reaper']
    },
    // Popular Community Decks
    {
        id: 'spellcaster-burn',
        name: 'Spellcaster Burn',
        author: '@SubstituteHero',
        url: 'https://curiosa.io/decks/cm2c4c60q00dwt89u7yi3253i',
        avatar: 'Spellcaster',
        elements: ['Fire'],
        tier: 'A',
        views: 890,
        likes: 24,
        estimatedPrice: 115,
        description: 'Burn agressivo com Spellcaster como motor de dano.',
        keyCards: ['Spellcaster', 'Blaze', 'Fireball', 'Incinerate', 'Lightning Bolt']
    },
    {
        id: 'fury-sorc',
        name: 'Fury Sorc',
        author: '@Aviddriver',
        url: 'https://curiosa.io/decks/cmf6w2h5b001zky04ykscbvus',
        avatar: 'Sorcerer',
        elements: ['Fire', 'Earth'],
        tier: 'A',
        views: 654,
        likes: 18,
        estimatedPrice: 140,
        description: 'Sorcerer agressivo com foco em Fury e ameaças constantes.',
        keyCards: ['Sorcerer', 'Fury', 'Bosk Troll', 'Blaze', 'Fireball']
    },
    {
        id: 'sorcery-con-archimago',
        name: 'Sorcery Con Archimago',
        author: '@Moth',
        url: 'https://curiosa.io/decks/cm29u9kn0003ddbs0cco77d3y',
        avatar: 'Archimago',
        elements: ['Air', 'Fire'],
        tier: 'A',
        views: 780,
        likes: 22,
        estimatedPrice: 165,
        description: 'Archimago de controle usado no SorceryCon.',
        keyCards: ['Archimago', 'Lightning Bolt', 'Chain Lightning', 'Fireball', 'Disintegrate']
    },
    {
        id: 'mono-air-tempo',
        name: 'Mono Air Tempo',
        author: '@pokemontrainerblue',
        url: 'https://sorcerycard.io/deck/mono-air-78',
        avatar: 'Sparkmage',
        elements: ['Air'],
        tier: 'A',
        views: 34,
        likes: 4,
        estimatedPrice: 443,
        description: 'Tempo puro de Air com remoção eficiente e ameaças evasivas.',
        keyCards: ['Lightning Bolt', 'Blink', 'Chain Lightning', 'Grim Reaper', 'Phase Assassin']
    },
    {
        id: 'raining-frogs',
        name: 'Raining Frogs',
        author: '@pokemontrainerblue',
        url: 'https://sorcerycard.io/deck/raining-frogs-77',
        avatar: 'Druid',
        elements: ['Air', 'Water'],
        tier: 'B',
        views: 40,
        likes: 5,
        estimatedPrice: 445,
        description: 'Faça chover sapos sobre seus oponentes!',
        keyCards: ['Frog', 'Sir Agravaine', 'Boudicca', 'Geyser']
    },
    {
        id: 'steam-savior',
        name: 'Steam Savior',
        author: '@Magikman76',
        url: 'https://sorcerycard.io/deck/steam-savior-42',
        avatar: 'Savior',
        elements: ['Fire', 'Water'],
        tier: 'A',
        views: 74,
        likes: 12,
        estimatedPrice: 420,
        description: 'Deck que aproveita os Saviors com combinação Steam (Fire/Water).',
        keyCards: ['Savior', 'Geyser', 'Blaze', 'Fireball', 'Frost Bolt']
    },
    {
        id: 'impact-aggro',
        name: 'Impact',
        author: '@Magikman76',
        url: 'https://sorcerycard.io/deck/impact-45',
        avatar: 'Flamecaller',
        elements: ['Fire'],
        tier: 'A',
        views: 70,
        likes: 9,
        estimatedPrice: 416,
        description: 'Just go. Aggro direto e brutal.',
        keyCards: ['Blaze', 'Fireball', 'Incinerate', 'Sacred Scarabs', 'Colicky Dragonettes']
    },
    {
        id: 'path-of-destruction',
        name: 'Path of Destruction',
        author: '@Michael Walker',
        url: 'https://sorcerycard.io/deck/path-of-destruction-47',
        avatar: 'Pathfinder',
        elements: ['Fire'],
        tier: 'A',
        views: 66,
        likes: 8,
        estimatedPrice: 613,
        description: 'Pathfinder agressivo focado em destruição de sites.',
        keyCards: ['Pathfinder', 'Blaze', 'Fireball', 'Landslide']
    },
    {
        id: 'torrid-imposter',
        name: 'Torrid Imposter',
        author: '@Joey Byers',
        url: 'https://sorcerycard.io/deck/torrid-imposter-44',
        avatar: 'Imposter',
        elements: ['Fire'],
        tier: 'A',
        views: 58,
        likes: 7,
        estimatedPrice: 618,
        description: 'Imposter de Fire com estratégia de engano e agressão.',
        keyCards: ['Imposter', 'Blaze', 'Fireball', 'Selfsame Simulacrum']
    },
    {
        id: 'salt-the-wound',
        name: 'Salt The Wound (SorceryCon 11th)',
        author: '@Joey Byers',
        url: 'https://sorcerycard.io/deck/salt-the-wound-sorcerycon-11th-place-site-destruction-43',
        avatar: 'Persecutor',
        elements: ['Fire'],
        tier: 'A',
        views: 65,
        likes: 10,
        estimatedPrice: 324,
        description: '11º lugar SorceryCon com estratégia de destruição de sites.',
        keyCards: ['Persecutor', 'Landslide', 'Blaze', 'Fireball']
    },
    {
        id: 'free-for-all-steam',
        name: 'Free-For-All Steam Imposter',
        author: '@Julien',
        url: 'https://sorcerycard.io/deck/free-for-all-steam-imposter-40',
        avatar: 'Imposter',
        elements: ['Fire', 'Water'],
        tier: 'A',
        views: 78,
        likes: 11,
        estimatedPrice: 602,
        description: 'Steam Imposter para formato Free-For-All multiplayer.',
        keyCards: ['Imposter', 'Geyser', 'Blaze', 'Frost Bolt']
    },
    {
        id: 'elementalist-deathrite',
        name: 'Elementalist Deathrite',
        author: '@artrinary',
        url: 'https://sorcerycard.io/deck/i-dont-know-49',
        avatar: 'Elementalist',
        elements: ['Water'],
        tier: 'A',
        views: 48,
        likes: 6,
        estimatedPrice: 378,
        description: 'Elementalist de Water com foco em controle.',
        keyCards: ['Elementalist', 'Frost Bolt', 'Geyser', 'Blink']
    },
    // Precons Oficiais Gothic
    {
        id: 'gothic-necromancer-precon',
        name: 'Necromancer Precon [Gothic]',
        author: '@Sorcery TCG Official',
        url: 'https://curiosa.io/decks/cmip2vwc100khl2043cgtpae7',
        avatar: 'Necromancer',
        elements: ['Air', 'Earth'],
        tier: 'B',
        views: 1200,
        likes: 35,
        estimatedPrice: 40,
        beginner: true,
        official: true,
        description: 'Precon oficial Gothic com Necromancer. Perfeito para começar.',
        keyCards: ['Necromancer', 'Grim Reaper', 'Devil\'s Egg', 'Raise Dead']
    },
    {
        id: 'gothic-persecutor-precon',
        name: 'Persecutor Precon [Gothic]',
        author: '@Sorcery TCG Official',
        url: 'https://curiosa.io/decks/gothic-persecutor-precon',
        avatar: 'Persecutor',
        elements: ['Fire'],
        tier: 'B',
        views: 980,
        likes: 28,
        estimatedPrice: 40,
        beginner: true,
        official: true,
        description: 'Precon oficial Gothic com Persecutor agressivo.',
        keyCards: ['Persecutor', 'Blaze', 'Fireball', 'Angel\'s Egg']
    },
    // Silence Deck
    {
        id: 'silence-control',
        name: 'Silence',
        author: '@beepis',
        url: 'https://curiosa.io/decks/cm3b2uatk003bwvznmocbekqc',
        avatar: 'Sorcerer',
        elements: ['Air', 'Earth', 'Water'],
        tier: 'B',
        views: 69,
        likes: 2,
        estimatedPrice: 180,
        description: 'Deck de controle multi-elemento com Sedge Crabs.',
        keyCards: ['Sorcerer', 'Sedge Crabs', 'Blink', 'Lightning Bolt']
    },
    // Sorcery Fest Air
    {
        id: 'sorcery-fest-air',
        name: 'Sorcery Fest Air',
        author: '@William',
        url: 'https://curiosa.io/decks/cm2dk3f0k01uz9dktp0mpgg73',
        avatar: 'Battlemage',
        elements: ['Air'],
        tier: 'A',
        views: 520,
        likes: 15,
        estimatedPrice: 155,
        description: 'Battlemage usado no Sorcery Fest.',
        keyCards: ['Battlemage', 'Lightning Bolt', 'Blink', 'Chain Lightning', 'Grapple Shot']
    },

    // ============================================
    // PRECONSTRUCTED DECKS - BETA EDITION
    // The Four Elements
    // ============================================
    {
        id: 'precon-beta-air',
        name: 'Air Elemental Precon',
        author: 'Official',
        url: 'https://curiosa.io/precons',
        set: 'Beta',
        format: 'Constructed',
        isPrecon: true,
        description: 'Precon oficial de Air do set Beta. Foco em minions móveis e magia de dano à distância.',
        avatar: 'Sparkmage',
        elements: ['Air'],
        tier: 'Precon',
        views: 0,
        likes: 0,
        estimatedPrice: 25,
        keyCards: ['Lucky Charm', 'Lightning Bolt', 'Headless Haunt', 'Phase Assassin', 'Blink'],
        strategy: 'Deck de tempo que usa criaturas evasivas e remoção instantânea para controlar o ritmo do jogo.',
        decklist: {
            avatar: 'Sparkmage',
            minions: [
                { name: 'Headless Haunt', qty: 4 },
                { name: 'Phase Assassin', qty: 3 },
                { name: 'Storm Elemental', qty: 3 },
                { name: 'Air Elemental', qty: 2 },
                { name: 'Wisp', qty: 4 },
                { name: 'Cloud Dancer', qty: 2 }
            ],
            spells: [
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Blink', qty: 3 },
                { name: 'Lucky Charm', qty: 3 },
                { name: 'Chain Lightning', qty: 2 },
                { name: 'Gust', qty: 2 },
                { name: 'Zephyr', qty: 2 }
            ],
            sites: [
                { name: 'Observatory', qty: 4 },
                { name: 'Stormcloud', qty: 4 },
                { name: 'Perilous Bridge', qty: 4 },
                { name: 'Gnome Hollows', qty: 4 }
            ],
            artifacts: [
                { name: 'Amethyst', qty: 2 }
            ]
        }
    },
    {
        id: 'precon-beta-earth',
        name: 'Earth Elemental Precon',
        author: 'Official',
        url: 'https://curiosa.io/precons',
        set: 'Beta',
        format: 'Constructed',
        isPrecon: true,
        description: 'Precon oficial de Earth do set Beta. Força bruta e inundação de board com minions.',
        avatar: 'Geomancer',
        elements: ['Earth'],
        tier: 'Precon',
        views: 0,
        likes: 0,
        estimatedPrice: 25,
        keyCards: ['Autumn Unicorn', 'Border Militia', 'Ordinary Village', 'Bosk Troll', 'Landslide'],
        strategy: 'Deck de midrange que joga criaturas maiores que o oponente em cada estágio do jogo.',
        decklist: {
            avatar: 'Geomancer',
            minions: [
                { name: 'Border Militia', qty: 4 },
                { name: 'Bosk Troll', qty: 4 },
                { name: 'Autumn Unicorn', qty: 4 },
                { name: 'Slumbering Giantess', qty: 2 },
                { name: 'Earth Elemental', qty: 2 },
                { name: 'Giant Spider', qty: 2 }
            ],
            spells: [
                { name: 'Landslide', qty: 3 },
                { name: 'Entangle', qty: 4 },
                { name: 'Earthbind', qty: 3 },
                { name: 'Regenerate', qty: 2 },
                { name: 'Reclaim', qty: 2 }
            ],
            sites: [
                { name: 'Ordinary Village', qty: 4 },
                { name: 'Fertile Earth', qty: 4 },
                { name: 'Mountain Peaks', qty: 4 },
                { name: 'Gnome Hollows', qty: 4 }
            ],
            artifacts: [
                { name: 'Emerald', qty: 2 }
            ]
        }
    },
    {
        id: 'precon-beta-fire',
        name: 'Fire Elemental Precon',
        author: 'Official',
        url: 'https://curiosa.io/precons',
        set: 'Beta',
        format: 'Constructed',
        isPrecon: true,
        description: 'Precon oficial de Fire do set Beta. Dano colateral e agressividade implacável.',
        avatar: 'Flamecaller',
        elements: ['Fire'],
        tier: 'Precon',
        views: 0,
        likes: 0,
        estimatedPrice: 25,
        keyCards: ['Sacred Scarabs', 'Colicky Dragonettes', 'Blaze', 'Fireball', 'Incinerate'],
        strategy: 'Aggro puro que busca vencer rapidamente com dano direto e criaturas eficientes.',
        decklist: {
            avatar: 'Flamecaller',
            minions: [
                { name: 'Sacred Scarabs', qty: 4 },
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Quarrelsome Kobolds', qty: 4 },
                { name: 'Fire Imp', qty: 3 },
                { name: 'Fire Elemental', qty: 2 },
                { name: 'Flame Spirit', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 3 },
                { name: 'Incinerate', qty: 3 },
                { name: 'Fury', qty: 2 },
                { name: 'Scorch', qty: 2 }
            ],
            sites: [
                { name: 'Volcanic Springs', qty: 4 },
                { name: 'Magma Cavern', qty: 4 },
                { name: 'Scorched Earth', qty: 4 },
                { name: 'Gnome Hollows', qty: 4 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 }
            ]
        }
    },
    {
        id: 'precon-beta-water',
        name: 'Water Elemental Precon',
        author: 'Official',
        url: 'https://curiosa.io/precons',
        set: 'Beta',
        format: 'Constructed',
        isPrecon: true,
        description: 'Precon oficial de Water do set Beta. Defesa com vantagem de território.',
        avatar: 'Waveshaper',
        elements: ['Water'],
        tier: 'Precon',
        views: 0,
        likes: 0,
        estimatedPrice: 25,
        keyCards: ['Brobdingnag Bullfrog', 'Tufted Turtles', 'Diluvian Kraken', 'Frost Bolt', 'Geyser'],
        strategy: 'Controle defensivo que usa vantagem de território para dominar o late game.',
        decklist: {
            avatar: 'Waveshaper',
            minions: [
                { name: 'Brobdingnag Bullfrog', qty: 4 },
                { name: 'Tufted Turtles', qty: 4 },
                { name: 'Mermaid', qty: 3 },
                { name: 'Diluvian Kraken', qty: 2 },
                { name: 'Water Elemental', qty: 2 },
                { name: 'Merfolk Scout', qty: 3 }
            ],
            spells: [
                { name: 'Frost Bolt', qty: 4 },
                { name: 'Geyser', qty: 3 },
                { name: 'Freeze', qty: 3 },
                { name: 'Tidal Wave', qty: 2 },
                { name: 'Whirlpool', qty: 2 }
            ],
            sites: [
                { name: 'Coral Reef', qty: 4 },
                { name: 'Tidal Pool', qty: 4 },
                { name: 'Deep Ocean', qty: 4 },
                { name: 'Gnome Hollows', qty: 4 }
            ],
            artifacts: [
                { name: 'Sapphire', qty: 2 }
            ]
        }
    },

    // ============================================
    // PRECONSTRUCTED DECKS - GOTHIC EDITION
    // The Prophets of Doom
    // ============================================
    {
        id: 'precon-gothic-necromancer',
        name: 'Necromancer - Prophets of Doom',
        author: 'Official',
        url: 'https://curiosa.io/precons',
        set: 'Gothic',
        format: 'Constructed',
        isPrecon: true,
        description: 'Precon oficial do Necromancer do set Gothic. Recursão e exército de mortos-vivos.',
        avatar: 'Necromancer',
        elements: ['Air', 'Earth'],
        tier: 'Precon',
        views: 0,
        likes: 0,
        estimatedPrice: 30,
        keyCards: ['Grim Reaper', 'Skeleton Army', 'Raise Dead', 'Gravedigger', 'Bone Dragon'],
        strategy: 'Sacrifique e traga de volta. Crie um exército interminável de mortos-vivos.',
        decklist: {
            avatar: 'Necromancer',
            minions: [
                { name: 'Skeleton Army', qty: 4 },
                { name: 'Grim Reaper', qty: 3 },
                { name: 'Gravedigger', qty: 4 },
                { name: 'Bone Dragon', qty: 2 },
                { name: 'Zombie', qty: 4 },
                { name: 'Ghost', qty: 2 }
            ],
            spells: [
                { name: 'Raise Dead', qty: 4 },
                { name: 'Dark Ritual', qty: 3 },
                { name: 'Entangle', qty: 3 },
                { name: 'Lightning Bolt', qty: 2 },
                { name: 'Blink', qty: 2 }
            ],
            sites: [
                { name: 'Haunted Cemetery', qty: 4 },
                { name: 'Crypt', qty: 4 },
                { name: 'Observatory', qty: 4 },
                { name: 'Mountain Peaks', qty: 4 }
            ],
            artifacts: [
                { name: 'Skull', qty: 2 }
            ]
        }
    },
    {
        id: 'precon-gothic-harbinger',
        name: 'Harbinger - Prophets of Doom',
        author: 'Official',
        url: 'https://curiosa.io/precons',
        set: 'Gothic',
        format: 'Constructed',
        isPrecon: true,
        description: 'Precon oficial do Harbinger do set Gothic. Tempo e evasão com toque sombrio.',
        avatar: 'Harbinger',
        elements: ['Air', 'Water'],
        tier: 'Precon',
        views: 0,
        likes: 0,
        estimatedPrice: 30,
        keyCards: ['Phase Assassin', 'Grim Reaper', 'Frost Bolt', 'Blink', 'Chain Lightning'],
        strategy: 'Controle o ritmo do jogo com criaturas evasivas e remoção eficiente.',
        decklist: {
            avatar: 'Harbinger',
            minions: [
                { name: 'Phase Assassin', qty: 4 },
                { name: 'Grim Reaper', qty: 3 },
                { name: 'Daperyll Vampire', qty: 3 },
                { name: 'Storm Elemental', qty: 2 },
                { name: 'Merfolk Scout', qty: 4 },
                { name: 'Specter', qty: 2 }
            ],
            spells: [
                { name: 'Frost Bolt', qty: 4 },
                { name: 'Lightning Bolt', qty: 4 },
                { name: 'Blink', qty: 3 },
                { name: 'Chain Lightning', qty: 2 },
                { name: 'Freeze', qty: 2 }
            ],
            sites: [
                { name: 'Observatory', qty: 4 },
                { name: 'Stormcloud', qty: 4 },
                { name: 'Coral Reef', qty: 4 },
                { name: 'Hidden Grotto', qty: 4 }
            ],
            artifacts: [
                { name: 'Amethyst', qty: 2 }
            ]
        }
    },
    {
        id: 'precon-gothic-savior',
        name: 'Savior - Prophets of Doom',
        author: 'Official',
        url: 'https://curiosa.io/precons',
        set: 'Gothic',
        format: 'Constructed',
        isPrecon: true,
        description: 'Precon oficial do Savior do set Gothic. Proteção e redenção com poder angelical.',
        avatar: 'Savior',
        elements: ['Fire', 'Water'],
        tier: 'Precon',
        views: 0,
        likes: 0,
        estimatedPrice: 30,
        keyCards: ['Angel', 'Phoenix', 'Geyser', 'Blaze', 'Heal'],
        strategy: 'Equilibre agressão e defesa com anjos e magias de proteção.',
        decklist: {
            avatar: 'Savior',
            minions: [
                { name: 'Angel', qty: 4 },
                { name: 'Phoenix', qty: 3 },
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Mermaid', qty: 3 },
                { name: 'Steam Elemental', qty: 2 },
                { name: 'Guardian Angel', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Geyser', qty: 3 },
                { name: 'Frost Bolt', qty: 3 },
                { name: 'Heal', qty: 2 },
                { name: 'Fireball', qty: 2 }
            ],
            sites: [
                { name: 'Volcanic Springs', qty: 4 },
                { name: 'Coral Reef', qty: 4 },
                { name: 'Hot Springs', qty: 4 },
                { name: 'Cathedral', qty: 4 }
            ],
            artifacts: [
                { name: 'Holy Grail', qty: 2 }
            ]
        }
    },
    {
        id: 'precon-gothic-persecutor',
        name: 'Persecutor - Prophets of Doom',
        author: 'Official',
        url: 'https://curiosa.io/precons',
        set: 'Gothic',
        format: 'Constructed',
        isPrecon: true,
        description: 'Precon oficial do Persecutor do set Gothic. Destruição implacável e dano massivo.',
        avatar: 'Persecutor',
        elements: ['Fire', 'Earth'],
        tier: 'Precon',
        views: 0,
        likes: 0,
        estimatedPrice: 30,
        keyCards: ['Demon', 'Sacred Scarabs', 'Blaze', 'Fireball', 'Landslide'],
        strategy: 'Destrua tudo em seu caminho. Dano direto e criaturas agressivas.',
        decklist: {
            avatar: 'Persecutor',
            minions: [
                { name: 'Demon', qty: 4 },
                { name: 'Sacred Scarabs', qty: 4 },
                { name: 'Colicky Dragonettes', qty: 4 },
                { name: 'Bosk Troll', qty: 3 },
                { name: 'Fire Imp', qty: 2 },
                { name: 'Hell Hound', qty: 2 }
            ],
            spells: [
                { name: 'Blaze', qty: 4 },
                { name: 'Fireball', qty: 4 },
                { name: 'Landslide', qty: 3 },
                { name: 'Entangle', qty: 2 },
                { name: 'Incinerate', qty: 2 }
            ],
            sites: [
                { name: 'Volcanic Springs', qty: 4 },
                { name: 'Magma Cavern', qty: 4 },
                { name: 'Fertile Earth', qty: 4 },
                { name: 'Inferno', qty: 4 }
            ],
            artifacts: [
                { name: 'Ruby', qty: 2 }
            ]
        }
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
