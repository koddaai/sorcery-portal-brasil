// ============================================
// SORCERY BRASIL - INTERNATIONALIZATION
// Português como padrão, com suporte a EN e ES
// ============================================

const translations = {
    pt: {
        // Navigation
        home: 'Início',
        cards: 'Cards',
        collection: 'Coleção',
        precons: 'Precons',
        decks: 'Decks',
        wishlist: 'Wishlist',
        trade: 'Trade',
        stats: 'Stats',
        locator: 'Lojas',
        codex: 'Codex',
        community: 'Comunidade',
        meta: 'Meta',
        scanner: 'Scanner',

        // Home Page
        heroSubtitle: 'O jogo de cartas colecionáveis com arte pintada à mão por mestres da fantasia',
        exploreCards: 'Conheça as Cartas',
        howToPlay: 'Como Jogar',
        gothicExpansion: 'Expansão Gothic Disponível',
        featureCollection: 'Gerencie sua Coleção',
        featureCollectionDesc: 'Rastreie todos os seus cards, valores e progresso de completude',
        featureDecks: 'Monte Decks',
        featureDecksDesc: 'Crie e salve seus decks com estatísticas detalhadas',
        featureStores: 'Encontre Lojas',
        featureStoresDesc: 'Localize lojas brasileiras que vendem Sorcery',
        featureCodex: 'Codex de Regras',
        featureCodexDesc: 'Consulte todas as regras e mecânicas do jogo',
        aboutTitle: 'Sobre o Jogo',
        aboutText1: 'Sorcery: Contested Realm é um jogo de cartas colecionáveis único, onde cada carta apresenta arte original pintada à mão por artistas consagrados da fantasia.',
        aboutText2: 'Controle poderosos Avatares, conjure magias devastadoras e convoque criaturas míticas em batalhas épicas.',
        uniqueCards: 'Cards Únicos',
        elements: 'Elementos',
        expansions: 'Expansões',
        latestNews: 'Últimas Notícias',
        seeAll: 'Ver Todas',
        joinCommunity: 'Junte-se à Comunidade Brasileira',
        joinCommunityDesc: 'Conecte-se com jogadores de todo o Brasil, encontre parceiros para jogar e fique por dentro de eventos.',
        joinDiscord: 'Entrar no Discord',

        // Store Locator
        storeLocator: 'Encontre Lojas',
        storeLocatorDesc: 'Lojas brasileiras que vendem Sorcery: Contested Realm',
        mapPlaceholder: 'Selecione uma loja para ver no mapa',
        addStoreCta: 'Conhece uma loja que vende Sorcery e não está na lista?',
        suggestStore: 'Sugerir Loja',

        // Codex
        codexTitle: 'Codex de Regras',
        codexDesc: 'Referência completa de regras e mecânicas de Sorcery',
        codexBasics: 'Básico',
        codexCardTypes: 'Tipos de Cards',
        codexMechanics: 'Mecânicas',
        codexKeywords: 'Palavras-chave',
        codexZones: 'Zonas de Jogo',
        codexFormats: 'Formatos',
        codexOrganized: 'Organized Play',
        officialRulebook: 'Rulebook Oficial',
        rulebook: 'Rulebook',
        rulebookTitle: 'Rulebook - Português',
        faq: 'FAQ',
        faqTitle: 'Perguntas Frequentes',
        guides: 'Guias',
        guidesTitle: 'Guias de Deck',
        artists: 'Artistas',
        artistsTitle: 'Galeria de Artistas',
        timeline: 'Timeline',
        timelineTitle: 'Timeline de Lançamentos',
        dust: 'Dust',
        dustTitle: 'Dust Tracker',
        promos: 'Promos',
        promosTitle: 'Tracker de Promos',

        // Auth
        login: 'Entrar',
        register: 'Registrar',
        logout: 'Sair',
        sync: 'Sync',

        // Filters
        searchCards: 'Buscar cards...',
        allSets: 'Todos os Sets',
        allTypes: 'Todos os Tipos',
        allElements: 'Todos os Elementos',
        allRarities: 'Todas as Raridades',

        // Card types
        avatar: 'Avatar',
        minion: 'Lacaio',
        magic: 'Magia',
        artifact: 'Artefato',
        aura: 'Aura',
        site: 'Lugar',

        // Elements
        fire: 'Fogo',
        water: 'Água',
        earth: 'Terra',
        air: 'Ar',

        // Rarities
        ordinary: 'Ordinário',
        exceptional: 'Excepcional',
        elite: 'Elite',
        unique: 'Único',

        // Stats
        totalCards: 'Total de Cards',
        completion: 'Completude',
        inCollection: 'na coleção',
        ofAllCards: 'de todos os cards',
        collectionValue: 'Valor da Coleção',
        avgCardValue: 'Valor Médio',
        wishlistValue: 'Valor Wishlist',

        // Community
        communityTitle: 'Comunidade',
        communitySubtitle: 'Conecte-se com a comunidade brasileira de Sorcery TCG',
        discordTitle: 'Discord Oficial Brasil',
        discordDesc: 'Junte-se a centenas de jogadores brasileiros. Troque cartas, discuta estratégias e participe de eventos.',
        joinDiscord: 'Entrar no Discord',
        brazilianStores: 'Lojas Brasileiras',
        storesSubtitle: 'Encontre Sorcery TCG nas melhores lojas do Brasil',
        usefulLinks: 'Links Úteis',
        officialSite: 'Site Oficial',
        howToPlay: 'Como Jogar',
        events: 'Eventos',

        // Meta
        metaTitle: 'Meta & Estratégia',
        metaSubtitle: 'Guias de deck, tier list e dicas de gameplay',
        currentTierList: 'Tier List Atual',
        strategyGuides: 'Guias de Estratégia',
        beginnerGuide: 'Guia para Iniciantes',
        learnBasics: 'Aprenda os fundamentos do jogo',
        deckBuilding: 'Construção de Decks',
        communityDecks: 'Veja decks da comunidade',
        elementGuide: 'Guia de Elementos',
        elementStrengths: 'Pontos fortes de cada elemento',
        budgetDecks: 'Decks Budget',
        budgetDesc: 'Decks competitivos com baixo custo',
        elementOverview: 'Visão Geral dos Elementos',

        // Element descriptions
        fireDesc: 'Agressivo, dano direto, remoção eficiente',
        waterDesc: 'Controle, draw, manipulação de mão',
        earthDesc: 'Criaturas resilientes, ramp, midrange',
        airDesc: 'Evasão, tempo, spells versáteis',

        // Actions
        addToCollection: 'Adicionar à Coleção',
        removeFromCollection: 'Remover da Coleção',
        addToWishlist: 'Adicionar à Wishlist',
        addToTrade: 'Adicionar ao Trade',

        // Misc
        cards_count: 'cards',
        updated: 'Atualizado'
    },

    en: {
        // Navigation
        home: 'Home',
        cards: 'Cards',
        collection: 'Collection',
        precons: 'Precons',
        decks: 'Decks',
        wishlist: 'Wishlist',
        trade: 'Trade',
        stats: 'Stats',
        locator: 'Stores',
        codex: 'Codex',
        community: 'Community',
        meta: 'Meta',
        scanner: 'Scanner',

        // Home Page
        heroSubtitle: 'The collectible card game with hand-painted art by fantasy masters',
        exploreCards: 'Discover the Cards',
        howToPlay: 'How to Play',
        gothicExpansion: 'Gothic Expansion Available',
        featureCollection: 'Manage Your Collection',
        featureCollectionDesc: 'Track all your cards, values, and completion progress',
        featureDecks: 'Build Decks',
        featureDecksDesc: 'Create and save your decks with detailed statistics',
        featureStores: 'Find Stores',
        featureStoresDesc: 'Locate Brazilian stores that sell Sorcery',
        featureCodex: 'Rules Codex',
        featureCodexDesc: 'Consult all game rules and mechanics',
        aboutTitle: 'About the Game',
        aboutText1: 'Sorcery: Contested Realm is a unique collectible card game, where each card features original hand-painted art by renowned fantasy artists.',
        aboutText2: 'Control powerful Avatars, cast devastating spells, and summon mythical creatures in epic battles.',
        uniqueCards: 'Unique Cards',
        elements: 'Elements',
        expansions: 'Expansions',
        latestNews: 'Latest News',
        seeAll: 'See All',
        joinCommunity: 'Join the Brazilian Community',
        joinCommunityDesc: 'Connect with players from all over Brazil, find partners to play, and stay updated on events.',
        joinDiscord: 'Join Discord',

        // Store Locator
        storeLocator: 'Find Stores',
        storeLocatorDesc: 'Brazilian stores that sell Sorcery: Contested Realm',
        mapPlaceholder: 'Select a store to see on the map',
        addStoreCta: 'Know a store that sells Sorcery and is not on the list?',
        suggestStore: 'Suggest Store',

        // Codex
        codexTitle: 'Rules Codex',
        codexDesc: 'Complete reference of Sorcery rules and mechanics',
        codexBasics: 'Basics',
        codexCardTypes: 'Card Types',
        codexMechanics: 'Mechanics',
        codexKeywords: 'Keywords',
        codexZones: 'Game Zones',
        codexFormats: 'Formats',
        codexOrganized: 'Organized Play',
        officialRulebook: 'Official Rulebook',
        rulebook: 'Rulebook',
        rulebookTitle: 'Rulebook - Portuguese',
        faq: 'FAQ',
        faqTitle: 'Frequently Asked Questions',
        guides: 'Guides',
        guidesTitle: 'Deck Building Guides',
        artists: 'Artists',
        artistsTitle: 'Artist Gallery',
        timeline: 'Timeline',
        timelineTitle: 'Release Timeline',
        dust: 'Dust',
        dustTitle: 'Dust Tracker',
        promos: 'Promos',
        promosTitle: 'Promo Tracker',

        // Auth
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        sync: 'Sync',

        // Filters
        searchCards: 'Search cards...',
        allSets: 'All Sets',
        allTypes: 'All Types',
        allElements: 'All Elements',
        allRarities: 'All Rarities',

        // Card types
        avatar: 'Avatar',
        minion: 'Minion',
        magic: 'Magic',
        artifact: 'Artifact',
        aura: 'Aura',
        site: 'Site',

        // Elements
        fire: 'Fire',
        water: 'Water',
        earth: 'Earth',
        air: 'Air',

        // Rarities
        ordinary: 'Ordinary',
        exceptional: 'Exceptional',
        elite: 'Elite',
        unique: 'Unique',

        // Stats
        totalCards: 'Total Cards',
        completion: 'Completion',
        inCollection: 'in collection',
        ofAllCards: 'of all cards',
        collectionValue: 'Collection Value',
        avgCardValue: 'Avg. Card Value',
        wishlistValue: 'Wishlist Value',

        // Community
        communityTitle: 'Community',
        communitySubtitle: 'Connect with the Brazilian Sorcery TCG community',
        discordTitle: 'Official Brazil Discord',
        discordDesc: 'Join hundreds of Brazilian players. Trade cards, discuss strategies and participate in events.',
        joinDiscord: 'Join Discord',
        brazilianStores: 'Brazilian Stores',
        storesSubtitle: 'Find Sorcery TCG at the best stores in Brazil',
        usefulLinks: 'Useful Links',
        officialSite: 'Official Site',
        howToPlay: 'How to Play',
        events: 'Events',

        // Meta
        metaTitle: 'Meta & Strategy',
        metaSubtitle: 'Deck guides, tier list and gameplay tips',
        currentTierList: 'Current Tier List',
        strategyGuides: 'Strategy Guides',
        beginnerGuide: 'Beginner Guide',
        learnBasics: 'Learn the fundamentals of the game',
        deckBuilding: 'Deck Building',
        communityDecks: 'See community decks',
        elementGuide: 'Element Guide',
        elementStrengths: 'Strengths of each element',
        budgetDecks: 'Budget Decks',
        budgetDesc: 'Competitive decks with low cost',
        elementOverview: 'Element Overview',

        // Element descriptions
        fireDesc: 'Aggressive, direct damage, efficient removal',
        waterDesc: 'Control, draw, hand manipulation',
        earthDesc: 'Resilient creatures, ramp, midrange',
        airDesc: 'Evasion, tempo, versatile spells',

        // Actions
        addToCollection: 'Add to Collection',
        removeFromCollection: 'Remove from Collection',
        addToWishlist: 'Add to Wishlist',
        addToTrade: 'Add to Trade',

        // Misc
        cards_count: 'cards',
        updated: 'Updated'
    },

    es: {
        // Navigation
        home: 'Inicio',
        cards: 'Cartas',
        collection: 'Colección',
        precons: 'Precons',
        decks: 'Mazos',
        wishlist: 'Deseados',
        trade: 'Intercambio',
        stats: 'Stats',
        locator: 'Tiendas',
        codex: 'Códex',
        community: 'Comunidad',
        meta: 'Meta',
        scanner: 'Escáner',

        // Home Page
        heroSubtitle: 'El juego de cartas coleccionables con arte pintado a mano por maestros de la fantasía',
        exploreCards: 'Conoce las Cartas',
        howToPlay: 'Cómo Jugar',
        gothicExpansion: 'Expansión Gothic Disponible',
        featureCollection: 'Gestiona tu Colección',
        featureCollectionDesc: 'Rastrea todas tus cartas, valores y progreso de completado',
        featureDecks: 'Construye Mazos',
        featureDecksDesc: 'Crea y guarda tus mazos con estadísticas detalladas',
        featureStores: 'Encuentra Tiendas',
        featureStoresDesc: 'Localiza tiendas brasileñas que venden Sorcery',
        featureCodex: 'Códex de Reglas',
        featureCodexDesc: 'Consulta todas las reglas y mecánicas del juego',
        aboutTitle: 'Sobre el Juego',
        aboutText1: 'Sorcery: Contested Realm es un juego de cartas coleccionables único, donde cada carta presenta arte original pintado a mano por artistas de fantasía consagrados.',
        aboutText2: 'Controla poderosos Avatares, lanza hechizos devastadores e invoca criaturas míticas en batallas épicas.',
        uniqueCards: 'Cartas Únicas',
        elements: 'Elementos',
        expansions: 'Expansiones',
        latestNews: 'Últimas Noticias',
        seeAll: 'Ver Todas',
        joinCommunity: 'Únete a la Comunidad Brasileña',
        joinCommunityDesc: 'Conéctate con jugadores de todo Brasil, encuentra compañeros para jugar y mantente al tanto de eventos.',
        joinDiscord: 'Unirse a Discord',

        // Store Locator
        storeLocator: 'Encuentra Tiendas',
        storeLocatorDesc: 'Tiendas brasileñas que venden Sorcery: Contested Realm',
        mapPlaceholder: 'Selecciona una tienda para ver en el mapa',
        addStoreCta: '¿Conoces una tienda que vende Sorcery y no está en la lista?',
        suggestStore: 'Sugerir Tienda',

        // Codex
        codexTitle: 'Códex de Reglas',
        codexDesc: 'Referencia completa de reglas y mecánicas de Sorcery',
        codexBasics: 'Básico',
        codexCardTypes: 'Tipos de Cartas',
        codexMechanics: 'Mecánicas',
        codexKeywords: 'Palabras clave',
        codexZones: 'Zonas de Juego',
        codexFormats: 'Formatos',
        codexOrganized: 'Organized Play',
        officialRulebook: 'Reglamento Oficial',
        rulebook: 'Reglamento',
        rulebookTitle: 'Reglamento - Portugués',
        faq: 'FAQ',
        faqTitle: 'Preguntas Frecuentes',
        guides: 'Guías',
        guidesTitle: 'Guías de Mazos',
        artists: 'Artistas',
        artistsTitle: 'Galería de Artistas',
        timeline: 'Línea de Tiempo',
        timelineTitle: 'Línea de Lanzamientos',
        dust: 'Dust',
        dustTitle: 'Rastreador de Dust',
        promos: 'Promos',
        promosTitle: 'Rastreador de Promos',

        // Auth
        login: 'Entrar',
        register: 'Registrar',
        logout: 'Salir',
        sync: 'Sync',

        // Filters
        searchCards: 'Buscar cartas...',
        allSets: 'Todos los Sets',
        allTypes: 'Todos los Tipos',
        allElements: 'Todos los Elementos',
        allRarities: 'Todas las Rarezas',

        // Card types
        avatar: 'Avatar',
        minion: 'Esbirro',
        magic: 'Magia',
        artifact: 'Artefacto',
        aura: 'Aura',
        site: 'Lugar',

        // Elements
        fire: 'Fuego',
        water: 'Agua',
        earth: 'Tierra',
        air: 'Aire',

        // Rarities
        ordinary: 'Ordinario',
        exceptional: 'Excepcional',
        elite: 'Élite',
        unique: 'Único',

        // Stats
        totalCards: 'Total de Cartas',
        completion: 'Completado',
        inCollection: 'en colección',
        ofAllCards: 'de todas las cartas',
        collectionValue: 'Valor de Colección',
        avgCardValue: 'Valor Promedio',
        wishlistValue: 'Valor Deseados',

        // Community
        communityTitle: 'Comunidad',
        communitySubtitle: 'Conéctate con la comunidad brasileña de Sorcery TCG',
        discordTitle: 'Discord Oficial Brasil',
        discordDesc: 'Únete a cientos de jugadores brasileños. Intercambia cartas, discute estrategias y participa en eventos.',
        joinDiscord: 'Unirse a Discord',
        brazilianStores: 'Tiendas Brasileñas',
        storesSubtitle: 'Encuentra Sorcery TCG en las mejores tiendas de Brasil',
        usefulLinks: 'Enlaces Útiles',
        officialSite: 'Sitio Oficial',
        howToPlay: 'Cómo Jugar',
        events: 'Eventos',

        // Meta
        metaTitle: 'Meta y Estrategia',
        metaSubtitle: 'Guías de mazos, tier list y consejos de juego',
        currentTierList: 'Tier List Actual',
        strategyGuides: 'Guías de Estrategia',
        beginnerGuide: 'Guía para Principiantes',
        learnBasics: 'Aprende los fundamentos del juego',
        deckBuilding: 'Construcción de Mazos',
        communityDecks: 'Ver mazos de la comunidad',
        elementGuide: 'Guía de Elementos',
        elementStrengths: 'Fortalezas de cada elemento',
        budgetDecks: 'Mazos Económicos',
        budgetDesc: 'Mazos competitivos de bajo costo',
        elementOverview: 'Visión General de Elementos',

        // Element descriptions
        fireDesc: 'Agresivo, daño directo, remoción eficiente',
        waterDesc: 'Control, robo, manipulación de mano',
        earthDesc: 'Criaturas resistentes, ramp, midrange',
        airDesc: 'Evasión, tempo, hechizos versátiles',

        // Actions
        addToCollection: 'Agregar a Colección',
        removeFromCollection: 'Quitar de Colección',
        addToWishlist: 'Agregar a Deseados',
        addToTrade: 'Agregar a Intercambio',

        // Misc
        cards_count: 'cartas',
        updated: 'Actualizado'
    }
};

// Current language (default: Portuguese)
let currentLang = localStorage.getItem('sorcery-lang') || 'pt';

// Get translation
function t(key) {
    return translations[currentLang]?.[key] || translations['pt'][key] || key;
}

// Set language
function setLanguage(lang) {
    if (!translations[lang]) return;

    currentLang = lang;
    localStorage.setItem('sorcery-lang', lang);

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Update document title
    document.title = `Sorcery Brasil - ${t('communitySubtitle')}`;

    // Update active language in dropdown
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

// Initialize language selector
function initLanguageSelector() {
    const toggle = document.getElementById('lang-toggle');
    const dropdown = document.getElementById('lang-dropdown');

    if (!toggle || !dropdown) return;

    // Toggle dropdown
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdown.classList.add('hidden');
    });

    // Language options
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
            dropdown.classList.add('hidden');
        });
    });

    // Set initial language
    setLanguage(currentLang);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initLanguageSelector, 100);
});
