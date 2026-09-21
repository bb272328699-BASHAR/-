import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageCircle, Send, CheckCircle2, User, ShieldCheck, Sparkles } from 'lucide-react';
import { fetchToolQuestions, createToolQuestion, answerToolQuestion } from '../lib/firestoreService.ts';

interface ToolQuestionsSectionProps {
  toolSlug: string;
  toolName: string;
  isLoggedIn: boolean;
  currentUser?: { id?: string; name?: string; full_name?: string } | null;
  openAuthModal?: (mode: 'login' | 'register') => void;
}

export const ToolQuestionsSection: React.FC<ToolQuestionsSectionProps> = ({
  toolSlug,
  toolName,
  isLoggedIn,
  currentUser,
  openAuthModal,
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [askerName, setAskerName] = useState(currentUser?.full_name || currentUser?.name || '');
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replierName, setReplierName] = useState(currentUser?.full_name || currentUser?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await fetchToolQuestions(toolSlug);
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, [toolSlug]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    setMsg(null);

    const res = await createToolQuestion({
      toolSlug,
      userId: currentUser?.id,
      userName: askerName.trim() || 'مستخدم مهتم',
      question: newQuestion.trim(),
    });

    setSubmitting(false);

    if (res.success) {
      setMsg({ text: 'تم طرح سؤالك بنجاح وسيتلقى إجابات من المجتمع أو الإدارة قريباً!', type: 'success' });
      setNewQuestion('');
      loadQuestions();
    } else {
      setMsg({ text: 'حدث خطأ أثناء إرسال السؤال، يرجى المحاولة لاحقاً', type: 'error' });
    }
  };

  const handleSendAnswer = async (questionId: string) => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    const res = await answerToolQuestion({
      questionId,
      userName: replierName.trim() || 'عضو مجتمع دليل',
      answer: replyText.trim(),
      isStaff: false,
    });
    setSubmitting(false);

    if (res.success) {
      setReplyText('');
      setAnsweringQuestionId(null);
      loadQuestions();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              استفسارات وأسئلة المجتمع حول {toolName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              اسأل عن طرق الدفع، الدعم الفني، أو استشر زملاءك الذين استخدموا الأداة مسبقاً
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
          {questions.length} سؤال مسجل
        </span>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Ask a Question Box */}
      <form onSubmit={handleAskQuestion} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-900">لديك سؤال أو استفسار محدد؟</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-1">
            <input
              type="text"
              value={askerName}
              onChange={(e) => setAskerName(e.target.value)}
              placeholder="اسمك أو لقبك..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="مثال: هل توفر الأداة واجهة API؟ هل بطاقات مدى مقبولة؟"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'جاري الإرسال...' : 'طرح السؤال'}</span>
          </button>
        </div>
      </form>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <MessageCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">لا توجد استفسارات بعد حول {toolName}</p>
            <p className="text-[11px] text-slate-400">كن أول من يطرح سؤالاً لمساعدة المهتمين بهذه الأداة!</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {q.userName ? q.userName.charAt(0) : '؟'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{q.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString('ar-EG') : ''}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 pr-8">{q.question}</h4>
                </div>

                <button
                  type="button"
                  onClick={() => setAnsweringQuestionId(answeringQuestionId === q.id ? null : q.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                >
                  {answeringQuestionId === q.id ? 'إلغاء' : 'أجب على السؤال'}
                </button>
              </div>

              {/* Answers */}
              {Array.isArray(q.answers) && q.answers.length > 0 && (
                <div className="pr-6 space-y-2 border-r-2 border-indigo-200">
                  {q.answers.map((ans: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>{ans.userName}</span>
                        {ans.isStaff && (
                          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-mono">
                            فريق دليل
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{ans.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Answer Form */}
              {answeringQuestionId === q.id && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={replierName}
                      onChange={(e) => setReplierName(e.target.value)}
                      placeholder="اسمك..."
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="اكتب إجابتك الواضحة هنا..."
                      className="sm:col-span-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSendAnswer(q.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      إرسال الإجابة
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
