/**
 * Sorcery TCG News Fetcher & Translator
 *
 * Fetches real news from sorcerytcg.com sitemap and translates to Portuguese
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

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
 * Get news URLs from sitemap
 */
async function getNewsUrlsFromSitemap() {
    console.log('[Fetch] Getting news URLs from sitemap...');
    const xml = await fetchPage(SITEMAP_URL);

    // Extract news URLs
    const newsUrls = [];
    const matches = xml.matchAll(/<loc>([^<]*\/news\/[^<]+)<\/loc>/g);

    for (const match of matches) {
        const url = match[1];
        // Skip the main news page
        if (url !== `${BASE_URL}/news` && url !== `${BASE_URL}/news/`) {
            newsUrls.push(url);
        }
    }

    console.log(`[Fetch] Found ${newsUrls.length} news URLs`);
    return newsUrls.slice(0, MAX_NEWS * 2); // Get more to filter later
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
 * Translate and summarize news using OpenAI
 */
async function translateNews(newsItem) {
    const prompt = `Traduza esta notícia sobre Sorcery TCG para português brasileiro.

Título: ${newsItem.title_en}

Conteúdo: ${newsItem.content_en || 'Sem conteúdo disponível'}

Responda em JSON:
{
  "title_pt": "título traduzido",
  "summary_pt": "resumo detalhado em português (3-4 frases, máximo 300 caracteres, informativo e engajante)"
}

Se o conteúdo estiver vazio, crie um resumo baseado no título.`;

    try {
        const response = await openai.chat.completions.create({
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
    console.log('=== Sorcery News Fetcher v2 ===');
    console.log(`Output: ${OUTPUT_FILE}`);

    try {
        // Get news URLs from sitemap
        const newsUrls = await getNewsUrlsFromSitemap();

        if (newsUrls.length === 0) {
            console.log('[Fetch] No news URLs found in sitemap');
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
            source: SITEMAP_URL
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        console.log(`\n[Fetch] Done! Saved ${finalNews.length} news items (${newCount} new)`);

    } catch (error) {
        console.error('[Fetch] Fatal error:', error);
        process.exit(1);
    }
}

main();
