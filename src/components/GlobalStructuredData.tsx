import React, { useEffect } from 'react';

/**
 * Global Structured Data Injector for Google Search Engine (Sitelinks Searchbox & Organization Schema)
 */
export const GlobalStructuredData: React.FC = () => {
  useEffect(() => {
    const scriptId = 'global-website-jsonld';
    let scriptElem = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!scriptElem) {
      scriptElem = document.createElement('script');
      scriptElem.id = scriptId;
      scriptElem.type = 'application/ld+json';
      document.head.appendChild(scriptElem);
    }

    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://ai-toolsar.netlify.app';

    const globalSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${domain}/#website`,
          'url': domain,
          'name': 'دليل الذكاء الاصطناعي | Daleel AI',
          'description': 'المنصة العربية الشاملة لاستكشاف ومقارنة وتقييم أفضل أدوات ومواقع الذكاء الاصطناعي مع شروحات ودراسات E-E-A-T.',
          'inLanguage': 'ar',
          'potentialAction': [
            {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${domain}/ai-tools?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          ],
          'publisher': {
            '@id': `${domain}/#organization`
          }
        },
        {
          '@type': 'Organization',
          '@id': `${domain}/#organization`,
          'name': 'دليل الذكاء الاصطناعي | Daleel AI',
          'url': domain,
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&h=512&auto=format&fit=crop&q=80',
            'width': 512,
            'height': 512
          },
          'sameAs': [
            'https://twitter.com/daleelai',
            'https://linkedin.com/company/daleelai'
          ],
          'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'Customer Support',
            'email': 'support@daleel.ai',
            'availableLanguage': ['Arabic', 'English']
          }
        }
      ]
    };

    scriptElem.textContent = JSON.stringify(globalSchema, null, 2);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, []);

  return null;
};
