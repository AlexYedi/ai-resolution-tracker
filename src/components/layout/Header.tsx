"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const linkClass = (href: string) =>
    `transition-colors ${
      pathname === href
        ? "text-amber font-semibold"
        : "text-text-body hover:text-text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-bold text-text-primary hover:text-amber transition-colors"
        >
          Yedibalian
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-body">
          <Link href="/" className={linkClass("/")}>
            Projects
          </Link>
          {!loading && user && (
            <Link href="/dashboard" className={linkClass("/dashboard")}>
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
                <Link href="/login" className={linkClass("/login")}>
                  Login
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 text-text-body"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-canvas/95 backdrop-blur-sm">
          <nav className="flex flex-col px-4 py-3 gap-3 text-sm font-body">
            <Link
              href="/"
              className={linkClass("/")}
              onClick={() => setMenuOpen(false)}
            >
              Projects
            </Link>
            {!loading && user && (
              <Link
                href="/dashboard"
                className={linkClass("/dashboard")}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {!loading && (
              <>
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="text-left text-text-muted hover:text-text-primary transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className={linkClass("/login")}
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
