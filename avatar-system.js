// ============================================
// SORCERY AVATAR SYSTEM
// 50 Pre-defined avatars for community features
// ============================================

const AVATAR_CATEGORIES = {
    elementos: { name: 'Elementos', icon: 'flame' },
    criaturas: { name: 'Criaturas', icon: 'bug' },
    classes: { name: 'Classes', icon: 'sword' },
    simbolos: { name: 'Símbolos', icon: 'hexagon' },
    abstratos: { name: 'Abstratos', icon: 'shapes' }
};

// 50 avatars - simple SVG icons with gradients
const AVATARS = [
    // ========== ELEMENTOS (1-10) ==========
    {
        id: 1,
        name: "Chama Arcana",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="fire1" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stop-color="#ff4500"/><stop offset="100%" stop-color="#ffd700"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M50 15c-5 15-20 25-15 45 3 12 12 20 15 22 3-2 12-10 15-22 5-20-10-30-15-45z" fill="url(#fire1)"/>
            <ellipse cx="50" cy="70" rx="8" ry="12" fill="#fff3" />
        </svg>`
    },
    {
        id: 2,
        name: "Gota Cristalina",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="water1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#00bfff"/><stop offset="100%" stop-color="#0066cc"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M50 18c0 0-22 28-22 42 0 12 10 22 22 22s22-10 22-22c0-14-22-42-22-42z" fill="url(#water1)"/>
            <ellipse cx="42" cy="55" rx="6" ry="10" fill="#fff3" />
        </svg>`
    },
    {
        id: 3,
        name: "Rocha Ancestral",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="earth1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#8b4513"/><stop offset="100%" stop-color="#654321"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="50,20 75,45 70,80 30,80 25,45" fill="url(#earth1)"/>
            <polygon points="50,30 65,48 62,70 38,70 35,48" fill="#9b5523"/>
        </svg>`
    },
    {
        id: 4,
        name: "Brisa Etérea",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M20 40 Q35 35 50 40 T80 40" stroke="#87ceeb" stroke-width="4" fill="none" opacity="0.8"/>
            <path d="M25 50 Q40 45 55 50 T85 50" stroke="#b0e0e6" stroke-width="3" fill="none" opacity="0.6"/>
            <path d="M15 60 Q30 55 45 60 T75 60" stroke="#87ceeb" stroke-width="4" fill="none" opacity="0.7"/>
        </svg>`
    },
    {
        id: 5,
        name: "Luz Divina",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="light1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff8dc"/><stop offset="100%" stop-color="#ffd700"/>
            </radialGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="20" fill="url(#light1)"/>
            <g stroke="#ffd700" stroke-width="3">
                <line x1="50" y1="15" x2="50" y2="25"/><line x1="50" y1="75" x2="50" y2="85"/>
                <line x1="15" y1="50" x2="25" y2="50"/><line x1="75" y1="50" x2="85" y2="50"/>
                <line x1="25" y1="25" x2="32" y2="32"/><line x1="68" y1="68" x2="75" y2="75"/>
                <line x1="75" y1="25" x2="68" y2="32"/><line x1="32" y1="68" x2="25" y2="75"/>
            </g>
        </svg>`
    },
    {
        id: 6,
        name: "Sombra Profunda",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="dark1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#2d1b4e"/><stop offset="100%" stop-color="#0d0d0d"/>
            </radialGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="30" fill="url(#dark1)"/>
            <circle cx="50" cy="50" r="15" fill="#0d0d0d"/>
            <circle cx="45" cy="45" r="3" fill="#6b3fa0"/>
            <circle cx="55" cy="55" r="2" fill="#8b5cf6"/>
        </svg>`
    },
    {
        id: 7,
        name: "Relâmpago",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="55,15 35,48 48,48 42,85 65,45 52,45" fill="#ffd700"/>
            <polygon points="53,25 40,48 48,48 44,75 60,48 52,48" fill="#ffec8b"/>
        </svg>`
    },
    {
        id: 8,
        name: "Gelo Eterno",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="ice1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#e0ffff"/><stop offset="100%" stop-color="#4169e1"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="50,20 58,40 80,45 62,58 68,80 50,68 32,80 38,58 20,45 42,40" fill="url(#ice1)"/>
        </svg>`
    },
    {
        id: 9,
        name: "Natureza Viva",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="nature1" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stop-color="#228b22"/><stop offset="100%" stop-color="#90ee90"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <ellipse cx="50" cy="40" rx="25" ry="20" fill="url(#nature1)"/>
            <rect x="47" y="55" width="6" height="25" fill="#8b4513"/>
            <ellipse cx="35" cy="45" rx="10" ry="12" fill="#32cd32" opacity="0.7"/>
            <ellipse cx="65" cy="45" rx="10" ry="12" fill="#32cd32" opacity="0.7"/>
        </svg>`
    },
    {
        id: 10,
        name: "Vórtice Caótico",
        category: "elementos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="chaos1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff1493"/><stop offset="50%" stop-color="#9400d3"/><stop offset="100%" stop-color="#00ced1"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="url(#chaos1)" stroke-width="4"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="url(#chaos1)" stroke-width="3" transform="rotate(45 50 50)"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="url(#chaos1)" stroke-width="2" transform="rotate(90 50 50)"/>
            <circle cx="50" cy="50" r="5" fill="#ff1493"/>
        </svg>`
    },

    // ========== CRIATURAS (11-20) ==========
    {
        id: 11,
        name: "Dragão Ancião",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="dragon1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#dc143c"/><stop offset="100%" stop-color="#8b0000"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M30 70 Q40 50 50 55 Q60 50 70 70 L65 65 Q55 75 50 65 Q45 75 35 65 Z" fill="url(#dragon1)"/>
            <path d="M35 55 L30 35 L40 50 M65 55 L70 35 L60 50" fill="url(#dragon1)"/>
            <circle cx="40" cy="50" r="4" fill="#ffd700"/><circle cx="60" cy="50" r="4" fill="#ffd700"/>
            <circle cx="40" cy="50" r="2" fill="#000"/><circle cx="60" cy="50" r="2" fill="#000"/>
        </svg>`
    },
    {
        id: 12,
        name: "Fênix Renascida",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="phoenix1" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stop-color="#ff4500"/><stop offset="50%" stop-color="#ffa500"/><stop offset="100%" stop-color="#ffd700"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M50 25 Q30 40 35 60 Q40 75 50 80 Q60 75 65 60 Q70 40 50 25" fill="url(#phoenix1)"/>
            <path d="M35 45 L20 35 M65 45 L80 35" stroke="#ffd700" stroke-width="3"/>
            <path d="M40 70 L30 85 M50 75 L50 90 M60 70 L70 85" stroke="#ff4500" stroke-width="2"/>
            <circle cx="43" cy="45" r="3" fill="#fff"/><circle cx="57" cy="45" r="3" fill="#fff"/>
        </svg>`
    },
    {
        id: 13,
        name: "Golem de Pedra",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="golem1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#708090"/><stop offset="100%" stop-color="#2f4f4f"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <rect x="30" y="30" width="40" height="45" rx="5" fill="url(#golem1)"/>
            <rect x="35" y="75" width="10" height="10" fill="url(#golem1)"/>
            <rect x="55" y="75" width="10" height="10" fill="url(#golem1)"/>
            <rect x="38" y="40" width="8" height="6" fill="#00ff00"/>
            <rect x="54" y="40" width="8" height="6" fill="#00ff00"/>
            <line x1="40" y1="55" x2="60" y2="55" stroke="#4a5568" stroke-width="3"/>
        </svg>`
    },
    {
        id: 14,
        name: "Serpente Marinha",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="serpent1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#006994"/><stop offset="100%" stop-color="#00ced1"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M20 50 Q30 30 40 50 Q50 70 60 50 Q70 30 80 50" stroke="url(#serpent1)" stroke-width="8" fill="none" stroke-linecap="round"/>
            <circle cx="18" cy="50" r="6" fill="url(#serpent1)"/>
            <circle cx="15" cy="48" r="2" fill="#ffd700"/>
            <path d="M80 48 L88 45 M80 52 L88 55" stroke="url(#serpent1)" stroke-width="2"/>
        </svg>`
    },
    {
        id: 15,
        name: "Lobo Espectral",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="wolf1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#c0c0c0"/><stop offset="100%" stop-color="#4a4a4a"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <ellipse cx="50" cy="55" rx="25" ry="20" fill="url(#wolf1)"/>
            <polygon points="30,45 25,25 40,40" fill="url(#wolf1)"/>
            <polygon points="70,45 75,25 60,40" fill="url(#wolf1)"/>
            <ellipse cx="40" cy="50" rx="4" ry="5" fill="#87ceeb"/>
            <ellipse cx="60" cy="50" rx="4" ry="5" fill="#87ceeb"/>
            <ellipse cx="50" cy="62" rx="5" ry="3" fill="#2d2d2d"/>
        </svg>`
    },
    {
        id: 16,
        name: "Coruja Sábia",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <ellipse cx="50" cy="55" rx="22" ry="25" fill="#8b4513"/>
            <circle cx="40" cy="48" r="10" fill="#ffd700"/>
            <circle cx="60" cy="48" r="10" fill="#ffd700"/>
            <circle cx="40" cy="48" r="5" fill="#000"/>
            <circle cx="60" cy="48" r="5" fill="#000"/>
            <polygon points="50,55 45,62 50,60 55,62" fill="#ff8c00"/>
            <path d="M30,35 L35,45 M70,35 L65,45" stroke="#8b4513" stroke-width="3"/>
        </svg>`
    },
    {
        id: 17,
        name: "Grifo Majestoso",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="griff1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#daa520"/><stop offset="100%" stop-color="#b8860b"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <ellipse cx="50" cy="55" rx="20" ry="18" fill="url(#griff1)"/>
            <circle cx="50" cy="40" r="12" fill="url(#griff1)"/>
            <path d="M20,50 Q30,30 40,50" fill="#f5f5dc"/>
            <path d="M80,50 Q70,30 60,50" fill="#f5f5dc"/>
            <polygon points="50,38 45,48 55,48" fill="#ff8c00"/>
            <circle cx="45" cy="38" r="3" fill="#000"/>
            <circle cx="55" cy="38" r="3" fill="#000"/>
        </svg>`
    },
    {
        id: 18,
        name: "Kraken Abissal",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="kraken1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#4b0082"/><stop offset="100%" stop-color="#191970"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <ellipse cx="50" cy="40" rx="20" ry="15" fill="url(#kraken1)"/>
            <circle cx="43" cy="38" r="5" fill="#ff6347"/>
            <circle cx="57" cy="38" r="5" fill="#ff6347"/>
            <path d="M30,55 Q25,70 30,80" stroke="url(#kraken1)" stroke-width="5" fill="none"/>
            <path d="M40,55 Q38,70 42,80" stroke="url(#kraken1)" stroke-width="5" fill="none"/>
            <path d="M50,55 Q50,70 50,80" stroke="url(#kraken1)" stroke-width="5" fill="none"/>
            <path d="M60,55 Q62,70 58,80" stroke="url(#kraken1)" stroke-width="5" fill="none"/>
            <path d="M70,55 Q75,70 70,80" stroke="url(#kraken1)" stroke-width="5" fill="none"/>
        </svg>`
    },
    {
        id: 19,
        name: "Unicórnio Celeste",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="unicorn1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#fff0f5"/><stop offset="100%" stop-color="#dda0dd"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <ellipse cx="50" cy="58" rx="18" ry="15" fill="url(#unicorn1)"/>
            <ellipse cx="50" cy="42" rx="12" ry="10" fill="url(#unicorn1)"/>
            <polygon points="50,15 47,35 53,35" fill="#ffd700"/>
            <circle cx="45" cy="40" r="2" fill="#9932cc"/>
            <circle cx="55" cy="40" r="2" fill="#9932cc"/>
            <path d="M35,50 Q25,45 20,55" stroke="#ffb6c1" stroke-width="3" fill="none"/>
        </svg>`
    },
    {
        id: 20,
        name: "Basilisco Petrificante",
        category: "criaturas",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="basilisk1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#556b2f"/><stop offset="100%" stop-color="#2e8b57"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M25,50 Q35,35 50,40 Q65,35 75,50 Q65,65 50,60 Q35,65 25,50" fill="url(#basilisk1)"/>
            <circle cx="40" cy="45" r="6" fill="#ff0000"/>
            <circle cx="60" cy="45" r="6" fill="#ff0000"/>
            <circle cx="40" cy="45" r="3" fill="#000"/>
            <circle cx="60" cy="45" r="3" fill="#000"/>
            <polygon points="45,55 50,65 55,55" fill="#8b0000"/>
            <path d="M50,28 L45,35 M50,28 L50,35 M50,28 L55,35" stroke="#daa520" stroke-width="2"/>
        </svg>`
    },

    // ========== CLASSES (21-30) ==========
    {
        id: 21,
        name: "Arquimago",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="mage1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#4169e1"/><stop offset="100%" stop-color="#191970"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="50,10 35,45 65,45" fill="url(#mage1)"/>
            <circle cx="50" cy="55" r="15" fill="#f5deb3"/>
            <circle cx="45" cy="52" r="2" fill="#000"/>
            <circle cx="55" cy="52" r="2" fill="#000"/>
            <path d="M45,60 Q50,65 55,60" stroke="#000" stroke-width="1" fill="none"/>
            <rect x="42" y="70" width="16" height="15" fill="url(#mage1)"/>
            <circle cx="50" cy="30" r="5" fill="#ffd700"/>
        </svg>`
    },
    {
        id: 22,
        name: "Cavaleiro",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="knight1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#c0c0c0"/><stop offset="100%" stop-color="#708090"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M35,35 L50,20 L65,35 L65,55 L50,65 L35,55 Z" fill="url(#knight1)"/>
            <rect x="43" y="38" width="14" height="4" fill="#2d2d2d"/>
            <line x1="50" y1="45" x2="50" y2="58" stroke="#2d2d2d" stroke-width="2"/>
            <rect x="38" y="65" width="24" height="20" fill="url(#knight1)"/>
            <line x1="50" y1="65" x2="50" y2="85" stroke="#708090" stroke-width="1"/>
        </svg>`
    },
    {
        id: 23,
        name: "Arqueira",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="35" r="12" fill="#f5deb3"/>
            <path d="M40,47 L35,75 L50,70 L65,75 L60,47" fill="#228b22"/>
            <circle cx="46" cy="33" r="2" fill="#000"/>
            <circle cx="54" cy="33" r="2" fill="#000"/>
            <path d="M38,28 Q50,22 62,28" stroke="#8b4513" stroke-width="3" fill="none"/>
            <line x1="70" y1="25" x2="85" y2="55" stroke="#8b4513" stroke-width="3"/>
            <path d="M68,22 Q72,25 70,30" stroke="#8b4513" stroke-width="2" fill="none"/>
            <line x1="75" y1="35" x2="80" y2="25" stroke="#696969" stroke-width="1"/>
        </svg>`
    },
    {
        id: 24,
        name: "Necromante",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="necro1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#2d1b4e"/><stop offset="100%" stop-color="#0d0d0d"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M30,25 Q50,15 70,25 L65,50 L50,55 L35,50 Z" fill="url(#necro1)"/>
            <circle cx="50" cy="55" r="12" fill="#d3d3d3"/>
            <circle cx="46" cy="53" r="4" fill="#000"/>
            <circle cx="54" cy="53" r="4" fill="#000"/>
            <circle cx="46" cy="53" r="2" fill="#9400d3"/>
            <circle cx="54" cy="53" r="2" fill="#9400d3"/>
            <rect x="40" y="67" width="20" height="18" fill="url(#necro1)"/>
            <ellipse cx="50" cy="62" rx="3" ry="2" fill="#000"/>
        </svg>`
    },
    {
        id: 25,
        name: "Paladino",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="paladin1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#ffd700"/><stop offset="100%" stop-color="#daa520"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M35,30 L50,18 L65,30 L65,50 L50,58 L35,50 Z" fill="#c0c0c0"/>
            <rect x="47" y="35" width="6" height="18" fill="url(#paladin1)"/>
            <rect x="42" y="40" width="16" height="6" fill="url(#paladin1)"/>
            <rect x="38" y="60" width="24" height="25" fill="#c0c0c0"/>
            <circle cx="50" cy="72" r="8" fill="url(#paladin1)"/>
        </svg>`
    },
    {
        id: 26,
        name: "Ladino",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M35,35 Q50,25 65,35 L62,55 L50,60 L38,55 Z" fill="#2d2d2d"/>
            <circle cx="50" cy="55" r="10" fill="#f5deb3"/>
            <circle cx="47" cy="53" r="2" fill="#000"/>
            <circle cx="53" cy="53" r="2" fill="#000"/>
            <path d="M47,58 L53,58" stroke="#000" stroke-width="1"/>
            <path d="M40,42 L35,35" stroke="#2d2d2d" stroke-width="2"/>
            <path d="M60,42 L65,35" stroke="#2d2d2d" stroke-width="2"/>
            <rect x="40" y="65" width="20" height="18" fill="#1a1a1a"/>
            <line x1="70" y1="50" x2="80" y2="65" stroke="#c0c0c0" stroke-width="2"/>
        </svg>`
    },
    {
        id: 27,
        name: "Druida",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="druid1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#228b22"/><stop offset="100%" stop-color="#006400"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="40" r="12" fill="#f5deb3"/>
            <ellipse cx="50" cy="30" rx="15" ry="8" fill="url(#druid1)"/>
            <circle cx="40" cy="30" r="4" fill="#90ee90"/>
            <circle cx="60" cy="30" r="4" fill="#90ee90"/>
            <circle cx="50" cy="25" r="3" fill="#ffd700"/>
            <circle cx="46" cy="38" r="2" fill="#228b22"/>
            <circle cx="54" cy="38" r="2" fill="#228b22"/>
            <path d="M35,50 Q50,55 65,50 L60,80 L40,80 Z" fill="#8b4513"/>
        </svg>`
    },
    {
        id: 28,
        name: "Monge",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="40" r="15" fill="#f5deb3"/>
            <ellipse cx="50" cy="35" rx="12" ry="5" fill="#f5deb3"/>
            <circle cx="45" cy="38" r="2" fill="#000"/>
            <circle cx="55" cy="38" r="2" fill="#000"/>
            <path d="M47,45 Q50,48 53,45" stroke="#000" stroke-width="1" fill="none"/>
            <rect x="35" y="55" width="30" height="30" fill="#ff8c00"/>
            <line x1="50" y1="55" x2="50" y2="85" stroke="#cc7000" stroke-width="2"/>
            <circle cx="50" cy="30" r="2" fill="#d4af37"/>
        </svg>`
    },
    {
        id: 29,
        name: "Bárbaro",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="40" r="14" fill="#deb887"/>
            <path d="M35,30 Q50,20 65,30" stroke="#8b4513" stroke-width="4" fill="none"/>
            <circle cx="45" cy="38" r="2" fill="#000"/>
            <circle cx="55" cy="38" r="2" fill="#000"/>
            <path d="M45,48 L55,48" stroke="#8b0000" stroke-width="2"/>
            <path d="M30,50 L30,80 L40,80 L45,60 L55,60 L60,80 L70,80 L70,50" fill="#8b4513"/>
            <line x1="75" y1="30" x2="85" y2="60" stroke="#696969" stroke-width="4"/>
            <polygon points="85,60 82,70 88,70" fill="#696969"/>
        </svg>`
    },
    {
        id: 30,
        name: "Feiticeiro",
        category: "classes",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="sorc1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#9400d3"/><stop offset="100%" stop-color="#4b0082"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="42" r="13" fill="#f5deb3"/>
            <path d="M37,30 Q50,35 63,30 L60,20 L50,25 L40,20 Z" fill="url(#sorc1)"/>
            <circle cx="45" cy="40" r="3" fill="url(#sorc1)"/>
            <circle cx="55" cy="40" r="3" fill="url(#sorc1)"/>
            <path d="M45,48 Q50,52 55,48" stroke="#000" stroke-width="1" fill="none"/>
            <path d="M35,55 Q50,60 65,55 L62,85 L38,85 Z" fill="url(#sorc1)"/>
            <circle cx="50" cy="70" r="4" fill="#ffd700"/>
        </svg>`
    },

    // ========== SÍMBOLOS (31-40) ==========
    {
        id: 31,
        name: "Runa Antiga",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#4169e1" stroke-width="3"/>
            <path d="M50 20 L50 80 M30 35 L70 65 M70 35 L30 65" stroke="#4169e1" stroke-width="4"/>
            <circle cx="50" cy="50" r="8" fill="#4169e1"/>
        </svg>`
    },
    {
        id: 32,
        name: "Pentagrama Místico",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#9400d3" stroke-width="2"/>
            <polygon points="50,18 61,42 88,42 67,58 76,85 50,68 24,85 33,58 12,42 39,42" fill="none" stroke="#9400d3" stroke-width="2"/>
        </svg>`
    },
    {
        id: 33,
        name: "Orbe de Poder",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="orb1" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#00bfff"/><stop offset="100%" stop-color="#0000cd"/>
            </radialGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="30" fill="url(#orb1)"/>
            <ellipse cx="40" cy="40" rx="8" ry="5" fill="#fff3"/>
        </svg>`
    },
    {
        id: 34,
        name: "Olho que Tudo Vê",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <ellipse cx="50" cy="50" rx="35" ry="20" fill="none" stroke="#ffd700" stroke-width="3"/>
            <circle cx="50" cy="50" r="15" fill="#ffd700"/>
            <circle cx="50" cy="50" r="8" fill="#000"/>
            <circle cx="47" cy="47" r="3" fill="#fff"/>
        </svg>`
    },
    {
        id: 35,
        name: "Triângulo Arcano",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="tri1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#ff1493"/><stop offset="100%" stop-color="#9400d3"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="50,15 85,80 15,80" fill="none" stroke="url(#tri1)" stroke-width="4"/>
            <polygon points="50,35 70,70 30,70" fill="none" stroke="url(#tri1)" stroke-width="2"/>
            <circle cx="50" cy="55" r="8" fill="url(#tri1)"/>
        </svg>`
    },
    {
        id: 36,
        name: "Lua Crescente",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="30" fill="#f0e68c"/>
            <circle cx="65" cy="45" r="25" fill="#1a1a2e"/>
            <circle cx="30" cy="25" r="2" fill="#fff"/>
            <circle cx="25" cy="40" r="1.5" fill="#fff"/>
            <circle cx="20" cy="60" r="1" fill="#fff"/>
        </svg>`
    },
    {
        id: 37,
        name: "Sol Radiante",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="sun1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffd700"/><stop offset="100%" stop-color="#ff8c00"/>
            </radialGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="18" fill="url(#sun1)"/>
            <g stroke="#ffd700" stroke-width="3">
                <line x1="50" y1="10" x2="50" y2="25"/>
                <line x1="50" y1="75" x2="50" y2="90"/>
                <line x1="10" y1="50" x2="25" y2="50"/>
                <line x1="75" y1="50" x2="90" y2="50"/>
                <line x1="22" y1="22" x2="32" y2="32"/>
                <line x1="68" y1="68" x2="78" y2="78"/>
                <line x1="78" y1="22" x2="68" y2="32"/>
                <line x1="32" y1="68" x2="22" y2="78"/>
            </g>
        </svg>`
    },
    {
        id: 38,
        name: "Infinito",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M25 50 Q25 30 40 30 Q55 30 50 50 Q45 70 60 70 Q75 70 75 50 Q75 30 60 30 Q45 30 50 50 Q55 70 40 70 Q25 70 25 50" fill="none" stroke="#00ced1" stroke-width="5"/>
        </svg>`
    },
    {
        id: 39,
        name: "Hexagrama",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="50,20 75,65 25,65" fill="none" stroke="#ffd700" stroke-width="3"/>
            <polygon points="50,80 25,35 75,35" fill="none" stroke="#ffd700" stroke-width="3"/>
        </svg>`
    },
    {
        id: 40,
        name: "Árvore da Vida",
        category: "simbolos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <line x1="50" y1="85" x2="50" y2="30" stroke="#8b4513" stroke-width="4"/>
            <circle cx="50" cy="25" r="5" fill="#228b22"/>
            <circle cx="35" cy="35" r="4" fill="#228b22"/>
            <circle cx="65" cy="35" r="4" fill="#228b22"/>
            <circle cx="30" cy="50" r="4" fill="#228b22"/>
            <circle cx="70" cy="50" r="4" fill="#228b22"/>
            <circle cx="35" cy="65" r="4" fill="#228b22"/>
            <circle cx="65" cy="65" r="4" fill="#228b22"/>
            <line x1="50" y1="30" x2="35" y2="35" stroke="#8b4513" stroke-width="2"/>
            <line x1="50" y1="30" x2="65" y2="35" stroke="#8b4513" stroke-width="2"/>
            <line x1="50" y1="45" x2="30" y2="50" stroke="#8b4513" stroke-width="2"/>
            <line x1="50" y1="45" x2="70" y2="50" stroke="#8b4513" stroke-width="2"/>
            <line x1="50" y1="60" x2="35" y2="65" stroke="#8b4513" stroke-width="2"/>
            <line x1="50" y1="60" x2="65" y2="65" stroke="#8b4513" stroke-width="2"/>
        </svg>`
    },

    // ========== ABSTRATOS (41-50) ==========
    {
        id: 41,
        name: "Espiral Cósmica",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="spiral1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff1493"/><stop offset="50%" stop-color="#9400d3"/><stop offset="100%" stop-color="#00bfff"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M50 50 Q55 45 55 40 Q55 30 50 28 Q40 28 38 40 Q38 55 50 58 Q65 58 68 45 Q68 25 50 22 Q28 22 25 45 Q25 70 50 73" fill="none" stroke="url(#spiral1)" stroke-width="3"/>
        </svg>`
    },
    {
        id: 42,
        name: "Fractais",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="50,20 80,70 20,70" fill="none" stroke="#00ff7f" stroke-width="2"/>
            <polygon points="50,45 65,70 35,70" fill="none" stroke="#00ff7f" stroke-width="2"/>
            <polygon points="35,45 50,70 20,70" fill="none" stroke="#00ff7f" stroke-width="1.5"/>
            <polygon points="65,45 80,70 50,70" fill="none" stroke="#00ff7f" stroke-width="1.5"/>
        </svg>`
    },
    {
        id: 43,
        name: "Ondas Sonoras",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M20 50 Q30 30 40 50 Q50 70 60 50 Q70 30 80 50" stroke="#00bfff" stroke-width="3" fill="none"/>
            <path d="M20 40 Q30 25 40 40 Q50 55 60 40 Q70 25 80 40" stroke="#00bfff" stroke-width="2" fill="none" opacity="0.7"/>
            <path d="M20 60 Q30 45 40 60 Q50 75 60 60 Q70 45 80 60" stroke="#00bfff" stroke-width="2" fill="none" opacity="0.7"/>
        </svg>`
    },
    {
        id: 44,
        name: "Diamante",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="diamond1" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#e0ffff"/><stop offset="50%" stop-color="#87ceeb"/><stop offset="100%" stop-color="#4169e1"/>
            </linearGradient></defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="50,15 80,40 50,85 20,40" fill="url(#diamond1)"/>
            <polygon points="50,15 65,40 50,55 35,40" fill="#e0ffff" opacity="0.5"/>
            <line x1="35" y1="40" x2="20" y2="40" stroke="#fff" stroke-width="1" opacity="0.5"/>
            <line x1="65" y1="40" x2="80" y2="40" stroke="#fff" stroke-width="1" opacity="0.5"/>
        </svg>`
    },
    {
        id: 45,
        name: "Aurora Boreal",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="aurora1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#00ff7f"/><stop offset="50%" stop-color="#00bfff"/><stop offset="100%" stop-color="#9400d3"/>
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <path d="M15 70 Q25 40 35 60 Q45 30 50 50 Q55 25 65 55 Q75 35 85 65" fill="none" stroke="url(#aurora1)" stroke-width="8" opacity="0.8"/>
            <path d="M20 75 Q30 55 40 70 Q50 45 60 65 Q70 50 80 70" fill="none" stroke="url(#aurora1)" stroke-width="5" opacity="0.5"/>
        </svg>`
    },
    {
        id: 46,
        name: "Mandala",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#ff69b4" stroke-width="1"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="#ff69b4" stroke-width="1"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="#ff69b4" stroke-width="1"/>
            <circle cx="50" cy="50" r="5" fill="#ff69b4"/>
            <g stroke="#ff69b4" stroke-width="1">
                <line x1="50" y1="15" x2="50" y2="85" transform="rotate(0 50 50)"/>
                <line x1="50" y1="15" x2="50" y2="85" transform="rotate(30 50 50)"/>
                <line x1="50" y1="15" x2="50" y2="85" transform="rotate(60 50 50)"/>
                <line x1="50" y1="15" x2="50" y2="85" transform="rotate(90 50 50)"/>
                <line x1="50" y1="15" x2="50" y2="85" transform="rotate(120 50 50)"/>
                <line x1="50" y1="15" x2="50" y2="85" transform="rotate(150 50 50)"/>
            </g>
        </svg>`
    },
    {
        id: 47,
        name: "Cubo Dimensional",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <polygon points="30,35 50,25 70,35 70,55 50,65 30,55" fill="none" stroke="#00ced1" stroke-width="2"/>
            <polygon points="30,55 50,65 70,55 70,75 50,85 30,75" fill="none" stroke="#00ced1" stroke-width="2"/>
            <line x1="30" y1="35" x2="30" y2="55" stroke="#00ced1" stroke-width="2"/>
            <line x1="50" y1="25" x2="50" y2="45" stroke="#00ced1" stroke-width="2"/>
            <line x1="70" y1="35" x2="70" y2="55" stroke="#00ced1" stroke-width="2"/>
            <polygon points="30,35 50,45 70,35 50,25" fill="#00ced133"/>
        </svg>`
    },
    {
        id: 48,
        name: "Átomo",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="#7b68ee" stroke-width="2"/>
            <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="#7b68ee" stroke-width="2" transform="rotate(60 50 50)"/>
            <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="#7b68ee" stroke-width="2" transform="rotate(120 50 50)"/>
            <circle cx="50" cy="50" r="8" fill="#7b68ee"/>
        </svg>`
    },
    {
        id: 49,
        name: "Gradiente Nebulosa",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="nebula1" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stop-color="#ff69b4"/>
                    <stop offset="50%" stop-color="#9400d3"/>
                    <stop offset="100%" stop-color="#00008b"/>
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="38" fill="url(#nebula1)"/>
            <circle cx="35" cy="35" r="3" fill="#fff" opacity="0.8"/>
            <circle cx="60" cy="40" r="2" fill="#fff" opacity="0.6"/>
            <circle cx="55" cy="60" r="1.5" fill="#fff" opacity="0.7"/>
            <circle cx="40" cy="55" r="1" fill="#fff" opacity="0.5"/>
        </svg>`
    },
    {
        id: 50,
        name: "Ying Yang Arcano",
        category: "abstratos",
        svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="35" fill="#f0f0f0"/>
            <path d="M50 15 A35 35 0 0 1 50 85 A17.5 17.5 0 0 1 50 50 A17.5 17.5 0 0 0 50 15" fill="#1a1a1a"/>
            <circle cx="50" cy="32.5" r="6" fill="#1a1a1a"/>
            <circle cx="50" cy="67.5" r="6" fill="#f0f0f0"/>
        </svg>`
    }
];

// ========== AVATAR SERVICE FUNCTIONS ==========

/**
 * Get avatar by ID
 * @param {number} id - Avatar ID (1-50)
 * @returns {Object} Avatar object or default avatar
 */
function getAvatarById(id) {
    const avatar = AVATARS.find(a => a.id === id);
    return avatar || AVATARS[0]; // Default to first avatar
}

/**
 * Get avatar SVG string
 * @param {number} id - Avatar ID
 * @returns {string} SVG markup
 */
function getAvatarSVG(id) {
    return getAvatarById(id).svg;
}

/**
 * Get avatars by category
 * @param {string} category - Category name
 * @returns {Array} Array of avatars in category
 */
function getAvatarsByCategory(category) {
    return AVATARS.filter(a => a.category === category);
}

/**
 * Get all avatar categories
 * @returns {Object} Categories object
 */
function getAvatarCategories() {
    return AVATAR_CATEGORIES;
}

/**
 * Render avatar as HTML element
 * @param {number} id - Avatar ID
 * @param {string} size - Size: 'small' (24px), 'medium' (40px), 'large' (80px)
 * @returns {string} HTML string with avatar
 */
function renderAvatar(id, size = 'medium') {
    const sizes = {
        small: 24,
        medium: 40,
        large: 80
    };
    const px = sizes[size] || sizes.medium;
    const avatar = getAvatarById(id);

    return `<div class="user-avatar user-avatar-${size}" style="width:${px}px;height:${px}px;" title="${avatar.name}">${avatar.svg}</div>`;
}

/**
 * Render avatar selector grid
 * @param {number} currentId - Currently selected avatar ID
 * @param {Function} onSelect - Callback when avatar is selected
 * @returns {string} HTML string with avatar selector
 */
function renderAvatarSelector(currentId = 1) {
    let html = '<div class="avatar-selector">';

    for (const [catKey, catInfo] of Object.entries(AVATAR_CATEGORIES)) {
        const categoryAvatars = getAvatarsByCategory(catKey);
        html += `
            <div class="avatar-category">
                <h4 class="avatar-category-title">
                    <i data-lucide="${catInfo.icon}"></i>
                    ${catInfo.name}
                </h4>
                <div class="avatar-grid">
                    ${categoryAvatars.map(avatar => `
                        <button
                            type="button"
                            class="avatar-option ${avatar.id === currentId ? 'selected' : ''}"
                            data-avatar-id="${avatar.id}"
                            title="${avatar.name}"
                            onclick="selectAvatar(${avatar.id})"
                        >
                            ${avatar.svg}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

/**
 * Update user avatar
 * @param {number} avatarId - New avatar ID
 */
async function updateUserAvatar(avatarId) {
    if (!nocoDBService.isLoggedIn()) {
        showToast('Faça login para alterar seu avatar', 'error');
        return false;
    }

    try {
        const user = nocoDBService.getCurrentUser();
        // Update in NocoDB
        await nocoDBService.updateRecord('users', user.id, { avatar_id: avatarId });

        // Update local session
        user.avatarId = avatarId;
        nocoDBService.saveSession();

        // Update UI
        updateAllAvatarDisplays();
        showToast('Avatar atualizado!', 'success');
        return true;
    } catch (error) {
        console.error('Error updating avatar:', error);
        showToast('Erro ao atualizar avatar', 'error');
        return false;
    }
}

/**
 * Update all avatar displays on the page
 */
function updateAllAvatarDisplays() {
    const user = nocoDBService.getCurrentUser();
    if (!user) return;

    const avatarId = user.avatarId || 1;

    // Update header avatar
    const headerAvatar = document.querySelector('.user-menu-avatar');
    if (headerAvatar) {
        headerAvatar.innerHTML = getAvatarSVG(avatarId);
    }

    // Update profile modal avatar
    const profileAvatar = document.querySelector('.profile-avatar-display');
    if (profileAvatar) {
        profileAvatar.innerHTML = renderAvatar(avatarId, 'large');
    }
}

/**
 * Get user's current avatar ID
 * @returns {number} Avatar ID or 1 (default)
 */
function getCurrentUserAvatarId() {
    const user = nocoDBService.getCurrentUser();
    return user?.avatarId || 1;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AVATARS,
        AVATAR_CATEGORIES,
        getAvatarById,
        getAvatarSVG,
        getAvatarsByCategory,
        getAvatarCategories,
        renderAvatar,
        renderAvatarSelector,
        updateUserAvatar,
        updateAllAvatarDisplays,
        getCurrentUserAvatarId
    };
}
