import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MapPin, 
  Send, 
  ShieldCheck, 
  CheckCircle, 
  Lock, 
  FileText, 
  Scale, 
  Sparkles, 
  HelpCircle,
  AlertCircle,
  Clock,
  Globe,
  Award,
  Check,
  Eye,
  Cookie,
  UserCheck,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { submitFirestoreContact } from '../lib/firestoreService.ts';
import { updateDocumentSEO } from '../utils/seo.ts';

interface StaticPagesProps {
  type: 'about' | 'contact' | 'privacy' | 'terms' | 'affiliate' | 'editorial' | 'cookies';
  navigate: (path: string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ type, navigate }) => {
  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daleel.ai';
    const seoMap: Record<string, { title: string; desc: string; path: string }> = {
      about: {
        title: 'عن دليل الذكاء الاصطناعي | رؤيتنا ورسالتنا',
        desc: 'تعرف على المنصة العربية الأولى المتخصصة في اختبار وتقييم وتصنيف أدوات الذكاء الاصطناعي التوليدي.',
        path: '/about',
      },
      contact: {
        title: 'اتصل بنا | دليل الذكاء الاصطناعي',
        desc: 'تواصل مع فريق تحرير دليل الذكاء الاصطناعي للاستفسارات، الشراكات الإعلانية، أو اقتراح أداة جديدة.',
        path: '/contact',
      },
      privacy: {
        title: 'سياسة الخصوصية وحماية البيانات | دليل الذكاء الاصطناعي',
        desc: 'نلتزم بحماية خصوصيتك ومعلوماتك الشخصية وفق أعلى معايير الأمان وقوانين حماية البيانات.',
        path: '/privacy',
      },
      terms: {
        title: 'شروط وأحكام الاستخدام | دليل الذكاء الاصطناعي',
        desc: 'الشروط والقواعد الحاكمة لاستخدام منصة ومحتوى دليل الذكاء الاصطناعي.',
        path: '/terms',
      },
      affiliate: {
        title: 'إفصاح روابط الشراكة والتسويق بالعمولة | دليل الذكاء الاصطناعي',
        desc: 'إفصاح شفاف حول الروابط التابعة ونموذج تمويل المنصة ومصداقية المراجعات الحيادية.',
        path: '/affiliate-disclosure',
      },
      editorial: {
        title: 'السياسة التحريرية ومعايير المراجعة | دليل الذكاء الاصطناعي',
        desc: 'المعايير المنهجية الصارمة التي نتبعها في اختبار وتقييم وتصنيف تطبيقات الذكاء الاصطناعي.',
        path: '/editorial-policy',
      },
      cookies: {
        title: 'سياسة ملفات تعريف الارتباط (Cookies) | دليل الذكاء الاصطناعي',
        desc: 'معلومات حول كيفية استخدام ملفات الكوكيز لتحسين تجربة التصفح وعرض المحتوى والإعلانات الملائمة.',
        path: '/cookie-policy',
      },
    };

    const currentSeo = seoMap[type] || seoMap.about;
    updateDocumentSEO({
      title: currentSeo.title,
      description: currentSeo.desc,
      canonicalUrl: `${origin}${currentSeo.path}`,
      ogType: 'website',
    });
  }, [type]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'تعذر إرسال الرسالة');

      // Sync to Firestore
      submitFirestoreContact(name, email, message, subject).catch(() => {});

      setSuccessMsg(data.message || 'تم استلام رسالتك بنجاح وسيرد فريق التحرير قريباً.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // 1. About Us
  if (type === 'about') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12" dir="rtl">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>المرجع العربي المعتمد والحيادي للذكاء الاصطناعي (E-E-A-T Certified)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            عن منصة دليل الذكاء الاصطناعي | رؤيتنا وفريق العمل
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            المنصة العربية المستقلة الأولى المتخصصة في تحليل، اختبار، وتوثيق تطبيقات ونماذج الذكاء الاصطناعي بشفافية وحيادية تامة بواسطة فريق تحرير بشرى متخصص.
          </p>
        </div>

        {/* E-E-A-T Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
          <div className="text-center space-y-1 border-l border-slate-800 last:border-0 pl-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">+350</span>
            <span className="block text-xs text-slate-300 font-medium">أداة خضعت للاختبار الميداني</span>
          </div>
          <div className="text-center space-y-1 sm:border-l border-slate-800 last:border-0 pl-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</span>
            <span className="block text-xs text-slate-300 font-medium">تدقيق ومراجعة بشرية مستقلة</span>
          </div>
          <div className="text-center space-y-1 border-l border-slate-800 last:border-0 pl-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">+120</span>
            <span className="block text-xs text-slate-300 font-medium">دليل تقني ومقال شامل</span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">+50k</span>
            <span className="block text-xs text-slate-300 font-medium">مستخدم وقارئ شهرياً</span>
          </div>
        </div>

        {/* Vision & Methodology */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span>رسالتنا ومنهجية التقييم الموضوعية</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              مع الانفجار الهائل في أدوات الذكاء الاصطناعي عالمياً، يواجه المستخدم والباحث العربي صعوبة في تمييز البرمجيات ذات القيمة الحقيقية عن الأدوات التسويقية المكررة. أُطلقت منصة <strong>دليل الذكاء الاصطناعي (Daleel AI)</strong> لتكون المرجع المستقل الذي يعتمد على التجربة المباشرة والأوامر العربية الواقعية بدون الاعتماد على النشرات الترويجية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">اختبار ميداني بشرى 100%</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                نقوم بالاشتراك الفعلي واختبار كل تطبيق بأوامر معقدة باللغة العربية، وتقييم جودة مخرجاته وسرعته ودقته.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">فحص المعالجة اللغوية (RTL & NLP)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                نقيّم مدى كفاءة النماذج في فهم التشكيل، القواعد، اللهجات المحلية، ودعم واجهات الاستخدام من اليمين إلى اليسار.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">حيادية وشفافية التسعير</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                فصل تام بين فريق التحرير وأي شريك إعلاني. نوضح الحدود المجانية والتكاليف الفعلية المخفية بكل أمانة.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Team Profiles (E-E-A-T Core) */}
        <div className="space-y-6">
          <div className="text-right space-y-1">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>الفريق التحريري والخبراء المعتمدون (Editorial Board)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              يتكون فريقنا التحريري من مهندسين وباحثين ذوي خبرة عمل أكاديمية وتطبيقية في مجالات تعلم الآلة ومعالجة اللغات الطبيعية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Author 1 */}
            <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 text-right">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&auto=format&fit=crop&q=80"
                  alt="د. حسام الشريف"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-base">د. حسام الشريف</h3>
                  <span className="text-xs text-indigo-600 font-bold block">رئيس التحرير واستراتيجي الذكاء الاصطناعي</span>
                  <span className="text-[10px] text-slate-400 font-mono">دكتوراه علوم حاسب - خبرة 12+ سنة</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                متخصص في بنية النماذج اللغوية الكبيرة (LLMs) وهندسة البرمجيات السحابية. أشرف على مراجعة أكثر من 200 أداة ذكاء اصطناعي ونشر العديد من الأوراق البحثية.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  محرر معتمد E-E-A-T
                </span>
                <span className="text-slate-400">الرياض، المملكة العربية السعودية</span>
              </div>
            </div>

            {/* Author 2 */}
            <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 text-right">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&auto=format&fit=crop&q=80"
                  alt="م. سارة العتيبي"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-base">م. سارة العتيبي</h3>
                  <span className="text-xs text-indigo-600 font-bold block">قائدة فحص الأدوات ومعالجة اللغة (NLP)</span>
                  <span className="text-[10px] text-slate-400 font-mono">ماجستير ذكاء اصطناعي - خبرة 8+ سنوات</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                خبيرة في هندسة الأوامر (Prompt Engineering) وتقييم دقة النصوص العربية. تقوم باختبار وتجربة الأدوات الموجهة لصناع المحتوى والشركات.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  فحص واختبار عملي
                </span>
                <span className="text-slate-400">دبي، الإمارات العربية المتحدة</span>
              </div>
            </div>

            {/* Author 3 */}
            <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 text-right">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&auto=format&fit=crop&q=80"
                  alt="د. كريم عبد العزيز"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-base">د. كريم عبد العزيز</h3>
                  <span className="text-xs text-indigo-600 font-bold block">مستشار الأمن الرقمي وأخلاقيات AI</span>
                  <span className="text-[10px] text-slate-400 font-mono">باحث أمن معلومات - خبرة 10+ سنوات</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                يركز على فحص أمان البيانات وسرية خوارزميات الأدوات وحماية خصوصية المستخدمين وفق التشريعات العالمية والقوانين المحلية.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  مراجعة الأمان والخصوصية
                </span>
                <span className="text-slate-400">القاهرة، جمهورية مصر العربية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Standards Notice */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>اطلع على السياسة التحريرية الكاملة وميثاق النزاهة</span>
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              نحن نلتزم بالمعايير العالمية للصحافة التقنية. يمكنك الاطلاع على ميثاق النزاهة التحريرية ومعايير مراجعة الحقائق بالتفصيل.
            </p>
          </div>

          <button
            onClick={() => navigate('/editorial-policy')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            قراءة السياسة التحريرية
          </button>
        </div>
      </div>
    );
  }

  // 2. Contact Us
  if (type === 'contact') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">تواصل مع إدارة المنصة وفريق التحرير</h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            سواء كان لديك استفسار، اقتراح لإضافة أداة ذكاء اصطناعي، أو طلب مراجعة مخصصة، يسعدنا الاستماع إليك.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">قنوات التواصل المباشرة</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  فريقنا متواجد للرد على كافة الاستفسارات خلال ساعات العمل الرسمية.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block">البريد الإلكتروني الرسمي:</span>
                    <a href="mailto:contact@daleel.ai" className="font-bold text-white hover:text-indigo-300 dir-ltr text-right block">
                      contact@daleel.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block">أوقات الاستجابة:</span>
                    <span className="font-bold text-white">خلال 24 إلى 48 ساعة عمل</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block">النطاق الرسمي:</span>
                    <span className="font-bold text-white">https://daleel.ai</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400">
              <p>نحترم خصوصيتك بالكامل. لن يتم مشاركة بريدك الإلكتروني مع أي طرف خارجي.</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: عبد الله السالم"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">موضوع الرسالة</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: اقتراح إضافة أداة ذكاء اصطناعي جديدة / شراكة"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">نص الرسالة</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب تفاصيل استفسارك أو اقتراحك بوضوح..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>جاري الإرسال...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال الرسالة إلى فريق التحرير</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. Privacy Policy
  if (type === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10" dir="rtl">
        {/* Header Badge & Title */}
        <div className="border-b border-slate-200 pb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>وثيقة الامتثال وحماية البيانات الرسمية</span>
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>متوافقة مع Google AdSense و GDPR و CCPA</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">سياسة الخصوصية وملفات تعريف الارتباط</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            تاريخ السريان: 2026 | النطاق الرسمي: <strong className="text-slate-700 font-mono">daleel.ai</strong> | مرجع الامتثال القانوني
          </p>
        </div>

        {/* Quick Highlights Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">تشفير وحماية البيانات</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تشفير كامل لكافة البيانات أثناء النقل (TLS 1.3) وكلمات المرور مشفرة بخوارزميات أحادية الاتجاه.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
              <Cookie className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">التحكم في ملفات الكوكيز</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ندعم نظام Google Consent Mode v2 لتحديد خياراتك الإعلانية والتحليلية بحرية كاملة.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">حقوق المستخدم (GDPR)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              لك كامل الحق في الوصول، التعديل، التحميل، أو الحذف النهائي لبياناتك وحسابك في أي وقت.
            </p>
          </div>
        </div>

        {/* Main Detailed Content Body */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          
          {/* Section 1: Intro */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">1</span>
              <span>المقدمة والتزامنا بالخصوصية</span>
            </h2>
            <p>
              أهلاً بك في منصة <strong>دليل الذكاء الاصطناعي (Daleel AI)</strong> المتاحة عبر النطاق الرسمي <span className="font-mono text-indigo-600 font-semibold">https://daleel.ai</span>. إن حماية خصوصيتك وأمان بياناتك الشخصية يمثلان الركيزة الأساسية لثقتك بنا. توضح هذه السياسة بشفافية تامة كيفية قيامنا بجمع ومعالجة وتخزين واستخدام بياناتك عند تصفح المنصة أو استخدام أدواتها، إلى جانب كيفية إدارة ملفات تعريف الارتباط والإعلانات.
            </p>
          </section>

          {/* Section 2: Data Collection */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">2</span>
              <span>البيانات والمعلومات التي نقوم بجمعها</span>
            </h2>
            <p>نقوم بجمع المعلومات الضرورية فقط لتقديم وتطوير خدمات الدليل، وتنقسم إلى:</p>
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">أ. المعلومات التي تقدمها لنا طواعية:</h4>
                <ul className="list-disc pr-5 space-y-1 text-xs text-slate-600">
                  <li><strong>بيانات التسجيل والحساب:</strong> الاسم، عنوان البريد الإلكتروني، وتفضيلات الحساب عند التسجيل.</li>
                  <li><strong>التقييمات والمراجعات وقوائم التفضيلات:</strong> المراجعات الكتابية والتعليقات وقائمة الأدوات التي تحفظها في مفضلتك.</li>
                  <li><strong>رسائل الدعم والتواصل:</strong> الاسم والبريد ومحتوى الرسائل الموجهة عبر نموذج الاتصال أو البريد الرسمي.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">ب. البيانات التقنية المجموعة تلقائياً (Log Data):</h4>
                <ul className="list-disc pr-5 space-y-1 text-xs text-slate-600">
                  <li>عنوان بروتوكول الإنترنت (IP Address) المشفر جزئياً لأغراض الحماية ومكافحة السبام.</li>
                  <li>نوع المتصفح ونظام التشغيل واللغة المفضلة ونوع الجهاز (مكتب / هاتف).</li>
                  <li>بيانات التصفح الإحصائية العامة مثل الصفحات التي تمت زيارتها، والوقت المستغرق، ونقرات الروابط.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Google AdSense & Third-Party Advertising (CRITICAL COMPLIANCE) */}
          <section className="space-y-4 p-5 sm:p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <h2 className="text-lg sm:text-xl font-black text-amber-950 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-900 text-xs font-black flex items-center justify-center">3</span>
              <span>إعلانات Google AdSense وشبكات الإعلان الخارجية (Third-Party Vendors)</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                نستخدم في منصة دليل الذكاء الاصطناعي برنامج <strong>Google AdSense</strong> وشبكات إعلانية شريكة لعرض الإعلانات أثناء زيارتك لموقعنا. تلتزم المنصة بمتطلبات Google الصارمة لناشري المحتوى، ونلفت عنايتك إلى النقاط التالية:
              </p>
              <ul className="list-disc pr-5 space-y-2 text-slate-700">
                <li>
                  <strong>ملفات تعريف الارتباط الخاصة بالإعلانات (Google DART Cookie):</strong> تستخدم شركة Google، بصفتها مورداً لطرف ثالث، ملفات تعريف الارتباط لعرض الإعلانات على موقعنا بناءً على زيارات المستخدمين السابقة لهذا الموقع أو لمواقع أخرى على شبكة الإنترنت.
                </li>
                <li>
                  تتيح ملفات تعريف الارتباط للإعلانات لشركة Google وشركائها إمكانية تقديم إعلانات مخصصة للمستخدمين بناءً على اهتماماتهم ومجالات بحثهم التقنية.
                </li>
                <li>
                  <strong>إلغاء الاشتراك في الإعلانات المخصصة:</strong> يمكن للمستخدمين في أي وقت إلغاء استخدام الإعلانات المخصصة من خلال زيارة <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline inline-flex items-center gap-1">إعدادات إعلانات Google <ExternalLink className="w-3 h-3" /></a> أو عبر زيارة بوابة تعطيل ملفات تعريف الارتباط لمبادرة الإعلان على الشبكة <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline inline-flex items-center gap-1">www.aboutads.info <ExternalLink className="w-3 h-3" /></a>.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Cookies & Google Consent Mode v2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">4</span>
              <span>سياسة ملفات تعريف الارتباط (Cookies) وموافقة المستخدم</span>
            </h2>
            <p>
              ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم وضعها على جهازك لتحسين تجربة التصفح وحفظ تفضيلاتك. تطبق منصتنا تقنية <strong>Google Consent Mode v2</strong> التي تمنحك التحكم الكامل في نوعية الملفات المفعلة:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">1. ملفات أساسية وضرورية (Essential)</span>
                <p className="text-slate-600">لتأمين جلسة تسجيل الدخول، وحماية النماذج ضد هجمات CSRF، وتذكر تفضيلات الخصوصية.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">2. ملفات تحليل الأداء (Google Analytics 4)</span>
                <p className="text-slate-600">لقياس مصادر الزيارات والصفحات الأكثر قراءة وتطوير جودة المراجعات والمحتوى العربي.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">3. ملفات الإعلانات والتخصيص (Ad Storage)</span>
                <p className="text-slate-600">تُستخدم من قبل شبكة Google AdSense لعرض إعلانات ملائمة وتفادي تكرار نفس الإعلان.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">4. ملفات التفضيلات والمظهر (Preferences)</span>
                <p className="text-slate-600">لتذكر فلترة الأدوات المحددة، وعروض الأسعار، والمقارنات النشطة في جلسة التصفح.</p>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('daleel_cookie_consent');
                    localStorage.removeItem('daleel_consent_mode_v2');
                    window.location.reload();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة ضبط تفضيلات ملفات تعريف الارتباط (Cookie Preferences)</span>
              </button>
            </div>
          </section>

          {/* Section 5: GDPR and CCPA User Rights */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">5</span>
              <span>حقوق المستخدم بموجب اللائحة العامة لحماية البيانات (GDPR & CCPA)</span>
            </h2>
            <p>
              بموجب قوانين حماية البيانات الشخصية واللائحة الأوروبية العامة (GDPR) وقانون كاليفورنيا للخصوصية (CCPA)، يتمتع مستخدمو المنصة بالحقوق القانونية التالية:
            </p>
            <ul className="list-disc pr-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
              <li><strong>حق الوصول (Right to Access):</strong> طلب نسخة كاملة من بياناتك الشخصية المخزنة لدينا.</li>
              <li><strong>حق التصحيح (Right to Rectification):</strong> تعديل أو تصحيح أي معلومات غير دقيقة مرتبطة بحسابك.</li>
              <li><strong>حق الحذف والنسيان (Right to Erasure):</strong> طلب المسح النهائي لبياناتك وحسابك من قواعد بياناتنا.</li>
              <li><strong>حق تقييد المعالجة أو الاعتراض (Right to Object):</strong> الاعتراض على معالجة بياناتك لأغراض تسويقية أو تحليلية.</li>
              <li><strong>حق عدم التمييز (Non-Discrimination):</strong> لن تتعرض لأي تمييز في جودة الخدمة عند ممارستك لأي من حقوق الخصوصية.</li>
            </ul>
          </section>

          {/* Section 6: Affiliate Disclosure & External Links */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">6</span>
              <span>إخلاء المسؤولية عن روابط الإحالة والمواقع الخارجية</span>
            </h2>
            <p>
              تحتوي منصة Daleel AI على روابط تقود إلى مواقع وتطبيقات تابعة لجهات خارجية (أدوات الذكاء الاصطناعي، ومواقع الشركات المطورة). قد يحتوي بعض هذه الروابط على معرّفات إحالة تسويقية (Affiliate Links). يُرجى العلم أننا لا نتحكم في سياسات الخصوصية أو ممارسات جمع البيانات لتلك المواقع الخارجية، وننصحك بمراجعة سياسة الخصوصية لكل موقع تزوره.
            </p>
          </section>

          {/* Section 7: Children's Privacy */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">7</span>
              <span>حماية خصوصية الأطفال (COPPA Compliance)</span>
            </h2>
            <p>
              منصتنا موجهة للجمهور العام وللمهنيين والمهتمين بالتقنية وليست موجهة للأطفال دون سن 13 عاماً. نحن لا نقوم بجمع أي معلومات تعريفية عن الأطفال عن قصد. إذا علمت أن طفلاً قد زودنا ببيانات شخصية، يرجى التواصل معنا فوراً لحذفها بشكل كامل وفوري.
            </p>
          </section>

          {/* Section 8: Security & Storage */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">8</span>
              <span>أمن البيانات وتحديثات السياسة</span>
            </h2>
            <p>
              نطبق إجراءات أمنية وفنية وتنظيمية متقدمة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفشاء. قد نقوم بتحديث سياسة الخصوصية بشكل دوري لمواكبة التغييرات التنظيمية أو التقنية، وسيتم إشعار المستخدمين بتاريخ آخر تحديث في أعلى الصفحة.
            </p>
          </section>

          {/* Section 9: Contact Information */}
          <section className="space-y-3 border-t border-slate-200/80 pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center">9</span>
              <span>مسؤول حماية البيانات والتواصل</span>
            </h2>
            <p className="text-xs sm:text-sm">
              إذا كانت لديك أي أسئلة أو استفسارات بخصوص سياسة الخصوصية، أو رغبت في ممارسة أي من حقوقك القانونية، يسعدنا التواصل معك عبر:
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block">بريد مسؤول الخصوصية (DPO):</span>
                <a href="mailto:privacy@daleel.ai" className="font-bold text-indigo-600 hover:text-indigo-800 dir-ltr text-right block font-mono">
                  privacy@daleel.ai
                </a>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block">بريد الاستفسارات العامة:</span>
                <a href="mailto:contact@daleel.ai" className="font-bold text-indigo-600 hover:text-indigo-800 dir-ltr text-right block font-mono">
                  contact@daleel.ai
                </a>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block">نموذج التواصل السريع:</span>
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline block"
                >
                  صفحة اتصل بنا المباشرة
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    );
  }

  // 4. Terms of Service
  if (type === 'terms') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">الشروط التعاقدية</span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">شروط وأحكام الاستخدام</h1>
          <p className="text-xs text-slate-500 mt-1">تاريخ النفاذ: 2026 | تحكم هذه الشروط استخدامك لمنصة daleel.ai</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. قبول الشروط</h2>
            <p>
              بدخولك أو استخدامك لمنصة دليل الذكاء الاصطناعي، فإنك تقر وتوافق على الالتزام بكافة الشروط والبنود الواردة في هذه الوثيقة والقوانين السارية. إذا كنت لا توافق على هذه الشروط، يرجى الامتناع عن استخدام المنصة.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">2. حقوق الملكية الفكرية</h2>
            <p>
              كافة التحليلات، جداول المقارنات، النصوص، الأدلة التحريرية، والعلامات التجارية المنشورة في المنصة هي ملك حصري لمنصة Daleel AI ومحمية بموجب أنظمة حماية حقوق المؤلف الدولية. لا يجوز إعادة إنتاج أو كشط (Scraping) أو نشر المحتوى دون إذن خطي مسبق وإشارة صريحة للمصدر برابط نشط.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. سياسة التقييمات والمراجعات</h2>
            <p>
              يمنع منعاً باتاً نشر تقييمات مضللة، سباب، ترويج لبرمجيات ضارة، أو كتابة تقييمات مدفوعة لصالح أداة معينة. تحتفظ المنصة بالحق الكامل في شطب أي تعليق يخالف معايير النزاهة والمصداقية.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. إخلاء المسؤولية عن أسعار وخدمات الأطراف الثالثة</h2>
            <p>
              نبذل قصارى جهدنا للحفاظ على تحديث أسعار وخطط أدوات الذكاء الاصطناعي بشكل يومي، إلا أن الشركات المطورة قد تغير أسعارها وميزاتها في أي وقت. لا تتحمل المنصة أي مسؤولية مالية عن أي تغييرات في اشتراكات تلك الأدوات.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // 5. Affiliate Disclosure
  if (type === 'affiliate') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">إفصاح الشفافية الكاملة</span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">إفصاح الروابط التابعة والإعلانات</h1>
          <p className="text-xs text-slate-500 mt-1">وفق معايير الشفافية الدولية وحماية المستهلك</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">ما هي الروابط التابعة (Affiliate Links)؟</h2>
            <p>
              قد تحتوي بعض أزرار وروابط زيارة الأدوات في منصتنا على معرّفات انتساب تابعة (Affiliate Links). هذا يعني أنه في حال نقرك على الرابط وقررت لاحقاً الاشتراك في الخطة المدفوعة للأداة، فقد نحصل على عمولة إحالة تسويقية صغيرة من الشركة المطورة.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">هل يؤثر ذلك على السعر الذي تدفعه؟</h2>
            <p className="font-bold text-slate-900 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900">
              قطعا لا. السعر الذي تدفعه يظل مطابقاً تماماً للسعر الرسمي للأداة، وفي كثير من الأحيان نوفر عبر روابطنا كوبونات خصم حصرية توفر عليك مبالغ إضافية.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">استقلالية التقييم ونزاهة التحرير</h2>
            <p>
              لدينا قاعدة ذهبية غير قابلة للتفاوض: <strong>لا نوصي بأي أداة لا نثق في كفاءتها وقيمتها الحقيقية</strong>. لا يمكن لأي شركة أو مطور شراء تقييم إيجابي أو ترتيب متقدم في قوائمنا ومقارناتنا. إذا كانت الأداة سيئة أو تحتوي على عيوب، فإننا نذكر ذلك صراحة في بند السلبيات (Cons).
            </p>
          </section>
        </div>
      </div>
    );
  }

  // 6. Editorial Policy
  if (type === 'editorial') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">المعايير التحريرية</span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">السياسة التحريرية ومنهجية تقييم الأدوات</h1>
          <p className="text-xs text-slate-500 mt-1">كيف نختبر، نقارن، ونمنح درجات التقييم في دليل الذكاء الاصطناعي</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            تتبع منصة Daleel AI منهجية اختبار قياسية تتكون من 5 محاور رئيسية لتقييم كل أداة أو نموذج لغوي قبل اعتماده:
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">1. دقة الأداء والمخرجات (Performance & Accuracy)</h3>
              <p className="text-xs text-slate-600">اختبار جودة الأكواد، دقة توليد الصور، صحة المعلومات المرجعية، ونسبة الهلوسة (Hallucination).</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">2. دعم اللغة العربية والسياق الثقافي (Arabic NLP Benchmark)</h3>
              <p className="text-xs text-slate-600">قياس البلاغة اللغوية، فهم اللهجات المحكية (الخليجية، المصرية، الشامية)، والتوافق مع الثقافة العربية والإسلامية.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">3. سهولة الاستخدام وتجربة المستخدم (UI/UX)</h3>
              <p className="text-xs text-slate-600">سرعة الاستجابة، سهولة تصدير الأعمال، وتوفر تطبيقات سطح المكتب والهواتف الذكية.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">4. القيمة مقابل السعر (Value for Money)</h3>
              <p className="text-xs text-slate-600">مقارنة ميزات الخطة المجانية بالمدفوعة وما إذا كانت التكلفة مبررة لأصحاب الأعمال والمطورين.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">5. الأمان والخصوصية (Data Privacy)</h3>
              <p className="text-xs text-slate-600">التأكد من عدم تدريب النماذج على بيانات العملاء الحساسة وتوفر سياسات تشفير صارمة.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. Cookie Policy
  if (type === 'cookies') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8" dir="rtl">
        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">ملفات تعريف الارتباط والتتبع</span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">سياسة ملفات تعريف الارتباط (Cookie Policy)</h1>
          <p className="text-xs text-slate-500 mt-1">توضيح شامل لكيفية استخدام ملفات تعريف الارتباط وتقنيات التتبع وفق إرشادات Google</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">ما هي ملفات تعريف الارتباط (Cookies)؟</h2>
            <p>
              ملفات تعريف الارتباط هي ملفات نصية صغيرة تخزن في متصفحك عند زيارة موقعنا لتسهيل تصفحك وتذكر تفضيلاتك وتأمين جلسة حسابك وتحسين تجربة عرض الإعلانات الملائمة.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">ملفات تعريف الارتباط الخاصة بالإعلانات و Google AdSense</h2>
            <p>
              يستخدم موردو الجهات الخارجية، بمن فيهم Google، ملفات تعريف الارتباط لعرض الإعلانات بناءً على زيارات المستخدمين السابقة لمنصتنا أو لمواقع أخرى. تتيح ملفات DART Cookie لشركة Google وشركائها عرض إعلانات مخصصة للمستخدمين بحسب اهتماماتهم.
            </p>
            <p className="text-xs text-slate-500">
              يمكنك تعطيل ملفات الإعلانات المخصصة عبر زيارة <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">إعدادات إعلانات Google</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">أنواع ملفات تعريف الارتباط في موقعنا:</h2>
            <ul className="list-disc pr-6 space-y-2 text-sm">
              <li><strong>ملفات الجلسة الأساسية والأمان (Essential):</strong> ضرورية لحفظ تسجيل الدخول والأمان وتفضيلات الموافقة.</li>
              <li><strong>ملفات التحليل والإحصاءات (Google Analytics 4):</strong> لقياس عدد الزيارات والصفحات الأكثر تفاعلاً لتحسين المحتوى.</li>
              <li><strong>ملفات الإعلانات والتسويق (Google AdSense):</strong> لعرض إعلانات ملائمة ومنع تكرار الإعلانات ذاتها.</li>
              <li><strong>ملفات التفضيلات والواجهة (Preferences):</strong> لحفظ تفضيلات الفلترة والمقارنات السريعة للأدوات.</li>
            </ul>
          </section>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('daleel_cookie_consent');
                  localStorage.removeItem('daleel_consent_mode_v2');
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة تخصيص موافقة ملفات تعريف الارتباط (Consent Settings)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
