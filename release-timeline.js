/**
 * Release Timeline Visualization for Sorcery TCG
 * Timeline de lançamentos - Versão em português
 */

// =============================================================================
// INFORMAÇÕES DOS SETS
// =============================================================================

const SET_INFO = {
    "Alpha": {
        releaseDate: "2023-05-01",
        cardCount: 403,
        description: "O set inaugural de Sorcery: Contested Realm, lançado exclusivamente para backers do Kickstarter. Cada carta apresenta arte tradicional pintada à mão.",
        color: "#d4af37",
        icon: "star",
        edition: "1ª Edição (Kickstarter)",
        highlights: ["403 cartas únicas", "Exclusivo para backers", "39 packs por box"],
        boosterInfo: {
            types: ["Booster Box (39 packs)", "Booster Pack (15 cartas)"],
            odds: { ordinary: "11/pack", exceptional: "3/pack", elite: "~80%", unique: "~20%" }
        }
    },
    "Beta": {
        releaseDate: "2023-11-10",
        cardCount: 402,
        description: "Primeira edição global de Sorcery, com correções de texto e 4 novos Avatares Elementais. Inclui precons para iniciantes.",
        color: "#9ca3af",
        icon: "circle",
        edition: "Edição Global",
        highlights: ["402 cartas", "4 Precons Elementais", "36 packs por box", "4 novos Avatares"],
        boosterInfo: {
            types: ["Booster Box (36 packs)", "Booster Pack (15 cartas)", "Precon Decks (52 cartas)"],
            odds: { ordinary: "11/pack", exceptional: "3/pack", elite: "~80%", unique: "~20%" }
        }
    },
    "Arthurian Legends": {
        releaseDate: "2024-06-01",
        cardCount: 220,
        description: "Expansão standalone inspirada na mitologia Arturiana. Cavaleiros da Távola Redonda, Excalibur e magia celta.",
        color: "#3b82f6",
        icon: "crown",
        edition: "Expansão Standalone",
        highlights: ["220+ cartas novas", "24 packs por box", "Tema Arturiano", "Novos mecânicas de lealdade"],
        boosterInfo: {
            types: ["Booster Box (24 packs)", "Booster Pack (15 cartas)"],
            odds: { ordinary: "11/pack", exceptional: "3/pack", elite: "~80%", unique: "~20%" }
        }
    },
    "Gothic": {
        releaseDate: "2025-12-05",
        cardCount: 440,
        description: "Expansão de horror gótico com 440 cartas. Vampiros, maldições e locais assombrados. Introduz o sideboard Collection de 10 cartas.",
        color: "#8b5cf6",
        icon: "moon",
        edition: "Expansão",
        highlights: ["440 cartas", "4 Precons (Prophets of Doom)", "36 packs por box", "Novo: Spellbook 60 / Atlas 30 / Collection 10"],
        boosterInfo: {
            types: ["Booster Box (36 packs)", "Booster Pack (15 cartas)", "Precon Decks (52 cartas)"],
            odds: { ordinary: "11/pack", exceptional: "3/pack", elite: "~80%", unique: "~20%" }
        }
    },
    "Dragonlord": {
        releaseDate: "2025-08-02",
        cardCount: 13,
        description: "Mini-set premium com 13 cartas temáticas de dragões, arte de Ed Beard Jr. Vendido como caixa completa, não boosters.",
        color: "#dc2626",
        icon: "flame",
        edition: "Mini-Set Premium",
        highlights: ["13 cartas únicas", "Caixa completa $59", "Arte de Ed Beard Jr.", "1 Foil garantido por caixa"],
        boosterInfo: null
    },
    "Promotional": {
        releaseDate: null,
        cardCount: null,
        description: "Cartas promocionais especiais de eventos, pré-vendas e programas de Organized Play (Dust System).",
        color: "#f59e0b",
        icon: "gift",
        edition: "Promocional",
        highlights: ["Disponibilidade limitada", "Arte alternativa exclusiva", "Eventos e torneios"],
        boosterInfo: null
    }
};

// Próximos lançamentos conhecidos
const UPCOMING_RELEASES = [
    {
        name: "Forgotten Realms",
        expectedDate: "2025-09-01",
        description: "Civilizações antigas e magia perdida",
        status: "announced"
    },
    {
        name: "Celestial Wars",
        expectedDate: "2026-02-01",
        description: "Expansão temática de Anjos vs Demônios",
        status: "rumored"
    }
];

// =============================================================================
// CLASSE TIMELINE TRACKER
// =============================================================================

class TimelineTracker {
    constructor() {
        this.setInfo = SET_INFO;
        this.upcomingReleases = UPCOMING_RELEASES;
    }

    getSetTimeline(allCards) {
        const sets = [];
        const setNames = [...new Set(allCards.map(card => card.set))];

        for (const setName of setNames) {
            const setCards = allCards.filter(card => card.set === setName);
            const info = this.setInfo[setName] || {};

            const byRarity = this._countByProperty(setCards, 'rarity');
            const byType = this._countByProperty(setCards, 'type');
            const byElement = this._countByProperty(setCards, 'element');

            sets.push({
                name: setName,
                releaseDate: info.releaseDate || null,
                cardCount: setCards.length,
                byRarity: byRarity,
                byType: byType,
                byElement: byElement,
                description: info.description || "Descrição não disponível",
                color: info.color || "#6b7280",
                icon: info.icon || "box",
                edition: info.edition || "Desconhecido",
                highlights: info.highlights || [],
                boosterInfo: info.boosterInfo || null,
                newMechanics: this._extractMechanics(setCards)
            });
        }

        sets.sort((a, b) => {
            if (!a.releaseDate && !b.releaseDate) return 0;
            if (!a.releaseDate) return 1;
            if (!b.releaseDate) return -1;
            return new Date(a.releaseDate) - new Date(b.releaseDate);
        });

        const totalCards = allCards.length;
        const latestSet = sets.filter(s => s.releaseDate).pop();
        const nextRelease = this.upcomingReleases[0] || null;

        return {
            sets,
            totalCards,
            latestSet: latestSet ? latestSet.name : null,
            nextRelease,
            generatedAt: new Date().toISOString()
        };
    }

    getSetDetails(setName, allCards) {
        const setCards = allCards.filter(card => card.set === setName);
        const info = this.setInfo[setName] || {};

        if (setCards.length === 0) return null;

        const byRarity = this._countByProperty(setCards, 'rarity');
        const byType = this._countByProperty(setCards, 'type');
        const byElement = this._countByProperty(setCards, 'element');

        const minionsWithPower = setCards.filter(c => c.power !== undefined && c.power !== null);
        const avgPower = minionsWithPower.length > 0
            ? (minionsWithPower.reduce((sum, c) => sum + c.power, 0) / minionsWithPower.length).toFixed(1)
            : null;

        const notableCards = setCards
            .filter(c => c.rarity === 'unique' || c.rarity === 'exceptional')
            .slice(0, 10)
            .map(c => ({ name: c.name, rarity: c.rarity, type: c.type }));

        return {
            name: setName,
            releaseDate: info.releaseDate || null,
            releaseDateFormatted: info.releaseDate ? formatReleaseDatePT(info.releaseDate) : "Desconhecido",
            timeSinceRelease: info.releaseDate ? getTimeSinceReleasePT(info.releaseDate) : null,
            cardCount: setCards.length,
            description: info.description || "Descrição não disponível",
            color: info.color || "#6b7280",
            icon: info.icon || "box",
            edition: info.edition || "Desconhecido",
            highlights: info.highlights || [],
            boosterInfo: info.boosterInfo || null,
            statistics: { byRarity, byType, byElement, avgPower },
            notableCards,
            mechanics: this._extractMechanics(setCards)
        };
    }

    getUpcomingReleases() {
        const now = new Date();

        return this.upcomingReleases
            .map(release => {
                const expectedDate = new Date(release.expectedDate);
                const daysUntil = Math.ceil((expectedDate - now) / (1000 * 60 * 60 * 24));

                return {
                    ...release,
                    daysUntil: daysUntil > 0 ? daysUntil : null,
                    isPast: daysUntil <= 0,
                    expectedDateFormatted: formatReleaseDatePT(release.expectedDate)
                };
            })
            .filter(r => !r.isPast)
            .sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate));
    }

    _countByProperty(cards, property) {
        const counts = {};
        for (const card of cards) {
            const value = card[property] || 'unknown';
            counts[value] = (counts[value] || 0) + 1;
        }
        return counts;
    }

    _extractMechanics(cards) {
        const mechanics = new Set();
        const mechanicKeywords = [
            'Genesis', 'Ward', 'Airborne', 'Burrow', 'Charge', 'Deathtouch',
            'Defender', 'Disable', 'Lethal', 'Immobile', 'Ranged', 'Stealth',
            'Submerge', 'Landbound', 'Waterbound', 'Movement', 'Spellcaster'
        ];

        for (const card of cards) {
            if (card.rules) {
                for (const keyword of mechanicKeywords) {
                    if (card.rules.toLowerCase().includes(keyword.toLowerCase())) {
                        mechanics.add(keyword);
                    }
                }
            }
        }

        return Array.from(mechanics);
    }
}

// =============================================================================
// FUNÇÕES UTILITÁRIAS EM PORTUGUÊS
// =============================================================================

function formatReleaseDatePT(dateString) {
    if (!dateString) return "Desconhecido";

    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getTimeSinceReleasePT(dateString) {
    if (!dateString) return null;

    const releaseDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - releaseDate;

    if (diffMs < 0) {
        const futureDays = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
        if (futureDays === 1) return "Amanhã";
        if (futureDays < 7) return `Em ${futureDays} dias`;
        if (futureDays < 30) return `Em ${Math.ceil(futureDays / 7)} semanas`;
        if (futureDays < 365) return `Em ${Math.ceil(futureDays / 30)} meses`;
        return `Em ${Math.ceil(futureDays / 365)} anos`;
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffWeeks === 1) return "1 semana atrás";
    if (diffWeeks < 4) return `${diffWeeks} semanas atrás`;
    if (diffMonths === 1) return "1 mês atrás";
    if (diffMonths < 12) return `${diffMonths} meses atrás`;
    if (diffYears === 1) return "1 ano atrás";
    return `${diffYears} anos atrás`;
}

// =============================================================================
// FUNÇÕES DE RENDERIZAÇÃO
// =============================================================================

function renderTimeline(timeline) {
    let setsHtml = '';

    for (let i = 0; i < timeline.sets.length; i++) {
        const set = timeline.sets[i];

        // Calcular porcentagens de raridade
        const total = set.cardCount;
        const rarityData = set.byRarity || {};

        setsHtml += `
            <div class="tl-card" style="--set-color: ${set.color}">
                <div class="tl-card-header">
                    <div class="tl-icon" style="background: ${set.color};">
                        <i data-lucide="${set.icon}"></i>
                    </div>
                    <div class="tl-header-info">
                        <h3 class="tl-title">${set.name}</h3>
                        <span class="tl-edition">${set.edition}</span>
                    </div>
                    <div class="tl-date-badge">
                        ${set.releaseDate ? `
                            <span class="tl-date">${formatReleaseDatePT(set.releaseDate)}</span>
                            <span class="tl-ago">${getTimeSinceReleasePT(set.releaseDate)}</span>
                        ` : '<span class="tl-date">Várias datas</span>'}
                    </div>
                </div>

                <div class="tl-card-body">
                    <p class="tl-description">${set.description}</p>

                    <div class="tl-stats-row">
                        <div class="tl-stat">
                            <span class="tl-stat-value">${set.cardCount}</span>
                            <span class="tl-stat-label">Cartas</span>
                        </div>
                        <div class="tl-stat">
                            <span class="tl-stat-value">${rarityData.unique || 0}</span>
                            <span class="tl-stat-label">Únicas</span>
                        </div>
                        <div class="tl-stat">
                            <span class="tl-stat-value">${rarityData.elite || 0}</span>
                            <span class="tl-stat-label">Elite</span>
                        </div>
                        <div class="tl-stat">
                            <span class="tl-stat-value">${Object.keys(set.byElement || {}).length}</span>
                            <span class="tl-stat-label">Elementos</span>
                        </div>
                    </div>

                    ${set.highlights && set.highlights.length > 0 ? `
                        <div class="tl-highlights">
                            ${set.highlights.map(h => `<span class="tl-highlight-tag"><i data-lucide="check"></i> ${h}</span>`).join('')}
                        </div>
                    ` : ''}

                    ${set.boosterInfo ? `
                        <div class="tl-booster-info">
                            <h4><i data-lucide="package"></i> Produtos</h4>
                            <div class="tl-products">
                                ${set.boosterInfo.types.map(t => `<span class="tl-product">${t}</span>`).join('')}
                            </div>
                            <h4><i data-lucide="percent"></i> Chances por Booster</h4>
                            <div class="tl-odds">
                                ${Object.entries(set.boosterInfo.odds).map(([rarity, chance]) => `
                                    <span class="tl-odd tl-rarity-${rarity}">
                                        <span class="tl-odd-rarity">${rarity === 'ordinary' ? 'Ordinary' : rarity === 'exceptional' ? 'Exceptional' : rarity === 'elite' ? 'Elite' : 'Unique'}</span>
                                        <span class="tl-odd-value">${chance}</span>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Próximos lançamentos
    const upcoming = timeline.nextRelease;
    let upcomingHtml = '';

    if (upcoming) {
        const tracker = new TimelineTracker();
        const upcomingReleases = tracker.getUpcomingReleases();

        if (upcomingReleases.length > 0) {
            upcomingHtml = `
                <div class="tl-upcoming-section">
                    <h3><i data-lucide="calendar-clock"></i> Próximos Lançamentos</h3>
                    <div class="tl-upcoming-grid">
                        ${upcomingReleases.map(r => `
                            <div class="tl-upcoming-card ${r.status}">
                                <div class="tl-upcoming-status">${r.status === 'announced' ? 'Anunciado' : 'Rumor'}</div>
                                <h4>${r.name}</h4>
                                <p>${r.description}</p>
                                <div class="tl-upcoming-date">
                                    <i data-lucide="calendar"></i>
                                    <span>${r.expectedDateFormatted}</span>
                                    ${r.daysUntil ? `<span class="tl-countdown">(${r.daysUntil} dias)</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    return `
        <div class="tl-summary">
            <div class="tl-summary-stat">
                <i data-lucide="layers"></i>
                <span class="tl-summary-value">${timeline.sets.length}</span>
                <span class="tl-summary-label">Sets</span>
            </div>
            <div class="tl-summary-stat">
                <i data-lucide="square-stack"></i>
                <span class="tl-summary-value">${timeline.totalCards}</span>
                <span class="tl-summary-label">Cartas Totais</span>
            </div>
            <div class="tl-summary-stat">
                <i data-lucide="sparkles"></i>
                <span class="tl-summary-value">${timeline.latestSet || '-'}</span>
                <span class="tl-summary-label">Mais Recente</span>
            </div>
        </div>

        <div class="tl-grid">
            ${setsHtml}
        </div>

        ${upcomingHtml}
    `;
}

// =============================================================================
// EXPORTS
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SET_INFO,
        UPCOMING_RELEASES,
        TimelineTracker,
        formatReleaseDatePT,
        getTimeSinceReleasePT,
        renderTimeline
    };
}

if (typeof window !== 'undefined') {
    window.SorceryTimeline = {
        SET_INFO,
        UPCOMING_RELEASES,
        TimelineTracker,
        formatReleaseDatePT,
        getTimeSinceReleasePT,
        renderTimeline
    };
}
