"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/config/firebase-client";

/**
 * Lazily creates and caches a Firebase reCAPTCHA verifier instance.
 * Ensures the verifier is cleared on unmount to avoid double-render issues.
 */
export function useRecaptchaVerifier(containerId: string) {
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const getVerifier = useCallback(async () => {
    if (typeof window === "undefined") {
      throw new Error("reCAPTCHA verifier is only available in the browser");
    }

    if (verifierRef.current) {
      return verifierRef.current;
    }

    const { RecaptchaVerifier } = await import("firebase/auth");

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });

    verifierRef.current = verifier;
    await verifier.render();
    return verifier;
  }, [containerId]);

  useEffect(() => {
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, []);

  return getVerifier;
}
