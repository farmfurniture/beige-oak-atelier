"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { adminLoginAction, type AdminLoginState } from "@/actions/admin.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: AdminLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={cn(
        "mt-6 h-12 w-full rounded-full bg-primary text-primary-foreground text-sm font-semibold tracking-wide shadow-lg shadow-primary/30 transition-all hover:bg-primary/90",
        pending && "cursor-wait opacity-80",
      )}
      disabled={pending}
    >
      {pending ? "Authenticating…" : "Enter admin console"}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(adminLoginAction, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-100 px-4 py-16">
      <div className="relative z-10 grid max-w-5xl gap-10 lg:grid-cols-2">
        <div className="hidden flex-col justify-center space-y-6 rounded-3xl border border-white/50 bg-white/60 p-10 shadow-xl shadow-primary/10 backdrop-blur lg:flex">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <ShieldCheck className="size-4" />
            Secure access
          </span>
          <h1 className="text-3xl font-semibold text-foreground">
            Beige Oak Atelier Admin
          </h1>
          <p className="text-base text-muted-foreground">
            Manage restorative sleep collections, concierge deliveries, and guest wellness programs from a single,
            carefully crafted console.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground/80">
            <p>Empower your team to:</p>
            <ul className="space-y-1">
              <li>— Track experiential storefront performance</li>
              <li>— Coordinate white-glove logistics globally</li>
              <li>— Respond to members with calming consistency</li>
            </ul>
          </div>
        </div>

        <Card className="relative overflow-hidden rounded-3xl border-none bg-white/90 shadow-2xl shadow-primary/20 backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Administrator sign in
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Use your secure credentials to unlock the atelier command center.
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-muted-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="admin@drbackfit.com"
                  className="h-12 rounded-xl border border-white/60 bg-white/80 text-sm shadow-inner shadow-primary/10 focus-visible:border-primary focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-12 rounded-xl border border-white/60 bg-white/80 text-sm shadow-inner shadow-primary/10 focus-visible:border-primary focus-visible:ring-primary"
                  required
                />
              </div>

              {state?.error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
                  {state.error}
                </div>
              ) : null}

              <SubmitButton />
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Having trouble?{" "}
              <Link href="/contact" className="font-semibold text-primary hover:underline">
                Contact the atelier concierge
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
