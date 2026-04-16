// ============================================
// SECURITY CONFIGURATION
// ============================================
//
// ⚠️  AVISO DE SEGURANÇA ⚠️
//
// Debug mode - set to false in production
// Can also be controlled via URL param ?debug=true
const DEBUG_MODE = (() => {
    const urlParams = new URLSearchParams(window.location?.search || '');
    return urlParams.get('debug') === 'true' || localStorage.getItem('sorcery-debug') === 'true';
})();

// Logger wrapper for conditional logging
const Logger = {
    debug: (...args) => DEBUG_MODE && console.log('[DEBUG]', ...args),
    info: (...args) => DEBUG_MODE && console.info('[INFO]', ...args),
    warn: (...args) => console.warn(...args), // Always show warnings
    error: (...args) => console.error(...args), // Always show errors
};

// Este arquivo contém configurações sensíveis.
// Em produção, você DEVE:
//
// 1. Criar um proxy backend para esconder API tokens
// 2. Nunca expor tokens no código cliente
// 3. Usar variáveis de ambiente no servidor
//
// Recomendação: Use Cloudflare Workers, Vercel Edge Functions,
// ou similar para criar um proxy que adiciona o token no servidor.
//
// Exemplo de proxy (Cloudflare Worker):
// ```
// export default {
//   async fetch(request) {
//     const url = new URL(request.url);
//     url.hostname = 'dados.kodda.ai';
//     return fetch(url, {
//       headers: { 'xc-token': env.NOCODB_TOKEN }
//     });
//   }
// }
// ```
// ============================================

// Detectar ambiente automaticamente
const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const isProduction = typeof window !== 'undefined' &&
    (window.location.hostname.includes('github.io') || window.location.hostname.includes('sorcery-portal'));

const SecurityConfig = {
    // Modo de operação
    // 'proxy' = usar proxy backend (recomendado para produção)
    // 'direct' = conexão direta com NocoDB (apenas desenvolvimento)
    mode: isProduction ? 'proxy' : 'direct',

    // API Configuration
    api: {
        // URLs baseadas no modo
        // IMPORTANTE: Após fazer deploy do proxy, atualize proxyUrl
        proxyUrl: 'https://sorcery-api-proxy.pedro-4e6.workers.dev',  // URL do Cloudflare Worker
        directUrl: 'https://dados.kodda.ai',

        // Getter para URL ativa
        get baseUrl() {
            return SecurityConfig.mode === 'proxy'
                ? SecurityConfig.api.proxyUrl
                : SecurityConfig.api.directUrl;
        },

        // Token - REMOVIDO por segurança
        // O token agora fica APENAS no Cloudflare Worker
        // Nunca commitar tokens no código!
        token: null,

        baseId: 'pybbgkutded1ay0',

        // Verificar se está usando proxy
        get isUsingProxy() {
            return SecurityConfig.mode === 'proxy';
        }
    },

    // Password Hashing Configuration
    password: {
        // PBKDF2 parameters (mais seguro que SHA-256 simples)
        iterations: 100000,
        keyLength: 256,
        algorithm: 'SHA-256'
    },

    // Session Configuration
    session: {
        storageKey: 'sorcery-session',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        renewThreshold: 24 * 60 * 60 * 1000 // Renovar se < 1 dia restante
    },

    // Rate Limiting (client-side)
    rateLimit: {
        maxRequests: 100,
        windowMs: 60000, // 1 minuto
        loginAttempts: 5,
        loginWindowMs: 300000 // 5 minutos
    },

    // Input Validation
    validation: {
        maxUsernameLength: 50,
        maxEmailLength: 100,
        maxBioLength: 500,
        maxPostTitleLength: 100,
        maxPostContentLength: 5000,
        maxMessageLength: 2000,
        minPasswordLength: 8
    }
};

// ============================================
// SECURE PASSWORD HASHING (PBKDF2)
// ============================================

/**
 * Gera um salt aleatório
 * @returns {string} Salt em formato hex
 */
function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash de senha usando PBKDF2 (mais seguro que SHA-256 simples)
 * @param {string} password - Senha em texto plano
 * @param {string} salt - Salt único por usuário
 * @returns {Promise<string>} Hash da senha
 */
async function hashPasswordSecure(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);

    // Importar a senha como chave
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
    );

    // Derivar bits usando PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: SecurityConfig.password.iterations,
            hash: SecurityConfig.password.algorithm
        },
        keyMaterial,
        SecurityConfig.password.keyLength
    );

    // Converter para hex
    const hashArray = Array.from(new Uint8Array(derivedBits));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica se a senha corresponde ao hash
 * @param {string} password - Senha em texto plano
 * @param {string} salt - Salt do usuário
 * @param {string} storedHash - Hash armazenado
 * @returns {Promise<boolean>} True se a senha está correta
 */
async function verifyPassword(password, salt, storedHash) {
    const hash = await hashPasswordSecure(password, salt);
    // Comparação em tempo constante para evitar timing attacks
    if (hash.length !== storedHash.length) return false;
    let result = 0;
    for (let i = 0; i < hash.length; i++) {
        result |= hash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return result === 0;
}

// ============================================
// RATE LIMITER
// ============================================

class RateLimiter {
    constructor() {
        this.requests = new Map(); // endpoint -> timestamps[]
        this.loginAttempts = new Map(); // email -> { count, firstAttempt }
    }

    /**
     * Verifica se a requisição deve ser permitida
     * @param {string} endpoint - Identificador do endpoint
     * @returns {boolean} True se permitido
     */
    checkLimit(endpoint = 'default') {
        const now = Date.now();
        const windowStart = now - SecurityConfig.rateLimit.windowMs;

        if (!this.requests.has(endpoint)) {
            this.requests.set(endpoint, []);
        }

        const timestamps = this.requests.get(endpoint);

        // Remover timestamps antigos
        const validTimestamps = timestamps.filter(t => t > windowStart);
        this.requests.set(endpoint, validTimestamps);

        if (validTimestamps.length >= SecurityConfig.rateLimit.maxRequests) {
            console.warn(`Rate limit exceeded for ${endpoint}`);
            return false;
        }

        validTimestamps.push(now);
        return true;
    }

    /**
     * Verifica tentativas de login
     * @param {string} email - Email do usuário
     * @returns {object} { allowed: boolean, remainingAttempts: number, waitTime: number }
     */
    checkLoginAttempt(email) {
        const now = Date.now();
        const data = this.loginAttempts.get(email);

        if (!data) {
            this.loginAttempts.set(email, { count: 1, firstAttempt: now });
            return { allowed: true, remainingAttempts: SecurityConfig.rateLimit.loginAttempts - 1, waitTime: 0 };
        }

        // Resetar se passou a janela de tempo
        if (now - data.firstAttempt > SecurityConfig.rateLimit.loginWindowMs) {
            this.loginAttempts.set(email, { count: 1, firstAttempt: now });
            return { allowed: true, remainingAttempts: SecurityConfig.rateLimit.loginAttempts - 1, waitTime: 0 };
        }

        if (data.count >= SecurityConfig.rateLimit.loginAttempts) {
            const waitTime = SecurityConfig.rateLimit.loginWindowMs - (now - data.firstAttempt);
            return { allowed: false, remainingAttempts: 0, waitTime: Math.ceil(waitTime / 1000) };
        }

        data.count++;
        return { allowed: true, remainingAttempts: SecurityConfig.rateLimit.loginAttempts - data.count, waitTime: 0 };
    }

    /**
     * Resetar tentativas de login após sucesso
     * @param {string} email - Email do usuário
     */
    resetLoginAttempts(email) {
        this.loginAttempts.delete(email);
    }
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitiza HTML para prevenir XSS
 * @param {string} text - Texto a ser sanitizado
 * @returns {string} Texto seguro
 */
function sanitizeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Valida e sanitiza input de usuário
 * @param {string} input - Input do usuário
 * @param {object} options - Opções de validação
 * @returns {object} { valid: boolean, value: string, error: string }
 */
function validateInput(input, options = {}) {
    const {
        maxLength = 1000,
        minLength = 0,
        required = false,
        type = 'text', // text, email, username
        allowHtml = false
    } = options;

    let value = input?.toString().trim() || '';

    // Verificar se é obrigatório
    if (required && !value) {
        return { valid: false, value: '', error: 'Campo obrigatório' };
    }

    // Verificar tamanho
    if (value.length < minLength) {
        return { valid: false, value, error: `Mínimo de ${minLength} caracteres` };
    }

    if (value.length > maxLength) {
        return { valid: false, value: value.substring(0, maxLength), error: `Máximo de ${maxLength} caracteres` };
    }

    // Validar tipo
    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, value, error: 'Email inválido' };
        }
    }

    if (type === 'username') {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(value)) {
            return { valid: false, value, error: 'Username pode conter apenas letras, números, _ e -' };
        }
    }

    // Sanitizar se necessário
    if (!allowHtml) {
        value = sanitizeHtml(value);
    }

    return { valid: true, value, error: null };
}

/**
 * Valida senha
 * @param {string} password - Senha a ser validada
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
    const errors = [];

    if (!password || password.length < SecurityConfig.validation.minPasswordLength) {
        errors.push(`Mínimo de ${SecurityConfig.validation.minPasswordLength} caracteres`);
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Deve conter pelo menos um número');
    }

    return { valid: errors.length === 0, errors };
}

// ============================================
// CSRF PROTECTION
// ============================================

/**
 * Configuração CSRF
 */
const CSRFConfig = {
    tokenKey: 'sorcery-csrf-token',
    headerName: 'X-CSRF-Token',
    customHeaderName: 'X-Requested-With',
    customHeaderValue: 'SorceryPortal',
    allowedOrigins: [
        'https://koddaai.github.io',
        'https://sorcery-portal.com.br',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ]
};

/**
 * Gera um token CSRF único
 * @returns {string} Token CSRF
 */
function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');

    // Armazenar token com timestamp
    const tokenData = {
        token,
        created: Date.now(),
        expires: Date.now() + (60 * 60 * 1000) // 1 hora
    };
    sessionStorage.setItem(CSRFConfig.tokenKey, JSON.stringify(tokenData));

    return token;
}

/**
 * Obtém o token CSRF atual ou gera um novo
 * @returns {string} Token CSRF válido
 */
function getCSRFToken() {
    try {
        const tokenData = sessionStorage.getItem(CSRFConfig.tokenKey);
        if (tokenData) {
            const { token, expires } = JSON.parse(tokenData);
            if (Date.now() < expires) {
                return token;
            }
        }
    } catch (e) {
        console.warn('[CSRF] Error reading token:', e);
    }

    return generateCSRFToken();
}

/**
 * Valida o token CSRF
 * @param {string} token - Token a ser validado
 * @returns {boolean} True se válido
 */
function validateCSRFToken(token) {
    try {
        const tokenData = sessionStorage.getItem(CSRFConfig.tokenKey);
        if (!tokenData) return false;

        const { token: storedToken, expires } = JSON.parse(tokenData);

        // Verificar expiração
        if (Date.now() > expires) {
            sessionStorage.removeItem(CSRFConfig.tokenKey);
            return false;
        }

        // Comparação em tempo constante
        if (token.length !== storedToken.length) return false;
        let result = 0;
        for (let i = 0; i < token.length; i++) {
            result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
        }
        return result === 0;
    } catch (e) {
        console.warn('[CSRF] Error validating token:', e);
        return false;
    }
}

/**
 * Adiciona headers de segurança a uma requisição
 * @param {Headers|Object} headers - Headers existentes
 * @returns {Object} Headers com proteções adicionadas
 */
function addSecurityHeaders(headers = {}) {
    const secureHeaders = { ...headers };

    // Adicionar custom header para identificar requisições legítimas
    secureHeaders[CSRFConfig.customHeaderName] = CSRFConfig.customHeaderValue;

    // Adicionar CSRF token para requisições mutativas
    secureHeaders[CSRFConfig.headerName] = getCSRFToken();

    return secureHeaders;
}

/**
 * Verifica se a origem da requisição é permitida
 * @param {string} origin - Origem da requisição
 * @returns {boolean} True se permitida
 */
function isAllowedOrigin(origin) {
    if (!origin) return false;

    // Permitir localhost em desenvolvimento
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
    }

    return CSRFConfig.allowedOrigins.includes(origin);
}

/**
 * Fetch seguro com proteções CSRF
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções do fetch
 * @returns {Promise<Response>} Resposta da requisição
 */
async function secureFetch(url, options = {}) {
    // Verificar rate limiting
    if (!rateLimiter.checkLimit(url)) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    // Preparar headers com proteções
    const headers = new Headers(options.headers || {});

    // Adicionar headers de segurança
    headers.set(CSRFConfig.customHeaderName, CSRFConfig.customHeaderValue);

    // Para requisições mutativas, adicionar CSRF token
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())) {
        headers.set(CSRFConfig.headerName, getCSRFToken());
    }

    // Executar requisição
    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin' // Não enviar cookies para outras origens
    });

    return response;
}

/**
 * Wrapper para o nocoDBService que adiciona proteções
 * @param {function} apiCall - Função de chamada à API
 * @returns {Promise<any>} Resultado da chamada
 */
async function secureAPICall(apiCall) {
    // Verificar rate limit
    if (!rateLimiter.checkLimit('api')) {
        throw new Error('Muitas requisições. Aguarde um momento.');
    }

    try {
        return await apiCall();
    } catch (error) {
        // Log de erros de segurança
        if (error.message.includes('401') || error.message.includes('403')) {
            console.error('[Security] Authentication/Authorization error:', error);
        }
        throw error;
    }
}

// ============================================
// SECURE SESSION MANAGEMENT
// ============================================

/**
 * Salva sessão de forma segura
 * @param {object} user - Dados do usuário
 */
function saveSecureSession(user) {
    const session = {
        ...user,
        // Não armazenar dados sensíveis
        password_hash: undefined,
        salt: undefined,
        // Adicionar metadados de sessão
        _sessionCreated: Date.now(),
        _sessionExpires: Date.now() + SecurityConfig.session.maxAge
    };

    localStorage.setItem(SecurityConfig.session.storageKey, JSON.stringify(session));
}

/**
 * Carrega sessão de forma segura
 * @returns {object|null} Dados do usuário ou null se expirada
 */
function loadSecureSession() {
    try {
        const sessionData = localStorage.getItem(SecurityConfig.session.storageKey);
        if (!sessionData) return null;

        const session = JSON.parse(sessionData);

        // Verificar expiração
        if (session._sessionExpires && Date.now() > session._sessionExpires) {
            localStorage.removeItem(SecurityConfig.session.storageKey);
            return null;
        }

        // Renovar sessão se necessário
        if (session._sessionExpires - Date.now() < SecurityConfig.session.renewThreshold) {
            session._sessionExpires = Date.now() + SecurityConfig.session.maxAge;
            localStorage.setItem(SecurityConfig.session.storageKey, JSON.stringify(session));
        }

        return session;
    } catch (error) {
        console.error('Error loading session:', error);
        return null;
    }
}

/**
 * Remove sessão
 */
function clearSecureSession() {
    localStorage.removeItem(SecurityConfig.session.storageKey);
}

// ============================================
// GLOBAL RATE LIMITER INSTANCE
// ============================================

const rateLimiter = new RateLimiter();

// Make Logger globally available
window.Logger = Logger;
window.DEBUG_MODE = DEBUG_MODE;

// ============================================
// EXPORTS
// ============================================

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEBUG_MODE,
        Logger,
        SecurityConfig,
        CSRFConfig,
        generateSalt,
        hashPasswordSecure,
        verifyPassword,
        RateLimiter,
        rateLimiter,
        sanitizeHtml,
        validateInput,
        validatePassword,
        saveSecureSession,
        loadSecureSession,
        clearSecureSession,
        // CSRF exports
        generateCSRFToken,
        getCSRFToken,
        validateCSRFToken,
        addSecurityHeaders,
        isAllowedOrigin,
        secureFetch,
        secureAPICall
    };
}

// Initialize CSRF token on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Generate initial CSRF token
        getCSRFToken();
        console.log('[Security] CSRF protection initialized');
    });
}
