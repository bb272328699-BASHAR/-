import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ToolsService } from './services/toolsService.ts';
import { CategoriesService } from './services/categoriesService.ts';
import { ContentService } from './services/contentService.ts';
import { AiService } from './services/aiService.ts';
import { query } from './db.ts';
import { generateToken, authMiddleware, AuthRequest } from './middleware/auth.ts';
import { generateSitemapXml, getSitemapEntries } from './services/sitemapService.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'daleel-ai-super-secret-jwt-key-2026';

export const publicRouter = Router();

// Sitemap metadata & stats endpoint for SEO monitoring & indexing services
publicRouter.get('/sitemap', async (req: Request, res: Response) => {
  try {
    const host = req.get('host');
    const includeEntries = req.query.entries === 'true' || req.query.full === 'true';
    const { entries, summary } = await getSitemapEntries(host);
    
    if (req.query.format === 'xml') {
      const { xml } = await generateSitemapXml(host);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      return res.send(xml);
    }

    res.json({
      ...summary,
      entries: includeEntries ? entries : undefined,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

publicRouter.get('/seo/sitemap-stats', async (req: Request, res: Response) => {
  try {
    const host = req.get('host');
    const { summary } = await generateSitemapXml(host);
    res.json({
      status: 'active',
      sitemapUrl: '/sitemap.xml',
      totalIndexedUrls: summary.totalUrls,
      breakdown: summary.breakdown,
      updatedAt: summary.generatedAt,
      standards: 'sitemaps.org/schemas/sitemap/0.9',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tools list with filters, categories, pagination, sorting
publicRouter.get('/tools', async (req: Request, res: Response) => {
  try {
    const { search, category, pricing, filter, sort, page, limit } = req.query;
    const result = await ToolsService.getAll({
      search: search as string,
      category: category as string,
      pricing: pricing as string,
      filter: filter as any,
      sort: sort as string,
      page: Number(page) || 1,
      limit: Number(limit) || 12,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'خطأ في جلب الأدوات' });
  }
});

// Single Tool Details by Slug
publicRouter.get('/tools/:slug', async (req: Request, res: Response) => {
  try {
    const tool = await ToolsService.getBySlug(req.params.slug);
    if (!tool) {
      return res.status(404).json({ error: 'الأداة المطلوبة غير موجودة' });
    }
    res.json(tool);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Featured Collections (Trending, Popular, New) for Home
publicRouter.get('/collections/home', async (req: Request, res: Response) => {
  try {
    const data = await ToolsService.getFeaturedCollections();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories & Subcategories
publicRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const cats = await CategoriesService.getAll();
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

publicRouter.get('/categories/:slug', async (req: Request, res: Response) => {
  try {
    const cat = await CategoriesService.getBySlug(req.params.slug);
    if (!cat) {
      return res.status(404).json({ error: 'التصنيف غير موجود' });
    }
    res.json(cat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews
publicRouter.get('/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await ContentService.getReviews();
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

publicRouter.get('/reviews/:slug', async (req: Request, res: Response) => {
  try {
    const review = await ContentService.getReviewBySlug(req.params.slug);
    if (!review) return res.status(404).json({ error: 'المراجعة غير موجودة' });
    res.json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Comparisons
publicRouter.get('/comparisons', async (req: Request, res: Response) => {
  try {
    const comparisons = await ContentService.getComparisons();
    res.json(comparisons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

publicRouter.get('/comparisons/:slug', async (req: Request, res: Response) => {
  try {
    const comparison = await ContentService.getComparisonBySlug(req.params.slug);
    if (!comparison) return res.status(404).json({ error: 'المقارنة غير موجودة' });
    res.json(comparison);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tutorials
publicRouter.get('/tutorials', async (req: Request, res: Response) => {
  try {
    const tutorials = await ContentService.getTutorials();
    res.json(tutorials);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

publicRouter.get('/tutorials/:slug', async (req: Request, res: Response) => {
  try {
    const tutorial = await ContentService.getTutorialBySlug(req.params.slug);
    if (!tutorial) return res.status(404).json({ error: 'الدليل غير موجود' });
    res.json(tutorial);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Articles
publicRouter.get('/articles', async (req: Request, res: Response) => {
  try {
    const articles = await ContentService.getArticles();
    res.json(articles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

publicRouter.get('/articles/:slug', async (req: Request, res: Response) => {
  try {
    const article = await ContentService.getArticleBySlug(req.params.slug);
    if (!article) return res.status(404).json({ error: 'المقال غير موجود' });
    res.json(article);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resources
publicRouter.get('/resources', async (req: Request, res: Response) => {
  try {
    const resources = await ContentService.getResources();
    res.json(resources);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time Search Auto-suggestions
publicRouter.get('/search/suggestions', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const suggestions = await ContentService.getSuggestions(q);
    res.json(suggestions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Global Search
publicRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      return res.json({ tools: [], categories: [], articles: [], comparisons: [], tutorials: [], totalMatches: 0 });
    }
    const result = await ContentService.searchAll(q);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Global Site Settings
publicRouter.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await ContentService.getSiteSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Newsletter Subscription
publicRouter.post('/newsletter', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'الرجاء إدخال بريد إلكتروني صحيح' });
    }
    await query(`
      INSERT INTO subscribers (email) VALUES ($1)
      ON CONFLICT (email) DO NOTHING
    `, [email.toLowerCase().trim()]);

    // Update subscriber counter in site_settings
    await query(`
      UPDATE site_settings 
      SET value = (COALESCE(value::int, 14200) + 1)::text 
      WHERE key = 'newsletter_subscribers_count'
    `);
    res.json({ message: 'تم اشتراكك في النشرة الإخبارية بنجاح!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Contact Form Submission
publicRouter.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة لإرسال الرسالة' });
    }
    await query(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
    `, [name.trim(), email.toLowerCase().trim(), subject.trim(), message.trim()]);

    res.json({ success: true, message: 'شكراً لتواصلك! استلمنا رسالتك وسيرد فريق التحرير خلال 24 ساعة.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User Registration
publicRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ error: 'الرجاء إدخال اسم صحيح وبريد إلكتروني وكلمة مرور لا تقل عن 6 أحرف' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userRes = await query(`
      INSERT INTO users (email, password_hash, full_name, is_active)
      VALUES ($1, $2, $3, TRUE)
      RETURNING id, email, full_name, created_at
    `, [cleanEmail, hash, name.trim()]);

    const newUser = userRes.rows[0];

    // Assign 'member' role
    const memberRole = await query(`SELECT id FROM roles WHERE name = 'member'`);
    if (memberRole.rows[0]) {
      await query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [newUser.id, memberRole.rows[0].id]);
    }

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: 'member'
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: 'member',
        created_at: newUser.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'فشل في إنشاء الحساب' });
  }
});

// User Login
publicRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRes = await query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = $1 AND u.is_active = TRUE
    `, [cleanEmail]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'بيانات الاعتماد غير صحيحة' });
    }

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'بيانات الاعتماد غير صحيحة' });
    }

    const role = user.role_name || 'member';
    const token = generateToken({
      id: user.id,
      email: user.email,
      role
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'فشل في تسجيل الدخول' });
  }
});

// Firebase Auth Synchronizer (Google & Firebase User Bridge)
publicRouter.post('/auth/firebase-sync', async (req: Request, res: Response) => {
  try {
    const { uid, email, full_name, avatar_url } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب للمزامنة' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdminEmail = cleanEmail === 'bb272328699@gmail.com' || cleanEmail.includes('admin@daleel.ai');
    const assignedRole = isAdminEmail ? 'admin' : 'member';

    // Check if user already exists
    let existingUser = await query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = $1
    `, [cleanEmail]);

    let userObj: any;

    if (existingUser.rows.length === 0) {
      // Create user
      const inserted = await query(`
        INSERT INTO users (email, password_hash, full_name, avatar_url, is_active)
        VALUES ($1, 'firebase_oauth_account', $2, $3, TRUE)
        RETURNING id, email, full_name, avatar_url, created_at
      `, [cleanEmail, full_name || cleanEmail.split('@')[0], avatar_url || null]);

      userObj = inserted.rows[0];

      // Assign role
      const roleRow = await query(`SELECT id FROM roles WHERE name = $1`, [assignedRole]);
      if (roleRow.rows[0]) {
        await query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [userObj.id, roleRow.rows[0].id]);
      }
    } else {
      userObj = existingUser.rows[0];
      if (avatar_url && !userObj.avatar_url) {
        await query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [avatar_url, userObj.id]);
        userObj.avatar_url = avatar_url;
      }
      if (isAdminEmail && userObj.role_name !== 'admin') {
        const adminRole = await query(`SELECT id FROM roles WHERE name = 'admin'`);
        if (adminRole.rows[0]) {
          await query(`
            INSERT INTO user_roles (user_id, role_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, role_id) DO NOTHING
          `, [userObj.id, adminRole.rows[0].id]);
        }
      }
    }

    const role = isAdminEmail ? 'admin' : (userObj.role_name || assignedRole);
    const token = generateToken({
      id: userObj.id,
      email: userObj.email,
      role
    });

    res.json({
      token,
      user: {
        id: userObj.id,
        uid: uid || userObj.id,
        email: userObj.email,
        full_name: userObj.full_name,
        role,
        avatar_url: userObj.avatar_url,
        created_at: userObj.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'فشل مزامنة حساب فايربيس' });
  }
});

// Current Logged In User Profile & Stats
publicRouter.get('/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRes = await query(`
      SELECT u.id, u.email, u.full_name, u.avatar_url, u.created_at, r.name as role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
    `, [userId]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    const bookmarksCount = await query(`SELECT COUNT(*) FROM user_bookmarks WHERE user_id = $1`, [userId]);
    const reviewsCount = await query(`SELECT COUNT(*) FROM user_reviews WHERE user_id = $1`, [userId]);

    res.json({
      user: userRes.rows[0],
      bookmarksCount: parseInt(bookmarksCount.rows[0].count, 10),
      reviewsCount: parseInt(reviewsCount.rows[0].count, 10)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
publicRouter.put('/auth/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { full_name } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: 'الاسم مطلوب' });
    }

    const updated = await query(`
      UPDATE users
      SET full_name = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, full_name, avatar_url
    `, [full_name.trim(), userId]);

    res.json({ user: updated.rows[0], message: 'تم تحديث الملف الشخصي بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User Bookmarks (Favorites)
publicRouter.get('/user/bookmarks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await query(`
      SELECT t.id, t.name, t.slug, t.tagline, t.logo_url, t.pricing_type, t.rating, t.review_count, t.arabic_support, ub.created_at as saved_at
      FROM user_bookmarks ub
      JOIN tools t ON ub.tool_id = t.id
      WHERE ub.user_id = $1
      ORDER BY ub.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Bookmark
publicRouter.post('/user/bookmarks/:toolId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { toolId } = req.params;

    const existing = await query(`SELECT id FROM user_bookmarks WHERE user_id = $1 AND tool_id = $2`, [userId, toolId]);

    if (existing.rows.length > 0) {
      await query(`DELETE FROM user_bookmarks WHERE user_id = $1 AND tool_id = $2`, [userId, toolId]);
      return res.json({ bookmarked: false, message: 'تمت إزالة الأداة من المفضلة' });
    } else {
      await query(`INSERT INTO user_bookmarks (user_id, tool_id) VALUES ($1, $2)`, [userId, toolId]);
      return res.json({ bookmarked: true, message: 'تم حفظ الأداة في قائمتك المفضلة بنجاح' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check if a tool is bookmarked by current user (optional token)
publicRouter.get('/user/bookmarks/status/:toolId', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ bookmarked: false });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const check = await query(`SELECT id FROM user_bookmarks WHERE user_id = $1 AND tool_id = $2`, [decoded.id, req.params.toolId]);
    res.json({ bookmarked: check.rows.length > 0 });
  } catch {
    res.json({ bookmarked: false });
  }
});

// Get User Reviews for a Tool
publicRouter.get('/tools/:toolId/user-reviews', async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    const reviews = await query(`
      SELECT ur.id, ur.rating, ur.title, ur.comment, ur.is_verified, ur.created_at,
             u.full_name as author_name, u.avatar_url as author_avatar
      FROM user_reviews ur
      JOIN users u ON ur.user_id = u.id
      WHERE ur.tool_id = $1
      ORDER BY ur.created_at DESC
    `, [toolId]);

    res.json(reviews.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Quick Star-Rating submission for a Tool
publicRouter.post('/tools/:toolId/rate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { toolId } = req.params;
    const { rating } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'الرجاء اختيار تقييم صحيح من 1 إلى 5 نجوم' });
    }

    // Check if user already reviewed/rated this tool
    const existing = await query(`
      SELECT id FROM user_reviews WHERE user_id = $1 AND tool_id = $2
    `, [userId, toolId]);

    if (existing.rows.length > 0) {
      await query(`
        UPDATE user_reviews
        SET rating = $1, created_at = NOW()
        WHERE id = $2
      `, [numRating, existing.rows[0].id]);
    } else {
      await query(`
        INSERT INTO user_reviews (user_id, tool_id, rating, comment, is_verified)
        VALUES ($1, $2, $3, 'تقييم سريع بالنجوم', TRUE)
      `, [userId, toolId, numRating]);
    }

    // Recalculate average rating
    const statsRes = await query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM user_reviews
      WHERE tool_id = $1
    `, [toolId]);

    const avg = parseFloat(statsRes.rows[0].avg_rating || '5.0').toFixed(2);
    const count = parseInt(statsRes.rows[0].total_count || '1', 10);

    const updatedTool = await query(`
      UPDATE tools
      SET rating = $1, review_count = GREATEST(review_count, $2)
      WHERE id = $3
      RETURNING id, rating, review_count
    `, [avg, count, toolId]);

    res.json({
      success: true,
      message: 'تم تسجيل تقييمك بالنجوم بنجاح!',
      userRating: numRating,
      newRating: parseFloat(avg),
      newReviewCount: updatedTool.rows[0]?.review_count || count,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit User Review for a Tool
publicRouter.post('/tools/:toolId/user-reviews', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { toolId } = req.params;
    const { rating, title, comment } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5 || !comment || comment.trim().length < 5) {
      return res.status(400).json({ error: 'الرجاء تحديد التقييم (من 1 إلى 5) وكتابة رأي توضيحي' });
    }

    // Insert user review
    const insertRes = await query(`
      INSERT INTO user_reviews (user_id, tool_id, rating, title, comment, is_verified)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING id, rating, title, comment, created_at
    `, [userId, toolId, numRating, title || null, comment.trim()]);

    // Recalculate Tool Average Rating and Review Count
    const statsRes = await query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM user_reviews
      WHERE tool_id = $1
    `, [toolId]);

    const avg = parseFloat(statsRes.rows[0].avg_rating || '5.0').toFixed(2);
    const count = parseInt(statsRes.rows[0].total_count || '1', 10);

    const updatedTool = await query(`
      UPDATE tools
      SET rating = $1, review_count = GREATEST(review_count + 1, $2)
      WHERE id = $3
      RETURNING id, rating, review_count
    `, [avg, count, toolId]);

    const userRes = await query(`SELECT full_name, avatar_url FROM users WHERE id = $1`, [userId]);

    res.status(201).json({
      success: true,
      message: 'شكراً لك! تم نشر تقييمك ومراجعتك بنجاح.',
      newRating: parseFloat(avg),
      newReviewCount: updatedTool.rows[0]?.review_count || count,
      review: {
        ...insertRes.rows[0],
        author_name: userRes.rows[0]?.full_name,
        author_avatar: userRes.rows[0]?.avatar_url
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Community Upvote Endpoint for Tools (Supports Auth users and Guests)
publicRouter.post('/tools/:toolId/upvote', async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        userId = decoded.id;
      } catch {
        // Continue as guest
      }
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const clientAction = req.body?.action; // 'upvote' | 'unvote'

    let isUpvoted = true;

    if (userId) {
      // Check existing user upvote
      const check = await query(`SELECT id FROM tool_upvotes WHERE tool_id = $1 AND user_id = $2`, [toolId, userId]);
      if (check.rows.length > 0) {
        await query(`DELETE FROM tool_upvotes WHERE tool_id = $1 AND user_id = $2`, [toolId, userId]);
        await query(`UPDATE tools SET upvotes_count = GREATEST(0, COALESCE(upvotes_count, 0) - 1) WHERE id = $1`, [toolId]);
        isUpvoted = false;
      } else {
        await query(`INSERT INTO tool_upvotes (tool_id, user_id, ip_address) VALUES ($1, $2, $3)`, [toolId, userId, String(ip)]);
        await query(`UPDATE tools SET upvotes_count = COALESCE(upvotes_count, 0) + 1 WHERE id = $1`, [toolId]);
        isUpvoted = true;
      }
    } else {
      // Guest vote
      if (clientAction === 'unvote') {
        await query(`UPDATE tools SET upvotes_count = GREATEST(0, COALESCE(upvotes_count, 0) - 1) WHERE id = $1`, [toolId]);
        isUpvoted = false;
      } else {
        await query(`UPDATE tools SET upvotes_count = COALESCE(upvotes_count, 0) + 1 WHERE id = $1`, [toolId]);
        isUpvoted = true;
      }
    }

    const currentTool = await query(`SELECT id, upvotes_count FROM tools WHERE id = $1`, [toolId]);
    const upvotesCount = currentTool.rows[0]?.upvotes_count || 0;

    res.json({
      success: true,
      upvoted: isUpvoted,
      upvotes_count: upvotesCount,
      message: isUpvoted ? 'تم تسجيل تصويتك للأداة بنجاح!' : 'تم إلغاء التصويت للأداة'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Community Leaderboard (Top Upvoted Tools)
publicRouter.get('/tools/leaderboard/top', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 6);
    const result = await query(`
      SELECT t.*,
        COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color))
          FILTER (WHERE c.id IS NOT NULL), '[]') as categories
      FROM tools t
      LEFT JOIN tool_categories tc ON t.id = tc.tool_id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE t.status = 'published'
      GROUP BY t.id
      ORDER BY COALESCE(t.upvotes_count, 0) DESC, t.rating DESC, t.review_count DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1. AI Tool Advisor / Consultation Endpoint
publicRouter.post('/ai/advisor', async (req: Request, res: Response) => {
  try {
    const { query: userQuery, history } = req.body;
    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length < 2) {
      return res.status(400).json({ error: 'الرجاء كتابة طلب أو سؤال واضح للمستشار الذكي' });
    }

    const advice = await AiService.consultAdvisor(userQuery.trim(), history || []);
    res.json(advice);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'فشلت معالجة استشارة الذكاء الاصطناعي' });
  }
});

// 2. AI Prompt Generator Endpoint
publicRouter.post('/ai/generate-prompt', async (req: Request, res: Response) => {
  try {
    const { task, targetModel, language } = req.body;
    if (!task || typeof task !== 'string' || task.trim().length < 2) {
      return res.status(400).json({ error: 'الرجاء توضيح المهمة المطلوب صياغة برومبت احترافي لها' });
    }

    const result = await AiService.generateCustomPrompt(
      task.trim(), 
      targetModel || 'ChatGPT / Claude', 
      language || 'ar'
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'فشل توليد البرومبت' });
  }
});

// 3. Curated AI Prompt Directory
publicRouter.get('/prompts', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    
    // Comprehensive curated prompts library
    const curatedPrompts = [
      {
        id: 'p1',
        title: 'كتابة مقال متكامل متوافق مع معايير SEO',
        category: 'writing',
        categoryName: 'كتابة المحتوى والـ SEO',
        targetTool: 'ChatGPT / Claude 3.5',
        description: 'صياغة مقال تسويقي غني بالكلمات المفتاحية مع عناوين فرعية وفقرة ميتا ديسكريبشن جذابة.',
        promptTemplate: `اكتب مقالاً مفصلاً واحترافياً باللغة العربية حول موضوع: "[الموضوع المحدد]".
الكلمة المفتاحية الرئيسية: "[الكلمة المفتاحية]"
الجمهور المستهدف: "[الجمهور]"

شروط المقال:
1. عنوان رئيسي جذاب يتضمن الكلمة المفتاحية.
2. فقرة وصف الميتا (Meta Description) في حدود 150 حرف.
3. مقدمة مشوقة بنموذج PAS (المشكلة، الإثارة، الحل).
4. عناوين فرعية H2 و H3 متسلسلة منطقياً.
5. نصائح عملية قابلة للتطبيق الفوري.
6. خاتمة تحث على اتخاذ إجراء (CTA).`,
        tags: ['SEO', 'كتابة المقالات', 'تسويق المحتوى', 'مدونات'],
        likes: 342,
        isPopular: true
      },
      {
        id: 'p2',
        title: 'مراجعة أمنية وتطوير أداء الأكواد البرمجية',
        category: 'coding',
        categoryName: 'البرمجة والأكواد',
        targetTool: 'Cursor AI / GitHub Copilot',
        description: 'فحص شيفرة برمجية لاكتشاف الثغرات الأمنية، مشاكل الذاكرة، وتحسين الأداء بنسبة 100%.',
        promptTemplate: `بصفتك كبير مهندسي البرمجيات والأمان السيبراني (Principal Software Architect):
قم بمراجعة الكود البرمجي التالي المكتوب بلغة [اسم اللغة أو الإطار]:
\`\`\`[اللغة]
[ضع الكود هنا]
\`\`\`

المطلوب:
1. تحديد أي ثغرات أمنية محتملة (SQL Injection, XSS, Buffer Overflow, Auth bypass).
2. اقتراح تحسينات في التعقيد الزمني والمكاني (Time & Space Complexity).
3. إعادة كتابة الكود بشكل نظيف (Clean Code) مع معالجة الاستثناءات والتوثيق (JSDoc/TypeDocs).`,
        tags: ['Clean Code', 'الأمان', 'إصلاح الأخطاء', 'Refactoring'],
        likes: 512,
        isPopular: true
      },
      {
        id: 'p3',
        title: 'توليد صور واقعية فائقة الدقة للمنتجات',
        category: 'design',
        categoryName: 'التصميم وتوليد الصور',
        targetTool: 'Midjourney v6 / Flux',
        description: 'برومبت بصري هندسي لتوليد لقطات استوديو تجارية واقعية للمنتجات والعلامات التجارية.',
        promptTemplate: `Professional commercial studio photography of [اسم المنتج أو العنصر], luxury minimalist background, dramatic cinematic studio lighting, soft reflections, shot on Hasselblad H6D-100c, 85mm lens, f/2.8, hyper-detailed texture, 8k resolution, photorealistic, premium advertising aesthetic --ar 16:9 --v 6.0 --style raw`,
        tags: ['تصوير منتجات', 'Midjourney', 'إعلانات', 'واقعية'],
        likes: 428,
        isPopular: true
      },
      {
        id: 'p4',
        title: 'بناء خطة تسويقية ربع سنوية متكاملة لمنتج رقمي',
        category: 'marketing',
        categoryName: 'التسويق ونمو الأعمال',
        targetTool: 'ChatGPT / Gemini Advanced',
        description: 'توليد استراتيجية تسويق كاملة للقنوات الرقمية والمحتوى والمؤثرين بميزانية محددة.',
        promptTemplate: `أريدك أن تتصرف كمدير تسويق تنفيذي (CMO).
أطلقنا مؤخراً منتجاً رقمياً: "[اسم ووصف المنتج]".
الميزانية الشهرية: [الميزانية]
القنوات المفضلة: [Twitter, LinkedIn, TikTok, Google Ads]

قم بإنشاء خطة تسويق لـ 90 يوماً مقسمة لـ 3 مراحل:
1. مرحلة التوعية وجذب المهتمين (Awareness & Lead Gen).
2. مرحلة التحويل والمبيعات (Conversion & Demos).
3. مرحلة المحافظة على العملاء وتوصياتهم (Retention & Referrals).
قدم جدول محتوى أسبوعي مقترح مع مؤشرات الأداء الرئيسية (KPIs).`,
        tags: ['خطة تسويقية', 'نمو الشركات', 'استراتيجية', 'إعلانات'],
        likes: 289,
        isPopular: false
      },
      {
        id: 'p5',
        title: 'تحليل وتلخيص الأوراق البحثية والتقارير المالية',
        category: 'research',
        categoryName: 'البحث والبيانات',
        targetTool: 'Claude 3.5 / Perplexity AI',
        description: 'استخراج الأفكار الجوهرية، الأرقام الحاسمة، والاستنتاجات من أي ملف أو نص معقد.',
        promptTemplate: `قم بقراءة النص أو البحث التالي بدقة:
[الصق نص التقرير أو ملخص البحث هنا]

قم بتقديم استخلاص تنفيذي يشمل:
1. الفرضية أو المشكلة الأساسية في 3 أسطر.
2. أهم 5 إحصائيات أو نتائج رقمية مؤكدة مع دلالاتها.
3. التوصيات الاستراتيجية الواجب اتباعها بناءً على النتائج.
4. نقاط الضعف أو القيود المذكورة في الدراسة.`,
        tags: ['أبحاث', 'تحليل مالي', 'تلخيص كتب', 'بيانات'],
        likes: 195,
        isPopular: false
      }
    ];

    let filtered = curatedPrompts;
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    res.json({
      total: filtered.length,
      prompts: filtered,
      categories: [
        { id: 'all', name: 'الكل' },
        { id: 'writing', name: 'كتابة المحتوى والـ SEO' },
        { id: 'coding', name: 'البرمجة والتطوير' },
        { id: 'design', name: 'التصميم وتوليد الصور' },
        { id: 'marketing', name: 'التسويق والأعمال' },
        { id: 'research', name: 'البحث والبيانات' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Curated AI Stacks (مجموعات أدوات مخصصة حسب التخصص)
publicRouter.get('/stacks', async (req: Request, res: Response) => {
  try {
    const stacks = [
      {
        id: 'stack-developer',
        slug: 'fullstack-developer-stack',
        title: 'حزمة المطور البرمجي الشامل (Full-Stack Developer)',
        description: 'مجموعة أدوات تسريع كتابة الأكواد، إصلاح الأخطاء، ونشر التطبيقات السحابية في ثوانٍ.',
        targetRole: 'المطورون ومهندسو البرمجيات',
        monthlyEstimate: '$20 - $40 / شهرياً',
        estimatedProductivityBoost: '+250% في سرعة الإنجاز',
        toolSlugs: ['cursor-ai', 'github-copilot', 'chatgpt', 'v0-dev'],
        tools: [
          { name: 'Cursor AI', role: 'محرر الكود والـ AI Pair Programmer الرئيسي', slug: 'cursor-ai' },
          { name: 'v0 by Vercel', role: 'توليد واجهات React & Tailwind بضغطة زر', slug: 'v0-dev' },
          { name: 'ChatGPT Plus', role: 'هندسة المعمارية والتوثيق واستكشاف الحلول', slug: 'chatgpt' }
        ],
        workflowSteps: [
          'استخدم v0 لتوليد الواجهات المبدئية ومكونات React التفاعلية.',
          'افتح المشروع في Cursor AI للربط مع قاعدة البيانات وإضافة منطق العمل.',
          'استعن بـ ChatGPT لتصميم مخططات قواعد البيانات واختبار سيناريوهات الأمان.'
        ]
      },
      {
        id: 'stack-content-creator',
        slug: 'arabic-content-creator-stack',
        title: 'حزمة صانع المحتوى والمسوق الرقمي العربي',
        description: 'ترسانة متكاملة للبحث عن الأفكار، كتابة المقالات، وتصميم الصور الجذابة لشبكات التواصل.',
        targetRole: 'صناع المحتوى، كتاب المقالات، والمسوقون',
        monthlyEstimate: '$30 / شهرياً (مع خيارات مجانية متاحة)',
        estimatedProductivityBoost: '+400% في إنتاج المحتوى المرئي والنصي',
        toolSlugs: ['claude-3-5-sonnet', 'midjourney', 'chatgpt'],
        tools: [
          { name: 'Claude 3.5 Sonnet', role: 'صياغة النصوص العربية بأسلوب أدبي طبيعي', slug: 'claude-3-5-sonnet' },
          { name: 'Midjourney v6', role: 'توليد صور المقالات وأغلفة السوشيال ميديا بجودة سينمائية', slug: 'midjourney' },
          { name: 'Canva AI', role: 'تجميع المنشورات وتنسيق تصاميم إنستغرام وتويتر', slug: 'canva-magic' }
        ],
        workflowSteps: [
          'استخراج الأفكار والكلمات المفتاحية وهيكل المقال باستخدام Claude 3.5.',
          'توليد صور معبرة ومبتكرة عبر Midjourney.',
          'جدولة وتنسيق المنشورات وتكييفها لجميع المنصات.'
        ]
      },
      {
        id: 'stack-founder-business',
        slug: 'startup-founder-stack',
        title: 'حزمة رائد الأعمال والشركات الناشئة (Lean Startup Stack)',
        description: 'الأدوات التي توفر عليك تكلفة توظيف فريق كامل في المراحل الأولى لمشروعك.',
        targetRole: 'المؤسسون، رواد الأعمال، وأصحاب المتاجر',
        monthlyEstimate: '$0 - $50 / شهرياً',
        estimatedProductivityBoost: 'توفير ما يزيد عن 80 ساعة عمل شهرياً',
        toolSlugs: ['chatgpt', 'lovable-dev', 'elevenlabs'],
        tools: [
          { name: 'Lovable / v0', role: 'بناء نموذج المنتج الأولي (MVP) في أيام بدلاً من أشهر', slug: 'lovable-dev' },
          { name: 'ChatGPT', role: 'صياغة خطط العمل، مراسلات المستثمرين، ودراسات الجدوى', slug: 'chatgpt' },
          { name: 'ElevenLabs', role: 'تسجيل التعليق الصوتي الإعلاني الاحترافي باللغة العربية', slug: 'elevenlabs' }
        ],
        workflowSteps: [
          'صياغة عرض القيمة وخطة التسعير وتحليل المنافسين.',
          'إطلاق الموقع التعريفي ونموذج العمل السريع لجمع العملاء الأوائل.',
          'أتمتة خدمة العملاء وصناعة فيديوهات العرض التوضيحية.'
        ]
      }
    ];

    res.json(stacks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Smart AI Alternatives Directory (دليل البدائل المجانية والذكية)
publicRouter.get('/alternatives-directory', async (req: Request, res: Response) => {
  try {
    const alternatives = [
      {
        id: 'alt-1',
        originalTool: { name: 'ChatGPT Plus (GPT-4o)', slug: 'chatgpt', price: '$20/شهر' },
        alternatives: [
          { name: 'Claude 3.5 Sonnet', slug: 'claude-3-5-sonnet', advantage: 'خطة مجانية قوية مع صياغة كتابية فائقة الدقة', price: 'مجاني / $20' },
          { name: 'Google Gemini', slug: 'gemini', advantage: 'مجاني تماماً ومتصل بالويب مباشرة عبر بحث Google', price: 'مجاني' },
          { name: 'DeepSeek-V3', slug: 'deepseek-v3', advantage: 'نموذج مفتوح المصدر بتكلفة تكاد تنعدم وأداء فائق', price: 'مجاني / رخيص جداً' }
        ]
      },
      {
        id: 'alt-2',
        originalTool: { name: 'Midjourney v6', slug: 'midjourney', price: '$10 - $60/شهر' },
        alternatives: [
          { name: 'FLUX.1', slug: 'flux-1', advantage: 'نموذج مفتوح المصدر يضاهي الواقعية مع فهم مذهل للنصوص', price: 'مجاني / Freemium' },
          { name: 'DALL-E 3', slug: 'dall-e-3', advantage: 'متاح مجاناً عبر Microsoft Copilot وبحث Bing', price: 'مجاني عبر Copilot' },
          { name: 'Leonardo AI', slug: 'leonardo-ai', advantage: '150 نقطة توليد مجانية يومياً مع أدوات تحكم واسعة', price: 'Freemium' }
        ]
      },
      {
        id: 'alt-3',
        originalTool: { name: 'GitHub Copilot', slug: 'github-copilot', price: '$10/شهر' },
        alternatives: [
          { name: 'Cursor AI', slug: 'cursor-ai', advantage: 'بيئة تطوير كاملة تعتمد على VS Code مع ميزات ذكاء تفاعلية', price: 'خطة مجانية كريمة' },
          { name: 'Codeium (Windsurf)', slug: 'codeium', advantage: 'مجاني تماماً للاستخدام الفردي مع دعم لكافة اللغات', price: 'مجاني 100%' },
          { name: 'Continue.dev', slug: 'continue-dev', advantage: 'مفتوح المصدر بالكامل ويتصل بنماذج Ollama المحلية', price: 'مفتوح المصدر' }
        ]
      }
    ];

    res.json(alternatives);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
