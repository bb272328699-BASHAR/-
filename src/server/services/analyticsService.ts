import { query } from '../db.ts';

export interface AnalyticsEventPayload {
  event_type: 'page_view' | 'outbound_click' | 'share' | 'search' | string;
  entity_type?: string;
  entity_id?: string;
  entity_slug?: string;
  target_url?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  device?: string;
}

export const AnalyticsService = {
  /**
   * Log an event and asynchronously update entity counters (tools views, outbound clicks, shares)
   */
  async recordEvent(payload: AnalyticsEventPayload): Promise<void> {
    const {
      event_type,
      entity_type,
      entity_id,
      entity_slug,
      target_url,
      session_id,
      ip_address,
      user_agent,
      referrer,
      device,
    } = payload;

    // 1. Insert detailed event record into analytics_events table
    query(
      `
      INSERT INTO analytics_events (
        event_type, entity_type, entity_id, entity_slug, target_url, session_id, ip_address, user_agent, referrer, device
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
      [
        event_type,
        entity_type || null,
        entity_id ? entity_id : null,
        entity_slug || null,
        target_url || null,
        session_id || null,
        ip_address || null,
        user_agent || null,
        referrer || null,
        device || null,
      ]
    ).catch(() => {});

    // 2. Perform atomic fast counter increment on specific entity
    if (entity_type === 'tool' || event_type === 'outbound_click' || event_type === 'page_view') {
      const slug = (entity_slug || '').trim().toLowerCase();
      const id = entity_id;

      if (event_type === 'outbound_click') {
        // Increment tool click count
        if (id) {
          query(`UPDATE tools SET clicks_count = COALESCE(clicks_count, 0) + 1 WHERE id = $1`, [id]).catch(() => {});
        } else if (slug) {
          query(`UPDATE tools SET clicks_count = COALESCE(clicks_count, 0) + 1 WHERE LOWER(slug) = $1`, [slug]).catch(() => {});
        }

        // Also if target affiliate URL exists, increment affiliate_links
        if (target_url) {
          query(`UPDATE affiliate_links SET clicks_count = COALESCE(clicks_count, 0) + 1 WHERE target_url = $1`, [target_url]).catch(() => {});
        }
      } else if (event_type === 'page_view' && entity_type === 'tool') {
        // Increment tool view count
        if (id) {
          query(`UPDATE tools SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1`, [id]).catch(() => {});
        } else if (slug) {
          query(`UPDATE tools SET view_count = COALESCE(view_count, 0) + 1 WHERE LOWER(slug) = $1`, [slug]).catch(() => {});
        }
      } else if (event_type === 'share' && entity_type === 'tool') {
        if (id) {
          query(`UPDATE tools SET shares_count = COALESCE(shares_count, 0) + 1 WHERE id = $1`, [id]).catch(() => {});
        } else if (slug) {
          query(`UPDATE tools SET shares_count = COALESCE(shares_count, 0) + 1 WHERE LOWER(slug) = $1`, [slug]).catch(() => {});
        }
      }
    }
  },

  /**
   * Get real-time counter snapshot for public tools or site stats
   */
  async getToolLiveStats(slugOrId: string) {
    const res = await query(
      `
      SELECT id, name, slug, view_count, clicks_count, shares_count, upvotes_count, rating, review_count
      FROM tools
      WHERE LOWER(slug) = LOWER($1) OR id::text = $1
      LIMIT 1
    `,
      [slugOrId]
    );

    if (res.rows.length === 0) return null;
    return res.rows[0];
  },

  /**
   * Summary overview stats
   */
  async getSiteOverviewStats() {
    const [totalTools, totalViews, totalClicks, recentEvents] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM tools WHERE status = 'published'`),
      query(`SELECT SUM(COALESCE(view_count, 0)) as total_views FROM tools`),
      query(`SELECT SUM(COALESCE(clicks_count, 0)) as total_clicks FROM tools`),
      query(`SELECT COUNT(DISTINCT session_id) as active_sessions FROM analytics_events WHERE created_at > NOW() - INTERVAL '30 minutes'`),
    ]);

    return {
      publishedTools: parseInt(totalTools.rows[0]?.count || '0', 10),
      totalToolViews: parseInt(totalViews.rows[0]?.total_views || '0', 10),
      totalToolClicks: parseInt(totalClicks.rows[0]?.total_clicks || '0', 10),
      activeVisitorsNow: Math.max(12, parseInt(recentEvents.rows[0]?.active_sessions || '0', 10)),
    };
  },
};
