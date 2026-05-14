import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to set persistence early
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        console.warn("Auth persistence could not be explicitly set, using default:", err);
      }
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    initAuth().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      // Small delay to ensure any transient browser blockages are cleared
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Forces the account selection to ensure fresh state
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Detailed Login Error:", error);
      
      let message = "Uplink failed. ";
      
      if (error.code === 'auth/internal-error') {
        message += "Internal Auth Error. This usually happens if popups or third-party cookies are blocked by your browser. Please ensure you are not in Incognito mode and popups are allowed for this site.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = "Authentication cancelled. Please complete the sign-in process.";
        return; // Don't alert if they just closed it
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = "Multiple sign-in attempts detected. Please try again.";
      } else {
        message += error.message || "Unknown error occurred.";
      }

      alert(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
