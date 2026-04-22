#!/usr/bin/env node
// ============================================
// TRANSLATE DECK GUIDES
// Translates deck guide content from English to Portuguese
// using OpenAI API (same as fetch-news.js)
//
// Run: OPENAI_API_KEY=your_key node scripts/translate-guides.js
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DECK_FILE = path.join(__dirname, '..', 'recommended-decks.js');
const DELAY_BETWEEN_REQUESTS = 500; // ms

// OpenAI client
let openai = null;
function getOpenAI() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Terms that should NOT be translated (game mechanics, card names, etc.)
 */
const PRESERVE_TERMS = [
    // Game name and core terms
    'Sorcery', 'Sorcery TCG', 'Contested Realm',
    // Collections/Sets
    'Alpha', 'Beta', 'Gothic', 'Arthurian', 'Wonderlands',
    // Game mechanics
    'Dust', 'Aura', 'Minion', 'Avatar', 'Relic', 'Magic', 'Site', 'Artifact',
    'Ordinary', 'Exceptional', 'Elite', 'Unique', 'Threshold', 'Rubble',
    // Avatars
    'Necromancer', 'Druid', 'Deathspeaker', 'Archimago', 'Sorcerer',
    'Battlemage', 'Pathfinder', 'Geomancer', 'Animist', 'Sparkmage',
    'Flamecaller', 'Avatar of Air', 'Avatar of Earth', 'Avatar of Fire', 'Avatar of Water',
    // Elements
    'Air', 'Earth', 'Fire', 'Water',
    // Platforms
    'Curiosa', 'Curiosa.io', 'TCGPlayer',
    // Game terms
    'Foil', 'Rainbow Foil', 'Precon', 'Mulligan'
];

/**
 * Strip HTML tags for translation, preserve structure
 */
function stripHtml(html) {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Restore HTML structure
 */
function toHtml(text) {
    const paragraphs = text.split(/\n\n+/);
    return paragraphs
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
}

/**
 * Check if text is already in Portuguese
 */
function isPortuguese(text) {
    const ptIndicators = [
        /\b(você|voce|para|como|com|que|uma?|seu|sua|seus|suas|este|esta|isso|aqui|então|também|muito|mais|menos|quando|onde|porque|porquê)\b/i,
        /\b(fazer|jogar|usar|atacar|defender|ganhar|perder|comprar|vender)\b/i,
        /[àáâãéêíóôõúç]/i
    ];

    const plainText = stripHtml(text).toLowerCase();
    const matches = ptIndicators.filter(re => re.test(plainText)).length;

    return matches >= 2;
}

/**
 * Translate guide content using OpenAI
 */
async function translateGuide(content, deckName) {
    const plainText = stripHtml(content);

    // Skip if already in Portuguese
    if (isPortuguese(content)) {
        return null; // No translation needed
    }

    // Skip very short content
    if (plainText.length < 100) {
        return null;
    }

    const prompt = `Traduza este guia de deck de Sorcery TCG para português brasileiro.

IMPORTANTE - NÃO TRADUZA estes termos (são nomes próprios, mecânicas ou produtos do jogo):
${PRESERVE_TERMS.join(', ')}

Também NÃO traduza nomes de cartas que aparecem entre [[ e ]] como [[Critical Strike]] ou [[Flaming Sword]].

Mantenha o tom informal e amigável do original. Preserve referências a vídeos e links.

Texto original:
${plainText}

Responda APENAS com a tradução, sem explicações adicionais.`;

    try {
        const response = await getOpenAI().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 4000
        });

        const translated = response.choices[0].message.content.trim();
        return toHtml(translated);
    } catch (error) {
        console.error(`  ✗ Translation failed for ${deckName}: ${error.message}`);
        return null;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         TRANSLATE DECK GUIDES - EN → PT-BR                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Read file content
    const content = fs.readFileSync(DECK_FILE, 'utf8');
    const lines = content.split('\n');

    let currentDeckName = '';
    let translatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let totalGuides = 0;

    // Find all guides first to count them
    for (const line of lines) {
        if (line.includes('"overview":')) {
            totalGuides++;
        }
    }

    console.log(`Found ${totalGuides} guides to process\n`);

    // Process line by line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Track deck name
        const nameMatch = line.match(/"name":\s*"([^"]+)"/);
        if (nameMatch) {
            currentDeckName = nameMatch[1];
        }

        // Find guide overview lines
        const overviewMatch = line.match(/"overview":\s*"(.*)"/);
        if (overviewMatch) {
            const guideContent = overviewMatch[1];
            const progress = `[${translatedCount + skippedCount + 1}/${totalGuides}]`;

            // Unescape JSON string
            const unescaped = guideContent
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\\\/g, '\\');

            // Check if translation needed
            if (isPortuguese(unescaped)) {
                console.log(`${progress} ⊘ ${currentDeckName.substring(0, 45)} (já em PT)`);
                skippedCount++;
                continue;
            }

            // Translate
            console.log(`${progress} ◐ ${currentDeckName.substring(0, 45)}...`);
            const translated = await translateGuide(unescaped, currentDeckName);

            if (translated) {
                // Escape for JSON
                const escaped = translated
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, '\\n');

                lines[i] = line.replace(/"overview":\s*"[^"]*"/, `"overview": "${escaped}"`);
                console.log(`${progress} ✓ ${currentDeckName.substring(0, 45)}`);
                translatedCount++;
            } else {
                console.log(`${progress} - ${currentDeckName.substring(0, 45)} (skipped)`);
                skippedCount++;
            }

            // Save progress every 25 guides
            const processed = translatedCount + skippedCount;
            if (processed % 25 === 0) {
                console.log(`\n--- Saving checkpoint (${processed}/${totalGuides}) ---\n`);
                fs.writeFileSync(DECK_FILE, lines.join('\n'));
            }

            await delay(DELAY_BETWEEN_REQUESTS);
        }
    }

    // Save file (final)
    console.log('\nSaving translated guides...');
    fs.writeFileSync(DECK_FILE, lines.join('\n'));

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      COMPLETE!                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✓ Translated: ${translatedCount}`);
    console.log(`⊘ Already PT/Skipped: ${skippedCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log(`\nNext steps:`);
    console.log('1. Review changes: git diff recommended-decks.js');
    console.log('2. Regenerate minified: npx terser recommended-decks.js -o recommended-decks.min.js -c -m');
}

// Run
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
