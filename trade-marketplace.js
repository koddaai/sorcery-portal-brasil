// ============================================
// SORCERY TRADE MARKETPLACE
// Public trade listings for community trading
// ============================================

class TradeMarketplace {
    constructor() {
        this.listings = [];
        this.userCache = new Map(); // Cache user info to reduce API calls
        this.filters = {
            type: '', // 'offering' or 'looking_for'
            cardName: '',
            set: '',
            condition: ''
        };
        this.pagination = {
            page: 0,
            perPage: 20
        };
    }

    // ==========================================
    // LOAD & DISPLAY
    // ==========================================

    async loadListings() {
        try {
            showContainerLoading('marketplace-content');
            this.listings = await nocoDBService.getTradeListings(this.filters);

            // Load user info for each unique user
            const userIds = [...new Set(this.listings.map(l => l.user_id))];
            await this.loadUserInfo(userIds);

            this.renderListings();
            hideContainerLoading('marketplace-content');
        } catch (error) {
            console.error('Error loading marketplace:', error);
            showToast('Erro ao carregar marketplace', 'error');
            hideContainerLoading('marketplace-content');
        }
    }

    async loadUserInfo(userIds) {
        for (const userId of userIds) {
            if (!this.userCache.has(userId)) {
                const user = await nocoDBService.getUserById(userId);
                if (user) {
                    // Also get reputation
                    const rep = await nocoDBService.getUserReputation(userId);
                    user.reputation = rep;
                    this.userCache.set(userId, user);
                }
            }
        }
    }

    renderListings() {
        const container = document.getElementById('marketplace-grid');
        if (!container) return;

        if (this.listings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="package-open"></i>
                    <h3>Nenhuma oferta encontrada</h3>
                    <p>Seja o primeiro a publicar uma oferta!</p>
                </div>
            `;
            refreshIcons(container);
            return;
        }

        // Detect matches (user offering what I want, or wanting what I offer)
        const matches = this.detectMatches();

        container.innerHTML = this.listings.map(listing => {
            const user = this.userCache.get(listing.user_id) || { displayName: 'Usuário', avatarId: 1 };
            const isMatch = matches.has(listing.Id);
            const badge = getReputationBadge(user.reputation?.score || 0);

            return `
                <div class="marketplace-card ${isMatch ? 'is-match' : ''}" data-listing-id="${listing.Id}">
                    ${isMatch ? '<div class="match-badge"><i data-lucide="sparkles"></i> Match!</div>' : ''}
                    <div class="listing-header">
                        <div class="listing-user">
                            ${renderAvatar(user.avatarId, 'small')}
                            <span class="listing-username">${escapeHtml(user.displayName)}</span>
                            <span class="reputation-badge reputation-${badge.class}" title="${user.reputation?.positives || 0} positivos, ${user.reputation?.negatives || 0} negativos">
                                <i data-lucide="${badge.icon}"></i>
                            </span>
                        </div>
                        <span class="listing-type listing-type-${listing.listing_type}">
                            ${listing.listing_type === 'offering' ? 'Oferecendo' : 'Procurando'}
                        </span>
                    </div>
                    <div class="listing-card-info">
                        <h4>${escapeHtml(listing.card_name)}</h4>
                        ${listing.card_set ? `<span class="listing-set">${escapeHtml(listing.card_set)}</span>` : ''}
                        <span class="listing-condition">${listing.card_condition}</span>
                    </div>
                    ${listing.notes ? `<p class="listing-notes">${escapeHtml(listing.notes)}</p>` : ''}
                    <div class="listing-footer">
                        <span class="listing-date">${formatRelativeDate(listing.created_at)}</span>
                        <button class="btn btn-primary btn-sm" onclick="tradeMarketplace.contactUser(${listing.user_id}, '${escapeHtml(listing.card_name)}')">
                            <i data-lucide="message-circle"></i>
                            Contato
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        refreshIcons(container);
    }

    // ==========================================
    // MATCH DETECTION
    // ==========================================

    detectMatches() {
        const matches = new Set();
        const currentUser = nocoDBService.getCurrentUser();
        if (!currentUser) return matches;

        // Get current user's trade wants and offerings
        const myOffers = new Set(tradeBinder); // Cards I'm offering
        const myWants = new Set(tradeWants);   // Cards I want

        for (const listing of this.listings) {
            if (listing.user_id === currentUser.id) continue; // Skip own listings

            if (listing.listing_type === 'offering' && myWants.has(listing.card_name)) {
                // Someone is offering what I want
                matches.add(listing.Id);
            } else if (listing.listing_type === 'looking_for' && myOffers.has(listing.card_name)) {
                // Someone wants what I have
                matches.add(listing.Id);
            }
        }

        return matches;
    }

    // ==========================================
    // FILTERS
    // ==========================================

    setFilter(key, value) {
        this.filters[key] = value;
        this.loadListings();
    }

    clearFilters() {
        this.filters = { type: '', cardName: '', set: '', condition: '' };
        document.getElementById('marketplace-search')?.value && (document.getElementById('marketplace-search').value = '');
        document.getElementById('marketplace-type-filter')?.value && (document.getElementById('marketplace-type-filter').value = '');
        this.loadListings();
    }

    // ==========================================
    // CREATE LISTING
    // ==========================================

    async publishListing(cardName, type, condition = 'NM', notes = '') {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para publicar ofertas', 'error');
            return false;
        }

        try {
            // Check if user has accepted terms
            const user = nocoDBService.getCurrentUser();
            if (!user.termsAccepted) {
                showTermsModal(() => this.publishListing(cardName, type, condition, notes));
                return false;
            }

            const card = allCards.find(c => c.name === cardName);
            const cardSet = card?.set || '';

            await nocoDBService.createTradeListing({
                cardName,
                type,
                cardSet,
                condition,
                notes
            });

            showToast('Oferta publicada!', 'success');
            await this.loadListings();
            return true;
        } catch (error) {
            console.error('Error publishing listing:', error);
            showToast('Erro ao publicar oferta', 'error');
            return false;
        }
    }

    async deactivateListing(listingId) {
        try {
            await nocoDBService.deactivateTradeListing(listingId);
            showToast('Oferta removida', 'success');
            await this.loadListings();
        } catch (error) {
            console.error('Error deactivating listing:', error);
            showToast('Erro ao remover oferta', 'error');
        }
    }

    // ==========================================
    // BULK PUBLISH FROM TRADE BINDER
    // ==========================================

    async publishFromTradeBinder() {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para publicar', 'error');
            return;
        }

        const toPublish = Array.from(tradeBinder);
        if (toPublish.length === 0) {
            showToast('Adicione cartas ao Trade Binder primeiro', 'warning');
            return;
        }

        // Get existing listings to avoid duplicates
        const existingListings = await nocoDBService.getUserTradeListings(nocoDBService.getCurrentUser().id);
        const existingCards = new Set(existingListings.filter(l => l.listing_type === 'offering' && l.is_active).map(l => l.card_name));

        const newCards = toPublish.filter(card => !existingCards.has(card));

        if (newCards.length === 0) {
            showToast('Todas as cartas já estão publicadas', 'info');
            return;
        }

        const confirmPublish = await showConfirmDialog(
            `Publicar ${newCards.length} cartas`,
            `Deseja publicar ${newCards.length} cartas do seu Trade Binder no marketplace público?`
        );

        if (!confirmPublish) return;

        let published = 0;
        for (const cardName of newCards) {
            try {
                await this.publishListing(cardName, 'offering');
                published++;
            } catch (e) {
                // Continue on error
            }
        }

        showToast(`${published} ofertas publicadas!`, 'success');
        await this.loadListings();
    }

    async publishFromWants() {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para publicar', 'error');
            return;
        }

        const toPublish = Array.from(tradeWants);
        if (toPublish.length === 0) {
            showToast('Adicione cartas aos "Procurando" primeiro', 'warning');
            return;
        }

        // Get existing listings
        const existingListings = await nocoDBService.getUserTradeListings(nocoDBService.getCurrentUser().id);
        const existingCards = new Set(existingListings.filter(l => l.listing_type === 'looking_for' && l.is_active).map(l => l.card_name));

        const newCards = toPublish.filter(card => !existingCards.has(card));

        if (newCards.length === 0) {
            showToast('Todas as cartas já estão publicadas', 'info');
            return;
        }

        const confirmPublish = await showConfirmDialog(
            `Publicar ${newCards.length} cartas`,
            `Deseja publicar ${newCards.length} cartas que você está procurando no marketplace público?`
        );

        if (!confirmPublish) return;

        let published = 0;
        for (const cardName of newCards) {
            try {
                await this.publishListing(cardName, 'looking_for');
                published++;
            } catch (e) {
                // Continue on error
            }
        }

        showToast(`${published} procuras publicadas!`, 'success');
        await this.loadListings();
    }

    // ==========================================
    // CONTACT USER
    // ==========================================

    contactUser(userId, cardName) {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para entrar em contato', 'error');
            return;
        }

        if (userId === nocoDBService.getCurrentUser().id) {
            showToast('Esta é sua própria oferta', 'info');
            return;
        }

        // Open compose message modal with pre-filled subject
        openComposeMessage(userId, `Interesse em: ${cardName}`);
    }

    // ==========================================
    // USER'S OWN LISTINGS
    // ==========================================

    async loadMyListings() {
        if (!nocoDBService.isLoggedIn()) return [];

        try {
            return await nocoDBService.getUserTradeListings(nocoDBService.getCurrentUser().id);
        } catch (error) {
            console.error('Error loading my listings:', error);
            return [];
        }
    }

    async renderMyListings() {
        const container = document.getElementById('my-listings-grid');
        if (!container) return;

        const myListings = await this.loadMyListings();

        if (myListings.length === 0) {
            container.innerHTML = `
                <div class="empty-state empty-state-sm">
                    <p>Você não tem ofertas publicadas</p>
                </div>
            `;
            return;
        }

        container.innerHTML = myListings.map(listing => `
            <div class="my-listing-item ${listing.is_active ? '' : 'inactive'}">
                <span class="listing-type listing-type-${listing.listing_type}">
                    ${listing.listing_type === 'offering' ? 'Oferta' : 'Procura'}
                </span>
                <span class="listing-card">${escapeHtml(listing.card_name)}</span>
                <span class="listing-condition">${listing.card_condition}</span>
                ${listing.is_active ? `
                    <button class="btn btn-ghost btn-xs" onclick="tradeMarketplace.deactivateListing(${listing.Id})" title="Remover">
                        <i data-lucide="x"></i>
                    </button>
                ` : '<span class="inactive-label">Inativa</span>'}
            </div>
        `).join('');

        refreshIcons(container);
    }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getReputationBadge(score) {
    if (score >= 50) return { class: 'legendary', icon: 'crown', name: 'Lendário' };
    if (score >= 25) return { class: 'veteran', icon: 'star', name: 'Veterano' };
    if (score >= 10) return { class: 'experienced', icon: 'shield-check', name: 'Experiente' };
    if (score >= 5) return { class: 'trusted', icon: 'shield', name: 'Confiável' };
    if (score >= 1) return { class: 'beginner', icon: 'award', name: 'Iniciante' };
    return { class: 'newbie', icon: 'user', name: 'Novato' };
}

function formatRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function showConfirmDialog(title, message) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal confirm-modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); window._confirmResolve(false);">Cancelar</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); window._confirmResolve(true);">Confirmar</button>
                </div>
            </div>
        `;
        window._confirmResolve = resolve;
        document.body.appendChild(modal);
    });
}

// ==========================================
// INITIALIZE
// ==========================================

const tradeMarketplace = new TradeMarketplace();

// Setup filters when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Search filter
    const searchInput = document.getElementById('marketplace-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            tradeMarketplace.setFilter('cardName', e.target.value);
        }, 300));
    }

    // Type filter
    const typeFilter = document.getElementById('marketplace-type-filter');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            tradeMarketplace.setFilter('type', e.target.value);
        });
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TradeMarketplace, tradeMarketplace, getReputationBadge };
}
