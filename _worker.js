// Sorcery Portal Brasil - Dynamic Open Graph Worker
// Injeta meta tags dinâmicos para compartilhamento em redes sociais

const SITE_URL = 'https://sorcery.com.br';
const DEFAULT_IMAGE = 'https://sorcery.com.br/hero-bg.jpg';
const SITE_NAME = 'Sorcery: Contested Realm Brasil';

// Configurações de meta tags por view
const VIEW_META = {
  home: {
    title: 'Sorcery: Contested Realm Brasil',
    description: 'Seu hub completo de Sorcery TCG no Brasil. Gerencie sua coleção, monte decks, encontre lojas e conecte-se com a comunidade.',
    image: DEFAULT_IMAGE
  },
  cards: {
    title: 'Catálogo de Cards | Sorcery: Contested Realm Brasil',
    description: 'Explore todos os 1100+ cards de Sorcery: Contested Realm. Filtre por set, elemento, raridade e muito mais.',
    image: DEFAULT_IMAGE
  },
  art: {
    title: 'Galeria de Artistas | Sorcery: Contested Realm Brasil',
    description: 'Descubra os mestres por trás das obras de Sorcery. Cada carta é uma pintura original feita à mão com técnicas tradicionais.',
    image: DEFAULT_IMAGE
  },
  decks: {
    title: 'Explorar Decks | Sorcery: Contested Realm Brasil',
    description: 'Encontre decks competitivos, tier lists e estratégias para dominar Sorcery: Contested Realm.',
    image: DEFAULT_IMAGE
  },
  collection: {
    title: 'Minha Coleção | Sorcery: Contested Realm Brasil',
    description: 'Gerencie sua coleção de Sorcery TCG. Rastreie cards, valores e progresso de completude.',
    image: DEFAULT_IMAGE
  },
  community: {
    title: 'Lojas de Sorcery no Brasil | Sorcery: Contested Realm Brasil',
    description: 'Encontre lojas brasileiras que vendem Sorcery: Contested Realm. Mapa interativo com preços e contatos.',
    image: DEFAULT_IMAGE
  },
  meta: {
    title: 'Meta & Tier List | Sorcery: Contested Realm Brasil',
    description: 'Acompanhe o metagame atual de Sorcery TCG. Tier lists, decks populares e análises da comunidade.',
    image: DEFAULT_IMAGE
  },
  codex: {
    title: 'Codex de Regras | Sorcery: Contested Realm Brasil',
    description: 'Todas as regras e mecânicas de Sorcery: Contested Realm explicadas em português.',
    image: DEFAULT_IMAGE
  },
  trade: {
    title: 'Sistema de Trocas | Sorcery: Contested Realm Brasil',
    description: 'Organize suas trocas de cards de Sorcery. Marque cards que você tem e quer trocar.',
    image: DEFAULT_IMAGE
  },
  wishlist: {
    title: 'Wishlist | Sorcery: Contested Realm Brasil',
    description: 'Sua lista de desejos de Sorcery TCG. Acompanhe os cards que você mais quer.',
    image: DEFAULT_IMAGE
  },
  stats: {
    title: 'Estatísticas da Coleção | Sorcery: Contested Realm Brasil',
    description: 'Visualize estatísticas detalhadas da sua coleção de Sorcery TCG.',
    image: DEFAULT_IMAGE
  },
  news: {
    title: 'Notícias | Sorcery: Contested Realm Brasil',
    description: 'Últimas notícias e atualizações do mundo de Sorcery: Contested Realm.',
    image: DEFAULT_IMAGE
  }
};

// Detecta crawlers de redes sociais
function isSocialCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes('whatsapp') ||
    ua.includes('facebookexternalhit') ||
    ua.includes('facebot') ||
    ua.includes('twitterbot') ||
    ua.includes('linkedinbot') ||
    ua.includes('telegrambot') ||
    ua.includes('slackbot') ||
    ua.includes('discordbot') ||
    ua.includes('pinterest') ||
    ua.includes('googlebot') ||
    ua.includes('bingbot')
  );
}

// Gera meta tags HTML
function generateMetaTags(meta) {
  return `
    <!-- Primary Meta Tags -->
    <title>${meta.title}</title>
    <meta name="title" content="${meta.title}">
    <meta name="description" content="${meta.description}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${meta.url}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:locale" content="pt_BR">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${meta.url}">
    <meta property="twitter:title" content="${meta.title}">
    <meta property="twitter:description" content="${meta.description}">
    <meta property="twitter:image" content="${meta.image}">
  `;
}

// Extrai meta tags baseado nos parâmetros da URL
function getMetaFromParams(url) {
  const params = url.searchParams;
  const view = params.get('view') || params.get('v') || 'home';

  // Base meta from view
  let meta = { ...VIEW_META[view] } || { ...VIEW_META.home };
  meta.url = url.toString();
  meta.image = meta.image || DEFAULT_IMAGE;

  // Customizações específicas por parâmetro
  const artist = params.get('artist');
  const card = params.get('card');
  const deck = params.get('deck');
  const set = params.get('set');
  const element = params.get('element');

  // Artista específico
  if (artist) {
    meta.title = `${artist} | Artistas de Sorcery`;
    meta.description = `Explore as obras de ${artist} em Sorcery: Contested Realm. Veja todos os cards ilustrados por este artista.`;
  }

  // Card específico
  if (card) {
    meta.title = `${card} | Sorcery: Contested Realm Brasil`;
    meta.description = `Detalhes do card ${card} de Sorcery: Contested Realm. Veja arte, preço e informações.`;
  }

  // Deck específico
  if (deck) {
    meta.title = `Deck: ${deck} | Sorcery: Contested Realm Brasil`;
    meta.description = `Confira o deck ${deck} para Sorcery: Contested Realm. Estratégia, lista e dicas.`;
  }

  // Filtro por set
  if (set && view === 'cards') {
    meta.title = `Cards de ${set} | Sorcery: Contested Realm Brasil`;
    meta.description = `Explore todos os cards do set ${set} de Sorcery: Contested Realm.`;
  }

  // Filtro por elemento
  if (element && view === 'cards') {
    const elementNames = { fire: 'Fogo', water: 'Água', earth: 'Terra', air: 'Ar' };
    const elementName = elementNames[element.toLowerCase()] || element;
    meta.title = `Cards de ${elementName} | Sorcery: Contested Realm Brasil`;
    meta.description = `Explore todos os cards do elemento ${elementName} em Sorcery: Contested Realm.`;
  }

  return meta;
}

// Injeta meta tags no HTML
function injectMetaTags(html, meta) {
  const metaTags = generateMetaTags(meta);

  // Remove meta tags existentes que vamos substituir
  html = html.replace(/<title>.*?<\/title>/i, '');
  html = html.replace(/<meta\s+name="title"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta\s+property="twitter:[^"]*"[^>]*>/gi, '');

  // Injeta novos meta tags após <head>
  html = html.replace(/<head>/i, `<head>${metaTags}`);

  return html;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';

    // Só processa se for crawler E tiver parâmetros de view
    const hasViewParams = url.searchParams.has('view') ||
                          url.searchParams.has('v') ||
                          url.searchParams.has('artist') ||
                          url.searchParams.has('card') ||
                          url.searchParams.has('deck');

    if (isSocialCrawler(userAgent) && hasViewParams) {
      try {
        // Busca o HTML original
        const assetUrl = new URL('/', url.origin);
        const response = await env.ASSETS.fetch(new Request(assetUrl, request));

        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          let html = await response.text();
          const meta = getMetaFromParams(url);
          html = injectMetaTags(html, meta);

          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html;charset=UTF-8',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      } catch (error) {
        console.error('Error processing meta tags:', error);
      }
    }

    // Para requisições normais, deixa o Cloudflare Pages servir os assets
    return env.ASSETS.fetch(request);
  }
};
