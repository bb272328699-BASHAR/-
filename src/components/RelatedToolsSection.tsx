import React from 'react';
import { Sparkles, ArrowLeft, Star, CheckCircle, ExternalLink } from 'lucide-react';
import { Tool } from '../types.ts';
import { OptimizedImage } from './OptimizedImage.tsx';

interface RelatedToolsSectionProps {
  tools: (Partial<Tool> | Tool)[];
  currentToolName?: string;
  categoryName?: string;
  onSelectTool: (slug: string) => void;
  onExploreMore?: () => void;
  title?: string;
  subtitle?: string;
}

export const RelatedToolsSection: React.FC<RelatedToolsSectionProps> = ({
  tools,
  currentToolName,
  categoryName,
  onSelectTool,
  onExploreMore,
  title,
  subtitle,
}) => {
  if (!tools || tools.length === 0) {
    return null;
  }

  const getPricingBadge = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'free':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'freemium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'paid':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'free trial':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const defaultTitle = currentToolName
    ? `أدوات ذكاء اصطناعي بديلة ومماثلة لـ ${currentToolName}`
    : categoryName
    ? `أبرز أدوات ${categoryName} الموصى بها`
    : 'أدوات ذكاء اصطناعي ذات صلة';

  const defaultSubtitle = 'اكتشف أفضل الخيارات والمنافسين المعتمدين في نفس المجال لزيادة إنتاجيتك';

  return (
    <section className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ترشيحات ذكية</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {title || defaultTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {onExploreMore && (
          <button
            onClick={onExploreMore}
            className="self-start sm:self-center text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <span>استكشاف المزيد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const slug = tool.slug || '';
          const name = tool.name || 'أداة ذكاء اصطناعي';
          const pricing = tool.pricing_type || 'Freemium';

          return (
            <div
              key={tool.id || slug}
              onClick={() => slug && onSelectTool(slug)}
              className="group bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Logo, Name, Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                    <OptimizedImage
                      src={tool.logo_url}
                      alt={name}
                      width={44}
                      height={44}
                      fallbackText={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      containerClassName="w-full h-full"
                    />
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getPricingBadge(pricing)}`}>
                    {pricing}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {name}
                    </h4>
                    {tool.is_verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-amber-500 text-xs font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{tool.rating ? Number(tool.rating).toFixed(1) : '4.8'}</span>
                    {tool.review_count ? (
                      <span className="text-[10px] text-slate-400 font-normal">({tool.review_count})</span>
                    ) : null}
                  </div>
                </div>

                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                <span>عرض التفاصيل</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
