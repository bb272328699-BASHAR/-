import React from 'react';
import { BookOpen, ArrowLeft, Clock, Calendar, Sparkles } from 'lucide-react';
import { Article } from '../types.ts';
import { OptimizedImage } from './OptimizedImage.tsx';

interface RelatedArticlesSectionProps {
  articles: (Partial<Article> | Article)[];
  currentTitle?: string;
  topicName?: string;
  onSelectArticle: (slug: string) => void;
  onExploreAll?: () => void;
  title?: string;
  subtitle?: string;
}

export const RelatedArticlesSection: React.FC<RelatedArticlesSectionProps> = ({
  articles,
  currentTitle,
  topicName,
  onSelectArticle,
  onExploreAll,
  title,
  subtitle,
}) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  const defaultTitle = topicName
    ? `مقالات وأدلة تعليمية حول ${topicName}`
    : 'مقالات ودراسات ذات صلة';

  const defaultSubtitle = 'تعمّق في المفاهيم المتقدمة وأفضل الممارسات العملية في الذكاء الاصطناعي';

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>إثراء المعرفة</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {title || defaultTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {onExploreAll && (
          <button
            onClick={onExploreAll}
            className="self-start sm:self-center text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <span>جميع المقالات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {articles.map((article) => {
          const slug = article.slug || '';
          const title = article.title || 'مقال ذكاء اصطناعي';

          return (
            <div
              key={article.id || slug}
              onClick={() => slug && onSelectArticle(slug)}
              className="group bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                {article.cover_image_url && (
                  <div className="w-full h-36 overflow-hidden bg-slate-200">
                    <OptimizedImage
                      src={article.cover_image_url}
                      alt={title}
                      width={360}
                      height={180}
                      aspectRatio="16/9"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      containerClassName="w-full h-full"
                    />
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    {article.read_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.read_time}
                      </span>
                    )}
                    {article.author_name && (
                      <>
                        <span>•</span>
                        <span>{article.author_name}</span>
                      </>
                    )}
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                    {title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                <span>قراءة المقال</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
