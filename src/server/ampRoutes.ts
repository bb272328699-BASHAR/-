import { Router, Request, Response } from 'express';
import { query } from './db.ts';
import { getBaseUrl } from './services/sitemapService.ts';
import {
  DEFAULT_ARTICLES,
  DEFAULT_TUTORIALS,
  DEFAULT_TOOLS,
} from '../data/defaultCatalog.ts';

export const ampRouter = Router();

/**
 * Helper: Escapes HTML special characters
 */
function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Helper: Transforms standard <img> HTML tags into <amp-img> compliant tags
 */
function convertToAmpImages(contentHtml: string): string {
  if (!contentHtml) return '';
  
  // Replace <img> with <amp-img> and ensure responsive layout
  return contentHtml.replace(
    /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)\/?>/gi,
    (match, p1, src, p2) => {
      // Check if alt exists in remaining attributes
      let altMatch = match.match(/alt=["']([^"']*)["']/i);
      let altText = altMatch ? altMatch[1] : 'صورة مقال دليل الذكاء الاصطناعي';
      
      return `<amp-img src="${escapeHtml(src)}" alt="${escapeHtml(altText)}" width="800" height="450" layout="responsive" class="amp-article-img"></amp-img>`;
    }
  );
}

/**
 * Base AMP CSS Stylesheet (100% Valid AMP <style amp-custom>)
 */
const BASE_AMP_CSS = `
  :root {
    --primary: #4f46e5;
    --primary-dark: #3730a3;
    --bg-main: #f8fafc;
    --text-dark: #0f172a;
    --text-muted: #475569;
    --border: #e2e8f0;
  }
  * { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: var(--bg-main);
    color: var(--text-dark);
    margin: 0;
    padding: 0;
    line-height: 1.8;
    direction: rtl;
    text-align: right;
  }
  header.amp-header {
    background: #0f172a;
    color: #ffffff;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid var(--primary);
  }
  .amp-logo {
    font-size: 18px;
    font-weight: 900;
    color: #ffffff;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .amp-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 16px;
  }
  .amp-breadcrumb {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 12px;
  }
  .amp-breadcrumb a { color: var(--primary); text-decoration: none; }
  h1.amp-title {
    font-size: 26px;
    font-weight: 900;
    color: var(--text-dark);
    margin: 8px 0 16px 0;
    line-height: 1.3;
  }
  .amp-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border);
    padding-bottom: 16px;
    margin-bottom: 20px;
  }
  .amp-author-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    color: var(--primary-dark);
  }
  .amp-cover-wrapper {
    margin: 20px 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  .amp-content {
    font-size: 16px;
    color: #1e293b;
  }
  .amp-content h2 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 28px;
    margin-bottom: 12px;
    border-right: 4px solid var(--primary);
    padding-right: 10px;
  }
  .amp-content h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin-top: 20px;
  }
  .amp-content p {
    margin-bottom: 18px;
    font-size: 16px;
  }
  .amp-transparency-box {
    background: #e0e7ff;
    border: 1px solid #c7d2fe;
    border-radius: 12px;
    padding: 16px;
    margin: 24px 0;
    font-size: 13px;
    color: #3730a3;
  }
  .amp-transparency-box strong { font-size: 14px; }
  .amp-ad-wrapper {
    margin: 24px 0;
    text-align: center;
    background: #ffffff;
    padding: 12px;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;
  }
  .amp-footer {
    background: #0f172a;
    color: #94a3b8;
    text-align: center;
    padding: 24px 16px;
    font-size: 13px;
    margin-top: 40px;
  }
  .amp-footer a { color: #818cf8; text-decoration: none; font-weight: bold; }
  .amp-btn {
    display: inline-block;
    background: var(--primary);
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px;
    margin-top: 12px;
  }
`;

/**
 * 1. AMP Article Route handler: GET /amp/articles/:slug
 */
ampRouter.get('/articles/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const baseUrl = getBaseUrl(req.get('host'));
  const canonicalUrl = `${baseUrl}/articles/${encodeURIComponent(slug)}`;
  const ampUrl = `${baseUrl}/amp/articles/${encodeURIComponent(slug)}`;

  let article: any = null;

  try {
    const dbRes = await query(
      `SELECT * FROM articles WHERE slug = $1 AND status = 'published'`,
      [slug]
    );
    if (dbRes.rows.length > 0) {
      article = dbRes.rows[0];
    }
  } catch {
    // Fallback
  }

  if (!article) {
    article = DEFAULT_ARTICLES.find(a => a.slug === slug);
  }

  if (!article) {
    return res.status(404).send('<h1>404 - المقال غير موجود</h1><p><a href="/">العودة للرئيسية</a></p>');
  }

  const title = article.title;
  const excerpt = article.excerpt || article.meta_description || 'مقال متخصص من دليل الذكاء الاصطناعي';
  const coverImage = article.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=80';
  const authorName = article.author_name || 'فريق تحرير دليل الذكاء الاصطناعي';
  const publishedDate = article.published_at || new Date().toISOString();
  const readTime = article.read_time || '5 دقائق';
  
  // Convert HTML content for AMP compliance
  const formattedContent = convertToAmpImages(article.content || `<p>${excerpt}</p>`);

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    'headline': title,
    'description': excerpt,
    'image': [coverImage],
    'datePublished': publishedDate,
    'dateModified': article.updated_at || publishedDate,
    'author': {
      '@type': 'Person',
      'name': authorName,
      'jobTitle': 'محرر خبير بالذكاء الاصطناعي',
      'worksFor': {
        '@type': 'Organization',
        'name': 'دليل الذكاء الاصطناعي',
        'url': baseUrl
      }
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'دليل الذكاء الاصطناعي',
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/logo.png`
      }
    }
  };

  const ampHtml = `<!doctype html>
<html ⚡ lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} | AMP - دليل الذكاء الاصطناعي</title>
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${escapeHtml(excerpt)}">
  
  <!-- AMP Boilerplate Scripts -->
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>
  
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  
  <!-- Custom AMP Stylesheet -->
  <style amp-custom>
    ${BASE_AMP_CSS}
  </style>

  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(schemaJsonLd)}
  </script>
</head>
<body>

  <!-- AMP Header Navigation -->
  <header class="amp-header">
    <a href="${baseUrl}" class="amp-logo">
      <span>⚡ دليل الذكاء الاصطناعي (AMP)</span>
    </a>
    <a href="${canonicalUrl}" class="amp-btn">النسخة الكاملة</a>
  </header>

  <main class="amp-container">
    <div class="amp-breadcrumb">
      <a href="${baseUrl}">الرئيسية</a> &gt; <a href="${baseUrl}/articles">المقالات</a> &gt; <span>${escapeHtml(title)}</span>
    </div>

    <h1 class="amp-title">${escapeHtml(title)}</h1>

    <div class="amp-meta">
      <span class="amp-author-badge">✍️ ${escapeHtml(authorName)}</span>
      <span>📅 ${new Date(publishedDate).toLocaleDateString('ar-EG')}</span>
      <span>⏱️ وقت القراءة: ${escapeHtml(readTime)}</span>
    </div>

    <!-- AMP Cover Image -->
    <div class="amp-cover-wrapper">
      <amp-img src="${coverImage}" width="1200" height="630" layout="responsive" alt="${escapeHtml(title)}"></amp-img>
    </div>

    <!-- Google AdSense AMP Ad Slot Top -->
    <div class="amp-ad-wrapper">
      <amp-ad width="300" height="250"
          type="adsense"
          data-ad-client="ca-pub-6343594295307676"
          data-ad-slot="1234567890">
      </amp-ad>
    </div>

    <!-- Article Content -->
    <article class="amp-content">
      ${formattedContent}
    </article>

    <!-- Transparency & Editorial Policy Box (E-E-A-T) -->
    <div class="amp-transparency-box">
      <strong>🛡️ مراجعة الشفافية وضمان الجودة (E-E-A-T):</strong><br>
      تمت مراجعة هذا المقال وتدقيقه يدوياً من قبل الفريق التحريري في دليل الذكاء الاصطناعي لضمان الحقيقة العلمية والمحيادية.
    </div>

    <!-- Google AdSense AMP Ad Slot Bottom -->
    <div class="amp-ad-wrapper">
      <amp-ad width="336" height="280"
          type="adsense"
          data-ad-client="ca-pub-6343594295307676"
          data-ad-slot="0987654321">
      </amp-ad>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${canonicalUrl}" class="amp-btn">الانتقال للنسخة التفاعلية الكاملة للمقال</a>
    </div>
  </main>

  <footer class="amp-footer">
    <p>© 2026 جميع الحقوق محفوظة - <a href="${baseUrl}">دليل الذكاء الاصطناعي</a> (نسخة AMP الفورية)</p>
  </footer>

</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
  return res.send(ampHtml);
});

/**
 * 2. AMP Tutorial Route handler: GET /amp/tutorials/:slug
 */
ampRouter.get('/tutorials/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const baseUrl = getBaseUrl(req.get('host'));
  const canonicalUrl = `${baseUrl}/tutorials/${encodeURIComponent(slug)}`;

  let tutorial: any = null;

  try {
    const dbRes = await query(
      `SELECT * FROM tutorials WHERE slug = $1 AND status = 'published'`,
      [slug]
    );
    if (dbRes.rows.length > 0) {
      tutorial = dbRes.rows[0];
    }
  } catch {
    // Fallback
  }

  if (!tutorial) {
    tutorial = DEFAULT_TUTORIALS.find(t => t.slug === slug);
  }

  if (!tutorial) {
    return res.status(404).send('<h1>404 - الشرح التعليمي غير موجود</h1><p><a href="/">العودة للرئيسية</a></p>');
  }

  const title = tutorial.title;
  const excerpt = tutorial.excerpt || tutorial.description || 'شرح تعليمي خطوة بخطوة من دليل الذكاء الاصطناعي';
  const coverImage = tutorial.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&auto=format&fit=crop&q=80';
  const authorName = tutorial.author_name || 'فريق شروحات دليل الذكاء الاصطناعي';
  const publishedDate = tutorial.published_at || new Date().toISOString();
  
  const formattedContent = convertToAmpImages(tutorial.content || `<p>${excerpt}</p>`);

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    'headline': title,
    'description': excerpt,
    'image': [coverImage],
    'datePublished': publishedDate,
    'author': {
      '@type': 'Person',
      'name': authorName
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'دليل الذكاء الاصطناعي',
      'url': baseUrl
    }
  };

  const ampHtml = `<!doctype html>
<html ⚡ lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} | AMP - دليل الذكاء الاصطناعي</title>
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${escapeHtml(excerpt)}">
  
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>
  
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  
  <style amp-custom>
    ${BASE_AMP_CSS}
  </style>

  <script type="application/ld+json">
    ${JSON.stringify(schemaJsonLd)}
  </script>
</head>
<body>

  <header class="amp-header">
    <a href="${baseUrl}" class="amp-logo">
      <span>⚡ شروحات الذكاء الاصطناعي (AMP)</span>
    </a>
    <a href="${canonicalUrl}" class="amp-btn">النسخة التفاعلية</a>
  </header>

  <main class="amp-container">
    <div class="amp-breadcrumb">
      <a href="${baseUrl}">الرئيسية</a> &gt; <a href="${baseUrl}/tutorials">الشروحات</a> &gt; <span>${escapeHtml(title)}</span>
    </div>

    <h1 class="amp-title">${escapeHtml(title)}</h1>

    <div class="amp-meta">
      <span class="amp-author-badge">🎓 ${escapeHtml(authorName)}</span>
      <span>📅 ${new Date(publishedDate).toLocaleDateString('ar-EG')}</span>
    </div>

    <div class="amp-cover-wrapper">
      <amp-img src="${coverImage}" width="1200" height="630" layout="responsive" alt="${escapeHtml(title)}"></amp-img>
    </div>

    <div class="amp-ad-wrapper">
      <amp-ad width="300" height="250"
          type="adsense"
          data-ad-client="ca-pub-6343594295307676"
          data-ad-slot="1234567890">
      </amp-ad>
    </div>

    <article class="amp-content">
      ${formattedContent}
    </article>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${canonicalUrl}" class="amp-btn">الانتقال للنسخة التفاعلية الكاملة</a>
    </div>
  </main>

  <footer class="amp-footer">
    <p>© 2026 جميع الحقوق محفوظة - <a href="${baseUrl}">دليل الذكاء الاصطناعي</a> (نسخة AMP الفورية)</p>
  </footer>

</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
  return res.send(ampHtml);
});
