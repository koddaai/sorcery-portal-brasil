// ============================================
// SORCERY PORTAL BRASIL - PROFILE SERVICE
// Public profiles and sharing functionality
// ============================================

// Get per-user storage key
// IMPORTANT: Use lowercase 'id' first for consistency with getCurrentUserId()
function getProfileStorageKey() {
    let userId = null;
    if (typeof nocoDBService !== 'undefined' && nocoDBService.currentUser) {
        userId = nocoDBService.currentUser.id || nocoDBService.currentUser.Id;
    }
    if (!userId) {
        try {
            const session = localStorage.getItem('sorcery-session');
            if (session) {
                const user = JSON.parse(session);
                userId = user.id || user.Id;
            }
        } catch (e) {}
    }
    return userId ? `sorcery-profile-settings-${userId}` : 'sorcery-profile-settings';
}

class ProfileService {
    constructor() {
        this.localSettings = null;
        this.loadLocalSettings();
    }

    /**
     * Get storage key (per-user if logged in)
     */
    getStorageKey() {
        return getProfileStorageKey();
    }

    /**
     * Load local profile settings from localStorage (per-user)
     */
    loadLocalSettings() {
        try {
            const storageKey = this.getStorageKey();
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                this.localSettings = JSON.parse(stored);
            }
        } catch (error) {
            console.error('[ProfileService] Error loading settings:', error);
        }
    }

    /**
     * Save local profile settings to localStorage (per-user)
     */
    saveLocalSettings() {
        try {
            const storageKey = this.getStorageKey();
            localStorage.setItem(storageKey, JSON.stringify(this.localSettings));
        } catch (error) {
            console.error('[ProfileService] Error saving settings:', error);
        }
    }

    /**
     * Generate a unique share token (8 alphanumeric characters)
     */
    generateShareToken() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let token = '';
        for (let i = 0; i < 8; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    /**
     * Generate a URL-friendly slug from display name
     */
    generateSlug(displayName) {
        if (!displayName) return '';

        return displayName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with dashes
            .replace(/^-+|-+$/g, '')          // Trim dashes
            .substring(0, 30);                // Limit length
    }

    /**
     * Initialize or get profile for current user
     */
    async initProfile(userId, displayName) {
        if (!userId) return null;

        // Check if profile already exists locally
        if (this.localSettings && this.localSettings.userId === userId) {
            return this.localSettings;
        }

        // Create new profile settings
        this.localSettings = {
            userId: userId,
            profileSlug: this.generateSlug(displayName),
            shareToken: this.generateShareToken(),
            displayName: displayName || 'Sorcerer',
            bio: '',
            isPublic: false,
            privacySettings: {
                showCollectionValue: true,
                showDeckLists: false,
                showCompletionStats: true,
                showTopCards: true
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.saveLocalSettings();

        // Try to sync to cloud if NocoDB is available
        if (typeof nocoDBService !== 'undefined') {
            await this.syncProfileToCloud();
        }

        return this.localSettings;
    }

    /**
     * Update profile settings
     */
    updateProfile(updates) {
        if (!this.localSettings) return null;

        this.localSettings = {
            ...this.localSettings,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Regenerate slug if display name changed
        if (updates.displayName) {
            this.localSettings.profileSlug = this.generateSlug(updates.displayName);
        }

        this.saveLocalSettings();
        return this.localSettings;
    }

    /**
     * Update privacy settings
     */
    updatePrivacy(privacyUpdates) {
        if (!this.localSettings) return null;

        this.localSettings.privacySettings = {
            ...this.localSettings.privacySettings,
            ...privacyUpdates
        };
        this.localSettings.updatedAt = new Date().toISOString();

        this.saveLocalSettings();
        return this.localSettings;
    }

    /**
     * Toggle public/private profile
     */
    togglePublic() {
        if (!this.localSettings) return false;

        this.localSettings.isPublic = !this.localSettings.isPublic;
        this.localSettings.updatedAt = new Date().toISOString();

        this.saveLocalSettings();
        return this.localSettings.isPublic;
    }

    /**
     * Get current profile settings
     */
    getProfile() {
        return this.localSettings;
    }

    /**
     * Get shareable URL for profile
     */
    getShareUrl() {
        if (!this.localSettings) return null;

        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?profile=${this.localSettings.shareToken}`;
    }

    /**
     * Get shareable URL by slug (prettier but may conflict)
     */
    getShareUrlBySlug() {
        if (!this.localSettings) return null;

        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?u=${this.localSettings.profileSlug}`;
    }

    /**
     * Copy share URL to clipboard
     */
    async copyShareUrl() {
        const url = this.getShareUrl();
        if (!url) return false;

        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    /**
     * Sync profile to NocoDB cloud
     */
    async syncProfileToCloud() {
        if (!this.localSettings || typeof nocoDBService === 'undefined') return false;

        try {
            // Check if profile exists in cloud
            const existingProfile = await nocoDBService.getProfileByUserId(this.localSettings.userId);

            if (existingProfile) {
                // Update existing profile
                await nocoDBService.updateProfile(existingProfile.Id, {
                    profile_slug: this.localSettings.profileSlug,
                    share_token: this.localSettings.shareToken,
                    display_name: this.localSettings.displayName,
                    bio: this.localSettings.bio,
                    is_public: this.localSettings.isPublic,
                    show_collection_value: this.localSettings.privacySettings.showCollectionValue,
                    show_deck_lists: this.localSettings.privacySettings.showDeckLists,
                    show_completion_stats: this.localSettings.privacySettings.showCompletionStats,
                    show_top_cards: this.localSettings.privacySettings.showTopCards,
                    updated_at: new Date().toISOString()
                });
            } else {
                // Create new profile
                await nocoDBService.createProfile({
                    user_id: this.localSettings.userId,
                    profile_slug: this.localSettings.profileSlug,
                    share_token: this.localSettings.shareToken,
                    display_name: this.localSettings.displayName,
                    bio: this.localSettings.bio || '',
                    is_public: this.localSettings.isPublic || false,
                    show_collection_value: this.localSettings.privacySettings?.showCollectionValue ?? true,
                    show_deck_lists: this.localSettings.privacySettings?.showDeckLists ?? false,
                    show_completion_stats: this.localSettings.privacySettings?.showCompletionStats ?? true,
                    show_top_cards: this.localSettings.privacySettings?.showTopCards ?? true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            return true;
        } catch (error) {
            console.error('[ProfileService] Error syncing to cloud:', error);
            return false;
        }
    }

    /**
     * Load profile from cloud
     */
    async loadProfileFromCloud(userId) {
        if (typeof nocoDBService === 'undefined') return null;

        try {
            const cloudProfile = await nocoDBService.getProfileByUserId(userId);
            if (cloudProfile) {
                this.localSettings = {
                    userId: cloudProfile.user_id,
                    profileSlug: cloudProfile.profile_slug,
                    shareToken: cloudProfile.share_token,
                    displayName: cloudProfile.display_name,
                    bio: cloudProfile.bio || '',
                    isPublic: cloudProfile.is_public || false,
                    privacySettings: {
                        showCollectionValue: cloudProfile.show_collection_value ?? true,
                        showDeckLists: cloudProfile.show_deck_lists ?? false,
                        showCompletionStats: cloudProfile.show_completion_stats ?? true,
                        showTopCards: cloudProfile.show_top_cards ?? true
                    },
                    createdAt: cloudProfile.created_at,
                    updatedAt: cloudProfile.updated_at
                };
                this.saveLocalSettings();
                return this.localSettings;
            }
        } catch (error) {
            console.error('[ProfileService] Error loading from cloud:', error);
        }
        return null;
    }

    /**
     * Get public profile by token or slug
     */
    async getPublicProfile(identifier) {
        if (typeof nocoDBService === 'undefined') return null;

        try {
            // Try to find by share token first
            let profile = await nocoDBService.getProfileByToken(identifier);

            // If not found, try by slug
            if (!profile) {
                profile = await nocoDBService.getProfileBySlug(identifier);
            }

            if (profile && profile.is_public) {
                return {
                    displayName: profile.display_name,
                    bio: profile.bio,
                    userId: profile.user_id,
                    privacySettings: {
                        showCollectionValue: profile.show_collection_value,
                        showDeckLists: profile.show_deck_lists,
                        showCompletionStats: profile.show_completion_stats,
                        showTopCards: profile.show_top_cards
                    }
                };
            }

            return null;
        } catch (error) {
            console.error('[ProfileService] Error fetching public profile:', error);
            return null;
        }
    }

    /**
     * Get public collection data for a user
     */
    async getPublicCollectionData(userId, privacySettings) {
        if (typeof nocoDBService === 'undefined') return null;

        try {
            const collectionData = await nocoDBService.getPublicCollection(userId);

            if (!collectionData) return null;

            const result = {
                totalCards: collectionData.length,
                cards: collectionData.map(c => c.card_name)
            };

            // Calculate completion stats if allowed
            if (privacySettings.showCompletionStats && typeof allCards !== 'undefined') {
                const totalAvailable = allCards.length;
                result.completionPercent = Math.round((collectionData.length / totalAvailable) * 100);

                // Set completion
                const sets = ['Alpha', 'Beta', 'Arthurian Legends', 'Gothic'];
                result.setCompletion = {};
                sets.forEach(setName => {
                    const setCards = allCards.filter(c => c.sets?.some(s => s.name === setName));
                    const ownedSetCards = collectionData.filter(c => {
                        const card = allCards.find(ac => ac.name === c.card_name);
                        return card?.sets?.some(s => s.name === setName);
                    });
                    result.setCompletion[setName] = {
                        owned: ownedSetCards.length,
                        total: setCards.length,
                        percent: setCards.length > 0 ? Math.round((ownedSetCards.length / setCards.length) * 100) : 0
                    };
                });
            }

            // Calculate top cards if allowed
            if (privacySettings.showTopCards && typeof priceService !== 'undefined') {
                const cardValues = collectionData.map(c => {
                    const card = typeof allCards !== 'undefined' ? allCards.find(ac => ac.name === c.card_name) : null;
                    const price = card ? (priceService.getPrice(c.card_name) || priceService.getEstimatedPrice(card)) : 0;
                    return { name: c.card_name, value: price };
                }).sort((a, b) => b.value - a.value);

                result.topCards = cardValues.slice(0, 10);
            }

            // Calculate total value if allowed
            if (privacySettings.showCollectionValue && typeof priceService !== 'undefined') {
                let totalValue = 0;
                collectionData.forEach(c => {
                    const card = typeof allCards !== 'undefined' ? allCards.find(ac => ac.name === c.card_name) : null;
                    if (card) {
                        const price = priceService.getPrice(c.card_name) || priceService.getEstimatedPrice(card);
                        totalValue += price;
                    }
                });
                result.totalValue = totalValue;
            }

            return result;
        } catch (error) {
            console.error('[ProfileService] Error fetching public collection:', error);
            return null;
        }
    }

    /**
     * Clear local profile data (per-user)
     */
    clearProfile() {
        this.localSettings = null;
        const storageKey = this.getStorageKey();
        localStorage.removeItem(storageKey);
    }
}

// ============================================
// INITIALIZE
// ============================================

const profileService = new ProfileService();
window.profileService = profileService;
