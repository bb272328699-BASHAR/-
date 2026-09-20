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
  Scale
} from 'lucide-react';
import { useCompare } from '../context/CompareContext.tsx';

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
  const [stacks, setStacks] = useState<StackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCompare, isInCompare, clearCompare } = useCompare();

  useEffect(() => {
    fetch('/api/stacks')
      .then(res => res.json())
      .then(data => setStacks(data || []))
      .catch(err => console.error('Error fetching stacks:', err))
      .finally(() => setLoading(false));
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10" dir="rtl">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-700 shadow-2xs">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>حزم ومجموعات الأدوات التخصصية (AI Stacks Hub)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          حزم أدوات الذكاء الاصطناعي الجاهزة حسب تخصصك
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          مجموعات أدوات منتقاة بعناية تتكامل معاً لتمنحك إنتاجية مضاعفة وتوفر عليك تكاليف الاشتراكات وساعات العمل اليدوي.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">جاري تحميل حزم الأدوات المتكاملة...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
