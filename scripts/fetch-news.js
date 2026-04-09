/**
 * Sorcery TCG News Fetcher & Translator
 *
 * Fetches news from sorcerytcg.com and translates to Portuguese using OpenAI
 */

import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_URL = 'https://sorcerytcg.com/news';
const OUTPUT_FILE = path.join(__dirname, '..', 'news-database.json');
const MAX_NEWS = 20; // Keep last 20 news items

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Fetch HTML from URL
 */
async function fetchPage(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SorceryPortalBR/1.0)'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return response.text();
}

/**
 * Parse news from Sorcery TCG website
 */
async function parseNews(html) {
    const $ = cheerio.load(html);
    const newsItems = [];

    // Try to find news articles - adjust selectors based on actual site structure
    // Common patterns: article, .news-item, .post, etc.
    $('article, .news-item, .post-card, [class*="news"], [class*="article"]').each((i, el) => {
        const $el = $(el);

        // Try various selectors for title
        const title = $el.find('h1, h2, h3, h4, [class*="title"]').first().text().trim();

        // Try various selectors for link
        let link = $el.find('a').first().attr('href') || $el.attr('href');
        if (link && !link.startsWith('http')) {
            link = `https://sorcerytcg.com${link.startsWith('/') ? '' : '/'}${link}`;
        }

        // Try various selectors for excerpt/summary
        const excerpt = $el.find('p, [class*="excerpt"], [class*="summary"], [class*="desc"]').first().text().trim();

        // Try to find image
        let image = $el.find('img').first().attr('src');
        if (image && !image.startsWith('http')) {
            image = `https://sorcerytcg.com${image.startsWith('/') ? '' : '/'}${image}`;
        }

        // Try to find date
        const dateText = $el.find('time, [class*="date"], [datetime]').first().text().trim()
            || $el.find('[datetime]').attr('datetime');

        // Try to find category/badge
        const category = $el.find('[class*="badge"], [class*="category"], [class*="tag"]').first().text().trim();

        if (title && link) {
            newsItems.push({
                title_en: title,
                excerpt_en: excerpt || '',
                link,
                image: image || null,
                date: dateText || new Date().toISOString().split('T')[0],
                category: category || 'News'
            });
        }
    });

    // Remove duplicates by link
    const uniqueNews = [...new Map(newsItems.map(item => [item.link, item])).values()];

    return uniqueNews.slice(0, MAX_NEWS);
}

/**
 * Translate news item to Portuguese using OpenAI
 */
async function translateNews(newsItem) {
    const prompt = `Translate the following news item about Sorcery TCG (a trading card game) to Brazilian Portuguese.
Keep the tone informative and engaging. If there's no excerpt, create a brief summary (1-2 sentences) based on the title.

Title: ${newsItem.title_en}
Excerpt: ${newsItem.excerpt_en || 'No excerpt available'}

Respond in JSON format:
{
  "title_pt": "translated title",
  "summary_pt": "translated/created summary (max 150 chars)"
}`;

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
        console.error(`Failed to translate: ${newsItem.title_en}`, error.message);
        // Fallback: use original
        return {
            ...newsItem,
            title_pt: newsItem.title_en,
            summary_pt: newsItem.excerpt_en || newsItem.title_en
        };
    }
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
        console.error('Failed to load existing news:', error.message);
    }
    return { news: [], lastUpdated: null };
}

/**
 * Main function
 */
async function main() {
    console.log('=== Sorcery News Fetcher ===');
    console.log(`Fetching news from ${NEWS_URL}...`);

    try {
        // Fetch and parse news
        const html = await fetchPage(NEWS_URL);
        const newsItems = await parseNews(html);

        console.log(`Found ${newsItems.length} news items`);

        if (newsItems.length === 0) {
            console.log('No news found. The website structure might have changed.');
            console.log('Creating sample news for testing...');

            // Create sample news for initial setup
            const sampleNews = [
                {
                    title_en: 'Gothic Expansion Released',
                    excerpt_en: 'The Gothic expansion brings vampires, werewolves, and dark magic to Sorcery.',
                    link: 'https://sorcerytcg.com/news/gothic',
                    image: null,
                    date: '2025-03-15',
                    category: 'Expansion'
                },
                {
                    title_en: 'Organized Play 2026 Announced',
                    excerpt_en: 'Four tiers of competition for all players: Store Kits, Cornerstone, Grand Contests, and Avatar of the Realm.',
                    link: 'https://sorcerytcg.com/organized-play',
                    image: null,
                    date: '2025-03-01',
                    category: 'OP'
                }
            ];

            newsItems.push(...sampleNews);
        }

        // Load existing news
        const existing = loadExistingNews();
        const existingLinks = new Set(existing.news.map(n => n.link));

        // Find new items that need translation
        const newItems = newsItems.filter(item => !existingLinks.has(item.link));
        console.log(`${newItems.length} new items to translate`);

        // Translate new items
        const translatedNew = [];
        for (const item of newItems) {
            console.log(`Translating: ${item.title_en.substring(0, 50)}...`);
            const translated = await translateNews(item);
            translatedNew.push(translated);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Merge: new items first, then existing
        const allNews = [...translatedNew, ...existing.news]
            .slice(0, MAX_NEWS)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // Generate IDs
        allNews.forEach((item, index) => {
            if (!item.id) {
                item.id = `news-${Date.now()}-${index}`;
            }
        });

        // Save
        const output = {
            news: allNews,
            lastUpdated: new Date().toISOString(),
            source: NEWS_URL
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        console.log(`Saved ${allNews.length} news items to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
