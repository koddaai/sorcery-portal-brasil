#!/usr/bin/env node
// ============================================
// SORCERY PRIMER FETCHER
// Fetches primer/guide content for existing decks
// from Curiosa.io and adds it to recommended-decks.js
//
// Run: node scripts/fetch-primers.js
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    PROXY_URL: process.env.PROXY_URL || 'https://sorcery.com.br/api/curiosa',
    DECK_FILE: path.join(__dirname, '..', 'recommended-decks.js'),
    DELAY_BETWEEN_REQUESTS: 500, // ms
    MAX_PRIMER_LENGTH: 15000, // characters to store
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry
async function safeFetch(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'SorceryBrasil/1.0 (primer-fetcher)',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`  Attempt ${i + 1}/${retries} failed:`, error.message);
            if (i < retries - 1) {
                await delay(1000 * (i + 1));
            } else {
                return null;
            }
        }
    }
}

// Build API URL
function buildUrl(endpoint, params) {
    const url = new URL(`${CONFIG.PROXY_URL}/${endpoint}`);
    if (params) {
        url.search = `?batch=1&input=${encodeURIComponent(JSON.stringify(params))}`;
    }
    return url.toString();
}

// Fetch deck with primer (using deck.getById)
async function fetchDeckWithPrimer(deckId) {
    const input = {
        "0": { "json": { "id": deckId } }
    };

    // Use direct API with proper headers (proxy wasn't working for this endpoint)
    const url = `https://curiosa.io/api/trpc/deck.getById?batch=1&input=${encodeURIComponent(JSON.stringify(input))}`;

    for (let i = 0; i < 3; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'SorceryBrasil/1.0 (primer-fetcher)',
                    'Origin': 'https://curiosa.io',
                    'Referer': 'https://curiosa.io/',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data?.[0]?.result?.data?.json?.primer || null;
        } catch (error) {
            if (i < 2) {
                await delay(1000 * (i + 1));
            }
        }
    }
    return null;
}

// Extract and clean primer content
function extractPrimerContent(primerContent) {
    if (!primerContent || primerContent.length < 50) return null;

    // Truncate if too long
    let cleanContent = primerContent;
    if (cleanContent.length > CONFIG.MAX_PRIMER_LENGTH) {
        // Try to cut at a paragraph boundary
        const truncated = cleanContent.substring(0, CONFIG.MAX_PRIMER_LENGTH);
        const lastP = truncated.lastIndexOf('</p>');
        if (lastP > CONFIG.MAX_PRIMER_LENGTH / 2) {
            cleanContent = truncated.substring(0, lastP + 4);
        } else {
            cleanContent = truncated + '...';
        }
    }

    return cleanContent;
}

// Load existing decks
function loadDecks() {
    const content = fs.readFileSync(CONFIG.DECK_FILE, 'utf8');
    const match = content.match(/const RECOMMENDED_DECKS = (\[[\s\S]*?\]);/);
    if (!match) {
        throw new Error('Could not find RECOMMENDED_DECKS in file');
    }
    return JSON.parse(match[1]);
}

// Save updated decks
function saveDecks(decks) {
    const content = fs.readFileSync(CONFIG.DECK_FILE, 'utf8');

    // Find where functions start
    const functionsStart = content.indexOf('// ============================================\n// FUNÇÕES');
    const functions = content.substring(functionsStart);

    // Build new header with guide info
    const date = new Date().toLocaleDateString('pt-BR');
    const withGuide = decks.filter(d => d.guide?.overview).length;

    const header = `// ============================================
// DECKS RECOMENDADOS - SORCERY: CONTESTED REALM
// Fonte: Curiosa.io
// Atualizado: ${date}
// Total: ${decks.length} decks
// Com guia/primer: ${withGuide} decks
//
// Categorias:
// - precon: Decks pré-construídos oficiais
// - iniciante: Decks para iniciantes
// - torneio: Decks competitivos
// - budget: Decks econômicos (<$50)
// - comunidade: Decks populares da comunidade
// ============================================

`;

    const newContent = header + 'const RECOMMENDED_DECKS = ' + JSON.stringify(decks, null, 2) + ';\n\n' + functions;
    fs.writeFileSync(CONFIG.DECK_FILE, newContent);
}

// Main execution
async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         SORCERY PRIMER FETCHER - Curiosa.io                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Load decks
    console.log('Loading existing decks...');
    const decks = loadDecks();
    console.log(`Found ${decks.length} decks\n`);

    // Filter decks that need primers (community decks, not precons)
    const decksToPoll = decks.filter(d =>
        d.category !== 'precon' &&
        d.id &&
        !d.id.startsWith('precon-')
    );

    console.log(`Fetching primers for ${decksToPoll.length} community decks...\n`);

    let fetchedCount = 0;
    let withPrimer = 0;
    let errors = 0;

    for (let i = 0; i < decksToPoll.length; i++) {
        const deck = decksToPoll[i];
        const progress = `[${i + 1}/${decksToPoll.length}]`;

        try {
            const primerRaw = await fetchDeckWithPrimer(deck.id);
            const content = extractPrimerContent(primerRaw);

            if (content) {
                // Find and update deck in original array
                const deckIndex = decks.findIndex(d => d.id === deck.id);
                if (deckIndex >= 0) {
                    decks[deckIndex].guide = {
                        overview: content
                    };
                    decks[deckIndex].hasPrimer = true;
                    withPrimer++;
                    console.log(`${progress} ✓ ${deck.name.substring(0, 40)} (${Math.round(content.length / 1024)}KB)`);
                }
            } else {
                console.log(`${progress} - ${deck.name.substring(0, 40)} (no primer)`);
            }

            fetchedCount++;

        } catch (error) {
            console.log(`${progress} ✗ ${deck.name.substring(0, 40)} (error: ${error.message})`);
            errors++;
        }

        // Rate limiting
        await delay(CONFIG.DELAY_BETWEEN_REQUESTS);

        // Progress update every 25 decks
        if ((i + 1) % 25 === 0) {
            console.log(`\n--- Progress: ${i + 1}/${decksToPoll.length} (${withPrimer} with primer) ---\n`);
        }
    }

    // Save updated decks
    console.log('\n\nSaving updated decks...');
    saveDecks(decks);

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      COMPLETE!                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✓ Processed: ${fetchedCount} decks`);
    console.log(`✓ With primers: ${withPrimer}`);
    console.log(`✗ Errors: ${errors}`);
    console.log(`\nOutput: ${CONFIG.DECK_FILE}`);
    console.log('\nNext steps:');
    console.log('1. Review changes: git diff recommended-decks.js');
    console.log('2. Regenerate minified: npx terser recommended-decks.js -o recommended-decks.min.js -c -m');
    console.log('3. Commit: git add . && git commit -m "Add deck primers from Curiosa.io"');
}

// Run
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
