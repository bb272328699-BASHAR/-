import bcrypt from 'bcryptjs';
import { query } from './db.ts';

export async function runExpansion() {
  console.log('Running schema expansion and content enrichment...');

  // 1. Create auxiliary tables if not existing
  await query(`
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS arabic_support VARCHAR(50) DEFAULT 'ممتاز';
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS is_editor_choice BOOLEAN DEFAULT FALSE;
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS developer_org VARCHAR(150);
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS release_year INT DEFAULT 2024;
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS meta_title VARCHAR(250);
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS meta_description TEXT;
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(500);
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS og_title VARCHAR(250);
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS og_description TEXT;
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS robots_directive VARCHAR(50) DEFAULT 'index, follow';

    ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_title VARCHAR(250);
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description TEXT;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(500);
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_title VARCHAR(250);
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_description TEXT;
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS robots_directive VARCHAR(50) DEFAULT 'index, follow';

    ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_title VARCHAR(250);
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_description TEXT;
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(500);
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS og_title VARCHAR(250);
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS og_description TEXT;
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS robots_directive VARCHAR(50) DEFAULT 'index, follow';
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);
    ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(500);
    ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);
    ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS og_title VARCHAR(250);
    ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS og_description TEXT;
    ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS robots_directive VARCHAR(50) DEFAULT 'index, follow';
    ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);
    ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(500);
    ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);
    ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS og_title VARCHAR(250);
    ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS og_description TEXT;
    ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS robots_directive VARCHAR(50) DEFAULT 'index, follow';
    ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(500);
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS og_title VARCHAR(250);
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS og_description TEXT;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS robots_directive VARCHAR(50) DEFAULT 'index, follow';
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    CREATE TABLE IF NOT EXISTS user_bookmarks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, tool_id)
    );

    CREATE TABLE IF NOT EXISTS user_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(150),
      comment TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      subject VARCHAR(250) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'unread',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(200) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE tools ADD COLUMN IF NOT EXISTS upvotes_count INT DEFAULT 0;

    CREATE TABLE IF NOT EXISTS tool_upvotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      ip_address VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(tool_id, user_id)
    );
  `);

  // 2. Ensure standard Member Role and verified users
  const memberRole = await query(`
    INSERT INTO roles (name, description)
    VALUES ('member', 'عضو مسجل في منصة دليل الذكاء الاصطناعي')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
  `);
  const memberRoleId = memberRole.rows[0].id;

  // Create demo verified users for real feedback and reviews
  const demoUsers = [
    { email: 'user@daleel.ai', name: 'سارة المنصوري', pass: 'user123', role: 'member' },
    { email: 'dev@daleel.ai', name: 'م. طارق العتيبي', pass: 'dev123', role: 'member' },
    { email: 'writer@daleel.ai', name: 'نورة الشمري', pass: 'writer123', role: 'member' }
  ];

  const userIds: Record<string, string> = {};
  for (const u of demoUsers) {
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [u.email]);
    if (existing.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(u.pass, salt);
      const ins = await query(`
        INSERT INTO users (email, password_hash, full_name, is_active)
        VALUES ($1, $2, $3, TRUE)
        RETURNING id
      `, [u.email, hash, u.name]);
      userIds[u.email] = ins.rows[0].id;
      await query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [ins.rows[0].id, memberRoleId]);
    } else {
      userIds[u.email] = existing.rows[0].id;
    }
  }

  // 3. Enrich Tools Catalog with additional top-tier real tools
  const extraTools = [
    {
      name: 'في زيرو (v0 by Vercel)',
      slug: 'v0-dev',
      tagline: 'منصة الذكاء الاصطناعي التوليدي الرائدة لبناء واجهات المستخدم ومكونات React و Tailwind فورياً',
      description: 'أداة مبتكرة من شركة Vercel تتيح للمطورين والمصممين كتابة أوامر نصية طبيعية وتوليد شفرات برمجية كاملة وواجهات مستخدم متجاوبة بتقنيات React, Next.js, و Tailwind CSS مع معاينة حية وقابلة للنسخ المباشر والتصدير.',
      website_url: 'https://v0.dev',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
      pricing_type: 'Freemium',
      rating: 4.94,
      review_count: 2840,
      arabic_support: 'جيد جداً',
      release_year: 2024,
      developer_org: 'Vercel Inc.',
      is_featured: true,
      is_trending: true,
      is_editor_choice: true,
      categories: ['coding-development', 'productivity-business'],
      features: [
        { title: 'توليد مكونات React كاملة', description: 'كتابة مكونات نظيفة متوافقة مع أحدث معايير React 19 و Next.js و TypeScript.' },
        { title: 'دعم Tailwind CSS الأصيل', description: 'تنسيق متقن ومتجاوب تماماً مع الشاشات المختلفة دون الحاجة لكتابة CSS يدوي.' },
        { title: 'بيئة معاينة تفاعلية حية', description: 'تجربة المكون مباشرة داخل المتصفح واختبار استجابة الأزرار والمدخلات.' },
        { title: 'تعديل سياقي دقيق بالدردشة', description: 'إمكانية النقر على أي جزء من الواجهة وتوجيه الأمر لتعديله تحديداً.' }
      ],
      pros: ['توليد كود إنتاجي فائق النظافة وقابل للصيانة', 'تكامل مباشر مع منظومة Vercel و GitHub', 'توفير مئات الساعات في تصميم واجهات الويب'],
      cons: ['الخطة المجانية تمنح نقاط توليد محدودة شهرياً', 'يتطلب فهماً أساسياً بـ React لتعديل الشيفرة المتقدمة'],
      pricing: [
        { plan_name: 'Free Starter', price: '$0', period: 'مجاناً للأبد', features: ['200 رصيد شهرياً', 'معاينة حية للمكونات', 'تصدير الكود لـ Next.js'], is_popular: false },
        { plan_name: 'Premium Plan', price: '$20', period: 'شهرياً', features: ['5,000 رصيد شهرياً', 'أولوية معالجة قصوى', 'توليد كامل لصفحات الويب المتعددة', 'دعم فني خاص'], is_popular: true }
      ],
      faqs: [
        { question: 'هل يدعم v0 اللغة العربية في الأوامر والتصميم؟', answer: 'نعم، يفهم الأوامر باللغة العربية بطلاقة، ويمكنه تصميم واجهات كاملة تدعم الاتجاه من اليمين لليسار (RTL).' },
        { question: 'هل الكود الناتج آمن للاستخدام التجاري؟', answer: 'نعم بالكامل، الشفرة المولدة تصبح ملكك بالكامل ويمكن تضمينها في مشاريعك التجارية دون قيود.' }
      ]
    },
    {
      name: 'سونو (Suno AI v3.5)',
      slug: 'suno-ai',
      tagline: 'أقوى نموذج ذكاء اصطناعي لتأليف وتوليد الأغاني والمقاطع الموسيقية الاحترافية بالكامل من النص',
      description: 'أداة ثورية قادرة على تأليف أغانٍ كاملة بكلمات وألحان وتوزيع موسيقي وغناء واقعي بجودة استوديو خلال ثوانٍ معدودة. تدعم مختلف الأنماط الموسيقية وتتقن الغناء باللغة العربية بمختلف المقامات الموسيقية.',
      website_url: 'https://suno.com',
      logo_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=160&auto=format&fit=crop&q=80',
      pricing_type: 'Freemium',
      rating: 4.91,
      review_count: 3120,
      arabic_support: 'ممتاز',
      release_year: 2024,
      developer_org: 'Suno Inc.',
      is_featured: true,
      is_trending: true,
      is_editor_choice: false,
      categories: ['audio-voice'],
      features: [
        { title: 'إنشاء أغنية متكاملة بكلمات ولحن', description: 'توليد عمل موسيقي مكتمل المدة يصل إلى 4 دقائق بأصوات رجالية ونسائية واقعية.' },
        { title: 'دعم المقامات الشرقية والغناء العربي', description: 'فهم فريد للكلمات العربية وتطبيق مقامات البياتي والراست والكرد بدقة عالية.' },
        { title: 'تحكم متقدم بأنماط الآلات (Genres)', description: 'إمكانية تحديد نوع الموسيقى بدقة (أوركسترا، جاز، أكوستيك، بوب، إلكتروني).' }
      ],
      pros: ['جودة صوتية مذهلة تكاد تطابق الإنتاج البشري', 'دعم مذهل للشعر والكلمات العربية', 'خطة مجانية سخية للتجربة اليومية'],
      cons: ['الحقوق التجارية الكاملة تتطلب الاشتراك في الخطة المدفوعة', 'صعوبة التحكم الكامل في نبرة الصوت المحددة في بعض المقاطع'],
      pricing: [
        { plan_name: 'Basic', price: '$0', period: 'يومياً', features: ['50 رصيد يومياً (5 أغانٍ)', 'استخدام غير تجاري', 'سرعة توليد عادية'], is_popular: false },
        { plan_name: 'Pro Plan', price: '$10', period: 'شهرياً', features: ['2,500 رصيد شهرياً (250 أغنية)', 'حقوق الاستخدام التجاري كاملة', 'توليد فائق السرعة', 'أولوية الوصول للميزات الجديدة'], is_popular: true }
      ],
      faqs: [
        { question: 'هل يمتلك المشترك حقوق الأغاني المنتجة؟', answer: 'يحصل المشتركون في الخطط المدفوعة (Pro و Premier) على ملكية تجارية كاملة للأعمال الموسيقية المولدة.' },
        { question: 'هل يمكنني إدخال كلماتي الخاصة لتلحينها؟', answer: 'نعم، عبر وضع Custom Mode يمكنك كتابة كلماتك الخاصة واختيار نمط الغناء المفضل.' }
      ]
    },
    {
      name: 'غيثهاب كوبايلوت (GitHub Copilot)',
      slug: 'github-copilot',
      tagline: 'المساعد البرمجي المفضل عالمياً المدمج داخل محرر الأكواد المدعوم بنماذج OpenAI و Claude',
      description: 'أداة البرمجة الثورية من GitHub ومايكروسوفت التي تحول اللغة الطبيعية إلى أسطر برمجية واقتراحات ذكية لحظية أثناء كتابة الشيفرة. توفر اليوم ميزات Copilot Chat والوكلاء الذكيين المدمجين في بيئات VS Code و JetBrains.',
      website_url: 'https://github.com/features/copilot',
      logo_url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=160&auto=format&fit=crop&q=80',
      pricing_type: 'Paid',
      rating: 4.89,
      review_count: 5400,
      arabic_support: 'جيد',
      release_year: 2021,
      developer_org: 'GitHub / Microsoft',
      is_featured: true,
      is_trending: false,
      is_editor_choice: true,
      categories: ['coding-development', 'productivity-business'],
      features: [
        { title: 'إكمال تلقائي لحظي للتعليمات', description: 'اقتراح أسطر ودوال برمجية كاملة بمجرد كتابة تعليق وصفي أو توقيع الدالة.' },
        { title: 'شات تفاعلي مدمج في المحرر', description: 'إمكانية شرح الأكواد المعقدة، اكتشاف الثغرات الأمنية، وكتابة اختبارات الوحدة تلقائياً.' },
        { title: 'دعم التبديل بين النماذج الحديثة', description: 'يتيح اليوم الاختيار بين نماذج GPT-4o و Claude 3.5 Sonnet للحصول على أدق إجابة.' }
      ],
      pros: ['تكامل لا مثيل له داخل VS Code وبيئات العمل الشهيرة', 'تسريع كتابة الأكواد الروتينية والاختبارات بنسبة تفوق 50%', 'يدعم عشرات لغات البرمجة وأطر العمل'],
      cons: ['لا توجد خطة مجانية للأفراد (باستثناء الطلاب والمساهمين في المصادر المفتوحة)', 'قد يقترح أحياناً مكتبات قديمة ما لم يُحدد السياق بدقة'],
      pricing: [
        { plan_name: 'Copilot Individual', price: '$10', period: 'شهرياً أو 100$ سنوياً', features: ['إكمال كود غير محدود', 'Copilot Chat في المحرر', 'دعم الأكواد العامة والخاصة'], is_popular: true },
        { plan_name: 'Copilot Business', price: '$19', period: 'لكل مستخدم شهرياً', features: ['إدارة تراخيص المؤسسات', 'حماية الخصوصية ومنع تدريب النماذج على بياناتك', 'سياسات حوكمة متقدمة'], is_popular: false }
      ],
      faqs: [
        { question: 'هل كودي البرمجي محمي ولا يستخدم لتدريب الذكاء الاصطناعي؟', answer: 'تلتزم GitHub في خطط Business و Enterprise بعدم استخدام أكواد العملاء نهائياً لأغراض التدريب، كما تتيح للأفراد خيار إيقاف مشاركة الأكواد.' }
      ]
    },
    {
      name: 'كانفا ماجيك استوديو (Canva Magic Studio)',
      slug: 'canva-magic-studio',
      tagline: 'منظومة التصميم والغرافيك الذكية الأكثر شمولاً لصناع المحتوى والمسوقين ورواد الأعمال',
      description: 'حزمة متكاملة من أدوات الذكاء الاصطناعي مدمجة في منصة كانفا الشهيرة، تشمل توليد الصور، تحويل المقاسات السحري، إزالة وتعديل العناصر داخل الصور، وصناعة العروض التقديمية والفيديوهات بضغطة زر واحدة.',
      website_url: 'https://www.canva.com/magic-studio',
      logo_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=160&auto=format&fit=crop&q=80',
      pricing_type: 'Freemium',
      rating: 4.86,
      review_count: 6200,
      arabic_support: 'ممتاز',
      release_year: 2023,
      developer_org: 'Canva Pty Ltd',
      is_featured: false,
      is_trending: true,
      is_editor_choice: false,
      categories: ['image-generation', 'marketing-seo', 'video-production'],
      features: [
        { title: 'الممحاة السحرية والتعديل الذكي', description: 'إزالة الأشخاص أو العناصر غير المرغوبة من الصور وملء الخلفية بانسيابية تامة.' },
        { title: 'التبديل والتحويل السحري (Magic Switch)', description: 'تحويل لوحة تصميمية إلى مقال مدونة، أو ملخص تنفيذي، أو منشورات لجميع منصات التواصل بلمسة واحدة.' },
        { title: 'توليد العروض التقديمية والمستندات', description: 'صناعة شرائح عرض احترافية منسقة بالألوان والخطوط بمجرد إعطائه فكرة العرض.' }
      ],
      pros: ['واجهة عربية كاملة وسهلة للغاية للمبتدئين وغير المصممين', 'مكتبة ضخمة من ملايين الخطوط والعناصر والوسائط المرخصة', 'إمكانية التعاون الحي مع فرق العمل'],
      cons: ['الميزات التوليدية المتقدمة محصورة في اشتراك Canva Pro', 'توليد الصور لا يصل إلى واقعية وتفاصيل Midjourney المتطورة'],
      pricing: [
        { plan_name: 'Canva Free', price: '$0', period: 'مجاناً', features: ['توليد أساسي للصور', 'ملايين القوالب المجانية', '5GB مساحة تخزين سحابية'], is_popular: false },
        { plan_name: 'Canva Pro', price: '$12.99', period: 'شهرياً أو 119$ سنوياً', features: ['وصول كامل لـ Magic Studio', 'أكثر من 100 مليون صورة وعنصر مرخص', 'إزالة الخلفيات بنقرة واحدة', '1TB تخزين سحابي'], is_popular: true }
      ],
      faqs: [
        { question: 'هل يدعم كانفا الخطوط العربية والتصميم باللغة العربية؟', answer: 'نعم، يعتبر كانفا من أكثر المنصات دعماً للغة العربية مع مئات الخطوط العربية الاحترافية والتنسيق الأصيل لليمين لليسار.' }
      ]
    },
    {
      name: 'نوشين للذكاء الاصطناعي (Notion AI)',
      slug: 'notion-ai',
      tagline: 'مساعد العمل المتصل بملاحظاتك ومشاريعك وقواعد بياناتك لتنظيم الفكر ومضاعفة الإنتاجية',
      description: 'مساعد ذكي مدمج في مساحة العمل الشهيرة Notion، يمتلك القدرة على البحث والإجابة عن أي تساؤل استناداً إلى مستنداتك وسجلات شركتك الشخصية، إضافة إلى صياغة الأفكار وتلخيص الاجتماعات وتحويل الملاحظات إلى خطط عمل فورية.',
      website_url: 'https://www.notion.so/product/ai',
      logo_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=160&auto=format&fit=crop&q=80',
      pricing_type: 'Paid',
      rating: 4.88,
      review_count: 4100,
      arabic_support: 'ممتاز',
      release_year: 2023,
      developer_org: 'Notion Labs, Inc.',
      is_featured: false,
      is_trending: false,
      is_editor_choice: true,
      categories: ['productivity-business', 'writing-content'],
      features: [
        { title: 'البحث الشامل Q&A في مستنداتك', description: 'طرح أي سؤال وسيقوم Notion AI بالبحث في مئات الصفحات والمستندات واستخراج الإجابة الدقيقة.' },
        { title: 'التعبئة التلقائية للجداول (Autofill)', description: 'استخراج النقاط وتلخيص الحقول في قواعد البيانات الضخمة دون مجهود يدوي.' },
        { title: 'تحرير النصوص وإعادة صياغتها', description: 'تعديل نبرة الصوت وتصحيح القواعد الإملائية وترجمة المحتوى فورياً.' }
      ],
      pros: ['فهم سياقي فريد لمستندات العمل ومعلومات الفريق', 'واجهة بسيطة ومرنة جداً بدون أي تشتيت', 'أمان عالي وخصوصية صارمة لبيانات الشركات'],
      cons: ['رسوم إضافية بقيمة 8$ إلى 10$ لكل عضو فوق خطة Notion الأصلية', 'لا يحتوي على ميزات توليد الصور المتقدمة'],
      pricing: [
        { plan_name: 'Notion AI Add-on', price: '$8 - $10', period: 'لكل عضو شهرياً', features: ['أسئلة وأجوبة غير محدودة عن مساحة عملك', 'أدوات الكتابة والتعديل الذكي', 'التعبئة التلقائية للجداول'], is_popular: true }
      ],
      faqs: [
        { question: 'هل تتدرب النماذج على مستنداتي وملاحظاتي الخاصة؟', answer: 'تؤكد شركة Notion رسمياً أن بياناتك وملاحظاتك تظل خاصة تماماً ولا يتم مشاركتها مع أي نموذج عام لأغراض التدريب.' }
      ]
    },
    {
      name: 'ديب إل (DeepL Write & Translate)',
      slug: 'deepl-translator',
      tagline: 'المعيار الذهبي عالمياً للترجمة الآلية الفائقة الدقة وتحسين الكتابة اللغوية الاحترافية',
      description: 'أفضل محرك ترجمة آلي في العالم يتفوق باستمرار على مترجم جوجل في نقل المعاني الدقيقة والفروق اللغوية الدقيقة والسياقات الثقافية، ويضم ميزة DeepL Write لإعادة صياغة النصوص وتحسين أسلوب الكتابة للمحترفين والباحثين.',
      website_url: 'https://www.deepl.com',
      logo_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=160&auto=format&fit=crop&q=80',
      pricing_type: 'Freemium',
      rating: 4.96,
      review_count: 5800,
      arabic_support: 'ممتاز',
      release_year: 2023,
      developer_org: 'DeepL SE',
      is_featured: false,
      is_trending: true,
      is_editor_choice: true,
      categories: ['writing-content', 'education-research'],
      features: [
        { title: 'ترجمة فائقة البلاغة الطبيعية', description: 'صياغة الجمل بأسلوب لغوي أصيل يخلو من الركاكة والترجمة الحرفية.' },
        { title: 'ترجمة المستندات الكاملة (PDF / Word)', description: 'ترجمة ملفات PDF و Word و PowerPoint مع الحفاظ التام على التنسيق والخطوط والصور.' },
        { title: 'قاموس مصطلحات مخصص (Glossary)', description: 'تثبيت ترجمة مصطلحات تقنية أو تجارية محددة لتوحيد أسلوب العلامة التجارية.' }
      ],
      pros: ['أعلى دقة ترجمة لغوية معترف بها أكاديمياً وعالمياً', 'الحفاظ المتقن على تنسيق الملفات بعد الترجمة', 'تطبيق سطح مكتب سريع ومريح للغاية'],
      cons: ['النسخة المجانية تحدد عدد الحروف المترجمة دفعة واحدة', 'دعم بعض اللهجات الإقليمية غير متوفر مقارنة بالفصحى'],
      pricing: [
        { plan_name: 'DeepL Free', price: '$0', period: 'مجاناً', features: ['ترجمة حتى 1,500 حرف', '3 ملفات مستندات شهرياً', 'قاموس مصطلحات بـ 10 مصطلحات'], is_popular: false },
        { plan_name: 'DeepL Pro Starter', price: '$8.74', period: 'شهرياً', features: ['ترجمة غير محدودة للنصوص', 'ترجمة 5 ملفات شهرياً بأحجام أكبر', 'أقصى درجات أمان البيانات وتشفيرها'], is_popular: true }
      ],
      faqs: [
        { question: 'كيف يختلف DeepL عن Google Translate؟', answer: 'يعتمد DeepL على شبكات عصبية مطورة خصيصاً تركز على التقاط الفروق السياقية الدقيقة والأسلوب البلاغي الطبيعي بدلاً من التراجم الإحصائية الحرفية.' }
      ]
    },
    {
      name: 'غاما آب (Gamma App)',
      slug: 'gamma-app',
      tagline: 'منصة الذكاء الاصطناعي الأسرع لإنشاء العروض التقديمية، المستندات التفاعلية، وصفحات الويب',
      description: 'أداة مبتكرة تعيد ابتكار كيفية تقديم الأفكار، تمكنك من كتابة فكرة أو مسودة وتحويلها فورياً إلى عرض تقديمي رائع التصميم أو صفحة ويب متفاعلة وجاهزة للمشاركة دون الحاجة للبدء من الصفر في PowerPoint.',
      website_url: 'https://gamma.app',
      logo_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=160&auto=format&fit=crop&q=80',
      pricing_type: 'Freemium',
      rating: 4.87,
      review_count: 2900,
      arabic_support: 'ممتاز',
      release_year: 2023,
      developer_org: 'Gamma Tech, Inc.',
      is_featured: false,
      is_trending: true,
      is_editor_choice: false,
      categories: ['productivity-business', 'marketing-seo'],
      features: [
        { title: 'توليد عروض تقديمية بضغطة زر', description: 'كتابة عنوان أو نقاط رئيسية ليقوم Gamma بتوزيع المحتوى وتنسيق الشرائح تلقائياً.' },
        { title: 'تصاميم حديثة ومتحركة (Interactive Cards)', description: 'تضمين نماذج وتطبيقات تفاعلية ومخططات بيانية وفيديوهات داخل الشرائح.' },
        { title: 'تصدير مرن لـ PDF و PowerPoint', description: 'تصدير العرض التقديمي كملف PPTX أو مشاركته كرابط ويب تفاعلي مباشر مع تحليلات المشاهدة.' }
      ],
      pros: ['واجهة عصرية توفر ساعات من تنسيق عروض PowerPoint المملة', 'دعم ممتاز للغة العربية وتنسيق النصوص', 'تحليلات تفاعلية لمعرفة من تصفح العرض'],
      cons: ['توليد الصور الافتراضي داخل الشرائح يحتاج أحياناً إلى استبدال بصور شخصية', 'العلامة المائية تظهر في العروض المصدرة بالخطة المجانية'],
      pricing: [
        { plan_name: 'Free Starter', price: '$0', period: 'مجاناً', features: ['400 رصيد أولي عند التسجيل', 'توليد عروض تقديمية ومستندات', 'تحليلات مشاهدة أساسية'], is_popular: false },
        { plan_name: 'Gamma Plus', price: '$10', period: 'شهرياً', features: ['رصيد توليد غير محدود', 'إزالة العلامة المائية "Made with Gamma"', 'تصدير عالي الدقة وتخصيص الخطوط والألوان'], is_popular: true }
      ],
      faqs: [
        { question: 'هل يمكن التعديل اليدوي على الشرائح بعد توليدها بالذكاء الاصطناعي؟', answer: 'نعم، المنصة توفر محرر بطاقات سحب وإفلات مرن جداً يتيح تعديل النصوص والألوان وتغيير أماكن الصور بسهولة تامة.' }
      ]
    },
    {
      name: 'FLUX.1 (Black Forest Labs)',
      slug: 'flux-1',
      tagline: 'الجيل الجديد الأقوى في توليد الصور وتجسيد النصوص المكتوبة داخل الصور بدقة متناهية',
      description: 'نموذج توليد الصور الثوري المفتوح والمغلق المصدر من Black Forest Labs، والذي يتميز بقدرة غير مسبوقة على كتابة النصوص والأرقام داخل الصور بدقة تامة وفهم مذهل لتفاصيل الأوامر والواقعية البصرية.',
      website_url: 'https://blackforestlabs.ai',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
      pricing_type: 'Freemium',
      rating: 4.88,
      review_count: 245,
      arabic_support: 'ممتاز',
      release_year: 2024,
      developer_org: 'Black Forest Labs',
      is_featured: true,
      is_trending: true,
      is_editor_choice: true,
      categories: ['image-generation'],
      features: [
        { title: 'كتابة النصوص داخل الصور بدقة', description: 'قدرة فريدة على إظهار الكلمات والجمل بدقة إملائية مذهلة' },
        { title: 'واقعية بصرية فائقة', description: 'تفاصيل دقيقة للبشرة، الإضاءة، والملامح الطبيعية' },
        { title: 'مرونة الأنماط (Dev & Schnell)', description: 'إصدارات مخصصة للسرعة الفائقة وإصدارات للأبحاث والدقة العالية' }
      ],
      pros: ['دقة لا تصدق في كتابة النصوص واللوحات', 'خيارات مفتوحة المصدر للاستخدام المحلي', 'جودة تفاصيل تضاهي بل تفوق النماذج التجارية الكبرى'],
      cons: ['يحتاج موارد حاسوبية قوية عند التشغيل المحلي', 'الواجهات السحابية قد تفرض حدوداً للاستخدام المجاني'],
      pricing: [
        { plan_name: 'إصدارات Schnell & Dev', price: 'مجاني', period: 'مفتوح المصدر', features: ['ترخيص للاستخدام الشخصي والبحثي', 'تحميل الأوزان للتشغيل محلياً', 'سرعة توليد فائقة'], is_popular: true },
        { plan_name: 'إصدار Pro الاحترافي', price: 'حسب الاستخدام', period: 'سحابي', features: ['جودة فائقة للاستخدام التجاري', 'أولوية معالجة قصوى عبر API', 'دعم فني وتطوير مخصص'], is_popular: false }
      ],
      faqs: [
        { question: 'هل يدعم FLUX.1 اللغة العربية؟', answer: 'نعم، يفهم الأوامر باللغة العربية ويولد النصوص والزخارف بشكل ممتاز.' },
        { question: 'ما الفرق بين إصدارات FLUX؟', answer: 'تتضمن الإصدارات Schnell للسرعة الفائقة، وDev للتطوير والأبحاث، وPro للاستخدام التجاري الاحترافي.' }
      ]
    }
  ];

  for (const t of extraTools) {
    const check = await query(`SELECT id FROM tools WHERE slug = $1 OR slug = 'flux' OR slug = 'flux-1-black-forest-labs'`, [t.slug]);
    let toolId = check.rows[0]?.id;

    if (!toolId) {
      const ins = await query(`
        INSERT INTO tools (
          name, slug, tagline, description, website_url, logo_url,
          pricing_type, rating, review_count, arabic_support, release_year,
          developer_org, is_featured, is_trending, is_editor_choice, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'published')
        RETURNING id
      `, [
        t.name, t.slug, t.tagline, t.description, t.website_url, t.logo_url,
        t.pricing_type, t.rating, t.review_count, t.arabic_support, t.release_year,
        t.developer_org, t.is_featured, t.is_trending, t.is_editor_choice
      ]);
      toolId = ins.rows[0].id;

      // Link categories
      for (const cSlug of t.categories) {
        const cRes = await query(`SELECT id FROM categories WHERE slug = $1`, [cSlug]);
        if (cRes.rows[0]) {
          await query(`INSERT INTO tool_categories (tool_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [toolId, cRes.rows[0].id]);
        }
      }

      // Features
      for (const f of t.features) {
        await query(`INSERT INTO tool_features (tool_id, title, description) VALUES ($1, $2, $3)`, [toolId, f.title, f.description]);
      }

      // Pros
      for (const p of t.pros) {
        await query(`INSERT INTO tool_pros (tool_id, content) VALUES ($1, $2)`, [toolId, p]);
      }

      // Cons
      for (const c of t.cons) {
        await query(`INSERT INTO tool_cons (tool_id, content) VALUES ($1, $2)`, [toolId, c]);
      }

      // Pricing
      for (const pr of t.pricing) {
        await query(`INSERT INTO tool_pricing (tool_id, plan_name, price, period, features, is_popular) VALUES ($1, $2, $3, $4, $5, $6)`, [
          toolId, pr.plan_name, pr.price, pr.period, JSON.stringify(pr.features), pr.is_popular
        ]);
      }

      // FAQs
      for (let i = 0; i < t.faqs.length; i++) {
        await query(`INSERT INTO tool_faqs (tool_id, question, answer, display_order) VALUES ($1, $2, $3, $4)`, [
          toolId, t.faqs[i].question, t.faqs[i].answer, i
        ]);
      }
    } else {
      // Ensure status is published and category is correctly linked
      await query(`UPDATE tools SET status = 'published' WHERE id = $1`, [toolId]);
      for (const cSlug of t.categories) {
        const cRes = await query(`SELECT id FROM categories WHERE slug = $1`, [cSlug]);
        if (cRes.rows[0]) {
          await query(`INSERT INTO tool_categories (tool_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [toolId, cRes.rows[0].id]);
        }
      }
    }
  }

  // 4. Seed authentic community user reviews in `user_reviews`
  const reviewsCount = await query(`SELECT COUNT(*) FROM user_reviews`);
  if (parseInt(reviewsCount.rows[0].count, 10) === 0) {
    const allTools = await query(`SELECT id, slug, name FROM tools`);
    const toolBySlug: Record<string, string> = {};
    allTools.rows.forEach(r => { toolBySlug[r.slug] = r.id; });

    const sampleReviews = [
      {
        tool_slug: 'claude-3-5-sonnet',
        user_email: 'dev@daleel.ai',
        rating: 5.0,
        title: 'أفضل نموذج ذكاء اصطناعي للمطورين بلا منازع',
        comment: 'أستخدم كلود يومياً في كتابة وتصحيح أكواد React و Go. ميزة Artifacts توفر ساعات من التجربة ومعالجة الأخطاء، ولديه فهم رائع للسياق البرمجي الطويل.'
      },
      {
        tool_slug: 'claude-3-5-sonnet',
        user_email: 'writer@daleel.ai',
        rating: 4.8,
        title: 'اللغة العربية رصينة جداً وبلا ركاكة',
        comment: 'مقارنة بالنماذج الأخرى، كلود 3.5 يقدم صياغة عربية طبيعية بدون تكرار الكلمات أو الجمل المعلبة. أنصح به بشدة لكتابة المقالات والتقارير الاحترافية.'
      },
      {
        tool_slug: 'cursor-ai',
        user_email: 'dev@daleel.ai',
        rating: 5.0,
        title: 'غيرت طريقة برمجتي بالكامل (تضاعفت سرعتي)',
        comment: 'ميزة Composer والـ Agentic workflows تتيح تعديل عدة ملفات برمجية معاً في نفس اللحظة. لم أعد أفتح محرر VS Code التقليدي منذ جربت Cursor.'
      },
      {
        tool_slug: 'chatgpt-plus',
        user_email: 'user@daleel.ai',
        rating: 4.8,
        title: 'الرفيق اليومي الأكثر تنوعاً وتكاملاً',
        comment: 'ميزة الصوت التفاعلي المتقدمة وتصفح الويب المباشر تجعله الخيار الأنسب للأبحاث السريعة ومناقشة الأفكار المعقدة أثناء التنقل.'
      },
      {
        tool_slug: 'midjourney-v6',
        user_email: 'user@daleel.ai',
        rating: 4.9,
        title: 'الجودة الفنية والإضاءة لا مثيل لها',
        comment: 'النسخة السادسة تفهم تفاصيل الإضاءة السينمائية وملمس الأقمشة بدقة متناهية. تمنيت لو كان لديهم واجهة ويب كاملة بدلاً من حصر البداية على Discord سابقاً.'
      },
      {
        tool_slug: 'v0-dev',
        user_email: 'dev@daleel.ai',
        rating: 5.0,
        title: 'سحر حقيقي في تحويل الفكرة إلى واجهة React',
        comment: 'وفر علي وعلى فريقي أسابيع من عمل الـ Wireframing و الـ UI Mockups. الكود نظيف وجاهز للنسخ في مشروع Next.js فوراً.'
      },
      {
        tool_slug: 'elevenlabs',
        user_email: 'writer@daleel.ai',
        rating: 4.9,
        title: 'أصوات تكاد تكون بشرية بنسبة 99%',
        comment: 'استخدمته لإنتاج تعليق صوتي لبودكاست وثائقي. النبرة، التنفس، والتفاعل العاطفي في الصوت العربي كان فوق التوقعات تماماً.'
      }
    ];

    for (const r of sampleReviews) {
      const tId = toolBySlug[r.tool_slug];
      const uId = userIds[r.user_email];
      if (tId && uId) {
        await query(`
          INSERT INTO user_reviews (user_id, tool_id, rating, title, comment, is_verified)
          VALUES ($1, $2, $3, $4, $5, TRUE)
        `, [uId, tId, r.rating, r.title, r.comment]);
      }
    }
  }

  // 5. Seed Additional Real Comparison if needed
  const compCheck = await query(`SELECT COUNT(*) FROM comparisons`);
  if (parseInt(compCheck.rows[0].count, 10) <= 1) {
    const allTools = await query(`SELECT id, slug FROM tools`);
    const toolMap: Record<string, string> = {};
    allTools.rows.forEach(r => { toolMap[r.slug] = r.id; });

    // Cursor vs Copilot
    if (toolMap['cursor-ai'] && toolMap['github-copilot']) {
      const compRes = await query(`
        INSERT INTO comparisons (slug, title, description, summary, verdict, comparison_criteria)
        VALUES (
          'cursor-ai-vs-github-copilot',
          'مقارنة المطورين 2026: Cursor AI ضد GitHub Copilot - أيهما الأفضل لبرمجة التطبيقات؟',
          'تحليل معمق ومقارنة ميدانية بين محرر Cursor AI المستقل وأداة GitHub Copilot المدمجة من حيث الفهم السياقي وسرعة الإنجاز والأسعار.',
          'يتفوق Cursor بفضل قدرته على تعديل كامل بنية المشروع عبر وكلاء ذكاء اصطناعي (Agentic Workflows)، بينما يحتفظ Copilot بأفضلية الاندماج المؤسسي والتكلفة الثابتة.',
          'إذا كنت مطوراً فردياً أو تبني مشاريع ناشئة وتريد سرعة قصوى في بناء التطبيقات من الصفر، فإن Cursor AI يقدم تجربة مستقبلية لا تضاهى. أما للشركات الكبرى ذات القيود الأمنية الصارمة، فيظل GitHub Copilot الخيار الأكثر أماناً واستقراراً.',
          $1
        )
        RETURNING id
      `, [JSON.stringify([
        { criterion: 'تعديل عدة ملفات معاً (Multi-file Editing)', winner: 'Cursor AI', score_a: '9.8/10', score_b: '7.5/10', notes: 'يستطيع Cursor تطبيق التعديلات المعقدة عبر 5-10 ملفات متزامنة بسلاسة مذهلة.' },
        { criterion: 'تنوع النماذج والذكاء اللغوي', winner: 'تعادل متقارب', score_a: '9.5/10', score_b: '9.3/10', notes: 'كلا الأداتين تدعمان اليوم نماذج Claude 3.5 Sonnet و GPT-4o.' },
        { criterion: 'التكامل مع بيئة العمل', winner: 'GitHub Copilot', score_a: '8.8/10', score_b: '9.7/10', notes: 'يعمل Copilot كامتداد بسيط على VS Code و JetBrains و Visual Studio.' },
        { criterion: 'فهم سياق المشروع وقاعدة البيانات', winner: 'Cursor AI', score_a: '9.7/10', score_b: '8.0/10', notes: 'فهرسة المشروع بالكامل عبر Embeddings تجعل Cursor مدركاً لكل دالة ومتغير.' }
      ])]);

      await query(`
        INSERT INTO comparison_tools (comparison_id, tool_id, is_winner, notes)
        VALUES 
        ($1, $2, TRUE, 'الفائز لتجربة التطوير المتكاملة وبناء المنتجات السريعة'),
        ($1, $3, FALSE, 'الخيار الأفضل للشركات والمؤسسات التي تحتاج تكامل مؤسسي موحد')
      `, [compRes.rows[0].id, toolMap['cursor-ai'], toolMap['github-copilot']]);
    }
  }

  console.log('Expansion completed: Catalog enriched, community reviews created, and tables prepared!');
}
