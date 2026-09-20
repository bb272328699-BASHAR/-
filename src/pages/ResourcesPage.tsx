import React, { useState, useEffect } from 'react';
import { Layers, Download, ExternalLink, Loader2, Sparkles, BookOpen, FileCode } from 'lucide-react';
import { Resource } from '../types.ts';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => setResources(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">جاري جلب المصادر المجانية...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>مكتبة الأدوات والموارد المفتوحة</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          المصادر والقوالب المجانية
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
          حزم أوامر برومبت جاهزة، كتب إلكترونية، وأدلة PDF مجانية صممها خبراؤنا لتسريع نموك في عصر الذكاء الاصطناعي.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                  {res.type}
                </span>
                {res.is_free && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">مجاني 100%</span>
                )}
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2">{res.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{res.description}</p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => alert('تم بدء تنزيل المورد المجاني بنجاح!')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تحميل المورد الآن</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
