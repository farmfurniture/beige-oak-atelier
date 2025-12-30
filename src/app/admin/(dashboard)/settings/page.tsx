"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  changePasswordAction,
  getAdminProfileAction,
  updateProfilePictureAction,
  updateAdminEmailAction,
  type ActionState
} from "@/actions/admin-settings.actions";
import { Check, Key, Lock, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { ProfileImageUpload } from "@/components/admin/ProfileImageUpload";

function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? "Saving..." : children}
    </Button>
  );
}

export default function AdminSettingsPage() {
  const [passwordState, passwordFormAction] = useFormState<ActionState, FormData>(
    changePasswordAction,
    {}
  );
  const [emailState, emailFormAction] = useFormState<ActionState, FormData>(
    updateAdminEmailAction,
    {}
  );

  const [profile, setProfile] = useState<{ email: string; profilePictureUrl?: string } | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [pictureMessage, setPictureMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getAdminProfileAction().then((p) => {
      setProfile(p);
      if (p?.email) setNewEmail(p.email);
    });
  }, []);

  // Refresh profile after email update
  useEffect(() => {
    if (emailState.success) {
      getAdminProfileAction().then(setProfile);
    }
  }, [emailState.success]);

  const handleProfilePictureUpload = async (url: string) => {
    const formData = new FormData();
    formData.append("imageUrl", url);

    const result = await updateProfilePictureAction({}, formData);

    if (result.success) {
      setPictureMessage({ type: "success", text: result.message || "Profile picture updated!" });
      // Refresh profile
      const updatedProfile = await getAdminProfileAction();
      setProfile(updatedProfile);
    } else {
      setPictureMessage({ type: "error", text: result.error || "Failed to update profile picture" });
    }

    // Clear message after 3 seconds
    setTimeout(() => setPictureMessage(null), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Section */}
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Admin Profile</CardTitle>
              <CardDescription>
                Manage your admin account settings and security
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <ProfileImageUpload
              currentImageUrl={profile?.profilePictureUrl}
              onUpload={handleProfilePictureUpload}
            />

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile?.email || "Loading..."}</span>
              </div>

              {pictureMessage && (
                <p className={`flex items-center gap-2 text-sm ${pictureMessage.type === "success" ? "text-green-600" : "text-destructive"
                  }`}>
                  {pictureMessage.type === "success" && <Check className="h-4 w-4" />}
                  {pictureMessage.text}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email/Username Change Section */}
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Email / Username</CardTitle>
              <CardDescription>
                Update your admin login email address
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={emailFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {emailState.success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                <Check className="h-4 w-4" />
                {emailState.message}
              </div>
            )}
            {emailState.error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {emailState.error}
              </div>
            )}

            <div className="flex justify-end">
              <SubmitButton className="rounded-full bg-blue-600 px-8 text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                Update Email
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Change Password</CardTitle>
              <CardDescription>
                Update your admin password for enhanced security
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={passwordFormAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </div>

            {passwordState.success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                <Check className="h-4 w-4" />
                {passwordState.message}
              </div>
            )}
            {passwordState.error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {passwordState.error}
              </div>
            )}

            <div className="flex justify-end">
              <SubmitButton className="rounded-full bg-primary px-8 text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90">
                Update Password
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Recovery Section */}
      <Card className="rounded-3xl border-none bg-white/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <Mail className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Password Recovery</CardTitle>
              <CardDescription>
                Set up email-based password recovery for your admin account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you ever forget your password, you can reset it via email. Make sure your
            admin email is correctly configured.
          </p>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Email Recovery</p>
              <p className="text-sm text-muted-foreground">
                Reset link will be sent to: {profile?.email || "admin email"}
              </p>
            </div>
            <Link href="/admin/forgot-password">
              <Button variant="outline" className="rounded-full px-6">
                Test Password Reset
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

