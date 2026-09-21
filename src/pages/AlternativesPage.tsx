import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Loader2, 
  Search, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Scale
} from 'lucide-react';

interface AlternativesPageProps {
  navigate: (path: string) => void;
}

interface AlternativeOption {
  name: string;
  slug: string;
  advantage: string;
  price: string;
}

interface AlternativeGroup {
  id: string;
  originalTool: {
    name: string;
    slug: string;
    price: string;
  };
  alternatives: AlternativeOption[];
}

const DEFAULT_ALTERNATIVE_GROUPS: AlternativeGroup[] = [
  {
    id: 'alt-1',
    originalTool: { name: 'ChatGPT Plus (GPT-4o)', slug: 'chatgpt-plus', price: '$20/شهر' },
    alternatives: [
      { name: 'Claude 3.5 Sonnet', slug: 'claude-3-5-sonnet', advantage: 'خطة مجانية قوية مع صياغة كتابية فائقة الدقة والتحليل البرمجي', price: 'مجاني / $20' },
      { name: 'Google Gemini', slug: 'gemini-advanced', advantage: 'مجاني ومتصل بالويب مباشرة مع نافذة سياق ضخمة جداً', price: 'مجاني' },
      { name: 'Perplexity AI', slug: 'perplexity-ai', advantage: 'محرك بحث إجاباتي دقيق جداً موثق بروابط المصادر الحية', price: 'مجاني / $20' }
    ]
  },
  {
    id: 'alt-2',
    originalTool: { name: 'Midjourney v6', slug: 'midjourney-v6', price: '$10 - $60/شهر' },
    alternatives: [
      { name: 'FLUX.1', slug: 'flux-1', advantage: 'نموذج مفتوح المصدر يضاهي الواقعية مع دقة فائقة في رسم الحروف والنصوص', price: 'مجاني / Freemium' },
      { name: 'Leonardo AI', slug: 'leonardo-ai', advantage: '150 نقطة توليد مجانية يومياً مع أدوات تحكم واسعة وكانفاس مباشر', price: 'مجاني يومياً / $10' },
      { name: 'Canva Magic Studio', slug: 'canva-ai', advantage: 'استوديو تصميم متكامل وسهل جداً للمبتدئين مع دعم عربي كامل', price: 'مجاني / $12.99' }
    ]
  },
  {
    id: 'alt-3',
    originalTool: { name: 'GitHub Copilot', slug: 'github-copilot', price: '$10/شهر' },
    alternatives: [
      { name: 'Cursor AI', slug: 'cursor-ai', advantage: 'بيئة تطوير كاملة تعتمد على VS Code مع ميزات ذكاء تفاعلية وتعديل عدة ملفات', price: 'مجاني / $20' },
      { name: 'v0 by Vercel', slug: 'v0-dev', advantage: 'توليد واجهات مستخدم React و Tailwind CSS مباشرة وفورية', price: 'مجاني / $20' },
      { name: 'Claude 3.5 Sonnet', slug: 'claude-3-5-sonnet', advantage: 'أعلى دقة في فهم منطق المشروعات البرمجية وتصحيح الأخطاء', price: 'مجاني / $20' }
    ]
  }
];

export const AlternativesPage: React.FC<AlternativesPageProps> = ({ navigate }) => {
  const [groups, setGroups] = useState<AlternativeGroup[]>(DEFAULT_ALTERNATIVE_GROUPS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/alternatives-directory')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setGroups(data);
        }
      })
      .catch((err) => {
        console.warn('Using default alternatives data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.originalTool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.alternatives.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10" dir="rtl">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-amber-800 shadow-2xs">
          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
          <span>دليل البدائل الذكية والمجانية (Smart AI Alternatives)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          اكتشف أفضل البدائل المجانية والأوفر لأشهر أدوات الذكاء الاصطناعي
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          وفر تكاليف اشتراكاتك باكتشاف حلول مجانية ومفتوحة المصدر تضاهي أداء الأدوات المدفوعة الأكثر شهرة.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أداة لمعرفة بدائلها المجانية..."
            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-2xs"
          />
        </div>
      </div>

      {/* Alternatives Groups List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">جاري تحميل دليل البدائل...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-sm font-bold text-slate-600">لا توجد بدائل مطابقة لهذا البحث</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6"
            >
              {/* Original Main Tool Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                    {group.originalTool.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                        بدائل أداة: {group.originalTool.name}
                      </h3>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                        {group.originalTool.price}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      أفضل الخيارات المنافسة التي توفر نفس الوظائف بتكلفة أقل أو مجاناً
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/tools/${group.originalTool.slug}`)}
                  className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer w-fit"
                >
                  تفاصيل {group.originalTool.name}
                </button>
              </div>

              {/* Alternatives Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {group.alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900">{alt.name}</h4>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          {alt.price}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800 block text-[10px] mb-0.5">الميزة والبديل الأوفر:</span>
                        {alt.advantage}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/comparisons?tool1=${group.originalTool.slug}&tool2=${alt.slug}`)}
                        className="flex-1 py-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-600 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Scale className="w-3 h-3" />
                        <span>مقارنة مباشرة</span>
                      </button>

                      <button
                        onClick={() => navigate(`/tools/${alt.slug}`)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                        title="تفاصيل الأداة"
                      >
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
