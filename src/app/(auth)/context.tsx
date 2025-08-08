
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
} from 'firebase/auth';
import { app, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithPhoneNumber: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult | undefined>;
  verifyOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<any>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithPhoneNumber: async () => undefined,
  verifyOtp: async () => {},
  updateUserProfile: async () => {},
});


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    
    // Handle redirect result for popup flows
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          // The signed-in user info.
          const user = result.user;
          setUser(user);
          router.push('/dashboard');
        }
      }).catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Google Sign-In Error',
            description: error.message,
          });
      }).finally(() => {
        setLoading(false);
      });

    return () => unsubscribe();
  }, [router, toast]);

  const signUp = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };
  
  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const logOut = () => {
    return signOut(auth);
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const doSignInWithPhoneNumber = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error("Error during phone number sign-in:", error);
      toast({
        variant: 'destructive',
        title: 'Phone Sign-In Error',
        description: error.message,
      });
      // This is often due to an invalid phone number or reCAPTCHA issue.
      // Reset the reCAPTCHA to allow the user to try again.
      // @ts-ignore
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer && window.grecaptcha && appVerifier.widgetId !== undefined) {
         window.grecaptcha.reset(appVerifier.widgetId);
      }
      return undefined;
    }
  };

  const verifyOtp = (confirmationResult: ConfirmationResult, otp: string) => {
    return confirmationResult.confirm(otp);
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, updates);
      // Create a new user object to force re-render
      setUser(auth.currentUser ? { ...auth.currentUser } : null);
    } else {
      throw new Error("No user is signed in to update.");
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut: logOut,
    signInWithGoogle,
    signInWithPhoneNumber: doSignInWithPhoneNumber,
    verifyOtp,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
