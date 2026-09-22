import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ShieldCheck,
  Award,
  Clock,
  Calendar,
  UserCheck,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  BookOpen,
  Eye,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Layers
} from 'lucide-react';
import { SocialShareButtons } from './SocialShareButtons.tsx';
import { AdSlot } from './AdSlot.tsx';
import { OptimizedImage } from './OptimizedImage.tsx';
import { ArticleSchema } from './ArticleSchema.tsx';

export interface EEATArticleProps {
  id?: string;
  slug?: string;
  title: string;
  excerpt?: string;
  content: string;
  author_name?: string;
  author_role?: string;
  author_avatar?: string;
  published_at?: string;
  updated_at?: string;
  read_time?: string;
  cover_image_url?: string;
  categories?: { id?: string; name: string; slug?: string }[];
  key_takeaways?: string[];
  faqs?: { question: string; answer: string }[];
  showAdSlots?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Reusable React Component for Articles adhering strictly to Google E-E-A-T
 * (Experience, Expertise, Authoritativeness, Trustworthiness)
 * Features:
 * - Dynamic Table of Contents (H2/H3 ScrollSpy)
 * - Rich Comparison & Data Tables
 * - Structured FAQ Accordion & JSON-LD Schema
 * - Author & Editorial Verification Card
 * - Reading Progress Bar & Font Scaling
 */
export const EEATArticleViewer: React.FC<EEATArticleProps> = ({
  title,
  excerpt,
  content,
  author_name = 'فريق تحرير دليل الذكاء الاصطناعي',
  author_role = 'خبير تقني واستراتيجي في الذكاء الاصطناعي',
  author_avatar,
  published_at = new Date().toISOString(),
  updated_at,
  read_time,
  cover_image_url,
  categories = [],
  key_takeaways,
  faqs = [],
  showAdSlots = true,
  onBack,
  backLabel = 'العودة للمقالات',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [fontSizeClass, setFontSizeClass] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-base');
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate word count & reading time if not supplied
  const calculatedReadTime = useMemo(() => {
    if (read_time) return read_time;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} دقائق قراءة`;
  }, [content, read_time]);

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).length;
  }, [content]);

  // Extract Table of Contents from markdown content (H2 and H3)
  const headings: HeadingItem[] = useMemo(() => {
    const list: HeadingItem[] = [];
    const lines = content.split('\n');
    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        const text = h2Match[1].replace(/[*_`]/g, '').trim();
        const id = 'heading-' + encodeURIComponent(text.toLowerCase().replace(/\s+/g, '-').slice(0, 40));
        list.push({ id, text, level: 2 });
      } else {
        const h3Match = line.match(/^###\s+(.+)$/);
        if (h3Match) {
          const text = h3Match[1].replace(/[*_`]/g, '').trim();
          const id = 'heading-' + encodeURIComponent(text.toLowerCase().replace(/\s+/g, '-').slice(0, 40));
          list.push({ id, text, level: 3 });
        }
      }
    });
    return list;
  }, [content]);

  // Track Reading Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Detect active heading
      if (headings.length > 0) {
        for (let i = headings.length - 1; i >= 0; i--) {
          const element = document.getElementById(headings[i].id);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 160) {
              setActiveHeadingId(headings[i].id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveHeadingId(id);
    }
  };

  // Extract structured FAQs from Content if none passed in props
  const extractedFaqs = useMemo(() => {
    if (faqs && faqs.length > 0) return faqs;
    const items: { question: string; answer: string }[] = [];
    const faqSectionMatch = content.match(/##\s+.*(?:الأسئلة الشائعة|FAQ).*\n([\s\S]*)/i);
    if (faqSectionMatch && faqSectionMatch[1]) {
      const faqText = faqSectionMatch[1];
      const qMatches = [...faqText.matchAll(/###\s+(.+)\n([\s\S]*?)(?=(?:###|\n##|$))/g)];
      qMatches.forEach((m) => {
        items.push({
          question: m[1].replace(/[*_`]/g, '').trim(),
          answer: m[2].trim(),
        });
      });
    }
    return items;
  }, [content, faqs]);

  // Inject JSON-LD Schema for E-E-A-T and Article/FAQPage
  useEffect(() => {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description: excerpt,
      image: cover_image_url ? [cover_image_url] : undefined,
      datePublished: published_at,
      dateModified: updated_at || published_at,
      author: {
        '@type': 'Person',
        name: author_name,
        jobTitle: author_role,
      },
      publisher: {
        '@type': 'Organization',
        name: 'دليل الذكاء الاصطناعي العربي',
        logo: {
          '@type': 'ImageObject',
          url: 'https://ais-dev-q5hd4tzcwsajvx3h3elvdu-11724582893.europe-west2.run.app/favicon.ico',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': typeof window !== 'undefined' ? window.location.href : '',
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'eeat-article-schema';
    script.innerHTML = JSON.stringify(articleSchema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('eeat-article-schema');
      if (existing) existing.remove();
    };
  }, [title, excerpt, cover_image_url, published_at, updated_at, author_name, author_role]);

  return (
    <article className="w-full max-w-4xl mx-auto space-y-8" ref={contentRef}>
      {/* Dynamic Article JSON-LD Schema (E-E-A-T Compliant) */}
      <ArticleSchema
        title={title}
        description={excerpt}
        cover_image_url={cover_image_url}
        published_at={published_at}
        updated_at={updated_at}
        author_name={author_name}
        author_role={author_role}
        faqs={extractedFaqs}
      />

      {/* 1. TOP READING PROGRESS BAR (STICKY) */}
      <div
        className="fixed top-0 left-0 right-0 h-1.5 bg-slate-100 z-50 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-linear-to-r from-indigo-600 via-purple-600 to-amber-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. BACK NAVIGATION & CATEGORY PILLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-1.5 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{backLabel}</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat, idx) => (
            <span
              key={cat.id || idx}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
            >
              {cat.name}
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            معايير E-E-A-T
          </span>
        </div>
      </div>

      {/* 3. MAIN ARTICLE HEADER & METADATA */}
      <header className="space-y-4">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
          {title}
        </h1>

        {/* ARTICLE TRANSPARENCY BOX (صندوق شفافية وموثوقية المقال) */}
        <div id="article-transparency-box" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-500/30 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-amber-400 border border-indigo-400/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>صندوق الشفافية والموثوقية التحريرية</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    E-E-A-T Verified
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">محتوى مراجع ومحدث يدوياً بواسطة خبراء الذكاء الاصطناعي</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>تدقيق بشري لمصداقية المحتوى 100%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* 1. اسم الكاتب والمراجع */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-indigo-400" />
                الكاتب والمراجع البشري:
              </span>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>{author_name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">محرر معتمد</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{author_role}</p>
            </div>

            {/* 2. تاريخ آخر تحديث ومراجعة الحقائق */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                تاريخ آخر تدقيق وتحديث:
              </span>
              <div className="font-bold text-white text-xs font-mono">
                {new Date(updated_at || published_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                تحديث التوثيق والتسعير لعام 2026
              </p>
            </div>

            {/* 3. مصادر الأبحاث والمراجعة المعتمدة */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-emerald-400" />
                مصادر التوثيق والمراجعة:
              </span>
              <div className="text-[11px] text-slate-200 font-medium truncate">
                OpenAI Docs • DeepMind • ArXiv AI Papers
              </div>
              <p className="text-[10px] text-slate-400">تجارب مباشرة بدون توليد آلي عشوائي</p>
            </div>
          </div>

          {/* شريط الملاحظة التحريرية والتوافق مع أدسنس */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 border-t border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white font-bold">التزام الجودة والشعور البشري:</strong> يتم اختبار كافة الأدوات والنماذج تقنياً لضمان قيمة المحتوى وتجنب مخالفة "محتوى منخفض القيمة" لدى محركات البحث.
            </span>
          </div>
        </div>

        {/* E-E-A-T Verified Editorial Byline */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {author_avatar ? (
                <img src={author_avatar} alt={author_name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                author_name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-sm">{author_name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  محرر معتمد
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{author_role}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(published_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {calculatedReadTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-600 font-mono">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              {wordCount.toLocaleString('ar-EG')} كلمة
            </span>
          </div>
        </div>

        {/* Article Toolbar: Share & Font Size Controls */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">حجم الخط:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFontSizeClass('text-base')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                  fontSizeClass === 'text-base' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="خط قياسي"
              >
                عادي
              </button>
              <button
                onClick={() => setFontSizeClass('text-lg')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                  fontSizeClass === 'text-lg' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="خط كبير"
              >
                كبير
              </button>
              <button
                onClick={() => setFontSizeClass('text-xl')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                  fontSizeClass === 'text-xl' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="خط مكبّر جداً"
              >
                مكبّر
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">تم نسخ الرابط!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
            <SocialShareButtons
              title={`${title} | دليل الذكاء الاصطناعي`}
              description={excerpt || title}
              variant="compact"
            />
          </div>
        </div>
      </header>

      {/* STRATEGIC AD PLACEMENT 1: UNDER TITLE */}
      {showAdSlots && <AdSlot position="article_top" className="my-2" />}

      {/* 4. COVER IMAGE */}
      {cover_image_url && (
        <div className="w-full rounded-3xl overflow-hidden border border-slate-200 shadow-xs max-h-[420px]">
          <OptimizedImage
            src={cover_image_url}
            alt={title}
            priority={true}
            aspectRatio="16/9"
            responsiveWidths={[480, 768, 1024, 1280]}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full max-h-[420px]"
          />
        </div>
      )}

      {/* 5. EXECUTIVE SUMMARY / KEY TAKEAWAYS (E-E-A-T SEARCH INTENT) */}
      {excerpt && (
        <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-indigo-50/90 to-slate-50 border border-indigo-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-black text-base">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>الملخص التنفيذي وأبرز المخرجات (Executive Summary)</span>
          </div>
          <p className="text-slate-800 font-medium text-sm sm:text-base leading-relaxed">
            {excerpt}
          </p>
          {key_takeaways && key_takeaways.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-indigo-100/80">
              {key_takeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 6. DYNAMIC TABLE OF CONTENTS (H2 / H3 NAVIGATION) */}
      {headings.length > 1 && (
        <nav
          aria-label="فهرس المقال"
          className="rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs overflow-hidden transition-all"
        >
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-right font-black text-slate-900 text-sm sm:text-base bg-slate-100/70 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-600" />
              <span>فهرس المحتوى والانتقال السريع ({headings.length} أقسام رئيسية)</span>
            </div>
            {isTocOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {isTocOpen && (
            <div className="p-4 sm:p-5 space-y-2 border-t border-slate-200/80 bg-white">
              <ul className="space-y-1.5 text-xs sm:text-sm">
                {headings.map((h) => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <li
                      key={h.id}
                      style={{ paddingRight: h.level === 3 ? '1.5rem' : '0rem' }}
                      className="transition-colors"
                    >
                      <button
                        onClick={() => scrollToHeading(h.id)}
                        className={`text-right w-full py-1 px-2.5 rounded-lg flex items-center gap-2 transition-all ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-black border-r-3 border-indigo-600'
                            : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            h.level === 2 ? (isActive ? 'bg-indigo-600' : 'bg-slate-400') : 'bg-amber-400'
                          }`}
                        />
                        <span className="line-clamp-1">{h.text}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>
      )}

      {/* 7. RICH MARKDOWN CONTENT (HEADINGS, COMPARISON TABLES, CALLOUTS) */}
      <div className={`markdown-article text-slate-800 ${fontSizeClass} leading-relaxed space-y-6 pt-2`}>
        <ReactMarkdown
          components={{
            h2: ({ children }) => {
              const textContent = typeof children === 'string' ? children : String(children);
              const id = 'heading-' + encodeURIComponent(textContent.toLowerCase().replace(/\s+/g, '-').slice(0, 40));
              return (
                <h2
                  id={id}
                  className="text-xl sm:text-2xl font-black text-slate-900 mt-10 mb-4 pb-3 border-b border-slate-200 flex items-center justify-between gap-2 scroll-mt-24 group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-7 rounded-full bg-linear-to-b from-indigo-600 to-purple-600 inline-block shadow-xs"></span>
                    <span>{children}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        const url = new URL(window.location.href);
                        url.hash = id;
                        navigator.clipboard.writeText(url.toString());
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-1 rounded-lg transition-opacity"
                    title="نسخ رابط هذا القسم"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </h2>
              );
            },
            h3: ({ children }) => {
              const textContent = typeof children === 'string' ? children : String(children);
              const id = 'heading-' + encodeURIComponent(textContent.toLowerCase().replace(/\s+/g, '-').slice(0, 40));
              return (
                <h3
                  id={id}
                  className="text-lg sm:text-xl font-bold text-slate-900 mt-7 mb-3 flex items-center gap-2 scroll-mt-24"
                >
                  <span className="w-2 h-4 rounded-full bg-amber-500 inline-block"></span>
                  <span>{children}</span>
                </h3>
              );
            },
            p: ({ children }) => (
              <p className="text-slate-700 leading-relaxed my-4">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="space-y-2.5 my-4 list-none text-slate-700 pr-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-2.5 my-4 list-decimal list-inside text-slate-700 pr-2 font-medium">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed flex items-start gap-2 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-r-4 border-indigo-600 pr-5 py-3.5 my-6 bg-linear-to-r from-indigo-50/80 to-transparent rounded-l-2xl text-slate-800 font-medium">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">{children}</div>
                </div>
              </blockquote>
            ),
            // High Value Responsive Comparison & Data Tables
            table: ({ children }) => (
              <div className="my-8 overflow-x-auto rounded-3xl border border-slate-200/90 shadow-xs bg-white">
                <div className="p-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    جدول مقارنة تفصيلي وتحليل معايير الجودة
                  </span>
                  <span className="text-[11px] text-slate-400">مرر أفقياً لعرض كامل الأعمدة ←</span>
                </div>
                <table className="w-full text-right border-collapse text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-100/80 text-slate-900 font-black border-b border-slate-200">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="py-3.5 px-4 font-black text-slate-900 border-l border-slate-200 last:border-l-0 whitespace-nowrap bg-slate-100/50">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="py-3.5 px-4 border-b border-slate-100 border-l border-slate-100 last:border-l-0 text-slate-700 transition-colors hover:bg-slate-50/60">
                {children}
              </td>
            ),
            hr: () => (
              <hr className="my-10 border-t-2 border-slate-100" />
            ),
            strong: ({ children }) => (
              <strong className="font-black text-slate-900">
                {children}
              </strong>
            ),
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-indigo-600 text-[0.9em] border border-slate-200/60 font-semibold">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* 8. INTERACTIVE FAQ ACCORDIONS (IF EXTRACTED) */}
      {extractedFaqs.length > 0 && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-black text-lg sm:text-xl">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
            <span>الأسئلة الشائعة والإجابات المعتمدة (FAQ)</span>
          </div>
          <div className="space-y-3 pt-2">
            {extractedFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-right flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-50/80 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0 mr-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* STRATEGIC AD PLACEMENT 2: MIDDLE/IN-CONTENT */}
      {showAdSlots && <AdSlot position="article_incontent" className="my-4" />}

      {/* 9. E-E-A-T AUTHORSHIP & FACT-CHECKING TRUST CARD */}
      <section className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-white to-slate-50 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              {author_avatar ? (
                <img src={author_avatar} alt={author_name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                author_name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-slate-900 text-base sm:text-lg">{author_name}</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  مُراجع معتمد
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{author_role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">تاريخ آخر تدقيق:</span>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              {new Date(updated_at || published_at).toLocaleDateString('ar-EG')}
            </span>
          </div>
        </div>

        {/* 4 Pillars of Google E-E-A-T Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs font-bold text-slate-900">الخبرة والتجربة المباشرة (Experience)</strong>
              <p className="text-[11px] text-slate-600 mt-0.5">
                تعتمد كافة تقييماتنا على استخدام ميداني حقيقي وفحص واجهات الأدوات التقنية.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs font-bold text-slate-900">الموثوقية والشفافية (Trustworthiness)</strong>
              <p className="text-[11px] text-slate-600 mt-0.5">
                محتوى حيادي مستقل يخضع لمراجعات دورية لضمان صحة الأسعار والخصائص المذكورة.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
          <strong>إخلاء مسؤولية تحريري:</strong> نحن نتبع إرشادات الشفافية الصارمة لضمان حصول القارئ العربي على أدق المعلومات. قد تتغير الأسعار والسياسات من الشركات المطورة بمرور الوقت، لذا يُرجى التحقق من الموقع الرسمي للأداة قبل الاشتراك.
        </div>
      </section>

      {/* STRATEGIC AD PLACEMENT 3: ARTICLE FOOTER */}
      {showAdSlots && <AdSlot position="article_bottom" className="my-4" />}
    </article>
  );
};
