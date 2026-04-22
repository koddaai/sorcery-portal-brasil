// ============================================
// SORCERY PORTAL BRASIL - ARTICLES SERVICE
// Dynamic articles loading and display
// ============================================

class ArticlesService {
    constructor() {
        this.articles = [];
        this.lastUpdated = null;
        this.loaded = false;
    }

    /**
     * Load articles from database
     */
    async loadArticles() {
        if (this.loaded) return this.articles;

        try {
            const response = await fetch('./articles-database.json');
            if (!response.ok) throw new Error('Failed to load articles');

            const data = await response.json();
            this.articles = data.articles || [];
            this.lastUpdated = data.lastUpdated;
            this.loaded = true;

            console.log(`[Articles] Loaded ${this.articles.length} articles`);
            return this.articles;
        } catch (error) {
            console.error('[Articles] Error loading articles:', error);
            return [];
        }
    }

    /**
     * Get latest N articles
     */
    getLatest(count = 3) {
        return this.articles.slice(0, count);
    }

    /**
     * Get all articles
     */
    getAll() {
        return this.articles;
    }

    /**
     * Get articles by category
     */
    getByCategory(category) {
        return this.articles.filter(a =>
            a.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Search articles
     */
    search(query) {
        const q = query.toLowerCase();
        return this.articles.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            a.tags.some(t => t.toLowerCase().includes(q))
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
            'guia': 'book-open',
            'guide': 'book-open',
            'mecanica': 'cog',
            'mecânica': 'cog',
            'ruling': 'scale',
            'faq': 'help-circle',
            'referencia': 'bookmark',
            'referência': 'bookmark',
            'comunidade': 'users',
            'lore': 'scroll',
            'deck': 'layers',
            'deck tech': 'layers',
            'meta': 'trending-up',
            'ferramentas': 'wrench'
        };
        return icons[category.toLowerCase()] || 'file-text';
    }

    /**
     * Get category color class
     */
    getCategoryClass(category) {
        const classes = {
            'guia': 'badge-guia',
            'guide': 'badge-guia',
            'mecanica': 'badge-mecanica',
            'mecânica': 'badge-mecanica',
            'ruling': 'badge-ruling',
            'faq': 'badge-faq',
            'referencia': 'badge-referencia',
            'referência': 'badge-referencia',
            'comunidade': 'badge-comunidade',
            'lore': 'badge-lore',
            'deck': 'badge-deck',
            'deck tech': 'badge-deck',
            'meta': 'badge-meta',
            'ferramentas': 'badge-ferramenta'
        };
        return classes[category.toLowerCase()] || 'badge-article';
    }

    /**
     * Render article card HTML (uses news-card classes for consistent styling)
     */
    renderCard(article, options = {}) {
        const { compact = false } = options;
        const icon = this.getCategoryIcon(article.category);
        const badgeClass = this.getCategoryClass(article.category);

        // Compact card for landing page - uses news-card classes
        if (compact) {
            return `
                <a href="#" onclick="articlesService.openArticle('${article.slug}'); return false;" class="news-card news-card-compact">
                    ${article.image ? `
                        <div class="news-card-image">
                            <img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.parentElement.classList.add('no-image')">
                        </div>
                    ` : `
                        <div class="news-card-image no-image">
                            <i data-lucide="${icon}"></i>
                        </div>
                    `}
                    <div class="news-card-body">
                        <div class="news-badge ${badgeClass}">${article.category}</div>
                        <h4>${article.title}</h4>
                        <p>${article.summary}</p>
                    </div>
                </a>
            `;
        }

        // Full card for articles view
        return `
            <article class="news-card-full">
                ${article.image ? `
                    <div class="news-image">
                        <img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.style.display='none'">
                    </div>
                ` : `
                    <div class="news-image-placeholder">
                        <i data-lucide="${icon}"></i>
                    </div>
                `}
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-badge ${badgeClass}">
                            ${article.category}
                        </span>
                        <span class="news-date">
                            <i data-lucide="calendar"></i>
                            ${this.formatDate(article.date)}
                        </span>
                    </div>
                    <h3>${article.title}</h3>
                    <p class="news-summary">${article.summary}</p>
                    <div class="news-actions">
                        <button onclick="articlesService.openArticle('${article.slug}')" class="btn primary btn-sm">
                            <i data-lucide="book-open"></i>
                            Ler Artigo
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Render articles grid for landing page
     */
    renderLandingArticles() {
        const container = document.getElementById('landing-articles-grid');
        if (!container) return;

        const latest = this.getLatest(3);

        if (latest.length === 0) {
            container.innerHTML = `
                <div class="news-loading">
                    <i data-lucide="file-text"></i>
                    <span>Nenhum artigo disponível</span>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        container.innerHTML = latest.map(article =>
            this.renderCard(article, { compact: true })
        ).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /**
     * Render full articles view
     */
    renderArticlesView(filter = null) {
        const container = document.getElementById('articles-grid');
        if (!container) return;

        let articles = filter ? this.getByCategory(filter) : this.getAll();

        if (articles.length === 0) {
            container.innerHTML = `
                <div class="articles-empty-state">
                    <i data-lucide="file-text"></i>
                    <h3>Nenhum artigo encontrado</h3>
                    <p>Não há artigos ${filter ? `na categoria "${filter}"` : 'disponíveis'} no momento.</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        container.innerHTML = articles.map(article =>
            this.renderCard(article, { compact: false })
        ).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /**
     * Open article (placeholder - can be expanded to show modal or navigate)
     */
    openArticle(slug) {
        const article = this.articles.find(a => a.slug === slug);
        if (!article) {
            console.error('[Articles] Article not found:', slug);
            return;
        }

        // For now, show a simple alert or could open a modal
        // In the future, this could navigate to a full article page
        console.log('[Articles] Opening article:', article.title);

        // Show article modal if exists
        if (typeof showArticleModal === 'function') {
            showArticleModal(article);
        } else {
            // Fallback: switch to articles view and scroll to it
            if (typeof switchView === 'function') {
                switchView('articles');
            }
        }
    }

    /**
     * Get unique categories
     */
    getCategories() {
        const categories = new Set(this.articles.map(a => a.category));
        return Array.from(categories).sort();
    }
}

// Create global instance
const articlesService = new ArticlesService();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    await articlesService.loadArticles();
    articlesService.renderLandingArticles();
});
