/**
 * Chase Cards Prices - Tabela de exceções com preços reais de mercado
 * Cards valiosos que não seguem a fórmula de estimativa padrão
 *
 * Fonte: TCGPlayer Market Prices (Abril 2026)
 * Atualizar mensalmente para manter precisão
 */

const CHASE_CARDS_PRICES = {
    // ============================================
    // ALPHA UNIQUES - Extremamente raros e valiosos
    // ============================================
    "Erik's Curiosa": {
        standard: { Alpha: 252.37 },
        foil: { Alpha: 800.00 },
        rainbow: { Alpha: 2500.00 },
        notes: "Card mais valioso do jogo. Arte de Frank Frazetta."
    },
    "Death": {
        standard: { Alpha: 180.00, Beta: 45.00 },
        foil: { Alpha: 550.00, Beta: 150.00 },
        rainbow: { Alpha: 1800.00 },
        notes: "Avatar meta, extremamente jogado."
    },
    "Merlin": {
        standard: { Alpha: 150.00, Beta: 35.00, "Arthurian Legends": 25.00 },
        foil: { Alpha: 450.00, Beta: 120.00 },
        rainbow: { Alpha: 1500.00 },
        notes: "Avatar icônico, alto demand."
    },
    "Morgan le Fay": {
        standard: { Alpha: 120.00, "Arthurian Legends": 18.00 },
        foil: { Alpha: 380.00 },
        rainbow: { Alpha: 1200.00 },
        notes: "Avatar forte em control."
    },
    "Excalibur": {
        standard: { Alpha: 95.00, "Arthurian Legends": 12.00 },
        foil: { Alpha: 300.00 },
        rainbow: { Alpha: 950.00 },
        notes: "Artifact lendário."
    },

    // ============================================
    // BETA CHASE CARDS - Staples competitivos
    // ============================================
    "Lightning Bolt": {
        standard: { Alpha: 35.00, Beta: 8.00 },
        foil: { Alpha: 120.00, Beta: 28.00 },
        rainbow: { Alpha: 400.00, Beta: 150.00 },
        notes: "Removal universal, 4-of em quase todo deck."
    },
    "Counterspell": {
        standard: { Alpha: 28.00, Beta: 6.50 },
        foil: { Alpha: 95.00, Beta: 22.00 },
        rainbow: { Alpha: 320.00, Beta: 120.00 },
        notes: "Counter essencial para control."
    },
    "Fireball": {
        standard: { Alpha: 22.00, Beta: 5.00 },
        foil: { Alpha: 75.00, Beta: 18.00 },
        rainbow: { Alpha: 250.00, Beta: 95.00 },
        notes: "Finisher clássico."
    },
    "Teleport": {
        standard: { Alpha: 18.00, Beta: 4.00 },
        foil: { Alpha: 60.00, Beta: 14.00 },
        rainbow: { Alpha: 200.00, Beta: 75.00 },
        notes: "Trick de combate essencial."
    },

    // ============================================
    // GOTHIC CHASE CARDS - Meta atual
    // ============================================
    "Dracula": {
        standard: { Gothic: 60.58 },
        foil: { Gothic: 180.00 },
        rainbow: { Gothic: 600.00 },
        notes: "Avatar mais forte de Gothic, define o meta."
    },
    "Nosferatu": {
        standard: { Gothic: 45.00 },
        foil: { Gothic: 140.00 },
        rainbow: { Gothic: 450.00 },
        notes: "Minion chase de Gothic."
    },
    "Frankenstein's Monster": {
        standard: { Gothic: 35.00 },
        foil: { Gothic: 110.00 },
        rainbow: { Gothic: 350.00 },
        notes: "Criatura icônica."
    },
    "Van Helsing": {
        standard: { Gothic: 28.00 },
        foil: { Gothic: 85.00 },
        rainbow: { Gothic: 280.00 },
        notes: "Tech contra vampiros."
    },

    // ============================================
    // ARTHURIAN LEGENDS CHASE
    // ============================================
    "King Arthur": {
        standard: { "Arthurian Legends": 6.47 },
        foil: { "Arthurian Legends": 22.00 },
        rainbow: { "Arthurian Legends": 85.00 },
        notes: "Avatar temático, colecionável."
    },
    "Lancelot": {
        standard: { "Arthurian Legends": 4.50 },
        foil: { "Arthurian Legends": 15.00 },
        rainbow: { "Arthurian Legends": 60.00 },
        notes: "Minion forte em aggro."
    },
    "Holy Grail": {
        standard: { "Arthurian Legends": 8.00 },
        foil: { "Arthurian Legends": 28.00 },
        rainbow: { "Arthurian Legends": 100.00 },
        notes: "Artifact de lifegain."
    },

    // ============================================
    // PROMOTIONAL EXCLUSIVES
    // ============================================
    "Kickstarter Exclusive Avatar": {
        standard: { Promotional: 500.00 },
        foil: { Promotional: 1500.00 },
        notes: "Apenas para backers originais."
    },
    "GenCon 2023 Promo": {
        standard: { Promotional: 150.00 },
        foil: { Promotional: 450.00 },
        notes: "Distribuído apenas no evento."
    },
    "SCG CON Exclusive": {
        standard: { Promotional: 80.00 },
        foil: { Promotional: 250.00 },
        notes: "Promo de torneio."
    },

    // ============================================
    // BOX TOPPERS - Rainbow exclusivos
    // ============================================
    "Alpha Box Topper": {
        rainbow: { Alpha: 800.00 },
        notes: "1 por case de Alpha."
    },
    "Beta Box Topper": {
        rainbow: { Beta: 200.00 },
        notes: "1 por case de Beta."
    },
    "Gothic Box Topper": {
        rainbow: { Gothic: 150.00 },
        notes: "1 por case de Gothic."
    }
};

// Cards bulk que valem menos que a estimativa
const BULK_OVERRIDES = {
    // Arthurian Legends - Set com baixa demanda
    "Whirling Blades": { standard: { "Arthurian Legends": 0.36 } },
    "Phantom Sword": { standard: { "Arthurian Legends": 0.22 } },
    "Old Warrior": { standard: { "Arthurian Legends": 0.28 } },
    "Saxon Warrior": { standard: { "Arthurian Legends": 0.25 } },

    // Beta bulk uniques (não jogados)
    "Ceremonial Dagger": { standard: { Beta: 1.45 } },
    "Ancient Tome": { standard: { Beta: 1.80 } },
    "Mystic Orb": { standard: { Beta: 2.20 } }
};

/**
 * ChaseCardsPriceService - Serviço de preços para chase cards
 */
class ChaseCardsPriceService {
    constructor() {
        this.chaseCards = CHASE_CARDS_PRICES;
        this.bulkOverrides = BULK_OVERRIDES;
        this.lastUpdate = '2026-04-08';
    }

    /**
     * Verifica se um card é chase card
     */
    isChaseCard(cardName) {
        return this.chaseCards.hasOwnProperty(cardName);
    }

    /**
     * Verifica se um card tem override de bulk
     */
    hasBulkOverride(cardName) {
        return this.bulkOverrides.hasOwnProperty(cardName);
    }

    /**
     * Obtém preço de chase card
     */
    getChasePrice(cardName, setName = null, finish = 'Standard') {
        const card = this.chaseCards[cardName];
        if (!card) return null;

        const finishKey = finish.toLowerCase();
        const finishData = card[finishKey] || card.standard;

        if (!finishData) return null;

        // Se set específico foi pedido
        if (setName && finishData[setName]) {
            return finishData[setName];
        }

        // Retorna o preço mais alto (geralmente Alpha)
        const prices = Object.values(finishData);
        return prices.length > 0 ? Math.max(...prices) : null;
    }

    /**
     * Obtém preço de bulk override
     */
    getBulkPrice(cardName, setName = null, finish = 'Standard') {
        const card = this.bulkOverrides[cardName];
        if (!card) return null;

        const finishKey = finish.toLowerCase();
        const finishData = card[finishKey] || card.standard;

        if (!finishData) return null;

        if (setName && finishData[setName]) {
            return finishData[setName];
        }

        const prices = Object.values(finishData);
        return prices.length > 0 ? prices[0] : null;
    }

    /**
     * Obtém preço com prioridade: chase > bulk > null
     */
    getOverridePrice(cardName, setName = null, finish = 'Standard') {
        // Primeiro verifica chase cards
        const chasePrice = this.getChasePrice(cardName, setName, finish);
        if (chasePrice !== null) {
            return { price: chasePrice, source: 'chase_card', confidence: 'high' };
        }

        // Depois verifica bulk overrides
        const bulkPrice = this.getBulkPrice(cardName, setName, finish);
        if (bulkPrice !== null) {
            return { price: bulkPrice, source: 'bulk_override', confidence: 'high' };
        }

        return null;
    }

    /**
     * Obtém todos os preços de um card (todas as variantes)
     */
    getAllPrices(cardName) {
        const result = {
            isChase: false,
            isBulk: false,
            prices: [],
            notes: null
        };

        const chaseCard = this.chaseCards[cardName];
        if (chaseCard) {
            result.isChase = true;
            result.notes = chaseCard.notes;

            for (const [finish, sets] of Object.entries(chaseCard)) {
                if (finish === 'notes') continue;
                for (const [setName, price] of Object.entries(sets)) {
                    result.prices.push({
                        finish: finish.charAt(0).toUpperCase() + finish.slice(1),
                        set: setName,
                        price: price,
                        source: 'tcgplayer_manual'
                    });
                }
            }
        }

        const bulkCard = this.bulkOverrides[cardName];
        if (bulkCard) {
            result.isBulk = true;

            for (const [finish, sets] of Object.entries(bulkCard)) {
                for (const [setName, price] of Object.entries(sets)) {
                    result.prices.push({
                        finish: finish.charAt(0).toUpperCase() + finish.slice(1),
                        set: setName,
                        price: price,
                        source: 'tcgplayer_manual'
                    });
                }
            }
        }

        return result;
    }

    /**
     * Lista todos os chase cards
     */
    listChaseCards() {
        return Object.keys(this.chaseCards).map(name => ({
            name,
            notes: this.chaseCards[name].notes,
            hasStandard: !!this.chaseCards[name].standard,
            hasFoil: !!this.chaseCards[name].foil,
            hasRainbow: !!this.chaseCards[name].rainbow
        }));
    }

    /**
     * Estatísticas dos chase cards
     */
    getStats() {
        const chaseCount = Object.keys(this.chaseCards).length;
        const bulkCount = Object.keys(this.bulkOverrides).length;

        let totalChaseValue = 0;
        let highestCard = { name: '', price: 0 };

        for (const [name, data] of Object.entries(this.chaseCards)) {
            const standardPrices = data.standard ? Object.values(data.standard) : [];
            const maxStandard = standardPrices.length > 0 ? Math.max(...standardPrices) : 0;
            totalChaseValue += maxStandard;

            if (maxStandard > highestCard.price) {
                highestCard = { name, price: maxStandard };
            }
        }

        return {
            chaseCardsCount: chaseCount,
            bulkOverridesCount: bulkCount,
            totalOverrides: chaseCount + bulkCount,
            totalChaseValue: totalChaseValue.toFixed(2),
            highestValueCard: highestCard,
            lastUpdate: this.lastUpdate
        };
    }
}

// Instância global
const chaseCardsPriceService = new ChaseCardsPriceService();

// Integrar com PriceService existente
if (typeof priceService !== 'undefined') {
    // Sobrescrever método getPrice - TCGCSV tem prioridade, chase cards é fallback
    const originalGetPrice = priceService.getPrice.bind(priceService);

    priceService.getPrice = function(cardName, variant = 'standard', setName = null) {
        // Primeiro tenta o método original (TCGCSV -> NocoDB -> cache)
        const originalPrice = originalGetPrice(cardName, variant, setName);
        if (originalPrice !== null) {
            return originalPrice;
        }

        // Fallback para chase cards apenas quando não há dados no TCGCSV
        const override = chaseCardsPriceService.getOverridePrice(cardName, setName, variant);
        if (override) {
            return override.price;
        }

        return null;
    };

    // Adicionar método para verificar se é chase
    priceService.isChaseCard = function(cardName) {
        return chaseCardsPriceService.isChaseCard(cardName);
    };

    // Adicionar método para obter info completa de chase
    priceService.getChaseCardInfo = function(cardName) {
        return chaseCardsPriceService.getAllPrices(cardName);
    };

    console.log('Chase cards price service integrated with PriceService');
    console.log(`Loaded ${chaseCardsPriceService.getStats().totalOverrides} price overrides`);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CHASE_CARDS_PRICES,
        BULK_OVERRIDES,
        ChaseCardsPriceService,
        chaseCardsPriceService
    };
}
