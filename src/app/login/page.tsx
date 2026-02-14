"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <div className="bg-card rounded-xl p-8 shadow-warm border border-border">
        <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
          Admin Login
        </h1>
        <p className="text-sm text-text-muted mb-8 font-body">
          Sign in to manage your AI Resolution progress.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-body mb-1.5 font-body"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-paper px-4 py-2.5 text-sm text-text-primary font-body placeholder:text-text-caption focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-body mb-1.5 font-body"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-paper px-4 py-2.5 text-sm text-text-primary font-body placeholder:text-text-caption focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-sm text-rose font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber px-4 py-2.5 text-sm font-medium text-white font-body hover:bg-amber-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
