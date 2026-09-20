import {
  DEFAULT_TOOLS,
  DEFAULT_ARTICLES,
  DEFAULT_CATEGORIES,
  DEFAULT_COMPARISONS,
  DEFAULT_TUTORIALS,
  DEFAULT_REVIEWS,
} from '../data/defaultCatalog.ts';
import {
  generateToolSEO,
  generateArticleSEO,
  generateCategorySEO,
  generateComparisonSEO,
  generateTutorialSEO,
  generateReviewSEO,
} from './autoSeoGenerator.ts';

/**
 * Dynamic SEO, OpenGraph, Canonical URL & Schema.org Management Utility
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  priceAmount?: string;
  priceCurrency?: string;
  ratingValue?: string;
  reviewCount?: string;
  robots?: string;
  structuredData?: Record<string, any> | null;
}

function setMetaTag(name: string, content: string, isProperty = false) {
  if (!content) return;
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url: string) {
  if (!url) return;
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function setJsonLd(data: Record<string, any> | null) {
  const existing = document.querySelector('script[data-type="dynamic-seo-jsonld"]');
  if (existing) {
    existing.remove();
  }
  if (!data) return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-type', 'dynamic-seo-jsonld');
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Generates an optimized 1200x630 OpenGraph social sharing image URL for maximum CTR
 */
export function generateDynamicOGImage(title: string, categoryName?: string, rawImageUrl?: string): string {
  if (rawImageUrl && rawImageUrl.startsWith('http')) {
    if (rawImageUrl.includes('images.unsplash.com')) {
      const cleanUrl = rawImageUrl.split('?')[0];
      return `${cleanUrl}?w=1200&h=630&auto=format&fit=crop&q=85`;
    }
    return rawImageUrl;
  }

  // Topic-specific curated high-CTR Unsplash backgrounds
  const categoryImages: Record<string, string> = {
    'writing-content': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&auto=format&fit=crop&q=85',
    'image-generation': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=85',
    'coding-development': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&auto=format&fit=crop&q=85',
    'video-production': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=630&auto=format&fit=crop&q=85',
    'audio-music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=630&auto=format&fit=crop&q=85',
    'marketing-seo': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&auto=format&fit=crop&q=85',
    'productivity-chat': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&h=630&auto=format&fit=crop&q=85',
    'business-finance': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=630&auto=format&fit=crop&q=85',
  };

  if (categoryName && categoryImages[categoryName]) {
    return categoryImages[categoryName];
  }

  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=85';
}

export function updateDocumentSEO(config: SEOConfig) {
  const fullTitle = config.title.includes('دليل') ? config.title : `${config.title} | دليل الذكاء الاصطناعي`;
  
  // Document Title
  document.title = fullTitle;

  // Primary Standard Meta Tags
  setMetaTag('description', config.description);
  if (config.keywords) {
    setMetaTag('keywords', config.keywords);
  }
  setMetaTag('robots', config.robots || 'index, follow');

  // Canonical URL
  const canonical = config.canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  if (canonical) {
    setCanonical(canonical);
  }

  // OpenGraph (Facebook / WhatsApp / LinkedIn / Slack)
  const ogTitle = config.ogTitle || fullTitle;
  const ogDesc = config.ogDescription || config.description;
  const ogImg = generateDynamicOGImage(ogTitle, undefined, config.ogImage);
  const ogType = config.ogType || 'website';
  
  setMetaTag('og:site_name', 'دليل الذكاء الاصطناعي | Daleel AI', true);
  setMetaTag('og:title', ogTitle, true);
  setMetaTag('og:description', ogDesc, true);
  setMetaTag('og:image', ogImg, true);
  setMetaTag('og:image:width', '1200', true);
  setMetaTag('og:image:height', '630', true);
  setMetaTag('og:image:alt', config.ogImageAlt || ogTitle, true);
  setMetaTag('og:url', canonical, true);
  setMetaTag('og:type', ogType, true);
  setMetaTag('og:locale', 'ar_AR', true);

  // Additional OpenGraph Types Meta
  if (ogType === 'article') {
    if (config.publishedTime) setMetaTag('article:published_time', config.publishedTime, true);
    if (config.modifiedTime) setMetaTag('article:modified_time', config.modifiedTime, true);
    if (config.author) setMetaTag('article:author', config.author, true);
    if (config.section) setMetaTag('article:section', config.section, true);
  } else if (ogType === 'product') {
    if (config.priceAmount) setMetaTag('product:price:amount', config.priceAmount, true);
    if (config.priceCurrency) setMetaTag('product:price:currency', config.priceCurrency || 'USD', true);
  }

  // Twitter Cards (X)
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:site', '@DaleelAI');
  setMetaTag('twitter:title', ogTitle);
  setMetaTag('twitter:description', ogDesc);
  setMetaTag('twitter:image', ogImg);
  setMetaTag('twitter:image:alt', config.ogImageAlt || ogTitle);
  
  if (config.ratingValue) {
    setMetaTag('twitter:label1', 'التقييم العام');
    setMetaTag('twitter:data1', `★ ${config.ratingValue} / 5 (${config.reviewCount || '10'} تقييم)`);
  } else if (config.author) {
    setMetaTag('twitter:label1', 'الكاتب');
    setMetaTag('twitter:data1', config.author);
  }

  // JSON-LD Structured Data
  if (config.structuredData) {
    setJsonLd(config.structuredData);
  }
}

/**
 * Standardized SEO configurations for primary static routes
 */
export const ROUTE_SEO_MAP: Record<string, SEOConfig> = {
  '/': {
    title: 'دليل الذكاء الاصطناعي | المرجع الأول لأدوات ومقارنات الذكاء الاصطناعي',
    description: 'المرجع العربي الشامل لاكتشاف وتجربة أفضل أدوات وتطبيقات الذكاء الاصطناعي في 2026. مراجعات حقيقية، مقارنات دقيقة، وشروحات عملية.',
    keywords: 'دليل الذكاء الاصطناعي, أدوات الذكاء الاصطناعي, ChatGPT, Midjourney, Claude, مقارنات الذكاء الاصطناعي',
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'دليل الذكاء الاصطناعي',
      'url': 'https://daleel.ai/',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://daleel.ai/ai-tools?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  },
  '/ai-tools': {
    title: 'مكتبة أدوات الذكاء الاصطناعي 2026 | دليل الذكاء الاصطناعي',
    description: 'تصفح وفلتر أكثر من 150+ أداة ذكاء اصطناعي موثوقة ومفحوصة بالكامل مع مقارنة الأسعار والتقييمات الحقيقية ودعم اللغة العربية.',
    keywords: 'أفضل أدوات الذكاء الاصطناعي, برامج الذكاء الاصطناعي, أدوات مجانية, أدوات تصميم, أدوات برمجة',
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'مكتبة أدوات الذكاء الاصطناعي',
      'description': 'دليل شامل لأحدث أدوات الذكاء الاصطناعي في مختلف المجالات والتخصصات.',
      'url': 'https://daleel.ai/ai-tools'
    }
  },
  '/categories': {
    title: 'تصنيفات الذكاء الاصطناعي الشاملة | دليل الذكاء الاصطناعي',
    description: 'استكشف أدوات الذكاء الاصطناعي موزعة بدقة حسب التخصص: توليد الصور، كتابة المحتوى، البرمجة، التسويق الرقمي، والمزيد.',
    keywords: 'تصنيفات الذكاء الاصطناعي, أدوات كتابة, أدوات تصميم, برمجة بالذكاء الاصطناعي',
    ogType: 'website'
  },
  '/comparisons': {
    title: 'مقارنات أدوات الذكاء الاصطناعي وجهاً لوجه | دقة 100%',
    description: 'مقارنات تفصيلية ومحايدة بين أشهر أدوات الذكاء الاصطناعي: ChatGPT مقابل Claude، Midjourney مقابل Flux، وأفضل الخيارات لك.',
    keywords: 'مقارنة أدوات الذكاء الاصطناعي, شات جي بي تي مقابل كلود, ميدجورني مقابل دالي',
    ogType: 'website'
  },
  '/articles': {
    title: 'مقالات وأخبار الذكاء الاصطناعي المتخصصة | دليل الذكاء الاصطناعي',
    description: 'مقالات تحليلية وشروحات معمقة حول ثورة الذكاء الاصطناعي، أفضل الممارسات المهنية، وكيفية زيادة إنتاجيتك العملية.',
    keywords: 'مقالات ذكاء اصطناعي, أخبار الذكاء الاصطناعي, شروحات ChatGPT, استراتيجيات AI',
    ogType: 'website'
  },
  '/tutorials': {
    title: 'شروحات وأدلة تعليمية خطوة بخطوة | دليل الذكاء الاصطناعي',
    description: 'تعلم كيف تحترف أدوات ونماذج الذكاء الاصطناعي من الصفر وحتى الاحتراف مع شروحات عملية خطوة بخطوة باللغة العربية.',
    keywords: 'شروحات الذكاء الاصطناعي, كورس ذكاء اصطناعي عربي, تعلم البرمبت, دروس Midjourney',
    ogType: 'website'
  },
  '/prompts': {
    title: 'مكتبة برومبتات وأوامر الذكاء الاصطناعي الاحترافية',
    description: 'أكبر مكتبة أوامر وبرومبتات جاهزة ومجربة لنماذج ChatGPT و Claude و Midjourney لتحقيق أفضل النتائج النصية والمرئية.',
    keywords: 'برومبتات ذكاء اصطناعي, أوامر شات جي بي تي, برومبت Midjourney, صياغة الأوامر',
    ogType: 'website'
  },
  '/stacks': {
    title: 'حزم أدوات الذكاء الاصطناعي حسب التخصص (AI Stacks)',
    description: 'حزم متكاملة ومختارة بعناية للمطورين، صناع المحتوى، رواد الأعمال، والمسوقين لتوفير مئات الساعات شهرياً.',
    keywords: 'حزم أدوات الذكاء الاصطناعي, AI Stacks, أدوات صناع المحتوى, أدوات المطورين',
    ogType: 'website'
  },
  '/alternatives': {
    title: 'دليل البدائل المجانية والرخيصة لأدوات الذكاء الاصطناعي',
    description: 'اكتشف بدائل قوية ومجانية لأشهر الأدوات المدفوعة مثل ChatGPT Plus و Midjourney و Copilot بأعلى كفاءة وأقل تكلفة.',
    keywords: 'بدائل ChatGPT, بدائل Midjourney مجانية, بدائل كوبايلوت, أدوات ذكاء اصطناعي مجانية',
    ogType: 'website'
  },
  '/advisor': {
    title: 'المستشار الذكي لاختيار أدوات AI المناسبة لعملك',
    description: 'احصل على توصيات فورية ومخصصة بنسبة 100% لأفضل الأدوات التي تناسب مجالك، ميزانيتك، وأهداف مشروعك.',
    keywords: 'مستشار الذكاء الاصطناعي, أداة ترشيح الأدوات, اختيار أداة الذكاء الاصطناعي',
    ogType: 'website'
  },
  '/calculator': {
    title: 'حاسبة العائد على الاستثمار من الذكاء الاصطناعي (ROI)',
    description: 'احسب كم ساعة عمل ودولارات يمكنك توفيرها شهرياً عند استخدام أدوات الذكاء الاصطناعي في مشروعك أو شركتك.',
    keywords: 'حاسبة توفير الذكاء الاصطناعي, عائد الاستثمار, حساب توفير الوقت',
    ogType: 'website'
  },
  '/reviews': {
    title: 'مراجعات وتقييمات أدوات الذكاء الاصطناعي الصادقة 2026',
    description: 'مراجعات مفصلة وتجارب عملية محايدة توضح إيجابيات وسلبيات كل أداة بدون مجاملات لمساعدتك على اتخاذ القرار الصحيح.',
    keywords: 'مراجعات أدوات الذكاء الاصطناعي, تقييمات البرامج, مراجعة ChatGPT, تجربة الأدوات',
    ogType: 'website'
  }
};

/**
 * Format raw slug strings into readable titles (e.g. "chatgpt-plus-vs-claude-3-5" -> "ChatGPT Plus Vs Claude 3 5")
 */
function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Automatically inspects dynamic path routes like `/tools/:slug` or `/articles/:slug`
 * and builds unique high-CTR SEO configurations.
 */
export function getDynamicRouteSEO(pathname: string, originUrl?: string): SEOConfig | null {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai');
  const parts = pathname.split('?')[0].split('/').filter(Boolean);
  if (parts.length < 2) return null;

  const section = parts[0];
  const slug = decodeURIComponent(parts[1]);

  // 1. Tools (/tools/:slug or /tool/:slug)
  if (section === 'tools' || section === 'tool') {
    const matchedTool = DEFAULT_TOOLS.find(t => t.slug === slug);
    if (matchedTool) {
      return generateToolSEO(matchedTool, origin);
    }
    const cleanName = formatSlugToTitle(slug);
    const title = `${cleanName} - مراجعة كاملة، الميزات، والأسعار 2026 | دليل الذكاء الاصطناعي`;
    const description = `استعرض كل ما تريد معرفته عن أداة ${cleanName} للذكاء الاصطناعي: الأسعار، الأداء، الميزات الحقيقية، والبدائل المتاحة.`;
    return {
      title,
      description,
      canonicalUrl: `${origin}/tools/${slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: generateDynamicOGImage(cleanName, undefined),
      ogType: 'product',
    };
  }

  // 2. Articles (/articles/:slug or /article/:slug)
  if (section === 'articles' || section === 'article') {
    const matchedArticle = DEFAULT_ARTICLES.find(a => a.slug === slug);
    if (matchedArticle) {
      return generateArticleSEO(matchedArticle, origin);
    }
    const cleanTitle = formatSlugToTitle(slug);
    const title = `${cleanTitle} | مقالات ودراسات دليل الذكاء الاصطناعي`;
    const description = `قراءة تحليلية وشاملة حول ${cleanTitle} وأحدث مستجدات تقنيات الذكاء الاصطناعي في 2026.`;
    return {
      title,
      description,
      canonicalUrl: `${origin}/articles/${slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: generateDynamicOGImage(cleanTitle, undefined),
      ogType: 'article',
    };
  }

  // 3. Categories (/categories/:slug or /category/:slug)
  if (section === 'categories' || section === 'category') {
    const matchedCat = DEFAULT_CATEGORIES.find(c => c.slug === slug);
    if (matchedCat) {
      return generateCategorySEO(matchedCat, origin);
    }
    const cleanCat = formatSlugToTitle(slug);
    const title = `أفضل أدوات ${cleanCat} بالذكاء الاصطناعي 2026 | دليل الذكاء الاصطناعي`;
    const description = `تصفح واستكشف قائمة بـ أحدث وأقوى أدوات ${cleanCat} المعتمدة لزيادة إنتاجيتك وتطوير أعمالك.`;
    return {
      title,
      description,
      canonicalUrl: `${origin}/categories/${slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: generateDynamicOGImage(cleanCat, slug),
      ogType: 'website',
    };
  }

  // 4. Comparisons (/comparisons/:slug or /comparison/:slug)
  if (section === 'comparisons' || section === 'comparison') {
    const matchedComp = DEFAULT_COMPARISONS.find(c => c.slug === slug);
    if (matchedComp) {
      return generateComparisonSEO(matchedComp, origin);
    }
    const cleanComp = formatSlugToTitle(slug);
    const title = `${cleanComp} - مقارنة تفصيلية أيهما أفضل؟ | دليل الذكاء الاصطناعي`;
    const description = `مقارنة مباشرة وشاملة بين الأدوات: ${cleanComp}. تعرف على جدول الفروقات والأسعار والأداء.`;
    return {
      title,
      description,
      canonicalUrl: `${origin}/comparisons/${slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: generateDynamicOGImage(cleanComp, undefined),
      ogType: 'article',
    };
  }

  // 5. Tutorials (/tutorials/:slug or /tutorial/:slug)
  if (section === 'tutorials' || section === 'tutorial') {
    const matchedTutorial = DEFAULT_TUTORIALS.find(t => t.slug === slug);
    if (matchedTutorial) {
      return generateTutorialSEO(matchedTutorial, origin);
    }
    const cleanTut = formatSlugToTitle(slug);
    const title = `${cleanTut} - شرح عملي خطوة بخطوة | دليل الذكاء الاصطناعي`;
    const description = `دليل تعليمي مفصل يشرح كيفية استخدام وتطبيق ${cleanTut} بأسهل الطرق الممكنة.`;
    return {
      title,
      description,
      canonicalUrl: `${origin}/tutorials/${slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: generateDynamicOGImage(cleanTut, undefined),
      ogType: 'article',
    };
  }

  // 6. Reviews (/reviews/:slug or /review/:slug)
  if (section === 'reviews' || section === 'review') {
    const matchedReview = DEFAULT_REVIEWS.find(r => r.slug === slug);
    if (matchedReview) {
      return generateReviewSEO(matchedReview, origin);
    }
    const cleanRev = formatSlugToTitle(slug);
    const title = `${cleanRev} - تقييم ومراجعة الخبراء الشاملة | دليل الذكاء الاصطناعي`;
    const description = `مراجعة وتقييم محايد لأداة ${cleanRev} من تجارب حقيقية تغطي المميزات، السلبيات، والأسعار.`;
    return {
      title,
      description,
      canonicalUrl: `${origin}/reviews/${slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: generateDynamicOGImage(cleanRev, undefined),
      ogType: 'article',
    };
  }

  return null;
}

/**
 * Automatically applies SEO based on current route
 */
export function applyRouteSEO(pathname: string) {
  // Normalize pathname
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';
  
  if (ROUTE_SEO_MAP[cleanPath]) {
    const config = {
      ...ROUTE_SEO_MAP[cleanPath],
      canonicalUrl: `https://daleel.ai${cleanPath === '/' ? '' : cleanPath}`
    };
    updateDocumentSEO(config);
    return;
  }

  // Try dynamic route resolution
  const dynamicConfig = getDynamicRouteSEO(cleanPath);
  if (dynamicConfig) {
    updateDocumentSEO(dynamicConfig);
  }
}

