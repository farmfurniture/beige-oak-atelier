"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ConfirmationResult } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRecaptchaVerifier } from "@/hooks/useRecaptchaVerifier";
import { firebaseUsersService } from "@/services/firebase-users.service";
import { normalizeIndianPhone } from "@/lib/phone-utils";

const PHONE_RECAPTCHA_ID = "sign-up-phone-recaptcha";

export default function SignUp() {
  const router = useRouter();
  const { sendEmailLink, sendPhoneOtp } = useAuth();
  const getRecaptchaVerifier = useRecaptchaVerifier(PHONE_RECAPTCHA_ID);

  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agreeToTerms: false,
  });
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [smsRequested, setSmsRequested] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions to continue.");
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      toast.error("Please enter your first and last name.");
      return;
    }

    try {
      setIsSending(true);
      if (contactMethod === "email") {
        if (!formData.email) {
          toast.error("Enter a valid email address.");
          setIsSending(false);
          return;
        }
        const normalizedEmail = formData.email.trim().toLowerCase();
        const existingUser = await checkUserExists({
          email: normalizedEmail,
        });
        if (existingUser) {
          toast.error("An account with this email already exists. Please sign in.");
          setIsSending(false);
          return;
        }
        await sendEmailLink(formData.email, "sign-up", {
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        toast.success("Check your inbox for a one-time sign-up link.");
        return;
      }

      const normalizedPhone = normalizeIndianPhone(formData.phone);
      if (!normalizedPhone || normalizedPhone.length < 4) {
        toast.error("Enter a valid Indian mobile number (we auto-prefix +91).");
        setIsSending(false);
        return;
      }

      const existingUser = await checkUserExists({ phone: normalizedPhone });
      if (existingUser) {
        toast.error("An account with this phone number already exists. Please sign in.");
        setIsSending(false);
        return;
      }

      const verifier = await getRecaptchaVerifier();
      const confirmation = await sendPhoneOtp(normalizedPhone, verifier);
      setConfirmationResult(confirmation);
      setSmsRequested(true);
      setPendingPhoneNumber(normalizedPhone);
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
      const credential = await confirmationResult.confirm(otp);
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      if (fullName) {
        await updateProfile(credential.user, { displayName: fullName });
      }
      await firebaseUsersService.createOrUpdateUser({
        uid: credential.user.uid,
        phone: credential.user.phoneNumber ?? pendingPhoneNumber,
        email: formData.email ? formData.email.trim().toLowerCase() : null,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast.success("Account created successfully!");
      router.push("/account");
    } catch (error) {
      console.error(error);
      toast.error("OTP verification failed. Please try again.");
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
          <h1 className="exo-bold text-3xl text-foreground">Create Account</h1>
          <p className="text-muted-foreground">
            Passwordless sign-up using email or SMS OTP
          </p>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={contactMethod === "email" ? "default" : "outline"}
              onClick={() => {
                setContactMethod("email");
                setSmsRequested(false);
                setConfirmationResult(null);
              }}
            >
              Email OTP
            </Button>
            <Button
              type="button"
              variant={contactMethod === "phone" ? "default" : "outline"}
              onClick={() => {
                setContactMethod("phone");
                setOtp("");
                setSmsRequested(false);
                setConfirmationResult(null);
              }}
            >
              SMS OTP
            </Button>
          </div>

          {contactMethod === "email" ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />
              <p className="text-xs text-muted-foreground">
                Indian numbers are automatically prefixed with +91.
              </p>
            </div>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  agreeToTerms: checked as boolean,
                }))
              }
            />
            <Label
              htmlFor="terms"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full btn-premium"
            size="lg"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send verification"}
          </Button>
          {contactMethod === "email" && (
            <p className="text-xs text-muted-foreground text-center">
              We&apos;ll email a secure link. Open it on this device to finish
              creating your account.
            </p>
          )}
        </form>

        {contactMethod === "phone" && smsRequested && (
          <form onSubmit={handleVerifySms} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((slot) => (
                    <InputOTPSlot key={slot} index={slot} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify & Create Account"}
            </Button>
          </form>
        )}

        <div id={PHONE_RECAPTCHA_ID} className="hidden" />


        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
