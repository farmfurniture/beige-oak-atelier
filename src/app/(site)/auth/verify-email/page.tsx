"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth, type PendingEmailLinkData } from "@/context/AuthContext";
import { auth } from "@/config/firebase-client";
import { isSignInWithEmailLink, updateProfile } from "firebase/auth";
import { firebaseUsersService } from "@/services/firebase-users.service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    completeEmailLinkSignIn,
    getPendingEmailLinkData,
    clearPendingEmailLinkData,
  } = useAuth();
  
  const flow = searchParams.get("flow");
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [needsEmailInput, setNeedsEmailInput] = useState(false);
  const [needsProfileInput, setNeedsProfileInput] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLinkValid, setIsLinkValid] = useState(false);

  const handleCompletion = useCallback(
    async (
      emailAddress: string, 
      storedData?: PendingEmailLinkData | null,
      manualProfile?: { firstName: string; lastName: string }
    ) => {
      if (!emailAddress) {
        toast.error("Please enter your email address to continue.");
        return;
      }
      
      // If we need profile input but it's missing, don't proceed
      if (needsProfileInput && (!manualProfile?.firstName || !manualProfile?.lastName)) {
         toast.error("Please enter your name to complete sign up.");
         return;
      }

      try {
        setIsProcessing(true);
        const currentLink =
          typeof window !== "undefined" ? window.location.href : undefined;
        await completeEmailLinkSignIn(emailAddress, currentLink);

        // Determine names: prefer manual input, then stored metadata
        const finalFirstName = manualProfile?.firstName ?? storedData?.metadata?.firstName;
        const finalLastName = manualProfile?.lastName ?? storedData?.metadata?.lastName;

        if (finalFirstName || finalLastName) {
          const fullName = `${finalFirstName ?? ""} ${finalLastName ?? ""}`
            .trim()
            .replace(/\s+/g, " ");
          if (fullName && auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: fullName });
          }
        }

        if (auth.currentUser) {
          await firebaseUsersService.createOrUpdateUser({
            uid: auth.currentUser.uid,
            email: auth.currentUser.email ?? emailAddress,
            firstName: finalFirstName,
            lastName: finalLastName,
          });
        }

        clearPendingEmailLinkData();
        toast.success("Email verified! You're signed in.");
        router.replace("/account");
      } catch (verificationError) {
        console.error(verificationError);
        setError(
          "We couldn't verify this link. Request a new code and try again."
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [clearPendingEmailLinkData, completeEmailLinkSignIn, router, needsProfileInput]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setError("This verification link is invalid or has expired.");
      return;
    }

    setIsLinkValid(true);

    const stored = getPendingEmailLinkData();
    const isSignUp = flow === "sign-up";
    const hasMetadata = !!stored?.metadata?.firstName;

    if (stored?.email) {
      setEmail(stored.email);
      
      // If it's a sign-up flow but we lost the metadata (cross-device), ask for it
      if (isSignUp && !hasMetadata) {
        setNeedsProfileInput(true);
      } else {
        // We have everything (or it's just sign-in), proceed automatically
        handleCompletion(stored.email, stored);
      }
    } else {
      // Missing email (cross-device)
      setNeedsEmailInput(true);
      if (isSignUp) {
        setNeedsProfileInput(true);
      }
    }
  }, [getPendingEmailLinkData, handleCompletion, flow]);

  if (!isLinkValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Verification link invalid
          </h1>
          <p className="text-muted-foreground">
            The link you followed is no longer valid. Please request a new login
            link.
          </p>
          <Button asChild className="w-full">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const showForm = needsEmailInput || needsProfileInput;

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="exo-bold text-3xl text-foreground">
            Complete verification
          </h1>
          <p className="text-muted-foreground">
            {flow === "sign-up"
              ? "Confirm your details to finish creating your account."
              : "Confirm your email to sign back in."}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {showForm ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleCompletion(email, null, { firstName, lastName });
            }}
            className="space-y-4"
          >
            {needsEmailInput && (
              <div className="space-y-2">
                <Label htmlFor="email">Confirm your email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            )}
            
            {needsProfileInput && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We&apos;re verifying your link automatically…
            </p>
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            Didn&apos;t mean to trigger this?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Request a new link
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
