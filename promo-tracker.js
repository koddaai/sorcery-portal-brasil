/**
 * Promo Tracker - Track promotional and exclusive card variants
 * Handles retailer exclusives, Kickstarter, organized play, and special finishes
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const PROMO_CATEGORIES = {
  retailer_exclusive: {
    name: "Retailer Exclusives",
    icon: "store",
    products: ["Star_City_Games", "Alpha_Investments", "Team_Covenant"],
    rarity: "very_rare"
  },
  kickstarter: {
    name: "Kickstarter",
    icon: "rocket",
    products: ["Kickstarter"],
    rarity: "rare"
  },
  organized_play: {
    name: "Organized Play",
    icon: "trophy",
    products: ["Organized_Play", "Dust"],
    rarity: "rare"
  },
  box_topper: {
    name: "Box Toppers",
    icon: "gift",
    products: ["Box_Topper"],
    rarity: "uncommon"
  },
  welcome_kit: {
    name: "Welcome Kit",
    icon: "package",
    products: ["Welcome_Kit"],
    rarity: "common"
  },
  rainbow: {
    name: "Rainbow Foils",
    icon: "sparkles",
    finish: "Rainbow",
    rarity: "very_rare"
  }
};

const RARITY_ORDER = {
  very_rare: 4,
  rare: 3,
  uncommon: 2,
  common: 1
};

const RARITY_COLORS = {
  very_rare: { bg: "#7c3aed", text: "#ffffff", border: "#6d28d9" },
  rare: { bg: "#f59e0b", text: "#000000", border: "#d97706" },
  uncommon: { bg: "#10b981", text: "#ffffff", border: "#059669" },
  common: { bg: "#6b7280", text: "#ffffff", border: "#4b5563" }
};

const ICON_MAP = {
  store: "🏪",
  rocket: "🚀",
  trophy: "🏆",
  gift: "🎁",
  package: "📦",
  sparkles: "✨"
};

// =============================================================================
// PROMO TRACKER CLASS
// =============================================================================

class PromoTracker {
  constructor() {
    this.categories = PROMO_CATEGORIES;
  }

  /**
   * Get all cards that have promo variants
   * @param {Array} allCards - All cards from API
   * @returns {Array} Cards with promo variants
   */
  getPromoCards(allCards) {
    const promoCards = [];

    for (const card of allCards) {
      const category = this._getCardPromoCategory(card);
      if (category) {
        promoCards.push({
          ...card,
          promoCategory: category,
          promoCategoryData: this.categories[category]
        });
      }
    }

    return promoCards;
  }

  /**
   * Get cards belonging to a specific promo category
   * @param {string} category - Category key
   * @param {Array} allCards - All cards from API
   * @returns {Array} Cards in the category
   */
  getCardsByCategory(category, allCards) {
    const categoryData = this.categories[category];
    if (!categoryData) {
      return [];
    }

    return allCards.filter(card => {
      // Check product type match
      if (categoryData.products && categoryData.products.includes(card.product_type)) {
        return true;
      }
      // Check finish match (for rainbow foils)
      if (categoryData.finish && card.finish === categoryData.finish) {
        return true;
      }
      return false;
    }).map(card => ({
      ...card,
      promoCategory: category,
      promoCategoryData: categoryData
    }));
  }

  /**
   * Get all promo variants of a specific card by name
   * @param {string} cardName - Name of the card
   * @param {Array} allCards - All cards from API
   * @returns {Array} All promo variants of the card
   */
  getPromoVariants(cardName, allCards) {
    const normalizedName = cardName.toLowerCase().trim();
    const variants = [];

    for (const card of allCards) {
      if (card.name && card.name.toLowerCase().trim() === normalizedName) {
        const category = this._getCardPromoCategory(card);
        if (category) {
          variants.push({
            ...card,
            promoCategory: category,
            promoCategoryData: this.categories[category]
          });
        }
      }
    }

    // Sort by rarity (rarest first)
    return variants.sort((a, b) => {
      const rarityA = RARITY_ORDER[a.promoCategoryData.rarity] || 0;
      const rarityB = RARITY_ORDER[b.promoCategoryData.rarity] || 0;
      return rarityB - rarityA;
    });
  }

  /**
   * Get statistics on owned promos
   * @param {Array} allCards - All cards from API
   * @param {Object} collection - User's collection { cardId: quantity }
   * @returns {Object} Promo statistics
   */
  getPromoStats(allCards, collection = {}) {
    const stats = {
      totalPromos: 0,
      ownedPromos: 0,
      missingPromos: 0,
      byCategory: {},
      byRarity: {
        very_rare: { total: 0, owned: 0 },
        rare: { total: 0, owned: 0 },
        uncommon: { total: 0, owned: 0 },
        common: { total: 0, owned: 0 }
      },
      completionPercentage: 0,
      uniqueCards: new Set(),
      ownedUniqueCards: new Set()
    };

    // Initialize category stats
    for (const [key, data] of Object.entries(this.categories)) {
      stats.byCategory[key] = {
        name: data.name,
        icon: data.icon,
        rarity: data.rarity,
        total: 0,
        owned: 0,
        completionPercentage: 0
      };
    }

    const promoCards = this.getPromoCards(allCards);

    for (const card of promoCards) {
      const category = card.promoCategory;
      const rarity = card.promoCategoryData.rarity;
      const cardId = card.id || card.slug;
      const isOwned = collection[cardId] && collection[cardId] > 0;

      stats.totalPromos++;
      stats.byCategory[category].total++;
      stats.byRarity[rarity].total++;
      stats.uniqueCards.add(card.name);

      if (isOwned) {
        stats.ownedPromos++;
        stats.byCategory[category].owned++;
        stats.byRarity[rarity].owned++;
        stats.ownedUniqueCards.add(card.name);
      } else {
        stats.missingPromos++;
      }
    }

    // Calculate completion percentages
    stats.completionPercentage = stats.totalPromos > 0
      ? Math.round((stats.ownedPromos / stats.totalPromos) * 100)
      : 0;

    for (const key of Object.keys(stats.byCategory)) {
      const cat = stats.byCategory[key];
      cat.completionPercentage = cat.total > 0
        ? Math.round((cat.owned / cat.total) * 100)
        : 0;
    }

    // Convert Sets to counts
    stats.uniqueCardCount = stats.uniqueCards.size;
    stats.ownedUniqueCardCount = stats.ownedUniqueCards.size;
    delete stats.uniqueCards;
    delete stats.ownedUniqueCards;

    return stats;
  }

  /**
   * Get a checklist for a specific promo category
   * @param {string} category - Category key
   * @param {Array} allCards - All cards from API
   * @param {Object} collection - User's collection
   * @returns {Object} Checklist data
   */
  getPromoChecklist(category, allCards, collection = {}) {
    const categoryData = this.categories[category];
    if (!categoryData) {
      return null;
    }

    const cards = this.getCardsByCategory(category, allCards);
    const checklist = {
      category: category,
      categoryName: categoryData.name,
      icon: categoryData.icon,
      rarity: categoryData.rarity,
      total: cards.length,
      owned: 0,
      missing: 0,
      completionPercentage: 0,
      items: []
    };

    for (const card of cards) {
      const cardId = card.id || card.slug;
      const quantity = collection[cardId] || 0;
      const isOwned = quantity > 0;

      if (isOwned) {
        checklist.owned++;
      } else {
        checklist.missing++;
      }

      checklist.items.push({
        card: card,
        cardId: cardId,
        name: card.name,
        set: card.set || card.edition,
        finish: card.finish,
        productType: card.product_type,
        owned: isOwned,
        quantity: quantity,
        image: card.image_url || card.image
      });
    }

    // Sort: owned first, then alphabetically
    checklist.items.sort((a, b) => {
      if (a.owned !== b.owned) {
        return a.owned ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    checklist.completionPercentage = checklist.total > 0
      ? Math.round((checklist.owned / checklist.total) * 100)
      : 0;

    return checklist;
  }

  /**
   * Get the rarest promos from the collection
   * @param {Array} allCards - All cards from API
   * @param {number} limit - Maximum number to return
   * @returns {Array} Rarest promo cards
   */
  getMostRarePromos(allCards, limit = 10) {
    const promoCards = this.getPromoCards(allCards);

    // Sort by rarity (highest first), then by name
    promoCards.sort((a, b) => {
      const rarityA = RARITY_ORDER[a.promoCategoryData.rarity] || 0;
      const rarityB = RARITY_ORDER[b.promoCategoryData.rarity] || 0;
      if (rarityA !== rarityB) {
        return rarityB - rarityA;
      }
      return (a.name || "").localeCompare(b.name || "");
    });

    return promoCards.slice(0, limit);
  }

  /**
   * Determine which promo category a card belongs to
   * @private
   */
  _getCardPromoCategory(card) {
    for (const [key, data] of Object.entries(this.categories)) {
      // Check product type
      if (data.products && data.products.includes(card.product_type)) {
        return key;
      }
      // Check finish (for rainbow foils)
      if (data.finish && card.finish === data.finish) {
        return key;
      }
    }
    return null;
  }
}

// =============================================================================
// COLLECTION INTEGRATION
// =============================================================================

/**
 * Get all promos the user owns
 * @param {Object} collection - User's collection { cardId: quantity }
 * @param {Array} allCards - All cards from API
 * @returns {Array} Owned promo cards with quantities
 */
function getOwnedPromos(collection, allCards) {
  const tracker = new PromoTracker();
  const promoCards = tracker.getPromoCards(allCards);
  const owned = [];

  for (const card of promoCards) {
    const cardId = card.id || card.slug;
    const quantity = collection[cardId];
    if (quantity && quantity > 0) {
      owned.push({
        ...card,
        quantity: quantity
      });
    }
  }

  // Sort by rarity (rarest first)
  owned.sort((a, b) => {
    const rarityA = RARITY_ORDER[a.promoCategoryData.rarity] || 0;
    const rarityB = RARITY_ORDER[b.promoCategoryData.rarity] || 0;
    return rarityB - rarityA;
  });

  return owned;
}

/**
 * Get all promos the user is missing
 * @param {Object} collection - User's collection { cardId: quantity }
 * @param {Array} allCards - All cards from API
 * @returns {Array} Missing promo cards
 */
function getMissingPromos(collection, allCards) {
  const tracker = new PromoTracker();
  const promoCards = tracker.getPromoCards(allCards);
  const missing = [];

  for (const card of promoCards) {
    const cardId = card.id || card.slug;
    const quantity = collection[cardId] || 0;
    if (quantity === 0) {
      missing.push(card);
    }
  }

  // Sort by rarity (rarest first)
  missing.sort((a, b) => {
    const rarityA = RARITY_ORDER[a.promoCategoryData.rarity] || 0;
    const rarityB = RARITY_ORDER[b.promoCategoryData.rarity] || 0;
    return rarityB - rarityA;
  });

  return missing;
}

/**
 * Calculate the total value of owned promos
 * @param {Object} collection - User's collection { cardId: quantity }
 * @param {Array} allCards - All cards from API
 * @param {Object} priceService - Price service with getPrice(cardId) method
 * @returns {Object} Value breakdown
 */
function getPromoValue(collection, allCards, priceService) {
  const tracker = new PromoTracker();
  const owned = getOwnedPromos(collection, allCards);

  const value = {
    totalValue: 0,
    byCategory: {},
    byRarity: {
      very_rare: 0,
      rare: 0,
      uncommon: 0,
      common: 0
    },
    mostValuable: [],
    cardCount: 0
  };

  // Initialize category values
  for (const key of Object.keys(PROMO_CATEGORIES)) {
    value.byCategory[key] = 0;
  }

  const cardValues = [];

  for (const card of owned) {
    const cardId = card.id || card.slug;
    const price = priceService ? priceService.getPrice(cardId) : (card.price || 0);
    const totalCardValue = price * card.quantity;

    value.totalValue += totalCardValue;
    value.byCategory[card.promoCategory] += totalCardValue;
    value.byRarity[card.promoCategoryData.rarity] += totalCardValue;
    value.cardCount += card.quantity;

    cardValues.push({
      card: card,
      unitPrice: price,
      quantity: card.quantity,
      totalValue: totalCardValue
    });
  }

  // Get most valuable cards
  cardValues.sort((a, b) => b.totalValue - a.totalValue);
  value.mostValuable = cardValues.slice(0, 10);

  return value;
}

// =============================================================================
// RENDER FUNCTIONS
// =============================================================================

/**
 * Render grid of promo category cards
 * @param {Object} categories - Categories to render (defaults to PROMO_CATEGORIES)
 * @returns {string} HTML string
 */
function renderPromoCategoryCards(categories = PROMO_CATEGORIES) {
  const cards = Object.entries(categories).map(([key, data]) => {
    const icon = ICON_MAP[data.icon] || "📋";
    const rarityColors = RARITY_COLORS[data.rarity] || RARITY_COLORS.common;

    return `
      <div class="promo-category-card" data-category="${key}" data-rarity="${data.rarity}">
        <div class="promo-category-icon">${icon}</div>
        <h3 class="promo-category-name">${data.name}</h3>
        <div class="promo-category-rarity" style="background-color: ${rarityColors.bg}; color: ${rarityColors.text};">
          ${data.rarity.replace("_", " ")}
        </div>
        ${data.products ? `<div class="promo-category-products">${data.products.join(", ")}</div>` : ""}
        ${data.finish ? `<div class="promo-category-finish">Finish: ${data.finish}</div>` : ""}
      </div>
    `;
  }).join("");

  return `<div class="promo-category-grid">${cards}</div>`;
}

/**
 * Render a checklist with owned status
 * @param {Object} checklist - Checklist from getPromoChecklist
 * @param {Object} collection - User's collection
 * @returns {string} HTML string
 */
function renderPromoChecklist(checklist, collection = {}) {
  if (!checklist) {
    return '<div class="promo-checklist-empty">No checklist data available</div>';
  }

  const icon = ICON_MAP[checklist.icon] || "📋";
  const rarityColors = RARITY_COLORS[checklist.rarity] || RARITY_COLORS.common;

  const header = `
    <div class="promo-checklist-header">
      <div class="promo-checklist-icon">${icon}</div>
      <h2 class="promo-checklist-title">${checklist.categoryName}</h2>
      ${renderRarityBadge(checklist.rarity)}
    </div>
    <div class="promo-checklist-progress">
      <div class="promo-checklist-progress-bar">
        <div class="promo-checklist-progress-fill" style="width: ${checklist.completionPercentage}%; background-color: ${rarityColors.bg};"></div>
      </div>
      <div class="promo-checklist-progress-text">
        ${checklist.owned} / ${checklist.total} (${checklist.completionPercentage}%)
      </div>
    </div>
  `;

  const items = checklist.items.map(item => `
    <div class="promo-checklist-item ${item.owned ? "owned" : "missing"}">
      <div class="promo-checklist-checkbox">
        ${item.owned ? "✓" : "○"}
      </div>
      <div class="promo-checklist-item-info">
        <div class="promo-checklist-item-name">${item.name}</div>
        <div class="promo-checklist-item-details">
          ${item.set ? `<span class="promo-checklist-item-set">${item.set}</span>` : ""}
          ${item.finish ? `<span class="promo-checklist-item-finish">${item.finish}</span>` : ""}
          ${item.productType ? `<span class="promo-checklist-item-product">${item.productType}</span>` : ""}
        </div>
      </div>
      ${item.owned ? `<div class="promo-checklist-item-quantity">×${item.quantity}</div>` : ""}
    </div>
  `).join("");

  return `
    <div class="promo-checklist" data-category="${checklist.category}">
      ${header}
      <div class="promo-checklist-items">${items}</div>
    </div>
  `;
}

/**
 * Render a single promo card
 * @param {Object} variant - Promo card variant
 * @param {boolean} owned - Whether the user owns this card
 * @returns {string} HTML string
 */
function renderPromoCard(variant, owned = false) {
  const categoryData = variant.promoCategoryData || {};
  const icon = ICON_MAP[categoryData.icon] || "📋";
  const rarity = categoryData.rarity || "common";
  const rarityColors = RARITY_COLORS[rarity] || RARITY_COLORS.common;

  return `
    <div class="promo-card ${owned ? "owned" : "not-owned"}" data-card-id="${variant.id || variant.slug}">
      <div class="promo-card-image-container">
        ${variant.image_url || variant.image
          ? `<img class="promo-card-image" src="${variant.image_url || variant.image}" alt="${variant.name}" loading="lazy" />`
          : `<div class="promo-card-image-placeholder">${variant.name?.charAt(0) || "?"}</div>`
        }
        ${owned ? '<div class="promo-card-owned-badge">✓ Owned</div>' : ""}
      </div>
      <div class="promo-card-info">
        <h4 class="promo-card-name">${variant.name || "Unknown"}</h4>
        <div class="promo-card-category">
          <span class="promo-card-category-icon">${icon}</span>
          <span class="promo-card-category-name">${categoryData.name || "Promo"}</span>
        </div>
        <div class="promo-card-details">
          ${variant.set || variant.edition ? `<span class="promo-card-set">${variant.set || variant.edition}</span>` : ""}
          ${variant.finish ? `<span class="promo-card-finish">${variant.finish}</span>` : ""}
        </div>
        ${renderRarityBadge(rarity)}
      </div>
    </div>
  `;
}

/**
 * Render dashboard of promo statistics
 * @param {Object} stats - Stats from getPromoStats
 * @returns {string} HTML string
 */
function renderPromoStats(stats) {
  if (!stats) {
    return '<div class="promo-stats-empty">No statistics available</div>';
  }

  // Main stats cards
  const mainStats = `
    <div class="promo-stats-main">
      <div class="promo-stats-card promo-stats-total">
        <div class="promo-stats-value">${stats.totalPromos}</div>
        <div class="promo-stats-label">Total Promos</div>
      </div>
      <div class="promo-stats-card promo-stats-owned">
        <div class="promo-stats-value">${stats.ownedPromos}</div>
        <div class="promo-stats-label">Owned</div>
      </div>
      <div class="promo-stats-card promo-stats-missing">
        <div class="promo-stats-value">${stats.missingPromos}</div>
        <div class="promo-stats-label">Missing</div>
      </div>
      <div class="promo-stats-card promo-stats-completion">
        <div class="promo-stats-value">${stats.completionPercentage}%</div>
        <div class="promo-stats-label">Complete</div>
      </div>
    </div>
  `;

  // Category breakdown
  const categoryStats = Object.entries(stats.byCategory).map(([key, cat]) => {
    const rarityColors = RARITY_COLORS[cat.rarity] || RARITY_COLORS.common;
    const icon = ICON_MAP[cat.icon] || "📋";
    return `
      <div class="promo-stats-category" data-category="${key}">
        <div class="promo-stats-category-header">
          <span class="promo-stats-category-icon">${icon}</span>
          <span class="promo-stats-category-name">${cat.name}</span>
        </div>
        <div class="promo-stats-category-progress">
          <div class="promo-stats-category-bar">
            <div class="promo-stats-category-fill" style="width: ${cat.completionPercentage}%; background-color: ${rarityColors.bg};"></div>
          </div>
          <span class="promo-stats-category-text">${cat.owned}/${cat.total}</span>
        </div>
      </div>
    `;
  }).join("");

  // Rarity breakdown
  const rarityStats = Object.entries(stats.byRarity).map(([rarity, data]) => {
    const rarityColors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
    const percentage = data.total > 0 ? Math.round((data.owned / data.total) * 100) : 0;
    return `
      <div class="promo-stats-rarity" data-rarity="${rarity}">
        <div class="promo-stats-rarity-badge" style="background-color: ${rarityColors.bg}; color: ${rarityColors.text};">
          ${rarity.replace("_", " ")}
        </div>
        <div class="promo-stats-rarity-counts">
          <span class="promo-stats-rarity-owned">${data.owned}</span>
          <span class="promo-stats-rarity-separator">/</span>
          <span class="promo-stats-rarity-total">${data.total}</span>
        </div>
        <div class="promo-stats-rarity-percentage">${percentage}%</div>
      </div>
    `;
  }).join("");

  return `
    <div class="promo-stats-dashboard">
      ${mainStats}
      <div class="promo-stats-sections">
        <div class="promo-stats-section">
          <h3 class="promo-stats-section-title">By Category</h3>
          <div class="promo-stats-categories">${categoryStats}</div>
        </div>
        <div class="promo-stats-section">
          <h3 class="promo-stats-section-title">By Rarity</h3>
          <div class="promo-stats-rarities">${rarityStats}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a rarity badge component
 * @param {string} rarity - Rarity level
 * @returns {string} HTML string
 */
function renderRarityBadge(rarity) {
  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
  const displayText = rarity.replace("_", " ").toUpperCase();

  return `
    <span class="promo-rarity-badge" data-rarity="${rarity}" style="background-color: ${colors.bg}; color: ${colors.text}; border-color: ${colors.border};">
      ${displayText}
    </span>
  `;
}

// =============================================================================
// CSS STYLES
// =============================================================================

const PROMO_TRACKER_STYLES = `
/* Promo Category Grid */
.promo-category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.promo-category-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.promo-category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.promo-category-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.promo-category-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.75rem 0;
}

.promo-category-rarity {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.promo-category-products,
.promo-category-finish {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.75rem;
}

/* Promo Checklist */
.promo-checklist {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 600px;
}

.promo-checklist-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.promo-checklist-icon {
  font-size: 2rem;
}

.promo-checklist-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  flex: 1;
}

.promo-checklist-progress {
  margin-bottom: 1.5rem;
}

.promo-checklist-progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.promo-checklist-progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.promo-checklist-progress-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

.promo-checklist-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.promo-checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: background 0.2s;
}

.promo-checklist-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.promo-checklist-item.owned {
  border-left: 3px solid #10b981;
}

.promo-checklist-item.missing {
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  opacity: 0.7;
}

.promo-checklist-checkbox {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #10b981;
}

.promo-checklist-item.missing .promo-checklist-checkbox {
  color: rgba(255, 255, 255, 0.3);
}

.promo-checklist-item-info {
  flex: 1;
}

.promo-checklist-item-name {
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.promo-checklist-item-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.promo-checklist-item-details span {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.promo-checklist-item-quantity {
  font-weight: 600;
  color: #10b981;
}

.promo-checklist-empty {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Promo Card */
.promo-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.promo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.promo-card.owned {
  border-color: #10b981;
}

.promo-card-image-container {
  position: relative;
  aspect-ratio: 3/4;
  background: rgba(0, 0, 0, 0.3);
}

.promo-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promo-card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #2d2d4a 0%, #1a1a2e 100%);
}

.promo-card-owned-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #10b981;
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.promo-card-info {
  padding: 1rem;
}

.promo-card-name {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promo-card-category {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.promo-card-category-icon {
  font-size: 1rem;
}

.promo-card-category-name {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.promo-card-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.promo-card-details span {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

/* Promo Stats Dashboard */
.promo-stats-dashboard {
  padding: 1.5rem;
}

.promo-stats-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.promo-stats-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.promo-stats-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.promo-stats-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.promo-stats-total .promo-stats-value { color: #60a5fa; }
.promo-stats-owned .promo-stats-value { color: #10b981; }
.promo-stats-missing .promo-stats-value { color: #f87171; }
.promo-stats-completion .promo-stats-value { color: #fbbf24; }

.promo-stats-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.promo-stats-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem;
}

.promo-stats-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 1rem 0;
}

.promo-stats-categories {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.promo-stats-category {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
}

.promo-stats-category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.promo-stats-category-icon {
  font-size: 1.25rem;
}

.promo-stats-category-name {
  font-size: 0.875rem;
  color: #ffffff;
  flex: 1;
}

.promo-stats-category-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.promo-stats-category-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.promo-stats-category-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.promo-stats-category-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  min-width: 50px;
  text-align: right;
}

.promo-stats-rarities {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.promo-stats-rarity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.promo-stats-rarity-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 80px;
  text-align: center;
}

.promo-stats-rarity-counts {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.promo-stats-rarity-owned {
  color: #10b981;
  font-weight: 600;
}

.promo-stats-rarity-separator {
  color: rgba(255, 255, 255, 0.3);
}

.promo-stats-rarity-total {
  color: rgba(255, 255, 255, 0.6);
}

.promo-stats-rarity-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  min-width: 40px;
  text-align: right;
}

.promo-stats-empty {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Rarity Badge */
.promo-rarity-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-width: 1px;
  border-style: solid;
}

/* Responsive */
@media (max-width: 768px) {
  .promo-category-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .promo-stats-main {
    grid-template-columns: repeat(2, 1fr);
  }

  .promo-stats-sections {
    grid-template-columns: 1fr;
  }

  .promo-stats-value {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .promo-category-grid {
    grid-template-columns: 1fr;
  }

  .promo-stats-main {
    grid-template-columns: 1fr;
  }
}
`;

/**
 * Inject promo tracker styles into the document
 */
function injectPromoTrackerStyles() {
  if (typeof document !== "undefined") {
    const existingStyle = document.getElementById("promo-tracker-styles");
    if (!existingStyle) {
      const styleElement = document.createElement("style");
      styleElement.id = "promo-tracker-styles";
      styleElement.textContent = PROMO_TRACKER_STYLES;
      document.head.appendChild(styleElement);
    }
  }
}

// =============================================================================
// EXPORTS (for CommonJS/Node.js environments)
// =============================================================================

// Classes and functions are already available globally in browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PROMO_CATEGORIES,
    RARITY_ORDER,
    RARITY_COLORS,
    ICON_MAP,
    PromoTracker,
    getOwnedPromos,
    getMissingPromos,
    getPromoValue,
    renderPromoCategoryCards,
    renderPromoChecklist,
    renderPromoCard,
    renderPromoStats,
    renderRarityBadge,
    PROMO_TRACKER_STYLES,
    injectPromoTrackerStyles
  };
}
