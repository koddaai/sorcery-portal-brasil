// ============================================
// SORCERY: CONTESTED REALM - RULEBOOK PT-BR
// Tradução completa do Rulebook oficial
// Última atualização: Dezembro 2025
// ============================================

const RULEBOOK_PT = {
    version: "Dezembro 2025",
    lastUpdate: "2025-12-01",

    sections: [
        // ============================================
        // SEÇÃO 1: INTRODUÇÃO
        // ============================================
        {
            id: "introduction",
            title: "1. Introdução",
            content: `
                <h3>1.1 Bem-vindo a Sorcery: Contested Realm</h3>
                <p>Sorcery: Contested Realm é um jogo de cartas colecionáveis para dois jogadores onde cada participante assume o papel de um poderoso Avatar - um ser mágico que comanda forças elementais em uma batalha pelo controle do Realm.</p>

                <h3>1.2 Objetivo do Jogo</h3>
                <p>O objetivo é reduzir os pontos de vida do Avatar adversário de 20 para 0. Você pode causar dano através de:</p>
                <ul>
                    <li>Ataques com criaturas (Minions)</li>
                    <li>Efeitos de magias (Spells)</li>
                    <li>Habilidades de permanentes</li>
                </ul>

                <h3>1.3 Regras Fundamentais</h3>
                <div class="rule-box golden">
                    <h4>A Regra de Ouro</h4>
                    <p>Use o bom senso primeiro. Quando o texto de um card parecer informal ou ambíguo, interprete-o da forma mais razoável. Consulte o rulebook apenas quando necessário.</p>
                </div>

                <div class="rule-box silver">
                    <h4>A Regra de Prata</h4>
                    <p>Texto específico tem precedência sobre regras gerais. Se um card diz que você "pode" fazer algo normalmente proibido pelas regras, o texto do card tem prioridade.</p>
                </div>
            `
        },

        // ============================================
        // SEÇÃO 2: COMPONENTES DO JOGO
        // ============================================
        {
            id: "components",
            title: "2. Componentes do Jogo",
            content: `
                <h3>2.1 Construção de Deck</h3>
                <p>Cada jogador precisa de dois decks:</p>

                <div class="deck-type">
                    <h4>Spellbook (Grimório)</h4>
                    <ul>
                        <li>Exatamente <strong>60 cards</strong></li>
                        <li>Contém: Minions, Magics, Artifacts, Auras</li>
                        <li>Deve incluir exatamente <strong>1 Avatar</strong></li>
                        <li>Máximo de <strong>4 cópias</strong> de cada card (pelo nome)</li>
                    </ul>
                </div>

                <div class="deck-type">
                    <h4>Atlas</h4>
                    <ul>
                        <li>Até <strong>30 cards</strong> de Site</li>
                        <li>Sites básicos (sem habilidades) não têm limite de cópias</li>
                        <li>Sites com habilidades seguem a regra de 4 cópias</li>
                    </ul>
                </div>

                <h3>2.2 Tipos de Cards</h3>

                <div class="card-type avatar">
                    <h4>Avatar</h4>
                    <p>Seu personagem principal. Começa em jogo com 20 pontos de vida. Quando seu Avatar é derrotado, você perde o jogo.</p>
                    <p><strong>Características:</strong> Custo de threshold, Ataque, Defesa, Habilidades</p>
                </div>

                <div class="card-type minion">
                    <h4>Minion (Lacaio)</h4>
                    <p>Criaturas que lutam por você. Podem atacar, defender e usar habilidades.</p>
                    <p><strong>Características:</strong> Custo, Threshold, Ataque, Defesa, Tipo de criatura</p>
                </div>

                <div class="card-type magic">
                    <h4>Magic (Magia)</h4>
                    <p>Feitiços de uso único. São jogados, resolvem seu efeito e vão para o Cemetery.</p>
                    <p><strong>Características:</strong> Custo, Threshold, Efeito</p>
                </div>

                <div class="card-type artifact">
                    <h4>Artifact (Artefato)</h4>
                    <p>Objetos mágicos que permanecem no Realm. Fornecem habilidades contínuas ou ativáveis.</p>
                    <p><strong>Características:</strong> Custo, Threshold, Habilidades</p>
                </div>

                <div class="card-type aura">
                    <h4>Aura</h4>
                    <p>Encantamentos que se anexam a outros permanentes, modificando suas características.</p>
                    <p><strong>Características:</strong> Custo, Threshold, Modificações</p>
                </div>

                <div class="card-type site">
                    <h4>Site (Lugar)</h4>
                    <p>Locais que geram mana e fornecem threshold. A base de recursos do jogo.</p>
                    <p><strong>Características:</strong> Elemento(s), Habilidades especiais (alguns)</p>
                </div>
            `
        },

        // ============================================
        // SEÇÃO 3: RECURSOS
        // ============================================
        {
            id: "resources",
            title: "3. Recursos",
            content: `
                <h3>3.1 Os Quatro Elementos</h3>
                <p>Sorcery possui quatro elementos fundamentais:</p>

                <div class="elements-grid">
                    <div class="element fire">
                        <h4>🔥 Fogo (Fire)</h4>
                        <p>Agressividade, dano direto, destruição. Ideal para estratégias ofensivas e remoção de ameaças.</p>
                    </div>
                    <div class="element water">
                        <h4>💧 Água (Water)</h4>
                        <p>Controle, compra de cards, manipulação. Excelente para controlar o ritmo do jogo.</p>
                    </div>
                    <div class="element earth">
                        <h4>🏔️ Terra (Earth)</h4>
                        <p>Resistência, crescimento, criaturas poderosas. Estratégias de midrange e ramp.</p>
                    </div>
                    <div class="element air">
                        <h4>💨 Ar (Air)</h4>
                        <p>Evasão, velocidade, versatilidade. Cards flexíveis e difíceis de bloquear.</p>
                    </div>
                </div>

                <h3>3.2 Threshold</h3>
                <p><strong>Threshold</strong> representa seu domínio sobre os elementos. É um valor permanente que nunca diminui durante o jogo.</p>
                <ul>
                    <li>Cada Site jogado aumenta seu threshold do elemento correspondente em +1</li>
                    <li>Cards requerem threshold mínimo para serem jogados</li>
                    <li>Threshold não é gasto - é apenas um requisito</li>
                </ul>

                <div class="example-box">
                    <strong>Exemplo:</strong> Um card com "Fire 2" requer que você tenha pelo menos 2 de threshold de Fogo. Se você jogou 2 Sites de Fogo, seu threshold de Fogo é 2, permitindo jogar o card.
                </div>

                <h3>3.3 Mana</h3>
                <p><strong>Mana</strong> é o recurso gasto para jogar cards e ativar habilidades.</p>
                <ul>
                    <li>Gerado ao virar (tap) Sites</li>
                    <li>Mana não utilizado é perdido no fim do turno</li>
                    <li>O custo de mana aparece no canto superior do card</li>
                </ul>

                <h3>3.4 Affinity</h3>
                <p><strong>Affinity</strong> é uma mecânica que reduz o custo de mana baseado no seu threshold.</p>
                <div class="example-box">
                    <strong>Exemplo:</strong> Um card com custo 5 e "Affinity: Fire" custa 1 mana a menos para cada ponto de threshold de Fogo que você possui.
                </div>
            `
        },

        // ============================================
        // SEÇÃO 4: ESTRUTURA DO TURNO
        // ============================================
        {
            id: "turn-structure",
            title: "4. Estrutura do Turno",
            content: `
                <h3>4.1 Visão Geral</h3>
                <p>Cada turno é dividido em três fases principais:</p>

                <div class="phase start">
                    <h4>Fase de Início (Start Phase)</h4>
                    <ol>
                        <li><strong>Desvirar:</strong> Desvire (untap) todos os seus permanentes virados</li>
                        <li><strong>Comprar:</strong> Compre 1 card do Spellbook</li>
                        <li><strong>Jogar Site:</strong> Você pode jogar 1 Site do Atlas</li>
                        <li><strong>Triggers de Início:</strong> Resolva habilidades de "Awaken" e outros triggers</li>
                    </ol>
                </div>

                <div class="phase main">
                    <h4>Fase Principal (Main Phase)</h4>
                    <p>A maior parte da ação acontece aqui. Você pode:</p>
                    <ul>
                        <li>Jogar cards (Minions, Magics, Artifacts, Auras)</li>
                        <li>Ativar habilidades de permanentes</li>
                        <li>Movimentar criaturas entre regiões</li>
                        <li>Atacar com criaturas</li>
                        <li>Equipar Artifacts em criaturas</li>
                    </ul>
                    <p><em>Ações podem ser feitas em qualquer ordem, múltiplas vezes, enquanto você tiver recursos.</em></p>
                </div>

                <div class="phase end">
                    <h4>Fase de Fim (End Phase)</h4>
                    <ol>
                        <li><strong>Triggers de Fim:</strong> Resolva efeitos de "end of turn"</li>
                        <li><strong>Descartar:</strong> Se tiver mais de 7 cards na mão, descarte até ter 7</li>
                        <li><strong>Limpar Dano:</strong> Remova todo dano marcado em criaturas</li>
                        <li><strong>Passar o Turno:</strong> O oponente começa seu turno</li>
                    </ol>
                </div>

                <h3>4.2 Prioridade</h3>
                <p>Durante seu turno, você tem <strong>prioridade</strong> - o direito de agir. O oponente só pode responder com cards ou habilidades que tenham <strong>Burst</strong>.</p>
            `
        },

        // ============================================
        // SEÇÃO 5: O REALM (CAMPO DE BATALHA)
        // ============================================
        {
            id: "realm",
            title: "5. O Realm",
            content: `
                <h3>5.1 Estrutura do Realm</h3>
                <p>O <strong>Realm</strong> é o campo de batalha onde a ação acontece. É dividido em regiões que afetam movimento e combate.</p>

                <h3>5.2 Regiões</h3>
                <p>O Realm padrão possui regiões organizadas em uma grade. Criaturas ocupam regiões e podem se mover entre elas.</p>
                <ul>
                    <li><strong>Regiões Adjacentes:</strong> Regiões que compartilham uma borda (não diagonal)</li>
                    <li><strong>Regiões Próximas (Nearby):</strong> Adjacentes + diagonais</li>
                </ul>

                <h3>5.3 Tipos de Terreno</h3>
                <div class="terrain-list">
                    <div class="terrain">
                        <h4>Surface (Superfície)</h4>
                        <p>Terreno padrão. Todas as criaturas podem ocupar.</p>
                    </div>
                    <div class="terrain">
                        <h4>Underground (Subterrâneo)</h4>
                        <p>Apenas criaturas com Burrowing podem entrar.</p>
                    </div>
                    <div class="terrain">
                        <h4>Underwater (Subaquático)</h4>
                        <p>Apenas criaturas com Submerge podem entrar.</p>
                    </div>
                    <div class="terrain">
                        <h4>Void (Vazio)</h4>
                        <p>Apenas criaturas com Voidwalk podem entrar.</p>
                    </div>
                </div>

                <h3>5.4 Movimento</h3>
                <p>Durante sua Main Phase, você pode mover cada criatura uma vez:</p>
                <ul>
                    <li>Movimento básico: para uma região adjacente</li>
                    <li>Criaturas com Airborne ignoram obstáculos terrestres</li>
                    <li>Criaturas recém-jogadas têm "Summoning Sickness" e não podem mover ou atacar</li>
                </ul>
            `
        },

        // ============================================
        // SEÇÃO 6: COMBATE
        // ============================================
        {
            id: "combat",
            title: "6. Combate",
            content: `
                <h3>6.1 Declarando Ataques</h3>
                <p>Durante sua Main Phase, você pode declarar ataques com criaturas que:</p>
                <ul>
                    <li>Não têm Summoning Sickness</li>
                    <li>Não estão viradas (tapped)</li>
                    <li>Não têm Defender</li>
                </ul>

                <h3>6.2 Sequência de Combate</h3>
                <ol>
                    <li><strong>Declarar Atacante:</strong> Escolha uma criatura e um alvo (criatura ou Avatar na mesma região ou adjacente com Ranged)</li>
                    <li><strong>Virar Atacante:</strong> O atacante é virado</li>
                    <li><strong>Declarar Bloqueadores:</strong> O defensor pode designar bloqueadores</li>
                    <li><strong>Atribuir Dano:</strong> Dano é causado simultaneamente (exceto First Strike)</li>
                    <li><strong>Resolver Dano:</strong> Criaturas com dano ≥ defesa são destruídas</li>
                </ol>

                <h3>6.3 Bloqueio</h3>
                <p>Uma criatura pode bloquear um atacante se:</p>
                <ul>
                    <li>Está desvirada na mesma região que o alvo do ataque</li>
                    <li>Tem Intercept (pode bloquear ataques a outras criaturas/Avatar)</li>
                    <li>O atacante não tem Stealth</li>
                    <li>Se o atacante tem Airborne, o bloqueador também precisa ter</li>
                </ul>

                <h3>6.4 Dano</h3>
                <p>Quando uma criatura recebe dano igual ou maior que sua Defesa, ela é destruída e vai para o Cemetery.</p>

                <div class="combat-keywords">
                    <h4>Palavras-chave de Combate</h4>
                    <ul>
                        <li><strong>First Strike:</strong> Causa dano antes de criaturas sem First Strike</li>
                        <li><strong>Lethal:</strong> Qualquer dano (1+) destrói a criatura alvo</li>
                        <li><strong>Lance:</strong> +2 de Ataque ao atacar</li>
                        <li><strong>Ranged:</strong> Pode atacar em regiões adjacentes</li>
                        <li><strong>Stealth:</strong> Não pode ser bloqueado</li>
                    </ul>
                </div>
            `
        },

        // ============================================
        // SEÇÃO 7: ZONAS DO JOGO
        // ============================================
        {
            id: "zones",
            title: "7. Zonas do Jogo",
            content: `
                <h3>7.1 Zonas Públicas</h3>

                <div class="zone">
                    <h4>Realm (Campo de Batalha)</h4>
                    <p>Onde permanentes (criaturas, artefatos, auras) ficam em jogo. Informação é pública.</p>
                </div>

                <div class="zone">
                    <h4>Cemetery (Cemitério)</h4>
                    <p>Onde vão cards destruídos, descartados ou resolvidos (Magics). Informação é pública - qualquer jogador pode ver.</p>
                </div>

                <div class="zone">
                    <h4>Void (Vazio/Exílio)</h4>
                    <p>Cards removidos do jogo. Normalmente não podem mais ser utilizados. Informação é pública.</p>
                </div>

                <h3>7.2 Zonas Privadas</h3>

                <div class="zone">
                    <h4>Hand (Mão)</h4>
                    <p>Cards que você comprou mas ainda não jogou. Oponente não pode ver. Limite de 7 cards no fim do turno.</p>
                </div>

                <div class="zone">
                    <h4>Spellbook (Grimório)</h4>
                    <p>Seu deck principal. Cards são comprados do topo. Não pode ser visto por ninguém.</p>
                </div>

                <div class="zone">
                    <h4>Atlas</h4>
                    <p>Seu deck de Sites. Um Site é jogado por turno. Não pode ser visto por ninguém.</p>
                </div>

                <h3>7.3 Zona Temporária</h3>

                <div class="zone">
                    <h4>Storyline (Pilha)</h4>
                    <p>Onde magias e habilidades aguardam resolução. Resolve em ordem inversa (LIFO - último a entrar, primeiro a sair).</p>
                </div>
            `
        },

        // ============================================
        // SEÇÃO 8: HABILIDADES
        // ============================================
        {
            id: "abilities",
            title: "8. Habilidades",
            content: `
                <h3>8.1 Tipos de Habilidades</h3>

                <div class="ability-type">
                    <h4>Habilidades Ativadas</h4>
                    <p>Têm um custo e um efeito, separados por ":"</p>
                    <p class="example">Exemplo: "2, Tap: Cause 2 de dano a qualquer alvo."</p>
                    <ul>
                        <li>Você escolhe quando ativar</li>
                        <li>Pague o custo para usar</li>
                        <li>Podem ser usadas múltiplas vezes se você pagar o custo</li>
                    </ul>
                </div>

                <div class="ability-type">
                    <h4>Habilidades Triggered (Gatilho)</h4>
                    <p>Acontecem automaticamente quando uma condição é cumprida.</p>
                    <p>Palavras-chave comuns:</p>
                    <ul>
                        <li><strong>Genesis:</strong> Quando entra no Realm</li>
                        <li><strong>Death:</strong> Quando vai para o Cemetery</li>
                        <li><strong>Awaken:</strong> No início do seu turno</li>
                        <li><strong>Landfall:</strong> Quando você joga um Site</li>
                    </ul>
                </div>

                <div class="ability-type">
                    <h4>Habilidades Estáticas/Passivas</h4>
                    <p>Sempre ativas enquanto o permanente está em jogo.</p>
                    <p class="example">Exemplo: "Criaturas que você controla têm +1/+0."</p>
                </div>

                <h3>8.2 Burst</h3>
                <p><strong>Burst</strong> é uma habilidade especial que permite jogar cards ou ativar habilidades em resposta a ações do oponente - mesmo durante o turno dele.</p>
                <ul>
                    <li>Cards com Burst podem ser jogados a qualquer momento</li>
                    <li>Entram na Storyline (pilha) e resolvem antes da ação original</li>
                    <li>O oponente pode responder com seus próprios Bursts</li>
                </ul>

                <h3>8.3 Palavras-chave Importantes</h3>
                <table class="keywords-table">
                    <tr><th>Palavra-chave</th><th>Efeito</th></tr>
                    <tr><td>Airborne</td><td>Só pode ser bloqueado por criaturas com Airborne</td></tr>
                    <tr><td>Burrowing</td><td>Pode mover para regiões subterrâneas</td></tr>
                    <tr><td>Defender</td><td>Não pode atacar</td></tr>
                    <tr><td>First Strike</td><td>Causa dano de combate primeiro</td></tr>
                    <tr><td>Intercept</td><td>Pode bloquear ataques a alvos adjacentes</td></tr>
                    <tr><td>Lance</td><td>+2 de Ataque ao atacar</td></tr>
                    <tr><td>Lethal</td><td>Qualquer dano destrói a criatura alvo</td></tr>
                    <tr><td>Ranged</td><td>Pode atacar em regiões adjacentes</td></tr>
                    <tr><td>Stealth</td><td>Não pode ser bloqueado</td></tr>
                    <tr><td>Submerge</td><td>Pode mover para regiões aquáticas</td></tr>
                    <tr><td>Voidwalk</td><td>Pode mover através do Void</td></tr>
                    <tr><td>Ward</td><td>Não pode ser alvo de habilidades/magias do oponente</td></tr>
                </table>
            `
        },

        // ============================================
        // SEÇÃO 9: CONDIÇÕES DE VITÓRIA
        // ============================================
        {
            id: "victory",
            title: "9. Condições de Vitória",
            content: `
                <h3>9.1 Condições de Vitória</h3>
                <p>Você vence o jogo quando:</p>
                <ul>
                    <li><strong>Avatar Derrotado:</strong> Os pontos de vida do Avatar adversário chegam a 0</li>
                    <li><strong>Deck Vazio:</strong> O oponente precisa comprar um card mas seu Spellbook está vazio</li>
                    <li><strong>Efeito de Card:</strong> Algumas cartas têm condições de vitória alternativas</li>
                    <li><strong>Concessão:</strong> O oponente desiste</li>
                </ul>

                <h3>9.2 Empate</h3>
                <p>O jogo termina empatado se ambos os jogadores perderem simultaneamente (por exemplo, um efeito que causa dano a todos os Avatares).</p>
            `
        },

        // ============================================
        // SEÇÃO 10: FORMATOS
        // ============================================
        {
            id: "formats",
            title: "10. Formatos de Jogo",
            content: `
                <h3>10.1 Constructed</h3>
                <p>O formato principal onde você constrói seu deck antes do evento.</p>
                <div class="format-rules">
                    <ul>
                        <li>Spellbook: Exatamente 60 cards</li>
                        <li>Atlas: Até 30 cards</li>
                        <li>Máximo 4 cópias de cada card (exceto Sites básicos)</li>
                        <li>1 Avatar obrigatório</li>
                    </ul>
                </div>

                <h3>10.2 Draft</h3>
                <p>Formato limitado onde você constrói o deck durante o evento.</p>
                <div class="format-rules">
                    <ol>
                        <li>Cada jogador recebe boosters (geralmente 4-6)</li>
                        <li>Abra um booster, escolha 1 card, passe o resto</li>
                        <li>Repita até acabar os boosters</li>
                        <li>Construa um deck de 40 cards</li>
                    </ol>
                </div>

                <h3>10.3 Sealed</h3>
                <p>Formato limitado individual.</p>
                <div class="format-rules">
                    <ol>
                        <li>Receba boosters selados (geralmente 6)</li>
                        <li>Abra todos e construa um deck de 40 cards</li>
                        <li>Sites básicos são fornecidos separadamente</li>
                    </ol>
                </div>
            `
        }
    ]
};

// Função para renderizar o rulebook
function renderRulebook() {
    const container = document.getElementById('rulebook-content');
    if (!container) return;

    // Criar navegação
    const nav = document.createElement('div');
    nav.className = 'rulebook-nav';
    nav.innerHTML = RULEBOOK_PT.sections.map(section =>
        `<a href="#${section.id}" class="rulebook-nav-link">${section.title}</a>`
    ).join('');

    // Criar conteúdo
    const content = document.createElement('div');
    content.className = 'rulebook-sections';
    content.innerHTML = RULEBOOK_PT.sections.map(section => `
        <section id="${section.id}" class="rulebook-section">
            <h2>${section.title}</h2>
            ${section.content}
        </section>
    `).join('');

    container.innerHTML = '';
    container.appendChild(nav);
    container.appendChild(content);

    // Re-init Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RULEBOOK_PT, renderRulebook };
}
