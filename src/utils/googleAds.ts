/**
 * Google Ads & Google Analytics Conversion Tracking Utility
 * Manages Google Ads Conversion Tag (AW-XXXXXXX), conversion actions,
 * and outbound click lead generation tracking.
 */

export interface GoogleAdsConfig {
  conversionId: string;       // e.g. "AW-1234567890" or "1234567890"
  conversionLabel: string;    // e.g. "AbC-XYZ_1234567"
  defaultCurrency: string;    // e.g. "USD" or "SAR"
  defaultClickValue: number;  // e.g. 1.0 or 0.5
  enhancedConversions: boolean;
}

const STORAGE_KEY = 'daleel_google_ads_config';

export function getGoogleAdsConfig(): GoogleAdsConfig {
  if (typeof window === 'undefined') {
    return {
      conversionId: '',
      conversionLabel: '',
      defaultCurrency: 'USD',
      defaultClickValue: 1.0,
      enhancedConversions: true,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse Google Ads config from localStorage:', e);
  }

  // Fallback defaults or env settings if available
  const envConversionId = (import.meta as any).env?.VITE_GOOGLE_ADS_CONVERSION_ID || '';
  const envConversionLabel = (import.meta as any).env?.VITE_GOOGLE_ADS_CONVERSION_LABEL || '';

  return {
    conversionId: envConversionId,
    conversionLabel: envConversionLabel,
    defaultCurrency: 'USD',
    defaultClickValue: 1.0,
    enhancedConversions: true,
  };
}

export function saveGoogleAdsConfig(config: GoogleAdsConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('daleel_google_ads_config_updated', { detail: config }));
    
    // Dynamically inject or update gtag config for Google Ads
    initGoogleAdsGtag(config.conversionId);
  } catch (e) {
    console.error('Failed to save Google Ads config:', e);
  }
}

/**
 * Dynamically ensures Google Ads tag is configured in gtag
 */
export function initGoogleAdsGtag(conversionId?: string): void {
  if (typeof window === 'undefined') return;
  const config = conversionId ? { conversionId } : getGoogleAdsConfig();
  const rawId = config.conversionId.trim();
  if (!rawId) return;

  const formattedId = rawId.startsWith('AW-') ? rawId : `AW-${rawId}`;

  // Ensure window.dataLayer & gtag function exist
  (window as any).dataLayer = (window as any).dataLayer || [];
  if (typeof (window as any).gtag !== 'function') {
    (window as any).gtag = function () {
      (window as any).dataLayer.push(arguments);
    };
  }

  // Check if script tag is already in head
  const scriptId = `google-ads-gtag-${formattedId}`;
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${formattedId}`;
    script.async = true;
    document.head.appendChild(script);

    (window as any).gtag('js', new Date());
  }

  // Configure Google Ads ID
  (window as any).gtag('config', formattedId, {
    send_page_view: false,
    allow_enhanced_conversions: true,
  });

  console.info(`[Google Ads Tracking] Initialized Conversion ID: ${formattedId}`);
}

export interface TrackConversionParams {
  toolId?: string;
  toolSlug: string;
  toolName?: string;
  targetUrl: string;
  isAffiliate?: boolean;
  value?: number;
  currency?: string;
}

/**
 * Tracks an outbound click as a Google Ads Conversion + GA4 Event
 */
export function trackGoogleAdsOutboundConversion(params: TrackConversionParams): void {
  if (typeof window === 'undefined') return;

  const config = getGoogleAdsConfig();
  const rawId = config.conversionId.trim();
  const formattedId = rawId ? (rawId.startsWith('AW-') ? rawId : `AW-${rawId}`) : '';
  const label = config.conversionLabel.trim();

  const value = params.value ?? (params.isAffiliate ? 2.5 : config.defaultClickValue);
  const currency = params.currency || config.defaultCurrency || 'USD';
  const transactionId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // 1. Send Google Ads standard conversion event if configured
  if (formattedId && label && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'conversion', {
      send_to: `${formattedId}/${label}`,
      value: value,
      currency: currency,
      transaction_id: transactionId,
      event_category: 'Tool Outbound Lead',
      event_label: params.toolName || params.toolSlug,
    });
  }

  // 2. Send GA4 standard lead generation and outbound click events
  if (typeof (window as any).gtag === 'function') {
    // Standard outbound_click event
    (window as any).gtag('event', 'outbound_click', {
      event_category: 'Outbound Referral',
      event_label: params.toolName || params.toolSlug,
      tool_slug: params.toolSlug,
      tool_name: params.toolName || params.toolSlug,
      target_url: params.targetUrl,
      is_affiliate: !!params.isAffiliate,
      value: value,
      currency: currency,
    });

    // Standard generate_lead conversion event for Google Analytics
    (window as any).gtag('event', 'generate_lead', {
      value: value,
      currency: currency,
      lead_type: params.isAffiliate ? 'affiliate_partner' : 'tool_website_visit',
      tool_name: params.toolName || params.toolSlug,
    });
  }

  // 3. Dispatch client-side custom event
  window.dispatchEvent(
    new CustomEvent('daleel_ad_conversion', {
      detail: {
        ...params,
        value,
        currency,
        transactionId,
        timestamp: new Date().toISOString(),
      },
    })
  );

  // 4. Send to server backend analytics for persistent conversion logging
  try {
    const payload = {
      event_type: 'google_ads_conversion',
      entity_type: 'tool',
      entity_id: params.toolId || null,
      entity_slug: params.toolSlug,
      target_url: params.targetUrl,
      is_affiliate: !!params.isAffiliate,
      conversion_value: value,
      conversion_currency: currency,
      transaction_id: transactionId,
      session_id: sessionStorage.getItem('daleel_visitor_session_id') || 'unknown',
    };

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Ignore silent network tracking errors
  }
}
