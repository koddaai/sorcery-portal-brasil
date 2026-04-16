// Sorcery Portal Brasil - NocoDB API Proxy
// Este Worker atua como proxy seguro para a API do NocoDB

const NOCODB_BASE_URL = 'https://dados.kodda.ai/api/v2';
const ALLOWED_ORIGINS = [
  'https://sorcery.com.br',
  'https://www.sorcery.com.br',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

function getCorsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || (origin && origin.endsWith('.sorcery.com.br'));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, xc-token',
    'Access-Control-Max-Age': '86400',
  };
}

// Security headers for API responses
function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, max-age=0',
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }

    const path = url.pathname;
    if (!path || path === '/') {
      return new Response(JSON.stringify({
        status: 'ok', service: 'Sorcery API Proxy', version: '1.0.0'
      }), { headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) } });
    }

    const nocodbUrl = NOCODB_BASE_URL + path + url.search;
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('xc-token', env.NOCODB_TOKEN);

    try {
      const resp = await fetch(nocodbUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined
      });

      const respHeaders = new Headers({
        ...getCorsHeaders(origin),
        ...getSecurityHeaders(),
        'Content-Type': resp.headers.get('Content-Type') || 'application/json'
      });
      return new Response(resp.body, { status: resp.status, headers: respHeaders });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({ error: 'Proxy error', message: error.message }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }
  }
};
