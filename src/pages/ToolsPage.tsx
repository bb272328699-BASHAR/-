import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Layers, Loader2, Sparkles, X, ChevronRight, ChevronLeft, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Tool, Category } from '../types.ts';
import { ToolCard } from '../components/ToolCard.tsx';
import { ToolsSidebarFilter, FilterState } from '../components/ToolsSidebarFilter.tsx';
import { AdSlot } from '../components/AdSlot.tsx';
import { updateDocumentSEO } from '../utils/seo.ts';

interface ToolsPageProps {
  categories: Category[];
  initialCategory?: string;
  initialFilter?: string;
  navigate: (path: string) => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ categories, initialCategory, initialFilter, navigate }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'all'); // trending, popular, new
  const [sortBy, setSortBy] = useState('rating'); // rating, newest, reviews, name
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Local Sidebar Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    arabicSupport: false,
    freeAvailable: false,
    noRegistration: false,
    verifiedOnly: false,
    hasApi: false,
    hasMobileApp: false,
    hasBrowserExtension: false,
    isOpenSource: false,
    selectedCategory: initialCategory || 'all',
    selectedPricing: [],
    subscriptionType: 'all',
    maxPriceLimit: 0,
    minRating: 0,
    availability: 'all',
    easeOfUse: 'all',
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: search.trim(),
        category: selectedCategory !== 'all' ? selectedCategory : filterState.selectedCategory,
        pricing: selectedPricing,
        filter: selectedFilter,
        sort: sortBy,
        page: currentPage.toString(),
        limit: '36',
      });
      const res = await fetch(`/api/tools?${queryParams.toString()}`);
      const data = await res.json();
      setTools(Array.isArray(data?.tools) ? data.tools : []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (e) {
      console.error('Failed to fetch tools', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [selectedCategory, selectedPricing, selectedFilter, sortBy, currentPage, filterState.selectedCategory]);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    const catName = categories.find(c => c.slug === selectedCategory)?.name;
    const title = catName 
      ? `أدوات ${catName} للذكاء الاصطناعي 2026 | دليل الذكاء الاصطناعي` 
      : 'دليل أدوات الذكاء الاصطناعي الشامل 2026 | تصنيفات ومقارنات وأسعار';
    const description = catName 
      ? `استكشف أفضل أدوات الذكاء الاصطناعي المتخصصة في ${catName}. تصفية حسب دعم العربية، مجانية الاستخدام، وسهولة التسجيل.`
      : 'ابحث واستكشف أكثر من 150 أداة ذكاء اصطناعي موثوقة في شتى المجالات (نصوص، تصميم، برمجة، فيديو، أعمال) مع مراجعات وأسعار 2026.';

    updateDocumentSEO({
      title,
      description,
      canonicalUrl: `${origin}/ai-tools`,
      ogType: 'website',
      keywords: 'أدوات الذكاء الاصطناعي, دليل الذكاء الاصطناعي 2026, برامج الذكاء الاصطناعي, مقارنة أدوات AI',
    });
  }, [selectedCategory, categories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTools();
  };

  // Local filtering calculation using locally managed state
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // 1. Arabic Support
      if (filterState.arabicSupport) {
        const match =
          tool.arabic_support?.includes('كامل') ||
          tool.arabic_support?.includes('جزئي') ||
          tool.description?.includes('عرب') ||
          tool.tagline?.includes('عرب') ||
          tool.name?.includes('عرب') ||
          (Array.isArray(tool.features) && tool.features.some(f => f.title?.includes('عرب') || f.description?.includes('عرب')));
        if (!match) return false;
      }

      // 2. Free Option Available
      if (filterState.freeAvailable) {
        const isFree = ['Free', 'Freemium', 'Free Trial'].includes(tool.pricing_type);
        if (!isFree) return false;
      }

      // 3. Verified Tools Only
      if (filterState.verifiedOnly) {
        if (!tool.is_verified) return false;
      }

      // 4. No Registration Required
      if (filterState.noRegistration) {
        const text = `${tool.description} ${tool.tagline} ${tool.who_is_it_for || ''}`.toLowerCase();
        const matchNoReg = text.includes('بدون تسجيل') || text.includes('مباشر') || text.includes('بدون حساب') || text.includes('لا يتطلب تسجيل');
        if (!matchNoReg) return false;
      }

      // 5. Developer API Available
      if (filterState.hasApi) {
        const text = `${tool.description} ${tool.tagline} ${JSON.stringify(tool.features || [])}`.toLowerCase();
        const matchApi = text.includes('api') || text.includes('واجهة برمجة') || text.includes('ربط برمجي');
        if (!matchApi) return false;
      }

      // 6. Mobile App Available
      if (filterState.hasMobileApp) {
        const text = `${tool.description} ${tool.tagline} ${JSON.stringify(tool.features || [])}`.toLowerCase();
        const matchMobile = text.includes('تطبيق') || text.includes('جوال') || text.includes('ios') || text.includes('android') || text.includes('هاتف');
        if (!matchMobile) return false;
      }

      // 7. Browser Extension
      if (filterState.hasBrowserExtension) {
        const text = `${tool.description} ${tool.tagline} ${JSON.stringify(tool.features || [])}`.toLowerCase();
        const matchExt = text.includes('متصفح') || text.includes('chrome') || text.includes('extension') || text.includes('إضافة');
        if (!matchExt) return false;
      }

      // 8. Open Source
      if (filterState.isOpenSource) {
        const text = `${tool.description} ${tool.tagline} ${JSON.stringify(tool.features || [])}`.toLowerCase();
        const matchOpen = text.includes('مفتوح المصدر') || text.includes('open source') || text.includes('github') || text.includes('open-source');
        if (!matchOpen) return false;
      }

      // 9. Subscription Type
      if (filterState.subscriptionType !== 'all') {
        const text = `${tool.pricing_type} ${tool.starting_price || ''} ${JSON.stringify(tool.pricingPlans || [])}`.toLowerCase();
        if (filterState.subscriptionType === 'monthly' && !text.includes('شهري') && !text.includes('/mo') && !text.includes('month')) {
          return false;
        }
        if (filterState.subscriptionType === 'yearly' && !text.includes('سنوي') && !text.includes('year') && !text.includes('/yr')) {
          return false;
        }
        if (filterState.subscriptionType === 'usage' && !text.includes('استهلاك') && !text.includes('token') && !text.includes('credit')) {
          return false;
        }
      }

      // 10. Max Price Limit
      if (filterState.maxPriceLimit > 0) {
        const priceNum = parseFloat((tool.starting_price || '').replace(/[^0-9.]/g, ''));
        if (!isNaN(priceNum) && priceNum > filterState.maxPriceLimit) {
          return false;
        }
      }

      // 11. Category Filter
      if (filterState.selectedCategory !== 'all') {
        const inCategory = Array.isArray(tool.categories) && tool.categories.some((c) => c.slug === filterState.selectedCategory);
        if (!inCategory && selectedCategory === 'all') return false;
      }

      // 12. Selected Pricing Checkboxes from Sidebar
      if (filterState.selectedPricing.length > 0) {
        if (!filterState.selectedPricing.includes(tool.pricing_type)) return false;
      }

      // 13. Minimum Rating
      if (filterState.minRating > 0) {
        if (Number(tool.rating) < filterState.minRating) return false;
      }

      // 14. Availability Platform Filter (التوفر ومنصة التشغيل)
      if (filterState.availability !== 'all') {
        const fullText = `${tool.description || ''} ${tool.tagline || ''} ${JSON.stringify(tool.features || [])} ${tool.website_url || ''}`.toLowerCase();
        if (filterState.availability === 'web') {
          // Web-based SaaS: Most tools or explicit web mention
          const isWeb = fullText.includes('web') || fullText.includes('سحاب') || fullText.includes('متصفح') || !fullText.includes('فقط لنظام');
          if (!isWeb) return false;
        } else if (filterState.availability === 'browser_extension') {
          const matchExt = fullText.includes('متصفح') || fullText.includes('chrome') || fullText.includes('extension') || fullText.includes('إضافة');
          if (!matchExt) return false;
        } else if (filterState.availability === 'mobile') {
          const matchMob = fullText.includes('تطبيق') || fullText.includes('جوال') || fullText.includes('ios') || fullText.includes('android') || fullText.includes('هاتف');
          if (!matchMob) return false;
        } else if (filterState.availability === 'api') {
          const matchApi = fullText.includes('api') || fullText.includes('واجهة برمجة') || fullText.includes('ربط برمجي');
          if (!matchApi) return false;
        } else if (filterState.availability === 'open_source') {
          const matchOpen = fullText.includes('مفتوح المصدر') || fullText.includes('open source') || fullText.includes('github') || fullText.includes('open-source');
          if (!matchOpen) return false;
        }
      }

      // 15. Ease of Use Filter (سهولة الاستخدام ومستوى الخبرة)
      if (filterState.easeOfUse !== 'all') {
        const combined = `${tool.description || ''} ${tool.tagline || ''} ${tool.who_is_it_for || ''} ${JSON.stringify(tool.pros || [])}`.toLowerCase();
        if (filterState.easeOfUse === 'beginner') {
          const matchBeginner = combined.includes('مبتد') || combined.includes('سهل') || combined.includes('بسيط') || combined.includes('سريع') || combined.includes('بدون تعقيد');
          if (!matchBeginner) return false;
        } else if (filterState.easeOfUse === 'no_code') {
          const matchNoCode = combined.includes('no-code') || combined.includes('nocode') || combined.includes('بدون برمجة') || combined.includes('سحب وإفلات') || combined.includes('قوالب') || combined.includes('بدون كود');
          if (!matchNoCode) return false;
        } else if (filterState.easeOfUse === 'intermediate') {
          const matchInter = combined.includes('محترف') || combined.includes('فرق') || combined.includes('شرك') || combined.includes('متقدم') || combined.includes('إنتاج');
          if (!matchInter) return false;
        } else if (filterState.easeOfUse === 'advanced_dev') {
          const matchDev = combined.includes('مطور') || combined.includes('برمج') || combined.includes('api') || combined.includes('كود') || combined.includes('sdk') || combined.includes('مهندس') || combined.includes('تقني');
          if (!matchDev) return false;
        }
      }

      return true;
    });
  }, [tools, filterState, selectedCategory]);

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedPricing('all');
    setSelectedFilter('all');
    setSortBy('rating');
    setFilterState({
      arabicSupport: false,
      freeAvailable: false,
      noRegistration: false,
      verifiedOnly: false,
      hasApi: false,
      hasMobileApp: false,
      hasBrowserExtension: false,
      isOpenSource: false,
      selectedCategory: 'all',
      selectedPricing: [],
      subscriptionType: 'all',
      maxPriceLimit: 0,
      minRating: 0,
      availability: 'all',
      easeOfUse: 'all',
    });
    setCurrentPage(1);
  };

  const activeFiltersBadgeCount = 
    (filterState.arabicSupport ? 1 : 0) +
    (filterState.freeAvailable ? 1 : 0) +
    (filterState.noRegistration ? 1 : 0) +
    (filterState.verifiedOnly ? 1 : 0) +
    (filterState.hasApi ? 1 : 0) +
    (filterState.hasMobileApp ? 1 : 0) +
    (filterState.hasBrowserExtension ? 1 : 0) +
    (filterState.isOpenSource ? 1 : 0) +
    (filterState.selectedCategory !== 'all' ? 1 : 0) +
    filterState.selectedPricing.length +
    (filterState.subscriptionType !== 'all' ? 1 : 0) +
    (filterState.maxPriceLimit > 0 ? 1 : 0) +
    (filterState.minRating > 0 ? 1 : 0) +
    (filterState.availability !== 'all' ? 1 : 0) +
    (filterState.easeOfUse !== 'all' ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" dir="rtl">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>المستودع الرقمي لأدوات AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          استكشف جميع أدوات الذكاء الاصطناعي
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
          ابحث وفلتر بين عشرات الأدوات المتطورة وفقاً للوظيفة، ميزات اللغة العربية، نموذج التسعير، أو تقييمات الخبراء.
        </p>
      </div>

      {/* Top Search & Controls Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو التخصص أو الميزات المفتاحية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 outline-none text-slate-800"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchTools(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer shrink-0"
            >
              بحث
            </button>

            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors border border-slate-200 cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>فلاتر الجانب ({activeFiltersBadgeCount})</span>
            </button>
          </div>
        </form>

        {/* Quick Filter Tags & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium">تصنيف سريع:</span>
            {['trending', 'popular', 'new'].map((f) => (
              <button
                key={f}
                onClick={() => { setSelectedFilter(selectedFilter === f ? 'all' : f); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                  selectedFilter === f 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'trending' ? 'الرائجة 🔥' : f === 'popular' ? 'الشائعة ⭐' : 'الجديدة ✨'}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Instant Arabic Toggle */}
            <button
              onClick={() => setFilterState(prev => ({ ...prev, arabicSupport: !prev.arabicSupport }))}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer border ${
                filterState.arabicSupport
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200/80'
              }`}
            >
              يدعم العربية 🇸🇦
            </button>

            {/* Instant Free Toggle */}
            <button
              onClick={() => setFilterState(prev => ({ ...prev, freeAvailable: !prev.freeAvailable }))}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer border ${
                filterState.freeAvailable
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200/80'
              }`}
            >
              خطة مجانية 🆓
            </button>

            {/* Instant Verified Toggle */}
            <button
              onClick={() => setFilterState(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer border ${
                filterState.verifiedOnly
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200/80'
              }`}
            >
              مفحوص ومعتمد 🛡️
            </button>

            {/* Instant No-Code Toggle */}
            <button
              onClick={() => setFilterState(prev => ({ ...prev, easeOfUse: prev.easeOfUse === 'no_code' ? 'all' : 'no_code' }))}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer border ${
                filterState.easeOfUse === 'no_code'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200/80'
              }`}
            >
              بدون برمجة No-Code ⚡
            </button>

            {/* Instant Mobile App Toggle */}
            <button
              onClick={() => setFilterState(prev => ({ ...prev, availability: prev.availability === 'mobile' ? 'all' : 'mobile' }))}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer border ${
                filterState.availability === 'mobile'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200/80'
              }`}
            >
              تطبيق هاتف 📱
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="rating">الأعلى تقييماً ⭐</option>
                <option value="newest">الأحدث إضافة ✨</option>
                <option value="reviews">الأكثر مراجعات 💬</option>
                <option value="name">أبجدياً (أ - ي)</option>
              </select>
            </div>

            {activeFiltersBadgeCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة تعيين</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Grid: Sidebar Filter + Results Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filter Component */}
        <ToolsSidebarFilter
          filterState={filterState}
          setFilterState={setFilterState}
          categories={categories}
          totalMatching={filteredTools.length}
          totalLoaded={tools.length}
          resetAllFilters={resetAllFilters}
          isMobileOpen={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Results Area */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Active Filters Badges Summary */}
          {activeFiltersBadgeCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 text-xs">
              <span className="font-bold text-indigo-900 shrink-0">الفلاتر المطبقة حالياً:</span>

              {filterState.arabicSupport && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-800 font-bold shadow-2xs">
                  يدعم العربية
                  <button onClick={() => setFilterState((p) => ({ ...p, arabicSupport: false }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.freeAvailable && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                  خيار مجاني
                  <button onClick={() => setFilterState((p) => ({ ...p, freeAvailable: false }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.verifiedOnly && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-800 font-bold shadow-2xs">
                  أدوات موثقة
                  <button onClick={() => setFilterState((p) => ({ ...p, verifiedOnly: false }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.noRegistration && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-purple-200 text-purple-800 font-bold shadow-2xs">
                  بدون تسجيل
                  <button onClick={() => setFilterState((p) => ({ ...p, noRegistration: false }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.hasApi && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-cyan-200 text-cyan-800 font-bold shadow-2xs">
                  واجهة API
                  <button onClick={() => setFilterState((p) => ({ ...p, hasApi: false }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.hasMobileApp && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-blue-800 font-bold shadow-2xs">
                  تطبيق جوال
                  <button onClick={() => setFilterState((p) => ({ ...p, hasMobileApp: false }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.hasBrowserExtension && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-800 font-bold shadow-2xs">
                  إضافة متصفح
                  <button onClick={() => setFilterState((p) => ({ ...p, hasBrowserExtension: false }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.isOpenSource && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-teal-200 text-teal-800 font-bold shadow-2xs">
                  مفتوح المصدر
                  <button onClick={() => setFilterState((p) => ({ ...p, isOpenSource: false }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.subscriptionType !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800 font-bold shadow-2xs">
                  خطة: {filterState.subscriptionType === 'monthly' ? 'شهري' : filterState.subscriptionType === 'yearly' ? 'سنوي' : 'استهلاك'}
                  <button onClick={() => setFilterState((p) => ({ ...p, subscriptionType: 'all' }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.maxPriceLimit > 0 && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-800 font-bold shadow-2xs">
                  أقل من ${filterState.maxPriceLimit}
                  <button onClick={() => setFilterState((p) => ({ ...p, maxPriceLimit: 0 }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.minRating > 0 && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-800 font-bold shadow-2xs">
                  تقييم {filterState.minRating}+
                  <button onClick={() => setFilterState((p) => ({ ...p, minRating: 0 }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.availability !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-cyan-200 text-cyan-800 font-bold shadow-2xs">
                  المنصة: {
                    filterState.availability === 'web' ? 'سحابي (Web)' :
                    filterState.availability === 'browser_extension' ? 'إضافة متصفح' :
                    filterState.availability === 'mobile' ? 'تطبيق جوال' :
                    filterState.availability === 'api' ? 'واجهة API' : 'مفتوح المصدر'
                  }
                  <button onClick={() => setFilterState((p) => ({ ...p, availability: 'all' }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.easeOfUse !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                  سهولة الاستخدام: {
                    filterState.easeOfUse === 'beginner' ? 'مبتدئ وسهل' :
                    filterState.easeOfUse === 'no_code' ? 'بدون برمجة (No-Code)' :
                    filterState.easeOfUse === 'intermediate' ? 'متوسط ومحترف' : 'للمطورين والخبراء'
                  }
                  <button onClick={() => setFilterState((p) => ({ ...p, easeOfUse: 'all' }))} className="hover:text-rose-500 mr-1">✕</button>
                </span>
              )}

              {filterState.selectedPricing.map((pr) => (
                <span key={pr} className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-800 font-bold shadow-2xs">
                  {pr}
                  <button
                    onClick={() =>
                      setFilterState((p) => ({
                        ...p,
                        selectedPricing: p.selectedPricing.filter((item) => item !== pr),
                      }))
                    }
                    className="hover:text-rose-500 mr-1"
                  >
                    ✕
                  </button>
                </span>
              ))}

              <button
                onClick={resetAllFilters}
                className="text-rose-600 hover:text-rose-800 font-extrabold mr-auto underline cursor-pointer"
              >
                تفريغ الكل
              </button>
            </div>
          )}

          {/* Results Count Summary */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-extrabold text-slate-800">
              تم عرض <span className="text-indigo-600">{filteredTools.length}</span> أداة مطابقة للشروط
            </p>
            <span className="text-xs text-slate-400 font-bold">الصفحة {currentPage} من {totalPages}</span>
          </div>

          {/* Tools Grid / Loading / Empty State */}
          {loading ? (
            <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-slate-500 text-sm font-bold">جاري تحميل الأدوات وفقاً لمعايير التصفية...</p>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-800 text-lg">لم نعثر على أدوات تطابق الفلاتر المحددة</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب إلغاء تحديد بعض الميزات المتقدمة في قائمة التصفية الجانبية أو تغيير خيارات البحث.
              </p>
              <button
                onClick={resetAllFilters}
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                إعادة تعيين كافة الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={(slug) => navigate(`/tools/${slug}`)}
                  onCategoryClick={(catSlug) => {
                    setFilterState((prev) => ({ ...prev, selectedCategory: catSlug }));
                  }}
                />
              ))}
            </div>
          )}

          {/* AdSlot in Feed */}
          <AdSlot position="article_incontent" className="my-6" />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    currentPage === p
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
