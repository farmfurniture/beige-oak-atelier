"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction, type ActionState } from "@/actions/admin-settings.actions";
import { ArrowLeft, Check, Lock, Mail } from "lucide-react";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending..." : "Send Reset Link"}
        </Button>
    );
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useFormState<ActionState, FormData>(
        requestPasswordResetAction,
        {}
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your admin email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {state.success ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3 rounded-lg bg-green-50 p-6 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="font-medium text-green-800">Check Your Email</p>
                                <p className="text-sm text-green-700">{state.message}</p>
                            </div>

                            <Link href="/admin/login">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Admin Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        className="pl-10"
                                        required
                                        autoComplete="email"
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
                    )}

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground text-center">
                            Reset link expires in 1 hour
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
