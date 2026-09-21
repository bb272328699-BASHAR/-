import React, { useState, useEffect, useRef } from 'react';
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

export interface AdSlotProps {
  position: AdPosition;
  className?: string;
  slotId?: string;
}

export interface AdSettings {
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

// Global tracking to avoid redundant probes
let isGloballyBlocked: boolean | null = typeof window !== 'undefined' && (window as any).__ADSENSE_BLOCKED__ === true ? true : null;

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
  
  // Status: 'loading' | 'filled' | 'unfilled' | 'blocked' | 'error'
  const [adStatus, setAdStatus] = useState<'loading' | 'filled' | 'unfilled' | 'blocked' | 'error'>(
    isGloballyBlocked ? 'blocked' : 'loading'
  );
  
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

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

    const handleBlockedEvent = () => {
      isGloballyBlocked = true;
      setAdStatus('blocked');
    };

    window.addEventListener('daleel_consent_updated', handleConsentEvent);
    window.addEventListener('daleel_ads_blocked', handleBlockedEvent);

    return () => {
      window.removeEventListener('daleel_consent_updated', handleConsentEvent);
      window.removeEventListener('daleel_ads_blocked', handleBlockedEvent);
    };
  }, []);

  const isAdsEnabled = settings?.ads_enabled === 'true' || settings?.ads_enabled === '1' || settings?.ads_enabled === undefined;
  const isAutoAdsEnabled = settings?.ads_auto_ads_enabled === 'true' || settings?.ads_auto_ads_enabled === '1' || settings?.ads_auto_ads_enabled === undefined;
  const isTestMode = settings?.ads_test_mode === 'true';

  // Normalize publisher ID to ensure ca-pub- format
  const rawPublisherId = settings?.ads_publisher_id || 'ca-pub-6343594295307676';
  const cleanPubNumber = rawPublisherId.replace(/^ca-/, '').trim();
  const formattedPublisherId = cleanPubNumber.startsWith('pub-') ? `ca-${cleanPubNumber}` : `ca-pub-${cleanPubNumber}`;
  const isValidPublisher = cleanPubNumber !== 'pub-0000000000000000' && cleanPubNumber.length > 5;

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

  // Fallback to active responsive Ad Unit Slot ID
  if (!slotId) {
    slotId = '9685713922';
  }

  // Load AdSense script dynamically if not already loaded
  useEffect(() => {
    if (!isAdsEnabled || isTestMode || !isValidPublisher) {
      return;
    }

    if ((window as any).__ADSENSE_BLOCKED__) {
      setAdStatus('blocked');
      return;
    }

    const scriptId = 'google-adsense-script';
    let existingScript = document.getElementById(scriptId) as HTMLScriptElement;

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedPublisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      if (isAutoAdsEnabled) {
        script.setAttribute('data-ad-client', formattedPublisherId);
      }
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        isGloballyBlocked = true;
        (window as any).__ADSENSE_BLOCKED__ = true;
        window.dispatchEvent(new CustomEvent('daleel_ads_blocked'));
        setAdStatus('blocked');
      };
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, [isAdsEnabled, isAutoAdsEnabled, isTestMode, formattedPublisherId, isValidPublisher]);

  // Execute AdSense Push and Setup MutationObserver for Status & Error Diagnostics
  useEffect(() => {
    if (!isAdsEnabled || isTestMode || !consentGranted || isGloballyBlocked) {
      return;
    }

    const insElement = insRef.current;
    if (!insElement) return;

    // 1. MutationObserver to catch AdSense status updates (filled vs unfilled)
    const observer = new MutationObserver((mutations) => {
      const statusAttr = insElement.getAttribute('data-ad-status');
      if (statusAttr === 'unfilled') {
        setAdStatus('unfilled');
      } else if (statusAttr === 'filled') {
        setAdStatus('filled');
      }

      // Check for iframe errors inside <ins>
      const iframes = insElement.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.addEventListener('error', () => {
          setAdStatus('error');
          isGloballyBlocked = true;
          window.dispatchEvent(new CustomEvent('daleel_ads_blocked'));
        });
      });
    });

    observer.observe(insElement, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'],
      childList: true,
      subtree: true,
    });

    // 2. Push to adsbygoogle once
    if (!pushedRef.current) {
      pushedRef.current = true;
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.warn('Google AdSense push caught error / AdBlocker detected:', err);
        setAdStatus('blocked');
        isGloballyBlocked = true;
        window.dispatchEvent(new CustomEvent('daleel_ads_blocked'));
      }
    }

    // 3. Safety Fallback Timer:
    // If the ad remains unrendered or blocked by DNS after 3.5 seconds, collapse gracefully
    const fallbackTimer = setTimeout(() => {
      const statusAttr = insElement.getAttribute('data-ad-status');
      if (statusAttr === 'unfilled') {
        setAdStatus('unfilled');
      } else if (adStatus !== 'filled') {
        // Check if there is an iframe with positive height
        const iframe = insElement.querySelector('iframe');
        const hasVisibleContent = insElement.clientHeight > 20 || (iframe && iframe.clientHeight > 20);
        if (!hasVisibleContent) {
          setAdStatus('unfilled');
        }
      }
    }, 3500);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [scriptLoaded, isAdsEnabled, isTestMode, consentGranted, isGloballyBlocked, adStatus]);

  // If ads are disabled globally or consent is denied, render nothing
  if (settings && (!isAdsEnabled || !consentGranted)) {
    return null;
  }

  // If the ad failed, is unfilled, or was blocked by AdBlocker/DNS error, COLLAPSE completely:
  // Zero height, zero margin, zero padding, NO grey box left behind.
  if (adStatus === 'unfilled' || adStatus === 'blocked' || adStatus === 'error') {
    return null;
  }

  // Layout styling applied ONLY when the ad is filled with real content (or in test mode)
  const getLayoutClasses = () => {
    switch (position) {
      case 'article_top':
        return 'w-full my-6 p-3 sm:p-4 bg-gradient-to-r from-amber-50/70 via-indigo-50/40 to-slate-50 border border-slate-200/80 rounded-2xl';
      case 'article_incontent':
        return 'w-full my-8 p-4 sm:p-5 bg-slate-50/90 border border-indigo-100 rounded-2xl shadow-2xs';
      case 'article_bottom':
        return 'w-full my-8 p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-amber-50/40 border border-slate-200/90 rounded-2xl shadow-2xs';
      case 'article_sidebar':
        return 'w-full my-4 p-3 sm:p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs';
      case 'tool_detail':
        return 'w-full my-6 p-4 sm:p-5 bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-slate-50 border border-indigo-100 rounded-2xl shadow-2xs';
      case 'home_banner':
        return 'w-full max-w-7xl mx-auto my-6 sm:my-8 p-3 sm:p-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs';
      case 'sticky_footer':
        return 'fixed bottom-0 right-0 left-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 sm:p-3 shadow-lg';
      default:
        return 'w-full my-4 p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl';
    }
  };

  // Test Mode / Preview Banner Rendering (Used for testing and admin preview)
  if (isTestMode || !isValidPublisher) {
    return (
      <div 
        className={`ad-slot-container ${getLayoutClasses()} ${className}`} 
        data-ad-state="test_mode"
        dir="rtl"
      >
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
                {isValidPublisher ? `Publisher ID: ${formattedPublisherId}` : 'وضع المعاينة والتهيئة الإعلانية'}
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

  // Live Mode:
  // When loading, we use an invisible, zero-padding, zero-border container so that
  // if AdSense fails, it leaves NO empty grey box behind.
  // Once status is 'filled', we wrap it in the polished decorative card.
  const isFilled = adStatus === 'filled';

  return (
    <div
      ref={containerRef}
      className={`ad-slot-container transition-all duration-300 w-full max-w-full overflow-hidden text-center ${
        isFilled ? `${getLayoutClasses()} ${className}` : 'm-0 p-0 border-0 bg-transparent min-h-0'
      }`}
      data-ad-state={adStatus}
      dir="rtl"
    >
      {isFilled && (
        <div className="text-[10px] text-slate-400 font-bold mb-1.5 flex items-center justify-between px-1">
          <span>إعلان</span>
          <Info className="w-3 h-3 text-slate-300" />
        </div>
      )}

      <ins
        ref={insRef}
        className="adsbygoogle block w-full max-w-full"
        data-ad-client={formattedPublisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        style={{ 
          display: 'block',
          minHeight: isFilled ? 'auto' : '0px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};
