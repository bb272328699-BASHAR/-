import { useEffect, useRef } from 'react';
import { trackPageView } from '../utils/analytics.ts';

/**
 * Custom React Hook to track Single Page Application (SPA) route changes
 * and report accurate page views to Google Analytics 4.
 *
 * @param currentPath The current route path (e.g., from state in App.tsx)
 * @param customTitle Optional custom title to attach to the page view
 */
export function usePageTracking(currentPath: string, customTitle?: string) {
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Prevent duplicate triggers if the path hasn't actually changed
    if (previousPathRef.current === currentPath) {
      return;
    }

    previousPathRef.current = currentPath;

    // Slight delay to allow document.title and Meta tags to update
    const timer = setTimeout(() => {
      trackPageView(currentPath, customTitle || document.title);
    }, 120);

    return () => clearTimeout(timer);
  }, [currentPath, customTitle]);

  // Listen for browser forward/backward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname + window.location.search;
      trackPageView(path, document.title);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
