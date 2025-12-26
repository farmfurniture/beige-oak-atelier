"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  User as FirebaseUser,
  ConfirmationResult,
  ApplicationVerifier,
} from "firebase/auth";
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "@/config/firebase-client";
import { clientEnv } from "@/config/client-env";

const EMAIL_LINK_STORAGE_KEY = "farmcraft_email_link_data";

export type EmailLinkFlow = "sign-in" | "sign-up";

export type EmailLinkMetadata = {
  firstName?: string;
  lastName?: string;
};

export type PendingEmailLinkData = {
  email: string;
  flow: EmailLinkFlow;
  metadata?: EmailLinkMetadata;
};

interface AuthContextType {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendEmailLink: (
    email: string,
    flow: EmailLinkFlow,
    metadata?: EmailLinkMetadata
  ) => Promise<void>;
  completeEmailLinkSignIn: (email: string, link?: string) => Promise<void>;
  getPendingEmailLinkData: () => PendingEmailLinkData | null;
  clearPendingEmailLinkData: () => void;
  sendPhoneOtp: (
    phoneNumber: string,
    verifier: ApplicationVerifier
  ) => Promise<ConfirmationResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendEmailLink = useCallback(
    async (email: string, flow: EmailLinkFlow, metadata?: EmailLinkMetadata) => {
      const actionCodeSettings = {
        url: `${clientEnv.APP_URL}/auth/verify-email?flow=${flow}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      if (typeof window !== "undefined") {
        const payload: PendingEmailLinkData = { email, flow, metadata };
        window.localStorage.setItem(
          EMAIL_LINK_STORAGE_KEY,
          JSON.stringify(payload)
        );
      }
    },
    []
  );

  const completeEmailLinkSignIn = useCallback(
    async (email: string, link?: string) => {
      const targetLink =
        link ?? (typeof window !== "undefined" ? window.location.href : null);

      if (!targetLink) {
        throw new Error("No verification link detected");
      }

      await signInWithEmailLink(auth, email, targetLink);
    },
    []
  );

  const getPendingEmailLinkData = useCallback(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as PendingEmailLinkData;
    } catch {
      return null;
    }
  }, []);

  const clearPendingEmailLinkData = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
  }, []);

  const sendPhoneOtp = useCallback(
    async (phoneNumber: string, verifier: ApplicationVerifier) => {
      return signInWithPhoneNumber(auth, phoneNumber, verifier);
    },
    []
  );

  const signOutHandler = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sendEmailLink,
        completeEmailLinkSignIn,
        getPendingEmailLinkData,
        clearPendingEmailLinkData,
        sendPhoneOtp,
        signOut: signOutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
