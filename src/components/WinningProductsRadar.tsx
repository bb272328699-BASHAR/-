import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Flame, 
  DollarSign, 
  ShoppingBag, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  Search, 
  Eye, 
  Percent, 
  Target, 
  CheckCircle2, 
  ArrowUpRight, 
  Share2, 
  Tag, 
  BarChart2, 
  Truck, 
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';

export interface TrendingProduct {
  id: string;
  title_ar: string;
  title_en: string;
  category: 'electronics' | 'beauty' | 'home' | 'fashion' | 'lifestyle';
  category_ar: string;
  image_url: string;
  estimated_cost_sar: number;
  recommended_price_sar: number;
  profit_margin_pct: number;
  trend_score: number; // 1 - 100
  viral_platform: 'TikTok' | 'Instagram' | 'Snapchat';
  target_audience: string;
  marketing_angle: string;
  ad_hook: string;
  supplier_source: string;
  supplier_url: string;
  difficulty_level: 'سهل' | 'متوسط' | 'متقدم';
  is_verified_winner: boolean;
}

const WINNING_PRODUCTS: TrendingProduct[] = [
  {
    id: 'prod-1',
    title_ar: 'خلاط ومطحنة القهوة المحمولة اللاسلكية Type-C',
    title_en: 'Portable Wireless Espresso & Coffee Grinder',
    category: 'lifestyle',
    category_ar: 'لايف ستايل وقهوة',
    image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
    estimated_cost_sar: 45,
    recommended_price_sar: 179,
    profit_margin_pct: 74,
    trend_score: 96,
    viral_platform: 'TikTok',
    target_audience: 'عشاق القهوة المختصة، موظفو المكاتب، والطلاب والرحالة',
    marketing_angle: 'استمتع بإسبريسو طازج مطحون على أصوله في ثوانٍ أينما كنت دون أسلاك أو مقابس كهربائية.',
    ad_hook: 'ليش تدفع 25 ريال يومياً للكافيه وأنت تقدر تطحن كوبك الفاخر بدقيقة واحدة بمكتبك وسيارتك؟',
    supplier_source: 'AliExpress / مورد جملة محلي',
    supplier_url: 'https://www.aliexpress.com',
    difficulty_level: 'سهل',
    is_verified_winner: true
  },
  {
    id: 'prod-2',
    title_ar: 'جهاز تبييض الأسنان المنزلي بتقنية الضوء الأزرق LED',
    title_en: 'Home Teeth Whitening LED Light Kit',
    category: 'beauty',
    category_ar: 'العناية والجمال',
    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    estimated_cost_sar: 38,
    recommended_price_sar: 189,
    profit_margin_pct: 79,
    trend_score: 94,
    viral_platform: 'Snapchat',
    target_audience: 'الشباب والفتيات، المقبلون على المناسبات والزواجات، وصناع المحتوى',
    marketing_angle: 'ابتسامة ناصعة البياض ونتائج عيادات الأسنان من راحة غرفتك خلال 7 أيام فقط وبدون حساسية.',
    ad_hook: 'قبل أي مناسبة أو زواج.. الحل السري السريع لابتسامة هوليوود بدون دفع آلاف الريالات بالعيادة!',
    supplier_source: 'CJ Dropshipping / مورد صيدلاني',
    supplier_url: 'https://cjdropshipping.com',
    difficulty_level: 'متوسط',
    is_verified_winner: true
  },
  {
    id: 'prod-3',
    title_ar: 'مصباح الغروب والفضاء الذكي مع تحكم بالجوال',
    title_en: 'Smart Sunset & Galaxy Projector Lamp',
    category: 'home',
    category_ar: 'ديكور ومستلزمات منزلية',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    estimated_cost_sar: 28,
    recommended_price_sar: 129,
    profit_margin_pct: 78,
    trend_score: 91,
    viral_platform: 'TikTok',
    target_audience: 'صناع محتوى الفيديوهات، غرف النوم، جلسات التصوير، والأجواء الرومانسية',
    marketing_angle: 'حوّل غرفتك إلى استوديو تصوير سينمائي بضغطة زر وتدرجات إضاءة ساحرة تسحر كل من يراها.',
    ad_hook: 'سر الفيديوهات الفخمة على تيك توك اللي الكل يسأل عنها في التعليقات صار متاح بين يديك!',
    supplier_source: 'AliExpress Direct',
    supplier_url: 'https://www.aliexpress.com',
    difficulty_level: 'سهل',
    is_verified_winner: true
  },
  {
    id: 'prod-4',
    title_ar: 'شاحن مغناطيسي 3 في 1 قابل للطي (آيفون، ساعة، وسماعة)',
    title_en: '3-in-1 Foldable MagSafe Travel Wireless Charger',
    category: 'electronics',
    category_ar: 'إلكترونيات واكسسوارات',
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    estimated_cost_sar: 52,
    recommended_price_sar: 199,
    profit_margin_pct: 73,
    trend_score: 95,
    viral_platform: 'Instagram',
    target_audience: 'أصحاب أجهزة أبل، المسافرون ورجال الأعمال، وعشاق الترتيب والتقنية',
    marketing_angle: 'وداعاً لفوضى الأسلاك المتشابكة على مكتبك وأثناء سفرك؛ شاحن واحد يغنيك عن 3 شواحن بحجم الجيب.',
    ad_hook: 'تخيل تشحن كل أجهزتك بشاحن واحد أصغر من علبة سماعاتك.. رفيق السفر الذي لن تستغني عنه أبداً!',
    supplier_source: 'مستودعات الشحن السريع في الخليج',
    supplier_url: 'https://aliexpress.com',
    difficulty_level: 'سهل',
    is_verified_winner: true
  },
  {
    id: 'prod-5',
    title_ar: 'مصحح القوام الذكي مع حساس اهتزاز وتنبيه للظهر',
    title_en: 'Smart Vibration Posture Corrector',
    category: 'lifestyle',
    category_ar: 'صحة وعناية شخصية',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    estimated_cost_sar: 22,
    recommended_price_sar: 119,
    profit_margin_pct: 81,
    trend_score: 89,
    viral_platform: 'Snapchat',
    target_audience: 'موظفو المكاتب، طلاب المدارس والجامعات، وكل من يعاني من آلام الرقبة والانحناء',
    marketing_angle: 'حل ذكي وصامت ينبهك باهتزاز لطيف فور انحناء ظهرك، ليعيد لك القوام المستقيم بدون مشدات مؤلمة.',
    ad_hook: 'تقضي ساعات طويلة أمام الشاشة وظهرك بدأ يؤلمك؟ هذا الجهاز الصغير يمنع تحدب ظهرك نهائياً!',
    supplier_source: 'AliExpress / CJ',
    supplier_url: 'https://cjdropshipping.com',
    difficulty_level: 'سهل',
    is_verified_winner: true
  },
  {
    id: 'prod-6',
    title_ar: 'فرشاة تصفيف وتجفيف الشعر الاحترافية بالأيونات السالبة',
    title_en: 'One-Step Hair Dryer & Styler Ionic Brush',
    category: 'beauty',
    category_ar: 'العناية والجمال',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    estimated_cost_sar: 40,
    recommended_price_sar: 169,
    profit_margin_pct: 76,
    trend_score: 93,
    viral_platform: 'TikTok',
    target_audience: 'السيدات والفتيات الباحثات عن تصفيف سريع لشعرهن قبل الدوام أو الخروج',
    marketing_angle: 'تجفيف وتصفيف وتسريح شعرك في خطوة واحدة خلال 10 دقائق فقط بنتائج صالونات التجميل.',
    ad_hook: 'وفري وقتك الصباحي وفلوس المشاغل! استشواري شعرك بدقائق مع لمعان ونعومة خيالية بدون حرق أطرافه.',
    supplier_source: 'موردين التجميل بالجملة',
    supplier_url: 'https://aliexpress.com',
    difficulty_level: 'متوسط',
    is_verified_winner: true
  }
];

export const WinningProductsRadar: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProduct, setActiveProduct] = useState<TrendingProduct | null>(null);

  const filteredProducts = useMemo(() => {
    return WINNING_PRODUCTS.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery = !searchQuery || 
        p.title_ar.includes(searchQuery) || 
        p.category_ar.includes(searchQuery) ||
        p.target_audience.includes(searchQuery);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/30">
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>رادار المنتجات الرابحة وتريندات التيك توك 2026</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            منتجات عالية الطلب مع خطة تسويقية وزاوية إعلانية جاهزة
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            لا تضيع وقتك في تجربة منتجات عشوائية. قمنا بتحليل المنتجات الأكثر مبيعاً في الأسواق الخليجية مع حساب التكلفة وهامش الربح وزاوية الإعلان (Hook) المقنعة للشراء فوراً.
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-center">
          <div className="p-2 bg-white/5 rounded-xl border border-white/5">
            <span className="block text-xl sm:text-2xl font-black text-emerald-400 font-mono">+70%</span>
            <span className="text-[11px] text-slate-400">متوسط هامش الربح</span>
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/5">
            <span className="block text-xl sm:text-2xl font-black text-rose-400 font-mono">90+</span>
            <span className="text-[11px] text-slate-400">مؤشر الترند والانتشار</span>
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/5">
            <span className="block text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</span>
            <span className="text-[11px] text-slate-400">فحص وتوثيق الجدوى</span>
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/5">
            <span className="block text-xl sm:text-2xl font-black text-indigo-400 font-mono">3X</span>
            <span className="text-[11px] text-slate-400">مضاعفة العائد الإعلاني (ROAS)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'جميع المنتجات' },
            { id: 'lifestyle', label: 'لايف ستايل وقهوة' },
            { id: 'beauty', label: 'العناية والجمال' },
            { id: 'electronics', label: 'إلكترونيات وشواحن' },
            { id: 'home', label: 'ديكور ومنزل' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث عن منتج أو فئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* Product Image and Badges */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={product.image_url}
                  alt={product.title_ar}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Viral Platform Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>تريند {product.viral_platform}</span>
                  </span>
                </div>

                {/* Trend Score */}
                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">
                  مؤشر الطلب {product.trend_score}%
                </div>

                {/* Title & Category over gradient */}
                <div className="absolute bottom-3 right-3 left-3 text-white">
                  <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">
                    {product.category_ar}
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base leading-snug line-clamp-1">
                    {product.title_ar}
                  </h3>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="bg-slate-50/90 p-4 border-b border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">سعر الشراء:</span>
                  <span className="font-black text-slate-700 font-mono">{product.estimated_cost_sar} ر.س</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">سعر البيع المقترح:</span>
                  <span className="font-black text-indigo-600 font-mono">{product.recommended_price_sar} ر.س</span>
                </div>
                <div className="bg-emerald-50 rounded-lg p-1 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 block font-bold">هامش الربح:</span>
                  <span className="font-black text-emerald-600 font-mono">%{product.profit_margin_pct}</span>
                </div>
              </div>

              {/* Strategy Details */}
              <div className="p-5 space-y-4 text-xs">
                {/* Marketing Angle */}
                <div>
                  <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>زاوية البيع الأساسية (Selling Angle):</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed line-clamp-2">
                    {product.marketing_angle}
                  </p>
                </div>

                {/* Ad Hook */}
                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/70">
                  <span className="font-extrabold text-amber-900 block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>عنوان الإعلان المقترح (Ad Hook):</span>
                  </span>
                  <p className="text-amber-800 font-medium italic line-clamp-2">
                    "{product.ad_hook}"
                  </p>
                </div>

                {/* Target Audience */}
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">الجمهور المستهدف: </span>
                  <span>{product.target_audience}</span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-2">
              <div className="flex items-center gap-2 pt-4">
                <button
                  onClick={() => setActiveProduct(product)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 px-4 rounded-xl text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>تفاصيل الخطة التسويقية للمنتج</span>
                </button>
                <a
                  href={product.supplier_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-2.5 rounded-xl text-xs transition-colors flex items-center justify-center"
                  title="البحث عن المورد"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <span className="text-[10px] text-slate-400 text-center block font-medium">
                المصدر الموصى به: {product.supplier_source}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for In-Depth Product Strategy */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 block">{activeProduct.category_ar}</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{activeProduct.title_ar}</h3>
                <span className="text-xs text-slate-400 font-mono">{activeProduct.title_en}</span>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-xs text-slate-500 block">تكلفة شراء الحبة:</span>
                <span className="text-lg font-black text-slate-800 font-mono">{activeProduct.estimated_cost_sar} ر.س</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">سعر البيع بالسوق:</span>
                <span className="text-lg font-black text-indigo-600 font-mono">{activeProduct.recommended_price_sar} ر.س</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">صافي الربح المتوقع للحبة:</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  {activeProduct.recommended_price_sar - activeProduct.estimated_cost_sar} ر.س ({activeProduct.profit_margin_pct}%)
                </span>
              </div>
            </div>

            {/* Strategy Steps */}
            <div className="space-y-3 text-xs sm:text-sm">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>كيف تبدأ ببيع هذا المنتج بنجاح؟</span>
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-indigo-600">1.</span>
                  <span>اطلب عينة تجريبية أو حمّل مقاطع فيديو للمنتج بدون حقوق من تيك توك لتجهيز الإعلانات.</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-indigo-600">2.</span>
                  <span>افتح صفحة المنتج في متجرك (سلة أو شوبيفاي) واستخدم الصور البيضاء وخلفيات الذكاء الاصطناعي من أداة Pebblely.</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-indigo-600">3.</span>
                  <span>أطلق حملة إعلانية بميزانية تبدأ من 50 ريال يومياً على تيك توك أو سناب شات مستهدفاً الجمهور المحدد.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href={activeProduct.supplier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>البحث عن موردين للمنتج</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
