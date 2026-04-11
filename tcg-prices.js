/**
 * TCG Prices - Sistema de preços estilo LigaMagic
 * Estrutura: min/mid/max por finish (Standard/Foil/Rainbow)
 *
 * Fonte: TCGPlayer Market Prices (Abril 2026)
 * Atualizar semanalmente para manter precisão
 */

// Preços base por raridade e set (USD)
// Baseado em análise de mercado TCGPlayer
const RARITY_PRICE_RANGES = {
    // Alpha - Set mais escasso, 5x mais caro que Beta
    Alpha: {
        Ordinary: { min: 0.25, mid: 0.50, max: 1.50 },
        Elite: { min: 1.00, mid: 3.00, max: 8.00 },
        Exceptional: { min: 5.00, mid: 15.00, max: 40.00 },
        Unique: { min: 25.00, mid: 75.00, max: 300.00 }
    },
    // Beta - Baseline, set mais aberto
    Beta: {
        Ordinary: { min: 0.05, mid: 0.15, max: 0.50 },
        Elite: { min: 0.25, mid: 0.75, max: 2.50 },
        Exceptional: { min: 1.00, mid: 3.50, max: 12.00 },
        Unique: { min: 3.00, mid: 12.00, max: 50.00 }
    },
    // Arthurian Legends - Print run grande, demanda baixa
    'Arthurian Legends': {
        Ordinary: { min: 0.02, mid: 0.08, max: 0.25 },
        Elite: { min: 0.10, mid: 0.35, max: 1.00 },
        Exceptional: { min: 0.50, mid: 1.50, max: 5.00 },
        Unique: { min: 0.20, mid: 2.00, max: 8.00 }
    },
    // Gothic - Set popular, demanda alta
    Gothic: {
        Ordinary: { min: 0.10, mid: 0.25, max: 0.75 },
        Elite: { min: 0.50, mid: 1.50, max: 4.00 },
        Exceptional: { min: 2.00, mid: 6.00, max: 18.00 },
        Unique: { min: 5.00, mid: 20.00, max: 65.00 }
    },
    // Dragonlord - Set recente
    Dragonlord: {
        Ordinary: { min: 0.08, mid: 0.20, max: 0.60 },
        Elite: { min: 0.35, mid: 1.00, max: 3.00 },
        Exceptional: { min: 1.50, mid: 4.50, max: 14.00 },
        Unique: { min: 4.00, mid: 15.00, max: 45.00 }
    },
    // Promotional - Extremamente escasso
    Promotional: {
        Ordinary: { min: 5.00, mid: 15.00, max: 50.00 },
        Elite: { min: 15.00, mid: 40.00, max: 100.00 },
        Exceptional: { min: 30.00, mid: 80.00, max: 200.00 },
        Unique: { min: 50.00, mid: 150.00, max: 500.00 }
    }
};

// Multiplicadores de finish
const FINISH_MULTIPLIERS = {
    Standard: 1.0,
    Foil: 3.5,      // Foils ~3-4x mais caros
    Rainbow: 12.0   // Rainbows ~10-15x mais caros (1 por case)
};

// Preços específicos de cards (override manual)
// Cards que não seguem a curva normal de preços
const SPECIFIC_CARD_PRICES = {
    // ============================================
    // ALPHA CHASE CARDS
    // ============================================
    "Erik's Curiosa": {
        Alpha: {
            Standard: { min: 200.00, mid: 252.00, max: 350.00 },
            Foil: { min: 600.00, mid: 800.00, max: 1200.00 },
            Rainbow: { min: 2000.00, mid: 2500.00, max: 3500.00 }
        }
    },
    "Death": {
        Alpha: {
            Standard: { min: 140.00, mid: 180.00, max: 250.00 },
            Foil: { min: 400.00, mid: 550.00, max: 800.00 },
            Rainbow: { min: 1400.00, mid: 1800.00, max: 2500.00 }
        },
        Beta: {
            Standard: { min: 35.00, mid: 45.00, max: 65.00 },
            Foil: { min: 100.00, mid: 150.00, max: 220.00 },
            Rainbow: { min: 350.00, mid: 500.00, max: 750.00 }
        }
    },
    "Merlin": {
        Alpha: {
            Standard: { min: 120.00, mid: 150.00, max: 200.00 },
            Foil: { min: 350.00, mid: 450.00, max: 650.00 }
        },
        Beta: {
            Standard: { min: 28.00, mid: 35.00, max: 50.00 },
            Foil: { min: 85.00, mid: 120.00, max: 175.00 }
        },
        'Arthurian Legends': {
            Standard: { min: 18.00, mid: 25.00, max: 35.00 },
            Foil: { min: 55.00, mid: 80.00, max: 120.00 }
        }
    },

    // ============================================
    // STAPLES COMPETITIVOS
    // ============================================
    "Lightning Bolt": {
        Alpha: {
            Standard: { min: 28.00, mid: 35.00, max: 48.00 },
            Foil: { min: 95.00, mid: 120.00, max: 165.00 },
            Rainbow: { min: 320.00, mid: 400.00, max: 550.00 }
        },
        Beta: {
            Standard: { min: 6.00, mid: 8.00, max: 12.00 },
            Foil: { min: 20.00, mid: 28.00, max: 40.00 },
            Rainbow: { min: 120.00, mid: 150.00, max: 200.00 }
        }
    },
    "Counterspell": {
        Alpha: {
            Standard: { min: 22.00, mid: 28.00, max: 38.00 },
            Foil: { min: 75.00, mid: 95.00, max: 135.00 }
        },
        Beta: {
            Standard: { min: 5.00, mid: 6.50, max: 9.00 },
            Foil: { min: 17.00, mid: 22.00, max: 32.00 }
        }
    },
    "Fireball": {
        Alpha: {
            Standard: { min: 18.00, mid: 22.00, max: 30.00 },
            Foil: { min: 60.00, mid: 75.00, max: 100.00 }
        },
        Beta: {
            Standard: { min: 3.50, mid: 5.00, max: 7.00 },
            Foil: { min: 12.00, mid: 18.00, max: 25.00 }
        }
    },

    // ============================================
    // GOTHIC CHASE CARDS
    // ============================================
    "Dracula": {
        Gothic: {
            Standard: { min: 48.00, mid: 60.00, max: 85.00 },
            Foil: { min: 140.00, mid: 180.00, max: 260.00 },
            Rainbow: { min: 480.00, mid: 600.00, max: 850.00 }
        }
    },
    "Nosferatu": {
        Gothic: {
            Standard: { min: 35.00, mid: 45.00, max: 60.00 },
            Foil: { min: 110.00, mid: 140.00, max: 190.00 }
        }
    },
    "Frankenstein's Monster": {
        Gothic: {
            Standard: { min: 28.00, mid: 35.00, max: 48.00 },
            Foil: { min: 85.00, mid: 110.00, max: 150.00 }
        }
    },
    "Van Helsing": {
        Gothic: {
            Standard: { min: 22.00, mid: 28.00, max: 38.00 },
            Foil: { min: 65.00, mid: 85.00, max: 120.00 }
        }
    },

    // ============================================
    // ARTHURIAN LEGENDS
    // ============================================
    "King Arthur": {
        'Arthurian Legends': {
            Standard: { min: 4.50, mid: 6.50, max: 9.00 },
            Foil: { min: 15.00, mid: 22.00, max: 32.00 },
            Rainbow: { min: 65.00, mid: 85.00, max: 120.00 }
        }
    },
    "Holy Grail": {
        'Arthurian Legends': {
            Standard: { min: 6.00, mid: 8.00, max: 12.00 },
            Foil: { min: 20.00, mid: 28.00, max: 40.00 }
        }
    },

    // ============================================
    // BULK CARDS (preços muito baixos)
    // ============================================
    "Whirling Blades": {
        'Arthurian Legends': {
            Standard: { min: 0.15, mid: 0.36, max: 0.60 },
            Foil: { min: 0.50, mid: 1.00, max: 1.80 }
        }
    },
    "Phantom Sword": {
        'Arthurian Legends': {
            Standard: { min: 0.10, mid: 0.22, max: 0.40 },
            Foil: { min: 0.35, mid: 0.75, max: 1.25 }
        }
    }
};

/**
 * TCGPriceService - Serviço de preços estilo LigaMagic
 */
class TCGPriceService {
    constructor() {
        this.specificPrices = SPECIFIC_CARD_PRICES;
        this.rarityRanges = RARITY_PRICE_RANGES;
        this.finishMultipliers = FINISH_MULTIPLIERS;
        this.priceDataVersion = '2026-04-10'; // Versão dos dados de preço manuais
        this.currency = 'USD';
        this.brlRate = 5.80; // Default fallback (atualizado)
        this.brlRateLastFetch = null;
        this.isFetchingRate = false;

        // Carregar taxa salva do localStorage
        this.loadSavedRate();

        // Buscar cotação atual automaticamente
        this.fetchCurrentBRLRate();
    }

    /**
     * Carregar taxa salva do localStorage
     */
    loadSavedRate() {
        try {
            const saved = localStorage.getItem('sorcery-brl-rate');
            if (saved) {
                const data = JSON.parse(saved);
                // Usar cache se tiver menos de 6 horas
                if (data.timestamp && (Date.now() - data.timestamp) < 6 * 60 * 60 * 1000) {
                    this.brlRate = data.rate;
                    this.brlRateLastFetch = data.timestamp;
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar taxa BRL:', e);
        }
    }

    /**
     * Salvar taxa no localStorage
     */
    saveRate() {
        try {
            localStorage.setItem('sorcery-brl-rate', JSON.stringify({
                rate: this.brlRate,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Erro ao salvar taxa BRL:', e);
        }
    }

    /**
     * Obter data de última atualização (hoje para cotação, versão para preços)
     */
    get lastUpdate() {
        if (this.brlRateLastFetch) {
            return new Date(this.brlRateLastFetch).toISOString().split('T')[0];
        }
        return this.priceDataVersion;
    }

    /**
     * Buscar cotação atual do dólar (USD -> BRL)
     * Usa a AwesomeAPI (gratuita, dados do BCB)
     */
    async fetchCurrentBRLRate() {
        // Evitar múltiplas requisições simultâneas
        if (this.isFetchingRate) {
            return this.brlRate;
        }

        // Cache de 5 minutos para não sobrecarregar a API
        const now = Date.now();
        if (this.brlRateLastFetch && (now - this.brlRateLastFetch) < 5 * 60 * 1000) {
            return this.brlRate;
        }

        this.isFetchingRate = true;

        try {
            const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
            if (!response.ok) throw new Error('Failed to fetch rate');

            const data = await response.json();
            if (data.USDBRL && data.USDBRL.bid) {
                this.brlRate = parseFloat(data.USDBRL.bid);
                this.brlRateLastFetch = now;
                this.saveRate(); // Salvar no localStorage
                console.log(`Cotação atualizada: 1 USD = R$ ${this.brlRate.toFixed(2)}`);

                // Atualizar UI se estiver visível
                this.updateRateDisplay();
            }
        } catch (error) {
            console.warn('Erro ao buscar cotação, usando fallback:', error);
            // Mantém o rate anterior ou fallback
        } finally {
            this.isFetchingRate = false;
        }

        return this.brlRate;
    }

    /**
     * Atualizar exibição da taxa na UI
     */
    updateRateDisplay() {
        const rateEl = document.getElementById('current-brl-rate');
        if (rateEl) {
            rateEl.textContent = this.brlRate.toFixed(2);
        }

        // Atualizar também nos botões de moeda se existirem
        document.querySelectorAll('.currency-btn[data-currency="BRL"]').forEach(btn => {
            btn.textContent = `BRL (${this.brlRate.toFixed(2)})`;
        });
    }

    /**
     * Formatar tempo relativo (ex: "há 5 min", "há 1 hora")
     */
    getTimeAgo(timestamp) {
        if (!timestamp) return 'desconhecido';

        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'agora';
        if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
        return `há ${Math.floor(seconds / 86400)} dias`;
    }

    /**
     * Obter preços de um card (todas as variantes)
     * Prioridade: 1. TCGCSV (dados reais TCGPlayer), 2. Manual, 3. Estimativa
     */
    getCardPrices(cardName, cardData = null) {
        const result = {
            cardName,
            hasSpecificPrices: false,
            hasTCGCSVPrices: false,
            prices: {},
            lastUpdate: this.lastUpdate
        };

        // 1. Tentar TCGCSV primeiro (dados reais do TCGPlayer)
        if (typeof tcgcsvPriceService !== 'undefined' && tcgcsvPriceService.cardPrices.size > 0) {
            const tcgcsvPrices = tcgcsvPriceService.getAllPrices(cardName);

            if (tcgcsvPrices && tcgcsvPrices.length > 0) {
                result.hasTCGCSVPrices = true;
                result.hasSpecificPrices = true;

                // Agrupar por set
                const bySet = {};
                tcgcsvPrices.forEach(p => {
                    if (!bySet[p.setName]) {
                        bySet[p.setName] = {};
                    }

                    // Mapear finish: "Normal" -> "Standard", "Foil" -> "Foil"
                    const finish = p.finish === 'Normal' ? 'Standard' : p.finish;

                    bySet[p.setName][finish] = {
                        min: p.lowPrice || p.marketPrice * 0.8,
                        mid: p.marketPrice || p.midPrice,
                        max: p.highPrice || p.marketPrice * 1.2,
                        market: p.marketPrice,
                        url: p.url
                    };
                });

                result.prices = bySet;
                result.lastUpdate = tcgcsvPriceService.lastUpdate
                    ? tcgcsvPriceService.lastUpdate.toISOString().split('T')[0]
                    : this.lastUpdate;

                return result;
            }
        }

        // 2. Verificar se tem preços específicos manuais
        if (this.specificPrices[cardName]) {
            result.hasSpecificPrices = true;
            result.prices = this.specificPrices[cardName];
            return result;
        }

        // 3. Gerar preços estimados baseados em raridade
        if (cardData) {
            const rarity = cardData.guardian?.rarity || 'Ordinary';
            const sets = cardData.sets?.map(s => s.name) || ['Beta'];

            sets.forEach(setName => {
                const setRanges = this.rarityRanges[setName] || this.rarityRanges['Beta'];
                const baseRange = setRanges[rarity] || setRanges['Ordinary'];

                result.prices[setName] = {
                    Standard: { ...baseRange },
                    Foil: {
                        min: +(baseRange.min * this.finishMultipliers.Foil).toFixed(2),
                        mid: +(baseRange.mid * this.finishMultipliers.Foil).toFixed(2),
                        max: +(baseRange.max * this.finishMultipliers.Foil).toFixed(2)
                    },
                    Rainbow: {
                        min: +(baseRange.min * this.finishMultipliers.Rainbow).toFixed(2),
                        mid: +(baseRange.mid * this.finishMultipliers.Rainbow).toFixed(2),
                        max: +(baseRange.max * this.finishMultipliers.Rainbow).toFixed(2)
                    }
                };
            });
        }

        return result;
    }

    /**
     * Obter preço de uma variante específica
     */
    getVariantPrice(cardName, setName, finish = 'Standard', priceType = 'mid') {
        const prices = this.getCardPrices(cardName);

        if (prices.prices[setName] && prices.prices[setName][finish]) {
            return prices.prices[setName][finish][priceType];
        }

        return null;
    }

    /**
     * Formatar preço para exibição
     */
    formatPrice(price, currency = null) {
        if (price === null || price === undefined) return 'N/A';

        const useBRL = currency === 'BRL' || (currency === null && this.shouldUseBRL());

        if (useBRL) {
            const brlPrice = price * this.brlRate;
            return 'R$ ' + brlPrice.toFixed(2).replace('.', ',');
        }

        return 'US$ ' + price.toFixed(2);
    }

    /**
     * Formatar range de preços (min - max)
     */
    formatPriceRange(priceData, currency = null) {
        if (!priceData) return 'N/A';

        const min = this.formatPrice(priceData.min, currency);
        const max = this.formatPrice(priceData.max, currency);

        return `${min} - ${max}`;
    }

    /**
     * Detectar se deve usar BRL
     */
    shouldUseBRL() {
        const lang = navigator.language || 'en';
        return lang.toLowerCase().startsWith('pt');
    }

    /**
     * Gerar HTML da tabela de preços estilo LigaMagic
     */
    generatePriceTableHTML(cardName, cardData = null) {
        const priceData = this.getCardPrices(cardName, cardData);
        const sets = Object.keys(priceData.prices);

        if (sets.length === 0) {
            return '<p class="no-prices">Preços não disponíveis</p>';
        }

        let html = '<div class="price-table-container">';

        sets.forEach(setName => {
            const setPrices = priceData.prices[setName];

            html += `
                <div class="price-table">
                    <div class="price-table-header">
                        <span class="set-name">${setName}</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Versão</th>
                                <th>Mínimo</th>
                                <th>Médio</th>
                                <th>Máximo</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            ['Standard', 'Foil', 'Rainbow'].forEach(finish => {
                if (setPrices[finish]) {
                    const p = setPrices[finish];
                    const finishClass = finish.toLowerCase();
                    html += `
                        <tr class="finish-row ${finishClass}">
                            <td class="finish-name">
                                <span class="finish-badge ${finishClass}">${finish}</span>
                            </td>
                            <td class="price-min">${this.formatPrice(p.min)}</td>
                            <td class="price-mid">${this.formatPrice(p.mid)}</td>
                            <td class="price-max">${this.formatPrice(p.max)}</td>
                        </tr>
                    `;
                }
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });

        html += '</div>';

        // Adicionar conversão BRL
        const rateAge = this.brlRateLastFetch
            ? this.getTimeAgo(this.brlRateLastFetch)
            : 'cache';

        // Fonte de dados: TCGCSV ou manual
        const priceSource = priceData.hasTCGCSVPrices
            ? `TCGCSV.com (${priceData.lastUpdate})`
            : `Manual (${this.priceDataVersion})`;

        // Status do TCGCSV
        const tcgcsvStatus = typeof tcgcsvPriceService !== 'undefined'
            ? tcgcsvPriceService.getStatus()
            : null;

        html += `
            <div class="price-currency-toggle">
                <button class="currency-btn active" data-currency="USD">USD</button>
                <button class="currency-btn" data-currency="BRL">BRL (${this.brlRate.toFixed(2)})</button>
            </div>
            <p class="price-disclaimer">
                Fonte: ${priceSource} | Cotação: R$ <span id="current-brl-rate">${this.brlRate.toFixed(2)}</span> <small>(${rateAge})</small>
                ${tcgcsvStatus && tcgcsvStatus.cardCount > 0 ? `<br><small>${tcgcsvStatus.cardCount} cards indexados</small>` : ''}
                <br><a href="https://www.tcgplayer.com/search/sorcery-contested-realm/product?q=${encodeURIComponent(cardName)}" target="_blank">Ver no TCGPlayer</a>
            </p>
        `;

        return html;
    }

    /**
     * Calcular valor total da coleção
     */
    calculateCollectionValue(collection, allCards, finish = 'Standard', priceType = 'mid') {
        let total = 0;
        const breakdown = [];

        for (const cardName of collection) {
            const cardData = allCards.find(c => c.name === cardName);
            if (!cardData) continue;

            const priceData = this.getCardPrices(cardName, cardData);
            const sets = Object.keys(priceData.prices);

            if (sets.length > 0) {
                // Usar o primeiro set disponível
                const setName = sets[0];
                const price = priceData.prices[setName]?.[finish]?.[priceType] || 0;
                total += price;

                breakdown.push({
                    name: cardName,
                    set: setName,
                    finish,
                    price,
                    isSpecific: priceData.hasSpecificPrices
                });
            }
        }

        breakdown.sort((a, b) => b.price - a.price);

        return {
            total: +total.toFixed(2),
            totalBRL: +(total * this.brlRate).toFixed(2),
            cardCount: breakdown.length,
            breakdown,
            topCards: breakdown.slice(0, 10)
        };
    }

    /**
     * Verificar se card tem preço específico
     */
    hasSpecificPrice(cardName) {
        return !!this.specificPrices[cardName];
    }

    /**
     * Listar todos os cards com preços específicos
     */
    listSpecificPriceCards() {
        return Object.keys(this.specificPrices);
    }

    /**
     * Estatísticas do serviço de preços
     */
    getStats() {
        const specificCount = Object.keys(this.specificPrices).length;
        const setsWithPrices = Object.keys(this.rarityRanges).length;

        // TCGCSV status
        const tcgcsvStatus = typeof tcgcsvPriceService !== 'undefined'
            ? tcgcsvPriceService.getStatus()
            : null;

        return {
            specificPriceCards: specificCount,
            setsWithPrices,
            finishTypes: Object.keys(this.finishMultipliers),
            lastUpdate: this.lastUpdate,
            brlRate: this.brlRate,
            tcgcsv: tcgcsvStatus
        };
    }

    /**
     * Forçar atualização dos preços TCGCSV
     */
    async refreshTCGCSVPrices() {
        if (typeof tcgcsvPriceService !== 'undefined') {
            return await tcgcsvPriceService.refresh();
        }
        return false;
    }
}

// Instância global
const tcgPriceService = new TCGPriceService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TCGPriceService,
        tcgPriceService,
        SPECIFIC_CARD_PRICES,
        RARITY_PRICE_RANGES,
        FINISH_MULTIPLIERS
    };
}

// Global para browser
if (typeof window !== 'undefined') {
    window.tcgPriceService = tcgPriceService;
}
