import { query } from '../db.ts';

export const ContentService = {
  // Reviews
  async getReviews() {
    const res = await query(`
      SELECT r.*, t.name as tool_name, t.logo_url as tool_logo, t.slug as tool_slug, t.rating as tool_rating
      FROM reviews r
      LEFT JOIN tools t ON r.tool_id = t.id
      ORDER BY r.created_at DESC
    `);
    return res.rows;
  },

  async getReviewBySlug(slug: string) {
    const res = await query(`
      SELECT r.*, t.name as tool_name, t.logo_url as tool_logo, t.slug as tool_slug, t.website_url as tool_website, t.pricing_type as tool_pricing
      FROM reviews r
      LEFT JOIN tools t ON r.tool_id = t.id
      WHERE r.slug = $1
    `, [slug]);
    return res.rows[0] || null;
  },

  // Comparisons
  async getComparisons() {
    const res = await query(`
      SELECT c.*, 
        json_agg(json_build_object(
          'id', t.id, 'name', t.name, 'slug', t.slug, 'logo_url', t.logo_url, 
          'rating', t.rating, 'pricing_type', t.pricing_type, 'is_winner', ct.is_winner
        )) as tools
      FROM comparisons c
      LEFT JOIN comparison_tools ct ON c.id = ct.comparison_id
      LEFT JOIN tools t ON ct.tool_id = t.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return res.rows;
  },

  async getComparisonBySlug(slug: string) {
    const res = await query(`
      SELECT c.*, 
        json_agg(json_build_object(
          'id', t.id, 'name', t.name, 'slug', t.slug, 'logo_url', t.logo_url, 
          'tagline', t.tagline, 'rating', t.rating, 'pricing_type', t.pricing_type, 
          'starting_price', t.starting_price, 'website_url', t.website_url,
          'is_winner', ct.is_winner, 'notes', ct.notes
        )) as tools
      FROM comparisons c
      LEFT JOIN comparison_tools ct ON c.id = ct.comparison_id
      LEFT JOIN tools t ON ct.tool_id = t.id
      WHERE c.slug = $1
      GROUP BY c.id
    `, [slug]);
    return res.rows[0] || null;
  },

  // Tutorials
  async getTutorials() {
    const res = await query(`
      SELECT tu.*, t.name as tool_name, t.slug as tool_slug
      FROM tutorials tu
      LEFT JOIN tools t ON tu.tool_id = t.id
      ORDER BY tu.created_at DESC
    `);
    return res.rows;
  },

  async getTutorialBySlug(slug: string) {
    const res = await query(`
      SELECT tu.*, t.name as tool_name, t.slug as tool_slug, t.logo_url as tool_logo
      FROM tutorials tu
      LEFT JOIN tools t ON tu.tool_id = t.id
      WHERE tu.slug = $1
    `, [slug]);
    return res.rows[0] || null;
  },

  // Articles
  async getArticles() {
    const res = await query(`
      SELECT a.*, 
        COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) 
          FILTER (WHERE c.id IS NOT NULL), '[]') as categories
      FROM articles a
      LEFT JOIN article_categories ac ON a.id = ac.article_id
      LEFT JOIN categories c ON ac.category_id = c.id
      GROUP BY a.id
      ORDER BY a.published_at DESC
    `);
    return res.rows;
  },

  async getArticleBySlug(slug: string) {
    const res = await query(`
      SELECT a.*, 
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) 
          FILTER (WHERE c.id IS NOT NULL), '[]') as categories
      FROM articles a
      LEFT JOIN article_categories ac ON a.id = ac.article_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.slug = $1
      GROUP BY a.id
    `, [slug]);

    if (res.rows.length === 0) return null;
    const article = res.rows[0];

    // Find related articles (sharing category or latest relevant)
    const relatedArticlesRes = await query(`
      SELECT DISTINCT a.id, a.slug, a.title, a.excerpt, a.cover_image_url, a.read_time, a.author_name, a.published_at
      FROM articles a
      LEFT JOIN article_categories ac ON a.id = ac.article_id
      WHERE a.id != $1
        AND (
          ac.category_id IN (SELECT category_id FROM article_categories WHERE article_id = $1)
          OR a.id != $1
        )
      ORDER BY a.published_at DESC
      LIMIT 3
    `, [article.id]);

    // Find related tools (tools in categories related to the article)
    const relatedToolsRes = await query(`
      SELECT DISTINCT t.id, t.name, t.slug, t.tagline, t.logo_url, t.rating, t.pricing_type, t.is_verified, t.review_count
      FROM tools t
      LEFT JOIN tool_categories tc ON t.id = tc.tool_id
      WHERE t.status = 'published'
        AND (
          tc.category_id IN (SELECT category_id FROM article_categories WHERE article_id = $1)
          OR $2 ILIKE '%' || t.name || '%'
          OR t.is_trending = TRUE
        )
      ORDER BY t.rating DESC, t.review_count DESC
      LIMIT 4
    `, [article.id, article.title + ' ' + (article.content || '')]);

    return {
      ...article,
      relatedArticles: relatedArticlesRes.rows,
      relatedTools: relatedToolsRes.rows,
    };
  },

  // Resources
  async getResources() {
    const res = await query(`SELECT * FROM resources ORDER BY created_at DESC`);
    return res.rows;
  },

  // Unified Search across Tools, Categories, Articles, Comparisons, Tutorials, and Prompts
  async searchAll(queryStr: string) {
    const raw = queryStr.trim();
    const term = `%${raw}%`;
    const prefixTerm = `${raw}%`;

    // Also generate normalized variants for Arabic search tolerance (أ/إ/آ -> ا, ة -> ه, ى -> ي)
    const norm = raw
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '');
    const normTerm = `%${norm}%`;

    const [tools, categories, articles, comparisons, tutorials, prompts] = await Promise.all([
      query(`
        SELECT id, name, slug, tagline, logo_url, rating, review_count, pricing_type, is_verified, 'tool' as result_type 
        FROM tools 
        WHERE status = 'published' AND (
          name ILIKE $1 OR tagline ILIKE $1 OR description ILIKE $1
          OR REPLACE(REPLACE(REPLACE(name, 'أ', 'ا'), 'إ', 'ا'), 'ة', 'ه') ILIKE $3
          OR REPLACE(REPLACE(REPLACE(tagline, 'أ', 'ا'), 'إ', 'ا'), 'ة', 'ه') ILIKE $3
        )
        ORDER BY 
          (CASE 
            WHEN name ILIKE $2 THEN 1 
            WHEN name ILIKE $1 THEN 2 
            ELSE 3 
          END), 
          rating DESC
        LIMIT 10
      `, [term, prefixTerm, normTerm]),
      query(`
        SELECT id, name, slug, description, icon, color, 'category' as result_type 
        FROM categories 
        WHERE name ILIKE $1 OR description ILIKE $1
          OR REPLACE(REPLACE(name, 'أ', 'ا'), 'إ', 'ا') ILIKE $2
        LIMIT 6
      `, [term, normTerm]),
      query(`
        SELECT id, title as name, slug, excerpt as tagline, read_time, cover_image_url, 'article' as result_type 
        FROM articles 
        WHERE title ILIKE $1 OR excerpt ILIKE $1
          OR REPLACE(REPLACE(title, 'أ', 'ا'), 'إ', 'ا') ILIKE $2
        ORDER BY published_at DESC
        LIMIT 6
      `, [term, normTerm]),
      query(`
        SELECT id, title as name, slug, summary as tagline, 'comparison' as result_type 
        FROM comparisons 
        WHERE title ILIKE $1 OR summary ILIKE $1
          OR REPLACE(REPLACE(title, 'أ', 'ا'), 'إ', 'ا') ILIKE $2
        LIMIT 4
      `, [term, normTerm]),
      query(`
        SELECT id, title as name, slug, excerpt as tagline, difficulty, 'tutorial' as result_type 
        FROM tutorials 
        WHERE title ILIKE $1 OR excerpt ILIKE $1
          OR REPLACE(REPLACE(title, 'أ', 'ا'), 'إ', 'ا') ILIKE $2
        LIMIT 4
      `, [term, normTerm]),
      query(`
        SELECT id, name, slug, tagline, rating, 'tool' as result_type
        FROM tools
        WHERE status = 'published' AND (arabic_support = TRUE OR is_trending = TRUE)
        LIMIT 2
      `)
    ]);

    return {
      tools: tools.rows,
      categories: categories.rows,
      articles: articles.rows,
      comparisons: comparisons.rows,
      tutorials: tutorials.rows,
      totalMatches: (tools.rowCount || 0) + (categories.rowCount || 0) + (articles.rowCount || 0) + (comparisons.rowCount || 0) + (tutorials.rowCount || 0),
    };
  },

  // Real-time Search Auto-suggestions for instant typing feedback
  async getSuggestions(queryStr: string) {
    const trimmed = (queryStr || '').trim();
    if (!trimmed) {
      // Return popular/trending suggestions
      const [trendingTools, topArticles, topCategories, topComparisons] = await Promise.all([
        query(`
          SELECT id, name, slug, tagline, logo_url, rating, pricing_type, is_verified 
          FROM tools WHERE status = 'published' 
          ORDER BY is_trending DESC, rating DESC 
          LIMIT 6
        `),
        query(`
          SELECT id, title, slug, read_time, cover_image_url 
          FROM articles 
          ORDER BY published_at DESC 
          LIMIT 4
        `),
        query(`
          SELECT id, name, slug 
          FROM categories 
          ORDER BY tool_count DESC 
          LIMIT 6
        `),
        query(`
          SELECT id, title, slug, tool_a_name, tool_b_name
          FROM comparisons
          LIMIT 3
        `)
      ]);

      return {
        query: '',
        suggestions: [
          'ChatGPT', 
          'Midjourney', 
          'Claude 3.5', 
          'توليد الصور', 
          'البرمجة والأكواد', 
          'كتابة المحتوى', 
          'Gemini',
          'DeepSeek',
          'Cursor AI'
        ],
        tools: trendingTools.rows,
        articles: topArticles.rows,
        categories: topCategories.rows,
        comparisons: topComparisons.rows,
      };
    }

    const term = `%${trimmed}%`;
    const prefixTerm = `${trimmed}%`;
    const norm = trimmed
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '');
    const normTerm = `%${norm}%`;

    const [toolsRes, articlesRes, categoriesRes, comparisonsRes, tutorialsRes] = await Promise.all([
      query(`
        SELECT id, name, slug, tagline, logo_url, rating, review_count, pricing_type, is_verified
        FROM tools 
        WHERE status = 'published' AND (
          name ILIKE $1 OR tagline ILIKE $1 OR description ILIKE $1
          OR REPLACE(REPLACE(name, 'أ', 'ا'), 'إ', 'ا') ILIKE $3
        )
        ORDER BY 
          CASE 
            WHEN name ILIKE $2 THEN 1
            WHEN name ILIKE $1 THEN 2
            ELSE 3
          END,
          rating DESC
        LIMIT 6
      `, [term, prefixTerm, normTerm]),
      query(`
        SELECT id, title, slug, excerpt, read_time, cover_image_url
        FROM articles 
        WHERE title ILIKE $1 OR excerpt ILIKE $1
          OR REPLACE(REPLACE(title, 'أ', 'ا'), 'إ', 'ا') ILIKE $3
        ORDER BY 
          CASE 
            WHEN title ILIKE $2 THEN 1
            WHEN title ILIKE $1 THEN 2
            ELSE 3
          END,
          published_at DESC
        LIMIT 4
      `, [term, prefixTerm, normTerm]),
      query(`
        SELECT id, name, slug
        FROM categories 
        WHERE name ILIKE $1
          OR REPLACE(REPLACE(name, 'أ', 'ا'), 'إ', 'ا') ILIKE $3
        ORDER BY 
          CASE 
            WHEN name ILIKE $2 THEN 1
            ELSE 2
          END
        LIMIT 4
      `, [term, prefixTerm, normTerm]),
      query(`
        SELECT id, title, slug, summary, tool_a_name, tool_b_name
        FROM comparisons
        WHERE title ILIKE $1 OR summary ILIKE $1
        LIMIT 3
      `, [term]),
      query(`
        SELECT id, title, slug, difficulty, read_time
        FROM tutorials
        WHERE title ILIKE $1 OR excerpt ILIKE $1
        LIMIT 3
      `, [term])
    ]);

    // Build unique suggestion phrases
    const suggestionPhrases = new Set<string>();
    toolsRes.rows.forEach(t => suggestionPhrases.add(t.name));
    categoriesRes.rows.forEach(c => suggestionPhrases.add(c.name));
    articlesRes.rows.forEach(a => suggestionPhrases.add(a.title));
    comparisonsRes.rows.forEach(cp => suggestionPhrases.add(cp.title));

    return {
      query: trimmed,
      suggestions: Array.from(suggestionPhrases).slice(0, 8),
      tools: toolsRes.rows,
      articles: articlesRes.rows,
      categories: categoriesRes.rows,
      comparisons: comparisonsRes.rows,
      tutorials: tutorialsRes.rows,
    };
  },

  // Site Settings & Metadata
  async getSiteSettings() {
    const res = await query(`SELECT key, value FROM site_settings`);
    const settings: Record<string, string> = {};
    for (const r of res.rows) {
      settings[r.key] = r.value;
    }
    return settings;
  },

  async getSeoForPath(path: string) {
    const res = await query(`SELECT * FROM seo_metadata WHERE page_path = $1`, [path]);
    return res.rows[0] || null;
  }
};
