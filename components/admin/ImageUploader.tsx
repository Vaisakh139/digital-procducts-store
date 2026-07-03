"use client";

import { ImageIcon, Loader2, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { sanitizeFileName, uploadFile } from "@/services/storageService";

interface ImageUploaderProps {
  storageFolder: string;
  value: string | null;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
  aspect?: "square" | "video";
}

export default function ImageUploader({
  storageFolder,
  value,
  onUploaded,
  onRemove,
  aspect = "square",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setProgress(0);
    try {
      const path = `${storageFolder}/${Date.now()}-${sanitizeFileName(file.name)}`;
      const url = await uploadFile(path, file, setProgress);
      onUploaded(url);
    } catch {
      setError("Upload failed.");
    } finally {
      setProgress(null);
    }
  };

  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden rounded-xl border border-border-subtle bg-surface-muted`}
    >
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove image"
              className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-foreground/50 transition-colors hover:text-brand-600 disabled:opacity-60 dark:hover:text-brand-400"
        >
          {progress !== null ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="text-xs">{Math.round(progress)}%</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs">Upload image</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error ? (
        <p className="absolute inset-x-0 bottom-0 bg-red-500/90 px-2 py-1 text-center text-[10px] text-white">
          {error}
        </p>
      ) : null}
    </div>
  );
}
