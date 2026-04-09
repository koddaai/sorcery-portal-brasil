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

    container.innerHTML = basicsHTML + elementsHTML + archetypesHTML + beginnerHTML;

    // Initialize element tabs
    initElementTabs();

    // Re-init Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
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

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DECK_GUIDES, renderDeckGuides, initElementTabs };
}
