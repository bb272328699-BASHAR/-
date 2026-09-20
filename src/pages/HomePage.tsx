import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  Layers, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  Mail, 
  BookOpen, 
  Scale, 
  ExternalLink,
  Flame,
  Clock,
  Compass,
  Calculator,
  Trophy,
  ChevronUp
} from 'lucide-react';
import { Tool, Category, Article, Comparison, Review, Tutorial } from '../types.ts';
import { ToolCard } from '../components/ToolCard.tsx';
import { OptimizedImage } from '../components/OptimizedImage.tsx';
import { AdSlot } from '../components/AdSlot.tsx';
import { updateDocumentSEO } from '../utils/seo.ts';
import { SmartNeedNavigator } from '../components/SmartNeedNavigator.tsx';

interface HomePageProps {
  categories: Category[];
  trendingTools: Tool[];
  popularTools: Tool[];
  newTools: Tool[];
  latestReviews: Review[];
  latestComparisons: Comparison[];
  latestTutorials: Tutorial[];
  latestArticles: Article[];
  navigate: (path: string) => void;
  openSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  trendingTools,
  popularTools,
  newTools,
  latestReviews,
  latestComparisons,
  latestTutorials,
  latestArticles,
  navigate,
  openSearch
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [topUpvotedTools, setTopUpvotedTools] = useState<Tool[]>([]);

  useEffect(() => {
    // Fetch community top upvoted tools
    fetch('/api/tools/leaderboard/top?limit=6')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTopUpvotedTools(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    updateDocumentSEO({
      title: 'دليل الذكاء الاصطناعي | Daleel AI - المرجع الأول لأدوات ومقارنات الذكاء الاصطناعي',
      description: 'المرجع العربي الشامل لاكتشاف وتجربة أفضل أدوات وتطبيقات الذكاء الاصطناعي في 2026. مراجعات حقيقية، مقارنات دقيقة، وشروحات عملية.',
      canonicalUrl: `${origin}/`,
      ogType: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${origin}/#website`,
            'url': `${origin}/`,
            'name': 'دليل الذكاء الاصطناعي | Daleel AI',
            'description': 'المرجع العربي الشامل لاكتشاف وتجربة أفضل أدوات وتطبيقات الذكاء الاصطناعي في 2026.',
            'potentialAction': {
              '@type': 'SearchAction',
              'target': `${origin}/ai-tools?search={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          },
          {
            '@type': 'Organization',
            '@id': `${origin}/#organization`,
            'name': 'دليل الذكاء الاصطناعي | Daleel AI',
            'url': origin,
            'logo': `${origin}/logo.png`,
            'sameAs': [
              'https://twitter.com/DaleelAI',
              'https://linkedin.com/company/daleel-ai'
            ]
          }
        ]
      }
    });
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterMsg(data.message || 'تم الاشتراك بنجاح!');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMsg(data.error || 'حدث خطأ، حاول مجدداً');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMsg('تعذر الاتصال بالخادم');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12 sm:pb-16 border-b border-slate-200/70 bg-gradient-to-b from-indigo-50/50 via-white to-white">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-200/30 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-100/70 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-indigo-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>الدليل الأكبر والأشمل للأدوات التوليدية باللغة العربية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.25]">
            اكتشف أحدث وأقوى <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800">أدوات الذكاء الاصطناعي</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            تصفح أكثر من 50+ أداة معتمدة، مع مراجعات معمقة ومقارنات واقعية وأدلة تعليمية تفصيلية مصممة خصيصاً لمطوري وصناع المحتوى العرب.
          </p>

          {/* Interactive Search Bar in Hero */}
          <div className="max-w-2xl mx-auto pt-2">
            <div 
              onClick={openSearch}
              className="flex items-center justify-between bg-white rounded-2xl p-2.5 sm:p-3 shadow-lg shadow-indigo-500/5 border border-slate-200/90 hover:border-indigo-400 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-3 px-3">
                <Compass className="w-5 h-5 text-indigo-600" />
                <span className="text-slate-400 text-sm font-medium">ابحث عن أداة، وظيفة، أو فئة (مثال: محرر فيديو، كلود، برمجة)...</span>
              </div>
              <button 
                type="button" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>بحث</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="block text-2xl font-black text-slate-900">50+</span>
              <span className="text-xs text-slate-500 font-medium">أداة مفحوصة ومعتمدة</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="block text-2xl font-black text-indigo-600">8</span>
              <span className="text-xs text-slate-500 font-medium">أقسام وتصنيفات رئيسية</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="block text-2xl font-black text-slate-900">100%</span>
              <span className="text-xs text-slate-500 font-medium">محتوى عربي أصيل</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="block text-2xl font-black text-emerald-600">يومياً</span>
              <span className="text-xs text-slate-500 font-medium">تحديث ومراجعة مستمرة</span>
            </div>
          </div>

          {/* Quick AI Pro Hub Bar */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              
              <button
                onClick={() => navigate('/advisor')}
                className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 group border border-indigo-200/60"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🤖</span>
                <span className="text-xs font-black">المستشار الذكي</span>
                <span className="text-[10px] text-indigo-600">مطابقة بالذكاء</span>
              </button>

              <button
                onClick={() => navigate('/prompts')}
                className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 group border border-purple-200/60"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🪄</span>
                <span className="text-xs font-black">مكتبة الأوامر</span>
                <span className="text-[10px] text-purple-600">برومبتات جاهزة</span>
              </button>

              <button
                onClick={() => navigate('/stacks')}
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 group border border-emerald-200/60"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">📦</span>
                <span className="text-xs font-black">حزم الأدوات</span>
                <span className="text-[10px] text-emerald-600">حسب تخصصك</span>
              </button>

              <button
                onClick={() => navigate('/alternatives')}
                className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 group border border-amber-200/60"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">⚖️</span>
                <span className="text-xs font-black">دليل البدائل</span>
                <span className="text-[10px] text-amber-600">بدائل مجانية</span>
              </button>

              <button
                onClick={() => navigate('/calculator')}
                className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 group border border-blue-200/60 col-span-2 sm:col-span-1"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
                <span className="text-xs font-black">حاسبة ROI</span>
                <span className="text-[10px] text-blue-600">حساب الوفر</span>
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* 1.5. INTERACTIVE GOAL-BASED NEED NAVIGATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <SmartNeedNavigator navigate={navigate} />
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">الأقسام الأكثر طلباً</h2>
            <p className="text-sm text-slate-500 mt-1">تصفح الأدوات مصنفة وفق طبيعة العمل والمهام</p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>جميع الأقسام</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(categories || []).slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/categories/${cat.slug}`)}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: `${cat.color || '#4F46E5'}15`, color: cat.color || '#4F46E5' }}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base">
                  {cat.name}
                </h3>
                {cat.name_en && (
                  <span className="text-[11px] text-slate-400 block -mt-0.5">{cat.name_en}</span>
                )}
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{cat.tools_count ? `${cat.tools_count} أداة` : 'مفحوصة'}</span>
                <ArrowLeft className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-[-2px] transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ad Placement: Home Top Section Banner */}
      <AdSlot position="home_banner" />

      {/* 3. TRENDING TOOLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">الأدوات الرائجة هذا الأسبوع</h2>
              <p className="text-sm text-slate-500 mt-0.5">الأدوات الأكثر زيارة واستخداماً في المجتمع التقني العربي</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/ai-tools?filter=trending')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(trendingTools || []).slice(0, 6).map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onSelect={(slug) => navigate(`/tools/${slug}`)} 
              onCategoryClick={(catSlug) => navigate(`/categories/${catSlug}`)}
            />
          ))}
        </div>
      </section>

      {/* 4. POPULAR TOOLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">الأعلى تقييماً وشهرة</h2>
              <p className="text-sm text-slate-500 mt-0.5">الحلول الذكية التي حصدت ثقة الخبراء والمستخدمين</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/ai-tools?filter=popular')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(popularTools || []).slice(0, 6).map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onSelect={(slug) => navigate(`/tools/${slug}`)}
              onCategoryClick={(catSlug) => navigate(`/categories/${catSlug}`)}
            />
          ))}
        </div>
      </section>

      {/* 4.5. COMMUNITY UPVOTING LEADERBOARD */}
      {topUpvotedTools.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-slate-900/10 border border-indigo-200/80 dark:border-indigo-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span>قائمة المتصدرين في تصويت المجتمع</span>
                    <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                      تصويت حي
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    أفضل الأدوات التي نالت أعلى نسبة تأييد وتصويت من رواد التقنية وصناع المحتوى العرب
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/ai-tools?filter=popular')}
                className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>استكشف كل الأدوات</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topUpvotedTools.map((tool, index) => (
                <div key={tool.id} className="relative">
                  {/* Rank Badge */}
                  <div className="absolute -top-2.5 -right-2.5 z-10 w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <ToolCard
                    tool={tool}
                    onSelect={(slug) => navigate(`/tools/${slug}`)}
                    onCategoryClick={(catSlug) => navigate(`/categories/${catSlug}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. LATEST COMPARISONS & REVIEWS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Comparisons Column */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30 mb-4">
                <Scale className="w-3.5 h-3.5" />
                <span>مقارنات حاسمة</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">مقارنات الذكاء الاصطناعي وجهاً لوجه</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                مقارنات دقيقة بين النماذج والحلول المتنافسة من حيث الكفاءة، التكلفة، ودقة دعم اللغة العربية لمساعدتك على اتخاذ القرار.
              </p>

              <div className="space-y-3">
                {(latestComparisons || []).slice(0, 3).map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => navigate(`/comparisons/${comp.slug}`)}
                    className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all"
                  >
                    <h4 className="font-bold text-sm text-white hover:text-indigo-300 transition-colors">
                      {comp.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{comp.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => navigate('/comparisons')}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>تصفح جميع المقارنات</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reviews & Tutorials Column */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 mb-4">
                <Star className="w-3.5 h-3.5" />
                <span>مراجعات الخبراء</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">تقييمات وتجارب واقعية</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                مراجعات مستقلة وغير متحيزة للأدوات مع تجربة الميزات الحقيقية ونقاط القوة والضعف قبل الاشتراك.
              </p>

              <div className="space-y-3">
                {(latestReviews || []).slice(0, 3).map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => navigate(`/reviews/${rev.slug}`)}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors">
                        {rev.title}
                      </h4>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                        {rev.rating} ★
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{rev.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => navigate('/reviews')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>تصفح جميع المراجعات</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5.5 INTERACTIVE UTILITIES & ROI SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-indigo-500/20 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-300">
              <Calculator className="w-3.5 h-3.5" />
              <span>أدوات حسابية ومساعدة لاتخاذ القرار</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              كم توفر شركتك فعلياً عند استخدام الذكاء الاصطناعي؟
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              استخدم حاسبة العائد المالي (ROI) لحساب القيمة المالية الصافية وساعات العمل الموفرة لفريقك، أو استعن بالمستشار الذكي ومكتبة الأوامر الجاهزة لتسريع مهامك فوراً.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-center">
            <button
              onClick={() => navigate('/calculator')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Calculator className="w-4 h-4" />
              <span>احسب العائد (ROI Calculator)</span>
            </button>
            <button
              onClick={() => navigate('/advisor')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/15"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>المستشار الذكي</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. LATEST ARTICLES & TUTORIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">المقالات والأدلة التعليمية</h2>
            <p className="text-sm text-slate-500 mt-0.5">دروس تطبيقية وتحليلات معمقة تواكب تسارع التقنية</p>
          </div>
          <button
            onClick={() => navigate('/articles')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>جميع المقالات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(latestArticles || []).slice(0, 3).map((article) => (
            <div
              key={article.id}
              onClick={() => navigate(`/articles/${article.slug}`)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                {article.cover_image_url && (
                  <div className="w-full h-40 overflow-hidden bg-slate-100">
                    <OptimizedImage
                      src={article.cover_image_url}
                      alt={article.title}
                      width={380}
                      height={190}
                      aspectRatio="16/9"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      containerClassName="w-full h-full"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span>{article.read_time}</span>
                    <span>•</span>
                    <span>{article.author_name}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>قراءة المقال</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. NEWSLETTER SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              كن أول من يعرف عن أدوات الذكاء الاصطناعي الجديدة
            </h3>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              انضم إلى أكثر من 14,000+ مهتم ومبتكر في نشرتنا الأسبوعية المجانية؛ ملخص بأهم الأدوات، التحديثات، وأفضل التخفيضات.
            </p>

            <form onSubmit={handleNewsletter} className="pt-4 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="أدخل بريدك الإلكتروني..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200/70 text-sm outline-none focus:bg-white/20 transition-all text-right"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {newsletterStatus === 'loading' ? 'جاري الاشتراك...' : 'اشترك مجاناً'}
              </button>
            </form>

            {newsletterMsg && (
              <p className={`text-xs font-bold pt-2 ${newsletterStatus === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
                {newsletterMsg}
              </p>
            )}

            <p className="text-[11px] text-indigo-300/80 pt-1">
              نحترم خصوصيتك بالكامل. يمكنك إلغاء الاشتراك في أي وقت بنقرة واحدة.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
