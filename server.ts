import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './src/server/schema.ts';
import { runExpansion } from './src/server/expansion.ts';
import { publicRouter } from './src/server/publicRoutes.ts';
import { adminRouter } from './src/server/adminRoutes.ts';
import { query } from './src/server/db.ts';
import { generateSitemapXml, INDEXNOW_KEY } from './src/server/services/sitemapService.ts';
import { generateRssFeed, prerenderSeoHtml, generateSeoAuditReport } from './src/server/services/seoService.ts';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(compression());
  app.use(cors());
  app.use(express.json());

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check
  app.get('/api/health', async (req, res) => {
    try {
      const dbRes = await query('SELECT NOW() as now');
      res.json({ status: 'ok', time: dbRes.rows[0].now, database: 'PostgreSQL Connected' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Dynamic robots.txt with specialized directives for Googlebot, Bingbot, etc.
  app.get('/robots.txt', (req, res) => {
    let host = req.get('host') || 'ai-toolsar.netlify.app';
    if (host.includes('run.app') || host.includes('localhost') || host.includes('127.0.0.1')) {
      host = 'ai-toolsar.netlify.app';
    }
    const protocol = 'https';
    const robots = `# ====================================================================
# robots.txt for Daleel AI - دليل الذكاء الاصطناعي
# ====================================================================

User-agent: Googlebot
Allow: /
Allow: /ai-tools
Allow: /ecommerce
Allow: /tools/
Allow: /categories/
Allow: /articles/
Allow: /comparisons/
Allow: /reviews/
Allow: /tutorials/
Allow: /prompts
Allow: /stacks
Allow: /alternatives
Allow: /calculator
Allow: /advisor
Disallow: /admin
Disallow: /api/admin/
Disallow: /tools/?*status=unpublished
Disallow: /*?*status=unpublished
Disallow: /*?*unpublished=1

User-agent: Google-InspectionTool
Allow: /

User-agent: Googlebot-Image
Allow: /
Allow: /assets/

User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /api/admin/

User-agent: Applebot
Allow: /
Disallow: /admin

User-agent: Baiduspider
Allow: /
Disallow: /admin

User-agent: GPTBot
Allow: /
Disallow: /admin
Disallow: /api/admin/

User-agent: ClaudeBot
Allow: /
Disallow: /admin

User-agent: PerplexityBot
Allow: /
Disallow: /admin

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

# Dynamic XML Sitemaps
Sitemap: ${protocol}://${host}/sitemap.xml
`;
    res.type('text/plain; charset=utf-8').send(robots);
  });

  // OpenSearch XML description for browser & search integration
  app.get('/opensearch.xml', (req, res) => {
    const host = req.get('host') || 'daleel.ai';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const opensearchXml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>دليل الذكاء الاصطناعي</ShortName>
  <Description>محرك بحث متكامل لاكتشاف ومقارنة أدوات الذكاء الاصطناعي والمقالات المتخصصة</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <OutputEncoding>UTF-8</OutputEncoding>
  <Image width="16" height="16" type="image/x-icon">${baseUrl}/favicon.ico</Image>
  <Url type="text/html" method="get" template="${baseUrl}/ai-tools?search={searchTerms}" />
  <Url type="application/x-suggestions+json" method="get" template="${baseUrl}/api/search/suggestions?q={searchTerms}" />
  <Language>ar</Language>
  <moz:SearchForm>${baseUrl}/ai-tools</moz:SearchForm>
</OpenSearchDescription>`;

    res.setHeader('Content-Type', 'application/opensearchdescription+xml; charset=utf-8');
    res.send(opensearchXml);
  });

  // Dynamic sitemap.xml automatically generated, cached, and synced to live DB
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const host = req.get('host');
      const forceRefresh = req.query.refresh === 'true';
      const { xml, etag, latestLastMod } = await generateSitemapXml(host, forceRefresh);
      
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.setHeader('ETag', etag);
      res.setHeader('Last-Modified', latestLastMod.toUTCString());

      const ifNoneMatch = req.headers['if-none-match'];
      const ifModifiedSince = req.headers['if-modified-since'];

      if (ifNoneMatch && ifNoneMatch === etag) {
        return res.status(304).end();
      }

      if (ifModifiedSince) {
        const clientDate = new Date(ifModifiedSince).getTime();
        if (Math.floor(clientDate / 1000) >= Math.floor(latestLastMod.getTime() / 1000)) {
          return res.status(304).end();
        }
      }

      res.send(xml);
    } catch (e: any) {
      console.error('Error serving sitemap.xml:', e);
      res.status(500).type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><error>Could not generate sitemap</error>');
    }
  });

  // IndexNow Protocol Key Verification Route (Bing, Yandex, Seznam, Naver)
  app.get([`/${INDEXNOW_KEY}.txt`, '/daleelai2026indexnowkey.txt'], (req, res) => {
    res.type('text/plain; charset=utf-8').send(INDEXNOW_KEY);
  });

  // Dynamic RSS 2.0 / Atom Syndication Feed for Google, Bing & News Crawlers
  app.get(['/feed.xml', '/rss.xml', '/feed', '/rss'], async (req, res) => {
    try {
      const host = req.get('host');
      const rssXml = await generateRssFeed(host);
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');
      res.send(rssXml);
    } catch (e: any) {
      console.error('Error serving RSS feed:', e);
      res.status(500).type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><error>Could not generate RSS feed</error>');
    }
  });

  // SEO Health & Performance Audit Endpoint
  app.get('/api/seo/audit', async (req, res) => {
    try {
      const host = req.get('host');
      const audit = await generateSeoAuditReport(host);
      res.json(audit);
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to generate SEO audit report' });
    }
  });

  // Dynamic ads.txt for Google AdSense compliance & crawler verification
  app.get('/ads.txt', async (req, res) => {
    try {
      const pubRes = await query(`SELECT value FROM site_settings WHERE key = 'ads_publisher_id' LIMIT 1`);
      let pubId = pubRes.rows[0]?.value?.trim() || '';
      pubId = pubId.replace(/^ca-/, '');
      if (pubId && !pubId.startsWith('pub-')) {
        pubId = `pub-${pubId}`;
      }
      if (!pubId || pubId === 'pub-0000000000000000') {
        pubId = 'pub-6343594295307676';
      }
      const adsTxt = `# Google AdSense Authorized Digital Sellers (ads.txt) for Daleel AI
google.com, ${pubId}, DIRECT, f08c47fec0942fa0
`;
      res.type('text/plain; charset=utf-8').send(adsTxt);
    } catch (e: any) {
      res.type('text/plain; charset=utf-8').send('google.com, pub-6343594295307676, DIRECT, f08c47fec0942fa0\n');
    }
  });

  // Google Site Verification Endpoint
  app.get(['/googlee3e12ead0bc93607.html', '/googlee3e12ead0bc93607'], (req, res) => {
    res.type('text/html; charset=utf-8').send('google-site-verification: googlee3e12ead0bc93607.html');
  });

  // Subdomain & Owner Verification Endpoints
  app.get(['/1abfaf47224a861afca6a8db64f5d8b8', '/1abfaf47224a861afca6a8db64f5d8b8.html', '/1abfaf47224a861afca6a8db64f5d8b8.txt', '/subdomain-owner-verification', '/subdomain-owner-verification.html', '/subdomain-owner-verification.txt'], (req, res) => {
    res.setHeader('subdomain-owner-verification', '1abfaf47224a861afca6a8db64f5d8b8');
    if (req.path.endsWith('.html')) {
      res.type('text/html; charset=utf-8').send('<!DOCTYPE html><html><head><meta name="subdomain-owner-verification" content="1abfaf47224a861afca6a8db64f5d8b8" /></head><body>subdomain-owner-verification: 1abfaf47224a861afca6a8db64f5d8b8</body></html>');
    } else {
      res.type('text/plain; charset=utf-8').send('subdomain-owner-verification: 1abfaf47224a861afca6a8db64f5d8b8\n1abfaf47224a861afca6a8db64f5d8b8\n');
    }
  });

  // DNS Nameservers Endpoints
  app.get(['/nameservers.txt', '/dns.txt', '/ns.txt'], (req, res) => {
    res.type('text/plain; charset=utf-8').send('dns1.p05.nsone.net\ndns2.p05.nsone.net\ndns3.p05.nsone.net\ndns4.p05.nsone.net\n');
  });

  // Project ZIP Archive Download Endpoint
  app.get(['/daleel_ai_complete_project.zip', '/download-project-zip'], (req, res) => {
    const zipPath = path.join(process.cwd(), 'daleel_ai_complete_project.zip');
    res.download(zipPath, 'daleel_ai_complete_project.zip', (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ error: 'Zip file not found' });
      }
    });
  });

  // REST API Routes
  app.use('/api', publicRouter);
  app.use('/api/admin', adminRouter);

  // Initialize DB Schema & Seeds
  try {
    await initDatabase();
    await runExpansion();
  } catch (err) {
    console.error('Database initialization warning/error:', err);
  }

  // Vite middleware for development vs static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexHtmlPath = path.join(distPath, 'index.html');
    let cachedTemplate = '';

    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (filePath.match(/\.(js|css|woff2?|eot|ttf|otf)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
        }
      }
    }));
    app.get('*', async (req: Request, res: Response) => {
      try {
        if (!cachedTemplate && fs.existsSync(indexHtmlPath)) {
          cachedTemplate = fs.readFileSync(indexHtmlPath, 'utf-8');
        }
        if (cachedTemplate) {
          const host = req.get('host');
          const renderedHtml = await prerenderSeoHtml(cachedTemplate, req.path, host);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(renderedHtml);
        }
      } catch (err) {
        console.error('Error in SEO pre-rendering fallback:', err);
      }
      res.sendFile(indexHtmlPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Daleel AI platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
