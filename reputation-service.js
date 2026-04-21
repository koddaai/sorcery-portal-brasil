// ============================================
// SORCERY REPUTATION SERVICE
// Vote system with badges
// ============================================

const REPUTATION_BADGES = {
    legendary: { minScore: 50, name: 'Lendário', icon: 'crown', color: '#ffd700', glow: true },
    veteran: { minScore: 25, name: 'Veterano', icon: 'star', color: '#e5e4e2', glow: false },
    experienced: { minScore: 10, name: 'Experiente', icon: 'shield-check', color: '#daa520', glow: false },
    trusted: { minScore: 5, name: 'Confiável', icon: 'shield', color: '#c0c0c0', glow: false },
    beginner: { minScore: 1, name: 'Iniciante', icon: 'award', color: '#cd7f32', glow: false },
    newbie: { minScore: -Infinity, name: 'Novato', icon: 'user', color: '#6b7280', glow: false }
};

const VOTE_COOLDOWN_DAYS = 30;

class ReputationService {
    constructor() {
        this.cache = new Map(); // userId -> reputation data
        this.voteCooldowns = new Map(); // `${voterId}-${recipientId}` -> Date
    }

    // ==========================================
    // GET REPUTATION
    // ==========================================

    async getReputation(userId) {
        if (this.cache.has(userId)) {
            return this.cache.get(userId);
        }

        const rep = await nocoDBService.getUserReputation(userId);
        this.cache.set(userId, rep);
        return rep;
    }

    getBadge(score) {
        for (const [key, badge] of Object.entries(REPUTATION_BADGES)) {
            if (score >= badge.minScore) {
                return { ...badge, key };
            }
        }
        return { ...REPUTATION_BADGES.newbie, key: 'newbie' };
    }

    // ==========================================
    // VOTE
    // ==========================================

    async canVote(recipientId) {
        return await nocoDBService.canVoteFor(recipientId);
    }

    async vote(recipientId, voteType, reason = '', tradeReference = '') {
        if (!nocoDBService.isLoggedIn()) {
            throw new Error('Faça login para votar');
        }

        try {
            await nocoDBService.castVote(recipientId, voteType, reason, tradeReference);

            // Invalidate cache
            this.cache.delete(recipientId);

            return true;
        } catch (error) {
            throw error;
        }
    }

    // ==========================================
    // RENDER BADGE
    // ==========================================

    renderBadge(score, size = 'small') {
        const badge = this.getBadge(score);
        const sizeClass = size === 'large' ? 'reputation-badge-lg' : '';

        return `
            <span class="reputation-badge reputation-${badge.key} ${sizeClass}" ${badge.glow ? 'data-glow="true"' : ''}>
                <i data-lucide="${badge.icon}"></i>
                ${size === 'large' ? `<span>${badge.name}</span>` : ''}
            </span>
        `;
    }

    renderBadgeWithTooltip(reputation, size = 'small') {
        const badge = this.getBadge(reputation.score);
        const tooltipText = `${reputation.positives} positivos, ${reputation.negatives} negativos`;

        return `
            <span class="reputation-badge reputation-${badge.key} has-tooltip" title="${tooltipText}">
                <i data-lucide="${badge.icon}"></i>
                ${size === 'large' ? `<span>${badge.name}</span>` : ''}
            </span>
        `;
    }

    // ==========================================
    // VOTE MODAL
    // ==========================================

    async openVoteModal(userId, userName) {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para votar', 'error');
            return;
        }

        const canVoteResult = await this.canVote(userId);

        if (!canVoteResult.canVote) {
            if (canVoteResult.reason === 'self_vote') {
                showToast('Você não pode votar em si mesmo', 'error');
            } else if (canVoteResult.reason === 'cooldown') {
                showToast(`Aguarde ${canVoteResult.daysLeft} dias para votar novamente neste usuário`, 'warning');
            } else {
                showToast('Não é possível votar neste momento', 'error');
            }
            return;
        }

        // Store target user for the modal
        document.getElementById('vote-modal').dataset.userId = userId;
        document.getElementById('vote-target-name').textContent = userName;

        // Reset form
        document.getElementById('vote-reason').value = '';
        document.getElementById('vote-reference').value = '';
        document.querySelectorAll('.vote-type-btn').forEach(btn => btn.classList.remove('selected'));

        openModal('vote-modal');
    }

    async submitVote() {
        const userId = parseInt(document.getElementById('vote-modal').dataset.userId);
        const selectedType = document.querySelector('.vote-type-btn.selected')?.dataset.type;
        const reason = document.getElementById('vote-reason').value.trim();
        const reference = document.getElementById('vote-reference').value.trim();

        if (!selectedType) {
            showToast('Selecione Positivo ou Negativo', 'error');
            return;
        }

        try {
            setButtonLoading(event.target, true);
            await this.vote(userId, selectedType, reason, reference);
            showToast('Voto registrado!', 'success');
            closeModal('vote-modal');
            setButtonLoading(event.target, false);
        } catch (error) {
            showToast(error.message || 'Erro ao votar', 'error');
            setButtonLoading(event.target, false);
        }
    }

    // ==========================================
    // USER REPUTATION PAGE
    // ==========================================

    async renderUserReputation(userId) {
        const container = document.getElementById('user-reputation-view');
        if (!container) return;

        try {
            const user = await nocoDBService.getUserById(userId);
            if (!user) {
                container.innerHTML = '<p>Usuário não encontrado</p>';
                return;
            }

            const reputation = await this.getReputation(userId);
            const badge = this.getBadge(reputation.score);
            const isOwnProfile = nocoDBService.getCurrentUser()?.id === userId;

            // Get received votes if own profile
            let votes = [];
            if (isOwnProfile) {
                votes = await nocoDBService.getReceivedVotes(userId);
            }

            container.innerHTML = `
                <div class="reputation-profile">
                    <div class="reputation-header">
                        ${renderAvatar(user.avatarId, 'large')}
                        <div class="reputation-info">
                            <h2>${escapeHtml(user.displayName)}</h2>
                            <div class="reputation-badge-large reputation-${badge.key}" ${badge.glow ? 'data-glow="true"' : ''}>
                                <i data-lucide="${badge.icon}"></i>
                                <span>${badge.name}</span>
                            </div>
                        </div>
                    </div>

                    <div class="reputation-stats">
                        <div class="rep-stat rep-score">
                            <span class="rep-stat-value">${reputation.score}</span>
                            <span class="rep-stat-label">Score</span>
                        </div>
                        <div class="rep-stat rep-positive">
                            <span class="rep-stat-value">${reputation.positives}</span>
                            <span class="rep-stat-label">Positivos</span>
                        </div>
                        <div class="rep-stat rep-negative">
                            <span class="rep-stat-value">${reputation.negatives}</span>
                            <span class="rep-stat-label">Negativos</span>
                        </div>
                    </div>

                    ${!isOwnProfile ? `
                        <button class="btn btn-primary" onclick="reputationService.openVoteModal(${userId}, '${escapeHtml(user.displayName)}')">
                            <i data-lucide="thumbs-up"></i>
                            Dar Voto
                        </button>
                    ` : ''}

                    ${isOwnProfile && votes.length > 0 ? `
                        <div class="votes-history">
                            <h3>Histórico de Votos Recebidos</h3>
                            ${votes.map(vote => this.renderVoteItem(vote)).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            refreshIcons(container);
        } catch (error) {
            console.error('Error rendering reputation:', error);
            container.innerHTML = '<p>Erro ao carregar reputação</p>';
        }
    }

    renderVoteItem(vote) {
        const isPositive = vote.vote_type === 'positive';
        const date = new Date(vote.created_at).toLocaleDateString('pt-BR');

        return `
            <div class="vote-item vote-${vote.vote_type}">
                <span class="vote-icon">
                    <i data-lucide="${isPositive ? 'thumbs-up' : 'thumbs-down'}"></i>
                </span>
                <div class="vote-details">
                    <span class="vote-date">${date}</span>
                    ${vote.reason ? `<p class="vote-reason">${escapeHtml(vote.reason)}</p>` : ''}
                    ${vote.trade_reference ? `<p class="vote-reference">Ref: ${escapeHtml(vote.trade_reference)}</p>` : ''}
                </div>
            </div>
        `;
    }

    // ==========================================
    // BADGES LEGEND
    // ==========================================

    renderBadgesLegend() {
        let html = '<div class="badges-legend">';

        for (const [key, badge] of Object.entries(REPUTATION_BADGES)) {
            if (key === 'newbie' && badge.minScore === -Infinity) continue;

            html += `
                <div class="badge-legend-item">
                    <span class="reputation-badge reputation-${key}" ${badge.glow ? 'data-glow="true"' : ''}>
                        <i data-lucide="${badge.icon}"></i>
                    </span>
                    <span class="badge-name">${badge.name}</span>
                    <span class="badge-requirement">${badge.minScore}+ pontos</span>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }
}

// ==========================================
// GLOBAL HELPER
// ==========================================

function getReputationBadge(score) {
    return reputationService.getBadge(score);
}

// ==========================================
// INITIALIZE
// ==========================================

const reputationService = new ReputationService();

// Setup vote type selection
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.vote-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vote-type-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReputationService, reputationService, REPUTATION_BADGES, getReputationBadge };
}
