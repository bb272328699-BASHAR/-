import { query } from '../db.ts';

export const ToolsService = {
  async getAll(params: {
    search?: string;
    category?: string;
    pricing?: string;
    filter?: 'all' | 'trending' | 'popular' | 'new';
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 12));
    const offset = (page - 1) * limit;

    const conditions: string[] = ["t.status = 'published'"];
    const values: any[] = [];
    let idx = 1;

    if (params.search && params.search.trim()) {
      conditions.push(`(t.name ILIKE $${idx} OR t.tagline ILIKE $${idx} OR t.description ILIKE $${idx})`);
      values.push(`%${params.search.trim()}%`);
      idx++;
    }

    if (params.category && params.category !== 'all') {
      conditions.push(`EXISTS (
        SELECT 1 FROM tool_categories tc 
        JOIN categories c ON tc.category_id = c.id 
        WHERE tc.tool_id = t.id AND (c.slug = $${idx} OR c.id::text = $${idx})
      )`);
      values.push(params.category);
      idx++;
    }

    if (params.pricing && params.pricing !== 'all') {
      conditions.push(`t.pricing_type ILIKE $${idx}`);
      values.push(`%${params.pricing}%`);
      idx++;
    }

    if (params.filter === 'trending') {
      conditions.push(`t.is_trending = TRUE`);
    } else if (params.filter === 'popular') {
      conditions.push(`t.is_popular = TRUE`);
    } else if (params.filter === 'new') {
      // sort by created_at
    }

    let orderBy = 't.rating DESC, t.review_count DESC';
    if (params.sort === 'newest' || params.filter === 'new') {
      orderBy = 't.created_at DESC';
    } else if (params.sort === 'rating') {
      orderBy = 't.rating DESC';
    } else if (params.sort === 'reviews') {
      orderBy = 't.review_count DESC';
    } else if (params.sort === 'name') {
      orderBy = 't.name ASC';
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM tools t ${whereClause}`;
    const totalResult = await query(countQuery, values);
    const total = parseInt(totalResult.rows[0].count, 10);

    const toolsQuery = `
      SELECT t.*, 
        COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color)) 
          FILTER (WHERE c.id IS NOT NULL), '[]') as categories
      FROM tools t
      LEFT JOIN tool_categories tc ON t.id = tc.tool_id
      LEFT JOIN categories c ON tc.category_id = c.id
      ${whereClause}
      GROUP BY t.id
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(limit, offset);
    const toolsResult = await query(toolsQuery, values);

    return {
      tools: toolsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getBySlug(slug: string) {
    const toolRes = await query(`
      SELECT t.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color)) 
          FILTER (WHERE c.id IS NOT NULL), '[]') as categories
      FROM tools t
      LEFT JOIN tool_categories tc ON t.id = tc.tool_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.slug = $1
      GROUP BY t.id
    `, [slug]);

    if (toolRes.rows.length === 0) return null;
    const tool = toolRes.rows[0];

    // Increment view count asynchronously
    query(`UPDATE tools SET view_count = view_count + 1 WHERE id = $1`, [tool.id]).catch(() => {});

    // Fetch related sub-entities
    const [features, pros, cons, pricing, faqs] = await Promise.all([
      query(`SELECT title, description, icon FROM tool_features WHERE tool_id = $1`, [tool.id]),
      query(`SELECT content FROM tool_pros WHERE tool_id = $1`, [tool.id]),
      query(`SELECT content FROM tool_cons WHERE tool_id = $1`, [tool.id]),
      query(`SELECT plan_name, price, period, features, is_popular FROM tool_pricing WHERE tool_id = $1 ORDER BY id ASC`, [tool.id]),
      query(`SELECT question, answer FROM tool_faqs WHERE tool_id = $1 ORDER BY display_order ASC`, [tool.id]),
    ]);

    // Similar tools from same category
    const similarTools = await query(`
      SELECT t.id, t.name, t.slug, t.tagline, t.logo_url, t.rating, t.review_count, t.pricing_type, t.is_verified,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) 
          FILTER (WHERE c.id IS NOT NULL), '[]') as categories
      FROM tools t
      LEFT JOIN tool_categories tc ON t.id = tc.tool_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.id != $1 AND t.status = 'published'
        AND (
          tc.category_id IN (SELECT category_id FROM tool_categories WHERE tool_id = $1)
          OR t.is_trending = TRUE
        )
      GROUP BY t.id
      ORDER BY t.rating DESC, t.review_count DESC
      LIMIT 4
    `, [tool.id]);

    // Related articles and tutorials
    const relatedArticles = await query(`
      SELECT a.id, a.slug, a.title, a.excerpt, a.cover_image_url, a.read_time, a.author_name, a.published_at
      FROM articles a
      LEFT JOIN article_categories ac ON a.id = ac.article_id
      WHERE a.title ILIKE $1 
         OR a.excerpt ILIKE $1 
         OR a.content ILIKE $1
         OR ac.category_id IN (SELECT category_id FROM tool_categories WHERE tool_id = $2)
         OR a.id IS NOT NULL
      GROUP BY a.id
      ORDER BY (CASE WHEN a.title ILIKE $1 THEN 1 ELSE 2 END), a.published_at DESC
      LIMIT 3
    `, [`%${tool.name}%`, tool.id]);

    const relatedTutorials = await query(`
      SELECT id, slug, title, excerpt, difficulty, read_time
      FROM tutorials
      WHERE tool_id = $1 OR title ILIKE $2
      LIMIT 2
    `, [tool.id, `%${tool.name}%`]);

    return {
      ...tool,
      features: features.rows,
      pros: pros.rows.map((r: any) => r.content),
      cons: cons.rows.map((r: any) => r.content),
      pricingPlans: pricing.rows,
      faqs: faqs.rows,
      similarTools: similarTools.rows,
      relatedArticles: relatedArticles.rows,
      relatedTutorials: relatedTutorials.rows,
    };
  },

  async getFeaturedCollections() {
    const [trending, popular, newest] = await Promise.all([
      query(`
        SELECT t.*, 
          COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color)) 
            FILTER (WHERE c.id IS NOT NULL), '[]') as categories
        FROM tools t
        LEFT JOIN tool_categories tc ON t.id = tc.tool_id
        LEFT JOIN categories c ON tc.category_id = c.id
        WHERE t.status = 'published' AND (t.is_trending = TRUE OR t.is_featured = TRUE)
        GROUP BY t.id
        ORDER BY t.rating DESC
        LIMIT 6
      `),
      query(`
        SELECT t.*, 
          COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color)) 
            FILTER (WHERE c.id IS NOT NULL), '[]') as categories
        FROM tools t
        LEFT JOIN tool_categories tc ON t.id = tc.tool_id
        LEFT JOIN categories c ON tc.category_id = c.id
        WHERE t.status = 'published' AND t.is_popular = TRUE
        GROUP BY t.id
        ORDER BY t.review_count DESC
        LIMIT 6
      `),
      query(`
        SELECT t.*, 
          COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color)) 
            FILTER (WHERE c.id IS NOT NULL), '[]') as categories
        FROM tools t
        LEFT JOIN tool_categories tc ON t.id = tc.tool_id
        LEFT JOIN categories c ON tc.category_id = c.id
        WHERE t.status = 'published'
        GROUP BY t.id
        ORDER BY t.created_at DESC
        LIMIT 6
      `),
    ]);

    return {
      trending: trending.rows,
      popular: popular.rows,
      newest: newest.rows,
    };
  }
};
