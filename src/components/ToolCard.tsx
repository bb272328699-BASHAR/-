import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, ExternalLink, ArrowLeft, Bookmark, Scale, Globe, ThumbsUp, ChevronUp } from 'lucide-react';
import { Tool } from '../types.ts';
import { OptimizedImage } from './OptimizedImage.tsx';
import { useCompare } from '../context/CompareContext.tsx';
import { useToolBookmark } from '../utils/bookmarks.ts';
import { hasUserUpvoted, toggleToolUpvote } from '../utils/upvotes.ts';

interface ToolCardProps {
  tool: Tool;
  onSelect: (slug: string) => void;
  onCategoryClick?: (categorySlug: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect, onCategoryClick }) => {
  const { addToCompare, isInCompare } = useCompare();
  const { bookmarked, toggle: toggleBookmark } = useToolBookmark(tool.slug || tool.id);

  const [upvotes, setUpvotes] = useState<number>(Number(tool.upvotes_count || 0));
  const [isUpvoted, setIsUpvoted] = useState<boolean>(false);
  const [upvoteAnimating, setUpvoteAnimating] = useState<boolean>(false);

  useEffect(() => {
    setIsUpvoted(hasUserUpvoted(tool.id));
    setUpvotes(Number(tool.upvotes_count || 0));

    const handleUpvoteEvent = (e: any) => {
      if (e.detail?.toolId === tool.id) {
        setIsUpvoted(e.detail.isUpvoted);
      }
    };
    window.addEventListener('daleel_upvotes_updated', handleUpvoteEvent);
    return () => window.removeEventListener('daleel_upvotes_updated', handleUpvoteEvent);
  }, [tool.id, tool.upvotes_count]);

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setUpvoteAnimating(true);
    setTimeout(() => setUpvoteAnimating(false), 400);

    // Optimistic UI update
    const nextState = !isUpvoted;
    setIsUpvoted(nextState);
    setUpvotes(prev => Math.max(0, prev + (nextState ? 1 : -1)));

    const result = await toggleToolUpvote(tool.id);
    if (result.success && result.count !== undefined) {
      setUpvotes(result.count);
    }
  };

  const inCompare = isInCompare(tool.slug || tool.id);

  const getPricingBadge = (type: string) => {
    switch (type.toLowerCase()) {
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

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(tool);
  };

  return (
    <div 
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 p-5 cursor-pointer"
      onClick={() => onSelect(tool.slug)}
    >
      <div>
        {/* Top Header: Logo, Name, Verification, Pricing badge & Quick Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex-shrink-0 flex items-center justify-center">
              <OptimizedImage
                src={tool.logo_url}
                alt={tool.name}
                width={48}
                height={48}
                fallbackText={tool.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                containerClassName="w-full h-full"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {tool.name}
                </h3>
                {tool.is_verified && (
                  <span title="أداة معتمدة ومفحوصة">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/60 px-2 py-0.5 rounded-md text-amber-900 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{tool.rating ? Number(tool.rating).toFixed(1) : '4.9'}</span>
                </div>
                {tool.review_count > 0 && (
                  <span className="text-[11px] text-slate-400 font-medium">({tool.review_count} تقييم)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Upvote Pill Button */}
            <button
              onClick={handleUpvoteClick}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isUpvoted
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
              } ${upvoteAnimating ? 'animate-bounce' : ''}`}
              title={isUpvoted ? 'إلغاء تأييدك للأداة' : 'صوّت لهذه الأداة وادعمها'}
            >
              <ChevronUp className={`w-3.5 h-3.5 ${isUpvoted ? 'stroke-[3]' : 'stroke-[2]'}`} />
              <span className="font-mono text-[11px]">{upvotes}</span>
            </button>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getPricingBadge(tool.pricing_type)}`}>
              {tool.pricing_type}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(e);
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                bookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={bookmarked ? 'محفوظة في المفضلة' : 'حفظ في المفضلة'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3">
          {tool.tagline}
        </p>

        {/* Feature Badges & Categories */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {/* Arabic Support indicator */}
          {(tool as any).arabic_support && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>يدعم العربية</span>
            </span>
          )}

          {Array.isArray(tool.categories) && tool.categories.slice(0, 2).map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={(e) => {
                e.stopPropagation();
                if (onCategoryClick) onCategoryClick(cat.slug);
              }}
              className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Card Footer: Starting Price, Compare Button & CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="text-xs text-slate-500 font-medium">
          {tool.starting_price ? (
            <span>يبدأ من <strong className="text-slate-800 font-bold">{tool.starting_price}</strong></span>
          ) : (
            <span className="text-emerald-600 font-bold">متاح للتجربة</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Compare Button */}
          <button
            onClick={handleCompareClick}
            className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              inCompare
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border-slate-200'
            }`}
            title={inCompare ? 'إلغاء من المقارنة' : 'إضافة إلى المقارنة'}
          >
            <Scale className="w-3 h-3" />
            <span>{inCompare ? 'محدد' : 'قارن'}</span>
          </button>

          <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-[-2px] transition-transform">
            <span>التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
