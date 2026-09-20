import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight, 
  Zap, 
  Layers, 
  Star, 
  HelpCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { AdvisorRecommendation } from '../server/services/aiService.ts';

interface AIAdvisorPageProps {
  navigate: (path: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  recommendations?: AdvisorRecommendation[];
  actionPlan?: string[];
  suggestedPrompts?: string[];
  timestamp: string;
}

export const AIAdvisorPage: React.FC<AIAdvisorPageProps> = ({ navigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'advisor',
      text: 'أهلاً بك! أنا "المستشار الذكي لدليل الذكاء الاصطناعي". أخبرني بطبيعة عملك، تخصصك، أو المشروع الذي تعمل عليه، وسأقوم بتحليل احتياجاتك وترشيح الحزمة الأنسب من الأدوات مع أفضل الممارسات وطرق الاستخدام.',
      suggestedPrompts: [
        'أنا صانع محتوى وأريد أدوات لكتابة مقالات وصور لمنصات التواصل',
        'أنا مهندس برمجيات وأبحث عن أدوات لتسريع كتابة وتصحيح الأكواد',
        'أريد بدائل مجانية للأدوات المدفوعة مثل Midjourney و ChatGPT Plus',
        'أنا رائد أعمال وأريد أدوات لبناء نموذج أولي لمشروعي (MVP)'
      ],
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });

      if (!response.ok) {
        throw new Error('حدث خطأ أثناء التواصل مع المستشار الذكي');
      }

      const data = await response.json();

      const advisorMsg: Message = {
        id: `advisor-${Date.now()}`,
        sender: 'advisor',
        text: data.answer || 'إليك أفضل التوصيات المخصصة لك:',
        recommendations: data.recommendations || [],
        actionPlan: data.actionPlan || [],
        suggestedPrompts: data.suggestedPrompts || [],
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, advisorMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'advisor',
          text: 'عذراً، حدثت مشكلة في الاتصال بالمستشار. يرجى المحاولة مرة أخرى.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = (promptText: string, key: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6" dir="rtl">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>مستشار الذكاء الاصطناعي التفاعلي المباشر</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          المستشار الذكي ومطابق الأدوات (AI Advisor)
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          اطرح استفسارك أو صِف مشروعك ليقوم المستشار بتحليل طلبك ومطابقته فوراً مع أفضل الأدوات المسجلة في المنصة مع خطط الأسعار والبرومبتات المقترحة.
        </p>
      </div>

      {/* Chat Canvas Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">مستشار دليل AI الذكي</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-400">مدعوم بالذكاء الاصطناعي التوليدي وقاعدة بيانات الأدوات المحدثة</p>
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            title="بدء محادثة جديدة"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">جلسة جديدة</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1 font-medium">
                <span>{msg.sender === 'user' ? 'أنت' : 'المستشار الذكي'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-2xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-2xs shadow-xs space-y-4'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Recommendations Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-black text-slate-900 block flex items-center gap-1.5 border-t border-slate-100 pt-3">
                      <Zap className="w-4 h-4 text-amber-500" />
                      الأدوات المرشحة لطلبك:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{rec.toolName}</h4>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {rec.pricingType}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug">{rec.reason}</p>

                          <div className="bg-white p-2 rounded-xl border border-slate-100 text-[10px] text-slate-500">
                            <span className="font-bold text-slate-700 block mb-0.5">الميزة الأبرز:</span>
                            <span>{rec.keyFeature}</span>
                          </div>

                          {rec.starterPrompt && (
                            <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100 text-[10px] space-y-1">
                              <div className="flex items-center justify-between text-indigo-800 font-bold">
                                <span>برومبت مقترح للبدء:</span>
                                <button
                                  onClick={() => copyPrompt(rec.starterPrompt!, `${msg.id}-${idx}`)}
                                  className="text-indigo-600 hover:text-indigo-900 flex items-center gap-0.5 cursor-pointer"
                                  title="نسخ البرومبت"
                                >
                                  {copiedIndex === `${msg.id}-${idx}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <p className="text-slate-600 italic">"{rec.starterPrompt}"</p>
                            </div>
                          )}

                          <button
                            onClick={() => navigate(`/tools/${rec.toolSlug}`)}
                            className="w-full mt-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                          >
                            <span>عرض تفاصيل الأداة والأسعار</span>
                            <ArrowRight className="w-3 h-3 rotate-180" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Plan */}
                {msg.actionPlan && msg.actionPlan.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      خطة العمل والخطوات المقترحة:
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                      {msg.actionPlan.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow up Prompts */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 block">أسئلة متابعة مقترحة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.map((sug, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-right border border-slate-200/60"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 max-w-md shadow-xs animate-in fade-in">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <p className="text-xs text-slate-600 font-medium">
                جاري مطابقة طلبك وتحليل أفضل الأدوات المناسبة...
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="اكتب استفسارك، تخصصك، أو ما ترغب في إنجازه بالذكاء الاصطناعي..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>إرسال</span>
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
