// ============================================
// SISTEMA DE TRACKING DE COLEÇÃO DETALHADO
// ============================================

class CollectionTracker {
    constructor() {
        this.collection = {}; // { cardName: { qty: number, sets: [], notes: '' } }
        this.loadFromStorage();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('sorcery-collection-detailed');
        if (saved) {
            this.collection = JSON.parse(saved);
        }
    }

    saveToStorage() {
        localStorage.setItem('sorcery-collection-detailed', JSON.stringify(this.collection));
    }

    // Adicionar carta à coleção
    addCard(cardName, qty = 1, setName = null) {
        if (!this.collection[cardName]) {
            this.collection[cardName] = { qty: 0, sets: [], notes: '' };
        }
        this.collection[cardName].qty += qty;
        if (setName && !this.collection[cardName].sets.includes(setName)) {
            this.collection[cardName].sets.push(setName);
        }
        this.saveToStorage();
    }

    // Remover carta da coleção
    removeCard(cardName, qty = 1) {
        if (this.collection[cardName]) {
            this.collection[cardName].qty = Math.max(0, this.collection[cardName].qty - qty);
            if (this.collection[cardName].qty === 0) {
                delete this.collection[cardName];
            }
            this.saveToStorage();
        }
    }

    // Definir quantidade exata
    setCardQty(cardName, qty, setName = null) {
        if (qty <= 0) {
            delete this.collection[cardName];
        } else {
            if (!this.collection[cardName]) {
                this.collection[cardName] = { qty: 0, sets: [], notes: '' };
            }
            this.collection[cardName].qty = qty;
            if (setName && !this.collection[cardName].sets.includes(setName)) {
                this.collection[cardName].sets.push(setName);
            }
        }
        this.saveToStorage();
    }

    // Obter quantidade de uma carta
    getCardQty(cardName) {
        return this.collection[cardName]?.qty || 0;
    }

    // Verificar se tem carta
    hasCard(cardName) {
        return this.getCardQty(cardName) > 0;
    }

    // Adicionar nota a uma carta
    addNote(cardName, note) {
        if (this.collection[cardName]) {
            this.collection[cardName].notes = note;
            this.saveToStorage();
        }
    }

    // Obter estatísticas por set
    getSetStats(allCards, setName) {
        const setCards = allCards.filter(card =>
            card.sets.some(s => s.name === setName)
        );
        const owned = setCards.filter(card => this.hasCard(card.name));
        const totalQty = setCards.reduce((sum, card) => sum + this.getCardQty(card.name), 0);

        return {
            setName,
            totalCards: setCards.length,
            ownedUnique: owned.length,
            ownedTotal: totalQty,
            completionPercent: setCards.length > 0
                ? ((owned.length / setCards.length) * 100).toFixed(1)
                : 0,
            missingCards: setCards.filter(card => !this.hasCard(card.name)).map(c => c.name)
        };
    }

    // Obter estatísticas por raridade
    getRarityStats(allCards, rarity) {
        const rarityCards = allCards.filter(card =>
            card.guardian.rarity === rarity
        );
        const owned = rarityCards.filter(card => this.hasCard(card.name));

        return {
            rarity,
            totalCards: rarityCards.length,
            ownedUnique: owned.length,
            completionPercent: rarityCards.length > 0
                ? ((owned.length / rarityCards.length) * 100).toFixed(1)
                : 0
        };
    }

    // Obter estatísticas por elemento
    getElementStats(allCards, element) {
        const elementCards = allCards.filter(card =>
            (card.elements || '').includes(element)
        );
        const owned = elementCards.filter(card => this.hasCard(card.name));

        return {
            element,
            totalCards: elementCards.length,
            ownedUnique: owned.length,
            completionPercent: elementCards.length > 0
                ? ((owned.length / elementCards.length) * 100).toFixed(1)
                : 0
        };
    }

    // Obter estatísticas por tipo
    getTypeStats(allCards, type) {
        const typeCards = allCards.filter(card =>
            card.guardian.type === type
        );
        const owned = typeCards.filter(card => this.hasCard(card.name));

        return {
            type,
            totalCards: typeCards.length,
            ownedUnique: owned.length,
            completionPercent: typeCards.length > 0
                ? ((owned.length / typeCards.length) * 100).toFixed(1)
                : 0
        };
    }

    // Obter estatísticas gerais
    getOverallStats(allCards) {
        const owned = allCards.filter(card => this.hasCard(card.name));
        const totalQty = allCards.reduce((sum, card) => sum + this.getCardQty(card.name), 0);

        return {
            totalUniqueCards: allCards.length,
            ownedUnique: owned.length,
            ownedTotal: totalQty,
            completionPercent: allCards.length > 0
                ? ((owned.length / allCards.length) * 100).toFixed(1)
                : 0
        };
    }

    // Adicionar cartas de um precon
    addPreconCards(preconCards) {
        preconCards.forEach(card => {
            this.addCard(card.name, card.qty);
        });
    }

    // Exportar coleção para JSON
    exportToJSON() {
        return JSON.stringify(this.collection, null, 2);
    }

    // Exportar coleção para CSV
    exportToCSV() {
        let csv = 'Card Name,Quantity,Sets,Notes\n';
        for (const [cardName, data] of Object.entries(this.collection)) {
            const sets = data.sets.join('; ');
            const notes = (data.notes || '').replace(/"/g, '""');
            csv += `"${cardName}",${data.qty},"${sets}","${notes}"\n`;
        }
        return csv;
    }

    // Importar coleção de JSON
    importFromJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.collection = { ...this.collection, ...imported };
            this.saveToStorage();
            return true;
        } catch (e) {
            console.error('Error importing collection:', e);
            return false;
        }
    }

    // Limpar coleção
    clearCollection() {
        this.collection = {};
        this.saveToStorage();
    }

    // Obter lista de cartas faltando para um deck
    getMissingForDeck(deckCards) {
        const missing = [];
        deckCards.forEach(card => {
            const owned = this.getCardQty(card.name);
            const needed = card.qty || 1;
            if (owned < needed) {
                missing.push({
                    name: card.name,
                    needed: needed,
                    owned: owned,
                    missing: needed - owned
                });
            }
        });
        return missing;
    }

    // Verificar se pode construir um deck
    canBuildDeck(deckCards) {
        return this.getMissingForDeck(deckCards).length === 0;
    }
}

// Instância global
const collectionTracker = new CollectionTracker();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CollectionTracker, collectionTracker };
}
