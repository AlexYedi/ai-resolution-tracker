"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-body transition-colors ${
            pathname === item.href
              ? "text-text-primary font-medium"
              : "text-text-muted hover:text-text-body"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
