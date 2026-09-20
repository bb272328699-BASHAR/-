import React, { useState, useEffect } from 'react';
import { Layers, ArrowLeft, Loader2, Sparkles, Folder, ArrowRight } from 'lucide-react';
import { Category, Tool } from '../types.ts';
import { DEFAULT_CATEGORIES, DEFAULT_TOOLS } from '../data/defaultCatalog.ts';
import { ToolCard } from '../components/ToolCard.tsx';
import { AdSlot } from '../components/AdSlot.tsx';
import { updateDocumentSEO } from '../utils/seo.ts';
import { generateCategorySEO } from '../utils/autoSeoGenerator.ts';

interface CategoryDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ slug, navigate }) => {
  const [category, setCategory] = useState<Category | null>(() => {
    const found = DEFAULT_CATEGORIES.find(c => c.slug === slug);
    if (found) {
      const tools = DEFAULT_TOOLS.filter(t => t.categories?.some(c => c.slug === slug));
      return { ...found, tools };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check fallback
    const foundFallback = DEFAULT_CATEGORIES.find(c => c.slug === slug);
    const fallbackTools = DEFAULT_TOOLS.filter(t => t.categories?.some(c => c.slug === slug));
    
    fetch(`/api/categories/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.error) {
          setCategory(data);
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
          const seo = generateCategorySEO(data, origin);
          updateDocumentSEO(seo);
        } else if (foundFallback) {
          setCategory({ ...foundFallback, tools: fallbackTools });
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
          const seo = generateCategorySEO(foundFallback, origin);
          updateDocumentSEO(seo);
        } else {
          setCategory(null);
        }
      })
      .catch(() => {
        if (foundFallback) {
          setCategory({ ...foundFallback, tools: fallbackTools });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">جاري تحميل القسم وأدواته...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">التصنيف غير موجود</h2>
        <button onClick={() => navigate('/categories')} className="text-indigo-600 font-bold">العودة للتصنيفات</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-slate-800">الرئيسية</button>
        <span>/</span>
        <button onClick={() => navigate('/categories')} className="hover:text-slate-800">التصنيفات</button>
        <span>/</span>
        <span className="text-indigo-600 font-bold">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${category.color || '#4F46E5'}15`, color: category.color || '#4F46E5' }}
          >
            <Folder className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{category.name}</h1>
            {category.name_en && <p className="text-slate-400 text-xs font-medium">{category.name_en}</p>}
          </div>
        </div>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          {category.description}
        </p>

        {Array.isArray(category.subcategories) && category.subcategories.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 block mb-2">التصنيفات الفرعية ضمن هذا القسم:</span>
            <div className="flex flex-wrap gap-2">
              {category.subcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => navigate(`/ai-tools?category=${sub.slug}`)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ad Placement */}
      <AdSlot position="category_top" />

      {/* Tools in Category */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          الأدوات المتاحة في هذا القسم ({Array.isArray(category.tools) ? category.tools.length : 0})
        </h2>

        {!Array.isArray(category.tools) || category.tools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            لا توجد أدوات منشورة في هذا القسم حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={(toolSlug) => navigate(`/tools/${toolSlug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
