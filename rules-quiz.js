/**
 * Rules Quiz - Test your Sorcery knowledge
 * Uses questions based on the FAQ
 */

const QUIZ_QUESTIONS = [
    // Basics
    {
        question: "Quantos cards deve ter seu Spellbook (deck principal)?",
        options: ["40 cards", "50 cards", "60 cards", "70 cards"],
        correct: 2,
        category: "Regras Basicas",
        explanation: "O Spellbook deve ter exatamente 60 cards, incluindo 1 Avatar."
    },
    {
        question: "Quantas copias de um card voce pode ter no deck?",
        options: ["2 copias", "3 copias", "4 copias", "Sem limite"],
        correct: 2,
        category: "Regras Basicas",
        explanation: "Maximo de 4 copias de qualquer card pelo nome. Sites basicos nao tem limite."
    },
    {
        question: "Quantos Sites voce pode jogar por turno?",
        options: ["1 Site", "2 Sites", "3 Sites", "Sem limite"],
        correct: 0,
        category: "Regras Basicas",
        explanation: "Voce so pode jogar 1 Site por turno, durante sua Fase de Inicio."
    },
    {
        question: "Qual o limite de cards na mao?",
        options: ["5 cards", "6 cards", "7 cards", "10 cards"],
        correct: 2,
        category: "Regras Basicas",
        explanation: "O limite e 7 cards. Se tiver mais de 7 no final do turno, deve descartar."
    },
    {
        question: "O que acontece se seu Spellbook acabar?",
        options: ["Nada", "Compra do descarte", "Embaralha o descarte", "Voce perde o jogo"],
        correct: 3,
        category: "Regras Basicas",
        explanation: "Se precisar comprar e o Spellbook estiver vazio, voce perde o jogo."
    },

    // Threshold e Mana
    {
        question: "Threshold pode diminuir?",
        options: ["Sim, quando Sites sao destruidos", "Sim, no fim do turno", "Nao, e permanente", "Depende do card"],
        correct: 2,
        category: "Threshold e Mana",
        explanation: "Threshold nunca diminui. Mesmo se um Site for destruido, seu Threshold permanece."
    },
    {
        question: "Posso guardar mana para o proximo turno?",
        options: ["Sim, sempre", "Sim, ate 3 mana", "Nao, mana e perdido", "Depende do elemento"],
        correct: 2,
        category: "Threshold e Mana",
        explanation: "Mana nao utilizado e perdido no final do turno. Use ou perca!"
    },
    {
        question: "Como ganho Threshold?",
        options: ["Comprando cards", "Jogando Sites", "Vencendo combates", "No inicio do turno"],
        correct: 1,
        category: "Threshold e Mana",
        explanation: "Cada Site que voce joga aumenta seu Threshold do elemento correspondente em +1."
    },
    {
        question: "O que e Affinity?",
        options: ["Bonus de ataque", "Reducao de custo", "Bonus de defesa", "Tipo de criatura"],
        correct: 1,
        category: "Threshold e Mana",
        explanation: "Affinity reduz o custo de mana baseado no seu Threshold do elemento indicado."
    },

    // Combat
    {
        question: "O que e Summoning Sickness?",
        options: [
            "Criatura nao pode atacar/mover no turno em que entra",
            "Criatura leva dano ao entrar",
            "Criatura custa mais mana",
            "Criatura nao pode bloquear"
        ],
        correct: 0,
        category: "Combate",
        explanation: "Criaturas recem-jogadas nao podem atacar, mover, ou virar ate o proximo turno. Ainda podem bloquear."
    },
    {
        question: "Uma criatura pode atacar mais de uma vez por turno?",
        options: ["Sim, sempre", "Sim, se tiver Haste", "Nao, apenas uma vez", "Nao, a menos que tenha Double Strike"],
        correct: 2,
        category: "Combate",
        explanation: "Cada criatura so pode atacar uma vez por turno, pois atacar a vira."
    },
    {
        question: "Criaturas recem-jogadas podem bloquear?",
        options: ["Nao, tem Summoning Sickness", "Sim, podem bloquear", "Depende do tipo", "Apenas se tiver Defender"],
        correct: 1,
        category: "Combate",
        explanation: "Summoning Sickness nao impede bloqueio. Criaturas podem bloquear no turno em que entram."
    },
    {
        question: "O que e Lethal?",
        options: [
            "Criatura causa dano dobrado",
            "Qualquer dano destroi a criatura alvo",
            "Criatura nao pode ser bloqueada",
            "Criatura ataca duas vezes"
        ],
        correct: 1,
        category: "Combate",
        explanation: "Lethal faz com que qualquer dano causado seja letal, destruindo a criatura independente da defesa."
    },

    // Movement
    {
        question: "Quantos movimentos uma criatura pode fazer por turno?",
        options: ["1 movimento", "2 movimentos", "Sem limite", "Depende da criatura"],
        correct: 0,
        category: "Movimento",
        explanation: "Cada criatura pode mover apenas 1 vez por turno."
    },
    {
        question: "Uma criatura pode mover e atacar no mesmo turno?",
        options: ["Nao, sao acoes exclusivas", "Sim, pode fazer ambos", "Sim, mas nao no primeiro turno", "Apenas com Haste"],
        correct: 1,
        category: "Movimento",
        explanation: "Sim, uma criatura pode mover e depois atacar (ou vice-versa) no mesmo turno."
    },
    {
        question: "O que e Airborne?",
        options: [
            "Criatura pode atacar direto",
            "Criatura pode mover sobre outras",
            "Criatura so pode ser bloqueada por Airborne",
            "Criatura ignora terrenos"
        ],
        correct: 2,
        category: "Movimento",
        explanation: "Airborne significa que a criatura so pode ser bloqueada por outras criaturas com Airborne."
    },

    // Spells
    {
        question: "Posso jogar Magias na fase principal?",
        options: ["Nao, apenas em combate", "Sim, a qualquer momento", "Depende da magia", "Apenas se tiver mana sobrando"],
        correct: 1,
        category: "Magias",
        explanation: "Voce pode jogar magias a qualquer momento durante sua fase principal, se tiver mana e threshold."
    },
    {
        question: "O que acontece com uma Aura se a criatura equipada morrer?",
        options: ["Aura vai para o descarte", "Aura vai para a mao", "Aura fica no campo", "Aura equipa outra criatura"],
        correct: 0,
        category: "Magias",
        explanation: "Quando uma criatura com Aura morre, a Aura vai para o descarte junto."
    },

    // Avatar
    {
        question: "O que acontece se seu Avatar morrer?",
        options: ["Voce compra outro", "Voce perde o jogo", "Avatar volta virado", "Nada, e opcional"],
        correct: 1,
        category: "Avatar",
        explanation: "Se seu Avatar for destruido ou tiver 0 ou menos de vida, voce perde o jogo imediatamente."
    },
    {
        question: "Avatar pode ser bloqueado?",
        options: ["Nao, e intocavel", "Sim, como qualquer criatura", "Depende da habilidade", "Apenas por outros Avatars"],
        correct: 1,
        category: "Avatar",
        explanation: "Avatar e uma criatura especial e pode ser bloqueado normalmente."
    }
];

class RulesQuiz {
    constructor() {
        this.questions = [...QUIZ_QUESTIONS];
        this.currentQuestion = 0;
        this.score = 0;
        this.answered = [];
        this.shuffledQuestions = [];
        this.quizLength = 10; // Default quiz length
    }

    /**
     * Start a new quiz
     */
    startQuiz(length = 10) {
        this.quizLength = Math.min(length, QUIZ_QUESTIONS.length);
        this.currentQuestion = 0;
        this.score = 0;
        this.answered = [];

        // Shuffle and select questions
        this.shuffledQuestions = this.shuffleArray([...QUIZ_QUESTIONS]).slice(0, this.quizLength);

        return this.getCurrentQuestion();
    }

    /**
     * Get current question
     */
    getCurrentQuestion() {
        if (this.currentQuestion >= this.shuffledQuestions.length) {
            return null;
        }

        const q = this.shuffledQuestions[this.currentQuestion];
        return {
            number: this.currentQuestion + 1,
            total: this.quizLength,
            question: q.question,
            options: q.options,
            category: q.category
        };
    }

    /**
     * Answer current question
     */
    answerQuestion(selectedIndex) {
        const q = this.shuffledQuestions[this.currentQuestion];
        const isCorrect = selectedIndex === q.correct;

        if (isCorrect) {
            this.score++;
        }

        this.answered.push({
            question: q.question,
            selected: selectedIndex,
            correct: q.correct,
            isCorrect,
            explanation: q.explanation
        });

        const result = {
            isCorrect,
            correctAnswer: q.options[q.correct],
            selectedAnswer: q.options[selectedIndex],
            explanation: q.explanation,
            score: this.score,
            total: this.currentQuestion + 1
        };

        this.currentQuestion++;

        return result;
    }

    /**
     * Check if quiz is complete
     */
    isComplete() {
        return this.currentQuestion >= this.shuffledQuestions.length;
    }

    /**
     * Get final results
     */
    getResults() {
        const percentage = Math.round((this.score / this.quizLength) * 100);

        let grade, message;
        if (percentage >= 90) {
            grade = 'S';
            message = 'Mestre das Regras! Voce domina Sorcery!';
        } else if (percentage >= 80) {
            grade = 'A';
            message = 'Excelente! Conhecimento solido das regras.';
        } else if (percentage >= 70) {
            grade = 'B';
            message = 'Bom trabalho! Algumas revisoes podem ajudar.';
        } else if (percentage >= 60) {
            grade = 'C';
            message = 'Razoavel. Recomendo estudar o Rulebook.';
        } else {
            grade = 'D';
            message = 'Precisa praticar mais. Leia o FAQ e tente novamente!';
        }

        return {
            score: this.score,
            total: this.quizLength,
            percentage,
            grade,
            message,
            answers: this.answered
        };
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Get questions by category
     */
    getQuestionsByCategory(category) {
        return QUIZ_QUESTIONS.filter(q => q.category === category);
    }

    /**
     * Get all categories
     */
    getCategories() {
        const categories = new Set(QUIZ_QUESTIONS.map(q => q.category));
        return Array.from(categories);
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            totalQuestions: QUIZ_QUESTIONS.length,
            categories: this.getCategories(),
            byCategory: this.getCategories().map(cat => ({
                name: cat,
                count: this.getQuestionsByCategory(cat).length
            }))
        };
    }
}

// Render functions
function renderQuizStart(containerId = 'quiz-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = rulesQuiz.getStats();

    container.innerHTML = `
        <div class="quiz-start">
            <div class="quiz-icon">
                <i data-lucide="brain"></i>
            </div>
            <h3>Quiz de Regras</h3>
            <p>Teste seus conhecimentos sobre as regras de Sorcery: Contested Realm</p>

            <div class="quiz-stats">
                <span>${stats.totalQuestions} perguntas disponiveis</span>
                <span>${stats.categories.length} categorias</span>
            </div>

            <div class="quiz-options">
                <label>Numero de perguntas:</label>
                <select id="quiz-length">
                    <option value="5">5 perguntas (Rapido)</option>
                    <option value="10" selected>10 perguntas (Normal)</option>
                    <option value="15">15 perguntas (Completo)</option>
                    <option value="20">20 perguntas (Desafio)</option>
                </select>
            </div>

            <button class="btn primary quiz-start-btn" onclick="startQuizGame()">
                <i data-lucide="play"></i> Comecar Quiz
            </button>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function startQuizGame() {
    const lengthSelect = document.getElementById('quiz-length');
    const length = parseInt(lengthSelect?.value || 10);

    rulesQuiz.startQuiz(length);
    renderQuizQuestion();
}

function renderQuizQuestion(containerId = 'quiz-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const q = rulesQuiz.getCurrentQuestion();

    if (!q) {
        renderQuizResults();
        return;
    }

    container.innerHTML = `
        <div class="quiz-question">
            <div class="quiz-progress">
                <div class="quiz-progress-bar" style="width: ${(q.number / q.total) * 100}%"></div>
            </div>
            <div class="quiz-header">
                <span class="quiz-category">${q.category}</span>
                <span class="quiz-counter">${q.number} / ${q.total}</span>
            </div>

            <h3 class="quiz-question-text">${q.question}</h3>

            <div class="quiz-options-list">
                ${q.options.map((opt, i) => `
                    <button class="quiz-option" onclick="selectQuizAnswer(${i})">
                        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                        <span class="option-text">${opt}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function selectQuizAnswer(index) {
    const result = rulesQuiz.answerQuestion(index);

    // Show result briefly
    const container = document.getElementById('quiz-container');
    const options = container.querySelectorAll('.quiz-option');

    options.forEach((opt, i) => {
        opt.disabled = true;
        if (i === rulesQuiz.answered[rulesQuiz.answered.length - 1].correct) {
            opt.classList.add('correct');
        }
        if (i === index && !result.isCorrect) {
            opt.classList.add('incorrect');
        }
    });

    // Show explanation
    const questionDiv = container.querySelector('.quiz-question');
    const explanationDiv = document.createElement('div');
    explanationDiv.className = `quiz-explanation ${result.isCorrect ? 'correct' : 'incorrect'}`;
    explanationDiv.innerHTML = `
        <div class="explanation-icon">
            <i data-lucide="${result.isCorrect ? 'check-circle' : 'x-circle'}"></i>
        </div>
        <p>${result.explanation}</p>
        <button class="btn primary" onclick="renderQuizQuestion()">
            ${rulesQuiz.isComplete() ? 'Ver Resultados' : 'Proxima Pergunta'}
        </button>
    `;
    questionDiv.appendChild(explanationDiv);

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderQuizResults(containerId = 'quiz-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const results = rulesQuiz.getResults();

    container.innerHTML = `
        <div class="quiz-results">
            <div class="quiz-grade quiz-grade-${results.grade.toLowerCase()}">
                ${results.grade}
            </div>

            <h3>Quiz Completo!</h3>

            <div class="quiz-score">
                <span class="score-number">${results.score}</span>
                <span class="score-divider">/</span>
                <span class="score-total">${results.total}</span>
            </div>

            <div class="quiz-percentage">${results.percentage}%</div>

            <p class="quiz-message">${results.message}</p>

            <div class="quiz-actions">
                <button class="btn primary" onclick="renderQuizStart()">
                    <i data-lucide="rotate-ccw"></i> Jogar Novamente
                </button>
                <button class="btn" onclick="showQuizReview()">
                    <i data-lucide="list"></i> Revisar Respostas
                </button>
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showQuizReview() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const results = rulesQuiz.getResults();

    container.innerHTML = `
        <div class="quiz-review">
            <h3>Revisao das Respostas</h3>

            <div class="review-list">
                ${results.answers.map((a, i) => `
                    <div class="review-item ${a.isCorrect ? 'correct' : 'incorrect'}">
                        <div class="review-header">
                            <span class="review-number">#${i + 1}</span>
                            <i data-lucide="${a.isCorrect ? 'check' : 'x'}"></i>
                        </div>
                        <p class="review-question">${a.question}</p>
                        <p class="review-answer">
                            ${a.isCorrect
                                ? `<strong>Correto:</strong> ${rulesQuiz.shuffledQuestions[i].options[a.correct]}`
                                : `<strong>Sua resposta:</strong> ${rulesQuiz.shuffledQuestions[i].options[a.selected]}<br>
                                   <strong>Correta:</strong> ${rulesQuiz.shuffledQuestions[i].options[a.correct]}`
                            }
                        </p>
                        <p class="review-explanation">${a.explanation}</p>
                    </div>
                `).join('')}
            </div>

            <button class="btn primary" onclick="renderQuizStart()">
                <i data-lucide="rotate-ccw"></i> Jogar Novamente
            </button>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Global instance
const rulesQuiz = new RulesQuiz();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RulesQuiz, rulesQuiz, QUIZ_QUESTIONS };
}

// Make functions global for onclick handlers
if (typeof window !== 'undefined') {
    window.rulesQuiz = rulesQuiz;
    window.renderQuizStart = renderQuizStart;
    window.startQuizGame = startQuizGame;
    window.renderQuizQuestion = renderQuizQuestion;
    window.selectQuizAnswer = selectQuizAnswer;
    window.renderQuizResults = renderQuizResults;
    window.showQuizReview = showQuizReview;
}
