import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp, 
  FirebaseUser 
} from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Fetch or create user profile
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            const updates: any = { lastLogin: Timestamp.now() };
            
            // Ensure default admin always has admin role
            if (firebaseUser.email?.toLowerCase() === "yttech4u2022@gmail.com" && data.role !== 'admin') {
              updates.role = 'admin';
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), updates, { merge: true });
            setProfile({ ...data, ...updates });
          } else {
            // Create new profile
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'user', // Default role
              createdAt: Timestamp.now(),
              lastLogin: Timestamp.now(),
              totalSpent: 0,
              orderCount: 0
            };
            
            // Special case for default admin
            if (firebaseUser.email?.toLowerCase() === "yttech4u2022@gmail.com") {
              newProfile.role = 'admin';
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error in AuthProvider:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === "yttech4u2022@gmail.com";
  const isManager = isAdmin || profile?.role === 'manager';
  const isStaff = isManager || profile?.role === 'staff';

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isManager,
    isStaff,
    signIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
