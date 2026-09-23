import fs from 'fs';
import path from 'path';
import { query } from '../server/db.ts';

export interface SitemapGenerateOptions {
  domain?: string;
  outputDir?: string;
  silent?: boolean;
}

export interface SitemapResult {
  success: boolean;
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
  outputPath: string;
  xml: string;
}

function escapeXml(str: string): string {
  if (!str) return '';
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Core function to query PostgreSQL database and generate dynamic sitemap.xml
 */
export async function generateDynamicSitemap(options: SitemapGenerateOptions = {}): Promise<SitemapResult> {
  const domain = (options.domain || process.env.SITE_URL || 'https://ai-toolsar.netlify.app').replace(/\/$/, '');
  const nowIso = new Date().toISOString().split('T')[0];

  const breakdown = {
    staticPages: 0,
    tools: 0,
    categories: 0,
    articles: 0,
    comparisons: 0,
    tutorials: 0,
    reviews: 0,
  };

  const xmlEntries: string[] = [];

  // 1. Static Primary Pages
  const staticRoutes = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/ai-tools', priority: 0.95, changefreq: 'daily' },
    { path: '/categories', priority: 0.85, changefreq: 'weekly' },
    { path: '/articles', priority: 0.85, changefreq: 'daily' },
    { path: '/comparisons', priority: 0.85, changefreq: 'weekly' },
    { path: '/reviews', priority: 0.80, changefreq: 'weekly' },
    { path: '/tutorials', priority: 0.80, changefreq: 'weekly' },
    { path: '/prompts', priority: 0.80, changefreq: 'weekly' },
    { path: '/stacks', priority: 0.80, changefreq: 'weekly' },
    { path: '/alternatives', priority: 0.80, changefreq: 'weekly' },
    { path: '/calculator', priority: 0.75, changefreq: 'monthly' },
    { path: '/advisor', priority: 0.75, changefreq: 'weekly' },
  ];

  for (const route of staticRoutes) {
    breakdown.staticPages++;
    xmlEntries.push(`  <url>
    <loc>${escapeXml(`${domain}${route.path}`)}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(2)}</priority>
  </url>`);
  }

  // 2. Query Published Tools from PostgreSQL
  try {
    const toolsRes = await query(`
      SELECT name, slug, logo_url, cover_image_url, canonical_url, COALESCE(last_updated, created_at) AS updated_date
      FROM tools
      WHERE status = 'published'
      ORDER BY updated_date DESC
    `);

    for (const tool of toolsRes.rows) {
      breakdown.tools++;
      const lastmod = tool.updated_date ? new Date(tool.updated_date).toISOString().split('T')[0] : nowIso;
      const url = tool.canonical_url && tool.canonical_url.startsWith('http')
        ? tool.canonical_url
        : `${domain}/tools/${encodeURIComponent(tool.slug)}`;

      const imgUrl = tool.cover_image_url || tool.logo_url;
      const imgXml = imgUrl ? `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(tool.name)}</image:title>
    </image:image>` : '';

      xmlEntries.push(`  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>${imgXml}
  </url>`);
    }
  } catch (err: any) {
    if (!options.silent) console.warn('[Sitemap] PostgreSQL tools query notice:', err.message);
  }

  // 3. Query Categories from PostgreSQL
  try {
    const categoriesRes = await query(`
      SELECT name, slug, created_at AS updated_date
      FROM categories
      ORDER BY name ASC
    `);

    for (const cat of categoriesRes.rows) {
      breakdown.categories++;
      const lastmod = cat.updated_date ? new Date(cat.updated_date).toISOString().split('T')[0] : nowIso;
      const url = `${domain}/categories/${encodeURIComponent(cat.slug)}`;

      xmlEntries.push(`  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`);
    }
  } catch (err: any) {
    if (!options.silent) console.warn('[Sitemap] PostgreSQL categories query notice:', err.message);
  }

  // 4. Query Articles from PostgreSQL
  try {
    const articlesRes = await query(`
      SELECT title, slug, cover_image_url, canonical_url, COALESCE(published_at, created_at) AS updated_date
      FROM articles
      ORDER BY updated_date DESC
    `);

    for (const article of articlesRes.rows) {
      breakdown.articles++;
      const lastmod = article.updated_date ? new Date(article.updated_date).toISOString().split('T')[0] : nowIso;
      const url = article.canonical_url && article.canonical_url.startsWith('http')
        ? article.canonical_url
        : `${domain}/articles/${encodeURIComponent(article.slug)}`;

      const imgUrl = article.cover_image_url;
      const imgXml = imgUrl ? `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>` : '';

      xmlEntries.push(`  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>${imgXml}
  </url>`);
    }
  } catch (err: any) {
    if (!options.silent) console.warn('[Sitemap] PostgreSQL articles query notice:', err.message);
  }

  // 5. Query Comparisons from PostgreSQL
  try {
    const comparisonsRes = await query(`
      SELECT title, slug, canonical_url, created_at AS updated_date
      FROM comparisons
      ORDER BY created_at DESC
    `);

    for (const comp of comparisonsRes.rows) {
      breakdown.comparisons++;
      const lastmod = comp.updated_date ? new Date(comp.updated_date).toISOString().split('T')[0] : nowIso;
      const url = comp.canonical_url && comp.canonical_url.startsWith('http')
        ? comp.canonical_url
        : `${domain}/comparisons/${encodeURIComponent(comp.slug)}`;

      xmlEntries.push(`  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`);
    }
  } catch (err: any) {
    if (!options.silent) console.warn('[Sitemap] PostgreSQL comparisons query notice:', err.message);
  }

  // Combine full XML document
  const totalUrls = xmlEntries.length;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
<!-- Generated dynamically by Daleel AI Sitemap Engine at ${nowIso} -->
<!-- Total Indexable URLs: ${totalUrls} -->
${xmlEntries.join('\n')}
</urlset>`;

  // Write files to disk (public/sitemap.xml and dist/sitemap.xml)
  const rootDir = process.cwd();
  const targetPublicPath = path.join(rootDir, 'public', 'sitemap.xml');

  try {
    const publicDir = path.join(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(targetPublicPath, xml, 'utf8');

    const distDir = path.join(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
    }

    if (!options.silent) {
      console.log(`[Dynamic Sitemap] ✅ Successfully generated sitemap.xml with ${totalUrls} URLs from PostgreSQL.`);
    }
  } catch (e: any) {
    if (!options.silent) console.warn('[Dynamic Sitemap] Disk write warning:', e.message);
  }

  return {
    success: true,
    totalUrls,
    breakdown,
    outputPath: targetPublicPath,
    xml,
  };
}
