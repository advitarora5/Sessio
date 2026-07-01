"use client";

import { SessioLogo } from "@/components/brand/SessioLogo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { validateNewPassword } from "@/lib/utils/password-validation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RecoveryState = "checking" | "ready" | "missing";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recovery, setRecovery] = useState<RecoveryState>("checking");
  const router = useRouter();

  // The recovery session is established by /auth/confirm before we land here.
  // Verify it exists so we can show a useful error instead of a cryptic
  // "Auth session missing!" when the link is stale or opened without a session.
  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setRecovery(data.session ? "ready" : "missing");
    });
    return () => {
      active = false;
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateNewPassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      // Give the user a beat to read the success state, then send them to login.
      setTimeout(() => {
        router.push("/auth/login");
        router.refresh();
      }, 1200);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="items-center text-center">
          <SessioLogo
            className="justify-center"
            markClassName="h-16 w-16 rounded-2xl"
            wordmarkClassName="text-2xl"
            priority
          />
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            {success
              ? "Your password has been updated."
              : "Please enter your new password below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="grid gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                Password updated. Redirecting you to log in…
              </p>
              <Link
                href="/auth/login"
                className="text-sm underline underline-offset-4"
              >
                Go to login now
              </Link>
            </div>
          ) : recovery === "missing" ? (
            <div className="grid gap-4 text-center">
              <p className="text-sm text-destructive">
                This reset link is invalid or has expired. Request a new one to
                continue.
              </p>
              <Link
                href="/auth/forgot-password"
                className="text-sm underline underline-offset-4"
              >
                Send a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password">New password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="New password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Re-enter new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || recovery === "checking"}
                >
                  {isLoading ? "Saving..." : "Save new password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
