/**
 * Google Analytics 4 (GA4) Integration Utilities
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || 'G-DALEELAI26';

/**
 * Safely send a Google Analytics command
 */
export function sendGACommand(...args: any[]) {
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    }
  }
}

/**
 * Tracks a page view in Google Analytics 4
 * @param path The relative path or URL of the page (e.g., /tools/chatgpt)
 * @param title The page title
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined') return;

  const pageTitle = title || document.title || 'دليل الذكاء الاصطناعي | Daleel AI';
  const pageLocation = window.location.href;

  sendGACommand('event', 'page_view', {
    page_path: path,
    page_title: pageTitle,
    page_location: pageLocation,
    send_to: GA_MEASUREMENT_ID,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[GA4 Analytics] 📊 Page View Tracked: ${path} ("${pageTitle}")`);
  }
}

/**
 * Tracks custom user interactions and events
 * @param eventName The standard or custom GA4 event name
 * @param params Event parameters
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  sendGACommand('event', eventName, {
    ...params,
    send_to: GA_MEASUREMENT_ID,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[GA4 Analytics] ⚡ Event: ${eventName}`, params);
  }
}

/**
 * Specialized Tracker: Tool Profile Visits
 */
export function trackToolView(toolSlug: string, toolName: string, category?: string) {
  trackEvent('view_item', {
    item_id: toolSlug,
    item_name: toolName,
    item_category: category || 'AI Tool',
    content_type: 'tool',
  });
}

/**
 * Specialized Tracker: Outbound Affiliate / Website Link Clicks
 */
export function trackOutboundToolClick(toolSlug: string, toolName: string, outboundUrl: string) {
  trackEvent('outbound_click', {
    item_id: toolSlug,
    item_name: toolName,
    link_url: outboundUrl,
  });
}

/**
 * Specialized Tracker: Site Search Queries
 */
export function trackSearchQuery(searchTerm: string, resultCount?: number) {
  if (!searchTerm || searchTerm.trim().length === 0) return;
  trackEvent('search', {
    search_term: searchTerm.trim(),
    results_count: resultCount,
  });
}
