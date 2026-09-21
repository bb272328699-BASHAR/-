/**
 * Client-Side Cache Invalidation Utility
 * Keeps browser local storage, sessionStorage, and query caches in sync
 * with latest admin updates.
 */

export interface CacheVersionInfo {
  version: number;
  lastInvalidatedAt: string;
  entriesCount?: number;
}

const CACHE_VERSION_KEY = 'daleel_cache_version';

/**
 * Fetch current cache version from server
 */
export async function getRemoteCacheVersion(): Promise<CacheVersionInfo | null> {
  try {
    const res = await fetch('/api/cache/version', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Check if the client-stored cache version is behind the server,
 * and if so, clears outdated client-side caches.
 */
export async function syncClientCache(): Promise<{ updated: boolean; currentVersion: number }> {
  const remote = await getRemoteCacheVersion();
  if (!remote) return { updated: false, currentVersion: 0 };

  const localVersionStr = localStorage.getItem(CACHE_VERSION_KEY);
  const localVersion = localVersionStr ? parseInt(localVersionStr, 10) : 0;

  if (remote.version > localVersion) {
    console.log(`[Cache Sync] Remote version ${remote.version} is newer than local ${localVersion}. Invalidating client caches.`);
    
    // Purge cached tool queries in session or local storage
    clearClientToolCaches();

    localStorage.setItem(CACHE_VERSION_KEY, remote.version.toString());
    return { updated: true, currentVersion: remote.version };
  }

  return { updated: false, currentVersion: localVersion };
}

/**
 * Invalidate tool cache from admin panel or after an edit operation
 * Can also notify other browser tabs via BroadcastChannel or Storage event
 */
export function invalidateClientToolCache(slug?: string): void {
  const newVersion = Date.now();
  localStorage.setItem(CACHE_VERSION_KEY, newVersion.toString());
  clearClientToolCaches(slug);

  // Notify any active tabs to refresh tool lists/details immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('daleel:cache_invalidated', {
      detail: { slug, version: newVersion }
    }));

    try {
      const channel = new BroadcastChannel('daleel_cache_sync');
      channel.postMessage({ type: 'CACHE_INVALIDATED', slug, version: newVersion });
      channel.close();
    } catch (e) {
      // BroadcastChannel may not be available in all iframes
    }
  }
}

/**
 * Clean up specific cache keys
 */
function clearClientToolCaches(slug?: string): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      if (slug) {
        sessionStorage.removeItem(`tool_${slug}`);
      } else {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith('tool_') || key.startsWith('tools_') || key.startsWith('catalog_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => sessionStorage.removeItem(k));
      }
    }
  } catch (e) {
    // Ignore storage quota errors
  }
}

/**
 * Invalidate server-side cache via Admin API
 */
export async function purgeServerCache(token: string, target: 'tools' | 'all' | 'slug' = 'tools', slug?: string): Promise<{ success: boolean; message?: string; result?: any }> {
  try {
    const res = await fetch('/api/admin/cache/purge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ target, slug })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشل تنظيف الكاش');
    }

    // Also invalidate client state
    invalidateClientToolCache(slug);

    return { success: true, message: data.message, result: data.result };
  } catch (err: any) {
    console.error('Error purging cache:', err);
    return { success: false, message: err.message };
  }
}
