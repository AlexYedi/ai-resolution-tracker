import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-6xl font-black text-amber mb-4">404</h1>
      <h2 className="font-display text-xl font-bold text-text-primary mb-2">
        Page Not Found
      </h2>
      <p className="text-text-muted font-body text-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-amber text-white font-body font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-amber-dark transition-colors"
      >
        <span>←</span>
        Back to Projects
      </Link>
    </div>
  );
}
