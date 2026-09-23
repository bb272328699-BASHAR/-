import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  const { name, delta, id, rating } = metric;

  // 1. Send to Google Analytics (gtag) if available in window
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
    });
  }

  // 2. Send to internal backend analytics tracker
  try {
    const payload = {
      event_type: 'web_vital',
      metric_name: name,
      metric_delta: delta,
      metric_rating: rating,
      metric_id: id,
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
    // Ignore reporting errors
  }
}

/**
 * Initializes Core Web Vitals performance observers
 */
export function reportWebVitals() {
  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  } catch (err) {
    console.error('Web Vitals reporting error:', err);
  }
}
