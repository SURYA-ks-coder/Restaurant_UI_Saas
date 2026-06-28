"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChefHat,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";
import { App } from "antd";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { action, API } from "@/lib/API";
import { saveAuthData } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validate = () => {
    const next = { email: "", password: "" };

    if (!email.trim()) {
      next.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await action(API.LOGIN, {
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.statusCode === 200) {
        saveAuthData(result);

        message.success("Login successful! Redirecting…");
        await new Promise((resolve) => setTimeout(resolve, 800));
        router.push("/dashboard");
      } else {
        message.error(result?.message || "Invalid email or password");
        setIsLoading(false);
      }
    } catch {
      message.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </span>
            <span className="text-xl font-semibold">Flavor Hub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to access your restaurant dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail
                  className={cn(
                    "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                    errors.email ? "text-destructive" : "text-muted-foreground",
                  )}
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                  }}
                  placeholder="you@example.com"
                  className={cn(
                    "h-12 pl-10",
                    errors.email &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className={cn(
                    "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                    errors.password
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="••••••••"
                  className={cn(
                    "h-12 pl-10 pr-10",
                    errors.password &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground transition-opacity disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Or continue with
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border hover:bg-muted"
          >
            <Fingerprint className="h-4 w-4" />
            Sign in with biometrics
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Flavor Hub?{" "}
            <Link
              href="/dashboard/owner/add-restaurant"
              className="font-medium text-primary hover:underline"
            >
              Create your restaurant
            </Link>
          </p>
        </div>
      </section>

      <section className="hidden items-center justify-center bg-muted/30 p-8 lg:flex">
        <div className="glass-card max-w-lg rounded-lg p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Live dashboard preview
          </div>
          <p className="text-sm text-muted-foreground">Today&apos;s Revenue</p>
          <p className="text-5xl font-bold">$12,847</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <p className="text-2xl font-semibold">24</p>
            </div>
            <div className="rounded-lg bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Tables Occupied</p>
              <p className="text-2xl font-semibold">18/24</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
