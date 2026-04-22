# Plano de Otimização - sorcery.com.br

## Resumo dos Problemas

| Problema | Impacto | Prioridade |
|----------|---------|------------|
| Imagens de artigos (107MB) | Performance Mobile crítica | 🔴 Alta |
| recommended-decks.js (1.3MB) | Total Blocking Time | 🔴 Alta |
| Scripts não lazy-loaded | First Contentful Paint | 🟡 Média |
| CSS não utilizado (49KB) | Render blocking | 🟡 Média |
| Cache headers | Repeat visits | 🟢 Baixa |

---

## 🔴 Otimização 1: Imagens de Artigos

### Problema
- 30 imagens em `assets/articles/`
- Total: **107MB**
- Algumas imagens têm 10-12MB cada

### Solução
```bash
# Executar script de otimização
./scripts/optimize-article-images.sh
```

### Resultado Esperado
- De 107MB para ~3MB (97% redução)
- Formato WebP com fallback JPG
- Largura máxima 800px

### Mudanças Necessárias
1. Executar script
2. Atualizar `articles-database.json` para usar `.webp`
3. Atualizar `articles-service.js` para suportar fallback

---

## 🔴 Otimização 2: Lazy Load de Scripts Pesados

### Problema
- `recommended-decks.min.js` = **1.3MB**
- Carregado no início, mesmo sem uso

### Solução
Carregar apenas quando o usuário acessar a view de decks:

```javascript
// Em app.js, dentro de switchView()
if (viewName === 'decks' && !window.RECOMMENDED_DECKS) {
    const script = document.createElement('script');
    script.src = 'recommended-decks.min.js';
    script.onload = () => renderCommunityDecks();
    document.head.appendChild(script);
    return;
}
```

### Resultado Esperado
- Redução de 1.3MB no carregamento inicial
- TBT reduzido de 3.7s para ~1s

---

## 🟡 Otimização 3: Defer/Async Scripts

### Problema
Scripts bloqueiam renderização

### Solução
Adicionar `defer` em scripts não críticos:

```html
<!-- Críticos (manter sync) -->
<script src="app.min.js"></script>

<!-- Não críticos (adicionar defer) -->
<script src="artist-gallery.min.js" defer></script>
<script src="forum-service.min.js" defer></script>
<script src="messaging-service.min.js" defer></script>
<script src="rules-quiz.min.js" defer></script>
<script src="promo-tracker.min.js" defer></script>
```

---

## 🟡 Otimização 4: CSS Crítico Inline

### Problema
- `styles.css` grande bloqueia renderização
- 49KB de CSS não utilizado

### Solução
1. Extrair CSS crítico (above-the-fold)
2. Inline no `<head>`
3. Carregar resto com `media="print" onload`

```html
<style>
  /* CSS crítico inline - ~10KB */
  :root { ... }
  body { ... }
  .nav { ... }
  .hero { ... }
</style>
<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">
```

---

## 🟢 Otimização 5: Cache Headers (Cloudflare)

### Problema
- Recursos sem cache eficiente
- 60MB recarregados desnecessariamente

### Solução
Criar `_headers` para Cloudflare Pages:

```
# /Users/pedro/sorcery-collection-manager/_headers

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.webp
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/*.json
  Cache-Control: public, max-age=3600
```

---

## 🟢 Otimização 6: Preload Recursos Críticos

### Solução
Adicionar no `<head>`:

```html
<link rel="preload" href="app.min.js" as="script">
<link rel="preload" href="styles.css" as="style">
<link rel="preconnect" href="https://sorcery-cdn.b-cdn.net">
<link rel="dns-prefetch" href="https://api.sorcerytcg.com">
```

---

## Ordem de Implementação

1. **[5 min]** Otimizar imagens de artigos (script pronto)
2. **[10 min]** Adicionar lazy load para recommended-decks.js
3. **[5 min]** Adicionar defer nos scripts não críticos
4. **[2 min]** Criar arquivo _headers para cache
5. **[5 min]** Adicionar preloads no head

## Resultado Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Performance Mobile | 38 | 70+ |
| Performance Desktop | 80 | 95+ |
| LCP | 5.6s | <2.5s |
| TBT | 3.7s | <500ms |
| Tamanho Total | ~85MB | ~5MB |
