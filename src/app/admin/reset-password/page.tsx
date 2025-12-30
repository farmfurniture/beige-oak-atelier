"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resetPasswordWithTokenAction, type ActionState } from "@/actions/admin-settings.actions";
import { ArrowLeft, Check, Key, Lock } from "lucide-react";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Resetting..." : "Reset Password"}
        </Button>
    );
}

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [state, formAction] = useFormState<ActionState, FormData>(
        resetPasswordWithTokenAction,
        {}
    );

    if (!token) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 rounded-lg bg-destructive/10 p-6 text-center">
                    <p className="font-medium text-destructive">Invalid Reset Link</p>
                    <p className="text-sm text-muted-foreground">
                        This password reset link is invalid or has expired.
                    </p>
                </div>

                <Link href="/admin/forgot-password">
                    <Button variant="outline" className="w-full">
                        Request New Reset Link
                    </Button>
                </Link>
            </div>
        );
    }

    if (state.success) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 rounded-lg bg-green-50 p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="font-medium text-green-800">Password Reset Complete</p>
                    <p className="text-sm text-green-700">{state.message}</p>
                </div>

                <Link href="/admin/login">
                    <Button className="w-full">
                        Go to Login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />

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
                        autoComplete="new-password"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                        autoComplete="new-password"
                    />
                </div>
            </div>

            {state.error && (
                <p className="text-sm text-destructive text-center">{state.error}</p>
            )}

            <SubmitButton />

            <div className="text-center">
                <Link
                    href="/admin/login"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="inline-block mr-1 h-3 w-3" />
                    Back to Login
                </Link>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Key className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground text-center">
                            Password must be at least 8 characters
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
