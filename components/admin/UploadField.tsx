"use client";

import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { uploadDownloadFile, type UploadResult } from "@/services/adminUploadService";

interface UploadFieldProps {
  label: string;
  accept: string;
  value: UploadResult | null;
  onUploaded: (result: UploadResult) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function UploadField({
  label,
  accept,
  value,
  onUploaded,
  onRemove,
  disabled = false,
}: UploadFieldProps) {
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
      const result = await uploadDownloadFile(file, setProgress);
      onUploaded(result);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground/80">{label}</span>

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-muted px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText
              className="h-4 w-4 shrink-0 text-brand-500"
              aria-hidden="true"
            />
            <a
              href={value.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-brand-600 hover:underline"
            >
              View uploaded file
            </a>
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove file"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-surface hover:text-foreground disabled:opacity-40"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || progress !== null}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border-subtle bg-surface px-4 py-4 text-sm text-foreground/60 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-60"
        >
          {progress !== null ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Uploading… {Math.round(progress)}%
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Click to upload
            </>
          )}
        </button>
      )}

      {progress !== null ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
