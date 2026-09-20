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
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';

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
