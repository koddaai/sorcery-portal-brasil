// ============================================
// BRAZILIAN SORCERY TCG STORES & COMMUNITY
// ============================================

// Lojas com endereço físico (para o localizador)
const PHYSICAL_STORES = [
    // SÃO PAULO - Capital
    {
        name: "Mont Card Shop",
        type: "Sealed/Singles",
        address: "Rua Santa Ifigênia, 234 - República",
        city: "São Paulo",
        state: "SP",
        cep: "01207-001",
        phone: "(11) 3331-0000",
        url: "https://www.montshop.com.br",
        hasEvents: true,
        description: "Grande variedade de produtos Sorcery, singles e selados",
        coords: { lat: -23.5407, lng: -46.6398 }
    },
    {
        name: "Flow Games",
        type: "Sealed/Singles",
        address: "Av. Paulista, 1111 - Bela Vista",
        city: "São Paulo",
        state: "SP",
        cep: "01311-100",
        phone: "(11) 99999-0000",
        url: "https://www.flowstore.com.br",
        hasEvents: true,
        description: "Loja especializada em TCG com espaço para torneios",
        coords: { lat: -23.5632, lng: -46.6526 }
    },
    {
        name: "Kirin Studio",
        type: "Sealed/Singles",
        address: "Rua Augusta, 2676 - Jardins",
        city: "São Paulo",
        state: "SP",
        cep: "01412-100",
        url: "https://www.kirinstudio.com.br",
        hasEvents: false,
        description: "Cards, acessórios e produtos premium",
        coords: { lat: -23.5558, lng: -46.6672 }
    },
    {
        name: "Bolsa do Infinito",
        type: "Sealed/Singles",
        address: "Rua Barão de Itapetininga, 255 - República",
        city: "São Paulo",
        state: "SP",
        cep: "01042-001",
        url: "https://www.bolsadoinfinito.com.br",
        hasEvents: true,
        description: "Cards avulsos e acessórios para TCG",
        coords: { lat: -23.5437, lng: -46.6381 }
    },
    {
        name: "MYP Cards",
        type: "Singles",
        address: "Rua Santa Ifigênia, 308 - Centro",
        city: "São Paulo",
        state: "SP",
        cep: "01207-001",
        url: "https://www.mypcards.com/sorcery",
        hasEvents: false,
        description: "Especialista em singles de Sorcery",
        coords: { lat: -23.5408, lng: -46.6399 }
    },
    {
        name: "Monster Games Cards",
        type: "Sealed",
        address: "Rua Conselheiro Crispiniano, 105 - Centro",
        city: "São Paulo",
        state: "SP",
        cep: "01037-001",
        url: "https://www.monstergamescards.com.br",
        hasEvents: false,
        description: "Produtos selados e boosters",
        coords: { lat: -23.5445, lng: -46.6377 }
    },
    {
        name: "Magic Domain",
        type: "Sealed/Singles",
        address: "Av. São João, 439 - Centro",
        city: "São Paulo",
        state: "SP",
        cep: "01035-000",
        url: "https://www.magicdomain.com.br",
        hasEvents: true,
        description: "Loja de TCG com torneios semanais",
        coords: { lat: -23.5399, lng: -46.6387 }
    },
    {
        name: "Jogando TCG",
        type: "Acessórios",
        address: "Rua Aurora, 165 - Centro",
        city: "São Paulo",
        state: "SP",
        cep: "01209-001",
        url: "https://www.jogandotcg.com.br",
        hasEvents: false,
        description: "Playmats, sleeves e deckboxes",
        coords: { lat: -23.5395, lng: -46.6419 }
    },

    // SÃO PAULO - Interior
    {
        name: "Paladino Hobbies",
        type: "Singles",
        address: "Rua Barão de Jaguara, 1481 - Centro",
        city: "Campinas",
        state: "SP",
        cep: "13015-002",
        url: "https://www.paladinohobbies.com.br",
        hasEvents: true,
        description: "Cards e hobbies em Campinas",
        coords: { lat: -22.9035, lng: -47.0621 }
    },

    // RIO DE JANEIRO
    {
        name: "Odisseia Neon",
        type: "Sealed/Singles",
        address: "Rua Buenos Aires, 70 - Centro",
        city: "Rio de Janeiro",
        state: "RJ",
        cep: "20070-020",
        phone: "(21) 2524-0000",
        url: "https://www.odisseianeonloja.com.br",
        hasEvents: true,
        description: "Maior loja de Sorcery do RJ",
        coords: { lat: -22.9029, lng: -43.1780 }
    },
    {
        name: "Cripta Arcana",
        type: "Singles",
        address: "Rua do Ouvidor, 138 - Centro",
        city: "Rio de Janeiro",
        state: "RJ",
        cep: "20040-030",
        url: "https://www.criptaarcana.com.br",
        hasEvents: false,
        description: "Especialista em cards avulsos",
        coords: { lat: -22.9032, lng: -43.1753 }
    },

    // MINAS GERAIS
    {
        name: "Paladins Games",
        type: "Sealed/Singles",
        address: "Av. Afonso Pena, 4000 - Mangabeiras",
        city: "Belo Horizonte",
        state: "MG",
        cep: "30130-009",
        url: "https://paladinsgames.com.br/card-games-sorcery-contested-realm",
        hasEvents: true,
        description: "Cards e jogos com torneios regulares",
        coords: { lat: -19.9396, lng: -43.9378 }
    },
    {
        name: "DMG Card Shop",
        type: "Singles",
        address: "Rua da Bahia, 1500 - Lourdes",
        city: "Belo Horizonte",
        state: "MG",
        cep: "30160-011",
        url: "https://www.dmgcardshop.com.br",
        hasEvents: false,
        description: "Cards avulsos de Sorcery",
        coords: { lat: -19.9245, lng: -43.9395 }
    },
    {
        name: "Kaiju TCG",
        type: "Singles",
        address: "Av. do Contorno, 2905 - Santa Efigênia",
        city: "Belo Horizonte",
        state: "MG",
        cep: "30110-080",
        url: "https://www.kaijutcg.com.br",
        hasEvents: true,
        description: "Cards avulsos e torneios",
        coords: { lat: -19.9188, lng: -43.9327 }
    },

    // PARANÁ
    {
        name: "Covil do Mago",
        type: "Sealed/Singles",
        address: "Rua XV de Novembro, 1234 - Centro",
        city: "Curitiba",
        state: "PR",
        cep: "80020-310",
        url: "https://www.covildomagohobbystore.com.br",
        hasEvents: true,
        description: "Cupom: OLDGUY5 - Produtos Sorcery completos",
        coords: { lat: -25.4297, lng: -49.2711 }
    },

    // RIO GRANDE DO SUL
    {
        name: "Forja Hobby Store",
        type: "Sealed",
        address: "Av. Protásio Alves, 3800 - Petrópolis",
        city: "Porto Alegre",
        state: "RS",
        cep: "90410-006",
        url: "https://www.forjahobbystore.com.br",
        hasEvents: true,
        description: "Boosters e precons de Sorcery",
        coords: { lat: -30.0451, lng: -51.1829 }
    },

    // SANTA CATARINA
    {
        name: "Toca do Yeti",
        type: "Acessórios",
        address: "Rua Felipe Schmidt, 515 - Centro",
        city: "Florianópolis",
        state: "SC",
        cep: "88010-000",
        url: "https://www.tocadoyeti.com.br",
        hasEvents: false,
        description: "Playmats personalizados e acessórios",
        coords: { lat: -27.5949, lng: -48.5482 }
    },

    // DISTRITO FEDERAL
    {
        name: "CHQ Jogos",
        type: "Sealed/Singles",
        address: "CLN 208 Bloco D - Asa Norte",
        city: "Brasília",
        state: "DF",
        cep: "70854-540",
        url: "https://www.chqjogos.com.br",
        hasEvents: true,
        description: "Board games e TCG com espaço para eventos",
        coords: { lat: -15.8452, lng: -47.8872 }
    }
];

// Lojas apenas online (sem endereço físico)
const ONLINE_ONLY_STORES = [
    {
        name: "Btn's Oficial",
        type: "Acessórios",
        url: "https://www.btnsoficial.com.br",
        description: "Acessórios para TCG - apenas online"
    },
    {
        name: "Ateliê 3D Verso",
        type: "Acessórios",
        url: "https://www.instagram.com/atelie3dverso",
        description: "Cupom: EDY5 - Acessórios personalizados"
    }
];

// Combinar para compatibilidade com código existente
const BRAZILIAN_STORES = [...PHYSICAL_STORES, ...ONLINE_ONLY_STORES.map(s => ({
    ...s,
    city: "Online",
    state: "",
    isOnlineOnly: true
}))];

// Official links
const COMMUNITY_LINKS = {
    discord: "https://discord.gg/qvYVGFAS5n",
    officialSite: "https://sorcerytcg.com/",
    howToPlay: "https://sorcerytcg.com/how-to-play",
    events: "https://sorcerytcg.com/events",
    curiosa: "https://curiosa.io"
};

// Abrir endereço no Google Maps
function openInMaps(store) {
    if (!store) return;

    let query;
    if (store.coords) {
        // Se temos coordenadas, usar elas
        query = `${store.coords.lat},${store.coords.lng}`;
    } else if (store.address) {
        // Senão, usar o endereço completo
        query = encodeURIComponent(`${store.address}, ${store.city}, ${store.state}, Brasil`);
    } else {
        return;
    }

    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

    let url;
    if (isMobile) {
        // No mobile, tentar abrir o app do Google Maps
        url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    } else {
        // No desktop, abrir no navegador
        url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    window.open(url, '_blank');
}

// Obter link do Google Maps para um endereço
function getGoogleMapsUrl(store) {
    if (!store) return '#';

    let query;
    if (store.coords) {
        query = `${store.coords.lat},${store.coords.lng}`;
    } else if (store.address) {
        query = encodeURIComponent(`${store.address}, ${store.city}, ${store.state}, Brasil`);
    } else if (store.city) {
        query = encodeURIComponent(`${store.city}, ${store.state}, Brasil`);
    } else {
        return '#';
    }

    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

// Gerar embed do Google Maps (para iframe)
function getGoogleMapsEmbed(store) {
    if (!store || !store.coords) {
        return null;
    }

    // Usar embed sem API key (funciona com limitações)
    const { lat, lng } = store.coords;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}

// Initialize community features
function initCommunity() {
    renderStores();
    setupStoreFilters();
}

// Render stores grid (for community view)
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
