import React, { useState } from 'react';
import { Sparkles, Shield, Heart, ExternalLink, Mail, Bell, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer_weekly_alerts' })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('تم اشتراكك بنجاح! ستصلك تنبيهات أسبوعية بأفضل الأدوات الجديدة 🚀');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'حدث خطأ أثناء الاشتراك. يرجى المحاولة لاحقاً');
      }
    } catch (err) {
      setStatus('error');
      setMessage('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مجدداً');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Weekly New Tools Alert Newsletter Card */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            <div className="space-y-2 text-center lg:text-right max-w-xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-xs font-bold text-indigo-300">
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                <span>نشرة التنبيهات الأسبوعية المجانية</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                تلقّ أسبوعياً أفضل الأدوات الجديدة التي تم إضافتها للمنصة
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                ملخص أسبوعي موجز ومفلتر يأتيك بأهم الأدوات المفحوصة والميزات الصاعدة والخصومات الحصرية، بدون أي رسائل مزعجة.
              </p>
            </div>

            {/* Subscription Form */}
            <div className="w-full lg:w-auto lg:min-w-[380px] max-w-md">
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني (name@example.com)"
                      className="w-full pr-10 pl-3.5 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-right"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الاشتراك...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>اشترك مجاناً</span>
                      </>
                    )}
                  </button>
                </div>

                {message && (
                  <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg ${
                    status === 'success' 
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50' 
                      : 'text-rose-400 bg-rose-950/40 border border-rose-800/50'
                  }`}>
                    {status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>🔒 خصوصيتك محمية بالكامل</span>
                  <span>إلغاء الاشتراك بنقرة واحدة في أي وقت</span>
                </div>
              </form>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">دليل الذكاء الاصطناعي</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              المرجع المستقل الأول لتصنيف وتقييم ومقارنة أدوات ونماذج الذكاء الاصطناعي. نساعد رواد الأعمال والمطورين والمبدعين في اختيار الأداة المثالية لمهامهم اليومية.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                بيانات حقيقية موثقة
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                تحديثات 2026
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">استكشاف المنصة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={() => navigate('/advisor')} className="hover:text-indigo-400 transition-colors font-bold text-indigo-300 flex items-center gap-1">المستشار الذكي (AI Advisor) ✨</button></li>
              <li><button onClick={() => navigate('/ecommerce')} className="hover:text-indigo-400 transition-colors font-bold text-amber-300 flex items-center gap-1">المتاجر والتسويق بالعمولة 🛒</button></li>
              <li><button onClick={() => navigate('/prompts')} className="hover:text-indigo-400 transition-colors">مكتبة ومولد الأوامر (Prompts)</button></li>
              <li><button onClick={() => navigate('/stacks')} className="hover:text-indigo-400 transition-colors">حزم الأدوات التخصصية (Stacks)</button></li>
              <li><button onClick={() => navigate('/alternatives')} className="hover:text-indigo-400 transition-colors">دليل البدائل المجانية</button></li>
              <li><button onClick={() => navigate('/calculator')} className="hover:text-indigo-400 transition-colors">حاسبة العائد والتكاليف (ROI)</button></li>
              <li><button onClick={() => navigate('/comparisons')} className="hover:text-indigo-400 transition-colors">مقارنات الأدوات</button></li>
            </ul>
          </div>

          {/* Content & Resources */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">المحتوى والمصادر</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={() => navigate('/articles')} className="hover:text-indigo-400 transition-colors">المقالات والتحليلات</button></li>
              <li><button onClick={() => navigate('/resources')} className="hover:text-indigo-400 transition-colors">الكتب والقوالب المجانية</button></li>
              <li><button onClick={() => navigate('/about')} className="hover:text-indigo-400 transition-colors">من نحن</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-indigo-400 transition-colors">تواصل معنا</button></li>
              <li><a href="/sitemap.xml" target="_blank" className="hover:text-indigo-400 transition-colors flex items-center gap-1">خريطة الموقع (Sitemap) <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Policies & Compliance */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">السياسات والامتثال</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={() => navigate('/editorial-policy')} className="hover:text-indigo-400 transition-colors">السياسة التحريرية ومنهجية التقييم</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-indigo-400 transition-colors">سياسة الخصوصية وحماية البيانات</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-indigo-400 transition-colors">شروط وأحكام الاستخدام</button></li>
              <li><button onClick={() => navigate('/cookie-policy')} className="hover:text-indigo-400 transition-colors">سياسة ملفات تعريف الارتباط</button></li>
              <li><button onClick={() => navigate('/affiliate-disclosure')} className="hover:text-indigo-400 transition-colors">إفصاح الشفافية والروابط التابعة</button></li>
              <li><a href="/sitemap.xml" target="_blank" className="hover:text-indigo-400 transition-colors flex items-center gap-1">خريطة الموقع (Sitemap.xml) <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="space-y-1 text-center sm:text-right">
            <p>© 2026 منصة دليل الذكاء الاصطناعي (Daleel AI). جميع الحقوق محفوظة.</p>
            <p className="text-slate-400">النطاق الرسمي الموثق: <strong className="text-indigo-400 font-mono">daleel.ai</strong> | معتمد من قبل خبراء التقنية العرب</p>
          </div>
          <p className="flex items-center gap-1">
            صُمم بأعلى معايير الحرفية باللغة العربية لدعم المبتكرين العرب
          </p>
        </div>
      </div>
    </footer>
  );
};
