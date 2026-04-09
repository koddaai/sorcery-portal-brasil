# Sorcery Collection Manager - Roadmap de Features

## Versão Atual (v1.0)
- [x] Catálogo de 1104 cartas com filtros
- [x] Tracking de coleção
- [x] Marcação de precons (Beta + Gothic)
- [x] Wishlist
- [x] Deck builder básico
- [x] Decks recomendados da comunidade
- [x] Export/Import (JSON, CSV)
- [x] Estatísticas por Set, Elemento, Raridade

---

## Features Planejadas

### 📊 INTEGRAÇÃO DE PREÇOS (Prioridade Alta)

#### Fontes de Dados
| Fonte | Descrição | Integração |
|-------|-----------|------------|
| [sorcery.market](https://sorcery.market/) | Preços em tempo real do TCGPlayer | Web scraping ou API |
| [TCGIndex](https://tcgindex.io/sorcery) | Analytics, tendências, volatilidade | Web scraping |
| [TCGPlayer](https://www.tcgplayer.com/categories/trading-and-collectible-card-games/sorcery-contested-realm) | Market prices oficiais | API (requer cadastro) |

#### Features de Preço
- [ ] **Valor da Coleção em Tempo Real** - Total USD da sua coleção
- [ ] **Preço por Carta** - Market price, low, mid, high
- [ ] **Histórico de Preços** - Gráfico de 7/30/90 dias
- [ ] **Price Alerts** - Notificação quando carta atinge valor X
- [ ] **Tendências** - Cartas subindo/descendo de preço
- [ ] **Movers** - Top gainers e losers do dia/semana

---

### 🔄 TRADE CENTER

- [ ] **Trade Binder** - Cartas disponíveis para troca
- [ ] **Want List Pública** - Compartilhar wishlist
- [ ] **Calculadora de Trade** - Comparar valor de trades
- [ ] **Match de Trades** - Encontrar traders com cartas que você quer
- [ ] **Histórico de Trades** - Registro de trocas realizadas

---

### 📱 SCANNER DE CARTAS

- [ ] **Scan via Câmera** - Identificar carta pela foto
- [ ] **Scan em Lote** - Escanear múltiplas cartas
- [ ] **Auto-adicionar à Coleção** - Após scan
- [ ] **Identificação de Condição** - NM, LP, MP, HP, DMG

---

### 🏆 GAMIFICAÇÃO

- [ ] **Achievements/Badges**
  - Completar set
  - Coletar todos os Avatars
  - Primeira Unique
  - 100 cartas na coleção
- [ ] **Leaderboards** - Ranking de colecionadores
- [ ] **Desafios Semanais** - Objetivos para completar
- [ ] **Progresso de Sets** - % de completude visual

---

### 📈 ANALYTICS AVANÇADOS

- [ ] **Dashboard de Investimento**
  - Valor investido vs valor atual
  - ROI por carta/set
  - Projeções de valorização
- [ ] **Relatórios**
  - Cartas mais valiosas
  - Cartas raras faltando
  - Análise de deck (custo para montar)
- [ ] **Comparação com Mercado**
  - Sua coleção vs média do mercado

---

### 🎴 DECK BUILDER AVANÇADO

- [ ] **Importar Decks do Curiosa.io** - Via URL
- [ ] **Análise de Deck**
  - Curva de mana
  - Distribuição de tipos
  - Sinergia entre cartas
- [ ] **Preço do Deck** - Custo total para montar
- [ ] **Cartas Faltando** - Para completar deck
- [ ] **Sugestões de Substituição** - Cartas similares mais baratas
- [ ] **Histórico de Versões** - Changelog do deck
- [ ] **Testar Mão Inicial** - Simulador de mulligan

---

### 🌐 SOCIAL

- [ ] **Perfil Público** - Mostrar coleção
- [ ] **Seguir Colecionadores** - Feed de atividade
- [ ] **Compartilhar Decks** - Link direto
- [ ] **Comentários** - Em decks e coleções
- [ ] **Rankings** - Top colecionadores por região

---

### 🔔 NOTIFICAÇÕES

- [ ] **Price Drops** - Carta na wishlist baixou
- [ ] **Novas Cartas** - Set novo lançado
- [ ] **Torneios** - Eventos próximos
- [ ] **Atualizações de Regras** - Errata e bans

---

### 📦 SEALED PRODUCTS

- [ ] **Tracking de Sealed**
  - Booster boxes
  - Precons
  - Bundles
- [ ] **Valor de Sealed** - Preços de mercado
- [ ] **Calculadora de EV** - Expected Value de abrir packs

---

### 🔗 INTEGRAÇÕES

- [ ] **Curiosa.io** - Sync de decks e coleção
- [ ] **TCGPlayer** - Link direto para compra
- [ ] **eBay** - Buscar preços alternativos
- [ ] **Discord** - Compartilhar via webhook
- [ ] **Planilhas Google** - Export automático

---

### 🛡️ FEATURES DE SEGURANÇA

- [ ] **Backup na Nuvem** - Sincronização
- [ ] **Histórico de Alterações** - Audit log
- [ ] **Seguros** - Documentação para seguro de coleção
- [ ] **Foto das Cartas** - Prova de propriedade

---

## Priorização Sugerida

### Fase 1 - Core Value (1-2 semanas)
1. Integração de preços (sorcery.market)
2. Valor total da coleção
3. Preço por carta na UI

### Fase 2 - Engagement (2-3 semanas)
1. Trade Binder
2. Deck builder avançado
3. Import de decks do Curiosa

### Fase 3 - Growth (3-4 semanas)
1. Scanner de cartas
2. Gamificação
3. Features sociais

### Fase 4 - Monetização (futuro)
1. Versão Premium
2. Integrações enterprise
3. API própria

---

## Tecnologias Sugeridas

| Feature | Tecnologia |
|---------|------------|
| Backend | Node.js + Express ou Python + FastAPI |
| Database | PostgreSQL ou MongoDB |
| Cache de Preços | Redis |
| Autenticação | Auth0 ou Firebase Auth |
| Hosting | Vercel, Railway, ou DigitalOcean |
| Scanner | TensorFlow.js ou Google Vision API |
| Notificações | Firebase Cloud Messaging |

---

## Contribuições

Este é um projeto open-source. Contribuições são bem-vindas!

- Issues: Reportar bugs ou sugerir features
- PRs: Implementar melhorias
- Docs: Melhorar documentação
