/**
 * Artist Gallery Feature
 * Provides comprehensive artist browsing, stats, and gallery functionality
 */

class ArtistGallery {
  /**
   * Extract unique artists from all cards
   * @param {Array} allCards - Array of card objects
   * @returns {Array} Array of unique artist names
   */
  extractArtists(allCards) {
    const artists = new Set();

    for (const card of allCards) {
      if (card.artist && typeof card.artist === 'string') {
        // Handle multiple artists separated by common delimiters
        const artistNames = card.artist.split(/[,&]/).map(name => name.trim());
        artistNames.forEach(name => {
          if (name) artists.add(name);
        });
      }
    }

    return Array.from(artists).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }

  /**
   * Get comprehensive stats for a specific artist
   * @param {string} artistName - Name of the artist
   * @param {Array} allCards - Array of card objects
   * @returns {Object} Artist statistics object
   */
  getArtistStats(artistName, allCards) {
    const artistCards = this.getArtistCards(artistName, allCards);

    if (artistCards.length === 0) {
      return null;
    }

    const stats = {
      name: artistName,
      cardCount: artistCards.length,
      sets: [],
      elements: {},
      types: {},
      rarities: {},
      cards: []
    };

    const setsSet = new Set();

    for (const card of artistCards) {
      // Collect sets
      if (card.set) {
        setsSet.add(card.set);
      }

      // Count elements
      const element = (card.element || 'unknown').toLowerCase();
      stats.elements[element] = (stats.elements[element] || 0) + 1;

      // Count types
      const type = (card.type || 'unknown').toLowerCase();
      stats.types[type] = (stats.types[type] || 0) + 1;

      // Count rarities
      const rarity = (card.rarity || 'unknown').toLowerCase();
      stats.rarities[rarity] = (stats.rarities[rarity] || 0) + 1;

      // Add card summary
      stats.cards.push({
        name: card.name,
        set: card.set || 'Unknown',
        rarity: card.rarity || 'Unknown',
        type: card.type || 'Unknown',
        element: card.element || 'Unknown',
        slug: card.slug || this._generateSlug(card.name)
      });
    }

    stats.sets = Array.from(setsSet).sort();

    return stats;
  }

  /**
   * Get all cards by a specific artist
   * @param {string} artistName - Name of the artist
   * @param {Array} allCards - Array of card objects
   * @returns {Array} Array of cards by the artist
   */
  getArtistCards(artistName, allCards) {
    const normalizedName = artistName.toLowerCase().trim();

    return allCards.filter(card => {
      if (!card.artist) return false;

      // Handle multiple artists
      const artistNames = card.artist.split(/[,&]/).map(name =>
        name.toLowerCase().trim()
      );

      return artistNames.includes(normalizedName);
    });
  }

  /**
   * Get top artists by card count
   * @param {Array} allCards - Array of card objects
   * @param {number} limit - Maximum number of artists to return
   * @returns {Array} Array of artist objects sorted by card count
   */
  getTopArtists(allCards, limit = 10) {
    const artistCounts = new Map();

    for (const card of allCards) {
      if (!card.artist) continue;

      const artistNames = card.artist.split(/[,&]/).map(name => name.trim());

      for (const name of artistNames) {
        if (name) {
          artistCounts.set(name, (artistCounts.get(name) || 0) + 1);
        }
      }
    }

    return Array.from(artistCounts.entries())
      .map(([name, cardCount]) => ({ name, cardCount }))
      .sort((a, b) => b.cardCount - a.cardCount)
      .slice(0, limit);
  }

  /**
   * Search artists by name
   * @param {string} query - Search query
   * @param {Array} allCards - Array of card objects
   * @returns {Array} Array of matching artist objects
   */
  searchArtists(query, allCards) {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return [];
    }

    const artists = this.extractArtists(allCards);
    const artistCounts = new Map();

    // Build counts map
    for (const card of allCards) {
      if (!card.artist) continue;

      const artistNames = card.artist.split(/[,&]/).map(name => name.trim());

      for (const name of artistNames) {
        if (name) {
          artistCounts.set(name, (artistCounts.get(name) || 0) + 1);
        }
      }
    }

    return artists
      .filter(artist => artist.toLowerCase().includes(normalizedQuery))
      .map(name => ({
        name,
        cardCount: artistCounts.get(name) || 0
      }))
      .sort((a, b) => b.cardCount - a.cardCount);
  }

  /**
   * Get all artists who worked on a specific set
   * @param {string} setName - Name of the set
   * @param {Array} allCards - Array of card objects
   * @returns {Array} Array of artist objects for the set
   */
  getArtistsBySet(setName, allCards) {
    const normalizedSet = setName.toLowerCase().trim();
    const setCards = allCards.filter(card =>
      card.set && card.set.toLowerCase() === normalizedSet
    );

    const artistCounts = new Map();

    for (const card of setCards) {
      if (!card.artist) continue;

      const artistNames = card.artist.split(/[,&]/).map(name => name.trim());

      for (const name of artistNames) {
        if (name) {
          artistCounts.set(name, (artistCounts.get(name) || 0) + 1);
        }
      }
    }

    return Array.from(artistCounts.entries())
      .map(([name, cardCount]) => ({ name, cardCount, set: setName }))
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }

  /**
   * Get alphabetical artist index for fast lookup
   * @param {Array} allCards - Array of card objects
   * @returns {Object} Index object keyed by first letter
   */
  getArtistIndex(allCards) {
    const artists = this.extractArtists(allCards);
    const artistCounts = new Map();

    // Build counts map
    for (const card of allCards) {
      if (!card.artist) continue;

      const artistNames = card.artist.split(/[,&]/).map(name => name.trim());

      for (const name of artistNames) {
        if (name) {
          artistCounts.set(name, (artistCounts.get(name) || 0) + 1);
        }
      }
    }

    const index = {};

    for (const artist of artists) {
      const firstChar = artist.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';

      if (!index[key]) {
        index[key] = [];
      }

      index[key].push({
        name: artist,
        cardCount: artistCounts.get(artist) || 0
      });
    }

    // Sort each letter group by name
    for (const key of Object.keys(index)) {
      index[key].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    }

    return index;
  }

  /**
   * Generate a URL-friendly slug from a name
   * @private
   */
  _generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

/**
 * Render Functions for Artist Gallery
 */

/**
 * Get CSS styles for the artist gallery
 * @returns {string} CSS styles
 */
function getArtistGalleryStyles() {
  return `
    /* Artist Gallery Grid */
    .artist-gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .artist-card {
      background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid #2a2a4a;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .artist-card:hover {
      transform: translateY(-4px);
      border-color: #6366f1;
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);
    }

    .artist-card-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 2rem;
      font-weight: bold;
      color: white;
      text-transform: uppercase;
    }

    .artist-card-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 0.5rem;
    }

    .artist-card-count {
      font-size: 0.9rem;
      color: #94a3b8;
    }

    .artist-card-count span {
      color: #6366f1;
      font-weight: bold;
    }

    /* Artist Profile */
    .artist-profile {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .artist-profile-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #2a2a4a;
    }

    .artist-profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: bold;
      color: white;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .artist-profile-info {
      flex-grow: 1;
    }

    .artist-profile-name {
      font-size: 2rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .artist-profile-meta {
      display: flex;
      gap: 2rem;
      color: #94a3b8;
      font-size: 0.95rem;
    }

    .artist-profile-meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .artist-profile-meta-value {
      color: #6366f1;
      font-weight: 600;
    }

    .artist-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .artist-stat-card {
      background: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 10px;
      padding: 1.25rem;
    }

    .artist-stat-card-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 1rem;
    }

    .artist-stat-bar {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .artist-stat-label {
      width: 100px;
      font-size: 0.9rem;
      color: #cbd5e1;
      text-transform: capitalize;
    }

    .artist-stat-bar-track {
      flex-grow: 1;
      height: 8px;
      background: #2a2a4a;
      border-radius: 4px;
      overflow: hidden;
      margin: 0 0.75rem;
    }

    .artist-stat-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .artist-stat-bar-fill.element-air { background: #60a5fa; }
    .artist-stat-bar-fill.element-earth { background: #84cc16; }
    .artist-stat-bar-fill.element-fire { background: #f97316; }
    .artist-stat-bar-fill.element-water { background: #06b6d4; }
    .artist-stat-bar-fill.type-minion { background: #a78bfa; }
    .artist-stat-bar-fill.type-magic { background: #f472b6; }
    .artist-stat-bar-fill.type-site { background: #34d399; }
    .artist-stat-bar-fill.type-artifact { background: #fbbf24; }
    .artist-stat-bar-fill.rarity-ordinary { background: #94a3b8; }
    .artist-stat-bar-fill.rarity-elite { background: #60a5fa; }
    .artist-stat-bar-fill.rarity-exceptional { background: #a78bfa; }
    .artist-stat-bar-fill.rarity-unique { background: #f59e0b; }

    .artist-stat-value {
      min-width: 30px;
      text-align: right;
      font-size: 0.9rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .artist-sets-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .artist-set-tag {
      background: #2a2a4a;
      color: #cbd5e1;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
    }

    /* Artist Cards Gallery */
    .artist-cards-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }

    .artist-card-item {
      background: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .artist-card-item:hover {
      transform: scale(1.03);
      border-color: #6366f1;
    }

    .artist-card-item-image {
      width: 100%;
      aspect-ratio: 3/4;
      background: linear-gradient(135deg, #2a2a4a, #1a1a2e);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 0.85rem;
    }

    .artist-card-item-info {
      padding: 0.75rem;
    }

    .artist-card-item-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist-card-item-meta {
      font-size: 0.8rem;
      color: #64748b;
    }

    .artist-card-item-rarity {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 600;
    }

    .rarity-ordinary { background: #374151; color: #9ca3af; }
    .rarity-elite { background: #1e3a5f; color: #60a5fa; }
    .rarity-exceptional { background: #4c1d95; color: #a78bfa; }
    .rarity-unique { background: #78350f; color: #fbbf24; }

    /* Top Artists Leaderboard */
    .top-artists-leaderboard {
      max-width: 600px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .top-artists-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f1f5f9;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .top-artist-row {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 8px;
      margin-bottom: 0.75rem;
      transition: all 0.3s ease;
    }

    .top-artist-row:hover {
      border-color: #6366f1;
      transform: translateX(4px);
    }

    .top-artist-rank {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
      margin-right: 1rem;
    }

    .top-artist-rank.rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1a1a2e; }
    .top-artist-rank.rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); color: #1a1a2e; }
    .top-artist-rank.rank-3 { background: linear-gradient(135deg, #cd7c2f, #a0522d); color: #1a1a2e; }
    .top-artist-rank.rank-default { background: #2a2a4a; color: #94a3b8; }

    .top-artist-info {
      flex-grow: 1;
    }

    .top-artist-name {
      font-size: 1rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .top-artist-count {
      background: #6366f1;
      color: white;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Artist Search */
    .artist-search-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .artist-search-input-wrapper {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .artist-search-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      background: #1a1a2e;
      border: 2px solid #2a2a4a;
      border-radius: 10px;
      color: #e2e8f0;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .artist-search-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .artist-search-input::placeholder {
      color: #64748b;
    }

    .artist-search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }

    .artist-search-results {
      background: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 10px;
      overflow: hidden;
    }

    .artist-search-result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #2a2a4a;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .artist-search-result-item:last-child {
      border-bottom: none;
    }

    .artist-search-result-item:hover {
      background: #2a2a4a;
    }

    .artist-search-result-name {
      font-size: 1rem;
      color: #e2e8f0;
    }

    .artist-search-result-count {
      font-size: 0.85rem;
      color: #6366f1;
      font-weight: 600;
    }

    .artist-search-empty {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    /* Artist Index */
    .artist-index {
      padding: 1.5rem;
    }

    .artist-index-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
      justify-content: center;
    }

    .artist-index-nav-item {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 6px;
      color: #94a3b8;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .artist-index-nav-item:hover,
    .artist-index-nav-item.active {
      background: #6366f1;
      border-color: #6366f1;
      color: white;
    }

    .artist-index-nav-item.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .artist-index-section {
      margin-bottom: 2rem;
    }

    .artist-index-letter {
      font-size: 1.5rem;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #2a2a4a;
    }

    .artist-index-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .artist-index-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: #1a1a2e;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .artist-index-item:hover {
      background: #2a2a4a;
    }

    .artist-index-item-name {
      color: #e2e8f0;
      font-size: 0.9rem;
    }

    .artist-index-item-count {
      color: #6366f1;
      font-size: 0.85rem;
      font-weight: 600;
    }
  `;
}

/**
 * Render grid of artist cards
 * @param {Array} artists - Array of artist objects with name and cardCount
 * @returns {string} HTML string
 */
function renderArtistGrid(artists) {
  if (!artists || artists.length === 0) {
    return `
      <div class="artist-gallery-grid">
        <p style="color: #94a3b8; text-align: center; grid-column: 1 / -1;">
          No artists found.
        </p>
      </div>
    `;
  }

  const artistCards = artists.map(artist => {
    const initials = artist.name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('');

    return `
      <div class="artist-card" data-artist="${escapeHtml(artist.name)}">
        <div class="artist-card-avatar">${escapeHtml(initials)}</div>
        <div class="artist-card-name">${escapeHtml(artist.name)}</div>
        <div class="artist-card-count">
          <span>${artist.cardCount}</span> card${artist.cardCount !== 1 ? 's' : ''}
        </div>
      </div>
    `;
  }).join('');

  return `<div class="artist-gallery-grid">${artistCards}</div>`;
}

/**
 * Render full artist profile page
 * @param {Object} artistStats - Artist stats object
 * @returns {string} HTML string
 */
function renderArtistProfile(artistStats) {
  if (!artistStats) {
    return `
      <div class="artist-profile">
        <p style="color: #94a3b8; text-align: center;">Artist not found.</p>
      </div>
    `;
  }

  const initials = artistStats.name
    .split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('');

  const maxCards = Math.max(...Object.values(artistStats.elements), 1);

  const renderStatBars = (stats, type) => {
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => {
        const percentage = (count / artistStats.cardCount) * 100;
        return `
          <div class="artist-stat-bar">
            <span class="artist-stat-label">${escapeHtml(label)}</span>
            <div class="artist-stat-bar-track">
              <div class="artist-stat-bar-fill ${type}-${label}"
                   style="width: ${percentage}%"></div>
            </div>
            <span class="artist-stat-value">${count}</span>
          </div>
        `;
      }).join('');
  };

  const setsTags = artistStats.sets
    .map(set => `<span class="artist-set-tag">${escapeHtml(set)}</span>`)
    .join('');

  return `
    <div class="artist-profile">
      <div class="artist-profile-header">
        <div class="artist-profile-avatar">${escapeHtml(initials)}</div>
        <div class="artist-profile-info">
          <h1 class="artist-profile-name">${escapeHtml(artistStats.name)}</h1>
          <div class="artist-profile-meta">
            <div class="artist-profile-meta-item">
              <span>Total de Cards:</span>
              <span class="artist-profile-meta-value">${artistStats.cardCount}</span>
            </div>
            <div class="artist-profile-meta-item">
              <span>Sets:</span>
              <span class="artist-profile-meta-value">${artistStats.sets.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="artist-stats-grid">
        <div class="artist-stat-card">
          <h3 class="artist-stat-card-title">Elementos</h3>
          ${renderStatBars(artistStats.elements, 'element')}
        </div>

        <div class="artist-stat-card">
          <h3 class="artist-stat-card-title">Card Types</h3>
          ${renderStatBars(artistStats.types, 'type')}
        </div>

        <div class="artist-stat-card">
          <h3 class="artist-stat-card-title">Rarities</h3>
          ${renderStatBars(artistStats.rarities, 'rarity')}
        </div>

        <div class="artist-stat-card">
          <h3 class="artist-stat-card-title">Sets</h3>
          <div class="artist-sets-list">${setsTags || '<span style="color: #64748b;">No sets</span>'}</div>
        </div>
      </div>

      <h2 style="color: #f1f5f9; margin-bottom: 1rem;">Cards by ${escapeHtml(artistStats.name)}</h2>
      ${renderArtistCards(artistStats.cards)}
    </div>
  `;
}

/**
 * Render gallery of cards by artist
 * @param {Array} cards - Array of card objects
 * @returns {string} HTML string
 */
function renderArtistCards(cards) {
  if (!cards || cards.length === 0) {
    return `
      <div class="artist-cards-gallery">
        <p style="color: #94a3b8; text-align: center; grid-column: 1 / -1;">
          Nenhum card encontrado.
        </p>
      </div>
    `;
  }

  const cardItems = cards.map(card => {
    const rarityClass = `rarity-${(card.rarity || 'ordinary').toLowerCase()}`;

    return `
      <div class="artist-card-item" data-slug="${escapeHtml(card.slug || '')}">
        <div class="artist-card-item-image">
          ${escapeHtml(card.name)}
        </div>
        <div class="artist-card-item-info">
          <div class="artist-card-item-name" title="${escapeHtml(card.name)}">
            ${escapeHtml(card.name)}
          </div>
          <div class="artist-card-item-meta">
            ${escapeHtml(card.set)} &bull; ${escapeHtml(card.element)}
          </div>
          <span class="artist-card-item-rarity ${rarityClass}">
            ${escapeHtml(card.rarity)}
          </span>
        </div>
      </div>
    `;
  }).join('');

  return `<div class="artist-cards-gallery">${cardItems}</div>`;
}

/**
 * Render top artists leaderboard
 * @param {Array} artists - Array of artist objects
 * @param {number} limit - Number of artists to show
 * @returns {string} HTML string
 */
function renderTopArtists(artists, limit = 10) {
  const topArtists = artists.slice(0, limit);

  if (topArtists.length === 0) {
    return `
      <div class="top-artists-leaderboard">
        <h2 class="top-artists-title">Top Artists</h2>
        <p style="color: #94a3b8; text-align: center;">No artists found.</p>
      </div>
    `;
  }

  const rows = topArtists.map((artist, index) => {
    const rank = index + 1;
    let rankClass = 'rank-default';
    if (rank === 1) rankClass = 'rank-1';
    else if (rank === 2) rankClass = 'rank-2';
    else if (rank === 3) rankClass = 'rank-3';

    return `
      <div class="top-artist-row" data-artist="${escapeHtml(artist.name)}">
        <div class="top-artist-rank ${rankClass}">${rank}</div>
        <div class="top-artist-info">
          <div class="top-artist-name">${escapeHtml(artist.name)}</div>
        </div>
        <div class="top-artist-count">${artist.cardCount} cards</div>
      </div>
    `;
  }).join('');

  return `
    <div class="top-artists-leaderboard">
      <h2 class="top-artists-title">Top Artists</h2>
      ${rows}
    </div>
  `;
}

/**
 * Render searchable artist list
 * @param {Array} artists - Array of artist objects
 * @returns {string} HTML string
 */
function renderArtistSearch(artists) {
  const resultItems = artists.map(artist => `
    <div class="artist-search-result-item" data-artist="${escapeHtml(artist.name)}">
      <span class="artist-search-result-name">${escapeHtml(artist.name)}</span>
      <span class="artist-search-result-count">${artist.cardCount} cards</span>
    </div>
  `).join('');

  const resultsContent = artists.length > 0
    ? resultItems
    : '<div class="artist-search-empty">Start typing to search artists...</div>';

  return `
    <div class="artist-search-container">
      <div class="artist-search-input-wrapper">
        <svg class="artist-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <input type="text"
               class="artist-search-input"
               placeholder="Search artists by name..."
               id="artistSearchInput">
      </div>
      <div class="artist-search-results" id="artistSearchResults">
        ${resultsContent}
      </div>
    </div>
  `;
}

/**
 * Render artist index with alphabetical navigation
 * @param {Object} index - Artist index object keyed by letter
 * @returns {string} HTML string
 */
function renderArtistIndex(index) {
  const alphabet = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const navItems = alphabet.map(letter => {
    const hasArtists = index[letter] && index[letter].length > 0;
    const disabledClass = hasArtists ? '' : 'disabled';
    return `
      <div class="artist-index-nav-item ${disabledClass}"
           data-letter="${letter}"
           ${hasArtists ? '' : 'aria-disabled="true"'}>
        ${letter}
      </div>
    `;
  }).join('');

  const sections = Object.entries(index)
    .sort(([a], [b]) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    })
    .map(([letter, artists]) => {
      const items = artists.map(artist => `
        <div class="artist-index-item" data-artist="${escapeHtml(artist.name)}">
          <span class="artist-index-item-name">${escapeHtml(artist.name)}</span>
          <span class="artist-index-item-count">${artist.cardCount}</span>
        </div>
      `).join('');

      return `
        <div class="artist-index-section" id="artist-index-${letter}">
          <h2 class="artist-index-letter">${letter}</h2>
          <div class="artist-index-list">${items}</div>
        </div>
      `;
    }).join('');

  return `
    <div class="artist-index">
      <nav class="artist-index-nav">${navItems}</nav>
      ${sections || '<p style="color: #94a3b8; text-align: center;">No artists found.</p>'}
    </div>
  `;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Initialize artist gallery with event handlers
 * @param {ArtistGallery} gallery - ArtistGallery instance
 * @param {Array} allCards - Array of all card objects
 * @param {Function} onArtistSelect - Callback when artist is selected
 */
function initArtistGalleryEvents(gallery, allCards, onArtistSelect) {
  // Search functionality
  const searchInput = document.getElementById('artistSearchInput');
  const searchResults = document.getElementById('artistSearchResults');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      if (!query) {
        searchResults.innerHTML = '<div class="artist-search-empty">Start typing to search artists...</div>';
        return;
      }

      const results = gallery.searchArtists(query, allCards);

      if (results.length === 0) {
        searchResults.innerHTML = '<div class="artist-search-empty">No artists found.</div>';
        return;
      }

      searchResults.innerHTML = results.map(artist => `
        <div class="artist-search-result-item" data-artist="${escapeHtml(artist.name)}">
          <span class="artist-search-result-name">${escapeHtml(artist.name)}</span>
          <span class="artist-search-result-count">${artist.cardCount} cards</span>
        </div>
      `).join('');
    });
  }

  // Click handlers for artist selection
  document.addEventListener('click', (e) => {
    const artistElement = e.target.closest('[data-artist]');
    if (artistElement && onArtistSelect) {
      const artistName = artistElement.dataset.artist;
      onArtistSelect(artistName);
    }

    // Index navigation
    const navItem = e.target.closest('.artist-index-nav-item:not(.disabled)');
    if (navItem) {
      const letter = navItem.dataset.letter;
      const section = document.getElementById(`artist-index-${letter}`);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ArtistGallery,
    getArtistGalleryStyles,
    renderArtistGrid,
    renderArtistProfile,
    renderArtistCards,
    renderTopArtists,
    renderArtistSearch,
    renderArtistIndex,
    initArtistGalleryEvents,
    escapeHtml
  };
}
