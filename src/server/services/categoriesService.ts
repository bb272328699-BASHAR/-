import { query } from '../db.ts';

export const CategoriesService = {
  async getAll() {
    const res = await query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM tool_categories tc 
         JOIN tools t ON tc.tool_id = t.id 
         WHERE tc.category_id = c.id AND t.status = 'published') as tools_count,
        COALESCE(
          (SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'slug', s.slug, 'description', s.description))
           FROM categories s WHERE s.parent_id = c.id), '[]'
        ) as subcategories
      FROM categories c
      WHERE c.parent_id IS NULL
      ORDER BY c.display_order ASC, c.name ASC
    `);
    return res.rows;
  },

  async getBySlug(slug: string) {
    const catRes = await query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM tool_categories tc 
         JOIN tools t ON tc.tool_id = t.id 
         WHERE tc.category_id = c.id AND t.status = 'published') as tools_count,
        COALESCE(
          (SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'slug', s.slug, 'description', s.description))
           FROM categories s WHERE s.parent_id = c.id), '[]'
        ) as subcategories
      FROM categories c
      WHERE c.slug = $1
    `, [slug]);

    if (catRes.rows.length === 0) return null;
    const category = catRes.rows[0];

    // Tools in this category or its subcategories
    const tools = await query(`
      SELECT t.*,
        COALESCE(json_agg(json_build_object('id', cat.id, 'name', cat.name, 'slug', cat.slug, 'color', cat.color))
          FILTER (WHERE cat.id IS NOT NULL), '[]') as categories
      FROM tools t
      JOIN tool_categories tc ON t.id = tc.tool_id
      LEFT JOIN categories cat ON tc.category_id = cat.id
      WHERE (tc.category_id = $1 OR tc.category_id IN (SELECT id FROM categories WHERE parent_id = $1))
        AND t.status = 'published'
      GROUP BY t.id
      ORDER BY t.rating DESC, t.review_count DESC
    `, [category.id]);

    return {
      ...category,
      tools: tools.rows,
    };
  }
};
