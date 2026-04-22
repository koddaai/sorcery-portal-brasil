#!/usr/bin/env node
/**
 * Generate static HTML pages for all articles
 * Creates SEO-optimized pages at /artigos/[slug]/index.html
 */

const fs = require('fs');
const path = require('path');

// Load articles database
const articlesDB = require('../articles-database.json');

// Category icons and colors
const categoryConfig = {
  'Guia': { icon: 'book-open', class: 'badge-guia' },
  'FAQ': { icon: 'help-circle', class: 'badge-faq' },
  'Mecânica': { icon: 'cog', class: 'badge-mecanica' },
  'Ruling': { icon: 'scale', class: 'badge-ruling' },
  'Referência': { icon: 'bookmark', class: 'badge-referencia' },
  'Comunidade': { icon: 'users', class: 'badge-comunidade' },
  'Lore': { icon: 'scroll', class: 'badge-lore' },
  'Deck': { icon: 'layers', class: 'badge-deck' },
  'Deck Tech': { icon: 'layers', class: 'badge-deck' },
  'Meta': { icon: 'trending-up', class: 'badge-meta' },
  'Ferramentas': { icon: 'wrench', class: 'badge-ferramenta' },
};

// Convert markdown to HTML
function parseMarkdown(md) {
  if (!md) return '';

  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links (internal)
    .replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, '<a href="/$2">$1</a>')
    // Links (external)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Tables
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(c => c.trim());
      if (cells.every(c => c.match(/^-+$/))) {
        return ''; // Skip separator rows
      }
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap lists
  html = html.replace(/(<li>.+<\/li>)+/gs, '<ul>$&</ul>');
  // Wrap tables
  html = html.replace(/(<tr>.+<\/tr>)+/gs, '<table>$&</table>');
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  // Clean up
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[123]>)/g, '$1');
  html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table>)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

  return html;
}

// Format date in Portuguese
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Generate article HTML page
function generateArticlePage(article) {
  const config = categoryConfig[article.category] || { icon: 'file-text', class: 'badge-article' };
  const contentHTML = parseMarkdown(article.content);
  const imageUrl = `https://sorcery.com.br/${article.image}`;
  const articleUrl = `https://sorcery.com.br/artigos/${article.slug}/`;

  // Schema Article JSON-LD
  const schemaArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "image": imageUrl,
    "datePublished": article.date,
    "dateModified": article.date,
    "author": {
      "@type": "Organization",
      "name": "Sorcery Brasil"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sorcery Brasil",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sorcery.com.br/sorcery-logo.webp"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "keywords": article.tags.join(", ")
  };

  // Generate FAQ Schema if it's a FAQ article
  let faqSchema = '';
  if (article.category === 'FAQ' && article.content.includes('## ')) {
    const questions = [];
    const faqRegex = /## (\d+\. .+?)\n\n([^#]+)/g;
    let match;
    while ((match = faqRegex.exec(article.content)) !== null) {
      questions.push({
        "@type": "Question",
        "name": match[1].replace(/^\d+\. /, ''),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": match[2].trim().replace(/\n/g, ' ')
        }
      });
    }
    if (questions.length > 0) {
      faqSchema = `
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions
    }, null, 2)}
    </script>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="strict-origin-when-cross-origin">

    <title>${article.title} | Sorcery Brasil</title>
    <meta name="description" content="${article.summary}">
    <meta name="keywords" content="${article.tags.join(', ')}, sorcery tcg, sorcery brasil">
    <meta name="author" content="Sorcery Brasil">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${articleUrl}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${articleUrl}">
    <meta property="og:title" content="${article.title} | Sorcery Brasil">
    <meta property="og:description" content="${article.summary}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="Sorcery Brasil">
    <meta property="article:published_time" content="${article.date}">
    <meta property="article:modified_time" content="${article.date}">
    <meta property="article:author" content="Sorcery Brasil">
    ${article.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n    ')}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${articleUrl}">
    <meta name="twitter:title" content="${article.title} | Sorcery Brasil">
    <meta name="twitter:description" content="${article.summary}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Theme -->
    <meta name="theme-color" content="#d4af37">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- Styles -->
    <link rel="stylesheet" href="/styles.min.css?v=110">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" defer></script>

    <!-- Schema Article -->
    <script type="application/ld+json">
    ${JSON.stringify(schemaArticle, null, 2)}
    </script>${faqSchema}

    <style>
    .article-page {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--space-6);
    }
    .article-breadcrumbs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-4);
    }
    .article-breadcrumbs a {
        color: var(--accent-gold);
        text-decoration: none;
    }
    .article-breadcrumbs a:hover {
        text-decoration: underline;
    }
    .article-breadcrumbs span {
        color: var(--text-secondary);
    }
    .article-hero {
        width: 100%;
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-5);
        aspect-ratio: 16/9;
        object-fit: cover;
    }
    .article-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        align-items: center;
        margin-bottom: var(--space-4);
    }
    .article-title {
        font-family: 'Cinzel', serif;
        font-size: 2rem;
        color: var(--text-primary);
        margin-bottom: var(--space-3);
        line-height: 1.2;
    }
    .article-summary {
        font-size: 1.125rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-4);
        line-height: 1.6;
    }
    .article-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: var(--space-5);
    }
    .article-tag {
        background: rgba(212, 175, 55, 0.1);
        color: var(--accent-gold);
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
    }
    .article-content {
        color: var(--text-secondary);
        line-height: 1.8;
        font-size: 1rem;
    }
    .article-content h1, .article-content h2, .article-content h3 {
        font-family: 'Cinzel', serif;
        color: var(--text-primary);
        margin: var(--space-5) 0 var(--space-3);
    }
    .article-content h2 {
        font-size: 1.5rem;
        color: var(--accent-gold);
    }
    .article-content h3 {
        font-size: 1.25rem;
    }
    .article-content p {
        margin-bottom: var(--space-4);
    }
    .article-content ul {
        margin: var(--space-3) 0;
        padding-left: var(--space-5);
    }
    .article-content li {
        margin-bottom: var(--space-2);
    }
    .article-content table {
        width: 100%;
        border-collapse: collapse;
        margin: var(--space-4) 0;
        font-size: 0.9rem;
    }
    .article-content td {
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--border-color);
    }
    .article-content tr:nth-child(odd) {
        background: rgba(255,255,255,0.02);
    }
    .article-content blockquote {
        border-left: 3px solid var(--accent-gold);
        padding-left: var(--space-4);
        margin: var(--space-4) 0;
        font-style: italic;
        color: var(--text-secondary);
    }
    .article-content a {
        color: var(--accent-gold);
        text-decoration: none;
    }
    .article-content a:hover {
        text-decoration: underline;
    }
    .article-content strong {
        color: var(--text-primary);
    }
    .article-footer {
        margin-top: var(--space-6);
        padding-top: var(--space-5);
        border-top: 1px solid var(--border-color);
    }
    .article-cta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        margin-top: var(--space-4);
    }
    .article-cta a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: var(--space-3) var(--space-4);
        background: var(--accent-gold);
        color: var(--bg-dark);
        border-radius: var(--radius-md);
        text-decoration: none;
        font-weight: 600;
        transition: opacity var(--duration-fast);
    }
    .article-cta a:hover {
        opacity: 0.9;
    }
    .article-cta a.secondary {
        background: var(--bg-surface-2);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }
    @media (max-width: 768px) {
        .article-page {
            padding: var(--space-4);
        }
        .article-title {
            font-size: 1.5rem;
        }
    }
    </style>
</head>
<body>
    <div id="app">
        <!-- Header -->
        <header class="header">
            <div class="header-top">
                <a href="/" class="logo">
                    <img src="/sorcery-logo.webp" alt="Sorcery TCG" class="logo-img" width="120" height="36">
                    <div class="logo-text">
                        <span class="logo-divider">|</span>
                        <span class="logo-brasil">BRASIL</span>
                    </div>
                </a>
                <nav class="header-nav">
                    <a href="/" class="nav-link">Início</a>
                    <a href="/artigos/" class="nav-link active">Artigos</a>
                    <a href="/#collection" class="nav-link">Coleção</a>
                    <a href="/#decks" class="nav-link">Decks</a>
                </nav>
            </div>
        </header>

        <!-- Article Content -->
        <main class="main-content">
            <article class="article-page">
                <!-- Breadcrumbs -->
                <nav class="article-breadcrumbs" aria-label="Breadcrumb">
                    <a href="/">Início</a>
                    <span>›</span>
                    <a href="/artigos/">Artigos</a>
                    <span>›</span>
                    <span>${article.title}</span>
                </nav>

                <!-- Hero Image -->
                <img
                    src="/${article.image}"
                    alt="${article.title}"
                    class="article-hero"
                    loading="eager"
                >

                <!-- Meta -->
                <div class="article-meta">
                    <span class="news-badge ${config.class}">${article.category}</span>
                    <span class="article-date">
                        <i data-lucide="calendar" style="width:14px;height:14px;"></i>
                        ${formatDate(article.date)}
                    </span>
                </div>

                <!-- Title -->
                <h1 class="article-title">${article.title}</h1>

                <!-- Summary -->
                <p class="article-summary">${article.summary}</p>

                <!-- Tags -->
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="article-tag">#${tag}</span>`).join('\n                    ')}
                </div>

                <!-- Content -->
                <div class="article-content">
                    ${contentHTML}
                </div>

                <!-- Footer -->
                <footer class="article-footer">
                    <p style="color: var(--text-secondary);">
                        Gostou deste artigo? Confira mais conteúdo sobre Sorcery TCG no nosso portal.
                    </p>
                    <div class="article-cta">
                        <a href="/artigos/">
                            <i data-lucide="book-open" style="width:16px;height:16px;"></i>
                            Ver todos os artigos
                        </a>
                        <a href="https://discord.gg/qvYVGFAS5n" class="secondary" target="_blank" rel="noopener">
                            <i data-lucide="message-circle" style="width:16px;height:16px;"></i>
                            Entrar no Discord
                        </a>
                    </div>
                </footer>
            </article>
        </main>

        <!-- Footer -->
        <footer class="footer" style="background: var(--bg-surface-1); padding: var(--space-5) var(--space-6); margin-top: var(--space-6); border-top: 1px solid var(--border-color);">
            <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
                <p style="color: var(--text-secondary); font-size: 0.875rem;">
                    © 2026 Sorcery Brasil. Não somos afiliados à Erik's Curiosa.
                    <br>
                    <a href="https://sorcerytcg.com" target="_blank" rel="noopener" style="color: var(--accent-gold);">Site Oficial</a> ·
                    <a href="https://curiosa.io" target="_blank" rel="noopener" style="color: var(--accent-gold);">Curiosa.io</a> ·
                    <a href="https://discord.gg/qvYVGFAS5n" target="_blank" rel="noopener" style="color: var(--accent-gold);">Discord BR</a>
                </p>
            </div>
        </footer>
    </div>

    <script>
        // Initialize Lucide icons
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    </script>
</body>
</html>`;
}

// Generate index page for /artigos/
function generateIndexPage(articles) {
  const articleCards = articles.map(article => {
    const config = categoryConfig[article.category] || { icon: 'file-text', class: 'badge-article' };
    return `
                <a href="/artigos/${article.slug}/" class="article-card">
                    <div class="article-card-image">
                        <img src="/${article.image}" alt="${article.title}" loading="lazy">
                    </div>
                    <div class="article-card-body">
                        <span class="news-badge ${config.class}">${article.category}</span>
                        <h3>${article.title}</h3>
                        <p>${article.summary}</p>
                        <div class="article-card-meta">
                            <span><i data-lucide="calendar" style="width:12px;height:12px;"></i> ${formatDate(article.date)}</span>
                        </div>
                    </div>
                </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="strict-origin-when-cross-origin">

    <title>Artigos sobre Sorcery TCG | Sorcery Brasil</title>
    <meta name="description" content="Guias, regras, dicas de deck e tudo sobre Sorcery: Contested Realm em português. O melhor conteúdo de Sorcery TCG no Brasil.">
    <meta name="keywords" content="sorcery tcg, sorcery brasil, guias sorcery, regras sorcery, decks sorcery">
    <meta name="author" content="Sorcery Brasil">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://sorcery.com.br/artigos/">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://sorcery.com.br/artigos/">
    <meta property="og:title" content="Artigos sobre Sorcery TCG | Sorcery Brasil">
    <meta property="og:description" content="Guias, regras, dicas de deck e tudo sobre Sorcery: Contested Realm em português.">
    <meta property="og:image" content="https://sorcery.com.br/assets/hero-bg.jpg">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="Sorcery Brasil">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Artigos sobre Sorcery TCG | Sorcery Brasil">
    <meta name="twitter:description" content="Guias, regras, dicas de deck e tudo sobre Sorcery: Contested Realm em português.">
    <meta name="twitter:image" content="https://sorcery.com.br/assets/hero-bg.jpg">

    <!-- Theme -->
    <meta name="theme-color" content="#d4af37">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- Styles -->
    <link rel="stylesheet" href="/styles.min.css?v=110">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" defer></script>

    <style>
    .articles-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-6);
    }
    .articles-header {
        text-align: center;
        margin-bottom: var(--space-6);
    }
    .articles-header h1 {
        font-family: 'Cinzel', serif;
        font-size: 2.5rem;
        color: var(--accent-gold);
        margin-bottom: var(--space-3);
    }
    .articles-header p {
        color: var(--text-secondary);
        font-size: 1.125rem;
    }
    .articles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: var(--space-5);
    }
    .article-card {
        background: var(--bg-surface-1);
        border-radius: var(--radius-lg);
        overflow: hidden;
        text-decoration: none;
        transition: transform var(--duration-fast), box-shadow var(--duration-fast);
        border: 1px solid var(--border-color);
    }
    .article-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }
    .article-card-image {
        aspect-ratio: 16/9;
        overflow: hidden;
    }
    .article-card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--duration-fast);
    }
    .article-card:hover .article-card-image img {
        transform: scale(1.05);
    }
    .article-card-body {
        padding: var(--space-4);
    }
    .article-card-body h3 {
        font-family: 'Cinzel', serif;
        color: var(--text-primary);
        font-size: 1.125rem;
        margin: var(--space-2) 0;
        line-height: 1.3;
    }
    .article-card-body p {
        color: var(--text-secondary);
        font-size: 0.875rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .article-card-meta {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-top: var(--space-3);
        color: var(--text-secondary);
        font-size: 0.75rem;
    }
    .article-card-meta span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    @media (max-width: 768px) {
        .articles-page {
            padding: var(--space-4);
        }
        .articles-header h1 {
            font-size: 1.75rem;
        }
        .articles-grid {
            grid-template-columns: 1fr;
        }
    }
    </style>
</head>
<body>
    <div id="app">
        <!-- Header -->
        <header class="header">
            <div class="header-top">
                <a href="/" class="logo">
                    <img src="/sorcery-logo.webp" alt="Sorcery TCG" class="logo-img" width="120" height="36">
                    <div class="logo-text">
                        <span class="logo-divider">|</span>
                        <span class="logo-brasil">BRASIL</span>
                    </div>
                </a>
                <nav class="header-nav">
                    <a href="/" class="nav-link">Início</a>
                    <a href="/artigos/" class="nav-link active">Artigos</a>
                    <a href="/#collection" class="nav-link">Coleção</a>
                    <a href="/#decks" class="nav-link">Decks</a>
                </nav>
            </div>
        </header>

        <!-- Articles List -->
        <main class="main-content">
            <div class="articles-page">
                <header class="articles-header">
                    <h1>Artigos sobre Sorcery TCG</h1>
                    <p>Guias, regras, dicas de deck e tudo sobre Sorcery: Contested Realm em português.</p>
                </header>

                <div class="articles-grid">
${articleCards}
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="footer" style="background: var(--bg-surface-1); padding: var(--space-5) var(--space-6); margin-top: var(--space-6); border-top: 1px solid var(--border-color);">
            <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
                <p style="color: var(--text-secondary); font-size: 0.875rem;">
                    © 2026 Sorcery Brasil. Não somos afiliados à Erik's Curiosa.
                    <br>
                    <a href="https://sorcerytcg.com" target="_blank" rel="noopener" style="color: var(--accent-gold);">Site Oficial</a> ·
                    <a href="https://curiosa.io" target="_blank" rel="noopener" style="color: var(--accent-gold);">Curiosa.io</a> ·
                    <a href="https://discord.gg/qvYVGFAS5n" target="_blank" rel="noopener" style="color: var(--accent-gold);">Discord BR</a>
                </p>
            </div>
        </footer>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    </script>
</body>
</html>`;
}

// Main execution
function main() {
  const outputDir = path.join(__dirname, '..', 'artigos');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating article pages...\n');

  // Generate individual article pages
  for (const article of articlesDB.articles) {
    const articleDir = path.join(outputDir, article.slug);
    if (!fs.existsSync(articleDir)) {
      fs.mkdirSync(articleDir, { recursive: true });
    }

    const html = generateArticlePage(article);
    const outputPath = path.join(articleDir, 'index.html');
    fs.writeFileSync(outputPath, html);
    console.log(`  ✓ /artigos/${article.slug}/`);
  }

  // Generate index page
  const indexHtml = generateIndexPage(articlesDB.articles);
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
  console.log(`  ✓ /artigos/`);

  console.log(`\n✅ Generated ${articlesDB.articles.length} article pages + index page`);
}

main();
