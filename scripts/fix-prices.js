#!/usr/bin/env node
// Fix deck prices using actual card prices from TCGCSV data

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load actual card prices from TCGCSV
const pricesFile = path.join(__dirname, '..', 'data', 'tcgcsv', 'prices.json');
const pricesData = JSON.parse(fs.readFileSync(pricesFile, 'utf8'));
const cardPrices = pricesData.cards;

console.log(`Loaded ${Object.keys(cardPrices).length} cards with prices from TCGCSV`);
console.log(`Data updated: ${pricesData.lastUpdate}\n`);

// Get price for a card (prefer market, then mid, then low)
function getCardPrice(cardName) {
    const prices = cardPrices[cardName];
    if (!prices || prices.length === 0) {
        return null;
    }

    // Find the cheapest Normal/Standard version (usually Beta)
    // Priority: Beta Normal > Gothic Normal > Other Normal > Alpha Normal (too expensive)
    const normalPrices = prices.filter(p => p.finish === 'Normal');

    if (normalPrices.length === 0) {
        // No normal finish, use any
        const p = prices[0];
        return p.market || p.mid || p.low || null;
    }

    // Prefer Beta, then Gothic, then Arthurian, then Dragonlord, then Alpha
    const setOrder = ['Beta', 'Gothic', 'Arthurian Legends', 'Dragonlord', 'Alpha'];

    for (const setName of setOrder) {
        const match = normalPrices.find(p => p.set === setName);
        if (match) {
            return match.market || match.mid || match.low || null;
        }
    }

    // Fallback to first available
    const p = normalPrices[0];
    return p.market || p.mid || p.low || null;
}

// Load decks
const deckFile = path.join(__dirname, '..', 'recommended-decks.js');
const content = fs.readFileSync(deckFile, 'utf8');

const match = content.match(/const RECOMMENDED_DECKS = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('Could not find RECOMMENDED_DECKS');
    process.exit(1);
}

const decks = JSON.parse(match[1]);

console.log('Recalculating prices for', decks.length, 'decks using real market prices...\n');

let totalFound = 0;
let totalMissing = 0;
const missingCards = new Set();

decks.forEach(deck => {
    let newPrice = 0;
    let foundCards = 0;
    let missingCardsInDeck = 0;

    // Sum all cards in decklist
    const allCards = [
        ...(deck.decklist?.minions || []),
        ...(deck.decklist?.spells || []),
        ...(deck.decklist?.sites || []),
        ...(deck.decklist?.artifacts || []),
        ...(deck.decklist?.auras || [])
    ];

    allCards.forEach(card => {
        const price = getCardPrice(card.name);
        if (price !== null) {
            newPrice += price * card.qty;
            foundCards++;
        } else {
            missingCardsInDeck++;
            missingCards.add(card.name);
            // Use rarity-based fallback from price-service.js
            const fallbackPrices = {
                'Unique': 25.00,
                'Exceptional': 5.00,
                'Elite': 1.00,
                'Ordinary': 0.15
            };
            const fallback = fallbackPrices[card.rarity] || 0.50;
            newPrice += fallback * card.qty;
        }
    });

    totalFound += foundCards;
    totalMissing += missingCardsInDeck;

    newPrice = Math.round(newPrice * 100) / 100;

    const oldPrice = deck.estimatedPrice;
    const diff = newPrice - oldPrice;

    // Log significant changes
    if (Math.abs(diff) > 50 || Math.abs(diff / oldPrice) > 0.3) {
        console.log(`${deck.name}:`);
        console.log(`  $${oldPrice.toFixed(2)} -> $${newPrice.toFixed(2)} (${diff > 0 ? '+' : ''}$${diff.toFixed(2)})`);
        console.log(`  Cards priced: ${foundCards}/${allCards.length}`);
    }

    deck.estimatedPrice = newPrice;

    // Update category based on new price
    if (deck.category !== 'precon') {
        const name = deck.name.toLowerCase();
        if (newPrice <= 100 && !name.includes('tournament') && !name.includes('winner') && !name.includes('1st')) {
            if (newPrice <= 50) {
                deck.category = 'budget';
            }
        }
    }
});

console.log('\n--- Summary ---');
console.log(`Total card lookups: ${totalFound + totalMissing}`);
console.log(`Found in price database: ${totalFound}`);
console.log(`Using fallback estimates: ${totalMissing}`);
console.log(`Unique missing cards: ${missingCards.size}`);

if (missingCards.size > 0 && missingCards.size < 30) {
    console.log('\nMissing cards (using fallback):');
    [...missingCards].slice(0, 20).forEach(c => console.log(`  - ${c}`));
}

// Calculate category stats
const stats = decks.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
}, {});

console.log('\nCategories:', stats);

// Calculate average prices
const avgByCategory = {};
decks.forEach(d => {
    if (!avgByCategory[d.category]) {
        avgByCategory[d.category] = { total: 0, count: 0 };
    }
    avgByCategory[d.category].total += d.estimatedPrice;
    avgByCategory[d.category].count++;
});

console.log('\nAverage price by category:');
Object.entries(avgByCategory).forEach(([cat, data]) => {
    console.log(`  ${cat}: $${(data.total / data.count).toFixed(2)}`);
});

// Generate updated file
const date = new Date().toLocaleDateString('pt-BR');
const header = `// ============================================
// DECKS RECOMENDADOS - SORCERY: CONTESTED REALM
// Fonte: Curiosa.io
// Atualizado: ${date}
// Total: ${decks.length} decks
//
// Categorias:
// - precon: Decks pré-construídos oficiais
// - iniciante: Decks para iniciantes
// - torneio: Decks competitivos
// - budget: Decks econômicos (<$50)
// - comunidade: Decks populares da comunidade
//
// Preços: TCGPlayer market prices via TCGCSV
// Última atualização de preços: ${pricesData.lastUpdate}
// ============================================

`;

// Get the functions part
const functionsStart = content.indexOf('// ============================================\n// FUNÇÕES');
const functions = content.substring(functionsStart);

const newContent = header + 'const RECOMMENDED_DECKS = ' + JSON.stringify(decks, null, 2) + ';\n\n' + functions;

fs.writeFileSync(deckFile, newContent);
console.log('\nSaved to recommended-decks.js');
