// ============================================
// GUIAS DE DECK - SORCERY: CONTESTED REALM
// Guias completos em português para construção
// ============================================

const DECK_GUIDES = {
    version: "Abril 2026",

    // ============================================
    // GUIA BÁSICO DE DECKBUILDING
    // ============================================
    basics: {
        title: "Fundamentos de Deckbuilding",
        icon: "book",
        sections: [
            {
                id: "structure",
                title: "Estrutura do Deck",
                content: `
                    <p>Um deck de Sorcery Constructed tem <strong>60 cards</strong> no Spellbook e até <strong>30 cards</strong> no Atlas.</p>

                    <div class="guide-tip">
                        <h4>Distribuição Recomendada</h4>
                        <ul>
                            <li><strong>1 Avatar</strong> - Escolha baseada na estratégia</li>
                            <li><strong>22-28 Criaturas</strong> - Seu exército</li>
                            <li><strong>10-16 Magias</strong> - Remoção e utilidade</li>
                            <li><strong>8-12 Artifacts</strong> - Suporte opcional</li>
                            <li><strong>20-25 Sites</strong> - Base de recursos (Atlas)</li>
                        </ul>
                    </div>
                `
            },
            {
                id: "curve",
                title: "Curva de Mana",
                content: `
                    <p>A <strong>curva de mana</strong> determina a consistência do seu deck. Uma curva bem distribuída permite jogar cards em todos os turnos.</p>

                    <div class="guide-curve">
                        <div class="curve-item">
                            <span class="cost">1-2</span>
                            <span class="count">8-12 cards</span>
                            <span class="desc">Early game, estabelecer presença</span>
                        </div>
                        <div class="curve-item">
                            <span class="cost">3-4</span>
                            <span class="count">12-18 cards</span>
                            <span class="desc">Mid game, cards mais impactantes</span>
                        </div>
                        <div class="curve-item">
                            <span class="cost">5-6</span>
                            <span class="count">6-10 cards</span>
                            <span class="desc">Late game, finalizadores</span>
                        </div>
                        <div class="curve-item">
                            <span class="cost">7+</span>
                            <span class="count">2-4 cards</span>
                            <span class="desc">Bombas, apenas se necessário</span>
                        </div>
                    </div>

                    <div class="guide-warning">
                        <strong>Atenção:</strong> Decks agressivos devem ter curva mais baixa. Decks de controle podem ter curva mais alta.
                    </div>
                `
            },
            {
                id: "threshold",
                title: "Planejando Threshold",
                content: `
                    <p><strong>Threshold</strong> é crucial. Você precisa de Sites suficientes de cada elemento para jogar seus cards.</p>

                    <div class="guide-tip">
                        <h4>Regras de Threshold</h4>
                        <ul>
                            <li><strong>Mono-elemento:</strong> 20-25 Sites do mesmo elemento</li>
                            <li><strong>Dois elementos:</strong> 10-12 de cada + 3-5 dual-lands</li>
                            <li><strong>Três elementos:</strong> Muito difícil - evite se possível</li>
                        </ul>
                    </div>

                    <p>Cards com custo de threshold <strong>2+</strong> do mesmo elemento requerem mais Sites daquele elemento. Planeje seu Atlas cuidadosamente!</p>
                `
            },
            {
                id: "avatar",
                title: "Escolhendo seu Avatar",
                content: `
                    <p>O <strong>Avatar</strong> define a identidade do deck. Considere:</p>

                    <ul>
                        <li><strong>Habilidade:</strong> Combina com sua estratégia?</li>
                        <li><strong>Threshold inicial:</strong> Ajuda seu early game?</li>
                        <li><strong>Vida:</strong> 20 é padrão, alguns têm 18 ou 22</li>
                        <li><strong>Posição:</strong> Começa em qual região?</li>
                    </ul>

                    <div class="avatar-examples">
                        <div class="avatar-card">
                            <strong>Flamecaller</strong>
                            <span>Agressivo, dano direto</span>
                        </div>
                        <div class="avatar-card">
                            <strong>Geomancer</strong>
                            <span>Controle de terreno</span>
                        </div>
                        <div class="avatar-card">
                            <strong>Sorcerer</strong>
                            <span>Draw extra, flexível</span>
                        </div>
                        <div class="avatar-card">
                            <strong>Necromancer</strong>
                            <span>Recursão de criaturas</span>
                        </div>
                    </div>
                `
            }
        ]
    },

    // ============================================
    // GUIAS POR ELEMENTO
    // ============================================
    elements: [
        {
            id: "fire",
            name: "Fire",
            icon: "flame",
            color: "#ff6b35",
            playstyle: "Agressivo, dano direto, velocidade",
            description: "Fire é o elemento mais agressivo. Decks de Fire querem vencer rápido com dano direto e criaturas eficientes.",
            strengths: [
                "Dano direto ao Avatar",
                "Criaturas com First Strike",
                "Remoção eficiente",
                "Curva de mana baixa"
            ],
            weaknesses: [
                "Poucas opções de late game",
                "Vulnerável a Ward e healing",
                "Criaturas geralmente frágeis"
            ],
            keyCards: [
                { name: "Blaze", role: "Remoção/Mobilidade", tier: "Staple" },
                { name: "Lightning Bolt", role: "Dano direto", tier: "Staple" },
                { name: "Colicky Dragonettes", role: "Agressão early", tier: "Staple" },
                { name: "Sacred Scarabs", role: "Pressão constante", tier: "Staple" },
                { name: "Fireball", role: "Remoção/Finisher", tier: "Strong" },
                { name: "Quarrelsome Kobolds", role: "1-drop agressivo", tier: "Strong" }
            ],
            sampleStrategy: `
                <p><strong>Gameplan típico:</strong></p>
                <ol>
                    <li><strong>Turnos 1-3:</strong> Jogar criaturas agressivas, atacar cedo</li>
                    <li><strong>Turnos 4-6:</strong> Usar remoção para limpar blockers</li>
                    <li><strong>Turnos 7+:</strong> Finalizar com dano direto (Blaze, Lightning Bolt)</li>
                </ol>
                <p>Não deixe o jogo ir pro late game. Calcule seu "clock" - quantos turnos você precisa para vencer?</p>
            `
        },
        {
            id: "water",
            name: "Water",
            icon: "droplets",
            color: "#4ea8de",
            playstyle: "Controle, tempo, criaturas grandes",
            description: "Water é o elemento de controle. Usa efeitos de tempo como Freeze para atrasar o oponente enquanto desenvolve ameaças.",
            strengths: [
                "Efeitos de Freeze/Tap",
                "Criaturas com alta defesa",
                "Diluvian Kraken como finisher",
                "Boa interação com Sites"
            ],
            weaknesses: [
                "Lento no early game",
                "Vulnerável a aggro",
                "Pouca remoção permanente"
            ],
            keyCards: [
                { name: "Frost Bolt", role: "Remoção temporária", tier: "Staple" },
                { name: "Diluvian Kraken", role: "Finisher", tier: "Staple" },
                { name: "Freeze", role: "Controle de tempo", tier: "Staple" },
                { name: "Geyser", role: "Board control", tier: "Strong" },
                { name: "Mermaid", role: "Card advantage", tier: "Strong" },
                { name: "Polar Explorers", role: "Versatilidade", tier: "Strong" }
            ],
            sampleStrategy: `
                <p><strong>Gameplan típico:</strong></p>
                <ol>
                    <li><strong>Turnos 1-3:</strong> Desenvolver Sites, defender com criaturas de alta defesa</li>
                    <li><strong>Turnos 4-6:</strong> Freeze ameaças principais, estabilizar o board</li>
                    <li><strong>Turnos 7+:</strong> Jogar finishers como Diluvian Kraken</li>
                </ol>
                <p>Paciência é chave. Não desperdice remoção em ameaças pequenas.</p>
            `
        },
        {
            id: "earth",
            name: "Earth",
            icon: "mountain",
            color: "#95c77e",
            playstyle: "Midrange, criaturas grandes, ramp",
            description: "Earth é o elemento de criaturas robustas. Desenvolve mana rapidamente e joga criaturas maiores que o oponente.",
            strengths: [
                "Criaturas com stats excelentes",
                "Ramp de mana/Sites",
                "Tokens e swarm",
                "Resiliente a remoção"
            ],
            weaknesses: [
                "Lento contra aggro",
                "Vulnerável a efeitos de massa",
                "Pouca interação com spells"
            ],
            keyCards: [
                { name: "Autumn Unicorn", role: "Valor consistente", tier: "Staple" },
                { name: "Slumbering Giantess", role: "Bomba de 6", tier: "Staple" },
                { name: "Bosk Troll", role: "Regeneração", tier: "Staple" },
                { name: "Border Militia", role: "Early game", tier: "Staple" },
                { name: "Landslide", role: "Board wipe", tier: "Strong" },
                { name: "Entangle", role: "Remoção temporária", tier: "Strong" }
            ],
            sampleStrategy: `
                <p><strong>Gameplan típico:</strong></p>
                <ol>
                    <li><strong>Turnos 1-3:</strong> Border Militia, desenvolver mana</li>
                    <li><strong>Turnos 4-6:</strong> Jogar criaturas maiores que as do oponente</li>
                    <li><strong>Turnos 7+:</strong> Dominar o board com Giantess, atacar</li>
                </ol>
                <p>Seus criaturas são maiores - troque em combate vantajosamente.</p>
            `
        },
        {
            id: "air",
            name: "Air",
            icon: "wind",
            color: "#b8b8ff",
            playstyle: "Tempo, evasão, combo",
            description: "Air é o elemento mais versátil. Combina evasão (Airborne, Stealth) com efeitos de tempo e remoção eficiente.",
            strengths: [
                "Criaturas evasivas",
                "Lightning Bolt em qualquer deck",
                "Combos e sinergias",
                "Interação no turno do oponente"
            ],
            weaknesses: [
                "Criaturas geralmente menores",
                "Threshold exigente",
                "Requer planejamento complexo"
            ],
            keyCards: [
                { name: "Lightning Bolt", role: "Remoção/Dano", tier: "Staple" },
                { name: "Grim Reaper", role: "Finisher evasivo", tier: "Staple" },
                { name: "Phase Assassin", role: "Evasão + dano", tier: "Staple" },
                { name: "Blink", role: "Proteção/Combo", tier: "Strong" },
                { name: "Chain Lightning", role: "Remoção múltipla", tier: "Strong" },
                { name: "Angel's Egg", role: "Card advantage", tier: "Strong" }
            ],
            sampleStrategy: `
                <p><strong>Gameplan típico:</strong></p>
                <ol>
                    <li><strong>Turnos 1-3:</strong> Desenvolver criaturas evasivas</li>
                    <li><strong>Turnos 4-6:</strong> Manter pressão com criaturas que não podem ser bloqueadas</li>
                    <li><strong>Turnos 7+:</strong> Fechar com Grim Reaper ou dano direto</li>
                </ol>
                <p>Use sua evasão sabiamente. Oponente não pode bloquear = você controla o combate.</p>
            `
        }
    ],

    // ============================================
    // ARQUÉTIPOS POPULARES
    // ============================================
    archetypes: [
        {
            id: "aggro",
            name: "Aggro",
            description: "Vença rápido com criaturas eficientes e dano direto",
            example: "Fire Burn, Kobold Rush",
            tips: [
                "Mantenha curva de mana baixa (média 2.5 ou menos)",
                "Inclua pelo menos 8-10 fontes de dano direto",
                "Não inclua cards acima de 5 mana",
                "Priorize First Strike e Lethal",
                "Saiba quando parar de atacar e queimar"
            ]
        },
        {
            id: "midrange",
            name: "Midrange",
            description: "Jogue criaturas maiores que o oponente em cada estágio do jogo",
            example: "Earth Giants, Fire/Earth Stompy",
            tips: [
                "Curva de mana média (3.0-3.5)",
                "Inclua remoção para aggro",
                "Tenha finishers para controle",
                "Adapte seu papel baseado no matchup",
                "Troque em combate vantajosamente"
            ]
        },
        {
            id: "control",
            name: "Control",
            description: "Sobreviva o early game, domine o late game",
            example: "Water Control, Air/Water Freeze",
            tips: [
                "Inclua muita remoção (12-16 spells)",
                "Poucos finishers, mas inevitáveis",
                "Card advantage é crucial",
                "Não tenha medo de perder vida cedo",
                "Gerencie recursos pacientemente"
            ]
        },
        {
            id: "combo",
            name: "Combo/Synergy",
            description: "Construa sinergias que geram vantagem explosiva",
            example: "Undead Recursion, Village Tokens",
            tips: [
                "Identifique suas peças de combo",
                "Inclua redundância (múltiplas cópias)",
                "Tenha um plano B se o combo falhar",
                "Proteja suas peças chave",
                "Saiba quando é hora de combo vs beatdown"
            ]
        }
    ],

    // ============================================
    // DICAS PARA INICIANTES
    // ============================================
    beginnerTips: {
        title: "Primeiros Passos",
        icon: "graduation-cap",
        tips: [
            {
                title: "Comece com Mono-Elemento",
                content: "Decks mono são mais consistentes e fáceis de pilotar. Você sempre terá threshold quando precisar."
            },
            {
                title: "Use os Precons como Base",
                content: "Os precons são ótimos pontos de partida. Faça upgrades graduais conforme aprende o jogo."
            },
            {
                title: "Aprenda seu Deck",
                content: "Jogue 10+ partidas com o mesmo deck antes de mudar. Entenda os matchups e sideboard."
            },
            {
                title: "Copie Decks Competitivos",
                content: "Não há vergonha em netdecking. Copiar decks bons ensina o que funciona."
            },
            {
                title: "Assista Gameplay",
                content: "Vídeos e streams ensinam linhas de jogo que você não pensaria sozinho."
            },
            {
                title: "Participe da Comunidade",
                content: "O Discord oficial e grupos locais são ótimos para aprender e trocar experiências."
            }
        ]
    },

    // ============================================
    // ANÁLISE DE META
    // ============================================
    metaAnalysis: {
        title: "Meta Atual",
        lastUpdated: "Abril 2026",
        tiers: [
            {
                tier: "S",
                description: "Decks dominantes - esperados no top de torneios",
                decks: ["A Feast for Crows", "A Giant PITA", "Hot Springs Druid"]
            },
            {
                tier: "A",
                description: "Decks muito fortes - competitivos em qualquer evento",
                decks: ["Dark Depths", "These Boots Are Made for Walkin'", "Village Idiots"]
            },
            {
                tier: "B",
                description: "Decks sólidos - viáveis com bom piloto",
                decks: ["Faerie Flood", "Undead Geomancer", "Flamecaller Burn"]
            },
            {
                tier: "C",
                description: "Decks nicho - funcionam em metas específicas",
                decks: ["Persecute Angels", "Wrath of the Amoeba"]
            }
        ]
    },

    // ============================================
    // PRIMERS DE DECKS POPULARES
    // ============================================
    deckPrimers: [
        {
            id: "fury-road",
            name: "Fury Road",
            tier: "S",
            elements: ["Fire", "Earth"],
            avatar: "Geomancer",
            difficulty: "Médio",
            playstyle: "Aggro-Midrange",
            description: "O deck mais popular do formato. Combina a agressividade de Fire com a resiliência de Earth para criar uma máquina de pressão constante.",
            overview: `
                <p><strong>Fury Road</strong> é o deck a ser batido no meta atual. A estratégia é simples mas eficiente: estabelecer presença no board com criaturas eficientes e usar remoção de Fire para limpar o caminho.</p>
                <p>O nome vem da capacidade de atacar sem parar - como uma estrada de fúria onde você nunca freia.</p>
            `,
            keyCards: [
                { name: "Sacred Scarabs", copies: 4, role: "Core - Pressão recursiva" },
                { name: "Colicky Dragonettes", copies: 4, role: "Core - 2-drop agressivo" },
                { name: "Lightning Bolt", copies: 4, role: "Core - Remoção/Burn" },
                { name: "Blaze", copies: 4, role: "Core - Mobilidade/Remoção" },
                { name: "Border Militia", copies: 4, role: "Core - 1-drop eficiente" },
                { name: "Autumn Unicorn", copies: 4, role: "Flex - Valor no midgame" }
            ],
            gameplan: {
                early: "Turnos 1-3: Jogar Border Militia e Colicky Dragonettes. Estabelecer presença. Sacred Scarabs no turno 2 se possível.",
                mid: "Turnos 4-6: Usar Blaze para mover criaturas e atacar de ângulos inesperados. Lightning Bolt em blockers.",
                late: "Turnos 7+: Fechar o jogo com dano direto. Se o board estalar, Autumn Unicorn gera valor."
            },
            mulliganGuide: `
                <h5>Mãos Keepáveis:</h5>
                <ul>
                    <li>2-3 lands + 1-drop + 2-drop = KEEP sempre</li>
                    <li>3 lands + Sacred Scarabs + remoção = KEEP</li>
                    <li>2 lands + curva 1-2-3 = KEEP</li>
                </ul>
                <h5>Mãos para Mulligan:</h5>
                <ul>
                    <li>5+ lands sem ação = MULLIGAN</li>
                    <li>0-1 lands = MULLIGAN</li>
                    <li>Mão só com spells caros (4+) = MULLIGAN</li>
                </ul>
            `,
            sideboard: [
                { card: "Fireball", copies: 2, against: "Controle, mirrors" },
                { card: "Landslide", copies: 2, against: "Go-wide, tokens" },
                { card: "Entangle", copies: 3, against: "Criaturas grandes" }
            ],
            matchups: [
                { deck: "Water Control", difficulty: "Favorável", winrate: "60%", tips: "Seja agressivo. Não deixe eles estabilizarem." },
                { deck: "Air Frog", difficulty: "Equilibrado", winrate: "50%", tips: "Foque em remover as criaturas evasivas." },
                { deck: "Earth Giants", difficulty: "Desfavorável", winrate: "45%", tips: "Precisa correr. Não tente trocar em combate." }
            ],
            budgetVersion: "Substitua Autumn Unicorn por Bosk Troll. Use mais Firebolts em vez de Lightning Bolts caros."
        },
        {
            id: "air-frog",
            name: "Air Frog (Scatter the Frog)",
            tier: "S",
            elements: ["Air", "Water"],
            avatar: "Sorcerer",
            difficulty: "Alto",
            playstyle: "Tempo-Combo",
            description: "Deck de tempo que usa criaturas evasivas e bounce effects para controlar o ritmo do jogo enquanto aplica pressão constante.",
            overview: `
                <p><strong>Air Frog</strong> é um deck técnico que recompensa jogadores habilidosos. A ideia é usar criaturas Airborne que não podem ser bloqueadas enquanto usa efeitos de bounce para atrasar o oponente.</p>
                <p>O "Frog" no nome vem de certas criaturas que "pulam" para trás na mão e voltam - como sapos!</p>
            `,
            keyCards: [
                { name: "Grim Reaper", copies: 4, role: "Core - Finisher evasivo" },
                { name: "Phase Assassin", copies: 4, role: "Core - Evasão + Remoção" },
                { name: "Frost Bolt", copies: 4, role: "Core - Tempo" },
                { name: "Lightning Bolt", copies: 4, role: "Core - Remoção" },
                { name: "Blink", copies: 4, role: "Core - Proteção/Combo" },
                { name: "Polar Explorers", copies: 3, role: "Flex - Card advantage" }
            ],
            gameplan: {
                early: "Turnos 1-3: Desenvolver Sites dos dois elementos. Jogar criaturas evasivas pequenas se possível.",
                mid: "Turnos 4-6: Phase Assassin e Grim Reaper. Usar Frost Bolt para atrasar ameaças grandes.",
                late: "Turnos 7+: Manter pressão com evasivos. Blink protege seus finishers."
            },
            mulliganGuide: `
                <h5>Mãos Keepáveis:</h5>
                <ul>
                    <li>3 lands (ambos elementos) + 2 ações = KEEP</li>
                    <li>2 lands + Phase Assassin + Frost Bolt = KEEP</li>
                    <li>3 lands + Grim Reaper + proteção = KEEP</li>
                </ul>
                <h5>Mãos para Mulligan:</h5>
                <ul>
                    <li>Só um elemento de land = geralmente MULLIGAN</li>
                    <li>Mão muito lenta (sem ação até turno 4) = MULLIGAN</li>
                    <li>Muita proteção, pouca ameaça = MULLIGAN</li>
                </ul>
            `,
            sideboard: [
                { card: "Geyser", copies: 2, against: "Aggro, go-wide" },
                { card: "Chain Lightning", copies: 2, against: "Criaturas x/2" },
                { card: "Freeze", copies: 3, against: "Criaturas grandes" }
            ],
            matchups: [
                { deck: "Fury Road", difficulty: "Equilibrado", winrate: "50%", tips: "Controle o board cedo. Frost Bolt é crucial." },
                { deck: "Earth Giants", difficulty: "Favorável", winrate: "60%", tips: "Eles não conseguem bloquear seus evasivos." },
                { deck: "Fire Burn", difficulty: "Desfavorável", winrate: "40%", tips: "Muito rápido. Precisa estabilizar cedo." }
            ],
            budgetVersion: "Grim Reaper é insubstituível. Economize em lands dual - use mais básicas."
        },
        {
            id: "earth-giants",
            name: "Earth Giants (Slumbering Giants)",
            tier: "A",
            elements: ["Earth"],
            avatar: "Geomancer",
            difficulty: "Fácil",
            playstyle: "Midrange-Ramp",
            description: "Deck mono-Earth que usa ramp para jogar criaturas enormes antes do oponente conseguir lidar com elas.",
            overview: `
                <p><strong>Earth Giants</strong> é o deck perfeito para iniciantes que querem jogar criaturas GRANDES. A estratégia é acelerar mana e jogar ameaças cada vez maiores.</p>
                <p>Slumbering Giantess é a estrela - uma 8/8 que domina qualquer board.</p>
            `,
            keyCards: [
                { name: "Slumbering Giantess", copies: 4, role: "Core - Bomba de 6 mana" },
                { name: "Autumn Unicorn", copies: 4, role: "Core - Valor mid" },
                { name: "Bosk Troll", copies: 4, role: "Core - Regeneração" },
                { name: "Border Militia", copies: 4, role: "Core - Early blocker" },
                { name: "Landslide", copies: 3, role: "Core - Board wipe" },
                { name: "Entangle", copies: 4, role: "Core - Remoção temporária" }
            ],
            gameplan: {
                early: "Turnos 1-3: Border Militia para bloquear. Desenvolver Sites. Sobreviver.",
                mid: "Turnos 4-5: Bosk Troll e Autumn Unicorn. Começar a trocar em combate.",
                late: "Turnos 6+: Slumbering Giantess. Dominar o board. Atacar."
            },
            mulliganGuide: `
                <h5>Mãos Keepáveis:</h5>
                <ul>
                    <li>3-4 lands + Border Militia + ação mid = KEEP</li>
                    <li>3 lands + curva 2-4-6 = KEEP perfeito</li>
                    <li>2 lands + muito early game = KEEP com cautela</li>
                </ul>
                <h5>Mãos para Mulligan:</h5>
                <ul>
                    <li>5+ lands sem ameaças = MULLIGAN</li>
                    <li>Só cards caros (5+) = MULLIGAN</li>
                    <li>Sem early game contra aggro conhecido = MULLIGAN</li>
                </ul>
            `,
            sideboard: [
                { card: "Earthquake", copies: 2, against: "Tokens, go-wide" },
                { card: "Regenerate", copies: 2, against: "Burn, remoção" },
                { card: "Giant Spider", copies: 3, against: "Airborne" }
            ],
            matchups: [
                { deck: "Fire Burn", difficulty: "Equilibrado", winrate: "50%", tips: "Border Militia e Bosk Troll são cruciais cedo." },
                { deck: "Water Control", difficulty: "Desfavorável", winrate: "40%", tips: "Eles têm respostas para tudo. Pressione mana." },
                { deck: "Air Frog", difficulty: "Desfavorável", winrate: "40%", tips: "Não consegue bloquear evasivos. Giant Spider ajuda." }
            ],
            budgetVersion: "Este deck já é relativamente budget. Slumbering Giantess é a única carta cara necessária."
        },
        {
            id: "water-control",
            name: "Water Control (Freeze Control)",
            tier: "A",
            elements: ["Water"],
            avatar: "Sorcerer",
            difficulty: "Alto",
            playstyle: "Control Puro",
            description: "Deck de controle que usa Freeze effects para estabilizar e finishers inevitáveis para vencer no late game.",
            overview: `
                <p><strong>Water Control</strong> é para jogadores pacientes. Você vai perder vida no início, mas eventualmente seus finishers irão dominar.</p>
                <p>A chave é não entrar em pânico. Gerencie recursos cuidadosamente.</p>
            `,
            keyCards: [
                { name: "Diluvian Kraken", copies: 3, role: "Core - Finisher" },
                { name: "Frost Bolt", copies: 4, role: "Core - Remoção" },
                { name: "Freeze", copies: 4, role: "Core - Tempo" },
                { name: "Geyser", copies: 4, role: "Core - Board control" },
                { name: "Mermaid", copies: 4, role: "Core - Card advantage" },
                { name: "Polar Explorers", copies: 3, role: "Flex - Versatilidade" }
            ],
            gameplan: {
                early: "Turnos 1-4: Desenvolver Sites. Freeze/Frost Bolt ameaças prioritárias. Aceitar dano.",
                mid: "Turnos 5-7: Estabilizar com Geyser. Começar a jogar Mermaid para valor.",
                late: "Turnos 8+: Diluvian Kraken fecha o jogo. Proteja-o com mais Freezes."
            },
            mulliganGuide: `
                <h5>Mãos Keepáveis:</h5>
                <ul>
                    <li>3-4 lands + 2 remoções = KEEP</li>
                    <li>3 lands + Mermaid + Freeze = KEEP</li>
                    <li>4 lands + Kraken + proteção = KEEP contra controle</li>
                </ul>
                <h5>Mãos para Mulligan:</h5>
                <ul>
                    <li>Mão sem remoção early = MULLIGAN contra aggro</li>
                    <li>Só finishers, sem interação = MULLIGAN</li>
                    <li>2 lands ou menos = quase sempre MULLIGAN</li>
                </ul>
            `,
            sideboard: [
                { card: "Negate", copies: 3, against: "Combo, outros controles" },
                { card: "Flood", copies: 2, against: "Go-wide" },
                { card: "Extra Kraken", copies: 1, against: "Grindy matchups" }
            ],
            matchups: [
                { deck: "Fury Road", difficulty: "Desfavorável", winrate: "40%", tips: "Muito agressivo. Precisamos de draws perfeitos." },
                { deck: "Earth Giants", difficulty: "Favorável", winrate: "60%", tips: "Freeze suas bombas. Eles são lentos." },
                { deck: "Mirror", difficulty: "Habilidade", winrate: "50%", tips: "Quem resolver Kraken primeiro ganha." }
            ],
            budgetVersion: "Diluvian Kraken é essencial. Economize nas lands - mono-Water pode usar só básicas."
        },
        {
            id: "dank-magic",
            name: "Dank Magic (Necromancer Combo)",
            tier: "S",
            elements: ["Air", "Earth"],
            avatar: "Necromancer",
            difficulty: "Alto",
            playstyle: "Combo-Midrange",
            description: "Deck campeão do SorceryCon 2026. Combina recursão de Necromancer com criaturas value de Air/Earth.",
            overview: `
                <p><strong>Dank Magic</strong> é o deck que venceu o maior torneio de Sorcery até hoje. A estratégia combina a habilidade do Necromancer de trazer criaturas do cemitério com o poder de Air e Earth.</p>
                <p>O nome "Dank" vem do estilo de jogo - húmido e sombrio, usando o cemitério como segunda mão.</p>
            `,
            keyCards: [
                { name: "Grim Reaper", copies: 4, role: "Core - Finisher evasivo recursivo" },
                { name: "Devil's Egg", copies: 4, role: "Core - Value engine" },
                { name: "Skeleton Army", copies: 4, role: "Core - Go-wide recursivo" },
                { name: "Raise Dead", copies: 4, role: "Core - Recursão" },
                { name: "Phase Assassin", copies: 3, role: "Core - Evasão e remoção" },
                { name: "Bone Dragon", copies: 2, role: "Bomba - Finisher aéreo" }
            ],
            gameplan: {
                early: "Turnos 1-3: Desenvolver Sites. Devil's Egg e criaturas small. Encher o cemitério.",
                mid: "Turnos 4-6: Necromancer ability. Raise Dead em targets de valor. Skeleton Army para pressão.",
                late: "Turnos 7+: Loop de recursão. Grim Reaper e Bone Dragon fecham o jogo."
            },
            mulliganGuide: `
                <h5>Mãos Keepáveis:</h5>
                <ul>
                    <li>3 lands (ambos elementos) + recursão + ameaça = KEEP</li>
                    <li>2 lands + Devil's Egg + curva = KEEP</li>
                    <li>3 lands + Grim Reaper + interação = KEEP</li>
                </ul>
                <h5>Mãos para Mulligan:</h5>
                <ul>
                    <li>Só recursão sem targets = MULLIGAN</li>
                    <li>Só um elemento = geralmente MULLIGAN</li>
                    <li>Mão muito lenta sem early game = MULLIGAN vs aggro</li>
                </ul>
            `,
            matchups: [
                { deck: "Fury Road", difficulty: "Equilibrado", winrate: "50%", tips: "Skeleton Army bloqueia bem. Sobreviva até o mid game." },
                { deck: "Water Control", difficulty: "Favorável", winrate: "60%", tips: "Recursão ignora counters. Pressione com evasivos." },
                { deck: "Air Frog", difficulty: "Equilibrado", winrate: "50%", tips: "Ambos têm evasão. Quem tiver mais card advantage ganha." }
            ],
            budgetVersion: "Bone Dragon pode ser substituído por mais Skeleton Army. Grim Reaper é essencial."
        },
        {
            id: "fire-burn",
            name: "Fire Burn (Mono-Fire Aggro)",
            tier: "A",
            elements: ["Fire"],
            avatar: "Flamecaller",
            difficulty: "Fácil",
            playstyle: "Aggro-Burn",
            description: "O deck mais direto do formato. Criaturas agressivas + burn = oponente morto rapidamente.",
            overview: `
                <p><strong>Fire Burn</strong> é o deck perfeito para quem quer jogos rápidos e decisivos. A filosofia é simples: se move, queime. Se não move, queime mais rápido.</p>
                <p>Mono-Fire significa consistência máxima - você nunca terá problemas de mana.</p>
            `,
            keyCards: [
                { name: "Lightning Bolt", copies: 4, role: "Core - O melhor burn do jogo" },
                { name: "Fireball", copies: 4, role: "Core - Flexível: criatura ou face" },
                { name: "Colicky Dragonettes", copies: 4, role: "Core - 2-drop agressivo" },
                { name: "Blaze", copies: 4, role: "Core - Mobilidade + dano" },
                { name: "Flame Imp", copies: 4, role: "Core - 1-drop com dano" },
                { name: "Fire Elemental", copies: 3, role: "Flex - Corpo grande com haste" }
            ],
            gameplan: {
                early: "Turnos 1-3: Criaturas agressivas. Atacar SEMPRE. Bolt em blockers.",
                mid: "Turnos 4-5: Calcular dano total. Fireball fecha jogos. Blaze para últimos pontos.",
                late: "Turnos 6+: Se chegou aqui, provavelmente perdeu. All-in no burn restante."
            },
            mulliganGuide: `
                <h5>Mãos Keepáveis:</h5>
                <ul>
                    <li>2-3 lands + 1-drop + burn = KEEP sempre</li>
                    <li>2 lands + curva agressiva = KEEP</li>
                    <li>3 lands + muito burn = KEEP (vai fechar)</li>
                </ul>
                <h5>Mãos para Mulligan:</h5>
                <ul>
                    <li>4+ lands = MULLIGAN (deck não precisa)</li>
                    <li>Só burn sem criaturas = MULLIGAN (precisa de clock)</li>
                    <li>Mão lenta = MULLIGAN (você é o aggro)</li>
                </ul>
            `,
            matchups: [
                { deck: "Water Control", difficulty: "Favorável", winrate: "60%", tips: "Rápido demais para eles. Burn ignora blockers." },
                { deck: "Earth Giants", difficulty: "Desfavorável", winrate: "40%", tips: "Criaturas deles são grandes demais. Corra." },
                { deck: "Fury Road", difficulty: "Equilibrado", winrate: "50%", tips: "Race! Quem for mais rápido ganha." }
            ],
            budgetVersion: "Este deck já é budget! Lightning Bolt e Fireball são as únicas cartas 'caras'."
        },
        {
            id: "archimago",
            name: "Archimago Spellslinger",
            tier: "A",
            elements: ["Air", "Fire"],
            avatar: "Archimago",
            difficulty: "Alto",
            playstyle: "Tempo-Control",
            description: "Deck técnico que usa a habilidade do Archimago para ganhar vantagem com cada spell castada.",
            overview: `
                <p><strong>Archimago</strong> é o deck para jogadores que amam spells. Cada magia que você joga ativa a habilidade do avatar, criando vantagem incremental.</p>
                <p>Air oferece evasão e card draw, Fire oferece remoção e dano direto. Juntos, controlam o jogo.</p>
            `,
            keyCards: [
                { name: "Lightning Bolt", copies: 4, role: "Core - Remoção eficiente" },
                { name: "Chain Lightning", copies: 4, role: "Core - Multi-target" },
                { name: "Frost Bolt", copies: 4, role: "Core - Tempo" },
                { name: "Grim Reaper", copies: 4, role: "Core - Finisher evasivo" },
                { name: "Phase Assassin", copies: 3, role: "Core - Evasão + utilidade" },
                { name: "Fireball", copies: 3, role: "Flex - Finisher" }
            ],
            gameplan: {
                early: "Turnos 1-3: Sites de ambos elementos. Remover ameaças com bolts. Archimago triggers.",
                mid: "Turnos 4-6: Criaturas evasivas. Manter controle do board. Acumular vantagem.",
                late: "Turnos 7+: Fechar com evasivos ou burn direto. Archimago gerou valor suficiente."
            },
            mulliganGuide: `
                <h5>Mãos Keepáveis:</h5>
                <ul>
                    <li>3 lands (ambos elementos) + spells mix = KEEP</li>
                    <li>2 lands + remoção + ameaça = KEEP</li>
                    <li>3 lands + Grim Reaper + proteção = KEEP</li>
                </ul>
                <h5>Mãos para Mulligan:</h5>
                <ul>
                    <li>Só um elemento = MULLIGAN</li>
                    <li>Só criaturas sem spells = MULLIGAN (perde sinergia)</li>
                    <li>Só spells sem win condition = MULLIGAN</li>
                </ul>
            `,
            matchups: [
                { deck: "Fury Road", difficulty: "Equilibrado", winrate: "50%", tips: "Removal pesado early. Evasivos fecham." },
                { deck: "Water Control", difficulty: "Desfavorável", winrate: "45%", tips: "Eles têm mais controle. Seja proativo." },
                { deck: "Earth Giants", difficulty: "Favorável", winrate: "60%", tips: "Evasivos ignoram blockers. Bolt nas ameaças." }
            ],
            budgetVersion: "Grim Reaper é insubstituível. Chain Lightning pode virar mais Frost Bolt."
        },
        {
            id: "iron-savior",
            name: "Iron Savior",
            tier: "S",
            elements: ["Fire", "Water"],
            avatar: "Savior",
            difficulty: "Médio",
            playstyle: "Midrange-Tempo",
            description: "Deck campeão do Portland SCG Con. Combina a proteção do Savior com a agressividade de Fire e controle de Water.",
            overview: `
                <p><strong>Iron Savior</strong> é um deck midrange que usa o Savior para proteger suas criaturas enquanto pressiona o oponente.</p>
                <p>A combinação Fire/Water dá acesso a burn E freeze, controlando o ritmo do jogo perfeitamente.</p>
            `,
            keyCards: [
                { name: "Lightning Bolt", copies: 4, role: "Core - Remoção/Burn" },
                { name: "Frost Bolt", copies: 4, role: "Core - Tempo" },
                { name: "Colicky Dragonettes", copies: 4, role: "Core - Pressão early" },
                { name: "Skirmishers of Mu", copies: 4, role: "Core - Value midrange" },
                { name: "Fire Elemental", copies: 3, role: "Core - Ameaça resiliente" },
                { name: "Geyser", copies: 2, role: "Flex - Board control" }
            ],
            gameplan: {
                early: "Turnos 1-3: Criaturas eficientes. Bolt/Frost em ameaças. Estabelecer board.",
                mid: "Turnos 4-6: Savior protege ameaças. Skirmishers geram valor. Pressão constante.",
                late: "Turnos 7+: Burn fecha jogos. Savior mantém criaturas vivas para atacar."
            },
            mulliganGuide: `
                <h5>Mãos Keepáveis:</h5>
                <ul>
                    <li>3 lands + mix de criaturas e spells = KEEP</li>
                    <li>2 lands + curva eficiente = KEEP</li>
                    <li>3 lands + Skirmishers + interação = KEEP</li>
                </ul>
                <h5>Mãos para Mulligan:</h5>
                <ul>
                    <li>Só um elemento de mana = MULLIGAN</li>
                    <li>Muita interação sem ameaças = MULLIGAN</li>
                    <li>5+ lands = MULLIGAN</li>
                </ul>
            `,
            matchups: [
                { deck: "Fury Road", difficulty: "Favorável", winrate: "55%", tips: "Savior protege. Frost Bolt atrasa eles." },
                { deck: "Water Control", difficulty: "Equilibrado", winrate: "50%", tips: "Pressione early. Não deixe estabilizar." },
                { deck: "Air Frog", difficulty: "Equilibrado", winrate: "50%", tips: "Ambos têm tempo plays. Jogo de skill." }
            ],
            budgetVersion: "Skirmishers of Mu é key. Fire Elemental pode ser Flame Imp extra."
        }
    ],

    // ============================================
    // ESTRATÉGIAS AVANÇADAS
    // ============================================
    advancedStrategies: {
        title: "Estratégias Avançadas",
        icon: "brain",
        sections: [
            {
                id: "mulligan",
                title: "A Arte do Mulligan",
                content: `
                    <p>O mulligan é uma das decisões mais importantes no jogo. Uma mão boa pode parecer ruim e vice-versa.</p>

                    <div class="guide-tip">
                        <h4>Regra de Ouro</h4>
                        <p>Sempre pergunte: "Esta mão tem um plano para os turnos 1-4?"</p>
                    </div>

                    <h5>Fatores a Considerar:</h5>
                    <ul>
                        <li><strong>Matchup:</strong> Contra aggro, você PRECISA de interação early</li>
                        <li><strong>Play/Draw:</strong> No draw você pode manter mãos mais lentas</li>
                        <li><strong>Cards conhecidos:</strong> Sideboard games você sabe o que esperar</li>
                    </ul>

                    <h5>Armadilhas Comuns:</h5>
                    <ul>
                        <li>Manter mãos com 5+ lands porque "tem spells"</li>
                        <li>Mulligan de mãos funcionais por não serem "perfeitas"</li>
                        <li>Não adaptar ao matchup</li>
                    </ul>
                `
            },
            {
                id: "tempo",
                title: "Tempo vs Valor",
                content: `
                    <p><strong>Tempo</strong> é sobre eficiência de mana. <strong>Valor</strong> é sobre quantidade de recursos.</p>

                    <div class="tempo-value-grid">
                        <div class="tempo-example">
                            <h5>🚀 Priorize Tempo quando:</h5>
                            <ul>
                                <li>Você é o agressor</li>
                                <li>Oponente está flooding/screwed</li>
                                <li>Você está na frente no board</li>
                                <li>O clock está apertado</li>
                            </ul>
                        </div>
                        <div class="value-example">
                            <h5>📚 Priorize Valor quando:</h5>
                            <ul>
                                <li>Você é o controle</li>
                                <li>Board está equilibrado</li>
                                <li>Jogo vai pro late</li>
                                <li>Você tem vantagem de vida</li>
                            </ul>
                        </div>
                    </div>

                    <p><strong>Exemplo:</strong> Usar Blaze para mover uma criatura 2/2 e atacar por 2 é TEMPO. Guardar o Blaze para uma criatura maior é VALOR.</p>
                `
            },
            {
                id: "clock",
                title: "Calculando o Clock",
                content: `
                    <p>O <strong>clock</strong> é quantos turnos você precisa para vencer. Saber seu clock ajuda a tomar decisões.</p>

                    <div class="guide-example">
                        <h5>Exemplo de Cálculo:</h5>
                        <p>Você tem 3 criaturas que atacam por 5 total. Oponente tem 15 de vida.</p>
                        <p>15 ÷ 5 = <strong>3 turnos</strong> = Seu clock é 3</p>
                    </div>

                    <h5>Usando o Clock:</h5>
                    <ul>
                        <li>Se seu clock < clock do oponente: RACIE (mantenha atacando)</li>
                        <li>Se seu clock > clock do oponente: DEFENDA (bloqueie, use remoção)</li>
                        <li>Burn no final SEMPRE acelera seu clock</li>
                        <li>Lifegain do oponente ATRASA seu clock</li>
                    </ul>
                `
            },
            {
                id: "sequencing",
                title: "Sequenciamento de Jogadas",
                content: `
                    <p>A ORDEM das suas jogadas importa muito. Pequenos erros se acumulam.</p>

                    <div class="guide-warning">
                        <h4>Erros Comuns de Sequência:</h4>
                        <ul>
                            <li>Jogar Site ANTES de ver se precisa do mana para instant</li>
                            <li>Atacar ANTES de jogar criaturas (dá informação)</li>
                            <li>Usar remoção ANTES de ver todas as opções</li>
                        </ul>
                    </div>

                    <h5>Ordem Geral Recomendada:</h5>
                    <ol>
                        <li>Untap, Upkeep triggers</li>
                        <li>Avaliar a situação (NÃO jogar nada ainda)</li>
                        <li>Decidir se ataca</li>
                        <li>Jogar criaturas PRÉ-combate se melhoram o ataque</li>
                        <li>Atacar</li>
                        <li>Jogar criaturas PÓS-combate normalmente</li>
                        <li>Jogar Site por ÚLTIMO (a menos que precise do mana)</li>
                    </ol>
                `
            },
            {
                id: "bluffing",
                title: "Bluffing e Leitura",
                content: `
                    <p>Sorcery tem bastante hidden information. Use isso a seu favor.</p>

                    <h5>Técnicas de Bluff:</h5>
                    <ul>
                        <li><strong>Deixar mana aberto:</strong> Mesmo sem ter instant, oponente respeita</li>
                        <li><strong>Atacar "mal":</strong> Às vezes parece bluff, às vezes você tem a trick</li>
                        <li><strong>Sequência de plays:</strong> Jogar confiante vs hesitante manda mensagens</li>
                    </ul>

                    <h5>Lendo o Oponente:</h5>
                    <ul>
                        <li>Quanto tempo eles pensam em decisões óbvias?</li>
                        <li>Eles verificaram seu graveyard recentemente?</li>
                        <li>O padrão de ataque mudou de repente?</li>
                        <li>Eles estão segurando cards há muito tempo?</li>
                    </ul>
                `
            }
        ]
    },

    // ============================================
    // UPGRADES DE PRECONS
    // ============================================
    preconUpgrades: {
        title: "Upgrades de Precons",
        icon: "arrow-up-circle",
        description: "Guias para melhorar cada precon deck Beta com orçamentos diferentes.",
        precons: [
            {
                name: "Fire Precon",
                set: "Beta",
                budgets: [
                    {
                        level: "$20",
                        description: "Melhorias essenciais com cards comuns",
                        changes: [
                            { out: "Spark Elemental", in: "Sacred Scarabs", reason: "Muito mais consistente" },
                            { out: "Firebreathing", in: "Lightning Bolt", reason: "Remoção > pump" },
                            { out: "Lava Axe", in: "Blaze", reason: "Mais versátil" }
                        ]
                    },
                    {
                        level: "$50",
                        description: "Upgrades competitivos",
                        changes: [
                            { out: "Mountain básica x4", in: "Volcanic Island x2 + basics", reason: "Splash de Air" },
                            { out: "Flame Imp", in: "Colicky Dragonettes", reason: "Melhor 2-drop" },
                            { out: "Fire Elemental", in: "Phoenix", reason: "Recursão é poderosa" }
                        ]
                    }
                ]
            },
            {
                name: "Water Precon",
                set: "Beta",
                budgets: [
                    {
                        level: "$20",
                        description: "Melhorias essenciais com cards comuns",
                        changes: [
                            { out: "Sea Serpent", in: "Mermaid", reason: "Card advantage > stats" },
                            { out: "Tidal Wave", in: "Frost Bolt", reason: "Mais eficiente" },
                            { out: "Flood", in: "Freeze", reason: "Remoção temporária melhor" }
                        ]
                    },
                    {
                        level: "$50",
                        description: "Rumo ao controle competitivo",
                        changes: [
                            { out: "Water Elemental", in: "Diluvian Kraken", reason: "O finisher do formato" },
                            { out: "Merfolk Warrior x2", in: "Polar Explorers x2", reason: "Versatilidade" },
                            { out: "Cancel", in: "Geyser", reason: "Board control" }
                        ]
                    }
                ]
            },
            {
                name: "Earth Precon",
                set: "Beta",
                budgets: [
                    {
                        level: "$20",
                        description: "Melhorias essenciais",
                        changes: [
                            { out: "Grizzly Bears", in: "Border Militia", reason: "1-drop > 2-drop fraco" },
                            { out: "Giant Growth", in: "Entangle", reason: "Remoção > pump" },
                            { out: "Craw Wurm", in: "Bosk Troll", reason: "Regeneração é forte" }
                        ]
                    },
                    {
                        level: "$50",
                        description: "Midrange competitivo",
                        changes: [
                            { out: "Earth Elemental", in: "Slumbering Giantess", reason: "A bomba do formato" },
                            { out: "Llanowar Elves equiv", in: "Autumn Unicorn", reason: "Valor garantido" },
                            { out: "Forest básica x4", in: "Dual lands se splash", reason: "Flexibilidade" }
                        ]
                    }
                ]
            },
            {
                name: "Air Precon",
                set: "Beta",
                budgets: [
                    {
                        level: "$20",
                        description: "Melhorias essenciais",
                        changes: [
                            { out: "Flying Men", in: "Phase Assassin", reason: "Muito mais impactante" },
                            { out: "Counterspell", in: "Blink", reason: "Proteção proativa" },
                            { out: "Air Elemental", in: "Grim Reaper", reason: "Finisher evasivo" }
                        ]
                    },
                    {
                        level: "$50",
                        description: "Tempo competitivo",
                        changes: [
                            { out: "Island básica x4", in: "Dual Water/Air x2", reason: "Splash de Freeze" },
                            { out: "Zephyr Spirit", in: "Chain Lightning", reason: "Remoção múltipla" },
                            { out: "Wind Drake", in: "Angel's Egg", reason: "Card advantage" }
                        ]
                    }
                ]
            }
        ]
    },

    // ============================================
    // DECKS BUDGET
    // ============================================
    budgetDecks: {
        title: "Decks Budget",
        icon: "wallet",
        description: "Decks competitivos que custam menos de $50. Perfeitos para começar.",
        decks: [
            {
                name: "Mono-Fire Burn ($30)",
                tier: "B+",
                description: "Aggro puro - vença antes do turno 7 ou perca",
                strategy: "Curve out com criaturas baratas, queime o Avatar, nunca bloqueie",
                keyCards: ["Lightning Bolt", "Blaze", "Sacred Scarabs", "Quarrelsome Kobolds"],
                upgradePath: "Adicione Colicky Dragonettes e Phoenix conforme budget permitir"
            },
            {
                name: "Mono-Earth Stompy ($35)",
                tier: "B",
                description: "Criaturas grandes, estratégia simples",
                strategy: "Jogar a maior criatura cada turno. Trocar em combate vantajosamente.",
                keyCards: ["Border Militia", "Bosk Troll", "Autumn Unicorn", "Landslide"],
                upgradePath: "Slumbering Giantess é o próximo passo ($15-20 a cópia)"
            },
            {
                name: "Air Tempo ($40)",
                tier: "B+",
                description: "Criaturas evasivas com backup de remoção",
                strategy: "Atacar sem ser bloqueado. Usar remoção cirurgicamente.",
                keyCards: ["Phase Assassin", "Lightning Bolt", "Blink", "Chain Lightning"],
                upgradePath: "Grim Reaper e Frost Bolt (splash Water)"
            },
            {
                name: "Undead Swarm ($25)",
                tier: "B-",
                description: "Tokens de Undead que voltam do graveyard",
                strategy: "Encher o board de tokens. Sacrificar para valor. Voltar tudo.",
                keyCards: ["Skeleton Army", "Raise Dead", "Bone Dragon", "Sacrifice"],
                upgradePath: "Necromancer avatar e cards de recursão melhores"
            }
        ]
    }
};

// Função para renderizar o guia de decks
function renderDeckGuides() {
    const container = document.getElementById('deck-guides-content');
    if (!container) return;

    // Render basics section
    const basicsHTML = `
        <div class="guide-section" id="guide-basics">
            <div class="guide-section-header">
                <i data-lucide="${DECK_GUIDES.basics.icon}"></i>
                <h3>${DECK_GUIDES.basics.title}</h3>
            </div>
            <div class="guide-sections">
                ${DECK_GUIDES.basics.sections.map(section => `
                    <div class="guide-subsection" id="${section.id}">
                        <h4>${section.title}</h4>
                        ${section.content}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render element guides
    const elementsHTML = `
        <div class="guide-section" id="guide-elements">
            <div class="guide-section-header">
                <i data-lucide="palette"></i>
                <h3>Guias por Elemento</h3>
            </div>
            <div class="element-tabs">
                ${DECK_GUIDES.elements.map((el, i) => `
                    <button class="element-tab ${i === 0 ? 'active' : ''}" data-element="${el.id}" style="--element-color: ${el.color}">
                        <i data-lucide="${el.icon}"></i>
                        ${el.name}
                    </button>
                `).join('')}
            </div>
            <div class="element-guides">
                ${DECK_GUIDES.elements.map((el, i) => `
                    <div class="element-guide ${i === 0 ? 'active' : ''}" data-element="${el.id}">
                        <div class="element-header" style="--element-color: ${el.color}">
                            <h4>${el.name}</h4>
                            <span class="playstyle">${el.playstyle}</span>
                        </div>
                        <p class="element-description">${el.description}</p>

                        <div class="element-columns">
                            <div class="strengths">
                                <h5><i data-lucide="check-circle"></i> Pontos Fortes</h5>
                                <ul>${el.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                            </div>
                            <div class="weaknesses">
                                <h5><i data-lucide="alert-circle"></i> Pontos Fracos</h5>
                                <ul>${el.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                            </div>
                        </div>

                        <div class="key-cards">
                            <h5><i data-lucide="star"></i> Cards Essenciais</h5>
                            <div class="cards-grid">
                                ${el.keyCards.map(card => `
                                    <div class="key-card ${card.tier.toLowerCase()}">
                                        <span class="card-name">${card.name}</span>
                                        <span class="card-role">${card.role}</span>
                                        <span class="card-tier">${card.tier}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="element-strategy">
                            <h5><i data-lucide="target"></i> Estratégia</h5>
                            ${el.sampleStrategy}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render archetypes
    const archetypesHTML = `
        <div class="guide-section" id="guide-archetypes">
            <div class="guide-section-header">
                <i data-lucide="layers"></i>
                <h3>Arquétipos de Deck</h3>
            </div>
            <div class="archetypes-grid">
                ${DECK_GUIDES.archetypes.map(arch => `
                    <div class="archetype-card">
                        <h4>${arch.name}</h4>
                        <p class="archetype-desc">${arch.description}</p>
                        <p class="archetype-example"><strong>Exemplos:</strong> ${arch.example}</p>
                        <div class="archetype-tips">
                            <h5>Dicas</h5>
                            <ul>${arch.tips.map(t => `<li>${t}</li>`).join('')}</ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render beginner tips
    const beginnerHTML = `
        <div class="guide-section" id="guide-beginner">
            <div class="guide-section-header">
                <i data-lucide="${DECK_GUIDES.beginnerTips.icon}"></i>
                <h3>${DECK_GUIDES.beginnerTips.title}</h3>
            </div>
            <div class="beginner-tips-grid">
                ${DECK_GUIDES.beginnerTips.tips.map(tip => `
                    <div class="beginner-tip">
                        <h4>${tip.title}</h4>
                        <p>${tip.content}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render meta analysis
    const metaHTML = `
        <div class="guide-section" id="guide-meta">
            <div class="guide-section-header">
                <i data-lucide="trophy"></i>
                <h3>${DECK_GUIDES.metaAnalysis.title}</h3>
                <span class="meta-updated">Atualizado: ${DECK_GUIDES.metaAnalysis.lastUpdated}</span>
            </div>
            <div class="meta-tiers">
                ${DECK_GUIDES.metaAnalysis.tiers.map(tier => `
                    <div class="meta-tier tier-${tier.tier.toLowerCase()}">
                        <div class="tier-badge">${tier.tier}</div>
                        <div class="tier-content">
                            <p class="tier-desc">${tier.description}</p>
                            <div class="tier-decks">
                                ${tier.decks.map(d => `<span class="tier-deck">${d}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render deck primers
    const primersHTML = `
        <div class="guide-section" id="guide-primers">
            <div class="guide-section-header">
                <i data-lucide="book-open"></i>
                <h3>Primers de Decks Populares</h3>
            </div>
            <div class="primer-tabs">
                ${DECK_GUIDES.deckPrimers.map((primer, i) => `
                    <button class="primer-tab ${i === 0 ? 'active' : ''}" data-primer="${primer.id}">
                        <span class="primer-tier tier-${primer.tier.toLowerCase()}">${primer.tier}</span>
                        ${primer.name}
                    </button>
                `).join('')}
            </div>
            <div class="primer-contents">
                ${DECK_GUIDES.deckPrimers.map((primer, i) => `
                    <div class="primer-content ${i === 0 ? 'active' : ''}" data-primer="${primer.id}">
                        <div class="primer-header">
                            <div class="primer-title">
                                <h4>${primer.name}</h4>
                                <div class="primer-meta">
                                    <span class="primer-elements">${primer.elements.map(e => `<i data-lucide="${getPrimerElementIcon(e)}"></i>`).join('')}</span>
                                    <span class="primer-avatar"><i data-lucide="user"></i> ${primer.avatar}</span>
                                    <span class="primer-difficulty"><i data-lucide="gauge"></i> ${primer.difficulty}</span>
                                    <span class="primer-playstyle"><i data-lucide="swords"></i> ${primer.playstyle}</span>
                                </div>
                            </div>
                            <span class="primer-tier-badge tier-${primer.tier.toLowerCase()}">${primer.tier}</span>
                        </div>

                        <p class="primer-description">${primer.description}</p>

                        <div class="primer-overview">
                            ${primer.overview}
                        </div>

                        <div class="primer-section">
                            <h5><i data-lucide="package"></i> Cards Principais</h5>
                            <div class="primer-cards-grid">
                                ${primer.keyCards.map(card => `
                                    <div class="primer-card">
                                        <span class="card-copies">×${card.copies}</span>
                                        <span class="card-name">${card.name}</span>
                                        <span class="card-role">${card.role}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="primer-section">
                            <h5><i data-lucide="map"></i> Gameplan</h5>
                            <div class="gameplan-phases">
                                <div class="phase early">
                                    <span class="phase-label">Early</span>
                                    <p>${primer.gameplan.early}</p>
                                </div>
                                <div class="phase mid">
                                    <span class="phase-label">Mid</span>
                                    <p>${primer.gameplan.mid}</p>
                                </div>
                                <div class="phase late">
                                    <span class="phase-label">Late</span>
                                    <p>${primer.gameplan.late}</p>
                                </div>
                            </div>
                        </div>

                        <div class="primer-section">
                            <h5><i data-lucide="hand"></i> Guia de Mulligan</h5>
                            <div class="mulligan-guide">
                                ${primer.mulliganGuide}
                            </div>
                        </div>

                        <div class="primer-section">
                            <h5><i data-lucide="shield"></i> Sideboard</h5>
                            <div class="sideboard-grid">
                                ${primer.sideboard.map(sb => `
                                    <div class="sideboard-card">
                                        <span class="sb-copies">×${sb.copies}</span>
                                        <span class="sb-name">${sb.card}</span>
                                        <span class="sb-against">vs ${sb.against}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="primer-section">
                            <h5><i data-lucide="swords"></i> Matchups</h5>
                            <div class="matchups-grid">
                                ${primer.matchups.map(mu => `
                                    <div class="matchup-card ${mu.difficulty.toLowerCase().replace('á', 'a')}">
                                        <div class="matchup-header">
                                            <span class="matchup-deck">${mu.deck}</span>
                                            <span class="matchup-winrate">${mu.winrate}</span>
                                        </div>
                                        <span class="matchup-difficulty">${mu.difficulty}</span>
                                        <p class="matchup-tips">${mu.tips}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="primer-budget">
                            <h5><i data-lucide="wallet"></i> Versão Budget</h5>
                            <p>${primer.budgetVersion}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render advanced strategies
    const advancedHTML = `
        <div class="guide-section" id="guide-advanced">
            <div class="guide-section-header">
                <i data-lucide="${DECK_GUIDES.advancedStrategies.icon}"></i>
                <h3>${DECK_GUIDES.advancedStrategies.title}</h3>
            </div>
            <div class="advanced-accordion">
                ${DECK_GUIDES.advancedStrategies.sections.map((section, i) => `
                    <div class="accordion-item ${i === 0 ? 'open' : ''}">
                        <button class="accordion-header">
                            <span>${section.title}</span>
                            <i data-lucide="chevron-down"></i>
                        </button>
                        <div class="accordion-content">
                            ${section.content}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render precon upgrades
    const preconHTML = `
        <div class="guide-section" id="guide-precons">
            <div class="guide-section-header">
                <i data-lucide="${DECK_GUIDES.preconUpgrades.icon}"></i>
                <h3>${DECK_GUIDES.preconUpgrades.title}</h3>
            </div>
            <p class="section-description">${DECK_GUIDES.preconUpgrades.description}</p>
            <div class="precon-upgrades-grid">
                ${DECK_GUIDES.preconUpgrades.precons.map(precon => `
                    <div class="precon-upgrade-card">
                        <h4>${precon.name}</h4>
                        <span class="precon-set">${precon.set}</span>
                        ${precon.budgets.map(budget => `
                            <div class="budget-level">
                                <div class="budget-header">
                                    <span class="budget-amount">${budget.level}</span>
                                    <span class="budget-desc">${budget.description}</span>
                                </div>
                                <div class="upgrade-changes">
                                    ${budget.changes.map(change => `
                                        <div class="upgrade-change">
                                            <span class="change-out"><i data-lucide="minus-circle"></i> ${change.out}</span>
                                            <span class="change-arrow"><i data-lucide="arrow-right"></i></span>
                                            <span class="change-in"><i data-lucide="plus-circle"></i> ${change.in}</span>
                                            <span class="change-reason">${change.reason}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Render budget decks
    const budgetHTML = `
        <div class="guide-section" id="guide-budget">
            <div class="guide-section-header">
                <i data-lucide="${DECK_GUIDES.budgetDecks.icon}"></i>
                <h3>${DECK_GUIDES.budgetDecks.title}</h3>
            </div>
            <p class="section-description">${DECK_GUIDES.budgetDecks.description}</p>
            <div class="budget-decks-grid">
                ${DECK_GUIDES.budgetDecks.decks.map(deck => `
                    <div class="budget-deck-card">
                        <div class="budget-deck-header">
                            <h4>${deck.name}</h4>
                            <span class="budget-tier tier-${deck.tier.toLowerCase().replace('+', '-plus').replace('-', '-minus')}">${deck.tier}</span>
                        </div>
                        <p class="budget-deck-desc">${deck.description}</p>
                        <div class="budget-deck-strategy">
                            <strong>Estratégia:</strong> ${deck.strategy}
                        </div>
                        <div class="budget-deck-cards">
                            <strong>Cards Chave:</strong>
                            <div class="key-cards-list">
                                ${deck.keyCards.map(c => `<span class="key-card-tag">${c}</span>`).join('')}
                            </div>
                        </div>
                        <div class="budget-deck-upgrade">
                            <i data-lucide="trending-up"></i>
                            <span>${deck.upgradePath}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = basicsHTML + elementsHTML + archetypesHTML + beginnerHTML + metaHTML + primersHTML + advancedHTML + preconHTML + budgetHTML;

    // Initialize all interactive components
    initElementTabs();
    initPrimerTabs();
    initAccordion();

    // Re-init Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Helper function for element icons (named differently to avoid conflict with app.js)
function getPrimerElementIcon(element) {
    const icons = {
        'Fire': 'flame',
        'Water': 'droplets',
        'Earth': 'mountain',
        'Air': 'wind'
    };
    return icons[element] || 'circle';
}

// Initialize element tab switching
function initElementTabs() {
    const tabs = document.querySelectorAll('.element-tab');
    const guides = document.querySelectorAll('.element-guide');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const element = tab.dataset.element;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            guides.forEach(g => {
                g.classList.remove('active');
                if (g.dataset.element === element) {
                    g.classList.add('active');
                }
            });

            // Re-init icons
            if (typeof lucide !== 'undefined') {
                setTimeout(() => lucide.createIcons(), 50);
            }
        });
    });
}

// Initialize primer tab switching
function initPrimerTabs() {
    const tabs = document.querySelectorAll('.primer-tab');
    const contents = document.querySelectorAll('.primer-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const primerId = tab.dataset.primer;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            contents.forEach(c => {
                c.classList.remove('active');
                if (c.dataset.primer === primerId) {
                    c.classList.add('active');
                }
            });

            // Re-init icons
            if (typeof lucide !== 'undefined') {
                setTimeout(() => lucide.createIcons(), 50);
            }
        });
    });
}

// Initialize accordion for advanced strategies
function initAccordion() {
    const items = document.querySelectorAll('.accordion-item');

    items.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close all items
                items.forEach(i => i.classList.remove('open'));

                // Toggle clicked item
                if (!isOpen) {
                    item.classList.add('open');
                }

                // Re-init icons
                if (typeof lucide !== 'undefined') {
                    setTimeout(() => lucide.createIcons(), 50);
                }
            });
        }
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DECK_GUIDES, renderDeckGuides, initElementTabs, initPrimerTabs, initAccordion, getPrimerElementIcon };
}
