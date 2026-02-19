import type { IterationAsset } from "@/lib/types";

type Props = {
  assets: IterationAsset[];
};

export default function AssetGallery({ assets }: Props) {
  if (assets.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4">
        Attachments ({assets.length})
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <a
            key={asset.id}
            href={asset.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            {asset.file_type.startsWith("image/") ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={asset.file_url}
                alt={asset.caption || asset.file_name}
                className="w-full aspect-square object-cover rounded-lg group-hover:ring-2 ring-amber/40 transition-shadow"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-card border border-border flex flex-col items-center justify-center gap-1 group-hover:ring-2 ring-amber/40 transition-shadow">
                <svg
                  className="w-10 h-10 text-rose-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <span className="text-xs text-text-muted truncate max-w-full px-2">
                  PDF
                </span>
              </div>
            )}
            <p className="text-xs text-text-muted text-center mt-1.5 truncate">
              {asset.caption || asset.file_name}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
