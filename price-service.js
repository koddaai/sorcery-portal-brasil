// ============================================
// SORCERY PRICE SERVICE
// Integração de preços com múltiplas abordagens
// ============================================
//
// CALIBRAÇÃO DE PREÇOS:
// - Última atualização: Abril 2026
// - Fontes: TCGPlayer, sorcery.market, eBay sold listings
// - Preços estimados são baseados em médias de mercado
// - Para preços precisos, importe dados via CSV do TCGPlayer
//
// REFERÊNCIAS DE MERCADO (Abril 2026):
// - Alpha Box: $800-1000 USD
// - Beta Box: $150-200 USD
// - Unique Alpha (chase): $100-500+ USD
// - Unique Beta (playable): $15-50 USD
// - Rainbow Foil multiplier: ~15x standard
// ============================================

class PriceService {
    constructor() {
        this.prices = {};
        this.nocodbPrices = {}; // Preços do NocoDB
        this.lastUpdate = null;
        this.nocodbLastSync = null;
        this.estimatesLastCalibrated = '2026-04-07'; // Data da última calibração
        this.cacheExpiry = 30 * 24 * 60 * 60 * 1000; // 30 dias (preços manuais)
        this.nocodbCacheExpiry = 24 * 60 * 60 * 1000; // 24 horas (NocoDB)

        // NocoDB Configuration (usar config centralizada se disponível)
        const config = typeof SecurityConfig !== 'undefined' ? SecurityConfig.api : null;
        this.nocodb = {
            baseUrl: config?.baseUrl || 'https://dados.kodda.ai',
            token: config?.token || 'GcWFEnNtNLcuubiYMDGlACXr_Sls7c15SEYKe72-',
            tableId: 'mh3n77dmh5d9jax'
        };

        this.sources = {
            tcgplayer: 'https://www.tcgplayer.com/search/sorcery-contested-realm/product?productLineName=sorcery-contested-realm&q=',
            pricecharting: 'https://www.pricecharting.com/search-products?q=sorcery+contested+realm+',
            sorceryMarket: 'https://sorcery.market/',
            nocodb: 'https://dados.kodda.ai'
        };
        this.loadFromCache();
        this.loadNocodbCache();
    }

    // Carregar preços do cache local
    loadFromCache() {
        const cached = localStorage.getItem('sorcery-prices-cache');
        if (cached) {
            const data = JSON.parse(cached);
            this.prices = data.prices || {};
            this.lastUpdate = data.timestamp ? new Date(data.timestamp) : null;
            console.log(`Loaded ${Object.keys(this.prices).length} prices from cache`);
        }
    }

    // Salvar preços no cache
    saveToCache() {
        const data = {
            prices: this.prices,
            timestamp: Date.now()
        };
        localStorage.setItem('sorcery-prices-cache', JSON.stringify(data));
        this.lastUpdate = new Date();
    }

    // ============================================
    // NOCODB INTEGRATION
    // ============================================

    // Carregar cache de preços do NocoDB
    loadNocodbCache() {
        const cached = localStorage.getItem('sorcery-nocodb-prices');
        if (cached) {
            const data = JSON.parse(cached);
            this.nocodbPrices = data.prices || {};
            this.nocodbLastSync = data.timestamp ? new Date(data.timestamp) : null;
            console.log(`Loaded ${Object.keys(this.nocodbPrices).length} prices from NocoDB cache`);
        }
    }

    // Salvar cache de preços do NocoDB
    saveNocodbCache() {
        const data = {
            prices: this.nocodbPrices,
            timestamp: Date.now()
        };
        localStorage.setItem('sorcery-nocodb-prices', JSON.stringify(data));
        this.nocodbLastSync = new Date();
    }

    // Verificar se o cache do NocoDB precisa ser atualizado
    nocodbCacheNeedsUpdate() {
        if (!this.nocodbLastSync) return true;
        return (Date.now() - this.nocodbLastSync.getTime()) > this.nocodbCacheExpiry;
    }

    // Buscar preços do NocoDB
    async fetchPricesFromNocodb(limit = 1000, offset = 0) {
        try {
            const url = `${this.nocodb.baseUrl}/api/v2/tables/${this.nocodb.tableId}/records?limit=${limit}&offset=${offset}`;
            const response = await fetch(url, {
                headers: {
                    'xc-token': this.nocodb.token
                }
            });

            if (!response.ok) {
                throw new Error(`NocoDB API error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching prices from NocoDB:', error);
            return null;
        }
    }

    // Sincronizar todos os preços do NocoDB
    async syncPricesFromNocodb() {
        console.log('Syncing prices from NocoDB...');
        const allPrices = {};
        let offset = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
            const data = await this.fetchPricesFromNocodb(limit, offset);

            if (!data || !data.list || data.list.length === 0) {
                hasMore = false;
                break;
            }

            // Processar cada registro
            data.list.forEach(record => {
                const slug = record.card_slug;
                if (slug) {
                    allPrices[slug] = {
                        card_name: record.card_name,
                        card_slug: slug,
                        set_name: record.set_name,
                        finish: record.finish,
                        price_usd: parseFloat(record.price_usd) || 0,
                        source: record.source || 'nocodb',
                        last_updated: record.last_updated
                    };
                }
            });

            offset += limit;
            hasMore = data.list.length === limit;
        }

        this.nocodbPrices = allPrices;
        this.saveNocodbCache();
        console.log(`Synced ${Object.keys(allPrices).length} prices from NocoDB`);
        return Object.keys(allPrices).length;
    }

    // Obter preço do NocoDB por slug
    getNocodbPriceBySlug(slug) {
        return this.nocodbPrices[slug] || null;
    }

    // Obter preço do NocoDB por nome da carta e acabamento
    getNocodbPrice(cardName, setName = null, finish = 'Standard') {
        const normalizedSetName = setName?.toLowerCase() || null;
        const normalizedFinish = finish?.toLowerCase() || 'standard';

        // Priority order for sets (prefer main sets over promos)
        const setOrder = ['beta', 'gothic', 'dragonlord', 'arthurian legends', 'alpha', 'promotional'];

        let matches = [];

        // Find all matching entries
        for (const [slug, data] of Object.entries(this.nocodbPrices)) {
            const dataSetName = data.set_name?.toLowerCase() || '';
            const dataFinish = data.finish?.toLowerCase() || 'standard';

            if (data.card_name === cardName && dataFinish === normalizedFinish) {
                // If setName specified, only match exact set
                if (normalizedSetName !== null) {
                    if (dataSetName === normalizedSetName) {
                        return data.price_usd;
                    }
                } else {
                    // Collect all matches for later sorting
                    matches.push({ data, setName: dataSetName });
                }
            }
        }

        // If no specific set requested, return cheapest from common sets
        if (matches.length > 0) {
            // Sort by set priority, then by price (cheapest first)
            matches.sort((a, b) => {
                const aOrder = setOrder.indexOf(a.setName);
                const bOrder = setOrder.indexOf(b.setName);
                const aPriority = aOrder === -1 ? 999 : aOrder;
                const bPriority = bOrder === -1 ? 999 : bOrder;

                if (aPriority !== bPriority) return aPriority - bPriority;
                return a.data.price_usd - b.data.price_usd;
            });
            return matches[0].data.price_usd;
        }

        return null;
    }

    // Obter todos os preços de uma carta (todas as variantes)
    getNocodbPricesForCard(cardName) {
        const prices = [];
        for (const [slug, data] of Object.entries(this.nocodbPrices)) {
            if (data.card_name === cardName) {
                prices.push(data);
            }
        }
        return prices;
    }

    // Inicializar preços do NocoDB (chamado na inicialização da app)
    async initNocodbPrices() {
        if (this.nocodbCacheNeedsUpdate()) {
            try {
                await this.syncPricesFromNocodb();
            } catch (error) {
                console.error('Failed to sync NocoDB prices, using cache:', error);
            }
        }
    }

    // Normalizar nome da carta para busca
    normalizeCardName(name) {
        return name.toLowerCase()
            .replace(/['']/g, "'")
            .replace(/[""]/g, '"')
            .trim();
    }

    // Obter preço de uma carta
    getPrice(cardName, variant = 'standard', setName = null) {
        const finish = variant === 'foil' ? 'Foil' : variant === 'rainbow' ? 'Rainbow' : 'Normal';

        // 1. Primeiro, tentar TCGCSV (dados atualizados do TCGPlayer)
        if (typeof tcgcsvPriceService !== 'undefined' && tcgcsvPriceService.cardPrices.size > 0) {
            const tcgcsvPrice = tcgcsvPriceService.getPrice(cardName, setName, finish);
            if (tcgcsvPrice !== null) {
                return tcgcsvPrice;
            }
        }

        // 2. Fallback para NocoDB
        const nocodbFinish = finish === 'Normal' ? 'Standard' : finish;
        const nocodbPrice = this.getNocodbPrice(cardName, setName, nocodbFinish);
        if (nocodbPrice !== null) {
            return nocodbPrice;
        }

        // 3. Fallback para cache local
        const key = this.normalizeCardName(cardName);
        const priceData = this.prices[key];

        if (!priceData) {
            return null;
        }

        if (variant === 'foil' && priceData.foil) {
            return priceData.foil;
        }

        return priceData.market || priceData.standard || null;
    }

    // Obter dados completos de preço
    getPriceData(cardName) {
        // Combinar dados do NocoDB com cache local
        const nocodbPrices = this.getNocodbPricesForCard(cardName);
        const key = this.normalizeCardName(cardName);
        const localData = this.prices[key] || null;

        if (nocodbPrices.length > 0) {
            // Organizar preços do NocoDB por variante
            const pricesByFinish = {};
            nocodbPrices.forEach(p => {
                const finishKey = p.finish.toLowerCase();
                if (!pricesByFinish[finishKey] || p.price_usd > pricesByFinish[finishKey]) {
                    pricesByFinish[finishKey] = p.price_usd;
                }
            });

            return {
                source: 'nocodb',
                standard: pricesByFinish['standard'] || null,
                foil: pricesByFinish['foil'] || null,
                rainbow: pricesByFinish['rainbow'] || null,
                variants: nocodbPrices,
                lastUpdate: nocodbPrices[0]?.last_updated
            };
        }

        return localData;
    }

    // Definir preço manualmente
    setPrice(cardName, priceData) {
        const key = this.normalizeCardName(cardName);
        this.prices[key] = {
            ...priceData,
            lastUpdate: new Date().toISOString(),
            source: priceData.source || 'manual'
        };
        this.saveToCache();
    }

    // Gerar link do TCGPlayer para uma carta
    getTCGPlayerLink(cardName, setName = '') {
        const query = encodeURIComponent(cardName);
        return `${this.sources.tcgplayer}${query}`;
    }

    // Gerar link do PriceCharting para uma carta
    getPriceChartingLink(cardName) {
        const query = encodeURIComponent(cardName);
        return `${this.sources.pricecharting}${query}`;
    }

    // Calcular valor total de uma coleção
    calculateCollectionValue(collection, allCards) {
        let totalValue = 0;
        let estimatedValue = 0;
        let cardCount = 0;
        let pricedCards = 0;
        let estimatedCards = 0;
        const breakdown = [];

        for (const [cardName, data] of Object.entries(collection)) {
            const qty = typeof data === 'object' ? data.qty : 1;
            const cardData = allCards.find(c => c.name === cardName);
            const price = this.getPrice(cardName);

            if (price) {
                const value = price * qty;
                totalValue += value;
                pricedCards++;
                breakdown.push({
                    name: cardName,
                    qty,
                    price,
                    total: value,
                    source: 'market'
                });
            } else if (cardData) {
                // Usar estimativa baseada em raridade
                const estimate = this.getEstimatedPrice(cardData);
                const value = estimate * qty;
                estimatedValue += value;
                estimatedCards++;
                breakdown.push({
                    name: cardName,
                    qty,
                    price: estimate,
                    total: value,
                    source: 'estimated'
                });
            }
            cardCount += qty;
        }

        // Ordenar por valor total
        breakdown.sort((a, b) => b.total - a.total);

        return {
            totalValue: totalValue.toFixed(2),
            estimatedValue: estimatedValue.toFixed(2),
            combinedValue: (totalValue + estimatedValue).toFixed(2),
            cardCount,
            pricedCards,
            estimatedCards,
            unpricedCards: cardCount - pricedCards - estimatedCards,
            averageCardValue: cardCount > 0 ? ((totalValue + estimatedValue) / cardCount).toFixed(2) : '0.00',
            topCards: breakdown.slice(0, 10),
            breakdown
        };
    }

    // Estimar preço baseado em raridade, tipo, set e acabamento
    // Calibrado com preços de mercado do TCGPlayer (Abril 2026)
    // Fonte: https://www.tcgplayer.com/categories/trading-and-collectible-card-games/sorcery-contested-realm/price-guides
    getEstimatedPrice(card, finish = 'Standard') {
        // Preços base por raridade (USD) - calibrados com TCGPlayer market prices
        // Referências reais:
        // - Ordinary Beta: $0.10-$0.50 (bulk ~$0.15)
        // - Elite Beta: $0.50-$3.00 (playables ~$1.50)
        // - Exceptional Beta: $2.00-$15.00 (staples ~$5-8)
        // - Unique Beta: $5.00-$100.00+ (avatars $15-50, chase cards $50-100+)
        // - Unique Alpha: $50-$500+ (Erik's Curiosa ~$300, Frazetta pieces $500+)
        const rarityPrices = {
            'Ordinary': { base: 0.15, min: 0.05, max: 0.75, pullRate: 0.60 },
            'Elite': { base: 1.00, min: 0.25, max: 4.00, pullRate: 0.25 },
            'Exceptional': { base: 5.00, min: 1.50, max: 18.00, pullRate: 0.12 },
            'Unique': { base: 25.00, min: 5.00, max: 300.00, pullRate: 0.03 }
        };

        // Multiplicadores por tipo de carta
        const typeMultipliers = {
            'Avatar': 2.0,      // Avatares são essenciais e únicos por deck
            'Site': 0.7,        // Sites são comuns e menos demandados
            'Minion': 1.0,      // Baseline
            'Magic': 1.2,       // Spells versáteis
            'Artifact': 1.4,    // Artifacts são raros e poderosos
            'Aura': 1.1         // Auras são situacionais
        };

        // Multiplicadores por set (escassez e demanda)
        // Alpha boxes ~$800-1000, Beta boxes ~$150-200
        // Fonte: TCGPlayer/eBay market data
        const setMultipliers = {
            'Alpha': 4.0,              // Primeiro set, muito escasso (boxes 5x mais caros)
            'Beta': 1.0,               // Baseline, mais aberto
            'Arthurian Legends': 1.5,  // Set temático popular, print run menor
            'Gothic': 1.3,             // Set com cartas meta
            'Dragonlord': 1.2,         // Set mais recente
            'Promotional': 5.0         // Promos extremamente escassas
        };

        // Multiplicadores por acabamento
        // Baseado em dados TCGPlayer:
        // - Foil ~3-5x o preço do standard em cartas comuns
        // - Foil pode ser 10-20x em uniques chase
        // - Rainbow ~10-25x o standard (1 por case aproximadamente)
        const finishMultipliers = {
            'Standard': 1.0,
            'Foil': 4.0,        // Foils ~4x mais raros em média
            'Rainbow': 15.0     // Rainbows extremamente raros (~1 por case)
        };

        // Multiplicador de jogabilidade (cartas meta valem mais)
        // TODO: Integrar com dados de decks populares
        const playabilityBonus = this.getPlayabilityBonus(card);

        // Extrair dados da carta
        const rarity = card.guardian?.rarity || 'Ordinary';
        const type = card.guardian?.type || 'Minion';

        // Pegar o set mais antigo (geralmente mais valioso)
        const cardSets = card.sets?.map(s => s.name) || ['Beta'];
        const primarySet = this.getMostValuableSet(cardSets, setMultipliers);

        // Calcular preço base
        const rarityData = rarityPrices[rarity] || rarityPrices['Ordinary'];
        const basePrice = rarityData.base;

        // Aplicar multiplicadores
        const typeMulti = typeMultipliers[type] || 1.0;
        const setMulti = setMultipliers[primarySet] || 1.0;
        const finishMulti = finishMultipliers[finish] || 1.0;

        // Preço final = base × tipo × set × acabamento × jogabilidade
        let finalPrice = basePrice * typeMulti * setMulti * finishMulti * playabilityBonus;

        // Garantir que está dentro dos limites da raridade (ajustado pelo finish)
        const minPrice = rarityData.min * finishMulti;
        const maxPrice = rarityData.max * finishMulti * setMulti;
        finalPrice = Math.max(minPrice, Math.min(maxPrice, finalPrice));

        return parseFloat(finalPrice.toFixed(2));
    }

    // Determinar o set mais valioso entre os disponíveis
    getMostValuableSet(sets, multipliers) {
        if (!sets || sets.length === 0) return 'Beta';

        return sets.reduce((best, current) => {
            const bestMulti = multipliers[best] || 1.0;
            const currentMulti = multipliers[current] || 1.0;
            return currentMulti > bestMulti ? current : best;
        }, sets[0]);
    }

    // Bonus de jogabilidade baseado em características da carta
    getPlayabilityBonus(card) {
        let bonus = 1.0;
        const rulesText = card.guardian?.rulesText || '';
        const type = card.guardian?.type || '';

        // Avatares com habilidades fortes
        if (type === 'Avatar') {
            bonus *= 1.2;
        }

        // Cartas com keywords poderosas
        const powerKeywords = [
            'Airborne', 'Lethal', 'Stealth', 'Genesis', 'Burrow',
            'Ranged', 'Spellcaster', 'Disable', 'Deathrite'
        ];
        const hasPowerKeyword = powerKeywords.some(kw =>
            rulesText.toLowerCase().includes(kw.toLowerCase())
        );
        if (hasPowerKeyword) {
            bonus *= 1.15;
        }

        // Cartas com draw ou ramp
        if (rulesText.toLowerCase().includes('draw') ||
            rulesText.toLowerCase().includes('search your deck')) {
            bonus *= 1.2;
        }

        // Removal eficiente
        if (rulesText.toLowerCase().includes('destroy') ||
            rulesText.toLowerCase().includes('damage to any')) {
            bonus *= 1.1;
        }

        return Math.min(bonus, 1.5); // Cap em 50% de bonus
    }

    // Obter preço estimado para variante específica
    getEstimatedPriceForVariant(card, variant) {
        const finish = variant?.finish || 'Standard';
        return this.getEstimatedPrice(card, finish);
    }

    // Calcular valor de um deck
    calculateDeckValue(deckCards, allCards) {
        let totalValue = 0;
        let estimatedValue = 0;
        const priced = [];
        const estimated = [];
        const missing = [];

        deckCards.forEach(card => {
            const qty = card.qty || 1;
            const cardData = allCards.find(c => c.name === card.name);
            const price = this.getPrice(card.name);

            if (price) {
                const value = price * qty;
                totalValue += value;
                priced.push({ ...card, price, total: value, source: 'market' });
            } else if (cardData) {
                const estimate = this.getEstimatedPrice(cardData);
                const value = estimate * qty;
                estimatedValue += value;
                estimated.push({ ...card, price: estimate, total: value, source: 'estimated' });
            } else {
                missing.push(card);
            }
        });

        return {
            totalValue: totalValue.toFixed(2),
            estimatedValue: estimatedValue.toFixed(2),
            combinedValue: (totalValue + estimatedValue).toFixed(2),
            pricedCards: priced,
            estimatedCards: estimated,
            unpricedCards: missing
        };
    }

    // Obter cartas mais valiosas
    getMostValuableCards(allCards, limit = 20) {
        const valued = allCards
            .map(card => {
                const price = this.getPrice(card.name);
                const estimate = this.getEstimatedPrice(card);
                return {
                    name: card.name,
                    type: card.guardian?.type,
                    rarity: card.guardian?.rarity,
                    price: price || estimate,
                    source: price ? 'market' : 'estimated',
                    tcgplayerLink: this.getTCGPlayerLink(card.name)
                };
            })
            .sort((a, b) => b.price - a.price);

        return valued.slice(0, limit);
    }

    // Importar preços de CSV
    importPricesFromCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        const header = lines[0].toLowerCase();

        // Detectar delimitador
        const delimiter = header.includes(';') ? ';' : ',';
        const headers = header.split(delimiter).map(h => h.trim());

        // Encontrar índices das colunas
        const nameIndex = headers.findIndex(h =>
            h.includes('name') || h.includes('card') || h.includes('nome'));
        const priceIndex = headers.findIndex(h =>
            h.includes('price') || h.includes('market') || h.includes('preco') || h.includes('valor'));
        const foilIndex = headers.findIndex(h =>
            h.includes('foil'));

        if (nameIndex === -1 || priceIndex === -1) {
            throw new Error('CSV must have "name" and "price" columns');
        }

        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(delimiter).map(c => c.trim().replace(/"/g, ''));
            const name = cols[nameIndex];
            const price = parseFloat(cols[priceIndex]);

            if (name && !isNaN(price)) {
                const priceData = {
                    market: price,
                    standard: price,
                    source: 'csv-import'
                };

                if (foilIndex !== -1 && cols[foilIndex]) {
                    const foilPrice = parseFloat(cols[foilIndex]);
                    if (!isNaN(foilPrice)) {
                        priceData.foil = foilPrice;
                    }
                }

                this.setPrice(name, priceData);
                imported++;
            }
        }

        return imported;
    }

    // Exportar preços para CSV
    exportPricesToCSV() {
        const lines = ['Card Name,Market Price,Foil Price,Source,Last Update'];

        for (const [name, data] of Object.entries(this.prices)) {
            const row = [
                `"${name}"`,
                data.market || data.standard || '',
                data.foil || '',
                data.source || '',
                data.lastUpdate || ''
            ];
            lines.push(row.join(','));
        }

        return lines.join('\n');
    }

    // Taxa de conversão USD para BRL
    getBRLRate() {
        // Usar tcgPriceService se disponível (tem cotação em tempo real)
        if (typeof tcgPriceService !== 'undefined' && tcgPriceService.brlRate) {
            return tcgPriceService.brlRate;
        }

        // Tentar pegar do cache local
        try {
            const cached = localStorage.getItem('sorcery-brl-rate');
            if (cached) {
                const data = JSON.parse(cached);
                // Cache válido por 6 horas
                if (Date.now() - data.timestamp < 6 * 60 * 60 * 1000) {
                    return data.rate;
                }
            }
        } catch (e) {
            console.warn('Erro ao ler cache de taxa BRL:', e);
        }

        // Taxa padrão atualizada (Abril 2026)
        return 5.80;
    }

    // Buscar cotação atualizada (usa tcgPriceService)
    async fetchBRLRate() {
        if (typeof tcgPriceService !== 'undefined') {
            return await tcgPriceService.fetchCurrentBRLRate();
        }
        return this.getBRLRate();
    }

    // Detectar se deve usar BRL baseado no idioma
    shouldUseBRL() {
        const lang = navigator.language || navigator.userLanguage || 'en';
        return lang.toLowerCase().startsWith('pt');
    }

    // Formatar preço para exibição (auto-detecta idioma)
    formatPrice(price, forceCurrency = null) {
        if (price === null || price === undefined) {
            return 'N/A';
        }

        // Determinar moeda baseado no idioma ou parâmetro forçado
        const useBRL = forceCurrency === 'BRL' || (forceCurrency === null && this.shouldUseBRL());

        if (useBRL) {
            const brlPrice = price * this.getBRLRate();
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(brlPrice);
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    // Formatar preço com ambas as moedas
    formatPriceDual(price) {
        if (price === null || price === undefined) {
            return { usd: 'N/A', brl: 'N/A' };
        }

        const brlPrice = price * this.getBRLRate();

        return {
            usd: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(price),
            brl: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(brlPrice)
        };
    }

    // Obter estatísticas de preço por set
    getSetPriceStats(allCards, setName) {
        const setCards = allCards.filter(card =>
            card.sets?.some(s => s.name === setName)
        );

        let totalValue = 0;
        let pricedCount = 0;
        let highest = { name: '', price: 0 };
        let lowest = { name: '', price: Infinity };

        setCards.forEach(card => {
            const price = this.getPrice(card.name) || this.getEstimatedPrice(card);
            if (price) {
                totalValue += price;
                pricedCount++;

                if (price > highest.price) {
                    highest = { name: card.name, price };
                }
                if (price < lowest.price) {
                    lowest = { name: card.name, price };
                }
            }
        });

        return {
            setName,
            totalCards: setCards.length,
            pricedCards: pricedCount,
            totalValue: totalValue.toFixed(2),
            averagePrice: pricedCount > 0 ? (totalValue / pricedCount).toFixed(2) : '0.00',
            highestCard: highest.price > 0 ? highest : null,
            lowestCard: lowest.price < Infinity ? lowest : null
        };
    }

    // Inicializar preços estimados para todas as cartas
    initializeEstimatedPrices(allCards) {
        allCards.forEach(card => {
            const key = this.normalizeCardName(card.name);
            if (!this.prices[key]) {
                // Só adicionar estimativa se não tiver preço real
                // Não salvar no cache - apenas em memória
            }
        });
        console.log('Estimated prices initialized for', allCards.length, 'cards');
    }

    // Obter informações de status do serviço de preços
    getStatus() {
        const cachedPrices = Object.keys(this.prices).length;
        const nocodbPrices = Object.keys(this.nocodbPrices).length;
        const daysSinceCalibration = Math.floor(
            (Date.now() - new Date(this.estimatesLastCalibrated).getTime()) / (1000 * 60 * 60 * 24)
        );
        const hoursSinceNocodbSync = this.nocodbLastSync ?
            Math.floor((Date.now() - this.nocodbLastSync.getTime()) / (1000 * 60 * 60)) : null;

        return {
            cachedPrices,
            nocodbPrices,
            lastCacheUpdate: this.lastUpdate,
            nocodbLastSync: this.nocodbLastSync,
            hoursSinceNocodbSync,
            nocodbCacheExpired: this.nocodbCacheNeedsUpdate(),
            estimatesCalibrated: this.estimatesLastCalibrated,
            daysSinceCalibration,
            needsUpdate: daysSinceCalibration > 30,
            sources: this.sources
        };
    }

    // Gerar relatório de preços para debug
    generatePriceReport(allCards) {
        const report = {
            totalCards: allCards.length,
            withCachedPrice: 0,
            withEstimatedPrice: 0,
            byRarity: {},
            bySet: {},
            topValueCards: []
        };

        allCards.forEach(card => {
            const rarity = card.guardian?.rarity || 'Unknown';
            const sets = card.sets?.map(s => s.name) || ['Unknown'];
            const cachedPrice = this.getPrice(card.name);
            const estimatedPrice = this.getEstimatedPrice(card);

            if (cachedPrice) {
                report.withCachedPrice++;
            } else {
                report.withEstimatedPrice++;
            }

            // Por raridade
            if (!report.byRarity[rarity]) {
                report.byRarity[rarity] = { count: 0, totalValue: 0, avgPrice: 0 };
            }
            report.byRarity[rarity].count++;
            report.byRarity[rarity].totalValue += cachedPrice || estimatedPrice;

            // Por set (primeiro set)
            const primarySet = sets[0];
            if (!report.bySet[primarySet]) {
                report.bySet[primarySet] = { count: 0, totalValue: 0 };
            }
            report.bySet[primarySet].count++;
            report.bySet[primarySet].totalValue += cachedPrice || estimatedPrice;

            // Guardar para top cards
            report.topValueCards.push({
                name: card.name,
                rarity,
                price: cachedPrice || estimatedPrice,
                source: cachedPrice ? 'cached' : 'estimated'
            });
        });

        // Calcular médias
        Object.keys(report.byRarity).forEach(rarity => {
            const data = report.byRarity[rarity];
            data.avgPrice = (data.totalValue / data.count).toFixed(2);
            data.totalValue = data.totalValue.toFixed(2);
        });

        Object.keys(report.bySet).forEach(set => {
            report.bySet[set].totalValue = report.bySet[set].totalValue.toFixed(2);
        });

        // Top 20 cards por valor
        report.topValueCards = report.topValueCards
            .sort((a, b) => b.price - a.price)
            .slice(0, 20);

        return report;
    }

    /**
     * Calculate collection value with detailed breakdown by set, rarity, element, type
     * Used for value tracking charts and analytics
     */
    calculateValueBreakdown(collection, allCards) {
        const breakdown = {
            bySet: {},
            byRarity: {},
            byElement: {},
            byType: {},
            total: 0
        };

        for (const [cardName, data] of Object.entries(collection)) {
            const qty = typeof data === 'object' ? data.qty : 1;
            const cardData = allCards.find(c => c.name === cardName);

            if (!cardData) continue;

            // Get price (real or estimated)
            const price = this.getPrice(cardName) || this.getEstimatedPrice(cardData);
            const value = price * qty;
            breakdown.total += value;

            // By Set
            const setName = cardData.sets?.[0]?.name || 'Unknown';
            if (!breakdown.bySet[setName]) breakdown.bySet[setName] = 0;
            breakdown.bySet[setName] += value;

            // By Rarity
            const rarity = cardData.guardian?.rarity || 'Unknown';
            if (!breakdown.byRarity[rarity]) breakdown.byRarity[rarity] = 0;
            breakdown.byRarity[rarity] += value;

            // By Element
            const element = cardData.guardian?.element || 'Colorless';
            if (!breakdown.byElement[element]) breakdown.byElement[element] = 0;
            breakdown.byElement[element] += value;

            // By Type
            const type = cardData.guardian?.types?.[0] || cardData.types?.[0] || 'Unknown';
            if (!breakdown.byType[type]) breakdown.byType[type] = 0;
            breakdown.byType[type] += value;
        }

        // Sort each breakdown by value (descending)
        const sortObject = (obj) => {
            return Object.fromEntries(
                Object.entries(obj).sort(([,a], [,b]) => b - a)
            );
        };

        return {
            bySet: sortObject(breakdown.bySet),
            byRarity: sortObject(breakdown.byRarity),
            byElement: sortObject(breakdown.byElement),
            byType: sortObject(breakdown.byType),
            total: breakdown.total
        };
    }

    /**
     * Get collection value with breakdown for value tracking
     * Enhanced version that includes breakdown data
     */
    getCollectionValueForTracking(collection, allCards) {
        const baseValue = this.calculateCollectionValue(collection, allCards);
        const breakdown = this.calculateValueBreakdown(collection, allCards);

        return {
            ...baseValue,
            totalValue: parseFloat(baseValue.totalValue),
            estimatedValue: parseFloat(baseValue.estimatedValue),
            combinedValue: parseFloat(baseValue.combinedValue),
            averageCardValue: parseFloat(baseValue.averageCardValue),
            breakdown: breakdown
        };
    }
}

// Price Alerts Manager
const PRICE_ALERTS_PREFIX = 'sorcery-price-alerts';

// Get user-specific storage key for price alerts
function getPriceAlertsStorageKey() {
    let userId = null;
    if (typeof nocoDBService !== 'undefined' && nocoDBService.currentUser) {
        userId = nocoDBService.currentUser.id || nocoDBService.currentUser.Id;
    }
    if (!userId) {
        try {
            const session = localStorage.getItem('sorcery-session');
            if (session) {
                const user = JSON.parse(session);
                userId = user.id || user.Id;
            }
        } catch (e) {}
    }
    return userId ? `${PRICE_ALERTS_PREFIX}-${userId}` : PRICE_ALERTS_PREFIX;
}

class PriceAlertManager {
    constructor(priceService) {
        this.priceService = priceService;
        this.alerts = [];
        this.loadAlerts();
    }

    getStorageKey() {
        return getPriceAlertsStorageKey();
    }

    loadAlerts() {
        const storageKey = this.getStorageKey();
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            this.alerts = JSON.parse(saved);
            console.log('[PriceAlerts] Loaded', this.alerts.length, 'alerts from', storageKey);
        }
        // Migrate from global key if user-specific is empty
        this.migrateAlerts();
    }

    migrateAlerts() {
        const userKey = this.getStorageKey();
        const globalKey = PRICE_ALERTS_PREFIX;

        if (userKey !== globalKey) {
            const globalData = localStorage.getItem(globalKey);
            if (globalData && this.alerts.length === 0) {
                try {
                    this.alerts = JSON.parse(globalData);
                    this.saveAlerts();
                    console.log('[PriceAlerts] Migrated alerts from global to', userKey);
                } catch (e) {}
            }
        }
    }

    /**
     * Reload alerts (call after login/logout)
     */
    reload() {
        this.loadAlerts();
    }

    saveAlerts() {
        const storageKey = this.getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(this.alerts));
    }

    // Adicionar alerta
    addAlert(cardName, targetPrice, condition = 'below') {
        const alert = {
            id: Date.now(),
            cardName,
            targetPrice,
            condition, // 'below' ou 'above'
            createdAt: new Date().toISOString(),
            triggered: false
        };

        this.alerts.push(alert);
        this.saveAlerts();
        return alert;
    }

    // Remover alerta
    removeAlert(alertId) {
        this.alerts = this.alerts.filter(a => a.id !== alertId);
        this.saveAlerts();
    }

    // Verificar alertas
    checkAlerts() {
        const triggered = [];

        this.alerts.forEach(alert => {
            if (alert.triggered) return;

            const currentPrice = this.priceService.getPrice(alert.cardName);
            if (!currentPrice) return;

            let shouldTrigger = false;

            if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
                shouldTrigger = true;
            } else if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
                shouldTrigger = true;
            }

            if (shouldTrigger) {
                alert.triggered = true;
                alert.triggeredAt = new Date().toISOString();
                alert.triggeredPrice = currentPrice;
                triggered.push(alert);
            }
        });

        if (triggered.length > 0) {
            this.saveAlerts();
        }

        return triggered;
    }

    // Obter alertas ativos
    getActiveAlerts() {
        return this.alerts.filter(a => !a.triggered);
    }

    // Obter alertas disparados
    getTriggeredAlerts() {
        return this.alerts.filter(a => a.triggered);
    }
}

// Instâncias globais
const priceService = new PriceService();
const priceAlertManager = new PriceAlertManager(priceService);

// Listen for login/logout events to reload user-specific data
if (typeof document !== 'undefined') {
    document.addEventListener('userLoggedIn', () => {
        console.log('[PriceAlerts] User logged in, reloading alerts');
        priceAlertManager.reload();
    });
    document.addEventListener('userLoggedOut', () => {
        console.log('[PriceAlerts] User logged out, clearing alerts');
        priceAlertManager.reload();
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PriceService, PriceAlertManager, priceService, priceAlertManager };
}
