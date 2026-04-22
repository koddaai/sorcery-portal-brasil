#!/usr/bin/env node
/**
 * Generate static HTML pages for all articles
 * Creates SEO-optimized pages at /artigos/[slug]/index.html
 *
 * Features:
 * - Author profile with avatar
 * - Source/reference links
 * - Community footer with contribution CTA
 * - Article submission form (NocoDB integration)
 */

const fs = require('fs');
const path = require('path');

// Load articles database
const articlesDB = require('../articles-database.json');

// Author configuration
const authors = {
  'pedro-lourenco': {
    name: 'Pedro Lourenço',
    avatar: '/assets/authors/pedro-lourenco-avatar.jpg'
  },
  'equipe': {
    name: 'Equipe Sorcery Brasil',
    avatar: '/sorcery-logo.webp'
  }
};

// Default author
const defaultAuthor = authors['pedro-lourenco'];

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

// Default sources by category
const defaultSources = {
  'Guia': ['https://reddit.com/r/SorceryTCG', 'https://sorcerytcg.com'],
  'FAQ': ['https://sorcerytcg.com/rules', 'https://reddit.com/r/SorceryTCG'],
  'Mecânica': ['https://sorcerytcg.com/rules'],
  'Ruling': ['https://sorcerytcg.com/rules', 'https://discord.gg/sorcerytcg'],
  'Referência': ['https://curiosa.io', 'https://realms.cards'],
  'Deck': ['https://curiosa.io/decks'],
  'Deck Tech': ['https://curiosa.io/decks', 'https://sorcerydata.com'],
  'Meta': ['https://sorcerydata.com', 'https://curiosa.io'],
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

// Get sources for an article
function getSources(article) {
  // If article has explicit sources, use them
  if (article.sources && article.sources.length > 0) {
    return article.sources;
  }
  // Otherwise use default sources based on category
  return defaultSources[article.category] || ['https://reddit.com/r/SorceryTCG'];
}

// Generate author section HTML
function generateAuthorSection(article) {
  const author = article.author ? authors[article.author] : defaultAuthor;

  return `
                <!-- Author Profile -->
                <div class="author-profile">
                    <img src="${author.avatar}" alt="${author.name}" class="author-avatar">
                    <div class="author-info">
                        <span class="author-label">Escrito por</span>
                        <span class="author-name">${author.name}</span>
                    </div>
                </div>`;
}

// Generate sources section HTML
function generateSourcesSection(article) {
  const sources = getSources(article);

  const sourceLinks = sources.map(url => {
    const domain = new URL(url).hostname.replace('www.', '');
    return `<a href="${url}" target="_blank" rel="noopener nofollow">${domain}</a>`;
  }).join('');

  return `
                <!-- Sources -->
                <div class="article-sources">
                    <h4><i data-lucide="link" style="width:16px;height:16px;"></i> Fontes e Referências</h4>
                    <div class="source-links">
                        ${sourceLinks}
                    </div>
                </div>`;
}

// Generate community footer HTML
function generateCommunityFooter() {
  return `
                <!-- Community Footer -->
                <div class="community-footer">
                    <div class="community-message">
                        <i data-lucide="heart" style="width:24px;height:24px;color:var(--accent-gold);"></i>
                        <div>
                            <h4>Sorcery Brasil é um portal gratuito e independente</h4>
                            <p>Nosso objetivo é apoiar o crescimento da comunidade de Sorcery no Brasil. Todo o conteúdo é criado por jogadores, para jogadores.</p>
                        </div>
                    </div>

                    <div class="contribute-cta">
                        <h4>Quer contribuir com um artigo?</h4>
                        <p>Se você tem conhecimento para compartilhar com a comunidade, adoraríamos publicar seu conteúdo!</p>
                        <button class="btn primary" onclick="openSubmissionForm()">
                            <i data-lucide="pen-line" style="width:16px;height:16px;"></i>
                            Submeter Artigo
                        </button>
                    </div>
                </div>`;
}

// Generate submission form modal HTML
function generateSubmissionFormModal() {
  return `
    <!-- Article Submission Modal -->
    <div id="submission-modal" class="submission-modal hidden">
        <div class="submission-modal-content">
            <button class="modal-close" onclick="closeSubmissionForm()">
                <i data-lucide="x"></i>
            </button>
            <h2>Submeter Artigo</h2>
            <p class="submission-intro">Preencha o formulário abaixo. Nossa equipe revisará seu artigo e entrará em contato.</p>

            <form id="article-submission-form" onsubmit="submitArticle(event)">
                <div class="form-group">
                    <label for="author-name">Seu Nome *</label>
                    <input type="text" id="author-name" name="authorName" required placeholder="Como você quer ser creditado">
                </div>

                <div class="form-group">
                    <label for="author-email">E-mail *</label>
                    <input type="email" id="author-email" name="authorEmail" required placeholder="Para entrarmos em contato">
                </div>

                <div class="form-group">
                    <label for="article-title">Título do Artigo *</label>
                    <input type="text" id="article-title" name="articleTitle" required placeholder="Ex: Guia de Deck Water Aggro">
                </div>

                <div class="form-group">
                    <label for="article-category">Categoria</label>
                    <select id="article-category" name="articleCategory">
                        <option value="Guia">Guia</option>
                        <option value="Deck Tech">Deck Tech</option>
                        <option value="Mecânica">Mecânica / Regras</option>
                        <option value="Meta">Meta / Análise</option>
                        <option value="Lore">Lore</option>
                        <option value="Comunidade">Comunidade</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="article-content">Conteúdo do Artigo *</label>
                    <textarea id="article-content" name="articleContent" required rows="12" placeholder="Escreva seu artigo aqui. Você pode usar Markdown para formatação (## títulos, **negrito**, - listas, etc)."></textarea>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn secondary" onclick="closeSubmissionForm()">Cancelar</button>
                    <button type="submit" class="btn primary" id="submit-btn">
                        <i data-lucide="send" style="width:16px;height:16px;"></i>
                        Enviar Artigo
                    </button>
                </div>
            </form>
        </div>
    </div>`;
}

// Generate submission form scripts
function generateSubmissionScripts() {
  return `
    <script>
        // Submission form functions
        function openSubmissionForm() {
            document.getElementById('submission-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function closeSubmissionForm() {
            document.getElementById('submission-modal').classList.add('hidden');
            document.body.style.overflow = '';
        }

        async function submitArticle(event) {
            event.preventDefault();

            const form = event.target;
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;

            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> Enviando...';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            const data = {
                author_name: form.authorName.value,
                author_email: form.authorEmail.value,
                title: form.articleTitle.value,
                category: form.articleCategory.value,
                content: form.articleContent.value,
                submitted_at: new Date().toISOString(),
                status: 'pending'
            };

            try {
                // Submit to NocoDB
                const response = await fetch('https://dados.kodda.ai/api/v2/tables/article_submissions/records', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xc-token': 'ZLl4Ylb4mM8TUuHSJoOHClz6m7LW5at1maPz0-a4'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    // Success
                    closeSubmissionForm();
                    showToast('Artigo enviado com sucesso! Entraremos em contato em breve.', 'success');
                    form.reset();
                } else {
                    throw new Error('Erro ao enviar');
                }
            } catch (error) {
                console.error('Submission error:', error);
                showToast('Erro ao enviar artigo. Tente novamente ou entre em contato pelo Discord.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }

        // Simple toast notification
        function showToast(message, type) {
            const toast = document.createElement('div');
            toast.className = 'toast toast-' + type;
            toast.innerHTML = '<i data-lucide="' + (type === 'success' ? 'check-circle' : 'alert-circle') + '"></i> ' + message;
            document.body.appendChild(toast);
            if (typeof lucide !== 'undefined') lucide.createIcons();

            setTimeout(() => {
                toast.classList.add('toast-exit');
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        }

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSubmissionForm();
        });

        // Close modal on backdrop click
        document.getElementById('submission-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'submission-modal') closeSubmissionForm();
        });
    </script>`;
}

// Generate article HTML page
function generateArticlePage(article) {
  const config = categoryConfig[article.category] || { icon: 'file-text', class: 'badge-article' };
  const contentHTML = parseMarkdown(article.content);
  const imageUrl = `https://sorcery.com.br/${article.image}`;
  const articleUrl = `https://sorcery.com.br/artigos/${article.slug}/`;
  const author = article.author ? authors[article.author] : defaultAuthor;

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
      "@type": "Person",
      "name": author.name
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
    <meta name="author" content="${author.name}">
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
    <meta property="article:author" content="${author.name}">
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
    <link rel="stylesheet" href="/styles.min.css?v=111">
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

    /* Author Profile */
    .author-profile {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4);
        background: var(--bg-surface-1);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-5);
        border: 1px solid var(--border-color);
    }
    .author-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--accent-gold);
    }
    .author-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .author-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .author-name {
        font-family: 'Cinzel', serif;
        font-size: 1.125rem;
        color: var(--text-primary);
        font-weight: 600;
    }
    .author-bio {
        font-size: 0.875rem;
        color: var(--text-secondary);
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

    /* Sources Section */
    .article-sources {
        margin-top: var(--space-5);
        padding: var(--space-4);
        background: var(--bg-surface-1);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-color);
    }
    .article-sources h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-3);
        font-weight: 600;
    }
    .source-links {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }
    .source-links a {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        background: var(--bg-surface-2);
        color: var(--accent-gold);
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        text-decoration: none;
        transition: background var(--duration-fast);
    }
    .source-links a:hover {
        background: rgba(212, 175, 55, 0.2);
    }

    /* Community Footer */
    .community-footer {
        margin-top: var(--space-6);
        padding: var(--space-5);
        background: linear-gradient(135deg, var(--bg-surface-1), var(--bg-surface-2));
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-color);
    }
    .community-message {
        display: flex;
        gap: var(--space-4);
        margin-bottom: var(--space-5);
        padding-bottom: var(--space-5);
        border-bottom: 1px solid var(--border-color);
    }
    .community-message h4 {
        font-family: 'Cinzel', serif;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }
    .community-message p {
        color: var(--text-secondary);
        font-size: 0.875rem;
        line-height: 1.6;
    }
    .contribute-cta {
        text-align: center;
    }
    .contribute-cta h4 {
        font-family: 'Cinzel', serif;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }
    .contribute-cta p {
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin-bottom: var(--space-4);
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

    /* Submission Modal */
    .submission-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--space-4);
    }
    .submission-modal.hidden {
        display: none;
    }
    .submission-modal-content {
        background: var(--bg-surface-1);
        border-radius: var(--radius-lg);
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: var(--space-6);
        position: relative;
        border: 1px solid var(--border-color);
    }
    .submission-modal-content h2 {
        font-family: 'Cinzel', serif;
        color: var(--accent-gold);
        margin-bottom: var(--space-2);
    }
    .submission-intro {
        color: var(--text-secondary);
        margin-bottom: var(--space-5);
    }
    .form-group {
        margin-bottom: var(--space-4);
    }
    .form-group label {
        display: block;
        color: var(--text-primary);
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: var(--space-3);
        background: var(--bg-surface-2);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 1rem;
    }
    .form-group textarea {
        resize: vertical;
        font-family: inherit;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-gold);
    }
    .form-actions {
        display: flex;
        gap: var(--space-3);
        justify-content: flex-end;
        margin-top: var(--space-5);
    }
    .modal-close {
        position: absolute;
        top: var(--space-4);
        right: var(--space-4);
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.5rem;
    }
    .modal-close:hover {
        color: var(--text-primary);
    }

    /* Toast */
    .toast {
        position: fixed;
        bottom: var(--space-4);
        right: var(--space-4);
        padding: var(--space-3) var(--space-4);
        background: var(--bg-surface-1);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    }
    .toast-success {
        border-color: #22c55e;
    }
    .toast-success i {
        color: #22c55e;
    }
    .toast-error {
        border-color: #ef4444;
    }
    .toast-error i {
        color: #ef4444;
    }
    .toast-exit {
        animation: slideOut 0.3s ease forwards;
    }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
        .article-page {
            padding: var(--space-4);
        }
        .article-title {
            font-size: 1.5rem;
        }
        .author-profile {
            flex-direction: column;
            text-align: center;
        }
        .community-message {
            flex-direction: column;
            text-align: center;
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
${generateAuthorSection(article)}

                <!-- Content -->
                <div class="article-content">
                    ${contentHTML}
                </div>
${generateSourcesSection(article)}
${generateCommunityFooter()}

                <!-- Navigation Footer -->
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
${generateSubmissionFormModal()}

    <script>
        // Initialize Lucide icons
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    </script>
${generateSubmissionScripts()}
</body>
</html>`;
}

// Generate index page for /artigos/
function generateIndexPage(articles) {
  const author = defaultAuthor;

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
                            <span><i data-lucide="user" style="width:12px;height:12px;"></i> ${author.name}</span>
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
    <meta name="author" content="${author.name}">
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
    <link rel="stylesheet" href="/styles.min.css?v=111">
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
        max-width: 600px;
        margin: 0 auto var(--space-5);
    }
    .contribute-banner {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: var(--space-2) var(--space-4);
        background: rgba(212, 175, 55, 0.1);
        border: 1px solid var(--accent-gold);
        border-radius: var(--radius-full);
        color: var(--accent-gold);
        font-size: 0.875rem;
        cursor: pointer;
        transition: background var(--duration-fast);
    }
    .contribute-banner:hover {
        background: rgba(212, 175, 55, 0.2);
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
        gap: var(--space-3);
        margin-top: var(--space-3);
        color: var(--text-secondary);
        font-size: 0.75rem;
    }
    .article-card-meta span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    /* Submission Modal (same styles as article pages) */
    .submission-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--space-4);
    }
    .submission-modal.hidden {
        display: none;
    }
    .submission-modal-content {
        background: var(--bg-surface-1);
        border-radius: var(--radius-lg);
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: var(--space-6);
        position: relative;
        border: 1px solid var(--border-color);
    }
    .submission-modal-content h2 {
        font-family: 'Cinzel', serif;
        color: var(--accent-gold);
        margin-bottom: var(--space-2);
    }
    .submission-intro {
        color: var(--text-secondary);
        margin-bottom: var(--space-5);
    }
    .form-group {
        margin-bottom: var(--space-4);
    }
    .form-group label {
        display: block;
        color: var(--text-primary);
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: var(--space-3);
        background: var(--bg-surface-2);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 1rem;
    }
    .form-group textarea {
        resize: vertical;
        font-family: inherit;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--accent-gold);
    }
    .form-actions {
        display: flex;
        gap: var(--space-3);
        justify-content: flex-end;
        margin-top: var(--space-5);
    }
    .modal-close {
        position: absolute;
        top: var(--space-4);
        right: var(--space-4);
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.5rem;
    }
    .modal-close:hover {
        color: var(--text-primary);
    }
    .toast {
        position: fixed;
        bottom: var(--space-4);
        right: var(--space-4);
        padding: var(--space-3) var(--space-4);
        background: var(--bg-surface-1);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    }
    .toast-success { border-color: #22c55e; }
    .toast-success i { color: #22c55e; }
    .toast-error { border-color: #ef4444; }
    .toast-error i { color: #ef4444; }
    .toast-exit { animation: slideOut 0.3s ease forwards; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

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
                    <button class="contribute-banner" onclick="openSubmissionForm()">
                        <i data-lucide="pen-line" style="width:16px;height:16px;"></i>
                        Contribuir com um artigo
                    </button>
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
${generateSubmissionFormModal()}

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    </script>
${generateSubmissionScripts()}
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
  console.log('   Features: Author profile, Sources, Community footer, Submission form');
}

main();
