/**
 * Sorcery TCG Keyword Parser
 * Parses card rules text to extract and categorize keywords
 */

// Comprehensive list of all known Sorcery TCG keywords
const SORCERY_KEYWORDS = {
  // ============================================
  // TRIGGERED ABILITIES
  // ============================================
  "Genesis": {
    type: "triggered",
    description: "Triggers when the card enters the Realm",
    pattern: /\bGenesis\b/i
  },
  "Death": {
    type: "triggered",
    description: "Triggers when the card goes to the Cemetery",
    pattern: /\bDeath\b/i
  },
  "Awaken": {
    type: "triggered",
    description: "Triggers at the start of your turn",
    pattern: /\bAwaken\b/i
  },
  "Arrival": {
    type: "triggered",
    description: "Triggers when entering a site",
    pattern: /\bArrival\b/i
  },
  "Departure": {
    type: "triggered",
    description: "Triggers when leaving a site",
    pattern: /\bDeparture\b/i
  },
  "Landfall": {
    type: "triggered",
    description: "Triggers when a site enters your realm",
    pattern: /\bLandfall\b/i
  },
  "Inspire": {
    type: "triggered",
    description: "Triggers when another minion enters",
    pattern: /\bInspire\b/i
  },
  "Wrath": {
    type: "triggered",
    description: "Triggers when this card takes damage",
    pattern: /\bWrath\b/i
  },
  "Glory": {
    type: "triggered",
    description: "Triggers when this card destroys an enemy",
    pattern: /\bGlory\b/i
  },
  "Vengeance": {
    type: "triggered",
    description: "Triggers when a friendly unit dies",
    pattern: /\bVengeance\b/i
  },

  // ============================================
  // COMBAT KEYWORDS
  // ============================================
  "First Strike": {
    type: "combat",
    description: "Deals damage first in combat",
    pattern: /\bFirst Strike\b/i
  },
  "Double Strike": {
    type: "combat",
    description: "Deals damage in both first strike and normal combat",
    pattern: /\bDouble Strike\b/i
  },
  "Lethal": {
    type: "combat",
    description: "Any damage destroys the target",
    pattern: /\bLethal\b/i
  },
  "Deathtouch": {
    type: "combat",
    description: "Any damage destroys the target (alternate name)",
    pattern: /\bDeathtouch\b/i
  },
  "Stealth": {
    type: "combat",
    description: "Cannot be blocked",
    pattern: /\bStealth\b/i
  },
  "Airborne": {
    type: "combat",
    description: "Can only be blocked by Airborne units",
    pattern: /\bAirborne\b/i
  },
  "Flying": {
    type: "combat",
    description: "Can only be blocked by Flying or Reach units",
    pattern: /\bFlying\b/i
  },
  "Ranged": {
    type: "combat",
    description: "Can attack adjacent regions without moving",
    pattern: /\bRanged\b/i
  },
  "Reach": {
    type: "combat",
    description: "Can block Airborne/Flying units",
    pattern: /\bReach\b/i
  },
  "Defender": {
    type: "combat",
    description: "Cannot attack",
    pattern: /\bDefender\b/i
  },
  "Charge": {
    type: "combat",
    description: "Can attack the turn it enters",
    pattern: /\bCharge\b/i
  },
  "Haste": {
    type: "combat",
    description: "Can attack and use abilities immediately",
    pattern: /\bHaste\b/i
  },
  "Trample": {
    type: "combat",
    description: "Excess damage carries over to defender",
    pattern: /\bTramp?le\b/i
  },
  "Piercing": {
    type: "combat",
    description: "Damage cannot be prevented",
    pattern: /\bPiercing\b/i
  },
  "Overwhelm": {
    type: "combat",
    description: "Excess combat damage hits the site",
    pattern: /\bOverwhelm\b/i
  },
  "Vigilance": {
    type: "combat",
    description: "Does not exhaust when attacking",
    pattern: /\bVigilance\b/i
  },
  "Ambush": {
    type: "combat",
    description: "Deals damage before attacker in defense",
    pattern: /\bAmbush\b/i
  },

  // ============================================
  // DEFENSIVE KEYWORDS
  // ============================================
  "Ward": {
    type: "defensive",
    description: "Protected from being targeted by opponents",
    pattern: /\bWard\b/i
  },
  "Hexproof": {
    type: "defensive",
    description: "Cannot be targeted by opponent's spells",
    pattern: /\bHexproof\b/i
  },
  "Shroud": {
    type: "defensive",
    description: "Cannot be targeted by any spells or abilities",
    pattern: /\bShroud\b/i
  },
  "Indestructible": {
    type: "defensive",
    description: "Cannot be destroyed",
    pattern: /\bIndestructible\b/i
  },
  "Immortal": {
    type: "defensive",
    description: "Returns from the Cemetery",
    pattern: /\bImmortal\b/i
  },
  "Resilient": {
    type: "defensive",
    description: "Reduces damage taken",
    pattern: /\bResilient\b/i
  },
  "Phantom": {
    type: "defensive",
    description: "Prevents first damage each turn",
    pattern: /\bPhantom\b/i
  },
  "Armor": {
    type: "defensive",
    description: "Reduces incoming damage by specified amount",
    pattern: /\bArmor\s*\d*/i
  },
  "Shield": {
    type: "defensive",
    description: "Absorbs damage before health",
    pattern: /\bShield\b/i
  },
  "Regenerate": {
    type: "defensive",
    description: "Can heal damage",
    pattern: /\bRegenerate\b/i
  },

  // ============================================
  // MOVEMENT KEYWORDS
  // ============================================
  "Burrow": {
    type: "movement",
    description: "Can move underground to non-adjacent sites",
    pattern: /\bBurrow\b/i
  },
  "Waterborne": {
    type: "movement",
    description: "Can move through water sites",
    pattern: /\bWaterborne\b/i
  },
  "Aquatic": {
    type: "movement",
    description: "Can only be placed on water sites",
    pattern: /\bAquatic\b/i
  },
  "Immobile": {
    type: "movement",
    description: "Cannot move",
    pattern: /\bImmobile\b/i
  },
  "Swift": {
    type: "movement",
    description: "Can move additional spaces",
    pattern: /\bSwift\b/i
  },
  "Teleport": {
    type: "movement",
    description: "Can move to any valid site",
    pattern: /\bTeleport\b/i
  },
  "Phasing": {
    type: "movement",
    description: "Can phase in and out of the realm",
    pattern: /\bPhasing\b/i
  },

  // ============================================
  // SPECIAL ABILITIES
  // ============================================
  "Spellcaster": {
    type: "subtype",
    description: "Can cast spells from grimoire",
    pattern: /\bSpellcaster\b/i
  },
  "Channeler": {
    type: "special",
    description: "Can channel magic for effects",
    pattern: /\bChanneler\b/i
  },
  "Aura": {
    type: "special",
    description: "Provides continuous effect to attached unit",
    pattern: /\bAura\b/i
  },
  "Enchant": {
    type: "special",
    description: "Attaches to target permanently",
    pattern: /\bEnchant\b/i
  },
  "Curse": {
    type: "special",
    description: "Negative enchantment on target",
    pattern: /\bCurse\b/i
  },
  "Blessing": {
    type: "special",
    description: "Positive enchantment on target",
    pattern: /\bBlessing\b/i
  },
  "Lifelink": {
    type: "special",
    description: "Damage dealt also heals controller",
    pattern: /\bLifelink\b/i
  },
  "Drain": {
    type: "special",
    description: "Steals life from target",
    pattern: /\bDrain\b/i
  },
  "Sacrifice": {
    type: "special",
    description: "Can be sacrificed for effect",
    pattern: /\bSacrifice\b/i
  },
  "Transform": {
    type: "special",
    description: "Can change into another form",
    pattern: /\bTransform\b/i
  },
  "Morph": {
    type: "special",
    description: "Can be played face-down",
    pattern: /\bMorph\b/i
  },
  "Echo": {
    type: "special",
    description: "Spell can be cast again",
    pattern: /\bEcho\b/i
  },
  "Flashback": {
    type: "special",
    description: "Can be cast from Cemetery",
    pattern: /\bFlashback\b/i
  },
  "Unearth": {
    type: "special",
    description: "Can return from Cemetery temporarily",
    pattern: /\bUnearth\b/i
  },

  // ============================================
  // CREATURE TYPES / SUBTYPES
  // ============================================
  "Undead": {
    type: "subtype",
    description: "Undead creature type",
    pattern: /\bUndead\b/i
  },
  "Demon": {
    type: "subtype",
    description: "Demon creature type",
    pattern: /\bDemon\b/i
  },
  "Angel": {
    type: "subtype",
    description: "Angel creature type",
    pattern: /\bAngel\b/i
  },
  "Dragon": {
    type: "subtype",
    description: "Dragon creature type",
    pattern: /\bDragon\b/i
  },
  "Beast": {
    type: "subtype",
    description: "Beast creature type",
    pattern: /\bBeast\b/i
  },
  "Elemental": {
    type: "subtype",
    description: "Elemental creature type",
    pattern: /\bElemental\b/i
  },
  "Spirit": {
    type: "subtype",
    description: "Spirit creature type",
    pattern: /\bSpirit\b/i
  },
  "Golem": {
    type: "subtype",
    description: "Golem construct type",
    pattern: /\bGolem\b/i
  },
  "Vampire": {
    type: "subtype",
    description: "Vampire creature type",
    pattern: /\bVampire\b/i
  },
  "Zombie": {
    type: "subtype",
    description: "Zombie creature type",
    pattern: /\bZombie\b/i
  },
  "Skeleton": {
    type: "subtype",
    description: "Skeleton creature type",
    pattern: /\bSkeleton\b/i
  },
  "Warrior": {
    type: "subtype",
    description: "Warrior creature type",
    pattern: /\bWarrior\b/i
  },
  "Knight": {
    type: "subtype",
    description: "Knight creature type",
    pattern: /\bKnight\b/i
  },
  "Wizard": {
    type: "subtype",
    description: "Wizard creature type",
    pattern: /\bWizard\b/i
  },
  "Rogue": {
    type: "subtype",
    description: "Rogue creature type",
    pattern: /\bRogue\b/i
  },
  "Cleric": {
    type: "subtype",
    description: "Cleric creature type",
    pattern: /\bCleric\b/i
  },
  "Shaman": {
    type: "subtype",
    description: "Shaman creature type",
    pattern: /\bShaman\b/i
  },

  // ============================================
  // RESOURCE/COST KEYWORDS
  // ============================================
  "Threshold": {
    type: "resource",
    description: "Requires specific element threshold",
    pattern: /\bThreshold\b/i
  },
  "Affinity": {
    type: "resource",
    description: "Cost reduced based on conditions",
    pattern: /\bAffinity\b/i
  },
  "Convoke": {
    type: "resource",
    description: "Tap creatures to help pay cost",
    pattern: /\bConvoke\b/i
  },
  "Delve": {
    type: "resource",
    description: "Exile cards from Cemetery to reduce cost",
    pattern: /\bDelve\b/i
  },
  "Kicker": {
    type: "resource",
    description: "Optional additional cost for enhanced effect",
    pattern: /\bKicker\b/i
  },
  "Overload": {
    type: "resource",
    description: "Pay more to affect all targets",
    pattern: /\bOverload\b/i
  },

  // ============================================
  // SORCERY-SPECIFIC KEYWORDS
  // ============================================
  "Rubble": {
    type: "terrain",
    description: "Site becomes rubble when destroyed",
    pattern: /\bRubble\b/i
  },
  "Ordinary": {
    type: "rarity",
    description: "Common card rarity",
    pattern: /\bOrdinary\b/i
  },
  "Exceptional": {
    type: "rarity",
    description: "Uncommon card rarity",
    pattern: /\bExceptional\b/i
  },
  "Elite": {
    type: "rarity",
    description: "Rare card rarity",
    pattern: /\bElite\b/i
  },
  "Unique": {
    type: "rarity",
    description: "Mythic rare card rarity",
    pattern: /\bUnique\b/i
  },
  "Avatar": {
    type: "card_type",
    description: "Avatar card type - represents the player",
    pattern: /\bAvatar\b/i
  },
  "Minion": {
    type: "card_type",
    description: "Minion card type - creatures",
    pattern: /\bMinion\b/i
  },
  "Magic": {
    type: "card_type",
    description: "Magic card type - spells",
    pattern: /\bMagic\b/i
  },
  "Site": {
    type: "card_type",
    description: "Site card type - locations",
    pattern: /\bSite\b/i
  },
  "Artifact": {
    type: "card_type",
    description: "Artifact card type - equipment and items",
    pattern: /\bArtifact\b/i
  },
  "Relic": {
    type: "card_type",
    description: "Relic artifact subtype",
    pattern: /\bRelic\b/i
  },
  "Equipment": {
    type: "card_type",
    description: "Equipment artifact subtype",
    pattern: /\bEquipment\b/i
  },

  // ============================================
  // ELEMENT KEYWORDS
  // ============================================
  "Earth": {
    type: "element",
    description: "Earth element affiliation",
    pattern: /\bEarth\b/i
  },
  "Fire": {
    type: "element",
    description: "Fire element affiliation",
    pattern: /\bFire\b/i
  },
  "Water": {
    type: "element",
    description: "Water element affiliation",
    pattern: /\bWater\b/i
  },
  "Air": {
    type: "element",
    description: "Air element affiliation",
    pattern: /\bAir\b/i
  },
  "Void": {
    type: "element",
    description: "Void/Death element affiliation",
    pattern: /\bVoid\b/i
  },

  // ============================================
  // STATUS EFFECTS
  // ============================================
  "Exhausted": {
    type: "status",
    description: "Cannot attack or use abilities",
    pattern: /\bExhausted\b/i
  },
  "Stunned": {
    type: "status",
    description: "Skips next action",
    pattern: /\bStunned\b/i
  },
  "Frozen": {
    type: "status",
    description: "Cannot act until thawed",
    pattern: /\bFrozen\b/i
  },
  "Burning": {
    type: "status",
    description: "Takes damage over time",
    pattern: /\bBurning\b/i
  },
  "Poisoned": {
    type: "status",
    description: "Takes damage over time",
    pattern: /\bPoisoned\b/i
  },
  "Silenced": {
    type: "status",
    description: "Cannot use abilities",
    pattern: /\bSilenced\b/i
  },
  "Weakened": {
    type: "status",
    description: "Reduced attack power",
    pattern: /\bWeakened\b/i
  },
  "Empowered": {
    type: "status",
    description: "Increased attack power",
    pattern: /\bEmpowered\b/i
  }
};

/**
 * KeywordParser class for extracting and analyzing keywords from card rules text
 */
class KeywordParser {
  constructor(customKeywords = {}) {
    this.keywords = { ...SORCERY_KEYWORDS, ...customKeywords };
  }

  /**
   * Parse rules text and extract all matching keywords
   * @param {string} rulesText - The card's rules text
   * @returns {Array<Object>} Array of found keywords with their metadata
   */
  parseRulesText(rulesText) {
    if (!rulesText || typeof rulesText !== 'string') {
      return [];
    }

    const foundKeywords = [];
    const seenKeywords = new Set();

    for (const [keyword, data] of Object.entries(this.keywords)) {
      const pattern = data.pattern || new RegExp(`\\b${this._escapeRegex(keyword)}\\b`, 'i');
      const matches = rulesText.match(pattern);

      if (matches && !seenKeywords.has(keyword.toLowerCase())) {
        seenKeywords.add(keyword.toLowerCase());
        foundKeywords.push({
          keyword,
          type: data.type,
          description: data.description,
          matchedText: matches[0],
          index: rulesText.search(pattern)
        });
      }
    }

    // Sort by position in text
    return foundKeywords.sort((a, b) => a.index - b.index);
  }

  /**
   * Check if rules text contains a specific keyword
   * @param {string} rulesText - The card's rules text
   * @param {string} keyword - The keyword to search for
   * @returns {boolean} True if keyword is found
   */
  hasKeyword(rulesText, keyword) {
    if (!rulesText || !keyword) {
      return false;
    }

    const keywordData = this.keywords[keyword];
    if (!keywordData) {
      // Try case-insensitive lookup
      const normalizedKeyword = Object.keys(this.keywords).find(
        k => k.toLowerCase() === keyword.toLowerCase()
      );
      if (!normalizedKeyword) {
        // Fall back to simple text search
        return new RegExp(`\\b${this._escapeRegex(keyword)}\\b`, 'i').test(rulesText);
      }
      return this.keywords[normalizedKeyword].pattern.test(rulesText);
    }

    return keywordData.pattern.test(rulesText);
  }

  /**
   * Get all keywords of a specific type
   * @param {string} type - The keyword type (e.g., 'triggered', 'combat', 'defensive')
   * @returns {Array<Object>} Array of keywords matching the type
   */
  getKeywordsByType(type) {
    const result = [];

    for (const [keyword, data] of Object.entries(this.keywords)) {
      if (data.type === type) {
        result.push({
          keyword,
          ...data
        });
      }
    }

    return result;
  }

  /**
   * Get all available keyword types
   * @returns {Array<string>} Array of unique keyword types
   */
  getKeywordTypes() {
    const types = new Set();
    for (const data of Object.values(this.keywords)) {
      types.add(data.type);
    }
    return Array.from(types).sort();
  }

  /**
   * Highlight keywords in rules text with HTML markup
   * @param {string} rulesText - The card's rules text
   * @param {Object} options - Highlighting options
   * @returns {string} HTML string with highlighted keywords
   */
  highlightKeywords(rulesText, options = {}) {
    if (!rulesText || typeof rulesText !== 'string') {
      return rulesText || '';
    }

    const {
      className = 'keyword',
      tagName = 'span',
      includeTooltip = true,
      typeClasses = true
    } = options;

    let highlightedText = rulesText;
    const replacements = [];

    // Find all keyword matches first
    for (const [keyword, data] of Object.entries(this.keywords)) {
      const pattern = data.pattern || new RegExp(`\\b${this._escapeRegex(keyword)}\\b`, 'gi');
      let match;
      const globalPattern = new RegExp(pattern.source, 'gi');

      while ((match = globalPattern.exec(rulesText)) !== null) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          original: match[0],
          keyword,
          data
        });
      }
    }

    // Sort by start position (descending to replace from end first)
    replacements.sort((a, b) => b.start - a.start);

    // Remove overlapping matches (keep the first/longest one)
    const filteredReplacements = [];
    for (const rep of replacements) {
      const overlaps = filteredReplacements.some(
        existing => rep.start < existing.end && rep.end > existing.start
      );
      if (!overlaps) {
        filteredReplacements.push(rep);
      }
    }

    // Apply replacements
    for (const rep of filteredReplacements) {
      const classes = [className];
      if (typeClasses) {
        classes.push(`keyword-${rep.data.type}`);
      }

      const tooltip = includeTooltip ? ` title="${this._escapeHtml(rep.data.description)}"` : '';
      const replacement = `<${tagName} class="${classes.join(' ')}"${tooltip}>${rep.original}</${tagName}>`;

      highlightedText =
        highlightedText.substring(0, rep.start) +
        replacement +
        highlightedText.substring(rep.end);
    }

    return highlightedText;
  }

  /**
   * Get the description for a specific keyword
   * @param {string} keyword - The keyword to look up
   * @returns {string|null} The keyword description or null if not found
   */
  getKeywordDescription(keyword) {
    if (!keyword) {
      return null;
    }

    const keywordData = this.keywords[keyword];
    if (keywordData) {
      return keywordData.description;
    }

    // Try case-insensitive lookup
    const normalizedKeyword = Object.keys(this.keywords).find(
      k => k.toLowerCase() === keyword.toLowerCase()
    );

    return normalizedKeyword ? this.keywords[normalizedKeyword].description : null;
  }

  /**
   * Get full keyword data
   * @param {string} keyword - The keyword to look up
   * @returns {Object|null} Full keyword data or null
   */
  getKeywordData(keyword) {
    if (!keyword) {
      return null;
    }

    const keywordData = this.keywords[keyword];
    if (keywordData) {
      return { keyword, ...keywordData };
    }

    // Try case-insensitive lookup
    const normalizedKeyword = Object.keys(this.keywords).find(
      k => k.toLowerCase() === keyword.toLowerCase()
    );

    return normalizedKeyword
      ? { keyword: normalizedKeyword, ...this.keywords[normalizedKeyword] }
      : null;
  }

  /**
   * Add a custom keyword to the parser
   * @param {string} keyword - The keyword name
   * @param {Object} data - Keyword data (type, description, optional pattern)
   */
  addKeyword(keyword, data) {
    this.keywords[keyword] = {
      type: data.type || 'custom',
      description: data.description || '',
      pattern: data.pattern || new RegExp(`\\b${this._escapeRegex(keyword)}\\b`, 'i')
    };
  }

  /**
   * Remove a keyword from the parser
   * @param {string} keyword - The keyword to remove
   * @returns {boolean} True if keyword was removed
   */
  removeKeyword(keyword) {
    if (this.keywords[keyword]) {
      delete this.keywords[keyword];
      return true;
    }
    return false;
  }

  /**
   * Escape special regex characters in a string
   * @private
   */
  _escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Escape HTML special characters
   * @private
   */
  _escapeHtml(string) {
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return string.replace(/[&<>"']/g, char => htmlEntities[char]);
  }
}

// ============================================
// CARD FILTERING FUNCTIONS
// ============================================

/**
 * Filter an array of cards by a specific keyword
 * @param {Array<Object>} cards - Array of card objects with rulesText property
 * @param {string} keyword - The keyword to filter by
 * @param {Object} options - Filter options
 * @returns {Array<Object>} Filtered array of cards
 */
function filterCardsByKeyword(cards, keyword, options = {}) {
  if (!Array.isArray(cards) || !keyword) {
    return [];
  }

  const {
    rulesTextKey = 'rulesText',
    caseSensitive = false,
    parser = new KeywordParser()
  } = options;

  return cards.filter(card => {
    const rulesText = card[rulesTextKey] || card.rules_text || card.text || '';
    return parser.hasKeyword(rulesText, keyword);
  });
}

/**
 * Filter cards by multiple keywords
 * @param {Array<Object>} cards - Array of card objects
 * @param {Array<string>} keywords - Keywords to filter by
 * @param {Object} options - Filter options including 'matchAll' boolean
 * @returns {Array<Object>} Filtered array of cards
 */
function filterCardsByKeywords(cards, keywords, options = {}) {
  if (!Array.isArray(cards) || !Array.isArray(keywords) || keywords.length === 0) {
    return [];
  }

  const {
    rulesTextKey = 'rulesText',
    matchAll = false,
    parser = new KeywordParser()
  } = options;

  return cards.filter(card => {
    const rulesText = card[rulesTextKey] || card.rules_text || card.text || '';

    if (matchAll) {
      return keywords.every(kw => parser.hasKeyword(rulesText, kw));
    } else {
      return keywords.some(kw => parser.hasKeyword(rulesText, kw));
    }
  });
}

/**
 * Filter cards by keyword type
 * @param {Array<Object>} cards - Array of card objects
 * @param {string} type - The keyword type to filter by
 * @param {Object} options - Filter options
 * @returns {Array<Object>} Filtered array of cards
 */
function filterCardsByKeywordType(cards, type, options = {}) {
  if (!Array.isArray(cards) || !type) {
    return [];
  }

  const {
    rulesTextKey = 'rulesText',
    parser = new KeywordParser()
  } = options;

  const keywordsOfType = parser.getKeywordsByType(type).map(k => k.keyword);

  return cards.filter(card => {
    const rulesText = card[rulesTextKey] || card.rules_text || card.text || '';
    return keywordsOfType.some(kw => parser.hasKeyword(rulesText, kw));
  });
}

/**
 * Get keyword statistics across a collection of cards
 * @param {Array<Object>} cards - Array of card objects
 * @param {Object} options - Options including rulesTextKey
 * @returns {Object} Object with keyword counts and statistics
 */
function getKeywordStats(cards, options = {}) {
  if (!Array.isArray(cards)) {
    return { keywords: {}, total: 0, uniqueKeywords: 0, cardCount: 0 };
  }

  const {
    rulesTextKey = 'rulesText',
    parser = new KeywordParser()
  } = options;

  const stats = {
    keywords: {},
    byType: {},
    total: 0,
    uniqueKeywords: 0,
    cardCount: cards.length,
    cardsWithKeywords: 0
  };

  for (const card of cards) {
    const rulesText = card[rulesTextKey] || card.rules_text || card.text || '';
    const foundKeywords = parser.parseRulesText(rulesText);

    if (foundKeywords.length > 0) {
      stats.cardsWithKeywords++;
    }

    for (const kw of foundKeywords) {
      // Count by keyword
      if (!stats.keywords[kw.keyword]) {
        stats.keywords[kw.keyword] = {
          count: 0,
          type: kw.type,
          description: kw.description,
          cards: []
        };
        stats.uniqueKeywords++;
      }
      stats.keywords[kw.keyword].count++;
      stats.keywords[kw.keyword].cards.push(card.name || card.id || 'Unknown');
      stats.total++;

      // Count by type
      if (!stats.byType[kw.type]) {
        stats.byType[kw.type] = {
          count: 0,
          keywords: new Set()
        };
      }
      stats.byType[kw.type].count++;
      stats.byType[kw.type].keywords.add(kw.keyword);
    }
  }

  // Convert Sets to Arrays for JSON serialization
  for (const type of Object.keys(stats.byType)) {
    stats.byType[type].keywords = Array.from(stats.byType[type].keywords);
  }

  return stats;
}

/**
 * Get the most common keywords in a card collection
 * @param {Array<Object>} cards - Array of card objects
 * @param {number} limit - Maximum number of keywords to return
 * @param {Object} options - Options including rulesTextKey
 * @returns {Array<Object>} Array of top keywords with counts
 */
function getMostCommonKeywords(cards, limit = 10, options = {}) {
  const stats = getKeywordStats(cards, options);

  return Object.entries(stats.keywords)
    .map(([keyword, data]) => ({
      keyword,
      count: data.count,
      type: data.type,
      description: data.description,
      percentage: ((data.count / stats.cardsWithKeywords) * 100).toFixed(2) + '%'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get keyword distribution by type
 * @param {Array<Object>} cards - Array of card objects
 * @param {Object} options - Options
 * @returns {Object} Distribution data by keyword type
 */
function getKeywordDistribution(cards, options = {}) {
  const stats = getKeywordStats(cards, options);

  const distribution = {};
  for (const [type, data] of Object.entries(stats.byType)) {
    distribution[type] = {
      count: data.count,
      percentage: ((data.count / stats.total) * 100).toFixed(2) + '%',
      uniqueKeywords: data.keywords.length,
      keywords: data.keywords
    };
  }

  return distribution;
}

// ============================================
// ERRATA DETECTION FUNCTIONS
// ============================================

/**
 * Detect errata (changes) between different printings of a card
 * @param {Object} card - Card object with multiple set metadata
 * @param {Object} options - Detection options
 * @returns {Object|null} Errata information or null if no errata detected
 */
function detectErrata(card, options = {}) {
  if (!card) {
    return null;
  }

  const {
    versionKey = 'versions',
    metadataKeys = ['rulesText', 'rules_text', 'text', 'power', 'toughness', 'cost', 'type', 'subtype']
  } = options;

  const versions = card[versionKey] || card.printings || card.sets;

  if (!versions || !Array.isArray(versions) || versions.length < 2) {
    // Check if card has set-specific metadata directly
    if (card.sets && typeof card.sets === 'object') {
      return detectErrataFromSets(card, card.sets, metadataKeys);
    }
    return null;
  }

  const errata = {
    cardName: card.name || card.id || 'Unknown',
    hasErrata: false,
    changes: [],
    versions: []
  };

  // Sort versions by release date if available
  const sortedVersions = [...versions].sort((a, b) => {
    const dateA = new Date(a.releaseDate || a.release_date || 0);
    const dateB = new Date(b.releaseDate || b.release_date || 0);
    return dateA - dateB;
  });

  errata.versions = sortedVersions.map(v => v.set || v.setCode || v.set_code || 'Unknown');

  // Compare each version to the previous
  for (let i = 1; i < sortedVersions.length; i++) {
    const oldVersion = sortedVersions[i - 1];
    const newVersion = sortedVersions[i];

    const diff = compareVersions(oldVersion, newVersion, metadataKeys);

    if (diff.length > 0) {
      errata.hasErrata = true;
      errata.changes.push({
        fromSet: oldVersion.set || oldVersion.setCode || 'Unknown',
        toSet: newVersion.set || newVersion.setCode || 'Unknown',
        differences: diff
      });
    }
  }

  return errata.hasErrata ? errata : null;
}

/**
 * Helper function to detect errata from set-specific metadata
 * @private
 */
function detectErrataFromSets(card, sets, metadataKeys) {
  const setNames = Object.keys(sets);
  if (setNames.length < 2) {
    return null;
  }

  const errata = {
    cardName: card.name || card.id || 'Unknown',
    hasErrata: false,
    changes: [],
    versions: setNames
  };

  for (let i = 1; i < setNames.length; i++) {
    const oldSet = sets[setNames[i - 1]];
    const newSet = sets[setNames[i]];

    const diff = compareVersions(oldSet, newSet, metadataKeys);

    if (diff.length > 0) {
      errata.hasErrata = true;
      errata.changes.push({
        fromSet: setNames[i - 1],
        toSet: setNames[i],
        differences: diff
      });
    }
  }

  return errata.hasErrata ? errata : null;
}

/**
 * Compare two card versions and return differences
 * @private
 */
function compareVersions(oldVersion, newVersion, metadataKeys) {
  const differences = [];

  for (const key of metadataKeys) {
    const oldValue = oldVersion[key];
    const newValue = newVersion[key];

    // Skip if both undefined
    if (oldValue === undefined && newValue === undefined) {
      continue;
    }

    // Normalize values for comparison
    const normalizedOld = normalizeValue(oldValue);
    const normalizedNew = normalizeValue(newValue);

    if (normalizedOld !== normalizedNew) {
      differences.push({
        field: key,
        oldValue: oldValue,
        newValue: newValue,
        type: categorizeChange(key, oldValue, newValue)
      });
    }
  }

  return differences;
}

/**
 * Normalize a value for comparison
 * @private
 */
function normalizeValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return JSON.stringify(value);
}

/**
 * Categorize the type of change
 * @private
 */
function categorizeChange(field, oldValue, newValue) {
  if (field.includes('rules') || field.includes('text')) {
    return 'rules_change';
  }
  if (field === 'power' || field === 'toughness') {
    return 'stats_change';
  }
  if (field === 'cost' || field === 'mana_cost') {
    return 'cost_change';
  }
  if (field === 'type' || field === 'subtype') {
    return 'type_change';
  }
  return 'other_change';
}

/**
 * Get all cards with errata from a collection
 * @param {Array<Object>} allCards - Array of all card objects
 * @param {Object} options - Detection options
 * @returns {Array<Object>} Array of cards with errata information
 */
function getErrataCards(allCards, options = {}) {
  if (!Array.isArray(allCards)) {
    return [];
  }

  const errataCards = [];

  for (const card of allCards) {
    const errata = detectErrata(card, options);
    if (errata) {
      errataCards.push({
        card,
        errata
      });
    }
  }

  return errataCards;
}

/**
 * Format errata differences as human-readable text
 * @param {Object} oldMeta - Old card metadata
 * @param {Object} newMeta - New card metadata
 * @param {Object} options - Formatting options
 * @returns {string} Human-readable diff string
 */
function formatErrataDiff(oldMeta, newMeta, options = {}) {
  const {
    format = 'text', // 'text', 'html', 'markdown'
    metadataKeys = ['rulesText', 'rules_text', 'text', 'power', 'toughness', 'cost', 'type', 'subtype']
  } = options;

  const differences = compareVersions(oldMeta, newMeta, metadataKeys);

  if (differences.length === 0) {
    return format === 'html'
      ? '<p>No differences found.</p>'
      : 'No differences found.';
  }

  const lines = [];
  const fieldLabels = {
    rulesText: 'Rules Text',
    rules_text: 'Rules Text',
    text: 'Text',
    power: 'Power',
    toughness: 'Toughness',
    cost: 'Cost',
    type: 'Type',
    subtype: 'Subtype'
  };

  for (const diff of differences) {
    const label = fieldLabels[diff.field] || diff.field;

    if (format === 'html') {
      lines.push(`<div class="errata-diff errata-${diff.type}">`);
      lines.push(`  <strong>${label}:</strong>`);
      lines.push(`  <div class="old-value"><del>${escapeHtml(String(diff.oldValue || '(empty)'))}</del></div>`);
      lines.push(`  <div class="new-value"><ins>${escapeHtml(String(diff.newValue || '(empty)'))}</ins></div>`);
      lines.push(`</div>`);
    } else if (format === 'markdown') {
      lines.push(`### ${label}`);
      lines.push(`- **Old:** ~~${diff.oldValue || '(empty)'}~~`);
      lines.push(`- **New:** ${diff.newValue || '(empty)'}`);
      lines.push('');
    } else {
      lines.push(`${label}:`);
      lines.push(`  Old: ${diff.oldValue || '(empty)'}`);
      lines.push(`  New: ${diff.newValue || '(empty)'}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate a complete errata report for a card
 * @param {Object} card - Card with errata
 * @param {Object} options - Report options
 * @returns {string} Formatted errata report
 */
function generateErrataReport(card, options = {}) {
  const {
    format = 'text'
  } = options;

  const errata = detectErrata(card, options);

  if (!errata) {
    return format === 'html'
      ? `<p>No errata found for ${card.name || 'this card'}.</p>`
      : `No errata found for ${card.name || 'this card'}.`;
  }

  const lines = [];

  if (format === 'html') {
    lines.push(`<div class="errata-report">`);
    lines.push(`  <h2>Errata Report: ${escapeHtml(errata.cardName)}</h2>`);
    lines.push(`  <p>Versions: ${errata.versions.join(' → ')}</p>`);

    for (const change of errata.changes) {
      lines.push(`  <div class="errata-change">`);
      lines.push(`    <h3>${escapeHtml(change.fromSet)} → ${escapeHtml(change.toSet)}</h3>`);

      for (const diff of change.differences) {
        lines.push(`    <div class="diff-item">`);
        lines.push(`      <strong>${escapeHtml(diff.field)}:</strong>`);
        lines.push(`      <span class="old">${escapeHtml(String(diff.oldValue || '(empty)'))}</span>`);
        lines.push(`      <span class="arrow">→</span>`);
        lines.push(`      <span class="new">${escapeHtml(String(diff.newValue || '(empty)'))}</span>`);
        lines.push(`    </div>`);
      }

      lines.push(`  </div>`);
    }

    lines.push(`</div>`);
  } else if (format === 'markdown') {
    lines.push(`# Errata Report: ${errata.cardName}`);
    lines.push('');
    lines.push(`**Versions:** ${errata.versions.join(' → ')}`);
    lines.push('');

    for (const change of errata.changes) {
      lines.push(`## ${change.fromSet} → ${change.toSet}`);
      lines.push('');

      for (const diff of change.differences) {
        lines.push(`- **${diff.field}:** ~~${diff.oldValue || '(empty)'}~~ → ${diff.newValue || '(empty)'}`);
      }
      lines.push('');
    }
  } else {
    lines.push(`ERRATA REPORT: ${errata.cardName}`);
    lines.push(`${'='.repeat(40)}`);
    lines.push(`Versions: ${errata.versions.join(' → ')}`);
    lines.push('');

    for (const change of errata.changes) {
      lines.push(`${change.fromSet} → ${change.toSet}`);
      lines.push(`${'-'.repeat(30)}`);

      for (const diff of change.differences) {
        lines.push(`${diff.field}:`);
        lines.push(`  Old: ${diff.oldValue || '(empty)'}`);
        lines.push(`  New: ${diff.newValue || '(empty)'}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Escape HTML characters
 * @private
 */
function escapeHtml(string) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, char => htmlEntities[char]);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create a keyword index from a card collection for fast lookups
 * @param {Array<Object>} cards - Array of card objects
 * @param {Object} options - Indexing options
 * @returns {Object} Indexed keyword map
 */
function createKeywordIndex(cards, options = {}) {
  const {
    rulesTextKey = 'rulesText',
    parser = new KeywordParser()
  } = options;

  const index = {
    byKeyword: {},
    byType: {},
    byCard: {}
  };

  for (const card of cards) {
    const cardId = card.id || card.name || Math.random().toString(36);
    const rulesText = card[rulesTextKey] || card.rules_text || card.text || '';
    const keywords = parser.parseRulesText(rulesText);

    index.byCard[cardId] = keywords.map(k => k.keyword);

    for (const kw of keywords) {
      // Index by keyword
      if (!index.byKeyword[kw.keyword]) {
        index.byKeyword[kw.keyword] = [];
      }
      index.byKeyword[kw.keyword].push(cardId);

      // Index by type
      if (!index.byType[kw.type]) {
        index.byType[kw.type] = {};
      }
      if (!index.byType[kw.type][kw.keyword]) {
        index.byType[kw.type][kw.keyword] = [];
      }
      index.byType[kw.type][kw.keyword].push(cardId);
    }
  }

  return index;
}

/**
 * Search for cards by keyword using a pre-built index
 * @param {Object} index - Keyword index from createKeywordIndex
 * @param {string} keyword - Keyword to search for
 * @returns {Array<string>} Array of card IDs
 */
function searchByKeyword(index, keyword) {
  return index.byKeyword[keyword] || [];
}

/**
 * Get keyword summary for a single card
 * @param {Object} card - Card object
 * @param {Object} options - Options
 * @returns {Object} Summary of keywords on the card
 */
function getCardKeywordSummary(card, options = {}) {
  const {
    rulesTextKey = 'rulesText',
    parser = new KeywordParser()
  } = options;

  const rulesText = card[rulesTextKey] || card.rules_text || card.text || '';
  const keywords = parser.parseRulesText(rulesText);

  const summary = {
    cardName: card.name || 'Unknown',
    totalKeywords: keywords.length,
    keywords: keywords.map(k => k.keyword),
    byType: {}
  };

  for (const kw of keywords) {
    if (!summary.byType[kw.type]) {
      summary.byType[kw.type] = [];
    }
    summary.byType[kw.type].push(kw.keyword);
  }

  return summary;
}

// ============================================
// EXPORTS (for CommonJS/Node.js environments)
// ============================================

// Classes and functions are already available globally in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Constants
    SORCERY_KEYWORDS,

    // Classes
    KeywordParser,

    // Card filtering functions
    filterCardsByKeyword,
    filterCardsByKeywords,
    filterCardsByKeywordType,
    getKeywordStats,
    getMostCommonKeywords,
    getKeywordDistribution,

    // Errata detection functions
    detectErrata,
    getErrataCards,
    formatErrataDiff,
    generateErrataReport,

    // Utility functions
    createKeywordIndex,
    searchByKeyword,
    getCardKeywordSummary
  };
}
