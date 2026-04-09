// ============================================
// BRAZILIAN SORCERY TCG STORES & COMMUNITY
// ============================================

const BRAZILIAN_STORES = [
    // Sealed + Singles
    {
        name: "Mont Card Shop",
        url: "https://www.montshop.com.br",
        type: "Sealed/Singles",
        city: "São Paulo",
        state: "SP",
        description: "Grande variedade de produtos"
    },
    {
        name: "Flow Games",
        url: "https://www.flowstore.com.br",
        type: "Sealed/Singles",
        city: "São Paulo",
        state: "SP",
        description: "Loja especializada em TCG"
    },
    {
        name: "Kirin Studio",
        url: "https://www.kirinstudio.com.br",
        type: "Sealed/Singles",
        city: "São Paulo",
        state: "SP",
        description: "Produtos e acessórios"
    },
    {
        name: "Odisseia Neon",
        url: "https://www.odisseianeonloja.com.br",
        type: "Sealed/Singles",
        city: "Rio de Janeiro",
        state: "RJ",
        description: "Loja online completa"
    },
    {
        name: "Bolsa do Infinito",
        url: "https://www.bolsadoinfinito.com.br",
        type: "Sealed/Singles",
        city: "São Paulo",
        state: "SP",
        description: "Cards e acessórios"
    },
    {
        name: "Covil do Mago",
        url: "https://www.covildomagohobbystore.com.br",
        type: "Sealed/Singles",
        city: "Curitiba",
        state: "PR",
        description: "Cupom: OLDGUY5"
    },

    // Sealed Only
    {
        name: "Forja Hobby Store",
        url: "https://www.forjahobbystore.com.br",
        type: "Sealed",
        city: "Porto Alegre",
        state: "RS",
        description: "Boosters e precons"
    },
    {
        name: "Monster Games Cards",
        url: "https://www.monstergamescards.com.br",
        type: "Sealed",
        city: "São Paulo",
        state: "SP",
        description: "Produtos selados"
    },
    {
        name: "CHQ Jogos",
        url: "https://www.chqjogos.com.br",
        type: "Sealed",
        city: "Brasília",
        state: "DF",
        description: "Board games e TCG"
    },
    {
        name: "Magic Domain",
        url: "https://www.magicdomain.com.br",
        type: "Sealed",
        city: "São Paulo",
        state: "SP",
        description: "Loja de TCG"
    },
    {
        name: "Paladins Games",
        url: "https://paladinsgames.com.br/card-games-sorcery-contested-realm",
        type: "Sealed",
        city: "Belo Horizonte",
        state: "MG",
        description: "Cards e jogos"
    },

    // Singles Only
    {
        name: "MYP Cards",
        url: "https://www.mypcards.com/sorcery",
        type: "Singles",
        city: "São Paulo",
        state: "SP",
        description: "Especialista em singles"
    },
    {
        name: "Cripta Arcana",
        url: "https://www.criptaarcana.com.br",
        type: "Singles",
        city: "Rio de Janeiro",
        state: "RJ",
        description: "Cards avulsos"
    },
    {
        name: "DMG Card Shop",
        url: "https://www.dmgcardshop.com.br",
        type: "Singles",
        city: "Belo Horizonte",
        state: "MG",
        description: "Cards avulsos MG"
    },
    {
        name: "Kaiju TCG",
        url: "https://www.kaijutcg.com.br",
        type: "Singles",
        city: "Belo Horizonte",
        state: "MG",
        description: "Cards avulsos MG"
    },
    {
        name: "Paladino Hobbies",
        url: "https://www.paladinohobbies.com.br",
        type: "Singles",
        city: "Campinas",
        state: "SP",
        description: "Cards e hobbies"
    },

    // Accessories
    {
        name: "Jogando TCG",
        url: "https://www.jogandotcg.com.br",
        type: "Acessórios",
        city: "São Paulo",
        state: "SP",
        description: "Playmats e sleeves"
    },
    {
        name: "Btn's Oficial",
        url: "https://www.btnsoficial.com.br",
        type: "Acessórios",
        city: "São Paulo",
        state: "SP",
        description: "Acessórios para TCG"
    },
    {
        name: "Toca do Yeti",
        url: "https://www.tocadoyeti.com.br",
        type: "Acessórios",
        city: "Florianópolis",
        state: "SC",
        description: "Playmats personalizados"
    },
    {
        name: "Ateliê 3D Verso",
        url: "https://www.instagram.com/atelie3dverso",
        type: "Acessórios",
        city: "São Paulo",
        state: "SP",
        description: "Cupom: EDY5"
    }
];

// Official links
const COMMUNITY_LINKS = {
    discord: "https://discord.gg/qvYVGFAS5n",
    officialSite: "https://sorcerytcg.com/",
    howToPlay: "https://sorcerytcg.com/how-to-play",
    events: "https://sorcerytcg.com/events",
    curiosa: "https://curiosa.io"
};

// Initialize community features
function initCommunity() {
    renderStores();
    setupStoreFilters();
}

// Render stores grid
function renderStores(filterType = '') {
    const grid = document.getElementById('stores-grid');
    if (!grid) return;

    const filteredStores = filterType
        ? BRAZILIAN_STORES.filter(s => s.type === filterType || s.type.includes(filterType))
        : BRAZILIAN_STORES;

    grid.innerHTML = filteredStores.map(store => `
        <a href="${store.url}" target="_blank" rel="noopener" class="store-card">
            <div class="store-info">
                <h4>${store.name}</h4>
                <span class="store-type">${store.type}</span>
            </div>
            <p class="store-description">${store.description}</p>
            <div class="store-link">
                <i data-lucide="external-link"></i>
            </div>
        </a>
    `).join('');

    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Setup store filters
function setupStoreFilters() {
    const filter = document.getElementById('store-type-filter');
    if (filter) {
        filter.addEventListener('change', (e) => {
            renderStores(e.target.value);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initCommunity, 300);
});
