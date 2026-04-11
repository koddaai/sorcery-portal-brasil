// ============================================
// SORCERY FORUM SERVICE
// Community forum with categories
// ============================================

const FORUM_CATEGORIES = {
    geral: { name: 'Geral', icon: 'message-circle', description: 'Discussões gerais sobre Sorcery' },
    dicas: { name: 'Dicas', icon: 'lightbulb', description: 'Estratégias, combos e dicas de jogo' },
    compra_venda: { name: 'Compra/Venda', icon: 'shopping-bag', description: 'Anúncios P2P de compra e venda' },
    eventos: { name: 'Eventos', icon: 'calendar', description: 'Torneios, encontros e eventos' },
    regras: { name: 'Regras', icon: 'book-open', description: 'Dúvidas sobre regras do jogo' }
};

class ForumService {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.comments = [];
        this.userCache = new Map();
        this.filters = {
            category: '',
            sort: 'recent' // 'recent', 'popular', 'comments'
        };
        this.pagination = {
            offset: 0,
            limit: 20,
            hasMore: true
        };
    }

    // ==========================================
    // LOAD POSTS
    // ==========================================

    async loadPosts(append = false) {
        try {
            if (!append) {
                this.pagination.offset = 0;
                showContainerLoading('forum-posts-list');
            }

            const posts = await nocoDBService.getForumPosts({
                category: this.filters.category,
                sort: this.filters.sort,
                offset: this.pagination.offset,
                limit: this.pagination.limit
            });

            // Get comment counts for each post
            for (const post of posts) {
                const comments = await nocoDBService.getForumComments(post.Id);
                post.commentCount = comments.length;
            }

            if (append) {
                this.posts = [...this.posts, ...posts];
            } else {
                this.posts = posts;
            }

            this.pagination.hasMore = posts.length === this.pagination.limit;

            // Load user info
            const userIds = [...new Set(this.posts.map(p => p.user_id))];
            await this.loadUserInfo(userIds);

            this.renderPosts();
            hideContainerLoading('forum-posts-list');
        } catch (error) {
            console.error('Error loading forum posts:', error);
            showToast('Erro ao carregar posts', 'error');
            hideContainerLoading('forum-posts-list');
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
    // RENDER POSTS LIST
    // ==========================================

    renderPosts() {
        const container = document.getElementById('forum-posts-list');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="message-square"></i>
                    <h3>Nenhum post encontrado</h3>
                    <p>Seja o primeiro a criar um tópico!</p>
                    ${nocoDBService.isLoggedIn() ? `
                        <button class="btn btn-primary" onclick="forumService.openCreatePostModal()">
                            <i data-lucide="plus"></i>
                            Criar Post
                        </button>
                    ` : ''}
                </div>
            `;
            refreshIcons(container);
            return;
        }

        const pinnedPosts = this.posts.filter(p => p.is_pinned);
        const regularPosts = this.posts.filter(p => !p.is_pinned);

        let html = '';

        // Pinned posts
        if (pinnedPosts.length > 0) {
            html += '<div class="pinned-posts-section"><h4><i data-lucide="pin"></i> Fixados</h4>';
            html += pinnedPosts.map(post => this.renderPostCard(post, true)).join('');
            html += '</div>';
        }

        // Regular posts
        html += regularPosts.map(post => this.renderPostCard(post, false)).join('');

        // Load more button
        if (this.pagination.hasMore) {
            html += `
                <button class="btn btn-secondary load-more-btn" onclick="forumService.loadMore()">
                    <i data-lucide="chevrons-down"></i>
                    Carregar mais
                </button>
            `;
        }

        container.innerHTML = html;
        refreshIcons(container);
    }

    renderPostCard(post, isPinned) {
        const user = this.userCache.get(post.user_id) || { displayName: 'Usuário', avatarId: 1 };
        const category = FORUM_CATEGORIES[post.category] || FORUM_CATEGORIES.geral;
        const badge = getReputationBadge(user.reputation?.score || 0);

        return `
            <div class="forum-post-card ${isPinned ? 'pinned' : ''} ${post.is_locked ? 'locked' : ''}" onclick="forumService.openPost(${post.Id})">
                <div class="post-card-left">
                    ${renderAvatar(user.avatarId, 'medium')}
                </div>
                <div class="post-card-content">
                    <div class="post-card-header">
                        <span class="post-category post-category-${post.category}">
                            <i data-lucide="${category.icon}"></i>
                            ${category.name}
                        </span>
                        ${post.is_locked ? '<span class="post-locked"><i data-lucide="lock"></i></span>' : ''}
                    </div>
                    <h4 class="post-title">${escapeHtml(post.title)}</h4>
                    <p class="post-preview">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
                    <div class="post-card-footer">
                        <span class="post-author">
                            ${escapeHtml(user.displayName)}
                            <span class="reputation-badge reputation-${badge.class}" title="${badge.name}">
                                <i data-lucide="${badge.icon}"></i>
                            </span>
                        </span>
                        <span class="post-meta">
                            <span class="post-date">${formatRelativeDate(post.created_at)}</span>
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

    // ==========================================
    // OPEN POST
    // ==========================================

    async openPost(postId) {
        try {
            showContainerLoading('forum-post-view');

            // Load post
            this.currentPost = await nocoDBService.getForumPost(postId);
            if (!this.currentPost) {
                showToast('Post não encontrado', 'error');
                return;
            }

            // Load comments
            this.comments = await nocoDBService.getForumComments(postId);

            // Load user info for post author and commenters
            const userIds = [this.currentPost.user_id, ...this.comments.map(c => c.user_id)];
            await this.loadUserInfo([...new Set(userIds)]);

            // Increment view count
            nocoDBService.incrementPostViews(postId, this.currentPost.view_count);

            // Switch to post view
            this.renderPostView();
            switchForumView('post');

            hideContainerLoading('forum-post-view');
        } catch (error) {
            console.error('Error opening post:', error);
            showToast('Erro ao abrir post', 'error');
            hideContainerLoading('forum-post-view');
        }
    }

    renderPostView() {
        const container = document.getElementById('forum-post-view');
        if (!container || !this.currentPost) return;

        const post = this.currentPost;
        const user = this.userCache.get(post.user_id) || { displayName: 'Usuário', avatarId: 1 };
        const category = FORUM_CATEGORIES[post.category] || FORUM_CATEGORIES.geral;
        const badge = getReputationBadge(user.reputation?.score || 0);

        container.innerHTML = `
            <div class="forum-post-full">
                <div class="post-header">
                    <button class="btn btn-ghost" onclick="switchForumView('list')">
                        <i data-lucide="arrow-left"></i>
                        Voltar
                    </button>
                    <span class="post-category post-category-${post.category}">
                        <i data-lucide="${category.icon}"></i>
                        ${category.name}
                    </span>
                </div>

                <h2 class="post-full-title">${escapeHtml(post.title)}</h2>

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
                        <span class="post-date">${new Date(post.created_at).toLocaleString('pt-BR')}</span>
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
                        <textarea id="comment-content" placeholder="Escreva um comentário..." maxlength="2000"></textarea>
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

            <div class="legal-disclaimer">
                <i data-lucide="alert-triangle"></i>
                <p>
                    <strong>Aviso:</strong> Este portal apenas conecta jogadores.
                    Transações ocorrem fora da plataforma sob responsabilidade
                    exclusiva das partes envolvidas.
                    <a href="#" onclick="showTermsModal(); return false;">Ver termos completos</a>
                </p>
            </div>
        `;

        refreshIcons(container);
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
                        <span class="comment-date">${formatRelativeDate(comment.created_at)}</span>
                    </div>
                    <div class="comment-text">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // CREATE POST
    // ==========================================

    openCreatePostModal() {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para criar posts', 'error');
            return;
        }

        // Check terms acceptance
        const user = nocoDBService.getCurrentUser();
        if (!user.acceptedTermsAt) {
            showTermsModal(() => this.openCreatePostModal());
            return;
        }

        // Reset form
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-category').value = 'geral';

        openModal('create-post-modal');
    }

    async createPost() {
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

        try {
            setButtonLoading(event.target, true);

            await nocoDBService.createForumPost({
                title,
                content,
                category
            });

            showToast('Post criado!', 'success');
            closeModal('create-post-modal');
            await this.loadPosts();

            setButtonLoading(event.target, false);
        } catch (error) {
            console.error('Error creating post:', error);
            showToast('Erro ao criar post', 'error');
            setButtonLoading(event.target, false);
        }
    }

    // ==========================================
    // ADD COMMENT
    // ==========================================

    async addComment() {
        if (!this.currentPost) return;

        const content = document.getElementById('comment-content').value.trim();
        if (!content) {
            showToast('Escreva um comentário', 'error');
            return;
        }

        try {
            await nocoDBService.createForumComment(this.currentPost.Id, content);

            // Reload comments
            this.comments = await nocoDBService.getForumComments(this.currentPost.Id);
            await this.loadUserInfo(this.comments.map(c => c.user_id));

            // Re-render
            this.renderPostView();
            document.getElementById('comment-content').value = '';

            showToast('Comentário enviado!', 'success');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Erro ao enviar comentário', 'error');
        }
    }

    // ==========================================
    // FILTERS
    // ==========================================

    setFilter(key, value) {
        this.filters[key] = value;
        this.loadPosts();
    }

    loadMore() {
        this.pagination.offset += this.pagination.limit;
        this.loadPosts(true);
    }

    // ==========================================
    // SEARCH
    // ==========================================

    async search(query) {
        if (!query || query.length < 2) {
            this.loadPosts();
            return;
        }

        // Simple client-side search (for now)
        // In production, implement server-side search
        await this.loadPosts();
        this.posts = this.posts.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.content.toLowerCase().includes(query.toLowerCase())
        );
        this.renderPosts();
    }
}

// ==========================================
// VIEW SWITCHING
// ==========================================

function switchForumView(view) {
    const listView = document.getElementById('forum-list-view');
    const postView = document.getElementById('forum-post-view');

    if (view === 'list') {
        listView?.classList.remove('hidden');
        postView?.classList.add('hidden');
    } else {
        listView?.classList.add('hidden');
        postView?.classList.remove('hidden');
    }
}

// ==========================================
// RENDER CATEGORIES SIDEBAR
// ==========================================

function renderForumCategories() {
    const container = document.getElementById('forum-categories');
    if (!container) return;

    let html = `
        <button class="category-btn ${!forumService.filters.category ? 'active' : ''}" onclick="forumService.setFilter('category', '')">
            <i data-lucide="layout-grid"></i>
            Todos
        </button>
    `;

    for (const [key, cat] of Object.entries(FORUM_CATEGORIES)) {
        html += `
            <button class="category-btn ${forumService.filters.category === key ? 'active' : ''}" onclick="forumService.setFilter('category', '${key}')">
                <i data-lucide="${cat.icon}"></i>
                ${cat.name}
            </button>
        `;
    }

    container.innerHTML = html;
    refreshIcons(container);
}

// ==========================================
// INITIALIZE
// ==========================================

const forumService = new ForumService();

// Setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Search
    const searchInput = document.getElementById('forum-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            forumService.search(e.target.value);
        }, 300));
    }

    // Sort
    const sortSelect = document.getElementById('forum-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            forumService.setFilter('sort', e.target.value);
        });
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ForumService, forumService, FORUM_CATEGORIES, switchForumView };
}
