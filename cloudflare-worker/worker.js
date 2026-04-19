// Sorcery Portal Brasil - NocoDB API Proxy + Email Service
// Este Worker atua como proxy seguro para a API do NocoDB
// e envia emails de reset de senha via Resend

const NOCODB_BASE_URL = 'https://dados.kodda.ai';
const NOCODB_BASE_ID = 'pybbgkutded1ay0';
const FRONTEND_URL = 'https://sorcery.com.br';

const ALLOWED_ORIGINS = [
  'https://sorcery.com.br',
  'https://www.sorcery.com.br',
  'https://koddaai.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

function getCorsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
    (origin && (origin.endsWith('.sorcery.com.br') || origin.endsWith('.github.io')));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, xc-token, x-csrf-token, X-Requested-With',
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

// Gerar token seguro para reset de senha
function generateResetToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Buscar usuário por email no NocoDB
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

// Atualizar usuário com token de reset
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
      reset_token_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
    })
  });

  return resp.ok;
}

// Enviar email via Resend
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

                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4a 100%);">
                      <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 700;">
                        Sorcery Portal Brasil
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <p style="color: #ffffff; font-size: 18px; margin: 0 0 10px;">
                        Olá${displayName ? `, <strong>${displayName}</strong>` : ''}!
                      </p>
                      <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
                      </p>

                      <!-- Button -->
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
                        Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá inalterada.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #0f0f1a; border-top: 1px solid #2a2a4a;">
                      <p style="color: #666; font-size: 12px; margin: 0; text-align: center;">
                        Sorcery Portal Brasil - O maior portal de Sorcery: Contested Realm do Brasil
                      </p>
                      <p style="color: #444; font-size: 11px; margin: 10px 0 0; text-align: center;">
                        Se o botão não funcionar, copie e cole este link no navegador:<br>
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

// Handler para envio de email de reset
async function handleSendResetEmail(request, env, origin) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    // Buscar usuário
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

    // Gerar token
    const token = generateResetToken();

    // Salvar token no banco
    const saved = await updateUserResetToken(user.Id, token, env);
    if (!saved) {
      return new Response(JSON.stringify({ error: 'Erro ao processar solicitação' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    // Enviar email
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

// Handler para verificar token de reset
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

    // Verificar expiração
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

// Handler para redefinir senha
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

    // Verificar expiração
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return new Response(JSON.stringify({ success: false, error: 'Token expirado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
      });
    }

    // Atualizar senha e limpar token
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }

    const path = url.pathname;

    // Status endpoint
    if (!path || path === '/') {
      return new Response(JSON.stringify({
        status: 'ok', service: 'Sorcery API Proxy', version: '2.0.0'
      }), { headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) } });
    }

    // Endpoints de reset de senha
    if (path === '/auth/send-reset-email' && request.method === 'POST') {
      return handleSendResetEmail(request, env, origin);
    }

    if (path === '/auth/verify-reset-token' && request.method === 'POST') {
      return handleVerifyResetToken(request, env, origin);
    }

    if (path === '/auth/reset-password' && request.method === 'POST') {
      return handleResetPassword(request, env, origin);
    }

    // Proxy para NocoDB (comportamento original)
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
