# Sorcery Portal Brasil - API Proxy

Proxy serverless para proteger o token da API NocoDB.

## Por que usar um proxy?

Atualmente, o token da API está exposto no código JavaScript do cliente. Qualquer pessoa pode:
1. Abrir o DevTools e ver o token
2. Usar o token para acessar/modificar dados diretamente
3. Deletar todos os dados do banco

Com o proxy:
- O token fica armazenado de forma segura no servidor
- Requests são validados e rate-limited
- Origens não autorizadas são bloqueadas
- Operações perigosas são bloqueadas

## Deployment no Cloudflare Workers

### 1. Instalar Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login no Cloudflare

```bash
wrangler login
```

### 3. Configurar Secrets (NÃO use o wrangler.toml para secrets!)

```bash
# Token do NocoDB (obtenha em dados.kodda.ai > Settings > API Tokens)
wrangler secret put NOCODB_TOKEN
# Digite seu token quando solicitado (NUNCA commite o token!)

# URL base do NocoDB
wrangler secret put NOCODB_BASE_URL
# Digite: https://dados.kodda.ai
```

### 4. Deploy

```bash
# Deploy para produção
wrangler deploy

# Ou para desenvolvimento
wrangler deploy --env development
```

### 5. Testar

```bash
curl https://sorcery-api-proxy.your-subdomain.workers.dev/api/v1/db/data/v1/pybbgkutded1ay0/users
```

## Configuração no Frontend

Após o deploy, atualize o `security-config.js`:

```javascript
const SecurityConfig = {
    api: {
        // Use a URL do proxy ao invés da URL direta
        baseUrl: 'https://sorcery-api-proxy.your-subdomain.workers.dev',
        // Token não é mais necessário no cliente!
        // token: null,
        baseId: 'pybbgkutded1ay0'
    },
    // ...
};
```

## Domínio Personalizado (Opcional)

1. No Cloudflare Dashboard, vá para Workers & Pages
2. Selecione o worker
3. Vá para Settings > Triggers
4. Adicione um Custom Domain (ex: api.sorcery-portal.com.br)

## Rate Limiting

O proxy implementa rate limiting básico:
- 100 requests por minuto por IP
- Resposta 429 quando excedido

Para rate limiting mais robusto, use Durable Objects ou um serviço externo.

## Segurança

### Origens Permitidas
Configure em `wrangler.toml` ou no Dashboard:
- `https://koddaai.github.io`
- `https://sorcery-portal.com.br`
- `http://localhost:8080` (desenvolvimento)

### Paths Bloqueados
- Criar/deletar tabelas
- Criar/deletar projetos
- Bulk delete
- Bulk update all

### Sanitização
- Bodies JSON são sanitizados
- Tags script são removidas
- Event handlers inline são removidos

## Monitoramento

No Cloudflare Dashboard:
1. Workers & Pages > seu worker
2. Metrics: requests, errors, latência
3. Logs: em tempo real com `wrangler tail`

## Custos

Cloudflare Workers Free Tier:
- 100,000 requests/dia
- 10ms CPU time por request

Para mais, considere o plano Paid ($5/mês):
- 10 milhões de requests/mês
- Durable Objects para state
