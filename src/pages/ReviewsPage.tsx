import React, { useState, useEffect } from 'react';
import { Star, ArrowLeft, Loader2, Award, ExternalLink, ThumbsUp, Check, X } from 'lucide-react';
import { Review } from '../types.ts';
import { DEFAULT_REVIEWS } from '../data/defaultCatalog.ts';
import { SocialShareButtons } from '../components/SocialShareButtons.tsx';
import { AdSlot } from '../components/AdSlot.tsx';
import { updateDocumentSEO } from '../utils/seo.ts';
import { generateReviewSEO } from '../utils/autoSeoGenerator.ts';

interface ReviewsPageProps {
  navigate: (path: string) => void;
  reviewSlug?: string;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ navigate, reviewSlug }) => {
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [singleReview, setSingleReview] = useState<Review | null>(() => {
    if (reviewSlug) {
      return DEFAULT_REVIEWS.find(r => r.slug === reviewSlug) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    const fallbackReview = reviewSlug ? DEFAULT_REVIEWS.find(r => r.slug === reviewSlug) : null;

    if (reviewSlug) {
      fetch(`/api/reviews/${reviewSlug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && !data.error) {
            setSingleReview(data);
            const seo = generateReviewSEO(data, origin);
            updateDocumentSEO(seo);
          } else if (fallbackReview) {
            setSingleReview(fallbackReview);
            const seo = generateReviewSEO(fallbackReview, origin);
            updateDocumentSEO(seo);
          } else {
            setSingleReview(null);
          }
        })
        .catch(() => {
          if (fallbackReview) {
            setSingleReview(fallbackReview);
          }
        })
        .finally(() => setLoading(false));
    } else {
      updateDocumentSEO({
        title: 'مراجعات وتقييمات خبراء الذكاء الاصطناعي 2026 | دليل الذكاء الاصطناعي',
        description: 'مراجعات حقيقية وتجارب عملية معمقة لأحدث تطبيقات الذكاء الاصطناعي، مع تحليل للميزات ونقاط القوة والضعف.',
        canonicalUrl: `${origin}/reviews`,
        ogType: 'website'
      });

      fetch('/api/reviews')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setReviews(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [reviewSlug]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">جاري جلب مراجعات الخبراء...</p>
      </div>
    );
  }

  // If viewing a single review
  if (reviewSlug && singleReview) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button onClick={() => navigate('/')} className="hover:text-slate-800">الرئيسية</button>
          <span>/</span>
          <button onClick={() => navigate('/reviews')} className="hover:text-slate-800">المراجعات</button>
          <span>/</span>
          <span className="text-indigo-600 font-bold">{singleReview.title}</span>
        </nav>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>بقلم: <strong className="text-slate-800 font-bold">{singleReview.author_name}</strong></span>
              <span>•</span>
              <span>{new Date(singleReview.created_at).toLocaleDateString('ar-EG')}</span>
            </div>
            <div className="flex items-center gap-3">
              <SocialShareButtons
                title={`مراجعة ${singleReview.title} | دليل الذكاء الاصطناعي`}
                description={singleReview.summary}
                variant="compact"
              />
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-sm font-bold border border-amber-200">
                <Star className="w-4 h-4 fill-current" />
                <span>{singleReview.rating} / 5.0</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
            {singleReview.title}
          </h1>

          {/* Strategic Ad: After main title */}
          <AdSlot position="article_top" className="my-4" />

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-sm font-medium leading-relaxed">
            {singleReview.summary}
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed space-y-4">
            <p>{singleReview.detailed_review}</p>
          </div>

          {/* Strategic Ad: End of content */}
          <AdSlot position="article_bottom" className="my-6" />

          {/* Verdict Box */}
          {singleReview.verdict && (
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-2">
              <h3 className="font-bold text-base text-indigo-400">حكم الخبراء النهائي (Final Verdict)</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{singleReview.verdict}</p>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => navigate(`/tools/${singleReview.tool_slug}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <span>انتقل لصفحة أداة {singleReview.tool_name}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reviews List
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>تقييمات حيادية وتجارب عملية</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          مراجعات وتجارب الخبراء
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
          نختبر كل أداة في بيئات عمل حقيقية ونقيس كفاءتها قبل كتابة التقييم المفصل لمساعدتك على اتخاذ القرار.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            onClick={() => navigate(`/reviews/${rev.slug}`)}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{rev.author_name}</span>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{rev.rating}</span>
                </div>
              </div>

              <h2 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {rev.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {rev.summary}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>قراءة المراجعة الكاملة</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
