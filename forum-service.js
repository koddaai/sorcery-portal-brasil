// ============================================
// SORCERY FORUM SERVICE
// Community forum with categories - Restructured
// ============================================

const FORUM_CATEGORIES = {
    'primeiros-passos': { name: 'Primeiros Passos', icon: 'baby', description: 'Guias e dúvidas para quem está começando no Sorcery', color: '#22c55e' },
    'regras-mecanicas': { name: 'Regras & Mecânicas', icon: 'scale', description: 'Discussões sobre regras, rulings e mecânicas do jogo', color: '#3b82f6' },
    'duvidas-cartas': { name: 'Dúvidas sobre Cartas', icon: 'help-circle', description: 'Perguntas sobre interações e funcionamento de cartas específicas', color: '#8b5cf6' },
    'decks-construcao': { name: 'Decks & Construção', icon: 'hammer', description: 'Deck techs, combos, estratégias e listas', color: '#f59e0b' },
    'limited': { name: 'Limited', icon: 'package', description: 'Draft, Sealed e formatos limitados', color: '#06b6d4' },
    'meta-competitivo': { name: 'Meta & Competitivo', icon: 'trophy', description: 'Discussões sobre meta, tier lists e torneios', color: '#ef4444' },
    'sets-spoilers': { name: 'Sets & Spoilers', icon: 'sparkles', description: 'Novos sets, spoilers e previsões', color: '#ec4899' },
    'lore-arte': { name: 'Lore & Arte', icon: 'palette', description: 'História do jogo, artistas e flavor', color: '#a855f7' },
    'ferramentas': { name: 'Ferramentas & Recursos', icon: 'wrench', description: 'Apps, sites, ferramentas úteis e recursos da comunidade', color: '#14b8a6' },
    'eventos': { name: 'Eventos', icon: 'calendar', description: 'Torneios, encontros e eventos da comunidade', color: '#f97316' },
    'geral': { name: 'Geral', icon: 'message-circle', description: 'Discussões gerais sobre Sorcery', color: '#9ca3af' }
};

// Posts estáticos - conteúdo editorial publicado pela equipe
const STATIC_FORUM_POSTS = [
    // Primeiros Passos
    {
        Id: 's1',
        category: 'primeiros-passos',
        Title: '8 dúvidas que todo jogador novo tem no primeiro fim de semana',
        content: `Selecionei as perguntas mais recorrentes de quem abriu os precons pela primeira vez:

**1. Minions podem atacar Avatares antes de Death's Door?**
Sim. Mas lembre: o Avatar contra-ataca com o próprio power. Então mandar um minion fraco bater no Avatar adversário geralmente significa perder o minion.

**2. Avatar pode carregar artifacts?**
Sim, normalmente. Avatar funciona como qualquer unidade nesse aspecto.

**3. Quantos artifacts um minion pega por turno?**
A *ação* de pegar é 1x por turno, mas nessa ação o minion pode pegar **vários** artifacts do mesmo site. Não há limite de quantos ele pode carregar.

**4. Os dois jogadores geram mana por turno?**
Não. Mana só no seu turno. Sorcery praticamente não tem instant speed — só exceções como **Dodge Roll** e **Valor**.

**5. "A mana tem cor?"**
**Não.** Isso confunde muita gente vinda de Magic. A mana é incolor. O que existe é **threshold**: um requisito da carta verificado contra seus sites.

**6. Posso colocar aura sobre aura?**
Sim. Convivem.

**7. Dano acumula entre combates no mesmo turno?**
Sim. Um minion 4 que já bateu num 2 segue ferido; se lutar depois com um 3, bate com seu power original (4), mas recebeu dano do primeiro combate.

**8. E os Monuments?**
São fixos ao site, não movem nem podem ser pegos. Se o site for destruído, o Monument some junto.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-20T10:00:00Z',
        view_count: 847,
        is_pinned: true,
        is_locked: false
    },
    {
        Id: 's2',
        category: 'primeiros-passos',
        Title: 'Vim do Magic, o que muda? O guia completo',
        content: `Se você joga Magic há anos e quer experimentar Sorcery, aqui estão as principais diferenças:

**Grid Espacial**
A maior mudança. Em vez de apenas "campo de batalha", você tem um grid 4x5 com posicionamento real. Unidades se movem, atacam adjacentes, e a posição importa muito.

**Threshold vs Mana**
Mana é incolor e vem dos seus sites. Threshold é um requisito (como devotion), não um custo — nunca é "gasto".

**Sem Instant Speed**
Quase não existe resposta no turno do oponente. Você planeja no seu turno e executa. Isso muda completamente o ritmo.

**Atlas e Spellbook**
Seus sites (Atlas) e spells (Spellbook) são decks separados. Você sempre compra 1 site + 1 spell por turno.

**Combate**
Sem bloqueio. Você ataca e o defensor contra-ataca. Dano é simultâneo. Flyers só são atingidos por outros flyers ou ranged.

**Death's Door**
Quando seu Avatar chega a 0, você não perde imediatamente. Entra em Death's Door e precisa ser finalizado com dano direto.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-19T14:30:00Z',
        view_count: 1203,
        is_pinned: true,
        is_locked: false
    },
    {
        Id: 's3',
        category: 'primeiros-passos',
        Title: 'Os Avatares mais amigáveis para quem está começando',
        content: `Para iniciantes, alguns avatares são mais intuitivos que outros. Minha recomendação:

**Druid** ⭐⭐⭐⭐⭐
O mais versátil. Consegue jogar com qualquer elemento, tem stats sólidos, e a habilidade de invocar beasts é fácil de entender. Se não sabe por onde começar, vá de Druid.

**Warrior** ⭐⭐⭐⭐
Direto ao ponto. Stats altos, combate simples. Bom para aprender o básico do grid e posicionamento.

**Ranger** ⭐⭐⭐⭐
Ranged natural facilita entender o combate à distância. Mobilidade boa para aprender movimentação.

**Evitar no início:**
- **Necromancer**: Mecânicas de cemitério são mais complexas
- **Magician**: Combos elaborados, curva de aprendizado alta
- **Witch**: Requer conhecimento do meta para maximizar`,
        user_id: 'pedro',
        CreatedAt: '2026-04-18T09:15:00Z',
        view_count: 632,
        is_pinned: false,
        is_locked: false
    },
    // Regras & Mecânicas
    {
        Id: 's4',
        category: 'regras-mecanicas',
        Title: 'Threshold vs. Mana — a diferença que todo novato confunde',
        content: `Se você veio de Magic, ignore seu instinto. Em Sorcery:

**Mana** é o número (o custo). É incolor. É gerada pelos seus sites em jogo.

**Threshold** é o símbolo de elemento. **É um requisito, não um recurso.** Nunca é "gasto", é só verificado.

**Exemplo clássico:** Stygian Archers (custo 3, threshold 2 Air). Se você tiver 2 sites de Air em jogo, seu threshold de Air permanece em 2 o jogo inteiro — você pode castar 1, 2, 3 Stygian Archers no mesmo turno, desde que tenha mana total suficiente (3, 6, 9 mana respectivamente). Threshold não "se esgota".

Para spells multi-elemento: basta ter o threshold mínimo de cada elemento simultaneamente. Com 1 Fire + 1 Earth + 1 Water em jogo, você paga Onslaught (3, Fire+Earth) normalmente — os 3 de mana vêm de qualquer combinação, só os thresholds precisam bater.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-17T11:00:00Z',
        view_count: 956,
        is_pinned: true,
        is_locked: false
    },
    {
        Id: 's5',
        category: 'regras-mecanicas',
        Title: 'Avatar só morre por DANO DIRETO — atacar site não finaliza o jogo',
        content: `Esta é a regra mais mal compreendida do jogo, e o rulebook não enfatiza bem:

Quando um Avatar está em **Death's Door**, ele **não pode ser morto por "loss of life"**. Ou seja:
- Atacar sites causa "loss of life" → **NÃO finaliza**
- Efeitos de "perda de vida" por combo → **NÃO finalizam**
- O golpe final PRECISA ser **dano direto** ao Avatar

**Implicação prática:** todo deck casual precisa ter pelo menos uma carta de dano direto (tipo Zap) ou forced movement para conseguir fechar partidas contra avatares posicionados defensivamente.

Não é raro ver partidas onde os dois Avatares ficam em Death's Door se perseguindo pelo grid porque nenhum dos dois tem como dar o golpe direto.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-16T16:45:00Z',
        view_count: 1089,
        is_pinned: true,
        is_locked: false
    },
    // Dúvidas sobre Cartas
    {
        Id: 's6',
        category: 'duvidas-cartas',
        Title: 'Yog-Sothoth — a carta mais confusa do jogo, explicada',
        content: `Duas leituras circulam, e uma delas está confirmada errada:

**Interpretação CORRETA** (confirmada no Discord oficial):
Yog-Sothoth ocupa **todas as 20 casas** do grid simultaneamente — superfície, subsolo, subaquático e void. Ao invocar, você coloca o card em qualquer casa; ele está em todas ao mesmo tempo.

**Interpretação ERRADA:**
"Ele funciona como se tivesse voidwalk/submerge/burrowing, mas ocupa uma casa por vez." Não é isso.

**Implicações:**
- Toma **39 de dano** de Major Explosion (hitando todas as casas onde ele está)
- Se houver menos de 5 voids no realm, ele **se banishe** (regra da carta)
- Não tem as keywords literais — cartas que ressuscitam "minion com voidwalk" **não o trazem de volta**

**Interação com Sisters of Silence:** se silenciado enquanto está em void (e tá sempre), o "safely" é anulado e Yog **morre**.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-15T13:20:00Z',
        view_count: 743,
        is_pinned: false,
        is_locked: false
    },
    // Decks & Construção
    {
        Id: 's7',
        category: 'decks-construcao',
        Title: 'Deckbuilding em Sorcery — os fundamentos',
        content: `Antes de montar seu primeiro deck, entenda a estrutura:

**Spellbook (40-60 cartas)**
Seu deck de spells. A maioria joga com 50. Inclui minions, magics, artifacts e auras.

**Atlas (20-30 cartas)**
Seu deck de sites. A maioria joga com 30. Define seus elementos e threshold.

**Proporção de Elementos**
- Mono-elemento: mais consistente, menos opções
- Dois elementos: o sweet spot para a maioria
- Três ou mais: possível mas requer construção cuidadosa

**Curva de Mana**
Jogos costumam acabar entre turnos 5-8. Tenha uma boa quantidade de cartas de 2-4 de custo. Evite muitas cartas caras.

**Finalizadores**
Lembre da regra de Death's Door: você PRECISA de dano direto. Inclua pelo menos 2-4 cartas que possam finalizar (Zap, Lightning Bolt, etc).`,
        user_id: 'pedro',
        CreatedAt: '2026-04-14T10:30:00Z',
        view_count: 834,
        is_pinned: false,
        is_locked: false
    },
    {
        Id: 's8',
        category: 'decks-construcao',
        Title: 'Frog Swarm — a base para decks de tokens',
        content: `Para quem quer montar um deck de tokens de sapo (sim, existe e é bom):

**Núcleo canônico (Necromancer avatar):**
- 4x Gift of the Frog
- 4x Pitchforks (3 main + 1 na collection pro Toolbox)
- 4x Croaking Swamp
- 2x Pan Pipes of Pnom
- Plague of Frogs
- Pnakotic Manuscript
- Lord of Unland

**Combo estrela:** Plague of Frogs + Pnakotic Manuscript — compre 7, saque 7, lucre.

**Tech adicionais:**
- Ruler of Thul reforça o swarm
- Se splashar Earth: House Arn Bannerman e Shield Maidens ficam ótimos
- Snowball transforma os frogsinhos em bola de canhão contra o Avatar`,
        user_id: 'pedro',
        CreatedAt: '2026-04-13T15:00:00Z',
        view_count: 521,
        is_pinned: false,
        is_locked: false
    },
    // Meta & Competitivo
    {
        Id: 's9',
        category: 'meta-competitivo',
        Title: 'Druid — o Avatar dominante do meta atual',
        content: `Não tem como falar de meta sem falar de Druid. Ele domina por razões estruturais:

**Por que Druid é forte:**
1. **Flexibilidade de elementos** — pode jogar qualquer combinação
2. **Beast synergy** — o tribal mais suportado do jogo
3. **Stats sólidos** — não tem fraqueza óbvia
4. **Habilidade versátil** — invocar beasts é útil em qualquer situação

**Variantes populares:**
- Steam Druid (Fire/Water) — o mais consistente
- Dust Druid (Air/Earth) — mais controlador
- Mono Earth Druid — tanks e value

**Como bater Druid:**
- Remoção de cemitério (Tawnshammar)
- Aggro muito rápido antes dele estabilizar
- Silence effects estratégicos

O próximo set pode trazer um Hunter que counter-meta beasts, mas por enquanto, se você quer ganhar, Druid é a escolha segura.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-12T11:45:00Z',
        view_count: 1156,
        is_pinned: false,
        is_locked: false
    },
    {
        Id: 's10',
        category: 'meta-competitivo',
        Title: 'Staples do set Gothic — o que comprar de single',
        content: `Consenso da comunidade para montar singles do Gothic:

**Staples universais** (cabem em quase todo deck):
- Toolbox
- Silver Bullet (alternativa pra quando Toolbox não cabe)

**Por elemento:**
- Water: Thin Ice, Abaddon Succubus
- Air: Wuthering Heights (vai até em decks non-air)
- Earth: Landmass (universal em earth)

**Uniques fortes mas deck-dependentes:**
- Archangel Michael, Aino, Omphalos (artifacts), Arjaro Exorcist

**Staples de suporte:**
- Swap, Zap, River of Blood, Gargantula
- Double-threshold sites têm valor altíssimo

**Breaking point do set:** 4 de mana / 4 de power — cartas acima disso precisam justificar muito o slot.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-11T14:00:00Z',
        view_count: 892,
        is_pinned: false,
        is_locked: false
    },
    // Limited
    {
        Id: 's11',
        category: 'limited',
        Title: 'Primeiro draft de Sorcery — o que precisa saber antes de sentar',
        content: `Dicas para quem vai draftar pela primeira vez:

**Formato:**
- Deck de draft é **24 spells + 12 sites** (menor que constructed 50/30)
- Avatar padrão é **Spellslinger** desde pós-Alpha
- O draft kit oficial já inclui sites básicos e o avatar

**Estratégia de pick:**
- Priorize **dois elementos** em vez de mono
- **Cap de mana**: jogos são rápidos, raramente passam de turno 6-7
- Tenha curva sólida em 2-4 mana
- Earth pode ter problema sério contra Air pesado em flying

**Dicas gerais:**
- Remoção é premium — pegue sempre que puder
- Evasion (flying, burrowing) vale mais que stats puros
- Finalizadores de dano direto são essenciais`,
        user_id: 'pedro',
        CreatedAt: '2026-04-10T09:30:00Z',
        view_count: 423,
        is_pinned: false,
        is_locked: false
    },
    // Ferramentas
    {
        Id: 's12',
        category: 'ferramentas',
        Title: 'As ferramentas que todo jogador de Sorcery usa',
        content: `Lista das ferramentas essenciais da comunidade:

**Deckbuilding:**
- **curiosa.io** — O hub principal. Database de cartas, deckbuilder, preços
- **sorceryrec.com** — Deckbuilder alternativo, interface limpa

**Preços:**
- **TCGPlayer** — Referência de preços para US
- **curiosa.io/prices** — Histórico de preços integrado

**Regras:**
- **Codex (curiosa.io)** — FAQs e rulings por carta
- **Rulebook oficial** — sorcerytcg.com

**Jogar Online:**
- **Realms.cards** — Simulador principal
- **Tabletop Simulator** — Mod da comunidade

**Comunidade:**
- **Discord Oficial Sorcery** — Discussões, trades, LFG
- **r/SorceryTCG** — Reddit da comunidade
- **WhatsApp Sorcery Contested Realm Brasil** — Grupo brasileiro`,
        user_id: 'pedro',
        CreatedAt: '2026-04-09T16:00:00Z',
        view_count: 678,
        is_pinned: true,
        is_locked: false
    },
    // Lore & Arte
    {
        Id: 's13',
        category: 'lore-arte',
        Title: 'Os quatro elementos do Realm — uma introdução à lore',
        content: `Sorcery se passa no Realm, um mundo onde quatro elementos primordiais competem pelo domínio:

**Fire 🔥**
Destruição, paixão, transformação. Associado a demônios, dragões e magia ofensiva. Thematicamente vermelho/laranja.

**Water 💧**
Adaptação, profundidade, mistério. Associado a criaturas aquáticas, ilusões e controle. Thematicamente azul.

**Earth 🌍**
Estabilidade, força, persistência. Associado a gigantes, golems e defesa. Thematicamente verde/marrom.

**Air 💨**
Liberdade, velocidade, conhecimento. Associado a anjos, espíritos e evasão. Thematicamente branco/roxo.

**Os Avatares** são manifestações de poder que canalizam esses elementos. Cada Avatar tem afinidades naturais, mas pode aprender a usar qualquer elemento através dos sites que controla.

A lore completa está sendo expandida a cada set, com Gothic introduzindo elementos de horror cósmico e Arthurian trazendo mitologia arturiana.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-08T12:00:00Z',
        view_count: 534,
        is_pinned: false,
        is_locked: false
    },
    // Eventos
    {
        Id: 's14',
        category: 'eventos',
        Title: 'Crescimento explosivo do jogo em 2025',
        content: `Sorcery está crescendo de forma impressionante. Alguns dados:

**Comunidade:**
- Subreddit passou de 5k para 20k+ membros em 2025
- Discord oficial com milhares de membros ativos
- Grupos locais surgindo em várias cidades brasileiras

**Produto:**
- Gothic foi o set mais vendido até agora
- Precons estão esgotando em semanas
- LGS relatam demanda crescente

**Competitivo:**
- Crossroads (torneios oficiais) em várias cidades
- Prêmios cada vez maiores
- Cobertura de streamers aumentando

**Por que o crescimento?**
- Arte diferenciada (pinturas tradicionais)
- Gameplay único (grid espacial)
- Comunidade acolhedora
- Timing perfeito (muitos jogadores descontentes com MTG)

2026 promete ser ainda maior com novos sets anunciados e expansão internacional.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-07T10:00:00Z',
        view_count: 945,
        is_pinned: false,
        is_locked: false
    },
    // Geral
    {
        Id: 's15',
        category: 'geral',
        Title: 'A primeira regra de Sorcery é: seja legal',
        content: `Sorcery é declaradamente menos competitivo que MTG. A comunidade tem duas regras de ouro:

1. **Seja cool.**
2. Se você e seu oponente não chegarem a uma resposta sobre como algo funciona, **combinem o que faz mais sentido** — e sigam o jogo.

Isso significa que FAQs e clarificações oficiais chegam mais devagar que em MTG. O recurso vital da comunidade é o **Codex do curiosa.io**, que tem entradas de regras e FAQs por carta bem atualizadas.

Muitos jogadores casuais também jogam com proporções não-oficiais (ex.: 36/16 em vez de 50/30) e criam formatos próprios. É cultura do jogo.

A comunidade valoriza mais a experiência de jogo do que a competição acirrada. Isso não significa que não há competitivo — há, e é sério — mas o tom geral é mais relaxado e acolhedor.`,
        user_id: 'pedro',
        CreatedAt: '2026-04-06T14:30:00Z',
        view_count: 756,
        is_pinned: false,
        is_locked: false
    }
];

// Simple markdown parser for forum content
function parseForumMarkdown(text) {
    if (!text) return '';

    // First escape HTML to prevent XSS
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Parse markdown
    html = html
        // Bold: **text** or __text__
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Italic: *text* or _text_
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        // Lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
        // Blockquotes
        .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');

    // Wrap in paragraph
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[234]>)/g, '$1');
    html = html.replace(/(<\/h[234]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

    return html;
}

class ForumService {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.currentCategory = null;
        this.comments = [];
        this.userCache = new Map();
        this.categoryStats = {};
        this.filters = {
            sort: 'recent'
        };
        this.pagination = {
            offset: 0,
            limit: 20,
            hasMore: true
        };
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async init() {
        await this.loadCategoryStats();
        this.showCategoriesHome();
    }

    // ==========================================
    // VIEW NAVIGATION
    // ==========================================

    showCategoriesHome() {
        this.currentCategory = null;

        document.getElementById('forum-categories-view')?.classList.remove('hidden');
        document.getElementById('forum-category-view')?.classList.add('hidden');
        document.getElementById('forum-topic-view')?.classList.add('hidden');

        this.renderCategoriesGrid();
        this.loadRecentPosts();
    }

    async showCategory(categoryKey) {
        this.currentCategory = categoryKey;
        this.pagination.offset = 0;

        document.getElementById('forum-categories-view')?.classList.add('hidden');
        document.getElementById('forum-category-view')?.classList.remove('hidden');
        document.getElementById('forum-topic-view')?.classList.add('hidden');

        const cat = FORUM_CATEGORIES[categoryKey];
        if (cat) {
            const iconEl = document.getElementById('forum-category-icon');
            const nameEl = document.getElementById('forum-category-name');
            const descEl = document.getElementById('forum-category-description');

            if (iconEl) iconEl.setAttribute('data-lucide', cat.icon);
            if (nameEl) nameEl.textContent = cat.name;
            if (descEl) descEl.textContent = cat.description;

            // Update new topic button visibility
            const newTopicBtn = document.getElementById('forum-new-topic-btn');
            if (newTopicBtn) {
                newTopicBtn.style.display = nocoDBService.isLoggedIn() ? 'flex' : 'none';
            }
        }

        refreshIcons();
        await this.loadCategoryTopics();
    }

    async showTopic(postId) {
        document.getElementById('forum-categories-view')?.classList.add('hidden');
        document.getElementById('forum-category-view')?.classList.add('hidden');
        document.getElementById('forum-topic-view')?.classList.remove('hidden');

        await this.loadTopicDetail(postId);
    }

    // ==========================================
    // LOAD DATA
    // ==========================================

    async loadCategoryStats() {
        try {
            for (const key of Object.keys(FORUM_CATEGORIES)) {
                let dbPosts = [];
                try {
                    dbPosts = await nocoDBService.getForumPosts({ category: key, limit: 100 });
                } catch (e) {
                    // DB might not be available
                }
                const staticPosts = STATIC_FORUM_POSTS.filter(p => p.category === key);
                const allPosts = [...staticPosts, ...dbPosts].sort((a, b) =>
                    new Date(b.CreatedAt) - new Date(a.CreatedAt)
                );
                this.categoryStats[key] = {
                    topicCount: allPosts.length,
                    lastPost: allPosts[0] || null
                };
            }
        } catch (error) {
            console.error('Error loading category stats:', error);
        }
    }

    async loadRecentPosts() {
        try {
            const container = document.getElementById('forum-recent-posts');
            if (!container) return;

            let dbPosts = [];
            try {
                dbPosts = await nocoDBService.getForumPosts({ sort: 'recent', limit: 5 });
            } catch (e) {
                // DB might not be available
            }

            // Merge with static posts
            const allPosts = [...STATIC_FORUM_POSTS, ...dbPosts]
                .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
                .slice(0, 5);

            if (allPosts.length === 0) {
                container.innerHTML = '<p class="text-muted">Nenhuma atividade recente</p>';
                return;
            }

            // Add pedro to user cache for static posts
            this.userCache.set('pedro', { displayName: 'Pedro Lourenço', avatarId: 1 });

            const userIds = [...new Set(allPosts.filter(p => p.user_id !== 'pedro').map(p => p.user_id))];
            await this.loadUserInfo(userIds);

            container.innerHTML = allPosts.map(post => {
                const user = this.userCache.get(post.user_id) || { displayName: 'Usuário' };
                const postId = typeof post.Id === 'string' ? `'${post.Id}'` : post.Id;
                return `
                    <div class="forum-recent-item" onclick="forumService.showTopic(${postId})">
                        <div class="forum-recent-item-category cat-${post.category}"></div>
                        <div class="forum-recent-item-content">
                            <div class="forum-recent-item-title">${escapeHtml(post.Title || post.title)}</div>
                            <div class="forum-recent-item-meta">
                                ${escapeHtml(user.displayName)} · ${formatRelativeDate(post.CreatedAt)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }

    async loadCategoryTopics() {
        try {
            const container = document.getElementById('forum-topics-list');
            if (!container) return;

            showContainerLoading('forum-topics-list');

            let dbPosts = [];
            try {
                dbPosts = await nocoDBService.getForumPosts({
                    category: this.currentCategory,
                    sort: this.filters.sort,
                    offset: this.pagination.offset,
                    limit: this.pagination.limit
                });

                // Get comment counts for db posts
                for (const post of dbPosts) {
                    const comments = await nocoDBService.getForumComments(post.Id);
                    post.commentCount = comments.length;
                }
            } catch (e) {
                // DB might not be available
            }

            // Get static posts for this category
            const staticPosts = STATIC_FORUM_POSTS
                .filter(p => p.category === this.currentCategory)
                .map(p => ({ ...p, commentCount: 0 }));

            // Merge and sort
            const allPosts = [...staticPosts, ...dbPosts].sort((a, b) => {
                // Pinned first
                if (a.is_pinned && !b.is_pinned) return -1;
                if (!a.is_pinned && b.is_pinned) return 1;
                // Then by date
                return new Date(b.CreatedAt) - new Date(a.CreatedAt);
            });

            this.posts = allPosts;
            this.pagination.hasMore = dbPosts.length === this.pagination.limit;

            // Add pedro to user cache
            this.userCache.set('pedro', { displayName: 'Pedro Lourenço', avatarId: 1 });

            const userIds = [...new Set(allPosts.filter(p => p.user_id !== 'pedro').map(p => p.user_id))];
            await this.loadUserInfo(userIds);

            this.renderTopicsList();
            hideContainerLoading('forum-topics-list');

        } catch (error) {
            console.error('Error loading category topics:', error);
            showToast('Erro ao carregar tópicos', 'error');
            hideContainerLoading('forum-topics-list');
        }
    }

    async loadTopicDetail(postId) {
        try {
            const container = document.getElementById('forum-topic-view');
            if (!container) return;

            showContainerLoading('forum-topic-view');

            // Check if it's a static post
            if (typeof postId === 'string' && postId.startsWith('s')) {
                this.currentPost = STATIC_FORUM_POSTS.find(p => p.Id === postId);
                this.comments = []; // Static posts have no comments yet
            } else {
                this.currentPost = await nocoDBService.getForumPost(postId);
                if (this.currentPost) {
                    this.comments = await nocoDBService.getForumComments(postId);
                    // Increment views
                    nocoDBService.incrementPostViews(postId, this.currentPost.view_count);
                }
            }

            if (!this.currentPost) {
                showToast('Tópico não encontrado', 'error');
                this.showCategoriesHome();
                return;
            }

            // Add pedro to user cache
            this.userCache.set('pedro', { displayName: 'Pedro Lourenço', avatarId: 1 });

            const userIds = [this.currentPost.user_id, ...this.comments.map(c => c.user_id)]
                .filter(id => id !== 'pedro');
            await this.loadUserInfo([...new Set(userIds)]);

            this.renderTopicDetail();
            hideContainerLoading('forum-topic-view');

        } catch (error) {
            console.error('Error loading topic:', error);
            showToast('Erro ao carregar tópico', 'error');
            hideContainerLoading('forum-topic-view');
        }
    }

    async loadUserInfo(userIds) {
        for (const userId of userIds) {
            if (!this.userCache.has(userId)) {
                const user = await nocoDBService.getUserById(userId);
                if (user) {
                    const rep = await nocoDBService.getUserReputation(userId);
                    user.reputation = rep;
                    this.userCache.set(userId, user);
                }
            }
        }
    }

    // ==========================================
    // RENDER METHODS
    // ==========================================

    renderCategoriesGrid() {
        const container = document.getElementById('forum-categories-grid');
        if (!container) return;

        container.innerHTML = Object.entries(FORUM_CATEGORIES).map(([key, cat]) => {
            const stats = this.categoryStats[key] || { topicCount: 0 };
            return `
                <div class="forum-category-card" onclick="forumService.showCategory('${key}')">
                    <div class="forum-category-card-header">
                        <div class="forum-category-card-icon cat-${key}">
                            <i data-lucide="${cat.icon}"></i>
                        </div>
                        <div class="forum-category-card-title">${cat.name}</div>
                    </div>
                    <div class="forum-category-card-description">${cat.description}</div>
                    <div class="forum-category-card-stats">
                        <span><i data-lucide="message-square"></i> ${stats.topicCount} tópicos</span>
                    </div>
                </div>
            `;
        }).join('');

        refreshIcons();
    }

    renderTopicsList() {
        const container = document.getElementById('forum-topics-list');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="message-square-plus"></i>
                    <h3>Nenhum tópico nesta categoria</h3>
                    <p>Seja o primeiro a criar um tópico!</p>
                    ${nocoDBService.isLoggedIn() ? `
                        <button class="btn btn-primary" onclick="forumService.openCreatePostModal()">
                            <i data-lucide="plus"></i>
                            Criar Tópico
                        </button>
                    ` : ''}
                </div>
            `;
            refreshIcons();
            return;
        }

        // Separate pinned posts
        const pinnedPosts = this.posts.filter(p => p.is_pinned);
        const normalPosts = this.posts.filter(p => !p.is_pinned);

        let html = '';

        if (pinnedPosts.length > 0) {
            html += '<div class="pinned-posts-section"><h4><i data-lucide="pin"></i> Fixados</h4>';
            html += pinnedPosts.map(post => this.renderTopicCard(post, true)).join('');
            html += '</div>';
        }

        html += normalPosts.map(post => this.renderTopicCard(post, false)).join('');

        if (this.pagination.hasMore) {
            html += `
                <button class="btn btn-secondary load-more-btn" onclick="forumService.loadMore()">
                    <i data-lucide="chevrons-down"></i>
                    Carregar mais
                </button>
            `;
        }

        container.innerHTML = html;
        refreshIcons();
    }

    renderTopicCard(post, isPinned) {
        const user = this.userCache.get(post.user_id) || { displayName: 'Usuário', avatarId: 1 };
        const badge = getReputationBadge(user.reputation?.score || 0);
        const title = post.Title || post.title || 'Sem título';
        const postIdStr = typeof post.Id === 'string' ? `'${post.Id}'` : post.Id;

        return `
            <div class="forum-post-card ${isPinned ? 'pinned' : ''} ${post.is_locked ? 'locked' : ''}" onclick="forumService.showTopic(${postIdStr})">
                <div class="post-card-left">
                    ${renderAvatar(user.avatarId, 'medium')}
                </div>
                <div class="post-card-content">
                    <div class="post-card-header">
                        ${post.is_locked ? '<span class="post-locked"><i data-lucide="lock"></i></span>' : ''}
                    </div>
                    <h4 class="post-title">${escapeHtml(title)}</h4>
                    <p class="post-preview">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
                    <div class="post-card-footer">
                        <span class="post-author post-author-clickable" onclick="event.stopPropagation(); openUserProfileModal('${post.user_id}')">
                            ${escapeHtml(user.displayName)}
                            <span class="reputation-badge reputation-${badge.class}" title="${badge.name}">
                                <i data-lucide="${badge.icon}"></i>
                            </span>
                        </span>
                        <span class="post-meta">
                            <span class="post-date">${formatRelativeDate(post.CreatedAt)}</span>
                            <span class="post-stats">
                                <i data-lucide="eye"></i> ${post.view_count || 0}
                                <i data-lucide="message-circle"></i> ${post.commentCount || 0}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTopicDetail() {
        const container = document.getElementById('forum-topic-view');
        if (!container || !this.currentPost) return;

        const post = this.currentPost;
        const user = this.userCache.get(post.user_id) || { displayName: 'Usuário', avatarId: 1 };
        const cat = FORUM_CATEGORIES[post.category] || FORUM_CATEGORIES.geral;
        const badge = getReputationBadge(user.reputation?.score || 0);
        const title = post.Title || post.title || 'Sem título';

        // Check if current user is the author (compare as strings to avoid type mismatch)
        const currentUser = nocoDBService.getCurrentUser();
        const isAuthor = currentUser && String(currentUser.id) === String(post.user_id);
        console.log('Delete button debug:', { currentUserId: currentUser?.id, postUserId: post.user_id, isAuthor });

        container.innerHTML = `
            <div class="forum-post-full">
                <div class="post-header">
                    <button class="btn btn-ghost" onclick="forumService.backFromTopic()">
                        <i data-lucide="arrow-left"></i>
                        Voltar para ${cat.name}
                    </button>
                    <div class="post-header-right">
                        <span class="post-category post-category-${post.category}">
                            <i data-lucide="${cat.icon}"></i>
                            ${cat.name}
                        </span>
                        ${isAuthor ? `
                            <button class="btn btn-ghost btn-danger-text" onclick="event.stopPropagation(); forumService.confirmDeletePost(${post.Id})" title="Excluir tópico">
                                <i data-lucide="trash-2"></i>
                                <span>Excluir</span>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <h2 class="post-full-title">${escapeHtml(title)}</h2>

                <div class="post-author-info">
                    ${renderAvatar(user.avatarId, 'medium')}
                    <div class="author-details">
                        <span class="author-name post-author-clickable" onclick="openUserProfileModal('${post.user_id}')">
                            ${escapeHtml(user.displayName)}
                            <span class="reputation-badge reputation-${badge.class}">
                                <i data-lucide="${badge.icon}"></i>
                                ${badge.name}
                            </span>
                        </span>
                        <span class="post-date">${new Date(post.CreatedAt).toLocaleString('pt-BR')}</span>
                    </div>
                </div>

                <div class="post-full-content">
                    ${parseForumMarkdown(post.content)}
                </div>

                <div class="post-stats-bar">
                    <span><i data-lucide="eye"></i> ${post.view_count || 0} visualizações</span>
                    <span><i data-lucide="message-circle"></i> ${this.comments.length} comentários</span>
                </div>
            </div>

            <div class="comments-section">
                <h3>Comentários</h3>

                ${!post.is_locked && nocoDBService.isLoggedIn() ? `
                    <div class="comment-form">
                        <textarea id="comment-content" placeholder="Escreva um comentário..." class="textarea" maxlength="2000"></textarea>
                        <button class="btn btn-primary" onclick="forumService.addComment()">
                            <i data-lucide="send"></i>
                            Enviar
                        </button>
                    </div>
                ` : post.is_locked ? `
                    <div class="locked-notice">
                        <i data-lucide="lock"></i>
                        Este tópico está fechado para novos comentários
                    </div>
                ` : `
                    <div class="login-notice">
                        <a href="#" onclick="openLoginModal(); return false;">Faça login</a> para comentar
                    </div>
                `}

                <div class="comments-list">
                    ${this.comments.length === 0 ? `
                        <p class="no-comments">Nenhum comentário ainda. Seja o primeiro!</p>
                    ` : this.comments.map(comment => this.renderComment(comment)).join('')}
                </div>
            </div>
        `;

        refreshIcons();
    }

    renderComment(comment) {
        const user = this.userCache.get(comment.user_id) || { displayName: 'Usuário', avatarId: 1 };
        const badge = getReputationBadge(user.reputation?.score || 0);

        return `
            <div class="comment-item">
                <div class="comment-avatar">
                    ${renderAvatar(user.avatarId, 'small')}
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author comment-author-clickable" onclick="openUserProfileModal('${comment.user_id}')">
                            ${escapeHtml(user.displayName)}
                            <span class="reputation-badge reputation-${badge.class}">
                                <i data-lucide="${badge.icon}"></i>
                            </span>
                        </span>
                        <span class="comment-date">${formatRelativeDate(comment.CreatedAt)}</span>
                    </div>
                    <div class="comment-text">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // ACTIONS
    // ==========================================

    backFromTopic() {
        if (this.currentCategory) {
            this.showCategory(this.currentCategory);
        } else {
            this.showCategoriesHome();
        }
    }

    openCreatePostModal() {
        if (!nocoDBService.isLoggedIn()) {
            showToast('Faça login para criar tópicos', 'error');
            return;
        }

        const currentUser = nocoDBService.getCurrentUser();
        if (!currentUser.termsAccepted) {
            showTermsModal(() => this.openCreatePostModal());
            return;
        }

        // Reset form
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';

        // Set category to current if in a category view
        const categorySelect = document.getElementById('post-category');
        if (categorySelect) {
            categorySelect.value = this.currentCategory || 'geral';
        }

        openModal('create-post-modal');
    }

    async createPost(event) {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const category = document.getElementById('post-category').value;

        if (!title || !content) {
            showToast('Preencha o título e conteúdo', 'error');
            return;
        }

        if (title.length > 100) {
            showToast('Título muito longo (máx. 100 caracteres)', 'error');
            return;
        }

        const submitBtn = event?.target || document.querySelector('#create-post-modal .btn-primary');

        try {
            if (submitBtn) setButtonLoading(submitBtn, true);

            await nocoDBService.createForumPost({
                title,
                content,
                category
            });

            showToast('Tópico criado!', 'success');
            closeModal('create-post-modal');

            // Refresh stats and show category
            await this.loadCategoryStats();
            this.showCategory(category);

            if (submitBtn) setButtonLoading(submitBtn, false);
        } catch (error) {
            console.error('Error creating post:', error);
            showToast('Erro ao criar tópico', 'error');
            if (submitBtn) setButtonLoading(submitBtn, false);
        }
    }

    async addComment() {
        if (!this.currentPost) return;

        const content = document.getElementById('comment-content').value.trim();
        if (!content) {
            showToast('Escreva um comentário', 'error');
            return;
        }

        try {
            await nocoDBService.createForumComment(this.currentPost.Id, content);

            this.comments = await nocoDBService.getForumComments(this.currentPost.Id);
            await this.loadUserInfo(this.comments.map(c => c.user_id));

            this.renderTopicDetail();
            document.getElementById('comment-content').value = '';
            showToast('Comentário enviado!', 'success');
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Erro ao enviar comentário', 'error');
        }
    }

    confirmDeletePost(postId) {
        if (confirm('Tem certeza que deseja excluir este tópico?\n\nTodos os comentários também serão removidos. Esta ação não pode ser desfeita.')) {
            this.deletePost(postId);
        }
    }

    async deletePost(postId) {
        try {
            await nocoDBService.deleteForumPost(postId);
            showToast('Tópico excluído!', 'success');

            // Refresh stats and go back to category or home
            await this.loadCategoryStats();
            if (this.currentCategory) {
                this.showCategory(this.currentCategory);
            } else {
                this.showCategoriesHome();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showToast('Erro ao excluir tópico', 'error');
        }
    }

    setFilter(key, value) {
        this.filters[key] = value;
        if (this.currentCategory) {
            this.loadCategoryTopics();
        }
    }

    loadMore() {
        this.pagination.offset += this.pagination.limit;
        this.loadCategoryTopics();
    }

    async search(query) {
        if (!query || query.length < 2) {
            if (this.currentCategory) {
                this.loadCategoryTopics();
            }
            return;
        }

        // Filter current posts by search query
        await this.loadCategoryTopics();
        this.posts = this.posts.filter(post => {
            const title = (post.Title || post.title || '').toLowerCase();
            const content = (post.content || '').toLowerCase();
            return title.includes(query.toLowerCase()) || content.includes(query.toLowerCase());
        });
        this.renderTopicsList();
    }
}

// ==========================================
// GLOBAL INSTANCE & INITIALIZATION
// ==========================================

const forumService = new ForumService();

// Initialize when forum view is shown
function initForumView() {
    forumService.init();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('forum-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            forumService.search(e.target.value);
        }, 300));
    }

    const sortSelect = document.getElementById('forum-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            forumService.setFilter('sort', e.target.value);
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ForumService, forumService, FORUM_CATEGORIES, initForumView };
}
