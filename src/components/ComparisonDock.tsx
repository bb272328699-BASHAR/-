import React from 'react';
import { Scale, X, ArrowLeft, Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useCompare } from '../context/CompareContext.tsx';
import { OptimizedImage } from './OptimizedImage.tsx';

interface ComparisonDockProps {
  navigate: (path: string) => void;
}

export const ComparisonDock: React.FC<ComparisonDockProps> = ({ navigate }) => {
  const { compareItems, removeFromCompare, clearCompare, isDockOpen, setIsDockOpen } = useCompare();

  if (compareItems.length === 0) {
    return null;
  }

  const canCompare = compareItems.length >= 2;

  const handleStartComparison = () => {
    if (compareItems.length === 0) return;
    const slugs = compareItems.map((i) => i.slug);
    const query = new URLSearchParams();
    if (slugs[0]) query.set('tool1', slugs[0]);
    if (slugs[1]) query.set('tool2', slugs[1]);
    if (slugs[2]) query.set('tool3', slugs[2]);
    navigate(`/comparisons?${query.toString()}`);
  };

  return (
    <aside
      aria-label="شريط مقارنة الأدوات"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl transition-all duration-300"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl sm:rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden p-3 sm:p-4">
        {/* Top Header / Bar */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </span>
            <span className="font-bold text-slate-200">
              شريط المقارنة الذكية ({compareItems.length}/3)
            </span>
            {compareItems.length === 1 && (
              <span className="hidden sm:inline-block text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                أضف أداة أخرى للمقارنة الفورية
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="تفريغ قائمة المقارنة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تفريغ</span>
            </button>
            <button
              onClick={() => setIsDockOpen(!isDockOpen)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDockOpen ? 'تصغير' : 'توسيع'}
            >
              {isDockOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isDockOpen && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Selected Tool Chips */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {compareItems.map((tool) => (
                <div
                  key={tool.slug}
                  className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 shadow-xs"
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center">
                    <OptimizedImage
                      src={tool.logo_url}
                      alt={tool.name}
                      width={24}
                      height={24}
                      fallbackText={tool.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-200 max-w-[110px] truncate">
                    {tool.name}
                  </span>
                  <button
                    onClick={() => removeFromCompare(tool.slug)}
                    className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                    title={`إزالة ${tool.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Empty placeholder slot if less than 3 */}
              {compareItems.length < 3 && (
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 border border-dashed border-slate-700 rounded-xl px-3 py-1.5">
                  <span>+ أضف أداة إضافية</span>
                </div>
              )}
            </div>

            {/* Action CTA button */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleStartComparison}
                disabled={!canCompare}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer ${
                  canCompare
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>قارن الآن وجهاً لوجه</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
