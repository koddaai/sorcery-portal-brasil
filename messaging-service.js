// ============================================
// SORCERY MESSAGING SERVICE
// Private inbox system for community
// ============================================

class MessagingService {
    constructor() {
        this.inbox = [];
        this.sent = [];
        this.unreadCount = 0;
        this.userCache = new Map();
        this.currentView = 'inbox'; // 'inbox' or 'sent'
        this.updateInterval = null;
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async init() {
        if (!nocoDBService.isLoggedIn()) return;

        await this.loadInbox();
        await this.updateUnreadBadge();

        // Poll for new messages every 60 seconds
        this.startPolling();
    }

    startPolling() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => {
            if (nocoDBService.isLoggedIn()) {
                this.updateUnreadBadge();
            }
        }, 60000);
    }

    stopPolling() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // ==========================================
    // LOAD MESSAGES
    // ==========================================

    async loadInbox() {
        if (!nocoDBService.isLoggedIn()) return;

        try {
            this.inbox = await nocoDBService.getInbox();

            // Load sender info
            const senderIds = [...new Set(this.inbox.map(m => m.sender_id))];
            await this.loadUserInfo(senderIds);

            this.renderInbox();
        } catch (error) {
            console.error('Error loading inbox:', error);
        }
    }

    async loadSent() {
        if (!nocoDBService.isLoggedIn()) return;

        try {
            this.sent = await nocoDBService.getSentMessages();

            // Load recipient info
            const recipientIds = [...new Set(this.sent.map(m => m.recipient_id))];
            await this.loadUserInfo(recipientIds);

            this.renderSent();
        } catch (error) {
            console.error('Error loading sent messages:', error);
        }
    }

    async loadUserInfo(userIds) {
        for (const userId of userIds) {
            if (!this.userCache.has(userId)) {
                const user = await nocoDBService.getUserById(userId);
                if (user) {
                    this.userCache.set(userId, user);
                }
            }
        }
    }

    // ==========================================
    // UNREAD COUNT
    // ==========================================

    async updateUnreadBadge() {
        if (!nocoDBService.isLoggedIn()) {
            this.unreadCount = 0;
            this.renderUnreadBadge();
            return;
        }

        try {
            this.unreadCount = await nocoDBService.getUnreadCount();
            this.renderUnreadBadge();
        } catch (error) {
            console.error('Error getting unread count:', error);
        }
    }

    renderUnreadBadge() {
        const badge = document.getElementById('inbox-unread-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        // Also update header icon if exists
        const headerBadge = document.querySelector('.inbox-header-badge');
        if (headerBadge) {
            if (this.unreadCount > 0) {
                headerBadge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
                headerBadge.classList.remove('hidden');
            } else {
                headerBadge.classList.add('hidden');
            }
        }
    }

    // ==========================================
    // RENDER
    // ==========================================

    renderInbox() {
        const container = document.getElementById('inbox-messages');
        if (!container) return;

        if (this.inbox.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="inbox"></i>
                    <h3>Caixa de entrada vazia</h3>
                    <p>Você não tem mensagens</p>
                </div>
            `;
            refreshIcons(container);
            return;
        }

        container.innerHTML = this.inbox.map(message => {
            const sender = this.userCache.get(message.sender_id) || { displayName: 'Usuário', avatarId: 1 };
            const isUnread = !message.is_read;

            return `
                <div class="message-item ${isUnread ? 'unread' : ''}" data-message-id="${message.Id}" onclick="messagingService.openMessage(${message.Id}, 'inbox')">
                    <div class="message-avatar">
                        ${renderAvatar(sender.avatarId, 'small')}
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">${escapeHtml(sender.displayName)}</span>
                            <span class="message-date">${formatRelativeDate(message.created_at)}</span>
                        </div>
                        <div class="message-subject">${escapeHtml(message.subject)}</div>
                        <div class="message-preview">${escapeHtml(message.content.substring(0, 80))}${message.content.length > 80 ? '...' : ''}</div>
                    </div>
                    ${isUnread ? '<div class="unread-indicator"></div>' : ''}
                </div>
            `;
        }).join('');

        refreshIcons(container);
    }

    renderSent() {
        const container = document.getElementById('inbox-messages');
        if (!container) return;

        if (this.sent.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="send"></i>
                    <h3>Nenhuma mensagem enviada</h3>
                </div>
            `;
            refreshIcons(container);
            return;
        }

        container.innerHTML = this.sent.map(message => {
            const recipient = this.userCache.get(message.recipient_id) || { displayName: 'Usuário', avatarId: 1 };

            return `
                <div class="message-item" data-message-id="${message.Id}" onclick="messagingService.openMessage(${message.Id}, 'sent')">
                    <div class="message-avatar">
                        ${renderAvatar(recipient.avatarId, 'small')}
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">Para: ${escapeHtml(recipient.displayName)}</span>
                            <span class="message-date">${formatRelativeDate(message.created_at)}</span>
                        </div>
                        <div class="message-subject">${escapeHtml(message.subject)}</div>
                        <div class="message-preview">${escapeHtml(message.content.substring(0, 80))}${message.content.length > 80 ? '...' : ''}</div>
                    </div>
                    ${message.is_read ? '<span class="read-status" title="Lida"><i data-lucide="check-check"></i></span>' : ''}
                </div>
            `;
        }).join('');

        refreshIcons(container);
    }

    // ==========================================
    // VIEW SWITCHING
    // ==========================================

    switchView(view) {
        this.currentView = view;

        // Update tab buttons
        document.querySelectorAll('.inbox-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        if (view === 'inbox') {
            this.renderInbox();
        } else {
            this.loadSent();
        }
    }

    // ==========================================
    // OPEN MESSAGE
    // ==========================================

    async openMessage(messageId, source) {
        const messages = source === 'inbox' ? this.inbox : this.sent;
        const message = messages.find(m => m.Id === messageId);
        if (!message) return;

        // Mark as read if inbox
        if (source === 'inbox' && !message.is_read) {
            await nocoDBService.markMessageRead(messageId);
            message.is_read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.renderUnreadBadge();
            this.renderInbox();
        }

        // Get other user info
        const otherId = source === 'inbox' ? message.sender_id : message.recipient_id;
        const otherUser = this.userCache.get(otherId) || { displayName: 'Usuário', avatarId: 1 };

        // Show message modal
        const modal = document.getElementById('message-view-modal');
        if (modal) {
            document.getElementById('message-view-user').innerHTML = `
                ${renderAvatar(otherUser.avatarId, 'medium')}
                <span>${escapeHtml(otherUser.displayName)}</span>
            `;
            document.getElementById('message-view-subject').textContent = message.subject;
            document.getElementById('message-view-date').textContent = new Date(message.created_at).toLocaleString('pt-BR');
            document.getElementById('message-view-content').textContent = message.content;

            // Setup reply button
            const replyBtn = document.getElementById('message-reply-btn');
            if (replyBtn) {
                replyBtn.onclick = () => {
                    closeModal('message-view-modal');
                    openComposeMessage(otherId, `Re: ${message.subject}`, messageId);
                };
                // Hide reply button for sent messages
                replyBtn.style.display = source === 'sent' ? 'none' : '';
            }

            openModal('message-view-modal');
        }
    }

    // ==========================================
    // COMPOSE MESSAGE
    // ==========================================

    async sendMessage(recipientId, subject, content, replyToId = null) {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para enviar mensagens', 'error');
            return false;
        }

        if (!subject.trim() || !content.trim()) {
            showToast('Preencha o assunto e a mensagem', 'error');
            return false;
        }

        try {
            await nocoDBService.sendMessage(recipientId, subject, content, replyToId);
            showToast('Mensagem enviada!', 'success');
            closeModal('compose-message-modal');

            // Refresh sent if viewing
            if (this.currentView === 'sent') {
                await this.loadSent();
            }

            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            showToast(error.message || 'Erro ao enviar mensagem', 'error');
            return false;
        }
    }

    // ==========================================
    // DELETE MESSAGE
    // ==========================================

    async deleteMessage(messageId, source) {
        const isSender = source === 'sent';

        try {
            await nocoDBService.deleteMessage(messageId, isSender);
            showToast('Mensagem excluída', 'success');

            if (source === 'inbox') {
                this.inbox = this.inbox.filter(m => m.Id !== messageId);
                this.renderInbox();
            } else {
                this.sent = this.sent.filter(m => m.Id !== messageId);
                this.renderSent();
            }

            closeModal('message-view-modal');
        } catch (error) {
            console.error('Error deleting message:', error);
            showToast('Erro ao excluir mensagem', 'error');
        }
    }

    // ==========================================
    // SEARCH USERS
    // ==========================================

    async searchUsers(query) {
        if (!query || query.length < 2) return [];

        try {
            return await nocoDBService.searchUsers(query);
        } catch (error) {
            return [];
        }
    }
}

// ==========================================
// COMPOSE MESSAGE MODAL
// ==========================================

let composeRecipientId = null;
let composeReplyToId = null;

function openComposeMessage(recipientId = null, subject = '', replyToId = null) {
    if (!nocoDBService.isLoggedIn()) {
        showToast('Faça login para enviar mensagens', 'error');
        return;
    }

    composeRecipientId = recipientId;
    composeReplyToId = replyToId;

    const modal = document.getElementById('compose-message-modal');
    if (!modal) return;

    // Reset form
    document.getElementById('compose-subject').value = subject;
    document.getElementById('compose-content').value = '';

    // Set recipient if provided
    const recipientInput = document.getElementById('compose-recipient');
    const recipientDisplay = document.getElementById('compose-recipient-display');

    if (recipientId) {
        const user = messagingService.userCache.get(recipientId);
        if (user) {
            recipientDisplay.innerHTML = `
                ${renderAvatar(user.avatarId, 'small')}
                <span>${escapeHtml(user.displayName)}</span>
            `;
            recipientDisplay.classList.remove('hidden');
            recipientInput.classList.add('hidden');
        } else {
            // Load user info
            nocoDBService.getUserById(recipientId).then(user => {
                if (user) {
                    messagingService.userCache.set(recipientId, user);
                    recipientDisplay.innerHTML = `
                        ${renderAvatar(user.avatarId, 'small')}
                        <span>${escapeHtml(user.displayName)}</span>
                    `;
                    recipientDisplay.classList.remove('hidden');
                    recipientInput.classList.add('hidden');
                }
            }).catch(err => {
                console.warn('Error loading user info:', err);
            });
        }
    } else {
        recipientDisplay.classList.add('hidden');
        recipientInput.classList.remove('hidden');
        recipientInput.value = '';
    }

    openModal('compose-message-modal');
}

async function sendComposedMessage() {
    const subject = document.getElementById('compose-subject').value.trim();
    const content = document.getElementById('compose-content').value.trim();

    if (!composeRecipientId) {
        // Need to search for user
        const recipientInput = document.getElementById('compose-recipient').value.trim();
        if (!recipientInput) {
            showToast('Selecione um destinatário', 'error');
            return;
        }

        const users = await messagingService.searchUsers(recipientInput);
        if (users.length === 0) {
            showToast('Usuário não encontrado', 'error');
            return;
        }
        if (users.length > 1) {
            showToast('Seja mais específico no nome do usuário', 'warning');
            return;
        }
        composeRecipientId = users[0].id;
    }

    await messagingService.sendMessage(composeRecipientId, subject, content, composeReplyToId);
}

// ==========================================
// INITIALIZE
// ==========================================

const messagingService = new MessagingService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MessagingService, messagingService, openComposeMessage };
}
