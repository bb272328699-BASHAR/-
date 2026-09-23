import React, { useState, useMemo, useEffect } from 'react';
import { 
  Map, 
  Search, 
  Layers, 
  Sparkles, 
  ExternalLink, 
  ArrowUpRight, 
  Star, 
  FileText, 
  GitCompare, 
  BookOpen, 
  Boxes, 
  Cpu, 
  ChevronRight,
  ShoppingBag,
  Calculator,
  Compass,
  Download,
  Rss
} from 'lucide-react';
import { Tool, Category, Comparison, Article } from '../types.ts';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_TOOLS, 
  DEFAULT_COMPARISONS, 
  DEFAULT_ARTICLES, 
} from '../data/defaultCatalog.ts';
import { AdSlot } from '../components/AdSlot.tsx';
import { updateDocumentSEO } from '../utils/seo.ts';

interface ToolsSitemapPageProps {
  navigate: (path: string) => void;
  categories?: Category[];
  tools?: Tool[];
}

interface CategoryGroup {
  category: Category;
  tools: Tool[];
}

export const ToolsSitemapPage: React.FC<ToolsSitemapPageProps> = ({
  navigate,
  categories = DEFAULT_CATEGORIES,
  tools = DEFAULT_TOOLS,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');

  // Setup SEO and Schema.org Structured Data for the HTML Sitemap Page
  useEffect(() => {
    updateDocumentSEO({
      title: 'خريطة الأدوات والموقع الشاملة (HTML Sitemap) | دليل الذكاء الاصطناعي 2026',
      description: 'الفهرس التفاعلي الكامل لجميع أدوات الذكاء الاصطناعي والتصنيفات والمقالات والمقارنات المعتمدة، مرتبة بدقة لسهولة التصفح والأرشفة.',
      canonicalUrl: 'https://ai-toolsar.netlify.app/sitemap',
      ogType: 'website',
      keywords: 'خريطة أدوات الذكاء الاصطناعي, فهرس أدوات AI, تصنيفات الذكاء الاصطناعي, سيلكت الذكاء الاصطناعي, Sitemap Daleel AI',
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': 'https://ai-toolsar.netlify.app/sitemap#collection',
            'name': 'خريطة أدوات ومحتوى دليل الذكاء الاصطناعي',
            'description': 'دليل وفهرس متكامل لجميع صفحات وأدوات وتصنيفات ومقارنات الذكاء الاصطناعي في المنصة.',
            'url': 'https://ai-toolsar.netlify.app/sitemap'
          },
          {
            '@type': 'BreadcrumbList',
            '@id': 'https://ai-toolsar.netlify.app/sitemap#breadcrumb',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'الرئيسية',
                'item': 'https://ai-toolsar.netlify.app/'
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'خريطة الأدوات والموقع (Sitemap)',
                'item': 'https://ai-toolsar.netlify.app/sitemap'
              }
            ]
          }
        ]
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Helper to extract category slugs for a tool
  const getToolCategorySlugs = (tool: Tool): string[] => {
    if (tool.categories && tool.categories.length > 0) {
      return tool.categories.map(c => c.slug);
    }
    const anyTool = tool as any;
    if (anyTool.categorySlug) return [anyTool.categorySlug];
    return [];
  };

  // Filter tools by category, search query, and pricing
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const catSlugs = getToolCategorySlugs(tool);
      const matchesCategory = 
        selectedCategory === 'all' || 
        catSlugs.includes(selectedCategory);

      const matchesPricing = 
        selectedPricing === 'all' || 
        (tool.pricing_type && tool.pricing_type.toLowerCase() === selectedPricing.toLowerCase());

      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [tools, searchQuery, selectedCategory, selectedPricing]);

  // Group filtered tools by category
  const toolsByCategory: CategoryGroup[] = useMemo(() => {
    const groups: CategoryGroup[] = categories.map((cat) => {
      const catTools = filteredTools.filter((tool) => {
        const catSlugs = getToolCategorySlugs(tool);
        return catSlugs.includes(cat.slug);
      });
      return {
        category: cat,
        tools: catTools
      };
    });

    // Handle tools that may not match any explicit category
    const categorizedToolIds = new Set(groups.flatMap(g => g.tools.map(t => t.id)));
    const unassignedTools = filteredTools.filter(t => !categorizedToolIds.has(t.id));

    if (unassignedTools.length > 0) {
      groups.push({
        category: {
          id: 'general-misc',
          name: 'أدوات عامة ومتنوعة',
          name_en: 'General & Multi-purpose Tools',
          slug: 'general',
          description: 'مساعدات الذكاء الاصطناعي الشاملة والأدوات المتنوعة',
          icon: 'Cpu',
          color: '#6366F1'
        },
        tools: unassignedTools
      });
    }

    return groups.filter(g => g.tools.length > 0 || (selectedCategory === 'all' && !searchQuery.trim()));
  }, [categories, filteredTools, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors">الرئيسية</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
          <span className="text-slate-800 font-bold">خريطة الأدوات والموقع (Site Map)</span>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Map className="w-4 h-4 text-indigo-400" />
              <span>فهرس ودليل التصفح الهيكلي الكامل</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              خريطة أدوات ومحتوى دليل الذكاء الاصطناعي
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              تصفح وفهرس كافة أدوات ونماذج الذكاء الاصطناعي المفحوصة والمقالات والمقارنات المعتمدة في قاعدة بياناتنا لعام 2026، مصنفة ومنظمة لتسريع وصولك وتسهيل الأرشفة.
            </p>

            {/* Quick Stats Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-bold text-white">
                <Boxes className="w-4 h-4 text-indigo-400" />
                <span>{tools.length}+ أداة معتمدة</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-bold text-white">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{categories.length} تصنيفات رئيسية</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-bold text-white">
                <GitCompare className="w-4 h-4 text-emerald-400" />
                <span>{DEFAULT_COMPARISONS.length}+ مقارنة دقيقة</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-bold text-white">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{DEFAULT_ARTICLES.length}+ مقال ودليل E-E-A-T</span>
              </span>
            </div>

            {/* Direct Feeds & XML Links */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ملف خريطة الموقع لمحركات البحث (Sitemap.xml)</span>
                <ExternalLink className="w-3 h-3 mr-1" />
              </a>
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                <Rss className="w-3.5 h-3.5 text-amber-400" />
                <span>خلاصة التحديثات (RSS 2.0)</span>
                <ExternalLink className="w-3 h-3 mr-1" />
              </a>
            </div>
          </div>
        </div>

        {/* AdSlot - Top */}
        <AdSlot position="article_top" />

        {/* Quick Navigation Hub (Jump to Section) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <span>فهرس الانتقال السريع للأقسام والتصنيفات</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Index Anchor Links</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="#section-categories"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-colors"
            >
              📁 تصنيفات الأدوات ({categories.length})
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.slug}`}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1"
              >
                <span>{cat.name}</span>
              </a>
            ))}
            <a
              href="#section-comparisons"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-colors"
            >
              ⚖️ المقارنات التنافسية ({DEFAULT_COMPARISONS.length})
            </a>
            <a
              href="#section-articles"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-colors"
            >
              📚 المقالات والأدلة ({DEFAULT_ARTICLES.length})
            </a>
            <a
              href="#section-portals"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-colors"
            >
              🌟 البوابات الذكية والحاسبات
            </a>
          </div>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أي أداة بالاسم أو الميزة (مثل: Claude, Midjourney, برمجة)..."
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-right"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Category Selector */}
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500 text-right cursor-pointer"
              >
                <option value="all">جميع التصنيفات ({categories.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500 text-right cursor-pointer"
              >
                <option value="all">كافة خطط التسعير</option>
                <option value="free">مجانية تماماً (Free)</option>
                <option value="freemium">مجانية مع ترقية (Freemium)</option>
                <option value="paid">مدفوعة (Paid)</option>
                <option value="free trial">تجربة مجانية (Free Trial)</option>
              </select>
            </div>

          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              عرض <strong className="text-indigo-600 font-bold">{filteredTools.length}</strong> أداة من أصل {tools.length}
            </span>
            {(searchQuery || selectedCategory !== 'all' || selectedPricing !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPricing('all');
                }}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                إعادة ضبط المرشحات
              </button>
            )}
          </div>
        </div>

        {/* Main Section: Categorized Tools Directory */}
        <section id="section-categories" className="space-y-8">
          {toolsByCategory.map((group: CategoryGroup) => {
            const cat = group.category;
            const catTools = group.tools;

            return (
              <div 
                key={cat.id || cat.slug}
                id={`cat-${cat.slug}`}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs scroll-mt-20 space-y-6"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/categories/${cat.slug}`)}
                            className="hover:text-indigo-600 transition-colors text-right"
                          >
                            {cat.name}
                          </button>
                          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {catTools.length} أداة
                          </span>
                        </h2>
                        {cat.name_en && (
                          <span className="text-xs text-slate-400 font-medium block">
                            {cat.name_en}
                          </span>
                        )}
                      </div>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-slate-500 max-w-2xl pt-1">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/categories/${cat.slug}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors shrink-0 self-start sm:self-center"
                  >
                    <span>عرض صفحة التصنيف الكاملة</span>
                    <ArrowUpRight className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>

                {/* Tools Grid inside Category */}
                {catTools.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">لا توجد أدوات مطابقة لخيارات البحث في هذا التصنيف.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catTools.map((tool: Tool) => (
                      <div
                        key={tool.id}
                        onClick={() => navigate(`/tools/${tool.slug}`)}
                        className="group relative bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={tool.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                            alt={tool.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {tool.name}
                              </h3>
                              {tool.rating && (
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {tool.rating}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {tool.tagline}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold ${
                            tool.pricing_type === 'Free' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : tool.pricing_type === 'Paid'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {tool.pricing_type || 'Freemium'}
                          </span>

                          <span className="text-indigo-600 font-bold group-hover:translate-x-[-2px] transition-transform inline-flex items-center gap-1">
                            التفاصيل والمراجعة
                            <ChevronRight className="w-3 h-3 rotate-180" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* AdSlot - In-content */}
        <AdSlot position="article_incontent" />

        {/* Section: Top Comparisons Index */}
        <section id="section-comparisons" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-emerald-600" />
                <span>فهرس مقارنات أدوات الذكاء الاصطناعي وجهاً لوجه</span>
              </h2>
              <p className="text-xs text-slate-500 pt-1">
                مقارنات فنية وحيادية بين أبرز نماذج وأدوات الذكاء الاصطناعي مع جدول الميزات والأسعار.
              </p>
            </div>
            <button
              onClick={() => navigate('/comparisons')}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
            >
              عرض كافة المقارنات
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_COMPARISONS.map((comp: Comparison) => {
              const anyComp = comp as any;
              const toolAName = anyComp.tool_a_name || (comp.tools && comp.tools[0]?.name) || 'الأداة الأولى';
              const toolBName = anyComp.tool_b_name || (comp.tools && comp.tools[1]?.name) || 'الأداة الثانية';

              return (
                <div
                  key={comp.id}
                  onClick={() => navigate(`/comparisons/${comp.slug}`)}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {comp.title}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 rotate-45 transition-transform" />
                  </div>
                  {comp.summary && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {comp.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span>{toolAName}</span>
                    <span className="font-bold text-emerald-600">VS</span>
                    <span>{toolBName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Articles & In-depth Guides Index */}
        <section id="section-articles" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>فهرس المقالات والأدلة التحريرية (E-E-A-T Articles)</span>
              </h2>
              <p className="text-xs text-slate-500 pt-1">
                مقالات متخصصة في الذكاء الاصطناعي، التجارة الإلكترونية، وأحدث التقنيات لعام 2026.
              </p>
            </div>
            <button
              onClick={() => navigate('/articles')}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
            >
              عرض جميع المقالات
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_ARTICLES.map((article: Article) => (
              <div
                key={article.id}
                onClick={() => navigate(`/articles/${article.slug}`)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-300 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {article.title}
                  </h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 rotate-45 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>✍️ {article.author_name || 'فريق التحرير'}</span>
                  <span>⏱️ {article.read_time || '5 دقائق'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Special Platforms & Interactive Portals */}
        <section id="section-portals" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl border border-indigo-500/30">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>البوابات والأدوات التفاعلية المباشرة</span>
            </h2>
            <p className="text-xs text-slate-300 pt-1">
              ميزات متقدمة ومساعدات ذكية لمساعدتك في اتخاذ قرارات الشراء وحساب العوائد.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Ecommerce Hub */}
            <div
              onClick={() => navigate('/ecommerce')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  منصات المتاجر والتسويق
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
              </div>
              <p className="text-xs text-slate-300">
                مقارنة شاملة بين سلة، زد، وشوبيفاي مع روابط التسويق بالعمولة والخصومات.
              </p>
            </div>

            {/* 2. AI Advisor */}
            <div
              onClick={() => navigate('/advisor')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  المستشار الذكي (AI Advisor)
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
              </div>
              <p className="text-xs text-slate-300">
                مساعد تفاعلي يرشح لك الأداة المناسبة بناءً على تخصصك وميزانيتك.
              </p>
            </div>

            {/* 3. ROI Calculator */}
            <div
              onClick={() => navigate('/calculator')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  حاسبة العائد والتكاليف (ROI)
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
              </div>
              <p className="text-xs text-slate-300">
                احسب الوقت والمال الذي ستوفره عند استخدام أدوات الذكاء الاصطناعي.
              </p>
            </div>

            {/* 4. Prompts Hub */}
            <div
              onClick={() => navigate('/prompts')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  مكتبة ومولد الأوامر (Prompts)
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
              </div>
              <p className="text-xs text-slate-300">
                أوامر وبرومبتات جاهزة ومجربة لـ ChatGPT و Midjourney و Claude.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
