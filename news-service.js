// ============================================
// SORCERY PORTAL BRASIL - NEWS SERVICE
// Dynamic news loading and display
// ============================================

class NewsService {
    constructor() {
        this.news = [];
        this.lastUpdated = null;
        this.loaded = false;
    }

    /**
     * Load news from database
     */
    async loadNews() {
        if (this.loaded) return this.news;

        try {
            const response = await fetch('/news-database.json');
            if (!response.ok) throw new Error('Failed to load news');

            const data = await response.json();
            this.news = data.news || [];
            this.lastUpdated = data.lastUpdated;
            this.loaded = true;

            console.log(`[News] Loaded ${this.news.length} news items`);
            return this.news;
        } catch (error) {
            console.error('[News] Error loading news:', error);
            return [];
        }
    }

    /**
     * Get latest N news items
     */
    getLatest(count = 3) {
        return this.news.slice(0, count);
    }

    /**
     * Get all news
     */
    getAll() {
        return this.news;
    }

    /**
     * Get news by category
     */
    getByCategory(category) {
        return this.news.filter(n =>
            n.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Search news
     */
    search(query) {
        const q = query.toLowerCase();
        return this.news.filter(n =>
            n.title_pt.toLowerCase().includes(q) ||
            n.summary_pt.toLowerCase().includes(q) ||
            n.category.toLowerCase().includes(q)
        );
    }

    /**
     * Format date for display
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            'expansao': 'package',
            'expansion': 'package',
            'op': 'trophy',
            'organized play': 'trophy',
            'artista': 'palette',
            'artist': 'palette',
            'produto': 'shopping-bag',
            'product': 'shopping-bag',
            'ferramenta': 'wrench',
            'tool': 'wrench',
            'evento': 'calendar',
            'event': 'calendar',
            'news': 'newspaper',
            'noticia': 'newspaper'
        };
        return icons[category.toLowerCase()] || 'newspaper';
    }

    /**
     * Get category color class
     */
    getCategoryClass(category) {
        const classes = {
            'expansao': 'badge-expansion',
            'expansion': 'badge-expansion',
            'gothic': 'badge-gothic',
            'op': 'badge-op',
            'organized play': 'badge-op',
            'evento': 'badge-evento',
            'event': 'badge-evento',
            'artista': 'badge-artista',
            'artist': 'badge-artista',
            'produto': 'badge-produto',
            'product': 'badge-produto',
            'guia': 'badge-guia',
            'guide': 'badge-guia',
            'ferramenta': 'badge-ferramenta',
            'tool': 'badge-ferramenta'
        };
        return classes[category.toLowerCase()] || 'badge-news';
    }

    /**
     * Render news card HTML
     */
    renderCard(news, options = {}) {
        const { compact = false } = options;
        const icon = this.getCategoryIcon(news.category);
        const badgeClass = this.getCategoryClass(news.category);

        // Compact card for landing page
        if (compact) {
            return `
                <a href="${news.link}" target="_blank" class="news-card news-card-compact">
                    ${news.image ? `
                        <div class="news-card-image">
                            <img src="${news.image}" alt="${news.title_pt}" loading="lazy" onerror="this.parentElement.classList.add('no-image')">
                        </div>
                    ` : `
                        <div class="news-card-image no-image">
                            <i data-lucide="${icon}"></i>
                        </div>
                    `}
                    <div class="news-card-body">
                        <div class="news-badge ${badgeClass}">${news.category}</div>
                        <h4>${news.title_pt}</h4>
                        <p>${news.summary_pt}</p>
                    </div>
                </a>
            `;
        }

        // Full card for news view
        return `
            <article class="news-card-full">
                ${news.image ? `
                    <div class="news-image">
                        <img src="${news.image}" alt="${news.title_pt}" loading="lazy" onerror="this.style.display='none'">
                    </div>
                ` : `
                    <div class="news-image-placeholder">
                        <i data-lucide="${icon}"></i>
                    </div>
                `}
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-badge ${badgeClass}">
                            ${news.category}
                        </span>
                        <span class="news-date">
                            <i data-lucide="calendar"></i>
                            ${this.formatDate(news.date)}
                        </span>
                    </div>
                    <h3>${news.title_pt}</h3>
                    <p class="news-summary">${news.summary_pt}</p>
                    <div class="news-actions">
                        <a href="${news.link}" target="_blank" class="btn primary btn-sm">
                            <i data-lucide="external-link"></i>
                            Ler Mais
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Render news grid for landing page
     */
    renderLandingNews() {
        const container = document.getElementById('landing-news-grid');
        if (!container) return;

        const latest = this.getLatest(3);
        if (latest.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma noticia disponivel</p>';
            return;
        }

        container.innerHTML = latest.map(news => this.renderCard(news, { compact: true })).join('');

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Render full news view
     */
    renderNewsView() {
        const container = document.getElementById('news-content');
        if (!container) return;

        const allNews = this.getAll();

        // Get unique categories
        const categories = [...new Set(allNews.map(n => n.category))];

        container.innerHTML = `
            <div class="news-filters">
                <div class="filter-pills">
                    <button class="filter-pill active" data-category="all">Todas</button>
                    ${categories.map(cat => `
                        <button class="filter-pill" data-category="${cat}">${cat}</button>
                    `).join('')}
                </div>
                <div class="news-search">
                    <i data-lucide="search"></i>
                    <input type="text" id="news-search-input" placeholder="Buscar noticias...">
                </div>
            </div>

            <div class="news-list" id="news-list">
                ${allNews.map(news => this.renderCard(news, { compact: false })).join('')}
            </div>

            <div class="news-footer">
                <p class="news-updated">
                    <i data-lucide="clock"></i>
                    Atualizado: ${this.lastUpdated ? this.formatDate(this.lastUpdated) : 'N/A'}
                </p>
                <a href="https://sorcerytcg.com/news" target="_blank" class="btn ghost">
                    <i data-lucide="external-link"></i>
                    Ver Todas no Site Oficial
                </a>
            </div>
        `;

        // Setup filters
        this.setupNewsFilters();

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Setup news filters and search
     */
    setupNewsFilters() {
        // Category filter pills
        const pills = document.querySelectorAll('.news-filters .filter-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const category = pill.dataset.category;
                this.filterNews(category);
            });
        });

        // Search input
        const searchInput = document.getElementById('news-search-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchNews(e.target.value);
                }, 300);
            });
        }
    }

    /**
     * Filter news by category
     */
    filterNews(category) {
        const container = document.getElementById('news-list');
        if (!container) return;

        const news = category === 'all' ? this.getAll() : this.getByCategory(category);
        container.innerHTML = news.map(n => this.renderCard(n, { compact: false })).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Search news
     */
    searchNews(query) {
        const container = document.getElementById('news-list');
        if (!container) return;

        // Reset category filter
        const pills = document.querySelectorAll('.news-filters .filter-pill');
        pills.forEach(p => p.classList.remove('active'));
        document.querySelector('.filter-pill[data-category="all"]')?.classList.add('active');

        const news = query.trim() ? this.search(query) : this.getAll();
        container.innerHTML = news.length > 0
            ? news.map(n => this.renderCard(n, { compact: false })).join('')
            : '<p class="empty-state">Nenhuma noticia encontrada</p>';

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Open news detail modal
     */
    openNewsDetail(newsId) {
        const news = this.news.find(n => n.id === newsId);
        if (!news) return;

        // For now, just navigate to news view
        // In the future, could open a modal
        switchView('news');
    }
}

// ============================================
// INITIALIZE
// ============================================

const newsService = new NewsService();

// Load news on page load
document.addEventListener('DOMContentLoaded', async () => {
    await newsService.loadNews();
    newsService.renderLandingNews();
});

// Export for use in other modules
window.newsService = newsService;

console.log('[News] Service loaded');
