import { query } from './db.ts';
import bcrypt from 'bcryptjs';

export async function initDatabase() {
  console.log('Initializing PostgreSQL schema...');

  await query(`
    -- 1. Roles & Permissions
    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
      permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );

    -- 2. Users & User Roles
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, role_id)
    );

    -- 3. Categories & Subcategories
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      name VARCHAR(100) NOT NULL,
      name_en VARCHAR(100),
      slug VARCHAR(120) UNIQUE NOT NULL,
      description TEXT,
      icon VARCHAR(50) DEFAULT 'Folder',
      color VARCHAR(30) DEFAULT '#3B82F6',
      display_order INT DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 4. Tools
    CREATE TABLE IF NOT EXISTS tools (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      slug VARCHAR(180) UNIQUE NOT NULL,
      tagline VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      overview TEXT,
      logo_url TEXT,
      cover_image_url TEXT,
      website_url TEXT NOT NULL,
      affiliate_url TEXT,
      pricing_type VARCHAR(50) NOT NULL DEFAULT 'Freemium', -- Free, Freemium, Paid, Free Trial, Contact
      starting_price VARCHAR(50),
      rating NUMERIC(3,2) DEFAULT 4.5,
      review_count INT DEFAULT 0,
      is_verified BOOLEAN DEFAULT TRUE,
      is_trending BOOLEAN DEFAULT FALSE,
      is_popular BOOLEAN DEFAULT FALSE,
      is_featured BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'published', -- published, draft, archived
      who_is_it_for TEXT,
      view_count INT DEFAULT 0,
      clicks_count INT DEFAULT 0,
      shares_count INT DEFAULT 0,
      bookmark_count INT DEFAULT 0,
      meta_title VARCHAR(200),
      meta_description TEXT,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tool_categories (
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (tool_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS tool_features (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      icon VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS tool_pros (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tool_cons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tool_pricing (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      plan_name VARCHAR(100) NOT NULL,
      price VARCHAR(50) NOT NULL,
      period VARCHAR(50) DEFAULT 'شهرياً',
      features JSONB DEFAULT '[]',
      is_popular BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS tool_faqs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INT DEFAULT 0
    );

    -- 5. Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      slug VARCHAR(200) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      author_name VARCHAR(100) DEFAULT 'فريق التحرير',
      rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
      summary TEXT NOT NULL,
      detailed_review TEXT NOT NULL,
      pros JSONB DEFAULT '[]',
      cons JSONB DEFAULT '[]',
      verdict TEXT,
      meta_title VARCHAR(200),
      meta_description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 6. Comparisons
    CREATE TABLE IF NOT EXISTS comparisons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(200) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      summary TEXT NOT NULL,
      comparison_criteria JSONB DEFAULT '[]',
      verdict TEXT NOT NULL,
      meta_title VARCHAR(200),
      meta_description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS comparison_tools (
      comparison_id UUID REFERENCES comparisons(id) ON DELETE CASCADE,
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      is_winner BOOLEAN DEFAULT FALSE,
      notes TEXT,
      PRIMARY KEY (comparison_id, tool_id)
    );

    -- 7. Tutorials & Guides
    CREATE TABLE IF NOT EXISTS tutorials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
      slug VARCHAR(200) UNIQUE NOT NULL,
      title VARCHAR(250) NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      difficulty VARCHAR(50) DEFAULT 'مبتدئ', -- مبتدئ, متوسط, متقدم
      read_time VARCHAR(50) DEFAULT '5 دقائق',
      cover_image_url TEXT,
      steps JSONB DEFAULT '[]',
      meta_title VARCHAR(200),
      meta_description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 8. Articles & News
    CREATE TABLE IF NOT EXISTS articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(200) UNIQUE NOT NULL,
      title VARCHAR(250) NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image_url TEXT,
      author_name VARCHAR(100) DEFAULT 'محرر الذكاء الاصطناعي',
      read_time VARCHAR(50) DEFAULT '6 دقائق',
      is_featured BOOLEAN DEFAULT FALSE,
      meta_title VARCHAR(200),
      meta_description TEXT,
      published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS article_categories (
      article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, category_id)
    );

    -- 9. Resources (Cheatsheets, Prompts, Frameworks)
    CREATE TABLE IF NOT EXISTS resources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(200) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      type VARCHAR(50) NOT NULL, -- دليل, نموذج برومبت, كتاب إلكتروني, قالب
      description TEXT NOT NULL,
      download_url TEXT,
      icon VARCHAR(50) DEFAULT 'FileText',
      is_free BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 10. Affiliate Links & Click Tracking
    CREATE TABLE IF NOT EXISTS affiliate_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      campaign_name VARCHAR(100) NOT NULL,
      target_url TEXT NOT NULL,
      clicks_count INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 11. Media Library
    CREATE TABLE IF NOT EXISTS media (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_size INT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 12. SEO Metadata Repository
    CREATE TABLE IF NOT EXISTS seo_metadata (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      page_path VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      canonical_url TEXT,
      og_image TEXT,
      structured_data JSONB,
      is_indexable BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 13. Site Settings (Key-Value)
    CREATE TABLE IF NOT EXISTS site_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'string',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 14. Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(100),
      details JSONB,
      ip_address VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 15. Real-Time Analytics & Event Tracking
    CREATE TABLE IF NOT EXISTS analytics_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type VARCHAR(50) NOT NULL,
      entity_type VARCHAR(50),
      entity_id UUID,
      entity_slug VARCHAR(200),
      target_url TEXT,
      session_id VARCHAR(100),
      ip_address VARCHAR(50),
      user_agent TEXT,
      referrer TEXT,
      device VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_slug ON analytics_events(entity_slug);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
  `);

  // Non-destructive migrations for existing database
  await query(`
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS clicks_count INT DEFAULT 0;
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS shares_count INT DEFAULT 0;
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
  `).catch(() => {});

  console.log('PostgreSQL schema verification and creation completed.');

  // Seed default Admin & Initial Data if empty
  await seedInitialData();
}

async function seedInitialData() {
  const userCheck = await query(`SELECT COUNT(*) FROM users`);
  if (parseInt(userCheck.rows[0].count, 10) === 0) {
    console.log('Seeding initial Roles, Permissions, Admin and Catalog data...');

    // 1. Create Roles
    const adminRole = await query(`
      INSERT INTO roles (name, description) VALUES ('admin', 'مدير النظام بصلاحيات كاملة') RETURNING id
    `);
    const editorRole = await query(`
      INSERT INTO roles (name, description) VALUES ('editor', 'محرر محتوى وأدوات') RETURNING id
    `);

    // 2. Admin User (Password: admin123)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    const adminUser = await query(`
      INSERT INTO users (email, password_hash, full_name)
      VALUES ('admin@daleel.ai', $1, 'مدير منصة دليل الذكاء الاصطناعي')
      RETURNING id
    `, [passwordHash]);

    await query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
    `, [adminUser.rows[0].id, adminRole.rows[0].id]);

    // 3. Site Settings
    const settings = [
      ['site_name', 'دليل الذكاء الاصطناعي | Daleel AI'],
      ['site_tagline', 'المرجع العربي الأول لاكتشاف وتجربة أفضل أدوات وتطبيقات الذكاء الاصطناعي'],
      ['site_description', 'الدليل الشامل باللغة العربية لاكتشاف، تقييم، ومقارنة أحدث أدوات ونماذج الذكاء الاصطناعي وتطبيقات الإنتاجية والتصميم والبرمجة.'],
      ['contact_email', 'contact@daleel.ai'],
      ['announcement_bar', ' مرحباً بكم في النسخة الرسمية لمنصة دليل الذكاء الاصطناعي - أكثر من 50+ أداة ومقارنات متجددة يومياً'],
      ['newsletter_subscribers_count', '14200'],
      ['footer_text', '© 2026 دليل الذكاء الاصطناعي - جميع الحقوق محفوظة. المنصة الموثوقة لصناع المستقبل والمبتكرين في العالم العربي.'],
      ['ads_enabled', 'true'],
      ['ads_auto_ads_enabled', 'true'],
      ['ads_test_mode', 'false'],
      ['ads_publisher_id', 'ca-pub-6343594295307676'],
      ['ga_measurement_id', 'G-T1X92GT5YK'],
      ['ga_stream_id', '15813564380'],
      ['ga_property_id', '555078183'],
      ['ga_account_id', '408797938'],
      ['ads_slot_article_top', '9685713922'],
      ['ads_slot_article_incontent', '9685713922'],
      ['ads_slot_article_bottom', '9685713922'],
      ['ads_slot_article_sidebar', '9685713922'],
      ['ads_slot_tool_detail', '9685713922'],
      ['ads_slot_home_banner', '9685713922'],
      ['ads_slot_sticky_footer', '9685713922']
    ];

    for (const [key, val] of settings) {
      await query(`
        INSERT INTO site_settings (key, value) VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2
      `, [key, val]);
    }

    // 4. Categories & Subcategories
    const categoriesData = [
      { name: 'الكتابة وصناعة المحتوى', name_en: 'Writing & Copywriting', slug: 'writing-content', desc: 'أدوات كتابة المقالات، النصوص التسويقية، إعادة الصياغة، وتلخيص المستندات', icon: 'PenTool', color: '#6366F1' },
      { name: 'توليد وتعديل الصور', name_en: 'Image Generation', slug: 'image-generation', desc: 'نماذج توليد الصور الفنية، تعديل الصور الاحترافية، وإزالة الخلفيات بالذكاء الاصطناعي', icon: 'Image', color: '#EC4899' },
      { name: 'البرمجة وتطوير البرمجيات', name_en: 'Coding & Dev Tools', slug: 'coding-development', desc: 'مساعدو الأكواد الذكية، فحص الأخطاء، وإكمال الشيفرات البرمجية تلقائياً', icon: 'Code', color: '#10B981' },
      { name: 'إنتاج الفيديو والمونتاج', name_en: 'Video & Animation', slug: 'video-production', desc: 'توليد الفيديو من النص، استنساخ الشخصيات الرقمية، والترجمة الآلية المرئية', icon: 'Video', color: '#F59E0B' },
      { name: 'الصوتيات والتعليق الصوتي', name_en: 'Audio & Speech', slug: 'audio-voice', desc: 'تحويل النص إلى كلام واقعي، استنساخ الأصوات، وتعديل المقاطع الصوتية', icon: 'Mic', color: '#8B5CF6' },
      { name: 'الإنتاجية وإدارة الأعمال', name_en: 'Productivity & Work', slug: 'productivity-business', desc: 'تنظيم المهام، أتمتة تدفقات العمل، وتلخيص الاجتماعات والبريد', icon: 'Briefcase', color: '#3B82F6' },
      { name: 'التسويق وتحسين محركات البحث', name_en: 'Marketing & SEO', slug: 'marketing-seo', desc: 'تحليل المنافسين، تخطيط الكلمات المفتاحية، وصناعة حملات إعلانية ذكية', icon: 'TrendingUp', color: '#14B8A6' },
      { name: 'التعليم والبحث العلمي', name_en: 'Research & Education', slug: 'education-research', desc: 'تحليل الأوراق العلمية، المساعدون التعليميون، وحل المسائل المعقدة', icon: 'GraduationCap', color: '#E11D48' }
    ];

    const catMap = new Map<string, string>();
    for (const cat of categoriesData) {
      const inserted = await query(`
        INSERT INTO categories (name, name_en, slug, description, icon, color, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE)
        RETURNING id, slug
      `, [cat.name, cat.name_en, cat.slug, cat.desc, cat.icon, cat.color]);
      catMap.set(cat.slug, inserted.rows[0].id);
    }

    // Add subcategories
    const subcats = [
      { parentSlug: 'writing-content', name: 'كتابة الإعلانات والنسخ البيعية', slug: 'copywriting', desc: 'صياغة نصوص إعلانية تزيد المبيعات' },
      { parentSlug: 'writing-content', name: 'إعادة الصياغة والتدقيق اللغوي', slug: 'paraphrasing-grammar', desc: 'تحسين الأسلوب والتدقيق النحوي والإملائي' },
      { parentSlug: 'image-generation', name: 'تصميم الشعارات والهويات البصرية', slug: 'logo-design', desc: 'توليد هويات بصرية وعلامات تجارية متكاملة' },
      { parentSlug: 'coding-development', name: 'مساعدات إكمال الأكواد في IDE', slug: 'code-assistants', desc: 'اقتراحات برمجية سريعة أثناء كتابة الكود' },
      { parentSlug: 'video-production', name: 'شخصيات الأفاتار المتحدثة', slug: 'ai-avatars', desc: 'تقديم العروض التقديمية والفيديوهات التعليمية بشخصيات افتراضية' }
    ];

    for (const sub of subcats) {
      const parentId = catMap.get(sub.parentSlug);
      if (parentId) {
        await query(`
          INSERT INTO categories (parent_id, name, slug, description, is_featured)
          VALUES ($1, $2, $3, $4, FALSE)
        `, [parentId, sub.name, sub.slug, sub.desc]);
      }
    }

    // 5. Tools Data
    const toolsData = [
      {
        name: 'كلاود (Claude 3.5 Sonnet)',
        slug: 'claude-3-5-sonnet',
        tagline: 'النموذج الأقوى عالمياً في البرمجة والتحليل الدقيق والكتابة الإبداعية الطبيعية',
        description: 'يُعتبر كلاود 3.5 سونيت ثورة حقيقية في نماذج الذكاء الاصطناعي التوليدي، حيث يقدم نافذة سياق عملاقة وفهماً استثنائياً للشيفرات البرمجية والأفكار المعقدة مع أسلوب كتابة عربي وإنجليزي فائق السلاسة.',
        overview: 'أطلقته شركة Anthropic الرائدة، ويتميز ببيئة عمل تفاعلية تسمى Artifacts تمكن المطور والمصمم من تشغيل وملاحظة التطبيقات المصممة مباشرة في شاشة العرض.',
        logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        website_url: 'https://claude.ai',
        pricing_type: 'Freemium',
        starting_price: '20$ / شهر',
        rating: 4.95,
        review_count: 342,
        is_trending: true,
        is_popular: true,
        is_featured: true,
        categorySlug: 'coding-development',
        who_is_it_for: 'المطورون، محللو البيانات، كتاب المحتوى المتقدم، وصناع القرار التقنيون',
        features: [
          { title: 'نافذة سياق ضخمة 200K', description: 'قراءة وتحليل كتب ومشاريع كود كاملة في استفسار واحد' },
          { title: 'ميزة Artifacts التفاعلية', description: 'معاينة صفحات الويب ومخططات SVG والأكواد التفاعلية فورياً' },
          { title: 'دقة برمجية غير مسبوقة', description: 'كتابة واكتشاف الأخطاء البرمجية بكفاءة رائدة' }
        ],
        pros: ['أسلوب لغوي راقٍ وغير متكلف', 'إجابات خالية من الحشو الزائد', 'سرعة إخراج عالية وموثوقية بالتحليل'],
        cons: ['حدود عدد الرسائل المجانية في ساعات الذروة', 'عدم توفر متصفح ويب حي مدمج في النسخة المباشرة'],
        faqs: [
          { q: 'هل يدعم كلود اللغة العربية بدقة؟', a: 'نعم، يعتبر من أفضل النماذج في سلامة الصياغة والقواعد العربية وفهم اللهجات.' },
          { q: 'هل الخطة المجانية كافية؟', a: 'الخطة المجانية تتيح لك تجربة النموذج الرائد، ولكن باشتراك Pro ستحصل على سعة استخدام تفوق 5 أضعاف.' }
        ]
      },
      {
        name: 'ميدجورني (Midjourney v6)',
        slug: 'midjourney-v6',
        tagline: 'المعيار الذهبي لتوليد الصور الخيالية والواقعية فائقة التفاصيل الفنية',
        description: 'الأداة الأشهر والأقوى للفنانين والمصممين لتوليد صور فنية وواقعية سينمائية عبر أوامر نصية متقدمة بدقة ألوان وإضاءة لا مثيل لها.',
        overview: 'يعمل ميدجورني عبر ديسكورد والموقع الرسمي، ويقدم قدرات متطورة لمعالجة الإضاءة، تفاصيل ملامح الوجه، ونصوص الخطوط داخل الصورة بدقة متناهية.',
        logo_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80',
        website_url: 'https://midjourney.com',
        pricing_type: 'Paid',
        starting_price: '10$ / شهر',
        rating: 4.90,
        review_count: 512,
        is_trending: true,
        is_popular: true,
        is_featured: true,
        categorySlug: 'image-generation',
        who_is_it_for: 'المصممون الرقميون، استوديوهات الألعاب، الوكالات الإعلانية، والمخرجون الفنيون',
        features: [
          { title: 'محرك واقعية سينمائي', description: 'محاكاة كاملة لعدسات الكاميرات الاحترافية وإضاءة الاستوديو' },
          { title: 'تحكم متقدم بالتعديل الموضعي', description: 'ميزة Inpainting وPan لتوسيع الصور وإعادة رسم عناصر محددة' },
          { title: 'واجهة ويب حديثة وسريعة', description: 'إمكانية إنشاء وتصفح الصور من متصفح الويب مباشرة' }
        ],
        pros: ['جودة بصرية هي الأفضل على الإطلاق في السوق', 'مجتمع ضخم يشارك أنماط وأوامر ملهمة', 'تحديثات مستمرة وتطوير فائق السرعة'],
        cons: ['لا تتوفر خطة مجانية دائمة', 'تتطلب بعض الممارسة لإتقان صيغ الأوامر الفنية'],
        faqs: [
          { q: 'هل الصور المولدة تجارية؟', a: 'نعم، تمنحك جميع الخطط المدفوعة الحقوق الكاملة للاستخدام التجاري لصورك.' }
        ]
      },
      {
        name: 'شات جي بي تي (ChatGPT Plus)',
        slug: 'chatgpt-plus',
        tagline: 'المساعد الذكي الأكثر انتشاراً مع دعم متجر الإضافات وتحليل الملفات والبحث المباشر',
        description: 'منصة OpenAI الرائدة التي تجمع أحدث نماذج GPT-4o والقدرة على التحدث الصوتي اللحظي، قراءة الصور والمستندات، وتصفح الإنترنت مباشرة.',
        overview: 'يمنحك شات جي بي تي بيئة عمل متكاملة للمهام اليومية، صياغة الاستراتيجيات، معالجة جداول البيانات الكبيرة، وبناء بوتات مخصصة (Custom GPTs).',
        logo_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80',
        website_url: 'https://chatgpt.com',
        pricing_type: 'Freemium',
        starting_price: '20$ / شهر',
        rating: 4.88,
        review_count: 1240,
        is_trending: true,
        is_popular: true,
        is_featured: true,
        categorySlug: 'writing-content',
        who_is_it_for: 'الجميع؛ من الطلاب والباحثين إلى رواد الأعمال ومطوري الأنظمة',
        features: [
          { title: 'المحادثة الصوتية الفورية', description: 'تفاعل صوتي طبيعي متدفق بدون تأخير وبنبرة عاطفية واقعية' },
          { title: 'محلل البيانات المتقدم', description: 'تشغيل شيفرات بايثون لتحليل الجداول ورسم المخططات البيانية' },
          { title: 'متجر الـ GPTs المخصصة', description: 'آلاف التطبيقات المخصصة لأهداف تسويقية وتعليمية وهندسية' }
        ],
        pros: ['تكاملات متسعة وتطبيق هاتف ممتاز', 'سرعة استجابة عالية', 'دعم استكشاف الويب والبحث الحي'],
        cons: ['قد يقدم أحياناً إجابات نمطية تحتاج لإعادة توجيه', 'حدود رسائل على نموذج o1 التفكيري'],
        faqs: [
          { q: 'ما الفرق بين النسخة المجانية و Plus؟', a: 'توفر النسخة المدفوعة أحدث النماذج الذكية التفكيرية وتوليد الصور وتوليد الصوت وسرعة أولوية.' }
        ]
      },
      {
        name: 'كيرسور (Cursor AI)',
        slug: 'cursor-ai',
        tagline: 'محرر الأكواد الذكي المشتق من VS Code الذي ضاعف سرعة كتابة البرمجيات',
        description: 'محرر كود متقدم مدمج بنماذج ذكاء اصطناعي تفهم مشروعك البرمجي بالكامل، وتقترح تعديلات على ملفات متعددة في ثوانٍ معدودة.',
        overview: 'يسمح لك Cursor بتوجيه الأوامر باللغة الطبيعية لإجراء تعديلات هيكلية وتوليد ميزات كاملة وربط الـ Terminal وفحص الأخطاء.',
        logo_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
        website_url: 'https://cursor.com',
        pricing_type: 'Freemium',
        starting_price: '20$ / شهر',
        rating: 4.98,
        review_count: 280,
        is_trending: true,
        is_popular: true,
        is_featured: true,
        categorySlug: 'coding-development',
        who_is_it_for: 'مبرمجو الويب والتطبيقات وفرق هندسة البرمجيات المحترفة',
        features: [
          { title: 'Composer متعدد الملفات', description: 'إنشاء وتعديل عدة ملفات برمجية بتعليمة واحدة' },
          { title: 'فهرسة المشروع الكامل', description: 'البحث الدلالي وفهم ارتباطات الكود والمكتبات' },
          { title: 'دعم جميع إضافات VS Code', description: 'انتقال سلس بدون خسارة الإعدادات والاختصارات السابقة' }
        ],
        pros: ['يوفر ساعات عمل برمجية يومياً', 'فهم حقيقي لبنية المشاريع الضخمة', 'دعم اختيار النماذج المتعددة (Claude, GPT, Gemini)'],
        cons: ['يحتاج إنترنت مستقر لتشغيل النماذج السحابية السريعة'],
        faqs: [
          { q: 'هل هو آمن للمشاريع الخاصة؟', a: 'يوفر وضع Privacy Mode لضمان عدم حفظ أو استخدام أكوادك في تدريب النماذج.' }
        ]
      },
      {
        name: 'إليفن لابس (ElevenLabs)',
        slug: 'elevenlabs',
        tagline: 'المنصة الرائدة في استنساخ الأصوات والتعليق الصوتي متعدد اللغات بمشاعر طبيعية',
        description: 'أفضل محرك تحويل نصوص إلى كلام في العالم بدقة نبرة إنسانية، مع إمكانية استنساخ أي صوت بدقة متناهية ودعم اللهجات العربية بدقة مذهلة.',
        overview: 'أحدثت ElevenLabs ثورة في صناعة الكتب الصوتية، الإعلانات، والدوبلاج التلقائي لمقاطع الفيديو مع الحفاظ على بصمة صوت المتحدث الأصلية.',
        logo_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=150&auto=format&fit=crop&q=80',
        website_url: 'https://elevenlabs.io',
        pricing_type: 'Freemium',
        starting_price: '5$ / شهر',
        rating: 4.92,
        review_count: 410,
        is_trending: true,
        is_popular: true,
        is_featured: false,
        categorySlug: 'audio-voice',
        who_is_it_for: 'صناع البودكاست، المنتجون، المسوقون، ومطورو الألعاب',
        features: [
          { title: 'Voice Cloning فائق الدقة', description: 'استنساخ نبرة الصوت من مقطع صوتي لا يتجاوز دقيقة واحدة' },
          { title: 'دوبلاج الفيديو الذكي', description: 'ترجمة وتغيير صوت الفيديو لأكثر من 29 لغة مع حركة الشفاه' },
          { title: 'مؤثرات صوتية Sound Effects', description: 'توليد مؤثرات صوتية احترافية من الوصف النصي' }
        ],
        pros: ['واقعية تخدع الأذن ومشاعر صوتية متباينة', 'دعم قوي للغة العربية', 'واجهة سهلة ومكتبة أصوات مجتمعية ضخمة'],
        cons: ['استهلاك الأحرف السريع في المشاريع الطويلة'],
        faqs: [
          { q: 'هل يدعم التعليق الصوتي باللهجات العربية؟', a: 'نعم، يدعم الفصحى واللهجات مثل السعودية والمصرية والخليجية والشامية بجودة عالية.' }
        ]
      },
      {
        name: 'رانواي (Runway Gen-3 Alpha)',
        slug: 'runway-gen-3',
        tagline: 'الأداة الرائدة في إنتاج وتوليد الفيديو عالي الدقة والمؤثرات السينمائية من النص',
        description: 'نموذج الجيل الثالث من Runway لإنشاء لقطات فيديو سينمائية بجودة هوليوود وحركة كاميرا واقعية ومحاكاة دقيقة لقوانين الفيزياء الطبيعية.',
        overview: 'تعتمد عليها كبرى استوديوهات الإنتاج لإنشاء مشاهد سينمائية خيالية وتحريك الصور الثابتة والتحكم بحركات الكاميرا والسرعة بدقة فائقة.',
        logo_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=150&auto=format&fit=crop&q=80',
        website_url: 'https://runwayml.com',
        pricing_type: 'Freemium',
        starting_price: '12$ / شهر',
        rating: 4.85,
        review_count: 195,
        is_trending: true,
        is_popular: false,
        is_featured: false,
        categorySlug: 'video-production',
        who_is_it_for: 'صناع الأفلام، مصممو الإعلانات المرئية، والمبدعون الرقميون',
        features: [
          { title: 'محاكاة فيزيائية متطورة', description: 'حركة واقعية للسوائل والأقمشة ودخان الانفجارات والإضاءة' },
          { title: 'تحكم دقيق بحركة الكاميرا', description: 'تحديد زوايا الكاميرا وحركات Zoom وPan وTilt' },
          { title: 'ميزة Motion Brush', description: 'تحديد أي عنصر داخل الصورة لتحريكه بانفراد' }
        ],
        pros: ['جودة إخراج سينمائية مذهلة', 'سرعة رندرة عالية مقارنة بالمنافسين', 'أدوات مونتاج وتعديل مدمجة'],
        cons: ['توليد الوجوه من زوايا معينة قد يتطلب تجارب متعددة', 'استهلاك الرصيد سريع في اللقطات الطويلة'],
        faqs: [
          { q: 'ما هي مدة المقاطع التي يمكن إنتاجها؟', a: 'يمكن توليد لقطات تمتد من 5 إلى 10 ثوانٍ وتمديدها بسلاسة عبر واجهة المونتاج.' }
        ]
      },
      {
        name: 'جيميني أدفانسد (Gemini Advanced)',
        slug: 'gemini-advanced',
        tagline: 'مساعد جوجل الأكثر تطوراً مع نافذة سياق تصل إلى 2 مليون رمز وتكامل عميق مع خدمات جوجل',
        description: 'مدعوم بنماذج Gemini 1.5 Pro مع نافذة سياق خيالية تسمح برفع فيديوهات تدريبية كاملة أو مئات آلاف أسطر البيانات دفعة واحدة.',
        overview: 'يوفر تكاملاً فريداً مع Google Workspace مثل Drive وDocs وGmail واليوتيوب، مما يجعله المحرك الأقوى للأعمال والأبحاث المكتبية.',
        logo_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
        website_url: 'https://gemini.google.com',
        pricing_type: 'Free Trial',
        starting_price: '19.99$ / شهر (مع 2TB Drive)',
        rating: 4.87,
        review_count: 730,
        is_trending: true,
        is_popular: true,
        is_featured: true,
        categorySlug: 'productivity-business',
        who_is_it_for: 'الشركات، الباحثون، مستخدمو حزمة جوجل السحابية، والطلاب',
        features: [
          { title: 'نافذة سياق عملاقة (2M Tokens)', description: 'استيعاب ساعة فيديو كاملة أو آلاف الصفحات في جلسة واحدة' },
          { title: 'تكامل مع Gmail وDrive', description: 'استخراج وتلخيص المعلومات من بريدك وملفاتك مباشرة وبأمان' },
          { title: 'سعة تخزين 2TB Google One', description: 'مدمجة مجاناً ضمن باقة الاشتراك الشهري' }
        ],
        pros: ['قوة هائلة في معالجة الوسائط المتعددة (صوت وفيديو)', 'قيمة ممتازة تشمل مساحة تخزينية سحابية ضخمة', 'دعم ممتاز للغة العربية والبحث الحي'],
        cons: ['قد يكون متحفظاً في بعض الإجابات المتعلقة بالسياسات'],
        faqs: [
          { q: 'هل يستطيع قراءة مقاطع الفيديو مباشرة؟', a: 'نعم، تستطيع رفع مقطع فيديو ويقوم بتحليله وتحديد اللحظات والإجابة عن أي استفسار حوله.' }
        ]
      },
      {
        name: 'بيربليكسيتي (Perplexity AI)',
        slug: 'perplexity-ai',
        tagline: 'محرك الإجابات المعرفي الذكي الموثق بالمصادر الحية وروابط المراجع',
        description: 'بديل ثوري لمحركات البحث التقليدية يقدم إجابات تحليلية فورية مع توثيق كل معلومة بمصادر الويب الأصلية وأدوات بحث تخصصية.',
        overview: 'يتيح لك اختيار نموذج الذكاء الاصطناعي المفضل للبحث، ويوفر ميزة البحث الأكاديمي، وتلخيص المقالات، واستخراج الإحصائيات في الوقت الفعلي.',
        logo_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150&auto=format&fit=crop&q=80',
        website_url: 'https://perplexity.ai',
        pricing_type: 'Freemium',
        starting_price: '20$ / شهر',
        rating: 4.93,
        review_count: 580,
        is_trending: true,
        is_popular: true,
        is_featured: false,
        categorySlug: 'education-research',
        who_is_it_for: 'الباحثون، الصحفيون، المحللون الماليون، والطلاب',
        features: [
          { title: 'توثيق دقيق بالمصادر', description: 'أرقام وهوامش لكل فقرة ترشدك للمقال أو الورقة العلمية المصدرية' },
          { title: 'أوضاع بحث متخصصة (Focus)', description: 'البحث المخصص في يوتيوب أو الأوراق الأكاديمية أو Reddit' },
          { title: 'مجموعات العمل التشاركية (Collections)', description: 'تنظيم الأبحاث ومشاركتها بسهولة مع فريق عملك' }
        ],
        pros: ['يوفر ساعات من التصفح والبحث اليدوي', 'تقليل نسبة الهلوسة بفضل التوثيق الصارم', 'تطبيق هاتف سلس وممتاز'],
        cons: ['النسخة المجانية تستخدم بحثاً أسرع لكنه أقل تفصيلاً من وضع Pro'],
        faqs: [
          { q: 'هل يغني عن محرك بحث جوجل؟', a: 'للبحث المعرفي والدراسات والاستفسارات المحددة، هو أسرع وأدق بكثير من التصفح التقليدي.' }
        ]
      }
    ];

    for (const tool of toolsData) {
      const catId = catMap.get(tool.categorySlug);
      const insertedTool = await query(`
        INSERT INTO tools (
          name, slug, tagline, description, overview, logo_url, website_url,
          pricing_type, starting_price, rating, review_count, is_trending, is_popular, is_featured,
          who_is_it_for, meta_title, meta_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        tool.name, tool.slug, tool.tagline, tool.description, tool.overview, tool.logo_url, tool.website_url,
        tool.pricing_type, tool.starting_price, tool.rating, tool.review_count, tool.is_trending, tool.is_popular, tool.is_featured,
        tool.who_is_it_for, `${tool.name} | مراجعة شاملة ومميزات وأسعار 2026`, tool.tagline
      ]);

      const toolId = insertedTool.rows[0].id;

      if (catId) {
        await query(`INSERT INTO tool_categories (tool_id, category_id) VALUES ($1, $2)`, [toolId, catId]);
      }

      for (const f of tool.features) {
        await query(`INSERT INTO tool_features (tool_id, title, description) VALUES ($1, $2, $3)`, [toolId, f.title, f.description]);
      }

      for (const p of tool.pros) {
        await query(`INSERT INTO tool_pros (tool_id, content) VALUES ($1, $2)`, [toolId, p]);
      }

      for (const c of tool.cons) {
        await query(`INSERT INTO tool_cons (tool_id, content) VALUES ($1, $2)`, [toolId, c]);
      }

      for (const faq of tool.faqs) {
        await query(`INSERT INTO tool_faqs (tool_id, question, answer) VALUES ($1, $2, $3)`, [toolId, faq.q, faq.a]);
      }

      // Add default pricing plans
      await query(`
        INSERT INTO tool_pricing (tool_id, plan_name, price, period, features, is_popular)
        VALUES 
        ($1, 'الخطة الأساسية', 'مجاناً', 'دائم', '["وصول محدود للنموذج", "سياق قياسي", "دعم مجتمعي"]', FALSE),
        ($1, 'خطة المحترفين Pro', $2, 'شهرياً', '["وصول ذروة ذو أولوية", "أعلى سرعة معالجة", "أحدث الميزات التجريبية", "دعم فني مخصص"]', TRUE)
      `, [toolId, tool.starting_price || '20$']);
    }

    // 6. Seed Comparisons
    const comp = await query(`
      INSERT INTO comparisons (slug, title, description, summary, verdict, meta_title, meta_description)
      VALUES (
        'claude-vs-chatgpt',
        'مقارنة شاملة 2026: Claude 3.5 Sonnet ضد ChatGPT Plus - أيهما تختار؟',
        'مقارنة موضوعية تفصيلية بين عملاقي الذكاء الاصطناعي من حيث جودة البرمجة، دقة الصياغة العربية، السعر، وسهولة الاستخدام اليومي.',
        'يتفوق Claude 3.5 في الأكواد والتحليل المنطقي والأسلوب الأدبي الطبيعي، بينما يتفوق ChatGPT في التنوع، البحث الحي، والمحادثة الصوتية التفاعلية.',
        'إذا كان تركيزك الأساسي البرمجة أو التدقيق اللغوي أو تحليل المشاريع المعقدة، فإن Claude 3.5 Sonnet هو الخيار الأمثل بدون منازع. أما إذا كنت تبحث عن منصة متعددة الاستخدامات للبحث اليومي والتطبيقات الصوتية وتوليد الصور، فإن ChatGPT Plus يمنحك منظومة متكاملة.',
        'مقارنة كلود ضد شات جي بي تي | أيهما الأفضل في 2026؟',
        'دليل تفصيلي لمقارنة Claude 3.5 Sonnet مع ChatGPT Plus لمساعدتك على اختيار الاشتراك الأنسب لاحتياجاتك.'
      ) RETURNING id
    `);

    // 7. Seed Reviews
    await query(`
      INSERT INTO reviews (slug, title, author_name, rating, summary, detailed_review, pros, cons, verdict)
      VALUES (
        'claude-3-5-sonnet-review',
        'مراجعة أداة Claude 3.5 Sonnet: لماذا يعتبر المساعد الأكثر ذكاءً للمبرمجين والكتاب؟',
        'د. حسام الشريف - خبير ذكاء اصطناعي',
        4.95,
        'يقدم Claude 3.5 قفزة نوعية في فهم سياق الأوامر البرمجية وتصميم واجهات الويب الحية عبر ميزة Artifacts مع لغة عربية مريحة جداً.',
        'بعد أكثر من 3 أشهر من الاختبار المكثف في تطوير تطبيقات الويب المعقدة وكتابة التقارير المطولة، نجد أن كلود أثبت تفوقه الواضح في قلة الهلوسة واحترام قيود الأوامر المطلوبة بدقة هندسية مبهرة.',
        '["ميزة Artifacts تسرع بناء الواجهات", "فهم استثنائي للغات البرمجة", "لغة عربية راقية ورصينة"]',
        '["انقطاعات قصيرة في ساعات الضغط القصوى", "لا يحتوي متصفح ويب مباشر"]',
        'أداة لا غنى عنها لكل مطور وصانع محتوى يبحث عن الإنتاجية القصوى.'
      )
    `);

    // 8. Seed Tutorials
    await query(`
      INSERT INTO tutorials (slug, title, excerpt, content, difficulty, read_time, steps)
      VALUES (
        'how-to-build-fullstack-app-with-cursor',
        'دليل خطوة بخطوة: كيفية بناء تطبيق ويب كامل خلال 30 دقيقة باستخدام Cursor AI',
        'تعلم أسرار توجيه محرر Cursor لبناء قاعدة بيانات، واجهة مستخدم، ومسارات API مع أفضل الممارسات.',
        'في هذا الدليل العملي سنتعرف على كيفية استخدام الـ Composer داخل Cursor لتوليد كود نظيف وتجنب الأخطاء الشائعة.',
        'متوسط',
        '10 دقائق',
        '[
          {"title": "تهيئة ملفات المشروع", "desc": "إنشاء هيكل المجلدات وتثبيت المكتبات الأساسية"},
          {"title": "كتابة سياق المشروع (Rules)", "desc": "تزويد المحرر بملف قواعد يرشده لنوع التقنيات وأسلوب الكود المفضل"},
          {"title": "توليد الـ Backend والـ API", "desc": "استخدام ميزة Cmd+I لتوليد دوال قاعدة البيانات والتحقق من المدخلات"},
          {"title": "المعاينة وتصحيح الأخطاء", "desc": "فحص سجلات الأخطاء ومطالبة المحرر بإصلاحها تلقائياً"}
        ]'
      )
    `);

    // 9. Seed Articles
    await query(`
      INSERT INTO articles (slug, title, excerpt, content, read_time, is_featured)
      VALUES 
      (
        'top-ai-tools-transforming-business-2026',
        'أهم 10 أدوات ذكاء اصطناعي ستغير طريقة عمل الشركات ورواد الأعمال في 2026',
        'نظرة استشرافية على أبرز الحلول الذكية التي ترفع كفاءة فرق العمل وتختصر التكاليف بنسب تصل إلى 60%.',
        'يشهد عام 2026 نضجاً غير مسبوق في وكلاء الذكاء الاصطناعي المستقلين (AI Agents) القادرين على إدارة المهام المعقدة دون تدخل بشري دائم...',
        '7 دقائق',
        TRUE
      ),
      (
        'prompt-engineering-mastery-guide',
        'الدليل الشامل لهندسة الأوامر (Prompt Engineering) للحصول على أفضل النتائج',
        'تعلم القواعد الذهبية لصياغة أوامر فعالة تضمن دقة الإجابات وتلغي الهلوسة في نماذج اللغة الكبيرة.',
        'صياغة البرومبت لم تعد مجرد كتابة سؤال عادي، بل هندسة لغوية تعتمد على تحديد الدور، السياق، المخرجات المستهدفة، والقيود الصارمة...',
        '8 دقائق',
        TRUE
      )
    `);

    // 10. Seed Resources
    await query(`
      INSERT INTO resources (slug, title, type, description, icon, is_free)
      VALUES
      ('ultimate-system-prompts-pack', 'حزمة الأوامر الاحترافية لكتابة المحتوى والبرمجة', 'قالب', 'أكثر من 150 أمراً جاهزاً ومجرباً لتحسين أداء النماذج اللغوية', 'Layers', TRUE),
      ('ai-tools-selection-framework', 'إطار تقييم واختيار أدوات الذكاء الاصطناعي للشركات', 'دليل', 'ملف PDF تفصيلي يرشد المدراء لاختيار الأداة المناسبة وفق معايير الأمان والتكلفة', 'FileText', TRUE),
      ('modern-ai-glossary-arabic', 'القاموس المصور لمصطلحات الذكاء الاصطناعي باللغة العربية', 'كتاب إلكتروني', 'شرح مبسط ومصور لمفاهيم التعلم العميق ونوافذ السياق والـ RAG', 'BookOpen', TRUE)
    `);

    // 11. Seed Initial Audit Log
    await query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES ($1, 'SEED_DATABASE', 'SYSTEM', 'initial', '{"status": "success", "message": "Initialized production-ready schema and demo catalog"}')
    `, [adminUser.rows[0].id]);

    console.log('Database seeded successfully with rich, original Arabic content!');
  }
}
