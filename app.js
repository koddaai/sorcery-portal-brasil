// ============================================
// SORCERY COLLECTION MANAGER - MAIN APP
// ============================================

// ============================================
// CONSTANTS
// ============================================

// UI Timings (ms)
const TOAST_DURATION_DEFAULT = 6000;  // 6 seconds for regular messages
const TOAST_DURATION_ERROR = 8000;    // 8 seconds for error messages
const TOAST_ANIMATION_MS = 200;
const NOTIFICATION_SHOW_DELAY = 100;
const NOTIFICATION_HIDE_DELAY = 500;
const CARD_HIGHLIGHT_DURATION = 600;

// Limits and Counts
const PREVIEW_CARDS_LIMIT = 50;
const ARTISTS_PREVIEW_LIMIT = 100;
const ARTIST_SAMPLE_CARDS = 3;
const TOP_CARDS_DISPLAY = 10;
const PRICE_CHANGES_DISPLAY = 5;
const DECK_KEY_CARDS_DISPLAY = 4;

// Deck Validation
const SPELLBOOK_MIN = 40;
const SPELLBOOK_MAX = 60;
const ATLAS_MIN = 20;
const ATLAS_MAX = 30;

// Completion Thresholds (%)
const COMPLETION_LOW = 25;
const COMPLETION_MEDIUM = 50;
const COMPLETION_HIGH = 75;
const COMPLETION_FULL = 100;

// Image Processing
const MAX_IMAGE_SIZE = 800;
const QR_CODE_SIZE = 150;

// Global State
let allCards = [];
let filteredCards = [];
let collection = new Map(); // Map<cardName, quantity> for tracking card counts
let wishlist = new Set();
let tradeBinder = new Set();
let tradeWants = new Set(); // Cards the user is looking for in trades
let decks = [];
let ownedPrecons = new Set();
let activeKeywordFilters = new Set();

// ============================================
// LOADING STATE UTILITIES
// ============================================

// Show loading state on a button
function setButtonLoading(button, isLoading, loadingText = 'Carregando...') {
    if (!button) return;

    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<i data-lucide="loader-2" class="spin"></i> ${loadingText}`;
        refreshIcons(button);
    } else {
        button.disabled = false;
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
            refreshIcons(button);
        }
    }
}

// Show loading overlay on a container
function showContainerLoading(container, message = 'Carregando...') {
    // Accept either element or string ID
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    if (!container) return;

    // Remove existing overlay if any
    hideContainerLoading(container);

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner">
            <i data-lucide="loader-2" class="spin"></i>
            <span>${message}</span>
        </div>
    `;
    container.style.position = 'relative';
    container.appendChild(overlay);
    refreshIcons(overlay);
}

// Hide loading overlay from a container
function hideContainerLoading(container) {
    // Accept either element or string ID
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    if (!container) return;
    const overlay = container.querySelector('.loading-overlay');
    if (overlay) overlay.remove();
}

// Show inline loading message
function showInlineLoading(element, message = 'Carregando...') {
    if (!element) return;
    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = `<span class="inline-loading"><i data-lucide="loader-2" class="spin"></i> ${message}</span>`;
    refreshIcons(element);
}

// Hide inline loading and restore content
function hideInlineLoading(element) {
    if (!element || !element.dataset.originalContent) return;
    element.innerHTML = element.dataset.originalContent;
    delete element.dataset.originalContent;
    refreshIcons(element);
}

// ============================================
// HTML UTILITIES
// ============================================

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Escape text for use in HTML attributes
function escapeAttr(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ============================================
// SKELETON & EMPTY STATE UTILITIES
// ============================================

/**
 * Generate skeleton cards HTML for loading state
 */
function createSkeletonCards(count = 12) {
    let html = '<div class="skeleton-cards-grid">';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="skeleton-card-item">
                <div class="skeleton-card-image"></div>
                <div class="skeleton-card-info">
                    <div class="skeleton-card-title"></div>
                    <div class="skeleton-card-subtitle"></div>
                </div>
            </div>
        `;
    }
    html += '</div>';
    return html;
}

/**
 * Show skeleton loading in a container
 */
function showSkeletonLoading(container, count = 12) {
    if (!container) return;
    container.innerHTML = createSkeletonCards(count);
}

/**
 * Create enhanced empty state HTML
 * @param {Object} options - Empty state options
 * @param {string} options.icon - Lucide icon name
 * @param {string} options.title - Title text
 * @param {string} options.description - Description text
 * @param {Array} options.actions - Array of action buttons [{label, onclick, primary}]
 * @param {boolean} options.compact - Use compact variant
 */
function createEmptyState(options) {
    const { icon = 'inbox', title = 'Nada aqui', description = '', actions = [], compact = false } = options;

    const actionsHtml = actions.map(action => {
        const btnClass = action.primary ? 'btn primary' : 'btn secondary';
        const iconHtml = action.icon ? `<i data-lucide="${action.icon}"></i>` : '';
        return `<button class="${btnClass}" onclick="${action.onclick}">${iconHtml} ${action.label}</button>`;
    }).join('');

    return `
        <div class="empty-state-enhanced${compact ? ' compact' : ''}">
            <div class="empty-state-icon">
                <i data-lucide="${icon}"></i>
            </div>
            <h3 class="empty-state-title">${title}</h3>
            ${description ? `<p class="empty-state-description">${description}</p>` : ''}
            ${actionsHtml ? `<div class="empty-state-cta">${actionsHtml}</div>` : ''}
        </div>
    `;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

// Ensure toast container exists
function getToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

// Show toast notification
function showToast(message, type = 'info', title = '', duration = TOAST_DURATION_DEFAULT) {
    const container = getToastContainer();

    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i data-lucide="${icons[type] || 'info'}"></i>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Fechar">
            <i data-lucide="x"></i>
        </button>
    `;

    // Close handler
    const closeToast = () => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 200);
    };

    toast.querySelector('.toast-close').addEventListener('click', closeToast);

    // Auto close
    if (duration > 0) {
        setTimeout(closeToast, duration);
    }

    container.appendChild(toast);
    refreshIcons(toast);

    return toast;
}

// Convenience methods
function showSuccessToast(message, title = '', duration = TOAST_DURATION_DEFAULT) {
    return showToast(message, 'success', title, duration);
}

function showErrorToast(message, title = 'Erro') {
    return showToast(message, 'error', title, TOAST_DURATION_ERROR);
}

function showWarningToast(message, title = '') {
    return showToast(message, 'warning', title);
}

function showInfoToast(message, title = '') {
    return showToast(message, 'info', title);
}

/**
 * Show a toast with an undo button
 * @param {string} message - Toast message
 * @param {Function} undoCallback - Function to call when undo is clicked
 * @param {string} type - Toast type (default: 'info')
 * @param {number} duration - Duration in ms (default: 5000 for undo toasts)
 * @returns {HTMLElement} The toast element
 */
function showUndoToast(message, undoCallback, type = 'info', duration = 5000) {
    const container = getToastContainer();

    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-with-undo`;
    toast.innerHTML = `
        <i data-lucide="${icons[type] || 'info'}"></i>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-undo-btn" aria-label="Desfazer">
            <i data-lucide="rotate-ccw"></i>
            Desfazer
        </button>
        <button class="toast-close" aria-label="Fechar">
            <i data-lucide="x"></i>
        </button>
    `;

    let undoClicked = false;

    // Close handler
    const closeToast = () => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 200);
    };

    // Undo handler
    const undoBtn = toast.querySelector('.toast-undo-btn');
    undoBtn.addEventListener('click', () => {
        if (!undoClicked && typeof undoCallback === 'function') {
            undoClicked = true;
            undoCallback();
            closeToast();
            showSuccessToast('Ação desfeita!');
        }
    });

    toast.querySelector('.toast-close').addEventListener('click', closeToast);

    // Auto close
    if (duration > 0) {
        setTimeout(closeToast, duration);
    }

    container.appendChild(toast);
    refreshIcons(toast);

    return toast;
}

// ============================================
// CONFIRMATION DIALOG
// ============================================

let confirmResolver = null;

/**
 * Show a confirmation dialog
 * @param {Object} options - Dialog options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog message
 * @param {string} options.confirmText - Confirm button text (default: "Confirmar")
 * @param {string} options.cancelText - Cancel button text (default: "Cancelar")
 * @param {string} options.type - Icon type: 'danger', 'warning', 'info' (default: 'danger')
 * @param {string} options.icon - Lucide icon name (default based on type)
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
function showConfirmDialog(options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Confirmar ação',
            message = 'Tem certeza que deseja continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'danger',
            icon = type === 'danger' ? 'trash-2' : type === 'warning' ? 'alert-triangle' : 'info'
        } = options;

        const modal = document.getElementById('confirm-modal');
        if (!modal) {
            resolve(window.confirm(message)); // Fallback to native confirm
            return;
        }

        // Update content
        document.getElementById('confirm-modal-title').textContent = title;
        document.getElementById('confirm-modal-message').textContent = message;

        // Update icon
        const iconContainer = document.getElementById('confirm-modal-icon');
        iconContainer.className = `confirm-modal-icon ${type}`;
        iconContainer.innerHTML = `<i data-lucide="${icon}"></i>`;

        // Update buttons
        const confirmBtn = document.getElementById('confirm-modal-confirm');
        const cancelBtn = document.getElementById('confirm-modal-cancel');

        confirmBtn.innerHTML = `<i data-lucide="${icon}"></i> ${confirmText}`;
        confirmBtn.className = `btn ${type === 'danger' ? 'danger' : 'primary'}`;
        cancelBtn.querySelector('span, i + span')?.remove();
        cancelBtn.innerHTML = `<i data-lucide="x"></i> ${cancelText}`;

        // Store resolver
        confirmResolver = resolve;

        // Show modal
        modal.classList.remove('hidden');
        refreshIcons();

        // Focus confirm button
        requestAnimationFrame(() => {
            confirmBtn.focus();
        });
    });
}

// Handle confirm modal button clicks
function setupConfirmModalHandlers() {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;

    const confirmBtn = document.getElementById('confirm-modal-confirm');
    const cancelBtn = document.getElementById('confirm-modal-cancel');

    confirmBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (confirmResolver) {
            confirmResolver(true);
            confirmResolver = null;
        }
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (confirmResolver) {
            confirmResolver(false);
            confirmResolver = null;
        }
    });

    // ESC to cancel
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.add('hidden');
            if (confirmResolver) {
                confirmResolver(false);
                confirmResolver = null;
            }
        }
    });

    // Click outside to cancel
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            if (confirmResolver) {
                confirmResolver(false);
                confirmResolver = null;
            }
        }
    });
}

// ============================================
// ACCESSIBILITY UTILITIES
// ============================================

// Focus trap state
let activeFocusTrap = null;
let lastFocusedElement = null;

// Get all focusable elements within a container
function getFocusableElements(container) {
    const focusableSelectors = [
        'button:not([disabled]):not([tabindex="-1"])',
        'input:not([disabled]):not([tabindex="-1"])',
        'select:not([disabled]):not([tabindex="-1"])',
        'textarea:not([disabled]):not([tabindex="-1"])',
        'a[href]:not([tabindex="-1"])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
        .filter(el => el.offsetParent !== null); // Only visible elements
}

// Trap focus within a modal
function trapFocus(modal) {
    // Store currently focused element to restore later
    lastFocusedElement = document.activeElement;

    const focusableElements = getFocusableElements(modal);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    // Create trap handler
    const trapHandler = (e) => {
        if (e.key !== 'Tab') return;

        const focusable = getFocusableElements(modal);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    modal.addEventListener('keydown', trapHandler);
    activeFocusTrap = { modal, handler: trapHandler };
}

// Release focus trap and restore focus
function releaseFocusTrap() {
    if (activeFocusTrap) {
        activeFocusTrap.modal.removeEventListener('keydown', activeFocusTrap.handler);
        activeFocusTrap = null;
    }

    // Restore focus to last focused element
    if (lastFocusedElement && lastFocusedElement.focus) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

// Open modal with focus trap
function openModalWithTrap(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('hidden');

    // Small delay to ensure modal is visible before trapping focus
    requestAnimationFrame(() => {
        trapFocus(modal);
    });
}

// Close modal and release focus trap
function closeModalWithTrap(modalId) {
    const modal = modalId ? document.getElementById(modalId) : null;

    if (modal) {
        modal.classList.add('hidden');
    }

    releaseFocusTrap();
}

// ============================================
// DROPDOWN KEYBOARD NAVIGATION
// ============================================

// Initialize dropdown accessibility
function initDropdownAccessibility() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-dropdown-trigger');
        const menu = dropdown.querySelector('.nav-dropdown-menu');
        const items = menu.querySelectorAll('.nav-dropdown-item');

        // Click to toggle (for touch devices)
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = dropdown.classList.contains('open');

            // Close all other dropdowns
            document.querySelectorAll('.nav-dropdown.open').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('open');
                    d.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            dropdown.classList.toggle('open');
            trigger.setAttribute('aria-expanded', !isOpen);

            if (!isOpen && items.length > 0) {
                items[0].focus();
            }
        });

        // Keyboard navigation on trigger
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                dropdown.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
                if (items.length > 0) items[0].focus();
            } else if (e.key === 'Escape') {
                closeDropdown(dropdown);
            }
        });

        // Keyboard navigation within menu
        items.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = items[index + 1] || items[0];
                    next.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = items[index - 1] || items[items.length - 1];
                    prev.focus();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeDropdown(dropdown);
                    trigger.focus();
                } else if (e.key === 'Tab') {
                    closeDropdown(dropdown);
                }
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown.open').forEach(d => {
                closeDropdown(d);
            });
        }
    });
}

// Close a dropdown
function closeDropdown(dropdown) {
    dropdown.classList.remove('open');
    dropdown.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
}

// ============================================
// NOTIFICATIONS CENTER
// ============================================

// Notifications state
let notifications = [];
let notificationFilter = 'all';

// Initialize notifications view
function initNotificationsView() {
    loadNotifications();
    renderNotifications();
    setupNotificationFilters();
}

// Load notifications from storage and generate dynamic ones
function loadNotifications() {
    // Load stored notifications
    const stored = localStorage.getItem('sorcery-notifications');
    if (stored) {
        try {
            notifications = JSON.parse(stored);
        } catch (e) {
            notifications = [];
        }
    }

    // Generate dynamic notifications based on user data
    generateDynamicNotifications();
}

// Generate notifications based on price changes, etc.
function generateDynamicNotifications() {
    const now = Date.now();

    // Check for price alerts
    if (typeof priceService !== 'undefined' && priceService.priceAlerts) {
        const alerts = priceService.priceAlerts;
        alerts.forEach(alert => {
            // Check if we already have a notification for this
            const exists = notifications.some(n =>
                n.type === 'price' && n.cardName === alert.cardName && n.timestamp > now - 86400000
            );
            if (!exists && alert.triggered) {
                notifications.unshift({
                    id: `price-${alert.cardName}-${now}`,
                    type: 'price',
                    icon: alert.direction === 'up' ? 'trending-up' : 'trending-down',
                    iconClass: alert.direction === 'up' ? 'price-up' : 'price-down',
                    title: `${alert.cardName} ${alert.direction === 'up' ? 'subiu' : 'caiu'} de preço`,
                    body: `O preço ${alert.direction === 'up' ? 'aumentou' : 'diminuiu'} para $${alert.currentPrice?.toFixed(2) || '?.??'}`,
                    cardName: alert.cardName,
                    timestamp: now,
                    read: false
                });
            }
        });
    }

    // Add tips if user is new (fewer than 5 notifications ever)
    if (notifications.length < 3) {
        const tips = [
            {
                id: 'tip-scan',
                type: 'tip',
                icon: 'lightbulb',
                iconClass: 'tip',
                title: 'Escaneie suas cartas!',
                body: 'Use o Scanner para adicionar cartas à sua coleção rapidamente pela câmera.',
                timestamp: now - 86400000 * 2,
                read: false
            },
            {
                id: 'tip-alerts',
                type: 'tip',
                icon: 'lightbulb',
                iconClass: 'tip',
                title: 'Alertas de Preço',
                body: 'Configure alertas para ser notificado quando cartas da sua wishlist mudarem de valor.',
                timestamp: now - 86400000 * 5,
                read: false
            },
            {
                id: 'tip-sync',
                type: 'tip',
                icon: 'lightbulb',
                iconClass: 'tip',
                title: 'Sincronize sua coleção',
                body: 'Faça login para sincronizar sua coleção na nuvem e acessar de qualquer dispositivo.',
                timestamp: now - 86400000 * 10,
                read: false
            }
        ];

        tips.forEach(tip => {
            if (!notifications.some(n => n.id === tip.id)) {
                notifications.push(tip);
            }
        });
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    // Update badge
    updateNotificationBadge();
}

// Render notifications list
function renderNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;

    // Filter notifications
    let filtered = notifications;
    if (notificationFilter !== 'all') {
        filtered = notifications.filter(n => n.type === notificationFilter);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="notifications-empty">
                <i data-lucide="bell-off"></i>
                <p>Nenhuma notificação ${notificationFilter !== 'all' ? 'nesta categoria' : 'no momento'}</p>
                <span class="text-secondary">Ative alertas de preço para receber atualizações</span>
            </div>
        `;
        refreshIcons();
        return;
    }

    container.innerHTML = filtered.map(notification => {
        const timeAgo = getTimeAgo(notification.timestamp);
        const unreadClass = notification.read ? '' : 'unread';

        return `
            <div class="notification-item ${unreadClass}" data-id="${notification.id}" onclick="handleNotificationClick('${notification.id}')">
                <div class="notification-icon ${notification.iconClass || ''}">
                    <i data-lucide="${notification.icon || 'bell'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${escapeHtml(notification.title)}</div>
                    <div class="notification-body">${escapeHtml(notification.body)}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');

    refreshIcons();
}

// Setup notification filter buttons
function setupNotificationFilters() {
    document.querySelectorAll('.notification-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            notificationFilter = filter;

            // Update active state
            document.querySelectorAll('.notification-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            renderNotifications();
        });
    });
}

// Handle notification click
function handleNotificationClick(id) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    // Mark as read
    notification.read = true;
    saveNotifications();
    updateNotificationBadge();

    // Handle action based on type
    if (notification.type === 'price' && notification.cardName) {
        // Open card modal
        const card = allCards.find(c => c.name === notification.cardName);
        if (card) {
            openCardModal(card);
        }
    }

    // Re-render to show read state
    renderNotifications();
}

// Mark all notifications as read
function markAllNotificationsRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
    showToast('Todas as notificações marcadas como lidas', 'success');
}

// Save notifications to storage
function saveNotifications() {
    // Only keep last 50 notifications
    const toSave = notifications.slice(0, 50);
    localStorage.setItem('sorcery-notifications', JSON.stringify(toSave));
}

// Update notification badge count
function updateNotificationBadge() {
    const badge = document.getElementById('notifications-badge');
    if (!badge) return;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Get relative time string
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

// Open notification settings
function openNotificationSettings() {
    // For now, show a toast with info
    showToast('Configurações de notificação em breve!', 'info');
}

// Add a new notification programmatically
function addNotification(notification) {
    const newNotification = {
        id: `${notification.type}-${Date.now()}`,
        timestamp: Date.now(),
        read: false,
        ...notification
    };

    notifications.unshift(newNotification);
    saveNotifications();
    updateNotificationBadge();

    // If on notifications view, re-render
    if (document.getElementById('notifications-view')?.classList.contains('active')) {
        renderNotifications();
    }
}

// ============================================
// MOBILE CARD DETAIL (TABS)
// ============================================

// Initialize mobile card detail tabs
function initMobileCardDetail() {
    // Setup tab switching
    document.querySelectorAll('.mobile-card-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchMobileCardTab(tabName);

            // Haptic feedback
            if ('vibrate' in navigator) navigator.vibrate(10);
        });
    });

    // Setup back button
    const backBtn = document.getElementById('mobile-card-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            closeCardModal();
            if ('vibrate' in navigator) navigator.vibrate(10);
        });
    }

    // Setup action buttons
    const bookmarkBtn = document.getElementById('mobile-card-bookmark');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
            const cardName = document.getElementById('modal-card-name')?.textContent;
            if (cardName) {
                toggleWishlistFromModal(cardName);
                updateMobileCardBookmark(cardName);
            }
            if ('vibrate' in navigator) navigator.vibrate(10);
        });
    }

    const shareBtn = document.getElementById('mobile-card-share');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            shareCurrentCard();
            if ('vibrate' in navigator) navigator.vibrate(10);
        });
    }

    // Setup mobile FAB buttons
    const addToCollectionFab = document.querySelector('.mobile-card-fab-btn.primary');
    if (addToCollectionFab) {
        addToCollectionFab.addEventListener('click', () => {
            const cardName = document.getElementById('modal-card-name')?.textContent;
            if (cardName) {
                addCardFromModal(cardName);
            }
            if ('vibrate' in navigator) navigator.vibrate(15);
        });
    }
}

// ============================================
// MOBILE SEARCH & FILTERS
// ============================================

// Mobile filter state
let mobileFilters = {
    set: '',
    type: '',
    element: '',
    rarity: ''
};

// Initialize mobile search
function initMobileSearch() {
    // Mobile search input
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', debounce((e) => {
            // Sync with desktop search
            const desktopInput = document.getElementById('search-input');
            if (desktopInput) {
                desktopInput.value = e.target.value;
            }
            applyFilters();
        }, 150));
    }

    // Filter toggle button
    const filterToggle = document.getElementById('mobile-filter-toggle');
    const filterPanel = document.getElementById('mobile-filter-panel');
    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', () => {
            const isOpen = !filterPanel.classList.contains('hidden');
            filterPanel.classList.toggle('hidden');
            filterToggle.classList.toggle('active', !isOpen);
            if ('vibrate' in navigator) navigator.vibrate(10);
        });
    }

    // Quick filters
    document.querySelectorAll('.mobile-quick-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            handleQuickFilter(filter);

            // Update active state
            document.querySelectorAll('.mobile-quick-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if ('vibrate' in navigator) navigator.vibrate(10);
        });
    });

    // Filter chips
    document.querySelectorAll('.mobile-filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const container = chip.closest('.mobile-filter-chips');
            const filterType = container.dataset.filterType;
            const value = chip.dataset.value;

            // Update active state in this group
            container.querySelectorAll('.mobile-filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Update filter state
            mobileFilters[filterType] = value;

            if ('vibrate' in navigator) navigator.vibrate(10);
        });
    });

    // Clear filters button
    const clearBtn = document.getElementById('mobile-clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearMobileFilters();
            if ('vibrate' in navigator) navigator.vibrate(10);
        });
    }

    // Apply filters button
    const applyBtn = document.getElementById('mobile-apply-filters');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            applyMobileFilters();
            // Close panel
            document.getElementById('mobile-filter-panel')?.classList.add('hidden');
            document.getElementById('mobile-filter-toggle')?.classList.remove('active');
            if ('vibrate' in navigator) navigator.vibrate(15);
        });
    }
}

// Handle quick filter selection
function handleQuickFilter(filter) {
    // Reset all filters first
    clearMobileFilters(false);

    switch (filter) {
        case 'all':
            // No filters
            break;
        case 'minion':
        case 'magic':
        case 'avatar':
        case 'site':
        case 'artifact':
        case 'aura':
            mobileFilters.type = filter.charAt(0).toUpperCase() + filter.slice(1);
            break;
        case 'fire':
        case 'water':
        case 'earth':
        case 'air':
            mobileFilters.element = filter.charAt(0).toUpperCase() + filter.slice(1);
            break;
    }

    applyMobileFilters();
    updateMobileFilterCount();
}

// Apply mobile filters to desktop filters and trigger search
function applyMobileFilters() {
    // Sync to desktop filters
    const setFilter = document.getElementById('set-filter');
    const typeFilter = document.getElementById('type-filter');
    const elementFilter = document.getElementById('element-filter');
    const rarityFilter = document.getElementById('rarity-filter');

    if (setFilter) setFilter.value = mobileFilters.set;
    if (typeFilter) typeFilter.value = mobileFilters.type;
    if (elementFilter) elementFilter.value = mobileFilters.element;
    if (rarityFilter) rarityFilter.value = mobileFilters.rarity;

    // Dispatch change event to trigger filter application
    // This ensures the desktop filter handlers are triggered
    const changeEvent = new Event('change', { bubbles: true });
    if (elementFilter) elementFilter.dispatchEvent(changeEvent);

    updateMobileFilterCount();
    updateMobileActiveFilters();
}

// Clear all mobile filters
function clearMobileFilters(apply = true) {
    mobileFilters = {
        set: '',
        type: '',
        element: '',
        rarity: ''
    };

    // Reset all chip active states
    document.querySelectorAll('.mobile-filter-chips').forEach(container => {
        container.querySelectorAll('.mobile-filter-chip').forEach((chip, index) => {
            if (index === 0) {
                chip.classList.add('active'); // First chip is "All"
            } else {
                chip.classList.remove('active');
            }
        });
    });

    // Reset quick filters
    document.querySelectorAll('.mobile-quick-filter').forEach((btn, index) => {
        if (index === 0) {
            btn.classList.add('active'); // "Todos" button
        } else {
            btn.classList.remove('active');
        }
    });

    if (apply) {
        applyMobileFilters();
    }
}

// Update filter count badge
function updateMobileFilterCount() {
    const badge = document.getElementById('mobile-filter-count');
    if (!badge) return;

    const count = Object.values(mobileFilters).filter(v => v !== '').length;

    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Update active filters display
function updateMobileActiveFilters() {
    const container = document.getElementById('mobile-active-filters');
    if (!container) return;

    const activeFilters = Object.entries(mobileFilters).filter(([key, value]) => value !== '');

    if (activeFilters.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = activeFilters.map(([key, value]) => `
        <div class="mobile-active-filter">
            <span>${value}</span>
            <button onclick="removeMobileFilter('${key}')" aria-label="Remover filtro">
                <i data-lucide="x"></i>
            </button>
        </div>
    `).join('');

    refreshIcons();
}

// Remove a specific mobile filter
function removeMobileFilter(filterType) {
    mobileFilters[filterType] = '';

    // Update corresponding chip
    const container = document.querySelector(`.mobile-filter-chips[data-filter-type="${filterType}"]`);
    if (container) {
        container.querySelectorAll('.mobile-filter-chip').forEach((chip, index) => {
            if (index === 0) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    applyMobileFilters();
}

// Sync desktop filters to mobile (when desktop changes)
function syncDesktopToMobileFilters() {
    const setFilter = document.getElementById('set-filter');
    const typeFilter = document.getElementById('type-filter');
    const elementFilter = document.getElementById('element-filter');
    const rarityFilter = document.getElementById('rarity-filter');

    if (setFilter) mobileFilters.set = setFilter.value;
    if (typeFilter) mobileFilters.type = typeFilter.value;
    if (elementFilter) mobileFilters.element = elementFilter.value;
    if (rarityFilter) mobileFilters.rarity = rarityFilter.value;

    updateMobileFilterCount();
    updateMobileActiveFilters();
}

// Switch mobile card tab
function switchMobileCardTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.mobile-card-tab').forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.mobile-tab-content').forEach(content => {
        if (content.dataset.tab === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Populate mobile card detail content
function populateMobileCardDetail(card) {
    if (!card) return;

    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    // Update mobile header
    const mobileTitle = document.querySelector('.mobile-card-title h3');
    const mobileSubtitle = document.querySelector('.mobile-card-title span');
    if (mobileTitle) mobileTitle.textContent = card.name;
    if (mobileSubtitle) mobileSubtitle.textContent = card.guardian?.type || '';

    // Update bookmark state
    updateMobileCardBookmark(card.name);

    // Reset to details tab
    switchMobileCardTab('details');

    // Populate Details tab
    populateMobileDetailsTab(card);

    // Populate Prices tab
    populateMobilePricesTab(card);

    // Populate Lists tab
    populateMobileListsTab(card);
}

// Populate mobile details tab
function populateMobileDetailsTab(card) {
    const imageSlug = getCardImageSlug(card);
    const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : '';

    // Update card image
    const mobileCardImage = document.getElementById('mobile-card-image');
    if (mobileCardImage) {
        mobileCardImage.src = imageUrl;
        mobileCardImage.alt = card.name;
    }

    // Update card info rows
    const infoContainer = document.querySelector('.mobile-card-info');
    if (!infoContainer) return;

    const element = (card.elements || 'None').split(',')[0].trim();
    const rarity = card.guardian?.rarity || 'Common';
    const set = card.sets?.[0]?.name || '-';

    // Get artist
    let artistName = '';
    if (card.sets && card.sets.length > 0) {
        for (const setData of card.sets) {
            if (setData.cards && setData.cards.length > 0) {
                for (const variant of setData.cards) {
                    if (variant.artist) {
                        artistName = variant.artist;
                        break;
                    }
                }
            }
            if (artistName) break;
        }
    }

    // Cost/Attack/Defense
    const cost = card.guardian?.cost;
    const attack = card.guardian?.attack;
    const defence = card.guardian?.defence;

    let infoHTML = `
        <div class="mobile-card-info-row">
            <span class="mobile-card-info-label">Elemento</span>
            <span class="mobile-card-info-value">
                <i data-lucide="${getElementIcon(element)}"></i>
                ${element}
            </span>
        </div>
        <div class="mobile-card-info-row">
            <span class="mobile-card-info-label">Raridade</span>
            <span class="mobile-card-info-value">${rarity}</span>
        </div>
        <div class="mobile-card-info-row">
            <span class="mobile-card-info-label">Coleção</span>
            <span class="mobile-card-info-value">${set}</span>
        </div>
    `;

    if (cost !== null && cost !== undefined) {
        infoHTML += `
            <div class="mobile-card-info-row">
                <span class="mobile-card-info-label">Custo</span>
                <span class="mobile-card-info-value">${cost}</span>
            </div>
        `;
    }

    if (attack !== null && attack !== undefined) {
        infoHTML += `
            <div class="mobile-card-info-row">
                <span class="mobile-card-info-label">Ataque</span>
                <span class="mobile-card-info-value">${attack}</span>
            </div>
        `;
    }

    if (defence !== null && defence !== undefined) {
        infoHTML += `
            <div class="mobile-card-info-row">
                <span class="mobile-card-info-label">Defesa</span>
                <span class="mobile-card-info-value">${defence}</span>
            </div>
        `;
    }

    if (artistName) {
        infoHTML += `
            <div class="mobile-card-info-row">
                <span class="mobile-card-info-label">Artista</span>
                <span class="mobile-card-info-value">
                    <i data-lucide="palette"></i>
                    ${artistName}
                </span>
            </div>
        `;
    }

    // Rules text
    const rulesText = card.guardian?.rulesText;
    if (rulesText) {
        infoHTML += `
            <div class="mobile-card-ability">
                <div class="mobile-card-ability-label">Habilidade</div>
                <div class="mobile-card-ability-text">${escapeHtml(rulesText.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n'))}</div>
            </div>
        `;
    }

    // Flavor text (if available)
    const flavorText = card.guardian?.flavorText;
    if (flavorText) {
        infoHTML += `
            <div class="mobile-card-flavor">${escapeHtml(flavorText)}</div>
        `;
    }

    infoContainer.innerHTML = infoHTML;
    refreshIcons();
}

// Get element icon
function getElementIcon(element) {
    const icons = {
        'Fire': 'flame',
        'Water': 'droplet',
        'Earth': 'mountain',
        'Air': 'wind',
        'None': 'circle'
    };
    return icons[element] || 'circle';
}

// Populate mobile prices tab
function populateMobilePricesTab(card) {
    const container = document.querySelector('.mobile-prices-content');
    if (!container) return;

    const imageSlug = getCardImageSlug(card);
    const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : '';

    // Get prices from tcgcsvPriceService (dados reais do TCGPlayer)
    let prices = { standard: null, foil: null, rainbow: null };
    if (typeof tcgcsvPriceService !== 'undefined' && tcgcsvPriceService.cardPrices.size > 0) {
        const allPrices = tcgcsvPriceService.getAllPrices(card.name);
        if (allPrices && allPrices.length > 0) {
            // Organizar preços por finish
            allPrices.forEach(p => {
                const priceObj = { low: p.lowPrice, mid: p.midPrice, market: p.marketPrice };
                if (p.finish === 'Normal') {
                    if (!prices.standard || p.marketPrice < prices.standard.market) {
                        prices.standard = priceObj;
                    }
                } else if (p.finish === 'Foil') {
                    if (!prices.foil || p.marketPrice < prices.foil.market) {
                        prices.foil = priceObj;
                    }
                } else if (p.finish === 'Foil Etched' || p.finish === 'Rainbow') {
                    if (!prices.rainbow || p.marketPrice < prices.rainbow.market) {
                        prices.rainbow = priceObj;
                    }
                }
            });
        }
    }

    const formatPrice = (price) => price ? `$${price.toFixed(2)}` : '-';

    let html = `
        <div class="mobile-price-card-preview">
            <img src="${imageUrl}" alt="${card.name}">
            <div class="mobile-price-card-info">
                <h4>${escapeHtml(card.name)}</h4>
                <span>${card.guardian?.type || ''} • ${card.sets?.[0]?.name || ''}</span>
            </div>
        </div>

        <div class="mobile-price-table">
            <div class="mobile-price-table-header">
                <span>Variante</span>
                <span>LOW</span>
                <span>MID</span>
                <span>MARKET</span>
            </div>

            <div class="mobile-price-row">
                <div class="mobile-price-variant">
                    <span class="mobile-price-variant-dot standard"></span>
                    <span>Standard</span>
                </div>
                <span class="mobile-price-cell low">${formatPrice(prices.standard?.low)}</span>
                <span class="mobile-price-cell mid">${formatPrice(prices.standard?.mid)}</span>
                <span class="mobile-price-cell market">${formatPrice(prices.standard?.market)}</span>
            </div>

            <div class="mobile-price-row">
                <div class="mobile-price-variant">
                    <span class="mobile-price-variant-dot foil"></span>
                    <span>Foil</span>
                </div>
                <span class="mobile-price-cell low">${formatPrice(prices.foil?.low)}</span>
                <span class="mobile-price-cell mid">${formatPrice(prices.foil?.mid)}</span>
                <span class="mobile-price-cell market">${formatPrice(prices.foil?.market)}</span>
            </div>

            <div class="mobile-price-row">
                <div class="mobile-price-variant">
                    <span class="mobile-price-variant-dot rainbow"></span>
                    <span>Rainbow</span>
                </div>
                <span class="mobile-price-cell low">${formatPrice(prices.rainbow?.low)}</span>
                <span class="mobile-price-cell mid">${formatPrice(prices.rainbow?.mid)}</span>
                <span class="mobile-price-cell market">${formatPrice(prices.rainbow?.market)}</span>
            </div>
        </div>

        <div class="mobile-price-history">
            <div class="mobile-price-history-label">
                <i data-lucide="trending-up"></i>
                Tendência (7 dias)
            </div>
            <div class="mobile-price-trend">
                <span class="mobile-price-trend-value">${formatPrice(prices.standard?.market)}</span>
                <span class="mobile-price-trend-change up">
                    <i data-lucide="arrow-up"></i>
                    +2.5%
                </span>
            </div>
        </div>
    `;

    container.innerHTML = html;
    refreshIcons();
}

// Populate mobile lists tab
function populateMobileListsTab(card) {
    const container = document.querySelector('.mobile-lists-content');
    if (!container) return;

    const cardName = card.name;
    const escapedCardName = cardName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const isInCollection = hasCard(cardName);
    const collectionQty = getCardQuantity(cardName);
    const isInWishlist = wishlist.has(cardName);
    const isInTradeBinder = tradeBinder.has(cardName);

    // Get decks that contain this card
    const decksWithCard = [];
    if (typeof deckService !== 'undefined' && deckService.decks) {
        deckService.decks.forEach(deck => {
            const cardInDeck = deck.cards?.find(c => c.name === cardName || c.cardName === cardName);
            if (cardInDeck) {
                decksWithCard.push({
                    name: deck.name,
                    qty: cardInDeck.qty || cardInDeck.quantity || 1
                });
            }
        });
    }

    let html = `
        <div class="mobile-lists-section">
            <div class="mobile-lists-section-header">
                <span class="mobile-lists-section-title">
                    <i data-lucide="folder"></i>
                    Coleção
                </span>
            </div>

            <div class="mobile-list-item ${isInCollection ? 'in-list' : ''}" onclick="toggleCollectionFromMobile('${escapedCardName}')">
                <div class="mobile-list-item-icon">
                    <i data-lucide="${isInCollection ? 'check-circle' : 'plus-circle'}"></i>
                </div>
                <div class="mobile-list-item-info">
                    <div class="mobile-list-item-name">Minha Coleção</div>
                    <div class="mobile-list-item-meta">${isInCollection ? `${collectionQty}x na coleção` : 'Toque para adicionar'}</div>
                </div>
                <div class="mobile-list-item-status">
                    <i data-lucide="${isInCollection ? 'check' : 'plus'}"></i>
                </div>
            </div>
        </div>

        <div class="mobile-lists-section">
            <div class="mobile-lists-section-header">
                <span class="mobile-lists-section-title">
                    <i data-lucide="heart"></i>
                    Listas
                </span>
            </div>

            <div class="mobile-list-item ${isInWishlist ? 'in-list' : ''}" onclick="toggleWishlistFromMobile('${escapedCardName}')">
                <div class="mobile-list-item-icon">
                    <i data-lucide="heart"></i>
                </div>
                <div class="mobile-list-item-info">
                    <div class="mobile-list-item-name">Wishlist</div>
                    <div class="mobile-list-item-meta">${isInWishlist ? 'Na sua lista de desejos' : 'Toque para adicionar'}</div>
                </div>
                <div class="mobile-list-item-status">
                    <i data-lucide="${isInWishlist ? 'check' : 'plus'}"></i>
                </div>
            </div>

            <div class="mobile-list-item ${isInTradeBinder ? 'in-list' : ''}" onclick="toggleTradeFromMobile('${escapedCardName}')">
                <div class="mobile-list-item-icon">
                    <i data-lucide="repeat"></i>
                </div>
                <div class="mobile-list-item-info">
                    <div class="mobile-list-item-name">Trade Binder</div>
                    <div class="mobile-list-item-meta">${isInTradeBinder ? 'Disponível para troca' : 'Toque para adicionar'}</div>
                </div>
                <div class="mobile-list-item-status">
                    <i data-lucide="${isInTradeBinder ? 'check' : 'plus'}"></i>
                </div>
            </div>
        </div>
    `;

    // Decks section
    if (decksWithCard.length > 0) {
        html += `
            <div class="mobile-lists-section">
                <div class="mobile-lists-section-header">
                    <span class="mobile-lists-section-title">
                        <i data-lucide="layers"></i>
                        Decks
                    </span>
                    <span class="mobile-lists-count">${decksWithCard.length}</span>
                </div>
        `;

        decksWithCard.forEach(deck => {
            html += `
                <div class="mobile-list-item in-list">
                    <div class="mobile-list-item-icon">
                        <i data-lucide="layers"></i>
                    </div>
                    <div class="mobile-list-item-info">
                        <div class="mobile-list-item-name">${escapeHtml(deck.name)}</div>
                        <div class="mobile-list-item-meta">${deck.qty}x neste deck</div>
                    </div>
                    <div class="mobile-list-item-status">
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    container.innerHTML = html;
    refreshIcons();
}

// Update mobile card bookmark state
function updateMobileCardBookmark(cardName) {
    const bookmarkBtn = document.getElementById('mobile-card-bookmark');
    if (!bookmarkBtn) return;

    const isInWishlist = wishlist.has(cardName);
    if (isInWishlist) {
        bookmarkBtn.classList.add('bookmarked');
        bookmarkBtn.innerHTML = '<i data-lucide="bookmark-check"></i>';
    } else {
        bookmarkBtn.classList.remove('bookmarked');
        bookmarkBtn.innerHTML = '<i data-lucide="bookmark"></i>';
    }
    refreshIcons(bookmarkBtn);
}

// Toggle collection from mobile lists tab
function toggleCollectionFromMobile(cardName) {
    if (hasCard(cardName)) {
        // Show quantity controls or remove
        addCardFromModal(cardName);
    } else {
        addCardFromModal(cardName);
    }

    // Update the lists tab
    const card = allCards.find(c => c.name === cardName);
    if (card) {
        setTimeout(() => populateMobileListsTab(card), 100);
    }
}

// Toggle wishlist from mobile lists tab
function toggleWishlistFromMobile(cardName) {
    toggleWishlistFromModal(cardName);

    // Update the lists tab
    const card = allCards.find(c => c.name === cardName);
    if (card) {
        setTimeout(() => {
            populateMobileListsTab(card);
            updateMobileCardBookmark(cardName);
        }, 100);
    }
}

// Toggle trade from mobile lists tab
function toggleTradeFromMobile(cardName) {
    toggleTradeFromModal(cardName);

    // Update the lists tab
    const card = allCards.find(c => c.name === cardName);
    if (card) {
        setTimeout(() => populateMobileListsTab(card), 100);
    }
}

// ============================================
// SMART SHARE FUNCTIONS
// Gera URLs com query params para Open Graph
// ============================================

/**
 * Gera URL de compartilhamento com query params para redes sociais
 */
function generateShareUrl(params = {}) {
    const url = new URL(window.location.origin + window.location.pathname);

    // Adiciona parâmetros
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });

    // Adiciona hash para navegação no app
    if (params.view) {
        url.hash = params.view;
    }

    return url.toString();
}

/**
 * Compartilha URL com suporte a Web Share API
 */
function smartShare(title, description, params = {}) {
    const url = generateShareUrl(params);

    if (navigator.share) {
        navigator.share({
            title: title,
            text: description,
            url: url
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copiado!', 'success');
        }).catch(() => {
            showToast('Erro ao copiar link', 'error');
        });
    }
}

// Share current card
function shareCurrentCard() {
    const cardName = document.getElementById('modal-card-name')?.textContent;
    if (!cardName) return;

    const card = allCards.find(c => c.name === cardName);
    if (!card) return;

    const slug = getCardSlug(card);

    smartShare(
        cardName,
        `Veja ${cardName} no Sorcery Portal Brasil`,
        { view: `card/${slug}`, card: cardName }
    );
}

// Precon card lists (from Curiosa.io official lists)
const PRECONS = {
    'beta-fire': {
        name: 'Fire Precon [Beta]',
        avatar: 'Flamecaller',
        cards: [
            { name: 'Flamecaller', qty: 1 },
            { name: 'Wildfire', qty: 1 },
            { name: 'Pit Vipers', qty: 2 },
            { name: 'Raal Dromedary', qty: 2 },
            { name: 'Lava Salamander', qty: 1 },
            { name: 'Rimland Nomads', qty: 2 },
            { name: 'Sacred Scarabs', qty: 2 },
            { name: 'Wayfaring Pilgrim', qty: 2 },
            { name: 'Colicky Dragonettes', qty: 1 },
            { name: 'Ogre Goons', qty: 3 },
            { name: 'Quarrelsome Kobolds', qty: 1 },
            { name: 'Clamor of Harpies', qty: 1 },
            { name: 'Hillock Basilisk', qty: 1 },
            { name: 'Petrosian Cavalry', qty: 1 },
            { name: 'Sand Worm', qty: 2 },
            { name: 'Askelon Phoenix', qty: 1 },
            { name: 'Escyllion Cyclops', qty: 1 },
            { name: 'Infernal Legion', qty: 1 },
            { name: 'Firebolts', qty: 2 },
            { name: 'Mad Dash', qty: 1 },
            { name: 'Blaze', qty: 1 },
            { name: 'Heat Ray', qty: 1 },
            { name: 'Minor Explosion', qty: 2 },
            { name: 'Fireball', qty: 1 },
            { name: 'Incinerate', qty: 1 },
            { name: 'Cone of Flame', qty: 1 },
            { name: 'Major Explosion', qty: 1 },
            { name: 'Arid Desert', qty: 4 },
            { name: 'Cornerstone', qty: 1 },
            { name: 'Red Desert', qty: 4 },
            { name: 'Remote Desert', qty: 4 },
            { name: 'Shifting Sands', qty: 2 },
            { name: 'Vesuvius', qty: 1 }
        ]
    },
    'beta-air': {
        name: 'Air Precon [Beta]',
        avatar: 'Sparkmage',
        cards: [
            { name: 'Sparkmage', qty: 1 },
            { name: 'Thunderstorm', qty: 1 },
            { name: 'Lucky Charm', qty: 1 },
            { name: 'Sling Pixies', qty: 1 },
            { name: 'Snow Leopard', qty: 2 },
            { name: 'Cloud Spirit', qty: 2 },
            { name: 'Dead of Night Demon', qty: 2 },
            { name: 'Spectral Stalker', qty: 2 },
            { name: 'Apprentice Wizard', qty: 2 },
            { name: 'Headless Haunt', qty: 2 },
            { name: 'Kite Archer', qty: 1 },
            { name: 'Midnight Rogue', qty: 2 },
            { name: 'Plumed Pegasus', qty: 2 },
            { name: 'Spire Lich', qty: 1 },
            { name: 'Gyre Hippogriffs', qty: 1 },
            { name: 'Skirmishers of Mu', qty: 1 },
            { name: 'Roaming Monster', qty: 1 },
            { name: 'Grandmaster Wizard', qty: 1 },
            { name: 'Nimbus Jinn', qty: 1 },
            { name: 'Highland Clansmen', qty: 1 },
            { name: 'Blink', qty: 2 },
            { name: 'Chain Lightning', qty: 2 },
            { name: 'Lightning Bolt', qty: 3 },
            { name: 'Teleport', qty: 1 },
            { name: 'Raise Dead', qty: 1 },
            { name: 'Cloud City', qty: 1 },
            { name: 'Dark Tower', qty: 3 },
            { name: 'Gothic Tower', qty: 3 },
            { name: 'Lone Tower', qty: 3 },
            { name: 'Mountain Pass', qty: 2 },
            { name: 'Observatory', qty: 1 },
            { name: 'Planar Gate', qty: 1 },
            { name: 'Updraft Ridge', qty: 2 }
        ]
    },
    'beta-water': {
        name: 'Water Precon [Beta]',
        avatar: 'Waveshaper',
        cards: [
            // Avatar (1)
            { name: 'Waveshaper', qty: 1 },
            // Aura (2)
            { name: 'Mariner\'s Curse', qty: 1 },
            { name: 'Flood', qty: 1 },
            // Artifact (1)
            { name: 'Sunken Treasure', qty: 1 },
            // Minion (24)
            { name: 'Porcupine Pufferfish', qty: 1 },
            { name: 'Sedge Crabs', qty: 1 },
            { name: 'Swamp Buffalo', qty: 2 },
            { name: 'Polar Bears', qty: 2 },
            { name: 'Swan Maidens', qty: 1 },
            { name: 'Tide Naiads', qty: 2 },
            { name: 'Brobdingnag Bullfrog', qty: 1 },
            { name: 'Coral-Reef Kelpie', qty: 2 },
            { name: 'Deep-Sea Mermaids', qty: 2 },
            { name: 'Guile Sirens', qty: 1 },
            { name: 'Tufted Turtles', qty: 1 },
            { name: 'Pirate Ship', qty: 2 },
            { name: 'Sea Serpent', qty: 2 },
            { name: 'Anui Undine', qty: 2 },
            { name: 'Seirawan Hydra', qty: 1 },
            { name: 'Diluvian Kraken', qty: 1 },
            // Magic (9)
            { name: 'Riptide', qty: 2 },
            { name: 'Drown', qty: 2 },
            { name: 'Font of Life', qty: 1 },
            { name: 'Ice Lance', qty: 2 },
            { name: 'Stormy Seas', qty: 1 },
            { name: 'Wrath of the Sea', qty: 1 },
            // Site (16)
            { name: 'Autumn River', qty: 3 },
            { name: 'Floodplain', qty: 2 },
            { name: 'Island Leviathan', qty: 1 },
            { name: 'Maelström', qty: 1 },
            { name: 'Spring River', qty: 3 },
            { name: 'Summer River', qty: 3 },
            { name: 'Undertow', qty: 3 }
        ]
    },
    'beta-earth': {
        name: 'Earth Precon [Beta]',
        avatar: 'Geomancer',
        cards: [
            // Avatar (1)
            { name: 'Geomancer', qty: 1 },
            // Aura (1)
            { name: 'Entangle Terrain', qty: 1 },
            // Artifact (3)
            { name: 'Siege Ballista', qty: 1 },
            { name: 'Rolling Boulder', qty: 1 },
            { name: 'Payload Trebuchet', qty: 1 },
            // Minion (24)
            { name: 'Wild Boars', qty: 2 },
            { name: 'Land Surveyor', qty: 2 },
            { name: 'Scent Hounds', qty: 2 },
            { name: 'Autumn Unicorn', qty: 2 },
            { name: 'Belmotte Longbowmen', qty: 3 },
            { name: 'Cave Trolls', qty: 3 },
            { name: 'Slumbering Giantess', qty: 1 },
            { name: 'Dalcean Phalanx', qty: 1 },
            { name: 'House Arn Bannerman', qty: 2 },
            { name: 'Pudge Butcher', qty: 1 },
            { name: 'Amazon Warriors', qty: 2 },
            { name: 'King of the Realm', qty: 1 },
            { name: 'Wraetannis Titan', qty: 1 },
            { name: 'Mountain Giant', qty: 1 },
            // Magic (8)
            { name: 'Divine Healing', qty: 1 },
            { name: 'Overpower', qty: 2 },
            { name: 'Border Militia', qty: 1 },
            { name: 'Bury', qty: 2 },
            { name: 'Cave-In', qty: 1 },
            { name: 'Craterize', qty: 1 },
            // Site (16)
            { name: 'Bedrock', qty: 1 },
            { name: 'Holy Ground', qty: 1 },
            { name: 'Humble Village', qty: 3 },
            { name: 'Quagmire', qty: 2 },
            { name: 'Rustic Village', qty: 3 },
            { name: 'Simple Village', qty: 3 },
            { name: 'Sinkhole', qty: 1 },
            { name: 'Vantage Hills', qty: 2 }
        ]
    },
    'gothic-necromancer': {
        name: 'Necromancer Precon [Gothic]',
        avatar: 'Necromancer',
        cards: [
            // Avatar (1)
            { name: 'Necromancer', qty: 1 },
            // Artifact (2)
            { name: 'Panpipes of Pnom', qty: 1 },
            { name: 'Corpse Catapult', qty: 1 },
            // Minion (25)
            { name: 'Bone Jumble', qty: 1 },
            { name: 'Fowl Bones', qty: 2 },
            { name: 'Bitter Departed', qty: 1 },
            { name: 'Ignited', qty: 2 },
            { name: 'Novice Necromancer', qty: 2 },
            { name: 'Noxious Corpse', qty: 1 },
            { name: 'Khamaseen Mummy', qty: 1 },
            { name: 'Order of the Pale Worm', qty: 1 },
            { name: 'Screamer', qty: 3 },
            { name: 'Snallygaster', qty: 2 },
            { name: 'Stygian Archers', qty: 1 },
            { name: 'Hotwheel', qty: 2 },
            { name: 'Dreadwing', qty: 1 },
            { name: 'Master Necromancer', qty: 1 },
            { name: 'Vesper Swarm', qty: 1 },
            { name: 'Those Who Linger', qty: 1 },
            { name: 'Draconian Bonekite', qty: 1 },
            { name: 'Stitched Abomination', qty: 1 },
            // Magic (9)
            { name: 'Bone Spear', qty: 3 },
            { name: 'Detonate', qty: 1 },
            { name: 'Carrionette', qty: 1 },
            { name: 'Kiss of Death', qty: 2 },
            { name: 'Witching Hour', qty: 1 },
            { name: 'Necronomiconcert', qty: 1 },
            // Site (16)
            { name: 'Accursed Desert', qty: 1 },
            { name: 'Accursed Tower', qty: 1 },
            { name: 'Darkest Dungeon', qty: 1 },
            { name: 'Den of Evil', qty: 1 },
            { name: 'Desert Bloom', qty: 1 },
            { name: 'Dread Thicket', qty: 1 },
            { name: 'Forsaken Crypt', qty: 1 },
            { name: 'Open Mausoleum', qty: 2 },
            { name: 'Sold-out Cemetery', qty: 1 },
            { name: 'Spire', qty: 2 },
            { name: 'Twilight Bloom', qty: 1 },
            { name: 'Vast Desert', qty: 1 },
            { name: 'Wasteland', qty: 2 }
        ]
    },
    'gothic-harbinger': {
        name: 'Harbinger Precon [Gothic]',
        avatar: 'Harbinger',
        cards: [
            // Avatar (1)
            { name: 'Harbinger', qty: 1 },
            // Aura (1)
            { name: 'Falling Star', qty: 1 },
            // Minion (26)
            { name: 'Aaj-kegon Ghost Crabs', qty: 1 },
            { name: 'Forsaken', qty: 2 },
            { name: 'Sea Witch', qty: 2 },
            { name: 'Static Servant', qty: 1 },
            { name: 'Willing Tribute', qty: 2 },
            { name: 'Mesmer Demon', qty: 2 },
            { name: 'Nommo Monitor', qty: 2 },
            { name: 'Bound Spirit', qty: 2 },
            { name: 'Frozen Horror', qty: 1 },
            { name: 'Lacuna Entity', qty: 1 },
            { name: 'Regurgitator', qty: 1 },
            { name: 'Slimy Mutants', qty: 1 },
            { name: 'Gnarled Wendigo', qty: 1 },
            { name: 'Hearkening Kraken', qty: 1 },
            { name: 'Shoggoth', qty: 2 },
            { name: 'Dormant Monstrosity', qty: 1 },
            { name: 'Ten-tonne Slug', qty: 2 },
            { name: 'Yog-Sothoth', qty: 1 },
            // Magic (9)
            { name: 'Gift of the Frog', qty: 2 },
            { name: 'Ice Shards', qty: 2 },
            { name: 'Monstermorphosis', qty: 1 },
            { name: 'Swap', qty: 1 },
            { name: 'Abyssal Assault', qty: 1 },
            { name: 'Into the Abyss', qty: 1 },
            { name: 'Call of the Sea', qty: 1 },
            // Site (16)
            { name: 'Accursed Tower', qty: 1 },
            { name: 'Algae Bloom', qty: 1 },
            { name: 'Croaking Swamp', qty: 2 },
            { name: 'Dark Alley', qty: 1 },
            { name: 'Deep Sea', qty: 1 },
            { name: 'Den of Evil', qty: 1 },
            { name: 'Elder Ruins', qty: 1 },
            { name: 'Peculiar Port', qty: 1 },
            { name: 'Spire', qty: 2 },
            { name: 'Stinging Kelp', qty: 2 },
            { name: 'Stream', qty: 2 },
            { name: 'Twilight Bloom', qty: 1 }
        ]
    },
    'gothic-persecutor': {
        name: 'Persecutor Precon [Gothic]',
        avatar: 'Persecutor',
        cards: [
            // Avatar (1)
            { name: 'Persecutor', qty: 1 },
            // Artifact (3)
            { name: 'Holy Water', qty: 1 },
            { name: 'Blade of Thorns', qty: 1 },
            { name: 'Peacemaker Arbalest', qty: 1 },
            // Minion (23)
            { name: 'One-shot Wizard', qty: 1 },
            { name: 'Flagellant', qty: 1 },
            { name: 'Flaming Skull', qty: 1 },
            { name: 'Holy Warrior', qty: 2 },
            { name: 'Kissers of Wounds', qty: 1 },
            { name: 'Lesser Blood Demon', qty: 2 },
            { name: 'Redmane Hyena', qty: 1 },
            { name: 'Wild Fanatic', qty: 2 },
            { name: 'Intrepid Hero', qty: 1 },
            { name: 'Martyrs of Tomorrow', qty: 1 },
            { name: 'Màzuj Ifrit', qty: 1 },
            { name: 'Angry Mob', qty: 1 },
            { name: 'Fallen Angel', qty: 1 },
            { name: 'Flayer', qty: 1 },
            { name: 'Greater Blood Demon', qty: 1 },
            { name: 'Shackled Demon', qty: 1 },
            { name: 'Zeppelin of Zealots', qty: 2 },
            { name: 'Cherubim', qty: 1 },
            { name: 'Undesirables', qty: 1 },
            // Magic (10)
            { name: 'Bind Evil', qty: 2 },
            { name: 'Blaze of Glory', qty: 1 },
            { name: 'Flame Strike', qty: 2 },
            { name: 'Lash', qty: 1 },
            { name: 'Trial by Fire', qty: 2 },
            { name: 'Wreathed in Righteousness', qty: 1 },
            { name: 'Release the Hounds', qty: 1 },
            // Site (16)
            { name: 'Active Volcano', qty: 1 },
            { name: 'Autumn Bloom', qty: 1 },
            { name: 'Blessed Village', qty: 1 },
            { name: 'Consecrated Ground', qty: 1 },
            { name: 'Desert Bloom', qty: 2 },
            { name: 'Hillside Chapel', qty: 1 },
            { name: 'Molten Maar', qty: 1 },
            { name: 'Purgatory', qty: 1 },
            { name: 'Road to Perdition', qty: 1 },
            { name: 'Valley', qty: 2 },
            { name: 'Vast Desert', qty: 2 },
            { name: 'Wasteland', qty: 2 }
        ]
    },
    'gothic-savior': {
        name: 'Savior Precon [Gothic]',
        avatar: 'Savior',
        cards: [
            // Avatar (1)
            { name: 'Savior', qty: 1 },
            // Artifact (2)
            { name: 'Flame of the First Ones', qty: 1 },
            { name: 'Makeshift Barricade', qty: 1 },
            // Minion (26)
            { name: 'Eltham Townsfolk', qty: 1 },
            { name: 'Revered Revenant', qty: 2 },
            { name: 'Serava Townsfolk', qty: 1 },
            { name: 'Town Priest', qty: 1 },
            { name: 'Angel Ascendant', qty: 1 },
            { name: 'Muddy Pigs', qty: 2 },
            { name: 'Survivors of Serava', qty: 2 },
            { name: 'Virgin in Prayer', qty: 2 },
            { name: 'Mayor of Milborne', qty: 1 },
            { name: 'Nightwatchmen', qty: 1 },
            { name: 'Order of the White Wing', qty: 1 },
            { name: 'Rowdy Boys', qty: 1 },
            { name: 'Search Party', qty: 3 },
            { name: 'Guardian Angel', qty: 1 },
            { name: 'Monks of Kobalsa', qty: 2 },
            { name: 'Weathered Trunks', qty: 2 },
            { name: 'Faith Incarnate', qty: 1 },
            { name: 'Malakhim', qty: 1 },
            // Magic (8)
            { name: 'Enduring Faith', qty: 1 },
            { name: 'Wave of Eviction', qty: 1 },
            { name: 'Baptize', qty: 1 },
            { name: 'Divine Lance', qty: 1 },
            { name: 'Holy Nova', qty: 1 },
            { name: 'Smite', qty: 2 },
            { name: 'Golden Dawn', qty: 1 },
            // Site (16)
            { name: 'Algae Bloom', qty: 1 },
            { name: 'Autumn Bloom', qty: 2 },
            { name: 'Blessed Village', qty: 2 },
            { name: 'Blessed Well', qty: 1 },
            { name: 'Consecrated Ground', qty: 1 },
            { name: 'Fertile Earth', qty: 1 },
            { name: 'Forlorn Keep', qty: 1 },
            { name: 'Mudslide', qty: 1 },
            { name: 'Stream', qty: 2 },
            { name: 'Troubled Town', qty: 2 },
            { name: 'Valley', qty: 2 }
        ]
    }
};

// CDN for card images
const IMAGE_CDN = 'https://d27a44hjr9gen3.cloudfront.net/cards/';

// DOM Elements
const loadingEl = document.getElementById('loading');
const cardsGridEl = document.getElementById('cards-grid');
const collectionGridEl = document.getElementById('collection-grid');
const wishlistGridEl = document.getElementById('wishlist-grid');
const resultsCountEl = document.getElementById('results-count');
const cardModal = document.getElementById('card-modal');

// ============================================
// VIRTUAL SCROLLING / INFINITE SCROLL
// ============================================
const CARDS_PER_BATCH = 48; // Load 48 cards at a time (4 rows of 12 or 6 rows of 8)
let currentCardIndex = 0;
let isLoadingMoreCards = false;
let cardsObserver = null;

// ============================================
// SEARCH OPTIMIZATION
// ============================================
const SEARCH_DEBOUNCE_MS = 150; // Fast debounce for responsive search
const FUZZY_THRESHOLD = 0.6; // Minimum similarity score (0-1) for fuzzy matches
let searchIndex = null; // Pre-computed search index for O(1) lookups

// ============================================
// FUZZY SEARCH
// ============================================

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;

    // Create distance matrix
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill in the rest
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,      // deletion
                dp[i][j - 1] + 1,      // insertion
                dp[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return dp[m][n];
}

// Calculate similarity score (0-1) between two strings
function similarityScore(str1, str2) {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    const distance = levenshteinDistance(str1, str2);
    return 1 - (distance / maxLen);
}

// Fuzzy search cards
function fuzzySearchCards(query, cards, threshold = FUZZY_THRESHOLD) {
    if (!query || query.length < 2) return cards;

    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    cards.forEach(card => {
        const normalizedName = card.name.toLowerCase();

        // Exact substring match (highest priority)
        if (normalizedName.includes(normalizedQuery)) {
            results.push({ card, score: 1, matchType: 'exact' });
            return;
        }

        // Check if query matches start of any word in the name
        const words = normalizedName.split(/\s+/);
        const startsWithWord = words.some(word => word.startsWith(normalizedQuery));
        if (startsWithWord) {
            results.push({ card, score: 0.95, matchType: 'word-start' });
            return;
        }

        // Fuzzy match on full name
        const score = similarityScore(normalizedQuery, normalizedName);
        if (score >= threshold) {
            results.push({ card, score, matchType: 'fuzzy' });
            return;
        }

        // Fuzzy match on individual words
        const wordScores = words.map(word => similarityScore(normalizedQuery, word));
        const bestWordScore = Math.max(...wordScores);
        if (bestWordScore >= threshold) {
            results.push({ card, score: bestWordScore * 0.9, matchType: 'fuzzy-word' });
        }
    });

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    return results.map(r => r.card);
}

// Check if fuzzy search should be used (when exact search returns few results)
function shouldUseFuzzySearch(query, exactResults) {
    if (!query || query.length < 3) return false;
    // Use fuzzy if exact search returned very few results
    return exactResults.length < 3;
}

// ============================================
// LUCIDE ICONS OPTIMIZATION
// ============================================
let lucideUpdatePending = false;
let lucideUpdateContainer = null;

// Optimized icon refresh - debounces multiple calls
function refreshIcons(container = null) {
    if (typeof lucide === 'undefined') return;

    // If specific container requested, store it
    if (container && !lucideUpdateContainer) {
        lucideUpdateContainer = container;
    } else if (!container) {
        // Full page update requested, clear specific container
        lucideUpdateContainer = null;
    }

    // Skip if update already pending
    if (lucideUpdatePending) return;

    lucideUpdatePending = true;

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        if (lucideUpdateContainer) {
            // Update only specific container
            const nodes = lucideUpdateContainer.querySelectorAll('[data-lucide]');
            if (nodes.length > 0) {
                lucide.createIcons({ nodes });
            }
        } else {
            // Full page update
            refreshIcons();
        }
        lucideUpdatePending = false;
        lucideUpdateContainer = null;
    });
}

// ============================================
// INDEXEDDB CACHE FOR CARDS
// ============================================
const CARDS_DB_NAME = 'sorcery-cards-cache';
const CARDS_DB_VERSION = 1;
const CARDS_STORE_NAME = 'cards';
const CARDS_CACHE_KEY = 'all-cards';
const CARDS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Open IndexedDB for cards cache
function openCardsDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(CARDS_DB_NAME, CARDS_DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(CARDS_STORE_NAME)) {
                db.createObjectStore(CARDS_STORE_NAME);
            }
        };
    });
}

// Get cards from cache
async function getCardsFromCache() {
    try {
        const db = await openCardsDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(CARDS_STORE_NAME, 'readonly');
            const store = tx.objectStore(CARDS_STORE_NAME);
            const request = store.get(CARDS_CACHE_KEY);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const cached = request.result;
                if (cached && cached.timestamp && Date.now() - cached.timestamp < CARDS_CACHE_TTL) {
                    resolve(cached.cards);
                } else {
                    resolve(null);
                }
            };
        });
    } catch (e) {
        return null;
    }
}

// Save cards to cache
async function saveCardsToCache(cards) {
    try {
        const db = await openCardsDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(CARDS_STORE_NAME, 'readwrite');
            const store = tx.objectStore(CARDS_STORE_NAME);
            const request = store.put({ cards, timestamp: Date.now() }, CARDS_CACHE_KEY);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (e) {
        console.warn('[Cache] Failed to save cards to IndexedDB:', e.message);
    }
}

// Build search index for fast card lookups
function buildSearchIndex() {
    searchIndex = new Map();
    allCards.forEach((card, index) => {
        const normalizedName = card.name.toLowerCase();
        searchIndex.set(normalizedName, index);
        // Also index partial prefixes for autocomplete-style search
        for (let i = 2; i <= normalizedName.length; i++) {
            const prefix = normalizedName.slice(0, i);
            if (!searchIndex.has(`prefix:${prefix}`)) {
                searchIndex.set(`prefix:${prefix}`, []);
            }
            searchIndex.get(`prefix:${prefix}`).push(index);
        }
    });
}

// Optimized debounce with leading edge option
function debounce(func, wait, options = {}) {
    let timeout;
    let lastArgs;
    const { leading = false } = options;

    return function executedFunction(...args) {
        lastArgs = args;
        const callNow = leading && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            if (!leading) {
                func.apply(this, lastArgs);
            }
        }, wait);

        if (callNow) {
            func.apply(this, args);
        }
    };
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // Hide welcome splash after animation
    const welcomeSplash = document.getElementById('welcome-splash');
    if (welcomeSplash) {
        setTimeout(() => {
            welcomeSplash.classList.add('hidden');
        }, 1700); // 1.2s delay + 0.5s fade
    }

    // IMPORTANT: Initialize auth FIRST before anything else
    initAuthUI();

    // Initialize VariantTracker globally
    if (typeof VariantTracker !== 'undefined' && !window.variantTracker) {
        window.variantTracker = new VariantTracker();
        console.log('[App] VariantTracker initialized');
    }

    // Now load user-specific data
    loadFromStorage();
    loadUserDecks();

    // If user is logged in but collection is empty (new browser/device), fetch from cloud
    if (typeof nocoDBService !== 'undefined' && nocoDBService.currentUser && collection.size === 0) {
        console.log('[Init] User logged in but collection empty, fetching from cloud...');
        fetchCollectionFromCloudSilently();
    }

    await loadCards();
    setupEventListeners();
    setupConfirmModalHandlers(); // Confirmation dialog handlers
    initDropdownAccessibility(); // Keyboard navigation for dropdowns
    restoreFilterState(); // Restore saved filter state
    loadPriceAlerts(); // Load price alerts
    loadTradeWants(); // Load trade wants
    applyFilters(); // Apply restored filters
    updateStats();

    // Check price alerts after a delay (let prices load)
    setTimeout(checkPriceAlerts, 3000);

    // Check for pending auto-sync from previous session
    setTimeout(checkPendingSync, 2000);

    // Handle trade links
    const urlParams = new URLSearchParams(window.location.search);
    const tradeParam = urlParams.get('trade');
    if (tradeParam) {
        setTimeout(() => handleTradeLink(tradeParam), 500);
    }

    // Handle share link parameters (for social media sharing)
    handleShareParams(urlParams);

    // Load community decks from server (in background)
    loadCommunityDecks();

    // Handle deep links (URL hash navigation)
    handleDeepLink();
});

// Load cards from API, cache, or local file
async function loadCards() {
    try {
        // Try IndexedDB cache first for instant load
        const cachedCards = await getCardsFromCache();
        if (cachedCards && cachedCards.length > 0) {
            allCards = cachedCards;
            filteredCards = [...allCards];
            buildSearchIndex();
            // Rebuild collection from VariantTracker now that allCards is loaded
            rebuildCollectionFromVariantTracker();
            // Refresh cache in background
            refreshCardsInBackground();
            return;
        }

        // No cache - load silently in background
        await loadCardsFromNetwork();
        // Rebuild collection from VariantTracker now that allCards is loaded
        rebuildCollectionFromVariantTracker();
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// Load cards from network (API or local file)
async function loadCardsFromNetwork() {
    let response;
    try {
        response = await fetch('https://api.sorcerytcg.com/api/cards');
        if (!response.ok) throw new Error('API error');
        allCards = await response.json();
    } catch (apiError) {
        // API failed, try local file as fallback
        response = await fetch('cards-database.json');
        const data = await response.json();
        // Convert from organized format to flat array
        allCards = [];
        for (const setName in data.sets) {
            const setData = data.sets[setName];
            setData.cards.forEach(card => {
                // Check if card already exists
                const existing = allCards.find(c => c.name === card.name);
                if (!existing) {
                    allCards.push({
                        name: card.name,
                        guardian: {
                            type: card.type,
                            rarity: card.rarity,
                            cost: card.cost,
                            attack: card.attack,
                            defence: card.defence,
                            rulesText: card.rulesText
                        },
                        elements: card.elements,
                        subTypes: card.subTypes,
                        sets: [{
                            name: setName,
                            variants: card.variants
                        }]
                    });
                } else {
                    // Add set to existing card
                    if (!existing.sets.find(s => s.name === setName)) {
                        existing.sets.push({
                            name: setName,
                            variants: card.variants
                        });
                    }
                }
            });
        }
    }
    filteredCards = [...allCards];
    buildSearchIndex();
    // Save to cache for next load
    saveCardsToCache(allCards);
}

// Refresh cards in background (when loaded from cache)
async function refreshCardsInBackground() {
    try {
        const response = await fetch('https://api.sorcerytcg.com/api/cards');
        if (response.ok) {
            const freshCards = await response.json();
            // Only update if data changed
            if (JSON.stringify(freshCards) !== JSON.stringify(allCards)) {
                allCards = freshCards;
                filteredCards = [...allCards];
                buildSearchIndex();
                saveCardsToCache(allCards);
                renderCards(); // Re-render with fresh data
            }
        }
    } catch (e) {
        // Silently fail - cached data is still usable
    }
}

// Get current user ID for per-user storage
function getCurrentUserId() {
    // Try nocoDBService first
    if (typeof nocoDBService !== 'undefined' && nocoDBService.currentUser) {
        return nocoDBService.currentUser.id || nocoDBService.currentUser.Id;
    }
    // Try localStorage session
    const session = localStorage.getItem('sorcery-session');
    if (session) {
        try {
            const user = JSON.parse(session);
            return user.id || user.Id;
        } catch (e) {
            console.warn('[Session] Failed to parse session:', e.message);
        }
    }
    return null;
}

/**
 * Clean up user-specific data on logout
 * This ensures data from one user doesn't leak to the next
 * @param {string} userId - The ID of the user logging out
 * @param {boolean} clearMemory - Whether to also clear in-memory data
 */
function cleanupUserDataOnLogout(userId, clearMemory = true) {
    console.log('[Logout] Cleaning up data for user:', userId);

    // Clear in-memory data
    if (clearMemory) {
        collection = new Map();
        wishlist = new Set();
        tradeBinder = new Set();
        tradeWants = new Set();
        ownedPrecons = new Set();
        decks = [];
    }

    // Clear security tokens from sessionStorage
    sessionStorage.removeItem('sorcery-csrf-token');
    sessionStorage.removeItem('sorcery-filter-state');

    // Clear pending sync data and password reset tokens
    localStorage.removeItem('sorcery-pending-sync');
    localStorage.removeItem('password-reset-token');

    // Reload services that cache user-specific data
    // This reloads them with empty user context
    if (typeof valueTracker !== 'undefined' && valueTracker.reload) {
        valueTracker.reload();
    }

    if (typeof window.variantTracker !== 'undefined' && window.variantTracker.loadFromStorage) {
        // Create new instance to get fresh storage key
        window.variantTracker = new VariantTracker();
    }

    if (typeof priceAlertManager !== 'undefined' && priceAlertManager.reload) {
        priceAlertManager.reload();
    }

    // Reload price services to clear any user-specific cache
    // SEGURANCA: Evita vazamento de dados entre usuários
    if (typeof priceService !== 'undefined') {
        priceService.nocodbPrices = {};
        priceService.nocodbLastSync = null;
    }

    if (typeof tcgcsvPriceService !== 'undefined') {
        // TCGCSV prices são globais (não user-specific), não precisa limpar
        // Mas forçar refresh na próxima sessão
        tcgcsvPriceService.lastUpdate = null;
    }

    // Clear gamification for logged out state
    if (typeof gamification !== 'undefined' && gamification.loadProgress) {
        gamification.unlockedAchievements = new Set();
        gamification.loadProgress();
    }

    // Clear dust tracker if exists
    if (typeof dustTracker !== 'undefined' && dustTracker.storageKey) {
        dustTracker.entries = [];
    }

    // Clear any open modals
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.classList.remove('modal-open');

    console.log('[Logout] User data cleanup complete');
}

/**
 * Periodically check session validity and auto-logout if expired
 * Runs every 60 seconds to catch session expiration while user is active
 */
let sessionCheckInterval = null;

function startSessionValidation() {
    // Clear any existing interval
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }

    // Check session every 60 seconds
    sessionCheckInterval = setInterval(() => {
        if (!nocoDBService.isLoggedIn()) return;

        // Try to load session using secure function (which checks expiration)
        if (typeof loadSecureSession === 'function') {
            const session = loadSecureSession();
            if (!session) {
                // Session expired - auto logout
                console.log('[Session] Session expired, logging out');
                const userId = getCurrentUserId();
                nocoDBService.logout();
                updateAuthUI();
                cleanupUserDataOnLogout(userId, true);
                document.dispatchEvent(new CustomEvent('userLoggedOut'));
                refreshCurrentView();
                showNotification('Sessão expirada. Faça login novamente.', 'warning');
            }
        }
    }, 60000); // Every 60 seconds
}

// Start session validation when user logs in
document.addEventListener('userLoggedIn', startSessionValidation);

// Stop validation on logout
document.addEventListener('userLoggedOut', () => {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
    }
});

// Start validation on page load if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    if (nocoDBService.isLoggedIn()) {
        startSessionValidation();
    }
});

// Migrate data from old storage keys if needed
// This handles cases where userId was stored as uppercase 'Id' vs lowercase 'id'
function migrateOldStorageKeys() {
    const userId = getCurrentUserId();
    if (!userId) return;

    // Check if current key has data
    const currentKey = `sorcery-collection-${userId}`;
    if (localStorage.getItem(currentKey)) return; // Already has data, no migration needed

    // Try to find data with alternate key formats
    // The userId might have been stored differently in old sessions
    const allKeys = Object.keys(localStorage);
    const collectionKeys = allKeys.filter(k => k.startsWith('sorcery-collection-') && k !== currentKey);

    for (const oldKey of collectionKeys) {
        const data = localStorage.getItem(oldKey);
        if (data) {
            // Found data with a different key, migrate it
            console.log(`[Migration] Found collection data in ${oldKey}, migrating to ${currentKey}`);
            localStorage.setItem(currentKey, data);

            // Also migrate wishlist and trade binder
            const oldSuffix = oldKey.replace('sorcery-collection-', '');
            const oldWishlist = localStorage.getItem(`sorcery-wishlist-${oldSuffix}`);
            const oldTradeBinder = localStorage.getItem(`sorcery-trade-binder-${oldSuffix}`);
            const oldPrecons = localStorage.getItem(`sorcery-precons-${oldSuffix}`);

            if (oldWishlist) {
                localStorage.setItem(`sorcery-wishlist-${userId}`, oldWishlist);
            }
            if (oldTradeBinder) {
                localStorage.setItem(`sorcery-trade-binder-${userId}`, oldTradeBinder);
            }
            if (oldPrecons) {
                localStorage.setItem(`sorcery-precons-${userId}`, oldPrecons);
            }

            // Also migrate variant collection
            const oldVariantKey = `sorcery_variant_collection_${oldSuffix}`;
            const newVariantKey = `sorcery_variant_collection_${userId}`;
            const oldVariants = localStorage.getItem(oldVariantKey);
            if (oldVariants && !localStorage.getItem(newVariantKey)) {
                localStorage.setItem(newVariantKey, oldVariants);
            }

            console.log('[Migration] Data migration complete');
            break; // Only migrate from the first found key
        }
    }
}

// Load data from localStorage (per-user if logged in)
function loadFromStorage() {
    const userId = getCurrentUserId();

    // Try to migrate old data if needed
    if (userId) {
        migrateOldStorageKeys();
    }

    // If logged in, load user-specific data
    if (userId) {
        const savedCollection = localStorage.getItem(`sorcery-collection-${userId}`);
        const savedWishlist = localStorage.getItem(`sorcery-wishlist-${userId}`);
        const savedTradeBinder = localStorage.getItem(`sorcery-trade-binder-${userId}`);

        // Load collection with full data support (backwards compatible)
        // New format: Map<cardName, {qty, addedAt}>
        collection = new Map();
        if (savedCollection) {
            const parsed = JSON.parse(savedCollection);
            const now = new Date().toISOString();

            if (Array.isArray(parsed)) {
                // Old format: array of card names
                parsed.forEach(cardName => {
                    if (typeof cardName === 'string') {
                        collection.set(cardName, { qty: 1, addedAt: now });
                    } else if (cardName && cardName.name) {
                        collection.set(cardName.name, { qty: cardName.qty || 1, addedAt: now });
                    }
                });
            } else if (typeof parsed === 'object') {
                Object.entries(parsed).forEach(([name, data]) => {
                    if (typeof data === 'number') {
                        // Old format: {cardName: qty}
                        collection.set(name, { qty: data, addedAt: now });
                    } else if (typeof data === 'object' && data !== null) {
                        // New format: {cardName: {qty, addedAt}}
                        collection.set(name, {
                            qty: data.qty || 1,
                            addedAt: data.addedAt || now
                        });
                    }
                });
            }
        }

        wishlist = savedWishlist ? new Set(JSON.parse(savedWishlist)) : new Set();
        tradeBinder = savedTradeBinder ? new Set(JSON.parse(savedTradeBinder)) : new Set();
    } else {
        // Not logged in - start with empty collections
        collection = new Map();
        wishlist = new Set();
        tradeBinder = new Set();
    }

    // Precons per-user (if logged in)
    if (userId) {
        const savedPrecons = localStorage.getItem(`sorcery-precons-${userId}`);
        if (savedPrecons) {
            ownedPrecons = new Set(JSON.parse(savedPrecons));
            ownedPrecons.forEach(preconId => {
                const checkbox = document.getElementById(`precon-${preconId}`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }

    // Rebuild collection from VariantTracker if it has more data
    // This runs AFTER allCards is loaded (called from loadCards)
}

// Rebuild collection Map entirely from VariantTracker data
// Called after allCards is loaded to ensure proper name matching
function rebuildCollectionFromVariantTracker() {
    const tracker = window.variantTracker;
    if (!tracker || !tracker.collection) return;

    const variantCardCount = Object.keys(tracker.collection).length;
    if (variantCardCount === 0) return;

    // Only rebuild if VariantTracker has significantly more data
    if (collection.size >= variantCardCount) {
        console.log('[Rebuild] Collection already has enough cards, skipping');
        return;
    }

    // Need allCards for proper name lookup
    if (typeof allCards === 'undefined' || allCards.length === 0) {
        console.log('[Rebuild] allCards not loaded yet, skipping');
        return;
    }

    console.log('[Rebuild] Rebuilding collection from VariantTracker...', variantCardCount, 'cards');

    // Build lookup: normalized name → proper card name from allCards
    const normalizedToProper = new Map();
    for (const card of allCards) {
        // Use same normalization as VariantTracker
        const normalized = card.name.toLowerCase().trim().replace(/\s+/g, '_');
        normalizedToProper.set(normalized, card.name);
    }

    // Clear and rebuild collection
    const oldSize = collection.size;
    collection.clear();

    const now = new Date().toISOString();

    for (const [normalizedName, cardData] of Object.entries(tracker.collection)) {
        if (!cardData || typeof cardData !== 'object') continue;

        // Get proper display name from allCards
        const properName = normalizedToProper.get(normalizedName);
        if (!properName) {
            console.warn('[Rebuild] Card not found in allCards:', normalizedName);
            continue;
        }

        // Sum quantities across all variants
        let totalQty = 0;
        let earliestDate = now;

        for (const variant of Object.values(cardData)) {
            if (variant && typeof variant === 'object') {
                totalQty += variant.qty || 1;
                if (variant.addedAt && variant.addedAt < earliestDate) {
                    earliestDate = variant.addedAt;
                }
            }
        }

        if (totalQty > 0) {
            collection.set(properName, { qty: totalQty, addedAt: earliestDate });
        }
    }

    console.log('[Rebuild] Collection rebuilt:', oldSize, '->', collection.size, 'cards');

    // Save the rebuilt collection
    const userId = getCurrentUserId();
    if (userId) {
        const collectionObj = {};
        collection.forEach((data, name) => {
            collectionObj[name] = data;
        });
        localStorage.setItem(`sorcery-collection-${userId}`, JSON.stringify(collectionObj));
        console.log('[Rebuild] Saved to localStorage');
    }
}

// Save data to localStorage (per-user if logged in)
function saveToStorage() {
    const userId = getCurrentUserId();

    if (userId) {
        // Save collection as object {cardName: {qty, addedAt}}
        const collectionObj = {};
        collection.forEach((data, name) => {
            collectionObj[name] = {
                qty: typeof data === 'object' ? data.qty : data,
                addedAt: typeof data === 'object' ? data.addedAt : new Date().toISOString()
            };
        });
        localStorage.setItem(`sorcery-collection-${userId}`, JSON.stringify(collectionObj));
        localStorage.setItem(`sorcery-wishlist-${userId}`, JSON.stringify([...wishlist]));
        localStorage.setItem(`sorcery-trade-binder-${userId}`, JSON.stringify([...tradeBinder]));
        localStorage.setItem(`sorcery-precons-${userId}`, JSON.stringify([...ownedPrecons]));

        // Trigger auto-sync to cloud (debounced)
        scheduleAutoSync();
    }
    // Save user-specific decks
    saveUserDecks();
}

// ============================================
// AUTO-SYNC TO CLOUD
// ============================================

let autoSyncTimeout = null;
let autoSyncPending = false;
const AUTO_SYNC_DELAY = 5000; // 5 seconds after last change

// Schedule auto-sync with debounce
function scheduleAutoSync() {
    if (!checkUserLoggedIn()) return;

    // Mark sync as pending
    autoSyncPending = true;
    updateSyncIndicator('pending');

    // Clear existing timeout
    if (autoSyncTimeout) {
        clearTimeout(autoSyncTimeout);
    }

    // Schedule new sync
    autoSyncTimeout = setTimeout(performAutoSync, AUTO_SYNC_DELAY);
}

// Perform the actual sync
async function performAutoSync() {
    if (!checkUserLoggedIn() || !autoSyncPending) return;

    try {
        updateSyncIndicator('syncing');

        // Convert collection Map to object format
        const collectionObj = {};
        collection.forEach((data, cardName) => {
            collectionObj[cardName] = {
                qty: typeof data === 'object' ? data.qty : data,
                addedAt: typeof data === 'object' ? data.addedAt : new Date().toISOString()
            };
        });

        // Sync to cloud
        await nocoDBService.fullSyncToCloud(
            collectionObj,
            [...wishlist],
            [...tradeBinder],
            decks
        );

        // Update last sync time
        const userId = getCurrentUserId();
        if (userId) {
            localStorage.setItem(`sorcery-last-sync-${userId}`, new Date().toISOString());
        }

        autoSyncPending = false;
        updateSyncIndicator('synced');
        console.log('[AutoSync] Collection synced to cloud successfully');

    } catch (error) {
        console.error('[AutoSync] Failed to sync:', error.message);
        updateSyncIndicator('error');
        // Retry after 30 seconds on error
        autoSyncTimeout = setTimeout(performAutoSync, 30000);
    }
}

// Update visual sync indicator
function updateSyncIndicator(status) {
    const indicator = document.getElementById('sync-status-indicator');
    if (!indicator) return;

    indicator.className = 'sync-indicator';
    indicator.classList.add(`sync-${status}`);

    const iconMap = {
        'pending': 'cloud-off',
        'syncing': 'cloud-upload',
        'synced': 'cloud',
        'error': 'cloud-alert'
    };

    const titleMap = {
        'pending': 'Alterações pendentes...',
        'syncing': 'Sincronizando...',
        'synced': 'Sincronizado',
        'error': 'Erro na sincronização'
    };

    indicator.innerHTML = `<i data-lucide="${iconMap[status]}"></i>`;
    indicator.title = titleMap[status];
    refreshIcons(indicator);
}

// Sync before page unload
window.addEventListener('beforeunload', (event) => {
    if (autoSyncPending && checkUserLoggedIn()) {
        // Perform synchronous-ish sync using sendBeacon if available
        const collectionObj = {};
        collection.forEach((data, cardName) => {
            collectionObj[cardName] = {
                qty: typeof data === 'object' ? data.qty : data,
                addedAt: typeof data === 'object' ? data.addedAt : new Date().toISOString()
            };
        });

        // Try to use sendBeacon for reliable delivery
        const syncData = JSON.stringify({
            collection: collectionObj,
            wishlist: [...wishlist],
            tradeBinder: [...tradeBinder],
            userId: getCurrentUserId()
        });

        // Store pending sync data for next session
        localStorage.setItem('sorcery-pending-sync', syncData);

        console.log('[AutoSync] Saved pending sync data for next session');
    }
});

// Check for pending sync on page load
function checkPendingSync() {
    const pendingSync = localStorage.getItem('sorcery-pending-sync');
    if (pendingSync && checkUserLoggedIn()) {
        console.log('[AutoSync] Found pending sync from previous session, syncing now...');
        localStorage.removeItem('sorcery-pending-sync');
        performAutoSync();
    }
}

// Load decks for current user
function loadUserDecks() {
    if (typeof nocoDBService === 'undefined' || !nocoDBService.isLoggedIn()) {
        decks = [];
        return;
    }
    const userId = nocoDBService.currentUser?.Id || nocoDBService.currentUser?.id;
    if (!userId) {
        decks = [];
        return;
    }
    const savedDecks = localStorage.getItem(`sorcery-decks-${userId}`);
    decks = savedDecks ? JSON.parse(savedDecks) : [];
}

// Save decks for current user
function saveUserDecks() {
    if (typeof nocoDBService === 'undefined' || !nocoDBService.isLoggedIn()) return;
    const userId = nocoDBService.currentUser?.Id || nocoDBService.currentUser?.id;
    if (!userId) return;
    localStorage.setItem(`sorcery-decks-${userId}`, JSON.stringify(decks));
}

// ============================================
// COLLECTION QUANTITY HELPERS
// ============================================

// Check if card is in collection
function hasCard(cardName) {
    const result = findCardInCollection(cardName);
    if (!result) return false;
    const qty = typeof result.data === 'object' ? result.data.qty : result.data;
    return qty > 0;
}

// Helper function to find card in collection (case-insensitive fallback)
function findCardInCollection(cardName) {
    // Try exact match first
    let data = collection.get(cardName);
    if (data) return { key: cardName, data };

    // Try case-insensitive match
    const lowerName = cardName.toLowerCase();
    for (const [key, value] of collection.entries()) {
        if (key.toLowerCase() === lowerName) {
            // Fix the key for future lookups
            collection.delete(key);
            collection.set(cardName, value);
            return { key: cardName, data: value };
        }
    }
    return null;
}

// Get quantity of a card in collection
function getCardQuantity(cardName) {
    const result = findCardInCollection(cardName);
    if (!result) return 0;
    return typeof result.data === 'object' ? result.data.qty : result.data;
}

// Get card data (qty and addedAt)
function getCardData(cardName) {
    const result = findCardInCollection(cardName);
    if (!result) return null;
    if (typeof result.data === 'object') return result.data;
    return { qty: result.data, addedAt: new Date().toISOString() };
}

// Add cards to collection (accumulates quantity)
function addToCollection(cardName, quantity = 1, showFeedback = true) {
    const existing = collection.get(cardName);
    const currentQty = existing ? (typeof existing === 'object' ? existing.qty : existing) : 0;
    const addedAt = existing && typeof existing === 'object' ? existing.addedAt : new Date().toISOString();
    const newQty = currentQty + quantity;

    collection.set(cardName, {
        qty: newQty,
        addedAt: addedAt
    });
    // Remove from wishlist if added to collection
    wishlist.delete(cardName);
    saveToStorage();

    // Visual feedback
    if (showFeedback) {
        highlightCardInGrid(cardName, 'added');
        if (quantity === 1) {
            showSuccessToast(`${cardName} adicionado à coleção (${newQty}x)`);
        } else {
            showSuccessToast(`${quantity}x ${cardName} adicionados (total: ${newQty})`);
        }
    }
}

// Remove cards from collection (decrements quantity)
function removeFromCollection(cardName, quantity = 1, showFeedback = true) {
    const existing = collection.get(cardName);
    if (!existing) return;

    const currentQty = typeof existing === 'object' ? existing.qty : existing;
    const addedAt = typeof existing === 'object' ? existing.addedAt : new Date().toISOString();
    const newQty = currentQty - quantity;

    // Store original state for undo
    const originalState = { qty: currentQty, addedAt };

    if (newQty <= 0) {
        collection.delete(cardName);
        saveToStorage();
        if (showFeedback) {
            highlightCardInGrid(cardName, 'removed');
            // Show undo toast when card is completely removed
            showUndoToast(`${cardName} removido da coleção`, () => {
                collection.set(cardName, originalState);
                saveToStorage();
                renderCollection();
                renderCards();
                updateStats();
            });
        }
    } else {
        collection.set(cardName, { qty: newQty, addedAt: addedAt });
        saveToStorage();
        if (showFeedback) {
            highlightCardInGrid(cardName, 'updated');
            showInfoToast(`${cardName} atualizado (${newQty}x restantes)`);
        }
    }
}

// Quick add to collection (from add cards modal)
function quickAddToCollection(cardName, event) {
    if (event) event.stopPropagation();
    addToCollection(cardName, 1, true);
    updateAddCardModalItem(cardName);
}

// Quick remove from collection (from add cards modal)
function quickRemoveFromCollection(cardName, event) {
    if (event) event.stopPropagation();
    const qty = getCardQuantity(cardName);
    if (qty <= 0) return;
    removeFromCollection(cardName, 1, true);
    updateAddCardModalItem(cardName);
}

// Update a single card item in the add cards modal
function updateAddCardModalItem(cardName) {
    const qty = getCardQuantity(cardName);
    const cardId = cardName.replace(/\s+/g, '-');

    // Update quantity badge
    const qtyBadge = document.getElementById(`qty-${cardId}`);
    if (qtyBadge) {
        qtyBadge.textContent = `${qty}x`;
        qtyBadge.classList.toggle('hidden', qty === 0);
    }

    // Update quick add buttons
    const cardItem = document.querySelector(`.add-card-item[data-card-name="${CSS.escape(cardName)}"]`);
    if (cardItem) {
        const qtySpan = cardItem.querySelector('.quick-qty');
        if (qtySpan) qtySpan.textContent = qty;

        const removeBtn = cardItem.querySelector('.quick-add-btn.remove');
        if (removeBtn) removeBtn.disabled = qty === 0;
    }

    refreshIcons();
}

// Set exact quantity for a card
function setCardQuantity(cardName, quantity, showFeedback = true) {
    const existing = collection.get(cardName);
    const wasInCollection = existing && (typeof existing === 'object' ? existing.qty > 0 : existing > 0);

    if (quantity <= 0) {
        collection.delete(cardName);
        if (showFeedback && wasInCollection) {
            highlightCardInGrid(cardName, 'removed');
            showInfoToast(`${cardName} removido da coleção`);
        }
    } else {
        const addedAt = existing && typeof existing === 'object' ? existing.addedAt : new Date().toISOString();
        collection.set(cardName, { qty: quantity, addedAt: addedAt });
        if (showFeedback) {
            highlightCardInGrid(cardName, wasInCollection ? 'updated' : 'added');
            showSuccessToast(`${cardName} atualizado para ${quantity}x`);
        }
    }
    // Remove from wishlist if added to collection
    if (quantity > 0) {
        wishlist.delete(cardName);
    }
    saveToStorage();
}

// Highlight card in grid with animation
function highlightCardInGrid(cardName, type = 'added') {
    const cardEl = document.querySelector(`.card-item[data-card-name="${CSS.escape(cardName)}"]`);
    if (!cardEl) return;

    // Remove existing highlight classes
    cardEl.classList.remove('card-highlight-added', 'card-highlight-removed', 'card-highlight-updated');

    // Add new highlight class
    cardEl.classList.add(`card-highlight-${type}`);

    // Remove after animation
    setTimeout(() => {
        cardEl.classList.remove(`card-highlight-${type}`);
    }, CARD_HIGHLIGHT_DURATION);
}

// Get total card count in collection
function getTotalCardCount() {
    let total = 0;
    collection.forEach(data => {
        total += typeof data === 'object' ? data.qty : data;
    });
    return total;
}

// Get unique card count in collection
function getUniqueCardCount() {
    return collection.size;
}

// Get card price (helper for sorting)
// If variant info is available, uses the specific variant's set for pricing
function getCardPrice(cardName, setName = null, finish = 'Standard') {
    const card = allCards.find(c => c.name === cardName);
    if (!card) return 0;

    // Ensure finish is a string
    const finishStr = typeof finish === 'string' ? finish : 'Standard';

    // Mapear finish para o formato esperado pelo tcgcsv (Normal, Foil, etc)
    const tcgcsvFinish = finishStr === 'Standard' ? 'Normal' : finishStr;

    // 1. Prioridade: tcgcsvPriceService (dados reais do TCGPlayer)
    // Usar getLowPrice para mostrar o preço MÍNIMO
    if (typeof tcgcsvPriceService !== 'undefined' && tcgcsvPriceService.cardPrices.size > 0) {
        const price = tcgcsvPriceService.getLowPrice(cardName, setName, tcgcsvFinish);
        if (price && price > 0) return price;
    }

    // 2. Fallback: priceService antigo
    if (typeof priceService === 'undefined') return 0;
    const variant = finishStr.toLowerCase() || 'standard';
    const price = priceService.getPrice(cardName, variant, setName);
    if (price) return price;

    // Fallback to estimated price
    return priceService.getEstimatedPrice(card, finishStr) || 0;
}

// Get total value of a card in collection based on actual variants owned
function getCardTotalValue(cardName) {
    // If VariantTracker is available, calculate value based on actual variants
    // Use global instance to ensure data consistency
    const tracker = window.variantTracker || (typeof VariantTracker !== 'undefined' ? new VariantTracker() : null);
    if (tracker) {
        const owned = tracker.getCollectionByCard(cardName);

        if (owned && owned.variants && Object.keys(owned.variants).length > 0) {
            let totalValue = 0;

            for (const [slug, variantData] of Object.entries(owned.variants)) {
                const qty = variantData.qty || 1;
                // Get set name from variant data or parse from slug
                let setName = variantData.set;
                if (!setName && slug) {
                    // Try to parse set from slug (format: set-cardname-product-finish)
                    try {
                        const parsed = typeof parseSlug === 'function' ? parseSlug(slug) : null;
                        setName = parsed?.setName || null;
                    } catch (e) {
                        setName = null;
                    }
                }
                // Ensure finish is a string
                const finish = typeof variantData.finish === 'string' ? variantData.finish : 'Standard';

                // Get price for this specific variant
                const price = getCardPrice(cardName, setName, finish);
                totalValue += price * qty;
            }

            return totalValue;
        }
    }

    // Fallback: use generic price * quantity
    const qty = getCardQuantity(cardName);
    const price = getCardPrice(cardName);
    return price * qty;
}

// ============================================
// ADD CARDS MODAL FUNCTIONS
// ============================================

let addCardsModalCard = null; // Track which card is being added
let cameFromAddCardsModal = false; // Track if card modal was opened from add cards modal
let addCardsModalState = null; // Preserve search/filter state

// Open the add cards modal
function openAddCardsModal(preserveState = false) {
    const modal = document.getElementById('add-cards-modal');
    if (!modal) return;

    modal.classList.remove('hidden');

    const searchInput = document.getElementById('add-cards-search');
    const elementFilter = document.getElementById('add-cards-element-filter');
    const typeFilter = document.getElementById('add-cards-type-filter');

    // Restore previous state if preserving, otherwise reset
    if (preserveState && addCardsModalState) {
        if (searchInput) searchInput.value = addCardsModalState.search || '';
        if (elementFilter) elementFilter.value = addCardsModalState.element || '';
        if (typeFilter) typeFilter.value = addCardsModalState.type || '';
    } else {
        // Clear and reset filters
        if (searchInput) searchInput.value = '';
        if (elementFilter) elementFilter.value = '';
        if (typeFilter) typeFilter.value = '';
    }

    // Trap focus for accessibility
    requestAnimationFrame(() => {
        trapFocus(modal);
        if (searchInput) searchInput.focus();
    });

    // Show results based on current filters
    filterAddCardsResults();

    // Initialize Lucide icons
    refreshIcons();
}

// Close the add cards modal
function closeAddCardsModal() {
    const modal = document.getElementById('add-cards-modal');
    if (modal) modal.classList.add('hidden');
    releaseFocusTrap();
}

// Filter and display results in the add cards modal
function filterAddCardsResults() {
    const searchInput = document.getElementById('add-cards-search');
    const elementFilter = document.getElementById('add-cards-element-filter');
    const typeFilter = document.getElementById('add-cards-type-filter');
    const resultsContainer = document.getElementById('add-cards-results');
    const resultsCount = document.getElementById('add-cards-results-count');

    if (!resultsContainer) return;

    const searchTerm = searchInput?.value.toLowerCase().trim() || '';
    const elementValue = elementFilter?.value || '';
    const typeValue = typeFilter?.value || '';

    // Filter cards
    let filtered = allCards.filter(card => {
        // Search filter
        if (searchTerm && !card.name.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Element filter
        if (elementValue && !(card.elements || '').includes(elementValue)) {
            return false;
        }

        // Type filter
        if (typeValue && card.guardian?.type !== typeValue) {
            return false;
        }

        return true;
    });

    // Limit to 50 results for performance
    const displayCards = filtered.slice(0, 50);

    // Update count
    if (resultsCount) {
        resultsCount.textContent = filtered.length;
    }

    // Render results
    resultsContainer.innerHTML = displayCards.map(card => {
        const imageSlug = getCardImageSlug(card);
        const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : '';
        const qty = getCardQuantity(card.name);
        const escapedNameAttr = escapeAttr(card.name);
        const escapedNameJs = card.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const safeId = card.name.replace(/[^a-zA-Z0-9]/g, '-');

        return `
            <div class="add-card-item" data-card-name="${escapedNameAttr}">
                <span class="add-card-item-qty ${qty > 0 ? '' : 'hidden'}" id="qty-${safeId}">${qty}x</span>
                <div class="add-card-item-preview" onclick="openCardQuantityModal('${escapedNameJs}', event)">
                    <img src="${imageUrl}" alt="${escapedNameAttr}" onerror="this.src='placeholder.png'">
                </div>
                <div class="add-card-item-info">
                    <div class="add-card-item-name" onclick="openCardQuantityModal('${escapedNameJs}', event)">${escapeHtml(card.name)}</div>
                    <div class="add-card-item-type">${card.guardian?.type || ''}</div>
                </div>
                <div class="add-card-item-actions">
                    <button class="quick-add-btn remove" onclick="quickRemoveFromCollection('${escapedNameJs}', event)" aria-label="Remover 1" ${qty === 0 ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <span class="quick-qty">${qty}</span>
                    <button class="quick-add-btn add" onclick="quickAddToCollection('${escapedNameJs}', event)" aria-label="Adicionar 1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Show message if no results
    if (displayCards.length === 0 && searchTerm) {
        resultsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>Nenhuma carta encontrada para "${searchTerm}"</p>
            </div>
        `;
    } else if (displayCards.length === 0) {
        resultsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>Digite o nome de uma carta para buscar</p>
            </div>
        `;
    }

    // Refresh Lucide icons for the quick add buttons
    refreshIcons();
}

// Open card detail from add cards modal - just opens the regular card modal
function openCardQuantityModal(cardName, event) {
    // Stop event propagation to prevent the click from closing the card modal
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    // Save current search/filter state before closing
    const searchInput = document.getElementById('add-cards-search');
    const elementFilter = document.getElementById('add-cards-element-filter');
    const typeFilter = document.getElementById('add-cards-type-filter');

    addCardsModalState = {
        search: searchInput?.value || '',
        element: elementFilter?.value || '',
        type: typeFilter?.value || ''
    };

    // Mark that we came from add cards modal
    cameFromAddCardsModal = true;

    // Close the add cards modal first
    closeAddCardsModal();

    // Open the full card detail modal with a small delay to prevent click propagation issues
    setTimeout(() => {
        openCardModal(cardName);
    }, 50);
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation - Primary buttons
    document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Navigation - Dropdown items
    document.querySelectorAll('.nav-dropdown-item[data-view]').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
        });
    });

    // Filters - use optimized debounce with fast response
    document.getElementById('search-input').addEventListener('input', debounce(applyFilters, SEARCH_DEBOUNCE_MS, { leading: true }));
    document.getElementById('set-filter').addEventListener('change', applyFilters);
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    document.getElementById('element-filter').addEventListener('change', applyFilters);
    document.getElementById('rarity-filter').addEventListener('change', applyFilters);
    document.getElementById('sort-filter')?.addEventListener('change', applyFilters);

    // Initialize keyword filter
    initKeywordFilter();

    // Collection search and filters
    document.getElementById('collection-search')?.addEventListener('input', debounce(renderCollection, SEARCH_DEBOUNCE_MS, { leading: true }));
    document.getElementById('collection-set-filter')?.addEventListener('change', renderCollection);
    document.getElementById('collection-type-filter')?.addEventListener('change', renderCollection);
    document.getElementById('collection-element-filter')?.addEventListener('change', renderCollection);
    document.getElementById('collection-rarity-filter')?.addEventListener('change', renderCollection);
    document.getElementById('collection-precon-filter')?.addEventListener('change', renderCollection);
    document.getElementById('collection-sort')?.addEventListener('change', renderCollection);

    // Precon modal click-outside to close
    const preconModal = document.getElementById('precon-modal');
    if (preconModal) {
        preconModal.addEventListener('click', (e) => {
            if (e.target === preconModal) {
                closePreconModal();
            }
        });
    }

    // Precon details modal click-outside to close
    const preconDetailsModal = document.getElementById('precon-details-modal');
    if (preconDetailsModal) {
        preconDetailsModal.addEventListener('click', (e) => {
            if (e.target === preconDetailsModal) {
                closePreconDetailsModal();
            }
        });
    }

    // Collection tabs (Cards / Decks)
    document.querySelectorAll('.collection-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            // Update active tab
            document.querySelectorAll('.collection-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Show/hide tab content
            document.querySelectorAll('#collection-content .tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`collection-${tabName}-tab`)?.classList.add('active');
            // Render decks if switching to decks tab
            if (tabName === 'decks') {
                renderUserDecks();
            }
        });
    });

    // Modal close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeCardAndDeckModals);
    });

    // Close modal on outside click
    cardModal.addEventListener('click', (e) => {
        if (e.target === cardModal) closeCardAndDeckModals();
    });

    // Close any modal with ESC key (accessibility)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close card modal
            if (!cardModal.classList.contains('hidden')) {
                closeCardAndDeckModals();
                releaseFocusTrap();
                return;
            }
            // Close any other open modal
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
            releaseFocusTrap();
        }
    });

    // Precon checkboxes
    document.querySelectorAll('[id^="precon-"]').forEach(checkbox => {
        checkbox.addEventListener('change', handlePreconChange);
    });

    // Add to collection/wishlist buttons
    document.getElementById('add-to-collection-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        toggleCollection(cardName);
    });

    document.getElementById('add-to-wishlist-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        toggleWishlist(cardName);
    });

    document.getElementById('add-to-trade-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        toggleTradeBinder(cardName);
    });

    // Share card button
    document.getElementById('share-card-btn')?.addEventListener('click', async () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        const success = await copyCardShareLink(cardName);
        const btn = document.getElementById('share-card-btn');
        if (success) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check"></i> Copiado!';
            btn.classList.add('success');
            refreshIcons();
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('success');
                refreshIcons();
            }, 2000);
        }
    });

    // QR Code button
    document.getElementById('qr-card-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name').textContent;
        toggleQRCode(cardName);
    });

    // Deck Builder buttons
    document.getElementById('save-deck-btn')?.addEventListener('click', saveDeckFromBuilder);
    document.getElementById('cancel-deck-btn')?.addEventListener('click', closeDeckBuilder);
    document.querySelector('#deck-builder-modal .close-modal')?.addEventListener('click', closeDeckBuilder);

    // Trade binder search
    document.getElementById('trade-search')?.addEventListener('input', debounce(renderTradeOffering, SEARCH_DEBOUNCE_MS, { leading: true }));
    document.getElementById('trade-want-search')?.addEventListener('input', debounce(renderTradeLookingFor, SEARCH_DEBOUNCE_MS, { leading: true }));

    // Price import/export
    document.getElementById('import-prices-btn')?.addEventListener('click', () => {
        document.getElementById('import-prices-file')?.click();
    });

    document.getElementById('import-prices-file')?.addEventListener('change', handlePriceImport);

    document.getElementById('export-prices-btn')?.addEventListener('click', () => {
        if (typeof priceService !== 'undefined') {
            const csv = priceService.exportPricesToCSV();
            downloadFile(csv, 'sorcery-prices.csv', 'text/csv');
        }
    });

    // Deck builder
    document.getElementById('new-deck-btn')?.addEventListener('click', openDeckBuilder);

    // Import deck
    document.getElementById('import-deck-btn')?.addEventListener('click', openImportDeckModal);
    document.getElementById('import-deck-cancel')?.addEventListener('click', () => closeModal('import-deck-modal'));
    document.getElementById('import-deck-submit')?.addEventListener('click', submitImportDeck);

    // Import tabs
    document.querySelectorAll('.import-tab').forEach(tab => {
        tab.addEventListener('click', () => switchImportTab(tab.dataset.tab));
    });

    // Import URL input
    document.getElementById('import-deck-url')?.addEventListener('input', debounce(handleImportUrlInput, 500));

    // Import text input
    document.getElementById('import-deck-text')?.addEventListener('input', debounce(handleImportTextInput, 300));

    // Import CSV file
    const csvUploadArea = document.getElementById('csv-upload-area');
    const csvFileInput = document.getElementById('import-csv-file');

    csvUploadArea?.addEventListener('click', () => csvFileInput?.click());
    csvUploadArea?.addEventListener('dragover', (e) => {
        e.preventDefault();
        csvUploadArea.classList.add('drag-over');
    });
    csvUploadArea?.addEventListener('dragleave', () => {
        csvUploadArea.classList.remove('drag-over');
    });
    csvUploadArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        csvUploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            handleCsvFileSelect(file);
        }
    });
    csvFileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleCsvFileSelect(file);
    });
    document.getElementById('csv-remove-btn')?.addEventListener('click', clearCsvFile);

    // Close import modal on backdrop click
    document.getElementById('import-deck-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'import-deck-modal') closeModal('import-deck-modal');
    });
}

// View information for breadcrumbs
const VIEW_INFO = {
    'home': {
        name: 'Início',
        category: null,
        slug: '',
        title: 'Sorcery: Contested Realm Brasil',
        description: 'O maior portal de Sorcery: Contested Realm do Brasil. Gerencie sua coleção, descubra decks, encontre lojas e conecte-se com a comunidade.'
    },
    'cards': {
        name: 'Cards',
        category: null,
        slug: 'cards',
        title: 'Catálogo de Cards | Sorcery: Contested Realm Brasil',
        description: 'Explore todos os cards de Sorcery: Contested Realm. Filtros por elemento, tipo, raridade e mais. Preços atualizados.'
    },
    'art': {
        name: 'Artistas',
        category: null,
        slug: 'artistas',
        title: 'Galeria de Artistas | Sorcery: Contested Realm Brasil',
        description: 'Conheça os artistas que ilustram Sorcery: Contested Realm. Arte tradicional pintada à mão por mestres da fantasia.'
    },
    'decks': {
        name: 'Decks',
        category: null,
        slug: 'decks',
        title: 'Decks da Comunidade | Sorcery: Contested Realm Brasil',
        description: 'Descubra decks da comunidade, construa o seu próprio deck e compartilhe estratégias de Sorcery: Contested Realm.'
    },
    'collection': {
        name: 'Coleção',
        category: null,
        slug: 'colecao',
        title: 'Minha Coleção | Sorcery: Contested Realm Brasil',
        description: 'Gerencie sua coleção de Sorcery: Contested Realm. Acompanhe progresso, valor e estatísticas dos seus cards.'
    },
    // Ferramentas
    'wishlist': {
        name: 'Wishlist',
        category: 'Ferramentas',
        categoryView: null,
        slug: 'wishlist',
        title: 'Wishlist | Sorcery: Contested Realm Brasil',
        description: 'Crie sua lista de desejos de cards de Sorcery: Contested Realm e acompanhe preços.'
    },
    'trade': {
        name: 'Trocas',
        category: 'Ferramentas',
        categoryView: null,
        slug: 'trocas',
        title: 'Trade Binder | Sorcery: Contested Realm Brasil',
        description: 'Organize seus cards para troca. Trade Binder e lista de procurados para facilitar trocas com a comunidade.'
    },
    'stats': {
        name: 'Estatísticas',
        category: 'Ferramentas',
        categoryView: null,
        slug: 'estatisticas',
        title: 'Estatísticas da Coleção | Sorcery: Contested Realm Brasil',
        description: 'Visualize estatísticas detalhadas da sua coleção de Sorcery: progresso por set, elemento, raridade e mais.'
    },
    // 'artist-stats' foi movido para abas dentro de 'art' - redireciona automaticamente
    'artist-stats': { name: 'Coleção por Artista', category: null, redirectTo: 'art', redirectTab: 'collection', slug: 'artistas/colecao' },
    // Aprender
    'codex': {
        name: 'Codex',
        category: 'Aprender',
        categoryView: null,
        slug: 'codex',
        title: 'Codex - Guia de Cards | Sorcery: Contested Realm Brasil',
        description: 'O codex completo de Sorcery: Contested Realm. Busca inteligente, detalhes de cards, estratégias e sinergias.'
    },
    'rulebook': {
        name: 'Rulebook',
        category: 'Aprender',
        categoryView: null,
        slug: 'regras',
        title: 'Regras de Sorcery - Rulebook Completo | Sorcery: Contested Realm Brasil',
        description: 'Aprenda a jogar Sorcery: Contested Realm. Rulebook oficial completo em português com exemplos.'
    },
    'faq': {
        name: 'FAQ',
        category: 'Aprender',
        categoryView: null,
        slug: 'faq',
        title: 'FAQ - Perguntas Frequentes | Sorcery: Contested Realm Brasil',
        description: 'Respostas para as dúvidas mais comuns sobre Sorcery: Contested Realm. Regras, mecânicas e interações.'
    },
    'lore': {
        name: 'Lore',
        category: 'Aprender',
        categoryView: null,
        slug: 'lore',
        title: 'Lore de Sorcery - História do Jogo | Sorcery: Contested Realm Brasil',
        description: 'Explore a rica história e lore de Sorcery: Contested Realm. Descubra os reinos e suas magias ancestrais.'
    },
    'quiz': {
        name: 'Quiz',
        category: 'Aprender',
        categoryView: null,
        slug: 'quiz',
        title: 'Quiz de Sorcery - Teste seu Conhecimento | Sorcery: Contested Realm Brasil',
        description: 'Teste seus conhecimentos sobre Sorcery: Contested Realm com nosso quiz interativo.'
    },
    'boosters': {
        name: 'Boosters',
        category: 'Aprender',
        categoryView: null,
        slug: 'boosters',
        title: 'Simulador de Boosters | Sorcery: Contested Realm Brasil',
        description: 'Simule abertura de boosters de Sorcery: Contested Realm. Experimente a emoção sem gastar!'
    },
    // Comunidade
    'forum': {
        name: 'Fórum',
        category: 'Comunidade',
        categoryView: 'community',
        slug: 'forum',
        title: 'Fórum da Comunidade | Sorcery: Contested Realm Brasil',
        description: 'Participe das discussões da comunidade brasileira de Sorcery. Dúvidas, estratégias, classificados e mais.'
    },
    'marketplace': {
        name: 'Marketplace',
        category: 'Comunidade',
        categoryView: 'community',
        slug: 'marketplace',
        title: 'Marketplace de Trocas | Sorcery: Contested Realm Brasil',
        description: 'Encontre pessoas para trocar cards de Sorcery: Contested Realm. Publique ofertas e encontre matches.'
    },
    'community': {
        name: 'Discord & Links',
        category: 'Comunidade',
        categoryView: null,
        slug: 'comunidade',
        title: 'Comunidade | Sorcery: Contested Realm Brasil',
        description: 'Conecte-se com a comunidade brasileira de Sorcery: Discord, grupos, canais e mais.'
    },
    'locator': {
        name: 'Lojas Brasil',
        category: 'Comunidade',
        categoryView: 'community',
        slug: 'lojas',
        title: 'Lojas de Sorcery no Brasil | Sorcery: Contested Realm Brasil',
        description: 'Encontre lojas que vendem Sorcery: Contested Realm no Brasil. Mapa interativo com todas as lojas.'
    },
    // Explorar
    'meta': {
        name: 'Meta & Tier List',
        category: 'Explorar',
        categoryView: null,
        slug: 'meta',
        title: 'Meta e Tier List | Sorcery: Contested Realm Brasil',
        description: 'Análise do meta atual de Sorcery: Contested Realm. Tier list de decks, avatares e estratégias competitivas.'
    },
    'top-cards': {
        name: 'Top Cards',
        category: 'Explorar',
        categoryView: null,
        slug: 'top-cards',
        title: 'Top Cards Mais Valiosos | Sorcery: Contested Realm Brasil',
        description: 'Ranking dos cards mais valiosos de Sorcery: Contested Realm. Preços atualizados e tendências.'
    },
    'timeline': {
        name: 'Timeline',
        category: 'Explorar',
        categoryView: null,
        slug: 'timeline',
        title: 'Timeline de Sorcery | Sorcery: Contested Realm Brasil',
        description: 'História dos lançamentos de Sorcery: Contested Realm. Sets, expansões e marcos importantes.'
    },
    'news': {
        name: 'Notícias',
        category: 'Explorar',
        categoryView: null,
        slug: 'noticias',
        title: 'Notícias de Sorcery | Sorcery: Contested Realm Brasil',
        description: 'Últimas notícias de Sorcery: Contested Realm em português. Spoilers, eventos e atualizações.'
    },
    // Outros
    'dust': {
        name: 'Dust Tracker',
        category: 'Ferramentas',
        categoryView: null,
        slug: 'dust',
        title: 'Dust Tracker | Sorcery: Contested Realm Brasil',
        description: 'Acompanhe seus Dust points de Sorcery: Contested Realm. Calcule recompensas e progresso.'
    },
    'promos': {
        name: 'Promos',
        category: 'Explorar',
        categoryView: null,
        slug: 'promos',
        title: 'Cards Promocionais | Sorcery: Contested Realm Brasil',
        description: 'Cards promocionais de Sorcery: Contested Realm. Promos exclusivas, eventos e edições especiais.'
    },
    'profile': {
        name: 'Perfil',
        category: null,
        slug: 'perfil',
        title: 'Perfil de Jogador | Sorcery: Contested Realm Brasil',
        description: 'Perfil público de jogador de Sorcery: Contested Realm.'
    }
};

// ============================================
// ROUTER - SISTEMA DE ROTAS E SEO
// ============================================

/**
 * Mapa de slug para viewName para navegação reversa
 */
const SLUG_TO_VIEW = {};
Object.entries(VIEW_INFO).forEach(([viewName, info]) => {
    if (info.slug) {
        SLUG_TO_VIEW[info.slug] = viewName;
    }
});

/**
 * Atualiza a URL do navegador com o hash da view atual
 */
function updateURLHash(viewName, params = {}) {
    const viewInfo = VIEW_INFO[viewName];
    if (!viewInfo || viewInfo.slug === undefined) return;

    let hash = viewInfo.slug;

    // Adiciona parâmetros extras se houver (ex: tab, id)
    const paramStr = Object.entries(params)
        .filter(([k, v]) => v)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

    if (paramStr) {
        hash += '?' + paramStr;
    }

    // Atualiza URL sem recarregar a página
    // Se hash está vazio (home), remove o hash da URL completamente
    const newUrl = hash ? `#${hash}` : window.location.pathname + window.location.search;
    const currentHash = window.location.hash;

    // Atualiza se o hash mudou (ou se estamos limpando o hash para ir para home)
    if ((hash && currentHash !== `#${hash}`) || (!hash && currentHash)) {
        history.pushState({ view: viewName, params }, '', newUrl);
    }
}

/**
 * Atualiza as meta tags SEO dinamicamente
 */
function updateSEOMeta(viewName, customData = {}) {
    const viewInfo = VIEW_INFO[viewName] || VIEW_INFO['home'];
    const baseUrl = 'https://sorcery.com.br';

    // Title
    const title = customData.title || viewInfo.title || 'Sorcery: Contested Realm Brasil';
    document.title = title;

    // Description
    const description = customData.description || viewInfo.description || '';

    // Canonical URL
    const canonicalUrl = viewInfo.slug ? `${baseUrl}/#${viewInfo.slug}` : baseUrl;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:url', canonicalUrl, 'name');

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.href = canonicalUrl;
    }

    // Update breadcrumb schema dynamically
    updateBreadcrumbSchema(viewName, viewInfo, baseUrl);
}

/**
 * Atualiza o schema de breadcrumb dinamicamente para SEO
 */
function updateBreadcrumbSchema(viewName, viewInfo, baseUrl) {
    const breadcrumbSchema = document.getElementById('breadcrumb-schema');
    if (!breadcrumbSchema) return;

    const items = [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl + "/"
        }
    ];

    // Se tem categoria, adiciona como segundo nível
    if (viewInfo.category) {
        items.push({
            "@type": "ListItem",
            "position": 2,
            "name": viewInfo.category,
            "item": baseUrl + "/#" + (viewInfo.categoryView || viewInfo.slug)
        });
    }

    // Adiciona a view atual se não for home
    if (viewName !== 'home') {
        items.push({
            "@type": "ListItem",
            "position": items.length + 1,
            "name": viewInfo.name,
            "item": baseUrl + (viewInfo.slug ? "/#" + viewInfo.slug : "/")
        });
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items
    };

    breadcrumbSchema.textContent = JSON.stringify(schema);
}

/**
 * Helper para atualizar uma meta tag específica
 */
function updateMetaTag(name, content, attr = 'name') {
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (meta) {
        meta.setAttribute('content', content);
    }
}

/**
 * Parseia o hash da URL e retorna view e parâmetros
 */
function parseURLHash() {
    const hash = window.location.hash.slice(1); // Remove #
    if (!hash) return { view: 'home', params: {} };

    // Separa slug de parâmetros
    const [slug, queryString] = hash.split('?');

    // Parse parâmetros
    const params = {};
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            params[key] = decodeURIComponent(value || '');
        });
    }

    // Casos especiais
    if (slug.startsWith('card/')) {
        return { view: 'card', cardSlug: slug.replace('card/', ''), params };
    }

    // Busca view pelo slug
    const viewName = SLUG_TO_VIEW[slug] || 'home';

    return { view: viewName, params };
}

/**
 * Handler para mudanças de hash (browser back/forward)
 */
function handleHashChange() {
    // Ignorar hashes especiais que são tratados por outros handlers
    const hash = window.location.hash;
    if (hash.startsWith('#reset-password')) {
        // Deixar checkResetPasswordURL() tratar este hash
        return;
    }

    const { view, params, cardSlug } = parseURLHash();

    // Caso especial: deep link para card
    if (cardSlug) {
        const result = findCardBySlug(cardSlug);
        if (result && result.card) {
            openCardModal(result.card.name, false);
        }
        return;
    }

    // Navega para a view
    if (view && view !== 'home') {
        switchView(view);

        // Aplica parâmetros extras (ex: tab)
        if (params.tab) {
            if (view === 'art' && typeof switchArtTab === 'function') {
                setTimeout(() => switchArtTab(params.tab), 100);
            } else if (view === 'trade' && typeof switchTradeTab === 'function') {
                setTimeout(() => switchTradeTab(params.tab), 100);
            }
        }
    } else {
        switchView('home');
    }
}

// Registra listener para navegação do browser (back/forward)
window.addEventListener('hashchange', handleHashChange);

/**
 * Compartilhar link da página atual com meta tags dinâmicos
 */
function shareCurrentPage() {
    const viewInfo = VIEW_INFO[currentViewName] || VIEW_INFO['home'];
    const title = viewInfo.name || 'Sorcery: Contested Realm Brasil';
    const description = getViewDescription(currentViewName);

    // Coleta contexto adicional da página atual
    const params = { view: currentViewName };

    // Adiciona contexto específico
    if (currentViewName === 'art') {
        const searchInput = document.getElementById('artist-search');
        if (searchInput?.value) {
            params.artist = searchInput.value;
        }
    } else if (currentViewName === 'cards') {
        const setFilter = document.getElementById('set-filter');
        const elementFilter = document.getElementById('element-filter');
        if (setFilter?.value && setFilter.value !== 'all') {
            params.set = setFilter.value;
        }
        if (elementFilter?.value && elementFilter.value !== 'all') {
            params.element = elementFilter.value;
        }
    }

    smartShare(title, description, params);
}
window.shareCurrentPage = shareCurrentPage;

/**
 * Retorna descrição da view para compartilhamento
 */
function getViewDescription(viewName) {
    const descriptions = {
        home: 'Seu hub completo de Sorcery TCG no Brasil',
        cards: 'Explore todos os cards de Sorcery: Contested Realm',
        art: 'Descubra os mestres por trás das obras de Sorcery',
        decks: 'Encontre decks competitivos e estratégias',
        collection: 'Gerencie sua coleção de Sorcery TCG',
        community: 'Encontre lojas de Sorcery no Brasil',
        meta: 'Acompanhe o metagame atual de Sorcery',
        codex: 'Regras e mecânicas de Sorcery explicadas',
        trade: 'Organize suas trocas de cards',
        wishlist: 'Sua lista de desejos de Sorcery',
        stats: 'Estatísticas da sua coleção',
        news: 'Últimas notícias de Sorcery'
    };
    return descriptions[viewName] || descriptions.home;
}

/**
 * Compartilha artista específico
 */
function shareArtist(artistName) {
    smartShare(
        `${artistName} | Artistas de Sorcery`,
        `Explore as obras de ${artistName} em Sorcery: Contested Realm`,
        { view: 'art', artist: artistName }
    );
}
window.shareArtist = shareArtist;

/**
 * Compartilha deck específico
 */
function shareDeck(deckName) {
    smartShare(
        `Deck: ${deckName} | Sorcery: Contested Realm Brasil`,
        `Confira o deck ${deckName} para Sorcery: Contested Realm`,
        { view: 'decks', deck: deckName }
    );
}
window.shareDeck = shareDeck;

// Update breadcrumb navigation
function updateBreadcrumb(viewName) {
    const breadcrumb = document.getElementById('breadcrumb');
    const categoryEl = document.getElementById('breadcrumb-category');
    const categorySeparator = document.getElementById('breadcrumb-category-separator');
    const categoryLink = document.getElementById('breadcrumb-category-link');
    const categoryText = document.getElementById('breadcrumb-category-text');
    const currentEl = document.getElementById('breadcrumb-current');

    if (!breadcrumb || !currentEl) return;

    const viewInfo = VIEW_INFO[viewName];

    // Hide breadcrumb on home
    if (viewName === 'home' || !viewInfo) {
        breadcrumb.classList.add('hidden');
        return;
    }

    breadcrumb.classList.remove('hidden');

    // Set current page name
    currentEl.textContent = viewInfo.name;

    // Handle category
    if (viewInfo.category) {
        categoryEl.classList.remove('hidden');
        categorySeparator.classList.remove('hidden');
        categoryText.textContent = viewInfo.category;

        // Set category link if there's a category view
        if (viewInfo.categoryView) {
            categoryLink.onclick = () => { showView(viewInfo.categoryView); return false; };
            categoryLink.style.cursor = 'pointer';
        } else {
            categoryLink.onclick = null;
            categoryLink.style.cursor = 'default';
        }
    } else {
        categoryEl.classList.add('hidden');
        categorySeparator.classList.add('hidden');
    }

    refreshIcons(breadcrumb);
}

// Switch View
// Track current view for sharing and SEO
let currentViewName = 'home';

function switchView(viewName) {
    // Scroll to top when switching views
    window.scrollTo(0, 0);

    // Update current view tracker
    currentViewName = viewName;

    // Update URL and SEO meta tags
    updateURLHash(viewName);
    updateSEOMeta(viewName);

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-dropdown-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-dropdown-trigger').forEach(t => t.classList.remove('has-active'));

    document.getElementById(`${viewName}-view`)?.classList.add('active');
    document.querySelector(`.nav-btn[data-view="${viewName}"]`)?.classList.add('active');

    const activeDropdownItem = document.querySelector(`.nav-dropdown-item[data-view="${viewName}"]`);
    if (activeDropdownItem) {
        activeDropdownItem.classList.add('active');
        // Mark parent dropdown trigger as having an active item
        const parentDropdown = activeDropdownItem.closest('.nav-dropdown');
        if (parentDropdown) {
            parentDropdown.querySelector('.nav-dropdown-trigger')?.classList.add('has-active');
        }
    }

    // Update breadcrumb
    updateBreadcrumb(viewName);

    // Refresh view content
    if (viewName === 'home') initHomeView();
    if (viewName === 'collection') renderCollection();
    if (viewName === 'wishlist') renderWishlist();
    if (viewName === 'stats') updateStatsWithPrices();
    if (viewName === 'artist-stats') { switchView('art'); setTimeout(() => switchArtTab('collection'), 100); return; }
    if (viewName === 'decks') renderCommunityDecks();
    if (viewName === 'trade') renderTradeBinder();
    if (viewName === 'locator') initLocatorView();
    if (viewName === 'codex') initCodexView();
    if (viewName === 'rulebook') initRulebookView();
    if (viewName === 'faq') initFAQView();
    if (viewName === 'lore') initLoreView();
    if (viewName === 'quiz') initQuizView();
    if (viewName === 'boosters') initBoostersView();
    // guides view removed
    if (viewName === 'community') initCommunityView();
    if (viewName === 'meta') initMetaView();
    if (viewName === 'art') initArtView();
    if (viewName === 'artists') { switchView('art'); return; } // Redirect to unified art view
    if (viewName === 'timeline') initTimelineView();
    if (viewName === 'dust') initDustView();
    if (viewName === 'promos') initPromosView();
    if (viewName === 'news') initNewsView();
    if (viewName === 'articles') articlesService.renderArticlesView();
    if (viewName === 'top-cards') initTopCardsView();
    if (viewName === 'marketplace') initMarketplaceView();
    if (viewName === 'forum') initForumView();
    if (viewName === 'notifications') initNotificationsView();

    // Update mobile app UI state
    updateBottomNavActiveState(viewName);
    updateFABVisibility(viewName);

    // Re-initialize Lucide icons for dynamic content
    refreshIcons();
}

// Stub functions for mobile app UI (not yet implemented)
function updateBottomNavActiveState(viewName) {
    // TODO: Update bottom navigation active state for mobile app
}

function updateFABVisibility(viewName) {
    // TODO: Update floating action button visibility for mobile app
}

// Global function for onclick handlers in HTML
function showView(viewName) {
    switchView(viewName);
}

// Initialize Community View
function initCommunityView() {
    if (typeof renderStores === 'function') {
        renderStores();
    }
    // Auto-load the stores map with a small delay to ensure container is visible
    if (typeof loadStoresMap === 'function') {
        setTimeout(() => {
            loadStoresMap();
        }, 100);
    }
}

// Initialize Meta View
function initMetaView() {
    renderTierList();
}

// Initialize Home View
function initHomeView() {
    // Update card count
    const totalCardsEl = document.getElementById('home-total-cards');
    if (totalCardsEl && allCards.length > 0) {
        totalCardsEl.textContent = allCards.length + '+';
    }
}

// Initialize Store Locator View
function initLocatorView() {
    renderLocatorStores();
    initLocatorFilters();
}

// Render stores in locator
function renderLocatorStores(filter = {}) {
    const container = document.getElementById('locator-results');
    if (!container) return;

    // Usar PHYSICAL_STORES se disponível, senão BRAZILIAN_STORES
    const storeList = typeof PHYSICAL_STORES !== 'undefined' ? PHYSICAL_STORES :
                      typeof BRAZILIAN_STORES !== 'undefined' ? BRAZILIAN_STORES : [];

    if (storeList.length === 0) return;

    let stores = [...storeList];

    // Apply filters
    if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        stores = stores.filter(store =>
            store.name.toLowerCase().includes(searchTerm) ||
            (store.city && store.city.toLowerCase().includes(searchTerm)) ||
            (store.state && store.state.toLowerCase().includes(searchTerm)) ||
            (store.address && store.address.toLowerCase().includes(searchTerm))
        );
    }

    if (filter.state) {
        stores = stores.filter(store => store.state === filter.state);
    }

    if (filter.type) {
        stores = stores.filter(store => store.type && store.type.includes(filter.type));
    }

    if (stores.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>Nenhuma loja encontrada com os filtros selecionados.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = stores.map((store, index) => {
        const hasAddress = store.address && store.city;
        const mapsUrl = typeof getGoogleMapsUrl === 'function' ? getGoogleMapsUrl(store) : '#';

        return `
            <div class="locator-store-item" data-index="${index}" onclick="selectStore(${index})">
                <div class="locator-store-header">
                    <div class="locator-store-name">${store.name}</div>
                    <div class="locator-store-badges">
                        <span class="locator-store-type">${store.type || 'Loja'}</span>
                        ${store.hasEvents ? '<span class="locator-badge events"><i data-lucide="calendar"></i> Eventos</span>' : ''}
                    </div>
                </div>
                ${hasAddress ? `
                    <div class="locator-store-address">
                        <i data-lucide="map-pin"></i>
                        <div>
                            <div>${store.address}</div>
                            <div class="locator-store-city">${store.city}, ${store.state}${store.cep ? ' - CEP: ' + store.cep : ''}</div>
                        </div>
                    </div>
                ` : ''}
                ${store.phone ? `
                    <div class="locator-store-phone">
                        <i data-lucide="phone"></i> ${store.phone}
                    </div>
                ` : ''}
                <div class="locator-store-desc">${store.description}</div>
                <div class="locator-store-links">
                    <a href="${store.url}" target="_blank" onclick="event.stopPropagation()" class="locator-link">
                        <i data-lucide="external-link"></i> Site
                    </a>
                    ${hasAddress ? `
                        <a href="${mapsUrl}" target="_blank" onclick="event.stopPropagation()" class="locator-link maps">
                            <i data-lucide="map"></i> Ver no Mapa
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Re-init icons
    refreshIcons();
}

// Select store in locator
function selectStore(index) {
    // Usar PHYSICAL_STORES se disponível
    const storeList = typeof PHYSICAL_STORES !== 'undefined' ? PHYSICAL_STORES :
                      typeof BRAZILIAN_STORES !== 'undefined' ? BRAZILIAN_STORES : [];

    const store = storeList[index];
    if (!store) return;

    // Update active state
    document.querySelectorAll('.locator-store-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.locator-store-item[data-index="${index}"]`)?.classList.add('active');

    // Update map container
    const mapContainer = document.getElementById('locator-map-container');
    if (!mapContainer) return;

    const hasAddress = store.address && store.city;
    const mapsUrl = typeof getGoogleMapsUrl === 'function' ? getGoogleMapsUrl(store) : '#';
    const embedUrl = typeof getGoogleMapsEmbed === 'function' ? getGoogleMapsEmbed(store) : null;

    // Se tem coordenadas, mostrar mapa embed
    if (embedUrl) {
        mapContainer.innerHTML = `
            <div class="map-embed-container">
                <iframe
                    src="${embedUrl}"
                    width="100%"
                    height="300"
                    style="border:0; border-radius: 12px;"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
            <div class="map-store-info">
                <h3>${store.name}</h3>
                <p class="store-type-badge">${store.type || 'Loja'}</p>
                ${hasAddress ? `
                    <div class="store-full-address">
                        <i data-lucide="map-pin"></i>
                        <div>
                            <strong>${store.address}</strong><br>
                            ${store.city}, ${store.state}${store.cep ? ' - CEP: ' + store.cep : ''}
                        </div>
                    </div>
                ` : ''}
                ${store.phone ? `
                    <p class="store-phone"><i data-lucide="phone"></i> ${store.phone}</p>
                ` : ''}
                <p class="store-description">${store.description}</p>
                <div class="store-actions">
                    <a href="${store.url}" target="_blank" class="btn primary">
                        <i data-lucide="external-link"></i> Visitar Site
                    </a>
                    <a href="${mapsUrl}" target="_blank" class="btn secondary">
                        <i data-lucide="navigation"></i> Abrir no Google Maps
                    </a>
                </div>
            </div>
        `;
    } else {
        // Sem coordenadas, mostrar apenas info
        mapContainer.innerHTML = `
            <div class="map-store-info no-map">
                <h3>${store.name}</h3>
                <p class="store-type-badge">${store.type || 'Loja'}</p>
                ${hasAddress ? `
                    <div class="store-full-address">
                        <i data-lucide="map-pin"></i>
                        <div>
                            <strong>${store.address}</strong><br>
                            ${store.city}, ${store.state}${store.cep ? ' - CEP: ' + store.cep : ''}
                        </div>
                    </div>
                ` : `
                    <p class="store-online-only">
                        <i data-lucide="globe"></i> Loja apenas online
                    </p>
                `}
                ${store.phone ? `
                    <p class="store-phone"><i data-lucide="phone"></i> ${store.phone}</p>
                ` : ''}
                <p class="store-description">${store.description}</p>
                <div class="store-actions">
                    <a href="${store.url}" target="_blank" class="btn primary">
                        <i data-lucide="external-link"></i> Visitar Site
                    </a>
                    ${hasAddress ? `
                        <a href="${mapsUrl}" target="_blank" class="btn secondary">
                            <i data-lucide="navigation"></i> Abrir no Google Maps
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }

    refreshIcons();
}

// Initialize locator filters
function initLocatorFilters() {
    const searchInput = document.getElementById('locator-search');
    const stateFilter = document.getElementById('locator-state-filter');
    const typeFilter = document.getElementById('locator-type-filter');

    const applyLocatorFilters = () => {
        renderLocatorStores({
            search: searchInput?.value || '',
            state: stateFilter?.value || '',
            type: typeFilter?.value || ''
        });
    };

    searchInput?.addEventListener('input', applyLocatorFilters);
    stateFilter?.addEventListener('change', applyLocatorFilters);
    typeFilter?.addEventListener('change', applyLocatorFilters);
}

// Initialize Rulebook View
function initRulebookView() {
    if (typeof renderRulebook === 'function') {
        renderRulebook();
    }
    initRulebookNavigation();
}

// Initialize rulebook navigation
function initRulebookNavigation() {
    const navLinks = document.querySelectorAll('.rulebook-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Initialize FAQ View
function initFAQView() {
    if (typeof renderFAQ === 'function') {
        renderFAQ();
    }
    // Re-init Lucide icons
    refreshIcons();
}

// Initialize Quiz View
function initQuizView() {
    if (typeof renderQuizStart === 'function') {
        renderQuizStart('quiz-container');
    }

    // Refresh lucide icons
    refreshIcons();
}

// Initialize Lore / Flavor Text View
function initLoreView() {
    // Initialize flavor text explorer if not done yet
    if (typeof flavorTextExplorer !== 'undefined' && allCards.length > 0) {
        if (flavorTextExplorer.cardsWithFlavor.length === 0) {
            flavorTextExplorer.init(allCards);
        }
        flavorTextExplorer.render();
    }

    // Setup event listeners
    const searchInput = document.getElementById('lore-search');
    const elementFilter = document.getElementById('lore-element-filter');

    searchInput?.addEventListener('input', debounce(() => {
        if (typeof flavorTextExplorer !== 'undefined') {
            flavorTextExplorer.search(searchInput.value);
            flavorTextExplorer.render();
        }
    }, SEARCH_DEBOUNCE_MS, { leading: true }));

    elementFilter?.addEventListener('change', () => {
        if (typeof flavorTextExplorer !== 'undefined') {
            flavorTextExplorer.filterByElement(elementFilter.value);
            flavorTextExplorer.render();
        }
    });

    // Refresh lucide icons
    refreshIcons();
}

// Initialize Deck Guides View
function initGuidesView() {
    if (typeof renderDeckGuides === 'function') {
        renderDeckGuides();
    }
    initGuidesNavigation();
}

// Initialize guides navigation
function initGuidesNavigation() {
    const navLinks = document.querySelectorAll('.guide-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Art View Data Cache
let artViewData = {
    artists: [],
    artistMap: new Map(),
    cardToArtist: new Map()
};

// Initialize Unified Art View
function initArtView() {
    const container = document.getElementById('art-view');
    if (!container) return;

    // Wait for cards to load
    if (!allCards.length) {
        const galleryContent = document.getElementById('art-gallery-content');
        if (galleryContent) galleryContent.innerHTML = '<p class="empty-state">Carregando artistas...</p>';
        setTimeout(initArtView, 500);
        return;
    }

    // Build artist data with cards mapping
    if (artViewData.artists.length === 0) {
        buildArtistData();
    }

    // Initialize the active tab (default: gallery)
    const activeTab = document.querySelector('.art-tab.active');
    const tabName = activeTab?.dataset.tab || 'gallery';
    switchArtTab(tabName);

    refreshIcons();
}

// ============================================
// ART VIEW TABS
// ============================================

/**
 * Switch between art view tabs
 */
function switchArtTab(tabName) {
    // Toggle tab buttons
    document.querySelectorAll('.art-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Toggle tab content
    document.querySelectorAll('.art-tab-content').forEach(content => {
        const isActive = content.id === `art-tab-${tabName}`;
        content.classList.toggle('active', isActive);
        content.classList.toggle('hidden', !isActive);
    });

    // Initialize tab-specific content
    switch (tabName) {
        case 'gallery':
            initArtGalleryTab();
            break;
        case 'collection':
            initArtCollectionTab();
            break;
        case 'alternate':
            initAlternateArtTab();
            break;
        case 'curios':
            initCuriosTab();
            break;
    }

    refreshIcons();
}
window.switchArtTab = switchArtTab;

/**
 * Initialize Gallery tab
 */
function initArtGalleryTab() {
    if (artViewData.artists.length === 0) {
        buildArtistData();
    }
    renderArtGallery(artViewData.artists);
    setupArtSearchFilters();
}

/**
 * Initialize Collection by Artist tab
 */
function initArtCollectionTab() {
    const loginPrompt = document.getElementById('art-collection-login-prompt');
    const content = document.getElementById('art-collection-content');

    if (!checkUserLoggedIn()) {
        loginPrompt?.classList.remove('hidden');
        content?.classList.add('hidden');
        refreshIcons();
        return;
    }

    loginPrompt?.classList.add('hidden');
    content?.classList.remove('hidden');

    if (artViewData.artists.length === 0) {
        buildArtistData();
    }
    renderArtistStats();
    setupArtistStatsFilters();
}

/**
 * Initialize Alternate Art tab
 */
function initAlternateArtTab() {
    const container = document.getElementById('alternate-art-content');
    if (!container) return;

    if (artViewData.cardToArtist.size === 0) {
        buildArtistData();
    }

    // Build a map of lowercase to original card names
    const cardNameMap = new Map();
    allCards.forEach(card => {
        cardNameMap.set(card.name.toLowerCase(), card.name);
    });

    // Find cards with multiple artists
    const multiArtistCards = [];
    artViewData.cardToArtist.forEach((artists, cardNameLower) => {
        if (artists.length > 1) {
            const originalName = cardNameMap.get(cardNameLower) || cardNameLower;
            multiArtistCards.push({ name: originalName, artists: artists });
        }
    });

    // Sort by number of artists (desc) then name (asc)
    multiArtistCards.sort((a, b) =>
        b.artists.length - a.artists.length || a.name.localeCompare(b.name)
    );

    container.innerHTML = `
        <div class="alternate-art-intro">
            <p>Estes cards possuem ilustrações de diferentes artistas, oferecendo variações visuais únicas para sua coleção.</p>
            <div class="alternate-stats">
                <span class="stat-highlight">${multiArtistCards.length}</span> cards com arte alternativa
            </div>
        </div>

        <div class="alternate-art-grid">
            ${multiArtistCards.map(card => `
                <div class="alternate-art-card" onclick="openCardModal('${card.name.replace(/'/g, "\\'")}')">
                    <h4>${capitalizeCardName(card.name)}</h4>
                    <div class="alternate-art-artists">
                        ${card.artists.map(artist => `
                            <span class="artist-chip" onclick="event.stopPropagation(); showArtistCards('${artist.replace(/'/g, "\\'")}')">
                                <i data-lucide="palette" style="width:14px;height:14px"></i>
                                ${artist}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    refreshIcons();
}

/**
 * Initialize Curios tab
 */
function initCuriosTab() {
    const container = document.getElementById('curios-content');
    if (!container) return;

    // Curio cards data from Collector Arthouse
    const curioData = {
        alpha: [
            {
                name: 'Grim Tangle',
                type: 'Protótipo',
                artist: 'Drew Tucker',
                description: 'Nome original do card que virou "Entangle Terrain". Drew Tucker foi o 3º artista comissionado para Sorcery. Footer mostra "KS2019 Full Art 25/300".',
                comparison: 'vs Entangle Terrain',
                url: 'https://www.collectorarthouse.com/curio/alpha/grim-tangle'
            },
            {
                name: 'Bloom of Frogs',
                type: 'Sketch Conceito',
                artist: 'Michal Nagypál',
                description: 'Sketch conceitual do card "Plague of Frogs". Michal foi o 2º artista comissionado. Apresenta símbolos de custo dramaticamente diferentes do design atual.',
                comparison: 'vs Plague of Frogs',
                url: 'https://www.collectorarthouse.com/curio/alpha/bloom-of-frogs'
            },
            {
                name: 'Bridge Troll',
                type: 'Arte Alternativa',
                artist: 'Vasiliy Ermolaev',
                description: 'Versão alternativa com cena da floresta, possivelmente uma das primeiras versões da arte de Vasiliy para criaturas do bosque.',
                comparison: 'vs Bridge Troll padrão',
                url: 'https://www.collectorarthouse.com/curio/alpha/bridge-troll'
            },
            {
                name: "Devil's Egg",
                type: 'Arte Alternativa',
                artist: 'Desconhecido',
                description: 'Uma das curios mais raras do Alpha, com arte completamente diferente da versão final.',
                comparison: "vs Devil's Egg padrão",
                url: 'https://www.collectorarthouse.com/curio/alpha/devils-egg'
            }
        ],
        beta: [
            {
                name: 'Avatar of Earth',
                type: 'Sketch Não-Colorido',
                artist: 'Séverine Pineaux',
                description: 'Sketch minimalista do Avatar de Terra dos precons Alpha. Mostra o processo criativo com linhas cruas e detalhadas.',
                comparison: 'vs Avatar of Earth colorido',
                url: 'https://www.collectorarthouse.com/curio/beta/avatar-of-earth'
            },
            {
                name: 'Avatar of Water',
                type: 'Sketch Não-Colorido',
                artist: 'Séverine Pineaux',
                description: 'Versão sketch do Avatar de Água, destacando a arte conceitual por trás desta figura elemental.',
                comparison: 'vs Avatar of Water colorido',
                url: 'https://www.collectorarthouse.com/curio/beta/avatar-of-water'
            },
            {
                name: 'Avatar of Fire',
                type: 'Sketch Não-Colorido',
                artist: 'Séverine Pineaux',
                description: 'Sketch do Avatar de Fogo mostrando as linhas cruas e detalhadas da arte original.',
                comparison: 'vs Avatar of Fire colorido',
                url: 'https://www.collectorarthouse.com/curio/beta/avatar-of-fire'
            },
            {
                name: 'Avatar of Air',
                type: 'Sketch Não-Colorido',
                artist: 'Séverine Pineaux',
                description: 'Completa o set de avatares elementais em versão sketch artística e colecionável.',
                comparison: 'vs Avatar of Air colorido',
                url: 'https://www.collectorarthouse.com/curio/beta/avatar-of-air'
            },
            {
                name: 'Adept Illusionist',
                type: 'Arte Invertida + Erro de Texto',
                artist: 'Original',
                description: 'Arte espelhada com erro proposital: texto diz "Duplicious means" em vez de "Duplicious Skills", combinando com o tema de ilusionista.',
                comparison: 'vs Adept Illusionist padrão',
                url: 'https://www.collectorarthouse.com/curio/beta/adept-illusionist'
            },
            {
                name: 'Black Obelisk',
                type: 'Símbolo de Set Errado',
                artist: 'Original',
                description: 'Carta Beta com símbolo do set Alpha! Anomalia de impressão altamente colecionável.',
                comparison: 'Símbolo Alpha em carta Beta',
                url: 'https://www.collectorarthouse.com/curio/beta/black-obelisk'
            },
            {
                name: 'Sirian Templar',
                type: 'Foil Híbrido',
                artist: 'Original',
                description: 'Foil com verso Spellbook e arte Alpha. Mistura única de estéticas de ambos os sets.',
                comparison: 'Arte Alpha + Verso Beta',
                url: 'https://www.collectorarthouse.com/curio/beta/sirian-templar'
            },
            {
                name: 'Critical Strike',
                type: 'Foil Híbrido',
                artist: 'Jeff Easley',
                description: 'Similar ao Sirian Templar: arte Alpha em foil com verso Spellbook Beta.',
                comparison: 'Arte Alpha + Verso Beta',
                url: 'https://www.collectorarthouse.com/curio/beta/critical-strike'
            },
            {
                name: 'Water Castle',
                type: 'Orientação Diferente',
                artist: 'Original',
                description: 'Status "Legendary" com orientação retrato única, diferente do layout paisagem típico.',
                comparison: 'Retrato vs Paisagem',
                url: 'https://www.collectorarthouse.com/curio/beta/water-castle'
            },
            {
                name: 'Far East Assassin',
                type: 'Arte Alternativa Sutil',
                artist: 'Original',
                description: 'Arte alternativa que remove o reflexo da espada, criando exclusividade sutil.',
                comparison: 'Sem reflexo da espada',
                url: 'https://www.collectorarthouse.com/curio/beta/far-east-assassin'
            },
            {
                name: 'Infernal Legion',
                type: 'Arte Alternativa',
                artist: 'Original',
                description: 'Arte mais antiga com cores mais claras e temática diferente da versão padrão.',
                comparison: 'Arte antiga vs atual',
                url: 'https://www.collectorarthouse.com/curio/beta/infernal-legion'
            },
            {
                name: 'West-East Dragon',
                type: 'Arte Invertida',
                artist: 'Original',
                description: 'Arte completamente espelhada com orientação do nome invertida.',
                comparison: 'Espelhado horizontalmente',
                url: 'https://www.collectorarthouse.com/curio/beta/west-east-dragon'
            },
            {
                name: 'Steppe',
                type: 'Arte Dupla',
                artist: 'Original',
                description: 'Arte alternativa mostrando os cards Crusade e Jihad lado a lado, criando dualidade visual impressionante.',
                comparison: 'Duas artes em uma',
                url: 'https://www.collectorarthouse.com/curio/beta/steppe'
            },
            {
                name: 'Extinguish',
                type: 'Variação de Cor/Texto',
                artist: 'Original',
                description: 'Cores mais escuras com texto alterado: "flickering" em vez de "guttering".',
                comparison: 'Cores e texto diferentes',
                url: 'https://www.collectorarthouse.com/curio/beta/extinguish'
            }
        ]
    };

    const typeIcons = {
        'Sketch Não-Colorido': 'pencil',
        'Sketch Conceito': 'pencil',
        'Protótipo': 'file-text',
        'Arte Alternativa': 'image',
        'Arte Alternativa Sutil': 'image',
        'Arte Invertida': 'flip-horizontal',
        'Arte Invertida + Erro de Texto': 'flip-horizontal',
        'Foil Híbrido': 'sparkles',
        'Símbolo de Set Errado': 'alert-circle',
        'Orientação Diferente': 'rotate-cw',
        'Arte Dupla': 'columns',
        'Variação de Cor/Texto': 'palette'
    };

    const typeColors = {
        'Sketch Não-Colorido': '#9CA3AF',
        'Sketch Conceito': '#9CA3AF',
        'Protótipo': '#F59E0B',
        'Arte Alternativa': '#8B5CF6',
        'Arte Alternativa Sutil': '#8B5CF6',
        'Arte Invertida': '#EC4899',
        'Arte Invertida + Erro de Texto': '#EC4899',
        'Foil Híbrido': '#D4AF37',
        'Símbolo de Set Errado': '#EF4444',
        'Orientação Diferente': '#06B6D4',
        'Arte Dupla': '#10B981',
        'Variação de Cor/Texto': '#F97316'
    };

    const renderCurioCard = (curio) => `
        <a href="${curio.url}" target="_blank" rel="noopener noreferrer" class="curio-card-link">
            <div class="curio-card">
                <div class="curio-card-header">
                    <span class="curio-type-badge" style="background: ${typeColors[curio.type] || '#6B7280'}20; color: ${typeColors[curio.type] || '#6B7280'}; border-color: ${typeColors[curio.type] || '#6B7280'}">
                        <i data-lucide="${typeIcons[curio.type] || 'help-circle'}" style="width:12px;height:12px"></i>
                        ${curio.type}
                    </span>
                </div>
                <h4 class="curio-card-name">${curio.name}</h4>
                <p class="curio-card-artist"><i data-lucide="palette" style="width:12px;height:12px"></i> ${curio.artist}</p>
                <p class="curio-card-description">${curio.description}</p>
                <div class="curio-card-comparison">
                    <i data-lucide="git-compare" style="width:14px;height:14px"></i>
                    <span>${curio.comparison}</span>
                </div>
                <div class="curio-card-link-indicator">
                    <i data-lucide="external-link" style="width:14px;height:14px"></i>
                    Ver no Collector Arthouse
                </div>
            </div>
        </a>
    `;

    container.innerHTML = `
        <div class="curios-intro">
            <div class="curios-intro-content">
                <h3><i data-lucide="sparkles"></i> O Mistério do Curio</h3>
                <p>
                    Curio são cartas <strong>extremamente raras</strong> escondidas em boosters de Sorcery: Contested Realm.
                    A Erik's Curiosa <em>não reconhece oficialmente</em> a existência dessas cartas, deixando que a comunidade
                    descubra e catalogue cada uma — uma experiência que remete à era dourada dos TCGs nos anos 90.
                </p>
                <p>
                    Descritas apenas como <em>"cartas mistério muito raras celebrando a história da criação de Sorcery"</em>,
                    o Curio inclui sketches de desenvolvimento, artes alternativas, erros propositais de impressão,
                    protótipos com nomes antigos e variantes únicas que contam a evolução do jogo.
                </p>
            </div>
            <div class="curios-stats">
                <div class="curio-stat">
                    <div class="curio-stat-value">~1:50</div>
                    <div class="curio-stat-label">caixas (estimado)</div>
                </div>
                <div class="curio-stat">
                    <div class="curio-stat-value">$500-$5k+</div>
                    <div class="curio-stat-label">valor de mercado</div>
                </div>
                <div class="curio-stat">
                    <div class="curio-stat-value">${curioData.alpha.length + curioData.beta.length}+</div>
                    <div class="curio-stat-label">descobertos</div>
                </div>
            </div>
        </div>

        <div class="curios-types-section">
            <h3><i data-lucide="layers"></i> Tipos de Curio</h3>
            <div class="curios-types-grid">
                <div class="curio-type-item">
                    <i data-lucide="pencil" style="color: #9CA3AF"></i>
                    <div>
                        <strong>Sketches</strong>
                        <span>Versões não-coloridas mostrando o processo criativo</span>
                    </div>
                </div>
                <div class="curio-type-item">
                    <i data-lucide="image" style="color: #8B5CF6"></i>
                    <div>
                        <strong>Arte Alternativa</strong>
                        <span>Ilustrações diferentes ou versões anteriores</span>
                    </div>
                </div>
                <div class="curio-type-item">
                    <i data-lucide="flip-horizontal" style="color: #EC4899"></i>
                    <div>
                        <strong>Arte Invertida</strong>
                        <span>Artes espelhadas, às vezes com erros de texto</span>
                    </div>
                </div>
                <div class="curio-type-item">
                    <i data-lucide="file-text" style="color: #F59E0B"></i>
                    <div>
                        <strong>Protótipos</strong>
                        <span>Cards com nomes ou designs antigos de desenvolvimento</span>
                    </div>
                </div>
                <div class="curio-type-item">
                    <i data-lucide="sparkles" style="color: #D4AF37"></i>
                    <div>
                        <strong>Foils Híbridos</strong>
                        <span>Misturas de elementos de diferentes sets</span>
                    </div>
                </div>
                <div class="curio-type-item">
                    <i data-lucide="alert-circle" style="color: #EF4444"></i>
                    <div>
                        <strong>Anomalias</strong>
                        <span>Erros propositais de símbolo, cor ou texto</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="curios-gallery-section">
            <div class="curios-set-header">
                <h3><i data-lucide="box"></i> Curio do Alpha</h3>
                <span class="curios-set-count">${curioData.alpha.length} descobertos</span>
            </div>
            <div class="curios-gallery">
                ${curioData.alpha.map(renderCurioCard).join('')}
            </div>
        </div>

        <div class="curios-gallery-section">
            <div class="curios-set-header">
                <h3><i data-lucide="box"></i> Curio do Beta</h3>
                <span class="curios-set-count">${curioData.beta.length} descobertos</span>
            </div>
            <div class="curios-gallery">
                ${curioData.beta.map(renderCurioCard).join('')}
            </div>
        </div>

        <div class="curios-resources">
            <h3><i data-lucide="bookmark"></i> Recursos da Comunidade</h3>
            <p>O <strong>Collector Arthouse</strong>, mantido por Mike Servati, é a principal fonte de informações sobre Curio, com arquivo completo de todas as descobertas e comparações detalhadas.</p>
            <div class="curios-links">
                <a href="https://www.collectorarthouse.com/curio-cards" target="_blank" rel="noopener noreferrer" class="curios-resource-link primary">
                    <i data-lucide="archive"></i>
                    <div>
                        <strong>Catálogo Completo de Curio</strong>
                        <span>Arquivo oficial com todas as descobertas</span>
                    </div>
                    <i data-lucide="external-link"></i>
                </a>
                <a href="https://www.collectorarthouse.com/sorcery-cards/alpha-beta" target="_blank" rel="noopener noreferrer" class="curios-resource-link">
                    <i data-lucide="image"></i>
                    <div>
                        <strong>Galeria Alpha/Beta</strong>
                        <span>Comparar artes originais vs curios</span>
                    </div>
                    <i data-lucide="external-link"></i>
                </a>
                <a href="https://discord.gg/collectorarthouse" target="_blank" rel="noopener noreferrer" class="curios-resource-link">
                    <i data-lucide="message-circle"></i>
                    <div>
                        <strong>Discord Collector Arthouse</strong>
                        <span>Comunidade para identificar novos curios</span>
                    </div>
                    <i data-lucide="external-link"></i>
                </a>
            </div>
        </div>
    `;

    refreshIcons();
}

/**
 * Capitalize card name (helper function)
 */
function capitalizeCardName(str) {
    return str.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Build artist data from cards
function buildArtistData() {
    artViewData.artistMap = new Map();
    artViewData.cardToArtist = new Map();

    allCards.forEach(card => {
        if (card.sets) {
            card.sets.forEach(set => {
                if (set.variants) {
                    set.variants.forEach(variant => {
                        if (variant.artist) {
                            const artistName = variant.artist.trim();

                            // Add to artist map
                            if (!artViewData.artistMap.has(artistName)) {
                                artViewData.artistMap.set(artistName, {
                                    name: artistName,
                                    cardCount: 0,
                                    cards: [],
                                    seenCards: new Set()
                                });
                            }

                            const artist = artViewData.artistMap.get(artistName);

                            // Only count unique card names (same art across sets)
                            if (!artist.seenCards.has(card.name)) {
                                artist.seenCards.add(card.name);
                                artist.cardCount++;
                                artist.cards.push({
                                    name: card.name,
                                    set: set.name
                                });
                            }

                            // Map card name to artists
                            const cardKey = card.name.toLowerCase();
                            if (!artViewData.cardToArtist.has(cardKey)) {
                                artViewData.cardToArtist.set(cardKey, []);
                            }
                            if (!artViewData.cardToArtist.get(cardKey).includes(artistName)) {
                                artViewData.cardToArtist.get(cardKey).push(artistName);
                            }
                        }
                    });
                }
            });
        }
    });

    // Convert to sorted array and clean up temp data
    artViewData.artists = Array.from(artViewData.artistMap.values())
        .map(a => { delete a.seenCards; return a; })
        .sort((a, b) => b.cardCount - a.cardCount);
}

// Setup search filters
function setupArtSearchFilters() {
    const artistSearch = document.getElementById('art-artist-search');
    const cardSearch = document.getElementById('art-card-search');

    if (artistSearch) {
        artistSearch.oninput = () => filterArtGallery();
    }

    if (cardSearch) {
        cardSearch.oninput = () => filterArtGallery();
    }
}

// Filter art gallery based on search inputs
function filterArtGallery() {
    const artistQuery = document.getElementById('art-artist-search')?.value.trim().toLowerCase() || '';
    const cardQuery = document.getElementById('art-card-search')?.value.trim().toLowerCase() || '';

    let filtered = artViewData.artists;

    // Filter by artist name
    if (artistQuery) {
        filtered = filtered.filter(a => a.name.toLowerCase().includes(artistQuery));
    }

    // Filter by card name (find artists who illustrated this card)
    if (cardQuery) {
        const matchingArtists = new Set();

        // Search through card-to-artist mapping
        artViewData.cardToArtist.forEach((artists, cardName) => {
            if (cardName.includes(cardQuery)) {
                artists.forEach(a => matchingArtists.add(a));
            }
        });

        // Also search through artist's card lists
        filtered.forEach(artist => {
            if (artist.cards.some(c => c.name.toLowerCase().includes(cardQuery))) {
                matchingArtists.add(artist.name);
            }
        });

        filtered = filtered.filter(a => matchingArtists.has(a.name));
    }

    renderArtGallery(filtered, cardQuery);
}

// Render art gallery grid
function renderArtGallery(artists, highlightCard = '') {
    const container = document.getElementById('art-gallery-content');
    if (!container) return;

    // Show the header, philosophy and filters when returning to gallery
    const artView = document.getElementById('art-view');
    if (artView) {
        const sectionHeader = artView.querySelector('.section-header');
        const artPhilosophy = artView.querySelector('.art-philosophy');
        const galleryHeader = artView.querySelector('.art-gallery-section > h3');
        const galleryDesc = artView.querySelector('.art-gallery-section > .section-desc');
        const searchFilters = artView.querySelector('.art-search-filters');

        if (sectionHeader) sectionHeader.style.display = '';
        if (artPhilosophy) artPhilosophy.style.display = '';
        if (galleryHeader) galleryHeader.style.display = '';
        if (galleryDesc) galleryDesc.style.display = '';
        if (searchFilters) searchFilters.style.display = '';
    }

    if (!artists || !artists.length) {
        container.innerHTML = '<p class="empty-state">Nenhum artista encontrado</p>';
        return;
    }

    container.innerHTML = `
        <div class="artists-grid">
            ${artists.slice(0, 100).map((artist, index) => {
                // Get sample cards (up to 3)
                const sampleCards = artist.cards.slice(0, 3);
                const initials = artist.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const artistInfo = ARTIST_INFO[artist.name];
                const photoHtml = artistInfo?.photo
                    ? `<img src="${artistInfo.photo}" alt="${artist.name}" class="artist-photo-img">`
                    : `<span>${initials}</span>`;

                return `
                    <div class="artist-card-full" onclick="showArtistCards('${artist.name.replace(/'/g, "\\'")}')">
                        <div class="artist-photo">${photoHtml}</div>
                        <div class="artist-details">
                            <h4>${artist.name}</h4>
                            <span class="card-count">${artist.cardCount} ilustrações</span>
                            <div class="sample-cards">
                                ${sampleCards.map(c => `
                                    <span class="sample-card-tag">${c.name}</span>
                                `).join('')}
                                ${artist.cards.length > 3 ? `<span class="sample-card-tag">+${artist.cards.length - 3}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    refreshIcons();
}

// Artist bio/info database - Portuguese translations with links and photos
// Data from official Sorcery TCG artist pages: https://sorcerytcg.com/art/
const ARTIST_INFO = {
    'Adam Burke': {
        bio: 'Nascido no Oregon e criado no Noroeste do Pacífico, ilustrador profissional desde 2010. Sua arte destaca aspectos frequentemente ignorados da natureza, capturando o caos aparente nas formas naturais.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/5a2693e5a5d51eed481be2aab98d8d7b7b71723e-640x640.jpg',
        links: { instagram: 'https://www.instagram.com/nightjarillustration/' }
    },
    'Adam Kašpar': {
        bio: 'Figura de destaque na pintura realista tcheca contemporânea, conhecido por capturar a atmosfera de natureza intocada, especialmente florestas profundas. Usa câmeras, telescópios e microscópios em seu processo artístico.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/e34b77b55c6358681890ddda76c17cb6dea4babe-578x586.webp',
        links: { instagram: 'https://www.instagram.com/adamkaspar_paintings/' }
    },
    'Alan Pollack': {
        bio: 'Ilustrador de fantasia inspirado por Frank Frazetta e Boris Vallejo. Começou com uma capa para Dungeon da TSR em 1991. Trabalhou em D&D, Magic: The Gathering e Blizzard. Nominado ao Hugo Award em 2015.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/850ecb9ad88687593f7c8766843d32e09a316050-307x381.jpg',
        links: { patreon: 'https://www.patreon.com/alanpollack' }
    },
    'Andrea Modesti': {
        bio: 'Nascido em Pavia, Itália, estudou pintura tradicional na Academia de Belas Artes de Brera. Tem predileção inata por história medieval. Combina aquarela com guache sobre papel 100% algodão.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/eb50d8c33307297c4dd1629f03c78ae05c255ea4-652x838.jpg',
        links: { website: 'https://www.andreamodesti-art.blogspot.com' }
    },
    'Anson Maddocks': {
        bio: 'Nascido em 1968 no Alasca, estudou na Cornish College of the Arts. Criou mais de 120 artes para Magic: The Gathering entre 1993-2008. Trabalhou com White Wolf e Alderac Entertainment.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/3669614a197d0777b9198936adc457c64b0bb5be-109x160.jpg',
        links: { website: 'https://ansonmaddocks.com/' }
    },
    'Atlas Thorn': {
        bio: 'Pintor a óleo da Austrália especializado em arte vibrante de fantasia. Usa tintas cruelty-free e materiais reciclados. Transicionou da animação em 2017 e cria alterações de cartas para Sorcery.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/07ef226608c047e2470ae545cb830ef6e5d07e44-741x1008.png',
        links: { website: 'https://www.atlasthornart.com' }
    },
    'Brian Smith': {
        bio: 'Cresceu nos anos 70-80 influenciado por pinturas clássicas, surrealismo e capas de álbuns. Trabalha com óleo sobre madeira, criando paisagens ameaçadoras e figuras assombradas.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/26118347f1c173aefdb9a2683bbf19b0c06c7061-1452x1936.jpg',
        links: { instagram: 'https://www.instagram.com/briansmith_art/' }
    },
    'Bryon Wackwitz': {
        bio: 'Artista pioneiro entre os primeiros 49 de Magic: The Gathering e ilustrador original de Legend of the Five Rings. Diretor de arte do Doomtown (1997-1999). Baseado na Filadélfia.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/deb939eb7ae3134b13e6702a6ccea06dba475005-2160x2960.png',
        links: { website: 'https://www.bryonwart.com' }
    },
    'Caio Calazans': {
        bio: 'Artista brasileiro com paixão pela arte desde a infância. Desenvolveu seu ofício através de alterações de cartas e recursos online. Sua entrada em Sorcery marcou sua transição de hobbyista para artista reconhecido.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/1a5588e8c3c0efa6064e27ff73f135827b24706d-1340x1711.jpg',
        links: { instagram: 'https://www.instagram.com/calazansartworks' }
    },
    'Dan Seagrave': {
        bio: 'Artista britânico de Worksop (1970) especializado em capas de álbuns de death metal. Autodidata, criou sua primeira capa aos 17 anos. Atualmente mora em Toronto explorando temas de isolamento e evolução.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/de0f42108bcdbb48c06f79ab4e59b76e71e4f2a1-400x544.jpg',
        links: { website: 'https://www.danseagrave.com/' }
    },
    "David O'Connor": {
        bio: 'Estudou ilustração em Brighton desde 1975. Criou capas de livros e publicidade. Nos anos 90, contribuiu para Magic: The Gathering. Trabalha com óleo e agora contribui para Sorcery.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/63e9a7a2940fe1bf45bbddd6837a38d114349208-1200x1600.png',
        links: { website: 'https://davidoconnorstudio.com/' }
    },
    'Doug Kovacs': {
        bio: 'Cresceu nos subúrbios de Chicago jogando D&D. Graduou-se pela Columbia College em 1996. Trabalhou em D&D 3ª e 4ª edição, desenvolveu o RPG Dungeon Crawl Classics e criou os livros Hobonomicon.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/b8a551dd937841d986e11a9a646a852db74aa6b5-1200x1600.png',
        links: { website: 'http://dougkovacs.com' }
    },
    'Drew Tucker': {
        bio: 'Artista versátil de fantasia e horror, veterano de Magic: The Gathering. Conhecido por estilo expressionista e cores intensas. Trabalhou para Wizards of the Coast e Fantasy Flight.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/26118347f1c173aefdb9a2683bbf19b0c06c7061-1452x1936.jpg',
        links: { website: 'https://www.drewtuckerillustration.com/' }
    },
    'Ed Beard Jr.': {
        bio: 'Veterano de 42 anos na ilustração. Começou como artista de aerógrafo automotivo nos anos 80. Renomado por arte icônica para Magic: The Gathering e Dungeons & Dragons. Usa aerógrafo, pincel e grafite.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/6b6f1204046d90f79c0a6bb859aaef089be7b25a-1932x2576.png',
        links: { website: 'https://www.edbeardjr.com' }
    },
    'Elvira Shakirova': {
        bio: 'Estudou ilustração de livros na Universidade de Moscou. Após 8 anos no teatro, transicionou para alterações de cartas TCG. Contribui para Sorcery desde 2019, mudou-se para Londres em 2023.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/44357d63dd9717dd593b3c1dceb0aa74e1e1ff24-1400x1938.jpg',
        links: { patreon: 'https://www.patreon.com/elvirashakirova' }
    },
    'Elwira Pawlikowska': {
        bio: 'Ilustradora e designer polonesa baseada na Suécia. Mestre em arquitetura, especializa-se em ilustração arquitetônica de fantasia, mapas e desenhos técnicos. Trabalha com nanquim e aquarela.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/1982cb0c4eea7a136935a6194f1d4bc7a1d3e8b2-1440x1800.jpg',
        links: { instagram: 'https://www.instagram.com/elwirapawlikowska/' }
    },
    'Emil Idzikowski': {
        bio: 'Artista multidisciplinar polonês especializado em pintura, design, fotografia e animação. Estudou na Academia de Belas Artes de Varsóvia. Trabalha com acrílicos e óleos mesclando técnica pictórica com sátira.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/2aaa51967e6d2d70dd7e43184835875441609231-1064x1500.jpg',
        links: {}
    },
    'Francesca Baerald': {
        bio: 'Artista e cartógrafa trabalhando na indústria de games desde 2013 para Wizards of the Coast, Blizzard, Square Enix, Games Workshop e Paizo. Especializa-se em aquarela, nanquim, acrílico e óleo.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/01f6bbdc845b42dbbb5043d832aff72fa4ee6ab1-495x800.jpg',
        links: { website: 'https://www.francescabaerald.com/' }
    },
    'Gadu Duaso': {
        bio: 'Artista filipino que descobriu a criatividade através de jogos online. Treinou técnicas clássicas com o mentor Emar Lacorte. Estudou Belas Artes na Universidade das Filipinas - Cebu. Trabalha com óleo e simbolismo alegórico.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/aed3e6bbbfd6e3debe4167090ca7305c7b0233e2-1200x1800.jpg',
        links: { facebook: 'https://www.facebook.com/TheArtOfGaduDuaso' }
    },
    'Heidi Taillefer': {
        bio: 'Surrealista e simbolista de Montreal. Colaborou com Cirque du Soleil, Infiniti, NFL e Forbes. Explora a hibridização de tecnologia e humanidade. Venceu o Traditional Art Award do Beautiful Bizarre 2020.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/fbe3f089bfb633a511ceb7040f6087796e6f5158-700x974.jpg',
        links: { website: 'https://www.heiditaillefer.com' }
    },
    'Ian Miller': {
        bio: 'Lendário ilustrador britânico (1946), celebrado por estilo gótico e macabro. Ganhou destaque em Fighting Fantasy e White Dwarf da Games Workshop, além de animação para Ralph Bakshi e DreamWorks.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/4133cd0461cc97b2b57d4c80677d3bc50984f5cf-228x200.jpg',
        links: { website: 'https://www.ian-miller.org/' }
    },
    'Jeff A. Menges': {
        bio: 'Um dos 25 artistas originais de Magic: The Gathering com carreira de mais de três décadas. Autor de mais de 20 títulos sobre ilustração da Era Dourada. Trabalha com acrílicos sobre placa gessoada.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/d8fc6531cb51db2b6e162030cc5673e1dddc35d1-307x381.jpg',
        links: { facebook: 'https://www.facebook.com/MengesArt/' }
    },
    'Jeff Easley': {
        bio: 'Moldou a identidade visual de RPGs. Começou na Warren Publishing e Marvel antes de entrar na TSR em 1982, onde definiu a estética de Advanced Dungeons & Dragons.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/5ec80547089614a03815e4a3d0b928b98e17cc84-800x1067.jpg',
        links: { website: 'https://jeffeasleyart.com/' }
    },
    'Jeffrey Laubenstein': {
        bio: 'Contador de histórias visuais com quase 40 anos em RPGs e games. Passou 12 anos na FASA em Shadowrun, MechWarrior e BattleTech. Criou "Show and Tell" para Magic.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/283f97e58ed1b8a31ee4ad83b78fcf80dd764ecb-1365x1365.jpg',
        links: { twitter: 'https://x.com/IllustratorJeff' }
    },
    'Juan Machuca': {
        bio: 'Nascido em Nuevo Laredo, México. Formado em Engenharia de Energia Renovável, desenha desde a infância. Sorcery representa seu primeiro grande projeto de ilustração profissional.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/5fe7e3b83f50dacde22ad850eabc964f26b328b1-900x1200.jpg',
        links: { instagram: 'https://www.instagram.com/machucarts89/' }
    },
    'Jussi Pylkäs': {
        bio: 'Artista 2D e concept artist finlandês de Oulu, especializado em design de criaturas. Trabalha com acrílicos, marcadores e nanquim. Joga Sorcery ativamente! Criou Battlemage e Headless Haunt.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/63670890cf06a404bf3ef9eb8f2110e581750ac7-240x240.jpg',
        links: { artstation: 'https://www.artstation.com/kisufisu' }
    },
    'Lindsey Crummett': {
        bio: 'Mais de 16 anos criando arte para cinema, TV, games e colecionáveis. Trabalhou na Weta Workshop por uma década em The Hobbit e Avatar. Atualmente freelancer para Sorcery.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/7dec037bde0aa1b5253e9910cf3f4829228adae4-1428x2000.jpg',
        links: { instagram: 'https://www.instagram.com/lindsey_crums_art' }
    },
    'Liz Danforth': {
        bio: 'Figura proeminente na indústria de games desde 1976. Conhecida por Tunnels & Trolls, Magic: The Gathering (36+ cartas), Battletech e Shadowrun. Induzida no Hall da Fama GAMA em 1995.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/054d90a9d6203945389be91fd619b8d9769bf52c-400x400.png',
        links: { patreon: 'https://www.patreon.com/LizDanforth' }
    },
    'Margaret Organ-Kean': {
        bio: 'Começou com arte equestre na infância. Construiu reconhecimento em convenções de ficção científica. Trabalhou para Cricket, Iron Crown e Wizards of the Coast. Especialista em aquarela.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/4f89c7284e6f31bc7f7f1e6a155ebe25701ad668-480x320.webp',
        links: { facebook: 'https://www.facebook.com/organkean/' }
    },
    'Marta Molina': {
        bio: 'Artista autodidata que dominou reproduções de arte bizantina, gótica e renascentista antes de transicionar para alterações de Magic e contribuir para Sorcery. Mescla métodos clássicos com fantasia contemporânea.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/58ef6a65080d5902e178d5a2590270dec2e51ebd-422x640.jpg',
        links: { patreon: 'https://www.patreon.com/user?u=82742693' }
    },
    'Matt Tames': {
        bio: 'Artista e designer do Meio-Oeste baseado na Nova Inglaterra. Inspirado por The Land Before Time, pinta desde a infância. Trabalha com design de embalagens para Lindt Chocolate e arte para card games.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/723aca5003c96b6accafcdf6d25ad9cbb692781a-500x528.jpg',
        links: { website: 'https://www.matttamesart.com/' }
    },
    'Mattias Frisk': {
        bio: 'Artista, ilustrador e músico sueco com background em design gráfico. Estudou história da arte na Universidade de Linköping. Ativo na comunidade death metal com merchandise e capas de álbuns.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/1984e08c46f8139a5e212412977810d00c5006fa-993x1229.jpg',
        links: { website: 'https://mattiasfrisk.com/' }
    },
    'Melissa A. Benson': {
        bio: 'Pioneira entre ilustradores fundadores de TCGs. Uma das 25 artistas originais de Magic: The Gathering. Suas ilustrações de criaturas cativam jogadores há mais de 30 anos.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/4cfc78fad9ef8e03d5b2a6896cfab64d45944628-1080x1080.jpg',
        links: { website: 'https://www.melissabenson.com/' }
    },
    'Michal Nagypál': {
        bio: 'Especialista em pintura a óleo, também trabalha com aquarela e escultura. Sua obra abrange retratos, paisagens e composições inspiradas em mestres antigos, com temas místicos e contemporâneos.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/582ef72f4404bedf80d47180f9158419e9aef42e-903x1138.jpg',
        links: { website: 'https://michalnagypal.sk/' }
    },
    'Ossi Hiekkala': {
        bio: 'Ilustrador finlandês com quase duas décadas de experiência. Começou com RuneQuest e Call of Cthulhu. Estudou design gráfico em Rovaniemi e ilustração no Japão. Trabalha com Chaosium Inc.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/1ac5988dc6a5c5351d8b1eb84f839a7fcc3bc91c-1080x1080.jpg',
        links: { website: 'https://www.archipictor.com' }
    },
    'Rodney Matthews': {
        bio: 'Alcançou fama internacional nos anos 70 quando Big O Posters distribuiu sua arte globalmente, vendendo milhões. Criou mais de 150 capas de álbuns e trabalhou em animação com Gerry Anderson.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/dfe3ea51bcf2084c4960ea588ea530dfcafa07af-2016x3024.jpg',
        links: { website: 'https://www.rodneymatthewsstudios.com/' }
    },
    'Sam McKinnon': {
        bio: 'Artista e designer gráfico de Montreal, Canadá. Inspirações incluem história medieval, mitologia e natureza. Trabalha principalmente com pintura acrílica, testando composições digitalmente primeiro.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/e35ef4cac8605a92c75d258cf2aed8b8a0d5e75c-640x960.jpg',
        links: { website: 'https://www.sammckinnon.com/' }
    },
    'Santiago Caruso': {
        bio: 'Artista simbolista argentino especializado no gênero fantástico. Ilustrou Jane Eyre, The Dunwich Horror e The King in Yellow. Criou capas para Tartarus Press, Actes Sud e Planeta.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/8fa4cc8c606ac8205f052f980be0b0711f8fa269-1586x2093.jpg',
        links: { website: 'https://www.santiagocaruso.com.ar' }
    },
    'Seb McKinnon': {
        bio: 'Ilustrador, cineasta e músico canadense de Montreal. Ilustrou mais de 100 cartas de Magic desde 2012. Cofundou a Five Knights Production, criando a premiada série Kin Fables.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/5498b7ca9b227eed7bd06ef15a085e1b8d7225a6-960x960.jpg',
        links: { website: 'https://www.sebmckinnon.com/' }
    },
    'Séverine Pineaux': {
        bio: 'Ilustradora francesa treinada em Paris. Artista expositora retratando natureza mágica com criaturas místicas. Mora na floresta de Brocéliande. Uma das artistas originais do set Alpha desde 2018.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/14bf37c44964fc1a49ac0892418f3be771b03bf4-2616x3264.jpg',
        links: { instagram: 'https://www.instagram.com/severinepineaux/' }
    },
    'Tony Szczudlo': {
        bio: 'Artista aclamado por trabalhos em RPGs e card games. Lead artist do Birthright nos anos 90. Ilustrou capas de Greyhawk e contribuiu para Magic e Harry Potter TCG.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/02a336462bc856444893bc3760d4093b95c3fd84-768x768.jpg',
        links: { facebook: 'https://www.facebook.com/TheArtOfTonySzczudlo' }
    },
    'Truitt Parrish': {
        bio: 'Artista americano com BFA pela CU Boulder. Cresceu desenhando dinossauros. Sua tese examinou a "Jornada do Herói" na Guerra das Rosas. Colabora com Sorcery desde 2020.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/b5efab7f05e4914954a5f057c2c45436a9c632f2-2817x4024.jpg',
        links: { website: 'https://truittparrish.com' }
    },
    'Vasiliy Ermolaev': {
        bio: 'Formado pelo Moscow Academic Art Lyceum e Moscow State University of Printing. Background em ilustração de livros infantis, mosaico e pintura de miniaturas para wargames.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/0b1045548daa9c9eb2330ac3722b676fca7d191c-424x631.jpg',
        links: { instagram: 'https://www.instagram.com/itm_fff/' }
    },
    'Vincent Pompetti': {
        bio: 'Iniciou carreira em 2001 após estudos na Escola de Belas Artes St. Luc, Bélgica. Criou graphic novels como The Corsair e Conquest. Concept artist para Sorcery e professor em instituições francesas.',
        photo: 'https://cdn.sanity.io/images/vg9ve3gy/production/fe6e2d1cdcf9c06222aaf3a63a4a7809d9964261-760x824.jpg',
        links: { website: 'https://pompetti.wordpress.com/', instagram: 'https://www.instagram.com/vincentpompetti/' }
    }
};

// Generate slug for official Sorcery TCG artist page
function getArtistSlug(artistName) {
    return artistName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Get official Sorcery artist page URL
function getOfficialArtistUrl(artistName) {
    const slug = getArtistSlug(artistName);
    return `https://sorcerytcg.com/art/${slug}`;
}

// Show artist profile with their cards
function showArtistCards(artistName) {
    const artist = artViewData.artistMap.get(artistName);
    if (!artist) return;

    const container = document.getElementById('art-gallery-content');
    if (!container) return;

    // Hide the header, philosophy and filters when showing artist detail
    const artView = document.getElementById('art-view');
    if (artView) {
        const sectionHeader = artView.querySelector('.section-header');
        const artPhilosophy = artView.querySelector('.art-philosophy');
        const galleryHeader = artView.querySelector('.art-gallery-section > h3');
        const galleryDesc = artView.querySelector('.art-gallery-section > .section-desc');
        const searchFilters = artView.querySelector('.art-search-filters');

        if (sectionHeader) sectionHeader.style.display = 'none';
        if (artPhilosophy) artPhilosophy.style.display = 'none';
        if (galleryHeader) galleryHeader.style.display = 'none';
        if (galleryDesc) galleryDesc.style.display = 'none';
        if (searchFilters) searchFilters.style.display = 'none';
    }

    // Get artist info if available
    const artistInfo = ARTIST_INFO[artistName] || {
        bio: 'Artista contribuidor de Sorcery: Contested Realm. Suas obras ajudam a dar vida ao mundo único do jogo.',
        links: {}
    };

    // Get all cards by this artist - group by card name, collect all variants
    const cardMap = new Map();

    allCards.forEach(card => {
        if (card.sets) {
            card.sets.forEach(set => {
                if (set.variants) {
                    set.variants.forEach(variant => {
                        if (variant.artist && variant.artist.trim() === artistName) {
                            if (!cardMap.has(card.name)) {
                                cardMap.set(card.name, {
                                    name: card.name,
                                    element: card.elements || 'Neutral',
                                    type: card.type || 'Unknown',
                                    rarity: variant.rarity || card.rarity || 'Ordinary',
                                    image: variant.slug ? `${IMAGE_CDN}${variant.slug}.png` : null,
                                    sets: new Set(),
                                    finishes: new Set()
                                });
                            }
                            const cardData = cardMap.get(card.name);
                            cardData.sets.add(set.name);
                            if (variant.finish) cardData.finishes.add(variant.finish);
                        }
                    });
                }
            });
        }
    });

    // Convert to array
    const artistCards = Array.from(cardMap.values()).map(c => ({
        ...c,
        sets: Array.from(c.sets),
        finishes: Array.from(c.finishes)
    }));

    // Generate initials
    const initials = artistName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const officialUrl = getOfficialArtistUrl(artistName);

    // Build links HTML - prioritize personal links over official profile
    const linkItems = [];
    if (artistInfo.links) {
        if (artistInfo.links.website) linkItems.push(`<a href="${artistInfo.links.website}" target="_blank" class="artist-link"><i data-lucide="globe"></i> Website</a>`);
        if (artistInfo.links.blog) linkItems.push(`<a href="${artistInfo.links.blog}" target="_blank" class="artist-link"><i data-lucide="book-open"></i> Blog</a>`);
        if (artistInfo.links.instagram) linkItems.push(`<a href="${artistInfo.links.instagram}" target="_blank" class="artist-link"><i data-lucide="instagram"></i> Instagram</a>`);
        if (artistInfo.links.twitter) linkItems.push(`<a href="${artistInfo.links.twitter}" target="_blank" class="artist-link"><i data-lucide="twitter"></i> Twitter/X</a>`);
        if (artistInfo.links.facebook) linkItems.push(`<a href="${artistInfo.links.facebook}" target="_blank" class="artist-link"><i data-lucide="facebook"></i> Facebook</a>`);
        if (artistInfo.links.patreon) linkItems.push(`<a href="${artistInfo.links.patreon}" target="_blank" class="artist-link"><i data-lucide="heart"></i> Patreon</a>`);
        if (artistInfo.links.artstation) linkItems.push(`<a href="${artistInfo.links.artstation}" target="_blank" class="artist-link"><i data-lucide="palette"></i> ArtStation</a>`);
    }
    // Add official profile link last
    linkItems.push(`<a href="${officialUrl}" target="_blank" class="artist-link artist-link-official"><i data-lucide="sparkles"></i> Perfil Oficial Sorcery</a>`);
    const linksHtml = `<div class="artist-links">${linkItems.join('')}</div>`;

    // Photo or initials
    const photoHtml = artistInfo.photo
        ? `<img src="${artistInfo.photo}" alt="${artistName}" class="artist-photo-img">`
        : `<span>${initials}</span>`;

    // Render profile: Cards first, artist info at bottom
    container.innerHTML = `
        <div class="artist-profile-view">
            <div class="artist-header-compact">
                <button class="btn-back" onclick="renderArtGallery(artViewData.artists)">
                    <i data-lucide="arrow-left"></i> Voltar
                </button>
                <h2 class="artist-name-header">${artistName}</h2>
                <span class="artist-card-count">${artistCards.length} ilustrações</span>
            </div>

            <div class="artist-cards-grid">
                ${artistCards.map(card => {
                    const totalVariants = card.sets.length * card.finishes.length;
                    const escapedName = card.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                    return `
                    <div class="artist-card-item" onclick="showCardDetailByName('${escapedName}')">
                        <div class="card-image-placeholder">
                            ${card.image ? `<img src="${card.image}" alt="${escapeAttr(card.name)}" loading="lazy">` : `<span>${card.name.substring(0, 2).toUpperCase()}</span>`}
                        </div>
                        <div class="card-info">
                            <h4>${escapeHtml(card.name)}</h4>
                            <span class="card-type-rarity">${card.type} • <span class="rarity-text rarity-${card.rarity.toLowerCase()}">${card.rarity}</span></span>
                            <div class="card-variants">
                                ${card.sets.map(s => `<span class="variant-badge set-badge">${s}</span>`).join('')}
                            </div>
                            <div class="card-finishes">
                                ${card.finishes.map(f => `<span class="variant-badge finish-badge finish-${f.toLowerCase()}">${f}</span>`).join('')}
                            </div>
                            <span class="variant-count">${totalVariants} ${totalVariants === 1 ? 'versão' : 'versões'}</span>
                        </div>
                    </div>
                `}).join('')}
            </div>

            <div class="artist-bio-section">
                <h3>Sobre o Artista</h3>
                <div class="artist-bio-content">
                    <div class="artist-photo-container">
                        ${photoHtml}
                    </div>
                    <div class="artist-bio-text">
                        <p>${artistInfo.bio}</p>
                        ${linksHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    refreshIcons();

    // Scroll to top of container
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Helper to show card detail by name
function showCardDetailByName(cardName) {
    openCardModal(cardName);
}

// Legacy function - redirect to art view
function initArtistsView() {
    switchView('art');
}

// Legacy render function (kept for compatibility)
function renderArtistGrid(artists) {
    if (!artists || !artists.length) {
        return '<p class="empty-state">Nenhum artista encontrado</p>';
    }

    return `
        <div class="artists-grid">
            ${artists.map((artist) => {
                const initials = artist.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                const artistInfo = ARTIST_INFO[artist.name];
                const avatarContent = artistInfo?.photo
                    ? `<img src="${artistInfo.photo}" alt="${artist.name}" class="artist-photo-img">`
                    : initials;
                return `
                <div class="artist-card" data-artist="${artist.name}">
                    <div class="artist-avatar">${avatarContent}</div>
                    <div class="artist-info">
                        <h4>${artist.name}</h4>
                        <span class="card-count">${artist.cardCount} cards</span>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

// ============================================
// Artist Stats View - Coleção por Artista
// ============================================

/**
 * Inicializa a view de estatísticas por artista
 * DEPRECATED: Redireciona para aba "Coleção por Artista" na art-view
 */
function initArtistStatsView() {
    // Redireciona para art view com aba collection ativa
    showView('art');
    setTimeout(() => switchArtTab('collection'), 100);
}

/**
 * Retorna a classe de cor da barra de progresso baseada no percentual
 */
function getProgressColorClass(percent) {
    if (percent === 100) return 'progress-complete';
    if (percent >= 75) return 'progress-high';
    if (percent >= 50) return 'progress-good';
    if (percent >= 25) return 'progress-medium';
    return 'progress-low';
}

/**
 * Retorna a classe do badge baseada no percentual
 */
function getProgressBadgeClass(percent) {
    if (percent === 100) return 'badge-complete';
    if (percent >= 75) return 'badge-high';
    if (percent >= 50) return 'badge-good';
    if (percent >= 25) return 'badge-medium';
    return 'badge-low';
}

/**
 * Calcula e renderiza estatísticas por artista
 */
function renderArtistStats() {
    const listEl = document.getElementById('artist-stats-list');
    if (!listEl) return;

    // Calcular progresso por artista
    const artistProgress = [];
    let totalArtistsWithCards = 0;
    let completeArtists = 0;

    artViewData.artists.forEach(artist => {
        const totalCards = artist.cardCount;
        let ownedCards = 0;
        const ownedList = [];
        const missingList = [];

        artist.cards.forEach(cardRef => {
            const hasCard = collection.has(cardRef.name);
            if (hasCard) {
                ownedCards++;
                ownedList.push(cardRef);
            } else {
                missingList.push(cardRef);
            }
        });

        const completion = totalCards > 0 ? (ownedCards / totalCards) * 100 : 0;

        if (ownedCards > 0) totalArtistsWithCards++;
        if (completion === 100 && totalCards > 0) completeArtists++;

        artistProgress.push({
            name: artist.name,
            totalCards,
            ownedCards,
            completion,
            ownedList,
            missingList
        });
    });

    // Calcular estatísticas adicionais
    const almostComplete = artistProgress.filter(a => a.completion >= 80 && a.completion < 100).length;

    // Contar cards únicos (evita duplicação quando mesmo card tem múltiplos artistas)
    const uniqueCardsOwned = new Set();
    const uniqueCardsAll = new Set();

    artistProgress.forEach(a => {
        a.ownedList.forEach(card => uniqueCardsOwned.add(card.name));
        a.ownedList.concat(a.missingList).forEach(card => uniqueCardsAll.add(card.name));
    });

    const totalCardsOwned = uniqueCardsOwned.size;
    const totalCardsAll = uniqueCardsAll.size;
    const avgCompletion = totalArtistsWithCards > 0
        ? artistProgress.filter(a => a.ownedCards > 0).reduce((sum, a) => sum + a.completion, 0) / totalArtistsWithCards
        : 0;

    // Artista com mais cards na coleção
    const mostCards = artistProgress
        .filter(a => a.ownedCards > 0)
        .sort((a, b) => b.ownedCards - a.ownedCards)[0];

    // Próximo a completar (quem falta menos cards, mas não está completo)
    const nextToComplete = artistProgress
        .filter(a => a.completion > 0 && a.completion < 100 && a.totalCards >= 2)
        .sort((a, b) => a.missingList.length - b.missingList.length || b.completion - a.completion)[0];

    // Encontrar artista mais completo (mínimo 3 cards para ser relevante)
    const best = artistProgress
        .filter(a => a.totalCards >= 3 && a.ownedCards > 0)
        .sort((a, b) => b.completion - a.completion || b.ownedCards - a.ownedCards)[0];

    // Atualizar resumo - Row 1
    document.getElementById('artist-stats-total').textContent = totalArtistsWithCards;
    document.getElementById('artist-stats-total-label').textContent =
        `de ${artViewData.artists.length} no total`;
    document.getElementById('artist-stats-complete').textContent = completeArtists;
    document.getElementById('artist-stats-almost').textContent = almostComplete;

    if (best) {
        document.getElementById('artist-stats-best').textContent = best.name;
        document.getElementById('artist-stats-best-pct').textContent =
            `${best.completion.toFixed(0)}% · ${best.ownedCards}/${best.totalCards}`;
    } else {
        document.getElementById('artist-stats-best').textContent = '-';
        document.getElementById('artist-stats-best-pct').textContent = '-';
    }

    // Atualizar resumo - Row 2
    document.getElementById('artist-stats-cards-owned').textContent = totalCardsOwned;
    document.getElementById('artist-stats-cards-total').textContent = `de ${totalCardsAll} no total`;
    document.getElementById('artist-stats-avg-completion').textContent = `${avgCompletion.toFixed(0)}%`;

    if (mostCards) {
        document.getElementById('artist-stats-most-cards').textContent = mostCards.name;
        document.getElementById('artist-stats-most-cards-count').textContent = `${mostCards.ownedCards} cards`;
    } else {
        document.getElementById('artist-stats-most-cards').textContent = '-';
        document.getElementById('artist-stats-most-cards-count').textContent = '0 cards';
    }

    if (nextToComplete) {
        document.getElementById('artist-stats-next-complete').textContent = nextToComplete.name;
        document.getElementById('artist-stats-next-complete-info').textContent =
            `falta ${nextToComplete.missingList.length} (${nextToComplete.completion.toFixed(0)}%)`;
    } else {
        document.getElementById('artist-stats-next-complete').textContent = '-';
        document.getElementById('artist-stats-next-complete-info').textContent = '-';
    }

    // Aplicar ordenação e filtros
    const sortBy = document.getElementById('artist-stats-sort')?.value || 'completion-desc';
    const hideZero = document.getElementById('artist-stats-hide-zero')?.checked || false;
    const searchQuery = document.getElementById('artist-stats-search')?.value.trim().toLowerCase() || '';

    let filtered = artistProgress;

    // Filtrar por busca
    if (searchQuery) {
        filtered = filtered.filter(a => a.name.toLowerCase().includes(searchQuery));
    }

    // Esconder zeros
    if (hideZero) {
        filtered = filtered.filter(a => a.ownedCards > 0);
    }

    switch (sortBy) {
        case 'completion-desc':
            filtered.sort((a, b) => b.completion - a.completion || b.ownedCards - a.ownedCards);
            break;
        case 'completion-asc':
            filtered.sort((a, b) => a.completion - b.completion || a.ownedCards - b.ownedCards);
            break;
        case 'owned-desc':
            filtered.sort((a, b) => b.ownedCards - a.ownedCards);
            break;
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    // Check if sorted by name for alphabetical grouping
    const useAlphaNav = sortBy === 'name-asc' && !searchQuery;

    // Helper to render single artist card
    const renderArtistCard = (artist) => {
        const progressClass = getProgressColorClass(artist.completion);
        const badgeClass = getProgressBadgeClass(artist.completion);
        const isComplete = artist.completion === 100 && artist.totalCards > 0;

        return `
        <div class="artist-progress-card ${isComplete ? 'artist-complete' : ''}" data-artist="${escapeAttr(artist.name)}">
            ${isComplete ? '<i data-lucide="award" class="complete-ribbon-icon"></i>' : ''}
            <div class="artist-progress-header" onclick="toggleArtistChecklist('${escapeAttr(artist.name)}')">
                <div class="artist-progress-info">
                    <span class="artist-name" onclick="goToArtistPage('${escapeAttr(artist.name)}'); event.stopPropagation();">${escapeHtml(artist.name)}</span>
                    <span class="artist-count">${artist.ownedCards}/${artist.totalCards}</span>
                </div>
                <div class="artist-progress-bar-container">
                    <div class="progress-bar progress-bar-with-milestones">
                        <div class="progress-fill ${progressClass}"
                             style="width: ${artist.completion}%"></div>
                        <div class="progress-milestones">
                            <div class="progress-milestone"></div>
                            <div class="progress-milestone"></div>
                            <div class="progress-milestone"></div>
                        </div>
                    </div>
                    <span class="progress-badge ${badgeClass}">${artist.completion.toFixed(0)}%</span>
                </div>
                <i data-lucide="chevron-down" class="expand-icon"></i>
            </div>
            <div class="artist-checklist hidden">
                <div class="checklist-section owned">
                    <h4><i data-lucide="check-circle"></i> Tenho (${artist.ownedCards})</h4>
                    <div class="checklist-items">
                        ${artist.ownedList.length > 0 ? artist.ownedList.map(c => `
                            <span class="checklist-item owned" title="${escapeAttr(c.set)}" onclick="openCardModal('${escapeAttr(c.name)}'); event.stopPropagation();">
                                <i data-lucide="check"></i> ${escapeHtml(c.name)}
                            </span>
                        `).join('') : '<span class="empty-checklist">Nenhum card</span>'}
                    </div>
                </div>
                ${artist.missingList.length > 0 ? `
                <div class="checklist-section missing">
                    <h4><i data-lucide="x-circle"></i> Faltam (${artist.missingList.length})</h4>
                    <div class="checklist-items">
                        ${artist.missingList.map(c => `
                            <span class="checklist-item missing" title="${escapeAttr(c.set)}" onclick="openCardModal('${escapeAttr(c.name)}'); event.stopPropagation();">
                                <i data-lucide="x"></i> ${escapeHtml(c.name)}
                            </span>
                        `).join('')}
                    </div>
                </div>
                ` : '<p class="complete-message"><i data-lucide="trophy"></i> Coleção completa deste artista!</p>'}
            </div>
        </div>`;
    };

    // Render with alphabetical navigation if sorted by name
    if (useAlphaNav && filtered.length > 20) {
        // Group by first letter
        const grouped = {};
        const letters = [];
        filtered.forEach(artist => {
            const letter = artist.name.charAt(0).toUpperCase();
            if (!grouped[letter]) {
                grouped[letter] = [];
                letters.push(letter);
            }
            grouped[letter].push(artist);
        });

        // Build alphabet nav
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const alphaNavHtml = `
            <nav class="alpha-nav" aria-label="Navegação alfabética">
                ${alphabet.map(l => {
                    const hasArtists = letters.includes(l);
                    return `<button class="alpha-nav-btn ${hasArtists ? '' : 'disabled'}"
                                    data-letter="${l}"
                                    ${hasArtists ? `onclick="scrollToArtistLetter('${l}')"` : 'disabled'}
                                    ${hasArtists ? '' : 'tabindex="-1"'}>${l}</button>`;
                }).join('')}
            </nav>
        `;

        // Build content with section headers
        let contentHtml = '';
        letters.forEach(letter => {
            contentHtml += `
                <div class="alpha-section-header" id="artist-letter-${letter}">
                    <span class="alpha-section-letter">${letter}</span>
                </div>
            `;
            grouped[letter].forEach(artist => {
                contentHtml += renderArtistCard(artist);
            });
        });

        listEl.innerHTML = `
            <div class="alpha-nav-container">
                ${alphaNavHtml}
                <div class="alpha-nav-content">
                    ${contentHtml}
                </div>
            </div>
        `;
    } else {
        // Standard render without alpha nav
        listEl.innerHTML = filtered.map(artist => renderArtistCard(artist)).join('');
    }

    // Reinicializar ícones Lucide
    refreshIcons();
}

/**
 * Toggle do checklist expandido
 */
function toggleArtistChecklist(artistName) {
    const card = document.querySelector(`.artist-progress-card[data-artist="${CSS.escape(artistName)}"]`);
    if (!card) return;

    const checklist = card.querySelector('.artist-checklist');
    const icon = card.querySelector('.expand-icon');

    checklist?.classList.toggle('hidden');
    icon?.classList.toggle('rotated');
}

/**
 * Navega para a página do artista na view de Artes
 */
function goToArtistPage(artistName) {
    // Muda para a view de artes e mostra a página do artista
    switchView('art');
    // Aguarda a view carregar e então mostra o artista
    setTimeout(() => {
        showArtistCards(artistName);
    }, 100);
}

/**
 * Scroll para uma letra na navegação alfabética de artistas
 */
function scrollToArtistLetter(letter) {
    const header = document.getElementById(`artist-letter-${letter}`);
    if (header) {
        // Update active state
        document.querySelectorAll('.alpha-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.letter === letter);
        });

        // Scroll with offset for sticky header
        const offset = 100;
        const y = header.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

/**
 * Setup back to top button
 */
function setupBackToTop() {
    // Create button if not exists
    let btn = document.getElementById('back-to-top-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'back-to-top-btn';
        btn.className = 'back-to-top';
        btn.innerHTML = '<i data-lucide="arrow-up"></i>';
        btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        btn.setAttribute('aria-label', 'Voltar ao topo');
        document.body.appendChild(btn);
        refreshIcons(btn);
    }

    // Show/hide based on scroll position
    const toggleVisibility = () => {
        btn.classList.toggle('visible', window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
}

// Initialize back to top on load
document.addEventListener('DOMContentLoaded', setupBackToTop);

/**
 * Setup dos filtros de estatísticas por artista
 */
function setupArtistStatsFilters() {
    document.getElementById('artist-stats-sort')?.addEventListener('change', renderArtistStats);
    document.getElementById('artist-stats-hide-zero')?.addEventListener('change', renderArtistStats);

    // Search com debounce
    const searchInput = document.getElementById('artist-stats-search');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderArtistStats, 200);
        });
    }
}

// Initialize Timeline View
function initTimelineView() {
    const container = document.getElementById('timeline-content');
    if (!container || !allCards.length) return;

    if (typeof TimelineTracker !== 'undefined') {
        const tracker = new TimelineTracker();
        const timeline = tracker.getSetTimeline(allCards);
        container.innerHTML = renderTimeline(timeline);
    } else {
        // Fallback simple timeline
        const sets = [...new Set(allCards.flatMap(c => c.sets?.map(s => s.name) || []))];
        container.innerHTML = `
            <div class="timeline-simple">
                ${sets.map(set => `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h4>${set}</h4>
                            <p>${allCards.filter(c => c.sets?.some(s => s.name === set)).length} cards</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    refreshIcons();
}

// Initialize Boosters View
function initBoostersView() {
    const container = document.getElementById('booster-sets-grid');
    if (!container) return;

    // Get set info from timeline tracker if available
    const setInfo = typeof SET_INFO !== 'undefined' ? SET_INFO : {
        "Alpha": { releaseDate: "2023-04-19", color: "#d4af37", icon: "star", edition: "1ª Edição" },
        "Beta": { releaseDate: "2023-11-10", color: "#9ca3af", icon: "circle", edition: "2ª Edição" },
        "Arthurian Legends": { releaseDate: "2024-06-01", color: "#3b82f6", icon: "crown", edition: "Expansão" },
        "Gothic": { releaseDate: "2024-10-15", color: "#8b5cf6", icon: "moon", edition: "Expansão" },
        "Dragonlord": { releaseDate: "2025-03-01", color: "#dc2626", icon: "flame", edition: "Expansão" }
    };

    // Count cards per set
    const setStats = {};
    allCards.forEach(card => {
        const setName = card.set;
        if (!setStats[setName]) {
            setStats[setName] = { total: 0, byRarity: {} };
        }
        setStats[setName].total++;
        const rarity = card.rarity || 'unknown';
        setStats[setName].byRarity[rarity] = (setStats[setName].byRarity[rarity] || 0) + 1;
    });

    // Build cards HTML
    const setsHtml = Object.entries(setInfo)
        .filter(([name]) => name !== 'Promotional')
        .sort((a, b) => {
            const dateA = a[1].releaseDate ? new Date(a[1].releaseDate) : new Date();
            const dateB = b[1].releaseDate ? new Date(b[1].releaseDate) : new Date();
            return dateA - dateB;
        })
        .map(([name, info]) => {
            const stats = setStats[name] || { total: 0, byRarity: {} };
            const releaseDate = info.releaseDate
                ? new Date(info.releaseDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })
                : 'TBA';

            return `
                <div class="tl-card" style="--set-color: ${info.color}">
                    <div class="tl-card-header">
                        <div class="tl-icon" style="background: ${info.color};">
                            <i data-lucide="${info.icon}"></i>
                        </div>
                        <div class="tl-header-info">
                            <h3 class="tl-title">${name}</h3>
                            <span class="tl-edition">${info.edition}</span>
                        </div>
                        <div class="tl-date-badge">
                            <span class="tl-date">${releaseDate}</span>
                        </div>
                    </div>
                    <div class="tl-card-body">
                        <div class="tl-stats-row">
                            <div class="tl-stat">
                                <span class="tl-stat-value">${stats.total}</span>
                                <span class="tl-stat-label">Cartas</span>
                            </div>
                            <div class="tl-stat">
                                <span class="tl-stat-value">${stats.byRarity.unique || 0}</span>
                                <span class="tl-stat-label">Únicas</span>
                            </div>
                            <div class="tl-stat">
                                <span class="tl-stat-value">${stats.byRarity.elite || 0}</span>
                                <span class="tl-stat-label">Elite</span>
                            </div>
                            <div class="tl-stat">
                                <span class="tl-stat-value">${stats.byRarity.exceptional || 0}</span>
                                <span class="tl-stat-label">Exceptional</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    container.innerHTML = setsHtml;
    refreshIcons();
}

// Initialize Dust Tracker View
function initDustView() {
    const container = document.getElementById('dust-content');
    if (!container) return;

    if (typeof DustTracker !== 'undefined') {
        const tracker = new DustTracker();
        const stats = tracker.getStats();
        container.innerHTML = renderDustStats(stats);
    } else {
        container.innerHTML = `
            <div class="dust-placeholder">
                <div class="dust-meter-placeholder">
                    <div class="meter-circle">
                        <span class="meter-value">0</span>
                        <span class="meter-label">/ 250</span>
                    </div>
                    <p>Dust este mês</p>
                </div>
                <p class="hint">Adicione seus pontos Dust de eventos do Organized Play</p>
            </div>
        `;
    }

    refreshIcons();
}

// Initialize Promos View
function initPromosView() {
    const container = document.getElementById('promos-content');
    if (!container || !allCards.length) return;

    if (typeof PromoTracker !== 'undefined') {
        const tracker = new PromoTracker();
        const promoCards = tracker.getPromoCards(allCards);
        const stats = tracker.getPromoStats(allCards, collection);
        container.innerHTML = renderPromoStats(stats) + renderPromoGrid(promoCards);

        // Initialize category tabs
        initPromoTabs(tracker);
    } else {
        container.innerHTML = '<p class="empty-state">Carregando tracker de promos...</p>';
    }

    refreshIcons();
}

// Initialize News View
function initNewsView() {
    if (typeof newsService !== 'undefined') {
        newsService.loadNews().then(() => {
            newsService.renderNewsView();
        }).catch(err => {
            console.error('Error loading news:', err);
            const container = document.getElementById('news-content');
            if (container) {
                container.innerHTML = '<p class="empty-state">Erro ao carregar notícias. Tente novamente.</p>';
            }
        });
    } else {
        const container = document.getElementById('news-content');
        if (container) {
            container.innerHTML = '<p class="empty-state">Carregando noticias...</p>';
        }
    }
}

// Initialize promo category tabs
function initPromoTabs(tracker) {
    const tabs = document.querySelectorAll('.promo-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.dataset.category;
            const container = document.getElementById('promos-content');

            let cards;
            if (category === 'all') {
                cards = tracker.getPromoCards(allCards);
            } else {
                cards = tracker.getCardsByCategory(category, allCards);
            }

            const stats = tracker.getPromoStats(allCards, collection);
            container.innerHTML = renderPromoStats(stats) + renderPromoGrid(cards);
            refreshIcons();
        });
    });
}

// Render promo grid
function renderPromoGrid(cards) {
    if (!cards || !cards.length) {
        return '<p class="empty-state">Nenhum promo encontrado nesta categoria</p>';
    }

    return `
        <div class="promos-grid">
            ${cards.slice(0, 50).map(card => `
                <div class="promo-card" data-card="${card.name}">
                    <div class="promo-image">
                        <div class="card-placeholder">${card.name[0]}</div>
                    </div>
                    <div class="promo-info">
                        <h4>${card.name}</h4>
                        <span class="promo-category">${card.promoCategory || 'Promo'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Placeholder render functions (will use module functions when available)
function renderDustStats(stats) {
    const current = stats?.thisMonth || 0;
    const cap = stats?.monthlyCap || 250;
    const percentage = Math.min((current / cap) * 100, 100);

    return `
        <div class="dust-dashboard">
            <div class="dust-meter">
                <svg viewBox="0 0 100 100" class="meter-svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-surface-3)" stroke-width="8"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-gold)" stroke-width="8"
                        stroke-dasharray="${percentage * 2.83} 283" stroke-linecap="round"
                        transform="rotate(-90 50 50)"/>
                </svg>
                <div class="meter-text">
                    <span class="meter-value">${current}</span>
                    <span class="meter-cap">/ ${cap}</span>
                </div>
            </div>
            <div class="dust-info">
                <h3>Dust Este Mês</h3>
                <p>Restam <strong>${cap - current}</strong> pontos para o cap mensal</p>
            </div>
            <div class="dust-stats-grid">
                <div class="dust-stat">
                    <span class="stat-value">${stats?.totalDust || 0}</span>
                    <span class="stat-label">Total Lifetime</span>
                </div>
                <div class="dust-stat">
                    <span class="stat-value">${stats?.eventsAttended || 0}</span>
                    <span class="stat-label">Eventos</span>
                </div>
            </div>
        </div>
    `;
}

function renderPromoStats(stats) {
    return `
        <div class="promo-stats-bar">
            <div class="promo-stat">
                <span class="stat-value">${stats?.total || 0}</span>
                <span class="stat-label">Total Promos</span>
            </div>
            <div class="promo-stat">
                <span class="stat-value">${stats?.owned || 0}</span>
                <span class="stat-label">Na Coleção</span>
            </div>
            <div class="promo-stat">
                <span class="stat-value">${stats?.completion || 0}%</span>
                <span class="stat-label">Completo</span>
            </div>
        </div>
    `;
}

// Initialize Codex View
function initCodexView() {
    initCodexNavigation();
    initCodexSearch();
}

// Initialize codex navigation
function initCodexNavigation() {
    const links = document.querySelectorAll('.codex-link');
    const sections = document.querySelectorAll('.codex-section');

    links.forEach(link => {
        link.addEventListener('click', () => {
            const section = link.dataset.section;

            // Update active states
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => {
                s.classList.remove('active');
                if (s.dataset.section === section) {
                    s.classList.add('active');
                }
            });

            // Re-init icons
            refreshIcons();
        });
    });
}

// Initialize codex search
function initCodexSearch() {
    const searchInput = document.getElementById('codex-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const entries = document.querySelectorAll('.codex-entry');

        if (!searchTerm) {
            entries.forEach(entry => entry.style.display = '');
            return;
        }

        entries.forEach(entry => {
            const text = entry.textContent.toLowerCase();
            entry.style.display = text.includes(searchTerm) ? '' : 'none';
        });

        // Show all sections when searching
        if (searchTerm) {
            document.querySelectorAll('.codex-section').forEach(s => s.classList.add('active'));
            document.querySelectorAll('.codex-link').forEach(l => l.classList.remove('active'));
        }
    });
}

// Render Tier List from recommended decks
function renderTierList() {
    if (typeof RECOMMENDED_DECKS === 'undefined') return;

    const tiers = { S: [], A: [], B: [] };

    RECOMMENDED_DECKS.forEach(deck => {
        if (deck.tier && tiers[deck.tier]) {
            tiers[deck.tier].push(deck);
        }
    });

    Object.entries(tiers).forEach(([tier, decks]) => {
        const container = document.getElementById(`tier-${tier.toLowerCase()}-decks`);
        if (!container) return;

        if (decks.length === 0) {
            container.innerHTML = '<span class="tier-empty">Nenhum deck neste tier</span>';
            return;
        }

        container.innerHTML = decks.map(deck => `
            <a href="${deck.url || '#'}" target="_blank" class="tier-deck-card" title="${deck.name}">
                <span class="deck-name">${deck.name}</span>
                <div class="deck-elements">
                    ${(deck.elements || []).map(e => `<span class="element-dot ${e.toLowerCase()}"></span>`).join('')}
                </div>
            </a>
        `).join('');
    });
}

// ============================================
// ============================================
// PRICE ALERTS SYSTEM
// ============================================

const PRICE_ALERTS_KEY = 'sorcery-price-alerts';
let priceAlerts = new Map(); // Map<cardName, { targetPrice, direction, createdAt }>

// Load price alerts from storage
function loadPriceAlerts() {
    try {
        const userId = getCurrentUserId();
        const key = userId ? `${PRICE_ALERTS_KEY}-${userId}` : PRICE_ALERTS_KEY;
        const stored = localStorage.getItem(key);
        if (stored) {
            const data = JSON.parse(stored);
            priceAlerts = new Map(Object.entries(data));
        }
    } catch (e) {
        console.warn('[PriceAlerts] Failed to load price alerts:', e.message);
        priceAlerts = new Map();
    }
}

// Save price alerts to storage
function savePriceAlerts() {
    try {
        const userId = getCurrentUserId();
        const key = userId ? `${PRICE_ALERTS_KEY}-${userId}` : PRICE_ALERTS_KEY;
        const data = Object.fromEntries(priceAlerts);
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn('[PriceAlerts] Failed to save price alerts:', e.message);
    }
}

// Set a price alert for a card
function setPriceAlert(cardName, targetPrice, direction = 'below') {
    priceAlerts.set(cardName, {
        targetPrice: parseFloat(targetPrice),
        direction, // 'below' or 'above'
        createdAt: new Date().toISOString()
    });
    savePriceAlerts();
    showSuccessToast(`Alerta criado: ${cardName} ${direction === 'below' ? 'abaixo de' : 'acima de'} $${targetPrice}`);
}

// Remove a price alert
function removePriceAlert(cardName) {
    if (priceAlerts.has(cardName)) {
        priceAlerts.delete(cardName);
        savePriceAlerts();
        showInfoToast(`Alerta removido: ${cardName}`);
    }
}

// Check all price alerts and notify if conditions are met
function checkPriceAlerts() {
    if (typeof priceService === 'undefined' || priceAlerts.size === 0) return;

    const triggeredAlerts = [];

    priceAlerts.forEach((alert, cardName) => {
        const currentPrice = priceService.getPrice(cardName);
        if (!currentPrice) return;

        const { targetPrice, direction } = alert;

        if (direction === 'below' && currentPrice <= targetPrice) {
            triggeredAlerts.push({
                cardName,
                currentPrice,
                targetPrice,
                direction,
                message: `${cardName} está a $${currentPrice.toFixed(2)} (abaixo de $${targetPrice})`
            });
        } else if (direction === 'above' && currentPrice >= targetPrice) {
            triggeredAlerts.push({
                cardName,
                currentPrice,
                targetPrice,
                direction,
                message: `${cardName} está a $${currentPrice.toFixed(2)} (acima de $${targetPrice})`
            });
        }
    });

    // Show notifications for triggered alerts
    if (triggeredAlerts.length > 0) {
        showPriceAlertNotifications(triggeredAlerts);
    }

    return triggeredAlerts;
}

// Show price alert notifications
function showPriceAlertNotifications(alerts) {
    alerts.forEach(alert => {
        showToast(alert.message, 'warning', 'Alerta de Preço', 8000);
    });
}

// Get all active price alerts
function getAllPriceAlerts() {
    const alerts = [];
    priceAlerts.forEach((alert, cardName) => {
        const currentPrice = typeof priceService !== 'undefined' ? priceService.getPrice(cardName) : null;
        alerts.push({
            cardName,
            ...alert,
            currentPrice
        });
    });
    return alerts;
}

// Open price alert modal for a card
function openPriceAlertModal(cardName) {
    const modal = document.getElementById('price-alert-modal');
    if (!modal) return;

    const currentPrice = typeof priceService !== 'undefined' ? priceService.getPrice(cardName) : 0;
    const existingAlert = priceAlerts.get(cardName);

    document.getElementById('alert-card-name').textContent = cardName;
    document.getElementById('alert-current-price').textContent = currentPrice ? `$${currentPrice.toFixed(2)}` : 'N/A';
    document.getElementById('alert-target-price').value = existingAlert?.targetPrice || (currentPrice ? (currentPrice * 0.9).toFixed(2) : '');
    document.getElementById('alert-direction').value = existingAlert?.direction || 'below';

    // Store card name for form submission
    modal.dataset.cardName = cardName;

    // Show/hide remove button
    const removeBtn = document.getElementById('remove-alert-btn');
    if (removeBtn) {
        removeBtn.style.display = existingAlert ? 'block' : 'none';
    }

    modal.classList.remove('hidden');
    trapFocus(modal);
}

// Close price alert modal
function closePriceAlertModal() {
    const modal = document.getElementById('price-alert-modal');
    if (modal) {
        modal.classList.add('hidden');
        releaseFocusTrap();
    }
}
window.closePriceAlertModal = closePriceAlertModal;
window.openPriceAlertModal = openPriceAlertModal;
window.handlePriceAlertSubmit = handlePriceAlertSubmit;
window.removePriceAlert = removePriceAlert;
window.renderPriceAlerts = renderPriceAlerts;

// Handle price alert form submission
function handlePriceAlertSubmit(e) {
    e.preventDefault();

    const modal = document.getElementById('price-alert-modal');
    const cardName = modal?.dataset.cardName;
    const targetPrice = parseFloat(document.getElementById('alert-target-price').value);
    const direction = document.getElementById('alert-direction').value;

    if (!cardName || isNaN(targetPrice) || targetPrice <= 0) {
        showErrorToast('Preencha um preço válido maior que zero');
        return;
    }

    // Validate logic - warn if alert would trigger immediately
    const currentPrice = typeof priceService !== 'undefined' ? priceService.getPrice(cardName) : null;
    if (currentPrice) {
        if (direction === 'below' && currentPrice <= targetPrice) {
            showWarningToast(`Preço atual ($${currentPrice.toFixed(2)}) já está abaixo de $${targetPrice.toFixed(2)}. O alerta disparará imediatamente.`);
        } else if (direction === 'above' && currentPrice >= targetPrice) {
            showWarningToast(`Preço atual ($${currentPrice.toFixed(2)}) já está acima de $${targetPrice.toFixed(2)}. O alerta disparará imediatamente.`);
        }
    }

    setPriceAlert(cardName, targetPrice, direction);
    showSuccessToast(`Alerta de preço configurado para ${cardName}`);
    closePriceAlertModal();
    renderPriceAlerts(); // Update alerts list if visible
}

// Render price alerts list
function renderPriceAlerts() {
    const container = document.getElementById('price-alerts-list');
    if (!container) return;

    const alerts = getAllPriceAlerts();

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="bell-off"></i>
                <p>Nenhum alerta de preço configurado</p>
                <p class="subtitle">Adicione alertas nos cards da sua wishlist</p>
            </div>
        `;
        refreshIcons(container);
        return;
    }

    container.innerHTML = `
        <div class="alerts-grid">
            ${alerts.map(alert => {
                const escapedNameAttr = escapeAttr(alert.cardName);
                const escapedNameJs = alert.cardName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                return `
                <div class="alert-card" data-card="${escapedNameAttr}">
                    <div class="alert-info">
                        <span class="alert-card-name">${escapeHtml(alert.cardName)}</span>
                        <div class="alert-details">
                            <span class="alert-condition">
                                ${alert.direction === 'below' ? '↓ Abaixo de' : '↑ Acima de'}
                                <strong>$${alert.targetPrice.toFixed(2)}</strong>
                            </span>
                            <span class="alert-current">
                                Atual: ${alert.currentPrice ? `$${alert.currentPrice.toFixed(2)}` : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div class="alert-actions">
                        <button class="btn btn-icon" onclick="openPriceAlertModal('${escapedNameJs}')" aria-label="Editar alerta">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn btn-icon btn-danger" onclick="removePriceAlert('${escapedNameJs}'); renderPriceAlerts();" aria-label="Remover alerta">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
    refreshIcons(container);
}

// Toggle price alerts section collapse
function togglePriceAlertsSection() {
    const section = document.getElementById('price-alerts-section');
    if (!section) return;

    section.classList.toggle('collapsed');
}
window.togglePriceAlertsSection = togglePriceAlertsSection;

// FILTER STATE PERSISTENCE
// ============================================

const FILTER_STATE_KEY = 'sorcery-filter-state';

// Save current filter state
function saveFilterState() {
    const state = {
        cards: {
            search: document.getElementById('search-input')?.value || '',
            set: document.getElementById('set-filter')?.value || '',
            type: document.getElementById('type-filter')?.value || '',
            element: document.getElementById('element-filter')?.value || '',
            rarity: document.getElementById('rarity-filter')?.value || ''
        },
        collection: {
            search: document.getElementById('collection-search')?.value || '',
            set: document.getElementById('collection-set-filter')?.value || '',
            type: document.getElementById('collection-type-filter')?.value || '',
            element: document.getElementById('collection-element-filter')?.value || '',
            rarity: document.getElementById('collection-rarity-filter')?.value || '',
            sort: document.getElementById('collection-sort')?.value || ''
        }
    };

    try {
        sessionStorage.setItem(FILTER_STATE_KEY, JSON.stringify(state));
    } catch (e) {
        // Silently fail - filter persistence is optional
    }
}

// Restore filter state from storage
function restoreFilterState() {
    try {
        const stored = sessionStorage.getItem(FILTER_STATE_KEY);
        if (!stored) return;

        const state = JSON.parse(stored);

        // Restore cards filters
        if (state.cards) {
            const searchInput = document.getElementById('search-input');
            const setFilter = document.getElementById('set-filter');
            const typeFilter = document.getElementById('type-filter');
            const elementFilter = document.getElementById('element-filter');
            const rarityFilter = document.getElementById('rarity-filter');

            if (searchInput && state.cards.search) searchInput.value = state.cards.search;
            if (setFilter && state.cards.set) setFilter.value = state.cards.set;
            if (typeFilter && state.cards.type) typeFilter.value = state.cards.type;
            if (elementFilter && state.cards.element) elementFilter.value = state.cards.element;
            if (rarityFilter && state.cards.rarity) rarityFilter.value = state.cards.rarity;
        }

        // Restore collection filters
        if (state.collection) {
            const collSearch = document.getElementById('collection-search');
            const collSet = document.getElementById('collection-set-filter');
            const collType = document.getElementById('collection-type-filter');
            const collElement = document.getElementById('collection-element-filter');
            const collRarity = document.getElementById('collection-rarity-filter');
            const collSort = document.getElementById('collection-sort');

            if (collSearch && state.collection.search) collSearch.value = state.collection.search;
            if (collSet && state.collection.set) collSet.value = state.collection.set;
            if (collType && state.collection.type) collType.value = state.collection.type;
            if (collElement && state.collection.element) collElement.value = state.collection.element;
            if (collRarity && state.collection.rarity) collRarity.value = state.collection.rarity;
            if (collSort && state.collection.sort) collSort.value = state.collection.sort;
        }
    } catch (e) {
        // Silently fail
    }
}

// Apply Filters
function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase().trim();
    const setFilter = document.getElementById('set-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const elementFilter = document.getElementById('element-filter').value;
    const rarityFilter = document.getElementById('rarity-filter').value;

    // Save filter state
    saveFilterState();

    // Get keyword parser instance if available
    const parser = typeof KeywordParser !== 'undefined' ? new KeywordParser() : null;

    // Determine search mode (exact or fuzzy)
    let candidateCards = allCards;
    let usedFuzzySearch = false;

    if (search && search.length >= 2) {
        // First try exact/prefix search via index
        if (searchIndex) {
            const prefixKey = `prefix:${search}`;
            const indices = searchIndex.get(prefixKey);
            if (indices && indices.length > 0) {
                candidateCards = indices.map(i => allCards[i]);
            } else {
                // Try substring match
                candidateCards = allCards.filter(card =>
                    card.name.toLowerCase().includes(search)
                );
            }
        } else {
            candidateCards = allCards.filter(card =>
                card.name.toLowerCase().includes(search)
            );
        }

        // If few results with exact search, try fuzzy search
        if (shouldUseFuzzySearch(search, candidateCards)) {
            candidateCards = fuzzySearchCards(search, allCards);
            usedFuzzySearch = true;
        }
    }

    filteredCards = candidateCards.filter(card => {
        // Search (already filtered above for length >= 2)
        if (search && search.length < 2 && !card.name.toLowerCase().includes(search)) return false;

        // Set filter
        if (setFilter) {
            const cardSets = card.sets.map(s => s.name);
            if (!cardSets.includes(setFilter)) return false;
        }

        // Type filter
        if (typeFilter && card.guardian.type !== typeFilter) return false;

        // Element filter
        if (elementFilter) {
            const elements = card.elements || 'None';
            if (!elements.includes(elementFilter)) return false;
        }

        // Rarity filter
        if (rarityFilter && card.guardian.rarity !== rarityFilter) return false;

        // Keyword filter
        if (activeKeywordFilters.size > 0 && parser) {
            const rulesText = card.guardian?.rulesText || '';
            const cardKeywords = parser.parseRulesText(rulesText);
            const cardKeywordNames = cardKeywords.map(k => k.name.toLowerCase());

            // Card must have ALL selected keywords
            for (const keyword of activeKeywordFilters) {
                if (!cardKeywordNames.includes(keyword.toLowerCase())) {
                    return false;
                }
            }
        }

        return true;
    });

    // Apply sorting
    const sortFilter = document.getElementById('sort-filter');
    const sortValue = sortFilter ? sortFilter.value : 'name-asc';

    filteredCards = sortCards(filteredCards, sortValue);

    // Update results count with fuzzy indicator
    const resultsCountEl = document.getElementById('results-count');
    if (resultsCountEl) {
        let countText = `${filteredCards.length} cards`;
        if (usedFuzzySearch && filteredCards.length > 0) {
            countText += ' (busca aproximada)';
        }
        resultsCountEl.textContent = countText;
    }

    renderCards();
}

/**
 * Sort cards based on the selected sort option
 */
function sortCards(cards, sortOption) {
    const rarityOrder = { 'Unique': 4, 'Elite': 3, 'Exceptional': 2, 'Ordinary': 1 };
    const setOrder = { 'Alpha': 1, 'Beta': 2, 'Arthurian Legends': 3, 'Gothic': 4, 'Dragonlord': 5, 'Promotional': 6 };

    return [...cards].sort((a, b) => {
        switch (sortOption) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-desc': {
                const priceA = getCardPriceForSort(a) || 0;
                const priceB = getCardPriceForSort(b) || 0;
                return priceB - priceA;
            }
            case 'price-asc': {
                const priceA = getCardPriceForSort(a) || 0;
                const priceB = getCardPriceForSort(b) || 0;
                return priceA - priceB;
            }
            case 'rarity-desc': {
                const rarA = rarityOrder[a.guardian?.rarity] || 0;
                const rarB = rarityOrder[b.guardian?.rarity] || 0;
                if (rarB !== rarA) return rarB - rarA;
                return a.name.localeCompare(b.name);
            }
            case 'rarity-asc': {
                const rarA = rarityOrder[a.guardian?.rarity] || 0;
                const rarB = rarityOrder[b.guardian?.rarity] || 0;
                if (rarA !== rarB) return rarA - rarB;
                return a.name.localeCompare(b.name);
            }
            case 'set-release': {
                const setA = a.sets?.[0]?.name || '';
                const setB = b.sets?.[0]?.name || '';
                const orderA = setOrder[setA] || 99;
                const orderB = setOrder[setB] || 99;
                if (orderA !== orderB) return orderA - orderB;
                return a.name.localeCompare(b.name);
            }
            default:
                return a.name.localeCompare(b.name);
        }
    });
}

/**
 * Get card price for sorting and display (from card object)
 * Uses market price for consistency with detail modal
 */
function getCardPriceForSort(card) {
    if (!card || !card.name) return 0;

    // Prioridade: tcgcsvPriceService (dados reais do TCGPlayer)
    // Usar getPrice para mostrar o preço MARKET (igual ao modal de detalhes)
    if (typeof tcgcsvPriceService !== 'undefined' && tcgcsvPriceService.cardPrices.size > 0) {
        const price = tcgcsvPriceService.getPrice(card.name, null, 'Normal');
        if (price && price > 0) return price;
    }

    // Fallback: priceService antigo
    if (typeof priceService !== 'undefined') {
        return priceService.getPrice(card.name, 'standard') || 0;
    }

    return 0;
}

// Initialize Keyword Filter
function initKeywordFilter() {
    const searchInput = document.getElementById('keyword-search');
    const dropdown = document.getElementById('keyword-dropdown');

    if (!searchInput || !dropdown) return;

    // Get all unique keywords from cards
    const allKeywords = getAllKeywordsFromCards();

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            dropdown.classList.add('hidden');
            return;
        }

        const matches = allKeywords.filter(k =>
            k.toLowerCase().includes(query) &&
            !activeKeywordFilters.has(k)
        ).slice(0, 10);

        if (matches.length === 0) {
            dropdown.classList.add('hidden');
            return;
        }

        dropdown.innerHTML = matches.map(k => `
            <div class="keyword-option" data-keyword="${k}">
                <span class="keyword-name">${k}</span>
            </div>
        `).join('');

        dropdown.classList.remove('hidden');

        // Add click handlers
        dropdown.querySelectorAll('.keyword-option').forEach(opt => {
            opt.addEventListener('click', () => {
                addKeywordFilter(opt.dataset.keyword);
                searchInput.value = '';
                dropdown.classList.add('hidden');
            });
        });
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.keyword-filter-container')) {
            dropdown.classList.add('hidden');
        }
    });

    // Handle Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const firstOption = dropdown.querySelector('.keyword-option');
            if (firstOption) {
                addKeywordFilter(firstOption.dataset.keyword);
                searchInput.value = '';
                dropdown.classList.add('hidden');
            }
        } else if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
            searchInput.value = '';
        }
    });
}

function getAllKeywordsFromCards() {
    if (typeof KeywordParser === 'undefined' || typeof SORCERY_KEYWORDS === 'undefined') {
        return [];
    }

    // Return all known keywords instead of parsing each card
    return Object.keys(SORCERY_KEYWORDS).sort();
}

function addKeywordFilter(keyword) {
    activeKeywordFilters.add(keyword);
    renderActiveKeywords();
    applyFilters();
}

function removeKeywordFilter(keyword) {
    activeKeywordFilters.delete(keyword);
    renderActiveKeywords();
    applyFilters();
}

function renderActiveKeywords() {
    const container = document.getElementById('active-keywords');
    if (!container) return;

    if (activeKeywordFilters.size === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = Array.from(activeKeywordFilters).map(k => `
        <span class="keyword-tag">
            ${k}
            <button class="remove-keyword" onclick="removeKeywordFilter('${k}')">&times;</button>
        </span>
    `).join('');
}

function clearAllKeywordFilters() {
    activeKeywordFilters.clear();
    renderActiveKeywords();
    applyFilters();
}

// Clear all filters and reset search
function clearAllFilters() {
    // Clear search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Reset all select filters
    const setFilter = document.getElementById('set-filter');
    const typeFilter = document.getElementById('type-filter');
    const elementFilter = document.getElementById('element-filter');
    const rarityFilter = document.getElementById('rarity-filter');

    if (setFilter) setFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    if (elementFilter) elementFilter.value = '';
    if (rarityFilter) rarityFilter.value = '';

    // Clear keyword filters
    clearAllKeywordFilters();

    // Clear session storage
    sessionStorage.removeItem('sorcery-filter-state');

    showSuccessToast('Filtros limpos');
}

// Clear collection filters
function clearCollectionFilters() {
    const searchInput = document.getElementById('collection-search');
    const setFilter = document.getElementById('collection-set-filter');
    const typeFilter = document.getElementById('collection-type-filter');
    const elementFilter = document.getElementById('collection-element-filter');
    const rarityFilter = document.getElementById('collection-rarity-filter');
    const preconFilter = document.getElementById('collection-precon-filter');

    if (searchInput) searchInput.value = '';
    if (setFilter) setFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    if (elementFilter) elementFilter.value = '';
    if (rarityFilter) rarityFilter.value = '';
    if (preconFilter) preconFilter.value = '';

    renderCollection();
    showSuccessToast('Filtros da coleção limpos');
}

// Render Cards with infinite scroll
function renderCards() {
    resultsCountEl.textContent = `${filteredCards.length} cards`;

    // Reset state
    currentCardIndex = 0;
    cardsGridEl.innerHTML = '';

    // Remove existing observer
    if (cardsObserver) {
        cardsObserver.disconnect();
    }

    // Show empty state if no cards match filters
    if (filteredCards.length === 0 && allCards.length > 0) {
        cardsGridEl.innerHTML = createEmptyState({
            icon: 'search-x',
            title: 'Nenhuma carta encontrada',
            description: 'Tente ajustar os filtros ou buscar por outro termo.',
            actions: [
                { label: 'Limpar filtros', onclick: 'clearAllFilters()', icon: 'x', primary: false }
            ]
        });
        refreshIcons(cardsGridEl);
        return;
    }

    // Render first batch
    renderCardsBatch();

    // Setup infinite scroll observer
    setupCardsObserver();
}

// Render a batch of cards
function renderCardsBatch() {
    if (isLoadingMoreCards || currentCardIndex >= filteredCards.length) return;

    isLoadingMoreCards = true;

    const batch = filteredCards.slice(currentCardIndex, currentCardIndex + CARDS_PER_BATCH);
    const fragment = document.createDocumentFragment();

    batch.forEach(card => {
        const div = document.createElement('div');
        div.innerHTML = createCardHTML(card);
        const cardEl = div.firstElementChild;

        // Add click listener
        cardEl.addEventListener('click', () => {
            openCardModal(card.name);
        });

        fragment.appendChild(cardEl);
    });

    cardsGridEl.appendChild(fragment);
    currentCardIndex += batch.length;
    isLoadingMoreCards = false;

    // Update Lucide icons for new cards
    refreshIcons(cardsGridEl);
}

// Setup Intersection Observer for infinite scroll
function setupCardsObserver() {
    // Create sentinel element
    let sentinel = document.getElementById('cards-sentinel');
    if (!sentinel) {
        sentinel = document.createElement('div');
        sentinel.id = 'cards-sentinel';
        sentinel.style.height = '1px';
        sentinel.style.width = '100%';
    }

    // Ensure sentinel is at the end
    if (sentinel.parentElement !== cardsGridEl.parentElement) {
        cardsGridEl.parentElement.appendChild(sentinel);
    }

    // Create observer
    cardsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && currentCardIndex < filteredCards.length) {
                renderCardsBatch();
            }
        });
    }, {
        root: null,
        rootMargin: '200px', // Load more before reaching the end
        threshold: 0
    });

    cardsObserver.observe(sentinel);
}

// Create Card HTML
function createCardHTML(card) {
    const inCollection = hasCard(card.name);
    const inWishlist = wishlist.has(card.name);
    const imageSlug = getCardImageSlug(card);
    const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : '';
    const escapedName = escapeAttr(card.name);

    const elementClass = (card.elements || 'None').toLowerCase().split(',')[0].trim();

    // Get price for badge
    const price = getCardPriceForSort(card);
    const priceDisplay = price > 0 ? `$${price.toFixed(2)}` : '';
    const priceBadgeClass = price > 0 ? 'card-price-badge' : 'card-price-badge no-price hidden';

    return `
        <div class="card-item ${inCollection ? 'in-collection' : ''} ${inWishlist ? 'in-wishlist' : ''}"
             data-card-name="${escapedName}">
            ${priceDisplay ? `<span class="${priceBadgeClass}">${priceDisplay}</span>` : ''}
            <img class="card-image"
                 src="${imageUrl}"
                 alt="${escapedName}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 280%22><rect fill=%22%231a1a1f%22 width=%22200%22 height=%22280%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23666%22 text-anchor=%22middle%22 font-size=%2214%22>${escapeAttr(card.name)}</text></svg>'">
            <div class="card-item-info">
                <div class="card-item-name">${escapeHtml(card.name)}</div>
                <div class="card-item-meta">
                    <span class="badge ${elementClass}">${card.guardian.type}</span>
                </div>
            </div>
        </div>
    `;
}

// Get card image slug
function getCardImageSlug(card) {
    if (!card.sets || card.sets.length === 0) return null;

    // Prefer Beta, then Alpha, then latest set
    const preferredSets = ['Beta', 'Alpha', 'Gothic', 'Arthurian Legends'];
    let selectedSet = card.sets[0];

    for (const setName of preferredSets) {
        const found = card.sets.find(s => s.name === setName);
        if (found) {
            selectedSet = found;
            break;
        }
    }

    if (selectedSet.variants && selectedSet.variants.length > 0) {
        // Prefer standard finish
        const standard = selectedSet.variants.find(v => v.finish === 'Standard');
        return standard ? standard.slug : selectedSet.variants[0].slug;
    }

    return null;
}

// Get card slug for deep linking
function getCardSlug(card) {
    return getCardImageSlug(card);
}

// Find card by slug (for deep linking)
function findCardBySlug(slug) {
    if (!slug) return null;

    for (const card of allCards) {
        if (!card.sets) continue;

        for (const set of card.sets) {
            if (!set.variants) continue;

            const found = set.variants.find(v => v.slug === slug);
            if (found) {
                return {
                    card: card,
                    variant: found,
                    set: set
                };
            }
        }
    }

    // Try partial match (card name part of slug)
    const slugParts = slug.split('-');
    if (slugParts.length >= 3) {
        // Extract card name (middle parts)
        const cardNameSlug = slugParts.slice(1, -2).join('_');
        const cardNameFormatted = cardNameSlug.replace(/_/g, ' ');

        const card = allCards.find(c =>
            c.name.toLowerCase() === cardNameFormatted.toLowerCase()
        );

        if (card) {
            return { card: card, variant: null, set: null };
        }
    }

    return null;
}

/**
 * Handle share parameters from URL (for social media links)
 * Query params: view, v, artist, card, deck, set, element
 */
function handleShareParams(urlParams) {
    if (!urlParams) {
        urlParams = new URLSearchParams(window.location.search);
    }

    const view = urlParams.get('view') || urlParams.get('v');
    const artist = urlParams.get('artist');
    const card = urlParams.get('card');
    const deck = urlParams.get('deck');
    const set = urlParams.get('set');
    const element = urlParams.get('element');

    // Se tem parâmetros, navega para a view apropriada
    if (view || artist || card || deck) {
        setTimeout(() => {
            // Card específico
            if (card) {
                const foundCard = allCards.find(c =>
                    c.name.toLowerCase() === card.toLowerCase()
                );
                if (foundCard) {
                    showView('cards');
                    openCardModal(foundCard.name);
                }
                return;
            }

            // Artista específico
            if (artist) {
                showView('art');
                setTimeout(() => {
                    const searchInput = document.getElementById('artist-search');
                    if (searchInput) {
                        searchInput.value = artist;
                        searchInput.dispatchEvent(new Event('input'));
                    }
                    // Tenta abrir o artista diretamente
                    if (typeof showArtistCards === 'function') {
                        showArtistCards(artist);
                    }
                }, 300);
                return;
            }

            // Deck específico
            if (deck) {
                showView('decks');
                setTimeout(() => {
                    // Procura o deck e abre
                    const deckData = [...recommendedDecks, ...(userDecks || [])].find(d =>
                        d.name.toLowerCase() === deck.toLowerCase()
                    );
                    if (deckData && typeof openDeckDetail === 'function') {
                        openDeckDetail(deckData);
                    }
                }, 300);
                return;
            }

            // View com filtros
            if (view) {
                showView(view);

                // Aplica filtros se especificados
                if (view === 'cards') {
                    setTimeout(() => {
                        if (set) {
                            const setFilter = document.getElementById('set-filter');
                            if (setFilter) {
                                setFilter.value = set;
                                setFilter.dispatchEvent(new Event('change'));
                            }
                        }
                        if (element) {
                            const elementFilter = document.getElementById('element-filter');
                            if (elementFilter) {
                                elementFilter.value = element;
                                elementFilter.dispatchEvent(new Event('change'));
                            }
                        }
                    }, 300);
                }
            }
        }, 500); // Aguarda cards carregarem

        // Limpa os parâmetros da URL para não reprocessar
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

// Handle deep link from URL hash
function handleDeepLink() {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);

    // Check for profile deep link first (via query param)
    const profileToken = urlParams.get('profile') || urlParams.get('u');
    if (profileToken) {
        loadPublicProfile(profileToken);
        return;
    }

    // Ignorar hashes especiais tratados por outros handlers
    if (hash.startsWith('#reset-password')) {
        // checkResetPasswordURL() vai tratar este hash no DOMContentLoaded
        return;
    }

    // Handle card deep links (via hash)
    if (hash.startsWith('#card/')) {
        const slug = hash.replace('#card/', '');
        const result = findCardBySlug(slug);

        if (result && result.card) {
            // Open modal without updating hash (already set)
            openCardModal(result.card.name, false);
        }
        return;
    }

    // Handle view deep links using new router
    if (hash && hash !== '#') {
        handleHashChange();
    }
}

// ============================================
// PUBLIC PROFILE FUNCTIONS
// ============================================

// Load and display a public profile
async function loadPublicProfile(identifier) {
    showView('profile');

    // Show loading state
    const profileName = document.getElementById('public-profile-name');
    const profileBio = document.getElementById('public-profile-bio');
    const profileNotFound = document.getElementById('profile-not-found');
    const statsSections = document.querySelectorAll('.profile-stat-card, .profile-section');

    profileName.textContent = 'Carregando...';
    profileBio.textContent = '';
    profileNotFound.classList.add('hidden');
    statsSections.forEach(s => s.style.display = '');

    try {
        // Fetch the public profile
        const profile = await profileService.getPublicProfile(identifier);

        if (!profile) {
            // Profile not found or private
            profileName.textContent = '';
            profileNotFound.classList.remove('hidden');
            statsSections.forEach(s => s.style.display = 'none');
            refreshIcons();
            return;
        }

        // Display profile info
        profileName.textContent = profile.displayName;
        profileBio.textContent = profile.bio || '';

        // Fetch collection data
        const collectionData = await profileService.getPublicCollectionData(profile.userId, profile.privacySettings);

        if (collectionData) {
            // Total cards
            document.getElementById('profile-total-cards').textContent = collectionData.totalCards || 0;

            // Completion percentage
            if (profile.privacySettings.showCompletionStats && collectionData.completionPercent !== undefined) {
                document.getElementById('profile-completion').textContent = collectionData.completionPercent + '%';
                document.getElementById('profile-stat-completion').style.display = '';
            } else {
                document.getElementById('profile-stat-completion').style.display = 'none';
            }

            // Collection value
            if (profile.privacySettings.showCollectionValue && collectionData.totalValue !== undefined) {
                document.getElementById('profile-value').textContent = '$' + collectionData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                document.getElementById('profile-stat-value').style.display = '';
            } else {
                document.getElementById('profile-stat-value').style.display = 'none';
            }

            // Set completion
            if (profile.privacySettings.showCompletionStats && collectionData.setCompletion) {
                document.getElementById('profile-sets-section').style.display = '';
                renderProfileSetProgress(collectionData.setCompletion);
            } else {
                document.getElementById('profile-sets-section').style.display = 'none';
            }

            // Top cards
            if (profile.privacySettings.showTopCards && collectionData.topCards) {
                document.getElementById('profile-top-cards-section').style.display = '';
                renderProfileTopCards(collectionData.topCards);
            } else {
                document.getElementById('profile-top-cards-section').style.display = 'none';
            }
        }

        // Decks count and list
        if (profile.privacySettings.showDeckLists) {
            const decks = await nocoDBService.getPublicDecks(profile.userId);
            document.getElementById('profile-decks-count').textContent = decks.length;
            document.getElementById('profile-stat-decks').style.display = '';
            document.getElementById('profile-decks-section').style.display = '';
            renderProfileDecks(decks);
        } else {
            document.getElementById('profile-stat-decks').style.display = 'none';
            document.getElementById('profile-decks-section').style.display = 'none';
        }

        refreshIcons();

    } catch (error) {
        console.error('[Profile] Error loading public profile:', error);
        profileName.textContent = '';
        profileNotFound.classList.remove('hidden');
        statsSections.forEach(s => s.style.display = 'none');
        refreshIcons();
    }
}

// Render set progress for public profile
function renderProfileSetProgress(setCompletion) {
    const container = document.getElementById('profile-sets-progress');
    container.innerHTML = '';

    for (const [setName, data] of Object.entries(setCompletion)) {
        const item = document.createElement('div');
        item.className = 'set-progress-item';
        item.innerHTML = `
            <div class="set-name">${setName}</div>
            <div class="set-progress-bar">
                <div class="progress-fill" style="width: ${data.percent}%"></div>
            </div>
            <div class="set-progress-stats">
                <span>${data.owned}/${data.total}</span>
                <span>${data.percent}%</span>
            </div>
        `;
        container.appendChild(item);
    }
}

// Render top cards for public profile
function renderProfileTopCards(topCards) {
    const container = document.getElementById('profile-top-cards');
    container.innerHTML = '';

    topCards.slice(0, 10).forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'top-card-item';
        item.onclick = () => openCardModal(card.name);
        item.innerHTML = `
            <span class="top-card-rank">${index + 1}</span>
            <div class="top-card-info">
                <span class="top-card-name">${card.name}</span>
            </div>
            <span class="top-card-value">$${card.value.toFixed(2)}</span>
        `;
        container.appendChild(item);
    });

    if (topCards.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Nenhum card com valor registrado</p>';
    }
}

// Render public decks for public profile
function renderProfileDecks(decks) {
    const container = document.getElementById('profile-public-decks');
    container.innerHTML = '';

    if (decks.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Nenhum deck público</p>';
        return;
    }

    decks.forEach(deck => {
        const cards = JSON.parse(deck.cards_json || '[]');
        const item = document.createElement('div');
        item.className = 'public-deck-card';
        item.innerHTML = `
            <div class="public-deck-header">
                <span class="public-deck-avatar">${deck.avatar || '🎴'}</span>
                <span class="public-deck-name">${deck.deck_name}</span>
            </div>
            <div class="public-deck-stats">
                <span>${cards.length} cards</span>
            </div>
        `;
        container.appendChild(item);
    });
}

// ============================================
// PROFILE SETTINGS MODAL
// ============================================

// Open profile settings modal
async function openProfileSettings() {
    if (!nocoDBService.isLoggedIn()) {
        alert('Você precisa estar logado para configurar seu perfil.');
        return;
    }

    const modal = document.getElementById('profile-modal');
    let profile = profileService.getProfile();

    // Initialize profile if it doesn't exist
    if (!profile) {
        const user = nocoDBService.getCurrentUser();
        if (user) {
            await profileService.initProfile(user.id || user.Id, user.displayName || user.username);
            profile = profileService.getProfile();
        }
    }

    if (profile) {
        // Fill in current values
        document.getElementById('profile-display-name').value = profile.displayName || '';
        document.getElementById('profile-bio').value = profile.bio || '';
        document.getElementById('bio-char-count').textContent = (profile.bio || '').length;
        document.getElementById('profile-is-public').checked = profile.isPublic || false;
        document.getElementById('profile-show-value').checked = profile.privacySettings?.showCollectionValue ?? true;
        document.getElementById('profile-show-completion').checked = profile.privacySettings?.showCompletionStats ?? true;
        document.getElementById('profile-show-top-cards').checked = profile.privacySettings?.showTopCards ?? true;
        document.getElementById('profile-show-decks').checked = profile.privacySettings?.showDeckLists ?? false;

        // Always set share URL (user can toggle profile to public to use it)
        const shareUrl = profileService.getShareUrl();
        const shareSection = document.getElementById('profile-share-section');
        const shareUrlInput = document.getElementById('profile-share-url');

        shareUrlInput.value = shareUrl || '';

        // Always show share section, but with different styling/message
        shareSection.style.display = '';
        if (!profile.isPublic) {
            shareSection.classList.add('share-disabled');
        } else {
            shareSection.classList.remove('share-disabled');
        }
    }

    // Render current avatar
    renderCurrentAvatarPreview();

    // Hide avatar grid initially
    const avatarGrid = document.getElementById('profile-avatar-grid');
    if (avatarGrid) avatarGrid.classList.add('hidden');

    // Update last sync time
    updateProfileLastSyncTime();

    modal.classList.remove('hidden');
    refreshIcons();

    // Trap focus for accessibility
    requestAnimationFrame(() => trapFocus(modal));
}

// Render current avatar preview in profile settings
function renderCurrentAvatarPreview() {
    const container = document.getElementById('profile-current-avatar');
    if (!container || typeof getAvatarSVG !== 'function') return;

    const user = nocoDBService.getCurrentUser();
    const avatarId = user?.avatar_id || 1;
    container.innerHTML = getAvatarSVG(avatarId);
}

// Open avatar selector inline in profile modal
function openAvatarSelectorInline() {
    const grid = document.getElementById('profile-avatar-grid');
    if (!grid) return;

    if (grid.classList.contains('hidden')) {
        // Render avatar options
        renderAvatarOptionsInline();
        grid.classList.remove('hidden');
    } else {
        grid.classList.add('hidden');
    }
}

// Render avatar options in profile modal (4 Elements with PNG images)
function renderAvatarOptionsInline() {
    const grid = document.getElementById('profile-avatar-grid');
    if (!grid || typeof AVATAR_ELEMENTS === 'undefined') return;

    const user = nocoDBService.getCurrentUser();
    const currentAvatarId = user?.avatar_id || user?.avatarId || 1;

    // Convert AVATAR_ELEMENTS object to array
    const elements = Object.values(AVATAR_ELEMENTS);

    grid.innerHTML = elements.map(element => `
        <div class="avatar-option element-option ${element.id === currentAvatarId ? 'selected' : ''}"
             data-avatar-id="${element.id}"
             title="${element.name}"
             onclick="selectAvatarInline(${element.id})">
            <img src="${element.image}" alt="${element.name}" class="element-img">
            <span class="element-name">${element.name}</span>
        </div>
    `).join('');
}

// Select avatar/element inline in profile modal
async function selectAvatarInline(elementId) {
    // Update visual selection
    const grid = document.getElementById('profile-avatar-grid');
    if (grid) {
        grid.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.avatarId) === elementId);
        });
    }

    // Update preview
    const preview = document.getElementById('profile-current-avatar');
    if (preview && typeof getAvatarSVG === 'function') {
        preview.innerHTML = getAvatarSVG(elementId);
    }

    // Save and update avatar using avatar-system.js function
    if (typeof updateUserAvatar === 'function') {
        await updateUserAvatar(elementId);
    }

    // Hide grid after selection
    if (grid) {
        setTimeout(() => grid.classList.add('hidden'), 300);
    }
    // Toast is shown by updateUserAvatar() in avatar-system.js
}

// Update last sync time in profile modal
function updateProfileLastSyncTime() {
    const userId = getCurrentUserId();
    const lastSyncEl = document.getElementById('profile-last-sync');
    if (!lastSyncEl) return;

    if (userId) {
        const lastSync = localStorage.getItem(`sorcery-last-sync-${userId}`);
        if (lastSync) {
            const date = new Date(lastSync);
            lastSyncEl.textContent = date.toLocaleString('pt-BR');
        } else {
            lastSyncEl.textContent = 'Nunca';
        }
    } else {
        lastSyncEl.textContent = 'Nunca';
    }
}

// Handle sync upload from profile modal
async function handleProfileSyncUpload() {
    const uploadBtn = document.getElementById('profile-sync-upload');
    const statusEl = document.getElementById('profile-sync-status');
    const messageEl = statusEl?.querySelector('.sync-message-inline');

    if (uploadBtn) setButtonLoading(uploadBtn, true, 'Enviando...');
    if (statusEl) statusEl.classList.remove('hidden');
    if (messageEl) messageEl.textContent = 'Enviando coleção para a nuvem...';

    try {
        // Convert collection Map to object format
        const collectionObj = {};
        collection.forEach((data, cardName) => {
            collectionObj[cardName] = {
                qty: typeof data === 'object' ? data.qty : data,
                addedAt: typeof data === 'object' ? data.addedAt : new Date().toISOString()
            };
        });

        await nocoDBService.fullSyncToCloud(
            collectionObj,
            wishlist,
            tradeBinder,
            decks
        );

        // Save last sync time
        const userId = getCurrentUserId();
        if (userId) {
            localStorage.setItem(`sorcery-last-sync-${userId}`, new Date().toISOString());
        }

        if (messageEl) messageEl.textContent = 'Upload completo!';
        updateProfileLastSyncTime();
        showSuccessToast('Coleção sincronizada com a nuvem!', 'Sync completo');

        setTimeout(() => {
            if (statusEl) statusEl.classList.add('hidden');
        }, 2000);
    } catch (error) {
        if (messageEl) messageEl.textContent = `Erro: ${error.message}`;
        showErrorToast(error.message, 'Erro no sync');
    } finally {
        if (uploadBtn) setButtonLoading(uploadBtn, false);
    }
}

// Handle sync download from profile modal
async function handleProfileSyncDownload() {
    const downloadBtn = document.getElementById('profile-sync-download');
    const statusEl = document.getElementById('profile-sync-status');
    const messageEl = statusEl?.querySelector('.sync-message-inline');

    if (downloadBtn) setButtonLoading(downloadBtn, true, 'Baixando...');
    if (statusEl) statusEl.classList.remove('hidden');
    if (messageEl) messageEl.textContent = 'Baixando da nuvem...';

    try {
        const data = await nocoDBService.fullDownloadFromCloud();

        // Update local collection
        collection = new Map();
        const now = new Date().toISOString();
        Object.entries(data.collection).forEach(([cardName, cardData]) => {
            if (typeof cardData === 'number') {
                collection.set(cardName, { qty: cardData, addedAt: now });
            } else if (typeof cardData === 'object') {
                collection.set(cardName, { qty: cardData.qty || 1, addedAt: cardData.addedAt || now });
            } else {
                collection.set(cardName, { qty: 1, addedAt: now });
            }
        });

        // Update wishlist
        wishlist.clear();
        data.wishlist.forEach(cardName => wishlist.add(cardName));

        // Update trade binder
        tradeBinder.clear();
        data.tradeBinder.forEach(cardName => tradeBinder.add(cardName));

        // Update decks
        decks = data.decks;

        // Save locally
        saveLocalData();

        // Re-render
        renderCards();
        renderCollection();
        renderWishlist();

        if (messageEl) messageEl.textContent = 'Download completo!';
        updateProfileLastSyncTime();
        showSuccessToast('Coleção baixada da nuvem!', 'Download completo');

        setTimeout(() => {
            if (statusEl) statusEl.classList.add('hidden');
        }, 2000);
    } catch (error) {
        if (messageEl) messageEl.textContent = `Erro: ${error.message}`;
        showErrorToast(error.message, 'Erro no download');
    } finally {
        if (downloadBtn) setButtonLoading(downloadBtn, false);
    }
}

// Save profile settings
async function saveProfileSettings() {
    const displayName = document.getElementById('profile-display-name').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const isPublic = document.getElementById('profile-is-public').checked;
    const btn = document.getElementById('save-profile-btn');

    // Validate display name
    if (!displayName || displayName.length < 2) {
        showToast('Nome de exibição deve ter pelo menos 2 caracteres', 'error');
        return;
    }

    // Check for duplicate username (if changed)
    const currentProfile = profileService.getProfile();
    if (currentProfile && displayName !== currentProfile.displayName) {
        const isDuplicate = await checkDuplicateUsername(displayName);
        if (isDuplicate) {
            showToast('Este nome de usuário já está em uso', 'error');
            return;
        }
    }

    // Show loading state
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Salvando...';
    btn.disabled = true;
    refreshIcons();

    try {
        const privacySettings = {
            showCollectionValue: document.getElementById('profile-show-value').checked,
            showCompletionStats: document.getElementById('profile-show-completion').checked,
            showTopCards: document.getElementById('profile-show-top-cards').checked,
            showDeckLists: document.getElementById('profile-show-decks').checked
        };

        profileService.updateProfile({
            displayName: displayName,
            bio: bio,
            isPublic: isPublic
        });

        profileService.updatePrivacy(privacySettings);

        // Sync to cloud
        await profileService.syncProfileToCloud();

        // Update share URL and section visibility
        const shareUrl = profileService.getShareUrl();
        const shareSection = document.getElementById('profile-share-section');
        document.getElementById('profile-share-url').value = shareUrl || '';

        if (isPublic) {
            shareSection.classList.remove('share-disabled');
        } else {
            shareSection.classList.add('share-disabled');
        }

        // Show success and close modal
        btn.innerHTML = '<i data-lucide="check"></i> Salvo!';
        btn.style.background = 'var(--success)';
        refreshIcons();

        showToast('Configurações salvas com sucesso!', 'success');

        // Close modal after delay
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
            refreshIcons();
            closeModal('profile-modal');
        }, 1000);

    } catch (error) {
        console.error('Error saving profile:', error);
        btn.innerHTML = originalText;
        btn.disabled = false;
        refreshIcons();
        showToast('Erro ao salvar configurações', 'error');
    }
}

// Check if username is already taken
async function checkDuplicateUsername(displayName) {
    if (typeof nocoDBService === 'undefined') return false;

    try {
        const currentUser = nocoDBService.getCurrentUser();
        const profiles = await nocoDBService.getRecords('profiles', {
            where: `(display_name,eq,${displayName})`,
            limit: 1
        });

        // If found and it's not the current user's profile
        if (profiles && profiles.length > 0) {
            return profiles[0].user_id !== currentUser?.id;
        }
        return false;
    } catch (error) {
        console.error('Error checking duplicate username:', error);
        return false;
    }
}

// Copy profile share URL
async function copyProfileUrl() {
    const shareUrl = profileService.getShareUrl();
    const btn = document.getElementById('copy-profile-url');

    if (!shareUrl) {
        showToast('Link de perfil não disponível', 'error');
        return;
    }

    const success = await profileService.copyShareUrl();

    if (success) {
        btn.innerHTML = '<i data-lucide="check"></i>';
        refreshIcons();
        showToast('Link copiado para a área de transferência!', 'success');
        setTimeout(() => {
            btn.innerHTML = '<i data-lucide="copy"></i>';
            refreshIcons();
        }, 2000);
    } else {
        showToast('Erro ao copiar link', 'error');
    }
}

// Generate shareable URL for a card
function getCardShareURL(cardName) {
    const card = allCards.find(c => c.name === cardName);
    if (!card) return null;

    const slug = getCardSlug(card);
    if (!slug) return null;

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#card/${slug}`;
}

// Copy card share link to clipboard
async function copyCardShareLink(cardName) {
    const url = getCardShareURL(cardName);
    if (!url) {
        console.error('Could not generate share URL for', cardName);
        return false;
    }

    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

// Generate QR code URL for a card
function getCardQRCodeURL(cardName, size = 150) {
    const shareURL = getCardShareURL(cardName);
    if (!shareURL) return null;

    // Using QR Server API (free, no key required)
    const encodedURL = encodeURIComponent(shareURL);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedURL}&bgcolor=ffffff&color=000000&margin=10`;
}

// Update price table currency
function updatePriceTableCurrency(cardName, cardData, currency) {
    if (typeof tcgPriceService === 'undefined') return;

    const priceData = tcgPriceService.getCardPrices(cardName, cardData);
    const sets = Object.keys(priceData.prices);

    // Get all price tables
    const priceTables = document.querySelectorAll('.price-table');

    priceTables.forEach((table, index) => {
        if (index >= sets.length) return;

        const setName = sets[index];
        const setPrices = priceData.prices[setName];

        ['Standard', 'Foil', 'Rainbow'].forEach(finish => {
            if (setPrices[finish]) {
                const p = setPrices[finish];
                const row = table.querySelector(`.finish-row.${finish.toLowerCase()}`);
                if (row) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 4) {
                        cells[1].textContent = tcgPriceService.formatPrice(p.min, currency);
                        cells[2].textContent = tcgPriceService.formatPrice(p.mid, currency);
                        cells[3].textContent = tcgPriceService.formatPrice(p.max, currency);
                    }
                }
            }
        });
    });
}

// Toggle QR code display
function toggleQRCode(cardName) {
    const container = document.getElementById('qr-code-container');
    const img = document.getElementById('qr-code-image');

    if (!container || !img) return;

    if (container.classList.contains('hidden')) {
        const qrURL = getCardQRCodeURL(cardName);
        if (qrURL) {
            img.src = qrURL;
            container.classList.remove('hidden');
        }
    } else {
        container.classList.add('hidden');
    }
}

// Open Card Modal
function openCardModal(cardName, updateHash = true) {
    console.log('[openCardModal] Looking for card:', cardName, 'Type:', typeof cardName);
    const card = allCards.find(c => c.name === cardName);
    if (!card) {
        console.error('[openCardModal] Card NOT FOUND:', cardName);
        console.log('[openCardModal] allCards length:', allCards.length);
        console.log('[openCardModal] Sample cards:', allCards.slice(0, 3).map(c => c.name));
        return;
    }
    console.log('[openCardModal] Card found:', card.name);

    // Update URL hash for deep linking
    if (updateHash) {
        const slug = getCardSlug(card);
        if (slug) {
            history.pushState(null, '', `#card/${slug}`);
        }
    }

    const imageSlug = getCardImageSlug(card);
    const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : '';

    document.getElementById('modal-card-image').src = imageUrl;
    document.getElementById('modal-card-name').textContent = card.name;
    document.getElementById('modal-card-type').textContent = card.guardian.type;
    document.getElementById('modal-card-type').className = 'badge';
    document.getElementById('modal-card-rarity').textContent = card.guardian.rarity;
    document.getElementById('modal-card-rarity').className = `badge ${card.guardian.rarity?.toLowerCase()}`;

    const element = (card.elements || 'None').split(',')[0].trim();
    document.getElementById('modal-card-element').textContent = element;
    document.getElementById('modal-card-element').className = `badge ${element.toLowerCase()}`;

    // Stats
    const cost = card.guardian.cost !== null ? `Cost: ${card.guardian.cost}` : '';
    const attack = card.guardian.attack !== null ? `ATK: ${card.guardian.attack}` : '';
    const defence = card.guardian.defence !== null ? `DEF: ${card.guardian.defence}` : '';

    document.getElementById('modal-card-cost').textContent = cost;
    document.getElementById('modal-card-attack').textContent = attack;
    document.getElementById('modal-card-defence').textContent = defence;

    // Rules text
    const rulesText = card.guardian.rulesText || 'No rules text.';
    document.getElementById('modal-card-rules').textContent = rulesText.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');

    // Sets
    const setsHTML = card.sets.map(s => `<span class="badge">${s.name}</span>`).join(' ');
    document.getElementById('modal-card-sets').innerHTML = setsHTML;

    // Artist info
    const artistSection = document.getElementById('modal-artist-section');
    const artistLink = document.getElementById('modal-artist-link');
    const artistNameSpan = document.getElementById('modal-artist-name');

    // Get artist from card variants
    let artistName = null;
    if (card.sets && card.sets.length > 0) {
        for (const set of card.sets) {
            if (set.cards && set.cards.length > 0) {
                for (const variant of set.cards) {
                    if (variant.artist) {
                        artistName = variant.artist;
                        break;
                    }
                }
            }
            if (artistName) break;
        }
    }

    if (artistName && artistSection && artistLink && artistNameSpan) {
        artistSection.style.display = 'block';
        artistNameSpan.textContent = artistName;
        artistLink.onclick = (e) => {
            e.preventDefault();
            closeCardModal();
            switchView('art');
            setTimeout(() => {
                if (typeof showArtistCards === 'function') {
                    showArtistCards(artistName);
                }
            }, 100);
        };
    } else if (artistSection) {
        artistSection.style.display = 'none';
    }

    // Price information - Use new TCG Price Service
    const priceTableContainer = document.getElementById('modal-price-table');
    if (priceTableContainer && typeof tcgPriceService !== 'undefined') {
        priceTableContainer.innerHTML = tcgPriceService.generatePriceTableHTML(card.name, card);

        // Add price history chart container
        const chartContainer = document.createElement('div');
        chartContainer.id = 'price-history-chart';
        chartContainer.innerHTML = `<div class="price-chart-placeholder">
            <i data-lucide="loader"></i>
            <span>Carregando histórico...</span>
        </div>`;
        priceTableContainer.appendChild(chartContainer);

        // Load price history chart asynchronously
        tcgPriceService.generatePriceChartHTML(card.name).then(chartHTML => {
            chartContainer.innerHTML = chartHTML;
            refreshIcons();
        }).catch(() => {
            chartContainer.innerHTML = '<p class="text-muted">Histórico de preços indisponível</p>';
        });

        // Setup currency toggle
        const currencyBtns = priceTableContainer.querySelectorAll('.currency-btn');
        const rateInfo = document.getElementById('brl-rate-info');
        const rateSpan = document.getElementById('current-brl-rate');

        currencyBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const currency = btn.dataset.currency;

                // Se for BRL, buscar cotação atual
                if (currency === 'BRL') {
                    btn.textContent = 'BRL...';
                    btn.disabled = true;

                    try {
                        const rate = await tcgPriceService.fetchCurrentBRLRate();
                        btn.textContent = `BRL (${rate.toFixed(2)})`;
                        if (rateSpan) rateSpan.textContent = rate.toFixed(2);
                        if (rateInfo) rateInfo.style.display = 'inline';
                    } catch (e) {
                        btn.textContent = 'BRL';
                    } finally {
                        btn.disabled = false;
                    }
                } else {
                    // Voltar para USD
                    if (rateInfo) rateInfo.style.display = 'none';
                }

                currencyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updatePriceTableCurrency(card.name, card, currency);
            });
        });
    }

    // Update button states
    const collectionBtn = document.getElementById('add-to-collection-btn');
    const wishlistBtn = document.getElementById('add-to-wishlist-btn');
    const tradeBtn = document.getElementById('add-to-trade-btn');

    if (collectionBtn) {
        if (hasCard(cardName)) {
            const qty = getCardQuantity(cardName);
            collectionBtn.innerHTML = `<i data-lucide="package"></i> ${qty}x na Coleção`;
            collectionBtn.classList.add('in-collection');
            collectionBtn.title = 'Clique para ver os controles de quantidade';
        } else {
            collectionBtn.innerHTML = '<i data-lucide="plus"></i> Adicionar';
            collectionBtn.classList.remove('in-collection');
            collectionBtn.title = 'Adicionar 1 cópia à coleção';
        }
        refreshIcons(collectionBtn);
    }

    if (wishlistBtn) {
        if (wishlist.has(cardName)) {
            wishlistBtn.innerHTML = '<i data-lucide="heart"></i> Na Wishlist';
            wishlistBtn.classList.add('in-wishlist');
        } else {
            wishlistBtn.innerHTML = '<i data-lucide="heart"></i> Wishlist';
            wishlistBtn.classList.remove('in-wishlist');
        }
        refreshIcons(wishlistBtn);
    }

    if (tradeBtn) {
        if (tradeBinder.has(cardName)) {
            tradeBtn.innerHTML = '<i data-lucide="check"></i> Nas Trocas';
            tradeBtn.classList.add('in-trade');
        } else {
            tradeBtn.innerHTML = '<i data-lucide="repeat"></i> Trocas';
            tradeBtn.classList.remove('in-trade');
        }
        refreshIcons(tradeBtn);
    }

    // Price alert button
    const priceAlertBtn = document.getElementById('price-alert-btn');
    if (priceAlertBtn) {
        const existingAlert = priceAlerts.get(cardName);
        if (existingAlert) {
            priceAlertBtn.innerHTML = `<i data-lucide="bell-ring"></i> $${existingAlert.targetPrice.toFixed(0)}`;
            priceAlertBtn.classList.add('has-alert');
        } else {
            priceAlertBtn.innerHTML = '<i data-lucide="bell"></i> Alerta';
            priceAlertBtn.classList.remove('has-alert');
        }
        // Clone to remove old listeners
        const newBtn = priceAlertBtn.cloneNode(true);
        priceAlertBtn.parentNode.replaceChild(newBtn, priceAlertBtn);
        newBtn.addEventListener('click', () => openPriceAlertModal(cardName));
        refreshIcons(newBtn);
    }

    // Render variant selector
    renderVariantSelector(card);

    // Highlight keywords in rules text
    highlightKeywordsInModal(card);

    // === RESET ALL CARD-SPECIFIC STATES ===
    // Hide QR code from previous card
    document.getElementById('qr-code-container')?.classList.add('hidden');

    // Reset currency to USD
    const currencyBtns = document.querySelectorAll('.currency-btn');
    currencyBtns.forEach(btn => {
        if (btn.dataset.currency === 'USD') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    document.getElementById('brl-rate-info')?.style.setProperty('display', 'none');

    // Force scroll reset on ALL scrollable elements in the modal
    const resetModalScroll = () => {
        const modal = document.getElementById('card-modal');
        const content = modal?.querySelector('.modal-content');
        const cardInfo = modal?.querySelector('.card-info');

        // Reset .card-info (this is the main scrollable area!)
        if (cardInfo) {
            cardInfo.scrollTop = 0;
            cardInfo.scrollTo(0, 0);
        }
        // Reset .modal-content
        if (content) {
            content.scrollTop = 0;
            content.scrollTo(0, 0);
        }
        // Reset modal itself
        if (modal) {
            modal.scrollTop = 0;
        }
    };

    // Reset before showing
    resetModalScroll();

    cardModal.classList.remove('hidden');

    // Reset multiple times to ensure it works
    resetModalScroll();
    setTimeout(resetModalScroll, 10);
    setTimeout(resetModalScroll, 50);
    setTimeout(resetModalScroll, 100);

    // Populate mobile card detail (for mobile users)
    populateMobileCardDetail(card);

    // Trap focus after modal is visible
    setTimeout(() => trapFocus(cardModal), 50);
}

// Close Card Modal (legacy - used by onclick handlers)
function closeCardAndDeckModals() {
    cardModal.classList.add('hidden');
    document.getElementById('deck-builder-modal')?.classList.add('hidden');

    // Release focus trap
    releaseFocusTrap();

    // Clear URL hash if it's a card deep link
    if (window.location.hash.startsWith('#card/')) {
        history.pushState(null, '', window.location.pathname);
    }

    // If we came from the add cards modal, reopen it with preserved state
    if (cameFromAddCardsModal) {
        cameFromAddCardsModal = false;
        setTimeout(() => {
            openAddCardsModal(true); // true = preserve state
        }, 100);
    }
}

// Alias for closeModal (used by some onclick handlers)
function closeCardModal() {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    // Clear URL hash if it's a card deep link
    if (window.location.hash.startsWith('#card/')) {
        history.pushState(null, '', window.location.pathname);
    }

    // If we came from the add cards modal, reopen it with preserved state
    if (cameFromAddCardsModal) {
        cameFromAddCardsModal = false;
        // Small delay to allow the modal close animation to complete
        setTimeout(() => {
            openAddCardsModal(true); // true = preserve state
        }, 100);
    }
}
window.closeCardModal = closeCardModal;

// Render Variant Selector in Modal
function renderVariantSelector(card) {
    const variantList = document.getElementById('variant-list');
    const ownedList = document.getElementById('owned-list');
    const variantSelector = document.getElementById('variant-selector');

    if (!variantList || !card.sets) return;

    // Get all variants from all sets
    const allVariants = [];
    card.sets.forEach(set => {
        if (set.variants) {
            set.variants.forEach(v => {
                allVariants.push({
                    ...v,
                    setName: set.name
                });
            });
        }
    });

    // Group by finish
    const variantsByFinish = {
        Standard: allVariants.filter(v => v.finish === 'Standard'),
        Foil: allVariants.filter(v => v.finish === 'Foil'),
        Rainbow: allVariants.filter(v => v.finish === 'Rainbow')
    };

    // Reset tabs to Standard (important: do this BEFORE rendering)
    const tabs = document.querySelectorAll('.variant-tab');
    tabs.forEach(tab => {
        if (tab.dataset.finish === 'Standard') {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Render variant list (default to Standard)
    renderVariantList('Standard', variantsByFinish, card.name);

    // Setup tab handlers
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderVariantList(tab.dataset.finish, variantsByFinish, card.name);
        };
    });

    // Render owned variants
    if (typeof VariantTracker !== 'undefined') {
        const tracker = new VariantTracker();
        const owned = tracker.getCollectionByCard(card.name);
        const escapedCardNameJs = card.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        if (owned && owned.variants && Object.keys(owned.variants).length > 0) {
            ownedList.innerHTML = Object.entries(owned.variants).map(([slug, data]) => {
                const escapedSlug = slug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                const finishStr = typeof data.finish === 'string' ? data.finish : 'Standard';
                const setStr = typeof data.set === 'string' ? data.set : 'Unknown';
                return `
                <div class="owned-variant-item">
                    <span class="variant-finish ${finishStr.toLowerCase()}">${finishStr}</span>
                    <span class="variant-set">${escapeHtml(setStr)}</span>
                    <div class="owned-variant-controls">
                        <button class="qty-btn-sm" onclick="adjustOwnedVariant('${escapedCardNameJs}', '${escapedSlug}', -1)" title="Remover 1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span class="owned-variant-qty">${data.qty || 1}</span>
                        <button class="qty-btn-sm" onclick="adjustOwnedVariant('${escapedCardNameJs}', '${escapedSlug}', 1)" title="Adicionar 1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                </div>
            `}).join('');
            document.getElementById('owned-variants').style.display = 'block';
        } else {
            ownedList.innerHTML = '<span class="empty-text">Nenhuma variante na coleção</span>';
            document.getElementById('owned-variants').style.display = 'block';
        }
    }

    // Show variant selector
    variantSelector.style.display = 'block';

    // Re-init Lucide
    refreshIcons();
}

// Render variant list by finish type
function renderVariantList(finish, variantsByFinish, cardName) {
    const variantList = document.getElementById('variant-list');
    const variants = variantsByFinish[finish] || [];
    const escapedCardName = cardName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    if (variants.length === 0) {
        variantList.innerHTML = '<span class="empty-text">Nenhuma variante disponível</span>';
        return;
    }

    // Sets that are rare - always start at 0
    const rareSets = ['Alpha', 'Promotional'];

    variantList.innerHTML = variants.map((v, index) => {
        const inputId = `qty-${finish}-${index}`;
        const escapedSlug = v.slug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        // Only the FIRST variant starts at 1 (unless it's a rare set)
        // All other variants start at 0 to avoid user accidentally adding multiple
        const defaultQty = (index === 0 && !rareSets.includes(v.setName)) ? 1 : 0;
        return `
            <div class="variant-item" data-slug="${escapeAttr(v.slug)}">
                <div class="variant-info">
                    <span class="variant-set">${escapeHtml(v.setName)}</span>
                    <span class="variant-product">${escapeHtml((v.product || 'Booster').replace(/_/g, ' '))}</span>
                </div>
                <div class="variant-add-controls">
                    <div class="variant-qty-selector">
                        <button class="qty-btn-sm" onclick="adjustVariantQty('${inputId}', -1)">-</button>
                        <input type="number" id="${inputId}" class="variant-qty-input" value="${defaultQty}" min="0" max="99">
                        <button class="qty-btn-sm" onclick="adjustVariantQty('${inputId}', 1)">+</button>
                    </div>
                    <button class="btn-add-variant" onclick="addVariantWithQty('${escapedCardName}', '${escapedSlug}', '${finish}', '${inputId}')" ${defaultQty === 0 ? 'disabled' : ''}>
                        Adicionar
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Re-init Lucide
    refreshIcons();
}

// Adjust quantity in variant selector
function adjustVariantQty(inputId, delta) {
    const input = document.getElementById(inputId);
    if (!input) return;
    let value = parseInt(input.value) || 0;
    value = Math.max(0, Math.min(99, value + delta));
    input.value = value;

    // Enable/disable the add button based on quantity
    const variantItem = input.closest('.variant-item');
    const addBtn = variantItem?.querySelector('.btn-add-variant');
    if (addBtn) {
        addBtn.disabled = value === 0;
    }
}

// Add variant with specified quantity
function addVariantWithQty(cardName, slug, finish, inputId) {
    const input = document.getElementById(inputId);
    const qty = parseInt(input?.value) || 0;

    // Don't add if quantity is 0
    if (qty === 0) {
        showWarningToast('Selecione uma quantidade maior que 0');
        return;
    }

    // Check if user is logged in
    if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
        showNotification('Faça login para adicionar cards à coleção');
        openAuthModal('login');
        return;
    }

    if (typeof VariantTracker !== 'undefined') {
        const tracker = new VariantTracker();
        tracker.addToCollection(cardName, slug, finish, qty);

        // Also add to main collection for compatibility (no toast, we show custom one)
        addToCollection(cardName, qty, false);

        // If we came from add cards modal, close and return to search
        if (cameFromAddCardsModal) {
            const totalQty = getCardQuantity(cardName);
            showSuccessToast(`${qty}x ${finish} adicionado! Total: ${totalQty}x`, '', 3000);
            addCardsModalState = null; // Clear state so search bar is empty
            closeCardAndDeckModals();
        } else {
            // Refresh modal normally
            const card = allCards.find(c => c.name === cardName);
            if (card) renderVariantSelector(card);
            const totalQty = getCardQuantity(cardName);
            showSuccessToast(`${qty}x ${finish} adicionado! Total: ${totalQty}x`);
        }
    }
}

// Add variant to collection
function addVariantToCollection(cardName, slug, finish) {
    // Check if user is logged in
    if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
        showWarningToast('Faça login para adicionar cards à coleção');
        openAuthModal('login');
        return;
    }

    if (typeof VariantTracker !== 'undefined') {
        const tracker = new VariantTracker();
        tracker.addToCollection(cardName, slug, finish, 1);

        // Also add to legacy collection for compatibility (no toast, we show custom one)
        addToCollection(cardName, 1, false);

        // If we came from add cards modal, close and return to search
        if (cameFromAddCardsModal) {
            // Show success toast with longer duration
            showSuccessToast(`${finish} adicionado à coleção!`, '', 3000);
            // Clear the search state so user gets a fresh search
            addCardsModalState = null;
            // Close the card modal (this will trigger reopening add cards modal)
            closeCardAndDeckModals();
        } else {
            // Refresh modal normally
            const card = allCards.find(c => c.name === cardName);
            if (card) renderVariantSelector(card);
            // Show feedback
            showSuccessToast(`${finish} adicionado à coleção!`);
        }
    }
}

// Adjust owned variant quantity (+/-)
function adjustOwnedVariant(cardName, slug, delta) {
    if (typeof VariantTracker !== 'undefined') {
        const tracker = new VariantTracker();
        const owned = tracker.getCollectionByCard(cardName);

        if (!owned || !owned.variants || !owned.variants[slug]) {
            if (delta > 0) {
                // Adding to a variant that doesn't exist - use add function
                tracker.addToCollection(cardName, slug, delta);
            }
            return;
        }

        const currentQty = owned.variants[slug].qty || 1;
        const newQty = currentQty + delta;

        if (newQty <= 0) {
            // Remove the variant entirely
            tracker.removeFromCollection(cardName, slug, currentQty);

            // Check if any variants remain for this card
            const remaining = tracker.getCollectionByCard(cardName);
            if (!remaining || !remaining.variants || Object.keys(remaining.variants).length === 0) {
                collection.delete(cardName);
                saveToStorage();
            }

            showToast('Variante removida da coleção', 'success');
        } else if (delta > 0) {
            // Adding more
            tracker.addToCollection(cardName, slug, delta);
            showToast(`+${delta} adicionado`, 'success');
        } else {
            // Removing some (but not all)
            tracker.removeFromCollection(cardName, slug, Math.abs(delta));
            showToast(`${Math.abs(delta)} removido`, 'success');
        }

        // Refresh modal
        const card = allCards.find(c => c.name === cardName);
        if (card) renderVariantSelector(card);
    }
}

// Remove variant from collection (legacy - still used for backwards compatibility)
function removeVariantFromCollection(cardName, slug) {
    adjustOwnedVariant(cardName, slug, -1);
}

// Highlight keywords in modal
function highlightKeywordsInModal(card) {
    const rulesEl = document.getElementById('modal-card-rules');
    if (!rulesEl || !card.guardian?.rulesText) return;

    if (typeof KeywordParser !== 'undefined') {
        const parser = new KeywordParser();
        const highlighted = parser.highlightKeywords(card.guardian.rulesText, {
            className: 'keyword-highlight',
            tooltip: true
        });
        rulesEl.innerHTML = highlighted;
    }
}

// Toggle Set Progress Section
let setProgressExpanded = false;

function toggleSetProgress() {
    setProgressExpanded = !setProgressExpanded;
    const section = document.getElementById('set-progress-section');
    const content = document.getElementById('set-progress-content');
    const icon = section?.querySelector('.toggle-icon');

    if (section) {
        section.classList.toggle('expanded', setProgressExpanded);
    }
    if (icon) {
        icon.style.transform = setProgressExpanded ? 'rotate(180deg)' : 'rotate(0)';
    }
    if (content && setProgressExpanded) {
        renderSetProgressSection();
    }
}

function renderSetProgressSection() {
    const content = document.getElementById('set-progress-content');
    if (!content) return;

    // Check if SetProgressTracker is available
    if (typeof SetProgressTracker === 'undefined') {
        content.innerHTML = '<p class="text-secondary">Set Progress module not loaded.</p>';
        return;
    }

    const tracker = new SetProgressTracker();
    const sets = ['Alpha', 'Beta', 'Arthurian Legends', 'Gothic', 'Dragonlord'];

    // Convert collection Set to array for the tracker
    const collectionArray = Array.from(collection);

    let html = '<div class="set-progress-grid">';

    sets.forEach(setName => {
        const progress = tracker.calculateSetProgress(allCards, collectionArray, setName);
        const percent = progress.total > 0 ? Math.round((progress.owned / progress.total) * 100) : 0;

        // Determine color based on percentage
        let colorClass = 'default';
        if (percent >= COMPLETION_FULL) colorClass = 'complete';
        else if (percent >= COMPLETION_HIGH) colorClass = 'high';
        else if (percent >= COMPLETION_MEDIUM) colorClass = 'medium';
        else if (percent >= COMPLETION_LOW) colorClass = 'low';

        html += `
            <div class="set-progress-card" data-set="${setName}">
                <div class="set-progress-header">
                    <h4>${setName}</h4>
                    <span class="set-percent ${colorClass}">${percent}%</span>
                </div>
                <div class="set-progress-bar">
                    <div class="set-progress-fill ${colorClass}" style="width: ${percent}%"></div>
                </div>
                <div class="set-progress-stats">
                    <span class="owned-count">${progress.owned}/${progress.total} cards</span>
                </div>
                <div class="set-rarity-breakdown">
                    ${renderRarityBreakdown(progress.byRarity)}
                </div>
                <button class="btn-small btn-outline" onclick="showMissingCards('${setName}')">
                    <i data-lucide="list"></i> Missing (${progress.total - progress.owned})
                </button>
            </div>
        `;
    });

    html += '</div>';

    // Add achievements section
    const achievements = tracker.getAchievements(allCards, collectionArray);
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    if (unlockedCount > 0) {
        html += `
            <div class="achievements-section">
                <h4><i data-lucide="trophy"></i> Achievements (${unlockedCount}/${achievements.length})</h4>
                <div class="achievements-grid">
                    ${achievements.filter(a => a.unlocked).map(a => `
                        <div class="achievement-badge unlocked">
                            <span class="achievement-icon">${a.icon}</span>
                            <span class="achievement-name">${a.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    content.innerHTML = html;

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        refreshIcons();
    }
}

function renderRarityBreakdown(byRarity) {
    if (!byRarity) return '';

    const rarities = ['Ordinary', 'Exceptional', 'Elite', 'Unique'];
    return rarities.map(rarity => {
        const data = byRarity[rarity] || { owned: 0, total: 0 };
        const percent = data.total > 0 ? Math.round((data.owned / data.total) * 100) : 0;
        const rarityClass = rarity.toLowerCase();

        return `
            <div class="rarity-item ${rarityClass}" title="${rarity}">
                <span class="rarity-name">${getRarityIcon(rarity)}</span>
                <div class="rarity-bar">
                    <div class="rarity-fill" style="width: ${percent}%"></div>
                </div>
                <span class="rarity-count">${data.owned}/${data.total}</span>
            </div>
        `;
    }).join('');
}

function showMissingCards(setName) {
    if (typeof SetProgressTracker === 'undefined') return;

    const tracker = new SetProgressTracker();
    const collectionArray = Array.from(collection);
    const missing = tracker.getMissingCards(allCards, collectionArray, setName);

    // Create modal content
    const modal = document.getElementById('card-modal');
    const modalContent = modal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeCardModal()">&times;</button>
        <div class="missing-cards-modal">
            <h2><i data-lucide="list"></i> Missing Cards - ${setName}</h2>
            <p class="text-secondary">${missing.length} cards missing from your collection</p>

            <div class="missing-cards-filters">
                <select id="missing-rarity-filter" onchange="filterMissingCards('${setName}')">
                    <option value="">All Rarities</option>
                    <option value="Ordinary">Ordinary</option>
                    <option value="Exceptional">Exceptional</option>
                    <option value="Elite">Elite</option>
                    <option value="Unique">Unique</option>
                </select>
            </div>

            <div class="missing-cards-list" id="missing-cards-list">
                ${renderMissingCardsList(missing)}
            </div>
        </div>
    `;

    modal.classList.add('active');
    if (typeof lucide !== 'undefined') {
        refreshIcons();
    }
}

function renderMissingCardsList(cards) {
    if (cards.length === 0) {
        return '<p class="text-secondary">No missing cards!</p>';
    }

    return cards.map(card => {
        const rarity = card.guardian?.rarity || 'Unknown';
        const rarityClass = rarity.toLowerCase();
        const escapedName = card.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        return `
            <div class="missing-card-item" onclick="openCardModal('${escapedName}')">
                <span class="missing-card-name">${escapeHtml(card.name)}</span>
                <span class="rarity-badge ${rarityClass}">${getRarityIcon(rarity)} ${rarity}</span>
            </div>
        `;
    }).join('');
}

function filterMissingCards(setName) {
    const rarity = document.getElementById('missing-rarity-filter')?.value;

    if (typeof SetProgressTracker === 'undefined') return;

    const tracker = new SetProgressTracker();
    const collectionArray = Array.from(collection);
    let missing = tracker.getMissingCards(allCards, collectionArray, setName);

    if (rarity) {
        missing = missing.filter(c => c.guardian?.rarity === rarity);
    }

    const list = document.getElementById('missing-cards-list');
    if (list) {
        list.innerHTML = renderMissingCardsList(missing);
    }
}

// Toggle Collection (simple toggle for quick add/remove from cards view)
function toggleCollection(cardName) {
    // If card is already in collection, scroll to the variant controls instead of removing
    if (hasCard(cardName)) {
        // Scroll to the "Na sua coleção" section so user can edit there
        const ownedSection = document.getElementById('owned-variants');
        if (ownedSection) {
            ownedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Flash the section to draw attention
            ownedSection.classList.add('highlight-flash');
            setTimeout(() => ownedSection.classList.remove('highlight-flash'), 1500);
        }
        showToast('Use os controles acima para ajustar a quantidade', 'info');
        return;
    }

    // Check login for adding
    if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
        showNotification('Faça login para adicionar cards à coleção');
        openAuthModal('login');
        return;
    }

    // Add 1 copy of the first available variant
    const card = allCards.find(c => c.name === cardName);
    if (card && typeof VariantTracker !== 'undefined') {
        // Find first available variant
        const firstSet = card.sets?.[0];
        const firstVariant = firstSet?.variants?.[0];
        if (firstVariant?.slug) {
            const tracker = new VariantTracker();
            tracker.addToCollection(cardName, firstVariant.slug, 1);
            addToCollection(cardName, 1, false);
        } else {
            addToCollection(cardName, 1, false);
        }
    } else {
        addToCollection(cardName, 1, false);
    }

    renderCards();

    // If we came from add cards modal, close and return
    if (cameFromAddCardsModal) {
        showSuccessToast(`${cardName} adicionado à coleção!`, '', 3000);
        addCardsModalState = null;
        closeCardAndDeckModals();
    } else {
        openCardModal(cardName); // Refresh modal normally
    }
}

// Toggle Wishlist
function toggleWishlist(cardName) {
    // Check login for adding (not for removing)
    if (!wishlist.has(cardName)) {
        if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
            showNotification('Faça login para adicionar cards à wishlist');
            openAuthModal('login');
            return;
        }
    }

    const wasInWishlist = wishlist.has(cardName);
    if (wasInWishlist) {
        wishlist.delete(cardName);
        showToast(`${cardName} removido da wishlist`, 'info');
    } else {
        wishlist.add(cardName);
        showSuccessToast(`${cardName} adicionado à wishlist`);
    }
    saveToStorage();
    renderCards();
    openCardModal(cardName); // Refresh modal
}

// Handle Precon Change
function handlePreconChange(event) {
    const checkbox = event.target;
    const preconId = checkbox.id.replace('precon-', '');

    if (checkbox.checked) {
        ownedPrecons.add(preconId);
        // Add precon cards to collection with their quantities (no individual feedback)
        const precon = PRECONS[preconId];
        if (precon) {
            precon.cards.forEach(card => {
                addToCollection(card.name, card.qty || 1, false);
            });
            showSuccessToast(`${precon.name} adicionado à coleção!`, `${precon.cards.length} cards`);
        }
    } else {
        ownedPrecons.delete(preconId);
        // Note: We don't remove cards from collection when unchecking
        // as user might have those cards from other sources
    }

    saveToStorage();
    updateStats();
}

// ============================================
// PRECON MODAL FUNCTIONS
// ============================================

// Open precon selection modal
function openPreconModal() {
    const modal = document.getElementById('precon-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    renderPreconGrid();
    refreshIcons();
}

// Close precon modal
function closePreconModal() {
    const modal = document.getElementById('precon-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Show precon details (all cards in the precon)
function showPreconDetails(preconId) {
    const precon = PRECONS[preconId];
    if (!precon) return;

    const modal = document.getElementById('precon-details-modal');
    if (!modal) return;

    const isOwned = ownedPrecons.has(preconId);
    const totalCards = precon.cards.reduce((sum, c) => sum + (c.qty || 1), 0);
    const setName = preconId.startsWith('gothic-') ? 'Gothic' : 'Beta';

    // Find avatar card for header image
    const avatarCard = allCards.find(c => c.name === precon.avatar);
    const avatarSlug = avatarCard ? getCardImageSlug(avatarCard) : null;
    const avatarUrl = avatarSlug ? `${IMAGE_CDN}${avatarSlug}.png` : 'placeholder.png';

    // Build card list grouped by type
    const cardsByType = {};
    precon.cards.forEach(card => {
        const cardData = allCards.find(c => c.name === card.name);
        const type = cardData?.type || 'Outro';
        if (!cardsByType[type]) {
            cardsByType[type] = [];
        }
        cardsByType[type].push({ ...card, cardData });
    });

    // Order types
    const typeOrder = ['Avatar', 'Aura', 'Artifact', 'Minion', 'Magic', 'Site'];
    const sortedTypes = Object.keys(cardsByType).sort((a, b) => {
        const aIndex = typeOrder.indexOf(a);
        const bIndex = typeOrder.indexOf(b);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    // Generate HTML for cards
    const cardsHtml = sortedTypes.map(type => {
        const typeCards = cardsByType[type];
        const typeTotal = typeCards.reduce((sum, c) => sum + (c.qty || 1), 0);

        const cardsListHtml = typeCards.map(card => {
            const cardData = card.cardData;
            const imageSlug = cardData ? getCardImageSlug(cardData) : null;
            const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : 'placeholder.png';

            return `
                <div class="precon-detail-card" onclick="event.stopPropagation(); ${cardData ? `openCardModal(allCards.find(c => c.name === '${card.name.replace(/'/g, "\\'")}'))` : ''}">
                    <img src="${imageUrl}" alt="${card.name}" class="precon-detail-card-img" onerror="this.src='placeholder.png'">
                    <div class="precon-detail-card-info">
                        <span class="precon-detail-card-qty">${card.qty}x</span>
                        <span class="precon-detail-card-name">${card.name}</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="precon-detail-type">
                <h4 class="precon-detail-type-header">${type} (${typeTotal})</h4>
                <div class="precon-detail-cards-grid">
                    ${cardsListHtml}
                </div>
            </div>
        `;
    }).join('');

    // Action button
    const actionButton = isOwned
        ? `<button class="btn btn-danger" onclick="removePreconFromCollection('${preconId}'); closePreconDetailsModal();">
               <i data-lucide="trash-2"></i> Remover da Coleção
           </button>`
        : `<button class="btn btn-primary" onclick="addPreconToCollection('${preconId}'); closePreconDetailsModal();">
               <i data-lucide="plus"></i> Adicionar à Coleção
           </button>`;

    // Set modal content
    modal.innerHTML = `
        <div class="modal-content precon-details-content">
            <button class="close-modal" onclick="closePreconDetailsModal()">×</button>
            <div class="precon-details-header">
                <img src="${avatarUrl}" alt="${precon.avatar}" class="precon-details-avatar" onerror="this.src='placeholder.png'">
                <div class="precon-details-info">
                    <h2>${precon.name}</h2>
                    <p class="precon-details-meta">
                        <span class="precon-details-set">${setName}</span>
                        <span class="precon-details-count">${totalCards} cartas</span>
                        ${isOwned ? '<span class="precon-details-owned">✓ Na coleção</span>' : ''}
                    </p>
                    <div class="precon-details-actions">
                        ${actionButton}
                    </div>
                </div>
            </div>
            <div class="precon-details-cards">
                ${cardsHtml}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    refreshIcons();
}

// Close precon details modal
function closePreconDetailsModal() {
    const modal = document.getElementById('precon-details-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Render the precon grid
function renderPreconGrid() {
    const grid = document.getElementById('precon-grid');
    if (!grid) return;

    const preconIds = Object.keys(PRECONS);

    grid.innerHTML = preconIds.map(preconId => {
        const precon = PRECONS[preconId];
        const isOwned = ownedPrecons.has(preconId);

        // Find the avatar card to get its image
        const avatarCard = allCards.find(c => c.name === precon.avatar);
        const imageSlug = avatarCard ? getCardImageSlug(avatarCard) : null;
        const imageUrl = imageSlug ? `${IMAGE_CDN}${imageSlug}.png` : 'placeholder.png';

        // Calculate total cards (sum of quantities)
        const totalCards = precon.cards.reduce((sum, c) => sum + (c.qty || 1), 0);

        // Extract set name from precon ID (beta-fire -> Beta, gothic-necromancer -> Gothic)
        const setName = preconId.startsWith('gothic-') ? 'Gothic' : 'Beta';

        // Show different button based on ownership
        const actionButton = isOwned
            ? `<button class="precon-action-btn remove" onclick="event.stopPropagation(); removePreconFromCollection('${preconId}')">
                   <i data-lucide="trash-2"></i> Remover
               </button>`
            : `<button class="precon-action-btn add" onclick="event.stopPropagation(); addPreconToCollection('${preconId}')">
                   <i data-lucide="plus"></i> Adicionar
               </button>`;

        return `
            <div class="precon-card ${isOwned ? 'owned' : ''}" onclick="showPreconDetails('${preconId}')">
                <img src="${imageUrl}" alt="${precon.avatar}" class="precon-avatar" onerror="this.src='placeholder.png'">
                <div class="precon-name">${precon.name.replace(` [${setName}]`, '')}</div>
                <div class="precon-set">${setName}</div>
                <div class="precon-card-count"><strong>${totalCards}</strong> cartas</div>
                ${actionButton}
            </div>
        `;
    }).join('');

    refreshIcons();
}

// Helper function to convert card name to slug format
function cardNameToSlug(cardName) {
    return cardName
        .toLowerCase()
        .trim()
        .replace(/[''`]/g, '')        // Remove apostrophes
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '_');        // Spaces to underscores
}

// Add all cards from a precon to collection
function addPreconToCollection(preconId) {
    const precon = PRECONS[preconId];
    if (!precon) return;

    // Determine set code from preconId (beta-fire -> bet, gothic-necromancer -> gth)
    const setCode = preconId.startsWith('beta-') ? 'bet' : 'gth';
    const setName = preconId.startsWith('beta-') ? 'Beta' : 'Gothic';

    // Get variantTracker instance
    const tracker = window.variantTracker;

    // Add each card with precon tracking
    precon.cards.forEach(card => {
        const existing = collection.get(card.name);
        const currentQty = existing?.qty || 0;
        const existingPrecons = existing?.precons || [];
        const addedAt = existing?.addedAt || new Date().toISOString();
        const cardQty = card.qty || 1;

        // Add to basic collection
        collection.set(card.name, {
            qty: currentQty + cardQty,
            addedAt: addedAt,
            precons: existingPrecons.includes(preconId)
                ? existingPrecons
                : [...existingPrecons, preconId]
        });

        // Add to VariantTracker with Beta/Gothic Standard pricing
        // Slug format: {set_code}-{card_slug}-p-s (p=precon, s=standard)
        if (tracker) {
            try {
                const cardSlug = cardNameToSlug(card.name);
                const variantSlug = `${setCode}-${cardSlug}-p-s`;
                tracker.addToCollection(card.name, variantSlug, 'Standard', cardQty);
            } catch (err) {
                console.warn(`[Precon] Could not add variant for ${card.name}:`, err.message);
            }
        }
    });

    // Mark precon as owned
    ownedPrecons.add(preconId);

    // Calculate total cards added
    const totalCards = precon.cards.reduce((sum, c) => sum + (c.qty || 1), 0);

    // Also add precon as a deck if not already exists
    const deckName = precon.name;
    const deckExists = decks.some(d => d.name === deckName);

    if (!deckExists) {
        // Convert precon cards to deck format (spellbook + atlas)
        const spellbook = [];
        const atlas = [];

        precon.cards.forEach(card => {
            // Look up card type from allCards
            const cardData = allCards.find(c => c.name.toLowerCase() === card.name.toLowerCase());
            const cardType = cardData?.guardian?.type?.toLowerCase() || 'unknown';
            const qty = card.qty || 1;

            // Sites go to atlas, everything else to spellbook
            if (cardType === 'site') {
                atlas.push({ name: card.name, qty });
            } else {
                spellbook.push({ name: card.name, qty });
            }
        });

        const newDeck = {
            id: `precon-${preconId}-${Date.now()}`,
            name: deckName,
            avatar: precon.avatar,
            spellbook: spellbook,
            atlas: atlas,
            createdAt: new Date().toISOString(),
            isPrecon: true
        };

        decks.push(newDeck);
    }

    // Save and update UI
    saveToStorage();
    saveUserDecks(); // Save decks separately
    showSuccessToast(`${precon.name} adicionado!`, `${totalCards} cartas`);
    renderPreconGrid(); // Refresh grid to show updated state
    renderCollection();
    renderUserDecks(); // Refresh decks tab
    updateStats();
}

// Remove all cards from a precon from collection
function removePreconFromCollection(preconId) {
    const precon = PRECONS[preconId];
    if (!precon) return;

    // Determine set code from preconId
    const setCode = preconId.startsWith('beta-') ? 'bet' : 'gth';

    // Get variantTracker instance
    const tracker = window.variantTracker;

    // Remove each card's quantity from collection
    precon.cards.forEach(card => {
        const existing = collection.get(card.name);
        if (!existing) return;

        const currentQty = existing.qty || 0;
        const cardPreconQty = card.qty || 1;
        const newQty = currentQty - cardPreconQty;

        // Remove precon from card's precons array
        const existingPrecons = existing.precons || [];
        const updatedPrecons = existingPrecons.filter(p => p !== preconId);

        if (newQty <= 0) {
            // Remove card entirely if qty is 0 or less
            collection.delete(card.name);
        } else {
            // Update with reduced quantity
            collection.set(card.name, {
                qty: newQty,
                addedAt: existing.addedAt,
                precons: updatedPrecons
            });
        }

        // Also remove from VariantTracker
        if (tracker) {
            try {
                const cardSlug = cardNameToSlug(card.name);
                const variantSlug = `${setCode}-${cardSlug}-p-s`;
                tracker.removeFromCollection(card.name, variantSlug, cardPreconQty);
            } catch (err) {
                // Variant may not exist, ignore
            }
        }
    });

    // Remove precon from owned set
    ownedPrecons.delete(preconId);

    // Also remove the precon deck if it exists
    const deckName = precon.name;
    const deckIndex = decks.findIndex(d => d.name === deckName);
    if (deckIndex >= 0) {
        decks.splice(deckIndex, 1);
    }

    // Calculate total cards removed
    const totalCards = precon.cards.reduce((sum, c) => sum + (c.qty || 1), 0);

    // Save and update UI
    saveToStorage();
    saveUserDecks(); // Save decks separately
    showSuccessToast(`${precon.name} removido!`, `${totalCards} cartas`);
    renderPreconGrid(); // Refresh grid to show updated state
    renderCollection();
    renderUserDecks(); // Refresh decks tab
    updateStats();
}

// Check if user is logged in - Use the same method as the header
function checkUserLoggedIn() {
    if (typeof nocoDBService !== 'undefined') {
        return nocoDBService.isLoggedIn();
    }
    return false;
}

// Render Collection
function renderCollection() {
    const loginPrompt = document.getElementById('collection-login-prompt');
    const collectionContent = document.getElementById('collection-content');
    // Get grid element fresh each time (in case DOM wasn't ready when script loaded)
    const gridEl = document.getElementById('collection-grid');

    if (!gridEl) {
        console.error('[renderCollection] CRITICAL: collection-grid element not found!');
        return;
    }

    // Check if user is logged in
    const isLoggedIn = checkUserLoggedIn();

    if (!isLoggedIn) {
        // Show login prompt, hide collection content
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (collectionContent) collectionContent.classList.add('hidden');

        // Initialize Lucide icons for the prompt
        if (typeof lucide !== 'undefined') {
            refreshIcons();
        }
        return;
    }

    // User is logged in - show collection content
    if (loginPrompt) loginPrompt.classList.add('hidden');
    if (collectionContent) collectionContent.classList.remove('hidden');

    // Save filter state
    saveFilterState();

    // Load user decks for the decks tab
    loadUserDecks();

    // Get all filter values
    const search = document.getElementById('collection-search')?.value.toLowerCase() || '';
    const setFilter = document.getElementById('collection-set-filter')?.value || '';
    const typeFilter = document.getElementById('collection-type-filter')?.value || '';
    const elementFilter = document.getElementById('collection-element-filter')?.value || '';
    const rarityFilter = document.getElementById('collection-rarity-filter')?.value || '';
    const preconFilter = document.getElementById('collection-precon-filter')?.value || '';
    const sortOption = document.getElementById('collection-sort')?.value || 'name-asc';

    // Get variant tracker if available
    const variantTracker = window.variantTracker || (typeof VariantTracker !== 'undefined' ? new VariantTracker() : null);

    // Debug: Log collection state
    console.log('[renderCollection] allCards count:', allCards.length);
    console.log('[renderCollection] collection size:', collection.size);
    console.log('[renderCollection] gridEl exists:', !!gridEl);
    if (collection.size > 0) {
        const firstKey = collection.keys().next().value;
        console.log('[renderCollection] First collection key:', JSON.stringify(firstKey));
        console.log('[renderCollection] First allCards name:', JSON.stringify(allCards[0]?.name));
        // Test if keys match
        const testCard = allCards[0];
        if (testCard) {
            console.log('[renderCollection] hasCard test for first allCard:', hasCard(testCard.name));
        }
    }

    // Filter cards
    let collectionCards = allCards.filter(card => {
        if (!hasCard(card.name)) return false;
        if (search && !card.name.toLowerCase().includes(search)) return false;

        // Filter by set
        if (setFilter) {
            const hasSet = card.sets?.some(s => s.name === setFilter);
            if (!hasSet) return false;
        }

        // Filter by type
        if (typeFilter && card.guardian?.type !== typeFilter) {
            return false;
        }

        // Filter by element
        if (elementFilter && !(card.elements || '').includes(elementFilter)) {
            return false;
        }

        // Filter by rarity
        if (rarityFilter && card.guardian?.rarity !== rarityFilter) {
            return false;
        }

        // Filter by precon
        if (preconFilter) {
            const cardData = collection.get(card.name);
            if (!cardData?.precons?.includes(preconFilter)) {
                return false;
            }
        }

        return true;
    });

    console.log('[renderCollection] collectionCards after filter:', collectionCards.length);
    if (collectionCards.length === 0 && collection.size > 0) {
        // Debug: Check why no cards matched
        console.log('[renderCollection] No cards matched! Checking first 3 collection keys:');
        let i = 0;
        for (const key of collection.keys()) {
            if (i >= 3) break;
            console.log(`  Key ${i}: "${key}"`);
            i++;
        }
    }

    // Rarity order for sorting
    const rarityOrder = { 'Unique': 4, 'Elite': 3, 'Exceptional': 2, 'Ordinary': 1 };

    // Sort cards
    collectionCards.sort((a, b) => {
        switch (sortOption) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'date-desc': {
                const dataA = getCardData(a.name);
                const dataB = getCardData(b.name);
                const dateA = dataA?.addedAt || '1970-01-01';
                const dateB = dataB?.addedAt || '1970-01-01';
                return dateB.localeCompare(dateA);
            }
            case 'date-asc': {
                const dataA = getCardData(a.name);
                const dataB = getCardData(b.name);
                const dateA = dataA?.addedAt || '1970-01-01';
                const dateB = dataB?.addedAt || '1970-01-01';
                return dateA.localeCompare(dateB);
            }
            case 'value-desc':
                return getCardTotalValue(b.name) - getCardTotalValue(a.name);
            case 'value-asc':
                return getCardTotalValue(a.name) - getCardTotalValue(b.name);
            case 'qty-desc':
                return getCardQuantity(b.name) - getCardQuantity(a.name);
            case 'qty-asc':
                return getCardQuantity(a.name) - getCardQuantity(b.name);
            case 'rarity-desc': {
                const rarA = rarityOrder[a.guardian?.rarity] || 0;
                const rarB = rarityOrder[b.guardian?.rarity] || 0;
                return rarB - rarA;
            }
            default:
                return a.name.localeCompare(b.name);
        }
    });

    // Update count display (unique and total)
    const uniqueCount = getUniqueCardCount();
    const totalCount = getTotalCardCount();
    const filteredCount = collectionCards.length;
    const hasFilters = setFilter || typeFilter || elementFilter || rarityFilter || search;

    const countEl = document.getElementById('collection-count');
    const totalCountEl = document.getElementById('collection-total-count');

    if (countEl) {
        countEl.textContent = hasFilters ? `${filteredCount} / ${uniqueCount}` : uniqueCount;
    }
    if (totalCountEl) {
        totalCountEl.textContent = totalCount;
    }

    // Calculate and display collection summary stats
    updateCollectionSummary(collectionCards);

    if (collectionCards.length === 0) {
        if (hasFilters) {
            gridEl.innerHTML = createEmptyState({
                icon: 'filter-x',
                title: 'Nenhuma carta encontrada',
                description: 'Nenhuma carta corresponde aos filtros selecionados.',
                actions: [
                    { label: 'Limpar filtros', onclick: 'clearCollectionFilters()', icon: 'x' }
                ]
            });
        } else {
            gridEl.innerHTML = createEmptyState({
                icon: 'sparkles',
                title: 'Comece sua coleção!',
                description: 'Adicione suas primeiras cartas e acompanhe o progresso da sua coleção de Sorcery.',
                actions: [
                    { label: 'Adicionar Cartas', onclick: 'openAddCardsModal()', icon: 'plus', primary: true },
                    { label: 'Adicionar Precon', onclick: 'openPreconModal()', icon: 'package' }
                ]
            });
        }
        refreshIcons(gridEl);
        return;
    }

    // Render cards with quantity badges
    console.log('[renderCollection] Rendering', collectionCards.length, 'cards to grid');
    try {
        gridEl.innerHTML = collectionCards.map(card => {
            let html = createCardHTML(card);
            const cardQty = getCardQuantity(card.name);
            const cardValue = getCardTotalValue(card.name);

        // Add quantity badge if more than 1
        if (cardQty > 1) {
            html = html.replace(
                /(<div class="card-item"[^>]*>)/,
                `$1<span class="collection-card-qty">${cardQty}x</span>`
            );
        }

        // Add value badge if sorting by value and card has value
        if ((sortOption === 'value-desc' || sortOption === 'value-asc') && cardValue > 0) {
            html = html.replace(
                /(<div class="card-item"[^>]*>)/,
                `$1<span class="collection-card-value">$${cardValue.toFixed(2)}</span>`
            );
        }

            return html;
        }).join('');
        console.log('[renderCollection] Grid innerHTML set, length:', gridEl.innerHTML.length);
    } catch (err) {
        console.error('[renderCollection] Error rendering cards:', err);
    }

    gridEl.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', () => {
            const cardName = el.dataset.cardName;
            console.log('[Collection Click] Card name from dataset:', cardName);
            openCardModal(cardName);
        });
    });
}

// Update collection summary stats
function updateCollectionSummary(filteredCards) {
    const totalValueEl = document.getElementById('collection-total-value');
    const avgValueEl = document.getElementById('collection-avg-value');
    const topCardEl = document.getElementById('collection-top-card');

    if (!totalValueEl || !avgValueEl || !topCardEl) return;

    // Calculate total value of filtered cards
    let totalValue = 0;
    let topCard = null;
    let topCardValue = 0;

    filteredCards.forEach(card => {
        const cardValue = getCardTotalValue(card.name);
        totalValue += cardValue;

        if (cardValue > topCardValue) {
            topCardValue = cardValue;
            topCard = card;
        }
    });

    // Calculate average value
    const avgValue = filteredCards.length > 0 ? totalValue / filteredCards.length : 0;

    // Update display
    totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    avgValueEl.textContent = `$${avgValue.toFixed(2)}`;

    if (topCard && topCardValue > 0) {
        topCardEl.textContent = `${topCard.name} ($${topCardValue.toFixed(2)})`;
        topCardEl.classList.add('text-small');
    } else {
        topCardEl.textContent = '-';
        topCardEl.classList.remove('text-small');
    }
}

// Render Wishlist
function renderWishlist() {
    const loginPrompt = document.getElementById('wishlist-login-prompt');
    const wishlistContent = document.getElementById('wishlist-content');
    const isLoggedIn = checkUserLoggedIn();

    if (!isLoggedIn) {
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (wishlistContent) wishlistContent.classList.add('hidden');
        refreshIcons();
        return;
    }

    if (loginPrompt) loginPrompt.classList.add('hidden');
    if (wishlistContent) wishlistContent.classList.remove('hidden');

    const wishlistCards = allCards.filter(card => wishlist.has(card.name));

    document.getElementById('wishlist-count').textContent = `${wishlist.size} cartas`;

    if (wishlistCards.length === 0) {
        wishlistGridEl.innerHTML = createEmptyState({
            icon: 'heart',
            title: 'Sua Wishlist está vazia',
            description: 'Explore o catálogo e adicione as cartas que você mais deseja! Clique no ícone de coração em qualquer carta para adicioná-la aqui.',
            actions: [
                { label: 'Explorar Catálogo', onclick: "showView('cards')", primary: true, icon: 'search' }
            ]
        });
        refreshIcons();
        return;
    }

    wishlistGridEl.innerHTML = wishlistCards.map(card => createCardHTML(card)).join('');

    wishlistGridEl.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', () => {
            const cardName = el.dataset.cardName;
            openCardModal(cardName);
        });
    });

    // Render price alerts section
    renderPriceAlerts();
    refreshIcons();
}

// ============================================
// STATS UPDATE FUNCTIONS
// ============================================
// updateStats() - Atualiza contadores básicos (rápido, sem preços)
// updateStatsWithPrices() - Atualiza página de estatísticas completa (com preços)
//
// PERFORMANCE: updateStats tem debounce de 100ms para evitar múltiplas chamadas

// Track last update time for debounce
let _lastStatsUpdate = 0;
let _statsUpdateTimeout = null;

// Stats mode: 'illustrations' (unique arts) or 'variants' (all printings)
let _statsMode = 'illustrations';

/**
 * Calculate total variants in the game (all sets × finishes combinations)
 */
function getTotalVariantsInGame() {
    if (!allCards || allCards.length === 0) return 0;
    return allCards.reduce((total, card) => {
        const setsCount = card.sets?.length || 1;
        const finishesCount = card.finishes?.length || 1;
        return total + (setsCount * finishesCount);
    }, 0);
}

/**
 * Calculate owned variants count
 * Cards with VariantTracker data: count actual variants
 * Cards without: count as 1 variant (default Standard)
 */
// Mapeamento de códigos de set para código canônico
// got e gth são ambos Gothic, mas usam códigos diferentes em Booster vs Precon
const SET_CODE_NORMALIZATION = {
    'got': 'gth',  // Gothic Booster → Gothic (canonical)
    'gth': 'gth',  // Gothic Precon → Gothic
    'bet': 'bet',  // Beta
    'alp': 'alp',  // Alpha
    'art': 'art',  // Arthurian Legends
};

function normalizeSetCode(setCode) {
    const normalized = setCode.trim().toLowerCase();
    return SET_CODE_NORMALIZATION[normalized] || normalized;
}

function getOwnedVariantsCount() {
    const tracker = window.variantTracker;
    let totalVariants = 0;

    // Para cada card na coleção
    collection.forEach((data, cardName) => {
        let variantCount = 1; // Default: 1 variante (Standard)

        if (tracker && tracker.collection) {
            // Tentar encontrar no VariantTracker
            const normalizedName = cardName.toLowerCase().trim().replace(/\s+/g, '_');
            const cardVariants = tracker.collection[normalizedName];

            if (cardVariants && Object.keys(cardVariants).length > 0) {
                // Contar variantes únicas por SET + FINISH (ignorar produto)
                // Formato do slug: {set}-{card_name}-{product}-{finish}
                // Ex: bet-lone_tower-b-s = Beta, Lone Tower, Booster, Standard
                // Ex: bet-lone_tower-p-s = Beta, Lone Tower, Precon, Standard
                // Ambos devem contar como 1 variante (Beta Standard)
                // IMPORTANTE: got e gth são ambos Gothic, precisam ser normalizados

                const uniqueSetFinish = new Set();
                Object.keys(cardVariants).forEach(slug => {
                    const parts = slug.trim().split('-');
                    if (parts.length >= 2) {
                        const set = normalizeSetCode(parts[0]); // normalizar código do set
                        const finish = parts[parts.length - 1].trim().toLowerCase();
                        uniqueSetFinish.add(`${set}-${finish}`);
                    }
                });

                variantCount = uniqueSetFinish.size || 1;
            }
        }

        totalVariants += variantCount;
    });

    return totalVariants;
}

/**
 * Debug function - run in console: debugVariantCount()
 */
function debugVariantCount() {
    const tracker = window.variantTracker;
    const stats = {
        collectionSize: collection.size,
        cardsWithVariantData: 0,
        cardsWithoutVariantData: 0,
        cardsWithMultipleVariants: [],
        cardsWithMultipleFinishes: [], // Cards com genuínos múltiplos finishes
        totalRawSlugs: 0,
        totalUniqueSetFinish: 0,
        variantTrackerEntries: tracker?.collection ? Object.keys(tracker.collection).length : 0,
        finishDistribution: {} // Quantos cards têm 1, 2, 3... finishes
    };

    collection.forEach((data, cardName) => {
        const normalizedName = cardName.toLowerCase().trim().replace(/\s+/g, '_');
        const cardVariants = tracker?.collection?.[normalizedName];

        if (cardVariants && Object.keys(cardVariants).length > 0) {
            stats.cardsWithVariantData++;
            const slugs = Object.keys(cardVariants);
            stats.totalRawSlugs += slugs.length;

            // Contar variantes únicas por SET + FINISH (normalizado)
            // IMPORTANTE: usa normalizeSetCode() para tratar got/gth como mesmo set
            const uniqueSetFinish = new Set();
            slugs.forEach(slug => {
                const parts = slug.trim().split('-');
                if (parts.length >= 2) {
                    const set = normalizeSetCode(parts[0]); // usar normalização!
                    const finish = parts[parts.length - 1].trim().toLowerCase();
                    uniqueSetFinish.add(`${set}-${finish}`);
                }
            });

            const finishCount = uniqueSetFinish.size || 1;
            stats.totalUniqueSetFinish += finishCount;

            // Track distribution
            stats.finishDistribution[finishCount] = (stats.finishDistribution[finishCount] || 0) + 1;

            // Cards com múltiplos slugs (Booster + Precon)
            if (slugs.length > 1) {
                stats.cardsWithMultipleVariants.push({
                    name: cardName,
                    rawSlugs: slugs.length,
                    uniqueSetFinish: finishCount,
                    slugs: slugs,
                    setFinishes: Array.from(uniqueSetFinish)
                });
            }

            // Cards com múltiplos finishes REAIS (Standard + Foil, etc)
            if (finishCount > 1) {
                stats.cardsWithMultipleFinishes.push({
                    name: cardName,
                    finishCount: finishCount,
                    setFinishes: Array.from(uniqueSetFinish),
                    slugs: slugs
                });
            }
        } else {
            stats.cardsWithoutVariantData++;
            stats.totalRawSlugs += 1;
            stats.totalUniqueSetFinish += 1;
            stats.finishDistribution[1] = (stats.finishDistribution[1] || 0) + 1;
        }
    });

    console.log('=== DEBUG VARIANT COUNT ===');
    console.log('Collection size:', stats.collectionSize);
    console.log('Cards with variant data:', stats.cardsWithVariantData);
    console.log('Cards without variant data:', stats.cardsWithoutVariantData);
    console.log('');
    console.log('CONTAGEM DE VARIANTES:');
    console.log('  Slugs brutos (com produto):', stats.totalRawSlugs);
    console.log('  Set+Finish únicos:', stats.totalUniqueSetFinish);
    console.log('  Esperado (se todos 1 finish):', stats.collectionSize);
    console.log('  Diferença:', stats.totalUniqueSetFinish - stats.collectionSize);
    console.log('');
    console.log('DISTRIBUIÇÃO DE FINISHES:');
    Object.entries(stats.finishDistribution).sort((a,b) => a[0]-b[0]).forEach(([count, cards]) => {
        console.log(`  ${count} finish(es): ${cards} cards`);
    });
    console.log('');
    console.log('Cards with multiple slugs (Booster+Precon):', stats.cardsWithMultipleVariants.length);
    console.log('Cards with multiple FINISHES (Standard+Foil):', stats.cardsWithMultipleFinishes.length);

    if (stats.cardsWithMultipleFinishes.length > 0) {
        console.log('');
        console.log('CARDS COM MÚLTIPLOS FINISHES:');
        stats.cardsWithMultipleFinishes.slice(0, 10).forEach(c => {
            console.log(`  ${c.name}: ${c.setFinishes.join(', ')}`);
        });
    }

    return stats;
}

/**
 * Set stats display mode and refresh
 */
function setStatsMode(mode) {
    _statsMode = mode;

    // Update toggle buttons
    document.querySelectorAll('.stats-mode-toggle .mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update hint text
    const hint = document.getElementById('stats-mode-hint');
    if (hint) {
        hint.textContent = mode === 'illustrations'
            ? 'Cards únicos por arte'
            : 'Todas as impressões (set × finish)';
    }

    // Refresh stats
    _updateStatsCore();
    updateStatsEnhanced();
}

// Core stats update (internal)
function _updateStatsCore() {
    const preconsOwned = ownedPrecons.size;

    // Modo Ilustrações: conta cards únicos (artes diferentes)
    // Modo Variantes: conta todas as impressões (set × finish)
    const isVariantsMode = _statsMode === 'variants';

    let displayCount, displayTotal, completion;

    if (isVariantsMode) {
        // Modo Variantes
        displayCount = getOwnedVariantsCount();
        displayTotal = getTotalVariantsInGame();
        completion = displayTotal > 0 ? ((displayCount / displayTotal) * 100).toFixed(1) : 0;
    } else {
        // Modo Ilustrações (padrão)
        displayCount = collection.size;
        displayTotal = allCards.length;
        completion = displayTotal > 0 ? ((displayCount / displayTotal) * 100).toFixed(1) : 0;
    }

    // Calcular total com cópias para info adicional
    let totalWithCopies = 0;
    collection.forEach((data) => {
        totalWithCopies += data.qty || 1;
    });

    document.getElementById('stat-total').textContent = displayCount;
    document.getElementById('stat-completion').textContent = `${completion}%`;
    document.getElementById('stat-precons').textContent = `${preconsOwned}/8`;
    document.getElementById('stat-wishlist').textContent = wishlist.size;

    // Atualizar label baseado no modo
    const statTotalCard = document.querySelector('#stat-total')?.closest('.stat-card');
    if (statTotalCard) {
        const h3 = statTotalCard.querySelector('h3');
        const label = statTotalCard.querySelector('.stat-label');
        if (h3) h3.textContent = isVariantsMode ? 'Variantes' : 'Ilustrações';
        if (label) label.textContent = `de ${displayTotal.toLocaleString()}`;
    }

    // Mostrar total com cópias
    const copiesEl = document.getElementById('stat-total-copies');
    if (copiesEl) {
        if (!isVariantsMode && totalWithCopies > collection.size) {
            copiesEl.textContent = `(${totalWithCopies} cópias totais)`;
        } else {
            copiesEl.textContent = '';
        }
    }

    // Set distribution
    const sets = ['Alpha', 'Beta', 'Arthurian Legends', 'Gothic', 'Dragonlord', 'Promotional'];
    const setProgressEl = document.getElementById('set-progress');

    if (setProgressEl) {
        const setDistribution = {};
        sets.forEach(s => setDistribution[s] = 0);

        const tracker = window.variantTracker;
        let totalCount = 0;

        if (isVariantsMode && tracker && tracker.collection) {
            // Modo Variantes: contar cada variante no seu set
            for (const cardName in tracker.collection) {
                const variants = tracker.collection[cardName];
                for (const slug in variants) {
                    const variant = variants[slug];
                    if (variant.set && setDistribution.hasOwnProperty(variant.set)) {
                        setDistribution[variant.set]++;
                        totalCount++;
                    }
                }
            }
        } else {
            // Modo Ilustrações: cada card único conta uma vez
            totalCount = collection.size;
            collection.forEach((data, cardName) => {
                const card = allCards.find(c => c.name === cardName);
                if (!card) return;

                let primarySet = null;
                if (tracker) {
                    try {
                        const cardVariants = tracker.getCollectionByCard(cardName);
                        if (cardVariants && cardVariants.variants) {
                            const firstVariant = Object.values(cardVariants.variants)[0];
                            if (firstVariant && firstVariant.set) {
                                primarySet = firstVariant.set;
                            }
                        }
                    } catch (e) {}
                }

                if (!primarySet && card.sets && card.sets.length > 0) {
                    primarySet = card.sets[card.sets.length - 1].name;
                }

                if (primarySet && setDistribution.hasOwnProperty(primarySet)) {
                    setDistribution[primarySet]++;
                }
            });
        }

        setProgressEl.innerHTML = sets
            .filter(setName => setDistribution[setName] > 0)
            .sort((a, b) => setDistribution[b] - setDistribution[a])
            .map(setName => {
                const count = setDistribution[setName];
                const percent = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : 0;

                return `
                <div class="progress-item">
                    <span class="progress-label">${setName}</span>
                    <div class="progress-bar">
                        <div class="progress-fill default" style="width: ${percent}%"></div>
                    </div>
                    <span class="progress-text">${count} (${percent}%)</span>
                </div>
            `;
            }).join('');
    }

    // Element distribution
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    const elementProgressEl = document.getElementById('element-progress');

    if (elementProgressEl) {
        const elementDistribution = { Fire: 0, Water: 0, Earth: 0, Air: 0, Neutral: 0 };
        let totalCount = 0;

        if (isVariantsMode) {
            // Modo Variantes: contar cada variante
            const tracker = window.variantTracker;
            if (tracker && tracker.collection) {
                for (const normalizedName in tracker.collection) {
                    // Encontrar o card original pelo nome normalizado
                    const cardName = normalizedName.replace(/_/g, ' ');
                    const card = allCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
                    if (!card) continue;

                    const variants = tracker.collection[normalizedName];
                    const variantCount = Object.keys(variants).length;
                    totalCount += variantCount;

                    const cardElements = card.elements || '';
                    if (cardElements.includes('Fire')) elementDistribution.Fire += variantCount;
                    else if (cardElements.includes('Water')) elementDistribution.Water += variantCount;
                    else if (cardElements.includes('Earth')) elementDistribution.Earth += variantCount;
                    else if (cardElements.includes('Air')) elementDistribution.Air += variantCount;
                    else elementDistribution.Neutral += variantCount;
                }
            }
        } else {
            // Modo Ilustrações: cada card único conta uma vez
            totalCount = collection.size;
            collection.forEach((data, cardName) => {
                const card = allCards.find(c => c.name === cardName);
                if (!card) return;

                const cardElements = card.elements || '';
                if (cardElements.includes('Fire')) elementDistribution.Fire++;
                else if (cardElements.includes('Water')) elementDistribution.Water++;
                else if (cardElements.includes('Earth')) elementDistribution.Earth++;
                else if (cardElements.includes('Air')) elementDistribution.Air++;
                else elementDistribution.Neutral++;
            });
        }

        elementProgressEl.innerHTML = [...elements, 'Neutral']
            .filter(el => elementDistribution[el] > 0)
            .sort((a, b) => elementDistribution[b] - elementDistribution[a])
            .map(element => {
                const count = elementDistribution[element];
                const percent = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : 0;

                return `
                <div class="progress-item">
                    <span class="progress-label">${element}</span>
                    <div class="progress-bar">
                        <div class="progress-fill ${element.toLowerCase()}" style="width: ${percent}%"></div>
                    </div>
                    <span class="progress-text">${count} (${percent}%)</span>
                </div>
            `;
            }).join('');
    }
}

// Debounced stats update wrapper - prevents multiple rapid updates
function updateStats() {
    const now = Date.now();
    const DEBOUNCE_MS = 100;

    // Clear any pending update
    if (_statsUpdateTimeout) {
        clearTimeout(_statsUpdateTimeout);
    }

    // If last update was recent, debounce
    if (now - _lastStatsUpdate < DEBOUNCE_MS) {
        _statsUpdateTimeout = setTimeout(() => {
            _lastStatsUpdate = Date.now();
            _updateStatsCore();
        }, DEBOUNCE_MS);
    } else {
        // Execute immediately
        _lastStatsUpdate = now;
        _updateStatsCore();
    }
}

// Render User's Decks (in Collection view)
function renderUserDecks() {
    const decksListEl = document.getElementById('decks-list');
    if (!decksListEl) return;

    // Load user-specific decks
    loadUserDecks();

    if (decks.length === 0) {
        decksListEl.innerHTML = createEmptyState({
            icon: 'wand-2',
            title: 'Crie seu primeiro deck!',
            description: 'Monte decks personalizados, acompanhe quais cartas você possui e compartilhe com a comunidade.',
            actions: [
                { label: 'Novo Deck', onclick: 'openNewDeckModal()', icon: 'plus', primary: true },
                { label: 'Importar Deck', onclick: 'openImportDeckModal()', icon: 'download' }
            ]
        });
        refreshIcons();
        return;
    }

    decksListEl.innerHTML = decks.map((deck, index) => {
        // Calculate deck value - use only real prices, not estimates
        let deckValue = 0;
        let cardsOwned = 0;
        let totalCards = 0;
        let pricedCards = 0;

        const allDeckCards = [...(deck.spellbook || []), ...(deck.atlas || [])];
        allDeckCards.forEach(cardEntry => {
            const qty = cardEntry.qty || 1;
            totalCards += qty;
            const card = allCards.find(c => c.name === cardEntry.name);
            if (card && typeof priceService !== 'undefined') {
                // Only use real market prices, not estimates (which are inflated)
                const price = priceService.getPrice(card.name);
                if (price && price > 0) {
                    deckValue += price * qty;
                    pricedCards += qty;
                }
            }
            if (hasCard(cardEntry.name)) {
                cardsOwned += qty;
            }
        });

        // Only show value if we have priced cards, otherwise show "N/A"
        const valueDisplay = pricedCards > 0 && typeof priceService !== 'undefined'
            ? priceService.formatPrice(deckValue)
            : '—';

        const isShared = deck.sharedToCommunity || false;
        const isPrecon = deck.isPrecon || false;
        const spellCount = deck.spellbook?.reduce((sum, c) => sum + (c.qty || 1), 0) || 0;
        const siteCount = deck.atlas?.reduce((sum, c) => sum + (c.qty || 1), 0) || 0;

        return `
            <div class="deck-card ${isPrecon ? 'precon-deck' : ''}" data-deck-index="${index}" data-deck-id="${deck.id || index}">
                <div class="deck-card-badges">
                    ${isShared ? '<span class="deck-badge shared"><i data-lucide="users"></i> Compartilhado</span>' : ''}
                    ${isPrecon ? '<span class="deck-badge precon"><i data-lucide="package"></i> Precon</span>' : ''}
                </div>
                <h3 class="deck-card-title">${deck.name}</h3>
                <div class="deck-card-stats">
                    <span class="stat"><i data-lucide="wand-2"></i> ${spellCount} feitiços</span>
                    <span class="stat"><i data-lucide="map"></i> ${siteCount} locais</span>
                </div>
                <div class="deck-card-value">
                    <span class="label">Valor estimado:</span>
                    <span class="value ${pricedCards === 0 ? 'no-price' : ''}">${valueDisplay}</span>
                </div>
                <div class="deck-card-ownership">
                    <div class="ownership-text">
                        <span>Possui:</span>
                        <span class="ownership-count">${cardsOwned}/${totalCards}</span>
                    </div>
                    <div class="ownership-bar">
                        <div class="ownership-fill" style="width: ${totalCards > 0 ? (cardsOwned/totalCards)*100 : 0}%"></div>
                    </div>
                </div>
                <div class="deck-card-actions">
                    <button class="deck-action-btn view" data-index="${index}" title="Ver deck">
                        <i data-lucide="eye"></i>
                        <span>Ver</span>
                    </button>
                    ${!isShared ? `
                    <button class="deck-action-btn share" data-index="${index}" title="Compartilhar com a comunidade">
                        <i data-lucide="share-2"></i>
                        <span>Compartilhar</span>
                    </button>
                    ` : `
                    <button class="deck-action-btn unshare" data-index="${index}" title="Remover da comunidade">
                        <i data-lucide="user-minus"></i>
                        <span>Remover</span>
                    </button>
                    `}
                    <button class="deck-action-btn delete" data-index="${index}" title="Excluir deck">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Initialize icons
    refreshIcons();

    // Add click handlers for view buttons
    decksListEl.querySelectorAll('.deck-action-btn.view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            viewDeck(index);
        });
    });

    // Add click handlers for share buttons
    decksListEl.querySelectorAll('.deck-action-btn.share').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            openShareDeckModal(index);
        });
    });

    // Add click handlers for delete buttons
    decksListEl.querySelectorAll('.deck-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            deleteDeck(index);
        });
    });

    // Add click handlers for unshare buttons
    decksListEl.querySelectorAll('.deck-action-btn.unshare').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            unshareDeck(index);
        });
    });

    // Add click handler for deck card itself (opens deck composition)
    decksListEl.querySelectorAll('.deck-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on a button
            if (e.target.closest('.deck-action-btn')) return;
            const index = parseInt(card.dataset.deckIndex);
            viewDeck(index);
        });
    });
}

// Delete User Deck
async function deleteDeck(index) {
    const deck = decks[index];
    if (!deck) return;

    const confirmed = await showConfirmDialog({
        title: 'Excluir deck',
        message: `Tem certeza que deseja excluir o deck "${deck.name}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Manter',
        type: 'danger',
        icon: 'trash-2'
    });

    if (confirmed) {
        decks.splice(index, 1);
        saveUserDecks();
        renderUserDecks();
        showSuccessToast(`Deck "${deck.name}" excluído com sucesso.`);
    }
}

// Unshare deck from community
async function unshareDeck(index) {
    const deck = decks[index];
    if (!deck || !deck.sharedToCommunity) return;

    const confirmed = await showConfirmDialog({
        title: 'Remover da comunidade',
        message: `Tem certeza que deseja remover o deck "${deck.name}" da comunidade? Outros usuários não poderão mais vê-lo.`,
        confirmText: 'Remover',
        cancelText: 'Manter',
        type: 'warning',
        icon: 'user-minus'
    });

    if (confirmed) {
        try {
            // Remove from NocoDB community decks
            if (deck.communityDeckId && typeof communityDeckService !== 'undefined') {
                await communityDeckService.deleteDeck(deck.communityDeckId);
            }

            // Update local deck
            deck.sharedToCommunity = false;
            deck.communityDeckId = null;
            saveUserDecks();
            renderUserDecks();
            showSuccessToast(`Deck "${deck.name}" removido da comunidade.`);
        } catch (error) {
            console.error('Error unsharing deck:', error);
            showErrorToast('Erro ao remover deck da comunidade.');
        }
    }
}

// Open Share Deck Modal
function openShareDeckModal(index) {
    const deck = decks[index];
    if (!deck) return;

    // Populate form with deck data
    document.getElementById('share-deck-id').value = index;
    document.getElementById('share-deck-name').value = deck.name || '';
    document.getElementById('share-deck-format').value = deck.format || 'Constructed';
    document.getElementById('share-deck-tier').value = deck.tier || '';
    document.getElementById('share-deck-description').value = deck.description || '';
    document.getElementById('share-deck-strategy').value = deck.strategy || '';
    document.getElementById('share-deck-matchups').value = deck.matchups || '';
    document.getElementById('share-deck-keycards').value = deck.keyCards?.join(', ') || '';

    // Reset element checkboxes
    document.querySelectorAll('#share-deck-modal input[name="elements"]').forEach(cb => {
        cb.checked = false;
    });

    // Set element checkboxes based on deck elements
    if (deck.elements && Array.isArray(deck.elements)) {
        deck.elements.forEach(el => {
            const cb = document.querySelector(`#share-deck-modal input[name="elements"][value="${el}"]`);
            if (cb) cb.checked = true;
        });
    }

    document.getElementById('share-deck-modal').classList.remove('hidden');
    refreshIcons();
}

// Submit Shared Deck to Community
async function submitSharedDeck(e) {
    e.preventDefault();

    const index = parseInt(document.getElementById('share-deck-id').value);
    const deck = decks[index];
    if (!deck) return;

    // Get form data
    const name = document.getElementById('share-deck-name').value.trim();
    const format = document.getElementById('share-deck-format').value;
    const tier = document.getElementById('share-deck-tier').value;
    const description = document.getElementById('share-deck-description').value.trim();
    const strategy = document.getElementById('share-deck-strategy').value.trim();
    const matchups = document.getElementById('share-deck-matchups').value.trim();
    const keyCardsStr = document.getElementById('share-deck-keycards').value.trim();
    const keyCards = keyCardsStr ? keyCardsStr.split(',').map(s => s.trim()).filter(s => s) : [];

    // Get selected elements
    const elements = [];
    document.querySelectorAll('#share-deck-modal input[name="elements"]:checked').forEach(cb => {
        elements.push(cb.value);
    });

    if (!name || !description) {
        showToast('Nome e descrição são obrigatórios', 'error');
        return;
    }

    // Get submit button and show loading state
    const submitBtn = document.querySelector('#share-deck-modal button[type="submit"]');
    const originalBtnText = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Compartilhando...';
        refreshIcons();
    }

    // Get current user info
    const user = nocoDBService.currentUser;
    if (!user) {
        showNotification('Você precisa estar logado para compartilhar.', 'error');
        return;
    }

    // Get display name from user object
    const authorName = user.displayName || user.display_name || user.name || user.email?.split('@')[0] || 'Anônimo';

    // Build community deck object
    const communityDeck = {
        name,
        author: authorName,
        authorId: user.id || user.Id,
        authorBadge: 'Sorcery Brasil',
        format,
        tier: tier || null,
        description,
        strategy: strategy || null,
        matchups: matchups || null,
        elements,
        keyCards,
        avatar: deck.avatar || null,
        decklist: {
            avatar: deck.avatar,
            minions: deck.spellbook?.filter(c => {
                const card = allCards.find(ac => ac.name === c.name);
                return card && card.type === 'Minion';
            }) || [],
            spells: deck.spellbook?.filter(c => {
                const card = allCards.find(ac => ac.name === c.name);
                return card && card.type === 'Magic';
            }) || [],
            artifacts: deck.spellbook?.filter(c => {
                const card = allCards.find(ac => ac.name === c.name);
                return card && card.type === 'Artifact';
            }) || [],
            sites: deck.atlas || []
        },
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        source: 'sorcery-brasil-community'
    };

    try {
        // Save to NocoDB
        const savedDeck = await communityDeckService.saveDeck(communityDeck);

        if (savedDeck) {
            // Mark local deck as shared
            decks[index].sharedToCommunity = true;
            decks[index].communityDeckId = savedDeck.Id || savedDeck.id;
            saveUserDecks();

            closeModal('share-deck-modal');
            renderUserDecks();
            showToast(`Deck "${name}" compartilhado com a comunidade!`, 'success');
        } else {
            showToast('Erro ao compartilhar deck', 'error');
        }
    } catch (error) {
        console.error('Error sharing deck:', error);
        showToast('Erro ao compartilhar deck. Tente novamente.', 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            refreshIcons();
        }
    }
}

// Setup share deck form handler
document.addEventListener('DOMContentLoaded', () => {
    const shareForm = document.getElementById('share-deck-form');
    if (shareForm) {
        shareForm.addEventListener('submit', submitSharedDeck);
    }
});

// Open Deck Builder
function openDeckBuilder() {
    document.getElementById('deck-builder-modal').classList.remove('hidden');
}

// Close Deck Builder
function closeDeckBuilder() {
    const modal = document.getElementById('deck-builder-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = ''; // Reset inline style
    }
    // Clear the builder
    const nameInput = document.getElementById('deck-name-input');
    if (nameInput) nameInput.value = '';

    const spellbook = document.getElementById('deck-spellbook');
    if (spellbook) spellbook.innerHTML = '';

    const atlas = document.getElementById('deck-atlas');
    if (atlas) atlas.innerHTML = '';

    const spellbookCount = document.getElementById('spellbook-count');
    if (spellbookCount) spellbookCount.textContent = '0';

    const atlasCount = document.getElementById('atlas-count');
    if (atlasCount) atlasCount.textContent = '0';

    const totalValue = document.getElementById('deck-total-value');
    if (totalValue) totalValue.textContent = '$0.00';
}

// Save Deck from Builder
function saveDeckFromBuilder() {
    const deck = getCurrentDeckFromBuilder();

    if (!deck.name || deck.name === 'Untitled') {
        alert('Por favor, dê um nome ao seu deck.');
        return;
    }

    if (deck.spellbook.length === 0 && deck.atlas.length === 0) {
        alert('Seu deck está vazio. Adicione algumas cartas primeiro.');
        return;
    }

    // Check if we're editing an existing deck
    const existingIndex = decks.findIndex(d => d.name === deck.name);

    if (existingIndex >= 0) {
        decks[existingIndex] = deck;
    } else {
        decks.push(deck);
    }

    // Save to localStorage
    saveLocalData();

    // Close modal and refresh deck list
    closeDeckBuilder();
    renderUserDecks();

    // Deck saved successfully
}

// View Deck Details
function viewDeck(index) {
    const deck = decks[index];
    if (!deck) {
        console.error('[viewDeck] Deck not found at index:', index);
        showErrorToast('Deck não encontrado');
        return;
    }

    console.log('[viewDeck] Opening deck:', deck.name, 'spellbook:', deck.spellbook?.length, 'atlas:', deck.atlas?.length);

    // Get modal elements
    const modal = document.getElementById('deck-builder-modal');
    const nameInput = document.getElementById('deck-name-input');

    if (!modal) {
        console.error('[viewDeck] Modal not found');
        showErrorToast('Erro ao abrir visualizador de deck');
        return;
    }

    // Set deck name
    if (nameInput) {
        nameInput.value = deck.name || '';
    }

    // Show modal - remove hidden and force display
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // Populate deck cards
    renderDeckCards(deck);

    // Refresh icons after DOM update
    requestAnimationFrame(() => {
        refreshIcons(modal);
    });
}

// Render Deck Cards in Builder
function renderDeckCards(deck) {
    const spellbookEl = document.getElementById('deck-spellbook');
    const atlasEl = document.getElementById('deck-atlas');
    const totalValueEl = document.getElementById('deck-total-value');

    let totalValue = 0;

    // Render spellbook
    if (spellbookEl && deck.spellbook) {
        spellbookEl.innerHTML = deck.spellbook.map(entry => {
            const card = allCards.find(c => c.name === entry.name);
            let price = 0;
            if (card && typeof priceService !== 'undefined') {
                price = priceService.getPrice(card.name) || priceService.getEstimatedPrice(card);
            }
            const entryValue = price * (entry.qty || 1);
            totalValue += entryValue;
            const owned = hasCard(entry.name);

            return `
                <div class="deck-card-entry ${owned ? 'owned' : 'missing'}">
                    <span class="entry-qty">${entry.qty}x</span>
                    <span class="entry-name">${entry.name}</span>
                    <span class="entry-price">${priceService ? priceService.formatPrice(entryValue) : '--'}</span>
                </div>
            `;
        }).join('');
        document.getElementById('spellbook-count').textContent = deck.spellbook.reduce((sum, e) => sum + (e.qty || 1), 0);
    }

    // Render atlas
    if (atlasEl && deck.atlas) {
        atlasEl.innerHTML = deck.atlas.map(entry => {
            const card = allCards.find(c => c.name === entry.name);
            let price = 0;
            if (card && typeof priceService !== 'undefined') {
                price = priceService.getPrice(card.name) || priceService.getEstimatedPrice(card);
            }
            const entryValue = price * (entry.qty || 1);
            totalValue += entryValue;
            const owned = hasCard(entry.name);

            return `
                <div class="deck-card-entry ${owned ? 'owned' : 'missing'}">
                    <span class="entry-qty">${entry.qty}x</span>
                    <span class="entry-name">${entry.name}</span>
                    <span class="entry-price">${priceService ? priceService.formatPrice(entryValue) : '--'}</span>
                </div>
            `;
        }).join('');
        document.getElementById('atlas-count').textContent = deck.atlas.reduce((sum, e) => sum + (e.qty || 1), 0);
    }

    // Update total value
    if (totalValueEl && typeof priceService !== 'undefined') {
        totalValueEl.textContent = priceService.formatPrice(totalValue);
    }

    // Update deck analysis if panel is visible
    if (deckAnalysisExpanded) {
        updateDeckAnalysis(deck);
    }
}

// Deck Analysis Toggle
let deckAnalysisExpanded = false;

function toggleDeckAnalysis() {
    deckAnalysisExpanded = !deckAnalysisExpanded;
    const content = document.getElementById('deck-analysis-content');
    const icon = document.getElementById('analysis-toggle-icon');

    if (content) {
        content.classList.toggle('expanded', deckAnalysisExpanded);
    }
    if (icon) {
        icon.style.transform = deckAnalysisExpanded ? 'rotate(180deg)' : 'rotate(0)';
    }

    if (deckAnalysisExpanded) {
        // Get current deck from inputs
        const deck = getCurrentDeckFromBuilder();
        updateDeckAnalysis(deck);
    }

    // Re-init icons
    if (typeof lucide !== 'undefined') {
        refreshIcons();
    }
}

function getCurrentDeckFromBuilder() {
    const spellbookEl = document.getElementById('deck-spellbook');
    const atlasEl = document.getElementById('deck-atlas');
    const name = document.getElementById('deck-name-input')?.value || 'Untitled';

    const spellbook = [];
    const atlas = [];

    // Parse spellbook entries
    spellbookEl?.querySelectorAll('.deck-card-entry').forEach(entry => {
        const qtyMatch = entry.querySelector('.entry-qty')?.textContent?.match(/(\d+)/);
        const name = entry.querySelector('.entry-name')?.textContent;
        if (name && qtyMatch) {
            spellbook.push({ name, qty: parseInt(qtyMatch[1]) });
        }
    });

    // Parse atlas entries
    atlasEl?.querySelectorAll('.deck-card-entry').forEach(entry => {
        const qtyMatch = entry.querySelector('.entry-qty')?.textContent?.match(/(\d+)/);
        const name = entry.querySelector('.entry-name')?.textContent;
        if (name && qtyMatch) {
            atlas.push({ name, qty: parseInt(qtyMatch[1]) });
        }
    });

    return { name, spellbook, atlas };
}

function updateDeckAnalysis(deck) {
    if (typeof ThresholdCalculator === 'undefined') {
        document.getElementById('deck-analysis-content').innerHTML =
            '<p class="text-secondary">Threshold Calculator module not loaded.</p>';
        return;
    }

    const calculator = new ThresholdCalculator();

    // Convert deck to the format expected by calculator
    const deckCards = [];
    const spellbookCards = [];
    const atlasCards = [];

    (deck.spellbook || []).forEach(entry => {
        const card = allCards.find(c => c.name === entry.name);
        if (card) {
            for (let i = 0; i < (entry.qty || 1); i++) {
                deckCards.push(card);
                spellbookCards.push(card);
            }
        }
    });

    (deck.atlas || []).forEach(entry => {
        const card = allCards.find(c => c.name === entry.name);
        if (card) {
            for (let i = 0; i < (entry.qty || 1); i++) {
                deckCards.push(card);
                atlasCards.push(card);
            }
        }
    });

    // Analyze deck (pass allCards as second argument)
    const analysis = calculator.analyzeDeck(deckCards, allCards);

    // Render threshold requirements (property is 'requirements', not 'thresholds')
    renderThresholdRequirements(analysis.requirements || {});

    // Render mana curve with spellbook cards only (Sites don't have mana cost)
    renderManaCurve(analysis.manaCurve || {}, spellbookCards.length);

    // Render element distribution (property is 'cardsByElement', not 'elementBreakdown')
    renderElementDistribution(analysis.cardsByElement || {});

    // Render site suggestions
    const siteSuggestions = calculator.suggestSiteDistribution(
        analysis.requirements || {},
        atlasCards.length || 25
    );
    renderSiteSuggestions(siteSuggestions);

    // Render deck summary stats
    renderDeckSummary(analysis, spellbookCards.length, atlasCards.length);

    // Validate deck
    const currentSites = {
        fire: 0, water: 0, earth: 0, air: 0
    };
    atlasCards.forEach(card => {
        const elements = card.elements?.toLowerCase() || '';
        if (elements.includes('fire')) currentSites.fire++;
        if (elements.includes('water')) currentSites.water++;
        if (elements.includes('earth')) currentSites.earth++;
        if (elements.includes('air')) currentSites.air++;
    });

    const validation = calculator.validateDeck(deckCards, currentSites, allCards);
    renderValidationMessages(validation);
}

function renderThresholdRequirements(thresholds) {
    const el = document.getElementById('threshold-requirements');
    if (!el) return;

    const elements = ['fire', 'water', 'earth', 'air'];
    const elementIcons = {
        fire: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
        water: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
        earth: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
        air: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">'
    };
    const maxThreshold = Math.max(...elements.map(e => thresholds[e] || 0), 1);

    el.innerHTML = `
        <div class="threshold-bars">
            ${elements.map(element => {
                const value = thresholds[element] || 0;
                const percent = (value / maxThreshold) * 100;
                return `
                    <div class="threshold-bar-item ${element}">
                        <span class="threshold-icon">${elementIcons[element]}</span>
                        <div class="threshold-bar">
                            <div class="threshold-fill" style="width: ${percent}%"></div>
                        </div>
                        <span class="threshold-value">${value}</span>
                    </div>
                `;
            }).join('')}
        </div>
        <p class="threshold-summary">Max threshold: ${Math.max(...elements.map(e => thresholds[e] || 0))}</p>
    `;
}

function renderManaCurve(manaCurve, totalSpellbookCards) {
    const el = document.getElementById('mana-curve-chart');
    if (!el) return;

    // Create enhanced bar chart
    const costs = [0, 1, 2, 3, 4, 5, 6, '7+'];
    const counts = costs.map(cost => {
        if (cost === '7+') {
            return Object.entries(manaCurve)
                .filter(([k]) => parseInt(k) >= 7)
                .reduce((sum, [, v]) => sum + v, 0);
        }
        return manaCurve[cost] || 0;
    });
    const maxCount = Math.max(...counts, 1);
    const totalCards = counts.reduce((a, b) => a + b, 0);
    const avgCost = totalCards > 0
        ? costs.reduce((sum, cost, i) => {
            const numCost = cost === '7+' ? 7 : cost;
            return sum + (numCost * counts[i]);
        }, 0) / totalCards
        : 0;

    el.innerHTML = `
        <div class="mana-curve-stats">
            <div class="curve-stat">
                <span class="stat-value">${totalSpellbookCards || totalCards}</span>
                <span class="stat-label">Spellbook</span>
            </div>
            <div class="curve-stat highlight">
                <span class="stat-value">${avgCost.toFixed(1)}</span>
                <span class="stat-label">Avg Cost</span>
            </div>
        </div>
        <div class="mana-curve-bars">
            ${costs.map((cost, i) => {
                const count = counts[i];
                const height = (count / maxCount) * 80;
                const percentage = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
                return `
                    <div class="curve-bar-container">
                        <div class="curve-bar ${count > 0 ? 'has-cards' : ''}"
                             style="height: ${Math.max(height, 4)}px"
                             title="${count} cards (${percentage}%)">
                            <span class="curve-count">${count > 0 ? count : ''}</span>
                        </div>
                        <span class="curve-label">${cost}</span>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="curve-legend">
            <span class="legend-label">Mana Cost Distribution</span>
        </div>
    `;
}

function renderElementDistribution(cardsByElement) {
    const el = document.getElementById('element-distribution');
    if (!el) return;

    const elements = ['fire', 'water', 'earth', 'air'];
    const displayNames = { fire: 'Fire', water: 'Water', earth: 'Earth', air: 'Air' };
    const colors = { fire: '#ef4444', water: '#3b82f6', earth: '#22c55e', air: '#a855f7' };
    const icons = {
        fire: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
        water: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
        earth: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
        air: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">'
    };

    // cardsByElement format: { fire: [{name, cost, threshold, quantity}], ... }
    const counts = {};
    elements.forEach(e => {
        const cards = cardsByElement[e] || [];
        counts[e] = cards.reduce((sum, c) => sum + (c.quantity || 1), 0);
    });

    // Also count multi-element and neutral
    const multiCards = cardsByElement.multi || [];
    const neutralCards = cardsByElement.neutral || [];
    const multiCount = multiCards.reduce((sum, c) => sum + (c.quantity || 1), 0);
    const neutralCount = neutralCards.reduce((sum, c) => sum + (c.quantity || 1), 0);

    const total = elements.reduce((sum, e) => sum + counts[e], 0) + multiCount + neutralCount;

    if (total === 0) {
        el.innerHTML = '<p class="text-secondary">Add cards to see element distribution</p>';
        return;
    }

    el.innerHTML = `
        <div class="element-breakdown">
            ${elements.map(element => {
                const count = counts[element];
                const percent = Math.round((count / total) * 100);
                return `
                    <div class="element-row">
                        <span class="element-icon">${icons[element]}</span>
                        <span class="element-name ${element}">${displayNames[element]}</span>
                        <div class="element-bar">
                            <div class="element-fill" style="width: ${percent}%; background: ${colors[element]}"></div>
                        </div>
                        <span class="element-count">${count}</span>
                        <span class="element-percent">(${percent}%)</span>
                    </div>
                `;
            }).join('')}
            ${multiCount > 0 ? `
                <div class="element-row multi">
                    <span class="element-icon"><i data-lucide="layers"></i></span>
                    <span class="element-name">Multi</span>
                    <div class="element-bar">
                        <div class="element-fill" style="width: ${Math.round((multiCount / total) * 100)}%; background: #9966cc"></div>
                    </div>
                    <span class="element-count">${multiCount}</span>
                    <span class="element-percent">(${Math.round((multiCount / total) * 100)}%)</span>
                </div>
            ` : ''}
            ${neutralCount > 0 ? `
                <div class="element-row neutral">
                    <span class="element-icon"><i data-lucide="circle"></i></span>
                    <span class="element-name">Neutral</span>
                    <div class="element-bar">
                        <div class="element-fill" style="width: ${Math.round((neutralCount / total) * 100)}%; background: #888"></div>
                    </div>
                    <span class="element-count">${neutralCount}</span>
                    <span class="element-percent">(${Math.round((neutralCount / total) * 100)}%)</span>
                </div>
            ` : ''}
        </div>
    `;

    refreshIcons();
}

function renderSiteSuggestions(suggestions) {
    const el = document.getElementById('site-suggestions');
    if (!el) return;

    // suggestions format: { fire: 5, water: 3, earth: 0, air: 2, dualSites: {...}, total: 25 }
    if (!suggestions) {
        el.innerHTML = '<p class="text-secondary">Add cards to get site suggestions</p>';
        return;
    }

    const elements = ['fire', 'water', 'earth', 'air'];
    const displayNames = { fire: 'Fire', water: 'Water', earth: 'Earth', air: 'Air' };
    const icons = {
        fire: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
        water: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
        earth: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
        air: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">'
    };

    const activeSuggestions = elements.filter(e => suggestions[e] > 0);

    if (activeSuggestions.length === 0) {
        el.innerHTML = '<p class="text-secondary">Add cards with threshold requirements</p>';
        return;
    }

    el.innerHTML = `
        <div class="site-suggestion-grid">
            ${activeSuggestions.map(element => `
                <div class="site-suggestion ${element}">
                    <span class="site-icon">${icons[element]}</span>
                    <span class="site-element">${displayNames[element]}</span>
                    <span class="site-count">${suggestions[element]}</span>
                </div>
            `).join('')}
        </div>
        ${suggestions.dualSites && Object.keys(suggestions.dualSites).length > 0 ? `
            <div class="dual-sites-section">
                <p class="dual-label">Dual Sites:</p>
                ${Object.entries(suggestions.dualSites).map(([key, count]) => {
                    const [el1, el2] = key.split('-');
                    return `
                        <span class="dual-site-badge">
                            ${icons[el1]}${icons[el2]} x${count}
                        </span>
                    `;
                }).join('')}
            </div>
        ` : ''}
        <p class="suggestion-total">Total: ${suggestions.total || activeSuggestions.reduce((s, e) => s + suggestions[e], 0)} sites</p>
    `;
}

function renderValidationMessages(validation) {
    const el = document.getElementById('deck-validation-messages');
    if (!el) return;

    if (!validation || (validation.errors.length === 0 && validation.warnings.length === 0)) {
        el.innerHTML = validation && validation.isValid
            ? '<div class="validation-success"><i data-lucide="check-circle"></i> Deck is valid!</div>'
            : '';
        refreshIcons();
        return;
    }

    el.innerHTML = `
        ${validation.errors.map(err => `
            <div class="validation-error">
                <i data-lucide="alert-circle"></i>
                <span>${err}</span>
            </div>
        `).join('')}
        ${validation.warnings.map(warn => `
            <div class="validation-warning">
                <i data-lucide="alert-triangle"></i>
                <span>${warn}</span>
            </div>
        `).join('')}
    `;

    refreshIcons();
}

function renderDeckSummary(analysis, spellbookCount, atlasCount) {
    const el = document.getElementById('deck-summary-stats');
    if (!el) return;

    const totalCards = spellbookCount + atlasCount;
    const isValidSpellbook = spellbookCount >= SPELLBOOK_MIN && spellbookCount <= SPELLBOOK_MAX;
    const isValidAtlas = atlasCount >= ATLAS_MIN && atlasCount <= ATLAS_MAX;

    el.innerHTML = `
        <div class="deck-summary-grid">
            <div class="summary-card ${isValidSpellbook ? 'valid' : 'invalid'}">
                <div class="summary-icon"><i data-lucide="book-open"></i></div>
                <div class="summary-info">
                    <span class="summary-value">${spellbookCount}/60</span>
                    <span class="summary-label">Spellbook</span>
                </div>
            </div>
            <div class="summary-card ${isValidAtlas ? 'valid' : 'invalid'}">
                <div class="summary-icon"><i data-lucide="map"></i></div>
                <div class="summary-info">
                    <span class="summary-value">${atlasCount}/30</span>
                    <span class="summary-label">Atlas</span>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon"><i data-lucide="layers"></i></div>
                <div class="summary-info">
                    <span class="summary-value">${totalCards}</span>
                    <span class="summary-label">Total</span>
                </div>
            </div>
            <div class="summary-card highlight">
                <div class="summary-icon"><i data-lucide="zap"></i></div>
                <div class="summary-info">
                    <span class="summary-value">${analysis.averageCost?.toFixed(1) || '0.0'}</span>
                    <span class="summary-label">Avg Cost</span>
                </div>
            </div>
        </div>
    `;

    refreshIcons();
}

// ============================================
// COMMUNITY DECK BROWSER
// ============================================

// Deck browser state
const deckBrowserState = {
    elementFilter: 'all',
    tierFilter: 'all',
    avatarFilter: 'all',
    sortBy: 'views',
    cardSearch: '',
    preconOnly: false,
    tournamentOnly: false,
    communityOnly: false
};

// Get all decks combined (including user-submitted)
function getAllCommunityDecks() {
    const allDecks = [];

    // Recommended decks from static file
    if (typeof RECOMMENDED_DECKS !== 'undefined') {
        allDecks.push(...RECOMMENDED_DECKS.map(d => ({ ...d, type: 'community', source: 'curated' })));
    }

    // Tournament decks
    if (typeof TOURNAMENT_DECKS !== 'undefined') {
        allDecks.push(...TOURNAMENT_DECKS.map(d => ({
            ...d,
            type: 'tournament',
            source: 'tournament',
            author: d.player ? `Player: ${d.player}` : 'Championship'
        })));
    }

    // User-submitted decks from community service (cached)
    if (typeof communityDeckService !== 'undefined' && communityDeckService.cachedDecks.length > 0) {
        allDecks.push(...communityDeckService.cachedDecks.map(d => ({
            ...d,
            type: 'user-submitted'
        })));
    }

    return allDecks;
}

// Load community decks from NocoDB (call on page load)
async function loadCommunityDecks() {
    if (typeof communityDeckService !== 'undefined') {
        try {
            await communityDeckService.getDecks(true);
            // Re-render if we're on the decks view
            if (document.getElementById('decks-view')?.classList.contains('active')) {
                renderCommunityDecks();
            }
        } catch (error) {
            console.error('Error loading community decks:', error);
        }
    }
}

// Filter decks based on current state
function filterDecks(decks) {
    return decks.filter(deck => {
        // Element filter
        if (deckBrowserState.elementFilter !== 'all') {
            if (!deck.elements.includes(deckBrowserState.elementFilter)) {
                return false;
            }
        }

        // Tier filter
        if (deckBrowserState.tierFilter !== 'all') {
            if (deck.tier !== deckBrowserState.tierFilter) {
                return false;
            }
        }

        // Avatar filter
        if (deckBrowserState.avatarFilter !== 'all') {
            if (deck.avatar !== deckBrowserState.avatarFilter) {
                return false;
            }
        }

        // Card search
        if (deckBrowserState.cardSearch) {
            const searchLower = deckBrowserState.cardSearch.toLowerCase();
            const hasCard = deck.keyCards?.some(card =>
                card.toLowerCase().includes(searchLower)
            );
            const matchesName = deck.name.toLowerCase().includes(searchLower);
            const matchesDesc = deck.description?.toLowerCase().includes(searchLower);

            if (!hasCard && !matchesName && !matchesDesc) {
                return false;
            }
        }

        // Quick filters (using category field from Curiosa data)
        if (deckBrowserState.preconOnly && deck.category !== 'precon') {
            return false;
        }

        if (deckBrowserState.tournamentOnly && deck.category !== 'torneio') {
            return false;
        }

        if (deckBrowserState.communityOnly && deck.category !== 'comunidade') {
            return false;
        }

        return true;
    });
}

// Sort decks
function sortDecks(decks) {
    const sorted = [...decks];

    switch (deckBrowserState.sortBy) {
        case 'views':
            sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
        case 'likes':
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        case 'price-low':
            sorted.sort((a, b) => (a.estimatedPrice || 0) - (b.estimatedPrice || 0));
            break;
        case 'price-high':
            sorted.sort((a, b) => (b.estimatedPrice || 0) - (a.estimatedPrice || 0));
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    return sorted;
}

// Render deck card
function renderDeckCard(deck) {
    const tierClass = deck.type === 'tournament' ? 'tournament' : `tier-${deck.tier}`;
    const tierLabel = deck.type === 'tournament' ? deck.tournament : deck.tier;
    const isUserSubmitted = deck.source === 'user-submitted' || deck.source === 'sorcery-brasil-community' || deck.isCommunityDeck;
    const isSorceryBrasil = deck.source === 'sorcery-brasil-community' || deck.authorBadge === 'Sorcery Brasil';

    return `
        <div class="deck-card-enhanced ${isUserSubmitted ? 'user-submitted' : ''}" data-deck-id="${deck.id}" onclick="openDeckDetail('${deck.id}')">
            <div class="deck-card-header">
                ${tierLabel ? `<span class="deck-tier-badge ${tierClass}">${tierLabel}</span>` : ''}
                ${isSorceryBrasil ? '<span class="deck-source-badge sorcery-brasil"><i data-lucide="flag"></i> Sorcery Brasil</span>' :
                  isUserSubmitted ? '<span class="deck-source-badge user"><i data-lucide="users"></i> Comunidade</span>' : ''}
                ${deck.estimatedPrice ? `<span class="deck-price-badge">$${deck.estimatedPrice}</span>` : ''}
            </div>

            <h4>${deck.name}</h4>

            <div class="deck-card-meta-row">
                <span><i data-lucide="user"></i> ${deck.author || ''}${isSorceryBrasil ? ' <span class="author-badge-inline">🇧🇷</span>' : ''}</span>
                ${deck.views ? `<span><i data-lucide="eye"></i> ${deck.views.toLocaleString()}</span>` : ''}
                ${deck.likes ? `<span><i data-lucide="heart"></i> ${deck.likes}</span>` : ''}
            </div>

            <p class="deck-card-description">${deck.description || ''}</p>

            <div class="deck-card-elements">
                ${(deck.elements || []).map(e => `
                    <span class="element-badge ${e.toLowerCase()}">
                        ${getElementIcon(e)} ${e}
                    </span>
                `).join('')}
            </div>

            <div class="deck-card-footer">
                <div class="deck-badges">
                    ${deck.isPrimer ? '<span class="deck-badge"><i data-lucide="book-open"></i> Primer</span>' : ''}
                    ${deck.beginner ? '<span class="deck-badge"><i data-lucide="sparkles"></i> Iniciante</span>' : ''}
                </div>
                <span class="deck-avatar-badge">${deck.avatar || 'Custom'}</span>
            </div>

            ${deck.keyCards?.length ? `
                <div class="deck-key-cards">
                    <div class="deck-key-cards-label">Key Cards</div>
                    <div class="deck-key-cards-list">
                        ${deck.keyCards.slice(0, 4).map(card => `<span class="key-card-tag">${card}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Get element icon
function getElementIcon(element) {
    const icons = {
        Fire: '<img src="assets/elements/fire.png" alt="Fire" class="element-icon-img">',
        Water: '<img src="assets/elements/water.png" alt="Water" class="element-icon-img">',
        Earth: '<img src="assets/elements/earth.png" alt="Earth" class="element-icon-img">',
        Air: '<img src="assets/elements/air.png" alt="Air" class="element-icon-img">'
    };
    return icons[element] || '<span class="element-icon-fallback">✦</span>';
}

// Get rarity icon (for accessibility - not just color)
function getRarityIcon(rarity) {
    const icons = {
        ordinary: '<i data-lucide="circle" class="rarity-icon"></i>',
        exceptional: '<i data-lucide="star" class="rarity-icon"></i>',
        elite: '<i data-lucide="gem" class="rarity-icon"></i>',
        unique: '<i data-lucide="crown" class="rarity-icon"></i>'
    };
    const key = (rarity || '').toLowerCase();
    return icons[key] || '<i data-lucide="circle" class="rarity-icon"></i>';
}

// Open deck detail modal
function openDeckDetail(deckId) {
    const allDecks = getAllCommunityDecks();
    const deck = allDecks.find(d => d.id === deckId);

    if (!deck) {
        console.error('Deck not found:', deckId);
        return;
    }

    const modal = document.getElementById('deck-detail-modal');
    if (!modal) return;

    // Populate header
    document.getElementById('deck-detail-name').textContent = deck.name;
    document.getElementById('deck-detail-author').textContent = deck.author || '';

    // Tier badge
    const tierBadge = document.getElementById('deck-detail-tier');
    const tierClass = deck.type === 'tournament' ? 'tournament' : `tier-${deck.tier}`;
    const tierLabel = deck.type === 'tournament' ? deck.tournament : `Tier ${deck.tier}`;
    tierBadge.className = `tier-badge ${tierClass}`;
    tierBadge.textContent = tierLabel;

    // Format badge
    document.getElementById('deck-detail-format').textContent = deck.format || 'Constructed';

    // Stats
    document.getElementById('deck-detail-views').textContent = deck.views?.toLocaleString() || '0';
    document.getElementById('deck-detail-likes').textContent = deck.likes?.toString() || '0';
    document.getElementById('deck-detail-price').textContent = deck.estimatedPrice ? `$${deck.estimatedPrice}` : '-';

    // Elements
    const elementsContainer = document.getElementById('deck-detail-elements');
    elementsContainer.innerHTML = deck.elements.map(e => `
        <span class="element-badge ${e.toLowerCase()}">
            ${getElementIcon(e)} ${e}
        </span>
    `).join('');

    // Decklist
    const validElements = ['fire', 'water', 'earth', 'air'];

    const getCardElements = (cardName) => {
        if (typeof allCards === 'undefined' || !allCards.length) return [];
        const card = allCards.find(c => c.name === cardName);
        if (!card || !card.elements) return [];
        // Handle both "/" and ", " separators, filter out "None" and invalid elements
        const separator = card.elements.includes(',') ? ',' : '/';
        return card.elements.split(separator)
            .map(e => e.trim())
            .filter(e => e && e.toLowerCase() !== 'none' && validElements.includes(e.toLowerCase()));
    };

    const renderElementIcons = (elements) => {
        if (!elements || elements.length === 0) return '';
        return elements.map(el =>
            `<img src="assets/elements/${el.toLowerCase()}.png" alt="${el}" class="element-icon-img tiny">`
        ).join('');
    };

    const renderCardList = (cards, showElements = false) => {
        if (!cards || cards.length === 0) {
            return '<li class="no-cards">Nenhuma carta</li>';
        }
        return cards.map(card => {
            const qty = card.qty || 1;
            const elements = showElements ? getCardElements(card.name) : [];
            const elementIcons = renderElementIcons(elements);
            const escapedName = card.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `
                <li>
                    <span class="card-qty">${qty}</span>
                    <span class="card-name" onclick="searchCardByName('${escapedName}')">${escapeHtml(card.name)}</span>
                    ${elementIcons}
                </li>
            `;
        }).join('');
    };

    // Calculate card counts
    const countCards = (cards) => cards ? cards.reduce((sum, c) => sum + (c.qty || 1), 0) : 0;

    const avatarCount = deck.decklist?.avatar ? 1 : (deck.avatar ? 1 : 0);
    const minionsCount = countCards(deck.decklist?.minions);
    const spellsCount = countCards(deck.decklist?.spells);
    const artifactsCount = countCards(deck.decklist?.artifacts);
    const sitesCount = countCards(deck.decklist?.sites);
    const spellbookTotal = minionsCount + spellsCount + artifactsCount;

    // Avatar section
    const avatarList = document.getElementById('deck-detail-avatar');
    if (deck.decklist?.avatar) {
        avatarList.innerHTML = `<li><span class="card-name avatar-card" onclick="searchCardByName('${deck.decklist.avatar}')">${deck.decklist.avatar}</span></li>`;
    } else if (deck.avatar) {
        avatarList.innerHTML = `<li><span class="card-name avatar-card" onclick="searchCardByName('${deck.avatar}')">${deck.avatar}</span></li>`;
    } else {
        avatarList.innerHTML = '<li class="no-cards">Avatar não especificado</li>';
    }
    document.getElementById('deck-avatar-count').textContent = `(${avatarCount})`;

    // Spellbook counts
    document.getElementById('deck-spellbook-count').textContent = `(${spellbookTotal})`;
    document.getElementById('deck-minions-count').textContent = minionsCount > 0 ? `(${minionsCount})` : '';
    document.getElementById('deck-spells-count').textContent = spellsCount > 0 ? `(${spellsCount})` : '';
    document.getElementById('deck-artifacts-count').textContent = artifactsCount > 0 ? `(${artifactsCount})` : '';

    // Atlas count
    document.getElementById('deck-atlas-count').textContent = `(${sitesCount})`;

    document.getElementById('deck-detail-minions').innerHTML =
        deck.decklist ? renderCardList(deck.decklist.minions, true) : '<li class="no-cards">Lista completa no Curiosa.io</li>';
    document.getElementById('deck-detail-spells').innerHTML =
        deck.decklist ? renderCardList(deck.decklist.spells, true) : '<li class="no-cards">Lista completa no Curiosa.io</li>';
    document.getElementById('deck-detail-sites').innerHTML =
        deck.decklist ? renderCardList(deck.decklist.sites, false) : '<li class="no-cards">Lista completa no Curiosa.io</li>';
    document.getElementById('deck-detail-artifacts').innerHTML =
        deck.decklist ? renderCardList(deck.decklist.artifacts, false) : '<li class="no-cards">Lista completa no Curiosa.io</li>';

    // Changelog
    const changelogSection = document.getElementById('deck-detail-changelog-section');
    const changelogList = document.getElementById('deck-detail-changelog');
    if (deck.changelog && deck.changelog.length > 0) {
        changelogSection.style.display = 'block';
        changelogList.innerHTML = deck.changelog.map(entry => `
            <li>
                <span class="changelog-date">${entry.date}</span>
                <span>${entry.note}</span>
            </li>
        `).join('');
    } else {
        changelogSection.style.display = 'none';
    }

    // Guide Section (from Curiosa.io)
    const guideSection = document.getElementById('deck-detail-guide-section');
    const guideContent = document.getElementById('deck-guide-content');
    const guideExpandBtn = document.getElementById('deck-guide-expand');

    if (deck.guide?.overview && deck.guide.overview.length > 50) {
        guideSection.style.display = 'block';
        guideContent.innerHTML = deck.guide.overview;
        guideContent.classList.remove('expanded');

        // Show/hide expand button based on content height
        setTimeout(() => {
            if (guideContent.scrollHeight > 420) {
                guideExpandBtn.parentElement.style.display = 'block';
                guideExpandBtn.innerHTML = '<i data-lucide="chevron-down"></i> Ver mais';
                refreshIcons(guideExpandBtn);
            } else {
                guideExpandBtn.parentElement.style.display = 'none';
                guideContent.classList.add('expanded');
            }
        }, 100);
    } else {
        guideSection.style.display = 'none';
    }

    // Primer Section (curated/structured)
    const primerSection = document.getElementById('deck-detail-primer-section');
    if (deck.primer && typeof DECK_GUIDES !== 'undefined' && DECK_GUIDES.deckPrimers) {
        const primer = DECK_GUIDES.deckPrimers.find(p => p.id === deck.primer);
        if (primer) {
            primerSection.style.display = 'block';

            // Overview
            document.getElementById('primer-overview').innerHTML = primer.overview || '';

            // Key Cards
            const keyCardsEl = document.getElementById('primer-key-cards');
            if (primer.keyCards && primer.keyCards.length > 0) {
                keyCardsEl.innerHTML = primer.keyCards.map(card => {
                    const escapedName = card.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                    return `
                    <li>
                        <span class="key-card-copies">${card.copies}x</span>
                        <span class="key-card-name" onclick="searchCardByName('${escapedName}')">${escapeHtml(card.name)}</span>
                        <span class="key-card-role">${escapeHtml(card.role)}</span>
                    </li>
                `}).join('');
            } else {
                keyCardsEl.innerHTML = '';
            }

            // Gameplan
            const gameplanEl = document.getElementById('primer-gameplan');
            if (primer.gameplan) {
                gameplanEl.innerHTML = `
                    <div class="gameplan-phase">
                        <span class="phase-label">Early Game</span>
                        <p>${primer.gameplan.early || ''}</p>
                    </div>
                    <div class="gameplan-phase">
                        <span class="phase-label">Mid Game</span>
                        <p>${primer.gameplan.mid || ''}</p>
                    </div>
                    <div class="gameplan-phase">
                        <span class="phase-label">Late Game</span>
                        <p>${primer.gameplan.late || ''}</p>
                    </div>
                `;
            } else {
                gameplanEl.innerHTML = '';
            }

            // Mulligan Guide
            document.getElementById('primer-mulligan').innerHTML = primer.mulliganGuide || '';

            // Matchups
            const matchupsEl = document.getElementById('primer-matchups');
            if (primer.matchups && primer.matchups.length > 0) {
                matchupsEl.innerHTML = primer.matchups.map(m => `
                    <div class="matchup-item ${m.difficulty.toLowerCase().replace(' ', '-')}">
                        <div class="matchup-header">
                            <span class="matchup-deck">${m.deck}</span>
                            <span class="matchup-difficulty">${m.difficulty}</span>
                            <span class="matchup-winrate">${m.winrate}</span>
                        </div>
                        <p class="matchup-tips">${m.tips}</p>
                    </div>
                `).join('');
            } else {
                matchupsEl.innerHTML = '';
            }
        } else {
            primerSection.style.display = 'none';
        }
    } else {
        primerSection.style.display = 'none';
    }

    // External link
    document.getElementById('deck-detail-external-link').href = deck.url;

    // Copy button
    const copyBtn = document.getElementById('deck-detail-copy');
    copyBtn.onclick = () => copyDeckList(deck);

    // Show modal
    modal.classList.remove('hidden');

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        refreshIcons();
    }
}

// Toggle deck guide expansion
function toggleDeckGuide() {
    const guideContent = document.getElementById('deck-guide-content');
    const expandBtn = document.getElementById('deck-guide-expand');

    if (!guideContent || !expandBtn) return;

    const isExpanded = guideContent.classList.toggle('expanded');

    if (isExpanded) {
        expandBtn.innerHTML = '<i data-lucide="chevron-up"></i> Ver menos';
    } else {
        expandBtn.innerHTML = '<i data-lucide="chevron-down"></i> Ver mais';
        // Scroll guide section into view
        document.getElementById('deck-detail-guide-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    refreshIcons(expandBtn);
}
window.toggleDeckGuide = toggleDeckGuide;

// Copy deck list to clipboard
function copyDeckList(deck) {
    if (!deck.decklist) {
        // If no decklist, copy key cards
        const keyCardsList = deck.keyCards ? deck.keyCards.join('\n') : '';
        const text = `${deck.name}\nby ${deck.author}\n\nKey Cards:\n${keyCardsList}\n\nVer lista completa: ${deck.url}`;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Lista copiada!', 'success');
        }).catch(() => {
            showNotification('Erro ao copiar lista', 'error');
        });
        return;
    }

    const formatSection = (title, cards) => {
        if (!cards || cards.length === 0) return '';
        const total = cards.reduce((sum, c) => sum + (c.qty || 1), 0);
        return `${title} (${total}):\n${cards.map(c => `${c.qty}x ${c.name}`).join('\n')}\n`;
    };

    const avatar = deck.decklist?.avatar || deck.avatar || 'N/A';
    const minionsCount = deck.decklist?.minions?.reduce((s, c) => s + c.qty, 0) || 0;
    const spellsCount = deck.decklist?.spells?.reduce((s, c) => s + c.qty, 0) || 0;
    const artifactsCount = deck.decklist?.artifacts?.reduce((s, c) => s + c.qty, 0) || 0;
    const sitesCount = deck.decklist?.sites?.reduce((s, c) => s + c.qty, 0) || 0;
    const spellbookTotal = minionsCount + spellsCount + artifactsCount;

    const text = [
        `${deck.name}`,
        `por ${deck.author || deck.player || 'Desconhecido'}`,
        '',
        `== AVATAR (1) ==`,
        `1x ${avatar}`,
        '',
        `== SPELLBOOK (${spellbookTotal}) ==`,
        formatSection('Minions', deck.decklist.minions),
        formatSection('Magic', deck.decklist.spells),
        formatSection('Artifacts', deck.decklist.artifacts),
        `== ATLAS (${sitesCount}) ==`,
        formatSection('Sites', deck.decklist.sites),
        `Fonte: ${deck.url}`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
        showNotification('Lista copiada para clipboard!', 'success');
    }).catch(() => {
        showNotification('Erro ao copiar lista', 'error');
    });
}

// Search card by name (opens card modal)
function searchCardByName(cardName) {
    // Find card in database and open modal
    const card = allCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
    if (card) {
        // Open card modal (deck modal stays behind)
        openCardModal(card.name, false);
    } else {
        // Card not found - close deck modal and search
        document.getElementById('deck-detail-modal').classList.add('hidden');
        showView('cards');
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = cardName;
            applyFilters();
        }
    }
}

// Close deck detail modal
function closeDeckDetailModal() {
    const modal = document.getElementById('deck-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ============================================
// IMPORT DECK FUNCTIONALITY
// ============================================

let importedDeckData = null;

function openImportDeckModal() {
    const modal = document.getElementById('import-deck-modal');
    if (!modal) return;

    // Reset form
    document.getElementById('import-deck-url').value = '';
    document.getElementById('import-deck-name').value = '';
    document.getElementById('import-deck-text').value = '';
    document.getElementById('import-url-preview').innerHTML = '';
    document.getElementById('import-cards-found').textContent = '0 cartas encontradas';
    document.getElementById('import-cards-missing').textContent = '0 não encontradas';
    document.getElementById('import-deck-submit').disabled = true;
    importedDeckData = null;

    // Reset CSV tab
    const csvFileInput = document.getElementById('import-csv-file');
    const csvFileInfo = document.getElementById('csv-file-info');
    const csvUploadArea = document.getElementById('csv-upload-area');
    if (csvFileInput) csvFileInput.value = '';
    csvFileInfo?.classList.add('hidden');
    csvUploadArea?.classList.remove('hidden');
    const csvFoundEl = document.getElementById('import-csv-found');
    const csvMissingEl = document.getElementById('import-csv-missing');
    const csvTotalEl = document.getElementById('import-csv-total');
    if (csvFoundEl) csvFoundEl.textContent = '0 cartas encontradas';
    if (csvMissingEl) csvMissingEl.textContent = '0 não encontradas';
    if (csvTotalEl) csvTotalEl.textContent = '0 cópias total';

    // Reset to URL tab
    switchImportTab('url');

    modal.classList.remove('hidden');
    refreshIcons();
}

function switchImportTab(tabName) {
    document.querySelectorAll('.import-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.import-tab-content').forEach(c => c.classList.remove('active'));

    document.querySelector(`.import-tab[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`import-${tabName}-tab`)?.classList.add('active');

    // Reset submit button when switching tabs
    document.getElementById('import-deck-submit').disabled = true;
    importedDeckData = null;
}

async function handleImportUrlInput(e) {
    const url = e.target.value.trim();
    const previewEl = document.getElementById('import-url-preview');
    const submitBtn = document.getElementById('import-deck-submit');

    if (!url) {
        previewEl.innerHTML = '';
        submitBtn.disabled = true;
        return;
    }

    // Validate Curiosa.io URL
    const curiosaMatch = url.match(/curiosa\.io\/decks\/([a-zA-Z0-9]+)/);
    if (!curiosaMatch) {
        previewEl.innerHTML = '<p style="color: var(--warning);">URL inválida. Use uma URL do Curiosa.io (ex: https://curiosa.io/decks/...)</p>';
        submitBtn.disabled = true;
        return;
    }

    const deckId = curiosaMatch[1];
    previewEl.innerHTML = '<div class="loading"><i data-lucide="loader-2" class="spinning"></i> Buscando deck...</div>';
    refreshIcons();

    // Try to find the deck in our recommended decks
    const allDecks = getAllCommunityDecks();
    const foundDeck = allDecks.find(d => d.url?.includes(deckId));

    if (foundDeck) {
        importedDeckData = {
            type: 'curiosa',
            deck: foundDeck
        };

        previewEl.innerHTML = `
            <div class="preview-deck-name">${foundDeck.name}</div>
            <div class="preview-deck-author">por ${foundDeck.author || foundDeck.player || 'Desconhecido'}</div>
            <div class="preview-stats">
                <span class="preview-stat"><i data-lucide="layers"></i> ${foundDeck.decklist ? 'Lista completa disponível' : 'Lista parcial'}</span>
                <span class="preview-stat"><i data-lucide="dollar-sign"></i> $${foundDeck.estimatedPrice || '?'}</span>
                ${foundDeck.elements ? `<span class="preview-stat">${foundDeck.elements.map(e => getElementIcon(e)).join(' ')}</span>` : ''}
            </div>
        `;
        submitBtn.disabled = false;
    } else {
        previewEl.innerHTML = `
            <p style="color: var(--warning);">Deck não encontrado em nossa base de dados.</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Use a aba "Via Texto" para importar manualmente copiando a lista de cartas do Curiosa.io.</p>
        `;
        submitBtn.disabled = true;
    }

    refreshIcons();
}

function handleImportTextInput(e) {
    const text = e.target.value.trim();
    const foundEl = document.getElementById('import-cards-found');
    const missingEl = document.getElementById('import-cards-missing');
    const submitBtn = document.getElementById('import-deck-submit');

    if (!text) {
        foundEl.textContent = '0 cartas encontradas';
        missingEl.textContent = '0 não encontradas';
        submitBtn.disabled = true;
        importedDeckData = null;
        return;
    }

    const parsed = parseDecklist(text);
    foundEl.textContent = `${parsed.found.length} cartas encontradas`;
    missingEl.textContent = `${parsed.missing.length} não encontradas`;

    if (parsed.found.length > 0) {
        importedDeckData = {
            type: 'text',
            cards: parsed.found,
            missing: parsed.missing
        };
        submitBtn.disabled = false;
    } else {
        importedDeckData = null;
        submitBtn.disabled = true;
    }
}

function parseDecklist(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const found = [];
    const missing = [];

    for (const line of lines) {
        // Skip section headers
        if (line.match(/^(Avatar|Spellbook|Atlas|Minions|Magic|Artifacts|Sites|Auras):/i)) continue;
        if (line.match(/^#+/)) continue;
        if (line.match(/^-+$/)) continue;

        // Parse "4 Lightning Bolt" or "4x Lightning Bolt" or "Lightning Bolt x4"
        let match = line.match(/^(\d+)x?\s+(.+)$/i) || line.match(/^(.+)\s+x(\d+)$/i);

        if (match) {
            const qty = parseInt(match[1]) || parseInt(match[2]) || 1;
            const cardName = (match[2] || match[1]).trim();

            // Find card in database
            const card = allCards.find(c =>
                c.name.toLowerCase() === cardName.toLowerCase() ||
                c.name.toLowerCase().includes(cardName.toLowerCase())
            );

            if (card) {
                found.push({ name: card.name, qty, card });
            } else {
                missing.push({ name: cardName, qty });
            }
        } else if (line.trim()) {
            // Single card without quantity
            const cardName = line.trim();
            const card = allCards.find(c =>
                c.name.toLowerCase() === cardName.toLowerCase()
            );

            if (card) {
                found.push({ name: card.name, qty: 1, card });
            } else {
                missing.push({ name: cardName, qty: 1 });
            }
        }
    }

    return { found, missing };
}

/**
 * Handle CSV file selection for import
 */
function handleCsvFileSelect(file) {
    const fileInfoEl = document.getElementById('csv-file-info');
    const fileNameEl = document.getElementById('csv-file-name');
    const uploadAreaEl = document.getElementById('csv-upload-area');

    fileNameEl.textContent = file.name;
    fileInfoEl.classList.remove('hidden');
    uploadAreaEl.classList.add('hidden');

    // Read and parse the CSV
    const reader = new FileReader();
    reader.onload = (e) => {
        const csvText = e.target.result;
        parseCsvCollection(csvText);
    };
    reader.readAsText(file);

    refreshIcons();
}

/**
 * Clear selected CSV file
 */
function clearCsvFile() {
    const fileInfoEl = document.getElementById('csv-file-info');
    const uploadAreaEl = document.getElementById('csv-upload-area');
    const csvFileInput = document.getElementById('import-csv-file');
    const foundEl = document.getElementById('import-csv-found');
    const missingEl = document.getElementById('import-csv-missing');
    const totalEl = document.getElementById('import-csv-total');
    const submitBtn = document.getElementById('import-deck-submit');

    fileInfoEl.classList.add('hidden');
    uploadAreaEl.classList.remove('hidden');
    csvFileInput.value = '';

    foundEl.textContent = '0 cartas encontradas';
    missingEl.textContent = '0 não encontradas';
    totalEl.textContent = '0 cópias total';

    submitBtn.disabled = true;
    importedDeckData = null;

    refreshIcons();
}

/**
 * Parse CSV collection from Curiosa.io format
 * Format: card name,set,finish,product,quantity,notes
 */
function parseCsvCollection(csvText) {
    const foundEl = document.getElementById('import-csv-found');
    const missingEl = document.getElementById('import-csv-missing');
    const totalEl = document.getElementById('import-csv-total');
    const submitBtn = document.getElementById('import-deck-submit');

    const lines = csvText.split('\n').filter(l => l.trim());

    // Skip header row
    const hasHeader = lines[0]?.toLowerCase().includes('card name');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const found = [];
    const missing = [];
    let totalCopies = 0;

    for (const line of dataLines) {
        // Parse CSV line - handle quoted values
        const parts = parseCsvLine(line);
        if (parts.length < 5) continue;

        const [cardName, set, finish, product, quantityStr] = parts;
        const quantity = parseInt(quantityStr) || 1;

        // Find card in database
        const card = allCards.find(c =>
            c.name.toLowerCase() === cardName.toLowerCase() ||
            c.name.toLowerCase().replace(/[-'']/g, '') === cardName.toLowerCase().replace(/[-'']/g, '')
        );

        if (card) {
            // Check if we already have this card in found list
            const existing = found.find(f => f.name === card.name && f.finish === finish && f.set === set);
            if (existing) {
                existing.qty += quantity;
            } else {
                found.push({
                    name: card.name,
                    qty: quantity,
                    card,
                    finish: finish || 'Standard',
                    set: set || ''
                });
            }
            totalCopies += quantity;
        } else {
            const existingMissing = missing.find(m => m.name === cardName);
            if (existingMissing) {
                existingMissing.qty += quantity;
            } else {
                missing.push({ name: cardName, qty: quantity, finish, set });
            }
        }
    }

    foundEl.textContent = `${found.length} cartas encontradas`;
    missingEl.textContent = `${missing.length} não encontradas`;
    totalEl.textContent = `${totalCopies} cópias total`;

    if (found.length > 0) {
        importedDeckData = {
            type: 'csv',
            cards: found,
            missing: missing,
            totalCopies: totalCopies
        };
        submitBtn.disabled = false;
    } else {
        importedDeckData = null;
        submitBtn.disabled = true;
    }
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

function submitImportDeck() {
    if (!importedDeckData) return;

    const deckName = document.getElementById('import-deck-name')?.value.trim() || 'Deck Importado';

    if (importedDeckData.type === 'curiosa' && importedDeckData.deck) {
        // Import from Curiosa deck
        const sourceDeck = importedDeckData.deck;
        const newDeck = {
            id: Date.now().toString(),
            name: sourceDeck.name + ' (Importado)',
            avatar: sourceDeck.decklist?.avatar || sourceDeck.avatar || '',
            cards: [],
            createdAt: new Date().toISOString()
        };

        // Convert decklist to cards array
        if (sourceDeck.decklist) {
            const addCards = (cards, type) => {
                if (!cards) return;
                cards.forEach(c => {
                    const card = allCards.find(ac => ac.name.toLowerCase() === c.name.toLowerCase());
                    if (card) {
                        for (let i = 0; i < c.qty; i++) {
                            newDeck.cards.push({ name: card.name, type });
                        }
                    }
                });
            };

            addCards(sourceDeck.decklist.minions, 'minion');
            addCards(sourceDeck.decklist.spells, 'spell');
            addCards(sourceDeck.decklist.artifacts, 'artifact');
            addCards(sourceDeck.decklist.sites, 'site');
        }

        decks.push(newDeck);
        saveToStorage();
        renderUserDecks();
        showNotification(`Deck "${newDeck.name}" importado com sucesso!`, 'success');
    } else if (importedDeckData.type === 'text') {
        // Import from text
        const newDeck = {
            id: Date.now().toString(),
            name: deckName,
            avatar: '',
            cards: [],
            createdAt: new Date().toISOString()
        };

        importedDeckData.cards.forEach(c => {
            const cardType = c.card?.guardian?.type?.toLowerCase() || 'unknown';
            for (let i = 0; i < c.qty; i++) {
                newDeck.cards.push({ name: c.name, type: cardType });
            }
        });

        decks.push(newDeck);
        saveToStorage();
        renderUserDecks();

        let message = `Deck "${deckName}" importado com ${importedDeckData.cards.length} cartas!`;
        if (importedDeckData.missing.length > 0) {
            message += ` (${importedDeckData.missing.length} cartas não encontradas)`;
        }
        showNotification(message, 'success');
    } else if (importedDeckData.type === 'csv') {
        // Import from CSV - add to collection
        let cardsAdded = 0;
        let copiesAdded = 0;

        importedDeckData.cards.forEach(c => {
            // Map finish from Curiosa format to our format
            let finish = 'standard';
            if (c.finish?.toLowerCase() === 'foil') {
                finish = 'foil';
            } else if (c.finish?.toLowerCase() === 'rainbow' || c.finish?.toLowerCase() === 'foil etched') {
                finish = 'rainbow';
            }

            // Add each copy to the collection
            for (let i = 0; i < c.qty; i++) {
                variantTracker.addVariant(c.name, finish);
                copiesAdded++;
            }
            cardsAdded++;
        });

        // Save to storage
        saveToStorage();

        // Refresh collection view if visible
        if (document.getElementById('my-collection-content')?.classList.contains('active')) {
            renderMyCollection();
        }

        let message = `Coleção importada: ${copiesAdded} cópias de ${cardsAdded} cartas!`;
        if (importedDeckData.missing.length > 0) {
            message += ` (${importedDeckData.missing.length} não encontradas)`;
        }
        showNotification(message, 'success');
    }

    closeModal('import-deck-modal');
}

// Render community decks
function renderCommunityDecks() {
    const gridEl = document.getElementById('community-decks-grid');
    const countEl = document.getElementById('deck-results-count');
    const clearBtn = document.getElementById('clear-deck-filters');

    if (!gridEl) return;

    const allDecks = getAllCommunityDecks();
    const filtered = filterDecks(allDecks);
    const sorted = sortDecks(filtered);

    // Update count
    if (countEl) {
        countEl.textContent = `${sorted.length} deck${sorted.length !== 1 ? 's' : ''} encontrado${sorted.length !== 1 ? 's' : ''}`;
    }

    // Show/hide clear button
    const hasFilters = deckBrowserState.elementFilter !== 'all' ||
                       deckBrowserState.tierFilter !== 'all' ||
                       deckBrowserState.avatarFilter !== 'all' ||
                       deckBrowserState.cardSearch ||
                       deckBrowserState.preconOnly ||
                       deckBrowserState.tournamentOnly ||
                       deckBrowserState.communityOnly;

    if (clearBtn) {
        clearBtn.classList.toggle('hidden', !hasFilters);
    }

    // Render cards
    if (sorted.length === 0) {
        gridEl.innerHTML = `
            <div class="no-decks-found">
                <i data-lucide="search-x"></i>
                <h4>Nenhum deck encontrado</h4>
                <p>Tente ajustar os filtros ou limpar a busca</p>
            </div>
        `;
    } else {
        gridEl.innerHTML = sorted.map(renderDeckCard).join('');
    }

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        refreshIcons();
    }
}

// Setup deck browser event listeners
function setupDeckBrowser() {
    // Element filter buttons
    document.querySelectorAll('.element-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.element-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            deckBrowserState.elementFilter = btn.dataset.element;
            renderCommunityDecks();
        });
    });

    // Tier filter buttons
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            deckBrowserState.tierFilter = btn.dataset.tier;
            renderCommunityDecks();
        });
    });

    // Avatar filter
    document.getElementById('deck-avatar-filter')?.addEventListener('change', (e) => {
        deckBrowserState.avatarFilter = e.target.value;
        renderCommunityDecks();
    });

    // Sort select
    document.getElementById('deck-sort')?.addEventListener('change', (e) => {
        deckBrowserState.sortBy = e.target.value;
        renderCommunityDecks();
    });

    // Card search
    document.getElementById('deck-card-filter')?.addEventListener('input', debounce((e) => {
        deckBrowserState.cardSearch = e.target.value;
        renderCommunityDecks();
    }, SEARCH_DEBOUNCE_MS, { leading: true }));

    // Quick filter buttons
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            btn.classList.toggle('active');

            if (filter === 'precon') {
                deckBrowserState.preconOnly = btn.classList.contains('active');
            } else if (filter === 'tournament') {
                deckBrowserState.tournamentOnly = btn.classList.contains('active');
            } else if (filter === 'community') {
                deckBrowserState.communityOnly = btn.classList.contains('active');
            }

            renderCommunityDecks();
        });
    });

    // Clear filters button
    document.getElementById('clear-deck-filters')?.addEventListener('click', () => {
        // Reset state
        deckBrowserState.elementFilter = 'all';
        deckBrowserState.tierFilter = 'all';
        deckBrowserState.avatarFilter = 'all';
        deckBrowserState.sortBy = 'views';
        deckBrowserState.cardSearch = '';
        deckBrowserState.preconOnly = false;
        deckBrowserState.tournamentOnly = false;
        deckBrowserState.communityOnly = false;

        // Reset UI
        document.querySelectorAll('.element-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.element-btn[data-element="all"]')?.classList.add('active');

        document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.tier-btn[data-tier="all"]')?.classList.add('active');

        document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));

        const avatarSelect = document.getElementById('deck-avatar-filter');
        if (avatarSelect) avatarSelect.value = 'all';

        const sortSelect = document.getElementById('deck-sort');
        if (sortSelect) sortSelect.value = 'views';

        const searchInput = document.getElementById('deck-card-filter');
        if (searchInput) searchInput.value = '';

        renderCommunityDecks();
    });
}

// Legacy function for backwards compatibility
function renderRecommendedDecks() {
    renderCommunityDecks();
    setupDeckBrowser();
}

// ============================================
// EXPORT/IMPORT COLLECTION
// ============================================

// Export collection to JSON
function exportCollectionToJSON() {
    const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        totalCards: getTotalCardCount(),
        uniqueCards: collection.size,
        collection: {},
        wishlist: Array.from(wishlist),
        tradeBinder: Array.from(tradeBinder)
    };

    // Convert Map to object with full data
    collection.forEach((data, cardName) => {
        const card = allCards.find(c => c.name === cardName);
        exportData.collection[cardName] = {
            qty: typeof data === 'object' ? data.qty : data,
            addedAt: typeof data === 'object' ? data.addedAt : null,
            sets: card?.sets?.map(s => s.name) || [],
            type: card?.guardian?.type || '',
            rarity: card?.guardian?.rarity || '',
            elements: card?.elements || ''
        };
    });

    return JSON.stringify(exportData, null, 2);
}

// Export collection to CSV
function exportCollectionToCSV() {
    let csv = 'Card Name,Quantity,Type,Rarity,Elements,Sets,Added Date\n';

    collection.forEach((data, cardName) => {
        const card = allCards.find(c => c.name === cardName);
        const qty = typeof data === 'object' ? data.qty : data;
        const addedAt = typeof data === 'object' ? data.addedAt : '';
        const sets = card?.sets?.map(s => s.name).join('; ') || '';
        const type = card?.guardian?.type || '';
        const rarity = card?.guardian?.rarity || '';
        const elements = card?.elements || '';

        // Escape quotes in card name
        const escapedName = cardName.replace(/"/g, '""');
        csv += `"${escapedName}",${qty},"${type}","${rarity}","${elements}","${sets}","${addedAt}"\n`;
    });

    return csv;
}

// Import collection from JSON
function importCollectionFromJSON(jsonString, mode = 'merge') {
    try {
        const data = JSON.parse(jsonString);

        // Support both old format (direct object) and new format (with version)
        const collectionData = data.collection || data;

        if (mode === 'replace') {
            collection.clear();
        }

        let importCount = 0;
        const now = new Date().toISOString();

        Object.entries(collectionData).forEach(([cardName, cardData]) => {
            // Verify card exists in database
            const cardExists = allCards.some(c => c.name === cardName);
            if (!cardExists) return;

            const qty = typeof cardData === 'object' ? (cardData.qty || 1) : (cardData || 1);
            const addedAt = typeof cardData === 'object' ? (cardData.addedAt || now) : now;

            if (mode === 'merge') {
                const existing = collection.get(cardName);
                const currentQty = existing ? (typeof existing === 'object' ? existing.qty : existing) : 0;
                collection.set(cardName, { qty: currentQty + qty, addedAt });
            } else {
                collection.set(cardName, { qty, addedAt });
            }
            importCount++;
        });

        // Import wishlist if present
        if (data.wishlist && Array.isArray(data.wishlist)) {
            data.wishlist.forEach(cardName => {
                if (allCards.some(c => c.name === cardName)) {
                    wishlist.add(cardName);
                }
            });
        }

        // Import trade binder if present
        if (data.tradeBinder && Array.isArray(data.tradeBinder)) {
            data.tradeBinder.forEach(cardName => {
                if (allCards.some(c => c.name === cardName)) {
                    tradeBinder.add(cardName);
                }
            });
        }

        saveToStorage();
        return { success: true, count: importCount };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Import collection from CSV
function importCollectionFromCSV(csvString, mode = 'merge') {
    try {
        const lines = csvString.trim().split('\n');
        if (lines.length < 2) {
            return { success: false, error: 'Arquivo CSV vazio ou inválido' };
        }

        // Skip header row
        const header = lines[0].toLowerCase();
        const hasHeader = header.includes('card') || header.includes('name') || header.includes('quantity');

        if (mode === 'replace') {
            collection.clear();
        }

        let importCount = 0;
        let skippedCount = 0;
        const now = new Date().toISOString();
        const startIndex = hasHeader ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse CSV line (handling quoted values)
            const values = parseCSVLine(line);
            if (values.length < 1) continue;

            const cardName = values[0].replace(/^"|"$/g, '').trim();
            const qty = parseInt(values[1]) || 1;

            // Verify card exists
            const cardExists = allCards.some(c => c.name.toLowerCase() === cardName.toLowerCase());
            if (!cardExists) {
                skippedCount++;
                continue;
            }

            // Find exact card name (case-insensitive match)
            const exactCard = allCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
            const exactName = exactCard ? exactCard.name : cardName;

            if (mode === 'merge') {
                const existing = collection.get(exactName);
                const currentQty = existing ? (typeof existing === 'object' ? existing.qty : existing) : 0;
                collection.set(exactName, { qty: currentQty + qty, addedAt: now });
            } else {
                collection.set(exactName, { qty, addedAt: now });
            }
            importCount++;
        }

        saveToStorage();
        return { success: true, count: importCount, skipped: skippedCount };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Parse a CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());

    return values;
}

// Open export/import modal
function openExportImportModal() {
    const modal = document.getElementById('export-import-modal');
    if (modal) {
        modal.classList.remove('hidden');
        updateExportPreview();
        trapFocus(modal);
    }
}

// Close export/import modal
function closeExportImportModal() {
    const modal = document.getElementById('export-import-modal');
    if (modal) {
        modal.classList.add('hidden');
        releaseFocusTrap();
    }
}

// Update export preview
function updateExportPreview() {
    const previewEl = document.getElementById('export-preview');
    if (!previewEl) return;

    const uniqueCards = collection.size;
    const totalCards = getTotalCardCount();
    const wishlistCount = wishlist.size;
    const tradeCount = tradeBinder.size;

    previewEl.innerHTML = `
        <div class="export-stats">
            <div class="export-stat">
                <span class="export-stat-value">${uniqueCards}</span>
                <span class="export-stat-label">Cards únicos</span>
            </div>
            <div class="export-stat">
                <span class="export-stat-value">${totalCards}</span>
                <span class="export-stat-label">Total de cópias</span>
            </div>
            <div class="export-stat">
                <span class="export-stat-value">${wishlistCount}</span>
                <span class="export-stat-label">Na wishlist</span>
            </div>
            <div class="export-stat">
                <span class="export-stat-value">${tradeCount}</span>
                <span class="export-stat-label">Para trade</span>
            </div>
        </div>
    `;
}

// Handle export
function handleExport(format) {
    const btn = document.querySelector(`[data-export="${format}"]`);
    setButtonLoading(btn, true, 'Exportando...');

    setTimeout(() => {
        try {
            let data, filename, mimeType;

            if (format === 'json') {
                data = exportCollectionToJSON();
                filename = `sorcery-collection-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else {
                data = exportCollectionToCSV();
                filename = `sorcery-collection-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
            }

            downloadFile(data, filename, mimeType);
            showSuccessToast(`Coleção exportada como ${format.toUpperCase()}!`);
        } catch (error) {
            showErrorToast(error.message, 'Erro na exportação');
        } finally {
            setButtonLoading(btn, false);
        }
    }, 100);
}

// Handle import file selection
async function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const importModeEl = document.getElementById('import-mode');
    const mode = importModeEl?.value || 'merge';

    // Confirm before replacing collection
    if (mode === 'replace' && collection.size > 0) {
        const confirmed = await showConfirmDialog({
            title: 'Substituir coleção',
            message: `Isso irá APAGAR sua coleção atual (${collection.size} cards) e substituir pelo arquivo importado. Esta ação não pode ser desfeita.`,
            confirmText: 'Substituir',
            cancelText: 'Cancelar',
            type: 'warning',
            icon: 'alert-triangle'
        });

        if (!confirmed) {
            // Reset file input
            e.target.value = '';
            return;
        }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        const isJSON = file.name.endsWith('.json') || content.trim().startsWith('{');

        let result;
        if (isJSON) {
            result = importCollectionFromJSON(content, mode);
        } else {
            result = importCollectionFromCSV(content, mode);
        }

        if (result.success) {
            updateStats();
            renderCards();
            renderCollection();
            updateExportPreview();

            let message = `${result.count} cards importados!`;
            if (result.skipped > 0) {
                message += ` (${result.skipped} ignorados)`;
            }
            showSuccessToast(message, 'Importação completa');
        } else {
            showErrorToast(result.error, 'Erro na importação');
        }

        // Reset file input
        e.target.value = '';
    };

    reader.onerror = () => {
        showErrorToast('Não foi possível ler o arquivo', 'Erro');
    };

    reader.readAsText(file);
}

// Setup export/import (legacy support + new modal)
function setupExportImport() {
    // Legacy buttons (if they exist)
    document.getElementById('export-json-btn')?.addEventListener('click', () => handleExport('json'));
    document.getElementById('export-csv-btn')?.addEventListener('click', () => handleExport('csv'));

    document.getElementById('import-btn')?.addEventListener('click', () => {
        document.getElementById('import-file')?.click();
    });

    document.getElementById('import-file')?.addEventListener('change', handleImportFile);

    // New modal buttons
    document.getElementById('open-export-import-btn')?.addEventListener('click', openExportImportModal);

    document.querySelector('#export-import-modal .close-modal')?.addEventListener('click', closeExportImportModal);

    document.getElementById('export-import-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'export-import-modal') closeExportImportModal();
    });

    document.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', () => handleExport(btn.dataset.export));
    });

    document.getElementById('import-file-btn')?.addEventListener('click', () => {
        document.getElementById('import-file-input')?.click();
    });

    document.getElementById('import-file-input')?.addEventListener('change', handleImportFile);

    // Drag and drop support
    const dropzone = document.getElementById('import-dropzone');
    if (dropzone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('drag-over');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
                    // Trigger file input change handler
                    const input = document.getElementById('import-file-input');
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    input.dispatchEvent(new Event('change'));
                } else {
                    showWarningToast('Apenas arquivos .json e .csv são aceitos');
                }
            }
        });
    }
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Enhanced stats with rarity
function updateStatsEnhanced() {
    updateStats();

    // Rarity distribution
    const rarities = ['Unique', 'Exceptional', 'Elite', 'Ordinary'];
    const rarityProgressEl = document.getElementById('rarity-progress');
    const isVariantsMode = _statsMode === 'variants';

    if (rarityProgressEl && allCards.length > 0) {
        const rarityDistribution = { Unique: 0, Exceptional: 0, Elite: 0, Ordinary: 0 };
        let totalCount = 0;

        if (isVariantsMode) {
            // Modo Variantes: contar cada variante
            const tracker = window.variantTracker;
            if (tracker && tracker.collection) {
                for (const normalizedName in tracker.collection) {
                    const cardName = normalizedName.replace(/_/g, ' ');
                    const card = allCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
                    if (!card) continue;

                    const variants = tracker.collection[normalizedName];
                    const variantCount = Object.keys(variants).length;
                    totalCount += variantCount;

                    const rarity = card.guardian?.rarity || 'Ordinary';
                    if (rarityDistribution.hasOwnProperty(rarity)) {
                        rarityDistribution[rarity] += variantCount;
                    }
                }
            }
        } else {
            // Modo Ilustrações: cada card único conta uma vez
            totalCount = collection.size;
            collection.forEach((data, cardName) => {
                const card = allCards.find(c => c.name === cardName);
                if (!card) return;

                const rarity = card.guardian?.rarity || 'Ordinary';
                if (rarityDistribution.hasOwnProperty(rarity)) {
                    rarityDistribution[rarity]++;
                }
            });
        }

        rarityProgressEl.innerHTML = rarities
            .filter(rarity => rarityDistribution[rarity] > 0)
            .map(rarity => {
                const count = rarityDistribution[rarity];
                const percent = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : 0;

                return `
                <div class="progress-item">
                    <span class="progress-label">${rarity}</span>
                    <div class="progress-bar">
                        <div class="progress-fill default" style="width: ${percent}%"></div>
                    </div>
                    <span class="progress-text">${count} (${percent}%)</span>
                </div>
            `;
            }).join('');
    }
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        renderRecommendedDecks();
        setupExportImport();
    }, 2000); // Wait for cards to load
});

// Toggle Trade Binder
function toggleTradeBinder(cardName) {
    // Check login for adding (not for removing)
    if (!tradeBinder.has(cardName)) {
        if (typeof nocoDBService !== 'undefined' && !nocoDBService.isLoggedIn()) {
            showNotification('Faça login para adicionar cards às trocas');
            openAuthModal('login');
            return;
        }
    }

    const wasInTrade = tradeBinder.has(cardName);
    if (wasInTrade) {
        tradeBinder.delete(cardName);
        showToast(`${cardName} removido das trocas`, 'info');
    } else {
        tradeBinder.add(cardName);
        showSuccessToast(`${cardName} adicionado às trocas`);
    }
    saveToStorage();
    renderCards();
    openCardModal(cardName); // Refresh modal
}

// Render Trade Binder
function renderTradeBinder() {
    const loginPrompt = document.getElementById('trade-login-prompt');
    const tradeContent = document.getElementById('trade-content');
    const isLoggedIn = checkUserLoggedIn();

    if (!isLoggedIn) {
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (tradeContent) tradeContent.classList.add('hidden');
        refreshIcons();
        return;
    }

    if (loginPrompt) loginPrompt.classList.add('hidden');
    if (tradeContent) tradeContent.classList.remove('hidden');

    // Render offering tab
    renderTradeOffering();

    // Render looking for tab
    renderTradeLookingFor();

    // Update overall stats
    updateTradeStats();

    refreshIcons();
}

// Render offering cards
function renderTradeOffering() {
    const tradeGridEl = document.getElementById('trade-grid');
    if (!tradeGridEl) return;

    const search = document.getElementById('trade-search')?.value.toLowerCase() || '';

    const tradeCards = allCards.filter(card => {
        if (!tradeBinder.has(card.name)) return false;
        if (search && !card.name.toLowerCase().includes(search)) return false;
        return true;
    });

    if (tradeCards.length === 0) {
        tradeGridEl.innerHTML = createEmptyState({
            icon: 'repeat',
            title: 'Nenhuma carta para troca',
            description: 'Para adicionar cartas que você oferece para troca: abra qualquer carta no catálogo e clique no botão "Adicionar para Troca" no modal.',
            actions: [
                { label: 'Ir ao Catálogo', onclick: "showView('cards')", primary: true, icon: 'layers' }
            ]
        });
        return;
    }

    tradeGridEl.innerHTML = tradeCards.map(card => createCardHTML(card)).join('');

    tradeGridEl.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', () => {
            const cardName = el.dataset.cardName;
            openCardModal(cardName);
        });
    });
}

// Render looking for cards
function renderTradeLookingFor() {
    const wantGridEl = document.getElementById('trade-want-grid');
    if (!wantGridEl) return;

    const search = document.getElementById('trade-want-search')?.value.toLowerCase() || '';

    const wantCards = allCards.filter(card => {
        if (!tradeWants.has(card.name)) return false;
        if (search && !card.name.toLowerCase().includes(search)) return false;
        return true;
    });

    if (wantCards.length === 0) {
        wantGridEl.innerHTML = createEmptyState({
            icon: 'search',
            title: 'O que você procura?',
            description: 'Adicione cartas que você está procurando para facilitar trocas com outros jogadores. Você pode importar diretamente da sua wishlist!',
            actions: [
                { label: 'Importar da Wishlist', onclick: "importWishlistToWants()", primary: true, icon: 'heart' },
                { label: 'Buscar Cartas', onclick: "showView('cards')", primary: false, icon: 'search' }
            ]
        });
        return;
    }

    wantGridEl.innerHTML = wantCards.map(card => {
        const html = createCardHTML(card);
        // Add remove button
        return html.replace('class="card-item"', 'class="card-item in-trade-wants"');
    }).join('');

    wantGridEl.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', () => {
            const cardName = el.dataset.cardName;
            openCardModal(cardName);
        });
    });
}

// Update trade stats
function updateTradeStats() {
    // Offering stats
    const tradeCountEl = document.getElementById('trade-count');
    const tradeValueEl = document.getElementById('trade-value');

    if (tradeCountEl) {
        tradeCountEl.textContent = `${tradeBinder.size} cartas`;
    }

    if (tradeValueEl && typeof priceService !== 'undefined') {
        let totalValue = 0;
        tradeBinder.forEach(cardName => {
            const card = allCards.find(c => c.name === cardName);
            if (card) {
                const price = priceService.getPrice(cardName) || priceService.getEstimatedPrice(card);
                totalValue += price;
            }
        });
        tradeValueEl.textContent = priceService.formatPrice(totalValue);
    }

    // Looking for stats
    const wantCountEl = document.getElementById('trade-want-count');
    const wantValueEl = document.getElementById('trade-want-value');

    if (wantCountEl) {
        wantCountEl.textContent = `${tradeWants.size} cartas`;
    }

    if (wantValueEl && typeof priceService !== 'undefined') {
        let totalValue = 0;
        tradeWants.forEach(cardName => {
            const card = allCards.find(c => c.name === cardName);
            if (card) {
                const price = priceService.getPrice(cardName) || priceService.getEstimatedPrice(card);
                totalValue += price;
            }
        });
        wantValueEl.textContent = priceService.formatPrice(totalValue);
    }
}

// Switch trade tab
function switchTradeTab(tabName) {
    document.querySelectorAll('.trade-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    document.querySelectorAll('.trade-tab-content').forEach(content => {
        const contentId = `trade-tab-${content.id.replace('trade-tab-', '')}`;
        content.classList.toggle('active', content.id === `trade-tab-${tabName}`);
        content.classList.toggle('hidden', content.id !== `trade-tab-${tabName}`);
    });

    refreshIcons();
}
window.switchTradeTab = switchTradeTab;

// Add wishlist items to trade wants
function addWishlistToTradeWants() {
    if (wishlist.size === 0) {
        showWarningToast('Sua wishlist está vazia');
        return;
    }

    let added = 0;
    wishlist.forEach(cardName => {
        if (!tradeWants.has(cardName)) {
            tradeWants.add(cardName);
            added++;
        }
    });

    saveTradeWants();
    renderTradeLookingFor();
    updateTradeStats();
    refreshIcons();

    if (added > 0) {
        showSuccessToast(`${added} cartas importadas da wishlist`);
    } else {
        showInfoToast('Todas as cartas já estavam na lista');
    }
}
window.addWishlistToTradeWants = addWishlistToTradeWants;

// Toggle trade wants
function toggleTradeWant(cardName) {
    if (tradeWants.has(cardName)) {
        tradeWants.delete(cardName);
    } else {
        tradeWants.add(cardName);
    }
    saveTradeWants();
    renderTradeLookingFor();
    updateTradeStats();
}
window.toggleTradeWant = toggleTradeWant;

// Save trade wants to storage
function saveTradeWants() {
    const userId = getCurrentUserId();
    if (userId) {
        localStorage.setItem(`sorcery-trade-wants-${userId}`, JSON.stringify([...tradeWants]));
    }
}

// Load trade wants from storage
function loadTradeWants() {
    const userId = getCurrentUserId();
    if (userId) {
        try {
            const stored = localStorage.getItem(`sorcery-trade-wants-${userId}`);
            if (stored) {
                tradeWants = new Set(JSON.parse(stored));
            }
        } catch (e) {
            tradeWants = new Set();
        }
    }
}

// Generate shareable trade link
function generateTradeLink() {
    if (tradeBinder.size === 0 && tradeWants.size === 0) {
        showWarningToast('Adicione cartas para gerar o link');
        return;
    }

    // Create trade data object
    const tradeData = {
        offering: Array.from(tradeBinder),
        looking: Array.from(tradeWants),
        user: getCurrentUserName() || 'Jogador',
        date: new Date().toISOString().split('T')[0]
    };

    // Encode to base64
    const encoded = btoa(encodeURIComponent(JSON.stringify(tradeData)));

    // Create URL
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?trade=${encoded}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        showSuccessToast('Link copiado para a área de transferência!', 'Trade Link');
    }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccessToast('Link copiado para a área de transferência!', 'Trade Link');
    });
}
window.generateTradeLink = generateTradeLink;

// Parse trade link and show trade view
function handleTradeLink(encoded) {
    try {
        const decoded = JSON.parse(decodeURIComponent(atob(encoded)));

        if (!decoded.offering || !decoded.looking) {
            throw new Error('Invalid trade data');
        }

        showTradePreview(decoded);
    } catch (e) {
        console.error('Invalid trade link:', e);
        showErrorToast('Link de trade inválido');
    }
}

// Show trade preview modal
function showTradePreview(tradeData) {
    // Create modal content
    const offeringCards = tradeData.offering.map(name => {
        const card = allCards.find(c => c.name === name);
        return card ? card : { name, guardian: {} };
    });

    const lookingCards = tradeData.looking.map(name => {
        const card = allCards.find(c => c.name === name);
        return card ? card : { name, guardian: {} };
    });

    // Show in an alert or modal
    const message = `
Trade de ${tradeData.user} (${tradeData.date})

Oferecendo (${offeringCards.length} cartas):
${offeringCards.slice(0, 10).map(c => `- ${c.name}`).join('\n')}
${offeringCards.length > 10 ? `... e mais ${offeringCards.length - 10}` : ''}

Procurando (${lookingCards.length} cartas):
${lookingCards.slice(0, 10).map(c => `- ${c.name}`).join('\n')}
${lookingCards.length > 10 ? `... e mais ${lookingCards.length - 10}` : ''}
    `;

    showInfoToast(`Trade de ${tradeData.user}: ${tradeData.offering.length} oferecendo, ${tradeData.looking.length} procurando`, 'Trade Recebido');

    // Store for reference
    window.currentTradePreview = tradeData;
}

// Get current user name
function getCurrentUserName() {
    if (typeof nocoDBService !== 'undefined' && nocoDBService.currentUser) {
        return nocoDBService.currentUser.display_name || nocoDBService.currentUser.email?.split('@')[0];
    }
    return null;
}

// Handle Price Import
function handlePriceImport(e) {
    const file = e.target.files[0];
    if (file && typeof priceService !== 'undefined') {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = priceService.importPricesFromCSV(event.target.result);
                document.getElementById('price-import-status').innerHTML =
                    `<span class="success">Successfully imported ${imported} prices!</span>`;
                updateStatsWithPrices();
            } catch (error) {
                document.getElementById('price-import-status').innerHTML =
                    `<span class="error">Error: ${error.message}</span>`;
            }
        };
        reader.readAsText(file);
    }
    // Reset input
    e.target.value = '';
}

// Update Stats with Prices
function updateStatsWithPrices() {
    const loginPrompt = document.getElementById('stats-login-prompt');
    const statsContent = document.getElementById('stats-content');
    const isLoggedIn = checkUserLoggedIn();

    if (!isLoggedIn) {
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (statsContent) statsContent.classList.add('hidden');
        refreshIcons();
        return;
    }

    if (loginPrompt) loginPrompt.classList.add('hidden');
    if (statsContent) statsContent.classList.remove('hidden');

    // Call the original stats update
    updateStats();
    updateStatsEnhanced();

    // Calculate collection value using same method as Collection page (getCardTotalValue)
    if (typeof priceService !== 'undefined' && allCards.length > 0) {
        // Calculate total value using getCardTotalValue (same as Collection page)
        let combinedValue = 0;
        let cardCount = 0;
        const topCards = [];

        collection.forEach((data, cardName) => {
            const cardValue = getCardTotalValue(cardName);
            combinedValue += cardValue;
            cardCount++;

            if (cardValue > 0) {
                const qty = data.qty || 1;
                topCards.push({
                    name: cardName,
                    qty: qty,
                    total: cardValue,
                    price: cardValue,
                    value: cardValue
                });
            }
        });

        // Sort top cards by value descending
        topCards.sort((a, b) => b.value - a.value);

        const avgValue = cardCount > 0 ? combinedValue / cardCount : 0;

        document.getElementById('collection-value').textContent = '$' + combinedValue.toFixed(2);
        document.getElementById('average-card-value').textContent = '$' + avgValue.toFixed(2);

        // BRL values
        const brlRate = priceService.getBRLRate();
        const brlValueEl = document.getElementById('collection-value-brl');
        if (brlValueEl) {
            brlValueEl.textContent = 'R$ ' + (combinedValue * brlRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }

        // Calculate wishlist value
        let wishlistValue = 0;
        wishlist.forEach(cardName => {
            const card = allCards.find(c => c.name === cardName);
            if (card) {
                const price = priceService.getPrice(cardName) || priceService.getEstimatedPrice(card);
                wishlistValue += price;
            }
        });
        document.getElementById('wishlist-value').textContent = priceService.formatPrice(wishlistValue);

        // Render most valuable cards in collection
        renderValuableCards(topCards.slice(0, 10));

        // Value Tracking Integration - build valueData object for compatibility
        const valueData = {
            combinedValue: combinedValue,
            averageCardValue: avgValue,
            topCards: topCards.slice(0, 10)
        };
        if (typeof valueTracker !== 'undefined') {
            updateValueTracking(valueData, brlRate);
        }
    }

    // Render achievements
    renderAchievements();

    // Render investment analytics
    renderInvestmentAnalytics();
}

// Value Tracking Integration
function updateValueTracking(valueData, brlRate) {
    // Take a snapshot if needed
    valueTracker.takeSnapshot(valueData, brlRate);

    // Get current period from active button
    const activePeriod = document.querySelector('.period-btn.active');
    const days = activePeriod ? parseInt(activePeriod.dataset.period) : 7;

    // Get trend data
    const trend = valueTracker.getValueTrend(days);

    // Update trend indicator
    const trendIndicator = document.getElementById('value-trend-indicator');
    const trendPercent = document.getElementById('value-trend-percent');

    if (trendIndicator && trendPercent) {
        trendIndicator.className = 'value-trend ' + trend.trend;

        const icon = trend.trend === 'up' ? 'trending-up' : trend.trend === 'down' ? 'trending-down' : 'minus';
        const sign = trend.changePercent >= 0 ? '+' : '';

        trendIndicator.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span>${sign}${trend.changePercent.toFixed(1)}%</span>
        `;

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            refreshIcons();
        }
    }

    // Update change amount
    const changeAmountEl = document.getElementById('value-change-amount');
    const changePeriodEl = document.getElementById('value-change-period');

    if (changeAmountEl) {
        if (trend.noData) {
            // Sem dados suficientes para comparação
            changeAmountEl.textContent = 'N/A';
            changeAmountEl.style.color = 'var(--text-secondary)';
        } else {
            const sign = trend.change >= 0 ? '+' : '';
            changeAmountEl.textContent = sign + '$' + trend.change.toFixed(2);
            changeAmountEl.style.color = trend.trend === 'up' ? '#22c55e' : trend.trend === 'down' ? '#ef4444' : 'inherit';
        }
    }

    if (changePeriodEl) {
        changePeriodEl.textContent = `Change (${days}D)`;
    }

    // Render sparkline chart
    renderValueSparkline(days);

    // Check for price changes
    renderPriceChanges();
}

// Render Value Sparkline Chart
function renderValueSparkline(days = 7) {
    const chartData = valueTracker.getChartData(days);

    if (chartData.length < 2) {
        // Not enough data yet
        return;
    }

    const chartRenderer = new ValueChartRenderer('value-sparkline-chart');
    chartRenderer.drawSparkline(chartData, {
        color: '#d4af37',
        fillColor: 'rgba(212, 175, 55, 0.1)',
        lineWidth: 2
    });
}

// Render Price Changes
function renderPriceChanges() {
    const changes = valueTracker.detectPriceChanges(0.20); // 20% threshold
    const section = document.getElementById('price-alerts-section');
    const list = document.getElementById('price-changes-list');

    if (!section || !list) return;

    if (changes.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    list.innerHTML = changes.slice(0, 5).map(change => `
        <div class="price-change-item ${change.trend}">
            <div class="price-change-card">
                <span class="card-name">${change.name}</span>
            </div>
            <div class="price-change-values">
                <span class="price-change-old">$${change.previousValue.toFixed(2)}</span>
                <span class="price-change-new">$${change.currentValue.toFixed(2)}</span>
                <span class="price-change-percent ${change.trend}">
                    ${change.changePercent >= 0 ? '+' : ''}${change.changePercent.toFixed(1)}%
                </span>
            </div>
        </div>
    `).join('');
}

// Period selector event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const days = parseInt(this.dataset.period);
            if (typeof valueTracker !== 'undefined') {
                const trend = valueTracker.getValueTrend(days);

                // Update trend indicator
                const trendIndicator = document.getElementById('value-trend-indicator');
                if (trendIndicator) {
                    trendIndicator.className = 'value-trend ' + trend.trend;
                    const icon = trend.trend === 'up' ? 'trending-up' : trend.trend === 'down' ? 'trending-down' : 'minus';
                    const sign = trend.changePercent >= 0 ? '+' : '';
                    trendIndicator.innerHTML = `
                        <i data-lucide="${icon}"></i>
                        <span>${sign}${trend.changePercent.toFixed(1)}%</span>
                    `;
                    refreshIcons();
                }

                // Update change amount
                const changeAmountEl = document.getElementById('value-change-amount');
                const changePeriodEl = document.getElementById('value-change-period');
                if (changeAmountEl) {
                    const sign = trend.change >= 0 ? '+' : '';
                    changeAmountEl.textContent = sign + '$' + trend.change.toFixed(2);
                    changeAmountEl.style.color = trend.trend === 'up' ? '#22c55e' : trend.trend === 'down' ? '#ef4444' : 'inherit';
                }
                if (changePeriodEl) {
                    changePeriodEl.textContent = `Change (${days}D)`;
                }

                // Redraw chart
                renderValueSparkline(days);
            }
        });
    });
});

// Render Most Valuable Cards
function renderValuableCards(topCards) {
    const listEl = document.getElementById('valuable-cards-list');
    if (!listEl) return;

    if (!topCards || topCards.length === 0) {
        listEl.innerHTML = '<p class="empty-message">Add cards to your collection to see your most valuable cards.</p>';
        return;
    }

    listEl.innerHTML = topCards.map((card, index) => {
        const sourceClass = card.source === 'market' ? 'market-price' : 'estimated-price';
        return `
            <div class="valuable-card-item">
                <span class="rank">#${index + 1}</span>
                <span class="card-name">${card.name}</span>
                <span class="card-qty">x${card.qty}</span>
                <span class="card-price ${sourceClass}">${priceService.formatPrice(card.total)}</span>
            </div>
        `;
    }).join('');
}

// Render Investment Analytics
function renderInvestmentAnalytics() {
    if (typeof priceService === 'undefined' || allCards.length === 0) return;

    // Calculate value by set
    const setValues = {};
    const sets = ['Alpha', 'Beta', 'Arthurian Legends', 'Gothic', 'Dragonlord', 'Promotional'];
    sets.forEach(setName => {
        setValues[setName] = { value: 0, count: 0 };
    });

    // Calculate value by rarity
    const rarityValues = {
        'Unique': { value: 0, count: 0 },
        'Exceptional': { value: 0, count: 0 },
        'Elite': { value: 0, count: 0 },
        'Ordinary': { value: 0, count: 0 }
    };

    // Calculate value by element
    const elementValues = {
        'Fire': { value: 0, count: 0 },
        'Water': { value: 0, count: 0 },
        'Earth': { value: 0, count: 0 },
        'Air': { value: 0, count: 0 },
        'Neutral': { value: 0, count: 0 }
    };

    // Calculate value by type
    const typeValues = {
        'Avatar': { value: 0, count: 0 },
        'Minion': { value: 0, count: 0 },
        'Magic': { value: 0, count: 0 },
        'Artifact': { value: 0, count: 0 },
        'Aura': { value: 0, count: 0 },
        'Site': { value: 0, count: 0 }
    };

    // Analyze collection - cada card único conta UMA vez
    // Valor total usa getCardTotalValue (mesmo cálculo do valor da coleção)
    const tracker = window.variantTracker;

    collection.forEach((data, cardName) => {
        const card = allCards.find(c => c.name === cardName);
        if (!card) return;

        // Valor total do card (inclui todas as cópias/variantes)
        const cardTotalValue = getCardTotalValue(cardName);

        // Determinar o SET principal do card
        let primarySet = null;

        // Tentar obter o set real do VariantTracker
        if (tracker) {
            try {
                const cardVariants = tracker.getCollectionByCard(cardName);
                if (cardVariants && cardVariants.variants) {
                    // Pegar o set da primeira variante encontrada
                    const firstVariant = Object.values(cardVariants.variants)[0];
                    if (firstVariant && firstVariant.set) {
                        primarySet = firstVariant.set;
                    }
                }
            } catch (e) {
                // Ignore errors
            }
        }

        // Fallback: usar o set mais recente (último do array)
        if (!primarySet && card.sets && card.sets.length > 0) {
            primarySet = card.sets[card.sets.length - 1].name;
        }

        // By set - contar 1 card único, valor total
        if (primarySet && setValues[primarySet]) {
            setValues[primarySet].value += cardTotalValue;
            setValues[primarySet].count++;
        }

        // By rarity - 1 card único
        const rarity = card.guardian?.rarity || 'Ordinary';
        if (rarityValues[rarity]) {
            rarityValues[rarity].value += cardTotalValue;
            rarityValues[rarity].count++;
        }

        // By element - 1 card único
        const elements = card.elements || '';
        if (elements.includes('Fire')) { elementValues['Fire'].value += cardTotalValue; elementValues['Fire'].count++; }
        else if (elements.includes('Water')) { elementValues['Water'].value += cardTotalValue; elementValues['Water'].count++; }
        else if (elements.includes('Earth')) { elementValues['Earth'].value += cardTotalValue; elementValues['Earth'].count++; }
        else if (elements.includes('Air')) { elementValues['Air'].value += cardTotalValue; elementValues['Air'].count++; }
        else { elementValues['Neutral'].value += cardTotalValue; elementValues['Neutral'].count++; }

        // By type - 1 card único
        const type = card.guardian?.type || 'Minion';
        if (typeValues[type]) {
            typeValues[type].value += cardTotalValue;
            typeValues[type].count++;
        }
    });

    // Render by set
    const setEl = document.getElementById('analytics-by-set');
    if (setEl) {
        setEl.innerHTML = Object.entries(setValues)
            .filter(([_, data]) => data.count > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([name, data]) => `
                <div class="analytics-item">
                    <span class="analytics-name">${name}</span>
                    <span class="analytics-count">${data.count} cards</span>
                    <span class="analytics-value">${priceService.formatPrice(data.value)}</span>
                </div>
            `).join('') || '<p class="empty-message">No data</p>';
    }

    // Render by rarity
    const rarityEl = document.getElementById('analytics-by-rarity');
    if (rarityEl) {
        const rarityOrder = ['Unique', 'Exceptional', 'Elite', 'Ordinary'];
        rarityEl.innerHTML = rarityOrder
            .filter(r => rarityValues[r].count > 0)
            .map(rarity => {
                const data = rarityValues[rarity];
                return `
                    <div class="analytics-item rarity-${rarity.toLowerCase()}">
                        <span class="analytics-name">${rarity}</span>
                        <span class="analytics-count">${data.count} cards</span>
                        <span class="analytics-value">${priceService.formatPrice(data.value)}</span>
                    </div>
                `;
            }).join('') || '<p class="empty-message">No data</p>';
    }

    // Render by element
    const elementEl = document.getElementById('analytics-by-element');
    if (elementEl) {
        elementEl.innerHTML = Object.entries(elementValues)
            .filter(([_, data]) => data.count > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([name, data]) => `
                <div class="analytics-item element-${name.toLowerCase()}">
                    <span class="analytics-name">${name}</span>
                    <span class="analytics-count">${data.count} cards</span>
                    <span class="analytics-value">${priceService.formatPrice(data.value)}</span>
                </div>
            `).join('') || '<p class="empty-message">No data</p>';
    }

    // Render by type
    const typeEl = document.getElementById('analytics-by-type');
    if (typeEl) {
        typeEl.innerHTML = Object.entries(typeValues)
            .filter(([_, data]) => data.count > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([name, data]) => `
                <div class="analytics-item">
                    <span class="analytics-name">${name}</span>
                    <span class="analytics-count">${data.count} cards</span>
                    <span class="analytics-value">${priceService.formatPrice(data.value)}</span>
                </div>
            `).join('') || '<p class="empty-message">No data</p>';
    }
}

// Render Achievements
function renderAchievements() {
    if (typeof gamification === 'undefined') return;

    const stats = gamification.calculateStats(
        allCards,
        collection,
        wishlist,
        tradeBinder,
        decks,
        ownedPrecons,
        typeof priceService !== 'undefined' ? priceService : null
    );

    // Check for newly unlocked achievements
    const newlyUnlocked = gamification.checkAchievements(stats);

    // Show notification for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
        showAchievementNotification(newlyUnlocked[0]);
    }

    // Update summary
    const summary = gamification.getSummary();
    const countEl = document.getElementById('achievement-count');
    if (countEl) {
        countEl.textContent = `${summary.unlocked}/${summary.total}`;
    }

    // Render achievements grid
    const gridEl = document.getElementById('achievements-grid');
    if (!gridEl) return;

    const allAchievements = gamification.getAllAchievements(stats);

    // Sort: unlocked first, then by progress
    allAchievements.sort((a, b) => {
        if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
        return b.progress - a.progress;
    });

    gridEl.innerHTML = allAchievements.map(achievement => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
            ${!achievement.unlocked ? `
                <div class="achievement-progress">
                    <div class="achievement-progress-fill" style="width: ${achievement.progress}%"></div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <span class="achievement-icon">${achievement.icon}</span>
            <div>
                <div class="achievement-notification-title">Achievement Unlocked!</div>
                <div class="achievement-notification-name">${achievement.name}</div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Export functions for debugging
window.sorceryApp = {
    allCards,
    collection,
    wishlist,
    tradeBinder,
    decks,
    ownedPrecons,
    PRECONS,
    priceService: typeof priceService !== 'undefined' ? priceService : null,
    collectionTracker: typeof collectionTracker !== 'undefined' ? collectionTracker : null,
    gamification: typeof gamification !== 'undefined' ? gamification : null
};

// ============================================
// AUTHENTICATION & CLOUD SYNC
// ============================================

// Current modal card for photo upload
let currentPhotoCardName = null;

// Initialize auth UI on page load
function initAuthUI() {
    updateAuthUI();
    setupAuthEventListeners();
}

// Update auth UI based on login state
function updateAuthUI() {
    const loggedOutSection = document.getElementById('user-logged-out');
    const loggedInSection = document.getElementById('user-logged-in');
    const userDisplayName = document.getElementById('user-display-name');

    if (nocoDBService.isLoggedIn()) {
        loggedOutSection.classList.add('hidden');
        loggedInSection.classList.remove('hidden');
        const user = nocoDBService.getCurrentUser();
        userDisplayName.textContent = user.displayName || user.email;

        // Update avatar display with element SVG
        if (typeof updateAllAvatarDisplays === 'function') {
            updateAllAvatarDisplays();
        }
    } else {
        loggedOutSection.classList.remove('hidden');
        loggedInSection.classList.add('hidden');
    }
}

// Refresh current view (especially for views that require login)
function refreshCurrentView() {
    // Reload user-specific data first
    loadFromStorage();
    loadUserDecks();

    const activeView = document.querySelector('.view.active');
    if (!activeView) return;

    const viewName = activeView.id.replace('-view', '');

    // Re-render views that have login-dependent content
    switch (viewName) {
        case 'collection':
            renderCollection();
            break;
        case 'wishlist':
            renderWishlist();
            break;
        case 'stats':
            updateStatsWithPrices();
            break;
        case 'trade':
            renderTradeBinder();
            break;
    }

    // Also update stats
    updateStats();
}

// Setup auth event listeners
function setupAuthEventListeners() {
    // Login button
    document.getElementById('login-btn')?.addEventListener('click', () => {
        openAuthModal('login');
    });

    // Register button
    document.getElementById('register-btn')?.addEventListener('click', () => {
        openAuthModal('register');
    });

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        // Get user ID before logging out (for cleanup)
        const userId = getCurrentUserId();

        // Perform logout
        nocoDBService.logout();
        updateAuthUI();

        // Clean up all user-specific data
        cleanupUserDataOnLogout(userId, true);

        // Dispatch logout event for community services
        document.dispatchEvent(new CustomEvent('userLoggedOut'));

        // Refresh current view to show login prompt
        refreshCurrentView();
        showNotification('Sessão encerrada');
    });

    // Sync button
    document.getElementById('sync-btn')?.addEventListener('click', () => {
        openSyncModal();
    });

    // Auth modal tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            switchAuthTab(tabType);
        });
    });

    // Auth modal close
    document.querySelector('#auth-modal .close-modal')?.addEventListener('click', () => {
        closeModal('auth-modal');
    });

    // Sync modal close
    document.querySelector('#sync-modal .close-modal')?.addEventListener('click', () => {
        closeModal('sync-modal');
    });

    // Photo modal close
    document.querySelector('#photo-modal .close-modal')?.addEventListener('click', () => {
        closeModal('photo-modal');
    });

    // Profile modal close
    document.querySelector('#profile-modal .close-modal')?.addEventListener('click', () => {
        closeModal('profile-modal');
    });

    // Deck detail modal close
    document.querySelector('#deck-detail-modal .close-modal')?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal('deck-detail-modal');
    });

    // Deck detail modal - close on backdrop click
    document.getElementById('deck-detail-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'deck-detail-modal') {
            closeModal('deck-detail-modal');
        }
    });

    // Helper: adiciona handlers de click e touch para modais (mobile-safe)
    function addModalBackdropHandler(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Handler para click e touch
        const handler = (e) => {
            e.stopPropagation();
            if (e.target.id === modalId) {
                closeModal(modalId);
            }
        };

        modal.addEventListener('click', handler);
        modal.addEventListener('touchend', handler, { passive: false });
    }

    // Aplicar handlers aos modais de autenticação e perfil
    addModalBackdropHandler('auth-modal');
    addModalBackdropHandler('forgot-password-modal');
    addModalBackdropHandler('reset-password-modal');
    addModalBackdropHandler('sync-modal');
    addModalBackdropHandler('profile-modal');

    // Card modal - handler especial (usa closeCardModal)
    const cardModal = document.getElementById('card-modal');
    if (cardModal) {
        const cardHandler = (e) => {
            e.stopPropagation();
            if (e.target.id === 'card-modal') {
                closeCardModal();
            }
        };
        cardModal.addEventListener('click', cardHandler);
        cardModal.addEventListener('touchend', cardHandler, { passive: false });
    }

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('deck-detail-modal');
            closeCardModal();
            closeModal('auth-modal');
            closeModal('forgot-password-modal');
            closeModal('reset-password-modal');
            closeModal('sync-modal');
            closeModal('profile-modal');
        }
    });

    // Profile bio character counter
    document.getElementById('profile-bio')?.addEventListener('input', (e) => {
        document.getElementById('bio-char-count').textContent = e.target.value.length;
    });

    // Profile public toggle - enable/disable share section
    document.getElementById('profile-is-public')?.addEventListener('change', (e) => {
        const shareSection = document.getElementById('profile-share-section');
        if (shareSection) {
            if (e.target.checked) {
                shareSection.classList.remove('share-disabled');
            } else {
                shareSection.classList.add('share-disabled');
            }
        }
    });

    // Save profile button
    document.getElementById('save-profile-btn')?.addEventListener('click', saveProfileSettings);

    // Copy profile URL button
    document.getElementById('copy-profile-url')?.addEventListener('click', copyProfileUrl);

    // Profile sync buttons (inside profile modal)
    document.getElementById('profile-sync-upload')?.addEventListener('click', handleProfileSyncUpload);
    document.getElementById('profile-sync-download')?.addEventListener('click', handleProfileSyncDownload);

    // Login form
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);

    // Register form
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);

    // Sync upload button
    document.getElementById('sync-upload-btn')?.addEventListener('click', handleSyncUpload);

    // Sync download button
    document.getElementById('sync-download-btn')?.addEventListener('click', handleSyncDownload);

    // Add photo button in card modal
    document.getElementById('add-photo-btn')?.addEventListener('click', () => {
        const cardName = document.getElementById('modal-card-name')?.textContent;
        if (cardName) {
            openPhotoModal(cardName);
        }
    });

    // Photo capture button
    document.getElementById('capture-photo-btn')?.addEventListener('click', () => {
        document.getElementById('photo-file-input')?.click();
    });

    // Photo upload button
    document.getElementById('upload-photo-btn')?.addEventListener('click', () => {
        document.getElementById('photo-file-input')?.click();
    });

    // Photo file input
    document.getElementById('photo-file-input')?.addEventListener('change', handlePhotoSelect);

    // Save photo button
    document.getElementById('save-photo-btn')?.addEventListener('click', handleSavePhoto);

    // Terms checkbox - enable/disable accept button
    document.getElementById('terms-checkbox')?.addEventListener('change', (e) => {
        const acceptBtn = document.getElementById('terms-accept-btn');
        if (acceptBtn) {
            acceptBtn.disabled = !e.target.checked;
        }
    });
}

// Open auth modal
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    switchAuthTab(tab);

    // Clear previous errors
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('register-error').classList.add('hidden');

    // Trap focus for accessibility
    requestAnimationFrame(() => trapFocus(modal));
}

// Switch auth tab
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Show loading state
    setButtonLoading(submitBtn, true, 'Entrando...');
    errorEl.classList.add('hidden');

    try {
        const user = await nocoDBService.login(email, password);
        closeModal('auth-modal');

        // IMPORTANT: Load user's collection from localStorage after login
        // This is needed because loadFromStorage was called before login (when userId was null)
        loadFromStorage();

        updateAuthUI();
        refreshCurrentView();
        showSuccessToast('Bem-vindo de volta!', 'Login realizado');

        // Initialize profile
        if (typeof profileService !== 'undefined') {
            await profileService.loadProfileFromCloud(user.id);
            if (!profileService.getProfile()) {
                await profileService.initProfile(user.id, user.displayName);
            }
        }

        // Dispatch login event for community services
        document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user } }));

        // Auto-fetch collection from cloud if local is empty (new browser/device)
        console.log('[Login] Collection size after login:', collection.size);
        if (collection.size === 0) {
            console.log('[Login] Collection empty, fetching from cloud...');
            fetchCollectionFromCloudSilently();
        }

        // Clear form
        e.target.reset();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
        showErrorToast(error.message, 'Falha no login');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const errorEl = document.getElementById('register-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Helper function to show error
    const showError = (msg) => {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    };

    // Validate display name (3-30 chars, valid characters)
    if (!name || name.length < 3) {
        showError('Nome deve ter no mínimo 3 caracteres');
        return;
    }
    if (name.length > 30) {
        showError('Nome deve ter no máximo 30 caracteres');
        return;
    }
    if (!/^[a-zA-Z0-9À-ÿ _-]+$/.test(name)) {
        showError('Nome contém caracteres inválidos');
        return;
    }

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Formato de email inválido');
        return;
    }

    // Validate password strength
    const passwordErrors = [];
    if (password.length < 8) passwordErrors.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) passwordErrors.push('uma letra maiúscula');
    if (!/[a-z]/.test(password)) passwordErrors.push('uma letra minúscula');
    if (!/[0-9]/.test(password)) passwordErrors.push('um número');

    if (passwordErrors.length > 0) {
        showError('Senha deve conter: ' + passwordErrors.join(', '));
        return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
        showError('As senhas não coincidem');
        return;
    }

    // Show loading state
    setButtonLoading(submitBtn, true, 'Criando conta...');
    errorEl.classList.add('hidden');

    try {
        const user = await nocoDBService.register(email, password, name);
        closeModal('auth-modal');
        updateAuthUI();
        refreshCurrentView();
        showSuccessToast('Bem-vindo ao Sorcery Contested Realm Brasil!', 'Conta criada');

        // Initialize profile for new user
        if (typeof profileService !== 'undefined') {
            await profileService.initProfile(user.id, name);
        }

        // Dispatch login event for community services
        document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user } }));

        // Clear form
        e.target.reset();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
        showErrorToast(error.message, 'Falha no registro');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Open Forgot Password Modal
function openForgotPasswordModal() {
    closeModal('auth-modal');
    const modal = document.getElementById('forgot-password-modal');
    modal.classList.remove('hidden');

    // Clear previous messages
    document.getElementById('forgot-error').classList.add('hidden');
    document.getElementById('forgot-success').classList.add('hidden');
    document.getElementById('forgot-email').value = '';
}

// Close Forgot Password Modal
function closeForgotPasswordModal() {
    closeModal('forgot-password-modal');
    openAuthModal('login');
}

// Handle Forgot Password - Envia email real via Cloudflare Worker
async function handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById('forgot-email').value.trim();
    const errorEl = document.getElementById('forgot-error');
    const successEl = document.getElementById('forgot-success');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Hide previous messages
    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    if (!email) {
        errorEl.textContent = 'Digite seu email.';
        errorEl.classList.remove('hidden');
        return;
    }

    setButtonLoading(submitBtn, true);

    try {
        // Chamar endpoint do Worker para enviar email
        const proxyUrl = typeof SecurityConfig !== 'undefined'
            ? SecurityConfig.api.proxyUrl
            : 'https://sorcery-api-proxy.pedro-4e6.workers.dev';

        const response = await fetch(`${proxyUrl}/auth/send-reset-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao enviar email');
        }

        // Sempre mostrar sucesso (segurança - não revelar se email existe)
        successEl.innerHTML = `
            <strong>Email enviado!</strong><br>
            Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.<br>
            <small>Verifique também sua pasta de spam.</small>
        `;
        successEl.classList.remove('hidden');

    } catch (error) {
        console.error('Forgot password error:', error);
        errorEl.textContent = error.message || 'Erro ao processar solicitação. Tente novamente.';
        errorEl.classList.remove('hidden');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ============================================
// RESET PASSWORD (via link do email)
// ============================================

// Abrir modal de reset de senha
function openResetPasswordModal(email, token) {
    const modal = document.getElementById('reset-password-modal');
    if (!modal) return;

    // Preencher campos hidden
    document.getElementById('reset-email').value = email || '';
    document.getElementById('reset-token').value = token || '';

    // Limpar campos e mensagens
    document.getElementById('reset-new-password').value = '';
    document.getElementById('reset-confirm-password').value = '';
    document.getElementById('reset-password-error').classList.add('hidden');
    document.getElementById('reset-password-success').classList.add('hidden');

    modal.classList.remove('hidden');
    refreshIcons();
}
window.openResetPasswordModal = openResetPasswordModal;

// Fechar modal de reset de senha
function closeResetPasswordModal() {
    closeModal('reset-password-modal');
    // Limpar hash da URL
    if (window.location.hash.startsWith('#reset-password')) {
        history.pushState(null, '', window.location.pathname);
    }
}
window.closeResetPasswordModal = closeResetPasswordModal;

// Handler para reset de senha
async function handleResetPassword(e) {
    e.preventDefault();

    const email = document.getElementById('reset-email').value;
    const token = document.getElementById('reset-token').value;
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const errorEl = document.getElementById('reset-password-error');
    const successEl = document.getElementById('reset-password-success');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    // Validar senhas
    if (newPassword !== confirmPassword) {
        errorEl.textContent = 'As senhas não coincidem.';
        errorEl.classList.remove('hidden');
        return;
    }

    // Validar requisitos da senha
    if (typeof validatePassword === 'function') {
        const validation = validatePassword(newPassword);
        if (!validation.valid) {
            errorEl.textContent = validation.errors.join(', ');
            errorEl.classList.remove('hidden');
            return;
        }
    }

    setButtonLoading(submitBtn, true);

    try {
        // Gerar hash da nova senha
        const salt = generateSalt();
        const passwordHash = await hashPasswordSecure(newPassword, salt);

        // Chamar endpoint do Worker
        const proxyUrl = typeof SecurityConfig !== 'undefined'
            ? SecurityConfig.api.proxyUrl
            : 'https://sorcery-api-proxy.pedro-4e6.workers.dev';

        const response = await fetch(`${proxyUrl}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                token,
                passwordHash,
                passwordSalt: salt
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Erro ao redefinir senha');
        }

        // Sucesso!
        successEl.innerHTML = `
            <strong>Senha redefinida com sucesso!</strong><br>
            Você já pode fazer login com sua nova senha.
        `;
        successEl.classList.remove('hidden');

        // Após 2 segundos, fechar modal e abrir login
        setTimeout(() => {
            closeResetPasswordModal();
            openAuthModal('login');
            showSuccessToast('Senha redefinida! Faça login.', 'Sucesso');
        }, 2000);

    } catch (error) {
        console.error('Reset password error:', error);
        errorEl.textContent = error.message || 'Erro ao redefinir senha. O link pode ter expirado.';
        errorEl.classList.remove('hidden');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Verificar se URL tem parâmetros de reset de senha
function checkResetPasswordURL() {
    const hash = window.location.hash;
    if (!hash.startsWith('#reset-password')) return;

    // Extrair parâmetros
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
        // Verificar se token é válido antes de abrir modal
        verifyResetToken(email, token);
    }
}

// Verificar token de reset
async function verifyResetToken(email, token) {
    try {
        const proxyUrl = typeof SecurityConfig !== 'undefined'
            ? SecurityConfig.api.proxyUrl
            : 'https://sorcery-api-proxy.pedro-4e6.workers.dev';

        const response = await fetch(`${proxyUrl}/auth/verify-reset-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, token })
        });

        const data = await response.json();

        if (data.valid) {
            openResetPasswordModal(email, token);
        } else {
            showErrorToast(data.error || 'Link inválido ou expirado', 'Erro');
            // Limpar URL
            history.pushState(null, '', window.location.pathname);
        }
    } catch (error) {
        console.error('Verify token error:', error);
        showErrorToast('Erro ao verificar link', 'Erro');
    }
}

// Setup reset password form
document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.getElementById('reset-password-form');
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetPassword);
    }

    // Verificar URL ao carregar
    checkResetPasswordURL();
});

// Também verificar quando hash muda
window.addEventListener('hashchange', () => {
    checkResetPasswordURL();
});

// Setup forgot password form
document.addEventListener('DOMContentLoaded', () => {
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
});

// Open sync modal
function openSyncModal() {
    if (!nocoDBService.isLoggedIn()) {
        showNotification('Faça login primeiro para sincronizar sua coleção');
        openAuthModal('login');
        return;
    }

    const modal = document.getElementById('sync-modal');
    modal.classList.remove('hidden');

    // Update last sync time (per-user)
    const userId = getCurrentUserId();
    const lastSync = userId ? localStorage.getItem(`sorcery-last-sync-${userId}`) : null;
    const lastSyncEl = document.getElementById('last-sync-time');
    if (lastSync) {
        lastSyncEl.textContent = new Date(lastSync).toLocaleString();
    } else {
        lastSyncEl.textContent = 'Nunca';
    }

    // Hide status and result summary
    document.getElementById('sync-status').classList.add('hidden');
    document.getElementById('sync-result-summary')?.classList.add('hidden');

    // Update strategy hint
    updateSyncStrategyHint();

    // Refresh icons
    refreshIcons(modal);

    // Trap focus for accessibility
    requestAnimationFrame(() => trapFocus(modal));
}

// Update sync strategy hint based on selected strategy
function updateSyncStrategyHint() {
    const strategySelect = document.getElementById('sync-strategy');
    const hintEl = document.getElementById('sync-strategy-hint');
    if (!strategySelect || !hintEl) return;

    const hints = {
        'newest_wins': 'Quando houver conflitos, a versao mais recente sera mantida.',
        'local_wins': 'Dados locais sempre sobreescrevem os dados da nuvem.',
        'cloud_wins': 'Dados da nuvem sempre sobreescrevem os dados locais.',
        'merge_add': 'Combina os dados, mantendo a maior quantidade de cada carta.',
        'manual': 'Voce sera perguntado sobre cada conflito individualmente.'
    };

    hintEl.textContent = hints[strategySelect.value] || hints['newest_wins'];
}

// Initialize sync strategy selector
document.addEventListener('DOMContentLoaded', () => {
    const strategySelect = document.getElementById('sync-strategy');
    if (strategySelect) {
        strategySelect.addEventListener('change', updateSyncStrategyHint);
    }
});

// Silently fetch collection from cloud when local is empty (new browser/device)
async function fetchCollectionFromCloudSilently() {
    console.log('[AutoSync] fetchCollectionFromCloudSilently called');
    console.log('[AutoSync] currentUser:', nocoDBService.currentUser);

    if (!nocoDBService.currentUser) {
        console.log('[AutoSync] No currentUser, aborting');
        return;
    }

    try {
        console.log('[AutoSync] Fetching from cloud...');
        const cloudRecords = await nocoDBService.getCloudCollection();
        console.log('[AutoSync] Cloud records received:', cloudRecords?.length || 0);

        if (cloudRecords && cloudRecords.length > 0) {
            const now = new Date().toISOString();

            // Populate local collection
            cloudRecords.forEach(record => {
                collection.set(record.card_name, {
                    qty: record.quantity || 1,
                    addedAt: record.created_at || now
                });
            });

            // Save to localStorage
            saveToStorage();

            // Update UI
            updateStats();
            refreshCurrentView();

            console.log(`[AutoSync] Loaded ${cloudRecords.length} cards from cloud`);
            showSuccessToast(`${cloudRecords.length} cartas carregadas da nuvem`, 'Coleção sincronizada');
        } else {
            console.log('[AutoSync] No records in cloud');
        }
    } catch (error) {
        console.error('[AutoSync] Failed to fetch from cloud:', error);
        // Silent fail - don't bother user
    }
}

// Handle sync upload (Smart Sync)
async function handleSyncUpload() {
    const uploadBtn = document.getElementById('sync-upload-btn');
    const statusEl = document.getElementById('sync-status');
    const messageEl = statusEl.querySelector('.sync-message');
    const resultSummary = document.getElementById('sync-result-summary');

    // Get selected strategy
    const strategySelect = document.getElementById('sync-strategy');
    const strategy = strategySelect?.value || 'newest_wins';

    setButtonLoading(uploadBtn, true, 'Sincronizando...');
    statusEl.classList.remove('hidden');
    resultSummary?.classList.add('hidden');
    messageEl.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Analisando diferencas...';
    refreshIcons(messageEl);

    try {
        // Check if SmartSyncService is available
        if (typeof smartSyncService === 'undefined' || !smartSyncService) {
            throw new Error('Servico de sincronizacao nao disponivel');
        }

        // Convert collection Map to object format
        const collectionObj = {};
        collection.forEach((data, cardName) => {
            collectionObj[cardName] = {
                qty: typeof data === 'object' ? data.qty : data,
                addedAt: typeof data === 'object' ? data.addedAt : new Date().toISOString(),
                updatedAt: typeof data === 'object' ? (data.updatedAt || data.addedAt) : new Date().toISOString()
            };
        });

        // Use Smart Sync
        messageEl.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Sincronizando com a nuvem...';
        refreshIcons(messageEl);

        const result = await smartSyncService.syncCollection(collectionObj, {
            strategy: strategy,
            deleteRemoved: true
        });

        if (result.success) {
            // Save last sync time (per-user)
            const userId = getCurrentUserId();
            if (userId) {
                localStorage.setItem(`sorcery-last-sync-${userId}`, new Date().toISOString());
            }

            // Update result summary
            if (resultSummary) {
                document.getElementById('sync-stat-added').textContent = result.stats.added;
                document.getElementById('sync-stat-updated').textContent = result.stats.updated;
                document.getElementById('sync-stat-deleted').textContent = result.stats.deleted;
                document.getElementById('sync-stat-unchanged').textContent = result.stats.unchanged;
                resultSummary.classList.remove('hidden');
            }

            messageEl.innerHTML = '<i data-lucide="check-circle"></i> Sincronizacao completa!';
            refreshIcons(messageEl);

            // Show success message
            const totalChanges = result.stats.added + result.stats.updated + result.stats.deleted;
            if (totalChanges > 0) {
                showSuccessToast(
                    `${result.stats.added} adicionadas, ${result.stats.updated} atualizadas, ${result.stats.deleted} removidas`,
                    'Sync completo'
                );
            } else {
                showSuccessToast('Nenhuma alteracao necessaria', 'Tudo sincronizado');
            }
        } else if (result.conflicts && result.conflicts.length > 0) {
            // Show conflict resolution modal
            messageEl.innerHTML = `<i data-lucide="alert-triangle"></i> ${result.conflicts.length} conflitos encontrados`;
            refreshIcons(messageEl);
            showConflictResolutionModal(result.conflicts);
        } else {
            throw new Error(result.message || 'Erro desconhecido na sincronizacao');
        }
    } catch (error) {
        console.error('[Sync] Upload error:', error);
        messageEl.innerHTML = `<i data-lucide="x-circle"></i> Erro: ${escapeHtml(error.message)}`;
        refreshIcons(messageEl);
        showErrorToast(error.message, 'Erro no sync');
    } finally {
        setButtonLoading(uploadBtn, false);
    }
}

// Handle sync download (Smart Sync with Merge)
async function handleSyncDownload() {
    const downloadBtn = document.getElementById('sync-download-btn');
    const statusEl = document.getElementById('sync-status');
    const messageEl = statusEl.querySelector('.sync-message');
    const resultSummary = document.getElementById('sync-result-summary');

    // Get selected strategy
    const strategySelect = document.getElementById('sync-strategy');
    const strategy = strategySelect?.value || 'cloud_wins';

    setButtonLoading(downloadBtn, true, 'Baixando...');
    statusEl.classList.remove('hidden');
    resultSummary?.classList.add('hidden');
    messageEl.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Baixando da nuvem...';
    refreshIcons(messageEl);

    try {
        // Convert current collection to object
        const currentCollectionObj = {};
        collection.forEach((data, cardName) => {
            currentCollectionObj[cardName] = {
                qty: typeof data === 'object' ? data.qty : data,
                addedAt: typeof data === 'object' ? data.addedAt : new Date().toISOString()
            };
        });

        let mergedCollection;

        // Use Smart Sync if available, otherwise fallback
        if (typeof smartSyncService !== 'undefined' && smartSyncService) {
            messageEl.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Mesclando dados...';
            refreshIcons(messageEl);

            mergedCollection = await smartSyncService.downloadAndMerge(currentCollectionObj, strategy);
        } else {
            // Fallback to direct download (no merge)
            const data = await nocoDBService.fullDownloadFromCloud();
            mergedCollection = {};
            const now = new Date().toISOString();
            Object.entries(data.collection).forEach(([cardName, cardData]) => {
                if (typeof cardData === 'number') {
                    mergedCollection[cardName] = { qty: cardData, addedAt: now };
                } else if (typeof cardData === 'object') {
                    mergedCollection[cardName] = { qty: cardData.qty || 1, addedAt: cardData.addedAt || now };
                } else {
                    mergedCollection[cardName] = { qty: 1, addedAt: now };
                }
            });
        }

        // Calculate stats
        const prevCount = collection.size;
        const newCount = Object.keys(mergedCollection).length;

        // Update local collection
        collection = new Map();
        Object.entries(mergedCollection).forEach(([cardName, cardData]) => {
            collection.set(cardName, {
                qty: cardData.qty || 1,
                addedAt: cardData.addedAt || new Date().toISOString()
            });
        });

        // Also download wishlist, trade binder, and decks
        const data = await nocoDBService.fullDownloadFromCloud();

        // Update wishlist
        wishlist.clear();
        data.wishlist.forEach(cardName => {
            wishlist.add(cardName);
        });

        // Update trade binder
        tradeBinder.clear();
        data.tradeBinder.forEach(cardName => {
            tradeBinder.add(cardName);
        });

        // Update decks
        decks = data.decks;

        // Save locally
        saveLocalData();

        // Re-render
        renderCards();
        renderCollection();
        renderWishlist();
        renderTradeBinder();
        renderUserDecks();
        updateStats();

        // Save last sync time (per-user)
        const userId = getCurrentUserId();
        if (userId) {
            localStorage.setItem(`sorcery-last-sync-${userId}`, new Date().toISOString());
        }

        // Update result summary
        if (resultSummary) {
            const added = Math.max(0, newCount - prevCount);
            const updated = Math.min(prevCount, newCount);
            document.getElementById('sync-stat-added').textContent = added;
            document.getElementById('sync-stat-updated').textContent = updated;
            document.getElementById('sync-stat-deleted').textContent = 0;
            document.getElementById('sync-stat-unchanged').textContent = Math.max(0, prevCount - updated);
            resultSummary.classList.remove('hidden');
        }

        messageEl.innerHTML = '<i data-lucide="check-circle"></i> Download completo!';
        refreshIcons(messageEl);

        showSuccessToast(`${newCount} cartas carregadas da nuvem!`, 'Download completo');
    } catch (error) {
        console.error('[Sync] Download error:', error);
        messageEl.innerHTML = `<i data-lucide="x-circle"></i> Erro: ${escapeHtml(error.message)}`;
        refreshIcons(messageEl);
        showErrorToast(error.message, 'Erro no download');
    } finally {
        setButtonLoading(downloadBtn, false);
    }
}

// Resolve conflict UI handler
async function resolveConflictUI(cardName, resolution) {
    if (!smartSyncService) return;

    try {
        const result = await smartSyncService.resolveConflict(cardName, resolution);

        // Remove the conflict item from UI
        const conflictItem = document.querySelector(`.conflict-item[data-card="${cardName}"]`);
        if (conflictItem) {
            conflictItem.remove();
        }

        // Check if all conflicts resolved
        const remainingConflicts = document.querySelectorAll('.conflict-item');
        if (remainingConflicts.length === 0) {
            closeConflictModal();
            showSuccessToast('Todos os conflitos resolvidos!', 'Sync completo');

            // Update last sync time
            const userId = getCurrentUserId();
            if (userId) {
                localStorage.setItem(`sorcery-last-sync-${userId}`, new Date().toISOString());
            }
        }
    } catch (error) {
        showErrorToast(error.message, 'Erro ao resolver conflito');
    }
}

// Resolve all conflicts with same resolution
async function resolveAllConflicts(resolution) {
    if (!smartSyncService) return;

    const conflicts = smartSyncService.getConflicts();
    let resolved = 0;

    for (const conflict of conflicts) {
        try {
            await smartSyncService.resolveConflict(conflict.cardName, resolution);
            resolved++;
        } catch (error) {
            console.error('[Sync] Failed to resolve:', conflict.cardName, error);
        }
    }

    closeConflictModal();

    if (resolved > 0) {
        showSuccessToast(`${resolved} conflitos resolvidos!`, 'Sync completo');

        // Update last sync time
        const userId = getCurrentUserId();
        if (userId) {
            localStorage.setItem(`sorcery-last-sync-${userId}`, new Date().toISOString());
        }
    }
}

// Open photo modal
function openPhotoModal(cardName) {
    if (!nocoDBService.isLoggedIn()) {
        showNotification('Please login to upload photos');
        openAuthModal('login');
        return;
    }

    currentPhotoCardName = cardName;
    const modal = document.getElementById('photo-modal');
    document.getElementById('photo-card-name').textContent = cardName;

    // Reset form
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('photo-placeholder').style.display = 'flex';
    document.getElementById('photo-condition').value = 'NM';
    document.getElementById('photo-notes').value = '';
    document.getElementById('save-photo-btn').disabled = true;

    // Load existing photos
    loadCardPhotos(cardName);

    modal.classList.remove('hidden');
}

// Handle photo selection
function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const preview = document.getElementById('photo-preview');
        preview.src = event.target.result;
        preview.classList.remove('hidden');
        document.getElementById('photo-placeholder').style.display = 'none';
        document.getElementById('save-photo-btn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Handle save photo
async function handleSavePhoto() {
    const preview = document.getElementById('photo-preview');
    const condition = document.getElementById('photo-condition').value;
    const notes = document.getElementById('photo-notes').value;

    if (!preview.src || !currentPhotoCardName) return;

    try {
        // Compress and convert to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = async () => {
            // Resize to max 800px
            const maxSize = 800;
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

            try {
                await nocoDBService.uploadCardPhoto(
                    currentPhotoCardName,
                    compressedBase64,
                    condition,
                    notes
                );

                showNotification('Photo saved!');
                loadCardPhotos(currentPhotoCardName);

                // Reset form
                preview.classList.add('hidden');
                document.getElementById('photo-placeholder').style.display = 'flex';
                document.getElementById('save-photo-btn').disabled = true;
                document.getElementById('photo-file-input').value = '';
            } catch (error) {
                showNotification('Error saving photo: ' + error.message);
            }
        };

        img.src = preview.src;
    } catch (error) {
        showNotification('Error processing photo');
    }
}

// Load existing card photos
async function loadCardPhotos(cardName) {
    const gridEl = document.getElementById('card-photos-grid');
    gridEl.innerHTML = '<p class="loading-text">Carregando fotos...</p>';

    try {
        const photos = await nocoDBService.getCardPhotos(cardName);

        if (photos.length === 0) {
            gridEl.innerHTML = '<p class="empty-message">Nenhuma foto ainda</p>';
            return;
        }

        gridEl.innerHTML = photos.map(photo => `
            <div class="photo-thumb" data-id="${photo.Id}">
                <img src="${photo.image_base64}" alt="Foto do card">
                <button class="delete-photo" onclick="deleteCardPhoto(${photo.Id})">&times;</button>
            </div>
        `).join('');
    } catch (error) {
        gridEl.innerHTML = '<p class="error-message">Erro ao carregar fotos</p>';
    }
}

// Delete card photo
async function deleteCardPhoto(photoId) {
    if (!confirm('Excluir esta foto?')) return;

    try {
        await nocoDBService.deleteCardPhoto(photoId);
        showNotification('Photo deleted');
        if (currentPhotoCardName) {
            loadCardPhotos(currentPhotoCardName);
        }
    } catch (error) {
        showNotification('Error deleting photo: ' + error.message);
    }
}

// Close modal helper
function closeModal(modalId) {
    document.getElementById(modalId)?.classList.add('hidden');
    releaseFocusTrap();
}

// Show notification
function showNotification(message, duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Save local data helper (uses per-user storage)
function saveLocalData() {
    saveToStorage();
}

// Auth UI is now initialized in main DOMContentLoaded handler

// ============================================
// COMMUNITY FEATURES INTEGRATION
// ============================================

// Initialize Marketplace View
function initMarketplaceView() {
    if (typeof tradeMarketplace !== 'undefined') {
        tradeMarketplace.loadListings();
    }
}

// Initialize Forum View
function initForumView() {
    if (typeof forumService !== 'undefined') {
        forumService.init();
    }
}

// Open modal helper (generic)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Focus first focusable element for accessibility
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
        refreshIcons(modal);
    }
}

// Show Terms Modal - optionally with callback after acceptance
let termsAcceptCallback = null;

function showTermsModal(callback = null) {
    termsAcceptCallback = callback;
    openModal('terms-modal');
}

// Accept Terms
async function acceptTerms() {
    if (typeof nocoDBService !== 'undefined' && nocoDBService.isLoggedIn()) {
        try {
            await nocoDBService.acceptTerms();
            closeModal('terms-modal');
            showSuccessToast('Termos aceitos com sucesso!');

            // Execute callback if provided
            if (termsAcceptCallback && typeof termsAcceptCallback === 'function') {
                termsAcceptCallback();
                termsAcceptCallback = null;
            }
        } catch (error) {
            showErrorToast('Erro ao aceitar termos: ' + error.message);
        }
    } else {
        closeModal('terms-modal');
        // Still execute callback for non-logged in users viewing terms
        if (termsAcceptCallback && typeof termsAcceptCallback === 'function') {
            termsAcceptCallback();
            termsAcceptCallback = null;
        }
    }
}

// Show Avatar Selector Modal
function showAvatarModal() {
    if (typeof renderAvatarSelector === 'function') {
        const container = document.getElementById('avatar-selector-grid');
        if (container) {
            container.innerHTML = renderAvatarSelector();
            refreshIcons(container);
        }
    }
    openModal('avatar-modal');
}

// Select Avatar
function selectAvatar(avatarId) {
    // Highlight selected
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.querySelector(`.avatar-option[data-id="${avatarId}"]`)?.classList.add('selected');
    document.getElementById('avatar-modal').dataset.selectedId = avatarId;
}

// Save Selected Avatar
async function saveSelectedAvatar() {
    const modal = document.getElementById('avatar-modal');
    const avatarId = parseInt(modal?.dataset.selectedId);

    if (!avatarId) {
        showWarningToast('Selecione um avatar');
        return;
    }

    if (typeof updateUserAvatar === 'function') {
        try {
            await updateUserAvatar(avatarId);
            closeModal('avatar-modal');
            showSuccessToast('Avatar atualizado!');

            // Refresh profile if visible
            const profileView = document.getElementById('profile-view');
            if (profileView && !profileView.classList.contains('hidden')) {
                renderProfileView();
            }
        } catch (error) {
            showErrorToast('Erro ao atualizar avatar: ' + error.message);
        }
    }
}

// Open Inbox Modal
function openInbox() {
    if (!nocoDBService?.isLoggedIn()) {
        showWarningToast('Faça login para acessar mensagens');
        return;
    }
    openModal('inbox-modal');
    if (typeof messagingService !== 'undefined') {
        messagingService.loadInbox();
    }
}

// Open Compose Message Modal - wrapper uses global function from messaging-service.js
// The global openComposeMessage(recipientId, subject, replyToId) is defined in messaging-service.js
// This wrapper provides a compatible interface

// View Message
function viewMessage(messageId, source = 'inbox') {
    if (typeof messagingService !== 'undefined') {
        messagingService.openMessage(messageId, source);
    }
}

// Reply to Message - triggers the reply button in the message view modal
function replyToMessage() {
    const replyBtn = document.getElementById('message-reply-btn');
    if (replyBtn) {
        replyBtn.click();
    }
}

// Send Message
async function sendMessage() {
    if (typeof sendComposedMessage === 'function') {
        await sendComposedMessage();
    }
}

// Delete Message
async function deleteMessage(messageId, source = 'inbox') {
    if (typeof messagingService !== 'undefined') {
        await messagingService.deleteMessage(messageId, source);
    }
}

// Open Vote Modal
function openVoteModal(userId, userName) {
    if (typeof reputationService !== 'undefined') {
        reputationService.openVoteModal(userId, userName);
    }
}

// Open User Profile Modal
async function openUserProfileModal(userId) {
    const modal = document.getElementById('user-profile-modal');
    const content = document.getElementById('user-profile-content');
    if (!modal || !content) return;

    content.innerHTML = '<div class="loading-spinner"></div>';
    modal.classList.remove('hidden');

    try {
        // Get user data
        const user = await nocoDBService.getUserById(userId);
        if (!user) {
            content.innerHTML = '<p>Usuário não encontrado</p>';
            return;
        }

        // Get reputation
        const reputation = await nocoDBService.getUserReputation(userId);
        const badge = getReputationBadge(reputation?.score || 0);

        // Check if current user can vote
        const currentUser = nocoDBService.getCurrentUser();
        const isOwnProfile = currentUser && String(currentUser.id) === String(userId);
        let canVoteInfo = '';
        let voteButton = '';

        if (!isOwnProfile && currentUser) {
            const canVoteResult = await nocoDBService.canVoteFor(userId);
            if (canVoteResult.canVote) {
                voteButton = `
                    <button class="btn btn-primary btn-full" onclick="closeModal('user-profile-modal'); openVoteModal('${userId}', '${escapeHtml(user.displayName)}')">
                        <i data-lucide="thumbs-up"></i>
                        Avaliar Usuário
                    </button>
                `;
            } else if (canVoteResult.reason === 'cooldown') {
                canVoteInfo = `<p class="user-profile-vote-info">Você já votou neste usuário. Aguarde ${canVoteResult.daysLeft} dias.</p>`;
            }
        } else if (!currentUser) {
            canVoteInfo = `<p class="user-profile-vote-info">Faça login para avaliar usuários.</p>`;
        }

        content.innerHTML = `
            <div class="user-profile-card">
                <div class="user-profile-header">
                    ${renderAvatar(user.avatarId || 1, 'large')}
                    <div class="user-profile-name">${escapeHtml(user.displayName)}</div>
                    <div class="user-profile-badge reputation-${badge.class}">
                        <i data-lucide="${badge.icon}"></i>
                        ${badge.name}
                    </div>
                </div>

                <div class="user-profile-stats">
                    <div class="user-profile-stat">
                        <div class="user-profile-stat-value score">${reputation?.score || 0}</div>
                        <div class="user-profile-stat-label">Score</div>
                    </div>
                    <div class="user-profile-stat">
                        <div class="user-profile-stat-value positive">${reputation?.positives || 0}</div>
                        <div class="user-profile-stat-label">Positivos</div>
                    </div>
                    <div class="user-profile-stat">
                        <div class="user-profile-stat-value negative">${reputation?.negatives || 0}</div>
                        <div class="user-profile-stat-label">Negativos</div>
                    </div>
                </div>

                <div class="user-profile-actions">
                    ${voteButton}
                    ${canVoteInfo}
                </div>
            </div>
        `;

        refreshIcons(content);
    } catch (error) {
        console.error('Error loading user profile:', error);
        content.innerHTML = '<p>Erro ao carregar perfil</p>';
    }
}

// Submit Vote
async function submitVote() {
    if (typeof reputationService !== 'undefined') {
        await reputationService.submitVote();
    }
}

// Create Forum Post
async function createForumPost() {
    if (typeof forumService !== 'undefined') {
        await forumService.createPost();
    }
}

// View Forum Post
function viewForumPost(postId) {
    if (typeof forumService !== 'undefined') {
        forumService.openPost(postId);
    }
}

// Add Forum Comment
async function addForumComment() {
    if (typeof forumService !== 'undefined') {
        await forumService.addComment();
    }
}

// Filter Forum by Category
function filterForumCategory(category) {
    if (typeof forumService !== 'undefined') {
        forumService.setFilter('category', category);
    }
}

// Search Forum
function searchForum() {
    if (typeof forumService !== 'undefined') {
        const query = document.getElementById('forum-search-input')?.value || '';
        forumService.search(query);
    }
}

// Back to Forum List
function backToForumList() {
    if (typeof switchForumView === 'function') {
        switchForumView('list');
    }
}

// Publish Trade Listing
async function publishTradeListing(cardName, type) {
    if (typeof tradeMarketplace !== 'undefined') {
        await tradeMarketplace.publishListing(cardName, type);
    }
}

// Remove Trade Listing
async function removeTradeListing(listingId) {
    if (typeof tradeMarketplace !== 'undefined') {
        await tradeMarketplace.deactivateListing(listingId);
    }
}

// Filter Marketplace - reloads listings with current filters
function filterMarketplace() {
    if (typeof tradeMarketplace !== 'undefined') {
        tradeMarketplace.loadListings();
    }
}

// Contact Seller/Buyer - wrapper for marketplace contact
function contactTrader(userId, cardName) {
    if (typeof tradeMarketplace !== 'undefined') {
        tradeMarketplace.contactUser(userId, cardName);
    } else if (typeof openComposeMessage === 'function') {
        openComposeMessage(userId, `Interesse em: ${cardName}`);
    }
}

// Update Unread Messages Badge
function updateUnreadBadge(count) {
    const badge = document.getElementById('inbox-unread-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Initialize Community Services on Login
function initCommunityServices() {
    if (typeof messagingService !== 'undefined' && nocoDBService?.isLoggedIn()) {
        messagingService.startPolling();
    }
}

// Cleanup Community Services on Logout
function cleanupCommunityServices() {
    if (typeof messagingService !== 'undefined') {
        messagingService.stopPolling();
    }
    updateUnreadBadge(0);
}

// Check if user accepted terms
async function checkTermsAcceptance() {
    if (nocoDBService?.isLoggedIn()) {
        const user = nocoDBService.getCurrentUser();
        // Check termsAccepted (boolean from login response)
        if (user && !user.termsAccepted) {
            showTermsModal();
        }
    }
}

// Render Profile View with Avatar
function renderProfileView() {
    const container = document.getElementById('profile-content');
    if (!container) return;

    const user = nocoDBService?.getCurrentUser();
    if (!user) {
        container.innerHTML = '<p>Faça login para ver seu perfil</p>';
        return;
    }

    const avatarHtml = typeof renderAvatar === 'function'
        ? renderAvatar(user.avatarId || 1, 'large')
        : '<div class="avatar-placeholder"></div>';

    const reputationHtml = typeof reputationService !== 'undefined'
        ? reputationService.renderBadge(user.reputation_score || 0, 'large')
        : '';

    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar" onclick="showAvatarModal()">
                ${avatarHtml}
                <div class="avatar-edit-overlay">
                    <i data-lucide="edit-2"></i>
                </div>
            </div>
            <div class="profile-info">
                <h2>${escapeHtml(user.displayName || user.username)}</h2>
                <p class="profile-username">@${escapeHtml(user.username)}</p>
                ${reputationHtml}
            </div>
        </div>
        <div class="profile-actions">
            <button class="btn btn-secondary" onclick="showAvatarModal()">
                <i data-lucide="user-circle"></i> Alterar Avatar
            </button>
            <button class="btn btn-secondary" onclick="showView('settings')">
                <i data-lucide="settings"></i> Configurações
            </button>
        </div>
    `;

    refreshIcons(container);
}

// Add event listeners for community features
document.addEventListener('DOMContentLoaded', () => {
    // Check terms on login
    document.addEventListener('userLoggedIn', () => {
        checkTermsAcceptance();
        initCommunityServices();

        // Reload price services with new user context
        // SEGURANCA: Garante que dados do usuário anterior não vazem
        if (typeof valueTracker !== 'undefined' && valueTracker.reload) {
            valueTracker.reload();
        }
        if (typeof window.variantTracker !== 'undefined') {
            window.variantTracker = new VariantTracker();
        }
        // Trigger price refresh in background
        if (typeof tcgcsvPriceService !== 'undefined') {
            tcgcsvPriceService.fetchAllPrices(false);
        }
        console.log('[Login] Services reloaded for new user');
    });

    document.addEventListener('userLoggedOut', () => {
        cleanupCommunityServices();
    });

    // Vote type selection
    document.querySelectorAll('.vote-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vote-type-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Forum search with debounce
    const forumSearchInput = document.getElementById('forum-search-input');
    if (forumSearchInput) {
        forumSearchInput.addEventListener('input', debounce(searchForum, 300));
    }

    // Marketplace filters
    const marketplaceFilters = document.querySelectorAll('.marketplace-filter');
    marketplaceFilters.forEach(filter => {
        filter.addEventListener('change', filterMarketplace);
    });
});

// =============================================
// COOKIE CONSENT
// =============================================

const COOKIE_CONSENT_KEY = 'sorcery-cookie-consent';

function initCookieConsent() {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
        // Show cookie banner after a short delay
        setTimeout(() => {
            const banner = document.getElementById('cookie-consent');
            if (banner) {
                banner.classList.remove('hidden');
                refreshIcons();
            }
        }, 1000);
    }
}

function acceptCookies(type) {
    const consentData = {
        type: type, // 'all' or 'essential'
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));

    const banner = document.getElementById('cookie-consent');
    if (banner) {
        banner.style.animation = 'slideUp 0.3s var(--ease-out-expo) reverse';
        setTimeout(() => {
            banner.classList.add('hidden');
            banner.style.animation = '';
        }, 300);
    }

    showToast(type === 'all'
        ? 'Preferências de cookies salvas'
        : 'Apenas cookies essenciais serão utilizados', 'success');
}

function manageCookies() {
    // Remove current consent to show banner again
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    const banner = document.getElementById('cookie-consent');
    if (banner) {
        banner.classList.remove('hidden');
        refreshIcons();
    }
}

function getCookieConsent() {
    try {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        return consent ? JSON.parse(consent) : null;
    } catch (e) {
        return null;
    }
}

// =============================================
// LEGAL PAGES
// =============================================

const LEGAL_CONTENT = {
    terms: {
        title: 'Termos de Uso',
        icon: 'file-text',
        lastUpdate: '11 de Abril de 2026',
        content: `
            <h3>1. ACEITAÇÃO DOS TERMOS</h3>
            <p>Ao acessar e utilizar o Sorcery Contested Realm Brasil ("Portal"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar o Portal.</p>

            <h3>2. DESCRIÇÃO DO SERVIÇO</h3>
            <p>O Sorcery Contested Realm Brasil é uma plataforma gratuita que oferece:</p>
            <ul>
                <li>Gerenciamento de coleção de cards de Sorcery: Contested Realm</li>
                <li>Ferramentas para criação e compartilhamento de decks</li>
                <li>Fórum de discussão para a comunidade</li>
                <li>Sistema de trocas e marketplace entre usuários</li>
                <li>Informações sobre o jogo, regras e estratégias</li>
            </ul>

            <h3>3. CADASTRO E CONTA</h3>
            <ul>
                <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso</li>
                <li>Todas as atividades realizadas em sua conta são de sua responsabilidade</li>
                <li>Você deve fornecer informações verdadeiras durante o cadastro</li>
                <li>O Portal reserva-se o direito de suspender ou encerrar contas que violem estes termos</li>
            </ul>

            <h3>4. TROCAS E NEGOCIAÇÕES</h3>
            <div class="legal-highlight">
                <p><strong>IMPORTANTE:</strong> O Sorcery Contested Realm Brasil é apenas uma plataforma de conexão entre jogadores. Todas as transações, trocas e negociações ocorrem FORA da plataforma e são de responsabilidade exclusiva das partes envolvidas.</p>
            </div>
            <ul>
                <li>O Portal não intermedia, garante ou se responsabiliza por qualquer transação</li>
                <li>Recomendamos encontros em locais públicos ou envios com rastreamento</li>
                <li>O Portal não oferece garantias, reembolsos ou mediação de disputas</li>
                <li>Avalie cuidadosamente a reputação do outro usuário antes de negociar</li>
            </ul>

            <h3>5. SISTEMA DE REPUTAÇÃO</h3>
            <ul>
                <li>A reputação é baseada em avaliações de outros usuários</li>
                <li>Um histórico positivo não garante segurança em transações futuras</li>
                <li>O Portal não verifica identidades ou informações dos usuários</li>
                <li>Avaliações falsas ou manipuladas são proibidas</li>
            </ul>

            <h3>6. CONDUTA DO USUÁRIO</h3>
            <p>Ao utilizar o Portal, você concorda em não:</p>
            <ul>
                <li>Publicar conteúdo ofensivo, difamatório ou ilegal</li>
                <li>Assediar, ameaçar ou intimidar outros usuários</li>
                <li>Realizar spam ou publicidade não autorizada</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Interferir no funcionamento do Portal</li>
                <li>Violar direitos autorais ou propriedade intelectual</li>
            </ul>

            <h3>7. PROPRIEDADE INTELECTUAL</h3>
            <p>Sorcery: Contested Realm é uma marca registrada de Erik's Curiosa. O Sorcery Contested Realm Brasil não é afiliado, endossado ou patrocinado por Erik's Curiosa. Imagens de cards são utilizadas para fins informativos e de gerenciamento de coleção.</p>

            <h3>8. ISENÇÃO DE RESPONSABILIDADE</h3>
            <p>O Portal é fornecido "como está". Não garantimos:</p>
            <ul>
                <li>Disponibilidade contínua ou ininterrupta do serviço</li>
                <li>Precisão das informações de preços ou valores</li>
                <li>Segurança em transações entre usuários</li>
                <li>Integridade dos dados armazenados</li>
            </ul>

            <h3>9. LIMITAÇÃO DE RESPONSABILIDADE</h3>
            <p>Em nenhuma circunstância o Sorcery Contested Realm Brasil ou seus administradores serão responsáveis por danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso do Portal.</p>

            <h3>10. MODIFICAÇÕES DOS TERMOS</h3>
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas aos usuários. O uso continuado do Portal após alterações constitui aceitação dos novos termos.</p>

            <h3>11. CONTATO</h3>
            <p>Para dúvidas sobre estes termos, entre em contato através do nosso Discord oficial.</p>
        `
    },
    privacy: {
        title: 'Política de Privacidade',
        icon: 'shield',
        lastUpdate: '11 de Abril de 2026',
        content: `
            <h3>1. INFORMAÇÕES QUE COLETAMOS</h3>
            <p>Coletamos as seguintes informações:</p>

            <p><strong>Dados fornecidos por você:</strong></p>
            <ul>
                <li>Email e nome de usuário (durante o cadastro)</li>
                <li>Informações do perfil (bio, avatar)</li>
                <li>Dados da coleção de cards</li>
                <li>Mensagens e posts no fórum</li>
                <li>Listagens de troca</li>
            </ul>

            <p><strong>Dados coletados automaticamente:</strong></p>
            <ul>
                <li>Dados de uso e navegação</li>
                <li>Endereço IP (para segurança)</li>
                <li>Informações do dispositivo e navegador</li>
            </ul>

            <h3>2. COMO USAMOS SUAS INFORMAÇÕES</h3>
            <ul>
                <li>Fornecer e manter os serviços do Portal</li>
                <li>Personalizar sua experiência</li>
                <li>Sincronizar sua coleção entre dispositivos</li>
                <li>Enviar notificações sobre atividades relevantes</li>
                <li>Melhorar nossos serviços</li>
                <li>Garantir a segurança da plataforma</li>
            </ul>

            <h3>3. ARMAZENAMENTO DE DADOS</h3>
            <p>Seus dados são armazenados de duas formas:</p>
            <ul>
                <li><strong>Localmente:</strong> No seu navegador (localStorage) para funcionamento offline</li>
                <li><strong>Na nuvem:</strong> Em servidores seguros para sincronização (quando logado)</li>
            </ul>

            <h3>4. COMPARTILHAMENTO DE DADOS</h3>
            <p><strong>Não vendemos suas informações pessoais.</strong></p>
            <p>Podemos compartilhar dados limitados:</p>
            <ul>
                <li>Com outros usuários (apenas informações do perfil público)</li>
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger direitos e segurança do Portal e usuários</li>
            </ul>

            <h3>5. COOKIES E TECNOLOGIAS SIMILARES</h3>
            <p>Utilizamos:</p>
            <ul>
                <li><strong>Cookies essenciais:</strong> Necessários para o funcionamento básico</li>
                <li><strong>Cookies de preferência:</strong> Salvam suas configurações</li>
                <li><strong>LocalStorage:</strong> Armazena sua coleção e configurações</li>
            </ul>
            <p>Você pode gerenciar suas preferências de cookies a qualquer momento.</p>

            <h3>6. SEUS DIREITOS</h3>
            <p>Você tem direito a:</p>
            <ul>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Excluir sua conta e dados</li>
                <li>Exportar sua coleção</li>
                <li>Revogar consentimentos</li>
            </ul>

            <h3>7. SEGURANÇA</h3>
            <p>Implementamos medidas de segurança incluindo:</p>
            <ul>
                <li>Criptografia de senhas (PBKDF2)</li>
                <li>Proteção contra tentativas de login em massa</li>
                <li>Validação de dados de entrada</li>
                <li>Sessões com expiração automática</li>
            </ul>

            <h3>8. MENORES DE IDADE</h3>
            <p>O Portal não é direcionado a menores de 13 anos. Se identificarmos dados de menores, eles serão excluídos.</p>

            <h3>9. ALTERAÇÕES NESTA POLÍTICA</h3>
            <p>Podemos atualizar esta política periodicamente. Alterações significativas serão comunicadas aos usuários.</p>

            <h3>10. CONTATO</h3>
            <p>Para questões sobre privacidade, entre em contato através do nosso Discord oficial.</p>
        `
    },
    lgpd: {
        title: 'LGPD - Lei Geral de Proteção de Dados',
        icon: 'lock',
        lastUpdate: '11 de Abril de 2026',
        content: `
            <div class="legal-highlight">
                <p>O Sorcery Contested Realm Brasil está comprometido com a conformidade à Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).</p>
            </div>

            <h3>1. CONTROLADOR DOS DADOS</h3>
            <p>O Sorcery Contested Realm Brasil atua como controlador dos dados pessoais coletados através da plataforma.</p>

            <h3>2. BASES LEGAIS PARA TRATAMENTO</h3>
            <p>Tratamos seus dados pessoais com base em:</p>
            <ul>
                <li><strong>Consentimento:</strong> Quando você se cadastra e aceita os termos</li>
                <li><strong>Execução de contrato:</strong> Para fornecer os serviços do Portal</li>
                <li><strong>Legítimo interesse:</strong> Para melhorar a segurança e experiência</li>
                <li><strong>Cumprimento de obrigação legal:</strong> Quando exigido por lei</li>
            </ul>

            <h3>3. SEUS DIREITOS (Art. 18 da LGPD)</h3>
            <p>Como titular dos dados, você tem direito a:</p>
            <ul>
                <li><strong>Confirmação:</strong> Saber se tratamos seus dados</li>
                <li><strong>Acesso:</strong> Obter cópia dos seus dados</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos ou incorretos</li>
                <li><strong>Anonimização:</strong> Solicitar anonimização de dados desnecessários</li>
                <li><strong>Portabilidade:</strong> Exportar seus dados (função disponível no perfil)</li>
                <li><strong>Eliminação:</strong> Excluir dados tratados com consentimento</li>
                <li><strong>Informação:</strong> Saber com quem compartilhamos dados</li>
                <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
            </ul>

            <h3>4. COMO EXERCER SEUS DIREITOS</h3>
            <p>Para exercer qualquer direito previsto na LGPD:</p>
            <ul>
                <li><strong>Acesso e correção:</strong> Através das configurações do perfil</li>
                <li><strong>Exportação:</strong> Use a função "Exportar Coleção" nas configurações</li>
                <li><strong>Exclusão de conta:</strong> Entre em contato pelo Discord oficial</li>
                <li><strong>Outras solicitações:</strong> Entre em contato pelo Discord oficial</li>
            </ul>
            <p>Responderemos às solicitações em até 15 dias.</p>

            <h3>5. DADOS COLETADOS E FINALIDADES</h3>
            <table style="width: 100%; border-collapse: collapse; margin: var(--space-4) 0;">
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <th style="text-align: left; padding: var(--space-2); color: var(--text-primary);">Dado</th>
                    <th style="text-align: left; padding: var(--space-2); color: var(--text-primary);">Finalidade</th>
                    <th style="text-align: left; padding: var(--space-2); color: var(--text-primary);">Base Legal</th>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Email</td>
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Autenticação e comunicação</td>
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Execução de contrato</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Nome de usuário</td>
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Identificação na plataforma</td>
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Execução de contrato</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Coleção de cards</td>
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Funcionamento do serviço</td>
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Execução de contrato</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Endereço IP</td>
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Segurança e prevenção de fraudes</td>
                    <td style="padding: var(--space-2); color: var(--text-secondary);">Legítimo interesse</td>
                </tr>
            </table>

            <h3>6. RETENÇÃO DE DADOS</h3>
            <ul>
                <li><strong>Dados de conta:</strong> Mantidos enquanto a conta estiver ativa</li>
                <li><strong>Coleção:</strong> Mantida até exclusão pelo usuário ou da conta</li>
                <li><strong>Logs de acesso:</strong> Mantidos por 6 meses (Art. 15, Marco Civil)</li>
                <li><strong>Posts e mensagens:</strong> Mantidos até exclusão ou encerramento da conta</li>
            </ul>

            <h3>7. TRANSFERÊNCIA INTERNACIONAL</h3>
            <p>Alguns dados podem ser processados em servidores fora do Brasil. Garantimos que esses provedores seguem padrões adequados de proteção de dados.</p>

            <h3>8. SEGURANÇA DOS DADOS</h3>
            <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
            <ul>
                <li>Criptografia de senhas com PBKDF2 (100.000 iterações)</li>
                <li>Proteção contra ataques de força bruta</li>
                <li>Sessões com expiração automática</li>
                <li>Validação e sanitização de dados</li>
            </ul>

            <h3>9. INCIDENTES DE SEGURANÇA</h3>
            <p>Em caso de incidente de segurança que possa causar dano relevante, notificaremos:</p>
            <ul>
                <li>A Autoridade Nacional de Proteção de Dados (ANPD)</li>
                <li>Os titulares afetados</li>
            </ul>

            <h3>10. CONTATO DO ENCARREGADO (DPO)</h3>
            <p>Para questões relacionadas à LGPD, entre em contato através do nosso Discord oficial. Responderemos às solicitações em conformidade com os prazos legais.</p>

            <h3>11. AUTORIDADE NACIONAL</h3>
            <p>Você pode registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD): <a href="https://www.gov.br/anpd" target="_blank" rel="noopener">www.gov.br/anpd</a></p>
        `
    }
};

function showLegalPage(type) {
    const content = LEGAL_CONTENT[type];
    if (!content) return;

    const container = document.getElementById('legal-content');
    if (!container) return;

    container.innerHTML = `
        <h2><i data-lucide="${content.icon}"></i> ${content.title}</h2>
        <p class="legal-date">Última atualização: ${content.lastUpdate}</p>
        ${content.content}
        <div class="legal-actions">
            <button class="btn btn-secondary" onclick="closeModal('legal-modal')">Fechar</button>
        </div>
    `;

    openModal('legal-modal');
    refreshIcons();
}

// Initialize cookie consent on page load
document.addEventListener('DOMContentLoaded', initCookieConsent);

// Export additional functions
window.sorceryApp.nocoDBService = typeof nocoDBService !== 'undefined' ? nocoDBService : null;
window.deleteCardPhoto = deleteCardPhoto;

// Export community functions
window.openModal = openModal;
window.closeModal = closeModal;
window.showTermsModal = showTermsModal;
window.acceptTerms = acceptTerms;
window.showAvatarModal = showAvatarModal;
window.selectAvatar = selectAvatar;
window.saveSelectedAvatar = saveSelectedAvatar;
window.openInbox = openInbox;
// openComposeMessage is already global from messaging-service.js
window.viewMessage = viewMessage;
window.replyToMessage = replyToMessage;
window.sendMessage = sendMessage;
window.deleteMessage = deleteMessage;
window.openVoteModal = openVoteModal;
window.openUserProfileModal = openUserProfileModal;
window.submitVote = submitVote;
window.createForumPost = createForumPost;
window.viewForumPost = viewForumPost;
window.addForumComment = addForumComment;
window.filterForumCategory = filterForumCategory;
window.searchForum = searchForum;
window.backToForumList = backToForumList;
window.publishTradeListing = publishTradeListing;
window.removeTradeListing = removeTradeListing;
window.filterMarketplace = filterMarketplace;
window.contactTrader = contactTrader;
window.updateUnreadBadge = updateUnreadBadge;
window.renderProfileView = renderProfileView;

// Export cookie and legal functions
window.acceptCookies = acceptCookies;
window.manageCookies = manageCookies;
window.showLegalPage = showLegalPage;

// Export deck builder functions
window.openDeckBuilder = openDeckBuilder;
window.openNewDeckModal = openDeckBuilder; // Alias for backwards compatibility
window.openImportDeckModal = openImportDeckModal;

// ============================================
// ANIMATED COUNTING STATS
// ============================================

/**
 * Anima a contagem de números quando elementos entram na viewport
 * Usa Intersection Observer para melhor performance
 */
function initAnimatedCounting() {
    const counters = document.querySelectorAll('.animate-count');
    if (!counters.length) return;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, observerOptions);

    counters.forEach(counter => countObserver.observe(counter));
}

/**
 * Executa a animação de contagem em um elemento
 */
function animateCounter(element) {
    const target = parseInt(element.dataset.target) || 0;
    const suffix = element.dataset.suffix || '';
    const duration = 2000; // 2 segundos
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);

    // Easing function para desacelerar no final
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    let frame = 0;
    const countUp = () => {
        frame++;
        const progress = easeOutQuart(frame / totalFrames);
        const currentCount = Math.round(target * progress);

        element.textContent = currentCount.toLocaleString('pt-BR') + suffix;

        if (frame < totalFrames) {
            requestAnimationFrame(countUp);
        } else {
            element.textContent = target.toLocaleString('pt-BR') + suffix;
        }
    };

    // Pequeno delay para sincronizar com outras animações
    setTimeout(countUp, 100);
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', initAnimatedCounting);

// ============================================
// BUTTON RIPPLE EFFECT
// ============================================

/**
 * Adiciona efeito ripple sofisticado aos botões
 */
function initButtonRipple() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn || btn.disabled) return;

        // Calcular posição relativa do clique
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Definir variáveis CSS para posição do ripple
        btn.style.setProperty('--ripple-x', `${x}%`);
        btn.style.setProperty('--ripple-y', `${y}%`);

        // Remover classe anterior se existir
        btn.classList.remove('ripple');

        // Forçar reflow para reiniciar animação
        void btn.offsetWidth;

        // Adicionar classe de ripple
        btn.classList.add('ripple');

        // Remover após animação
        setTimeout(() => {
            btn.classList.remove('ripple');
        }, 600);
    });
}

// Inicializar ripple quando DOM carregar
document.addEventListener('DOMContentLoaded', initButtonRipple);
