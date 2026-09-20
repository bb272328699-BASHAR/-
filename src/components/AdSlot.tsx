import React, { useState, useEffect } from 'react';
import { Sparkles, Info, ExternalLink } from 'lucide-react';
import { getSavedConsent } from '../utils/consent.ts';

export type AdPosition = 
  | 'article_top' 
  | 'article_incontent' 
  | 'article_bottom'
  | 'article_sidebar' 
  | 'tool_detail' 
  | 'home_banner' 
  | 'category_top'
  | 'tools_feed'
  | 'sticky_footer';

interface AdSlotProps {
  position: AdPosition;
  className?: string;
  slotId?: string;
}

interface AdSettings {
  ads_enabled?: string;
  ads_publisher_id?: string;
  ads_auto_ads_enabled?: string;
  ads_slot_article_top?: string;
  ads_slot_article_incontent?: string;
  ads_slot_article_bottom?: string;
  ads_slot_article_sidebar?: string;
  ads_slot_tool_detail?: string;
  ads_slot_home_banner?: string;
  ads_slot_category_top?: string;
  ads_slot_tools_feed?: string;
  ads_slot_sticky_footer?: string;
  ads_test_mode?: string;
  ads_custom_code?: string;
}

let cachedSettings: AdSettings | null = null;
let settingsPromise: Promise<AdSettings> | null = null;

export const fetchAdSettings = async (): Promise<AdSettings> => {
  if (cachedSettings) return cachedSettings;
  if (settingsPromise) return settingsPromise;

  settingsPromise = fetch('/api/settings')
    .then((res) => res.json())
    .then((data) => {
      cachedSettings = data || {};
      return cachedSettings!;
    })
    .catch((err) => {
      console.error('Error fetching ad settings:', err);
      return {};
    });

  return settingsPromise;
};

export const AdSlot: React.FC<AdSlotProps> = ({ position, className = '', slotId: customSlotId }) => {
  const [settings, setSettings] = useState<AdSettings | null>(cachedSettings);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [consentGranted, setConsentGranted] = useState(true);

  useEffect(() => {
    fetchAdSettings().then((s) => setSettings(s));

    const checkConsent = () => {
      const consent = getSavedConsent();
      if (consent) {
        setConsentGranted(consent.ad_storage === 'granted');
      }
    };
    checkConsent();

    const handleConsentEvent = (e: any) => {
      if (e.detail) {
        setConsentGranted(e.detail.ad_storage === 'granted');
      }
    };

    window.addEventListener('daleel_consent_updated', handleConsentEvent);
    return () => window.removeEventListener('daleel_consent_updated', handleConsentEvent);
  }, []);

  const isAdsEnabled = settings?.ads_enabled === 'true' || settings?.ads_enabled === '1';
  const isAutoAdsEnabled = settings?.ads_auto_ads_enabled === 'true' || settings?.ads_auto_ads_enabled === '1' || settings?.ads_auto_ads_enabled === undefined;
  const isTestMode = settings?.ads_test_mode === 'true' || !settings?.ads_publisher_id;
  const publisherId = settings?.ads_publisher_id || 'ca-pub-0000000000000000';

  // Determine slot ID for AdSense
  let slotId = customSlotId;
  if (!slotId && settings) {
    switch (position) {
      case 'article_top':
        slotId = settings.ads_slot_article_top;
        break;
      case 'article_incontent':
        slotId = settings.ads_slot_article_incontent;
        break;
      case 'article_bottom':
        slotId = settings.ads_slot_article_bottom || settings.ads_slot_article_incontent;
        break;
      case 'article_sidebar':
        slotId = settings.ads_slot_article_sidebar;
        break;
      case 'tool_detail':
        slotId = settings.ads_slot_tool_detail;
        break;
      case 'home_banner':
        slotId = settings.ads_slot_home_banner;
        break;
      case 'category_top':
        slotId = settings.ads_slot_category_top || settings.ads_slot_home_banner;
        break;
      case 'tools_feed':
        slotId = settings.ads_slot_tools_feed || settings.ads_slot_article_incontent;
        break;
      case 'sticky_footer':
        slotId = settings.ads_slot_sticky_footer;
        break;
    }
  }

  // Load AdSense script dynamically if publisherId is set and ads are enabled
  useEffect(() => {
    if (!isAdsEnabled || isTestMode || !publisherId || publisherId === 'ca-pub-0000000000000000') {
      return;
    }

    const scriptId = 'google-adsense-script';
    let existingScript = document.getElementById(scriptId) as HTMLScriptElement;

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      if (isAutoAdsEnabled) {
        script.setAttribute('data-ad-client', publisherId);
      }
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, [isAdsEnabled, isAutoAdsEnabled, isTestMode, publisherId]);

  // Push AdSense ad execution when script is ready
  useEffect(() => {
    if (scriptLoaded && isAdsEnabled && !isTestMode) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    }
  }, [scriptLoaded, isAdsEnabled, isTestMode, position]);

  // If ads are completely disabled globally, don't render anything
  if (settings && !isAdsEnabled) {
    return null;
  }

  // Position-specific styling layouts
  const getLayoutClasses = () => {
    switch (position) {
      case 'article_top':
        return 'w-full my-6 p-4 bg-gradient-to-r from-amber-50/70 via-indigo-50/40 to-slate-50 border border-slate-200/80 rounded-2xl';
      case 'article_incontent':
        return 'w-full my-8 p-5 bg-slate-50/90 border border-indigo-100 rounded-2xl shadow-2xs';
      case 'article_bottom':
        return 'w-full my-8 p-5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-amber-50/40 border border-slate-200/90 rounded-2xl shadow-2xs';
      case 'article_sidebar':
        return 'w-full my-4 p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs';
      case 'tool_detail':
        return 'w-full my-6 p-5 bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-slate-50 border border-indigo-100 rounded-2xl shadow-2xs';
      case 'home_banner':
        return 'w-full max-w-7xl mx-auto my-8 p-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs';
      case 'sticky_footer':
        return 'fixed bottom-0 right-0 left-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 sm:p-3 shadow-lg';
      default:
        return 'w-full my-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl';
    }
  };

  // Test Mode / Preview Banner Rendering (Used during test mode or when publisher ID is not live yet)
  if (isTestMode || !slotId) {
    return (
      <div className={`${getLayoutClasses()} ${className}`} dir="rtl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md shrink-0">
              إعلان برعاية
            </span>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">
                مساحة إعلانية متجاوبة ({position})
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {publisherId !== 'ca-pub-0000000000000000' ? `Publisher ID: ${publisherId}` : 'وضع المعاينة والتهيئة الإعلانية'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>احجز مساحتك الإعلانية في دليل الذكاء الاصطناعي</span>
            <ExternalLink className="w-3 h-3 mr-1" />
          </div>
        </div>
      </div>
    );
  }

  // Live AdSense Slot Rendering
  return (
    <div className={`${getLayoutClasses()} ${className} text-center overflow-hidden`} dir="rtl">
      <div className="text-[10px] text-slate-400 font-bold mb-1.5 flex items-center justify-between px-1">
        <span>إعلان</span>
        <Info className="w-3 h-3 text-slate-300" />
      </div>
      <ins
        className="adsbygoogle block"
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        style={{ display: 'block' }}
      />
    </div>
  );
};
