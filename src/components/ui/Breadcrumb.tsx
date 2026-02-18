import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-sm text-text-muted font-body mb-6">
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-amber transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-body">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
