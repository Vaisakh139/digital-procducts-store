"use client";

import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, RefreshCw, X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  progress?: number | null;
  error?: string | null;
  badge?: string;
  aspect?: "square" | "video";
  onRemove?: () => void;
  onReplace?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

export default function ImagePreview({
  src,
  alt = "",
  progress = null,
  error = null,
  badge,
  aspect = "square",
  onRemove,
  onReplace,
  onMoveLeft,
  onMoveRight,
}: ImagePreviewProps) {
  const isUploading = progress !== null && progress !== undefined;
  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";

  return (
    <div
      className={`group relative w-full ${aspectClass} overflow-hidden rounded-xl border border-border-subtle bg-surface-muted`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />

      {badge ? (
        <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
          {badge}
        </span>
      ) : null}

      {isUploading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 text-white">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-xs font-medium">{Math.round(progress)}%</span>
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-950/80 px-2 text-center text-white">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] leading-tight">{error}</span>
        </div>
      ) : null}

      {!isUploading && !error ? (
        <div className="absolute inset-0 flex flex-col justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center justify-end gap-1">
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                aria-label="Remove image"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              {onMoveLeft ? (
                <button
                  type="button"
                  onClick={onMoveLeft}
                  aria-label="Move image left"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
              {onMoveRight ? (
                <button
                  type="button"
                  onClick={onMoveRight}
                  aria-label="Move image right"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
                >
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {onReplace ? (
              <button
                type="button"
                onClick={onReplace}
                aria-label="Replace image"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
