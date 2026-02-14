"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl font-bold text-text-primary hover:text-amber transition-colors"
        >
          Yedi Balian
        </Link>
        <nav className="flex items-center gap-6 text-sm font-body">
          <Link
            href="/"
            className="text-text-body hover:text-text-primary transition-colors"
          >
            Home
          </Link>
          {!loading && user && (
            <Link
              href="/dashboard"
              className="text-text-body hover:text-text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
          {!loading && (
            <>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
