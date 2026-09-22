import fs from 'fs';
import path from 'path';
import { query } from '../db.ts';
import {
  DEFAULT_TOOLS,
  DEFAULT_CATEGORIES,
  DEFAULT_ARTICLES,
  DEFAULT_COMPARISONS,
  DEFAULT_TUTORIALS,
  DEFAULT_REVIEWS,
} from '../../data/defaultCatalog.ts';

export const INDEXNOW_KEY = 'daleelai2026indexnowkey';

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  type?: 'static' | 'tool' | 'category' | 'article' | 'comparison' | 'tutorial' | 'review';
  images?: { loc: string; title?: string }[];
}

export interface SitemapSummary {
  totalUrls: number;
  breakdown: {
    staticPages: number;
    tools: number;
    categories: number;
    articles: number;
    comparisons: number;
    tutorials: number;
    reviews: number;
  };
  generatedAt: string;
  sitemapUrl: string;
  latestLastMod?: string;
  entries?: SitemapUrlEntry[];
}

export interface CachedSitemap {
  xml: string;
  count: number;
  summary: SitemapSummary;
  generatedAt: Date;
  latestLastMod: Date;
  etag: string;
  baseUrl: string;
}

// In-Memory Fast Cache with Immediate Invalidation
let sitemapCache: CachedSitemap | null = null;
let sitemapVersion = 1;
let lastPingTime: string | null = null;
let lastPingResult: { success: boolean; message: string; timestamp: string; urlsPushed?: number } | null = null;

/**
 * Escapes XML entities in strings
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Get base URL from environment, host header, or default
 */
export function getBaseUrl(hostHeader?: string): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, '');
  }
  if (process.env.CANONICAL_DOMAIN) {
    return process.env.CANONICAL_DOMAIN.replace(/\/$/, '');
  }
  if (hostHeader) {
    const cleanHost = hostHeader.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (cleanHost.includes('run.app') || cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1')) {
      return 'https://ai-toolsar.netlify.app';
    }
    return `https://${cleanHost}`;
  }
  return 'https://ai-toolsar.netlify.app';
}

/**
 * Synchronize generated sitemap and IndexNow key files to static disk directories
 * Ensures static file hosts (Netlify, Cloud Run, CDNs) always have the latest XML file
 */
export function syncSitemapToDisk(xml: string): void {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
    fs.writeFileSync(path.join(publicDir, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY, 'utf8');

    const distDir = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
      fs.writeFileSync(path.join(distDir, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY, 'utf8');
    }
  } catch (err: any) {
    console.warn('[Sitemap Sync] Failed to write sitemap to disk:', err.message);
  }
}

/**
 * Notify Search Engines (IndexNow protocol for Bing, Yandex, Seznam, Naver)
 * Triggers near-instant indexing for new tools and articles
 */
export async function notifySearchEngines(urlList: string[] = [], hostHeader?: string) {
  const baseUrl = getBaseUrl(hostHeader);
  const cleanHost = baseUrl.replace(/^https?:\/\//, '');
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  const urlsToSubmit = Array.from(new Set([
    sitemapUrl,
    `${baseUrl}/feed.xml`,
    ...urlList.map((u) => (u.startsWith('http') ? u : `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`))
  ])).slice(0, 50);

  const payload = {
    host: cleanHost,
    key: INDEXNOW_KEY,
    keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
    urlList: urlsToSubmit,
  };

  try {
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'DaleelAI-SitemapEngine/2026',
      },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      lastPingTime = new Date().toISOString();
      lastPingResult = {
        success: res.ok || res.status === 200 || res.status === 202,
        message: `IndexNow ping status: ${res.status} ${res.statusText}`,
        timestamp: lastPingTime,
        urlsPushed: urlsToSubmit.length,
      };
      console.log(`[Sitemap IndexNow] Notified search engines for ${urlsToSubmit.length} URLs (Status: ${res.status})`);
    }).catch((err) => {
      lastPingTime = new Date().toISOString();
      lastPingResult = {
        success: false,
        message: `IndexNow ping error: ${err.message}`,
        timestamp: lastPingTime,
        urlsPushed: urlsToSubmit.length,
      };
      console.warn('[Sitemap IndexNow] Ping warning:', err.message);
    });

    return {
      success: true,
      urlsSubmitted: urlsToSubmit,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn('[Sitemap Ping] Notification dispatch failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Invalidate sitemap cache immediately upon tool/article additions, updates, or deletions
 * Automatically triggers background regeneration and search engine pinging
 */
export function invalidateSitemapCache(triggerInfo?: { type?: string; slug?: string; action?: string; host?: string }) {
  sitemapCache = null;
  sitemapVersion++;
  console.log(`[Sitemap] Invalidation triggered by ${triggerInfo?.type || 'entity'} (${triggerInfo?.action || 'update'}): ${triggerInfo?.slug || ''}. Version incremented to ${sitemapVersion}`);

  // Background regeneration & disk write
  setTimeout(async () => {
    try {
      const { xml } = await generateSitemapXml(triggerInfo?.host, true);
      syncSitemapToDisk(xml);

      if (triggerInfo?.slug && triggerInfo?.type) {
        const path = triggerInfo.type === 'tool' ? `/tools/${triggerInfo.slug}`
          : triggerInfo.type === 'article' ? `/articles/${triggerInfo.slug}`
          : triggerInfo.type === 'category' ? `/categories/${triggerInfo.slug}`
          : triggerInfo.type === 'comparison' ? `/comparisons/${triggerInfo.slug}`
          : `/${triggerInfo.slug}`;
        notifySearchEngines([path], triggerInfo.host);
      }
    } catch (e: any) {
      console.error('[Sitemap] Background regeneration error:', e.message);
    }
  }, 50);
}

/**
 * Returns live status of the sitemap engine for admin monitoring
 */
export function getSitemapStatus() {
  return {
    version: sitemapVersion,
    isCached: !!sitemapCache,
    lastGenerated: sitemapCache?.generatedAt || null,
    latestLastMod: sitemapCache?.latestLastMod || null,
    totalUrls: sitemapCache?.count || 0,
    breakdown: sitemapCache?.summary.breakdown || null,
    lastPingTime,
    lastPingResult,
    indexNowKey: INDEXNOW_KEY,
  };
}

/**
 * Fetch all sitemap items from database and generate structured entries
 */
export async function getSitemapEntries(hostHeader?: string): Promise<{ 
  entries: SitemapUrlEntry[]; 
  summary: SitemapSummary; 
  latestLastMod: Date;
}> {
  const baseUrl = getBaseUrl(hostHeader);
  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];
  let maxTimestamp = 0;

  const toolEntries: SitemapUrlEntry[] = [];
  const categoryEntries: SitemapUrlEntry[] = [];
  const articleEntries: SitemapUrlEntry[] = [];
  const comparisonEntries: SitemapUrlEntry[] = [];
  const tutorialEntries: SitemapUrlEntry[] = [];
  const reviewEntries: SitemapUrlEntry[] = [];

  try {
    const [toolsRes, categoriesRes, articlesRes, comparisonsRes, tutorialsRes, reviewsRes] = await Promise.all([
      query(`
        SELECT name, slug, logo_url, cover_image_url, og_image_url, canonical_url, COALESCE(last_updated, created_at) AS updated_date 
        FROM tools 
        WHERE status = 'published'
        ORDER BY updated_date DESC, rating DESC
      `),
      query(`
        SELECT name, slug, COALESCE(updated_at, created_at) AS updated_date 
        FROM categories 
        ORDER BY display_order ASC, name ASC
      `),
      query(`
        SELECT title, slug, cover_image_url, og_image_url, canonical_url, COALESCE(published_at, created_at) AS updated_date 
        FROM articles 
        ORDER BY updated_date DESC
      `),
      query(`
        SELECT title, slug, og_image_url, canonical_url, COALESCE(updated_at, created_at) AS updated_date 
        FROM comparisons 
        ORDER BY updated_date DESC
      `),
      query(`
        SELECT title, slug, cover_image_url, og_image_url, canonical_url, COALESCE(updated_at, created_at) AS updated_date 
        FROM tutorials 
        ORDER BY updated_date DESC
      `),
      query(`
        SELECT title, slug, og_image_url, canonical_url, COALESCE(updated_at, created_at) AS updated_date 
        FROM reviews 
        ORDER BY updated_date DESC
      `),
    ]);

    // 1. Published Tools with Images & Canonicals
    for (const tool of toolsRes.rows) {
      if (tool.updated_date) {
        const ts = new Date(tool.updated_date).getTime();
        if (ts > maxTimestamp) maxTimestamp = ts;
      }
      const date = tool.updated_date ? new Date(tool.updated_date).toISOString().split('T')[0] : todayIso;
      const toolLoc = tool.canonical_url && tool.canonical_url.startsWith('http') 
        ? tool.canonical_url 
        : `${baseUrl}/tools/${encodeURIComponent(tool.slug)}`;

      const images: { loc: string; title?: string }[] = [];
      if (tool.cover_image_url || tool.og_image_url || tool.logo_url) {
        images.push({
          loc: tool.cover_image_url || tool.og_image_url || tool.logo_url,
          title: tool.name,
        });
      }

      toolEntries.push({
        loc: toolLoc,
        lastmod: date,
        changefreq: 'weekly',
        priority: 0.9,
        type: 'tool',
        images: images.length > 0 ? images : undefined,
      });
    }

    // 2. Categories
    for (const cat of categoriesRes.rows) {
      if (cat.updated_date) {
        const ts = new Date(cat.updated_date).getTime();
        if (ts > maxTimestamp) maxTimestamp = ts;
      }
      const date = cat.updated_date ? new Date(cat.updated_date).toISOString().split('T')[0] : todayIso;
      categoryEntries.push({
        loc: `${baseUrl}/categories/${encodeURIComponent(cat.slug)}`,
        lastmod: date,
        changefreq: 'weekly',
        priority: 0.8,
        type: 'category',
      });
    }

    // 3. Articles & News
    for (const article of articlesRes.rows) {
      if (article.updated_date) {
        const ts = new Date(article.updated_date).getTime();
        if (ts > maxTimestamp) maxTimestamp = ts;
      }
      const date = article.updated_date ? new Date(article.updated_date).toISOString().split('T')[0] : todayIso;
      const artLoc = article.canonical_url && article.canonical_url.startsWith('http')
        ? article.canonical_url
        : `${baseUrl}/articles/${encodeURIComponent(article.slug)}`;

      const images: { loc: string; title?: string }[] = [];
      if (article.cover_image_url || article.og_image_url) {
        images.push({
          loc: article.cover_image_url || article.og_image_url,
          title: article.title,
        });
      }

      articleEntries.push({
        loc: artLoc,
        lastmod: date,
        changefreq: 'weekly',
        priority: 0.85,
        type: 'article',
        images: images.length > 0 ? images : undefined,
      });
    }

    // 4. Comparisons
    for (const comp of comparisonsRes.rows) {
      if (comp.updated_date) {
        const ts = new Date(comp.updated_date).getTime();
        if (ts > maxTimestamp) maxTimestamp = ts;
      }
      const date = comp.updated_date ? new Date(comp.updated_date).toISOString().split('T')[0] : todayIso;
      const compLoc = comp.canonical_url && comp.canonical_url.startsWith('http')
        ? comp.canonical_url
        : `${baseUrl}/comparisons/${encodeURIComponent(comp.slug)}`;

      const images: { loc: string; title?: string }[] = [];
      if (comp.og_image_url) {
        images.push({
          loc: comp.og_image_url,
          title: comp.title,
        });
      }

      comparisonEntries.push({
        loc: compLoc,
        lastmod: date,
        changefreq: 'weekly',
        priority: 0.8,
        type: 'comparison',
        images: images.length > 0 ? images : undefined,
      });
    }

    // 5. Tutorials
    for (const tut of tutorialsRes.rows) {
      if (tut.updated_date) {
        const ts = new Date(tut.updated_date).getTime();
        if (ts > maxTimestamp) maxTimestamp = ts;
      }
      const date = tut.updated_date ? new Date(tut.updated_date).toISOString().split('T')[0] : todayIso;
      const tutLoc = tut.canonical_url && tut.canonical_url.startsWith('http')
        ? tut.canonical_url
        : `${baseUrl}/tutorials/${encodeURIComponent(tut.slug)}`;

      const images: { loc: string; title?: string }[] = [];
      if (tut.cover_image_url || tut.og_image_url) {
        images.push({
          loc: tut.cover_image_url || tut.og_image_url,
          title: tut.title,
        });
      }

      tutorialEntries.push({
        loc: tutLoc,
        lastmod: date,
        changefreq: 'weekly',
        priority: 0.8,
        type: 'tutorial',
        images: images.length > 0 ? images : undefined,
      });
    }

    // 6. In-depth Reviews
    for (const rev of reviewsRes.rows) {
      if (rev.updated_date) {
        const ts = new Date(rev.updated_date).getTime();
        if (ts > maxTimestamp) maxTimestamp = ts;
      }
      const date = rev.updated_date ? new Date(rev.updated_date).toISOString().split('T')[0] : todayIso;
      const revLoc = rev.canonical_url && rev.canonical_url.startsWith('http')
        ? rev.canonical_url
        : `${baseUrl}/reviews/${encodeURIComponent(rev.slug)}`;

      const images: { loc: string; title?: string }[] = [];
      if (rev.og_image_url) {
        images.push({
          loc: rev.og_image_url,
          title: rev.title,
        });
      }

      reviewEntries.push({
        loc: revLoc,
        lastmod: date,
        changefreq: 'weekly',
        priority: 0.8,
        type: 'review',
        images: images.length > 0 ? images : undefined,
      });
    }
  } catch (err: any) {
    console.error('[Sitemap] Error fetching dynamic entries from database:', err.message);
  }

  // Fallbacks if database entries were empty or unreachable
  if (toolEntries.length === 0) {
    for (const tool of DEFAULT_TOOLS) {
      toolEntries.push({
        loc: `${baseUrl}/tools/${encodeURIComponent(tool.slug)}`,
        lastmod: todayIso,
        changefreq: 'weekly',
        priority: 0.9,
        type: 'tool',
        images: tool.cover_image_url || tool.logo_url ? [{ loc: tool.cover_image_url || tool.logo_url || '', title: tool.name }] : undefined,
      });
    }
  }

  if (categoryEntries.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      categoryEntries.push({
        loc: `${baseUrl}/categories/${encodeURIComponent(cat.slug)}`,
        lastmod: todayIso,
        changefreq: 'weekly',
        priority: 0.8,
        type: 'category',
      });
    }
  }

  if (articleEntries.length === 0) {
    for (const art of DEFAULT_ARTICLES) {
      articleEntries.push({
        loc: `${baseUrl}/articles/${encodeURIComponent(art.slug)}`,
        lastmod: todayIso,
        changefreq: 'weekly',
        priority: 0.85,
        type: 'article',
        images: art.cover_image_url ? [{ loc: art.cover_image_url, title: art.title }] : undefined,
      });
    }
  }

  if (comparisonEntries.length === 0) {
    for (const comp of DEFAULT_COMPARISONS) {
      comparisonEntries.push({
        loc: `${baseUrl}/comparisons/${encodeURIComponent(comp.slug)}`,
        lastmod: todayIso,
        changefreq: 'weekly',
        priority: 0.8,
        type: 'comparison',
      });
    }
  }

  if (tutorialEntries.length === 0) {
    for (const tut of DEFAULT_TUTORIALS) {
      tutorialEntries.push({
        loc: `${baseUrl}/tutorials/${encodeURIComponent(tut.slug)}`,
        lastmod: todayIso,
        changefreq: 'weekly',
        priority: 0.8,
        type: 'tutorial',
      });
    }
  }

  if (reviewEntries.length === 0) {
    for (const rev of DEFAULT_REVIEWS) {
      reviewEntries.push({
        loc: `${baseUrl}/reviews/${encodeURIComponent(rev.slug)}`,
        lastmod: todayIso,
        changefreq: 'weekly',
        priority: 0.8,
        type: 'review',
      });
    }
  }

  const latestDateIso = maxTimestamp > 0 ? new Date(maxTimestamp).toISOString().split('T')[0] : todayIso;
  const latestLastMod = maxTimestamp > 0 ? new Date(maxTimestamp) : now;

  // Core Static & Hub Routes (lastmod reflects latest content freshness)
  const staticEntries: SitemapUrlEntry[] = [
    { loc: `${baseUrl}/`, priority: 1.0, changefreq: 'daily', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/ai-tools`, priority: 0.95, changefreq: 'daily', lastmod: latestDateIso, type: 'static' },
    { 
      loc: `${baseUrl}/ecommerce`, 
      priority: 0.95, 
      changefreq: 'daily', 
      lastmod: latestDateIso, 
      type: 'static',
      images: [{ loc: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80', title: 'دليل ومقارنة منصات التجارة الإلكترونية والتسويق بالعمولة 2026' }]
    },
    { loc: `${baseUrl}/categories`, priority: 0.85, changefreq: 'weekly', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/advisor`, priority: 0.9, changefreq: 'daily', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/prompts`, priority: 0.9, changefreq: 'daily', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/stacks`, priority: 0.85, changefreq: 'weekly', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/alternatives`, priority: 0.9, changefreq: 'daily', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/calculator`, priority: 0.8, changefreq: 'monthly', lastmod: todayIso, type: 'static' },
    { loc: `${baseUrl}/comparisons`, priority: 0.9, changefreq: 'daily', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/reviews`, priority: 0.85, changefreq: 'weekly', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/articles`, priority: 0.85, changefreq: 'weekly', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/tutorials`, priority: 0.85, changefreq: 'weekly', lastmod: latestDateIso, type: 'static' },
    { loc: `${baseUrl}/resources`, priority: 0.75, changefreq: 'weekly', lastmod: todayIso, type: 'static' },
    { loc: `${baseUrl}/about`, priority: 0.5, changefreq: 'monthly', lastmod: todayIso, type: 'static' },
    { loc: `${baseUrl}/contact`, priority: 0.5, changefreq: 'monthly', lastmod: todayIso, type: 'static' },
    { loc: `${baseUrl}/privacy`, priority: 0.3, changefreq: 'monthly', lastmod: todayIso, type: 'static' },
    { loc: `${baseUrl}/terms`, priority: 0.3, changefreq: 'monthly', lastmod: todayIso, type: 'static' },
    { loc: `${baseUrl}/affiliate-disclosure`, priority: 0.3, changefreq: 'monthly', lastmod: todayIso, type: 'static' },
    { loc: `${baseUrl}/editorial-policy`, priority: 0.4, changefreq: 'monthly', lastmod: todayIso, type: 'static' },
  ];

  const allEntries: SitemapUrlEntry[] = [
    ...staticEntries,
    ...toolEntries,
    ...categoryEntries,
    ...articleEntries,
    ...comparisonEntries,
    ...tutorialEntries,
    ...reviewEntries,
  ];

  const summary: SitemapSummary = {
    totalUrls: allEntries.length,
    breakdown: {
      staticPages: staticEntries.length,
      tools: toolEntries.length,
      categories: categoryEntries.length,
      articles: articleEntries.length,
      comparisons: comparisonEntries.length,
      tutorials: tutorialEntries.length,
      reviews: reviewEntries.length,
    },
    generatedAt: now.toISOString(),
    latestLastMod: latestLastMod.toISOString(),
    sitemapUrl: `${baseUrl}/sitemap.xml`,
  };

  return { entries: allEntries, summary, latestLastMod };
}

/**
 * Generate a complete, Google/Bing compliant XML sitemap string with caching and ETag
 */
export async function generateSitemapXml(
  hostHeader?: string, 
  forceRefresh = false
): Promise<{ 
  xml: string; 
  count: number; 
  summary: SitemapSummary; 
  etag: string; 
  latestLastMod: Date;
}> {
  const baseUrl = getBaseUrl(hostHeader);

  // Return cached version if valid, fresh, and not forced
  if (!forceRefresh && sitemapCache && sitemapCache.baseUrl === baseUrl) {
    return {
      xml: sitemapCache.xml,
      count: sitemapCache.count,
      summary: sitemapCache.summary,
      etag: sitemapCache.etag,
      latestLastMod: sitemapCache.latestLastMod,
    };
  }

  const { entries, summary, latestLastMod } = await getSitemapEntries(hostHeader);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    if (entry.changefreq) {
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    if (entry.priority !== undefined) {
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    }
    if (entry.images && entry.images.length > 0) {
      for (const img of entry.images) {
        if (img.loc) {
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
          if (img.title) {
            xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
          }
          xml += `    </image:image>\n`;
        }
      }
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  const etag = `W/"sitemap-${entries.length}-${latestLastMod.getTime()}-v${sitemapVersion}"`;

  sitemapCache = {
    xml,
    count: entries.length,
    summary,
    generatedAt: new Date(),
    latestLastMod,
    etag,
    baseUrl,
  };

  // Sync to disk asynchronously
  syncSitemapToDisk(xml);

  return {
    xml,
    count: entries.length,
    summary,
    etag,
    latestLastMod,
  };
}
