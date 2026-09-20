import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Settings, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { getSavedConsent, saveConsentChoice, ConsentSettings } from '../utils/consent.ts';

interface CookieBannerProps {
  navigate: (path: string) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ navigate }) => {
  const [accepted, setAccepted] = useState<boolean>(true);
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [customConsent, setCustomConsent] = useState<{
    analytics: boolean;
    marketing: boolean;
  }>({
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    const saved = getSavedConsent();
    if (!saved) {
      setAccepted(false);
    }
  }, []);

  const handleAcceptAll = () => {
    saveConsentChoice('all');
    localStorage.setItem('daleel_cookie_consent', 'true');
    setAccepted(true);
  };

  const handleEssentialOnly = () => {
    saveConsentChoice('essential');
    localStorage.setItem('daleel_cookie_consent', 'true');
    setAccepted(true);
  };

  const handleSaveCustom = () => {
    const choice: ConsentSettings = {
      ad_storage: customConsent.marketing ? 'granted' : 'denied',
      ad_user_data: customConsent.marketing ? 'granted' : 'denied',
      ad_personalization: customConsent.marketing ? 'granted' : 'denied',
      analytics_storage: customConsent.analytics ? 'granted' : 'denied',
      personalization_storage: customConsent.marketing ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    };
    saveConsentChoice(choice);
    localStorage.setItem('daleel_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-lg z-50 bg-slate-900/95 text-white p-5 rounded-3xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-400 shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1 text-right space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>إعدادات الخصوصية وملفات تعريف الارتباط</span>
            </h4>
            <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
              Consent Mode v2
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            نحترم خصوصيتك. نستخدم ملفات تعريف الارتباط وتقنيات القياس المعتمدة لتحسين تجربة التصفح، وتحليل الأداء، وتقديم إعلانات ملائمة باحترام كامل لخياراتك الشخصية.
          </p>

          {/* Collapsible custom preferences */}
          {showCustom && (
            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/90 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold">الكوكيز الضرورية والأمان (Security & Core)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">دائماً مفعلة</span>
              </div>
              <p className="text-[11px] text-slate-400">ضرورية لعمل الموقع وتخزين المفضلة والجلسات بأمان.</p>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">ملفات التحليل والإحصاء (Analytics Storage)</span>
                  <span className="text-[10px] text-slate-400">تساعدنا في فهم كيفية استخدام الموقع وتحسين المحتوى.</span>
                </div>
                <input
                  type="checkbox"
                  checked={customConsent.analytics}
                  onChange={(e) => setCustomConsent({ ...customConsent, analytics: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">الإعلانات والتخصيص (AdSense & Personalization)</span>
                  <span className="text-[10px] text-slate-400">تخصيص الإعلانات وفق اهتماماتك لدعم استمرار المنصة.</span>
                </div>
                <input
                  type="checkbox"
                  checked={customConsent.marketing}
                  onChange={(e) => setCustomConsent({ ...customConsent, marketing: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowCustom(!showCustom)}
              className="text-[11px] text-slate-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 transition-colors"
            >
              <Settings className="w-3 h-3" />
              <span>{showCustom ? 'إخفاء التخصيص' : 'تخصيص الخيارات'}</span>
              {showCustom ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <div className="flex items-center gap-2">
              {showCustom ? (
                <button
                  onClick={handleSaveCustom}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  حفظ تفضيلاتي
                </button>
              ) : (
                <>
                  <button
                    onClick={handleEssentialOnly}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                  >
                    الضرورية فقط
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    قبول الكل
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

