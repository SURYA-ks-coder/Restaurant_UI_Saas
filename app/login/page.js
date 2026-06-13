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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { action, API } from "@/lib/API";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await action(API.LOGIN, { email, password });

      if (result?.statusCode === 200) {
        localStorage.setItem(
          "accessToken",
          JSON.stringify(result?.data?.tokens?.accessToken),
        );
        localStorage.setItem(
          "branchIds",
          JSON.stringify(result?.data?.user?.defaultBranchId),
        );
        localStorage.setItem(
          "restaurantId",
          JSON.stringify(result?.data?.user?.restaurantId),
        );
        localStorage.setItem(
          "refreshToken",
          JSON.stringify(result?.data?.tokens?.refreshToken),
        );
        localStorage.setItem("userData", JSON.stringify(result?.data?.user));
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 700));
        router.push("/dashboard");
      }
    } catch (error) {}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Or continue with
            <span className="h-px flex-1 bg-border" />
          </div>

          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border hover:bg-muted">
            <Fingerprint className="h-4 w-4" />
            Sign in with biometrics
          </button>
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
