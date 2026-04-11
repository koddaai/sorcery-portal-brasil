// ============================================
// BRAZILIAN SORCERY TCG STORES & COMMUNITY
// ============================================
// Endereços verificados em Abril/2026 diretamente nos sites das lojas

// Lojas com endereço físico (para o localizador)
const PHYSICAL_STORES = [
    // SÃO PAULO - Capital
    {
        name: "Kirin Studio",
        type: "Sealed/Singles",
        address: "Rua Cotoxó, 774 - Perdizes (Garagem)",
        city: "São Paulo",
        state: "SP",
        phone: "(11) 98631-1370",
        url: "https://www.kirinstudio.com.br",
        hasEvents: false,
        description: "Cards, acessórios e produtos premium",
        coords: { lat: -23.5337, lng: -46.6789 }
    },
    {
        name: "Magic Domain",
        type: "Sealed/Singles",
        address: "Rua Domingos de Morais, 1837 - Vila Mariana",
        city: "São Paulo",
        state: "SP",
        phone: "(11) 5084-9864",
        url: "https://www.magicdomain.com.br",
        hasEvents: true,
        description: "Loja de TCG com torneios semanais",
        coords: { lat: -23.5957, lng: -46.6349 }
    },
    {
        name: "Flow Games",
        type: "Sealed/Singles",
        address: "Rua Dona Geniveva D'Ascolli, 17 - Vila Prudente",
        city: "São Paulo",
        state: "SP",
        phone: "(11) 91475-3637",
        url: "https://www.flowstore.com.br",
        hasEvents: true,
        description: "Loja especializada em TCG com espaço para torneios",
        coords: { lat: -23.5886, lng: -46.5866 }
    },

    // SÃO PAULO - Interior e Grande SP
    {
        name: "Mont Card Shop",
        type: "Sealed/Singles",
        address: "Rua Roxo Moreira, 1624",
        city: "Campinas",
        state: "SP",
        phone: "(19) 99777-8291",
        url: "https://www.montshop.com.br",
        hasEvents: true,
        description: "Grande variedade de produtos Sorcery, singles e selados",
        coords: { lat: -22.9099, lng: -47.0626 }
    },
    {
        name: "Cripta Arcana",
        type: "Singles",
        address: "Rua Lions Club, 255 - Vila Nova",
        city: "Campinas",
        state: "SP",
        phone: "(19) 99527-2369",
        url: "https://www.criptaarcana.com.br",
        hasEvents: false,
        description: "Especialista em cards avulsos",
        coords: { lat: -22.9145, lng: -47.0483 }
    },
    {
        name: "Monster Games Cards",
        type: "Sealed",
        address: "Rua Rio Branco, 678 - Centro",
        city: "Salto",
        state: "SP",
        phone: "(11) 94521-9428",
        url: "https://www.monstergamescards.com.br",
        hasEvents: false,
        description: "Produtos selados e boosters",
        coords: { lat: -23.1989, lng: -47.2923 }
    },
    {
        name: "Jogando TCG",
        type: "Acessórios",
        address: "Rua São Cristóvão, 115 - Jardim Patrícia",
        city: "Itaquaquecetuba",
        state: "SP",
        phone: "(11) 97074-2794",
        url: "https://www.jogandotcg.com.br",
        hasEvents: false,
        description: "Playmats, sleeves e deckboxes",
        coords: { lat: -23.4867, lng: -46.3486 }
    },
    {
        name: "Forja Hobby Store",
        type: "Sealed",
        address: "Av. José Ricci, 114 - Residencial Mais Parque Mirassol",
        city: "Mirassol",
        state: "SP",
        phone: "(17) 99122-3099",
        url: "https://www.forjahobbystore.com.br",
        hasEvents: true,
        description: "Boosters e precons de Sorcery",
        coords: { lat: -20.8183, lng: -49.5186 }
    },
    {
        name: "CHQ Jogos",
        type: "Sealed/Singles",
        address: "Santo André",
        city: "Santo André",
        state: "SP",
        phone: "(11) 4432-1653",
        url: "https://www.chqjogos.com.br",
        hasEvents: true,
        description: "Board games e TCG com espaço para eventos",
        coords: { lat: -23.6528, lng: -46.5289 }
    },

    // RIO DE JANEIRO
    {
        name: "Bolsa do Infinito",
        type: "Sealed/Singles",
        address: "Rua Conde de Bonfim, 685 - Tijuca (Loja D - Galeria)",
        city: "Rio de Janeiro",
        state: "RJ",
        phone: "(21) 3082-5091",
        url: "https://www.bolsadoinfinito.com.br",
        hasEvents: true,
        description: "Cards avulsos e acessórios para TCG",
        coords: { lat: -22.9256, lng: -43.2318 }
    },

    // CEARÁ
    {
        name: "Odisseia Neon",
        type: "Sealed/Singles",
        address: "Av. Raimundo Alcoforado, 341 - Alto Guaramiranga",
        city: "Canindé",
        state: "CE",
        phone: "(85) 92151-2249",
        url: "https://www.odisseianeonloja.com.br",
        hasEvents: true,
        description: "Maior loja de Sorcery do Ceará",
        coords: { lat: -4.3587, lng: -39.3138 }
    },

    // GOIÁS
    {
        name: "Paladins Games",
        type: "Sealed/Singles",
        address: "Rua S 01, nº 54, Sala 4, Ed. Free Shopp",
        city: "Goiânia",
        state: "GO",
        phone: "(62) 3954-1813",
        url: "https://paladinsgames.com.br/card-games-sorcery-contested-realm",
        hasEvents: true,
        description: "Cards e jogos com torneios regulares",
        coords: { lat: -16.6869, lng: -49.2648 }
    },

    // MINAS GERAIS
    {
        name: "DMG Card Shop",
        type: "Singles",
        address: "Rua Alferes Esteves, 278 - Centro (Loja)",
        city: "Pará de Minas",
        state: "MG",
        phone: "(37) 99967-2856",
        url: "https://www.dmgcardshop.com.br",
        hasEvents: false,
        description: "Cards avulsos de Sorcery e outros TCGs",
        coords: { lat: -19.8617, lng: -44.6092 }
    },

    // PARANÁ
    {
        name: "Paladino Hobbies",
        type: "Singles",
        address: "Rua Padre Anchieta, 2454 - Bigorrilho (Lj 24)",
        city: "Curitiba",
        state: "PR",
        phone: "(41) 3082-9520",
        url: "https://www.paladinohobbies.com.br",
        hasEvents: true,
        description: "Cards e hobbies em Curitiba",
        coords: { lat: -25.4372, lng: -49.2670 }
    },
    {
        name: "Covil do Mago",
        type: "Sealed/Singles",
        address: "Bauru (consultar endereço pelo telefone)",
        city: "Bauru",
        state: "SP",
        phone: "(14) 99690-4239",
        url: "https://www.covildomagohobbystore.com.br",
        hasEvents: true,
        description: "Cupom: OLDGUY5 - Produtos Sorcery completos",
        coords: { lat: -22.3246, lng: -49.0871 }
    }
];

// Lojas apenas online (sem endereço físico verificado)
const ONLINE_ONLY_STORES = [
    {
        name: "MYP Cards",
        type: "Singles",
        url: "https://www.mypcards.com/sorcery",
        description: "Especialista em singles de Sorcery - Loja online"
    },
    {
        name: "Toca do Yeti",
        type: "Acessórios",
        url: "https://www.tocadoyeti.com.br",
        description: "Playmats personalizados e acessórios - Loja online"
    },
    {
        name: "Btn's Oficial",
        type: "Acessórios",
        url: "https://www.btnsoficial.com.br",
        description: "Acessórios para TCG - Loja online"
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
        query = `${store.coords.lat},${store.coords.lng}`;
    } else if (store.address) {
        query = encodeURIComponent(`${store.address}, ${store.city}, ${store.state}, Brasil`);
    } else {
        return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
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
            ${store.city && store.city !== 'Online' ? `<p class="store-location">${store.city}/${store.state}</p>` : ''}
            <div class="store-link">
                <i data-lucide="external-link"></i>
            </div>
        </a>
    `).join('');

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
