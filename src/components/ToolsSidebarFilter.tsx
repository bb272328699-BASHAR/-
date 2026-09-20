import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Code, 
  Smartphone, 
  Chrome, 
  Cpu, 
  Star, 
  DollarSign, 
  Layers, 
  X,
  CheckSquare,
  Square,
  CreditCard,
  SlidersHorizontal,
  FolderGit2,
  CheckCircle2,
  Monitor,
  MousePointerClick,
  GraduationCap,
  Wrench,
  Compass
} from 'lucide-react';
import { Category } from '../types.ts';

export interface FilterState {
  arabicSupport: boolean;
  freeAvailable: boolean;
  noRegistration: boolean;
  verifiedOnly: boolean;
  hasApi: boolean;
  hasMobileApp: boolean;
  hasBrowserExtension: boolean;
  isOpenSource: boolean;
  selectedCategory: string;
  selectedPricing: string[];
  subscriptionType: string; // 'all' | 'monthly' | 'yearly' | 'lifetime' | 'usage'
  maxPriceLimit: number; // 0 = any, 20, 50, 100
  minRating: number;
  availability: 'all' | 'web' | 'browser_extension' | 'mobile' | 'api' | 'open_source';
  easeOfUse: 'all' | 'beginner' | 'no_code' | 'intermediate' | 'advanced_dev';
}

interface ToolsSidebarFilterProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: Category[];
  totalMatching: number;
  totalLoaded: number;
  resetAllFilters: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const ToolsSidebarFilter: React.FC<ToolsSidebarFilterProps> = ({
  filterState,
  setFilterState,
  categories,
  totalMatching,
  totalLoaded,
  resetAllFilters,
  isMobileOpen = false,
  onCloseMobile
}) => {

  const toggleFeature = (key: keyof FilterState) => {
    setFilterState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const togglePricing = (pricingValue: string) => {
    setFilterState((prev) => {
      const exists = prev.selectedPricing.includes(pricingValue);
      const updated = exists
        ? prev.selectedPricing.filter((p) => p !== pricingValue)
        : [...prev.selectedPricing, pricingValue];
      return { ...prev, selectedPricing: updated };
    });
  };

  const activeFiltersCount = 
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

  const filterContent = (
    <div className="space-y-6" dir="rtl">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">تصفية متقدمة شاملة</h3>
            <p className="text-[11px] text-slate-500">حسب السعر والاشتراك والمميزات</p>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="إعادة تعيين كافة الفلاتر"
          >
            <RotateCcw className="w-3 h-3" />
            <span>مسح ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* 1. Technical & Core Features (المميزات التقنية) */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
          المميزات التقنية والقدرات
        </label>

        <div className="space-y-1.5">
          {/* 1. Arabic Language Support */}
          <button
            type="button"
            onClick={() => toggleFeature('arabicSupport')}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
              filterState.arabicSupport
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-2xs'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${filterState.arabicSupport ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>يدعم اللغة العربية</span>
            </div>
            {filterState.arabicSupport ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-300" />}
          </button>

          {/* 2. Developer API Available */}
          <button
            type="button"
            onClick={() => toggleFeature('hasApi')}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
              filterState.hasApi
                ? 'bg-cyan-50/80 border-cyan-200 text-cyan-900 shadow-2xs'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${filterState.hasApi ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Code className="w-3.5 h-3.5" />
              </div>
              <span>واجهة برمجية (API)</span>
            </div>
            {filterState.hasApi ? <CheckSquare className="w-4 h-4 text-cyan-600" /> : <Square className="w-4 h-4 text-slate-300" />}
          </button>

          {/* 3. Mobile App Available */}
          <button
            type="button"
            onClick={() => toggleFeature('hasMobileApp')}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
              filterState.hasMobileApp
                ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-2xs'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${filterState.hasMobileApp ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span>تطبيق هاتف (iOS / Android)</span>
            </div>
            {filterState.hasMobileApp ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-300" />}
          </button>

          {/* 4. Browser Extension */}
          <button
            type="button"
            onClick={() => toggleFeature('hasBrowserExtension')}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
              filterState.hasBrowserExtension
                ? 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-2xs'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${filterState.hasBrowserExtension ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Chrome className="w-3.5 h-3.5" />
              </div>
              <span>إضافة للمتصفح (Extension)</span>
            </div>
            {filterState.hasBrowserExtension ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 text-slate-300" />}
          </button>

          {/* 5. Open Source */}
          <button
            type="button"
            onClick={() => toggleFeature('isOpenSource')}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
              filterState.isOpenSource
                ? 'bg-teal-50/80 border-teal-200 text-teal-900 shadow-2xs'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${filterState.isOpenSource ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FolderGit2 className="w-3.5 h-3.5" />
              </div>
              <span>مفتوح المصدر (Open Source)</span>
            </div>
            {filterState.isOpenSource ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4 text-slate-300" />}
          </button>

          {/* 6. Verified Tools Only */}
          <button
            type="button"
            onClick={() => toggleFeature('verifiedOnly')}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
              filterState.verifiedOnly
                ? 'bg-purple-50/80 border-purple-200 text-purple-900 shadow-2xs'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${filterState.verifiedOnly ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>أدوات موثوقة ومفحوصة</span>
            </div>
            {filterState.verifiedOnly ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-slate-300" />}
          </button>

          {/* 7. No Registration Required */}
          <button
            type="button"
            onClick={() => toggleFeature('noRegistration')}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
              filterState.noRegistration
                ? 'bg-rose-50/80 border-rose-200 text-rose-900 shadow-2xs'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${filterState.noRegistration ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>استخدام مباشر دون تسجيل</span>
            </div>
            {filterState.noRegistration ? <CheckSquare className="w-4 h-4 text-rose-600" /> : <Square className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* 2. Pricing Models (نماذج التسعير) */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
          نموذج السعر والتكلفة
        </label>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'Free', label: 'مجاني 100%' },
            { id: 'Freemium', label: 'مجاني جزئياً' },
            { id: 'Free Trial', label: 'تجربة مجانية' },
            { id: 'Paid', label: 'مدفوع' },
          ].map((item) => {
            const isSelected = filterState.selectedPricing.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => togglePricing(item.id)}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold border transition-all text-right cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Subscription Cycle / License Type (نوع الاشتراك والفوترة) */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
          نوع خطة الاشتراك
        </label>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'جميع الخطط' },
            { id: 'monthly', label: 'اشتراك شهري' },
            { id: 'yearly', label: 'اشتراك سنوي' },
            { id: 'usage', label: 'حسب الاستهلاك' },
          ].map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setFilterState((prev) => ({ ...prev, subscriptionType: sub.id }))}
              className={`p-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                filterState.subscriptionType === sub.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Max Price Budget Filter (الحد الأقصى للسعر) */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            الحد الأقصى للتكلفة الشهرية
          </label>
          <span className="text-xs font-extrabold text-indigo-600">
            {filterState.maxPriceLimit === 0 ? 'غير محدد' : `أقل من $${filterState.maxPriceLimit}`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { limit: 0, label: 'الكل' },
            { limit: 15, label: '$15' },
            { limit: 30, label: '$30' },
            { limit: 50, label: '$50+' },
          ].map((p) => (
            <button
              key={p.limit}
              type="button"
              onClick={() => setFilterState((prev) => ({ ...prev, maxPriceLimit: p.limit }))}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                filterState.maxPriceLimit === p.limit
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Rating Threshold (الحد الأدنى للتقييم) */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            أدنى تقييم مقبول
          </label>
          <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {filterState.minRating > 0 ? `${filterState.minRating}+` : 'الكل'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[0, 4.0, 4.5, 4.8].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setFilterState((prev) => ({ ...prev, minRating: score }))}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                filterState.minRating === score
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {score === 0 ? 'الكل' : `${score}+`}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Availability & Platform (التوفر ومنصات التشغيل) */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            التوفر ومنصة التشغيل
          </label>
          {filterState.availability !== 'all' && (
            <button
              type="button"
              onClick={() => setFilterState((prev) => ({ ...prev, availability: 'all' }))}
              className="text-[10px] text-indigo-600 font-bold hover:underline"
            >
              إلغاء التحديد
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'جميع المنصات', icon: Globe },
            { id: 'web', label: 'موقع سحابي (Web)', icon: Monitor },
            { id: 'browser_extension', label: 'إضافة متصفح', icon: Chrome },
            { id: 'mobile', label: 'تطبيق هاتف', icon: Smartphone },
            { id: 'api', label: 'واجهة برمجية API', icon: Code },
            { id: 'open_source', label: 'مفتوح المصدر', icon: FolderGit2 },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = filterState.availability === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterState((prev) => ({ ...prev, availability: item.id as any }))}
                className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition-all text-right cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Ease of Use (سهولة الاستخدام ومستوى الخبرة) */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            سهولة الاستخدام ومستوى الخبرة
          </label>
          {filterState.easeOfUse !== 'all' && (
            <button
              type="button"
              onClick={() => setFilterState((prev) => ({ ...prev, easeOfUse: 'all' }))}
              className="text-[10px] text-indigo-600 font-bold hover:underline"
            >
              إلغاء التحديد
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'كافة المستويات', desc: 'عرض جميع الأدوات دون تقييد', icon: Compass },
            { id: 'beginner', label: 'سهل جداً للمبتدئين 🟢', desc: 'واجهة بسيطة بنقرات سهلة دون تعقيد', icon: MousePointerClick },
            { id: 'no_code', label: 'بدون برمجة (No-Code) ⚡', desc: 'سحب وإفلات وقوالب جاهزة للأعمال', icon: CheckCircle2 },
            { id: 'intermediate', label: 'متوسط ومحترف 🟡', desc: 'تحكم متقدم وإعدادات مخصصة', icon: Wrench },
            { id: 'advanced_dev', label: 'للمطورين والخبراء 🔴', desc: 'يتطلب خبرة برمجية أو دمج API', icon: Code },
          ].map((lvl) => {
            const Icon = lvl.icon;
            const isSelected = filterState.easeOfUse === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setFilterState((prev) => ({ ...prev, easeOfUse: lvl.id as any }))}
                className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block font-black">{lvl.label}</span>
                    <span className={`block text-[10px] ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>{lvl.desc}</span>
                  </div>
                </div>
                {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" /> : <Square className="w-4 h-4 text-slate-300 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Category Quick Select (الأقسام والتصنيفات) */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
          الأقسام والتصنيفات
        </label>

        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setFilterState((prev) => ({ ...prev, selectedCategory: 'all' }))}
            className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterState.selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            جميع الأقسام
          </button>

          {(categories || []).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterState((prev) => ({ ...prev, selectedCategory: cat.slug }))}
              className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-medium transition-colors truncate block cursor-pointer ${
                filterState.selectedCategory === cat.slug
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Matching Count Footer Banner */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-700">
        تم العثور على <span className="text-indigo-600 font-extrabold">{totalMatching}</span> أداة مطابقة
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Panel */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm h-fit sticky top-24">
        {filterContent}
      </aside>

      {/* Mobile Modal Drawer Filter */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-black text-slate-900 text-sm">خيارات التصفية الشاملة</span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
};

