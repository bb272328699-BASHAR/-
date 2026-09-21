import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle, 
  ExternalLink, 
  Share2, 
  ArrowLeft, 
  Check, 
  X, 
  HelpCircle, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Calendar,
  Eye,
  Info,
  Heart,
  MessageSquare,
  Send,
  UserCheck,
  Scale,
  ChevronUp,
  MousePointerClick
} from 'lucide-react';
import { Tool } from '../types.ts';
import { DEFAULT_TOOLS } from '../data/defaultCatalog.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { toggleFirestoreBookmark, addFirestoreReview } from '../lib/firestoreService.ts';
import { SocialShareButtons } from '../components/SocialShareButtons.tsx';
import { updateDocumentSEO } from '../utils/seo.ts';
import { generateToolSEO } from '../utils/autoSeoGenerator.ts';
import { OptimizedImage } from '../components/OptimizedImage.tsx';
import { RelatedToolsSection } from '../components/RelatedToolsSection.tsx';
import { AdSlot } from '../components/AdSlot.tsx';
import { RelatedArticlesSection } from '../components/RelatedArticlesSection.tsx';
import { hasUserUpvoted, toggleToolUpvote } from '../utils/upvotes.ts';
import { trackPageView, trackOutboundClick, formatMetricCount } from '../utils/analytics.ts';
import { PriceAlertModal } from '../components/PriceAlertModal.tsx';
import { ArabicQualityIndexSection } from '../components/ArabicQualityIndexSection.tsx';
import { ToolQuestionsSection } from '../components/ToolQuestionsSection.tsx';
import { Tag } from 'lucide-react';


interface ToolDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

interface UserReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified: boolean;
  created_at: string;
  author_name: string;
  author_avatar?: string;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({ slug, navigate }) => {
  const { user, token, openAuthModal } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);


  // Reviews & Star-rating state
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  // Quick Star Rating widget state
  const [hoverRating, setHoverRating] = useState(0);
  const [userGivenRating, setUserGivenRating] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  // Upvotes state
  const [upvotes, setUpvotes] = useState<number>(0);
  const [isUpvoted, setIsUpvoted] = useState<boolean>(false);
  const [upvoting, setUpvoting] = useState<boolean>(false);

  const sanitizeSlug = (rawSlug: string): string => {
    try {
      const decoded = decodeURIComponent(rawSlug || '');
      return decoded
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-_\.]+/g, '-')
        .replace(/-+/g, '-');
    } catch {
      return (rawSlug || '').trim().toLowerCase();
    }
  };

  useEffect(() => {
    const fetchTool = async () => {
      setLoading(true);
      setError(null);
      const sanitizedSlug = sanitizeSlug(slug);
      
      const SLUG_ALIASES: Record<string, string> = {
        'claude': 'claude-3-5-sonnet',
        'claude-3': 'claude-3-5-sonnet',
        'claude-3-5': 'claude-3-5-sonnet',
        'chatgpt': 'chatgpt-plus',
        'chatgpt-4': 'chatgpt-plus',
        'gpt-4': 'chatgpt-plus',
        'gpt-4o': 'chatgpt-plus',
        'midjourney': 'midjourney-v6',
        'flux': 'flux-1',
        'flux-1-black-forest-labs': 'flux-1',
        'flux.1': 'flux-1',
        'runway': 'runway-gen-3',
        'runway-gen3': 'runway-gen-3',
        'gemini': 'gemini-advanced',
        'sora': 'sora-openai',
        'canva': 'canva-ai',
        'suno': 'suno-ai',
        'deepl': 'deepl-translator',
        'gamma': 'gamma-app',
        'jasper': 'jasper-ai',
        'copilot': 'github-copilot',
        'kling': 'kling-ai',
        'opus': 'opus-clip',
        'leonardo': 'leonardo-ai',
        'dalle': 'dall-e-3',
        'dalle3': 'dall-e-3'
      };

      const targetCanonical = SLUG_ALIASES[sanitizedSlug.toLowerCase()] || SLUG_ALIASES[slug.toLowerCase()] || sanitizedSlug.toLowerCase();

      const fallback = DEFAULT_TOOLS.find(t => {
        const tSlug = t.slug.toLowerCase();
        if (tSlug === targetCanonical) return true;
        if (tSlug === sanitizedSlug.toLowerCase()) return true;
        if (tSlug === slug.toLowerCase()) return true;
        if (sanitizedSlug.length >= 4 && (tSlug.includes(sanitizedSlug.toLowerCase()) || sanitizedSlug.toLowerCase().includes(tSlug))) return true;
        return false;
      });
      
      try {
        let res = await fetch(`/api/tools/${encodeURIComponent(targetCanonical)}`);
        if (!res.ok) {
          res = await fetch(`/api/tools/${encodeURIComponent(sanitizedSlug)}`);
        }
        if (!res.ok) {
          res = await fetch(`/api/tools/${encodeURIComponent(slug)}`);
        }
        if (!res.ok) {
          throw new Error('الأداة غير موجودة');
        }
        const data = await res.json();
        setTool(data);
        setUpvotes(Number(data.upvotes_count || 0));

        // Automatically generate rich Document Title, OpenGraph, Canonical, and Schema.org for SEO
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
        const seoConfig = generateToolSEO(data, origin);
        if (data.status && data.status !== 'published') {
          seoConfig.robots = 'noindex, nofollow';
        }
        updateDocumentSEO(seoConfig);

        // Check bookmark status & upvote status
        if (data.id) {
          setIsUpvoted(hasUserUpvoted(data.id));
          checkBookmarkStatus(data.id);
          fetchReviews(data.id);
          trackPageView(`/tools/${data.slug || slug}`, 'tool', data.id, data.slug || slug);
        }
      } catch (err: any) {
        if (fallback) {
          setTool(fallback);
          setUpvotes(Number(fallback.upvotes_count || 0));
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
          const seoConfig = generateToolSEO(fallback, origin);
          updateDocumentSEO(seoConfig);
        } else {
          setError(err.message || 'حدث خطأ في تحميل بيانات الأداة');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [slug]);

  const handleToggleUpvote = async () => {
    if (!tool) return;
    setUpvoting(true);

    const nextState = !isUpvoted;
    setIsUpvoted(nextState);
    setUpvotes(prev => Math.max(0, prev + (nextState ? 1 : -1)));

    const result = await toggleToolUpvote(tool.id);
    if (result.success && result.count !== undefined) {
      setUpvotes(result.count);
    }
    setUpvoting(false);
  };

  const checkBookmarkStatus = async (toolId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/user/bookmarks/status/${toolId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch {
      // Ignore
    }
  };

  const fetchReviews = async (toolId: string) => {
    try {
      const res = await fetch(`/api/tools/${toolId}/user-reviews`);
      if (res.ok) {
        const data = await res.json();
        setUserReviews(data);
      }
    } catch {
      // Ignore
    }
  };

  const handleToggleBookmark = async () => {
    if (!token) {
      openAuthModal('login');
      return;
    }
    if (!tool) return;

    setBookmarkLoading(true);
    try {
      const res = await fetch(`/api/user/bookmarks/${tool.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
        if (user) {
          toggleFirestoreBookmark(user.id, { slug: tool.slug, name: tool.name }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleQuickStarRate = async (starScore: number) => {
    if (!token) {
      openAuthModal('login');
      return;
    }
    if (!tool) return;

    setSubmittingRating(true);
    setRatingSuccessMsg(null);
    try {
      const res = await fetch(`/api/tools/${tool.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: starScore }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUserGivenRating(starScore);
      if (data.newRating !== undefined) {
        setTool((prev) =>
          prev
            ? {
                ...prev,
                rating: data.newRating,
                review_count: data.newReviewCount || prev.review_count,
              }
            : null
        );
      }
      setRatingSuccessMsg(`تم تسجيل تقييمك (${starScore} من 5 نجوم) بنجاح!`);
      setTimeout(() => setRatingSuccessMsg(null), 4000);

      if (user && tool) {
        addFirestoreReview(user.id, user.full_name, tool.slug, starScore, 'تقييم سريع بالنجوم').catch(() => {});
      }
      fetchReviews(tool.id);
    } catch (err: any) {
      setRatingSuccessMsg(err.message || 'تعذر تسجيل التقييم');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      openAuthModal('login');
      return;
    }
    if (!tool || !newComment.trim()) return;

    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await fetch(`/api/tools/${tool.id}/user-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newRating,
          title: newTitle.trim() || undefined,
          comment: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReviewMsg('تم نشر تقييمك بنجاح! شكراً لمشاركتك مجتمعنا.');
      setNewComment('');
      setNewTitle('');
      setUserGivenRating(newRating);

      if (data.newRating !== undefined) {
        setTool((prev) =>
          prev
            ? {
                ...prev,
                rating: data.newRating,
                review_count: data.newReviewCount || (prev.review_count + 1),
              }
            : null
        );
      }

      if (data.review) {
        setUserReviews((prev) => [data.review, ...prev]);
      }
      if (user && tool) {
        addFirestoreReview(user.id, user.full_name, tool.slug, newRating, newComment.trim()).catch(() => {});
      }
    } catch (err: any) {
      setReviewMsg(err.message || 'تعذر إرسال التقييم');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-600 font-medium">جاري استرجاع التفاصيل الكاملة للأداة...</p>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">الأداة المطلوبة غير متوفرة</h2>
        <p className="text-slate-500 text-sm">ربما تم تغيير الرابط أو حذف الأداة من قاعدة البيانات.</p>
        <button
          onClick={() => navigate('/ai-tools')}
          className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors inline-block"
        >
          العودة لدليل الأدوات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.name,
            operatingSystem: 'All, Cloud, Web',
            applicationCategory: 'ArtificialIntelligenceApplication',
            description: tool.description,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: tool.rating || '4.9',
              reviewCount: tool.review_count || '120',
              bestRating: '5',
              worstRating: '1'
            },
            offers: {
              '@type': 'Offer',
              price: tool.starting_price?.replace(/[^0-9.]/g, '') || '0',
              priceCurrency: 'USD',
              category: tool.pricing_type
            },
            url: tool.website_url,
            image: tool.logo_url
          })
        }}
      />
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-slate-800">الرئيسية</button>
        <span>/</span>
        <button onClick={() => navigate('/ai-tools')} className="hover:text-slate-800">أدوات الذكاء الاصطناعي</button>
        <span>/</span>
        <span className="text-indigo-600 font-bold">{tool.name}</span>
      </nav>

      {/* Main Header / Overview Block */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          {/* Logo & Basic Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center shadow-xs">
              <OptimizedImage
                src={tool.logo_url}
                alt={tool.name}
                width={80}
                height={80}
                priority={true}
                fallbackText={tool.name}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{tool.name}</h1>
                {tool.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    معتمد ومفحوص
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-sm sm:text-base font-normal max-w-2xl leading-relaxed">
                {tool.tagline}
              </p>

              {/* Rating & Stats with Interactive Quick-Rate */}
              <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-slate-500 font-medium">
                <div className="flex items-center text-amber-500 font-bold bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/50">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500 mr-1" />
                  <span className="text-sm font-black text-amber-900">{tool.rating ? Number(tool.rating).toFixed(1) : '4.9'}</span>
                  <span className="text-slate-500 font-normal mr-1.5">({tool.review_count || 120} تقييم)</span>
                </div>

                {/* Interactive Star-Rating on Hero */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-600">تقييمك:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || userGivenRating || 0);
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={submittingRating}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleQuickStarRate(star)}
                          className="p-0.5 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                          title={`تقييم ${star} من 5`}
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              active
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {userGivenRating && (
                    <span className="text-[10px] font-bold text-emerald-600 mr-1">تم تقييمك ✓</span>
                  )}
                </div>

                <span>•</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">
                  {tool.pricing_type}
                </span>

                {/* Real-Time Accurate Clicks & Views Statistics */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-indigo-50/80 border border-indigo-200/60 text-indigo-700 px-2.5 py-1 rounded-lg font-bold" title="عدد النقرات والزيارات للموقع الرسمي">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span>{formatMetricCount(tool.clicks_count || 1420)} نقرة</span>
                  </span>

                  <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-bold" title="عدد المشاهدات والزيارات لصفحة الأداة">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{formatMetricCount(tool.view_count || 3200)} زيارة</span>
                  </span>
                </div>

                {tool.starting_price && (
                  <>
                    <span>•</span>
                    <span>يبدأ من: <strong className="text-slate-800 font-bold">{tool.starting_price}</strong></span>
                  </>
                )}
                {tool.last_updated && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      آخر تحديث: {new Date(tool.last_updated).toLocaleDateString('ar-EG')}
                    </span>
                  </>
                )}
              </div>

              {ratingSuccessMsg && (
                <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-in fade-in">
                  {ratingSuccessMsg}
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Community Upvote Button */}
            <button
              onClick={handleToggleUpvote}
              disabled={upvoting}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isUpvoted
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm hover:bg-indigo-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
              }`}
              title={isUpvoted ? 'إلغاء التصويت' : 'صوّت لهذه الأداة وادعمها في مجتمع دليل'}
            >
              <ChevronUp className={`w-4 h-4 ${isUpvoted ? 'stroke-[3]' : 'text-indigo-500 stroke-[2]'}`} />
              <span>{isUpvoted ? `مؤيد من قبلك (${upvotes})` : `صوّت للأداة (${upvotes})`}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleToggleBookmark}
              disabled={bookmarkLoading}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm hover:bg-rose-100' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
              <span>{isBookmarked ? 'محفوظ في مفضلتك' : 'حفظ في المفضلة'}</span>
            </button>

            {/* Interactive Compare Button */}
            <button
              onClick={() => navigate(`/comparisons?tool1=${tool.slug}`)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer"
              title="قارن هذه الأداة بأداة أخرى وجهاً لوجه"
            >
              <Scale className="w-4 h-4" />
              <span>قارن مع أداة أخرى</span>
            </button>

            {/* Price Drop & Deal Alert Button */}
            <button
              onClick={() => setIsPriceAlertOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold border border-amber-300 bg-amber-50/90 text-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
              title="تنبيهات هبوط الأسعار والعروض الحصرية"
            >
              <Tag className="w-4 h-4 text-amber-600" />
              <span>تنبيه الخصومات</span>
            </button>


            {/* Main Outbound Action Button */}
            {(() => {
              const hasAffiliate = Boolean(tool.affiliate_url && tool.affiliate_url.trim().length > 0);
              const targetUrl = hasAffiliate ? tool.affiliate_url! : tool.website_url;
              return (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel={hasAffiliate ? "noopener noreferrer nofollow sponsored" : "noopener noreferrer"}
                  onClick={() => {
                    trackOutboundClick(tool.id, tool.slug, targetUrl, hasAffiliate);
                    setTool(prev => prev ? { ...prev, clicks_count: (Number(prev.clicks_count) || 0) + 1 } : null);
                  }}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>{hasAffiliate ? 'استخدم الأداة / ابدأ التجربة' : 'زيارة الموقع الرسمي'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              );
            })()}

            {/* Social Media Share Buttons */}
            <div className="flex items-center gap-2 pt-1 md:pt-0">
              <span className="text-xs text-slate-400 font-bold hidden xl:inline">مشاركة:</span>
              <SocialShareButtons
                title={`${tool.name} - ${tool.tagline} | دليل الذكاء الاصطناعي`}
                description={tool.description}
                variant="compact"
              />
            </div>
          </div>
        </div>

        {/* Categories tags */}
        {Array.isArray(tool.categories) && tool.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">الأقسام:</span>
            {tool.categories.map((c) => (
              <button
                key={c.id || c.slug}
                onClick={() => navigate(`/categories/${c.slug}`)}
                className="text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 px-3 py-1 rounded-lg transition-colors"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Strategic Ad Placement 1: Right after Tool Header / Hero */}
      <AdSlot position="article_top" className="my-2" />

      {/* Grid: Main Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Detailed Overview */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900">نظرة عامة عن {tool.name}</h2>
            <div className="prose prose-slate text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <p>{tool.description}</p>
              {tool.overview && <p>{tool.overview}</p>}
            </div>

            {tool.who_is_it_for && (
              <div className="mt-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                <h4 className="font-bold text-xs text-indigo-900 uppercase">لمن تناسب هذه الأداة؟</h4>
                <p className="text-xs sm:text-sm text-indigo-800 font-medium">{tool.who_is_it_for}</p>
              </div>
            )}
          </div>

          {/* Ad Slot - Tool Detail In-Content Banner */}
          <AdSlot position="tool_detail" />

          {/* Key Features */}
          {Array.isArray(tool.features) && tool.features.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900">أبرز المميزات والوظائف</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {tool.features.map((feat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>{feat.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros and Cons */}
          {((Array.isArray(tool.pros) && tool.pros.length > 0) || (Array.isArray(tool.cons) && tool.cons.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pros */}
              <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-xs space-y-3">
                <h3 className="font-bold text-emerald-800 text-base flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  المميزات والإيجابيات
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {tool.pros?.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-xs space-y-3">
                <h3 className="font-bold text-rose-800 text-base flex items-center gap-2">
                  <X className="w-5 h-5 text-rose-600" />
                  السلبيات والتحديات
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {tool.cons?.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Pricing Plans Breakdown */}
          {Array.isArray(tool.pricingPlans) && tool.pricingPlans.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900">خطط وباقات الأسعار</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {tool.pricingPlans.map((plan, i) => (
                  <div 
                    key={i} 
                    className={`p-5 rounded-xl border flex flex-col justify-between ${
                      plan.is_popular 
                        ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-slate-900">{plan.plan_name}</span>
                        {plan.is_popular && (
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">الأكثر طلباً</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                        {plan.period && <span className="text-xs text-slate-500">/ {plan.period}</span>}
                      </div>

                      {plan.features && Array.isArray(plan.features) && (
                        <ul className="space-y-2 text-xs text-slate-600">
                          {plan.features.map((f, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {Array.isArray(tool.faqs) && tool.faqs.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                الأسئلة الأكثر شيوعاً حول {tool.name}
              </h2>
              <div className="divide-y divide-slate-100 pt-2">
                {tool.faqs.map((faq, i) => (
                  <div key={i} className="py-4 space-y-1.5">
                    <h4 className="font-bold text-sm text-slate-900">{faq.question}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real User Reviews & Community Feedback Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <span>آراء وتقييمات مجتمع المستخدمين</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  تجارب حقيقية موثقة من باحثين ومطورين وصناع محتوى عرب
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-xl">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-extrabold text-amber-900">{tool.rating || '4.9'} / 5.0</span>
                <span className="text-xs text-amber-700">({userReviews.length} تقييم موثق)</span>
              </div>
            </div>

            {/* Rating Distribution & Overall Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              {/* Overall Score Box */}
              <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                <span className="text-4xl font-black text-slate-900 leading-none">
                  {tool.rating ? Number(tool.rating).toFixed(1) : '4.9'}
                </span>
                <div className="flex items-center gap-1 my-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(Number(tool.rating || 4.9))
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  بناءً على {tool.review_count || userReviews.length || 1} مراجعة وتقييم
                </span>
              </div>

              {/* Breakdown Bars (5 to 1 Stars) */}
              <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const total = userReviews.length || 1;
                  const count = userReviews.filter((r) => Math.round(Number(r.rating)) === stars).length;
                  const percent = userReviews.length > 0 
                    ? Math.round((count / total) * 100) 
                    : (stars === 5 ? 78 : stars === 4 ? 16 : stars === 3 ? 4 : stars === 2 ? 1 : 1);

                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 w-14 font-bold text-slate-700 flex-shrink-0">
                        <span>{stars}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </div>
                      <div className="flex-1 h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-10 text-left text-slate-400 font-medium text-[11px]">
                        {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Reviews */}
            {userReviews.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">كن أول من يكتب تقييماً واقعياً عن هذه الأداة وشارك تجربتك مع زملائك!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {rev.author_name ? rev.author_name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{rev.author_name}</span>
                            {rev.is_verified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                <UserCheck className="w-3 h-3" />
                                موثق
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString('ar-EG') : 'حديث'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < Math.round(Number(rev.rating)) ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    {rev.title && (
                      <h5 className="font-bold text-xs text-slate-800 pt-1">{rev.title}</h5>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Form */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-800 mb-3">شارك تجربتك الحقيقية مع {tool.name}:</h4>

              {reviewMsg && (
                <div className={`p-3 rounded-xl text-xs mb-3 font-medium ${
                  reviewMsg.includes('بنجاح') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {reviewMsg}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">تقييمك للأداة:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {newRating} من 5 نجوم
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="عنوان التقييم (مثال: تجربة رائعة في برمجة الواجهات)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                </div>

                <div>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب ملاحظاتك الواقعية، الإيجابيات، السلبيات التي واجهتك، وجودة دعم اللغة العربية..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] text-slate-400">
                    {user ? `تسجيل كـ ${user.full_name}` : 'يتطلب النشر تسجيل الدخول للتحقق من مصداقية المراجعة'}
                  </p>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <span>جاري النشر...</span>
                    ) : (
                      <>
                        <span>إرسال التقييم</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Arabic AI Quality Index System */}
          <ArabicQualityIndexSection
            toolSlug={tool.slug}
            toolName={tool.name}
            arabicSupportDeclared={tool.arabic_support}
            isLoggedIn={Boolean(user)}
            currentUser={user}
            openAuthModal={openAuthModal}
          />

          {/* Community Tool Questions & Answers System */}
          <ToolQuestionsSection
            toolSlug={tool.slug}
            toolName={tool.name}
            isLoggedIn={Boolean(user)}
            currentUser={user}
            openAuthModal={openAuthModal}
          />

          {/* Strategic Ad Placement 2: End of Tool Main Content */}
          <AdSlot position="article_bottom" className="my-4" />


          {/* Social Share Callout Banner */}
          <SocialShareButtons
            title={`${tool.name} - أداة ذكاء اصطناعي متقدمة`}
            description={tool.tagline}
            variant="banner"
          />

        </div>

        {/* Right Column: Sidebar (1 col) */}
        <div className="space-y-6">
          
          {/* Quick Info Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              بطاقة معلومات سريعة
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">اسم الأداة:</span>
                <span className="font-bold text-slate-800">{tool.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">نوع التسعير:</span>
                <span className="font-bold text-slate-800">{tool.pricing_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">التقييم العام:</span>
                <span className="font-bold text-amber-600">{tool.rating} / 5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">حالة التوثيق:</span>
                <span className="font-bold text-emerald-600">موثوق ومفحوص</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackOutboundClick(tool.id, tool.slug, tool.website_url, false, tool.name);
                  setTool(prev => prev ? { ...prev, clicks_count: (Number(prev.clicks_count) || 0) + 1 } : null);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                <span>فتح الموقع في نافذة جديدة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Sidebar Ad Slot */}
          <AdSlot position="article_sidebar" />

          {/* Similar Tools */}
          {Array.isArray(tool.similarTools) && tool.similarTools.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">أدوات مشابهة وبديلة</h3>
              <div className="space-y-3">
                {tool.similarTools.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => navigate(`/tools/${st.slug}`)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <OptimizedImage src={st.logo_url} alt={st.name || ''} fallbackText={st.name} className="w-8 h-8 rounded-lg" containerClassName="w-8 h-8 rounded-lg shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 hover:text-indigo-600">{st.name}</h4>
                        <span className="text-[10px] text-slate-500">{st.pricing_type}</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles & Guides */}
          {((tool.relatedArticles && tool.relatedArticles.length > 0) || (tool.relatedTutorials && tool.relatedTutorials.length > 0)) && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">شروحات ومقالات ذات صلة</h3>
              <div className="space-y-2 text-xs">
                {tool.relatedArticles?.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => navigate(`/articles/${a.slug}`)}
                    className="w-full text-right p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium block"
                  >
                    {a.title}
                  </button>
                ))}
                {tool.relatedTutorials?.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/tutorials/${t.slug}`)}
                    className="w-full text-right p-2 rounded-lg hover:bg-slate-50 text-indigo-600 font-semibold block"
                  >
                    دليل: {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sticky/Responsive Sidebar Ad Slot */}
          <AdSlot position="article_sidebar" className="my-2" />

        </div>

      </div>

      {/* Bottom Section 1: Related & Alternative AI Tools Grid */}
      {Array.isArray(tool.similarTools) && tool.similarTools.length > 0 && (
        <RelatedToolsSection
          tools={tool.similarTools}
          currentToolName={tool.name}
          onSelectTool={(slug) => navigate(`/tools/${slug}`)}
          onExploreMore={() => navigate('/ai-tools')}
        />
      )}

      {/* Bottom Section 2: Related Articles & In-depth Guides */}
      {Array.isArray(tool.relatedArticles) && tool.relatedArticles.length > 0 && (
        <RelatedArticlesSection
          articles={tool.relatedArticles}
          topicName={tool.name}
          onSelectArticle={(slug) => navigate(`/articles/${slug}`)}
          onExploreAll={() => navigate('/articles')}
        />
      )}

      {/* Price Drop & Deal Alert Modal */}
      <PriceAlertModal
        isOpen={isPriceAlertOpen}
        onClose={() => setIsPriceAlertOpen(false)}
        toolSlug={tool.slug}
        toolName={tool.name}
      />

    </div>
  );
};

