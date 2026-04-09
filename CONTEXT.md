# Sorcery Portal Brasil - Contexto do Projeto

> Última atualização: Abril 2026

## Visão Geral

**Objetivo:** Transformar o Sorcery Collection Manager no maior portal de Sorcery: Contested Realm do Brasil, com conteúdo traduzido, ferramentas de coleção e recursos para a comunidade.

**Stack:** HTML5, CSS3, JavaScript (Vanilla), LocalStorage, NocoDB (backend opcional)

**API Principal:** `https://api.sorcerytcg.com/api/cards`

---

## Estrutura de Arquivos

```
sorcery-collection-manager/
├── index.html              # HTML principal com todas as views
├── styles.css              # Estilos CSS (design system Apple/Notion)
├── app.js                  # Lógica principal da aplicação
├── i18n.js                 # Internacionalização (PT/EN/ES)
├── price-service.js        # Serviço de preços e estimativas
├── chase-cards-prices.js   # Tabela de exceções de preços (chase cards)
├── tcg-prices.js           # Sistema de preços estilo LigaMagic (min/mid/max)
├── flavor-text.js          # Explorador de lore/flavor text
├── rules-quiz.js           # Quiz de regras com perguntas do FAQ
├── nocodb-service.js       # Integração com NocoDB (sync)
├── brazilian-stores.js     # Lista de lojas brasileiras
├── recommended-decks.js    # Decks recomendados da comunidade
├── rulebook-pt.js          # Rulebook traduzido para PT-BR
├── faq-pt.js               # FAQ traduzido para PT-BR
├── deck-guides-pt.js       # Guias de deckbuilding em PT-BR
├── variant-tracker.js      # Sistema de tracking multi-variante
├── keyword-parser.js       # Parser de keywords e detector de erratas
├── set-progress.js         # Tracker de progresso por set
├── threshold-calculator.js # Calculadora de threshold para decks
├── dust-tracker.js         # Tracker de pontos Dust (OP)
├── artist-gallery.js       # Galeria de artistas
├── promo-tracker.js        # Tracker de promos e exclusivos
├── release-timeline.js     # Timeline de lançamentos
├── cards-database.json     # Fallback local de cards
└── CONTEXT.md              # Este arquivo
```

---

## O Que Já Foi Implementado

### Design System
- [x] Variáveis CSS (cores, sombras, bordas, animações)
- [x] Ícones Lucide substituindo emojis
- [x] Header com glassmorphism e duas linhas (logo + nav)
- [x] Cards com sombras ao invés de bordas
- [x] Animações suaves (ease-out-expo)
- [x] Layout responsivo (mobile-first)

### Views/Páginas
- [x] **Home** - Landing page com hero, features, about, news
- [x] **Cards** - Navegador de cards com filtros
- [x] **Collection** - Gerenciamento da coleção pessoal
- [x] **Precons** - Decks pré-construídos
- [x] **Decks** - Meus decks customizados
- [x] **Wishlist** - Lista de desejos
- [x] **Trade** - Binder de trocas
- [x] **Stats** - Estatísticas da coleção
- [x] **Scanner** - Scanner de cards (placeholder)
- [x] **Community** - Links para comunidade e lojas
- [x] **Meta** - Tier list e meta atual
- [x] **Locator** - Localizador de lojas brasileiras
- [x] **Codex** - Referência de regras
- [x] **Rulebook** - Rulebook completo traduzido
- [x] **FAQ** - Perguntas frequentes traduzidas
- [x] **Guides** - Guias de deckbuilding
- [x] **Artists** - Galeria de artistas
- [x] **Timeline** - Timeline de lançamentos
- [x] **Dust** - Tracker de pontos Dust
- [x] **Promos** - Tracker de promos e exclusivos

### Conteúdo Traduzido
- [x] Rulebook completo (10 seções)
- [x] FAQ (8 categorias, ~40 perguntas)
- [x] Guias de Deck (fundamentos, elementos, arquétipos, iniciantes)
- [x] Interface i18n (PT/EN/ES)

### Funcionalidades Core
- [x] Carregar cards da API oficial
- [x] Filtros por set, tipo, elemento, raridade
- [x] Busca por nome
- [x] Adicionar/remover da coleção
- [x] Adicionar/remover da wishlist
- [x] Criar/editar decks
- [x] Exportar/importar coleção (JSON)
- [x] Estimativa de preços por raridade
- [x] Conversão USD/BRL
- [x] Links para TCGPlayer

### Integrações
- [x] API Sorcery TCG (`/api/cards`)
- [x] NocoDB para sync de dados
- [x] LocalStorage para persistência offline
- [x] Lucide Icons CDN

---

## Funcionalidades Implementadas (Abril 2026)

### Módulos de Funcionalidades Avançadas

#### 1. Tracking Multi-Variante (`variant-tracker.js`)
- [x] Rastrear Standard/Foil/Rainbow separadamente
- [x] Slug como identificador único de variante
- [x] Exportar/importar coleção por variante
- [x] Migração de formato antigo
- [x] UI para selecionar variante no modal de cards
- [x] Adicionar/remover variantes específicas da coleção

#### 2. Progresso por Set (`set-progress.js`)
- [x] Barra de progresso por set
- [x] Breakdown por raridade (Ordinary/Elite/Exceptional/Unique)
- [x] Breakdown por tipo (Minion/Magic/Site/etc.)
- [x] Lista de cards faltando
- [x] Sistema de achievements
- [x] Integração na view Collection (seção expansível)

#### 3. Calculadora de Threshold (`threshold-calculator.js`)
- [x] Analisar threshold requirements de um deck
- [x] Sugerir distribuição de Sites
- [x] Validação de deck (warnings/errors)
- [x] Gráfico de curva de mana
- [x] Gráfico de distribuição de elementos
- [x] Integração no Deck Builder (painel de análise)

#### 4. Parser de Keywords (`keyword-parser.js`)
- [x] Parser de rulesText para extrair keywords (90+ keywords)
- [x] Filtro por keyword e tipo
- [x] Highlight de keywords em HTML
- [x] Estatísticas de keywords
- [x] Detector de Erratas entre sets
- [x] Filtro por keyword na busca de cards

#### 5. Sistema de Dust (`dust-tracker.js`)
- [x] Tracker de pontos Dust
- [x] Cap mensal (250 pontos)
- [x] Histórico de ganhos por mês
- [x] Gestão de eventos
- [x] Medidor circular visual
- [x] View dedicada

#### 6. Galeria de Artistas (`artist-gallery.js`)
- [x] Extrair artistas únicos da API
- [x] View de galeria por artista
- [x] Contador e stats por artista
- [x] Busca de artistas
- [x] Top artistas (leaderboard)
- [x] View dedicada

#### 7. Tracker de Promos (`promo-tracker.js`)
- [x] Categorização (Retailer, Kickstarter, OP, Box Topper, Rainbow)
- [x] Badges de raridade
- [x] Checklist com progresso
- [x] Stats de coleção
- [x] View dedicada com tabs

#### 8. Timeline de Lançamentos (`release-timeline.js`)
- [x] Visualização cronológica de sets
- [x] Stats por set (raridades, tipos)
- [x] Próximos lançamentos
- [x] Comparação entre sets
- [x] View dedicada

---

## O Que Falta Implementar

### Implementado Recentemente (Abril 2026)

#### Chase Cards Price Service (`chase-cards-prices.js`)
- [x] Tabela de exceções com preços reais de TCGPlayer
- [x] ~30 chase cards com preços manuais (Erik's Curiosa $252, Dracula $60, etc.)
- [x] Bulk overrides para cards superestimados
- [x] Integração automática com PriceService existente
- [x] Prioridade: chase > bulk > estimativa

#### Filtro por Acabamento na Coleção
- [x] Select de filtro Standard/Foil/Rainbow
- [x] Integração com VariantTracker
- [x] Badges visuais de finish nos cards filtrados
- [x] Contador atualizado com filtros ativos

#### Deep Linking por Slug
- [x] URLs como `#card/alp-apprentice_wizard-b-s`
- [x] Compartilhar card específico (botão Share)
- [x] Handler de hashchange para navegação
- [x] Copiar link para clipboard

#### QR Code para Cards (`app.js`)
- [x] Gerar QR code via API QR Server
- [x] Botão QR no modal do card
- [x] Toggle para mostrar/esconder QR

#### Flavor Text Collection (`flavor-text.js`)
- [x] View dedicada "Lore"
- [x] Filtrar por elemento
- [x] Busca em flavor text
- [x] Cards com imagem + citação
- [x] Daily Flavor (lore do dia)

#### Quiz de Regras (`rules-quiz.js`)
- [x] 20+ perguntas baseadas no FAQ
- [x] Sistema de pontuação (grades S/A/B/C/D)
- [x] Explicações após cada resposta
- [x] Revisão de respostas no final
- [x] Múltiplos tamanhos de quiz (5/10/15/20)

#### Discord Widget
- [x] Widget visual estilo Discord
- [x] Lista de canais preview
- [x] Cards de features do servidor
- [x] Botão de entrada direto

#### Sistema de Preços LigaMagic (`tcg-prices.js`)
- [x] Preços estruturados min/mid/max por set e finish
- [x] Formato de moeda correto (US$ e R$)
- [x] Toggle de moeda no modal do card
- [x] Tabela compacta estilo LigaMagic
- [x] Integração com chase-cards-prices.js

#### Requisito de Login para Coleção
- [x] Verificação de login ao adicionar cards à coleção
- [x] Verificação de login ao adicionar cards à wishlist
- [x] Verificação de login ao adicionar cards ao trade binder
- [x] Redirecionamento automático para modal de login
- [x] Remoção continua funcionando sem login

#### Correções de Bugs (Abril 2026)
- [x] Fix variant selector mostrando "Unknown" e "xundefined"
- [x] Mapeamento de sets completo no VariantTracker
- [x] Estrutura de dados corrigida (owned.variants)
- [x] Badge de finish melhorado (não cortado)

### Baixa Prioridade (Nice to Have)

#### Integração TCGPlayer
- [ ] Buscar preços reais via API (requer parceria)
- [ ] Cache de preços
- [ ] Histórico de preços
- [ ] Alertas de preço

#### Feed de Notícias
- [ ] Importar news do site oficial
- [ ] Notificações de novos sets

#### Login Social
- [ ] Login via Discord
- [ ] Sync de coleção na nuvem

---

## Dados da API

### Endpoint Principal
```
GET https://api.sorcerytcg.com/api/cards
```

### Estrutura de Resposta
```javascript
{
  name: "Card Name",
  guardian: {
    rarity: "Ordinary|Elite|Exceptional|Unique",
    type: "Minion|Magic|Site|Aura|Artifact|Avatar",
    rulesText: "Card abilities and effects",
    cost: 3,
    attack: 2,
    defence: 2,
    life: null, // Only for Avatars
    thresholds: {
      air: 0,
      earth: 1,
      fire: 0,
      water: 0
    }
  },
  elements: "Earth", // ou "Earth, Fire" para dual
  subTypes: "Mortal|Beast|Dragon|...",
  sets: [{
    name: "Alpha|Beta|Gothic|...",
    releasedAt: "2023-04-19T00:00:00.000Z",
    metadata: { /* same as guardian */ },
    variants: [{
      slug: "alp-card_name-b-s", // Unique identifier
      finish: "Standard|Foil|Rainbow",
      product: "Booster|Preconstructed_Deck|...",
      artist: "Artist Name",
      flavorText: "Lore text",
      typeText: "Human readable type"
    }]
  }]
}
```

### Valores Únicos
- **Sets:** Alpha, Beta, Arthurian Legends, Gothic, Dragonlord, Promotional
- **Products:** Booster, Preconstructed_Deck, Draft_Kit, Box_Topper, Welcome_Kit, Organized_Play, Kickstarter, Dust, Star_City_Games, Alpha_Investments, Team_Covenant
- **Finishes:** Standard, Foil, Rainbow
- **Elements:** Air, Earth, Fire, Water, None + combinações
- **Total Cards:** 1.104

---

## Lojas Brasileiras (brazilian-stores.js)

Lista de lojas que vendem Sorcery no Brasil, com:
- Nome, URL, tipo (Sealed/Singles)
- Cidade, Estado
- Filtros por região

---

## Links Úteis

- **Site Oficial:** https://sorcerytcg.com
- **API:** https://api.sorcerytcg.com/api/cards
- **Curiosa.io:** https://curiosa.io (decks, codex)
- **Discord Oficial:** https://discord.gg/qvYVGFAS5n
- **Rulebook PDF:** https://sorcerytcg.com/how-to-play
- **TCGPlayer:** https://www.tcgplayer.com/search/sorcery-contested-realm

---

## Próximos Passos

1. Explorar integração com TCGPlayer para preços reais
2. Implementar deep linking por slug de card
3. Adicionar quiz de regras com perguntas do FAQ
4. Criar feed de notícias do site oficial
5. Adicionar filtro por acabamento na coleção

---

## Contribuição

Este projeto é open source. Contribuições são bem-vindas!

- Issues: Reporte bugs ou sugira features
- PRs: Envie melhorias de código
- Traduções: Ajude a traduzir para outros idiomas

---

## Changelog

### Abril 2026 - Atualização Major
**Novos Módulos de Funcionalidades:**
- `variant-tracker.js` - Sistema de tracking multi-variante (Standard/Foil/Rainbow)
- `keyword-parser.js` - Parser de keywords e detector de erratas (90+ keywords)
- `set-progress.js` - Tracker de progresso por set com achievements
- `threshold-calculator.js` - Calculadora de threshold e curva de mana
- `dust-tracker.js` - Sistema de Dust do Organized Play
- `artist-gallery.js` - Galeria de artistas com stats
- `promo-tracker.js` - Tracker de promos e exclusivos
- `release-timeline.js` - Timeline de lançamentos

**Novas Views:**
- Artists - Galeria de artistas
- Timeline - Histórico de lançamentos
- Dust - Tracker de pontos competitivos
- Promos - Tracker de variantes especiais

**Conteúdo:**
- Redesign visual completo (estilo Apple/Notion)
- Nova navegação em duas linhas
- Views: Home, Locator, Codex, Rulebook, FAQ, Guides
- Rulebook traduzido para PT-BR (10 seções)
- FAQ com 8 categorias (~40 perguntas)
- Guias de deckbuilding (fundamentos, elementos, arquétipos)
- Sistema i18n (PT/EN/ES)
- Lojas brasileiras com filtros

### Versões Anteriores
- Collection Manager básico
- Filtros de cards
- Wishlist e Trade binder
- Integração NocoDB
- Preços estimados
