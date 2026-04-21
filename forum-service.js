// ============================================
// SORCERY FORUM SERVICE
// Community forum with categories - Restructured
// ============================================

const FORUM_CATEGORIES = {
    duvidas: { name: 'Dúvidas sobre Cartas', icon: 'help-circle', description: 'Perguntas sobre mecânicas, regras e interações de cartas', color: '#3b82f6' },
    classificados: { name: 'Classificados', icon: 'tag', description: 'Anúncios de compra, venda e troca P2P', color: '#22c55e' },
    promocoes: { name: 'Promoções', icon: 'percent', description: 'Ofertas, cupons e promoções de lojas', color: '#ef4444' },
    dicas: { name: 'Dicas & Estratégias', icon: 'lightbulb', description: 'Estratégias, combos e dicas de jogo', color: '#f59e0b' },
    eventos: { name: 'Eventos', icon: 'calendar', description: 'Torneios, encontros e eventos', color: '#a855f7' },
    geral: { name: 'Geral', icon: 'message-circle', description: 'Discussões gerais sobre Sorcery', color: '#9ca3af' }
};

class ForumService {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.currentCategory = null;
        this.comments = [];
        this.userCache = new Map();
        this.categoryStats = {};
        this.filters = {
            sort: 'recent'
        };
        this.pagination = {
            offset: 0,
            limit: 20,
            hasMore: true
        };
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async init() {
        await this.loadCategoryStats();
        this.showCategoriesHome();
    }

    // ==========================================
    // VIEW NAVIGATION
    // ==========================================

    showCategoriesHome() {
        this.currentCategory = null;

        document.getElementById('forum-categories-view')?.classList.remove('hidden');
        document.getElementById('forum-category-view')?.classList.add('hidden');
        document.getElementById('forum-topic-view')?.classList.add('hidden');

        this.renderCategoriesGrid();
        this.loadRecentPosts();
    }

    async showCategory(categoryKey) {
        this.currentCategory = categoryKey;
        this.pagination.offset = 0;

        document.getElementById('forum-categories-view')?.classList.add('hidden');
        document.getElementById('forum-category-view')?.classList.remove('hidden');
        document.getElementById('forum-topic-view')?.classList.add('hidden');

        const cat = FORUM_CATEGORIES[categoryKey];
        if (cat) {
            const iconEl = document.getElementById('forum-category-icon');
            const nameEl = document.getElementById('forum-category-name');
            const descEl = document.getElementById('forum-category-description');

            if (iconEl) iconEl.setAttribute('data-lucide', cat.icon);
            if (nameEl) nameEl.textContent = cat.name;
            if (descEl) descEl.textContent = cat.description;

            // Update new topic button visibility
            const newTopicBtn = document.getElementById('forum-new-topic-btn');
            if (newTopicBtn) {
                newTopicBtn.style.display = nocoDBService.isLoggedIn() ? 'flex' : 'none';
            }
        }

        refreshIcons();
        await this.loadCategoryTopics();
    }

    async showTopic(postId) {
        document.getElementById('forum-categories-view')?.classList.add('hidden');
        document.getElementById('forum-category-view')?.classList.add('hidden');
        document.getElementById('forum-topic-view')?.classList.remove('hidden');

        await this.loadTopicDetail(postId);
    }

    // ==========================================
    // LOAD DATA
    // ==========================================

    async loadCategoryStats() {
        try {
            for (const key of Object.keys(FORUM_CATEGORIES)) {
                const posts = await nocoDBService.getForumPosts({ category: key, limit: 100 });
                this.categoryStats[key] = {
                    topicCount: posts.length,
                    lastPost: posts[0] || null
                };
            }
        } catch (error) {
            console.error('Error loading category stats:', error);
        }
    }

    async loadRecentPosts() {
        try {
            const container = document.getElementById('forum-recent-posts');
            if (!container) return;

            const posts = await nocoDBService.getForumPosts({ sort: 'recent', limit: 5 });

            if (posts.length === 0) {
                container.innerHTML = '<p class="text-muted">Nenhuma atividade recente</p>';
                return;
            }

            const userIds = [...new Set(posts.map(p => p.user_id))];
            await this.loadUserInfo(userIds);

            container.innerHTML = posts.map(post => {
                const user = this.userCache.get(post.user_id) || { displayName: 'Usuário' };
                return `
                    <div class="forum-recent-item" onclick="forumService.showTopic(${post.Id})">
                        <div class="forum-recent-item-category cat-${post.category}"></div>
                        <div class="forum-recent-item-content">
                            <div class="forum-recent-item-title">${escapeHtml(post.Title || post.title)}</div>
                            <div class="forum-recent-item-meta">
                                ${escapeHtml(user.displayName)} · ${formatRelativeDate(post.CreatedAt)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }

    async loadCategoryTopics() {
        try {
            const container = document.getElementById('forum-topics-list');
            if (!container) return;

            showContainerLoading('forum-topics-list');

            const posts = await nocoDBService.getForumPosts({
                category: this.currentCategory,
                sort: this.filters.sort,
                offset: this.pagination.offset,
                limit: this.pagination.limit
            });

            // Get comment counts
            for (const post of posts) {
                const comments = await nocoDBService.getForumComments(post.Id);
                post.commentCount = comments.length;
            }

            this.posts = posts;
            this.pagination.hasMore = posts.length === this.pagination.limit;

            const userIds = [...new Set(posts.map(p => p.user_id))];
            await this.loadUserInfo(userIds);

            this.renderTopicsList();
            hideContainerLoading('forum-topics-list');

        } catch (error) {
            console.error('Error loading category topics:', error);
            showToast('Erro ao carregar tópicos', 'error');
            hideContainerLoading('forum-topics-list');
        }
    }

    async loadTopicDetail(postId) {
        try {
            const container = document.getElementById('forum-topic-view');
            if (!container) return;

            showContainerLoading('forum-topic-view');

            this.currentPost = await nocoDBService.getForumPost(postId);
            if (!this.currentPost) {
                showToast('Tópico não encontrado', 'error');
                this.showCategoriesHome();
                return;
            }

            this.comments = await nocoDBService.getForumComments(postId);

            const userIds = [this.currentPost.user_id, ...this.comments.map(c => c.user_id)];
            await this.loadUserInfo([...new Set(userIds)]);

            // Increment views
            nocoDBService.incrementPostViews(postId, this.currentPost.view_count);

            this.renderTopicDetail();
            hideContainerLoading('forum-topic-view');

        } catch (error) {
            console.error('Error loading topic:', error);
            showToast('Erro ao carregar tópico', 'error');
            hideContainerLoading('forum-topic-view');
        }
    }

    async loadUserInfo(userIds) {
        for (const userId of userIds) {
            if (!this.userCache.has(userId)) {
                const user = await nocoDBService.getUserById(userId);
                if (user) {
                    const rep = await nocoDBService.getUserReputation(userId);
                    user.reputation = rep;
                    this.userCache.set(userId, user);
                }
            }
        }
    }

    // ==========================================
    // RENDER METHODS
    // ==========================================

    renderCategoriesGrid() {
        const container = document.getElementById('forum-categories-grid');
        if (!container) return;

        container.innerHTML = Object.entries(FORUM_CATEGORIES).map(([key, cat]) => {
            const stats = this.categoryStats[key] || { topicCount: 0 };
            return `
                <div class="forum-category-card" onclick="forumService.showCategory('${key}')">
                    <div class="forum-category-card-header">
                        <div class="forum-category-card-icon cat-${key}">
                            <i data-lucide="${cat.icon}"></i>
                        </div>
                        <div class="forum-category-card-title">${cat.name}</div>
                    </div>
                    <div class="forum-category-card-description">${cat.description}</div>
                    <div class="forum-category-card-stats">
                        <span><i data-lucide="message-square"></i> ${stats.topicCount} tópicos</span>
                    </div>
                </div>
            `;
        }).join('');

        refreshIcons();
    }

    renderTopicsList() {
        const container = document.getElementById('forum-topics-list');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="message-square-plus"></i>
                    <h3>Nenhum tópico nesta categoria</h3>
                    <p>Seja o primeiro a criar um tópico!</p>
                    ${nocoDBService.isLoggedIn() ? `
                        <button class="btn btn-primary" onclick="forumService.openCreatePostModal()">
                            <i data-lucide="plus"></i>
                            Criar Tópico
                        </button>
                    ` : ''}
                </div>
            `;
            refreshIcons();
            return;
        }

        // Separate pinned posts
        const pinnedPosts = this.posts.filter(p => p.is_pinned);
        const normalPosts = this.posts.filter(p => !p.is_pinned);

        let html = '';

        if (pinnedPosts.length > 0) {
            html += '<div class="pinned-posts-section"><h4><i data-lucide="pin"></i> Fixados</h4>';
            html += pinnedPosts.map(post => this.renderTopicCard(post, true)).join('');
            html += '</div>';
        }

        html += normalPosts.map(post => this.renderTopicCard(post, false)).join('');

        if (this.pagination.hasMore) {
            html += `
                <button class="btn btn-secondary load-more-btn" onclick="forumService.loadMore()">
                    <i data-lucide="chevrons-down"></i>
                    Carregar mais
                </button>
            `;
        }

        container.innerHTML = html;
        refreshIcons();
    }

    renderTopicCard(post, isPinned) {
        const user = this.userCache.get(post.user_id) || { displayName: 'Usuário', avatarId: 1 };
        const badge = getReputationBadge(user.reputation?.score || 0);
        const title = post.Title || post.title || 'Sem título';

        return `
            <div class="forum-post-card ${isPinned ? 'pinned' : ''} ${post.is_locked ? 'locked' : ''}" onclick="forumService.showTopic(${post.Id})">
                <div class="post-card-left">
                    ${renderAvatar(user.avatarId, 'medium')}
                </div>
                <div class="post-card-content">
                    <div class="post-card-header">
                        ${post.is_locked ? '<span class="post-locked"><i data-lucide="lock"></i></span>' : ''}
                    </div>
                    <h4 class="post-title">${escapeHtml(title)}</h4>
                    <p class="post-preview">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
                    <div class="post-card-footer">
                        <span class="post-author">
                            ${escapeHtml(user.displayName)}
                            <span class="reputation-badge reputation-${badge.class}" title="${badge.name}">
                                <i data-lucide="${badge.icon}"></i>
                            </span>
                        </span>
                        <span class="post-meta">
                            <span class="post-date">${formatRelativeDate(post.CreatedAt)}</span>
                            <span class="post-stats">
                                <i data-lucide="eye"></i> ${post.view_count || 0}
                                <i data-lucide="message-circle"></i> ${post.commentCount || 0}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTopicDetail() {
        const container = document.getElementById('forum-topic-view');
        if (!container || !this.currentPost) return;

        const post = this.currentPost;
        const user = this.userCache.get(post.user_id) || { displayName: 'Usuário', avatarId: 1 };
        const cat = FORUM_CATEGORIES[post.category] || FORUM_CATEGORIES.geral;
        const badge = getReputationBadge(user.reputation?.score || 0);
        const title = post.Title || post.title || 'Sem título';

        // Check if current user is the author (compare as strings to avoid type mismatch)
        const currentUser = nocoDBService.getCurrentUser();
        const isAuthor = currentUser && String(currentUser.id) === String(post.user_id);

        container.innerHTML = `
            <div class="forum-post-full">
                <div class="post-header">
                    <button class="btn btn-ghost" onclick="forumService.backFromTopic()">
                        <i data-lucide="arrow-left"></i>
                        Voltar para ${cat.name}
                    </button>
                    <div class="post-header-right">
                        <span class="post-category post-category-${post.category}">
                            <i data-lucide="${cat.icon}"></i>
                            ${cat.name}
                        </span>
                        ${isAuthor ? `
                            <button class="btn btn-ghost btn-danger-text" onclick="forumService.confirmDeletePost(${post.Id})" title="Excluir tópico">
                                <i data-lucide="trash-2"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <h2 class="post-full-title">${escapeHtml(title)}</h2>

                <div class="post-author-info">
                    ${renderAvatar(user.avatarId, 'medium')}
                    <div class="author-details">
                        <span class="author-name">
                            ${escapeHtml(user.displayName)}
                            <span class="reputation-badge reputation-${badge.class}">
                                <i data-lucide="${badge.icon}"></i>
                                ${badge.name}
                            </span>
                        </span>
                        <span class="post-date">${new Date(post.CreatedAt).toLocaleString('pt-BR')}</span>
                    </div>
                </div>

                <div class="post-full-content">
                    ${escapeHtml(post.content).replace(/\n/g, '<br>')}
                </div>

                <div class="post-stats-bar">
                    <span><i data-lucide="eye"></i> ${post.view_count || 0} visualizações</span>
                    <span><i data-lucide="message-circle"></i> ${this.comments.length} comentários</span>
                </div>
            </div>

            <div class="comments-section">
                <h3>Comentários</h3>

                ${!post.is_locked && nocoDBService.isLoggedIn() ? `
                    <div class="comment-form">
                        <textarea id="comment-content" placeholder="Escreva um comentário..." class="textarea" maxlength="2000"></textarea>
                        <button class="btn btn-primary" onclick="forumService.addComment()">
                            <i data-lucide="send"></i>
                            Enviar
                        </button>
                    </div>
                ` : post.is_locked ? `
                    <div class="locked-notice">
                        <i data-lucide="lock"></i>
                        Este tópico está fechado para novos comentários
                    </div>
                ` : `
                    <div class="login-notice">
                        <a href="#" onclick="openLoginModal(); return false;">Faça login</a> para comentar
                    </div>
                `}

                <div class="comments-list">
                    ${this.comments.length === 0 ? `
                        <p class="no-comments">Nenhum comentário ainda. Seja o primeiro!</p>
                    ` : this.comments.map(comment => this.renderComment(comment)).join('')}
                </div>
            </div>
        `;

        refreshIcons();
    }

    renderComment(comment) {
        const user = this.userCache.get(comment.user_id) || { displayName: 'Usuário', avatarId: 1 };
        const badge = getReputationBadge(user.reputation?.score || 0);

        return `
            <div class="comment-item">
                <div class="comment-avatar">
                    ${renderAvatar(user.avatarId, 'small')}
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">
                            ${escapeHtml(user.displayName)}
                            <span class="reputation-badge reputation-${badge.class}">
                                <i data-lucide="${badge.icon}"></i>
                            </span>
                        </span>
                        <span class="comment-date">${formatRelativeDate(comment.CreatedAt)}</span>
                    </div>
                    <div class="comment-text">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // ACTIONS
    // ==========================================

    backFromTopic() {
        if (this.currentCategory) {
            this.showCategory(this.currentCategory);
        } else {
            this.showCategoriesHome();
        }
    }

    openCreatePostModal() {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para criar tópicos', 'error');
            return;
        }

        const currentUser = nocoDBService.getCurrentUser();
        if (!currentUser.termsAccepted) {
            showTermsModal(() => this.openCreatePostModal());
            return;
        }

        // Reset form
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';

        // Set category to current if in a category view
        const categorySelect = document.getElementById('post-category');
        if (categorySelect) {
            categorySelect.value = this.currentCategory || 'geral';
        }

        openModal('create-post-modal');
    }

    async createPost(event) {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const category = document.getElementById('post-category').value;

        if (!title || !content) {
            showToast('Preencha o título e conteúdo', 'error');
            return;
        }

        if (title.length > 100) {
            showToast('Título muito longo (máx. 100 caracteres)', 'error');
            return;
        }

        const submitBtn = event?.target || document.querySelector('#create-post-modal .btn-primary');

        try {
            if (submitBtn) setButtonLoading(submitBtn, true);

            await nocoDBService.createForumPost({
                title,
                content,
                category
            });

            showToast('Tópico criado!', 'success');
            closeModal('create-post-modal');

            // Refresh stats and show category
            await this.loadCategoryStats();
            this.showCategory(category);

            if (submitBtn) setButtonLoading(submitBtn, false);
        } catch (error) {
            console.error('Error creating post:', error);
            showToast('Erro ao criar tópico', 'error');
            if (submitBtn) setButtonLoading(submitBtn, false);
        }
    }

    async addComment() {
        if (!this.currentPost) return;

        const content = document.getElementById('comment-content').value.trim();
        if (!content) {
            showToast('Escreva um comentário', 'error');
            return;
        }

        try {
            await nocoDBService.createForumComment(this.currentPost.Id, content);

            this.comments = await nocoDBService.getForumComments(this.currentPost.Id);
            await this.loadUserInfo(this.comments.map(c => c.user_id));

            this.renderTopicDetail();
            document.getElementById('comment-content').value = '';
            showToast('Comentário enviado!', 'success');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Erro ao enviar comentário', 'error');
        }
    }

    confirmDeletePost(postId) {
        if (confirm('Tem certeza que deseja excluir este tópico?\n\nTodos os comentários também serão removidos. Esta ação não pode ser desfeita.')) {
            this.deletePost(postId);
        }
    }

    async deletePost(postId) {
        try {
            await nocoDBService.deleteForumPost(postId);
            showToast('Tópico excluído!', 'success');

            // Refresh stats and go back to category or home
            await this.loadCategoryStats();
            if (this.currentCategory) {
                this.showCategory(this.currentCategory);
            } else {
                this.showCategoriesHome();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showToast('Erro ao excluir tópico', 'error');
        }
    }

    setFilter(key, value) {
        this.filters[key] = value;
        if (this.currentCategory) {
            this.loadCategoryTopics();
        }
    }

    loadMore() {
        this.pagination.offset += this.pagination.limit;
        this.loadCategoryTopics();
    }

    async search(query) {
        if (!query || query.length < 2) {
            if (this.currentCategory) {
                this.loadCategoryTopics();
            }
            return;
        }

        // Filter current posts by search query
        await this.loadCategoryTopics();
        this.posts = this.posts.filter(post => {
            const title = (post.Title || post.title || '').toLowerCase();
            const content = (post.content || '').toLowerCase();
            return title.includes(query.toLowerCase()) || content.includes(query.toLowerCase());
        });
        this.renderTopicsList();
    }
}

// ==========================================
// GLOBAL INSTANCE & INITIALIZATION
// ==========================================

const forumService = new ForumService();

// Initialize when forum view is shown
function initForumView() {
    forumService.init();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('forum-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            forumService.search(e.target.value);
        }, 300));
    }

    const sortSelect = document.getElementById('forum-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            forumService.setFilter('sort', e.target.value);
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ForumService, forumService, FORUM_CATEGORIES, initForumView };
}
