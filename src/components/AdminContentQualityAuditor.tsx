import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  BookOpen,
  UserCheck,
  Calendar,
  Layers,
  HelpCircle,
  Table as TableIcon,
  Search,
  ArrowRight,
  Info,
  Check,
  Zap
} from 'lucide-react';

interface AuditMetrics {
  score: number; // 0-100
  wordCount: number;
  wordCountStatus: 'excellent' | 'good' | 'warning' | 'critical';
  h2Count: number;
  h3Count: number;
  headingStatus: 'excellent' | 'good' | 'warning';
  hasTransparencyBox: boolean;
  hasSources: boolean;
  sourcesList: string[];
  hasAuthor: boolean;
  hasDate: boolean;
  hasFaq: boolean;
  hasTables: boolean;
  issues: string[];
  recommendations: string[];
}

export const AdminContentQualityAuditor: React.FC<{ token?: string }> = () => {
  const [articleTitle, setArticleTitle] = useState('');
  const [articleAuthor, setArticleAuthor] = useState('د. حسام الشريف');
  const [articleContent, setArticleContent] = useState(`## مقدمة عن أداة الذكاء الاصطناعي
شهدت أدوات الذكاء الاصطناعي التوليدي تطوراً كبيراً في عام 2026. تتيح هذه الأدوات للمنتجين والباحثين تحسين إنتاجيتهم بسرعة وكفاءة.

### مميزات النظام
- سرعة عالية في المعالجة.
- دعم كامل للغة العربية والتشكيل.

### الجدول المقارن
| الأداة | السرعة | السعر |
|---|---|---|
| Claude 3.5 | عالية | 20$ |
| ChatGPT Plus | ممتازة | 20$ |

## المراجع والمصادر الرسمية
1. توثيق OpenAI المعتمد: https://platform.openai.com/docs
2. أبحاث Google DeepMind: https://deepmind.google/research
3. أوراق ArXiv العلمية: https://arxiv.org

[#article-transparency-box]
صندوق الشفافية والموثوقية التحريرية: مراجع ومحدد يدوياً وفق معايير E-E-A-T.
`);

  // Live Auditing Engine
  const metrics: AuditMetrics = useMemo(() => {
    const rawText = articleContent.replace(/[#*`_~|]/g, ' ').trim();
    const words = rawText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // Word Count Status & Points (Max 30 pts)
    let wordCountScore = 0;
    let wordCountStatus: 'excellent' | 'good' | 'warning' | 'critical' = 'critical';
    if (wordCount >= 1200) {
      wordCountScore = 30;
      wordCountStatus = 'excellent';
    } else if (wordCount >= 800) {
      wordCountScore = 24;
      wordCountStatus = 'good';
    } else if (wordCount >= 450) {
      wordCountScore = 15;
      wordCountStatus = 'warning';
    } else {
      wordCountScore = 5;
      wordCountStatus = 'critical';
    }

    // Headings H2/H3 (Max 20 pts)
    const h2Matches = articleContent.match(/^##\s+(.+)$/gm) || [];
    const h3Matches = articleContent.match(/^###\s+(.+)$/gm) || [];
    const h2Count = h2Matches.length;
    const h3Count = h3Matches.length;

    let headingScore = 0;
    let headingStatus: 'excellent' | 'good' | 'warning' = 'warning';
    if (h2Count >= 3 && h3Count >= 2) {
      headingScore = 20;
      headingStatus = 'excellent';
    } else if (h2Count >= 2) {
      headingScore = 14;
      headingStatus = 'good';
    } else {
      headingScore = 5;
      headingStatus = 'warning';
    }

    // Sources & Citations (Max 20 pts)
    const sourceKeywords = ['https://', 'http://', 'OpenAI', 'ArXiv', 'DeepMind', 'Docs', 'أوراق بحثية', 'دراسة', 'مصدر', 'توثيق'];
    const detectedSources = sourceKeywords.filter((kw) => articleContent.toLowerCase().includes(kw.toLowerCase()));
    const hasSources = detectedSources.length >= 2 || articleContent.includes('http');
    const sourcesScore = hasSources ? 20 : 5;

    // Transparency Box (Max 15 pts)
    const hasTransparencyBox =
      articleContent.includes('transparency') ||
      articleContent.includes('الشفافية') ||
      articleContent.includes('E-E-A-T') ||
      articleContent.includes('تدقيق بشري');
    const transparencyScore = hasTransparencyBox ? 15 : 0;

    // Author & Date (Max 10 pts)
    const hasAuthor = Boolean(articleAuthor && articleAuthor.trim().length > 2);
    const authorScore = hasAuthor ? 10 : 0;

    // FAQ / Tables Bonus (Max 5 pts)
    const hasTables = articleContent.includes('|') && articleContent.includes('---');
    const hasFaq = articleContent.includes('الأسئلة الشائعة') || articleContent.includes('سؤال') || articleContent.includes('س:');
    const bonusScore = (hasTables ? 3 : 0) + (hasFaq ? 2 : 0);

    const totalScore = Math.min(100, wordCountScore + headingScore + sourcesScore + transparencyScore + authorScore + bonusScore);

    // Issues & Recommendations
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (wordCount < 800) {
      issues.push(`طول المقال قصير (${wordCount} كلمة). قد يعتبره جوجل "محتوى منخفض القيمة".`);
      recommendations.push('أضف المزيد من الأقسام التفصيلية والأمثلة العملية ليتجاوز المقال 800 إلى 1200 كلمة.');
    }
    if (h2Count < 2) {
      issues.push('ضعف العناوين الرئيسية (H2). يفضل وجود عنوانين فرعيين رئيسيين على الأقل.');
      recommendations.push('استخدم العناوين (## H2) لتنظيم الأفكار وسهولة القراءة لدى المستخدم ومحركات البحث.');
    }
    if (!hasSources) {
      issues.push('غياب الاستشهاد بالمصادر والمراجع العلمية/الرسمية.');
      recommendations.push('أضف قسماً صريحاً للمراجع أو روابط لتوثيق الأدوات الرسمية لتعزيز مصداقية المحتوى.');
    }
    if (!hasTransparencyBox) {
      issues.push('لم يتم العثور على إشارة لصندوق الشفافية والموثوقية التحريرية.');
      recommendations.push('تأكد من تفعيل صندوق الشفافية (Article Transparency Box) لتأكيد التحرير البشري.');
    }
    if (!hasTables) {
      recommendations.push('يفضل إضافة جدول مقارنة منظم لتلخيص الميزات والتكاليف.');
    }

    return {
      score: totalScore,
      wordCount,
      wordCountStatus,
      h2Count,
      h3Count,
      headingStatus,
      hasTransparencyBox,
      hasSources,
      sourcesList: detectedSources,
      hasAuthor,
      hasDate: true,
      hasFaq,
      hasTables,
      issues,
      recommendations
    };
  }, [articleContent, articleAuthor]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>مدقق جودة المحتوى التلقائي (E-E-A-T Auditor)</span>
          </div>
          <h2 className="text-2xl font-black text-white">فحص المقالات والتأكد من المعايير قبل النشر</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            يحلل هذا النظام الشفرة النصية والهيكلية للمقال لتفادي عقوبات جوجل بخصوص "المحتوى التوليدي منخفض القيمة".
          </p>
        </div>

        {/* Score Radial Box */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 border border-white/10 shrink-0 min-w-[130px]">
          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">درجة الجودة</span>
          <div className={`text-4xl font-black font-mono ${
            metrics.score >= 85 ? 'text-emerald-400' : metrics.score >= 65 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {metrics.score}<span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${
            metrics.score >= 85 ? 'bg-emerald-500/20 text-emerald-300' : metrics.score >= 65 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {metrics.score >= 85 ? 'جاهز للنشر' : metrics.score >= 65 ? 'تحسينات طفيفة' : 'يحتاج مراجعة'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Input Area */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>محرر المقال المسودة للتدقيق المباشر</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              عدد الكلمات: <strong className="text-slate-800">{metrics.wordCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المقال</label>
              <input
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder="عنوان المقال التنافسي..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الكاتب والمراجع البشري</label>
              <input
                type="text"
                value={articleAuthor}
                onChange={(e) => setArticleAuthor(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">محتوى المقال (Markdown)</label>
            <textarea
              rows={14}
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Audit Results & Criteria checklist */}
        <div className="space-y-6">
          {/* Audit Metrics Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>نتائج الفحص التفصيلي المعياري</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* 1. Word Count */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">طول المقال والعمق التحريري</span>
                    <span className="text-[10px] text-slate-500">{metrics.wordCount} كلمة (الهدف: 800 - 1200+)</span>
                  </div>
                </div>
                {metrics.wordCount >= 800 ? (
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ممتاز
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> قصير
                  </span>
                )}
              </div>

              {/* 2. Headings H2 / H3 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">هيكلة العناوين (H2 / H3)</span>
                    <span className="text-[10px] text-slate-500">H2: {metrics.h2Count} | H3: {metrics.h3Count}</span>
                  </div>
                </div>
                {metrics.h2Count >= 2 ? (
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> منظم
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> عناوين قليلة
                  </span>
                )}
              </div>

              {/* 3. Transparency Box */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">صندوق الشفافية والموثوقية</span>
                    <span className="text-[10px] text-slate-500">توثيق التدقيق البشري وE-E-A-T</span>
                  </div>
                </div>
                {metrics.hasTransparencyBox ? (
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> متوفر
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> غير موجود
                  </span>
                )}
              </div>

              {/* 4. Sources */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">الاستشهاد بالمصادر الرسمية</span>
                    <span className="text-[10px] text-slate-500">روابط وتوثيق الأبحاث المعتمدة</span>
                  </div>
                </div>
                {metrics.hasSources ? (
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> موثق
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> مراجع ناقصة
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Warnings & Fixes */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>توصيات تحسين المقال قبل النشر:</span>
            </h4>

            {metrics.recommendations.length === 0 ? (
              <p className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                المقال يكتفي بكافة الشروط والتوصيات وجاهز للنشر!
              </p>
            ) : (
              <ul className="space-y-2 text-xs text-amber-800 list-disc list-inside leading-relaxed">
                {metrics.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
