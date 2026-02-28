"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createIterationAsset,
  updateAssetCaption,
  deleteIterationAsset,
} from "@/lib/actions";
import type { IterationAsset } from "@/lib/types";

function fileTypeLabel(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "text/markdown": "MD",
    "text/plain": "TXT",
    "text/csv": "CSV",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
    "application/vnd.ms-powerpoint": "PPT",
  };
  return map[mimeType] ?? mimeType.split("/").pop()?.toUpperCase() ?? "FILE";
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/markdown",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/msword",
];

type UploadingFile = {
  id: string;
  name: string;
  progress: number;
  error?: string;
};

type Props = {
  iterationId: string;
  existingAssets: IterationAsset[];
};

export default function AssetUploader({ iterationId, existingAssets }: Props) {
  const [assets, setAssets] = useState<IterationAsset[]>(existingAssets);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const tempId = `upload-${Date.now()}-${Math.random()}`;

      // Validate
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploading((prev) => [
          ...prev,
          { id: tempId, name: file.name, progress: 0, error: "Unsupported file type" },
        ]);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploading((prev) => [
          ...prev,
          { id: tempId, name: file.name, progress: 0, error: "File exceeds 25MB limit" },
        ]);
        return;
      }

      setUploading((prev) => [...prev, { id: tempId, name: file.name, progress: 10 }]);

      try {
        const supabase = createClient();
        const safeName = file.name
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .replace(/_+/g, "_");
        const storagePath = `${iterationId}/${Date.now()}-${safeName}`;

        setUploading((prev) =>
          prev.map((u) => (u.id === tempId ? { ...u, progress: 30 } : u))
        );

        const { error: uploadError } = await supabase.storage
          .from("iteration-assets")
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        setUploading((prev) =>
          prev.map((u) => (u.id === tempId ? { ...u, progress: 70 } : u))
        );

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("iteration-assets")
          .getPublicUrl(storagePath);

        // Save metadata via server action
        const result = await createIterationAsset({
          iterationId,
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });

        if ("error" in result) throw new Error(result.error);

        setUploading((prev) =>
          prev.map((u) => (u.id === tempId ? { ...u, progress: 100 } : u))
        );

        // Add to local assets list
        const newAsset: IterationAsset = {
          id: result.id,
          iteration_id: iterationId,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          caption: null,
          sort_order: assets.length,
          created_at: new Date().toISOString(),
        };

        setAssets((prev) => [...prev, newAsset]);

        // Remove from uploading after a brief delay
        setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.id !== tempId));
        }, 800);
      } catch (err) {
        setUploading((prev) =>
          prev.map((u) =>
            u.id === tempId
              ? { ...u, progress: 0, error: err instanceof Error ? err.message : "Upload failed" }
              : u
          )
        );
      }
    },
    [iterationId, assets.length]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach(uploadFile);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleCaptionBlur = useCallback(
    async (assetId: string, caption: string) => {
      await updateAssetCaption(assetId, caption);
    },
    []
  );

  const handleDelete = useCallback(async (assetId: string) => {
    if (!window.confirm("Delete this file?")) return;

    // Optimistic removal
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    const result = await deleteIterationAsset(assetId);
    if ("error" in result) {
      // Revert would require refetch — for now just show alert
      alert(`Failed to delete: ${result.error}`);
    }
  }, []);

  const dismissError = useCallback((id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-text-muted font-bold mb-2">
        Attachments
      </label>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-amber bg-amber-wash/50"
            : "border-border hover:border-amber/50"
        }`}
      >
        <p className="text-sm text-text-muted font-body">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-text-caption mt-1">
          PNG, JPG, GIF, WebP, PDF, Markdown, CSV, Word, Excel, PowerPoint &middot; Max 25MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="flex items-center gap-3">
              <span className="text-xs text-text-body font-mono truncate flex-1">
                {u.name}
              </span>
              {u.error ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600">{u.error}</span>
                  <button
                    onClick={() => dismissError(u.id)}
                    className="text-xs text-text-muted hover:text-text-body"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber rounded-full transition-all duration-300"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Thumbnail grid */}
      {assets.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {assets.map((asset) => (
            <div key={asset.id} className="relative group">
              {/* Thumbnail */}
              {asset.file_type.startsWith("image/") ? (
                <a
                  href={asset.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.file_url}
                    alt={asset.caption || asset.file_name}
                    className="w-full aspect-square object-cover rounded-lg"
                    loading="lazy"
                  />
                </a>
              ) : (
                <a
                  href={asset.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full aspect-square rounded-lg bg-card border border-border flex flex-col items-center justify-center gap-1"
                >
                  <svg
                    className="w-8 h-8 text-rose-400"
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
                  <span className="text-[10px] text-text-muted truncate max-w-full px-2">
                    {fileTypeLabel(asset.file_type)}
                  </span>
                </a>
              )}

              {/* Delete button */}
              <button
                onClick={() => handleDelete(asset.id)}
                className="absolute top-1 right-1 bg-card/80 rounded-full w-5 h-5 text-rose-500 text-xs hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                &times;
              </button>

              {/* Caption input */}
              <input
                type="text"
                defaultValue={asset.caption || ""}
                placeholder="Add caption..."
                onBlur={(e) => handleCaptionBlur(asset.id, e.target.value)}
                className="mt-1 w-full text-xs bg-transparent border-b border-border focus:border-amber placeholder:text-text-caption text-text-body outline-none py-0.5"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
