"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ConfirmationResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRecaptchaVerifier } from "@/hooks/useRecaptchaVerifier";

const PHONE_RECAPTCHA_ID = "sign-in-phone-recaptcha";

const normalizeIndianPhone = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  const digitsOnly = trimmed.replace(/\D/g, "");
  return `+91${digitsOnly}`;
};

export default function SignIn() {
  const router = useRouter();
  const { sendEmailLink, sendPhoneOtp } = useAuth();
  const getRecaptchaVerifier = useRecaptchaVerifier(PHONE_RECAPTCHA_ID);

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [smsRequested, setSmsRequested] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSending(true);

      if (mode === "email") {
        if (!email) {
          toast.error("Please enter your email address.");
          setIsSending(false);
          return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        await sendEmailLink(normalizedEmail, "sign-in");
        toast.success("Check your inbox for a secure login link.");
        return;
      }

      const normalizedPhone = normalizeIndianPhone(phone);
      if (!normalizedPhone || normalizedPhone.length < 4) {
        toast.error("Enter a valid Indian mobile number (we auto-prefix +91).");
        setIsSending(false);
        return;
      }

      const verifier = await getRecaptchaVerifier();
      const confirmation = await sendPhoneOtp(normalizedPhone, verifier);
      setConfirmationResult(confirmation);
      setSmsRequested(true);
      toast.success("OTP sent to your phone.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to send verification code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifySms = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationResult) {
      toast.error("Please request an OTP first.");
      return;
    }

    if (otp.length < 6) {
      toast.error("Enter the 6-digit OTP sent to your phone.");
      return;
    }

    try {
      setIsVerifying(true);
      await confirmationResult.confirm(otp);
      toast.success("You're signed in!");
      router.push("/account");
    } catch (error) {
      console.error(error);
      toast.error("Invalid or expired OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="exo-bold text-3xl text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">
            Choose email or SMS OTP to sign in securely
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={mode === "email" ? "default" : "outline"}
            onClick={() => {
              setMode("email");
              setConfirmationResult(null);
              setSmsRequested(false);
            }}
          >
            Email OTP
          </Button>
          <Button
            type="button"
            variant={mode === "phone" ? "default" : "outline"}
            onClick={() => {
              setMode("phone");
              setOtp("");
              setConfirmationResult(null);
              setSmsRequested(false);
            }}
          >
            SMS OTP
          </Button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-premium"
              size="lg"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send magic link"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We'll email a one-time login link. Use the same device to open it
              for the fastest experience.
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="9876543210"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Indian numbers are automatically prefixed with +91.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full btn-premium"
                size="lg"
                disabled={isSending}
              >
                {isSending ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>

            {smsRequested && (
              <form onSubmit={handleVerifySms} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <InputOTP
                    id="otp"
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((slot) => (
                        <InputOTPSlot key={slot} index={slot} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify & Sign In"}
                </Button>
              </form>
            )}
            <div id={PHONE_RECAPTCHA_ID} className="hidden" />
          </div>
        )}

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" size="lg">
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            Continue with Apple
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
