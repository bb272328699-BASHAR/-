import React, { useState, useEffect } from 'react';
import { Layers, ArrowLeft, Loader2, Sparkles, Folder } from 'lucide-react';
import { Category } from '../types.ts';
import { DEFAULT_CATEGORIES } from '../data/defaultCatalog.ts';
import { updateDocumentSEO } from '../utils/seo.ts';

interface CategoriesPageProps {
  navigate: (path: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    updateDocumentSEO({
      title: 'تصنيفات وأقسام أدوات الذكاء الاصطناعي 2026 | دليل الذكاء الاصطناعي',
      description: 'دليل شامل ومصنف لأدوات الذكاء الاصطناعي مقسمة إلى فئات احترافية: المحادثة، التصميم، البرمجة، الصوت، الفيديو، والأعمال.',
      canonicalUrl: `${origin}/categories`,
      ogType: 'website',
      keywords: 'تصنيفات الذكاء الاصطناعي, أقسام أدوات الذكاء الاصطناعي, روبوتات المحادثة, توليد الصور, أكواد البرمجة'
    });

    fetch('/api/categories')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">جاري جلب التصنيفات من قاعدة البيانات...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>هيكلية وتصنيفات الذكاء الاصطناعي</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          تصفح الأقسام والتصنيفات الفرعية
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
          قسمنا الأدوات إلى فئات متخصصة لتمكينك من الوصول المباشر إلى الحل الأنسب لمتطلبات عملك.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cat.color || '#4F46E5'}15`, color: cat.color || '#4F46E5' }}
                  >
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 
                      onClick={() => navigate(`/categories/${cat.slug}`)}
                      className="font-bold text-lg text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {cat.name}
                    </h2>
                    {cat.name_en && <span className="text-xs text-slate-400 block">{cat.name_en}</span>}
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                  {cat.tools_count ? `${cat.tools_count} أداة` : 'مفحوص'}
                </span>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                {cat.description}
              </p>

              {/* Subcategories */}
              {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">التصنيفات الفرعية:</h4>
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => navigate(`/ai-tools?category=${sub.slug}`)}
                        className="text-xs font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/70 px-3 py-1 rounded-lg transition-colors"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">تصفح أدوات هذا القسم</span>
              <button
                onClick={() => navigate(`/categories/${cat.slug}`)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>استعراض الأدوات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
