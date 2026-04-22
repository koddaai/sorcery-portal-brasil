#!/usr/bin/env node
// ============================================
// CURATED TIER LIST
// Based on tournament results from Curiosa.io,
// Sorcerers Summit, and official Sorcery TCG sources
//
// Meta Analysis (2025-2026):
// - SorceryCon 2026: Necromancer wins, Water dominant
// - GenCon 2025: Druid (Hot Springs) wins
// - SCGCon Atlanta: Deathspeaker 2nd place
// - Elements: Water/Fire meta (56%+ of top 32)
//
// Run: node scripts/curate-tiers.js
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DECK_FILE = path.join(__dirname, '..', 'recommended-decks.js');

// ============================================
// TIER DEFINITIONS BASED ON TOURNAMENT DATA
// ============================================

// S-Tier Avatars: Tournament winners, consistent top placements
const S_TIER_AVATARS = [
    'necromancer',      // Won SorceryCon 2026 (Ceej)
    'druid',            // Won GenCon 2025 (Hot Springs), multiple top 8s
    'deathspeaker',     // 2nd SCGCon Atlanta, consistent performer
];

// A-Tier Avatars: Frequent top 8, competitive
const A_TIER_AVATARS = [
    'archimago',        // Consistent top 8s, card advantage engine
    'sorcerer',         // Won SorceryCon Constructed (Mederios)
    'battlemage',       // Top 8 SorceryCon (War-Mage)
    'pathfinder',       // 3rd SorceryCon 2026
    'avatar of air',    // Top 8 SorceryCon
];

// B-Tier Avatars: Competitive, occasional top placements
const B_TIER_AVATARS = [
    'geomancer',        // Solid midrange option
    'animist',          // Spirit combos viable
    'sparkmage',        // Aggro potential
    'flamecaller',      // Burn strategies
    'avatar of earth',  // Midrange viable
];

// Known tournament-winning deck patterns
const S_TIER_PATTERNS = [
    /1st place/i,
    /1st -/i,
    /winner/i,
    /champion/i,
    /1º lugar/i,
    /hot springs/i,         // GenCon 2025 winner archetype
    /dank magic/i,          // SorceryCon 2026 winner
    /fury road/i,           // Iconic competitive deck
];

// Top 8 / high placement patterns
const A_TIER_PATTERNS = [
    /2nd place/i,
    /3rd place/i,
    /4th place/i,
    /top 4/i,
    /top 8/i,
    /finalist/i,
    /finals/i,
    /2º lugar/i,
    /3º lugar/i,
];

// Tournament participation patterns
const B_TIER_PATTERNS = [
    /tournament/i,
    /torneio/i,
    /scg con/i,
    /scgcon/i,
    /sorcerycon/i,
    /gencon/i,
    /cornerstone/i,
    /crossroads/i,
    /league/i,
    /summit/i,
];

// Known competitive deck archetypes
const COMPETITIVE_ARCHETYPES = [
    /necromonsters/i,
    /enchantress/i,
    /spirits/i,
    /burn/i,
    /aggro/i,
    /control/i,
    /midrange/i,
    /tempo/i,
    /combo/i,
    /reanimator/i,
    /voidwalk/i,
];

// ============================================
// TIER DETERMINATION LOGIC
// ============================================

function determineTier(deck) {
    const name = (deck.name || '').toLowerCase();
    const avatar = (deck.avatar || '').toLowerCase();
    const hasGuide = !!(deck.guide?.overview && deck.guide.overview.length > 500);
    const elements = (deck.elements || []).map(e => e.toLowerCase());
    const isWaterFire = elements.includes('water') || elements.includes('fire');

    // Precons get B tier (playable out of box)
    if (deck.category === 'precon') {
        return 'B';
    }

    // S-Tier: Tournament winners
    for (const pattern of S_TIER_PATTERNS) {
        if (pattern.test(name)) {
            return 'S';
        }
    }

    // S-Tier: Top avatars with competitive indicators
    if (S_TIER_AVATARS.some(a => avatar.includes(a))) {
        // Check for additional competitive signals
        if (hasGuide || A_TIER_PATTERNS.some(p => p.test(name)) ||
            B_TIER_PATTERNS.some(p => p.test(name))) {
            return 'S';
        }
        // S-tier avatar without tournament mention = A tier
        return 'A';
    }

    // A-Tier: Top placements
    for (const pattern of A_TIER_PATTERNS) {
        if (pattern.test(name)) {
            return 'A';
        }
    }

    // A-Tier avatars
    if (A_TIER_AVATARS.some(a => avatar.includes(a))) {
        if (hasGuide || B_TIER_PATTERNS.some(p => p.test(name))) {
            return 'A';
        }
        return 'B';
    }

    // B-Tier: Tournament participation or B-tier avatars
    for (const pattern of B_TIER_PATTERNS) {
        if (pattern.test(name)) {
            return 'B';
        }
    }

    if (B_TIER_AVATARS.some(a => avatar.includes(a))) {
        return 'B';
    }

    // B-Tier: Decks with detailed guides (author put effort)
    if (hasGuide) {
        return 'B';
    }

    // C-Tier: Known archetypes in meta elements
    if (isWaterFire && COMPETITIVE_ARCHETYPES.some(p => p.test(name))) {
        return 'C';
    }

    // C-Tier: Default for community decks
    return 'C';
}

// ============================================
// MAIN EXECUTION
// ============================================

// Load decks using line-by-line parsing to avoid JSON issues
const content = fs.readFileSync(DECK_FILE, 'utf8');
const lines = content.split('\n');

let currentDeck = {};
let inDeck = false;
let braceCount = 0;
const tierCounts = { S: 0, A: 0, B: 0, C: 0, D: 0 };
const changes = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track deck name
    const nameMatch = line.match(/"name":\s*"([^"]+)"/);
    if (nameMatch) {
        currentDeck.name = nameMatch[1];
    }

    // Track avatar
    const avatarMatch = line.match(/"avatar":\s*"([^"]+)"/);
    if (avatarMatch) {
        currentDeck.avatar = avatarMatch[1];
    }

    // Track category
    const categoryMatch = line.match(/"category":\s*"([^"]+)"/);
    if (categoryMatch) {
        currentDeck.category = categoryMatch[1];
    }

    // Track elements (simplified)
    if (line.includes('"elements":')) {
        const elemMatch = lines.slice(i, i + 5).join('').match(/"elements":\s*\[(.*?)\]/s);
        if (elemMatch) {
            currentDeck.elements = elemMatch[1].match(/"([^"]+)"/g)?.map(e => e.replace(/"/g, '')) || [];
        }
    }

    // Track guide existence
    if (line.includes('"guide":') || line.includes('"hasPrimer": true')) {
        currentDeck.hasGuide = true;
    }

    // Find and replace tier
    const tierMatch = line.match(/"tier":\s*"([^"]+)"/);
    if (tierMatch && currentDeck.name) {
        // Simulate guide for tier calculation
        const deckForTier = {
            ...currentDeck,
            guide: currentDeck.hasGuide ? { overview: 'x'.repeat(600) } : null
        };

        const newTier = determineTier(deckForTier);
        const oldTier = tierMatch[1];

        if (oldTier !== newTier) {
            changes.push({
                name: currentDeck.name.substring(0, 45),
                avatar: currentDeck.avatar,
                old: oldTier,
                new: newTier
            });
        }

        lines[i] = line.replace(/"tier":\s*"[^"]+"/, `"tier": "${newTier}"`);
        tierCounts[newTier]++;

        // Reset for next deck
        currentDeck = {};
    }
}

// Save
fs.writeFileSync(DECK_FILE, lines.join('\n'));

// Report
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         CURATED TIER LIST - Based on Tournament Data       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('Changes made:\n');
changes.slice(0, 30).forEach(c => {
    console.log(`  ${c.old} -> ${c.new}  ${c.name} (${c.avatar})`);
});
if (changes.length > 30) {
    console.log(`  ... and ${changes.length - 30} more changes`);
}

console.log('\n--- Final Tier Distribution ---');
Object.entries(tierCounts).forEach(([tier, count]) => {
    const bar = '█'.repeat(Math.ceil(count / 5));
    console.log(`  ${tier}: ${count.toString().padStart(3)} ${bar}`);
});

console.log('\n--- Tier Criteria ---');
console.log('  S: Tournament winners, top avatars (Necromancer, Druid, Deathspeaker)');
console.log('  A: Top 8 placements, competitive avatars (Archimago, Sorcerer, Battlemage)');
console.log('  B: Tournament participation, precons, detailed guides');
console.log('  C: Community decks, known archetypes');

console.log('\nDone! Run:');
console.log('npx terser recommended-decks.js -o recommended-decks.min.js -c -m');
