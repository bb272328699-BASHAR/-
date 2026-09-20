import React, { useState } from 'react';
import {
  DollarSign,
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
  PieChart
} from 'lucide-react';

interface AdminRevenueEstimatorProps {
  currentMonthlyPageviews?: number;
}

export const AdminRevenueEstimator: React.FC<AdminRevenueEstimatorProps> = ({
  currentMonthlyPageviews = 45000,
}) => {
  // Calculator State
  const [monthlyPageviews, setMonthlyPageviews] = useState<number>(currentMonthlyPageviews);
  const [adUnitsPerPage, setAdUnitsPerPage] = useState<number>(3);
  const [regionProfile, setRegionProfile] = useState<'gcc' | 'mena' | 'us_tier1' | 'mixed'>('mixed');
  const [avgCtr, setAvgCtr] = useState<number>(1.6); // 1.6% average CTR in AI/Tech
  const [affiliateConversionRate, setAffiliateConversionRate] = useState<number>(1.2); // 1.2% outbound conversion

  // Regional Base CPC & RPM Multipliers for AI & Tech Directory Niche
  const regionConfig = {
    gcc: {
      name: 'دول الخليج العربي (السعودية، الإمارات، الكويت، قطر)',
      baseCpm: 4.80,
      avgCpc: 0.48,
      baseRpm: 8.50,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    mena: {
      name: 'الشرق الأوسط وشمال أفريقيا (مصر، المغرب، الأردن، الجزائر)',
      baseCpm: 1.80,
      avgCpc: 0.18,
      baseRpm: 3.40,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    us_tier1: {
      name: 'أمريكا الشمالية وأوروبا (Tier 1 Global Audience)',
      baseCpm: 8.50,
      avgCpc: 0.95,
      baseRpm: 16.20,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    mixed: {
      name: 'جمهور عربي تقني متوازن (ترافيك خليجي + عربي عام)',
      baseCpm: 3.20,
      avgCpc: 0.35,
      baseRpm: 6.80,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
  };

  const currentRegion = regionConfig[regionProfile];

  // AdSense Calculation Math
  const totalImpressions = monthlyPageviews * adUnitsPerPage;
  const estimatedAdClicks = Math.round(totalImpressions * (avgCtr / 100));
  const estimatedAdSenseMonthly = Number((estimatedAdClicks * currentRegion.avgCpc + (totalImpressions / 1000) * (currentRegion.baseCpm * 0.4)).toFixed(2));
  const effectiveRpm = Number(((estimatedAdSenseMonthly / monthlyPageviews) * 1000).toFixed(2));
  const estimatedAdSenseDaily = Number((estimatedAdSenseMonthly / 30).toFixed(2));
  const estimatedAdSenseAnnual = Number((estimatedAdSenseMonthly * 12).toFixed(2));

  // Affiliate & Sponsored Synergy Potential
  const monthlyOutboundClicks = Math.round(monthlyPageviews * (affiliateConversionRate / 100));
  const estimatedAffiliateSignups = Math.round(monthlyOutboundClicks * 0.08); // 8% trial conversion
  const estimatedAffiliateMonthly = Number((estimatedAffiliateSignups * 22).toFixed(2)); // $22 avg SaaS recurring commission
  const totalBlendedMonthlyRevenue = Number((estimatedAdSenseMonthly + estimatedAffiliateMonthly).toFixed(2));

  // Placement Performance Matrix
  const adPlacements = [
    {
      slot: 'أعلى شريط الأدوات والمقالات (Header Banner)',
      size: '728x90 / Responsive Leaderboard',
      viewability: '88%',
      ctr: '1.4%',
      estRpm: `$${(currentRegion.baseRpm * 0.32).toFixed(2)}`,
      impact: 'رؤية فورية للزائر، تدعم عروض المزايدة التنافسية (Header Bidding)',
      tag: 'عالي المشاهدة',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      slot: 'داخل محتوى المقال والمراجعة (In-Article Native)',
      size: 'Fluid / 336x280 Large Rectangle',
      viewability: '92%',
      ctr: '2.8%',
      estRpm: `$${(currentRegion.baseRpm * 0.45).toFixed(2)}`,
      impact: 'أعلى معدل نقرات (CTR)؛ لأن الزائر في حالة قراءة وتركيز عميق',
      tag: 'أعلى عائد نقري',
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      slot: 'شريط تفاصيل الأداة والإجراءات (Tool Detail Action Slot)',
      size: '300x250 Sticky / Responsive',
      viewability: '84%',
      ctr: '2.1%',
      estRpm: `$${(currentRegion.baseRpm * 0.38).toFixed(2)}`,
      impact: 'استهداف نية شراء مباشرة (Commercial Intent) لرواد الأعمال والمطورين',
      tag: 'استهداف مباشر',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      slot: 'الشريط السفلي الثابت عند التمرير (Sticky Footer Anchor)',
      size: '320x50 Mobile / 728x90 Desktop Anchor',
      viewability: '96%',
      ctr: '1.9%',
      estRpm: `$${(currentRegion.baseRpm * 0.28).toFixed(2)}`,
      impact: 'تثبيت مستمر دون إزعاج القارئ، يرفع عائد الألف ظهور بنسبة 35%',
      tag: 'تثبيت ذكي',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <DollarSign className="w-6 h-6" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                حاسبة الأرباح التقديرية واستراتيجيات تحسين Google AdSense
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              تحليل دقيق للأرباح الشهرية والسنوية المتوقعة من إعلانات جوجل وعمولات التسويق، مع توصيات علمية لزيادة عائد الألف ظهور (RPM) وسعر النقرة (CPC) في قطاع أدوات الذكاء الاصطناعي.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 self-start lg:self-auto shrink-0">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[11px] text-slate-300 block font-bold">نيتش الذكاء الاصطناعي (AI SaaS)</span>
              <span className="text-xs font-black text-amber-300">من الفئات الأعلى ربحية عالمياً</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. CALCULATOR CONTROLS & REVENUE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Parameters Slider (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">معايير محاكاة حجم الزيارات والتفاعل</h3>
          </div>

          {/* Monthly Pageviews */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">مشاهدات الصفحات الشهرية (Pageviews)</span>
              <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {monthlyPageviews.toLocaleString('ar-EG')} زيارة
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={monthlyPageviews}
              onChange={(e) => setMonthlyPageviews(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5,000</span>
              <span>100,000</span>
              <span>250,000</span>
              <span>500,000+</span>
            </div>
          </div>

          {/* Region Audience Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              الموقع الجغرافي ونوعية الجمهور المستهدف:
            </label>
            <select
              value={regionProfile}
              onChange={(e) => setRegionProfile(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 outline-none focus:border-indigo-500"
            >
              <option value="gcc">🇸🇦 🇦🇪 🇰🇼 دول الخليج العربي (عائد مرتفع جداً)</option>
              <option value="mixed">🌐 جمهور عربي تقني متوازن (الافتراضي لدليل AI)</option>
              <option value="mena">🇪🇬 🇲🇦 🇯🇴 شمال أفريقيا والشرق الأوسط (عائد متوسط)</option>
              <option value="us_tier1">🇺🇸 🇬🇧 أمريكا الشمالية وأوروبا (أعلى عائد دولي)</option>
            </select>
          </div>

          {/* Ad Units Per Page */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">عدد المساحات الإعلانية المعروضة بالصفحة</span>
              <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {adUnitsPerPage} مساحات
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setAdUnitsPerPage(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    adUnitsPerPage === num
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} {num === 1 ? 'مساحة' : 'مساحات'}
                </button>
              ))}
            </div>
          </div>

          {/* CTR Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">معدل النقر إلى الظهور المتوقع (Ad CTR)</span>
              <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                {avgCtr}%
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="4.0"
              step="0.1"
              value={avgCtr}
              onChange={(e) => setAvgCtr(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.8% (تحفظي)</span>
              <span>1.6% (متوسط تقني)</span>
              <span>4.0% (محسّن)</span>
            </div>
          </div>

          {/* Quick Preset Quick Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">سيناريوهات جاهزة وسريعة:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setMonthlyPageviews(15000); setAdUnitsPerPage(2); setRegionProfile('mixed'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] font-bold text-slate-600 transition-colors"
              >
                بداية الإطلاق (15K)
              </button>
              <button
                type="button"
                onClick={() => { setMonthlyPageviews(60000); setAdUnitsPerPage(3); setRegionProfile('gcc'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] font-bold text-slate-600 transition-colors"
              >
                نمو خليجي (60K)
              </button>
              <button
                type="button"
                onClick={() => { setMonthlyPageviews(200000); setAdUnitsPerPage(3); setRegionProfile('mixed'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] font-bold text-slate-600 transition-colors"
              >
                منصة متصدرة (200K)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Projected Output Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Hero Card: AdSense Monthly Earnings */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 -mt-8 -ml-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-200 block">العائد الشهري التقديري من Google AdSense</span>
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mt-1 block">
                  ${estimatedAdSenseMonthly.toLocaleString('en-US')}
                  <span className="text-base font-bold text-indigo-200 font-sans mr-2">/ شهرياً</span>
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold shadow-inner">
                <Sparkles className="w-7 h-7 text-amber-300" />
              </div>
            </div>

            {/* Run Rate & Key Metrics Row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-indigo-400/30">
              <div className="bg-indigo-900/40 p-3 rounded-xl border border-indigo-400/20">
                <span className="text-[11px] text-indigo-200 block">العائد اليومي المقدر</span>
                <span className="text-sm font-black text-white font-mono">${estimatedAdSenseDaily}</span>
              </div>
              <div className="bg-indigo-900/40 p-3 rounded-xl border border-indigo-400/20">
                <span className="text-[11px] text-indigo-200 block">عائد الألف ظهور (RPM)</span>
                <span className="text-sm font-black text-amber-300 font-mono">${effectiveRpm}</span>
              </div>
              <div className="bg-indigo-900/40 p-3 rounded-xl border border-indigo-400/20">
                <span className="text-[11px] text-indigo-200 block">العائد السنوي المقدر</span>
                <span className="text-sm font-black text-emerald-300 font-mono">${estimatedAdSenseAnnual.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>

          {/* Secondary Card: Blended Revenue Synergy (AdSense + Affiliate Commissions) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">العائد الكلي المدمج (AdSense + روابط التسويق بالعمولة)</h4>
                  <p className="text-[11px] text-slate-500">النموذج الربحي الكامل لمواقع الأدلة والذكاء الاصطناعي الاحترافية</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                تآزر مزدوج
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-bold block">إعلانات AdSense</span>
                <span className="text-xl font-black text-slate-900 font-mono">${estimatedAdSenseMonthly.toLocaleString('en-US')}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">من {totalImpressions.toLocaleString('ar-EG')} ظهور إعلاني</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-bold block">عمولات اشتراكات الأدوات (SaaS Affiliate)</span>
                <span className="text-xl font-black text-emerald-600 font-mono">+${estimatedAffiliateMonthly.toLocaleString('en-US')}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">تقدير {estimatedAffiliateSignups} اشتراك مدفوع</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">إجمالي الدخل الشهري المتوقع للمنصة:</span>
                <span className="text-xs text-emerald-700">بناءً على الترافيك والروابط الحالية</span>
              </div>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                ${totalBlendedMonthlyRevenue.toLocaleString('en-US')}
                <span className="text-xs font-bold font-sans text-emerald-800 mr-1">/ شهر</span>
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 2. AD PLACEMENT & VIEWABILITY HEATMAP TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">مصفوفة توزيع المساحات الإعلانية ومعدل الرؤية (Viewability)</h3>
              <p className="text-[11px] text-slate-500">أماكن الإعلانات المدمجة في الموقع وأداؤها المتوقع وفق إرشادات جوجل الرسمية</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            4 مساحات استراتيجية
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">موضع المساحة الإعلانية</th>
                <th className="p-3">المقاس الموصى به</th>
                <th className="p-3 text-center">نسبة الرؤية</th>
                <th className="p-3 text-center">معدل النقر (CTR)</th>
                <th className="p-3 text-center">عائد الألف (RPM)</th>
                <th className="p-3">التأثير والجدوى الفنية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adPlacements.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${item.tagColor}`}>
                        {item.tag}
                      </span>
                      <span>{item.slot}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 text-[11px]">{item.size}</td>
                  <td className="p-3.5 text-center font-mono font-black text-emerald-600">{item.viewability}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-indigo-600">{item.ctr}</td>
                  <td className="p-3.5 text-center font-mono font-black text-slate-900">{item.estRpm}</td>
                  <td className="p-3.5 text-slate-600 text-[11px] max-w-xs">{item.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PRO ADSENSE OPTIMIZATION TIPS & SECRETS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">نصائح وإرشادات معتمدة لمضاعفة أرباح Google AdSense</h3>
            <p className="text-[11px] text-slate-500">ممارسات ذهبية ينصح بها خبراء تحسين المواقع لتحقيق أعلى سعر للنقرة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Tip 1 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</div>
            <h4 className="font-bold text-slate-900 text-xs">استهداف الكلمات المفتاحية ذات النية الشرائية (High-Intent)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              المقالات التي تقارن بين أدوات الذكاء الاصطناعي (مثل: "مقارنة ChatGPT Plus مقابل Claude Pro") تجذب إعلانات تجارية بسعر نقرة (CPC) يصل إلى 2$ - 5$ للزيارة الواحدة مقارنة بالمقالات الإخبارية العامة.
            </p>
          </div>

          {/* Tip 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</div>
            <h4 className="font-bold text-slate-900 text-xs">حماية تجربة المستخدم ومؤشرات Core Web Vitals</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              تم في المنصة تحديد ارتفاعات ثابتة لحاويات الإعلانات (`min-height`)؛ وذلك لمنع انزياح المحتوى التراكمي (CLS)، وهو ما يمنح الموقع ترتيباً أعلى في جوجل ويضمن بقاء نسبة النقر في الحدود الآمنة.
            </p>
          </div>

          {/* Tip 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">3</div>
            <h4 className="font-bold text-slate-900 text-xs">الاستفادة من الإعلانات التلقائية (Google Auto Ads)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              يمكنك تفعيل خيار الإعلانات التلقائية من تبويب "إدارة الإعلانات والمساحات" باللوحة، حيث تستخدم خوارزميات جوجل التعلم الآلي لتحديد أفضل أوقات وأماكن ظهور الإعلانات لكل زائر بشكل فردي.
            </p>
          </div>

          {/* Tip 4 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">4</div>
            <h4 className="font-bold text-slate-900 text-xs">تحسين نسبة الرؤية (Ad Viewability &gt; 70%)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              يدفع المعلنون أسعاراً مضاعفة للمواقع التي تتجاوز نسبة مشاهدة إعلاناتها 70%. وضع الإعلان داخل نص المقال وقرب أزرار المقارنة يضمن بقاءه أمام الزائر أثناء اتخاذ قراره.
            </p>
          </div>

          {/* Tip 5 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">5</div>
            <h4 className="font-bold text-slate-900 text-xs">تفعيل ملف ads.txt والمزايدة التنافسية</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              توفير ملف `ads.txt` سليم يحمي نطاقك من محاولات انتحال المخزون الإعلاني، ويفتح المجال أمام شركات الإعلان الكبرى لتقديم عروض أسعار أعلى للظهور في دليلك.
            </p>
          </div>

          {/* Tip 6 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center">6</div>
            <h4 className="font-bold text-slate-900 text-xs">الامتثال لسياسات الزيارات وتجنب النقرات غير الشرعية</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              احرص على ألا تطلب من المستخدمين النقر على الإعلانات، وتجنب وضع الإعلانات قريباً جداً من أزرار التحميل، واعتمد كلياً على حركة الزيارات العضوية من محركات البحث وشبكات التواصل.
            </p>
          </div>

        </div>
      </div>

      {/* 4. ADSENSE ACCEPTANCE READINESS CHECKLIST */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">قائمة الجاهزية للموافقة السريعة في Google AdSense</h3>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            جاهزية كاملة 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>صفحة سياسة الخصوصية والاستخدام (جاهزة)</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>صفحات التعريف والاتصال بنا (جاهزة)</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>محتوى تقني غني ومقارنات احترافية أصلية</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>تصميم سريع متجاوب خالي من الأخطاء</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>هيكلية تنقل واضحة وفهارس تصنيف دقيقة</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>توزيع إعلاني ذكي غير متداخل مع المحتوى</span>
          </div>
        </div>
      </div>
    </div>
  );
};
