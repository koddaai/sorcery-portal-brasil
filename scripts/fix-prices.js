#!/usr/bin/env node
// Fix deck prices to match price-service.js calibration

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deckFile = path.join(__dirname, '..', 'recommended-decks.js');
const content = fs.readFileSync(deckFile, 'utf8');

// Extract the RECOMMENDED_DECKS array
const match = content.match(/const RECOMMENDED_DECKS = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not find RECOMMENDED_DECKS');
  process.exit(1);
}

const decks = JSON.parse(match[1]);

// Correct prices from price-service.js (lines 416-420)
const CORRECT_PRICES = {
  'Unique': 25.00,
  'Exceptional': 5.00,
  'Elite': 1.00,
  'Ordinary': 0.15
};

console.log('Recalculating prices for', decks.length, 'decks...\n');

let changes = 0;
decks.forEach(deck => {
  let newPrice = 0;

  // Sum all cards in decklist
  const allCards = [
    ...(deck.decklist?.minions || []),
    ...(deck.decklist?.spells || []),
    ...(deck.decklist?.sites || []),
    ...(deck.decklist?.artifacts || []),
    ...(deck.decklist?.auras || [])
  ];

  allCards.forEach(card => {
    const price = CORRECT_PRICES[card.rarity] || 0.50;
    newPrice += price * card.qty;
  });

  newPrice = Math.round(newPrice * 100) / 100;

  const oldPrice = deck.estimatedPrice;
  if (newPrice !== oldPrice) {
    const diff = newPrice - oldPrice;
    if (Math.abs(diff) > 20) {
      console.log(`${deck.name}: $${oldPrice} -> $${newPrice} (${diff > 0 ? '+' : ''}$${diff.toFixed(2)})`);
    }
    deck.estimatedPrice = newPrice;
    changes++;
  }
});

console.log('\nUpdated', changes, 'deck prices');

// Also update category based on new price (budget threshold)
const BUDGET_THRESHOLD = 50;
let categoryChanges = 0;

decks.forEach(deck => {
  // Don't change precon category
  if (deck.category === 'precon') return;

  const oldCategory = deck.category;

  // Recategorize based on price
  if (deck.estimatedPrice <= BUDGET_THRESHOLD && oldCategory !== 'budget') {
    // Check if it should be budget
    const name = deck.name.toLowerCase();
    if (!name.includes('tournament') && !name.includes('winner') && !name.includes('1st')) {
      deck.category = 'budget';
      categoryChanges++;
    }
  }
});

console.log('Category changes:', categoryChanges);

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
// Preços calibrados com price-service.js:
// - Ordinary: $0.15 | Elite: $1.00
// - Exceptional: $5.00 | Unique: $25.00
// ============================================

`;

// Get the functions part (after the array)
const functionsStart = content.indexOf('// ============================================\n// FUNÇÕES');
const functions = content.substring(functionsStart);

const newContent = header + 'const RECOMMENDED_DECKS = ' + JSON.stringify(decks, null, 2) + ';\n\n' + functions;

fs.writeFileSync(deckFile, newContent);
console.log('\nSaved to recommended-decks.js');

// Summary stats
const stats = decks.reduce((acc, d) => {
  acc[d.category] = (acc[d.category] || 0) + 1;
  return acc;
}, {});

console.log('\nCategories:', stats);
