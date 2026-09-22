import React, { useEffect } from 'react';

export interface ArticleSchemaProps {
  title: string;
  description?: string;
  url?: string;
  cover_image_url?: string;
  published_at?: string;
  updated_at?: string;
  author_name?: string;
  author_role?: string;
  author_url?: string;
  publisher_name?: string;
  publisher_logo?: string;
  wordCount?: number;
  faqs?: { question: string; answer: string }[];
  keywords?: string[];
}

/**
 * Dynamic JSON-LD Schema Injector Component for Articles (E-E-A-T Compliant)
 * Generates and injects TechArticle, Person (Author), Organization (Publisher),
 * and FAQPage structured data into document head.
 */
export const ArticleSchema: React.FC<ArticleSchemaProps> = ({
  title,
  description = '',
  url,
  cover_image_url,
  published_at = new Date().toISOString(),
  updated_at,
  author_name = 'د. حسام الشريف',
  author_role = 'خبير واستراتيجي في الذكاء الاصطناعي',
  author_url,
  publisher_name = 'دليل الذكاء الاصطناعي | Daleel AI',
  publisher_logo = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&h=512&auto=format&fit=crop&q=80',
  wordCount,
  faqs = [],
  keywords = ['الذكاء الاصطناعي', 'أدوات الذكاء الاصطناعي', 'E-E-A-T', 'دليل الذكاء الاصطناعي'],
}) => {
  useEffect(() => {
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://ai-toolsar.netlify.app');
    const pubDate = published_at ? new Date(published_at).toISOString() : new Date().toISOString();
    const modDate = updated_at ? new Date(updated_at).toISOString() : pubDate;

    // 1. Author Person Schema
    const authorSchema = {
      '@type': 'Person',
      '@id': `${currentUrl}#author`,
      name: author_name,
      jobTitle: author_role,
      worksFor: {
        '@type': 'Organization',
        name: publisher_name,
      },
      url: author_url || currentUrl,
      knowsAbout: ['الذكاء الاصطناعي', 'هندسة الأوامر', 'تطوير البرمجيات', 'تحسين محركات البحث'],
    };

    // 2. Publisher Organization Schema
    const publisherSchema = {
      '@type': 'Organization',
      '@id': 'https://ai-toolsar.netlify.app/#organization',
      name: publisher_name,
      url: 'https://ai-toolsar.netlify.app',
      logo: {
        '@type': 'ImageObject',
        url: publisher_logo,
        width: 512,
        height: 512,
      },
    };

    // 3. Main TechArticle / Article Schema
    const articleSchemaGraph: any = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          '@id': `${currentUrl}#article`,
          isPartOf: {
            '@type': 'WebPage',
            '@id': currentUrl,
            url: currentUrl,
            name: title,
          },
          headline: title,
          description: description,
          inLanguage: 'ar',
          image: cover_image_url
            ? [
                {
                  '@type': 'ImageObject',
                  url: cover_image_url,
                  caption: title,
                },
              ]
            : undefined,
          datePublished: pubDate,
          dateModified: modDate,
          author: authorSchema,
          publisher: publisherSchema,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': currentUrl,
          },
          wordCount: wordCount || undefined,
          keywords: keywords.join(', '),
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', 'h2', '.markdown-article p'],
          },
        },
      ],
    };

    // 4. Append FAQPage Schema if FAQs exist
    if (faqs && faqs.length > 0) {
      articleSchemaGraph['@graph'].push({
        '@type': 'FAQPage',
        '@id': `${currentUrl}#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    // Inject Script Element into Head
    const scriptId = 'article-jsonld-schema';
    let scriptElem = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptElem) {
      scriptElem = document.createElement('script');
      scriptElem.id = scriptId;
      scriptElem.type = 'application/ld+json';
      document.head.appendChild(scriptElem);
    }
    scriptElem.textContent = JSON.stringify(articleSchemaGraph, null, 2);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }
    };
  }, [
    title,
    description,
    url,
    cover_image_url,
    published_at,
    updated_at,
    author_name,
    author_role,
    author_url,
    publisher_name,
    publisher_logo,
    wordCount,
    faqs,
    keywords,
  ]);

  return null;
};
