import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  Check, 
  DollarSign, 
  TrendingUp, 
  ArrowRight, 
  Loader2, 
  Zap, 
  Workflow, 
  ExternalLink,
  Scale,
  Plus,
  Trash2,
  Share2,
  CheckCircle2,
  Calculator
} from 'lucide-react';
import { useCompare } from '../context/CompareContext.tsx';
import { fetchCustomStacks, saveCustomStack } from '../lib/firestoreService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DEFAULT_TOOLS } from '../data/defaultCatalog.ts';

interface StacksPageProps {
  navigate: (path: string) => void;
}

interface StackTool {
  name: string;
  role: string;
  slug: string;
}

interface StackItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  targetRole: string;
  monthlyEstimate: string;
  estimatedProductivityBoost: string;
  tools: StackTool[];
  workflowSteps: string[];
}

export const StacksPage: React.FC<StacksPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [stacks, setStacks] = useState<StackItem[]>([]);
  const [customStacks, setCustomStacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'featured' | 'custom' | 'create'>('featured');
  const { addToCompare, clearCompare } = useCompare();

  // Custom Stack Builder State
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderRole, setBuilderRole] = useState('صانع محتوى');
  const [builderDesc, setBuilderDesc] = useState('');
  const [selectedToolSlugs, setSelectedToolSlugs] = useState<string[]>(['chatgpt', 'midjourney']);
  const [savingStack, setSavingStack] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/stacks').then(res => res.json()).catch(() => []),
      fetchCustomStacks().catch(() => [])
    ]).then(([featuredData, customData]) => {
      setStacks(featuredData || []);
      setCustomStacks(customData || []);
    }).finally(() => setLoading(false));
  }, []);

  const loadStackToCompare = (stack: StackItem) => {
    clearCompare();
    stack.tools.slice(0, 3).forEach((tool) => {
      addToCompare({
        id: tool.slug,
        name: tool.name,
        slug: tool.slug,
        logo_url: `https://avatar.vercel.sh/${tool.slug}.png`,
        tagline: tool.role
      });
    });
    navigate('/comparisons');
  };

  const handleToggleToolInBuilder = (slug: string) => {
    if (selectedToolSlugs.includes(slug)) {
      setSelectedToolSlugs(selectedToolSlugs.filter(s => s !== slug));
    } else {
      if (selectedToolSlugs.length >= 6) return;
      setSelectedToolSlugs([...selectedToolSlugs, slug]);
    }
  };

  const calculateBuilderTotalCost = () => {
    let total = 0;
    selectedToolSlugs.forEach(slug => {
      const tool = DEFAULT_TOOLS.find(t => t.slug === slug);
      if (tool) {
        if (tool.pricing_type === 'Free') total += 0;
        else if (tool.starting_price?.includes('$')) {
          const num = parseFloat(tool.starting_price.replace(/[^0-9.]/g, ''));
          total += isNaN(num) ? 20 : num;
        } else {
          total += 20; // Avg subscription
        }
      }
    });
    return total;
  };

  const handleSaveCustomStack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderTitle.trim() || selectedToolSlugs.length === 0) return;

    setSavingStack(true);
    const totalCost = calculateBuilderTotalCost();

    const res = await saveCustomStack({
      userId: user?.id,
      title: builderTitle.trim(),
      targetRole: builderRole,
      description: builderDesc.trim(),
      toolSlugs: selectedToolSlugs,
      totalMonthlyCost: totalCost,
      isPublic: true,
    });

    setSavingStack(false);

    if (res.success) {
      setSaveSuccess(true);
      const updated = await fetchCustomStacks();
      setCustomStacks(updated);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('custom');
      }, 1200);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10" dir="rtl">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-700 shadow-2xs">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>باني حزم الأدوات المتكاملة (AI Stacks Builder)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          حزم أدوات الذكاء الاصطناعي وباني خطط العمل
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          اكتشف حزم الأدوات الجاهزة حسب تخصصك أو قم بتركيب حزمتك المخصصة مع حساب التكلفة الشهرية ومعدل الإنتاجية ومشاركتها مع فريقك.
        </p>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('featured')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'featured'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            الحزم القياسية الجاهزة ({stacks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            حزم المجتمع ({customStacks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>ابنِ حزمتك المخصصة</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">جاري تحميل حزم الأدوات المتكاملة...</p>
        </div>
      ) : activeTab === 'create' ? (
        /* Custom Stack Builder Form */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8 animate-in fade-in">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-600" />
              <span>تركيب حزمة ذكاء اصطناعي وحساب الميزانية</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              اختر الأدوات التي تحتاجها يومياً لحساب تكلفتها التراكمية وسير عملك الاحترافي
            </p>
          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>تم حفظ حزمتك المخصصة بنجاح في مجتمع دليل! جاري التحويل...</span>
            </div>
          )}

          <form onSubmit={handleSaveCustomStack} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان الحزمة:</label>
                <input
                  type="text"
                  required
                  value={builderTitle}
                  onChange={(e) => setBuilderTitle(e.target.value)}
                  placeholder="مثال: حزمة الموشن جرافيك والمونتاج الصوتي 2026"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">المجال / التخصص المستهدف:</label>
                <select
                  value={builderRole}
                  onChange={(e) => setBuilderRole(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="صانع محتوى وفيديوهات">صانع محتوى وفيديوهات</option>
                  <option value="مبرمج ومطور ويب">مبرمج ومطور برمجيات</option>
                  <option value="مصمم جرافيك وUI/UX">مصمم جرافيك وUI/UX</option>
                  <option value="مسوّق رقمي وخبير SEO">مسوّق رقمي وخبير SEO</option>
                  <option value="باحث أكاديمي وكاتب">باحث أكاديمي وكاتب</option>
                  <option value="رائد أعمال وStartup">رائد أعمال وصاحب متجر</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">وصف سير العمل والفائدة:</label>
              <textarea
                rows={2}
                value={builderDesc}
                onChange={(e) => setBuilderDesc(e.target.value)}
                placeholder="صف باختصار كيف تستخدم هذه الأدوات معاً لتسريع مهامك..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Tool Selection Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  اختر أدوات الحزمة (حتى 6 أدوات):
                </label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  المحدد: {selectedToolSlugs.length} أدوات
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {DEFAULT_TOOLS.map((t) => {
                  const isSelected = selectedToolSlugs.includes(t.slug);
                  return (
                    <div
                      key={t.id || t.slug}
                      onClick={() => handleToggleToolInBuilder(t.slug)}
                      className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                      <span className={`text-[10px] block mt-0.5 truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {t.starting_price || t.pricing_type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Total Monthly Cost */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">التكلفة الشهرية التقديرية للحزمة:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ${calculateBuilderTotalCost()} / شهرياً
                </span>
              </div>
              <div className="text-left text-xs text-slate-400">
                <span>توفير متوقع: ~15 ساعة أسبوعياً</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingStack || selectedToolSlugs.length === 0}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingStack ? 'جاري الحفظ في Firestore...' : 'حفظ ونشر الحزمة في المجتمع'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('featured')}
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'custom' ? (
        /* Community Custom Stacks */
        <div className="space-y-6 animate-in fade-in">
          {customStacks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">لا توجد حزم مجتمعية بعد</h3>
              <p className="text-xs text-slate-500 mt-1">كن أول من يركب حزمته الخاصة ويشاركها مع زملائه!</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                إنشاء أول حزمة الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customStacks.map((cStack) => (
                <div key={cStack.id} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {cStack.targetRole}
                    </span>
                    <span className="text-xs font-black text-slate-900 font-mono">
                      ${cStack.totalMonthlyCost} / شهر
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900">{cStack.title}</h3>
                  {cStack.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{cStack.description}</p>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block">الأدوات:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cStack.toolSlugs?.map((s: string) => (
                        <span key={s} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Featured Standard Stacks */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
          {stacks.map((stack) => (
            <div
              key={stack.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                
                {/* Badge & Title */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {stack.targetRole}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">{stack.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{stack.description}</p>
                </div>

                {/* Metrics Box */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">التكلفة التقديرية</span>
                    <span className="text-xs font-bold text-slate-900">{stack.monthlyEstimate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">معدل تسريع الإنجاز</span>
                    <span className="text-xs font-black text-emerald-600">{stack.estimatedProductivityBoost}</span>
                  </div>
                </div>

                {/* Included Tools */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    الأدوات المكونة للحزمة:
                  </span>
                  <div className="space-y-2">
                    {stack.tools.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/tools/${t.slug}`)}
                        className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200/70 hover:border-emerald-200 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-1">
                          <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{t.role}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Workflow className="w-3.5 h-3.5 text-indigo-600" />
                    خطوات سير العمل الموصى بها:
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    {stack.workflowSteps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadStackToCompare(stack)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>مقارنة أدوات الحزمة</span>
                </button>

                <button
                  onClick={() => navigate(`/advisor`)}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  title="استشر الذكاء الاصطناعي حول هذه الحزمة"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
