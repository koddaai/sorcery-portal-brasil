// ============================================
// SORCERY AVATAR SYSTEM - ELEMENTS
// 4 Element-based avatars using PNG images
// ============================================

// 4 Elements with their PNG image paths
const AVATAR_ELEMENTS = {
    fire: {
        id: 1,
        name: 'Fogo',
        key: 'fire',
        color: '#ff4444',
        image: 'assets/elements/fire.png'
    },
    water: {
        id: 2,
        name: 'Água',
        key: 'water',
        color: '#4488ff',
        image: 'assets/elements/water.png'
    },
    earth: {
        id: 3,
        name: 'Terra',
        key: 'earth',
        color: '#44aa44',
        image: 'assets/elements/earth.png'
    },
    air: {
        id: 4,
        name: 'Ar',
        key: 'air',
        color: '#aa88ff',
        image: 'assets/elements/air.png'
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
 * Get avatar HTML (img tag) by ID
 * @param {number} id - Element ID (1-4)
 * @returns {string} HTML img tag
 */
function getAvatarSVG(id) {
    const element = getElementById(id);
    return `<img src="${element.image}" alt="${element.name}" class="element-img">`;
}

/**
 * Get avatar image path by ID
 * @param {number} id - Element ID (1-4)
 * @returns {string} Image path
 */
function getAvatarImage(id) {
    return getElementById(id).image;
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
            <img src="${element.image}" alt="${element.name}" class="element-img">
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
                        <div class="element-icon">
                            <img src="${element.image}" alt="${element.name}" class="element-img">
                        </div>
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
    const element = getElementById(elementId);

    // Update header avatar
    const headerAvatar = document.querySelector('.user-menu-avatar');
    if (headerAvatar) {
        headerAvatar.innerHTML = `<img src="${element.image}" alt="${element.name}" class="element-img">`;
    }

    // Update profile modal avatar (profile-current-avatar)
    const profileAvatar = document.getElementById('profile-current-avatar');
    if (profileAvatar) {
        profileAvatar.innerHTML = `<img src="${element.image}" alt="${element.name}" class="element-img">`;
    }

    // Update any other avatar displays
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
        el.innerHTML = `<img src="${element.image}" alt="${element.name}" class="element-img">`;
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
        getAvatarImage,
        getAvatarById,
        renderAvatar,
        renderAvatarSelector,
        updateUserAvatar,
        updateAllAvatarDisplays,
        getCurrentUserAvatarId
    };
}
