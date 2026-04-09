/**
 * Sorcery TCG - Dust Points Tracker
 *
 * Tracks the competitive Dust points system for Sorcery organized play.
 * - Monthly cap of 250 Dust (configurable)
 * - Four tournament tiers: Store Kits, Cornerstone, Grand Contest, Avatar of the Realm
 * - localStorage persistence
 */

// ============================================================================
// TOURNAMENT TIER DEFINITIONS
// ============================================================================

const TOURNAMENT_TIERS = {
  store_kit: {
    name: "Store Kit",
    icon: "store",
    dustRange: "5-25",
    minDust: 5,
    maxDust: 25,
    description: "Local store events and weekly tournaments"
  },
  cornerstone: {
    name: "Cornerstone Championship",
    icon: "trophy",
    dustRange: "20-50",
    minDust: 20,
    maxDust: 50,
    description: "Regional competitive events"
  },
  grand_contest: {
    name: "Grand Contest",
    icon: "medal",
    dustRange: "30-100",
    minDust: 30,
    maxDust: 100,
    description: "Major competitive tournaments"
  },
  avatar_of_realm: {
    name: "Avatar of the Realm",
    icon: "crown",
    dustRange: "50-250",
    minDust: 50,
    maxDust: 250,
    description: "Premier championship events"
  }
};

// ============================================================================
// DUST TRACKER CLASS
// ============================================================================

class DustTracker {
  constructor(storageKey = 'sorcery_dust_tracker') {
    this.storageKey = storageKey;
    this.monthlyCap = 250;
    this.dustEntries = [];
    this.events = [];
    this.loadFromStorage();
  }

  // --------------------------------------------------------------------------
  // PERSISTENCE
  // --------------------------------------------------------------------------

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.dustEntries = parsed.dustEntries || [];
        this.events = parsed.events || [];
        this.monthlyCap = parsed.monthlyCap || 250;
      }
    } catch (error) {
      console.error('Error loading dust tracker data:', error);
      this.dustEntries = [];
      this.events = [];
    }
  }

  saveToStorage() {
    try {
      const data = {
        dustEntries: this.dustEntries,
        events: this.events,
        monthlyCap: this.monthlyCap,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving dust tracker data:', error);
    }
  }

  // --------------------------------------------------------------------------
  // DUST MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Add Dust earned from a tournament
   * @param {number} amount - Amount of Dust earned
   * @param {string} source - Tournament type (store_kit, cornerstone, grand_contest, avatar_of_realm)
   * @param {string|Date} date - Date of the event
   * @param {string} notes - Optional notes
   * @returns {object} The created dust entry
   */
  addDust(amount, source, date = new Date(), notes = '') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const entry = {
      id: `dust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.max(0, amount),
      source: source,
      date: dateObj.toISOString(),
      notes: notes,
      createdAt: new Date().toISOString()
    };

    this.dustEntries.push(entry);
    this.saveToStorage();
    return entry;
  }

  /**
   * Remove a dust entry by ID
   * @param {string} id - Entry ID to remove
   * @returns {boolean} Whether the entry was removed
   */
  removeDust(id) {
    const initialLength = this.dustEntries.length;
    this.dustEntries = this.dustEntries.filter(entry => entry.id !== id);
    if (this.dustEntries.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get current month's Dust total
   * @returns {number} Total Dust earned this month
   */
  getDustThisMonth() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.dustEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth &&
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Get how much more Dust can be earned this month
   * @returns {number} Remaining Dust until monthly cap
   */
  getDustRemaining() {
    return Math.max(0, this.monthlyCap - this.getDustThisMonth());
  }

  /**
   * Get Dust history for the past N months
   * @param {number} months - Number of months to look back
   * @returns {Array} Array of dust entries
   */
  getDustHistory(months = 12) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    return this.dustEntries
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Get total lifetime Dust earned
   * @returns {number} Total Dust ever earned
   */
  getTotalDust() {
    return this.dustEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Get Dust breakdown by month
   * @param {number} months - Number of months to include
   * @returns {Array} Array of {month, year, total, entries}
   */
  getMonthlyBreakdown(months = 12) {
    const breakdown = {};
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    this.dustEntries
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .forEach(entry => {
        const date = new Date(entry.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!breakdown[key]) {
          breakdown[key] = {
            month: date.getMonth(),
            year: date.getFullYear(),
            monthName: date.toLocaleString('default', { month: 'long' }),
            total: 0,
            entries: [],
            cappedTotal: 0
          };
        }

        breakdown[key].total += entry.amount;
        breakdown[key].entries.push(entry);
      });

    // Calculate capped totals
    Object.values(breakdown).forEach(month => {
      month.cappedTotal = Math.min(month.total, this.monthlyCap);
    });

    return Object.entries(breakdown)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, value]) => ({ key, ...value }));
  }

  /**
   * Get Dust breakdown by tournament source
   * @returns {object} Breakdown by source type
   */
  getDustBySource() {
    const breakdown = {};

    Object.keys(TOURNAMENT_TIERS).forEach(tier => {
      breakdown[tier] = {
        ...TOURNAMENT_TIERS[tier],
        total: 0,
        count: 0,
        entries: []
      };
    });

    // Add "other" category for unknown sources
    breakdown.other = {
      name: "Other",
      icon: "question",
      dustRange: "N/A",
      total: 0,
      count: 0,
      entries: []
    };

    this.dustEntries.forEach(entry => {
      const source = breakdown[entry.source] ? entry.source : 'other';
      breakdown[source].total += entry.amount;
      breakdown[source].count++;
      breakdown[source].entries.push(entry);
    });

    return breakdown;
  }

  /**
   * Set the monthly Dust cap
   * @param {number} cap - New monthly cap
   */
  setMonthlyCap(cap) {
    this.monthlyCap = Math.max(0, cap);
    this.saveToStorage();
  }

  /**
   * Get current monthly cap
   * @returns {number} Current monthly cap
   */
  getMonthlyCap() {
    return this.monthlyCap;
  }

  // --------------------------------------------------------------------------
  // EVENT MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Add an upcoming event
   * @param {object} event - Event object
   * @returns {object} The created event
   */
  addEvent(event) {
    const newEvent = {
      id: event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: event.name || 'Unnamed Event',
      type: event.type || 'store_kit',
      date: event.date || new Date().toISOString().split('T')[0],
      location: event.location || '',
      dustEarned: event.dustEarned || null,
      placement: event.placement || null,
      notes: event.notes || '',
      attended: event.attended || false,
      createdAt: new Date().toISOString()
    };

    this.events.push(newEvent);
    this.saveToStorage();
    return newEvent;
  }

  /**
   * Update an existing event
   * @param {string} id - Event ID
   * @param {object} updates - Fields to update
   * @returns {object|null} Updated event or null
   */
  updateEvent(id, updates) {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) return null;

    this.events[index] = {
      ...this.events[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If dust was earned, add it to dust entries
    if (updates.dustEarned && updates.attended) {
      const existingDustEntry = this.dustEntries.find(d => d.notes?.includes(id));
      if (!existingDustEntry) {
        this.addDust(
          updates.dustEarned,
          this.events[index].type,
          this.events[index].date,
          `Event: ${this.events[index].name} (${id})`
        );
      }
    }

    this.saveToStorage();
    return this.events[index];
  }

  /**
   * Remove an event
   * @param {string} id - Event ID
   * @returns {boolean} Whether the event was removed
   */
  removeEvent(id) {
    const initialLength = this.events.length;
    this.events = this.events.filter(e => e.id !== id);
    if (this.events.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get all upcoming events (future dates)
   * @returns {Array} Future events sorted by date
   */
  getUpcomingEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Get all past events
   * @returns {Array} Past events sorted by date (most recent first)
   */
  getPastEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.events
      .filter(event => new Date(event.date) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Get events in the current month
   * @returns {Array} Events in current month
   */
  getEventsThisMonth() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth &&
               eventDate.getFullYear() === currentYear;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Get all events
   * @returns {Array} All events
   */
  getAllEvents() {
    return [...this.events].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // --------------------------------------------------------------------------
  // STATISTICS
  // --------------------------------------------------------------------------

  /**
   * Get comprehensive stats
   * @returns {object} Stats object
   */
  getStats() {
    const dustBySource = this.getDustBySource();
    const monthlyBreakdown = this.getMonthlyBreakdown(12);

    return {
      totalDust: this.getTotalDust(),
      dustThisMonth: this.getDustThisMonth(),
      dustRemaining: this.getDustRemaining(),
      monthlyCap: this.monthlyCap,
      totalEvents: this.events.length,
      eventsAttended: this.events.filter(e => e.attended).length,
      upcomingEvents: this.getUpcomingEvents().length,
      dustBySource,
      monthlyBreakdown,
      averageMonthlyDust: monthlyBreakdown.length > 0
        ? Math.round(monthlyBreakdown.reduce((sum, m) => sum + m.total, 0) / monthlyBreakdown.length)
        : 0,
      bestMonth: monthlyBreakdown.length > 0
        ? monthlyBreakdown.reduce((best, m) => m.total > best.total ? m : best)
        : null
    };
  }

  /**
   * Export all data
   * @returns {object} All tracker data
   */
  exportData() {
    return {
      dustEntries: this.dustEntries,
      events: this.events,
      monthlyCap: this.monthlyCap,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import data
   * @param {object} data - Data to import
   * @param {boolean} merge - Whether to merge with existing data
   */
  importData(data, merge = false) {
    if (merge) {
      const existingDustIds = new Set(this.dustEntries.map(e => e.id));
      const existingEventIds = new Set(this.events.map(e => e.id));

      data.dustEntries?.forEach(entry => {
        if (!existingDustIds.has(entry.id)) {
          this.dustEntries.push(entry);
        }
      });

      data.events?.forEach(event => {
        if (!existingEventIds.has(event.id)) {
          this.events.push(event);
        }
      });
    } else {
      this.dustEntries = data.dustEntries || [];
      this.events = data.events || [];
    }

    if (data.monthlyCap) {
      this.monthlyCap = data.monthlyCap;
    }

    this.saveToStorage();
  }

  /**
   * Clear all data
   */
  clearAll() {
    this.dustEntries = [];
    this.events = [];
    this.monthlyCap = 250;
    this.saveToStorage();
  }
}

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Render a circular progress meter for Dust
 * @param {number} current - Current Dust amount
 * @param {number} cap - Monthly cap
 * @returns {string} HTML string
 */
function renderDustMeter(current, cap) {
  const percentage = Math.min(100, (current / cap) * 100);
  const remaining = Math.max(0, cap - current);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on percentage
  let color = '#4CAF50'; // Green
  if (percentage >= 90) {
    color = '#f44336'; // Red
  } else if (percentage >= 70) {
    color = '#FF9800'; // Orange
  } else if (percentage >= 50) {
    color = '#FFC107'; // Yellow
  }

  return `
    <div class="dust-meter">
      <svg class="dust-meter__svg" viewBox="0 0 100 100">
        <!-- Background circle -->
        <circle
          class="dust-meter__background"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e0e0e0"
          stroke-width="8"
        />
        <!-- Progress circle -->
        <circle
          class="dust-meter__progress"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="${color}"
          stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          transform="rotate(-90 50 50)"
        />
        <!-- Dust icon in center -->
        <text
          class="dust-meter__icon"
          x="50"
          y="40"
          text-anchor="middle"
          font-size="16"
        >✨</text>
        <!-- Current value -->
        <text
          class="dust-meter__value"
          x="50"
          y="58"
          text-anchor="middle"
          font-size="14"
          font-weight="bold"
        >${current}</text>
        <!-- Cap value -->
        <text
          class="dust-meter__cap"
          x="50"
          y="72"
          text-anchor="middle"
          font-size="10"
          fill="#666"
        >/ ${cap}</text>
      </svg>
      <div class="dust-meter__info">
        <span class="dust-meter__percentage">${percentage.toFixed(1)}%</span>
        <span class="dust-meter__remaining">${remaining} remaining</span>
      </div>
    </div>
  `;
}

/**
 * Render monthly Dust history as a bar chart
 * @param {Array} history - Monthly breakdown array
 * @param {number} cap - Monthly cap for reference line
 * @returns {string} HTML string
 */
function renderDustHistory(history, cap = 250) {
  if (!history || history.length === 0) {
    return '<div class="dust-history dust-history--empty">No Dust history available</div>';
  }

  const maxValue = Math.max(cap, ...history.map(m => m.total));

  const bars = history.slice(0, 12).reverse().map(month => {
    const height = (month.total / maxValue) * 100;
    const cappedHeight = (Math.min(month.total, cap) / maxValue) * 100;
    const isOverCap = month.total > cap;

    return `
      <div class="dust-history__bar-container">
        <div class="dust-history__bar-wrapper">
          ${isOverCap ? `
            <div
              class="dust-history__bar dust-history__bar--over"
              style="height: ${height}%"
              title="${month.total} Dust (${month.total - cap} over cap)"
            ></div>
          ` : ''}
          <div
            class="dust-history__bar dust-history__bar--normal"
            style="height: ${cappedHeight}%"
            title="${month.total} Dust"
          >
            <span class="dust-history__bar-value">${month.total}</span>
          </div>
        </div>
        <span class="dust-history__bar-label">
          ${month.monthName.substring(0, 3)}
        </span>
      </div>
    `;
  }).join('');

  const capLinePosition = (cap / maxValue) * 100;

  return `
    <div class="dust-history">
      <div class="dust-history__chart">
        <div class="dust-history__cap-line" style="bottom: ${capLinePosition}%">
          <span class="dust-history__cap-label">Cap: ${cap}</span>
        </div>
        <div class="dust-history__bars">
          ${bars}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a single event card
 * @param {object} event - Event object
 * @returns {string} HTML string
 */
function renderEventCard(event) {
  const tier = TOURNAMENT_TIERS[event.type] || TOURNAMENT_TIERS.store_kit;
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate >= new Date();
  const isPast = !isUpcoming;

  const icons = {
    store: '🏪',
    trophy: '🏆',
    medal: '🥇',
    crown: '👑'
  };

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return `
    <div class="event-card ${isPast ? 'event-card--past' : ''} ${event.attended ? 'event-card--attended' : ''}">
      <div class="event-card__header">
        <span class="event-card__icon">${icons[tier.icon] || '📅'}</span>
        <span class="event-card__type">${tier.name}</span>
        ${event.attended ? '<span class="event-card__badge">Attended</span>' : ''}
      </div>
      <h3 class="event-card__name">${event.name}</h3>
      <div class="event-card__details">
        <div class="event-card__date">
          <span class="event-card__detail-icon">📅</span>
          ${formattedDate}
        </div>
        ${event.location ? `
          <div class="event-card__location">
            <span class="event-card__detail-icon">📍</span>
            ${event.location}
          </div>
        ` : ''}
      </div>
      ${event.attended ? `
        <div class="event-card__results">
          ${event.placement ? `
            <div class="event-card__placement">
              <span class="event-card__result-label">Placement:</span>
              <span class="event-card__result-value">${event.placement}</span>
            </div>
          ` : ''}
          ${event.dustEarned !== null ? `
            <div class="event-card__dust">
              <span class="event-card__result-label">Dust Earned:</span>
              <span class="event-card__result-value">✨ ${event.dustEarned}</span>
            </div>
          ` : ''}
        </div>
      ` : `
        <div class="event-card__dust-range">
          <span class="event-card__dust-range-label">Potential Dust:</span>
          <span class="event-card__dust-range-value">✨ ${tier.dustRange}</span>
        </div>
      `}
      ${event.notes ? `
        <div class="event-card__notes">
          <p>${event.notes}</p>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render list of upcoming events
 * @param {Array} events - Array of event objects
 * @returns {string} HTML string
 */
function renderUpcomingEvents(events) {
  if (!events || events.length === 0) {
    return `
      <div class="upcoming-events upcoming-events--empty">
        <p>No upcoming events scheduled</p>
        <p class="upcoming-events__hint">Add events to track your tournament schedule!</p>
      </div>
    `;
  }

  const eventCards = events.map(event => renderEventCard(event)).join('');

  return `
    <div class="upcoming-events">
      <div class="upcoming-events__list">
        ${eventCards}
      </div>
    </div>
  `;
}

/**
 * Render Dust stats dashboard
 * @param {object} stats - Stats object from getStats()
 * @returns {string} HTML string
 */
function renderDustStats(stats) {
  const sourceBreakdown = Object.entries(stats.dustBySource)
    .filter(([_, data]) => data.count > 0)
    .map(([key, data]) => {
      const icons = {
        store: '🏪',
        trophy: '🏆',
        medal: '🥇',
        crown: '👑',
        question: '❓'
      };
      return `
        <div class="dust-stats__source">
          <span class="dust-stats__source-icon">${icons[data.icon] || '📅'}</span>
          <div class="dust-stats__source-info">
            <span class="dust-stats__source-name">${data.name}</span>
            <span class="dust-stats__source-count">${data.count} events</span>
          </div>
          <span class="dust-stats__source-total">✨ ${data.total}</span>
        </div>
      `;
    }).join('');

  return `
    <div class="dust-stats">
      <div class="dust-stats__grid">
        <!-- Main Stats -->
        <div class="dust-stats__card dust-stats__card--primary">
          <div class="dust-stats__card-header">This Month</div>
          ${renderDustMeter(stats.dustThisMonth, stats.monthlyCap)}
        </div>

        <div class="dust-stats__card">
          <div class="dust-stats__card-header">Lifetime Dust</div>
          <div class="dust-stats__big-number">✨ ${stats.totalDust}</div>
        </div>

        <div class="dust-stats__card">
          <div class="dust-stats__card-header">Events Attended</div>
          <div class="dust-stats__big-number">${stats.eventsAttended}</div>
          <div class="dust-stats__sub-text">of ${stats.totalEvents} total</div>
        </div>

        <div class="dust-stats__card">
          <div class="dust-stats__card-header">Upcoming Events</div>
          <div class="dust-stats__big-number">${stats.upcomingEvents}</div>
        </div>

        <div class="dust-stats__card">
          <div class="dust-stats__card-header">Avg. Monthly Dust</div>
          <div class="dust-stats__big-number">✨ ${stats.averageMonthlyDust}</div>
        </div>

        ${stats.bestMonth ? `
          <div class="dust-stats__card">
            <div class="dust-stats__card-header">Best Month</div>
            <div class="dust-stats__big-number">✨ ${stats.bestMonth.total}</div>
            <div class="dust-stats__sub-text">${stats.bestMonth.monthName} ${stats.bestMonth.year}</div>
          </div>
        ` : ''}
      </div>

      <!-- Source Breakdown -->
      ${sourceBreakdown ? `
        <div class="dust-stats__section">
          <h3 class="dust-stats__section-title">Dust by Tournament Type</h3>
          <div class="dust-stats__sources">
            ${sourceBreakdown}
          </div>
        </div>
      ` : ''}

      <!-- Monthly History -->
      <div class="dust-stats__section">
        <h3 class="dust-stats__section-title">Monthly History</h3>
        ${renderDustHistory(stats.monthlyBreakdown, stats.monthlyCap)}
      </div>
    </div>
  `;
}

// ============================================================================
// CSS STYLES
// ============================================================================

const DUST_TRACKER_STYLES = `
/* Dust Tracker Styles */
:root {
  --dust-primary: #6B4BA3;
  --dust-secondary: #9B7ED9;
  --dust-accent: #FFD700;
  --dust-success: #4CAF50;
  --dust-warning: #FF9800;
  --dust-danger: #f44336;
  --dust-bg: #1a1a2e;
  --dust-card-bg: #16213e;
  --dust-text: #eee;
  --dust-text-muted: #999;
  --dust-border: #333;
}

/* Dust Meter */
.dust-meter {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.dust-meter__svg {
  width: 120px;
  height: 120px;
}

.dust-meter__progress {
  transition: stroke-dashoffset 0.5s ease;
}

.dust-meter__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.5rem;
}

.dust-meter__percentage {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--dust-text);
}

.dust-meter__remaining {
  font-size: 0.85rem;
  color: var(--dust-text-muted);
}

/* Dust History Chart */
.dust-history {
  padding: 1rem;
}

.dust-history--empty {
  text-align: center;
  color: var(--dust-text-muted);
  padding: 2rem;
}

.dust-history__chart {
  position: relative;
  height: 200px;
  padding-bottom: 30px;
}

.dust-history__cap-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 2px dashed var(--dust-warning);
  z-index: 1;
}

.dust-history__cap-label {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.7rem;
  color: var(--dust-warning);
  background: var(--dust-card-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

.dust-history__bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  gap: 8px;
}

.dust-history__bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 50px;
  height: 100%;
}

.dust-history__bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  position: relative;
}

.dust-history__bar {
  width: 100%;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s ease;
}

.dust-history__bar--normal {
  background: linear-gradient(to top, var(--dust-primary), var(--dust-secondary));
}

.dust-history__bar--over {
  background: var(--dust-danger);
  opacity: 0.5;
  position: absolute;
  bottom: 0;
}

.dust-history__bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: var(--dust-text);
  white-space: nowrap;
}

.dust-history__bar-label {
  font-size: 0.75rem;
  color: var(--dust-text-muted);
  margin-top: 4px;
}

/* Event Card */
.event-card {
  background: var(--dust-card-bg);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--dust-border);
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.event-card--past {
  opacity: 0.8;
}

.event-card--attended {
  border-left: 4px solid var(--dust-success);
}

.event-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.event-card__icon {
  font-size: 1.5rem;
}

.event-card__type {
  font-size: 0.85rem;
  color: var(--dust-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-card__badge {
  margin-left: auto;
  background: var(--dust-success);
  color: white;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}

.event-card__name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dust-text);
  margin: 0 0 0.75rem 0;
}

.event-card__details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.event-card__date,
.event-card__location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: var(--dust-text-muted);
}

.event-card__detail-icon {
  font-size: 0.9rem;
}

.event-card__results {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.event-card__placement,
.event-card__dust {
  display: flex;
  flex-direction: column;
}

.event-card__result-label {
  font-size: 0.75rem;
  color: var(--dust-text-muted);
  text-transform: uppercase;
}

.event-card__result-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dust-text);
}

.event-card__dust-range {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(107, 75, 163, 0.2);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.event-card__dust-range-label {
  font-size: 0.85rem;
  color: var(--dust-text-muted);
}

.event-card__dust-range-value {
  font-weight: 600;
  color: var(--dust-accent);
}

.event-card__notes {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--dust-border);
}

.event-card__notes p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--dust-text-muted);
  font-style: italic;
}

/* Upcoming Events */
.upcoming-events--empty {
  text-align: center;
  padding: 2rem;
  color: var(--dust-text-muted);
}

.upcoming-events__hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.upcoming-events__list {
  display: flex;
  flex-direction: column;
}

/* Dust Stats */
.dust-stats {
  padding: 1rem;
}

.dust-stats__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.dust-stats__card {
  background: var(--dust-card-bg);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  border: 1px solid var(--dust-border);
}

.dust-stats__card--primary {
  grid-column: span 2;
  grid-row: span 2;
}

@media (max-width: 500px) {
  .dust-stats__card--primary {
    grid-column: span 1;
    grid-row: span 1;
  }
}

.dust-stats__card-header {
  font-size: 0.85rem;
  color: var(--dust-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.dust-stats__big-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--dust-text);
}

.dust-stats__sub-text {
  font-size: 0.85rem;
  color: var(--dust-text-muted);
  margin-top: 0.25rem;
}

.dust-stats__section {
  margin-top: 2rem;
}

.dust-stats__section-title {
  font-size: 1rem;
  color: var(--dust-text);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--dust-border);
}

.dust-stats__sources {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dust-stats__source {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--dust-card-bg);
  border-radius: 8px;
  border: 1px solid var(--dust-border);
}

.dust-stats__source-icon {
  font-size: 1.5rem;
}

.dust-stats__source-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dust-stats__source-name {
  font-weight: 500;
  color: var(--dust-text);
}

.dust-stats__source-count {
  font-size: 0.8rem;
  color: var(--dust-text-muted);
}

.dust-stats__source-total {
  font-weight: 600;
  color: var(--dust-accent);
}
`;

/**
 * Inject Dust Tracker styles into the document
 */
function injectDustTrackerStyles() {
  if (typeof document === 'undefined') return;

  const existingStyle = document.getElementById('dust-tracker-styles');
  if (existingStyle) return;

  const style = document.createElement('style');
  style.id = 'dust-tracker-styles';
  style.textContent = DUST_TRACKER_STYLES;
  document.head.appendChild(style);
}

// Auto-inject styles if in browser environment
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectDustTrackerStyles);
  } else {
    injectDustTrackerStyles();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DustTracker,
    TOURNAMENT_TIERS,
    renderDustMeter,
    renderDustHistory,
    renderEventCard,
    renderUpcomingEvents,
    renderDustStats,
    DUST_TRACKER_STYLES,
    injectDustTrackerStyles
  };
}

// Export for browser global
if (typeof window !== 'undefined') {
  window.DustTracker = DustTracker;
  window.TOURNAMENT_TIERS = TOURNAMENT_TIERS;
  window.renderDustMeter = renderDustMeter;
  window.renderDustHistory = renderDustHistory;
  window.renderEventCard = renderEventCard;
  window.renderUpcomingEvents = renderUpcomingEvents;
  window.renderDustStats = renderDustStats;
  window.DUST_TRACKER_STYLES = DUST_TRACKER_STYLES;
  window.injectDustTrackerStyles = injectDustTrackerStyles;
}
