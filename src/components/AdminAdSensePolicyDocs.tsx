import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Cookie, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ExternalLink,
  Info,
  Scale,
  Sparkles
} from 'lucide-react';

export const AdminAdSensePolicyDocs: React.FC = () => {
  const statusCodes = [
    {
      code: '200 OK (Filled Ad Unit)',
      type: 'success',
      title: 'الوحدة الإعلانية ممتلئة بنجاح (Ad Filled)',
      description: 'تم مطابقة الطلب بنجاح مع إعلان ذو أعلى مزايدة مناسب لاستهداف المستخدم.',
      action: 'لا يتطلب أي إجراء - الأداء ممتاز.'
    },
    {
      code: 'Blank / 0-Byte (Unfilled Slot)',
      type: 'warning',
      title: 'وحدة إعلانية فارغة (Unfilled Inventory)',
      description: 'يقوم سكريبت أدسنس بإرجاع عنصر شفاف 0px عند عدم وجود إعلانات مطابقة لشريحة الزائر في لحظة معينة.',
      action: 'تلقائياً يقوم المكون بإخفاء الهامش أو استخدام إعلانات الاستجابة التلقائية لتفادي المساحات المتروكة.'
    },
    {
      code: '403 Forbidden / Disallowed',
      type: 'error',
      title: 'حظر النطاق أو الناشر (Domain / Publisher Restriction)',
      description: 'تظهر في حال عدم إضافة رابط الموقع إلى قائمة المواقع المعتمدة (Sites List) في حساب Google AdSense الرئيسي.',
      action: 'تأكد من فتح حساب AdSense > المواقع (Sites) وإضافة رابط المنصة واعتمادها.'
    },
    {
      code: '429 Rate Limit',
      type: 'warning',
      title: 'تجاوز معدل الطلبات (Request Rate Exceeded)',
      description: 'حدث عند إجراء تنقلات فائقة السرعة بين صفحات تطبيق الـ SPA.',
      action: 'مكونات المنصة تستخدم تقنية الت debounce والتأخير الذكي لمنع تكرار الطلبات.'
    },
    {
      code: 'AdBlocker Detected',
      type: 'info',
      title: 'تم اكتشاف أداة حجب الإعلانات (AdBlock Active)',
      description: 'يقوم متصفح الزائر أو إضافات الحجب بمنع تحميل سكريبت `pagead2.googlesyndication.com`.',
      action: 'المنصة تقوم بإظهار شكل معاينة ناعم ومحافظ على تصميم الصفحة دون تشويه تجربة المستخدم.'
    },
    {
      code: 'Consent Mode V2 Signal Missing',
      type: 'warning',
      title: 'إشارة موافقة الخصوصية مفقودة (Consent Mode V2)',
      description: 'في دول الاتحاد الأوروبي وبريطانيا، يتطلب أدسنس إشارة `ad_storage` و `ad_user_data`.',
      action: 'المنصة مزودة بشريط موافقة الكوكيز (Cookie Banner) مدمج يرسل إشارات TCF v2.2 لجوجل تلقائياً.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30">
              Policy & Technical Documentation
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>دليل أكواد حالات AdSense وسياسات الخصوصية والـ Auto-ads</span>
          </h2>
          <p className="text-xs text-slate-400">مرجع تقني وقانوني شامل لشرح كود الحالة والإعلانات التلقائية والتوافق مع Consent Mode v2</p>
        </div>

        <a
          href="https://support.google.com/adsense"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md"
        >
          <span>مركز مساعدة AdSense الرسمي</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* AdSense Status Codes Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span>جدول أكواد وحالات الاستجابة في Google AdSense</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusCodes.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {item.code}
                </span>
                {item.type === 'success' && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">طبيعي</span>}
                {item.type === 'warning' && <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">ملاحظة</span>}
                {item.type === 'error' && <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">يتطلب إجراء</span>}
                {item.type === 'info' && <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">معلومة</span>}
              </div>

              <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span><strong>التصرف التلقائي:</strong> {item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-ads & Privacy Policy Deep Dive */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>آلية عمل الإعلانات التلقائية (Auto-ads) والتوافق مع سياسات الخصوصية</span>
          </h3>
          <p className="text-xs text-slate-500">كيف يتعامل سكريبت التلقائي من أدسنس مع شريط ملفات تعريف الارتباط ومعايير TCF v2.2</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <Cookie className="w-4 h-4" />
              <span>1. Google Consent Mode v2</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              تقوم المنصة بإرسال إشارات الموافقة المسبقة (`ad_storage` و `ad_user_data` و `ad_personalization`) لجوجل قبل تحميل سكريبت الإعلانات التلقائية لضمان الامتثال التام لقوانين GDPR و CCPA.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>2. الإعلانات غير المخصصة (Non-Personalized Ads)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              عند خيار الزائر برفض ملفات تعريف الارتباط المخصصة، يضبط سكريبت Auto-ads سلوكه تلقائياً لعرض إعلانات سياقية غير مخصصة (Contextual) دون تتبع شخصي للمستخدم.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
              <Scale className="w-4 h-4" />
              <span>3. معايير تجربة المستخدم (CLS & Ads Density)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              تم تحسين كود المنصة لمنع انزياح المحتوى (Cumulative Layout Shift) عند قيام Auto-ads بإدراج بنرات بين الفقرات، مما يحافظ على سرعة وتقييم Google Core Web Vitals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
