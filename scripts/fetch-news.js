/**
 * Sorcery TCG News Fetcher & Translator
 *
 * Fetches real news from sorcerytcg.com using hybrid approach:
 * 1. Scrapes /news page directly for latest articles (catches new posts immediately)
 * 2. Falls back to sitemap.xml for older articles
 *
 * Then translates to Portuguese using OpenAI
 */

import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_URL = 'https://sorcerytcg.com/sitemap.xml';
const BASE_URL = 'https://sorcerytcg.com';
const OUTPUT_FILE = path.join(__dirname, '..', 'news-database.json');
const MAX_NEWS = 15;

// OpenAI client (lazy initialization to allow running without API key for testing)
let openai = null;
function getOpenAI() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required for translation');
        }
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
}

/**
 * Fetch page content
 */
async function fetchPage(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return response.text();
}

/**
 * Get news URLs from sitemap, prioritizing recent ones
 */
async function getNewsUrlsFromSitemap() {
    console.log('[Fetch] Getting news URLs from sitemap...');
    const xml = await fetchPage(SITEMAP_URL);

    // Extract all news URLs with their lastmod dates if available
    const newsUrls = [];
    const urlBlocks = xml.split('<url>');

    for (const block of urlBlocks) {
        const locMatch = block.match(/<loc>([^<]*\/news\/[^<]+)<\/loc>/);
        if (!locMatch) continue;

        const url = locMatch[1];
        // Skip the main news page
        if (url === `${BASE_URL}/news` || url === `${BASE_URL}/news/`) continue;

        // Try to get lastmod date
        const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
        const lastmod = lastmodMatch ? lastmodMatch[1] : null;

        // Calculate priority score
        let priority = 0;
        const urlLower = url.toLowerCase();

        // Prioritize URLs with recent years
        if (urlLower.includes('2026')) priority += 100;
        else if (urlLower.includes('2025')) priority += 50;
        else if (urlLower.includes('2024')) priority += 25;

        // Prioritize certain keywords that indicate recent/important news
        if (urlLower.includes('grand-contest')) priority += 30;
        if (urlLower.includes('championship')) priority += 20;
        if (urlLower.includes('gothic')) priority += 15;
        if (urlLower.includes('dust')) priority += 15;
        if (urlLower.includes('organized-play')) priority += 10;

        newsUrls.push({ url, lastmod, priority });
    }

    // Sort by priority (highest first), then by lastmod date if available
    newsUrls.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        if (a.lastmod && b.lastmod) return b.lastmod.localeCompare(a.lastmod);
        return 0;
    });

    console.log(`[Fetch] Found ${newsUrls.length} news URLs`);
    console.log(`[Fetch] Top 5 prioritized URLs:`);
    newsUrls.slice(0, 5).forEach(n => console.log(`  - ${n.url} (priority: ${n.priority})`));

    // Return URLs only, take more to ensure we get recent ones
    return newsUrls.slice(0, MAX_NEWS * 3).map(n => n.url);
}

/**
 * Get news URLs from the tRPC API (catches new articles immediately)
 * This is more reliable than scraping the HTML since the site uses client-side rendering
 */
async function getNewsUrlsFromAPI() {
    console.log('[Fetch] Getting news URLs from tRPC API...');

    const apiUrl = `${BASE_URL}/api/trpc/cms.searchPosts?batch=1&input=${encodeURIComponent(JSON.stringify({
        "0": { "json": { "query": "", "tag": "*", "direction": "forward" } }
    }))}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/news`
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        const posts = data[0]?.result?.data?.json?.posts || [];

        const newsUrls = posts.map(post => {
            const slug = typeof post.slug === 'string' ? post.slug : post.slug?.current;
            return `${BASE_URL}/news/${slug}`;
        }).filter(url => url && !url.endsWith('/undefined'));

        console.log(`[Fetch] Found ${newsUrls.length} news URLs from API`);
        if (newsUrls.length > 0) {
            console.log(`[Fetch] Latest articles from API:`);
            newsUrls.slice(0, 5).forEach(url => console.log(`  - ${url.split('/news/')[1]}`));
        }

        return newsUrls;
    } catch (error) {
        console.error('[Fetch] Error fetching from API:', error.message);
        return [];
    }
}

/**
 * Get combined news URLs from both API and sitemap (hybrid approach)
 */
async function getNewsUrls() {
    // First, get URLs from API (most recent, includes articles not yet in sitemap)
    const apiUrls = await getNewsUrlsFromAPI();

    // Then, get URLs from sitemap (may have older articles not returned by API)
    const sitemapUrls = await getNewsUrlsFromSitemap();

    // Combine and deduplicate, prioritizing API order (newest first)
    const allUrls = [...apiUrls];
    const urlSet = new Set(apiUrls);

    for (const url of sitemapUrls) {
        if (!urlSet.has(url)) {
            allUrls.push(url);
            urlSet.add(url);
        }
    }

    console.log(`[Fetch] Combined: ${allUrls.length} unique URLs (${apiUrls.length} from API, ${sitemapUrls.length} from sitemap)`);

    return allUrls;
}

/**
 * Extract article data from HTML
 */
function extractArticleData(html, url) {
    const $ = cheerio.load(html);

    // Check if it's a 404 page
    if (html.includes('This page could not be found') || html.includes('404')) {
        return null;
    }

    // Try to find title
    let title = '';
    title = $('h1').first().text().trim();
    if (!title) title = $('title').text().replace(' | Sorcery TCG', '').trim();

    // Try to find date - look for common date patterns
    let date = '';
    const datePatterns = [
        /(\w+ \d{1,2},? \d{4})/,
        /(\d{4}-\d{2}-\d{2})/,
        /(\d{1,2}\/\d{1,2}\/\d{4})/
    ];

    const htmlText = html;
    for (const pattern of datePatterns) {
        const match = htmlText.match(pattern);
        if (match) {
            date = match[1];
            break;
        }
    }

    // If no date found, try to extract from URL or set as recent
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }

    // Find main image from Sanity CDN
    let image = null;
    const imageMatches = html.matchAll(/https:\/\/cdn\.sanity\.io\/images\/vg9ve3gy\/production\/[a-z0-9-]+\.(png|jpg|jpeg|webp)/gi);
    for (const match of imageMatches) {
        const imgUrl = match[0];
        // Skip small images (icons, avatars)
        if (!imgUrl.includes('160x160') && !imgUrl.includes('icon')) {
            image = imgUrl;
            break;
        }
    }

    // Extract text content
    let content = '';
    $('article p, main p, .content p, [class*="article"] p, [class*="content"] p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) {
            content += text + ' ';
        }
    });

    // If no content found, try body text
    if (!content) {
        content = $('body').text()
            .replace(/\s+/g, ' ')
            .substring(0, 1000);
    }

    // Extract category/tag from URL
    let category = 'News';
    const urlLower = url.toLowerCase();
    if (urlLower.includes('gothic')) category = 'Gothic';
    else if (urlLower.includes('artist') || urlLower.includes('welcome')) category = 'Artista';
    else if (urlLower.includes('how-to-play') || urlLower.includes('gameplay')) category = 'Guia';
    else if (urlLower.includes('event') || urlLower.includes('contest') || urlLower.includes('championship')) category = 'Evento';
    else if (urlLower.includes('store') || urlLower.includes('kit')) category = 'OP';
    else if (urlLower.includes('expansion') || urlLower.includes('beta') || urlLower.includes('alpha')) category = 'Produto';

    // Get slug from URL
    const slug = url.split('/news/')[1] || '';

    return {
        title_en: title,
        content_en: content.trim().substring(0, 1500),
        link: url,
        image,
        date,
        category,
        slug
    };
}

/**
 * Terms that should NOT be translated (game mechanics, product names, etc.)
 */
const PRESERVE_TERMS = [
    // Game name and core terms
    'Sorcery', 'Sorcery TCG', 'Contested Realm',
    // Collections/Sets
    'Alpha', 'Beta', 'Gothic', 'Arthurian', 'Wonderlands',
    // Game mechanics
    'Dust', 'Aura', 'Minion', 'Avatar', 'Relic', 'Magic', 'Site', 'Artifact',
    'Ordinary', 'Exceptional', 'Elite', 'Unique',
    // Product types
    'Precon', 'Precons', 'Booster', 'Boosters', 'Starter Kit', 'Bundle',
    // Card variants
    'Foil', 'Rainbow Foil', 'Standard',
    // Events/Programs
    'Championship', 'Store Championship', 'Organized Play', 'OP Kit',
    // Platforms
    'Curiosa', 'Curiosa.io', 'TCGPlayer',
    // Common card terms
    'Spellcaster', 'Threshold', 'Rubble'
];

/**
 * Translate and summarize news using OpenAI
 */
async function translateNews(newsItem) {
    const prompt = `Traduza esta notícia sobre Sorcery TCG para português brasileiro.

IMPORTANTE: Os seguintes termos NÃO devem ser traduzidos (são nomes próprios, mecânicas do jogo ou produtos):
${PRESERVE_TERMS.join(', ')}

Título: ${newsItem.title_en}

Conteúdo: ${newsItem.content_en || 'Sem conteúdo disponível'}

Responda em JSON:
{
  "title_pt": "título traduzido (preservando os termos acima em inglês)",
  "summary_pt": "resumo detalhado em português (3-4 frases, máximo 300 caracteres, informativo e engajante, preservando os termos acima em inglês)"
}

Exemplo correto: "Dust em Sorcery: Contested Realm" (NÃO "Poeira em Feitiçaria: Reino Contestável")

Se o conteúdo estiver vazio, crie um resumo baseado no título.`;

    try {
        const response = await getOpenAI().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const result = JSON.parse(response.choices[0].message.content);
        return {
            ...newsItem,
            title_pt: result.title_pt,
            summary_pt: result.summary_pt
        };
    } catch (error) {
        console.error(`[Fetch] Translation failed: ${newsItem.title_en}`, error.message);
        return {
            ...newsItem,
            title_pt: newsItem.title_en,
            summary_pt: newsItem.content_en?.substring(0, 300) || newsItem.title_en
        };
    }
}

/**
 * Parse date string to ISO format
 */
function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];

    // Try to parse various formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
}

/**
 * Load existing news database
 */
function loadExistingNews() {
    try {
        if (fs.existsSync(OUTPUT_FILE)) {
            const data = fs.readFileSync(OUTPUT_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('[Fetch] Failed to load existing news:', error.message);
    }
    return { news: [], lastUpdated: null };
}

/**
 * Main function
 */
async function main() {
    console.log('=== Sorcery News Fetcher v3 (Hybrid) ===');
    console.log(`Output: ${OUTPUT_FILE}`);

    try {
        // Get news URLs from both /news page and sitemap (hybrid approach)
        const newsUrls = await getNewsUrls();

        if (newsUrls.length === 0) {
            console.log('[Fetch] No news URLs found');
            return;
        }

        // Load existing news
        const existing = loadExistingNews();
        const existingLinks = new Set(existing.news.map(n => n.link));

        // Fetch and parse each news article
        const allNews = [];
        let newCount = 0;

        for (const url of newsUrls) {
            // Check if we already have this news
            if (existingLinks.has(url)) {
                console.log(`[Fetch] Skipping (exists): ${url.split('/news/')[1]}`);
                const existingItem = existing.news.find(n => n.link === url);
                if (existingItem) allNews.push(existingItem);
                continue;
            }

            console.log(`[Fetch] Fetching: ${url.split('/news/')[1]}`);

            try {
                const html = await fetchPage(url);
                const data = extractArticleData(html, url);

                if (data && data.title_en) {
                    // Translate
                    console.log(`[Fetch] Translating: ${data.title_en.substring(0, 40)}...`);
                    const translated = await translateNews(data);
                    translated.id = `news-${Date.now()}-${newCount}`;
                    translated.date = parseDate(translated.date);
                    allNews.push(translated);
                    newCount++;

                    // Delay to avoid rate limiting
                    await new Promise(r => setTimeout(r, 800));
                }
            } catch (err) {
                console.error(`[Fetch] Error fetching ${url}:`, err.message);
            }

            // Limit total news
            if (allNews.length >= MAX_NEWS) break;
        }

        // Sort by date (newest first)
        allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Keep only MAX_NEWS
        const finalNews = allNews.slice(0, MAX_NEWS);

        // Save
        const output = {
            news: finalNews,
            lastUpdated: new Date().toISOString(),
            source: `${BASE_URL}/news + ${SITEMAP_URL}`
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        console.log(`\n[Fetch] Done! Saved ${finalNews.length} news items (${newCount} new)`);

    } catch (error) {
        console.error('[Fetch] Fatal error:', error);
        process.exit(1);
    }
}

main();
