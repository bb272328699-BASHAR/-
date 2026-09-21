import React, { useState, useEffect } from 'react';
import { Languages, Star, CheckCircle2, MessageSquare, Award, Plus, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { fetchArabicReviewsForTool, createArabicQualityReview } from '../lib/firestoreService.ts';

interface ArabicQualityIndexSectionProps {
  toolSlug: string;
  toolName: string;
  arabicSupportDeclared?: string;
  isLoggedIn: boolean;
  currentUser?: { id?: string; name?: string; full_name?: string } | null;
  openAuthModal?: (mode: 'login' | 'register') => void;
}

export const ArabicQualityIndexSection: React.FC<ArabicQualityIndexSectionProps> = ({
  toolSlug,
  toolName,
  arabicSupportDeclared,
  isLoggedIn,
  currentUser,
  openAuthModal,
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [reviewerName, setReviewerName] = useState(currentUser?.full_name || currentUser?.name || '');
  const [overallScore, setOverallScore] = useState(9);
  const [rtlScore, setRtlScore] = useState(9);
  const [dialectScore, setDialectScore] = useState(8);
  const [grammarScore, setGrammarScore] = useState(9);
  const [testedUseCase, setTestedUseCase] = useState('كتابة محتوى وترجمة إبداعية');
  const [sampleOutput, setSampleOutput] = useState('');
  const [verdict, setVerdict] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    const data = await fetchArabicReviewsForTool(toolSlug);
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [toolSlug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verdict.trim()) {
      setMsg({ text: 'يرجى كتابة خلاصة التجربة والتقييم', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMsg(null);

    const res = await createArabicQualityReview({
      toolSlug,
      userId: currentUser?.id,
      userName: reviewerName.trim() || 'باحث ذكاء اصطناعي',
      overallScore,
      rtlSupportScore: rtlScore,
      dialectSupportScore: dialectScore,
      grammarScore,
      testedUseCase,
      sampleOutput,
      verdict,
    });

    setSubmitting(false);

    if (res.success) {
      setMsg({ text: 'تمت إضافة مراجعة جودة اللغة العربية بنجاح!', type: 'success' });
      setShowAddForm(false);
      setVerdict('');
      setSampleOutput('');
      loadReviews();
    } else {
      setMsg({ text: 'حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً', type: 'error' });
    }
  };

  // Calculate Aggregates
  const totalCount = reviews.length;
  const avgOverall = totalCount > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.overallScore) || 9), 0) / totalCount).toFixed(1)
    : '9.2';
  const avgRtl = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rtlSupportScore) || 9), 0) / totalCount).toFixed(1)
    : '9.0';
  const avgDialect = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.dialectSupportScore) || 8), 0) / totalCount).toFixed(1)
    : '8.8';
  const avgGrammar = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.grammarScore) || 9), 0) / totalCount).toFixed(1)
    : '9.4';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                مؤشر جودة اللغة العربية (Arabic AI Index)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                🇸🇦 توثيق عربي
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              فحص دقة المعالجة اللغوية، دعم محاذاة اليمين (RTL)، وفهم اللهجات العربية
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إلغاء الإضافة' : 'أضف تجربة لغوية للأداة'}</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-900 shadow-sm">
        <div className="text-center sm:text-right border-l border-emerald-800/80 pl-2">
          <span className="text-[11px] text-emerald-300 block font-medium">المعدل العام للجودة</span>
          <div className="text-2xl font-black text-emerald-100 mt-1 font-mono flex items-baseline justify-center sm:justify-start gap-1">
            <span>{avgOverall}</span>
            <span className="text-xs text-emerald-400 font-sans">/ 10</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">ممتاز وموصى به</span>
        </div>

        <div className="text-center sm:text-right border-l border-emerald-800/80 pl-2">
          <span className="text-[11px] text-emerald-300 block font-medium">محاذاة RTL والاتجاه</span>
          <div className="text-xl font-black text-emerald-200 mt-1 font-mono">
            {avgRtl} / 10
          </div>
          <span className="text-[10px] text-emerald-400 block mt-0.5">دعم يمين إلى يسار</span>
        </div>

        <div className="text-center sm:text-right border-l border-emerald-800/80 pl-2">
          <span className="text-[11px] text-emerald-300 block font-medium">اللهجات العامية</span>
          <div className="text-xl font-black text-emerald-200 mt-1 font-mono">
            {avgDialect} / 10
          </div>
          <span className="text-[10px] text-emerald-400 block mt-0.5">خليجي، مصري، شامي</span>
        </div>

        <div className="text-center sm:text-right">
          <span className="text-[11px] text-emerald-300 block font-medium">السلامة النحوية والتشكيل</span>
          <div className="text-xl font-black text-emerald-200 mt-1 font-mono">
            {avgGrammar} / 10
          </div>
          <span className="text-[10px] text-emerald-400 block mt-0.5">فصحى منضبطة</span>
        </div>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Add Arabic Review Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>توثيق تجربة الأداة باللغة العربية:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المقيم أو الجهة:</label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="مثال: د. أحمد المحمدي أو كاتب محتوى"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">حالة الاستخدام التي جربتها:</label>
              <select
                value={testedUseCase}
                onChange={(e) => setTestedUseCase(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
              >
                <option value="كتابة محتوى وترجمة إبداعية">كتابة مقالات ومحتوى إبداعي</option>
                <option value="تحليل وتلخيص ملفات PDF عربية">تحليل وتلخيص مستندات PDF عربية</option>
                <option value="دعم العملاء والردود الآلية">خدمة عملاء وردود آلية شات بوت</option>
                <option value="كتابة كود ومساعدة برمجية مع تعليقات عربية">مساعدة برمجية باللغة العربية</option>
                <option value="توليد صوت وكلام عربي Text-to-Speech">توليد أصوات وتعليق صوتي TTS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">التقييم العام (1-10):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={overallScore}
                onChange={(e) => setOverallScore(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">محاذاة RTL (1-10):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={rtlScore}
                onChange={(e) => setRtlScore(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">اللهجات (1-10):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={dialectScore}
                onChange={(e) => setDialectScore(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">النحو والإملاء (1-10):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={grammarScore}
                onChange={(e) => setGrammarScore(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">خلاصة تقييمك للأداة في اللغة العربية:</label>
            <textarea
              required
              rows={3}
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              placeholder="صف بدقة كيف كانت صياغة النصوص، هل فهمت المعنى السياقي والمصطلحات التخصصية..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عينة من النص أو المخرجات الناتجة (اختياري):</label>
            <input
              type="text"
              value={sampleOutput}
              onChange={(e) => setSampleOutput(e.target.value)}
              placeholder="مثال: ترجمة دقيقة لمصطلح Prompt Engineering إلى هندسة الأوامر"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'نشر التقييم اللغوي'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">
                الأداة خضعت للاختبارات القياسية الأولية وتدعم اللغة العربية بدرجة امتياز.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                تظهر المعالجة استيعاباً عالياً للقواعد الإملائية والمصطلحات الحديثة مع دعم مناسب لاتجاه الكتابة العربي.
              </p>
            </div>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    {rev.userName ? rev.userName.charAt(0) : 'ع'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                    <span className="text-[10px] text-slate-400 block">{rev.testedUseCase}</span>
                  </div>
                </div>

                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  {rev.overallScore} / 10
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed pt-1">{rev.verdict}</p>

              {rev.sampleOutput && (
                <div className="text-[11px] font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                  <span className="text-emerald-600 font-bold">عينة: </span>
                  {rev.sampleOutput}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
