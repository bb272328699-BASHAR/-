import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Loader2, Sparkles, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { Article } from '../types.ts';
import { DEFAULT_ARTICLES } from '../data/defaultCatalog.ts';
import { updateDocumentSEO } from '../utils/seo.ts';
import { generateArticleSEO } from '../utils/autoSeoGenerator.ts';
import { OptimizedImage } from '../components/OptimizedImage.tsx';
import { RelatedArticlesSection } from '../components/RelatedArticlesSection.tsx';
import { RelatedToolsSection } from '../components/RelatedToolsSection.tsx';
import { EEATArticleViewer } from '../components/EEATArticleViewer.tsx';
import { trackPageView } from '../utils/analytics.ts';

interface ArticlesPageProps {
  navigate: (path: string) => void;
  articleSlug?: string;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ navigate, articleSlug }) => {
  const [articles, setArticles] = useState<Article[]>(DEFAULT_ARTICLES);
  const [singleArticle, setSingleArticle] = useState<Article | null>(() => {
    if (articleSlug) {
      return DEFAULT_ARTICLES.find(a => a.slug === articleSlug) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    const fallbackArticle = articleSlug ? DEFAULT_ARTICLES.find(a => a.slug === articleSlug) : null;

    if (articleSlug) {
      fetch(`/api/articles/${articleSlug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && !data.error) {
            setSingleArticle(data);
            const seoConfig = generateArticleSEO(data, origin);
            updateDocumentSEO(seoConfig);
            trackPageView(`/articles/${data.slug || articleSlug}`, 'article', data.id, data.slug || articleSlug);
          } else if (fallbackArticle) {
            setSingleArticle(fallbackArticle);
            const seoConfig = generateArticleSEO(fallbackArticle, origin);
            updateDocumentSEO(seoConfig);
          } else {
            setSingleArticle(null);
          }
        })
        .catch(() => {
          if (fallbackArticle) {
            setSingleArticle(fallbackArticle);
          }
        })
        .finally(() => setLoading(false));
    } else {
      updateDocumentSEO({
        title: 'أحدث مقالات ودراسات الذكاء الاصطناعي | دليل الذكاء الاصطناعي',
        description: 'مجموعة شاملة من المقالات والتحليلات المتخصصة في أحدث تقنيات ونماذج الذكاء الاصطناعي التوليدي والبرمجة والتصميم.',
        canonicalUrl: `${origin}/articles`,
        ogType: 'website'
      });

      fetch('/api/articles')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setArticles(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [articleSlug]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">جاري جلب المقالات...</p>
      </div>
    );
  }

  // Single Article View
  if (articleSlug && singleArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button onClick={() => navigate('/')} className="hover:text-slate-800">الرئيسية</button>
          <span>/</span>
          <button onClick={() => navigate('/articles')} className="hover:text-slate-800">المقالات</button>
          <span>/</span>
          <span className="text-indigo-600 font-bold">{singleArticle.title}</span>
        </nav>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <EEATArticleViewer
            id={singleArticle.id}
            slug={singleArticle.slug}
            title={singleArticle.title}
            excerpt={singleArticle.excerpt}
            content={singleArticle.content}
            author_name={singleArticle.author_name}
            published_at={singleArticle.published_at}
            read_time={singleArticle.read_time}
            cover_image_url={singleArticle.cover_image_url}
            categories={singleArticle.categories}
            onBack={() => navigate('/articles')}
            backLabel="العودة لكافة المقالات"
          />
        </div>

        {/* Related Articles Section */}
        {Array.isArray(singleArticle.relatedArticles) && singleArticle.relatedArticles.length > 0 && (
          <RelatedArticlesSection
            articles={singleArticle.relatedArticles}
            currentTitle={singleArticle.title}
            onSelectArticle={(slug) => navigate(`/articles/${slug}`)}
            onExploreAll={() => navigate('/articles')}
          />
        )}

        {/* Related Tools Section */}
        {Array.isArray(singleArticle.relatedTools) && singleArticle.relatedTools.length > 0 && (
          <RelatedToolsSection
            tools={singleArticle.relatedTools}
            title="أدوات ذكاء اصطناعي ذات صلة بالمقال"
            subtitle="أدوات وتطبيقات متخصصة تخدم الموضوع المطروح في هذا التحليل"
            onSelectTool={(slug) => navigate(`/tools/${slug}`)}
            onExploreMore={() => navigate('/ai-tools')}
          />
        )}
      </div>
    );
  }

  // Articles List View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>مقالات وتحليلات الذكاء الاصطناعي</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          أحدث المقالات والدراسات
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
          رؤى وتحليلات تخصصية حول مستقبل الذكاء الاصطناعي وهندسة الأوامر وتطبيقات الأعمال.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => navigate(`/articles/${art.slug}`)}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3">
              {art.cover_image_url && (
                <div className="w-full h-44 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl bg-slate-100">
                  <OptimizedImage
                    src={art.cover_image_url}
                    alt={art.title}
                    width={400}
                    height={220}
                    aspectRatio="16/9"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    containerClassName="w-full h-full"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{art.read_time}</span>
                <span>•</span>
                <span>{art.author_name}</span>
              </div>

              <h2 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {art.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {art.excerpt}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>قراءة المقال</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
