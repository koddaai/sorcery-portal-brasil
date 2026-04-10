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
