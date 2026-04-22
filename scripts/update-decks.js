#!/usr/bin/env node
// ============================================
// SORCERY DECK UPDATER
// Fetches decks from Curiosa.io via proxy
//
// Categories:
// - precon: Pre-constructed decks
// - iniciante: Beginner-friendly decks
// - torneio: Tournament/competitive decks
// - budget: Budget community decks (<$50)
// - comunidade: Popular community decks
//
// Run: node scripts/update-decks.js
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    // Use local proxy in dev, production proxy on server
    PROXY_URL: process.env.PROXY_URL || 'https://sorcery.com.br/api/curiosa',
    DIRECT_URL: 'https://curiosa.io/api', // For testing

    TOTAL_DECKS: 200,
    BATCH_SIZE: 30,
    OUTPUT_FILE: path.join(__dirname, '..', 'recommended-decks.js'),
    DELAY_BETWEEN_REQUESTS: 800, // ms

    // Price thresholds for categorization (USD)
    BUDGET_MAX_PRICE: 50,
    STANDARD_MAX_PRICE: 150,

    // Use direct API (requires running from curiosa.io domain or with proxy)
    USE_PROXY: true, // Using Cloudflare proxy
};

// Price estimates by rarity (USD)
const PRICE_ESTIMATES = {
    'Unique': 15.00,
    'Exceptional': 2.50,
    'Elite': 0.75,
    'Ordinary': 0.15,
};

// Element icons for display
const ELEMENTS = {
    'Fire': { icon: 'flame', color: '#ef4444' },
    'Water': { icon: 'droplet', color: '#3b82f6' },
    'Earth': { icon: 'mountain', color: '#84cc16' },
    'Air': { icon: 'wind', color: '#a855f7' },
};

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry
async function safeFetch(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'SorceryBrasil/1.0 (deck-updater)',
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`  Attempt ${i + 1}/${retries} failed:`, error.message);
            if (i < retries - 1) {
                await delay(1000 * (i + 1));
            } else {
                throw error;
            }
        }
    }
}

// Build API URL (with or without proxy)
function buildUrl(endpoint, params) {
    const baseUrl = CONFIG.USE_PROXY ? CONFIG.PROXY_URL : CONFIG.DIRECT_URL;
    const url = new URL(`${baseUrl}/${endpoint}`);

    if (params) {
        url.search = `?batch=1&input=${encodeURIComponent(JSON.stringify(params))}`;
    }

    return url.toString();
}

// Fetch precon decks
async function fetchPreconDecks() {
    console.log('  Fetching precon decks...');

    const input = {
        "0": { "json": null }
    };

    const url = buildUrl('trpc/precon.getAllPrecons', input);

    try {
        const data = await safeFetch(url);
        return data?.[0]?.result?.data?.json || [];
    } catch (error) {
        console.error('  Failed to fetch precons:', error.message);
        return [];
    }
}

// Fetch popular decks
async function fetchPopularDecks(cursor = null, limit = 30) {
    const input = {
        "0": { "json": null, "meta": { "values": ["undefined"] } },
        "1": {
            "json": {
                "query": "",
                "sort": "all time",
                "avatar": "*",
                "divider": "all",
                "filters": [],
                "limit": limit,
                "direction": "forward",
                ...(cursor ? { "cursor": cursor } : {})
            }
        },
        "2": {
            "json": {
                "query": "",
                "avatar": "*",
                "divider": "all",
                "filters": []
            }
        }
    };

    const url = buildUrl('trpc/card.getAllAvatars,deck.search,deck.count', input);
    return await safeFetch(url);
}

// Fetch deck details
async function fetchDeckDetails(deckId) {
    const input = {
        "0": { "json": { "id": deckId, "tracking": false } },
        "1": { "json": { "id": deckId, "tracking": false } },
        "2": { "json": { "id": deckId, "tracking": false } },
        "3": { "json": { "id": deckId, "tracking": false } }
    };

    const url = buildUrl('trpc/deck.getDecklistById,deck.getAvatarById,deck.getSideboardById,deck.getMaybeboardById', input);
    return await safeFetch(url);
}

// Fetch deck primer
async function fetchDeckPrimer(deckId) {
    const input = {
        "0": { "json": { "id": deckId } }
    };

    const url = buildUrl('trpc/deck.getPrimerById', input);

    try {
        return await safeFetch(url);
    } catch {
        return null;
    }
}

// Fetch deck comments
async function fetchDeckComments(deckId) {
    const input = {
        "0": { "json": { "id": deckId } }
    };

    const url = buildUrl('trpc/deck.getCommentsById', input);

    try {
        return await safeFetch(url);
    } catch {
        return null;
    }
}

// Process deck cards
function processDecklist(decklistData) {
    if (!decklistData || !Array.isArray(decklistData)) {
        return { decklist: { minions: [], spells: [], sites: [], artifacts: [], auras: [] }, totalPrice: 0, elements: {} };
    }

    const decklist = {
        minions: [],
        spells: [],
        sites: [],
        artifacts: [],
        auras: [],
    };

    let totalPrice = 0;
    const elementCount = {};

    for (const item of decklistData) {
        const card = item.card;
        if (!card) continue;

        const cardEntry = {
            name: card.name,
            qty: item.quantity,
            cost: card.cost,
            rarity: card.rarity,
        };

        // Count elements
        for (const element of card.elements || []) {
            const elemName = element.name || element;
            elementCount[elemName] = (elementCount[elemName] || 0) + item.quantity;
        }

        // Calculate price
        const variant = card.variants?.[0];
        const price = variant?.price || PRICE_ESTIMATES[card.rarity] || 0.50;
        totalPrice += price * item.quantity;

        // Categorize
        const type = card.type?.toLowerCase() || '';
        if (type === 'site') decklist.sites.push(cardEntry);
        else if (type === 'artifact') decklist.artifacts.push(cardEntry);
        else if (type === 'aura') decklist.auras.push(cardEntry);
        else if (type === 'minion') decklist.minions.push(cardEntry);
        else decklist.spells.push(cardEntry);
    }

    // Sort each category
    for (const category of Object.keys(decklist)) {
        decklist[category].sort((a, b) => (a.cost || 0) - (b.cost || 0) || a.name.localeCompare(b.name));
    }

    return { decklist, totalPrice: Math.round(totalPrice * 100) / 100, elements: elementCount };
}

// Determine deck category
function determineCategory(deck, totalPrice, hasPrimer) {
    // Check if it's a budget deck
    if (totalPrice <= CONFIG.BUDGET_MAX_PRICE) {
        return 'budget';
    }

    // Check for tournament indicators
    const name = (deck.name || '').toLowerCase();
    const description = (deck.description || '').toLowerCase();

    if (name.includes('tournament') || name.includes('torneio') ||
        name.includes('winner') || name.includes('champion') ||
        description.includes('tournament') || description.includes('1st place')) {
        return 'torneio';
    }

    // Check for beginner indicators
    if (name.includes('beginner') || name.includes('iniciante') ||
        name.includes('starter') || name.includes('budget') ||
        name.includes('poorcery') || name.includes('simple')) {
        return 'iniciante';
    }

    // Decks with primers are usually for learning
    if (hasPrimer && totalPrice <= CONFIG.STANDARD_MAX_PRICE) {
        return 'iniciante';
    }

    // High-view decks with expensive cards are tournament
    if (deck.views > 5000 && totalPrice > CONFIG.STANDARD_MAX_PRICE) {
        return 'torneio';
    }

    return 'comunidade';
}

// Get tier from stats
function determineTier(views, likes) {
    const score = views + (likes * 100);
    if (score > 50000) return 'S';
    if (score > 20000) return 'A';
    if (score > 10000) return 'B';
    if (score > 5000) return 'C';
    return 'D';
}

// Get primary elements
function getPrimaryElements(elementCount) {
    return Object.entries(elementCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([element]) => element);
}

// Get key cards
function getKeyCards(decklist) {
    const allCards = [
        ...decklist.minions || [],
        ...decklist.spells || [],
        ...decklist.artifacts || [],
        ...decklist.auras || [],
    ];

    const scored = allCards.map(card => ({
        name: card.name,
        score: (card.rarity === 'Unique' ? 10 : card.rarity === 'Exceptional' ? 5 : 2) + card.qty * 2,
    }));

    return [...new Set(scored.sort((a, b) => b.score - a.score).map(c => c.name))].slice(0, 5);
}

// Extract guide from primer and comments
function extractGuide(primerData, commentsData) {
    const guide = {
        overview: '',
        strategy: '',
        mulliganTips: '',
        tips: [],
    };

    // Process primer
    if (primerData?.[0]?.result?.data?.json?.content) {
        guide.overview = primerData[0].result.data.json.content.substring(0, 2000);
    }

    // Process comments (top 3 author comments)
    if (commentsData?.[0]?.result?.data?.json) {
        const comments = commentsData[0].result.data.json;
        for (const comment of comments.slice(0, 10)) {
            if (comment.content && comment.content.length > 30) {
                guide.tips.push({
                    author: comment.user?.username || 'Unknown',
                    content: comment.content.substring(0, 300),
                });
            }
            if (guide.tips.length >= 3) break;
        }
    }

    return guide;
}

// Process a single deck
async function processDeck(deckSummary, index, total) {
    const deckId = deckSummary.id;
    const deckName = deckSummary.name || 'Unnamed Deck';

    console.log(`[${index + 1}/${total}] ${deckName}`);

    try {
        // Fetch all data
        const [detailsData, primerData, commentsData] = await Promise.all([
            fetchDeckDetails(deckId),
            fetchDeckPrimer(deckId),
            fetchDeckComments(deckId),
        ]);

        // Process
        const decklistRaw = detailsData?.[0]?.result?.data?.json || [];
        const avatarData = detailsData?.[1]?.result?.data?.json;

        const { decklist, totalPrice, elements } = processDecklist(decklistRaw);
        const guide = extractGuide(primerData, commentsData);

        const avatarName = avatarData?.card?.name || deckSummary.avatar?.name || 'Unknown';
        const primaryElements = getPrimaryElements(elements);
        const keyCards = getKeyCards(decklist);
        const tier = determineTier(deckSummary.views || 0, deckSummary.likes || 0);
        const hasPrimer = !!primerData?.[0]?.result?.data?.json?.content;
        const category = determineCategory(deckSummary, totalPrice, hasPrimer);

        const deck = {
            id: deckId,
            name: deckName,
            author: deckSummary.user?.username ? `@${deckSummary.user.username}` : 'Unknown',
            url: `https://curiosa.io/decks/${deckId}`,
            views: deckSummary.views || 0,
            likes: deckSummary.likes || 0,
            format: deckSummary.format || 'Constructed',
            category: category,
            avatar: avatarName,
            elements: primaryElements,
            tier: tier,
            estimatedPrice: totalPrice,
            keyCards: keyCards,
            isPrimer: hasPrimer,
            updatedAt: deckSummary.updatedAt || new Date().toISOString(),

            stats: {
                spellbookSize: ['minions', 'spells', 'artifacts', 'auras'].reduce(
                    (sum, cat) => sum + (decklist[cat]?.reduce((s, c) => s + c.qty, 0) || 0), 0
                ),
                atlasSize: decklist.sites?.reduce((s, c) => s + c.qty, 0) || 0,
            },

            guide: guide,
            decklist: decklist,
        };

        console.log(`  ✓ ${category} | ${primaryElements.join('/')} | ${tier}-Tier | $${totalPrice}`);
        return deck;

    } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        return null;
    }
}

// Process precon deck
function processPreconDeck(precon) {
    const decklist = {
        minions: [],
        spells: [],
        sites: [],
        artifacts: [],
        auras: [],
    };

    let totalPrice = 0;
    const elements = {};

    // Process cards from precon
    for (const item of precon.cards || []) {
        const card = item.card;
        if (!card) continue;

        const cardEntry = {
            name: card.name,
            qty: item.quantity,
            cost: card.cost,
            rarity: card.rarity,
        };

        // Count elements
        for (const element of card.elements || []) {
            const elemName = element.name || element;
            elements[elemName] = (elements[elemName] || 0) + item.quantity;
        }

        // Price
        totalPrice += (PRICE_ESTIMATES[card.rarity] || 0.50) * item.quantity;

        // Categorize
        const type = card.type?.toLowerCase() || '';
        if (type === 'site') decklist.sites.push(cardEntry);
        else if (type === 'artifact') decklist.artifacts.push(cardEntry);
        else if (type === 'aura') decklist.auras.push(cardEntry);
        else if (type === 'minion') decklist.minions.push(cardEntry);
        else decklist.spells.push(cardEntry);
    }

    return {
        id: precon.id,
        name: precon.name,
        author: 'Official',
        url: `https://curiosa.io/precons/${precon.slug || precon.id}`,
        views: 0,
        likes: 0,
        format: 'Constructed',
        category: 'precon',
        avatar: precon.avatar?.name || 'Unknown',
        elements: getPrimaryElements(elements),
        tier: 'A',
        estimatedPrice: Math.round(totalPrice * 100) / 100,
        keyCards: getKeyCards(decklist),
        isPrimer: false,
        updatedAt: precon.releasedAt || new Date().toISOString(),
        stats: {
            spellbookSize: ['minions', 'spells', 'artifacts', 'auras'].reduce(
                (sum, cat) => sum + (decklist[cat]?.reduce((s, c) => s + c.qty, 0) || 0), 0
            ),
            atlasSize: decklist.sites?.reduce((s, c) => s + c.qty, 0) || 0,
        },
        guide: {
            overview: precon.description || `Deck pré-construído oficial: ${precon.name}`,
            tips: [],
        },
        decklist: decklist,
    };
}

// Generate output file
function generateOutput(decks) {
    // Sort by category, then tier, then views
    const categoryOrder = { 'precon': 0, 'iniciante': 1, 'torneio': 2, 'budget': 3, 'comunidade': 4 };
    const tierOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4 };

    decks.sort((a, b) => {
        const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
        if (catDiff !== 0) return catDiff;
        const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
        if (tierDiff !== 0) return tierDiff;
        return b.views - a.views;
    });

    const output = `// ============================================
// DECKS RECOMENDADOS - SORCERY: CONTESTED REALM
// Fonte: Curiosa.io
// Atualizado: ${new Date().toLocaleDateString('pt-BR')}
// Total: ${decks.length} decks
//
// Categorias:
// - precon: Decks pré-construídos oficiais
// - iniciante: Decks para iniciantes
// - torneio: Decks competitivos
// - budget: Decks econômicos (<$50)
// - comunidade: Decks populares da comunidade
// ============================================

const RECOMMENDED_DECKS = ${JSON.stringify(decks, null, 2)};

// ============================================
// FUNÇÕES DE BUSCA E FILTRO
// ============================================

/**
 * Busca deck por ID
 */
function getDeckById(id) {
    return RECOMMENDED_DECKS.find(deck => deck.id === id);
}

/**
 * Filtra decks por categoria
 * @param {string} category - precon|iniciante|torneio|budget|comunidade
 */
function getDecksByCategory(category) {
    return RECOMMENDED_DECKS.filter(deck => deck.category === category);
}

/**
 * Filtra decks por elemento
 * @param {string} element - Fire|Water|Earth|Air
 */
function getDecksByElement(element) {
    return RECOMMENDED_DECKS.filter(deck =>
        deck.elements.some(e => e.toLowerCase() === element.toLowerCase())
    );
}

/**
 * Filtra decks por categoria E elemento
 */
function getDecksByCategoryAndElement(category, element) {
    return RECOMMENDED_DECKS.filter(deck =>
        deck.category === category &&
        deck.elements.some(e => e.toLowerCase() === element.toLowerCase())
    );
}

/**
 * Filtra decks por tier
 */
function getDecksByTier(tier) {
    return RECOMMENDED_DECKS.filter(deck => deck.tier === tier);
}

/**
 * Filtra decks por avatar
 */
function getDecksByAvatar(avatar) {
    return RECOMMENDED_DECKS.filter(deck =>
        deck.avatar.toLowerCase().includes(avatar.toLowerCase())
    );
}

/**
 * Filtra decks por faixa de preço (USD)
 */
function getDecksByPriceRange(minPrice, maxPrice) {
    return RECOMMENDED_DECKS.filter(deck =>
        deck.estimatedPrice >= minPrice && deck.estimatedPrice <= maxPrice
    );
}

/**
 * Busca decks por texto (nome, autor, key cards)
 */
function searchDecks(query) {
    const q = query.toLowerCase();
    return RECOMMENDED_DECKS.filter(deck =>
        deck.name.toLowerCase().includes(q) ||
        deck.author.toLowerCase().includes(q) ||
        deck.keyCards.some(card => card.toLowerCase().includes(q))
    );
}

/**
 * Retorna estatísticas dos decks
 */
function getDeckStats() {
    const stats = {
        total: RECOMMENDED_DECKS.length,
        byCategory: {},
        byElement: {},
        byTier: {},
        avgPrice: 0,
    };

    let totalPrice = 0;

    for (const deck of RECOMMENDED_DECKS) {
        stats.byCategory[deck.category] = (stats.byCategory[deck.category] || 0) + 1;
        stats.byTier[deck.tier] = (stats.byTier[deck.tier] || 0) + 1;

        for (const element of deck.elements) {
            stats.byElement[element] = (stats.byElement[element] || 0) + 1;
        }

        totalPrice += deck.estimatedPrice;
    }

    stats.avgPrice = Math.round(totalPrice / RECOMMENDED_DECKS.length * 100) / 100;
    return stats;
}

/**
 * Labels de categoria em português
 */
const CATEGORY_LABELS = {
    precon: { name: 'Pré-construído', icon: 'package', description: 'Decks oficiais prontos para jogar' },
    iniciante: { name: 'Iniciante', icon: 'graduation-cap', description: 'Decks simples para aprender' },
    torneio: { name: 'Torneio', icon: 'trophy', description: 'Decks competitivos de alto nível' },
    budget: { name: 'Budget', icon: 'piggy-bank', description: 'Decks econômicos (<$50)' },
    comunidade: { name: 'Comunidade', icon: 'users', description: 'Decks populares da comunidade' },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RECOMMENDED_DECKS,
        CATEGORY_LABELS,
        getDeckById,
        getDecksByCategory,
        getDecksByElement,
        getDecksByCategoryAndElement,
        getDecksByTier,
        getDecksByAvatar,
        getDecksByPriceRange,
        searchDecks,
        getDeckStats,
    };
}
`;

    return output;
}

// Main execution
async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         SORCERY DECK UPDATER - Curiosa.io Fetcher         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\nProxy: ${CONFIG.USE_PROXY ? 'Enabled' : 'Disabled (direct)'}`);
    console.log(`Target: ${CONFIG.TOTAL_DECKS} decks\n`);

    const allDecks = [];

    // Step 1: Fetch precon decks
    console.log('\n📦 Step 1: Fetching Precon Decks...');
    try {
        const precons = await fetchPreconDecks();
        console.log(`  Found ${precons.length} precon decks`);

        for (const precon of precons) {
            const processed = processPreconDeck(precon);
            if (processed) {
                allDecks.push(processed);
                console.log(`  ✓ ${processed.name} (${processed.avatar})`);
            }
        }
    } catch (error) {
        console.error('  ✗ Failed to fetch precons:', error.message);
    }

    // Step 2: Fetch community decks
    console.log('\n🌐 Step 2: Fetching Community Decks...');
    const deckSummaries = [];
    let cursor = null;
    let fetchedCount = 0;

    while (fetchedCount < CONFIG.TOTAL_DECKS) {
        try {
            const batchSize = Math.min(CONFIG.BATCH_SIZE, CONFIG.TOTAL_DECKS - fetchedCount);
            const response = await fetchPopularDecks(cursor, batchSize);

            const searchResult = response?.[1]?.result?.data?.json;
            if (!searchResult?.decks?.length) {
                console.log('  No more decks available.');
                break;
            }

            deckSummaries.push(...searchResult.decks);
            fetchedCount += searchResult.decks.length;
            cursor = searchResult.nextCursor;

            console.log(`  Fetched ${fetchedCount}/${CONFIG.TOTAL_DECKS} summaries...`);

            if (!cursor) break;
            await delay(CONFIG.DELAY_BETWEEN_REQUESTS);

        } catch (error) {
            console.error('  Error:', error.message);
            break;
        }
    }

    // Step 3: Process each deck
    console.log(`\n🔍 Step 3: Processing ${deckSummaries.length} Community Decks...\n`);

    for (let i = 0; i < deckSummaries.length; i++) {
        const deck = await processDeck(deckSummaries[i], i, deckSummaries.length);
        if (deck) {
            allDecks.push(deck);
        }
        await delay(CONFIG.DELAY_BETWEEN_REQUESTS);

        // Progress
        if ((i + 1) % 20 === 0) {
            console.log(`\n  Progress: ${i + 1}/${deckSummaries.length}\n`);
        }
    }

    // Step 4: Generate output
    console.log('\n📝 Step 4: Generating Output...');
    const output = generateOutput(allDecks);
    fs.writeFileSync(CONFIG.OUTPUT_FILE, output);

    // Summary
    const stats = { precon: 0, iniciante: 0, torneio: 0, budget: 0, comunidade: 0 };
    for (const deck of allDecks) {
        stats[deck.category] = (stats[deck.category] || 0) + 1;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      COMPLETE!                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✓ Total: ${allDecks.length} decks`);
    console.log('\nBy Category:');
    console.log(`  Precon:     ${stats.precon}`);
    console.log(`  Iniciante:  ${stats.iniciante}`);
    console.log(`  Torneio:    ${stats.torneio}`);
    console.log(`  Budget:     ${stats.budget}`);
    console.log(`  Comunidade: ${stats.comunidade}`);
    console.log(`\nOutput: ${CONFIG.OUTPUT_FILE}`);
    console.log('\nRun: git add recommended-decks.js && git commit -m "Update deck database"\n');
}

// Run
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
