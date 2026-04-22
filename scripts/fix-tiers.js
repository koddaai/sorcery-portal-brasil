#!/usr/bin/env node
// ============================================
// FIX DECK TIERS
// Recalculates tiers based on deck characteristics
// since Curiosa.io API returns 0 for views/likes
//
// Run: node scripts/fix-tiers.js
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DECK_FILE = path.join(__dirname, '..', 'recommended-decks.js');

// Load decks
function loadDecks() {
    const content = fs.readFileSync(DECK_FILE, 'utf8');
    const match = content.match(/const RECOMMENDED_DECKS = (\[[\s\S]*?\]);/);
    if (!match) {
        throw new Error('Could not find RECOMMENDED_DECKS in file');
    }
    return JSON.parse(match[1]);
}

// Determine tier based on multiple factors
function determineTier(deck) {
    const name = (deck.name || '').toLowerCase();
    const author = (deck.author || '').toLowerCase();

    // S-Tier: Tournament winners with 1st place
    if (name.includes('1st place') || name.includes('1st -') ||
        name.includes('winner') || name.includes('champion') ||
        name.includes('1º lugar')) {
        return 'S';
    }

    // A-Tier: Top placements, well-known competitive decks
    if (name.includes('2nd place') || name.includes('3rd place') ||
        name.includes('top 8') || name.includes('top 4') ||
        name.includes('finals') || name.includes('finalist') ||
        name.includes('competitive') ||
        name.includes('league winner') || name.includes('league champion')) {
        return 'A';
    }

    // B-Tier: Tournament decks without explicit placement, decks with primers
    if (name.includes('tournament') || name.includes('torneio') ||
        name.includes('scg con') || name.includes('scgcon') ||
        name.includes('sorcerycon') || name.includes('gencon') ||
        name.includes('cornerstone') || name.includes('crossroads') ||
        deck.hasPrimer || deck.guide?.overview) {
        return 'B';
    }

    // C-Tier: Named competitive decks, known archetypes
    if (name.includes('aggro') || name.includes('control') ||
        name.includes('midrange') || name.includes('tempo') ||
        name.includes('combo') || name.includes('burn') ||
        name.includes('meta') || name.includes('competitive')) {
        return 'C';
    }

    // Precons get B tier by default (playable out of the box)
    if (deck.category === 'precon') {
        return 'B';
    }

    // Default to C for community decks (they were popular enough to be in top 200)
    return 'C';
}

// Save updated decks
function saveDecks(decks) {
    const content = fs.readFileSync(DECK_FILE, 'utf8');

    // Find where functions start
    const functionsStart = content.indexOf('// ============================================\n// FUNÇÕES');
    const functions = content.substring(functionsStart);

    // Get header info
    const headerMatch = content.match(/\/\/ =+[\s\S]*?\/\/ =+\n\n/);
    const header = headerMatch ? headerMatch[0] : '';

    const newContent = header + 'const RECOMMENDED_DECKS = ' + JSON.stringify(decks, null, 2) + ';\n\n' + functions;
    fs.writeFileSync(DECK_FILE, newContent);
}

// Main
const decks = loadDecks();
console.log(`Processing ${decks.length} decks...\n`);

const tierCounts = { S: 0, A: 0, B: 0, C: 0, D: 0 };

decks.forEach(deck => {
    const oldTier = deck.tier;
    const newTier = determineTier(deck);

    if (oldTier !== newTier) {
        console.log(`${deck.name.substring(0, 50)}: ${oldTier} -> ${newTier}`);
    }

    deck.tier = newTier;
    tierCounts[newTier]++;
});

saveDecks(decks);

console.log('\n--- Tier Distribution ---');
Object.entries(tierCounts).forEach(([tier, count]) => {
    console.log(`  ${tier}: ${count} decks`);
});

console.log('\nDone! Run:');
console.log('npx terser recommended-decks.js -o recommended-decks.min.js -c -m');
