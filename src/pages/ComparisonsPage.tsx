import React, { useState, useEffect } from 'react';
import { Scale, ArrowLeft, Loader2, Check, Sparkles, Star, GitCompare, Layers, FileDown } from 'lucide-react';
import { Comparison } from '../types.ts';
import { InteractiveComparisonTool } from '../components/InteractiveComparisonTool.tsx';
import { SocialShareButtons } from '../components/SocialShareButtons.tsx';
import { ErrorBoundary } from '../components/ErrorBoundary.tsx';
import { updateDocumentSEO } from '../utils/seo.ts';
import { generateComparisonSEO } from '../utils/autoSeoGenerator.ts';
import { AdSlot } from '../components/AdSlot.tsx';

interface ComparisonsPageProps {
  navigate: (path: string) => void;
  comparisonSlug?: string;
  initialToolA?: string;
  initialToolB?: string;
  initialToolC?: string;
}

export const ComparisonsPage: React.FC<ComparisonsPageProps> = ({ 
  navigate, 
  comparisonSlug,
  initialToolA,
  initialToolB,
  initialToolC
}) => {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [singleComp, setSingleComp] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab mode: 'interactive' | 'curated'
  const [activeTab, setActiveTab] = useState<'interactive' | 'curated'>(
    initialToolA || initialToolB || initialToolC ? 'interactive' : 'interactive'
  );

  useEffect(() => {
    setLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';

    if (comparisonSlug) {
      fetch(`/api/comparisons/${comparisonSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setSingleComp(data);
            const seo = generateComparisonSEO(data, origin);
            updateDocumentSEO(seo);
          } else {
            setSingleComp(null);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      updateDocumentSEO({
        title: 'مقارنات أدوات الذكاء الاصطناعي 2026 | أيهما أفضل لك؟',
        description: 'قارن وجهاً لوجه بين أشهر نماذج وأدوات الذكاء الاصطناعي: الميزات، الأسعار، دعم العربية، والتقييمات الحقيقية لاتخاذ القرار الصحيح.',
        canonicalUrl: `${origin}/comparisons`,
        ogType: 'website'
      });

      fetch('/api/comparisons')
        .then(res => res.json())
        .then(data => setComparisons(Array.isArray(data) ? data : []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [comparisonSlug]);

  if (loading && comparisonSlug) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">جاري جلب بيانات المقارنة المباشرة...</p>
      </div>
    );
  }

  // Single Curated Comparison View
  if (comparisonSlug && singleComp) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button onClick={() => navigate('/')} className="hover:text-slate-800 cursor-pointer">الرئيسية</button>
          <span>/</span>
          <button onClick={() => navigate('/comparisons')} className="hover:text-slate-800 cursor-pointer">المقارنات</button>
          <span>/</span>
          <span className="text-indigo-600 font-bold truncate">{singleComp.title}</span>
        </nav>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
          <div className="space-y-3 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>مقارنة تفصيلية وجهاً لوجه</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {singleComp.title}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {singleComp.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                title="حفظ المقارنة كملف PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>حفظ كملف PDF</span>
              </button>

              <SocialShareButtons
                title={`${singleComp.title} | دليل الذكاء الاصطناعي`}
                description={singleComp.description}
                variant="compact"
              />
            </div>
          </div>

          {/* Strategic Ad: After main title */}
          <AdSlot position="article_top" className="my-4" />

          {/* Quick Comparison Cards Side-by-Side */}
          {singleComp.tools && singleComp.tools.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {singleComp.tools.map((t: any, i: number) => (
                <div 
                  key={i} 
                  className={`p-6 rounded-2xl border-2 flex flex-col justify-between ${
                    t.is_winner ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {t.logo_url && <img src={t.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />}
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{t.name}</h3>
                          <span className="text-xs text-slate-500">{t.pricing_type}</span>
                        </div>
                      </div>
                      {t.is_winner && (
                        <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          الخيار الأفضل 🏆
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{t.tagline}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">التقييم: <strong className="text-amber-600">{t.rating} ★</strong></span>
                      <span>يبدأ من: <strong className="text-slate-800">{t.starting_price || 'مجاناً'}</strong></span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => navigate(`/tools/${t.slug}`)}
                      className="flex-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      استعراض صفحة {t.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Verdict Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white space-y-3">
            <h3 className="text-lg font-bold text-indigo-400">الخلاصة والقرار النهائي</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{singleComp.verdict}</p>
          </div>

          {/* Strategic Ad: End of Comparison Content */}
          <AdSlot position="article_bottom" className="my-6" />

          {/* Callout to Custom Interactive Tool */}
          <div className="pt-4 text-center no-print">
            <button
              onClick={() => navigate('/comparisons')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <GitCompare className="w-4 h-4" />
              <span>جرب أداة المقارنة المخصصة بين أي أداتين من اختيارك</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Comparisons Hub with Interactive Tool & Curated Articles
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>مقارنات حاسمة ومحايدة باللغة العربية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            مقارنات أدوات الذكاء الاصطناعي
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
            قارن حتى 3 أدوات ذكاء اصطناعي جنباً إلى جنب في جدول مرن يوضح نقاط القوة والضعف، الأسعار، والمواصفات، أو تصفح المقارنات التحريرية.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'interactive'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>أداة المقارنة التفاعلية (حتى 3 أدوات)</span>
          </button>

          <button
            onClick={() => setActiveTab('curated')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'curated'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المقارنات التحريرية ({comparisons.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'interactive' ? (
        <ErrorBoundary isWidget widgetName="أداة المقارنة التفاعلية">
          <InteractiveComparisonTool 
            navigate={navigate} 
            initialToolSlugA={initialToolA}
            initialToolSlugB={initialToolB}
            initialToolSlugC={initialToolC}
          />
        </ErrorBoundary>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparisons.map((comp) => (
              <div
                key={comp.id}
                onClick={() => navigate(`/comparisons/${comp.slug}`)}
                className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h2 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {comp.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {comp.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>عرض المقارنة الكاملة بالمعايير والنتائج</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
