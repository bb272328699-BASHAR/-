import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Unsubscribe,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';

export interface FirestoreToolClick {
  id: string;
  toolId?: string;
  toolSlug: string;
  toolName: string;
  targetUrl: string;
  isAffiliate: boolean;
  device: 'desktop' | 'mobile' | 'tablet' | 'other';
  browser: string;
  os: string;
  referrer: string;
  sessionId: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface FirestoreBookmark {
  id: string;
  userId: string;
  toolSlug: string;
  toolName: string;
  createdAt: any;
}

export interface FirestoreReview {
  id: string;
  userId: string;
  user_name: string;
  toolSlug: string;
  rating: number;
  comment: string;
  created_at: any;
}

// User Profile Sync
export async function syncUserProfileToFirestore(user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: string;
}) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    
    if (!existing.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email || '',
        full_name: user.displayName || user.email?.split('@')[0] || 'مستخدم دليل',
        role: user.role || 'user',
        created_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Toggle or Save Bookmark in Firestore
export async function toggleFirestoreBookmark(
  userId: string,
  tool: { slug: string; name: string }
): Promise<boolean> {
  const path = `users/${userId}/bookmarks/${tool.slug}`;
  try {
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', tool.slug);
    const snap = await getDoc(bookmarkRef);

    if (snap.exists()) {
      await deleteDoc(bookmarkRef);
      return false; // Removed
    } else {
      await setDoc(bookmarkRef, {
        userId,
        toolSlug: tool.slug,
        toolName: tool.name,
        createdAt: new Date().toISOString(),
      });
      return true; // Added
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Get User's Firestore Bookmarks
export async function getFirestoreBookmarks(userId: string): Promise<FirestoreBookmark[]> {
  const path = `users/${userId}/bookmarks`;
  try {
    const colRef = collection(db, 'users', userId, 'bookmarks');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Add Review in Firestore
export async function addFirestoreReview(
  userId: string,
  userName: string,
  toolSlug: string,
  rating: number,
  comment: string
): Promise<string> {
  const reviewId = `${userId}_${toolSlug}_${Date.now()}`;
  const path = `reviews/${reviewId}`;
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await setDoc(reviewRef, {
      userId,
      user_name: userName,
      toolSlug,
      rating,
      comment,
      created_at: new Date().toISOString(),
    });
    return reviewId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Get Reviews for Tool from Firestore
export async function getFirestoreReviews(toolSlug: string): Promise<FirestoreReview[]> {
  const path = 'reviews';
  try {
    const colRef = collection(db, 'reviews');
    const q = query(colRef, where('toolSlug', '==', toolSlug));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Submit Contact Message in Firestore
export async function submitFirestoreContact(
  name: string,
  email: string,
  message: string,
  subject?: string
): Promise<string> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const path = `contact_messages/${messageId}`;
  try {
    const msgRef = doc(db, 'contact_messages', messageId);
    await setDoc(msgRef, {
      name,
      email,
      subject: subject || 'استفسار من الموقع',
      message,
      created_at: new Date().toISOString(),
    });
    return messageId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Client contextual metadata extractor
export function extractClientContext() {
  if (typeof window === 'undefined') {
    return {
      device: 'desktop' as const,
      browser: 'Unknown',
      os: 'Unknown',
      referrer: '',
      sessionId: 'server_session',
    };
  }

  const ua = navigator.userAgent || '';
  let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua) || (window.innerWidth >= 768 && window.innerWidth < 1024)) {
    device = 'tablet';
  } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 768) {
    device = 'mobile';
  }

  let browser = 'Other';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome')) browser = 'Google Chrome';
  else if (ua.includes('Safari')) browser = 'Apple Safari';

  let os = 'Other';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iOS')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  let sessionId = sessionStorage.getItem('daleel_visitor_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    sessionStorage.setItem('daleel_visitor_session_id', sessionId);
  }

  return {
    device,
    browser,
    os,
    referrer: document.referrer || '',
    sessionId,
  };
}

/**
 * Smart Firestore Click Tracker: Logs outbound external tool link clicks with contextual metadata
 */
export async function recordFirestoreToolClick(params: {
  toolSlug: string;
  toolName?: string;
  toolId?: string;
  targetUrl: string;
  isAffiliate?: boolean;
}): Promise<string | null> {
  const context = extractClientContext();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const path = `tool_clicks/${clickId}`;

  const clickData: FirestoreToolClick = {
    id: clickId,
    toolId: params.toolId || '',
    toolSlug: params.toolSlug,
    toolName: params.toolName || params.toolSlug,
    targetUrl: params.targetUrl,
    isAffiliate: Boolean(params.isAffiliate),
    device: context.device,
    browser: context.browser,
    os: context.os,
    referrer: context.referrer,
    sessionId: context.sessionId,
    timestamp: Date.now(),
    date: dateStr,
    created_at: now.toISOString(),
  };

  try {
    const clickRef = doc(db, 'tool_clicks', clickId);
    await setDoc(clickRef, clickData);
    return clickId;
  } catch (error) {
    // Non-blocking catch to ensure smooth user navigation
    console.warn('Firestore click tracking recorded locally:', error);
    return null;
  }
}

/**
 * Fetch recent Firestore Outbound Tool Clicks (for Admin Dashboard)
 */
export async function fetchFirestoreToolClicks(maxLimit: number = 100): Promise<FirestoreToolClick[]> {
  const path = 'tool_clicks';
  try {
    const colRef = collection(db, 'tool_clicks');
    // We order by timestamp descending if index permits, or query documents directly
    const q = query(colRef, limit(maxLimit));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as FirestoreToolClick[];
    // Sort in memory by timestamp descending
    return results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Subscribe to Real-Time Firestore Outbound Tool Clicks
 */
export function subscribeToFirestoreToolClicks(
  onUpdate: (clicks: FirestoreToolClick[]) => void,
  maxLimit: number = 50
): Unsubscribe {
  const colRef = collection(db, 'tool_clicks');
  const q = query(colRef, limit(maxLimit));

  return onSnapshot(
    q,
    (snapshot) => {
      const clicks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      })) as FirestoreToolClick[];
      clicks.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate(clicks);
    },
    (error) => {
      console.warn('Firestore clicks subscription warning:', error);
    }
  );
}

// ==========================================
// 1. Price Drop & Deal Alerts System
// ==========================================
export async function createPriceDropAlert(params: {
  toolSlug: string;
  toolName: string;
  email: string;
  targetPriceType?: string;
  discountPreference?: string;
}): Promise<{ success: boolean; id?: string }> {
  const alertId = `deal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `price_alerts/${alertId}`;
  try {
    const alertRef = doc(db, 'price_alerts', alertId);
    await setDoc(alertRef, {
      id: alertId,
      toolSlug: params.toolSlug,
      toolName: params.toolName,
      email: params.email.trim().toLowerCase(),
      targetPriceType: params.targetPriceType || 'Any',
      discountPreference: params.discountPreference || 'Any',
      createdAt: new Date().toISOString()
    });
    return { success: true, id: alertId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return { success: false };
  }
}

// ==========================================
// 2. Custom AI Stack Builder System
// ==========================================
export async function saveCustomStack(params: {
  userId?: string;
  title: string;
  targetRole: string;
  description?: string;
  toolSlugs: string[];
  totalMonthlyCost: number;
  isPublic?: boolean;
}): Promise<{ success: boolean; id?: string }> {
  const stackId = `stack_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `custom_stacks/${stackId}`;
  try {
    const stackRef = doc(db, 'custom_stacks', stackId);
    await setDoc(stackRef, {
      id: stackId,
      userId: params.userId || 'guest',
      title: params.title.trim(),
      targetRole: params.targetRole,
      description: params.description || '',
      toolSlugs: params.toolSlugs,
      totalMonthlyCost: params.totalMonthlyCost,
      isPublic: params.isPublic ?? true,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: stackId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return { success: false };
  }
}

export async function fetchCustomStacks(): Promise<any[]> {
  const path = 'custom_stacks';
  try {
    const colRef = collection(db, 'custom_stacks');
    const q = query(colRef, limit(40));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// ==========================================
// 3. Arabic AI Quality Index System
// ==========================================
export async function createArabicQualityReview(params: {
  toolSlug: string;
  userId?: string;
  userName: string;
  overallScore: number;
  rtlSupportScore: number;
  dialectSupportScore: number;
  grammarScore: number;
  testedUseCase: string;
  sampleOutput?: string;
  verdict: string;
}): Promise<{ success: boolean; id?: string }> {
  const reviewId = `arb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `arabic_reviews/${reviewId}`;
  try {
    const reviewRef = doc(db, 'arabic_reviews', reviewId);
    await setDoc(reviewRef, {
      id: reviewId,
      toolSlug: params.toolSlug,
      userId: params.userId || 'anonymous',
      userName: params.userName.trim(),
      overallScore: params.overallScore,
      rtlSupportScore: params.rtlSupportScore,
      dialectSupportScore: params.dialectSupportScore,
      grammarScore: params.grammarScore,
      testedUseCase: params.testedUseCase,
      sampleOutput: params.sampleOutput || '',
      verdict: params.verdict,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: reviewId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return { success: false };
  }
}

export async function fetchArabicReviewsForTool(toolSlug: string): Promise<any[]> {
  const path = 'arabic_reviews';
  try {
    const colRef = collection(db, 'arabic_reviews');
    const q = query(colRef, where('toolSlug', '==', toolSlug), limit(20));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// ==========================================
// 4. Community Tool Q&A System
// ==========================================
export async function createToolQuestion(params: {
  toolSlug: string;
  userId?: string;
  userName: string;
  question: string;
}): Promise<{ success: boolean; id?: string }> {
  const questionId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `tool_questions/${questionId}`;
  try {
    const qRef = doc(db, 'tool_questions', questionId);
    await setDoc(qRef, {
      id: questionId,
      toolSlug: params.toolSlug,
      userId: params.userId || 'guest',
      userName: params.userName.trim(),
      question: params.question.trim(),
      answersCount: 0,
      answers: [],
      createdAt: new Date().toISOString()
    });
    return { success: true, id: questionId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return { success: false };
  }
}

export async function answerToolQuestion(params: {
  questionId: string;
  userName: string;
  answer: string;
  isStaff?: boolean;
}): Promise<{ success: boolean }> {
  const path = `tool_questions/${params.questionId}`;
  try {
    const qRef = doc(db, 'tool_questions', params.questionId);
    const snap = await getDocs(query(collection(db, 'tool_questions')));
    const docData = snap.docs.find(d => d.id === params.questionId)?.data();
    const existingAnswers = docData?.answers || [];
    const newAnswer = {
      id: `ans_${Date.now()}`,
      userName: params.userName.trim(),
      answer: params.answer.trim(),
      isStaff: Boolean(params.isStaff),
      createdAt: new Date().toISOString()
    };
    await setDoc(qRef, {
      ...docData,
      answers: [...existingAnswers, newAnswer],
      answersCount: existingAnswers.length + 1
    }, { merge: true });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return { success: false };
  }
}

export async function fetchToolQuestions(toolSlug: string): Promise<any[]> {
  const path = 'tool_questions';
  try {
    const colRef = collection(db, 'tool_questions');
    const q = query(colRef, where('toolSlug', '==', toolSlug), limit(25));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// ==========================================
// 5. Real-Time Live Presence System (Active Visitors Heartbeat)
// ==========================================
export interface FirestoreLivePresence {
  id: string;
  sessionId: string;
  pagePath: string;
  pageTitle?: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  lastPing: number; // Unix timestamp ms
  updatedAt: string;
}

export async function updateFirestoreLivePresence(params: {
  sessionId: string;
  pagePath: string;
  pageTitle?: string;
}): Promise<void> {
  if (!params.sessionId) return;
  const context = extractClientContext();
  const presenceId = `pres_${params.sessionId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const presenceRef = doc(db, 'active_presence', presenceId);

  const data: FirestoreLivePresence = {
    id: presenceId,
    sessionId: params.sessionId,
    pagePath: params.pagePath || '/',
    pageTitle: params.pageTitle || '',
    device: context.device,
    browser: context.browser,
    os: context.os,
    lastPing: Date.now(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(presenceRef, data, { merge: true });
  } catch (error) {
    // Silent fail for presence ping
  }
}

export async function removeFirestoreLivePresence(sessionId: string): Promise<void> {
  if (!sessionId) return;
  const presenceId = `pres_${sessionId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const presenceRef = doc(db, 'active_presence', presenceId);
  try {
    await deleteDoc(presenceRef);
  } catch (error) {
    // Silent fail
  }
}

export function subscribeToLivePresence(
  onUpdate: (visitors: FirestoreLivePresence[]) => void
): Unsubscribe {
  const colRef = collection(db, 'active_presence');
  const q = query(colRef, limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const now = Date.now();
      // Filter out stale heartbeats older than 90 seconds
      const activeVisitors = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((v: FirestoreLivePresence) => v.lastPing && (now - v.lastPing < 90000));

      onUpdate(activeVisitors);
    },
    (error) => {
      console.warn('Live presence subscription warning:', error);
    }
  );
}



