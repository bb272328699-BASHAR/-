/**
 * Daleel AI Real-time Analytics & Click/View Tracker Client Utility
 * Tracks genuine page views, outbound tool visits, search events, and user engagement
 */

import { recordFirestoreToolClick } from '../lib/firestoreService.ts';
import { trackGoogleAdsOutboundConversion } from './googleAds.ts';

// Generate or retrieve persistent anonymous visitor session ID
export function getVisitorSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sessionId = sessionStorage.getItem('daleel_visitor_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    sessionStorage.setItem('daleel_visitor_session_id', sessionId);
  }
  return sessionId;
}

// Track a real page view (deduplicated per session per path within 10 minutes)
export async function trackPageView(pagePath: string, entityType?: string, entityId?: string, entitySlug?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const currentPath = pagePath || window.location.pathname;
  const cacheKey = `pv_${currentPath}_${entitySlug || ''}`;
  const lastTracked = sessionStorage.getItem(cacheKey);
  const now = Date.now();

  // Don't duplicate ping if tracked in the last 3 minutes in this browser session
  if (lastTracked && now - parseInt(lastTracked, 10) < 3 * 60 * 1000) {
    return;
  }

  sessionStorage.setItem(cacheKey, now.toString());

  try {
    const payload = {
      event_type: 'page_view',
      page_path: currentPath,
      entity_type: entityType || 'page',
      entity_id: entityId || null,
      entity_slug: entitySlug || null,
      session_id: getVisitorSessionId(),
      referrer: document.referrer || null,
      device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
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

// Track Outbound Tool Clicks (Real Click-through rate & external referral with Firestore Persistence)
export async function trackOutboundClick(
  toolId: string, 
  toolSlug: string, 
  targetUrl: string, 
  isAffiliate: boolean = false,
  toolName?: string
): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Log directly to Firestore for live contextual auditing and admin dash
  recordFirestoreToolClick({
    toolId,
    toolSlug,
    toolName: toolName || toolSlug,
    targetUrl,
    isAffiliate
  }).catch(() => {});

  // 1.5. Trigger Google Ads & Google Analytics Conversion Event
  try {
    trackGoogleAdsOutboundConversion({
      toolId,
      toolSlug,
      toolName: toolName || toolSlug,
      targetUrl,
      isAffiliate,
    });
  } catch (err) {
    console.warn('Google Ads Conversion tracking error:', err);
  }

  // 2. Also log to SQL/server backend analytics stream
  try {
    const payload = {
      event_type: 'outbound_click',
      entity_type: 'tool',
      entity_id: toolId,
      entity_slug: toolSlug,
      target_url: targetUrl,
      is_affiliate: isAffiliate,
      session_id: getVisitorSessionId(),
      device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
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
    // Ignore silent network errors
  }
}

// Format numbers nicely (e.g. 1500 -> 1.5k, 25000 -> 25k) in Arabic / English
export function formatMetricCount(num: number | undefined | null): string {
  const n = Number(num || 0);
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return n.toLocaleString('ar-EG');
}
