import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  PieChart, 
  Users, 
  ShieldCheck, 
  RefreshCw,
  SlidersHorizontal,
  Download,
  Share2,
  Check,
  Briefcase,
  Layers,
  Building2,
  Sparkle
} from 'lucide-react';

interface RoiCalculatorPageProps {
  navigate: (path: string) => void;
}

export const RoiCalculatorPage: React.FC<RoiCalculatorPageProps> = ({ navigate }) => {
  // Inputs
  const [teamSize, setTeamSize] = useState<number>(1);
  const [hourlyRate, setHourlyRate] = useState<number>(25); // $25/hour average
  const [monthlySubscriptionCost, setMonthlySubscriptionCost] = useState<number>(40); // $40/month
  const [weeklyHoursSavedPerPerson, setWeeklyHoursSavedPerPerson] = useState<number>(6); // 6 hours/week saved
  const [currency, setCurrency] = useState<'USD' | 'SAR' | 'AED' | 'EGP'>('USD');
  const [reportCopied, setReportCopied] = useState<boolean>(false);

  // Currency exchange approximate multiplier for display
  const currencyRate = {
    USD: { symbol: '$', rate: 1, name: 'دولار أمريكي' },
    SAR: { symbol: 'ر.س', rate: 3.75, name: 'ريال سعودي' },
    AED: { symbol: 'د.إ', rate: 3.67, name: 'درهم إماراتي' },
    EGP: { symbol: 'ج.م', rate: 48.5, name: 'جنيه مصري' },
  }[currency];

  // Calculations
  const monthlyHoursSaved = weeklyHoursSavedPerPerson * 4.33 * teamSize;
  const monthlyFinancialValueSaved = monthlyHoursSaved * hourlyRate;
  const totalMonthlyCost = monthlySubscriptionCost * teamSize;
  const netMonthlyProfit = monthlyFinancialValueSaved - totalMonthlyCost;
  const annualSavings = netMonthlyProfit * 12;
  const roiPercentage = totalMonthlyCost > 0 
    ? Math.round((netMonthlyProfit / totalMonthlyCost) * 100) 
    : 1000;

  // Helper to format currency
  const formatCurrency = (valInUsd: number) => {
    const converted = Math.round(valInUsd * currencyRate.rate);
    return `${converted.toLocaleString()} ${currencyRate.symbol}`;
  };

  // Preset Scenarios
  const applyPreset = (preset: 'freelancer' | 'agency' | 'startup' | 'enterprise') => {
    switch (preset) {
      case 'freelancer':
        setTeamSize(1);
        setHourlyRate(25);
        setMonthlySubscriptionCost(40);
        setWeeklyHoursSavedPerPerson(7);
        break;
      case 'agency':
        setTeamSize(5);
        setHourlyRate(35);
        setMonthlySubscriptionCost(60);
        setWeeklyHoursSavedPerPerson(9);
        break;
      case 'startup':
        setTeamSize(12);
        setHourlyRate(45);
        setMonthlySubscriptionCost(80);
        setWeeklyHoursSavedPerPerson(10);
        break;
      case 'enterprise':
        setTeamSize(30);
        setHourlyRate(55);
        setMonthlySubscriptionCost(100);
        setWeeklyHoursSavedPerPerson(8);
        break;
    }
  };

  const copyReport = () => {
    const reportText = `📊 تقرير جدوى الاستثمار في الذكاء الاصطناعي (AI ROI Report)
---------------------------------------------
👥 حجم الفريق: ${teamSize} مستخدم
💰 متوسط قيمة ساعة العمل: ${formatCurrency(hourlyRate)}/ساعة
💳 تكلفة الاشتراكات الشهرية الإجمالية: ${formatCurrency(totalMonthlyCost)}/شهر
⏱️ إجمالي الساعات الموفرة شهرياً: ${Math.round(monthlyHoursSaved)} ساعة
---------------------------------------------
📈 نسبة العائد على الاستثمار (ROI): +${roiPercentage}%
💵 صافي الربح والوفورات الشهرية: ${formatCurrency(netMonthlyProfit)}
🌟 صافي الوفورات السنوية المتوقعة: ${formatCurrency(annualSavings)}
---------------------------------------------
تم الإنشاء بواسطة دليل الذكاء الاصطناعي العربي`;

    navigator.clipboard.writeText(reportText);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10" dir="rtl">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-blue-700 shadow-2xs">
          <Calculator className="w-3.5 h-3.5 text-blue-600" />
          <span>حاسبة العائد المالي والإنتاجية (AI ROI & Cost Calculator)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          احسب العائد الحقيقي على استثمارك في أدوات الذكاء الاصطناعي
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          حدد تكلفة اشتراكاتك وعدد ساعات العمل الموفرة لحساب القيمة المالية الصافية ونسبة العائد على الاستثمار (ROI) بدقة.
        </p>

        {/* Currency Selector */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <span className="text-xs font-bold text-slate-500 ml-1">عرض العملة:</span>
          {(['USD', 'SAR', 'AED', 'EGP'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                currency === c
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {c === 'USD' ? 'الدولار ($)' : c === 'SAR' ? 'الريال السعودي (ر.س)' : c === 'AED' ? 'الدرهم (د.إ)' : 'الجنيه (ج.م)'}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Personas Bar */}
      <div className="bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border border-indigo-100 rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Sparkle className="w-4 h-4 text-indigo-600" />
            <span>نماذج وسيناريوهات جاهزة بنقرة واحدة:</span>
          </span>
          <span className="text-[11px] text-slate-500">اختر سيناريو لتعبئة القيم تلقائياً حسب معايير السوق</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset('freelancer')}
            className="bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 p-2.5 rounded-2xl text-right transition-all cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">مستقل / فردي</div>
              <div className="text-[10px] text-slate-500">شخص واحد • $40/ش</div>
            </div>
          </button>

          <button
            onClick={() => applyPreset('agency')}
            className="bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 p-2.5 rounded-2xl text-right transition-all cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">وكالة رقمية</div>
              <div className="text-[10px] text-slate-500">5 أشخاص • $60/ش</div>
            </div>
          </button>

          <button
            onClick={() => applyPreset('startup')}
            className="bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 p-2.5 rounded-2xl text-right transition-all cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">شركة ناشئة</div>
              <div className="text-[10px] text-slate-500">12 شخص • $80/ش</div>
            </div>
          </button>

          <button
            onClick={() => applyPreset('enterprise')}
            className="bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 p-2.5 rounded-2xl text-right transition-all cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">مؤسسة كبرى</div>
              <div className="text-[10px] text-slate-500">30 شخص • $100/ش</div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              <span>معايير ومدخلات الحساب</span>
            </h2>
            <button
              onClick={() => {
                setTeamSize(1);
                setHourlyRate(25);
                setMonthlySubscriptionCost(40);
                setWeeklyHoursSavedPerPerson(6);
              }}
              className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة ضبط</span>
            </button>
          </div>

          <div className="space-y-5">
            
            {/* 1. Team Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  حجم الفريق / عدد المستخدمين:
                </span>
                <span className="text-indigo-600 font-extrabold text-sm bg-indigo-50 px-3 py-1 rounded-xl">
                  {teamSize} {teamSize === 1 ? 'مستخدم فردي' : 'أشخاص'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* 2. Hourly Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  متوسط تكلفة / قيمة ساعة العمل للشخص ({currencyRate.symbol}):
                </span>
                <span className="text-emerald-700 font-extrabold text-sm bg-emerald-50 px-3 py-1 rounded-xl">
                  {formatCurrency(hourlyRate)} / ساعة
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* 3. Monthly Subscription Cost */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-purple-600" />
                  تكلفة الاشتراكات الشهرية للأدوات لكل شخص ({currencyRate.symbol}):
                </span>
                <span className="text-purple-700 font-extrabold text-sm bg-purple-50 px-3 py-1 rounded-xl">
                  {formatCurrency(monthlySubscriptionCost)} / شهر
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={monthlySubscriptionCost}
                onChange={(e) => setMonthlySubscriptionCost(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* 4. Weekly Hours Saved */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  ساعات العمل الموفرة أسبوعياً لكل شخص:
                </span>
                <span className="text-amber-700 font-extrabold text-sm bg-amber-50 px-3 py-1 rounded-xl">
                  {weeklyHoursSavedPerPerson} ساعات / أسبوعياً
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={weeklyHoursSavedPerPerson}
                onChange={(e) => setWeeklyHoursSavedPerPerson(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Results Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-300 block mb-0.5">النتيجة المالية التقديرية</span>
              <h3 className="text-xl font-black">العائد على الاستثمار (ROI)</h3>
            </div>
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/10"
              title="نسخ تقرير الجدوى"
            >
              {reportCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>مشاركة التقرير</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            
            {/* ROI Big Percentage */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">نسبة العائد الصافي (ROI)</span>
              <span className="text-4xl sm:text-5xl font-black text-emerald-400 block tracking-tight">
                +{roiPercentage}%
              </span>
            </div>

            {/* Annual Savings */}
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center space-y-1">
              <span className="text-[11px] text-emerald-300 block font-medium">صافي الوفورات المالية السنوية المتوقعة</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">
                {formatCurrency(annualSavings)}
              </span>
            </div>

            {/* Breakdown Mini Grid */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">ساعات موفرة شهرياً</span>
                <span className="font-bold text-white text-sm">{Math.round(monthlyHoursSaved)} ساعة</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">تكلفة الاشتراكات</span>
                <span className="font-bold text-rose-300 text-sm">{formatCurrency(totalMonthlyCost)} / شهر</span>
              </div>
            </div>

          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate('/advisor')}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>احصل على ترشيح أدوات ملائمة لميزانيتك</span>
            </button>

            <button
              onClick={copyReport}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{reportCopied ? 'تم نسخ التقرير للحافظة' : 'نسخ ملخص دراسة الجدوى'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
