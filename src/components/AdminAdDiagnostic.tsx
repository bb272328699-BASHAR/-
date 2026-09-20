import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  ShieldCheck, 
  Layers, 
  Maximize2, 
  Code, 
  Sliders, 
  Zap, 
  Globe,
  Info
} from 'lucide-react';

interface AdminAdDiagnosticProps {
  publisherId: string;
}

interface DiagnosticItem {
  id: string;
  tagName: string;
  slotId: string | null;
  client: string | null;
  format: string | null;
  isClientValid: boolean;
  width: number;
  height: number;
  isVisible: boolean;
  status: 'filled' | 'unfilled' | 'pending' | 'blocked';
  location: string;
}

export const AdminAdDiagnostic: React.FC<AdminAdDiagnosticProps> = ({ publisherId }) => {
  const [scanning, setScanning] = useState(false);
  const [slotsFound, setSlotsFound] = useState<DiagnosticItem[]>([]);
  const [autoAdsDetected, setAutoAdsDetected] = useState(false);
  const [adsScriptLoaded, setAdsScriptLoaded] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);

  const runDOMScan = () => {
    setScanning(true);

    setTimeout(() => {
      // 1. Check if AdSense script is in <head>
      const scriptInHead = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
      setAdsScriptLoaded(!!scriptInHead);

      // 2. Check Auto-ads meta tag
      const metaAccount = document.querySelector('meta[name="google-adsense-account"]');
      setAutoAdsDetected(!!metaAccount);

      // 3. Scan for all <ins class="adsbygoogle"> elements
      const insElements = Array.from(document.querySelectorAll('ins.adsbygoogle'));
      const detectedSlots: DiagnosticItem[] = insElements.map((ins, index) => {
        const client = ins.getAttribute('data-ad-client');
        const slot = ins.getAttribute('data-ad-slot');
        const format = ins.getAttribute('data-ad-format') || 'auto';
        const statusAttr = ins.getAttribute('data-ad-status');
        const rect = ins.getBoundingClientRect();
        
        const isClientValid = !!client && (client === publisherId || client.replace(/^ca-/, '') === publisherId.replace(/^ca-/, ''));
        const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(ins).display !== 'none';

        let status: 'filled' | 'unfilled' | 'pending' | 'blocked' = 'pending';
        if (statusAttr === 'filled') status = 'filled';
        else if (statusAttr === 'unfilled') status = 'unfilled';
        else if (isVisible) status = 'filled';
        else status = 'pending';

        // Derive location description from parent / nearby headers
        let location = `موضع إعلاني #${index + 1}`;
        if (ins.closest('article')) location = `داخل المقال (Article)`;
        else if (ins.closest('aside')) location = `الشريط الجانبي (Sidebar)`;
        else if (ins.closest('footer')) location = `البنرات السفلية (Footer/Sticky)`;
        else if (ins.closest('header')) location = `أعلى الصفحة (Header)`;

        return {
          id: `ad-slot-${index + 1}`,
          tagName: ins.tagName.toLowerCase(),
          slotId: slot,
          client: client || 'غير محدد',
          format,
          isClientValid,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isVisible,
          status,
          location
        };
      });

      // 4. Test AdBlocker presence
      const testAd = document.createElement('div');
      testAd.className = 'adsbygoogle ad-zone ad-space';
      testAd.style.position = 'absolute';
      testAd.style.left = '-9999px';
      document.body.appendChild(testAd);
      setAdBlockDetected(testAd.offsetHeight === 0 || window.getComputedStyle(testAd).display === 'none');
      document.body.removeChild(testAd);

      setSlotsFound(detectedSlots);
      setScanning(false);
    }, 400);
  };

  useEffect(() => {
    runDOMScan();
  }, [publisherId]);

  // Toggle DOM Overlay highlights
  const toggleOverlay = () => {
    const nextState = !overlayActive;
    setOverlayActive(nextState);

    const existingOverlays = document.querySelectorAll('.daleel-ad-diagnostic-overlay');
    existingOverlays.forEach(el => el.remove());

    if (nextState) {
      const insElements = document.querySelectorAll('ins.adsbygoogle');
      insElements.forEach((ins, idx) => {
        const rect = ins.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.className = 'daleel-ad-diagnostic-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.width = `${rect.width || 300}px`;
        overlay.style.height = `${rect.height || 90}px`;
        overlay.style.border = '2px dashed #6366f1';
        overlay.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
        overlay.style.zIndex = '99999';
        overlay.style.pointerEvents = 'none';
        overlay.style.borderRadius = '8px';
        overlay.style.boxSizing = 'border-box';
        
        const label = document.createElement('span');
        label.innerText = `🔍 AdSlot #${idx + 1} | ID: ${ins.getAttribute('data-ad-slot') || 'Auto'} | ${Math.round(rect.width)}x${Math.round(rect.height)}px`;
        label.style.position = 'absolute';
        label.style.top = '-22px';
        label.style.right = '0';
        label.style.backgroundColor = '#4338ca';
        label.style.color = '#fff';
        label.style.padding = '2px 8px';
        label.style.fontSize = '10px';
        label.style.fontWeight = 'bold';
        label.style.borderRadius = '4px';
        label.style.fontFamily = 'monospace';

        overlay.appendChild(label);
        document.body.appendChild(overlay);
      });
    }
  };

  const totalValidSlots = slotsFound.filter(s => s.isClientValid).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
              DOM Inspector Overlay Active
            </span>
            <span className="text-xs text-slate-400 font-mono">Publisher ID: {publisherId}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" />
            <span>فاحص ومعاين الإعلانات الحية (Ad Diagnostic Inspector)</span>
          </h2>
          <p className="text-xs text-slate-400">فحص شجرة شفرة DOM المباشرة والتأكد من إنجاكت مساحات الإعلانات ووسم data-ad-client الصحيح</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleOverlay}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              overlayActive ? 'bg-indigo-500 text-white ring-2 ring-indigo-300' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{overlayActive ? 'إخفاء حدود الفحص المباشر' : 'تفعيل الطبقة البصرية للتحقق (Live Overlay)'}</span>
          </button>

          <button
            onClick={runDOMScan}
            disabled={scanning}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>إعادة فحص الـ DOM</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* AdSense Script Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>سكريبت AdSense الرئيسي</span>
            {adsScriptLoaded ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
          </div>
          <div className="text-lg font-black text-slate-900">
            {adsScriptLoaded ? 'محقون بنجاح (Injected)' : 'غير مكتشف'}
          </div>
          <p className="text-[11px] text-slate-500">تم اكتشاف السكريبت في رأس الصفحة `pagead2.googlesyndication.com`</p>
        </div>

        {/* Auto-ads Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>إعلانات التلقائية Auto-ads</span>
            {autoAdsDetected ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
          </div>
          <div className="text-lg font-black text-slate-900">
            {autoAdsDetected ? 'حساب متصل (Account Meta)' : 'وضع المعاينة'}
          </div>
          <p className="text-[11px] text-slate-500">وسم `google-adsense-account` متوافق مع الناشر</p>
        </div>

        {/* DOM Ad Slots Found */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>الوحدات المكتشفة في DOM</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {slotsFound.length} وحدات
          </div>
          <p className="text-[11px] text-slate-500">
            صحيحة المعرف: <strong className="text-emerald-600 font-bold">{totalValidSlots} / {slotsFound.length}</strong>
          </p>
        </div>

        {/* AdBlocker Detection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>حالة أداة حجب الإعلانات</span>
            {adBlockDetected ? <AlertCircle className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
          </div>
          <div className="text-lg font-black text-slate-900">
            {adBlockDetected ? 'مانع إعلانات مفعّل (AdBlock Active)' : 'غير محجوب (Unblocked)'}
          </div>
          <p className="text-[11px] text-slate-500">
            {adBlockDetected ? 'يتم عرض نصوص المعاينة كبديل سلس' : 'جميع طلبات الإعلانات تمر بسلاسة'}
          </p>
        </div>
      </div>

      {/* Inspected Ad Slots Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              <span>فحص شجرة DOM التفصيلية لمواضع الإعلانات</span>
            </h3>
            <p className="text-xs text-slate-500">التحقق من حقول `data-ad-client` و `data-ad-slot` وأبعاد العرض الفعلية</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            Publisher Target: {publisherId}
          </span>
        </div>

        {slotsFound.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold">لم يتم العثور على عناصر إعلانية نشطة في الصفحة الحالية.</p>
            <p className="text-xs text-slate-400">تأكد من تفعيل خيار "تفعيل نظام الإعلانات" في تبويب الإعدادات ثم أعد الفحص.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/60">
                <tr>
                  <th className="p-3.5">اسم الموضع في الصفحة</th>
                  <th className="p-3.5">معرف Publisher (data-ad-client)</th>
                  <th className="p-3.5">معرف Slot ID (data-ad-slot)</th>
                  <th className="p-3.5">الأبعاد بالحجم الطبيعي</th>
                  <th className="p-3.5">مطابقة الناشر</th>
                  <th className="p-3.5">الحالة المباشرة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {slotsFound.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>{item.location}</span>
                    </td>
                    <td className="p-3.5 font-mono text-xs">{item.client}</td>
                    <td className="p-3.5 font-mono font-bold text-indigo-600">{item.slotId || 'تلقائي (Auto)'}</td>
                    <td className="p-3.5 font-mono">
                      {item.width > 0 && item.height > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                          {item.width} × {item.height} px
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">تجاوب ديناميكي / Responsive</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {item.isClientValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> مطابق 100%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> غير مطابق
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-indigo-500" /> جاهز ومحذى
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
