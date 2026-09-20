import React, { useState, useMemo } from 'react';
import {
  Search,
  KeyRound,
  Sparkles,
  TrendingUp,
  FileText,
  DollarSign,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Copy,
  Plus,
  ExternalLink,
  Zap,
  Target,
  BarChart2,
  BookOpen,
  MousePointerClick,
  Layers,
  HelpCircle,
  Eye,
  Calendar,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Bookmark,
  Send
} from 'lucide-react';

export interface KeywordData {
  id: string;
  keyword: string;
  monthlySearches: number;
  organicClicks: number;
  averagePosition: number;
  cpc: number; // Cost per click in USD (AdSense value indicator)
  difficulty: 'سهل' | 'متوسط' | 'منافس' | 'صعب جداً';
  difficultyScore: number; // 0 - 100
  intent: 'معلوماتي (Informational)' | 'تجاري (Commercial)' | 'مقارنة (Comparison)' | 'إرشادي (Tutorial)';
  category: string;
  targetToolSlug?: string;
  opportunityScore: number; // 0 - 100
  suggestedArticles: {
    title: string;
    targetKeyword: string;
    searchIntent: string;
    estimatedMonthlyRevenue: number;
    outline: string[];
    monetizationHook: string;
    rpmTier: 'عالي جداً ($12-$18)' | 'مرتفع ($8-$12)' | 'متوسط ($5-$8)';
  }[];
}

const INITIAL_KEYWORDS: KeywordData[] = [
  {
    id: 'kw-1',
    keyword: 'أفضل أدوات الذكاء الاصطناعي لكتابة المحتوى العربي',
    monthlySearches: 18400,
    organicClicks: 11200,
    averagePosition: 2.1,
    cpc: 3.85,
    difficulty: 'متوسط',
    difficultyScore: 42,
    intent: 'تجاري (Commercial)',
    category: 'كتابة المحتوى',
    opportunityScore: 94,
    suggestedArticles: [
      {
        title: 'مقارنة أفضل 7 أدوات ذكاء اصطناعي تدعم الكتابة باللغة العربية الفصحى بدقة 2026',
        targetKeyword: 'أدوات كتابة محتوى ذكاء اصطناعي عربي',
        searchIntent: 'مقارنة تفصيلية لمساعدة المدونين وصناع المحتوى على اختيار الأداة المثالية',
        estimatedMonthlyRevenue: 165,
        outline: [
          'تحديات الكتابة العربية التوليدية وحلول النماذج اللغوية الحديثة',
          'مراجعة شاملة لـ ChatGPT و Jasper و Katteb ودعم اللهجات العربية',
          'جدول مقارنة الأسعار، جودة الصياغة، وسرعة التوليد',
          'نصائح لتحسين السيو والمقالات المنشأة بالذكاء الاصطناعي وتجنب عقوبات جوجل'
        ],
        monetizationHook: 'دمج 3 مساحات إعلانية تلقائية وروابط تابعة (Affiliate) لأدوات الكتابة المدفوعة بعائد يصل إلى 30%',
        rpmTier: 'عالي جداً ($12-$18)'
      },
      {
        title: 'دليل كتابة مقالات متوافقة مع السيو في دقائق باستخدام الذكاء الاصطناعي',
        targetKeyword: 'كتابة مقالات سيو بالذكاء الاصطناعي',
        searchIntent: 'إرشادي عملي للمدونين وأصحاب المواقع',
        estimatedMonthlyRevenue: 110,
        outline: [
          'اختيار الكلمات المفتاحية بالـ AI وهندسة الأوامر (Prompt Engineering)',
          'توليد العناوين الجذابة والمقدمات القوية بدون حشو',
          'إعادة الصياغة وإضفاء اللمسة الإنسانية للترتيب في الصفحة الأولى'
        ],
        monetizationHook: 'إعلانات داخل المقال In-Article Ads مع بانر تفاعلي لأداة التوليد المقترحة',
        rpmTier: 'مرتفع ($8-$12)'
      }
    ]
  },
  {
    id: 'kw-2',
    keyword: 'مقارنة ChatGPT Plus و Claude 3.5 Sonnet للبرمجة',
    monthlySearches: 14200,
    organicClicks: 8900,
    averagePosition: 1.8,
    cpc: 4.60,
    difficulty: 'سهل',
    difficultyScore: 35,
    intent: 'مقارنة (Comparison)',
    category: 'البرمجة والتطوير',
    opportunityScore: 98,
    suggestedArticles: [
      {
        title: 'شات جي بي تي بلس أم كلاود 3.5 سونيت: أيهما أفضل لمبرمجي الويب والتطبيقات؟',
        targetKeyword: 'مقارنة ChatGPT و Claude للبرمجة',
        searchIntent: 'مساعدة المطورين على اتخاذ قرار الاشتراك الشهري',
        estimatedMonthlyRevenue: 240,
        outline: [
          'فهم بنية النماذج اللغوية وسياق الذاكرة (Context Window)',
          'اختبار عملي: تصحيح كود معقد وبناء واجهة React كاملة',
          'مقارنة أسعار الاشتراكات الشهرية والتكامل مع بيئات التطوير (VS Code & Cursor)',
          'الحكم النهائي والتوصية حسب لغة البرمجة وخبرة المطور'
        ],
        monetizationHook: 'أعلى معدل RPM في قطاع المطورين والتقنية البرمجية ($14+) مع إعلانات استضافة وسيرفرات سحابية',
        rpmTier: 'عالي جداً ($12-$18)'
      }
    ]
  },
  {
    id: 'kw-3',
    keyword: 'بدائل Midjourney المجانية لتوليد الصور',
    monthlySearches: 22600,
    organicClicks: 14800,
    averagePosition: 3.4,
    cpc: 2.90,
    difficulty: 'متوسط',
    difficultyScore: 48,
    intent: 'معلوماتي (Informational)',
    category: 'توليد الصور والفن',
    opportunityScore: 91,
    suggestedArticles: [
      {
        title: 'أفضل 6 بدائل مجانية لـ Midjourney لتصميم صور احترافية بدون اشتراك',
        targetKeyword: 'بدائل مجانية لميدجورني',
        searchIntent: 'البحث عن منصات مجانية أو مفتوحة المصدر لتوليد الصور',
        estimatedMonthlyRevenue: 195,
        outline: [
          'لماذا يبحث المصممون عن بدائل مجانية لميدجورني؟',
          'استعراض كامل لـ Leonardo.ai و Flux و Playground AI',
          'كيفية تثبيت Stable Diffusion محلياً على جهازك مجاناً',
          'مقارنة جودة التفاصيل والواقعية ودعم رسم النصوص'
        ],
        monetizationHook: 'كثافة إعلانية متوازنة وإعلانات Display جذابة لأدوات الجرافيكس',
        rpmTier: 'مرتفع ($8-$12)'
      }
    ]
  },
  {
    id: 'kw-4',
    keyword: 'كيفية الربح من أدوات الذكاء الاصطناعي للمبتدئين',
    monthlySearches: 31000,
    organicClicks: 19500,
    averagePosition: 4.2,
    cpc: 5.20,
    difficulty: 'منافس',
    difficultyScore: 68,
    intent: 'إرشادي (Tutorial)',
    category: 'الأعمال والربح',
    opportunityScore: 89,
    suggestedArticles: [
      {
        title: 'دليل المبتدئين الشامل: 10 طرق حقيقية للربح من أدوات الذكاء الاصطناعي في 2026',
        targetKeyword: 'طرق الربح من الذكاء الاصطناعي',
        searchIntent: 'دليل تعليمي خطوة بخطوة للعمل الحر وبناء مشاريع رقمية',
        estimatedMonthlyRevenue: 320,
        outline: [
          'تقديم خدمات الترجمة والتعليق الصوتي الآلي الاحترافي',
          'تصميم الشعارات والهويات البصرية وبيعها على منصات العمل الحر',
          'إنشاء مقاطع فيديو بدون وجه على يوتيوب وتيك توك بالـ AI',
          'بناء روبوتات دردشة مخصصة للشركات والمتاجر الإلكترونية'
        ],
        monetizationHook: 'مقالات التمويل والربح تحظى بأعلى CPC في شبكة AdSense ($4-$7 لكل نقرة إعلانية)',
        rpmTier: 'عالي جداً ($12-$18)'
      }
    ]
  },
  {
    id: 'kw-5',
    keyword: 'توليد الفيديو بالذكاء الاصطناعي تحويل النص إلى فيديو',
    monthlySearches: 16800,
    organicClicks: 9400,
    averagePosition: 2.8,
    cpc: 3.40,
    difficulty: 'سهل',
    difficultyScore: 32,
    intent: 'تجاري (Commercial)',
    category: 'الفيديو والأنيميشن',
    opportunityScore: 96,
    suggestedArticles: [
      {
        title: 'أفضل مواقع تحويل النص إلى فيديو بالذكاء الاصطناعي بجودة سينمائية 4K',
        targetKeyword: 'تحويل النص إلى فيديو ذكاء اصطناعي',
        searchIntent: 'استعراض أدوات الفيديو الحديثة مثل Runway Gen-3 و Sora و Kling',
        estimatedMonthlyRevenue: 210,
        outline: [
          'ثورة نماذج الفيديو التوليدية من النصوص',
          'مقارنة Runway Gen-3 و Kling AI و Luma Dream Machine',
          'معايير اختيار الأداة المناسبة لليوتيوبرز وصناع الإعلانات',
          'حيل صياغة الأوامر النصية لتحقيق حركة سلسة وفيزيائية واقعية'
        ],
        monetizationHook: 'روابط اشتراكات تابعة لمولدات الفيديو وعائد ظهور إعلانات الفيديو',
        rpmTier: 'عالي جداً ($12-$18)'
      }
    ]
  },
  {
    id: 'kw-6',
    keyword: 'أدوات الذكاء الاصطناعي للطلاب والبحث العلمي',
    monthlySearches: 19200,
    organicClicks: 12400,
    averagePosition: 1.5,
    cpc: 2.10,
    difficulty: 'سهل',
    difficultyScore: 28,
    intent: 'معلوماتي (Informational)',
    category: 'التعليم والبحث',
    opportunityScore: 92,
    suggestedArticles: [
      {
        title: 'أفضل 8 أدوات ذكاء اصطناعي لتلخيص الأوراق العلمية والبحث الجامعي الموثق',
        targetKeyword: 'أدوات ذكاء اصطناعي للبحث العلمي',
        searchIntent: 'مساعدة طلاب الدراسات العليا والباحثين على تلخيص الدراسات والأبحاث',
        estimatedMonthlyRevenue: 140,
        outline: [
          'كيف يسرع الذكاء الاصطناعي مراجعة الأدبيات السابقة والمراجع؟',
          'أدوات استخراج البيانات: Consensus و Elicit و SciSpace',
          'كيفية توثيق المراجع بنظام APA باستخدام أدوات الـ AI بأمان أكاديمي'
        ],
        monetizationHook: 'إعلانات الدورات التعليمية والمنصات الجامعية',
        rpmTier: 'متوسط ($5-$8)'
      }
    ]
  },
  {
    id: 'kw-7',
    keyword: 'تحويل الصوت إلى نص باللغة العربية بدقة عالية',
    monthlySearches: 11500,
    organicClicks: 7100,
    averagePosition: 2.3,
    cpc: 2.80,
    difficulty: 'سهل',
    difficultyScore: 24,
    intent: 'تجاري (Commercial)',
    category: 'الصوتيات والبودكاست',
    opportunityScore: 90,
    suggestedArticles: [
      {
        title: 'أدق أدوات تفريغ الصوت إلى نص عربي بالذكاء الاصطناعي مع دعم اللهجات المحلية',
        targetKeyword: 'تفريغ صوتي عربي بالذكاء الاصطناعي',
        searchIntent: 'الحصول على أداة لتفريغ المقابلات والاجتماعات والتسجيلات بدقة',
        estimatedMonthlyRevenue: 125,
        outline: [
          'تحديات التفريغ الصوتي العربي واللهجات العامية',
          'مراجعة نموذج OpenAI Whisper وتطبيقاته العملية',
          'أفضل برامج تفريغ الاجتماعات مثل Otter.ai و Descript'
        ],
        monetizationHook: 'إعلانات ميكروفونات ومعدات تسجيل وبودكاست',
        rpmTier: 'متوسط ($5-$8)'
      }
    ]
  },
  {
    id: 'kw-8',
    keyword: 'تطبيقات الذكاء الاصطناعي لتصميم العروض التقديمية بوربوينت',
    monthlySearches: 15400,
    organicClicks: 9800,
    averagePosition: 2.0,
    cpc: 3.20,
    difficulty: 'سهل',
    difficultyScore: 30,
    intent: 'تجاري (Commercial)',
    category: 'الإنتاجية والأعمال',
    opportunityScore: 95,
    suggestedArticles: [
      {
        title: 'تصميم عروض تقديمية احترافية في ثوانٍ: أفضل 5 أدوات ذكاء اصطناعي بديلة للبوربوينت',
        targetKeyword: 'تصميم بوربوينت بالذكاء الاصطناعي',
        searchIntent: 'البحث عن أداة تنشئ شرائح Presentation كاملة من نص أو فكرة',
        estimatedMonthlyRevenue: 175,
        outline: [
          'لماذا أصبحت عروض الذكاء الاصطناعي تفوق التصاميم التقليدية؟',
          'شرح وتجربة منصة Gamma App و Beautiful.ai و Tome',
          'كيف تصدر العرض بصيغة PPTX أو PDF قابل للتعديل'
        ],
        monetizationHook: 'عروض اشتراكات أدوات الإنتاجية وإعلانات شركات البرمجيات SaaS',
        rpmTier: 'مرتفع ($8-$12)'
      }
    ]
  }
];

export const AdminKeywordOpportunityManager: React.FC = () => {
  const [keywords, setKeywords] = useState<KeywordData[]>(INITIAL_KEYWORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'opportunity' | 'traffic' | 'cpc' | 'position'>('opportunity');
  const [expandedKeywordId, setExpandedKeywordId] = useState<string | null>('kw-1');
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [generatingForKw, setGeneratingForKw] = useState<string | null>(null);

  // New Custom Keyword Modal / State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState<{
    keyword: string;
    monthlySearches: number;
    cpc: number;
    category: string;
    difficulty: 'سهل' | 'متوسط' | 'منافس' | 'صعب جداً';
    intent: 'معلوماتي (Informational)' | 'تجاري (Commercial)' | 'مقارنة (Comparison)' | 'إرشادي (Tutorial)';
  }>({
    keyword: '',
    monthlySearches: 10000,
    cpc: 3.5,
    category: 'كتابة المحتوى',
    difficulty: 'متوسط',
    intent: 'معلوماتي (Informational)'
  });

  // Filter and Sort Keywords
  const filteredKeywords = useMemo(() => {
    return keywords
      .filter((item) => {
        const matchesQuery = item.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.suggestedArticles.some(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;

        return matchesQuery && matchesCategory && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortBy === 'opportunity') return b.opportunityScore - a.opportunityScore;
        if (sortBy === 'traffic') return b.monthlySearches - a.monthlySearches;
        if (sortBy === 'cpc') return b.cpc - a.cpc;
        if (sortBy === 'position') return a.averagePosition - b.averagePosition;
        return 0;
      });
  }, [keywords, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  // Summary Metrics
  const summaryStats = useMemo(() => {
    const totalSearches = keywords.reduce((acc, k) => acc + k.monthlySearches, 0);
    const totalOrganicClicks = keywords.reduce((acc, k) => acc + k.organicClicks, 0);
    const avgCpc = (keywords.reduce((acc, k) => acc + k.cpc, 0) / keywords.length).toFixed(2);
    const totalPotentialRevenue = keywords.reduce((acc, k) => {
      const articleRev = k.suggestedArticles.reduce((aSum, a) => aSum + a.estimatedMonthlyRevenue, 0);
      return acc + articleRev;
    }, 0);

    return {
      totalSearches,
      totalOrganicClicks,
      avgCpc,
      totalPotentialRevenue,
      totalArticlesSuggested: keywords.reduce((acc, k) => acc + k.suggestedArticles.length, 0)
    };
  }, [keywords]);

  // Categories List
  const uniqueCategories = useMemo(() => {
    const cats = new Set(keywords.map(k => k.category));
    return Array.from(cats);
  }, [keywords]);

  const handleCopy = (text: string, type: 'keyword' | 'title', id: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'keyword') {
      setCopiedKeyword(id);
      setTimeout(() => setCopiedKeyword(null), 2000);
    } else {
      setCopiedTitle(id);
      setTimeout(() => setCopiedTitle(null), 2000);
    }
  };

  const handleGenerateOutline = (keywordId: string) => {
    setGeneratingForKw(keywordId);
    setTimeout(() => {
      setGeneratingForKw(null);
      // Mock generated extra article idea
      setKeywords(prev => prev.map(k => {
        if (k.id === keywordId) {
          const newIdea = {
            title: `دليل شامل: كيف تتقن ${k.keyword} خطوة بخطوة بالصور التوضيحية`,
            targetKeyword: k.keyword,
            searchIntent: 'دليل تدريبي وتطبيقي شامل مع توصيات المنتجات',
            estimatedMonthlyRevenue: Math.round((k.monthlySearches / 1000) * (k.cpc * 2.2)),
            outline: [
              'مقدمة وتعريف بأهمية هذا المجال في العالم العربي',
              'المقارنة بين الحلول المجانية والمدفوعة',
              'أهم الأخطاء الشائعة وكيفية تفاديها بالذكاء الاصطناعي',
              'خاتمة وأفضل الممارسات لتحقيق أعلى عائد'
            ],
            monetizationHook: 'دمج بنرات إعلانية ذكية في الفقرة الثانية وقائمة الأدوات التابعة',
            rpmTier: 'عالي جداً ($12-$18)' as const
          };
          return {
            ...k,
            suggestedArticles: [newIdea, ...k.suggestedArticles]
          };
        }
        return k;
      }));
    }, 1200);
  };

  const handleAddNewKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.keyword.trim()) return;

    const newKw: KeywordData = {
      id: `kw-${Date.now()}`,
      keyword: newKeywordInput.keyword.trim(),
      monthlySearches: Number(newKeywordInput.monthlySearches) || 8000,
      organicClicks: Math.round(Number(newKeywordInput.monthlySearches) * 0.62) || 5000,
      averagePosition: 3.2,
      cpc: Number(newKeywordInput.cpc) || 3.0,
      difficulty: newKeywordInput.difficulty,
      difficultyScore: newKeywordInput.difficulty === 'سهل' ? 25 : newKeywordInput.difficulty === 'متوسط' ? 45 : 70,
      intent: newKeywordInput.intent,
      category: newKeywordInput.category,
      opportunityScore: 88,
      suggestedArticles: [
        {
          title: `دليل تفصيلي: ${newKeywordInput.keyword} - أفضل الأدوات والتطبيقات في 2026`,
          targetKeyword: newKeywordInput.keyword,
          searchIntent: newKeywordInput.intent,
          estimatedMonthlyRevenue: Math.round((Number(newKeywordInput.monthlySearches) / 1000) * 8.5),
          outline: [
            'ما هي أحدث التطورات وكيف تبدأ فوراً؟',
            'مقارنة أهم المميزات والأسعار',
            'التوصيات النهائية ودعم اللغة العربية'
          ],
          monetizationHook: 'إعلانات Native وأدوات برمجية متخصصة',
          rpmTier: 'مرتفع ($8-$12)'
        }
      ]
    };

    setKeywords([newKw, ...keywords]);
    setShowAddModal(false);
    setNewKeywordInput({
      keyword: '',
      monthlySearches: 10000,
      cpc: 3.5,
      category: 'كتابة المحتوى',
      difficulty: 'متوسط',
      intent: 'معلوماتي (Informational)'
    });
    setExpandedKeywordId(newKw.id);
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* 1. HERO HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <KeyRound className="w-6 h-6" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                جدول الكلمات المفتاحية الأعلى جلباً للزيارات واقتراحات المقالات لتعظيم الأرباح
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              تحليل الكلمات المفتاحية الاستراتيجية في محرك بحث Google ومعدل البحث الشهري، مع اقتراح مقالات سيو ذكية (Content Hub & SEO Cluster) لاستهدافها وتحقيق أعلى عائد إعلاني ($ RPM / CPC).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كلمة مفتاحية مستهدفة</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي حجم البحث المستهدف</span>
            <Search className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {summaryStats.totalSearches.toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{summaryStats.totalOrganicClicks.toLocaleString('ar-EG')} نقرة عضوية محتملة</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط سعر النقرة الإعلانية</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            ${summaryStats.avgCpc}
          </div>
          <div className="text-[11px] text-slate-500">
            قيمة تنافسية مرتفعة لشبكة AdSense
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المقالات المقترحة الجاهزة</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 font-mono">
            {summaryStats.totalArticlesSuggested} مقال
          </div>
          <div className="text-[11px] text-purple-600 font-bold">
            جاهزة للتنفيذ والنشر فوراً
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">العائد الشهري التقديري الإضافي</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
            +${summaryStats.totalPotentialRevenue.toLocaleString('en-US')}/شهر
          </div>
          <div className="text-[11px] text-slate-500">
            من الإعلانات والتسويق بالعمولة
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH CONTROLS */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن كلمة مفتاحية أو فكرة مقال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none"
            >
              <option value="all">جميع الأقسام ({keywords.length})</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none"
            >
              <option value="all">جميع مستويات الصعوبة</option>
              <option value="سهل">سهل (فرصة سريعة)</option>
              <option value="متوسط">متوسط</option>
              <option value="منافس">منافس</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-indigo-700 bg-indigo-50/50 outline-none"
            >
              <option value="opportunity">ترتيب حسب: أعلى فرصة ربح (Opportunity Score)</option>
              <option value="traffic">ترتيب حسب: حجم البحث الشهري</option>
              <option value="cpc">ترتيب حسب: أعلى سعر نقرة (CPC)</option>
              <option value="position">ترتيب حسب: الترتيب الحالي في جوجل</option>
            </select>
          </div>

        </div>
      </div>

      {/* 4. KEYWORDS INTERACTIVE TABLE WITH ARTICLE GENERATOR ACCORDION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              قائمة الكلمات الدلالية ومخطط المقالات المقترحة ({filteredKeywords.length} كلمة)
            </h3>
          </div>
          <span className="text-xs text-slate-400">انقر على أي كلمة لعرض خطة المقالات ومحاور الكتابة</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredKeywords.map((item) => {
            const isExpanded = expandedKeywordId === item.id;

            return (
              <div key={item.id} className="transition-colors hover:bg-slate-50/40">
                {/* Main Row Header */}
                <div
                  onClick={() => setExpandedKeywordId(isExpanded ? null : item.id)}
                  className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.keyword, 'keyword', item.id);
                      }}
                      title="نسخ الكلمة المفتاحية"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      {copiedKeyword === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">{item.keyword}</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {item.intent}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                        <span>الترتيب في Google: <strong className="text-slate-800 font-mono">#{item.averagePosition}</strong></span>
                        <span>•</span>
                        <span>صعوبة المنافسة: <strong className={`font-bold ${item.difficulty === 'سهل' ? 'text-emerald-600' : item.difficulty === 'متوسط' ? 'text-amber-600' : 'text-rose-600'}`}>{item.difficulty} ({item.difficultyScore}/100)</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Badges Grid */}
                  <div className="flex items-center gap-4 sm:gap-6 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-center font-mono">
                      <span className="text-[10px] text-slate-400 block">البحث الشهري</span>
                      <span className="text-xs font-black text-slate-900">{item.monthlySearches.toLocaleString('ar-EG')}</span>
                    </div>

                    <div className="text-center font-mono">
                      <span className="text-[10px] text-slate-400 block">النقرات العضوية</span>
                      <span className="text-xs font-black text-emerald-600">{item.organicClicks.toLocaleString('ar-EG')}</span>
                    </div>

                    <div className="text-center font-mono">
                      <span className="text-[10px] text-slate-400 block">سعر النقرة (CPC)</span>
                      <span className="text-xs font-black text-indigo-600">${item.cpc.toFixed(2)}</span>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">مؤشر الفرصة</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-mono">
                        {item.opportunityScore}%
                      </span>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Content Suggestions & Revenue Strategy */}
                {isExpanded && (
                  <div className="bg-slate-50/80 p-5 sm:p-6 border-t border-slate-100 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h4 className="font-extrabold text-xs text-slate-900">
                          اقتراحات عناوين ومخططات مقالات حصرية لمضاعفة الأرباح:
                        </h4>
                      </div>

                      <button
                        onClick={() => handleGenerateOutline(item.id)}
                        disabled={generatingForKw === item.id}
                        className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{generatingForKw === item.id ? 'جاري توليد محاور إضافية...' : 'توليد فكرة مقال ذكية إضافية'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {item.suggestedArticles.map((art, aIdx) => (
                        <div key={aIdx} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                                {aIdx + 1}
                              </span>
                              <h5 className="font-black text-sm text-slate-900">{art.title}</h5>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                                عائد شهري متوقع: ~${art.estimatedMonthlyRevenue}
                              </span>
                              <button
                                onClick={() => handleCopy(art.title, 'title', `${item.id}-${aIdx}`)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-bold flex items-center gap-1"
                              >
                                {copiedTitle === `${item.id}-${aIdx}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[10px] text-emerald-600">تم النسخ</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-[10px]">نسخ العنوان</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Search Intent & RPM Tier */}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <div className="text-slate-600">
                              🎯 <strong>النية المستهدفة للزائر:</strong> {art.searchIntent}
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="text-indigo-700 font-bold">
                              💎 شريحة الـ RPM: {art.rpmTier}
                            </div>
                          </div>

                          {/* Outline Bullet Points */}
                          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <span className="text-[11px] font-bold text-slate-700 block">
                              📝 محاور وفقرات المقال المقترحة (Content Structure):
                            </span>
                            <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                              {art.outline.map((oItem, oIdx) => (
                                <li key={oIdx}>{oItem}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Monetization Strategy Hook */}
                          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <strong>استراتيجية تحقيق الدخل:</strong> {art.monetizationHook}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. STRATEGY GUIDE: HOW TO CAPITALIZE ON KEYWORDS */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white p-6 sm:p-7 rounded-3xl border border-indigo-100 space-y-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-indigo-700" />
          <h4 className="font-extrabold text-slate-900 text-sm">
            دليل استراتيجية استهداف الكلمات المفتاحية لزيادة أرباح AdSense والتسويق بالعمولة
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-1.5">
            <span className="font-bold text-indigo-900 block flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">1</span>
              بناء عناقيد المحتوى (Topic Clusters)
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              اكتب مقالاً محورياً (Pillar Page) يغطي الكلمة العامة، ثم أتبعه بـ 3 مقالات فرعية لكل أداة مع ربط داخلي مكثف لرفع سلطة الدومين.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1.5">
            <span className="font-bold text-purple-900 block flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">2</span>
              استهداف الكلمات ذات النية التجارية
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              الكلمات التي تحتوي على &quot;مقارنة&quot; أو &quot;أسعار&quot; أو &quot;أفضل&quot; تجلب نقرات ذات CPC أعلى بـ 3 أضعاف من الكلمات العامة.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-1.5">
            <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">3</span>
              تحسين وتوزيع الإعلانات Native
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              ضع الإعلان الأول تحت مقدمة المقال مباشرة، والثاني في منتصف جدول المقارنة لضمان أعلى نسبة مشاهدة (Viewability 85%+).
            </p>
          </div>
        </div>
      </div>

      {/* 6. MODAL: ADD CUSTOM TARGET KEYWORD */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>إضافة كلمة مفتاحية مستهدفة جديدة</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewKeyword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الكلمة المفتاحية المستهدفة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أفضل أدوات تلخيص النصوص بالذكاء الاصطناعي"
                  value={newKeywordInput.keyword}
                  onChange={(e) => setNewKeywordInput({ ...newKeywordInput, keyword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حجم البحث الشهري التقديري:</label>
                  <input
                    type="number"
                    min="500"
                    max="1000000"
                    value={newKeywordInput.monthlySearches}
                    onChange={(e) => setNewKeywordInput({ ...newKeywordInput, monthlySearches: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر النقرة المتوقع ($ CPC):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={newKeywordInput.cpc}
                    onChange={(e) => setNewKeywordInput({ ...newKeywordInput, cpc: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القسم أو التصنيف:</label>
                  <select
                    value={newKeywordInput.category}
                    onChange={(e) => setNewKeywordInput({ ...newKeywordInput, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
                  >
                    <option value="كتابة المحتوى">كتابة المحتوى</option>
                    <option value="توليد الصور والفن">توليد الصور والفن</option>
                    <option value="البرمجة والتطوير">البرمجة والتطوير</option>
                    <option value="الفيديو والأنيميشن">الفيديو والأنيميشن</option>
                    <option value="الصوتيات والبودكاست">الصوتيات والبودكاست</option>
                    <option value="الأعمال والربح">الأعمال والربح</option>
                    <option value="التعليم والبحث">التعليم والبحث</option>
                    <option value="الإنتاجية والأعمال">الإنتاجية والأعمال</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مستوى الصعوبة:</label>
                  <select
                    value={newKeywordInput.difficulty}
                    onChange={(e) => setNewKeywordInput({ ...newKeywordInput, difficulty: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
                  >
                    <option value="سهل">سهل (فرصة سريعة)</option>
                    <option value="متوسط">متوسط</option>
                    <option value="منافس">منافس</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>إضافة الكلمة وتوليد المقترحات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
