import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Loader2, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Tutorial } from '../types.ts';
import { SocialShareButtons } from '../components/SocialShareButtons.tsx';
import { AdSlot } from '../components/AdSlot.tsx';
import { updateDocumentSEO } from '../utils/seo.ts';
import { generateTutorialSEO } from '../utils/autoSeoGenerator.ts';

interface TutorialsPageProps {
  navigate: (path: string) => void;
  tutorialSlug?: string;
}

export const TutorialsPage: React.FC<TutorialsPageProps> = ({ navigate, tutorialSlug }) => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [singleTut, setSingleTut] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';

    if (tutorialSlug) {
      fetch(`/api/tutorials/${tutorialSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setSingleTut(data);
            const seo = generateTutorialSEO(data, origin);
            updateDocumentSEO(seo);
          } else {
            setSingleTut(null);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      updateDocumentSEO({
        title: 'شروحات وأدلة تعليمية للذكاء الاصطناعي 2026 | دليل الذكاء الاصطناعي',
        description: 'دروس تطبيقية مبسطة خطوة بخطوة لاحتراف التعامل مع أدوات الذكاء الاصطناعي وكتابة الأوامر وتوليد المحتوى.',
        canonicalUrl: `${origin}/tutorials`,
        ogType: 'website'
      });

      fetch('/api/tutorials')
        .then(res => res.json())
        .then(data => setTutorials(Array.isArray(data) ? data : []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [tutorialSlug]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">جاري جلب الشروحات والأدلة...</p>
      </div>
    );
  }

  // Single Tutorial
  if (tutorialSlug && singleTut) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button onClick={() => navigate('/')} className="hover:text-slate-800">الرئيسية</button>
          <span>/</span>
          <button onClick={() => navigate('/tutorials')} className="hover:text-slate-800">الأدلة والشروحات</button>
          <span>/</span>
          <span className="text-indigo-600 font-bold">{singleTut.title}</span>
        </nav>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md font-bold">المستوى: {singleTut.difficulty}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> وقت التطبيق: {singleTut.read_time}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">مشاركة الشرح:</span>
              <SocialShareButtons
                title={`${singleTut.title} | دليل الذكاء الاصطناعي`}
                description={singleTut.excerpt}
                variant="compact"
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            {singleTut.title}
          </h1>

          {/* Strategic Ad: After main title */}
          <AdSlot position="article_top" className="my-4" />

          <p className="text-slate-600 text-base leading-relaxed">
            {singleTut.excerpt}
          </p>

          <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed space-y-4">
            <p>{singleTut.content}</p>
          </div>

          {/* Strategic Ad: End of tutorial content */}
          <AdSlot position="article_bottom" className="my-6" />

          {/* Tutorial Steps */}
          {singleTut.steps && Array.isArray(singleTut.steps) && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="font-bold text-lg text-slate-900">خطوات التنفيذ العملية</h3>
              <div className="space-y-4">
                {singleTut.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tutorials List
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>أدلة وشروحات عملية</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          الأدلة التعليمية والشروحات
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
          تعلم خطوة بخطوة كيفية دمج أدوات الذكاء الاصطناعي في مشاريعك وتحقيق أقصى إنتاجية ممكنة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tut) => (
          <div
            key={tut.id}
            onClick={() => navigate(`/tutorials/${tut.slug}`)}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{tut.difficulty}</span>
                <span>{tut.read_time}</span>
              </div>

              <h2 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {tut.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {tut.excerpt}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>بدء الدليل التعليمي</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
