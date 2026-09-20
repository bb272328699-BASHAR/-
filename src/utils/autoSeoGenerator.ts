import { Tool, Article, Category, Comparison, Tutorial, Review } from '../types.ts';
import { SEOConfig } from './seo.ts';

/**
 * Automatic SEO, Meta Tags & Schema.org JSON-LD Generator
 * Automatically converts Database Tool and Article entities into rich SEO configurations.
 */

export function generateToolSEO(tool: Tool, originUrl?: string): SEOConfig {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai');
  const canonicalUrl = tool.canonical_url || `${origin}/tools/${tool.slug}`;
  const fullTitle = tool.meta_title || `${tool.name} - مراجعة شاملة وميزات وأسعار 2026 | دليل الذكاء الاصطناعي`;
  
  // Auto-generate clean description if missing
  const autoDescription = tool.meta_description || 
    (tool.tagline ? `${tool.tagline} - ${tool.description?.slice(0, 140)}` : tool.description?.slice(0, 150)) || 
    `مراجعة وتفاصيل أداة ${tool.name} للذكاء الاصطناعي، تعرف على أهم المميزات ونموذج التسعير والبدائل المتاحة.`;

  // Auto-generate keywords
  const categoriesList = Array.isArray(tool.categories) ? tool.categories.map(c => c.name).join(', ') : '';
  const keywords = tool.meta_keywords || 
    `${tool.name}, أدوات الذكاء الاصطناعي, مراجعة ${tool.name}, أسعار ${tool.name}, ${tool.pricing_type}, ${categoriesList}, الذكاء الاصطناعي التوليدي`;

  // Main Image
  const imageUrl = tool.og_image_url || tool.cover_image_url || tool.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=80';

  // Extract price number
  const priceNumber = tool.starting_price ? tool.starting_price.replace(/[^0-9.]/g, '') || '0' : '0';

  // Built-in Schema.org JSON-LD Graph (SoftwareApplication + BreadcrumbList + FAQPage)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. SoftwareApplication Schema
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software`,
        'name': tool.name,
        'url': canonicalUrl,
        'image': imageUrl,
        'applicationCategory': 'AI Tool / Business Application',
        'operatingSystem': 'Web, Cloud, Windows, macOS, iOS, Android',
        'description': autoDescription,
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': tool.rating ? String(tool.rating) : '4.8',
          'reviewCount': tool.review_count ? String(tool.review_count) : '12',
          'bestRating': '5',
          'worstRating': '1'
        },
        'offers': {
          '@type': 'Offer',
          'price': priceNumber,
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'category': tool.pricing_type || 'Freemium'
        }
      },
      // 2. BreadcrumbList Schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'الرئيسية',
            'item': origin
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'دليل الأدوات',
            'item': `${origin}/ai-tools`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': tool.name,
            'item': canonicalUrl
          }
        ]
      },
      // 3. FAQPage Schema automatically derived from Tool features
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `ما هي أداة ${tool.name} وكيف تعمل؟`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `${tool.name} هي أداة ذكاء اصطناعي متخصصة. ${tool.tagline || ''} - ${tool.description?.slice(0, 200)}`
            }
          },
          {
            '@type': 'Question',
            'name': `هل أداة ${tool.name} مجانية أم مدفوعة؟`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `نموذج تكلفة أداة ${tool.name} هو ${tool.pricing_type || 'مجاني/مدفوع'}. ${tool.starting_price ? `تبدأ الأسعار من ${tool.starting_price}.` : ''}`
            }
          },
          {
            '@type': 'Question',
            'name': `هل تدعم أداة ${tool.name} اللغة العربية؟`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `دعم اللغة العربية في أداة ${tool.name}: ${tool.arabic_support || 'متوفر بشكل متوافق مع النصوص العربية.'}`
            }
          }
        ]
      }
    ]
  };

  return {
    title: fullTitle,
    description: autoDescription,
    keywords,
    canonicalUrl,
    ogImage: imageUrl,
    ogTitle: tool.og_title || fullTitle,
    ogDescription: tool.og_description || autoDescription,
    ogType: 'product',
    robots: tool.robots_directive || 'index, follow',
    structuredData
  };
}

export function generateArticleSEO(article: Article, originUrl?: string): SEOConfig {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai');
  const canonicalUrl = article.canonical_url || `${origin}/articles/${article.slug}`;
  const fullTitle = article.meta_title || `${article.title} | دليل الذكاء الاصطناعي`;
  
  const autoDescription = article.meta_description || article.excerpt || 
    `${article.title} - مقال تحليلي شامل يستعرض أحدث تطورات واستخدامات تقنيات الذكاء الاصطناعي في العالم العربي.`;

  const keywords = article.meta_keywords || 
    `${article.title}, مقالات ذكاء اصطناعي, تقنية, تحليل, ذكاء اصطناعي توليدي, دليل الذكاء الاصطناعي`;

  const imageUrl = article.og_image_url || article.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&auto=format&fit=crop&q=80';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. TechArticle Schema
      {
        '@type': 'TechArticle',
        '@id': `${canonicalUrl}#article`,
        'headline': article.title,
        'description': autoDescription,
        'image': [imageUrl],
        'url': canonicalUrl,
        'datePublished': article.published_at || new Date().toISOString(),
        'dateModified': article.published_at || new Date().toISOString(),
        'inLanguage': 'ar',
        'author': {
          '@type': 'Person',
          'name': article.author_name || 'فريق التحرير',
          'jobTitle': 'محرر تقني'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'دليل الذكاء الاصطناعي',
          'url': origin,
          'logo': {
            '@type': 'ImageObject',
            'url': `${origin}/logo.png`
          }
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl
        }
      },
      // 2. BreadcrumbList Schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'الرئيسية',
            'item': origin
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'المقالات والتحليلات',
            'item': `${origin}/articles`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': article.title,
            'item': canonicalUrl
          }
        ]
      }
    ]
  };

  return {
    title: fullTitle,
    description: autoDescription,
    keywords,
    canonicalUrl,
    ogImage: imageUrl,
    ogTitle: article.og_title || fullTitle,
    ogDescription: article.og_description || autoDescription,
    ogType: 'article',
    robots: article.robots_directive || 'index, follow',
    structuredData
  };
}

export function generateCategorySEO(category: Category, originUrl?: string): SEOConfig {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai');
  const canonicalUrl = `${origin}/categories/${category.slug}`;
  const fullTitle = `${category.name} - أفضل أدوات وتطبيقات الذكاء الاصطناعي 2026 | دليل الذكاء الاصطناعي`;
  const description = category.description || `استكشف أفضل أدوات الذكاء الاصطناعي المتخصصة في قسم ${category.name}، مع تقييمات تفصيلية ومقارنات أسعار.`;
  const keywords = `${category.name}, أدوات ${category.name}, برامج الذكاء الاصطناعي, تطبيقات ${category.name}, دليل الذكاء الاصطناعي 2026`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        'name': fullTitle,
        'url': canonicalUrl,
        'description': description,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': origin },
          { '@type': 'ListItem', 'position': 2, 'name': 'التصنيفات', 'item': `${origin}/categories` },
          { '@type': 'ListItem', 'position': 3, 'name': category.name, 'item': canonicalUrl }
        ]
      }
    ]
  };

  return {
    title: fullTitle,
    description,
    keywords,
    canonicalUrl,
    ogTitle: fullTitle,
    ogDescription: description,
    ogType: 'website',
    structuredData
  };
}

export function generateComparisonSEO(comp: Comparison, originUrl?: string): SEOConfig {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai');
  const canonicalUrl = `${origin}/comparisons/${comp.slug}`;
  const fullTitle = `${comp.title} - مقارنة تفصيلية أيهما أفضل؟ | دليل الذكاء الاصطناعي`;
  const description = comp.verdict 
    ? `${comp.title}: ${comp.verdict.slice(0, 160)}` 
    : `مقارنة مباشرة وشاملة بين أهم أدوات الذكاء الاصطناعي مع جدول الميزات والأسعار ورأي الخبراء.`;
  const keywords = `${comp.title}, مقارنة أدوات الذكاء الاصطناعي, الفرق بين الأدوات, أيهما أفضل, دليل الذكاء الاصطناعي`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${canonicalUrl}#article`,
        'headline': fullTitle,
        'description': description,
        'url': canonicalUrl,
        'datePublished': comp.created_at || new Date().toISOString(),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': origin },
          { '@type': 'ListItem', 'position': 2, 'name': 'المقارنات المباشرة', 'item': `${origin}/comparisons` },
          { '@type': 'ListItem', 'position': 3, 'name': comp.title, 'item': canonicalUrl }
        ]
      }
    ]
  };

  return {
    title: fullTitle,
    description,
    keywords,
    canonicalUrl,
    ogTitle: fullTitle,
    ogDescription: description,
    ogType: 'article',
    structuredData
  };
}

export function generateTutorialSEO(tutorial: Tutorial, originUrl?: string): SEOConfig {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai');
  const canonicalUrl = `${origin}/tutorials/${tutorial.slug}`;
  const fullTitle = `${tutorial.title} - دليل تعليمي خطوة بخطوة 2026 | دليل الذكاء الاصطناعي`;
  const description = tutorial.content?.slice(0, 160) || `شرح عملي مفصل لتعلم كيفية استخدام وتطبيق ${tutorial.title} بأعلى كفاءة.`;
  const keywords = `${tutorial.title}, شرح ذكاء اصطناعي, دورة تدريبية, خطوات استخدام, دليل تعليمي`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        '@id': `${canonicalUrl}#howto`,
        'name': tutorial.title,
        'description': description,
        'totalTime': tutorial.read_time ? `PT${tutorial.read_time.replace(/[^0-9]/g, '') || '10'}M` : 'PT10M',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': origin },
          { '@type': 'ListItem', 'position': 2, 'name': 'الشروحات والأدلة', 'item': `${origin}/tutorials` },
          { '@type': 'ListItem', 'position': 3, 'name': tutorial.title, 'item': canonicalUrl }
        ]
      }
    ]
  };

  return {
    title: fullTitle,
    description,
    keywords,
    canonicalUrl,
    ogTitle: fullTitle,
    ogDescription: description,
    ogType: 'article',
    structuredData
  };
}

export function generateReviewSEO(review: Review, originUrl?: string): SEOConfig {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai');
  const canonicalUrl = `${origin}/reviews/${review.slug}`;
  const fullTitle = `${review.title} - مراجعة الخبراء والتقييم النهائي | دليل الذكاء الاصطناعي`;
  const description = review.summary || review.detailed_review?.slice(0, 160) || `مراجعة حيادية وتفصيلية شاملة للميزات والعيوب والبدائل المتاحة.`;
  const keywords = `${review.title}, مراجعة أداة, تقييم الخبراء, إيجابيات وسلبيات, تجربة حقيقية`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Review',
        '@id': `${canonicalUrl}#review`,
        'name': review.title,
        'reviewBody': description,
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': review.rating ? String(review.rating) : '4.8',
          'bestRating': '5',
          'worstRating': '1'
        },
        'author': {
          '@type': 'Person',
          'name': review.author_name || 'فريق تحرير دليل الذكاء الاصطناعي'
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': origin },
          { '@type': 'ListItem', 'position': 2, 'name': 'مراجعات الخبراء', 'item': `${origin}/reviews` },
          { '@type': 'ListItem', 'position': 3, 'name': review.title, 'item': canonicalUrl }
        ]
      }
    ]
  };

  return {
    title: fullTitle,
    description,
    keywords,
    canonicalUrl,
    ogTitle: fullTitle,
    ogDescription: description,
    ogType: 'article',
    structuredData
  };
}

export function generateHubSEO(title: string, description: string, path: string, originUrl?: string): SEOConfig {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai');
  const canonicalUrl = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  return {
    title: `${title} | دليل الذكاء الاصطناعي`,
    description,
    canonicalUrl,
    ogTitle: `${title} | دليل الذكاء الاصطناعي`,
    ogDescription: description,
    ogType: 'website'
  };
}
