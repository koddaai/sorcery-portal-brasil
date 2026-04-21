// ============================================
// SORCERY PORTAL BRASIL - CLOUDFLARE WORKER PROXY
// Secure API proxy that hides NocoDB token
// ============================================

// IMPORTANTE: Configure estas variáveis no Cloudflare Dashboard
// Settings > Variables > Environment Variables (encrypted)
// - NOCODB_TOKEN: seu token da API NocoDB
// - NOCODB_BASE_URL: https://dados.kodda.ai
// - ALLOWED_ORIGINS: https://koddaai.github.io,https://sorcery.com.br,https://www.sorcery.com.br,http://localhost:8080

const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // máximo de requests por minuto

// Store para rate limiting (em produção, use KV ou Durable Objects)
const rateLimitStore = new Map();

export default {
    async fetch(request, env, ctx) {
        // CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS(request, env);
        }

        try {
            // 1. Validar origem
            const origin = request.headers.get('Origin');
            if (!isAllowedOrigin(origin, env)) {
                return new Response(JSON.stringify({
                    error: 'Forbidden',
                    message: 'Origin not allowed'
                }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 2. Rate limiting
            const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
            const rateLimitResult = checkRateLimit(clientIP);
            if (!rateLimitResult.allowed) {
                return new Response(JSON.stringify({
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds`,
                    retryAfter: rateLimitResult.retryAfter
                }), {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': rateLimitResult.retryAfter.toString(),
                        ...getCORSHeaders(origin, env)
                    }
                });
            }

            // 3. Extrair path da URL
            const url = new URL(request.url);
            const path = url.pathname;

            // 4. Validar path permitido
            if (!isAllowedPath(path)) {
                return new Response(JSON.stringify({
                    error: 'Forbidden',
                    message: 'Path not allowed'
                }), {
                    status: 403,
                    headers: {
                        'Content-Type': 'application/json',
                        ...getCORSHeaders(origin, env)
                    }
                });
            }

            // 5. Construir URL de destino
            const targetUrl = `${env.NOCODB_BASE_URL}${path}${url.search}`;

            // 6. Preparar headers para NocoDB
            const headers = new Headers();
            headers.set('xc-token', env.NOCODB_TOKEN);
            headers.set('Content-Type', 'application/json');

            // 7. Preparar body se necessário
            let body = null;
            if (request.method !== 'GET' && request.method !== 'HEAD') {
                body = await request.text();

                // Validar e sanitizar body
                if (body) {
                    try {
                        const parsed = JSON.parse(body);
                        body = JSON.stringify(sanitizeRequestBody(parsed));
                    } catch (e) {
                        return new Response(JSON.stringify({
                            error: 'Bad Request',
                            message: 'Invalid JSON body'
                        }), {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                ...getCORSHeaders(origin, env)
                            }
                        });
                    }
                }
            }

            // 8. Fazer request para NocoDB
            const response = await fetch(targetUrl, {
                method: request.method,
                headers: headers,
                body: body
            });

            // 9. Processar resposta
            const responseBody = await response.text();

            // 10. Retornar resposta com CORS headers
            return new Response(responseBody, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    'Content-Type': response.headers.get('Content-Type') || 'application/json',
                    ...getCORSHeaders(origin, env)
                }
            });

        } catch (error) {
            console.error('Proxy error:', error);
            return new Response(JSON.stringify({
                error: 'Internal Server Error',
                message: 'An error occurred processing your request'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCORSHeaders(request.headers.get('Origin'), env)
                }
            });
        }
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verifica se a origem é permitida
 */
function isAllowedOrigin(origin, env) {
    if (!origin) return false;

    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());

    // Permitir localhost em desenvolvimento
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
    }

    return allowedOrigins.some(allowed => {
        if (allowed === '*') return true;
        if (allowed === origin) return true;
        // Suportar wildcards simples
        if (allowed.startsWith('*.')) {
            const domain = allowed.slice(2);
            return origin.endsWith(domain);
        }
        return false;
    });
}

/**
 * Verifica se o path é permitido
 */
function isAllowedPath(path) {
    // Paths permitidos para a API NocoDB
    const allowedPatterns = [
        /^\/api\/v1\/db\/data\//, // Operações de dados
        /^\/api\/v1\/db\/meta\//, // Metadados (leitura)
    ];

    // Paths bloqueados (operações perigosas)
    const blockedPatterns = [
        /\/api\/v1\/db\/meta\/projects\/.*\/tables$/, // Criar/deletar tabelas
        /\/api\/v1\/db\/meta\/projects$/, // Criar/deletar projetos
        /bulk-delete/, // Bulk delete
        /bulk-update-all/, // Bulk update all
    ];

    // Verificar se está bloqueado
    if (blockedPatterns.some(pattern => pattern.test(path))) {
        return false;
    }

    // Verificar se está permitido
    return allowedPatterns.some(pattern => pattern.test(path));
}

/**
 * Rate limiting por IP
 */
function checkRateLimit(clientIP) {
    const now = Date.now();
    const key = `rate:${clientIP}`;

    let data = rateLimitStore.get(key);

    if (!data || now - data.windowStart > RATE_LIMIT_WINDOW) {
        // Nova janela
        data = {
            windowStart: now,
            count: 1
        };
        rateLimitStore.set(key, data);
        return { allowed: true };
    }

    data.count++;

    if (data.count > RATE_LIMIT_MAX_REQUESTS) {
        const retryAfter = Math.ceil((data.windowStart + RATE_LIMIT_WINDOW - now) / 1000);
        return { allowed: false, retryAfter };
    }

    rateLimitStore.set(key, data);
    return { allowed: true };
}

/**
 * Headers CORS
 */
function getCORSHeaders(origin, env) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, xc-token',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true'
    };
}

/**
 * Handler para preflight CORS
 */
function handleCORS(request, env) {
    const origin = request.headers.get('Origin');

    if (!isAllowedOrigin(origin, env)) {
        return new Response(null, { status: 403 });
    }

    return new Response(null, {
        status: 204,
        headers: getCORSHeaders(origin, env)
    });
}

/**
 * Sanitiza o body do request
 * Remove campos potencialmente perigosos
 */
function sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') return body;

    // Campos que não devem ser modificados diretamente
    const protectedFields = ['Id', 'created_at', 'updated_at', 'nc_'];

    // Se for array, sanitizar cada item
    if (Array.isArray(body)) {
        return body.map(item => sanitizeRequestBody(item));
    }

    // Sanitizar objeto
    const sanitized = {};
    for (const [key, value] of Object.entries(body)) {
        // Pular campos protegidos em creates
        if (protectedFields.some(f => key.startsWith(f))) {
            continue;
        }

        // Sanitizar strings (prevenir XSS básico)
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeRequestBody(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Sanitiza string removendo scripts
 */
function sanitizeString(str) {
    if (!str) return str;

    // Remover tags script
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}
