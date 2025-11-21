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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const normalizeIndianPhone = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("+")) {
      return trimmed;
    }
    const digitsOnly = trimmed.replace(/\D/g, "");
    return `+91${digitsOnly}`;
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
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6">
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
