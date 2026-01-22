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
import { normalizeIndianPhone } from "@/lib/phone-utils";

const PHONE_RECAPTCHA_ID = "sign-in-phone-recaptcha";

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

  const checkUserExists = async (payload: { email?: string; phone?: string }) => {
    const response = await fetch("/api/users/exists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    const data = raw ? (JSON.parse(raw) as { exists?: boolean; error?: string }) : {};

    if (!response.ok) {
      throw new Error(data.error || "Unable to verify account status");
    }

    return Boolean(data.exists);
  };

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
        const existingUser = await checkUserExists({ email: normalizedEmail });
        if (!existingUser) {
          toast.error("No account found for this email. Please create one first.");
          setIsSending(false);
          return;
        }
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

      const existingUser = await checkUserExists({ phone: normalizedPhone });
      if (!existingUser) {
        toast.error("No account found for this phone number. Please sign up first.");
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Beautiful Background Design */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-rose-100 to-orange-100" />

      {/* Large Decorative Gradient Orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-primary/40 to-rose-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute -top-20 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-amber-300/40 to-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute -bottom-40 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-rose-300/35 to-pink-200/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-gradient-to-tl from-primary/35 to-amber-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4.5s' }} />

      {/* Accent Circles */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/25 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-gradient-to-tl from-amber-400/20 to-transparent rounded-full blur-xl" />

      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235a3825' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Decorative Lines */}
      <div className="absolute top-20 left-8 w-48 h-0.5 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent rotate-45" />
      <div className="absolute top-32 right-16 w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-amber-500/10 -rotate-12" />
      <div className="absolute bottom-28 left-16 w-52 h-0.5 bg-gradient-to-r from-rose-400/30 via-rose-400/15 to-transparent rotate-6" />
      <div className="absolute bottom-40 right-10 w-44 h-0.5 bg-gradient-to-r from-transparent via-primary/25 to-primary/10 -rotate-45" />

      {/* Floating Dots */}
      <div className="absolute top-[20%] left-[8%] w-3 h-3 bg-primary/50 rounded-full shadow-lg shadow-primary/20" />
      <div className="absolute top-[35%] left-[12%] w-2 h-2 bg-amber-500/60 rounded-full" />
      <div className="absolute top-[60%] left-[6%] w-2.5 h-2.5 bg-rose-400/50 rounded-full" />
      <div className="absolute top-[25%] right-[10%] w-2 h-2 bg-orange-400/50 rounded-full" />
      <div className="absolute top-[50%] right-[8%] w-3 h-3 bg-primary/45 rounded-full shadow-lg shadow-primary/20" />
      <div className="absolute bottom-[30%] right-[12%] w-2.5 h-2.5 bg-amber-400/55 rounded-full" />
      <div className="absolute bottom-[20%] left-[10%] w-2 h-2 bg-rose-500/45 rounded-full" />

      {/* Decorative Rings */}
      <div className="absolute top-[15%] right-[20%] w-16 h-16 border-2 border-primary/20 rounded-full" />
      <div className="absolute bottom-[25%] left-[15%] w-12 h-12 border-2 border-amber-400/25 rounded-full" />

      <Card className="w-full max-w-md p-8 space-y-6 relative z-10 shadow-2xl shadow-primary/10 backdrop-blur-md bg-white/90 border-white/60 rounded-2xl">
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
