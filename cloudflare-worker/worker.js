// Sorcery Portal Brasil - NocoDB API Proxy + Email Service
// Este Worker atua como proxy seguro para a API do NocoDB
// e envia emails de reset de senha via Resend
//
// ⚠️ SEGURANÇA: Este proxy implementa whitelist de endpoints
// para prevenir acesso não autorizado aos dados

const NOCODB_BASE_URL = 'https://dados.kodda.ai';
const NOCODB_BASE_ID = 'pybbgkutded1ay0';
const FRONTEND_URL = 'https://sorcery.com.br';

// ============================================
// SEGURANÇA: Apenas origens de produção
// Localhost removido para prevenir ataques
// ============================================
const ALLOWED_ORIGINS = [
  'https://sorcery.com.br',
  'https://www.sorcery.com.br',
  'https://koddaai.github.io'
];

// ============================================
// WHITELIST DE TABELAS E OPERAÇÕES
// ============================================
const TABLE_PERMISSIONS = {
  // BLOQUEADO: Nunca permitir acesso direto
  'users': {
    blocked: true,
    reason: 'Acesso direto à tabela de usuários não permitido'
  },

  // Coleção: usuário só acessa seus próprios dados
  'collection': {
    GET: { requireUserId: true },
    POST: { requireUserId: true },
    PATCH: { requireUserId: true, ownerOnly: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Wishlist: usuário só acessa seus próprios dados
  'wishlist': {
    GET: { requireUserId: true },
    POST: { requireUserId: true },
    PATCH: { requireUserId: true, ownerOnly: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Trade binder: usuário só acessa seus próprios dados
  'trade_binder': {
    GET: { requireUserId: true },
    POST: { requireUserId: true },
    PATCH: { requireUserId: true, ownerOnly: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Decks: leitura pública, escrita restrita
  'decks': {
    GET: { public: true },
    POST: { requireUserId: true },
    PATCH: { requireUserId: true, ownerOnly: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Perfis: leitura pública, escrita restrita
  'profiles': {
    GET: { public: true },
    POST: { requireUserId: true },
    PATCH: { requireUserId: true, ownerOnly: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Fórum posts: leitura pública, escrita autenticada
  'forum_posts': {
    GET: { public: true },
    POST: { requireUserId: true },
    PATCH: { requireUserId: true, ownerOnly: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Fórum comentários: leitura pública, escrita autenticada
  'forum_comments': {
    GET: { public: true },
    POST: { requireUserId: true },
    PATCH: { requireUserId: true, ownerOnly: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Trade listings: leitura pública, escrita autenticada
  'trade_listings': {
    GET: { public: true },
    POST: { requireUserId: true },
    PATCH: { requireUserId: true, ownerOnly: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Mensagens: apenas próprias
  'messages': {
    GET: { requireUserId: true },
    POST: { requireUserId: true },
    PATCH: { blocked: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Card photos: leitura pública, escrita autenticada
  'card_photos': {
    GET: { public: true },
    POST: { requireUserId: true },
    PATCH: { blocked: true },
    DELETE: { requireUserId: true, ownerOnly: true }
  },

  // Reputação: leitura pública, escrita restrita
  'reputation': {
    GET: { public: true },
    POST: { requireUserId: true },
    PATCH: { blocked: true },
    DELETE: { blocked: true }
  }
};

// ============================================
// RATE LIMITING (simples, por IP)
// ============================================
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 requests por minuto

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { timestamp: now, count: 1 });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// ============================================
// FUNÇÕES DE SEGURANÇA
// ============================================

function getCorsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
    (origin && origin.endsWith('.sorcery.com.br'));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, max-age=0',
  };
}

// Extrair nome da tabela do path
function extractTableName(path) {
  // Path format: /api/v1/db/data/noco/{baseId}/{tableName}/...
  const match = path.match(/\/api\/v1\/db\/data\/noco\/[^/]+\/([^/]+)/);
  return match ? match[1] : null;
}

// Extrair ID do registro do path
function extractRecordId(path) {
  // Path format: /api/v1/db/data/noco/{baseId}/{tableName}/{recordId}
  const match = path.match(/\/api\/v1\/db\/data\/noco\/[^/]+\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

// Verificar permissões
function checkPermissions(tableName, method, userId, path) {
  const tableConfig = TABLE_PERMISSIONS[tableName];

  // Tabela não configurada = bloqueada por padrão
  if (!tableConfig) {
    return { allowed: false, reason: `Tabela '${tableName}' não permitida` };
  }

  // Tabela completamente bloqueada
  if (tableConfig.blocked) {
    return { allowed: false, reason: tableConfig.reason };
  }

  const methodConfig = tableConfig[method];

  // Método não configurado = bloqueado
  if (!methodConfig) {
    return { allowed: false, reason: `Método ${method} não permitido para '${tableName}'` };
  }

  // Método bloqueado
  if (methodConfig.blocked) {
    return { allowed: false, reason: `Método ${method} bloqueado para '${tableName}'` };
  }

  // Acesso público
  if (methodConfig.public) {
    return { allowed: true };
  }

  // Requer userId
  if (methodConfig.requireUserId && !userId) {
    return { allowed: false, reason: 'Autenticação necessária' };
  }

  return { allowed: true, requireOwnerCheck: methodConfig.ownerOnly };
}

// Gerar token seguro para reset de senha
function generateResetToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// FUNÇÕES DE BANCO DE DADOS (internas)
// ============================================

async function findUserByEmail(email, env) {
  const url = `${NOCODB_BASE_URL}/api/v1/db/data/noco/${NOCODB_BASE_ID}/users?where=(email,eq,${encodeURIComponent(email)})`;

  const resp = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'xc-token': env.NOCODB_TOKEN
    }
  });

  if (!resp.ok) return null;

  const data = await resp.json();
  return data.list && data.list.length > 0 ? data.list[0] : null;
}

async function updateUserResetToken(userId, token, env) {
  const url = `${NOCODB_BASE_URL}/api/v1/db/data/noco/${NOCODB_BASE_ID}/users/${userId}`;

  const resp = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': env.NOCODB_TOKEN
    },
    body: JSON.stringify({
      reset_token: token,
      reset_token_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    })
  });

  return resp.ok;
}

// ============================================
// EMAIL SERVICE
// ============================================

async function sendResetEmail(email, token, displayName, env) {
  const resetLink = `${FRONTEND_URL}/#reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Sorcery Portal Brasil <noreply@sorcery.com.br>',
      to: [email],
      subject: 'Redefinir sua senha - Sorcery Portal Brasil',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a;">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4a 100%);">
                      <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 700;">
                        Sorcery Portal Brasil
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px 40px;">
                      <p style="color: #ffffff; font-size: 18px; margin: 0 0 10px;">
                        Olá${displayName ? `, <strong>${displayName}</strong>` : ''}!
                      </p>
                      <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetLink}"
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #0a0a0f; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                              Redefinir Senha
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                        Este link expira em <strong style="color: #ffffff;">1 hora</strong>.
                      </p>
                      <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 10px 0 0;">
                        Se você não solicitou esta redefinição, ignore este email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px 40px; background-color: #0f0f1a; border-top: 1px solid #2a2a4a;">
                      <p style="color: #666; font-size: 12px; margin: 0; text-align: center;">
                        Sorcery Portal Brasil
                      </p>
                      <p style="color: #444; font-size: 11px; margin: 10px 0 0; text-align: center;">
                        <a href="${resetLink}" style="color: #d4af37; word-break: break-all;">${resetLink}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })
  });

  if (!resp.ok) {
    const error = await resp.text();
    console.error('Resend error:', error);
    return { success: false, error };
  }

  return { success: true };
}

// ============================================
// AUTH HANDLERS
// ============================================

async function handleSendResetEmail(request, env, origin) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    const user = await findUserByEmail(email, env);

    // Sempre retornar sucesso (segurança - não revelar se email existe)
    if (!user) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá as instruções.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    const token = generateResetToken();
    const saved = await updateUserResetToken(user.Id, token, env);

    if (!saved) {
      return new Response(JSON.stringify({ error: 'Erro ao processar solicitação' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    const emailResult = await sendResetEmail(email, token, user.display_name, env);

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      return new Response(JSON.stringify({ error: 'Erro ao enviar email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá as instruções.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
    });

  } catch (error) {
    console.error('Reset email error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
    });
  }
}

async function handleVerifyResetToken(request, env, origin) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return new Response(JSON.stringify({ valid: false, error: 'Dados incompletos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    const user = await findUserByEmail(email, env);

    if (!user || user.reset_token !== token) {
      return new Response(JSON.stringify({ valid: false, error: 'Token inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return new Response(JSON.stringify({ valid: false, error: 'Token expirado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
    });
  }
}

async function handleResetPassword(request, env, origin) {
  try {
    const { email, token, passwordHash, passwordSalt } = await request.json();

    if (!email || !token || !passwordHash || !passwordSalt) {
      return new Response(JSON.stringify({ success: false, error: 'Dados incompletos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    const user = await findUserByEmail(email, env);

    if (!user || user.reset_token !== token) {
      return new Response(JSON.stringify({ success: false, error: 'Token inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return new Response(JSON.stringify({ success: false, error: 'Token expirado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    const url = `${NOCODB_BASE_URL}/api/v1/db/data/noco/${NOCODB_BASE_ID}/users/${user.Id}`;

    const resp = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'xc-token': env.NOCODB_TOKEN
      },
      body: JSON.stringify({
        password_hash: passwordHash,
        password_salt: passwordSalt,
        reset_token: null,
        reset_token_expires: null
      })
    });

    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: 'Erro ao atualizar senha' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Senha redefinida com sucesso!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
    });
  }
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }

    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Aguarde 1 minuto.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin), ...getSecurityHeaders() }
      });
    }

    const path = url.pathname;

    // Status endpoint
    if (!path || path === '/') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'Sorcery API Proxy',
        version: '3.0.0',
        security: 'whitelist-enabled'
      }), { headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) } });
    }

    // Auth endpoints (rotas especiais)
    if (path === '/auth/send-reset-email' && request.method === 'POST') {
      return handleSendResetEmail(request, env, origin);
    }

    if (path === '/auth/verify-reset-token' && request.method === 'POST') {
      return handleVerifyResetToken(request, env, origin);
    }

    if (path === '/auth/reset-password' && request.method === 'POST') {
      return handleResetPassword(request, env, origin);
    }

    // ============================================
    // PROXY SEGURO PARA NOCODB
    // ============================================

    // Extrair informações do request
    const tableName = extractTableName(path);
    const recordId = extractRecordId(path);
    const userId = request.headers.get('X-User-Id');

    // Verificar se é um path válido de NocoDB
    if (!path.startsWith('/api/v1/db/data/noco/')) {
      return new Response(JSON.stringify({ error: 'Endpoint não permitido' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin), ...getSecurityHeaders() }
      });
    }

    // Verificar se a tabela está na whitelist
    if (!tableName) {
      return new Response(JSON.stringify({ error: 'Tabela não especificada' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin), ...getSecurityHeaders() }
      });
    }

    // Verificar permissões
    const permission = checkPermissions(tableName, request.method, userId, path);

    if (!permission.allowed) {
      console.log(`[BLOCKED] ${request.method} ${tableName} - ${permission.reason} - IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: permission.reason }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin), ...getSecurityHeaders() }
      });
    }

    // Para operações que requerem userId, adicionar filtro automaticamente em GETs
    let finalUrl = NOCODB_BASE_URL + path + url.search;

    if (permission.allowed && userId && request.method === 'GET') {
      // Adicionar filtro de user_id para tabelas que requerem
      const tableConfig = TABLE_PERMISSIONS[tableName];
      if (tableConfig && tableConfig.GET && tableConfig.GET.requireUserId) {
        const separator = url.search ? '&' : '?';
        finalUrl += `${separator}where=(user_id,eq,${userId})`;
      }
    }

    // Fazer request para NocoDB
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('xc-token', env.NOCODB_TOKEN);

    try {
      let body = null;

      // Para POST/PATCH, verificar e injetar user_id se necessário
      if (request.method === 'POST' || request.method === 'PATCH') {
        const bodyText = await request.text();
        if (bodyText) {
          try {
            const bodyJson = JSON.parse(bodyText);

            // Injetar user_id em criações se não existir
            if (request.method === 'POST' && userId && !bodyJson.user_id) {
              bodyJson.user_id = userId;
            }

            // Verificar que user não está tentando modificar dados de outro usuário
            if (permission.requireOwnerCheck && bodyJson.user_id && bodyJson.user_id !== userId) {
              return new Response(JSON.stringify({ error: 'Não autorizado a modificar dados de outro usuário' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin), ...getSecurityHeaders() }
              });
            }

            body = JSON.stringify(bodyJson);
          } catch (e) {
            body = bodyText;
          }
        }
      }

      const resp = await fetch(finalUrl, {
        method: request.method,
        headers: headers,
        body: body
      });

      const respHeaders = new Headers({
        ...getCorsHeaders(origin),
        ...getSecurityHeaders(),
        'Content-Type': resp.headers.get('Content-Type') || 'application/json'
      });

      return new Response(resp.body, { status: resp.status, headers: respHeaders });

    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(JSON.stringify({ error: 'Erro interno do proxy' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin), ...getSecurityHeaders() }
      });
    }
  }
};
