"use client";

import { SessioLogo } from "@/components/brand/SessioLogo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const yearOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [role] = useState("STUDENT");
  const [studyFocus, setStudyFocus] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const profilePayload = {
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      major: major.trim(),
      year,
      role,
      study_focus: studyFocus.trim() || null,
    };

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: profilePayload,
        },
      });
      if (error) throw error;

      if (data.session?.user.id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.session.user.id,
            ...profilePayload,
          });

        if (profileError) throw profileError;
      }

      router.push(data.session ? "/dashboard" : "/auth/sign-up-success");
      router.refresh();
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
            tagline="Deep work, mapped."
            priority
          />
          <CardTitle className="text-2xl">Create your Sessio account</CardTitle>
          <CardDescription>
            Add your study context first, then choose your login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="grid gap-7">
              <section className="grid gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0F223A]">
                    Step A - Profile
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This makes your dashboard and friend feed meaningful on day
                    one.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">Full name</Label>
                    <Input
                      id="full-name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="advit_focus"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      required
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">Year</Label>
                    <select
                      id="year"
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="focus-ring h-10 rounded-md border border-input bg-white px-3 text-sm text-card-foreground"
                    >
                      <option value="">Select year</option>
                      {yearOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={role} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="study-focus">Study focus</Label>
                    <Input
                      id="study-focus"
                      value={studyFocus}
                      onChange={(e) => setStudyFocus(e.target.value)}
                      placeholder="CS 225, research, MCAT..."
                    />
                  </div>
                </div>
              </section>

              <section className="grid gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0F223A]">
                    Step B - Credentials
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use these to log in from any browser.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Confirm password</Label>
                  <PasswordInput
                    id="repeat-password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
              </section>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
