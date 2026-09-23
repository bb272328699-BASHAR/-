import { useEffect } from 'react';
import { getVisitorSessionId } from '../utils/analytics.ts';
import { updateFirestoreLivePresence, removeFirestoreLivePresence } from '../lib/firestoreService.ts';

/**
 * Custom React Hook that maintains live active visitor presence via Firestore & Heartbeat
 */
export function useRealtimePresence(currentPath: string, pageTitle?: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionId = getVisitorSessionId();
    let heartbeatInterval: any = null;

    const pingPresence = () => {
      if (document.visibilityState === 'visible') {
        updateFirestoreLivePresence({
          sessionId,
          pagePath: currentPath || window.location.pathname,
          pageTitle: pageTitle || document.title,
        }).catch(() => {});
      }
    };

    // 1. Initial Ping
    pingPresence();

    // 2. Heartbeat Ping every 25 seconds
    heartbeatInterval = setInterval(pingPresence, 25000);

    // 3. Handle Visibility Change (when user switches tabs or returns)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingPresence();
      }
    };

    // 4. Handle Window Unload / Exit
    const handleUnload = () => {
      removeFirestoreLivePresence(sessionId).catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentPath, pageTitle]);
}
