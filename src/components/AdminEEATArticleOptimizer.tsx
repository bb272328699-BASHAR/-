import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Copy,
  Check,
  Save,
  Zap,
  Table as TableIcon,
  HelpCircle,
  BarChart2,
  ShieldCheck,
  Eye,
  Edit3,
  Flame,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AuditedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  wordCount: number;
  readTime: string;
  isFeatured: boolean;
  score: number;
  riskLevel: 'low_value_risk' | 'moderate' | 'eeat_ready';
  hasH2: boolean;
  hasH3: boolean;
  hasTable: boolean;
  hasFaq: boolean;
  hasLists: boolean;
  metaConfigured: boolean;
}

interface RewriteResult {
  title: string;
  content: string;
  excerpt: string;
  readTime: string;
  wordCount: number;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  faqs: Array<{ question: string; answer: string }>;
  eeatScore: number;
  eeatHighlights: string[];
  tableIncluded: boolean;
}

export const AdminEEATArticleOptimizer: React.FC<{ token: string }> = ({ token }) => {
  const [auditData, setAuditData] = useState<{
    summary: {
      totalArticles: number;
      readyArticlesCount: number;
      atRiskArticlesCount: number;
      averageScore: number;
      adsenseReadyPercentage: number;
    };
    articles: AuditedArticle[];
  } | null>(null);

  const [loadingAudit, setLoadingAudit] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [keywords, setKeywords] = useState('الذكاء الاصطناعي, أدوات الإنتاجية, مراجعة 2026');
  const [tone, setTone] = useState('مهنية، تحليلية، موثوقة وعميقة');

  const [rewriting, setRewriting] = useState(false);
  const [batchUpgrading, setBatchUpgrading] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewTab, setPreviewTab] = useState<'rendered' | 'raw' | 'faqs' | 'seo'>('rendered');

  const fetchAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/admin/content/eeat-audit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditData(data);
      }
    } catch (e) {
      console.error('Failed to load EEAT audit:', e);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    if (!articleId) {
      setInputTitle('');
      setInputContent('');
      return;
    }
    const found = auditData?.articles.find(a => a.id === articleId);
    if (found) {
      setInputTitle(found.title);
      setInputContent(found.excerpt || found.title);
      // Fetch full article content from public api if needed
      fetch(`/api/articles/${found.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data?.content) {
            setInputContent(data.content);
          }
        })
        .catch(() => {});
    }
  };

  const handleRewrite = async (autoSave = false) => {
    if (!inputTitle && !inputContent) {
      setFeedback({ text: 'يرجى إدخال عنوان أو نص المقال للبدء', type: 'error' });
      return;
    }

    setRewriting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/content/eeat-rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentTitle: inputTitle,
          currentContent: inputContent,
          targetKeywords: keywords.split(/[,،]/).map(k => k.trim()).filter(Boolean),
          tone,
          articleId: selectedArticleId || undefined,
          autoSave
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
        setFeedback({ 
          text: autoSave 
            ? 'تم تطوير المقال وحفظه وتحديثه فورياً في قاعدة البيانات!' 
            : 'تمت إعادة الصياغة والتطوير بنجاح! راجع المقال واحفظه عند الرغبة.',
          type: 'success' 
        });
        if (autoSave) {
          await fetchAudit();
        }
      } else {
        throw new Error(data.error || 'فشلت عملية إعادة الصياغة');
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'حدث خطأ أثناء معالجة المقال', type: 'error' });
    } finally {
      setRewriting(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content/eeat-rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentTitle: result.title,
          currentContent: result.content,
          articleId: selectedArticleId,
          autoSave: true
        })
      });

      if (res.ok) {
        setFeedback({ text: 'تم حفظ المقال المطور في قاعدة البيانات بنجاح!', type: 'success' });
        await fetchAudit();
      } else {
        throw new Error('فشل حفظ المقال');
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'فشل الحفظ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBatchUpgradeAll = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في ترقية وتوسيع كافة المقالات ذات المحتوى القصير دفعة واحدة وفق معايير E-E-A-T؟')) {
      return;
    }

    setBatchUpgrading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/content/articles/upgrade-all-eeat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ text: data.message, type: 'success' });
        await fetchAudit();
      } else {
        throw new Error(data.error || 'فشل الترقية الجماعية');
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'حدث خطأ أثناء الترقية', type: 'error' });
    } finally {
      setBatchUpgrading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google AdSense & E-E-A-T Content Optimizer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            مُطوّر ومُحسّن المقالات بمعايير Google E-E-A-T
          </h2>
          <p className="text-sm text-indigo-100 leading-relaxed">
            محرك ذكي متخصص في حل مشكلة <strong>"محتوى منخفض القيمة (Low Value Content)"</strong> وتحويل المسودات القصيرة إلى مقالات دليلية عميقة (900 إلى 1400 كلمة) مدعومة بجداول المقارنة، والأسئلة الشائعة، واللمسة البشرية الموثوقة لقبول فوري في Google AdSense وتصدر محركات البحث.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleBatchUpgradeAll}
              disabled={batchUpgrading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {batchUpgrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>{batchUpgrading ? 'جارِ ترقية كافة المقالات...' : 'ترقية شاملة لكافة المقالات دفعة واحدة (1-Click)'}</span>
            </button>

            <button
              onClick={fetchAudit}
              disabled={loadingAudit}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
              <span>فحص جاهزية المحتوى</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Audit Stats Dashboard */}
      {auditData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">إجمالي المقالات</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-black text-slate-900">{auditData.summary.totalArticles}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">متوافقة مع E-E-A-T</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{auditData.summary.readyArticlesCount}</span>
              <span className="text-xs text-emerald-700 font-bold">({auditData.summary.adsenseReadyPercentage}%)</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">تحتاج توسيع وتطوير</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-black text-amber-600">{auditData.summary.atRiskArticlesCount}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">متوسط جودة المحتوى</span>
              <Award className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-black text-indigo-600">{auditData.summary.averageScore} / 100</span>
          </div>
        </div>
      )}

      {/* Main Workspace: Form & Live E-E-A-T Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span>إعدادات المقال والمدخلات</span>
            </h3>
            {auditData && (
              <span className="text-[11px] text-slate-500 font-medium">
                {auditData.articles.length} مقالات متاحة
              </span>
            )}
          </div>

          {/* Quick Selector from Database */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اختر مقالاً موجوداً لتطويره أو اكتب مقالاً جديداً:
            </label>
            <select
              value={selectedArticleId}
              onChange={(e) => handleSelectArticle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">-- كتابة / لصق مقال جديد من مسودة --</option>
              {auditData?.articles.map(art => (
                <option key={art.id} value={art.id}>
                  {art.title} ({art.wordCount} كلمة | تقييم {art.score}%)
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان المقال (أو الفكرة الأساسية) *
            </label>
            <input
              type="text"
              placeholder="مثال: الدليل الشامل لأفضل أدوات الذكاء الاصطناعي في 2026..."
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الكلمات المفتاحية المستهدفة (مفصولة بفواصل)
            </label>
            <input
              type="text"
              placeholder="الذكاء الاصطناعي, أدوات الإنتاجية, الربح من الإنترنت, E-E-A-T"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tone & Target */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              النبرة ومعايير الأسلوب
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 bg-white"
            >
              <option value="مهنية، تحليلية، موثوقة وعميقة">مهنية وتحليلية عميقة (الأفضل لمعايير E-E-A-T)</option>
              <option value="دليل تطبيقي خطوة بخطوة للمبتدئين والمحترفين">دليل تطبيقي وعملي (Step-by-Step Guide)</option>
              <option value="مقارنة نقدية محايدة واستعراض للتكاليف">مقارنة نقدية واستعراض للأسعار والجدوى</option>
            </select>
          </div>

          {/* Content Draft */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              النص الحالي أو المسودة المطلوب إعادة صياغتها وتوسيعها (800-1400 كلمة)
            </label>
            <textarea
              rows={8}
              placeholder="الصق نص المقال القصير أو النقاط الرئيسية هنا..."
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => handleRewrite(false)}
              disabled={rewriting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-60 cursor-pointer"
            >
              {rewriting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{rewriting ? 'جارِ بناء وتوسيع المقال وفق E-E-A-T...' : 'تطوير وإعادة كتابة المقال بالكامل (E-E-A-T)'}</span>
            </button>

            {selectedArticleId && (
              <button
                onClick={() => handleRewrite(true)}
                disabled={rewriting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-60 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>تطوير وحفظ وتحديث المقال فوراً في قاعدة البيانات</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live E-E-A-T Output Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-bold text-sm text-slate-900">معاينة المقال المطور والنتائج</h3>
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>E-E-A-T: {result.eeatScore}/100</span>
                  </div>

                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold font-mono">
                    {result.wordCount} كلمة
                  </span>

                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                    {result.readTime}
                  </span>
                </div>
              )}
            </div>

            {/* Preview Navigation Tabs */}
            {result && (
              <div className="flex items-center gap-2 pt-3 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setPreviewTab('rendered')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewTab === 'rendered' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  المقال المنسق (Markdown)
                </button>
                <button
                  onClick={() => setPreviewTab('faqs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                    previewTab === 'faqs' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>الأسئلة الشائعة ({result.faqs?.length || 0})</span>
                </button>
                <button
                  onClick={() => setPreviewTab('seo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                    previewTab === 'seo' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>بيانات Meta & SEO</span>
                </button>
                <button
                  onClick={() => setPreviewTab('raw')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewTab === 'raw' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  الكود المصدري الخام
                </button>
              </div>
            )}

            {/* Content Display */}
            <div className="pt-4 min-h-[380px]">
              {result ? (
                <div>
                  {previewTab === 'rendered' && (
                    <div className="space-y-4">
                      {/* Highlights */}
                      <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 space-y-1.5">
                        <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>أبرز معايير القيمة المضافة المحققة في المقال:</span>
                        </span>
                        <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                          {result.eeatHighlights?.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>

                      <h2 className="text-lg font-black text-slate-900 leading-snug">
                        {result.title}
                      </h2>

                      <p className="text-xs text-slate-500 leading-relaxed italic border-r-2 border-indigo-500 pr-3">
                        {result.excerpt}
                      </p>

                      <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed overflow-x-auto">
                        <ReactMarkdown>{result.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {previewTab === 'faqs' && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-700 block">
                        الأسئلة الشائعة المهيكلة لنتائج قوقل الغنية (Google FAQ Schema):
                      </span>
                      {result.faqs?.map((faq, i) => (
                        <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                          <strong className="text-xs text-indigo-900 font-bold block">
                            س: {faq.question}
                          </strong>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            ج: {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {previewTab === 'seo' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-500">Meta Title:</span>
                        <p className="font-mono text-slate-800">{result.metaTitle}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-500">Meta Description:</span>
                        <p className="text-slate-800">{result.metaDescription}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-500">الكلمات المفتاحية:</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {result.focusKeywords?.map((k, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px]">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {previewTab === 'raw' && (
                    <textarea
                      readOnly
                      rows={14}
                      value={result.content}
                      className="w-full p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed outline-none"
                    />
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-bold text-sm text-slate-700">جاهز لإعادة كتابة وتطوير المقال</h4>
                    <p className="text-xs text-slate-400">
                      اختر مقالاً من القائمة الجانبية أو الصق مسودتك واضغط على "تطوير وإعادة كتابة المقال" لإنتاج محتوى عميق بمعايير E-E-A-T.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          {result && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(result.content)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ نص Markdown'}</span>
                </button>
              </div>

              {selectedArticleId && (
                <button
                  onClick={handleSaveToDatabase}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جارِ الحفظ...' : 'حفظ التعديلات في قاعدة البيانات'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
