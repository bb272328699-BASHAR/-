import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Store, 
  Calculator, 
  TrendingUp, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  ArrowLeft, 
  Copy, 
  Check, 
  ShieldCheck, 
  Globe, 
  CreditCard, 
  Truck, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Zap,
  DollarSign,
  Percent,
  Layers,
  Search,
  Filter,
  BarChart3,
  Award,
  X
} from 'lucide-react';
import { 
  ECOMMERCE_PLATFORMS, 
  AFFILIATE_PROGRAMS, 
  ECOMMERCE_AI_TOOLS, 
  COUPON_DEALS 
} from '../data/ecommerceData.ts';
import { EcommercePlatform, AffiliateProgram } from '../types.ts';
import { StoreMatcherQuiz } from '../components/StoreMatcherQuiz.tsx';
import { EcommercePlatformComparison } from '../components/EcommercePlatformComparison.tsx';
import { WinningProductsRadar } from '../components/WinningProductsRadar.tsx';
import { StoreRoadmapGenerator } from '../components/StoreRoadmapGenerator.tsx';
import { Rocket, Flame, Scale } from 'lucide-react';

interface EcommercePageProps {
  navigate: (path: string) => void;
}

export const EcommercePage: React.FC<EcommercePageProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'roadmap' | 'products' | 'platforms' | 'calculator' | 'affiliate' | 'ai-tools' | 'deals'>('quiz');
  
  // Platform filtering
  const [platformFilter, setPlatformFilter] = useState<'all' | 'السعودية والخليج' | 'عالمي ودولي' | 'شمال إفريقيا ومحلي'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<EcommercePlatform | null>(null);

  // Platform Comparison State
  const [selectedComparePlatformIds, setSelectedComparePlatformIds] = useState<string[]>(['salla', 'zid']);
  const [platformViewMode, setPlatformViewMode] = useState<'cards' | 'compare'>('cards');

  const handleToggleComparePlatform = (id: string) => {
    setSelectedComparePlatformIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    );
  };

  const handleClearComparePlatforms = () => {
    setSelectedComparePlatformIds([]);
  };

  const handleStartCompareFromQuiz = (platformIds: string[]) => {
    setSelectedComparePlatformIds(platformIds);
    setActiveTab('platforms');
    setPlatformViewMode('compare');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Affiliate filtering
  const [affiliateCategory, setAffiliateCategory] = useState<string>('all');

  // Calculator State
  const [monthlySales, setMonthlySales] = useState<number>(30000); // SAR
  const [averageOrderValue, setAverageOrderValue] = useState<number>(200); // SAR
  const [electronicPaymentPct, setElectronicPaymentPct] = useState<number>(85); // 85% electronic, 15% COD

  // Copied state for coupons
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  // Filtered platforms
  const filteredPlatforms = useMemo(() => {
    if (platformFilter === 'all') return ECOMMERCE_PLATFORMS;
    return ECOMMERCE_PLATFORMS.filter(p => p.target_market === platformFilter);
  }, [platformFilter]);

  // Filtered affiliate programs
  const filteredAffiliates = useMemo(() => {
    if (affiliateCategory === 'all') return AFFILIATE_PROGRAMS;
    return AFFILIATE_PROGRAMS.filter(a => a.category === affiliateCategory);
  }, [affiliateCategory]);

  // Calculator computations
  const calculatorResults = useMemo(() => {
    const ordersCount = Math.max(1, Math.round(monthlySales / Math.max(10, averageOrderValue)));
    const onlineSales = monthlySales * (electronicPaymentPct / 100);

    // 1. Salla (Plus plan: 99 SAR/mo, 0% platform fee, ~1.75% + 1 SAR for mada/cards)
    const sallaGatewayFee = onlineSales * 0.0175 + (ordersCount * (electronicPaymentPct / 100) * 1.0);
    const sallaTotalCost = 99 + sallaGatewayFee;

    // 2. Zid (Starting at 230 SAR/mo, 0% platform fee, ~1.75% + 1 SAR for payment)
    const zidGatewayFee = onlineSales * 0.0175 + (ordersCount * (electronicPaymentPct / 100) * 1.0);
    const zidTotalCost = 230 + zidGatewayFee;

    // 3. Shopify (Basic: $39 ~ 146 SAR, 2% extra transaction fee if external gateway + 2.5% card gateway fee)
    const shopifyPlanCost = 146; // SAR
    const shopifyExternalFee = monthlySales * 0.02; // 2% transaction fee in region
    const shopifyGatewayFee = onlineSales * 0.025 + (ordersCount * (electronicPaymentPct / 100) * 1.1);
    const shopifyTotalCost = shopifyPlanCost + shopifyExternalFee + shopifyGatewayFee;

    // 4. WooCommerce (Hosting ~ 35 SAR/mo, 0% platform fee, ~2.0% gateway fee)
    const wooHostingCost = 35;
    const wooGatewayFee = onlineSales * 0.02 + (ordersCount * (electronicPaymentPct / 100) * 1.0);
    const wooTotalCost = wooHostingCost + wooGatewayFee;

    // 5. YouCan (0 SAR plan, 0.5% fee on all completed orders + gateway fee)
    const youcanFee = monthlySales * 0.005;
    const youcanGatewayFee = onlineSales * 0.02;
    const youcanTotalCost = youcanFee + youcanGatewayFee;

    const costs = [
      { name: 'سلة (Salla Plus)', total: sallaTotalCost, planCost: 99, fees: sallaGatewayFee, slug: 'salla', rec: 'الأنسب للبيع بالسعودية والخليج' },
      { name: 'زد (Zid)', total: zidTotalCost, planCost: 230, fees: zidGatewayFee, slug: 'zid', rec: 'الأنسب للمعارض وربط الفروع' },
      { name: 'Shopify Basic', total: shopifyTotalCost, planCost: shopifyPlanCost, fees: shopifyExternalFee + shopifyGatewayFee, slug: 'shopify', rec: 'الأنسب للدروب شيبينج والتوسع الدولي' },
      { name: 'ووكومرس (WooCommerce)', total: wooTotalCost, planCost: wooHostingCost, fees: wooGatewayFee, slug: 'woocommerce', rec: 'أقل تكلفة تحكم ذاتي للمطورين' },
      { name: 'YouCan (يوكان)', total: youcanTotalCost, planCost: 0, fees: youcanFee + youcanGatewayFee, slug: 'youcan', rec: 'الأوفر لنموذج الدفع عند الاستلام COD' }
    ];

    const sortedByCost = [...costs].sort((a, b) => a.total - b.total);
    const cheapest = sortedByCost[0];

    return {
      ordersCount,
      costs,
      cheapest,
      yearlySavings: Math.round((shopifyTotalCost - sallaTotalCost) * 12)
    };
  }, [monthlySales, averageOrderValue, electronicPaymentPct]);

  const faqs = [
    {
      q: 'أيهما أختار لمتجري في السعودية والخليج: سلة أم زد أم شوبيفاي؟',
      a: 'إذا كان متجرك يستهدف السوق السعودي والخليجي بالدرجة الأولى، فإن منصة سلة هي الخيار الأسهل والأسرع بفضل التفعيل الفوري لبوابات مدى وتابي وتمارا وشركات الشحن المعتمدة دون أي تعقيد. وإذا كنت تملك فروعاً واقعية ومعارض ومخازن متعددة وتريد ربط نقاط البيع (POS) بنظام موحد، فإن منصة زد تقدم حلولاً احترافية ملائمة جداً للمنشآت المتوسطة. أما شوبيفاي فهو الخيار الأول إذا كنت ترغب في العمل بنظام الدروب شيبينج الدولي أو البيع عالمياً لأمريكا وأوروبا.'
    },
    {
      q: 'كيف أربح من التسويق بالعمولة (Affiliate Marketing) للمتاجر الإلكترونية؟',
      a: 'يمكنك البدء بالتسجيل في برامج شركاء المنصات والمتاجر (مثل سلة بارتنرز، شوبيفاي أفلييت، وأمازون أفلييت). ستحصل على رابط إحالة خاص بك أو كود خصم للمتابعين. عندما يقوم أي شخص بالاشتراك في المنصة أو شراء منتجات من المتجر عبر رابطك أو كودك، ستحصل على عمولة نقدية مباشرة (تتراوح بين 100-300 ريال لكل تاجر، أو نسبة تصل حتى 10% من مبيعات المنتجات) وتُحول إلى حسابك البنكي أو حساب PayPal.'
    },
    {
      q: 'هل أحتاج لسجل تجاري أو وثيقة عمل حر لفتح متجر إلكتروني؟',
      a: 'في المملكة العربية السعودية، يمكنك البدء عبر استخراج "وثيقة العمل الحر" مجاناً وبشكل فوري عبر بوابة العمل الحر، وهي كافية لتفعيل الحساب البنكي التجاري وبوابات الدفع الإلكتروني في سلة وزد للمتاجر الفردية. أما إذا كنت شركة أو مؤسسة قائمة، فيمكنك استخدام السجل التجاري وربط الفوترة الإلكترونية (ZATCA).'
    },
    {
      q: 'ما هي ميزة استخدام أدوات الذكاء الاصطناعي مع متجري الإلكتروني؟',
      a: 'أدوات الذكاء الاصطناعي أصبحت تختصر أكثر من 80% من المصاريف والوقت على التجار. يمكنك باستخدام أدوات مثل Pebblely تصوير منتجاتك بخلفيات استوديو إعلانية فخمة دون استئجار مصور، واستخدام شات بوت مثل Chatbase للرد على العملاء وبيع المنتجات على مدار 24 ساعة، وتوليد أوصاف المنتجات المتوافقة مع محركات البحث في ثوانٍ.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
            <button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors">الرئيسية</button>
            <span>/</span>
            <span className="text-slate-900">المتاجر الإلكترونية والتسويق بالعمولة</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                <Store className="w-3.5 h-3.5" />
                <span>دليل التجارة الرقمية والربح بالعمولة 2026</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                مقارنة منصات المتاجر الإلكترونية وحلول التسويق بالعمولة
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                دليل حيادي وشامل لمقارنة أقوى منصات إنشاء المتاجر (سلة، زد، شوبيفاي، ووكومرس)، حاسبة الرسوم والأرباح التفاعلية، أدوات الذكاء الاصطناعي لرفع المبيعات، وأفضل برامج التسويق بالعمولة وكوبونات الخصم.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div className="p-2">
                <span className="block text-xl sm:text-2xl font-black text-indigo-600">6+</span>
                <span className="text-xs text-slate-500 font-medium">منصات مقارنة</span>
              </div>
              <div className="p-2">
                <span className="block text-xl sm:text-2xl font-black text-emerald-600">0%</span>
                <span className="text-xs text-slate-500 font-medium">عمولة في الباقات الأساسية</span>
              </div>
              <div className="p-2">
                <span className="block text-xl sm:text-2xl font-black text-amber-600">7+</span>
                <span className="text-xs text-slate-500 font-medium">برامج أفلييت معتمدة</span>
              </div>
              <div className="p-2">
                <span className="block text-xl sm:text-2xl font-black text-rose-600">78%</span>
                <span className="text-xs text-slate-500 font-medium">أعلى خصم حصري</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-100 mt-6 no-scrollbar">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/70'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-300" />
              <span>مستشار المتجر الذكي (Quiz)</span>
              <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">جديد</span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/70'
              }`}
            >
              <Rocket className="w-4 h-4 text-indigo-500" />
              <span>خطة الـ 30 يوماً لإطلاق المتجر</span>
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">عملية</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200/70'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>رادار المنتجات الرابحة</span>
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">تريند</span>
            </button>

            <button
              onClick={() => setActiveTab('platforms')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'platforms'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>مقارنة المنصات</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>حاسبة الرسوم والأرباح</span>
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">تفاعلية</span>
            </button>

            <button
              onClick={() => setActiveTab('affiliate')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'affiliate'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>برامج التسويق بالعمولة</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-tools')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'ai-tools'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>أدوات الذكاء الاصطناعي للتجارة</span>
            </button>

            <button
              onClick={() => setActiveTab('deals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'deals'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>عروض وكوبونات حصرية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ============================================================ */}
        {/* TAB 0: STORE MATCHER QUIZ */}
        {/* ============================================================ */}
        {activeTab === 'quiz' && (
          <StoreMatcherQuiz 
            onSelectPlatform={(p) => { setSelectedPlatform(p); setActiveTab('platforms'); }} 
            onComparePlatforms={handleStartCompareFromQuiz}
            onViewRecommendations={(p) => { setSelectedPlatform(p); }}
          />
        )}

        {/* ============================================================ */}
        {/* TAB: 30-DAY LAUNCH ROADMAP */}
        {/* ============================================================ */}
        {activeTab === 'roadmap' && (
          <StoreRoadmapGenerator />
        )}

        {/* ============================================================ */}
        {/* TAB: WINNING PRODUCTS RADAR */}
        {/* ============================================================ */}
        {activeTab === 'products' && (
          <WinningProductsRadar />
        )}

        {/* ============================================================ */}
        {/* TAB 1: E-COMMERCE PLATFORMS COMPARISON */}
        {/* ============================================================ */}
        {activeTab === 'platforms' && (
          <div className="space-y-8">
            {/* Quick Matcher Banner */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-white/10">🎯</span>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base">محتار أي منصة هي الأنسب لنوع منتجك وميزانيتك؟</h4>
                  <p className="text-xs text-slate-300">أجب عن 4 أسئلة سريعة لاكتشاف المنصة الدقيقة مع كود الخصم وخطة العمل</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('quiz')}
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <span>بدء اختبار التشخيص (60 ثانية)</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View Mode Switcher: Cards vs Side-by-Side Comparison */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>مقارنة منصات التجارة الإلكترونية (Ecommerce Comparison)</span>
                    <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">مباشر</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    اختر متجرين أو أكثر لمقارنة الرسوم، العمولات، بوابات الدفع، ودعم اللغة العربية جنباً إلى جنب
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl self-start sm:self-center border border-white/10">
                <button
                  onClick={() => setPlatformViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    platformViewMode === 'cards'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  شبكة البطاقات ({filteredPlatforms.length})
                </button>
                <button
                  onClick={() => setPlatformViewMode('compare')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    platformViewMode === 'compare'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>جدول المقارنة</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    selectedComparePlatformIds.length >= 2 ? 'bg-amber-400 text-amber-950' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {selectedComparePlatformIds.length}
                  </span>
                </button>
              </div>
            </div>

            {platformViewMode === 'compare' ? (
              <div className="space-y-6">
                <EcommercePlatformComparison
                  selectedPlatformIds={selectedComparePlatformIds}
                  onTogglePlatform={handleToggleComparePlatform}
                  onClearPlatforms={handleClearComparePlatforms}
                  onSelectPlatformDetail={(p) => setSelectedPlatform(p)}
                />
              </div>
            ) : (
              <>
                {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>تصفية حسب السوق المستهدف:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'جميع المنصات' },
                  { id: 'السعودية والخليج', label: 'السعودية والخليج' },
                  { id: 'عالمي ودولي', label: 'عالمي ودولي (Dropshipping)' },
                  { id: 'شمال إفريقيا ومحلي', label: 'الدفع عند الاستلام (COD)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPlatformFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      platformFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlatforms.map((platform) => (
                <div 
                  key={platform.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Card Header */}
                    <div className="p-5 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={platform.logo_url} 
                            alt={platform.name_ar} 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-extrabold text-slate-900">{platform.name_ar}</h3>
                              <span className="text-xs text-slate-400 font-medium">({platform.name})</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                              <span>★ {platform.rating}</span>
                              <span className="text-slate-400 font-normal">({platform.review_count.toLocaleString('ar-EG')} تقييم)</span>
                            </div>
                          </div>
                        </div>

                        {platform.badge && (
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-indigo-200/70 whitespace-nowrap">
                            {platform.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed font-medium">
                        {platform.tagline}
                      </p>
                    </div>

                    {/* Pricing & Fees Snapshot */}
                    <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">رسوم الاشتراك:</span>
                        <span className="font-bold text-slate-800">{platform.starting_price}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">عمولة المبيعات:</span>
                        <span className="font-bold text-emerald-600">{platform.transaction_fee}</span>
                      </div>
                    </div>

                    {/* Features & Gateways */}
                    <div className="p-5 space-y-4">
                      {/* Best For */}
                      <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs">
                        <span className="font-bold text-indigo-900 block mb-1">الأنسب لمن؟</span>
                        <span className="text-indigo-800 leading-relaxed">{platform.best_for}</span>
                      </div>

                      {/* Payment Gateways tags */}
                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-2">بوابات الدفع المدعومة:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {platform.payment_gateways.slice(0, 4).map((gateway, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                              {gateway}
                            </span>
                          ))}
                          {platform.payment_gateways.length > 4 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center">
                              +{platform.payment_gateways.length - 4} أخرى
                            </span>
                          )}
                        </div>
                      </div>

                      {/* AI features */}
                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>ميزات الذكاء الاصطناعي:</span>
                        </span>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {platform.ai_features.slice(0, 2).map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Coupon if available */}
                      {platform.coupon_code && (
                        <div className="flex items-center justify-between bg-amber-50/80 border border-dashed border-amber-300 p-2.5 rounded-xl text-xs">
                          <div className="min-w-0 pr-1">
                            <span className="font-bold text-amber-900 block truncate">{platform.coupon_discount}</span>
                            <span className="text-[10px] text-amber-700">كود: <code className="font-mono font-bold">{platform.coupon_code}</code></span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(platform.coupon_code!)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
                          >
                            {copiedCode === platform.coupon_code ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>تم النسخ</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>نسخ الكود</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-2">
                    <div className="flex items-center gap-2 pt-4">
                      <a
                        href={platform.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>زيارة المنصة وتجربة العرض</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setSelectedPlatform(platform)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                        title="عرض كافة التفاصيل والخطط"
                      >
                        التفاصيل
                      </button>
                    </div>

                    {/* Add to Compare Button */}
                    <button
                      onClick={() => handleToggleComparePlatform(platform.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                        selectedComparePlatformIds.includes(platform.id)
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-black shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {selectedComparePlatformIds.includes(platform.id) 
                          ? '✓ محدد في المقارنة المباشرة' 
                          : '+ أضف للمقارنة مع متاجر أخرى'}
                      </span>
                    </button>

                    <span className="text-[10px] text-slate-400 text-center block">
                      {platform.trial_info}
                    </span>
                  </div>
                </div>
              ))}
            </div>

                {/* Full Interactive Comparison Matrix Under Grid */}
                <div className="mt-12">
                  <EcommercePlatformComparison
                    selectedPlatformIds={selectedComparePlatformIds}
                    onTogglePlatform={handleToggleComparePlatform}
                    onClearPlatforms={handleClearComparePlatforms}
                    onSelectPlatformDetail={(p) => setSelectedPlatform(p)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: INTERACTIVE PROFIT & FEE CALCULATOR */}
        {/* ============================================================ */}
        {activeTab === 'calculator' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                <Calculator className="w-3.5 h-3.5" />
                <span>حاسبة ذكية تفاعلية فورية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                حاسبة تكاليف المتاجر وصافي الأرباح المقارنة
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                حدد حجم مبيعاتك المتوقعة وطريقة الدفع لحساب التكلفة الفعلية لكل منصة شهرياً وسنوياً ومعرفة المنصة الأكثر توفيراً لمتجرك بدقة.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
                {/* 1. Monthly Sales */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <label>المبيعات الشهرية المتوقعة:</label>
                    <span className="text-indigo-600 font-extrabold text-sm font-mono">
                      {monthlySales.toLocaleString('ar-EG')} ر.س
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="300000"
                    step="5000"
                    value={monthlySales}
                    onChange={(e) => setMonthlySales(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>5,000 ر.س</span>
                    <span>150,000 ر.س</span>
                    <span>300,000 ر.س</span>
                  </div>
                </div>

                {/* 2. Average Order Value */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <label>متوسط قيمة الطلب (AOV):</label>
                    <span className="text-indigo-600 font-extrabold text-sm font-mono">
                      {averageOrderValue} ر.س
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={averageOrderValue}
                    onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    يُعادل تقريباً <strong className="text-slate-800 font-mono">{calculatorResults.ordersCount}</strong> طلب شهرياً
                  </span>
                </div>

                {/* 3. Electronic Payment Percentage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <label>نسبة الدفع الإلكتروني (مدى / فيزا):</label>
                    <span className="text-emerald-600 font-extrabold text-sm font-mono">
                      %{electronicPaymentPct}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={electronicPaymentPct}
                    onChange={(e) => setElectronicPaymentPct(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>10% دفع إلكتروني</span>
                    <span>(الباقي %{100 - electronicPaymentPct} دفع عند الاستلام)</span>
                    <span>100% إلكتروني</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-xs font-bold text-slate-600 block mb-2">نماذج جاهزة سريعة:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => { setMonthlySales(10000); setAverageOrderValue(150); }}
                      className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-2 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      متجر ناشئ (10k)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMonthlySales(50000); setAverageOrderValue(250); }}
                      className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-2 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      متجر متوسط (50k)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMonthlySales(150000); setAverageOrderValue(300); }}
                      className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-2 rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      علامة كبرى (150k)
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Column */}
              <div className="lg:col-span-7 space-y-6">
                {/* Highlight Recommendation Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                        <Award className="w-3.5 h-3.5" />
                        <span>الخيار الأكثر توفيراً لحجم مبيعاتك:</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{calculatorResults.cheapest.name}</h3>
                      <p className="text-slate-300 text-xs mt-1">{calculatorResults.cheapest.rec}</p>
                    </div>

                    <div className="text-left bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 text-center sm:text-left">
                      <span className="text-[11px] text-slate-300 block">إجمالي التكلفة الشهرية المقدرة:</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {Math.round(calculatorResults.cheapest.total).toLocaleString('ar-EG')} ر.س
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Comparison Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    مقارنة التكلفة الشهرية التقديرية بين كافة الخيارات:
                  </h4>

                  {calculatorResults.costs.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{item.name}</span>
                          {item.name.includes(calculatorResults.cheapest.name) && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              الأوفر
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          اشتراك: {item.planCost} ر.س + رسوم بوابات وعمولات: {Math.round(item.fees).toLocaleString('ar-EG')} ر.س
                        </p>
                      </div>

                      <div className="text-left">
                        <span className="text-base font-black text-slate-900 font-mono">
                          {Math.round(item.total).toLocaleString('ar-EG')} ر.س
                        </span>
                        <span className="text-[10px] text-slate-400 block">شهرياً شاملة الرسوم</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>ملاحظة دقيقة حول الرسوم:</span>
                  </span>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    الحسابات تشمل رسوم الاشتراك الشهري المقدرة ورسوم بوابات الدفع الإلكتروني (مدى بنسبة 1.75% + 1 ر.س، والبطاقات الائتمانية). شوبيفاي يضيف عمولة 2% إضافية عند استخدام بوابات غير تابعة لمنظومته في العالم العربي، في حين تمنح سلة وزد 0% عمولة على المبيعات.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: TOP AFFILIATE PROGRAMS DIRECTORY */}
        {/* ============================================================ */}
        {activeTab === 'affiliate' && (
          <div className="space-y-8">
            {/* Affiliate Strategy Guide & Earnings Estimation */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>دليل صناعة الدخل السلبي (Affiliate Marketing 2026)</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black">
                    كيف تربح من التسويق بالعمولة بدون امتلاك أي منتج أو مخزون؟
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    من خلال الترويج للمنصات والمتاجر العالمية في موقعك أو قنواتك، تحصل على عمولة مالية عن كل عملية اشتراك أو شراء ناجحة تتم عبر رابطك المخصص.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[200px]">
                  <span className="text-[11px] text-slate-300 block font-bold">متوسط أرباح المسوقين النشطين</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    3,500 - 15,000+
                  </span>
                  <span className="text-[10px] text-slate-400 block">ريال سعودي / شهرياً</span>
                </div>
              </div>

              {/* 3 Steps to Profit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                  <span className="text-amber-400 font-black text-xs">1. التقديم في البرنامج</span>
                  <p className="text-xs text-slate-300">سجل في برامج سلة، أمازون، ونون عبر الروابط أدناه للحصول على لوحة تحكم تتبع النقرات.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                  <span className="text-amber-400 font-black text-xs">2. نشر المحتوى المقنع</span>
                  <p className="text-xs text-slate-300">شارك مراجعات حقيقية، مقارنات، وكوبونات خصم تحفز المتابعين على الشراء فوراً.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                  <span className="text-amber-400 font-black text-xs">3. استلام العمولات</span>
                  <p className="text-xs text-slate-300">تُحول أرباحك مباشرة إلى حسابك البنكي أو PayPal بنهاية كل شهر ميلادي.</p>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>تصنيف برامج التسويق بالعمولة:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'جميع البرامج' },
                  { id: 'متاجر تجزئة وإلكترونيات', label: 'متاجر التجزئة الكبرى' },
                  { id: 'منصات ومواقع سحابية', label: 'منصات المتاجر والسحابة' },
                  { id: 'شبكات تسويق بالعمولة', label: 'الشبكات الجامعة (Networks)' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setAffiliateCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      affiliateCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Affiliate Program Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAffiliates.map((program) => (
                <div 
                  key={program.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={program.logo_url} 
                          alt={program.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">{program.name}</h3>
                          <span className="text-xs text-indigo-600 font-semibold">{program.category}</span>
                        </div>
                      </div>

                      {program.is_recommended && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
                          موصى به
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {program.description}
                    </p>

                    {/* Key Metrics Pill Grid */}
                    <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">نسبة العمولة:</span>
                        <span className="font-extrabold text-emerald-600">{program.commission_rate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">مدة الكوكي (Cookie):</span>
                        <span className="font-extrabold text-slate-800">{program.cookie_duration}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">الحد الأدنى للسحب:</span>
                        <span className="font-bold text-slate-800">{program.payout_threshold}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">طرق استلام الأرباح:</span>
                        <span className="font-bold text-slate-800 truncate block" title={program.payout_methods.join(', ')}>
                          {program.payout_methods.join(' / ')}
                        </span>
                      </div>
                    </div>

                    {/* Pros */}
                    <div>
                      <span className="text-xs font-bold text-slate-800 block mb-1.5">أبرز المزايا للمسوقين:</span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {program.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href={program.affiliate_signup_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm text-center transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>الانضمام والتقديم في البرنامج التابع</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: AI FOR E-COMMERCE TOOLS */}
        {/* ============================================================ */}
        {activeTab === 'ai-tools' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 sm:p-8 rounded-3xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>أدوات المستقبل للتجارة الإلكترونية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                أقوى أدوات الذكاء الاصطناعي لمضاعفة مبيعات متجرك وتوفير المصاريف
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                جلسات تصوير المنتجات، شات بوت خدمة العملاء والمبيعات على مدار 24 ساعة، كتابة أوصاف المنتجات الجاذبة، ومراقبة أسعار المنافسين آلياً.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ECOMMERCE_AI_TOOLS.map((tool) => (
                <div 
                  key={tool.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={tool.logo_url} 
                          alt={tool.name} 
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{tool.name}</h4>
                          <span className="text-[11px] text-indigo-600 font-semibold">{tool.category}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-500">★ {tool.rating}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 text-xs">
                      <span className="font-bold text-indigo-900 block mb-0.5 text-[11px]">الميزة الأبرز:</span>
                      <span className="text-indigo-800 text-[11px] leading-relaxed">{tool.key_feature}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-medium">الأسعار:</span>
                      <span className="font-bold text-slate-800">{tool.pricing}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href={tool.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>تجربة الأداة بالذكاء الاصطناعي</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: EXCLUSIVE DEALS & COUPONS */}
        {/* ============================================================ */}
        {activeTab === 'deals' && (
          <div className="space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                أحدث كوبونات الخصم والعروض الحصرية للمتاجر
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                وفر في تكاليف إطلاق متجرك أو تجديد اشتراكك مع هذه الأكواد الحصرية المعتمدة لعام 2026.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {COUPON_DEALS.map((deal) => (
                <div 
                  key={deal.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={deal.brand_logo} 
                          alt={deal.brand_name} 
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{deal.brand_name}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">{deal.category}</span>
                        </div>
                      </div>
                      {deal.is_exclusive && (
                        <span className="bg-rose-50 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200">
                          كوبون حصري
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{deal.title}</h3>
                    <p className="text-xs text-emerald-600 font-bold">{deal.discount_value}</p>

                    {deal.terms && (
                      <p className="text-[11px] text-slate-400">{deal.terms}</p>
                    )}
                  </div>

                  {/* Coupon Code Action Area */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">الكود:</span>
                      <code className="font-mono font-black text-indigo-700 text-sm tracking-wider">{deal.code}</code>
                    </div>

                    <button
                      onClick={() => handleCopyCode(deal.code)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode === deal.code ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ الكود</span>
                        </>
                      )}
                    </button>

                    <a
                      href={deal.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl transition-colors"
                      title="الذهاب للمتجر وتفعيل العرض"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FAQ ACCORDION SECTION */}
        {/* ============================================================ */}
        <div className="mt-16 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
              <span>الأسئلة الشائعة حول المتاجر والتسويق بالعمولة</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">إجابات الخبراء عن أكثر الأسئلة المتكررة لمساعدتك في اتخاذ القرار الصائب</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-right p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating Comparison Sticky Bar */}
      {selectedComparePlatformIds.length > 0 && activeTab === 'platforms' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 max-w-xl w-[92vw] transition-all">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex -space-x-2 space-x-reverse overflow-hidden flex-shrink-0">
              {selectedComparePlatformIds.slice(0, 4).map(id => {
                const p = ECOMMERCE_PLATFORMS.find(item => item.id === id);
                if (!p) return null;
                return (
                  <img 
                    key={id} 
                    src={p.logo_url} 
                    alt={p.name_ar} 
                    className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover bg-white" 
                  />
                );
              })}
            </div>
            <div className="min-w-0 truncate">
              <span className="text-xs font-black block text-amber-300">
                مقارنة ({selectedComparePlatformIds.length}) منصات
              </span>
              <span className="text-[11px] text-slate-300 block truncate">
                {selectedComparePlatformIds.map(id => ECOMMERCE_PLATFORMS.find(p => p.id === id)?.name_ar).filter(Boolean).join(' vs ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setPlatformViewMode('compare');
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>عرض الفروقات</span>
            </button>

            <button
              onClick={handleClearComparePlatforms}
              className="text-slate-400 hover:text-white p-2 rounded-lg text-xs transition-colors cursor-pointer"
              title="إلغاء التحديد"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal for Selected Platform */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative">
            <button 
              onClick={() => setSelectedPlatform(null)}
              className="absolute top-6 left-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4">
              <img 
                src={selectedPlatform.logo_url} 
                alt={selectedPlatform.name_ar} 
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedPlatform.name_ar} ({selectedPlatform.name})</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedPlatform.tagline}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedPlatform.description}
            </p>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2">
                <span className="font-extrabold text-emerald-900 block">الإيجابيات والمميزات:</span>
                <ul className="space-y-1.5 text-emerald-800">
                  {selectedPlatform.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 space-y-2">
                <span className="font-extrabold text-rose-900 block">السلبيات والمآخذ:</span>
                <ul className="space-y-1.5 text-rose-800">
                  {selectedPlatform.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase">خطط وباقات الأسعار:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedPlatform.plans.map((plan, i) => (
                  <div key={i} className={`p-3.5 rounded-xl border text-xs ${plan.is_popular ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50'}`}>
                    <span className="font-bold text-slate-900 block mb-1">{plan.name}</span>
                    <span className="text-indigo-600 font-extrabold text-sm block mb-2">{plan.price}</span>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {plan.features.map((f, j) => (
                        <li key={j}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedPlatform(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                إغلاق
              </button>

              <a
                href={selectedPlatform.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              >
                <span>الذهاب لموقع {selectedPlatform.name_ar} وتفعيل العرض</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
