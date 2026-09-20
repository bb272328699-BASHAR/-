import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Settings2, 
  Check, 
  Loader2, 
  Sparkles, 
  Layout, 
  ShieldCheck, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  Info, 
  Save, 
  ExternalLink,
  Code
} from 'lucide-react';

interface AdminAdsManagerProps {
  token: string;
}

export const AdminAdsManager: React.FC<AdminAdsManagerProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [adsEnabled, setAdsEnabled] = useState(true);
  const [autoAdsEnabled, setAutoAdsEnabled] = useState(true);
  const [testMode, setTestMode] = useState(true);
  const [publisherId, setPublisherId] = useState('');
  
  const [slotArticleTop, setSlotArticleTop] = useState('');
  const [slotArticleIncontent, setSlotArticleIncontent] = useState('');
  const [slotArticleBottom, setSlotArticleBottom] = useState('');
  const [slotArticleSidebar, setSlotArticleSidebar] = useState('');
  const [slotToolDetail, setSlotToolDetail] = useState('');
  const [slotHomeBanner, setSlotHomeBanner] = useState('');
  const [slotStickyFooter, setSlotStickyFooter] = useState('');
  const [customCode, setCustomCode] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setAdsEnabled(data.ads_enabled === 'true' || data.ads_enabled === '1' || data.ads_enabled === undefined);
          setAutoAdsEnabled(data.ads_auto_ads_enabled === 'true' || data.ads_auto_ads_enabled === '1' || data.ads_auto_ads_enabled === undefined);
          setTestMode(data.ads_test_mode === 'true');
          setPublisherId(data.ads_publisher_id || 'ca-pub-6343594295307676');
          setSlotArticleTop(data.ads_slot_article_top || '9685713922');
          setSlotArticleIncontent(data.ads_slot_article_incontent || '9685713922');
          setSlotArticleBottom(data.ads_slot_article_bottom || '9685713922');
          setSlotArticleSidebar(data.ads_slot_article_sidebar || '9685713922');
          setSlotToolDetail(data.ads_slot_tool_detail || '9685713922');
          setSlotHomeBanner(data.ads_slot_home_banner || '9685713922');
          setSlotStickyFooter(data.ads_slot_sticky_footer || '9685713922');
          setCustomCode(data.ads_custom_code || '');
        }
      })
      .catch((err) => console.error('Error fetching ad settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const settingsArray = [
      { key: 'ads_enabled', value: adsEnabled ? 'true' : 'false' },
      { key: 'ads_auto_ads_enabled', value: autoAdsEnabled ? 'true' : 'false' },
      { key: 'ads_test_mode', value: testMode ? 'true' : 'false' },
      { key: 'ads_publisher_id', value: publisherId.trim() },
      { key: 'ads_slot_article_top', value: slotArticleTop.trim() },
      { key: 'ads_slot_article_incontent', value: slotArticleIncontent.trim() },
      { key: 'ads_slot_article_bottom', value: slotArticleBottom.trim() },
      { key: 'ads_slot_article_sidebar', value: slotArticleSidebar.trim() },
      { key: 'ads_slot_tool_detail', value: slotToolDetail.trim() },
      { key: 'ads_slot_home_banner', value: slotHomeBanner.trim() },
      { key: 'ads_slot_sticky_footer', value: slotStickyFooter.trim() },
      { key: 'ads_custom_code', value: customCode.trim() },
    ];

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: settingsArray }),
      });

      if (res.ok) {
        setMsg({ text: 'تم حفظ إعدادات الإعلانات بنجاح وتحديث المساحات التفاعلية الحية', type: 'success' });
      } else {
        const err = await res.json();
        setMsg({ text: err.error || 'حدث خطأ أثناء حفظ الإعدادات', type: 'error' });
      }
    } catch (e: any) {
      setMsg({ text: e.message || 'تعذر الاتصال بالخادم', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 text-xs font-bold">جاري تحميل إعدادات الشبكات الإعلانية والمساحات...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-50 to-slate-50 border border-amber-200/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">إدارة الإعلانات والمساحات المتجاوبة</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              تكوين معرف الناشر (AdSense Publisher ID) والتحكم الكامل بمساحات الإعلانات الذكية في المقالات والأدوات.
            </p>
          </div>
        </div>

        <a
          href="https://adsense.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-white text-slate-700 hover:text-indigo-600 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200 shadow-2xs transition-colors shrink-0"
        >
          <span>لوحة Google AdSense</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Main Controls & Switches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
          
          {/* Toggle 1: Global Ads Switch */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <span className="font-extrabold text-sm text-slate-900 block">تفعيل نظام الإعلانات الشامل</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                إظهار أو إخفاء كافة المساحات الإعلانية في كامل المنصة.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAdsEnabled(!adsEnabled)}
              className={`p-1.5 rounded-2xl transition-colors cursor-pointer ${
                adsEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {adsEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* Toggle 2: Auto Ads (Google Auto-ads) */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-indigo-200/80 shadow-2xs">
            <div>
              <span className="font-extrabold text-sm text-indigo-950 block">الإعلانات التلقائية (Auto-ads)</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                تفعيل ميزة الذكاء الاصطناعي من قوقل لتوزيع الإعلانات تلقائياً في أنسب المواقع.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAutoAdsEnabled(!autoAdsEnabled)}
              className={`p-1.5 rounded-2xl transition-colors cursor-pointer ${
                autoAdsEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {autoAdsEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* Toggle 3: Test / Preview Mode */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <span className="font-extrabold text-sm text-slate-900 block">وضع المعاينة (Test Mode)</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                عرض بنرات تجريبية أنيقة بدلاً من الإعلانات الحية لضبط المحاذاة.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTestMode(!testMode)}
              className={`p-1.5 rounded-2xl transition-colors cursor-pointer ${
                testMode ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {testMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

        </div>

        {/* Publisher Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">معرف الناشر والحساب (AdSense Config)</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              معرف الناشر في أدسنس (Publisher ID / Client ID) *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              مثال: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-600">ca-pub-1234567890123456</code>. سيتم تضمين السكريبت تلقائياً بأسلوب متوافق مع معايير الأداء والـ SPA.
            </p>
          </div>
        </div>

        {/* Google Consent Mode v2 Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="font-extrabold text-sm text-slate-900">حالة وضع الموافقة (Google Consent Mode v2)</h4>
            </div>
            <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300/60">
              مفعّل ومتوافق مع أدسنس تلقائياً ✓
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            المنصة مهيأة بنظام <strong>Google Consent Mode v2</strong> القياسي. يتم حجب تخزين وتخصيص الإعلانات (<code className="text-emerald-700 font-mono bg-emerald-100/60 px-1 py-0.5 rounded">ad_storage</code> و <code className="text-emerald-700 font-mono bg-emerald-100/60 px-1 py-0.5 rounded">ad_personalization</code>) افتراضياً حتى يمنح الزائر موافقته الصريحة عبر شريط الخصوصية، مما يضمن الامتثال للائحة GDPR وقواعد AdSense الدولية دون الإضرار بالإحصاءات وتوزيع الإعلانات.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 text-[11px]">
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="font-mono text-slate-700">ad_storage</span>
              <span className="font-bold text-emerald-600">ديناميكي حسب الخيار</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="font-mono text-slate-700">ad_user_data</span>
              <span className="font-bold text-emerald-600">ديناميكي حسب الخيار</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="font-mono text-slate-700">ad_personalization</span>
              <span className="font-bold text-emerald-600">ديناميكي حسب الخيار</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="font-mono text-slate-700">security_storage</span>
              <span className="font-bold text-emerald-600">دائم (granted)</span>
            </div>
          </div>
        </div>

        {/* Slot IDs Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">معرفات الوحدات الإعلانية (Ad Slot IDs)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Slot 1: Article Top */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                1. أعلى المقال (Article Top Banner)
              </label>
              <input
                type="text"
                placeholder="مثال: 1234567890"
                value={slotArticleTop}
                onChange={(e) => setSlotArticleTop(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 block">يظهر فوق محتوى المقال مباشرةً تحت الصور التوضيحية</span>
            </div>

            {/* Slot 2: Article In-Content */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                2. منتصف المقال (Article In-Content)
              </label>
              <input
                type="text"
                placeholder="مثال: 2345678901"
                value={slotArticleIncontent}
                onChange={(e) => setSlotArticleIncontent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 block">يظهر بين فقرات المقال والشروحات</span>
            </div>

            {/* Slot 3: Article Bottom (End of Content) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                3. نهاية المقال (Article Bottom / End of Article)
              </label>
              <input
                type="text"
                placeholder="مثال: 2555678901"
                value={slotArticleBottom}
                onChange={(e) => setSlotArticleBottom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 block">يظهر في نهاية المحتوى مباشرة قبل أزرار المشاركة والمقالات ذات الصلة</span>
            </div>

            {/* Slot 4: Article Sidebar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                4. الشريط الجانبي (Sidebar Banner)
              </label>
              <input
                type="text"
                placeholder="مثال: 3456789012"
                value={slotArticleSidebar}
                onChange={(e) => setSlotArticleSidebar(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 block">يظهر في القائمة الجانبية للتفاصيل والبطاقات السريعة</span>
            </div>

            {/* Slot 5: Tool Detail Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                5. صفحة تفاصيل الأداة (Tool Details Banner)
              </label>
              <input
                type="text"
                placeholder="مثال: 4567890123"
                value={slotToolDetail}
                onChange={(e) => setSlotToolDetail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 block">يظهر بين ميزات وتقييمات أداة الذكاء الاصطناعي</span>
            </div>

            {/* Slot 6: Home / Feed Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                6. الصفحة الرئيسية / التجميعات (Feed Banner)
              </label>
              <input
                type="text"
                placeholder="مثال: 5678901234"
                value={slotHomeBanner}
                onChange={(e) => setSlotHomeBanner(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 block">بنر عريض بين أقسام الأدوات الشائعة والتجميعات المميزة</span>
            </div>

            {/* Slot 7: Sticky Footer Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                7. البنر السفلي الثابت (Sticky Bottom Anchor)
              </label>
              <input
                type="text"
                placeholder="مثال: 6789012345"
                value={slotStickyFooter}
                onChange={(e) => setSlotStickyFooter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500 bg-white"
              />
              <span className="text-[10px] text-slate-500 block">بنر تثبيت سفلي شاشات الهواتف والمكتب</span>
            </div>

          </div>
        </div>

        {/* Custom HTML/JS Script Code */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">كود إعلاني مخصص (Custom HTML / Script Backup)</h3>
          </div>

          <textarea
            rows={3}
            placeholder="<!-- أدخل كود شبكة إعلانية مخصصة أو سكريبت مباشر هنا في حال رغبتك بالتحويل من أدسنس -->"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-indigo-500 bg-slate-900 text-emerald-400 placeholder-slate-500"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري حفظ الإعدادات...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات وتفعيل المساحات الإعلانية</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
