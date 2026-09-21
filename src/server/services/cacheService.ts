/**
 * In-Memory & Distributed Cache Manager for Daleel AI Server
 * Provides high-speed caching for database queries and instant cache invalidation
 * on Admin updates (Tools, Categories, Articles, etc.)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

class ServerCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private version: number = Date.now();
  private lastInvalidatedAt: string = new Date().toISOString();

  /**
   * Get cached item or undefined if missing/expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set cached item with TTL in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000, tags: string[] = []): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      tags: [...tags, 'all'],
    });
  }

  /**
   * Wrap an async computation with cache
   */
  async wrap<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000,
    tags: string[] = []
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
      this.set(key, fresh, ttlMs, tags);
    }
    return fresh;
  }

  /**
   * Invalidate cache by exact key
   */
  invalidate(key: string): boolean {
    const existed = this.cache.delete(key);
    this.touchVersion();
    return existed;
  }

  /**
   * Invalidate all cache entries matching any of the provided tags or prefixes
   */
  invalidateByTag(...tags: string[]): { removedCount: number; remainingCount: number; version: number } {
    let removed = 0;
    const tagSet = new Set(tags.map(t => t.toLowerCase().trim()));

    for (const [key, entry] of this.cache.entries()) {
      const matchTag = entry.tags.some(tag => tagSet.has(tag.toLowerCase()));
      const matchKeyPrefix = tags.some(t => key.toLowerCase().includes(t.toLowerCase()));

      if (matchTag || matchKeyPrefix) {
        this.cache.delete(key);
        removed++;
      }
    }

    this.touchVersion();
    console.log(`[Cache Invalidation] Cleared ${removed} cache entries for tags: [${tags.join(', ')}]. Remaining: ${this.cache.size}`);

    return {
      removedCount: removed,
      remainingCount: this.cache.size,
      version: this.version
    };
  }

  /**
   * Specific helper to invalidate all tools cache
   * Cleans tools lists, individual tool slugs, categories, collections, and sitemaps
   */
  invalidateToolsCache(slug?: string): { clearedSlug?: string; version: number; count: number } {
    const tags = ['tools', 'collections', 'sitemap', 'home'];
    if (slug) {
      tags.push(`tool:${slug.toLowerCase()}`);
    }

    const { removedCount, version } = this.invalidateByTag(...tags);
    return {
      clearedSlug: slug,
      version,
      count: removedCount
    };
  }

  /**
   * Clear entire cache
   */
  clearAll(): { clearedCount: number; version: number } {
    const count = this.cache.size;
    this.cache.clear();
    this.touchVersion();
    console.log(`[Cache Invalidation] Cleared all ${count} entries.`);
    return { clearedCount: count, version: this.version };
  }

  /**
   * Get current cache diagnostics & version
   */
  getStats() {
    return {
      size: this.cache.size,
      version: this.version,
      lastInvalidatedAt: this.lastInvalidatedAt,
      keys: Array.from(this.cache.keys()).slice(0, 50)
    };
  }

  private touchVersion() {
    this.version = Date.now();
    this.lastInvalidatedAt = new Date().toISOString();
  }
}

// Export singleton instance
export const serverCache = new ServerCacheManager();
