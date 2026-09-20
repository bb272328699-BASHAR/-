import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart3,
  HelpCircle,
  ExternalLink,
  Award,
  Globe2,
  MousePointerClick,
  Smartphone,
  Check,
  Flame,
  PieChart,
  Split,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Calendar,
  DollarSign,
  Activity,
  Printer,
  RefreshCw,
  Gauge
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface AdminRevenueGrowthProps {
  initialMonthlyPageviews?: number;
}

export type VariantKey = 'variantA' | 'variantB' | 'variantC' | 'custom';

export const AdminRevenueGrowth: React.FC<AdminRevenueGrowthProps> = ({
  initialMonthlyPageviews = 50000,
}) => {
  // Global Simulation Controls
  const [basePageviews, setBasePageviews] = useState<number>(initialMonthlyPageviews);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(12); // 12% monthly compounding traffic growth
  const [timeHorizon, setTimeHorizon] = useState<6 | 12 | 24>(12);
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('variantB');

  // Custom Variant Adjustable Parameters
  const [customAdCount, setCustomAdCount] = useState<number>(3);
  const [customRpm, setCustomRpm] = useState<number>(7.50);
  const [customCtr, setCustomCtr] = useState<number>(1.8);
  const [customBounceImpact, setCustomBounceImpact] = useState<number>(3.0);
  const [customViewability, setCustomViewability] = useState<number>(80);

  // Predefined A/B Testing Scenarios Definition
  const variants = {
    variantA: {
      name: 'النموذج التحفظي (Variant A: Low-Density)',
      subtitle: 'مساحة إعلانية واحدة أو اثنتين مع تركيز أقصى على سرعة الموقع',
      adCount: 2,
      baseRpm: 4.20,
      ctr: 1.1,
      viewability: 91,
      bouncePenaltyPercent: 0, // No bounce penalty
      color: '#64748b', // Slate
      badge: 'الوضع الآمن',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      description: 'أعلى معدل بقاء للزائر، لكنه يترك أكثر من 50% من الإيرادات المحتملة على الطاولة.',
    },
    variantB: {
      name: 'النموذج المتوازن الذكي (Variant B: Balanced Native)',
      subtitle: '3 إلى 4 مساحات مدمجة بذكاء في المقالات والأدوات (الموصى به)',
      adCount: 3,
      baseRpm: 8.60,
      ctr: 2.2,
      viewability: 82,
      bouncePenaltyPercent: 1.8, // Minimal negligible bounce penalty
      color: '#4f46e5', // Indigo
      badge: 'الأعلى كفاءة والأفضل توازناً 🏆',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold',
      description: 'يحقق أقصى ربحية مستدامة مع الحفاظ على تجربة مستخدم ممتازة وتوافق تام مع Core Web Vitals.',
    },
    variantC: {
      name: 'النموذج عالي الكثافة (Variant C: High-Yield Aggressive)',
      subtitle: '5+ مساحات إعلانية تشمل الشريط الثابت والإعلانات البينية',
      adCount: 5,
      baseRpm: 12.40,
      ctr: 2.9,
      viewability: 63,
      bouncePenaltyPercent: 12.5, // Significant bounce risk
      color: '#e11d48', // Rose
      badge: 'عائد نقدي سريع مع مخاطر ارتداد',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'عائد فوري مرتفع لكل ألف ظهور، لكنه قد يرفع معدل الارتداد ويؤثر على السيو على المدى الطويل.',
    },
    custom: {
      name: 'النموذج المخصص (Custom Simulation)',
      subtitle: 'تخصيص كامل لعدد الإعلانات ومعدل الـ RPM وعوامل الرؤية',
      adCount: customAdCount,
      baseRpm: customRpm,
      ctr: customCtr,
      viewability: customViewability,
      bouncePenaltyPercent: customBounceImpact,
      color: '#059669', // Emerald
      badge: 'محاكاة مخصصة',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'سيناريو مخصص لاختبار فرضيات النمو الخاصة بك ومقارنتها مع النماذج المعيارية.',
    },
  };

  // Generate Projections Time-Series Data for Recharts
  const projectionData = useMemo(() => {
    const data = [];
    const monthsArabic = [
      'الشهر 1', 'الشهر 2', 'الشهر 3', 'الشهر 4', 'الشهر 5', 'الشهر 6',
      'الشهر 7', 'الشهر 8', 'الشهر 9', 'الشهر 10', 'الشهر 11', 'الشهر 12',
      'الشهر 13', 'الشهر 14', 'الشهر 15', 'الشهر 16', 'الشهر 17', 'الشهر 18',
      'الشهر 19', 'الشهر 20', 'الشهر 21', 'الشهر 22', 'الشهر 23', 'الشهر 24'
    ];

    let cumA = 0;
    let cumB = 0;
    let cumC = 0;
    let cumCustom = 0;

    for (let m = 0; m < timeHorizon; m++) {
      // Monthly compounding traffic factor
      const trafficGrowthMultiplier = Math.pow(1 + monthlyGrowthRate / 100, m);
      const grossPageviews = Math.round(basePageviews * trafficGrowthMultiplier);

      // Adjust for bounce penalty per variant
      const pvA = Math.round(grossPageviews * (1 - variants.variantA.bouncePenaltyPercent / 100));
      const pvB = Math.round(grossPageviews * (1 - variants.variantB.bouncePenaltyPercent / 100));
      const pvC = Math.round(grossPageviews * (1 - variants.variantC.bouncePenaltyPercent / 100));
      const pvCustom = Math.round(grossPageviews * (1 - variants.custom.bouncePenaltyPercent / 100));

      // Calculate Monthly Earnings = (Pageviews / 1000) * RPM
      const revA = Math.round((pvA / 1000) * variants.variantA.baseRpm);
      const revB = Math.round((pvB / 1000) * variants.variantB.baseRpm);
      const revC = Math.round((pvC / 1000) * variants.variantC.baseRpm);
      const revCustom = Math.round((pvCustom / 1000) * variants.custom.baseRpm);

      cumA += revA;
      cumB += revB;
      cumC += revC;
      cumCustom += revCustom;

      data.push({
        month: monthsArabic[m],
        monthNum: m + 1,
        grossPageviews,
        'النموذج التحفظي (A)': revA,
        'النموذج المتوازن (B)': revB,
        'النموذج عالي الكثافة (C)': revC,
        'النموذج المخصص': revCustom,
        cumA,
        cumB,
        cumC,
        cumCustom,
      });
    }

    return data;
  }, [basePageviews, monthlyGrowthRate, timeHorizon, customAdCount, customRpm, customCtr, customBounceImpact, customViewability]);

  // Cumulative Totals for Comparison Bar Chart
  const cumulativeComparisonData = useMemo(() => {
    const lastPoint = projectionData[projectionData.length - 1];
    if (!lastPoint) return [];

    return [
      {
        name: 'التحفظي (A)',
        variant: 'A',
        totalEarnings: lastPoint.cumA,
        color: '#64748b',
        rpm: variants.variantA.baseRpm,
        adCount: variants.variantA.adCount,
      },
      {
        name: 'المتوازن الذكي (B)',
        variant: 'B',
        totalEarnings: lastPoint.cumB,
        color: '#4f46e5',
        rpm: variants.variantB.baseRpm,
        adCount: variants.variantB.adCount,
      },
      {
        name: 'عالي الكثافة (C)',
        variant: 'C',
        totalEarnings: lastPoint.cumC,
        color: '#e11d48',
        rpm: variants.variantC.baseRpm,
        adCount: variants.variantC.adCount,
      },
      {
        name: 'المخصص (Custom)',
        variant: 'Custom',
        totalEarnings: lastPoint.cumCustom,
        color: '#059669',
        rpm: variants.custom.baseRpm,
        adCount: variants.custom.adCount,
      },
    ];
  }, [projectionData, variants]);

  // Metrics summary for the currently active variant
  const activeVarData = variants[selectedVariant];
  const lastMonthData = projectionData[projectionData.length - 1] || {};
  const currentMonthProjected =
    selectedVariant === 'variantA'
      ? lastMonthData['النموذج التحفظي (A)']
      : selectedVariant === 'variantB'
      ? lastMonthData['النموذج المتوازن (B)']
      : selectedVariant === 'variantC'
      ? lastMonthData['النموذج عالي الكثافة (C)']
      : lastMonthData['النموذج المخصص'];

  const baselineMonthProjected = lastMonthData['النموذج التحفظي (A)'] || 1;
  const netLiftPercentage = Math.round(((currentMonthProjected - baselineMonthProjected) / baselineMonthProjected) * 100);

  return (
    <div className="space-y-8" dir="rtl">
      {/* 1. HERO HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Split className="w-6 h-6 text-indigo-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                نموذج تسريع ونمو الأرباح ومحاكاة اختبارات (A/B Testing) لكثافة الإعلانات
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              محاكاة علمية لاختبار سيناريوهات توزيع المساحات الإعلانية في Google AdSense، والتنبؤ بمنحنيات نمو الأرباح الشهرية التراكمية بناءً على معدلات النمو وموازنة الـ RPM مع تجربة المستخدم.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[11px] text-slate-300 block font-bold">الخوارزمية المعتمدة</span>
              <span className="text-xs font-black text-emerald-300">RPM Compound Forecast</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GLOBAL SIMULATION CONTROLS & TIME HORIZON */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">متغيرات محاكاة الترافيك ومعدل النمو التراكمي</h3>
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 px-2">أفق التوقع:</span>
            {[6, 12, 24].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTimeHorizon(m as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeHorizon === m
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m} شهر
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Base Monthly Traffic */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>حجم الزيارات الحالي (مشاهدات/شهر):</span>
              <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {basePageviews.toLocaleString('ar-EG')} زيارة
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="500000"
              step="10000"
              value={basePageviews}
              onChange={(e) => setBasePageviews(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10K</span>
              <span>100K</span>
              <span>250K</span>
              <span>500K+</span>
            </div>
          </div>

          {/* Monthly Growth Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>معدل نمو الترافيك الشهري المتوقع (%):</span>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                +{monthlyGrowthRate}% شهرياً
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="35"
              step="1"
              value={monthlyGrowthRate}
              onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>+2% (نمو بطيء)</span>
              <span>+12% (نمو سيو طبيعي)</span>
              <span>+35% (فيروسية)</span>
            </div>
          </div>

          {/* Quick Scenario Pre-configurations */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-700">قوالب نمو جاهزة:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setBasePageviews(30000); setMonthlyGrowthRate(8); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] font-bold text-slate-600 transition-colors"
              >
                نمو متدرج هادئ
              </button>
              <button
                type="button"
                onClick={() => { setBasePageviews(60000); setMonthlyGrowthRate(15); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] font-bold text-slate-600 transition-colors"
              >
                نمو متوسط نشط
              </button>
              <button
                type="button"
                onClick={() => { setBasePageviews(120000); setMonthlyGrowthRate(25); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] font-bold text-slate-600 transition-colors"
              >
                توسع سريع (Hyper-growth)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. A/B TEST VARIANTS SELECTOR CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Split className="w-4 h-4 text-indigo-600" />
            <span>سيناريوهات ونماذج اختبار كثافة المساحات الإعلانية (A/B Test Variants)</span>
          </h3>
          <span className="text-xs text-slate-500">اختر نموذجاً لمقارنة تأثيره على المؤشرات الحيوية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(variants) as VariantKey[]).map((vKey) => {
            const item = variants[vKey];
            const isSelected = selectedVariant === vKey;

            return (
              <div
                key={vKey}
                onClick={() => setSelectedVariant(vKey)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.subtitle}</p>
                  </div>

                  {/* Core Metrics Pill Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">عائد الـ RPM</span>
                      <span className="font-mono font-black text-indigo-600">${item.baseRpm.toFixed(2)}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">مساحات بالصفحة</span>
                      <span className="font-mono font-black text-slate-800">{item.adCount} إعلانات</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">نسبة الرؤية</span>
                      <span className="font-mono font-black text-emerald-600">{item.viewability}%</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">مخاطر الارتداد</span>
                      <span className={`font-mono font-black ${item.bouncePenaltyPercent > 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                        +{item.bouncePenaltyPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-100">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3.5 CUSTOM VARIANT CONFIGURATOR (If Custom Selected) */}
      {selectedVariant === 'custom' && (
        <div className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-700" />
            <h4 className="font-extrabold text-sm text-emerald-950">تخصيص متغيرات النموذج المخصص (Custom Variant)</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">عدد المساحات الإعلانية:</label>
              <input
                type="number"
                min="1"
                max="8"
                value={customAdCount}
                onChange={(e) => setCustomAdCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">عائد الألف ظهور المتوقع ($ RPM):</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="25"
                value={customRpm}
                onChange={(e) => setCustomRpm(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">نسبة الرؤية المتوقعة (Viewability %):</label>
              <input
                type="number"
                min="30"
                max="98"
                value={customViewability}
                onChange={(e) => setCustomViewability(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">تأثير الارتداد المتوقع (Bounce Impact %):</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={customBounceImpact}
                onChange={(e) => setCustomBounceImpact(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. RECHARTS: MONTHLY REVENUE GROWTH PROJECTION (Area Chart) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                مسار نمو العائد الشهري المتوقع عبر نماذج الـ A/B (Monthly Revenue Trajectory)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              مقارنة الإيرادات الشهرية بالدولار الأمريكي على مدار {timeHorizon} شهراً مع مراعاة معدل نمو الترافيك (+{monthlyGrowthRate}%)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600">الرفع المالي المتوقع (Net Lift):</span>
            <span className="font-mono font-black text-emerald-600 text-xs">
              +{netLiftPercentage}%
            </span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVarB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorVarC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorVarA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `$${val.toLocaleString('en-US')}`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString('en-US')}`, '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  direction: 'rtl'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="النموذج التحفظي (A)"
                stroke="#64748b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVarA)"
              />
              <Area
                type="monotone"
                dataKey="النموذج المتوازن (B)"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVarB)"
              />
              <Area
                type="monotone"
                dataKey="النموذج عالي الكثافة (C)"
                stroke="#e11d48"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorVarC)"
              />
              {selectedVariant === 'custom' && (
                <Area
                  type="monotone"
                  dataKey="النموذج المخصص"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={0.3}
                  fill="#059669"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. RECHARTS: CUMULATIVE EARNINGS TOTALS & METRICS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Cumulative Comparison Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">
                مجموع الأرباح التراكمية المحققة (Cumulative Cash Flow خلال {timeHorizon} شهراً)
              </h4>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">
              مقارنة مالية إجمالية
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cumulativeComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString('en-US')}`, 'إجمالي الأرباح التراكمية']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    direction: 'rtl'
                  }}
                />
                <Bar dataKey="totalEarnings" radius={[10, 10, 0, 0]} fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Key Takeaways & Decision Support (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="font-extrabold text-slate-900 text-sm">الخلاصة والتوصية المعيارية للنمو</h4>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1.5">
              <span className="text-xs font-bold text-indigo-900 block">🏆 الفائز في معادلة النمو المستدام:</span>
              <span className="text-sm font-black text-indigo-700 block">
                النموذج المتوازن الذكي (Variant B - 3 to 4 Ads)
              </span>
              <p className="text-[11px] text-indigo-800/90 leading-relaxed">
                يحقق عائداً تراكمياً أعلى بنسبة <strong>+104%</strong> مقارنة بالنموذج التحفظي، مع تفادي 95% من مخاطر انخفاض ترتيب السيو الناتجة عن النموذج العدواني.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-bold">العائد التراكمي للنموذج B ({timeHorizon} شهر):</span>
                <span className="font-mono font-black text-emerald-600">
                  ${(cumulativeComparisonData.find(c => c.variant === 'B')?.totalEarnings || 0).toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-bold">الفارق النقدي الإضافي المحقق (Extra Cash):</span>
                <span className="font-mono font-black text-indigo-600">
                  +${((cumulativeComparisonData.find(c => c.variant === 'B')?.totalEarnings || 0) - (cumulativeComparisonData.find(c => c.variant === 'A')?.totalEarnings || 0)).toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم تصميم المنصة بحيث تطبق النموذج B افتراضياً لضمان أعلى ربحية آمنة.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
