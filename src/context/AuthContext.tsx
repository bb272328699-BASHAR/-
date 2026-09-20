import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.ts';
import { syncUserProfileToFirestore } from '../lib/firestoreService.ts';

export interface User {
  id: string;
  uid?: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  bookmarksCount: number;
  reviewsCount: number;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (token: string, user: User) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('daleel_user_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('daleel_user_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Sync with Firestore profile
        syncUserProfileToFirestore({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        }).catch((err) => console.error('Firestore profile sync error:', err));
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('daleel_user_token', newToken);
    localStorage.setItem('daleel_user_data', JSON.stringify(newUser));
    // Also set admin token if user is admin
    if (newUser.role === 'admin') {
      localStorage.setItem('daleel_admin_token', newToken);
    }
    closeAuthModal();
    refreshUser(newToken);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Sync with Firestore
      await syncUserProfileToFirestore({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });

      // Synchronize with application session
      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          full_name: fbUser.displayName || fbUser.email?.split('@')[0],
          avatar_url: fbUser.photoURL,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.token, data.user);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل المزامنة مع الخادم');
      }
    } catch (error: any) {
      console.error('Firebase Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Firebase signOut error:', e);
    }
    setToken(null);
    setUser(null);
    setBookmarksCount(0);
    setReviewsCount(0);
    localStorage.removeItem('daleel_user_token');
    localStorage.removeItem('daleel_user_data');
    localStorage.removeItem('daleel_admin_token');
  };

  const refreshUser = async (overrideToken?: string) => {
    const activeToken = overrideToken || token;
    if (!activeToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setBookmarksCount(data.bookmarksCount || 0);
        setReviewsCount(data.reviewsCount || 0);
        localStorage.setItem('daleel_user_data', JSON.stringify(data.user));
      } else if (res.status === 401 || res.status === 403) {
        logout();
      }
    } catch {
      // Offline / network failure, keep cached
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        bookmarksCount,
        reviewsCount,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithGoogle,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
