import { useState, useEffect } from 'react';

const STORAGE_KEY = 'daleel_local_bookmarks';

export function getLocalBookmarks(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function isToolBookmarked(slugOrId: string): boolean {
  const bookmarks = getLocalBookmarks();
  return bookmarks.includes(slugOrId);
}

export function toggleLocalBookmark(slugOrId: string): boolean {
  const bookmarks = getLocalBookmarks();
  let updated: string[];
  let isAdded: boolean;

  if (bookmarks.includes(slugOrId)) {
    updated = bookmarks.filter((id) => id !== slugOrId);
    isAdded = false;
  } else {
    updated = [slugOrId, ...bookmarks];
    isAdded = true;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('daleel_bookmarks_changed'));

    // Send analytics tracking for bookmark action to backend/Firestore
    fetch(`/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: isAdded ? 'bookmark_add' : 'bookmark_remove',
        entity_type: 'tool',
        entity_slug: slugOrId,
        session_id: sessionStorage.getItem('daleel_visitor_session_id') || 'unknown',
      }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    console.warn('Failed to save bookmark', e);
  }

  return isAdded;
}

export function useToolBookmark(slugOrId: string) {
  const [bookmarked, setBookmarked] = useState<boolean>(() => isToolBookmarked(slugOrId));

  useEffect(() => {
    const onChange = () => {
      setBookmarked(isToolBookmarked(slugOrId));
    };
    window.addEventListener('daleel_bookmarks_changed', onChange);
    return () => window.removeEventListener('daleel_bookmarks_changed', onChange);
  }, [slugOrId]);

  const toggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const state = toggleLocalBookmark(slugOrId);
    setBookmarked(state);
    return state;
  };

  return { bookmarked, toggle };
}
