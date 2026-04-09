/**
 * Set Progress Tracker
 * Tracks collection progress by set with achievements and rendering
 */

class SetProgressTracker {
  /**
   * Calculate overall completion percentage for a set
   * @param {string} setName - Name of the set
   * @param {Array} collection - User's collection of cards
   * @param {Array} allCards - All available cards in the database
   * @returns {number} Completion percentage (0-100)
   */
  calculateSetProgress(setName, collection, allCards) {
    const setCards = allCards.filter(card => card.set === setName);
    if (setCards.length === 0) return 0;

    const ownedInSet = collection.filter(card => card.set === setName);
    const uniqueOwnedIds = new Set(ownedInSet.map(card => card.id || card.name));

    return Math.round((uniqueOwnedIds.size / setCards.length) * 100);
  }

  /**
   * Get progress breakdown by rarity
   * @param {string} setName - Name of the set
   * @param {Array} collection - User's collection of cards
   * @param {Array} allCards - All available cards in the database
   * @returns {Object} Progress by rarity
   */
  getProgressByRarity(setName, collection, allCards) {
    const setCards = allCards.filter(card => card.set === setName);
    const ownedInSet = collection.filter(card => card.set === setName);
    const ownedIds = new Set(ownedInSet.map(card => card.id || card.name));

    const rarities = ['Ordinary', 'Elite', 'Exceptional', 'Unique'];
    const byRarity = {};

    rarities.forEach(rarity => {
      const totalInRarity = setCards.filter(card => card.rarity === rarity);
      const ownedInRarity = totalInRarity.filter(card =>
        ownedIds.has(card.id || card.name)
      );

      byRarity[rarity] = {
        total: totalInRarity.length,
        owned: ownedInRarity.length,
        percentage: totalInRarity.length > 0
          ? Math.round((ownedInRarity.length / totalInRarity.length) * 100)
          : 0
      };
    });

    return byRarity;
  }

  /**
   * Get list of missing cards from a set
   * @param {string} setName - Name of the set
   * @param {Array} collection - User's collection of cards
   * @param {Array} allCards - All available cards in the database
   * @returns {Array} List of missing cards
   */
  getMissingCards(setName, collection, allCards) {
    const setCards = allCards.filter(card => card.set === setName);
    const ownedIds = new Set(
      collection
        .filter(card => card.set === setName)
        .map(card => card.id || card.name)
    );

    return setCards
      .filter(card => !ownedIds.has(card.id || card.name))
      .map(card => ({
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        type: card.type,
        manaCost: card.manaCost,
        imageUrl: card.imageUrl
      }))
      .sort((a, b) => {
        // Sort by rarity (Unique first), then by name
        const rarityOrder = { Unique: 0, Exceptional: 1, Elite: 2, Ordinary: 3 };
        const rarityDiff = (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4);
        if (rarityDiff !== 0) return rarityDiff;
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Get statistics for a set
   * @param {string} setName - Name of the set
   * @param {Array} allCards - All available cards in the database
   * @returns {Object} Set statistics
   */
  getSetStats(setName, allCards) {
    const setCards = allCards.filter(card => card.set === setName);

    const byType = {};
    const byRarity = {};

    setCards.forEach(card => {
      // Count by type
      const type = card.type || 'Unknown';
      if (!byType[type]) {
        byType[type] = { total: 0 };
      }
      byType[type].total++;

      // Count by rarity
      const rarity = card.rarity || 'Unknown';
      if (!byRarity[rarity]) {
        byRarity[rarity] = { total: 0 };
      }
      byRarity[rarity].total++;
    });

    return {
      setName,
      totalCards: setCards.length,
      byType,
      byRarity
    };
  }

  /**
   * Get progress for all sets
   * @param {Array} collection - User's collection of cards
   * @param {Array} allCards - All available cards in the database
   * @returns {Array} Progress for each set
   */
  getAllSetsProgress(collection, allCards) {
    // Get unique set names
    const setNames = [...new Set(allCards.map(card => card.set))].filter(Boolean);

    return setNames.map(setName => this.getFullSetProgress(setName, collection, allCards))
      .sort((a, b) => b.percentage - a.percentage); // Sort by completion
  }

  /**
   * Get simple completion percentage
   * @param {string} setName - Name of the set
   * @param {Array} collection - User's collection of cards
   * @param {Array} allCards - All available cards in the database
   * @returns {number} Completion percentage
   */
  getCompletionPercentage(setName, collection, allCards) {
    return this.calculateSetProgress(setName, collection, allCards);
  }

  /**
   * Get full progress data structure for a set
   * @param {string} setName - Name of the set
   * @param {Array} collection - User's collection of cards
   * @param {Array} allCards - All available cards in the database
   * @returns {Object} Complete progress data
   */
  getFullSetProgress(setName, collection, allCards) {
    const setCards = allCards.filter(card => card.set === setName);
    const ownedInSet = collection.filter(card => card.set === setName);
    const ownedIds = new Set(ownedInSet.map(card => card.id || card.name));

    const byRarity = this.getProgressByRarity(setName, collection, allCards);
    const missing = this.getMissingCards(setName, collection, allCards);

    // Calculate by type with owned counts
    const byType = {};
    setCards.forEach(card => {
      const type = card.type || 'Unknown';
      if (!byType[type]) {
        byType[type] = { total: 0, owned: 0 };
      }
      byType[type].total++;
      if (ownedIds.has(card.id || card.name)) {
        byType[type].owned++;
      }
    });

    // Add percentage to each type
    Object.keys(byType).forEach(type => {
      byType[type].percentage = byType[type].total > 0
        ? Math.round((byType[type].owned / byType[type].total) * 100)
        : 0;
    });

    return {
      setName,
      total: setCards.length,
      owned: ownedIds.size,
      percentage: this.calculateSetProgress(setName, collection, allCards),
      byRarity,
      byType,
      missing
    };
  }
}

/**
 * Achievement definitions
 */
const SET_ACHIEVEMENTS = {
  SET_STARTER: {
    id: 'set_starter',
    name: 'Set Starter',
    description: 'Own 10% of a set',
    icon: '🌱',
    threshold: 10
  },
  HALFWAY: {
    id: 'halfway',
    name: 'Halfway There',
    description: 'Own 50% of a set',
    icon: '⚡',
    threshold: 50
  },
  ALMOST_THERE: {
    id: 'almost_there',
    name: 'Almost There',
    description: 'Own 90% of a set',
    icon: '🔥',
    threshold: 90
  },
  COMPLETIONIST: {
    id: 'completionist',
    name: 'Completionist',
    description: 'Own 100% of a set',
    icon: '👑',
    threshold: 100
  },
  UNIQUE_COLLECTOR: {
    id: 'unique_collector',
    name: 'Unique Collector',
    description: 'Own all Unique cards in a set',
    icon: '💎',
    special: 'all_unique'
  },
  ELITE_MASTER: {
    id: 'elite_master',
    name: 'Elite Master',
    description: 'Own all Elite cards in a set',
    icon: '🏆',
    special: 'all_elite'
  },
  EXCEPTIONAL_HOARDER: {
    id: 'exceptional_hoarder',
    name: 'Exceptional Hoarder',
    description: 'Own all Exceptional cards in a set',
    icon: '✨',
    special: 'all_exceptional'
  },
  FOIL_FANATIC: {
    id: 'foil_fanatic',
    name: 'Foil Fanatic',
    description: 'Own at least one foil of every card in a set',
    icon: '🌟',
    special: 'all_foil'
  }
};

/**
 * Check which achievements have been earned for a set
 * @param {Object} setProgress - Progress data for a set
 * @param {Array} collection - User's collection (optional, for foil check)
 * @param {Array} allCards - All cards (optional, for foil check)
 * @returns {Array} List of earned achievements
 */
function checkSetAchievements(setProgress, collection = [], allCards = []) {
  const earned = [];
  const { percentage, byRarity, setName } = setProgress;

  // Check percentage-based achievements
  if (percentage >= SET_ACHIEVEMENTS.SET_STARTER.threshold) {
    earned.push({ ...SET_ACHIEVEMENTS.SET_STARTER, setName });
  }
  if (percentage >= SET_ACHIEVEMENTS.HALFWAY.threshold) {
    earned.push({ ...SET_ACHIEVEMENTS.HALFWAY, setName });
  }
  if (percentage >= SET_ACHIEVEMENTS.ALMOST_THERE.threshold) {
    earned.push({ ...SET_ACHIEVEMENTS.ALMOST_THERE, setName });
  }
  if (percentage >= SET_ACHIEVEMENTS.COMPLETIONIST.threshold) {
    earned.push({ ...SET_ACHIEVEMENTS.COMPLETIONIST, setName });
  }

  // Check rarity-specific achievements
  if (byRarity.Unique && byRarity.Unique.total > 0 &&
      byRarity.Unique.percentage === 100) {
    earned.push({ ...SET_ACHIEVEMENTS.UNIQUE_COLLECTOR, setName });
  }
  if (byRarity.Elite && byRarity.Elite.total > 0 &&
      byRarity.Elite.percentage === 100) {
    earned.push({ ...SET_ACHIEVEMENTS.ELITE_MASTER, setName });
  }
  if (byRarity.Exceptional && byRarity.Exceptional.total > 0 &&
      byRarity.Exceptional.percentage === 100) {
    earned.push({ ...SET_ACHIEVEMENTS.EXCEPTIONAL_HOARDER, setName });
  }

  // Check foil achievement if collection data is provided
  if (collection.length > 0 && allCards.length > 0) {
    const setCards = allCards.filter(card => card.set === setName);
    const foilsInSet = collection.filter(card =>
      card.set === setName && card.isFoil === true
    );
    const uniqueFoilIds = new Set(foilsInSet.map(card => card.id || card.name));

    if (setCards.length > 0 && uniqueFoilIds.size === setCards.length) {
      earned.push({ ...SET_ACHIEVEMENTS.FOIL_FANATIC, setName });
    }
  }

  return earned;
}

/**
 * Render a progress bar HTML
 * @param {number} percentage - Completion percentage (0-100)
 * @param {string} color - Color theme (green, blue, purple, gold, or hex color)
 * @returns {string} HTML string for progress bar
 */
function renderProgressBar(percentage, color = 'green') {
  const colorMap = {
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    gold: '#eab308',
    red: '#ef4444',
    orange: '#f97316'
  };

  const barColor = colorMap[color] || color;
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return `
    <div class="progress-bar-container">
      <div class="progress-bar-track">
        <div
          class="progress-bar-fill"
          style="width: ${safePercentage}%; background-color: ${barColor};"
        ></div>
      </div>
      <span class="progress-bar-label">${safePercentage}%</span>
    </div>
  `.trim();
}

/**
 * Get color based on percentage
 * @param {number} percentage - Completion percentage
 * @returns {string} Color name
 */
function getProgressColor(percentage) {
  if (percentage === 100) return 'gold';
  if (percentage >= 90) return 'purple';
  if (percentage >= 50) return 'blue';
  if (percentage >= 25) return 'green';
  return 'orange';
}

/**
 * Get rarity color
 * @param {string} rarity - Card rarity
 * @returns {string} Hex color
 */
function getRarityColor(rarity) {
  const colors = {
    Ordinary: '#9ca3af',
    Elite: '#3b82f6',
    Exceptional: '#8b5cf6',
    Unique: '#eab308'
  };
  return colors[rarity] || '#6b7280';
}

/**
 * Render rarity breakdown with progress pills
 * @param {Object} byRarity - Rarity breakdown data
 * @returns {string} HTML string for rarity breakdown
 */
function renderRarityBreakdown(byRarity) {
  const rarities = ['Ordinary', 'Elite', 'Exceptional', 'Unique'];

  const pills = rarities.map(rarity => {
    const data = byRarity[rarity] || { total: 0, owned: 0, percentage: 0 };
    const color = getRarityColor(rarity);

    return `
      <div class="rarity-pill" style="--rarity-color: ${color};">
        <div class="rarity-pill-header">
          <span class="rarity-name">${rarity}</span>
          <span class="rarity-count">${data.owned}/${data.total}</span>
        </div>
        <div class="rarity-pill-progress">
          <div
            class="rarity-pill-fill"
            style="width: ${data.percentage}%; background-color: ${color};"
          ></div>
        </div>
        <span class="rarity-percentage">${data.percentage}%</span>
      </div>
    `.trim();
  }).join('\n');

  return `
    <div class="rarity-breakdown">
      ${pills}
    </div>
  `.trim();
}

/**
 * Render missing cards list
 * @param {Array} missing - Array of missing cards
 * @param {Object} options - Rendering options
 * @returns {string} HTML string for missing cards list
 */
function renderMissingCardsList(missing, options = {}) {
  const { maxDisplay = 20, showViewAll = true } = options;

  if (missing.length === 0) {
    return `
      <div class="missing-cards-complete">
        <span class="complete-icon">✓</span>
        <span class="complete-text">Set Complete!</span>
      </div>
    `.trim();
  }

  const displayCards = missing.slice(0, maxDisplay);
  const remainingCount = missing.length - maxDisplay;

  const cardItems = displayCards.map(card => {
    const rarityColor = getRarityColor(card.rarity);
    return `
      <div
        class="missing-card-item"
        data-card-id="${card.id || card.name}"
        data-card-name="${card.name}"
        onclick="handleMissingCardClick('${card.id || card.name}')"
      >
        <span class="missing-card-rarity" style="background-color: ${rarityColor};"></span>
        <span class="missing-card-name">${card.name}</span>
        <span class="missing-card-type">${card.type || 'Unknown'}</span>
      </div>
    `.trim();
  }).join('\n');

  const viewAllButton = showViewAll && remainingCount > 0 ? `
    <button class="missing-cards-view-all" onclick="handleViewAllMissing()">
      View all ${missing.length} missing cards
    </button>
  ` : '';

  return `
    <div class="missing-cards-list">
      <div class="missing-cards-header">
        <span class="missing-cards-title">Missing Cards</span>
        <span class="missing-cards-count">${missing.length} cards</span>
      </div>
      <div class="missing-cards-items">
        ${cardItems}
      </div>
      ${viewAllButton}
    </div>
  `.trim();
}

/**
 * Render achievements section
 * @param {Array} achievements - Array of earned achievements
 * @returns {string} HTML string for achievements
 */
function renderAchievements(achievements) {
  if (achievements.length === 0) {
    return `
      <div class="achievements-section achievements-empty">
        <span class="achievements-empty-text">No achievements yet. Keep collecting!</span>
      </div>
    `.trim();
  }

  const achievementItems = achievements.map(achievement => `
    <div class="achievement-badge" title="${achievement.description}">
      <span class="achievement-icon">${achievement.icon}</span>
      <span class="achievement-name">${achievement.name}</span>
    </div>
  `).join('\n');

  return `
    <div class="achievements-section">
      <div class="achievements-header">
        <span class="achievements-title">Achievements</span>
        <span class="achievements-count">${achievements.length} earned</span>
      </div>
      <div class="achievements-list">
        ${achievementItems}
      </div>
    </div>
  `.trim();
}

/**
 * Render type breakdown
 * @param {Object} byType - Type breakdown data
 * @returns {string} HTML string for type breakdown
 */
function renderTypeBreakdown(byType) {
  const types = Object.keys(byType).sort();

  if (types.length === 0) {
    return '';
  }

  const typeItems = types.map(type => {
    const data = byType[type];
    return `
      <div class="type-stat-item">
        <span class="type-name">${type}</span>
        <span class="type-count">${data.owned}/${data.total}</span>
      </div>
    `.trim();
  }).join('\n');

  return `
    <div class="type-breakdown">
      <div class="type-breakdown-header">By Type</div>
      <div class="type-breakdown-items">
        ${typeItems}
      </div>
    </div>
  `.trim();
}

/**
 * Render a full set progress card
 * @param {Object} setProgress - Complete progress data for a set
 * @param {Object} options - Rendering options
 * @returns {string} HTML string for the set progress card
 */
function renderSetProgressCard(setProgress, options = {}) {
  const {
    showMissing = true,
    showAchievements = true,
    showTypeBreakdown = false,
    maxMissingCards = 10,
    collection = [],
    allCards = []
  } = options;

  const { setName, total, owned, percentage, byRarity, byType, missing } = setProgress;
  const color = getProgressColor(percentage);

  // Get achievements
  const achievements = showAchievements
    ? checkSetAchievements(setProgress, collection, allCards)
    : [];

  const progressBarHtml = renderProgressBar(percentage, color);
  const rarityBreakdownHtml = renderRarityBreakdown(byRarity);
  const achievementsHtml = showAchievements ? renderAchievements(achievements) : '';
  const typeBreakdownHtml = showTypeBreakdown ? renderTypeBreakdown(byType) : '';
  const missingCardsHtml = showMissing
    ? renderMissingCardsList(missing, { maxDisplay: maxMissingCards })
    : '';

  return `
    <div class="set-progress-card" data-set-name="${setName}">
      <div class="set-progress-header">
        <h3 class="set-progress-title">${setName}</h3>
        <div class="set-progress-summary">
          <span class="set-owned-count">${owned}</span>
          <span class="set-total-count">/ ${total} cards</span>
        </div>
      </div>

      <div class="set-progress-main">
        ${progressBarHtml}
      </div>

      <div class="set-progress-details">
        ${rarityBreakdownHtml}
        ${typeBreakdownHtml}
      </div>

      ${achievementsHtml}

      ${missingCardsHtml}
    </div>
  `.trim();
}

/**
 * Render a compact set progress row (for lists)
 * @param {Object} setProgress - Progress data for a set
 * @returns {string} HTML string for compact progress row
 */
function renderSetProgressRow(setProgress) {
  const { setName, owned, total, percentage } = setProgress;
  const color = getProgressColor(percentage);

  return `
    <div class="set-progress-row" data-set-name="${setName}">
      <span class="set-row-name">${setName}</span>
      <div class="set-row-progress">
        <div class="progress-bar-track small">
          <div
            class="progress-bar-fill"
            style="width: ${percentage}%; background-color: ${getProgressColor(percentage) === 'gold' ? '#eab308' : ''}"
          ></div>
        </div>
      </div>
      <span class="set-row-count">${owned}/${total}</span>
      <span class="set-row-percentage">${percentage}%</span>
    </div>
  `.trim();
}

/**
 * Render all sets progress overview
 * @param {Array} allSetsProgress - Progress data for all sets
 * @returns {string} HTML string for all sets overview
 */
function renderAllSetsOverview(allSetsProgress) {
  const totalCards = allSetsProgress.reduce((sum, set) => sum + set.total, 0);
  const totalOwned = allSetsProgress.reduce((sum, set) => sum + set.owned, 0);
  const overallPercentage = totalCards > 0
    ? Math.round((totalOwned / totalCards) * 100)
    : 0;

  const setRows = allSetsProgress.map(set => renderSetProgressRow(set)).join('\n');

  return `
    <div class="all-sets-overview">
      <div class="overall-progress-header">
        <h2 class="overall-title">Collection Progress</h2>
        <div class="overall-summary">
          <span class="overall-owned">${totalOwned}</span>
          <span class="overall-total">/ ${totalCards} total cards</span>
        </div>
      </div>

      <div class="overall-progress-bar">
        ${renderProgressBar(overallPercentage, getProgressColor(overallPercentage))}
      </div>

      <div class="sets-list">
        <div class="sets-list-header">
          <span>Set</span>
          <span>Progress</span>
          <span>Cards</span>
          <span>%</span>
        </div>
        ${setRows}
      </div>
    </div>
  `.trim();
}

/**
 * CSS styles for progress components
 * Add these to your styles.css file
 */
const PROGRESS_CSS = `
/* Set Progress Card Styles */
.set-progress-card {
  background: var(--card-bg, #1f2937);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.set-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.set-progress-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #f9fafb);
  margin: 0;
}

.set-progress-summary {
  font-size: 0.875rem;
}

.set-owned-count {
  color: var(--text-primary, #f9fafb);
  font-weight: 600;
}

.set-total-count {
  color: var(--text-secondary, #9ca3af);
}

/* Progress Bar Styles */
.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar-track {
  flex: 1;
  height: 12px;
  background: var(--track-bg, #374151);
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar-track.small {
  height: 8px;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
  background: linear-gradient(90deg, currentColor, currentColor);
}

.progress-bar-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #f9fafb);
  min-width: 45px;
  text-align: right;
}

/* Rarity Breakdown Styles */
.rarity-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.rarity-pill {
  background: var(--pill-bg, #111827);
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid var(--rarity-color);
}

.rarity-pill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rarity-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--rarity-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rarity-count {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
}

.rarity-pill-progress {
  height: 4px;
  background: var(--track-bg, #374151);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.rarity-pill-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.rarity-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #f9fafb);
}

/* Missing Cards Styles */
.missing-cards-list {
  margin-top: 20px;
  border-top: 1px solid var(--border-color, #374151);
  padding-top: 16px;
}

.missing-cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.missing-cards-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #f9fafb);
}

.missing-cards-count {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
}

.missing-cards-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.missing-card-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--item-bg, #111827);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.missing-card-item:hover {
  background: var(--item-hover-bg, #1f2937);
}

.missing-card-rarity {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.missing-card-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary, #f9fafb);
}

.missing-card-type {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
}

.missing-cards-view-all {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: var(--button-bg, #374151);
  color: var(--text-primary, #f9fafb);
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.missing-cards-view-all:hover {
  background: var(--button-hover-bg, #4b5563);
}

.missing-cards-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--success-bg, rgba(34, 197, 94, 0.1));
  border-radius: 8px;
  margin-top: 16px;
}

.complete-icon {
  color: var(--success-color, #22c55e);
  font-size: 1.25rem;
}

.complete-text {
  color: var(--success-color, #22c55e);
  font-weight: 600;
}

/* Achievements Styles */
.achievements-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #374151);
}

.achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.achievements-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #f9fafb);
}

.achievements-count {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
}

.achievements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 20px;
  cursor: help;
}

.achievement-icon {
  font-size: 1rem;
}

.achievement-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
}

.achievements-empty {
  text-align: center;
  padding: 12px;
}

.achievements-empty-text {
  font-size: 0.875rem;
  color: var(--text-secondary, #9ca3af);
  font-style: italic;
}

/* Type Breakdown Styles */
.type-breakdown {
  margin-top: 16px;
  padding: 12px;
  background: var(--pill-bg, #111827);
  border-radius: 8px;
}

.type-breakdown-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.type-breakdown-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--item-bg, #1f2937);
  border-radius: 4px;
}

.type-name {
  font-size: 0.75rem;
  color: var(--text-primary, #f9fafb);
}

.type-count {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
}

/* All Sets Overview Styles */
.all-sets-overview {
  background: var(--card-bg, #1f2937);
  border-radius: 12px;
  padding: 24px;
}

.overall-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.overall-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #f9fafb);
  margin: 0;
}

.overall-summary {
  font-size: 1rem;
}

.overall-owned {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #f9fafb);
}

.overall-total {
  color: var(--text-secondary, #9ca3af);
}

.overall-progress-bar {
  margin-bottom: 24px;
}

.sets-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sets-list-header {
  display: grid;
  grid-template-columns: 1fr 2fr 80px 60px;
  gap: 12px;
  padding: 8px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color, #374151);
}

.set-progress-row {
  display: grid;
  grid-template-columns: 1fr 2fr 80px 60px;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--row-bg, #111827);
  border-radius: 6px;
  transition: background 0.2s ease;
}

.set-progress-row:hover {
  background: var(--row-hover-bg, #1f2937);
}

.set-row-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #f9fafb);
}

.set-row-progress {
  width: 100%;
}

.set-row-count {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
  text-align: right;
}

.set-row-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #f9fafb);
  text-align: right;
}
`;

/**
 * Get the CSS styles as a string
 * @returns {string} CSS styles for progress components
 */
function getProgressStyles() {
  return PROGRESS_CSS;
}

/**
 * Placeholder function for missing card click handler
 * Override this in your application
 */
function handleMissingCardClick(cardId) {
  console.log('Missing card clicked:', cardId);
  // Override this function in your application
}

/**
 * Placeholder function for view all missing cards
 * Override this in your application
 */
function handleViewAllMissing() {
  console.log('View all missing cards clicked');
  // Override this function in your application
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SetProgressTracker,
    SET_ACHIEVEMENTS,
    checkSetAchievements,
    renderProgressBar,
    renderSetProgressCard,
    renderRarityBreakdown,
    renderMissingCardsList,
    renderAchievements,
    renderTypeBreakdown,
    renderSetProgressRow,
    renderAllSetsOverview,
    getProgressStyles,
    getProgressColor,
    getRarityColor
  };
}
