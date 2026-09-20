const UPVOTES_STORAGE_KEY = 'daleel_upvoted_tools';

export const getLocalUpvotes = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(UPVOTES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const hasUserUpvoted = (toolId: string): boolean => {
  const upvoted = getLocalUpvotes();
  return upvoted.includes(toolId);
};

export const setLocalUpvote = (toolId: string, isUpvoted: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    const current = new Set(getLocalUpvotes());
    if (isUpvoted) {
      current.add(toolId);
    } else {
      current.delete(toolId);
    }
    localStorage.setItem(UPVOTES_STORAGE_KEY, JSON.stringify(Array.from(current)));
    window.dispatchEvent(new CustomEvent('daleel_upvotes_updated', { detail: { toolId, isUpvoted } }));
  } catch {
    // Ignore storage quota errors
  }
};

export const toggleToolUpvote = async (toolId: string): Promise<{ success: boolean; upvoted: boolean; count: number }> => {
  const currentlyUpvoted = hasUserUpvoted(toolId);
  const nextAction = currentlyUpvoted ? 'unvote' : 'upvote';

  try {
    const token = localStorage.getItem('daleel_user_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`/api/tools/${toolId}/upvote`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: nextAction }),
    });

    if (res.ok) {
      const data = await res.json();
      setLocalUpvote(toolId, data.upvoted);
      return {
        success: true,
        upvoted: data.upvoted,
        count: data.upvotes_count,
      };
    }
  } catch (err) {
    console.warn('Upvote network error, applying local optimistic state', err);
  }

  // Optimistic fallback if network is slow or offline
  const newStatus = !currentlyUpvoted;
  setLocalUpvote(toolId, newStatus);
  return {
    success: true,
    upvoted: newStatus,
    count: newStatus ? 1 : 0,
  };
};
