/**
 * Dynamic SEO, OpenGraph, Canonical URL & Schema.org Management Utility
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'product';
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
  const ogImg = config.ogImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=80';
  
  setMetaTag('og:site_name', 'دليل الذكاء الاصطناعي | Daleel AI', true);
  setMetaTag('og:title', ogTitle, true);
  setMetaTag('og:description', ogDesc, true);
  setMetaTag('og:image', ogImg, true);
  setMetaTag('og:url', canonical, true);
  setMetaTag('og:type', config.ogType || 'website', true);

  // Twitter Cards
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:site', '@DaleelAI');
  setMetaTag('twitter:title', ogTitle);
  setMetaTag('twitter:description', ogDesc);
  setMetaTag('twitter:image', ogImg);

  // JSON-LD Structured Data
  if (config.structuredData) {
    setJsonLd(config.structuredData);
  }
}

/**
 * Standardized SEO configurations for primary routes
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
  }
}
