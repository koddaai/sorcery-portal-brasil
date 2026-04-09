/**
 * Release Timeline Visualization for Sorcery TCG
 * Tracks and visualizes the release history of all sets
 */

// =============================================================================
// SET INFORMATION CONSTANTS
// =============================================================================

const SET_INFO = {
  "Alpha": {
    releaseDate: "2023-04-19",
    cardCount: null, // Will be calculated from card data
    description: "The first edition of Sorcery: Contested Realm",
    color: "#c9a227",
    icon: "star",
    edition: "1st Edition",
    highlights: ["Genesis mechanic introduced", "Foundation set"]
  },
  "Beta": {
    releaseDate: "2023-11-10",
    cardCount: null,
    description: "Second print run with minor corrections",
    color: "#9ca3af",
    icon: "circle",
    edition: "2nd Edition",
    highlights: ["Card text corrections", "Print quality improvements"]
  },
  "Arthurian Legends": {
    releaseDate: "2024-06-01",
    cardCount: null,
    description: "Expansion set featuring Arthurian mythology",
    color: "#3b82f6",
    icon: "crown",
    edition: "Expansion",
    highlights: ["Knight mechanic", "Round Table theme", "Excalibur artifacts"]
  },
  "Gothic": {
    releaseDate: "2024-10-15",
    cardCount: null,
    description: "Dark fantasy expansion with horror themes",
    color: "#6b21a8",
    icon: "moon",
    edition: "Expansion",
    highlights: ["Vampire lords", "Haunted sites", "Curse mechanics"]
  },
  "Dragonlord": {
    releaseDate: "2025-03-01",
    cardCount: null,
    description: "Dragon-themed expansion set",
    color: "#dc2626",
    icon: "flame",
    edition: "Expansion",
    highlights: ["Dragon tribe", "Flight mechanics", "Hoard abilities"]
  },
  "Promotional": {
    releaseDate: null,
    cardCount: null,
    description: "Special promotional cards from events and partnerships",
    color: "#f59e0b",
    icon: "gift",
    edition: "Promo",
    highlights: ["Limited availability", "Alternate art versions", "Event exclusives"]
  }
};

// Known upcoming releases (hardcoded for future planning)
const UPCOMING_RELEASES = [
  {
    name: "Forgotten Realms",
    expectedDate: "2025-09-01",
    description: "Ancient civilizations and lost magic",
    status: "announced"
  },
  {
    name: "Celestial Wars",
    expectedDate: "2026-02-01",
    description: "Angels vs Demons themed expansion",
    status: "rumored"
  }
];

// =============================================================================
// TIMELINE TRACKER CLASS
// =============================================================================

class TimelineTracker {
  constructor() {
    this.setInfo = SET_INFO;
    this.upcomingReleases = UPCOMING_RELEASES;
  }

  /**
   * Get chronological list of sets with statistics
   * @param {Array} allCards - Array of all card objects
   * @returns {Object} Timeline data structure
   */
  getSetTimeline(allCards) {
    const sets = [];
    const setNames = [...new Set(allCards.map(card => card.set))];

    for (const setName of setNames) {
      const setCards = allCards.filter(card => card.set === setName);
      const info = this.setInfo[setName] || {};

      const byRarity = this._countByProperty(setCards, 'rarity');
      const byType = this._countByProperty(setCards, 'type');
      const byElement = this._countByProperty(setCards, 'element');

      sets.push({
        name: setName,
        releaseDate: info.releaseDate || null,
        cardCount: setCards.length,
        byRarity: byRarity,
        byType: byType,
        byElement: byElement,
        description: info.description || "No description available",
        color: info.color || "#6b7280",
        icon: info.icon || "box",
        edition: info.edition || "Unknown",
        highlights: info.highlights || [],
        newMechanics: this._extractMechanics(setCards)
      });
    }

    // Sort by release date (sets without dates go to the end)
    sets.sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return new Date(a.releaseDate) - new Date(b.releaseDate);
    });

    const totalCards = allCards.length;
    const latestSet = sets.filter(s => s.releaseDate).pop();
    const nextRelease = this.upcomingReleases[0] || { name: "Unknown", expectedDate: "TBA" };

    return {
      sets,
      totalCards,
      latestSet: latestSet ? latestSet.name : null,
      nextRelease,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Get detailed information for a specific set
   * @param {string} setName - Name of the set
   * @param {Array} allCards - Array of all card objects
   * @returns {Object} Detailed set information
   */
  getSetDetails(setName, allCards) {
    const setCards = allCards.filter(card => card.set === setName);
    const info = this.setInfo[setName] || {};

    if (setCards.length === 0) {
      return null;
    }

    const byRarity = this._countByProperty(setCards, 'rarity');
    const byType = this._countByProperty(setCards, 'type');
    const byElement = this._countByProperty(setCards, 'element');
    const byCost = this._countByProperty(setCards, 'cost');

    // Calculate average stats
    const minionsWithPower = setCards.filter(c => c.power !== undefined && c.power !== null);
    const avgPower = minionsWithPower.length > 0
      ? (minionsWithPower.reduce((sum, c) => sum + c.power, 0) / minionsWithPower.length).toFixed(1)
      : null;

    const cardsWithCost = setCards.filter(c => c.cost !== undefined && c.cost !== null);
    const avgCost = cardsWithCost.length > 0
      ? (cardsWithCost.reduce((sum, c) => sum + c.cost, 0) / cardsWithCost.length).toFixed(1)
      : null;

    // Find notable cards (unique rarity)
    const notableCards = setCards
      .filter(c => c.rarity === 'unique' || c.rarity === 'exceptional')
      .slice(0, 10)
      .map(c => ({ name: c.name, rarity: c.rarity, type: c.type }));

    return {
      name: setName,
      releaseDate: info.releaseDate || null,
      releaseDateFormatted: info.releaseDate ? formatReleaseDate(info.releaseDate) : "Unknown",
      timeSinceRelease: info.releaseDate ? getTimeSinceRelease(info.releaseDate) : null,
      cardCount: setCards.length,
      description: info.description || "No description available",
      color: info.color || "#6b7280",
      icon: info.icon || "box",
      edition: info.edition || "Unknown",
      highlights: info.highlights || [],
      statistics: {
        byRarity,
        byType,
        byElement,
        byCost,
        avgPower,
        avgCost
      },
      notableCards,
      mechanics: this._extractMechanics(setCards)
    };
  }

  /**
   * Group cards by release month
   * @param {Array} allCards - Array of all card objects
   * @returns {Object} Cards grouped by month
   */
  getCardsByReleaseMonth(allCards) {
    const monthlyData = {};

    for (const card of allCards) {
      const setInfo = this.setInfo[card.set];
      if (!setInfo || !setInfo.releaseDate) continue;

      const date = new Date(setInfo.releaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          key: monthKey,
          label: monthLabel,
          cards: [],
          sets: new Set()
        };
      }

      monthlyData[monthKey].cards.push(card);
      monthlyData[monthKey].sets.add(card.set);
    }

    // Convert sets to arrays and sort by month
    const sorted = Object.values(monthlyData)
      .map(month => ({
        ...month,
        sets: Array.from(month.sets),
        cardCount: month.cards.length
      }))
      .sort((a, b) => a.key.localeCompare(b.key));

    return {
      months: sorted,
      totalMonths: sorted.length,
      avgCardsPerMonth: sorted.length > 0
        ? Math.round(sorted.reduce((sum, m) => sum + m.cardCount, 0) / sorted.length)
        : 0
    };
  }

  /**
   * Get cards released in the last N days
   * @param {Array} allCards - Array of all card objects
   * @param {number} days - Number of days to look back
   * @returns {Object} Recent releases
   */
  getRecentReleases(allCards, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentCards = [];
    const recentSets = new Set();

    for (const card of allCards) {
      const setInfo = this.setInfo[card.set];
      if (!setInfo || !setInfo.releaseDate) continue;

      const releaseDate = new Date(setInfo.releaseDate);
      if (releaseDate >= cutoffDate) {
        recentCards.push({
          ...card,
          releaseDate: setInfo.releaseDate
        });
        recentSets.add(card.set);
      }
    }

    return {
      cards: recentCards,
      sets: Array.from(recentSets),
      count: recentCards.length,
      timeframe: `Last ${days} days`,
      cutoffDate: cutoffDate.toISOString().split('T')[0]
    };
  }

  /**
   * Get known upcoming releases
   * @returns {Array} Upcoming releases
   */
  getUpcomingReleases() {
    const now = new Date();

    return this.upcomingReleases
      .map(release => {
        const expectedDate = new Date(release.expectedDate);
        const daysUntil = Math.ceil((expectedDate - now) / (1000 * 60 * 60 * 24));

        return {
          ...release,
          daysUntil: daysUntil > 0 ? daysUntil : null,
          isPast: daysUntil <= 0,
          expectedDateFormatted: formatReleaseDate(release.expectedDate)
        };
      })
      .filter(r => !r.isPast)
      .sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate));
  }

  /**
   * Compare statistics across all sets
   * @param {Array} allCards - Array of all card objects
   * @returns {Object} Comparison data
   */
  getSetComparison(allCards) {
    const setNames = [...new Set(allCards.map(card => card.set))];
    const comparison = [];

    for (const setName of setNames) {
      const stats = calculateSetStats(setName, allCards);
      if (stats) {
        comparison.push(stats);
      }
    }

    // Sort by release date
    comparison.sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return new Date(a.releaseDate) - new Date(b.releaseDate);
    });

    // Calculate totals and averages
    const totals = {
      totalCards: comparison.reduce((sum, s) => sum + s.cardCount, 0),
      avgCardsPerSet: Math.round(comparison.reduce((sum, s) => sum + s.cardCount, 0) / comparison.length),
      largestSet: comparison.reduce((max, s) => s.cardCount > max.cardCount ? s : max, comparison[0]),
      smallestSet: comparison.reduce((min, s) => s.cardCount < min.cardCount ? s : min, comparison[0])
    };

    return {
      sets: comparison,
      totals,
      generatedAt: new Date().toISOString()
    };
  }

  // Private helper methods
  _countByProperty(cards, property) {
    const counts = {};
    for (const card of cards) {
      const value = card[property] || 'unknown';
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }

  _extractMechanics(cards) {
    const mechanics = new Set();
    const mechanicKeywords = [
      'Genesis', 'Ward', 'Airborne', 'Burrow', 'Charge', 'Deathtouch',
      'Defender', 'Disable', 'Lethal', 'Immobile', 'Ranged', 'Stealth',
      'Submerge', 'Landbound', 'Waterbound', 'Movement', 'Spellcaster'
    ];

    for (const card of cards) {
      if (card.rules) {
        for (const keyword of mechanicKeywords) {
          if (card.rules.toLowerCase().includes(keyword.toLowerCase())) {
            mechanics.add(keyword);
          }
        }
      }
    }

    return Array.from(mechanics);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format a release date string to human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatReleaseDate(dateString) {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get time elapsed since release date
 * @param {string} dateString - ISO date string
 * @returns {string} Human-readable time difference
 */
function getTimeSinceRelease(dateString) {
  if (!dateString) return null;

  const releaseDate = new Date(dateString);
  const now = new Date();
  const diffMs = now - releaseDate;

  // Future date
  if (diffMs < 0) {
    const futureDays = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    if (futureDays === 1) return "Tomorrow";
    if (futureDays < 7) return `In ${futureDays} days`;
    if (futureDays < 30) return `In ${Math.ceil(futureDays / 7)} weeks`;
    if (futureDays < 365) return `In ${Math.ceil(futureDays / 30)} months`;
    return `In ${Math.ceil(futureDays / 365)} years`;
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  if (diffYears === 1) return "1 year ago";
  return `${diffYears} years ago`;
}

/**
 * Calculate statistics for a specific set
 * @param {string} setName - Name of the set
 * @param {Array} allCards - Array of all card objects
 * @returns {Object} Set statistics
 */
function calculateSetStats(setName, allCards) {
  const setCards = allCards.filter(card => card.set === setName);
  const info = SET_INFO[setName] || {};

  if (setCards.length === 0) return null;

  // Count by rarity
  const byRarity = {};
  const byType = {};
  const byElement = {};

  for (const card of setCards) {
    byRarity[card.rarity || 'unknown'] = (byRarity[card.rarity || 'unknown'] || 0) + 1;
    byType[card.type || 'unknown'] = (byType[card.type || 'unknown'] || 0) + 1;
    byElement[card.element || 'unknown'] = (byElement[card.element || 'unknown'] || 0) + 1;
  }

  // Calculate rarity percentages
  const rarityPercentages = {};
  for (const [rarity, count] of Object.entries(byRarity)) {
    rarityPercentages[rarity] = ((count / setCards.length) * 100).toFixed(1);
  }

  return {
    name: setName,
    releaseDate: info.releaseDate || null,
    cardCount: setCards.length,
    byRarity,
    byType,
    byElement,
    rarityPercentages,
    color: info.color || "#6b7280",
    icon: info.icon || "box"
  };
}

// =============================================================================
// RENDER FUNCTIONS
// =============================================================================

/**
 * Render a vertical timeline visualization
 * @param {Object} timeline - Timeline data from getSetTimeline()
 * @returns {string} HTML string
 */
function renderTimeline(timeline) {
  const styles = getTimelineStyles();

  let setsHtml = '';
  for (let i = 0; i < timeline.sets.length; i++) {
    const set = timeline.sets[i];
    const isLast = i === timeline.sets.length - 1;
    const position = i % 2 === 0 ? 'left' : 'right';

    setsHtml += `
      <div class="timeline-item timeline-item-${position}">
        <div class="timeline-marker" style="background-color: ${set.color};">
          ${getIconSvg(set.icon)}
        </div>
        <div class="timeline-content" style="border-left-color: ${set.color};">
          <div class="timeline-date">
            ${set.releaseDate ? formatReleaseDate(set.releaseDate) : 'Date TBA'}
            ${set.releaseDate ? `<span class="timeline-ago">(${getTimeSinceRelease(set.releaseDate)})</span>` : ''}
          </div>
          <h3 class="timeline-title" style="color: ${set.color};">${set.name}</h3>
          <p class="timeline-description">${set.description}</p>
          <div class="timeline-stats">
            <span class="stat-badge">${set.cardCount} cards</span>
            <span class="stat-badge">${set.edition}</span>
          </div>
          ${set.highlights.length > 0 ? `
            <ul class="timeline-highlights">
              ${set.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
        ${!isLast ? '<div class="timeline-connector"></div>' : ''}
      </div>
    `;
  }

  return `
    <style>${styles}</style>
    <div class="release-timeline">
      <div class="timeline-header">
        <h2>Sorcery TCG Release Timeline</h2>
        <p class="timeline-summary">
          ${timeline.totalCards} total cards across ${timeline.sets.length} releases
        </p>
      </div>
      <div class="timeline-container">
        <div class="timeline-line"></div>
        ${setsHtml}
      </div>
      ${timeline.nextRelease ? `
        <div class="timeline-upcoming">
          <h3>Coming Next</h3>
          <div class="upcoming-card">
            <span class="upcoming-name">${timeline.nextRelease.name}</span>
            <span class="upcoming-date">${timeline.nextRelease.expectedDate || 'TBA'}</span>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render an individual set card with statistics
 * @param {Object} set - Set data from getSetDetails()
 * @returns {string} HTML string
 */
function renderSetCard(set) {
  if (!set) return '<div class="set-card set-card-empty">Set not found</div>';

  const rarityBars = Object.entries(set.statistics.byRarity)
    .map(([rarity, count]) => {
      const percentage = ((count / set.cardCount) * 100).toFixed(1);
      return `
        <div class="rarity-bar">
          <span class="rarity-label">${rarity}</span>
          <div class="rarity-progress">
            <div class="rarity-fill rarity-${rarity}" style="width: ${percentage}%;"></div>
          </div>
          <span class="rarity-count">${count} (${percentage}%)</span>
        </div>
      `;
    })
    .join('');

  const typeChips = Object.entries(set.statistics.byType)
    .map(([type, count]) => `<span class="type-chip type-${type}">${type}: ${count}</span>`)
    .join('');

  return `
    <div class="set-card" style="border-top-color: ${set.color};">
      <div class="set-card-header" style="background: linear-gradient(135deg, ${set.color}22, transparent);">
        <div class="set-icon" style="background-color: ${set.color};">
          ${getIconSvg(set.icon)}
        </div>
        <div class="set-header-info">
          <h3 class="set-name">${set.name}</h3>
          <span class="set-edition">${set.edition}</span>
        </div>
        <div class="set-card-count">
          <span class="count-number">${set.cardCount}</span>
          <span class="count-label">cards</span>
        </div>
      </div>

      <div class="set-card-body">
        <div class="set-release-info">
          <div class="release-date">
            <span class="label">Released:</span>
            <span class="value">${set.releaseDateFormatted}</span>
          </div>
          ${set.timeSinceRelease ? `
            <div class="release-ago">${set.timeSinceRelease}</div>
          ` : ''}
        </div>

        <p class="set-description">${set.description}</p>

        ${set.highlights.length > 0 ? `
          <div class="set-highlights">
            <h4>Highlights</h4>
            <ul>
              ${set.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="set-statistics">
          <h4>Card Distribution</h4>
          <div class="rarity-distribution">
            ${rarityBars}
          </div>

          <h4>Card Types</h4>
          <div class="type-distribution">
            ${typeChips}
          </div>

          ${set.statistics.avgPower || set.statistics.avgCost ? `
            <div class="set-averages">
              ${set.statistics.avgCost ? `<span class="avg-stat">Avg Cost: ${set.statistics.avgCost}</span>` : ''}
              ${set.statistics.avgPower ? `<span class="avg-stat">Avg Power: ${set.statistics.avgPower}</span>` : ''}
            </div>
          ` : ''}
        </div>

        ${set.notableCards.length > 0 ? `
          <div class="notable-cards">
            <h4>Notable Cards</h4>
            <div class="notable-cards-list">
              ${set.notableCards.map(c => `
                <span class="notable-card rarity-${c.rarity}">${c.name}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${set.mechanics.length > 0 ? `
          <div class="set-mechanics">
            <h4>Mechanics</h4>
            <div class="mechanics-list">
              ${set.mechanics.map(m => `<span class="mechanic-chip">${m}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render a bar chart of cards by release month
 * @param {Object} cardsByMonth - Data from getCardsByReleaseMonth()
 * @returns {string} HTML string
 */
function renderMonthlyChart(cardsByMonth) {
  if (!cardsByMonth || cardsByMonth.months.length === 0) {
    return '<div class="monthly-chart-empty">No release data available</div>';
  }

  const maxCount = Math.max(...cardsByMonth.months.map(m => m.cardCount));

  const bars = cardsByMonth.months.map(month => {
    const heightPercent = (month.cardCount / maxCount) * 100;
    const setsLabel = month.sets.join(', ');

    return `
      <div class="chart-bar-container">
        <div class="chart-bar" style="height: ${heightPercent}%;" title="${setsLabel}: ${month.cardCount} cards">
          <span class="chart-bar-value">${month.cardCount}</span>
        </div>
        <div class="chart-bar-label">${month.label.split(' ')[0].substring(0, 3)}<br>${month.label.split(' ')[1]}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="monthly-chart">
      <div class="chart-header">
        <h3>Cards Released by Month</h3>
        <p class="chart-summary">
          ${cardsByMonth.totalMonths} release months,
          average ${cardsByMonth.avgCardsPerMonth} cards per month
        </p>
      </div>
      <div class="chart-container">
        <div class="chart-bars">
          ${bars}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a comparison table of all sets
 * @param {Object} comparison - Data from getSetComparison()
 * @returns {string} HTML string
 */
function renderSetComparison(comparison) {
  if (!comparison || comparison.sets.length === 0) {
    return '<div class="comparison-empty">No sets to compare</div>';
  }

  const rows = comparison.sets.map(set => {
    const rarities = ['ordinary', 'exceptional', 'elite', 'unique'];
    const rarityCells = rarities.map(r => `<td>${set.byRarity[r] || 0}</td>`).join('');

    return `
      <tr>
        <td>
          <span class="set-indicator" style="background-color: ${set.color};"></span>
          ${set.name}
        </td>
        <td>${set.releaseDate ? formatReleaseDate(set.releaseDate) : 'N/A'}</td>
        <td class="count-cell">${set.cardCount}</td>
        ${rarityCells}
      </tr>
    `;
  }).join('');

  return `
    <div class="set-comparison">
      <div class="comparison-header">
        <h3>Set Comparison</h3>
        <div class="comparison-totals">
          <span class="total-stat">Total Cards: ${comparison.totals.totalCards}</span>
          <span class="total-stat">Avg per Set: ${comparison.totals.avgCardsPerSet}</span>
          <span class="total-stat">Largest: ${comparison.totals.largestSet?.name} (${comparison.totals.largestSet?.cardCount})</span>
        </div>
      </div>
      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Set</th>
              <th>Release Date</th>
              <th>Total</th>
              <th>Ordinary</th>
              <th>Exceptional</th>
              <th>Elite</th>
              <th>Unique</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Render upcoming releases section
 * @param {Array} upcoming - Data from getUpcomingReleases()
 * @returns {string} HTML string
 */
function renderUpcomingReleases(upcoming) {
  if (!upcoming || upcoming.length === 0) {
    return `
      <div class="upcoming-releases upcoming-empty">
        <h3>Upcoming Releases</h3>
        <p>No upcoming releases announced</p>
      </div>
    `;
  }

  const cards = upcoming.map(release => {
    const statusClass = release.status === 'announced' ? 'status-announced' : 'status-rumored';

    return `
      <div class="upcoming-release-card">
        <div class="upcoming-status ${statusClass}">${release.status}</div>
        <h4 class="upcoming-name">${release.name}</h4>
        <p class="upcoming-description">${release.description}</p>
        <div class="upcoming-date-info">
          <span class="upcoming-date">${release.expectedDateFormatted}</span>
          ${release.daysUntil ? `<span class="upcoming-countdown">${release.daysUntil} days away</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="upcoming-releases">
      <h3>Upcoming Releases</h3>
      <div class="upcoming-grid">
        ${cards}
      </div>
    </div>
  `;
}

// =============================================================================
// ICON HELPER
// =============================================================================

/**
 * Get SVG icon by name
 * @param {string} iconName - Name of the icon
 * @returns {string} SVG string
 */
function getIconSvg(iconName) {
  const icons = {
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    circle: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 3h14v2H5v-2z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.31 0-6-2.69-6-6 0-2.97 2.16-5.74 4-7.5 1.23-1.18 2.5-2.24 2.5-3.5 0-.55.45-1 1-1s1 .45 1 1c0 2.24-1.77 3.68-3 4.87C9.62 12.69 8 14.91 8 17c0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.43-.67-2.78-1.5-4-.83-1.22-1.5-2.5-1.5-4 0-1.1.9-2 2-2s2 .9 2 2c0 .55-.08 1.06-.23 1.53-.15.47-.37.91-.62 1.32-.5.82-.99 1.67-1.37 2.56-.38.89-.58 1.79-.58 2.59 0 3.31-2.69 6-6 6z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9z"/></svg>'
  };

  return icons[iconName] || icons.box;
}

// =============================================================================
// CSS STYLES
// =============================================================================

/**
 * Get CSS styles for timeline components
 * @returns {string} CSS string
 */
function getTimelineStyles() {
  return `
    /* Timeline Container */
    .release-timeline {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      color: #1f2937;
    }

    .timeline-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .timeline-header h2 {
      font-size: 2rem;
      margin: 0 0 10px 0;
      color: #111827;
    }

    .timeline-summary {
      color: #6b7280;
      font-size: 1.1rem;
    }

    .timeline-container {
      position: relative;
      padding: 20px 0;
    }

    .timeline-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(to bottom, #e5e7eb, #9ca3af, #e5e7eb);
      transform: translateX(-50%);
    }

    .timeline-item {
      position: relative;
      width: 50%;
      padding: 20px 40px;
      box-sizing: border-box;
    }

    .timeline-item-left {
      left: 0;
      text-align: right;
    }

    .timeline-item-right {
      left: 50%;
      text-align: left;
    }

    .timeline-marker {
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }

    .timeline-marker svg {
      width: 20px;
      height: 20px;
    }

    .timeline-item-left .timeline-marker {
      right: -20px;
    }

    .timeline-item-right .timeline-marker {
      left: -20px;
    }

    .timeline-content {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
    }

    .timeline-date {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .timeline-ago {
      font-style: italic;
      margin-left: 8px;
    }

    .timeline-title {
      font-size: 1.25rem;
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .timeline-description {
      color: #4b5563;
      margin: 0 0 12px 0;
      line-height: 1.5;
    }

    .timeline-stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .timeline-item-left .timeline-stats {
      justify-content: flex-end;
    }

    .stat-badge {
      background: #f3f4f6;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.875rem;
      color: #374151;
    }

    .timeline-highlights {
      margin: 12px 0 0 0;
      padding-left: 20px;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .timeline-highlights li {
      margin-bottom: 4px;
    }

    .timeline-upcoming {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
      border-radius: 12px;
    }

    .timeline-upcoming h3 {
      margin: 0 0 16px 0;
      color: #374151;
    }

    /* Set Card Styles */
    .set-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border-top: 4px solid;
      margin: 20px 0;
    }

    .set-card-header {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .set-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .set-icon svg {
      width: 28px;
      height: 28px;
    }

    .set-header-info {
      flex-grow: 1;
    }

    .set-name {
      margin: 0;
      font-size: 1.5rem;
      color: #111827;
    }

    .set-edition {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .set-card-count {
      text-align: center;
      padding: 12px 20px;
      background: #f9fafb;
      border-radius: 12px;
    }

    .count-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
    }

    .count-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .set-card-body {
      padding: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .set-release-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .release-date .label {
      color: #6b7280;
      margin-right: 8px;
    }

    .release-date .value {
      font-weight: 500;
    }

    .release-ago {
      color: #9ca3af;
      font-style: italic;
    }

    .set-description {
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .set-highlights {
      margin-bottom: 20px;
    }

    .set-highlights h4,
    .set-statistics h4,
    .notable-cards h4,
    .set-mechanics h4 {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      margin: 0 0 12px 0;
    }

    .set-highlights ul {
      margin: 0;
      padding-left: 20px;
      color: #374151;
    }

    .set-highlights li {
      margin-bottom: 6px;
    }

    .rarity-distribution {
      margin-bottom: 20px;
    }

    .rarity-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .rarity-label {
      width: 90px;
      font-size: 0.875rem;
      color: #374151;
      text-transform: capitalize;
    }

    .rarity-progress {
      flex-grow: 1;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .rarity-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .rarity-ordinary { background: #9ca3af; }
    .rarity-exceptional { background: #3b82f6; }
    .rarity-elite { background: #8b5cf6; }
    .rarity-unique { background: #f59e0b; }

    .rarity-count {
      width: 80px;
      font-size: 0.875rem;
      color: #6b7280;
      text-align: right;
    }

    .type-distribution {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .type-chip {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      background: #f3f4f6;
      color: #374151;
    }

    .set-averages {
      display: flex;
      gap: 20px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .avg-stat {
      font-size: 0.875rem;
      color: #4b5563;
    }

    .notable-cards-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .notable-card {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .notable-card.rarity-unique {
      background: #fef3c7;
      color: #92400e;
    }

    .notable-card.rarity-exceptional {
      background: #dbeafe;
      color: #1e40af;
    }

    .mechanics-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .mechanic-chip {
      padding: 6px 12px;
      background: #ecfdf5;
      color: #065f46;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    /* Monthly Chart Styles */
    .monthly-chart {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .chart-header {
      margin-bottom: 24px;
    }

    .chart-header h3 {
      margin: 0 0 8px 0;
      color: #111827;
    }

    .chart-summary {
      color: #6b7280;
      margin: 0;
    }

    .chart-container {
      overflow-x: auto;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      height: 200px;
      padding: 20px 0;
      min-width: fit-content;
    }

    .chart-bar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      min-width: 60px;
    }

    .chart-bar {
      width: 100%;
      max-width: 50px;
      background: linear-gradient(to top, #3b82f6, #60a5fa);
      border-radius: 6px 6px 0 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      transition: height 0.3s ease;
      cursor: pointer;
    }

    .chart-bar:hover {
      background: linear-gradient(to top, #2563eb, #3b82f6);
    }

    .chart-bar-value {
      font-size: 0.75rem;
      color: white;
      font-weight: 600;
      padding: 4px;
    }

    .chart-bar-label {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
      margin-top: 8px;
      line-height: 1.3;
    }

    /* Comparison Table Styles */
    .set-comparison {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .comparison-header {
      margin-bottom: 24px;
    }

    .comparison-header h3 {
      margin: 0 0 12px 0;
      color: #111827;
    }

    .comparison-totals {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .total-stat {
      font-size: 0.875rem;
      color: #6b7280;
      padding: 6px 12px;
      background: #f3f4f6;
      border-radius: 6px;
    }

    .comparison-table-container {
      overflow-x: auto;
    }

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .comparison-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }

    .comparison-table tr:hover td {
      background: #f9fafb;
    }

    .set-indicator {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 3px;
      margin-right: 8px;
      vertical-align: middle;
    }

    .count-cell {
      font-weight: 600;
    }

    /* Upcoming Releases Styles */
    .upcoming-releases {
      padding: 24px;
    }

    .upcoming-releases h3 {
      margin: 0 0 20px 0;
      color: #111827;
      text-align: center;
    }

    .upcoming-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .upcoming-release-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 2px dashed #e5e7eb;
    }

    .upcoming-status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }

    .status-announced {
      background: #dcfce7;
      color: #166534;
    }

    .status-rumored {
      background: #fef3c7;
      color: #92400e;
    }

    .upcoming-release-card .upcoming-name {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
      color: #111827;
    }

    .upcoming-release-card .upcoming-description {
      color: #6b7280;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .upcoming-date-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    .upcoming-release-card .upcoming-date {
      font-weight: 500;
      color: #374151;
    }

    .upcoming-countdown {
      font-size: 0.875rem;
      color: #3b82f6;
      font-weight: 500;
    }

    .upcoming-empty {
      text-align: center;
      color: #6b7280;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .timeline-line {
        left: 20px;
      }

      .timeline-item {
        width: 100%;
        padding-left: 60px;
        padding-right: 20px;
      }

      .timeline-item-left,
      .timeline-item-right {
        left: 0;
        text-align: left;
      }

      .timeline-item-left .timeline-marker,
      .timeline-item-right .timeline-marker {
        left: 0;
        right: auto;
      }

      .timeline-item-left .timeline-stats {
        justify-content: flex-start;
      }

      .set-card-header {
        flex-wrap: wrap;
      }

      .set-card-count {
        width: 100%;
        margin-top: 16px;
      }

      .chart-bars {
        gap: 8px;
      }

      .chart-bar-container {
        min-width: 40px;
      }
    }
  `;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SET_INFO,
    UPCOMING_RELEASES,
    TimelineTracker,
    formatReleaseDate,
    getTimeSinceRelease,
    calculateSetStats,
    renderTimeline,
    renderSetCard,
    renderMonthlyChart,
    renderSetComparison,
    renderUpcomingReleases,
    getTimelineStyles,
    getIconSvg
  };
}

// Export for ES modules
if (typeof window !== 'undefined') {
  window.SorceryTimeline = {
    SET_INFO,
    UPCOMING_RELEASES,
    TimelineTracker,
    formatReleaseDate,
    getTimeSinceRelease,
    calculateSetStats,
    renderTimeline,
    renderSetCard,
    renderMonthlyChart,
    renderSetComparison,
    renderUpcomingReleases,
    getTimelineStyles,
    getIconSvg
  };
}
