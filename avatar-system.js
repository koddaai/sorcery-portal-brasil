// ============================================
// SORCERY AVATAR SYSTEM - ELEMENTS
// 4 Element-based avatars (Fire, Water, Earth, Air)
// ============================================

// 4 Elements with their SVG icons
const AVATAR_ELEMENTS = {
    fire: {
        id: 1,
        name: 'Fogo',
        color: '#ff4444',
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="fireGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stop-color="#ff4500"/><stop offset="100%" stop-color="#ffd700"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M50 15c-5 15-20 25-15 45 3 12 12 20 15 22 3-2 12-10 15-22 5-20-10-30-15-45z" fill="url(#fireGrad)"/>
            <ellipse cx="50" cy="70" rx="8" ry="12" fill="#fff3" />
        </svg>`
    },
    water: {
        id: 2,
        name: 'Água',
        color: '#4488ff',
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="waterGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#00bfff"/><stop offset="100%" stop-color="#0066cc"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M50 18c0 0-22 28-22 42 0 12 10 22 22 22s22-10 22-22c0-14-22-42-22-42z" fill="url(#waterGrad)"/>
            <ellipse cx="42" cy="55" rx="6" ry="10" fill="#fff3" />
        </svg>`
    },
    earth: {
        id: 3,
        name: 'Terra',
        color: '#44aa44',
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="earthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#228b22"/><stop offset="100%" stop-color="#006400"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="50,20 75,45 70,80 30,80 25,45" fill="url(#earthGrad)"/>
            <polygon points="50,30 65,48 62,70 38,70 35,48" fill="#32cd32" opacity="0.6"/>
        </svg>`
    },
    air: {
        id: 4,
        name: 'Ar',
        color: '#aa88ff',
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M20 40 Q35 35 50 40 T80 40" stroke="#87ceeb" stroke-width="4" fill="none" opacity="0.9"/>
            <path d="M25 50 Q40 45 55 50 T85 50" stroke="#b0e0e6" stroke-width="3" fill="none" opacity="0.7"/>
            <path d="M15 60 Q30 55 45 60 T75 60" stroke="#87ceeb" stroke-width="4" fill="none" opacity="0.8"/>
        </svg>`
    }
};

// ========== AVATAR SERVICE FUNCTIONS ==========

/**
 * Get element by ID
 * @param {number} id - Element ID (1-4)
 * @returns {Object} Element object or default (fire)
 */
function getElementById(id) {
    const elements = Object.values(AVATAR_ELEMENTS);
    return elements.find(e => e.id === id) || AVATAR_ELEMENTS.fire;
}

/**
 * Get element by key
 * @param {string} key - Element key (fire, water, earth, air)
 * @returns {Object} Element object
 */
function getElementByKey(key) {
    return AVATAR_ELEMENTS[key] || AVATAR_ELEMENTS.fire;
}

/**
 * Get avatar SVG by ID
 * @param {number} id - Element ID (1-4)
 * @returns {string} SVG string
 */
function getAvatarSVG(id) {
    return getElementById(id).svg;
}

/**
 * Get avatar by ID (legacy compatibility)
 * @param {number} id - Element ID (1-4)
 * @returns {Object} Element object
 */
function getAvatarById(id) {
    return getElementById(id);
}

/**
 * Render avatar as HTML element
 * @param {number} elementId - Element ID (1-4)
 * @param {string} size - Size: 'small' (24px), 'medium' (40px), 'large' (80px)
 * @returns {string} HTML string with avatar
 */
function renderAvatar(elementId, size = 'medium') {
    const sizes = {
        small: 24,
        medium: 40,
        large: 80
    };

    const px = sizes[size] || sizes.medium;
    const element = getElementById(elementId);

    return `
        <div class="user-avatar user-avatar-${size}"
             style="width:${px}px; height:${px}px;"
             title="${element.name}">
            ${element.svg}
        </div>
    `;
}

/**
 * Render element selector (4 options)
 * @param {number} currentId - Currently selected element ID
 * @returns {string} HTML string with element selector
 */
function renderAvatarSelector(currentId = 1) {
    const elements = Object.entries(AVATAR_ELEMENTS);

    return `
        <div class="avatar-selector">
            <h4 class="avatar-selector-title">Escolha seu Elemento</h4>
            <div class="element-grid">
                ${elements.map(([key, element]) => `
                    <button
                        type="button"
                        class="element-option ${element.id === currentId ? 'selected' : ''}"
                        data-element-id="${element.id}"
                        title="${element.name}"
                        onclick="selectAvatar(${element.id})"
                    >
                        <div class="element-icon">${element.svg}</div>
                        <span class="element-name">${element.name}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Update user avatar/element
 * @param {number} elementId - New element ID (1-4)
 */
async function updateUserAvatar(elementId) {
    if (typeof nocoDBService === 'undefined' || !nocoDBService.isLoggedIn()) {
        if (typeof showToast === 'function') {
            showToast('Faça login para alterar seu elemento', 'error');
        }
        return false;
    }

    try {
        const user = nocoDBService.getCurrentUser();
        // Update in NocoDB
        await nocoDBService.updateRecord('users', user.id, { avatar_id: elementId });

        // Update local session
        user.avatarId = elementId;
        nocoDBService.saveSession();

        // Update UI
        updateAllAvatarDisplays();
        if (typeof showToast === 'function') {
            showToast('Elemento atualizado!', 'success');
        }
        return true;
    } catch (error) {
        console.error('Error updating avatar:', error);
        if (typeof showToast === 'function') {
            showToast('Erro ao atualizar elemento', 'error');
        }
        return false;
    }
}

/**
 * Update all avatar displays on the page
 */
function updateAllAvatarDisplays() {
    if (typeof nocoDBService === 'undefined') return;

    const user = nocoDBService.getCurrentUser();
    if (!user) return;

    const elementId = user.avatarId || 1;

    // Update header avatar
    const headerAvatar = document.querySelector('.user-menu-avatar');
    if (headerAvatar) {
        headerAvatar.innerHTML = getAvatarSVG(elementId);
    }

    // Update profile modal avatar
    const profileAvatar = document.querySelector('.profile-avatar-display');
    if (profileAvatar) {
        profileAvatar.innerHTML = renderAvatar(elementId, 'large');
    }

    // Update any other avatar displays
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
        el.innerHTML = getAvatarSVG(elementId);
    });
}

/**
 * Get user's current avatar/element ID
 * @returns {number} Element ID or 1 (default - fire)
 */
function getCurrentUserAvatarId() {
    if (typeof nocoDBService === 'undefined') return 1;
    const user = nocoDBService.getCurrentUser();
    return user?.avatarId || 1;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AVATAR_ELEMENTS,
        getElementById,
        getElementByKey,
        getAvatarSVG,
        getAvatarById,
        renderAvatar,
        renderAvatarSelector,
        updateUserAvatar,
        updateAllAvatarDisplays,
        getCurrentUserAvatarId
    };
}
