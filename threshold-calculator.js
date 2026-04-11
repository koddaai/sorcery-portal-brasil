/**
 * Threshold Calculator for Sorcery TCG Deck Analysis
 * Analyzes deck threshold requirements and suggests Site distribution
 */

// Element colors for consistent styling
const ELEMENT_COLORS = {
  air: '#b8b8ff',
  earth: '#95c77e',
  fire: '#ff6b35',
  water: '#4ea8de'
};

// Lucide icon names for each element
const ELEMENT_ICONS = {
  air: 'wind',
  earth: 'mountain',
  fire: 'flame',
  water: 'droplet'
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse threshold from API format to simple object
 * API format can be: "2E1W", "3F", [{element: "earth", count: 2}], etc.
 * @param {string|Array|Object} thresholds - Threshold data from API
 * @returns {Object} - { air: 0, earth: 0, fire: 0, water: 0 }
 */
function parseThreshold(thresholds) {
  const result = { air: 0, earth: 0, fire: 0, water: 0 };

  if (!thresholds) {
    return result;
  }

  // Handle array format: [{element: "earth", count: 2}, ...]
  if (Array.isArray(thresholds)) {
    thresholds.forEach(t => {
      if (t.element && typeof t.count === 'number') {
        const element = t.element.toLowerCase();
        if (result.hasOwnProperty(element)) {
          result[element] = Math.max(result[element], t.count);
        }
      }
    });
    return result;
  }

  // Handle object format: { earth: 2, water: 1 }
  if (typeof thresholds === 'object' && !Array.isArray(thresholds)) {
    Object.entries(thresholds).forEach(([element, count]) => {
      const el = element.toLowerCase();
      if (result.hasOwnProperty(el)) {
        result[el] = Math.max(result[el], Number(count) || 0);
      }
    });
    return result;
  }

  // Handle string format: "2E1W", "3F", "1A2E", etc.
  if (typeof thresholds === 'string') {
    const elementMap = {
      'A': 'air',
      'E': 'earth',
      'F': 'fire',
      'W': 'water'
    };

    // Match patterns like "2E", "1W", "3F"
    const pattern = /(\d*)([AEFW])/gi;
    let match;

    while ((match = pattern.exec(thresholds)) !== null) {
      const count = match[1] ? parseInt(match[1], 10) : 1;
      const elementChar = match[2].toUpperCase();
      const element = elementMap[elementChar];

      if (element) {
        result[element] = Math.max(result[element], count);
      }
    }
  }

  return result;
}

/**
 * Get color for an element
 * @param {string} element - Element name
 * @returns {string} - Hex color code
 */
function getElementColor(element) {
  return ELEMENT_COLORS[element.toLowerCase()] || '#888888';
}

/**
 * Get Lucide icon name for an element
 * @param {string} element - Element name
 * @returns {string} - Icon name
 */
function getElementIcon(element) {
  return ELEMENT_ICONS[element.toLowerCase()] || 'circle';
}

// ============================================================================
// ThresholdCalculator Class
// ============================================================================

class ThresholdCalculator {
  constructor() {
    this.elements = ['air', 'earth', 'fire', 'water'];
  }

  /**
   * Get the maximum threshold requirements per element across all cards
   * @param {Array} deckCards - Array of cards in deck (with quantities)
   * @param {Array} allCards - Array of all card data
   * @returns {Object} - { air: 2, earth: 3, fire: 0, water: 1 }
   */
  getThresholdRequirements(deckCards, allCards) {
    const requirements = { air: 0, earth: 0, fire: 0, water: 0 };

    // Create card lookup map
    const cardMap = new Map();
    allCards.forEach(card => {
      cardMap.set(card.id, card);
      if (card.name) {
        cardMap.set(card.name.toLowerCase(), card);
      }
    });

    deckCards.forEach(deckCard => {
      const cardId = deckCard.id || deckCard.cardId || deckCard.name;
      const card = cardMap.get(cardId) || cardMap.get(cardId?.toLowerCase?.());

      if (card && card.threshold) {
        const thresholds = parseThreshold(card.threshold);
        this.elements.forEach(element => {
          requirements[element] = Math.max(requirements[element], thresholds[element]);
        });
      }
    });

    return requirements;
  }

  /**
   * Get element distribution - cards grouped by element
   * @param {Array} deckCards - Array of cards in deck
   * @param {Array} allCards - Array of all card data
   * @returns {Object} - Cards grouped by element with multi-element category
   */
  getElementDistribution(deckCards, allCards) {
    const distribution = {
      air: [],
      earth: [],
      fire: [],
      water: [],
      multi: [],
      neutral: []
    };

    // Create card lookup map
    const cardMap = new Map();
    allCards.forEach(card => {
      cardMap.set(card.id, card);
      if (card.name) {
        cardMap.set(card.name.toLowerCase(), card);
      }
    });

    deckCards.forEach(deckCard => {
      const cardId = deckCard.id || deckCard.cardId || deckCard.name;
      const card = cardMap.get(cardId) || cardMap.get(cardId?.toLowerCase?.());

      if (!card) return;

      const thresholds = parseThreshold(card.threshold);
      const activeElements = this.elements.filter(el => thresholds[el] > 0);

      const cardInfo = {
        name: card.name,
        cost: card.cost || card.manaCost || 0,
        threshold: thresholds,
        quantity: deckCard.quantity || deckCard.count || 1
      };

      if (activeElements.length === 0) {
        distribution.neutral.push(cardInfo);
      } else if (activeElements.length > 1) {
        distribution.multi.push(cardInfo);
      } else {
        distribution[activeElements[0]].push(cardInfo);
      }
    });

    return distribution;
  }

  /**
   * Suggest Site distribution based on threshold requirements
   * @param {Object} requirements - Threshold requirements per element
   * @param {number} totalSites - Total number of Sites to allocate (default: 25)
   * @returns {Object} - Suggested Site distribution
   */
  suggestSiteDistribution(requirements, totalSites = 25) {
    const suggestion = {
      air: 0,
      earth: 0,
      fire: 0,
      water: 0,
      dualSites: {},
      total: totalSites
    };

    // Get active elements (those with requirements > 0)
    const activeElements = this.elements.filter(el => requirements[el] > 0);

    if (activeElements.length === 0) {
      // No threshold requirements - distribute evenly or return empty
      return suggestion;
    }

    // Calculate total requirement weight
    const totalRequirement = activeElements.reduce((sum, el) => sum + requirements[el], 0);

    if (totalRequirement === 0) {
      return suggestion;
    }

    // Distribute Sites proportionally to requirements
    // But ensure each element gets at least its max threshold requirement
    let remainingSites = totalSites;

    // First, guarantee minimum Sites for each element's max threshold
    activeElements.forEach(element => {
      const minNeeded = requirements[element];
      suggestion[element] = minNeeded;
      remainingSites -= minNeeded;
    });

    // Distribute remaining Sites proportionally
    if (remainingSites > 0) {
      const proportions = {};
      activeElements.forEach(el => {
        proportions[el] = requirements[el] / totalRequirement;
      });

      activeElements.forEach(element => {
        const additional = Math.floor(remainingSites * proportions[element]);
        suggestion[element] += additional;
      });

      // Handle any remaining Sites (give to highest requirement element)
      const allocated = activeElements.reduce((sum, el) => sum + suggestion[el], 0);
      let leftover = totalSites - allocated;

      if (leftover > 0) {
        const sortedElements = [...activeElements].sort((a, b) => requirements[b] - requirements[a]);
        let i = 0;
        while (leftover > 0) {
          suggestion[sortedElements[i % sortedElements.length]]++;
          leftover--;
          i++;
        }
      }
    }

    // Suggest dual Sites if there are 2+ active elements
    if (activeElements.length >= 2) {
      const sortedByReq = [...activeElements].sort((a, b) => requirements[b] - requirements[a]);
      const topTwo = sortedByReq.slice(0, 2);
      const dualKey = topTwo.sort().join('-');

      // Suggest 2-4 dual Sites based on requirements
      const avgReq = (requirements[topTwo[0]] + requirements[topTwo[1]]) / 2;
      suggestion.dualSites[dualKey] = Math.min(4, Math.max(2, Math.floor(avgReq)));
    }

    return suggestion;
  }

  /**
   * Validate if current Sites meet deck threshold requirements
   * @param {Array} deckCards - Cards in deck
   * @param {Object} sites - Current Site distribution { air: 5, earth: 8, ... }
   * @param {Array} allCards - All card data
   * @returns {Object} - { valid: boolean, warnings: [], errors: [] }
   */
  validateDeck(deckCards, sites, allCards) {
    const result = {
      valid: true,
      warnings: [],
      errors: []
    };

    const requirements = this.getThresholdRequirements(deckCards, allCards);
    const totalSites = this.elements.reduce((sum, el) => sum + (sites[el] || 0), 0);

    // Check each element's threshold requirement
    this.elements.forEach(element => {
      const required = requirements[element];
      const available = sites[element] || 0;

      if (required > 0 && available === 0) {
        result.errors.push(`Need ${required} ${element.charAt(0).toUpperCase() + element.slice(1)} threshold but have no ${element.charAt(0).toUpperCase() + element.slice(1)} Sites`);
        result.valid = false;
      } else if (required > available) {
        result.warnings.push(`Need ${required} ${element.charAt(0).toUpperCase() + element.slice(1)} threshold but only ${available} ${element.charAt(0).toUpperCase() + element.slice(1)} Sites`);
      }
    });

    // Check total Site count
    if (totalSites < 20) {
      result.warnings.push(`Only ${totalSites} Sites - consider adding more for consistency (recommended: 22-28)`);
    } else if (totalSites > 30) {
      result.warnings.push(`${totalSites} Sites may be too many - consider reducing (recommended: 22-28)`);
    }

    return result;
  }

  /**
   * Calculate recommended mana/Site count based on deck composition
   * @param {Array} deckCards - Cards in deck
   * @param {Array} allCards - All card data
   * @returns {Object} - Mana base recommendations
   */
  calculateManaBase(deckCards, allCards) {
    const cardMap = new Map();
    allCards.forEach(card => {
      cardMap.set(card.id, card);
      if (card.name) {
        cardMap.set(card.name.toLowerCase(), card);
      }
    });

    let totalCost = 0;
    let totalCards = 0;
    const costCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 };

    deckCards.forEach(deckCard => {
      const cardId = deckCard.id || deckCard.cardId || deckCard.name;
      const card = cardMap.get(cardId) || cardMap.get(cardId?.toLowerCase?.());
      const quantity = deckCard.quantity || deckCard.count || 1;

      if (card) {
        const cost = card.cost || card.manaCost || 0;
        totalCost += cost * quantity;
        totalCards += quantity;

        if (cost >= 6) {
          costCounts['6+'] += quantity;
        } else if (cost >= 1) {
          costCounts[cost] += quantity;
        }
      }
    });

    const averageCost = totalCards > 0 ? totalCost / totalCards : 0;

    // Recommend Site count based on average cost
    // Lower curve = fewer Sites, higher curve = more Sites
    let recommendedSites;
    if (averageCost < 2) {
      recommendedSites = { min: 20, max: 22, optimal: 21 };
    } else if (averageCost < 3) {
      recommendedSites = { min: 22, max: 25, optimal: 24 };
    } else if (averageCost < 4) {
      recommendedSites = { min: 24, max: 27, optimal: 25 };
    } else {
      recommendedSites = { min: 26, max: 30, optimal: 28 };
    }

    return {
      averageCost: Math.round(averageCost * 100) / 100,
      totalCards,
      manaCurve: costCounts,
      recommendedSites,
      highCostCards: costCounts['6+'] + costCounts[5]
    };
  }

  /**
   * Full threshold analysis of a deck
   * @param {Array} deckCards - Cards in deck
   * @param {Array} allCards - All card data
   * @returns {Object} - Complete analysis result
   */
  analyzeDeck(deckCards, allCards) {
    const requirements = this.getThresholdRequirements(deckCards, allCards);
    const cardsByElement = this.getElementDistribution(deckCards, allCards);
    const manaBase = this.calculateManaBase(deckCards, allCards);
    const suggestedSites = this.suggestSiteDistribution(requirements, manaBase.recommendedSites.optimal);

    // Generate warnings
    const warnings = [];

    // Check for color spread
    const activeElements = this.elements.filter(el => requirements[el] > 0);
    if (activeElements.length > 3) {
      warnings.push('4-color deck may have inconsistent mana base');
    }

    // Check for high threshold requirements
    this.elements.forEach(element => {
      if (requirements[element] >= 4) {
        warnings.push(`High ${element.charAt(0).toUpperCase() + element.slice(1)} threshold (${requirements[element]}) - ensure enough Sites`);
      }
    });

    // Check mana curve
    if (manaBase.manaCurve[1] + manaBase.manaCurve[2] < 8) {
      warnings.push('Low early-game card count - consider adding more 1-2 cost cards');
    }

    if (manaBase.highCostCards > 10) {
      warnings.push('Many high-cost cards - ensure sufficient ramp or Sites');
    }

    // Determine if deck is playable
    const isPlayable = activeElements.every(el => suggestedSites[el] >= requirements[el]);

    return {
      requirements,
      maxThreshold: { ...requirements },
      cardsByElement,
      suggestedSites,
      warnings,
      isPlayable,
      averageCost: manaBase.averageCost,
      manaCurve: manaBase.manaCurve,
      totalCards: manaBase.totalCards,
      recommendedSites: manaBase.recommendedSites
    };
  }
}

// ============================================================================
// Render Functions
// ============================================================================

/**
 * Render a visual bar chart of threshold requirements
 * @param {Object} requirements - Threshold requirements per element
 * @returns {string} - HTML string for the chart
 */
function renderThresholdChart(requirements) {
  const maxThreshold = Math.max(...Object.values(requirements), 1);

  let html = `
    <div class="threshold-chart">
      <h3>Threshold Requirements</h3>
      <div class="threshold-bars">
  `;

  ['air', 'earth', 'fire', 'water'].forEach(element => {
    const value = requirements[element] || 0;
    const percentage = (value / maxThreshold) * 100;
    const color = getElementColor(element);
    const icon = getElementIcon(element);

    html += `
      <div class="threshold-bar-container">
        <div class="threshold-label">
          <i data-lucide="${icon}"></i>
          <span>${element.charAt(0).toUpperCase() + element.slice(1)}</span>
        </div>
        <div class="threshold-bar-wrapper">
          <div class="threshold-bar" style="width: ${percentage}%; background-color: ${color};">
            ${value > 0 ? `<span class="threshold-value">${value}</span>` : ''}
          </div>
        </div>
        <div class="threshold-number">${value}</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render Site distribution suggestion
 * @param {Object} suggestedSites - Suggested Site counts
 * @returns {string} - HTML string for the suggestion
 */
function renderSiteSuggestion(suggestedSites) {
  let html = `
    <div class="site-suggestion">
      <h3>Suggested Site Distribution</h3>
      <div class="site-grid">
  `;

  ['air', 'earth', 'fire', 'water'].forEach(element => {
    const count = suggestedSites[element] || 0;
    const color = getElementColor(element);
    const icon = getElementIcon(element);

    if (count > 0) {
      html += `
        <div class="site-card" style="border-color: ${color};">
          <div class="site-icon" style="color: ${color};">
            <i data-lucide="${icon}"></i>
          </div>
          <div class="site-element">${element.charAt(0).toUpperCase() + element.slice(1)}</div>
          <div class="site-count">${count}</div>
        </div>
      `;
    }
  });

  html += `
      </div>
  `;

  // Render dual Sites if any
  if (suggestedSites.dualSites && Object.keys(suggestedSites.dualSites).length > 0) {
    html += `
      <div class="dual-sites">
        <h4>Dual Sites</h4>
        <div class="dual-site-list">
    `;

    Object.entries(suggestedSites.dualSites).forEach(([elements, count]) => {
      const [el1, el2] = elements.split('-');
      const color1 = getElementColor(el1);
      const color2 = getElementColor(el2);

      html += `
        <div class="dual-site-card" style="background: linear-gradient(135deg, ${color1}, ${color2});">
          <span class="dual-site-name">${el1.charAt(0).toUpperCase() + el1.slice(1)}/${el2.charAt(0).toUpperCase() + el2.slice(1)}</span>
          <span class="dual-site-count">${count}</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  html += `
      <div class="site-total">
        <strong>Total Sites: ${suggestedSites.total}</strong>
      </div>
    </div>
  `;

  return html;
}

/**
 * Render mana curve bar chart
 * @param {Object} manaCurve - Card counts by mana cost
 * @returns {string} - HTML string for the chart
 */
function renderManaCurve(manaCurve) {
  const maxCount = Math.max(...Object.values(manaCurve), 1);
  const costs = ['1', '2', '3', '4', '5', '6+'];

  let html = `
    <div class="mana-curve">
      <h3>Mana Curve</h3>
      <div class="mana-curve-chart">
  `;

  costs.forEach(cost => {
    const count = manaCurve[cost] || manaCurve[parseInt(cost)] || 0;
    const percentage = (count / maxCount) * 100;

    html += `
      <div class="mana-curve-bar-container">
        <div class="mana-curve-bar-wrapper">
          <div class="mana-curve-bar" style="height: ${percentage}%;">
            ${count > 0 ? `<span class="mana-curve-count">${count}</span>` : ''}
          </div>
        </div>
        <div class="mana-curve-cost">${cost}</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render warning alert boxes
 * @param {Array} warnings - Array of warning messages
 * @returns {string} - HTML string for warnings
 */
function renderWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    return '';
  }

  let html = `
    <div class="threshold-warnings">
      <h3>Warnings</h3>
  `;

  warnings.forEach(warning => {
    html += `
      <div class="warning-box">
        <i data-lucide="alert-triangle"></i>
        <span>${warning}</span>
      </div>
    `;
  });

  html += `
    </div>
  `;

  return html;
}

/**
 * Render element distribution pie/donut chart
 * @param {Object} cardsByElement - Cards grouped by element
 * @returns {string} - HTML string for the chart
 */
function renderElementPie(cardsByElement) {
  // Calculate totals for each element
  const totals = {};
  let grandTotal = 0;

  ['air', 'earth', 'fire', 'water', 'multi', 'neutral'].forEach(element => {
    const cards = cardsByElement[element] || [];
    const count = cards.reduce((sum, card) => sum + (card.quantity || 1), 0);
    totals[element] = count;
    grandTotal += count;
  });

  if (grandTotal === 0) {
    return '<div class="element-pie"><p>Nenhum card para exibir</p></div>';
  }

  // Build SVG donut chart
  const size = 200;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  let html = `
    <div class="element-pie">
      <h3>Element Distribution</h3>
      <div class="pie-container">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  `;

  let currentOffset = 0;
  const elementColors = {
    air: ELEMENT_COLORS.air,
    earth: ELEMENT_COLORS.earth,
    fire: ELEMENT_COLORS.fire,
    water: ELEMENT_COLORS.water,
    multi: '#9966cc',
    neutral: '#888888'
  };

  ['air', 'earth', 'fire', 'water', 'multi', 'neutral'].forEach(element => {
    const count = totals[element];
    if (count === 0) return;

    const percentage = count / grandTotal;
    const dashLength = percentage * circumference;
    const dashOffset = -currentOffset * circumference;

    html += `
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="${radius}"
        fill="none"
        stroke="${elementColors[element]}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${dashLength} ${circumference - dashLength}"
        stroke-dashoffset="${dashOffset}"
        transform="rotate(-90 ${centerX} ${centerY})"
      />
    `;

    currentOffset += percentage;
  });

  html += `
        </svg>
        <div class="pie-center">
          <span class="pie-total">${grandTotal}</span>
          <span class="pie-label">Cards</span>
        </div>
      </div>
      <div class="pie-legend">
  `;

  ['air', 'earth', 'fire', 'water', 'multi', 'neutral'].forEach(element => {
    const count = totals[element];
    if (count === 0) return;

    const percentage = Math.round((count / grandTotal) * 100);
    const color = elementColors[element];
    const icon = ELEMENT_ICONS[element] || (element === 'multi' ? 'layers' : 'circle');
    const label = element.charAt(0).toUpperCase() + element.slice(1);

    html += `
      <div class="pie-legend-item">
        <span class="pie-legend-color" style="background-color: ${color};"></span>
        <i data-lucide="${icon}"></i>
        <span class="pie-legend-label">${label}</span>
        <span class="pie-legend-count">${count} (${percentage}%)</span>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render complete analysis dashboard
 * @param {Object} analysis - Full analysis result from analyzeDeck
 * @returns {string} - HTML string for complete dashboard
 */
function renderAnalysisDashboard(analysis) {
  const playableClass = analysis.isPlayable ? 'playable' : 'not-playable';
  const playableText = analysis.isPlayable ? 'Playable' : 'Needs Adjustment';
  const playableIcon = analysis.isPlayable ? 'check-circle' : 'x-circle';

  let html = `
    <div class="threshold-analysis-dashboard">
      <div class="analysis-header">
        <h2>Deck Analysis</h2>
        <div class="playability-badge ${playableClass}">
          <i data-lucide="${playableIcon}"></i>
          <span>${playableText}</span>
        </div>
      </div>

      <div class="analysis-summary">
        <div class="summary-stat">
          <span class="stat-value">${analysis.totalCards}</span>
          <span class="stat-label">Total Cards</span>
        </div>
        <div class="summary-stat">
          <span class="stat-value">${analysis.averageCost}</span>
          <span class="stat-label">Avg. Cost</span>
        </div>
        <div class="summary-stat">
          <span class="stat-value">${analysis.suggestedSites.total}</span>
          <span class="stat-label">Suggested Sites</span>
        </div>
      </div>

      <div class="analysis-grid">
        <div class="analysis-section">
          ${renderThresholdChart(analysis.requirements)}
        </div>
        <div class="analysis-section">
          ${renderManaCurve(analysis.manaCurve)}
        </div>
        <div class="analysis-section">
          ${renderSiteSuggestion(analysis.suggestedSites)}
        </div>
        <div class="analysis-section">
          ${renderElementPie(analysis.cardsByElement)}
        </div>
      </div>

      ${renderWarnings(analysis.warnings)}
    </div>
  `;

  return html;
}

/**
 * Get CSS styles for threshold calculator components
 * @returns {string} - CSS styles
 */
function getThresholdCalculatorStyles() {
  return `
    .threshold-analysis-dashboard {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: #1a1a2e;
      color: #ffffff;
      border-radius: 12px;
    }

    .analysis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .analysis-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .playability-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
    }

    .playability-badge.playable {
      background: rgba(149, 199, 126, 0.2);
      color: #95c77e;
    }

    .playability-badge.not-playable {
      background: rgba(255, 107, 53, 0.2);
      color: #ff6b35;
    }

    .analysis-summary {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
    }

    .summary-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #888;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }

    .analysis-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 16px;
    }

    .analysis-section h3 {
      margin: 0 0 16px 0;
      font-size: 1rem;
      color: #ccc;
    }

    /* Threshold Chart Styles */
    .threshold-bars {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .threshold-bar-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .threshold-label {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 80px;
      font-size: 0.875rem;
    }

    .threshold-bar-wrapper {
      flex: 1;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .threshold-bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .threshold-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: #000;
    }

    .threshold-number {
      width: 24px;
      text-align: center;
      font-weight: 600;
    }

    /* Site Suggestion Styles */
    .site-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .site-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 2px solid;
    }

    .site-icon {
      font-size: 1.5rem;
      margin-bottom: 4px;
    }

    .site-element {
      font-size: 0.75rem;
      color: #888;
    }

    .site-count {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .dual-sites h4 {
      margin: 0 0 8px 0;
      font-size: 0.875rem;
      color: #888;
    }

    .dual-site-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .dual-site-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-radius: 6px;
      color: #fff;
      font-size: 0.875rem;
      gap: 12px;
    }

    .site-total {
      margin-top: 12px;
      text-align: center;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Mana Curve Styles */
    .mana-curve-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 120px;
      padding-top: 20px;
    }

    .mana-curve-bar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .mana-curve-bar-wrapper {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .mana-curve-bar {
      width: 70%;
      background: linear-gradient(to top, #4ea8de, #b8b8ff);
      border-radius: 4px 4px 0 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 4px;
    }

    .mana-curve-count {
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 4px;
    }

    .mana-curve-cost {
      margin-top: 8px;
      font-size: 0.875rem;
      color: #888;
    }

    /* Pie Chart Styles */
    .pie-container {
      position: relative;
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .pie-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .pie-total {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .pie-label {
      display: block;
      font-size: 0.75rem;
      color: #888;
    }

    .pie-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pie-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }

    .pie-legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .pie-legend-label {
      flex: 1;
    }

    .pie-legend-count {
      color: #888;
    }

    /* Warnings Styles */
    .threshold-warnings h3 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: #ff6b35;
    }

    .warning-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 107, 53, 0.1);
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-radius: 8px;
      margin-bottom: 8px;
      color: #ff6b35;
    }

    .warning-box:last-child {
      margin-bottom: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .analysis-grid {
        grid-template-columns: 1fr;
      }

      .analysis-summary {
        flex-wrap: wrap;
      }

      .site-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `;
}

// ============================================================================
// Exports (for browser global + CommonJS)
// ============================================================================

// Classes and functions are already available globally in browser
// Export for CommonJS/Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThresholdCalculator,
    parseThreshold,
    getElementColor,
    getElementIcon,
    renderThresholdChart,
    renderSiteSuggestion,
    renderManaCurve,
    renderWarnings,
    renderElementPie,
    renderAnalysisDashboard,
    getThresholdCalculatorStyles,
    ELEMENT_COLORS,
    ELEMENT_ICONS
  };
}
