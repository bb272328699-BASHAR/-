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
  Check
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>المرجع العربي الرسمي الموثوق</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">عن منصة دليل الذكاء الاصطناعي</h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            المنصة العربية المستقلة الأولى المتخصصة في اختبار وتوثيق ومقارنة أحدث تطبيقات ونماذج الذكاء الاصطناعي.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">رؤيتنا ورسالتنا</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              مع الانفجار الهائل في أدوات الذكاء الاصطناعي عالمياً، أصبح المستخدم العربي يواجه صعوبة بالغة في فرز الأدوات الحقيقية ذات القيمة العالية عن البرمجيات التسويقية المكررة. أُطلقت منصة <strong>دليل الذكاء الاصطناعي (Daleel AI)</strong> عبر نطاقها الرسمي لتكون المرجع التقني المحايد الذي يعتمد على التجربة الميدانية المباشرة والتحليل الموضوعي والبيانات الصادقة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">اختبار ميداني حقيقي</h3>
              <p className="text-xs text-slate-600 leading-relaxed">لا نكتفي بقراءة بيانات المطورين، بل نقوم باشتراك واختبار كل أداة بأوامر عربية ومشاريع واقعية.</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">فحص دعم اللغة العربية</h3>
              <p className="text-xs text-slate-600 leading-relaxed">نقيم دقة المعالجة اللغوية الطبيعية للنصوص واللهجات العربية، والتشكيل، ودعم الاتجاه من اليمين لليسار (RTL).</p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">حيادية وشفافية تامة</h3>
              <p className="text-xs text-slate-600 leading-relaxed">فصل تام وصارم بين فريق التحرير المستقل وأي اتفاقيات إعلانية أو شراكات انتساب.</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">فريق العمل والخبراء:</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              يقود منصة دليل الذكاء الاصطناعي نخبة من مهندسي الحلول السحابية، وخبراء تعلم الآلة (ML)، وصناع المحتوى التقني في المملكة العربية السعودية والإمارات والعالم العربي. يجمع فريقنا بين الخبرة الأكاديمية والعملية في بناء وتطبيق أنظمة الذكاء الاصطناعي في بيئات العمل الحقيقية.
            </p>
          </div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">وثيقة قانونية رسمية</span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">سياسة الخصوصية وحماية البيانات</h1>
          <p className="text-xs text-slate-500 mt-1">آخر تحديث: 18 يناير 2026 | متوافقة مع الأنظمة الوطنية لحماية البيانات الشخصية ومعايير GDPR</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. مقدمة والتزامنا</h2>
            <p>
              تلتزم منصة دليل الذكاء الاصطناعي (Daleel AI) بأعلى معايير الشفافية وحماية البيانات الشخصية لزوارها ومستخدميها المسجلين. توضح هذه الوثيقة ماهية البيانات التي نقوم بجمعها، كيفية معالجتها، وحقوقك الكاملة في تعديلها أو حذفها.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">2. البيانات التي نجمعها</h2>
            <ul className="list-disc pr-6 space-y-1.5 text-sm">
              <li><strong>بيانات الحساب:</strong> عند قيامك بإنشاء حساب، نقوم بجمع اسمك الكامل وعنوان بريدك الإلكتروني وكلمة المرور المشفرة تشفيراً أحادي الاتجاه (Bcrypt Salted Hash).</li>
              <li><strong>بيانات النشاط:</strong> قائمة الأدوات التي قمت بحفظها في المفضلة، والمراجعات والتقييمات التي كتبتها بمحض إرادتك.</li>
              <li><strong>بيانات التواصل:</strong> الاسم والبريد ومحتوى الرسائل الموجهة لفريق الدعم والتحرير عبر نموذج التواصل.</li>
              <li><strong>البيانات التقنية المجهولة:</strong> نوع المتصفح وعنوان IP المشفر لحماية الخوادم من الهجمات الآلية وتحسين سرعة التصفح.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. عدم بيع البيانات لأي طرف ثالث</h2>
            <p>
              نؤكد بشكل قاطع أننا <strong>لا نقوم ولن نقوم ببيع أو تأجير أو مشاركة</strong> أي بيانات شخصية تخص مستخدمينا مع أي جهة إعلانية أو شركة تسويق بيانات تحت أي ظرف كان.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. حقوقك القانونية</h2>
            <p>
              يحق لك في أي وقت طلب نسخة من بياناتك المخزنة، تصحيح أي بيان غير دقيق، أو حذف حسابك بالكامل وجميع مراجعاتك المرتبطة عبر مراسلتنا على: <a href="mailto:privacy@daleel.ai" className="text-indigo-600 font-bold underline dir-ltr">privacy@daleel.ai</a>.
            </p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">ملفات تعريف الارتباط</span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">سياسة ملفات تعريف الارتباط (Cookie Policy)</h1>
          <p className="text-xs text-slate-500 mt-1">توضيح شفاف لكيفية استخدام الكوكيز في المتصفح</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">ما هي ملفات تعريف الارتباط؟</h2>
            <p>
              ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة الموقع لتذكر تفضيلاتك وتأمين جلسة تسجيل دخولك.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">أنواع الكوكيز التي نستخدمها:</h2>
            <ul className="list-disc pr-6 space-y-2 text-sm">
              <li><strong>ملفات الجلسة الأساسية (Essential):</strong> ضرورية لحفظ تسجيل دخولك إلى حسابك وتمكينك من حفظ أدواتك في المفضلة بأمان.</li>
              <li><strong>ملفات تفضيلات الواجهة (Preferences):</strong> تذكر تفضيلات البحث والفرز وموافقتك على إشعارات الخصوصية.</li>
              <li><strong>لا نستخدم ملفات تتبع إعلانية متطفلة (No Third-Party Ad Trackers).</strong></li>
            </ul>
          </section>
        </div>
      </div>
    );
  }

  return null;
};
