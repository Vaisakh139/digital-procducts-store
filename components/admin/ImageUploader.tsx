"use client";

import { ImagePlus } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { validateImageFile } from "@/services/cloudinaryService";
import ImagePreview from "./ImagePreview";

export type ImageSlot =
  | { kind: "existing"; url: string; publicId: string }
  | {
      kind: "pending";
      file: File;
      previewUrl: string;
      progress?: number | null;
      error?: string | null;
    };

export function slotSrc(slot: ImageSlot): string {
  return slot.kind === "existing" ? slot.url : slot.previewUrl;
}

export function createPendingSlot(file: File): ImageSlot {
  return { kind: "pending", file, previewUrl: URL.createObjectURL(file) };
}

/** Revokes any blob: object URLs created for slots no longer in use. */
export function revokeSlot(slot: ImageSlot | undefined): void {
  if (slot?.kind === "pending") URL.revokeObjectURL(slot.previewUrl);
}

interface ImageUploaderProps {
  mode: "single" | "multiple";
  slots: ImageSlot[];
  onChange: (slots: ImageSlot[]) => void;
  aspect?: "square" | "video";
  disabled?: boolean;
  label?: string;
}

export default function ImageUploader({
  mode,
  slots,
  onChange,
  aspect = "square",
  disabled = false,
  label = "Upload image",
}: ImageUploaderProps) {
  // Two separate inputs (rather than one with a dynamically-toggled
  // `multiple` attribute) — refs don't trigger re-renders, so flipping a
  // ref right before calling .click() wouldn't reliably update the attribute
  // already committed to the DOM from the last render.
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  const handleAddClick = () => {
    addInputRef.current?.click();
  };

  const handleReplaceClick = (index: number) => {
    replaceIndexRef.current = index;
    replaceInputRef.current?.click();
  };

  const applyFiles = (files: File[]): boolean => {
    const errors = files.map(validateImageFile).filter(Boolean);
    if (errors.length > 0) {
      window.alert(errors[0]);
      return false;
    }
    return true;
  };

  const handleAddFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || !applyFiles(files)) return;

    if (mode === "single") {
      revokeSlot(slots[0]);
      onChange([createPendingSlot(files[0])]);
      return;
    }

    onChange([...slots, ...files.map(createPendingSlot)]);
  };

  const handleReplaceFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const replaceIndex = replaceIndexRef.current;
    replaceIndexRef.current = null;
    if (!file || replaceIndex === null || !applyFiles([file])) return;

    const next = [...slots];
    revokeSlot(next[replaceIndex]);
    next[replaceIndex] = createPendingSlot(file);
    onChange(next);
  };

  const handleRemove = (index: number) => {
    revokeSlot(slots[index]);
    onChange(slots.filter((_, i) => i !== index));
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const next = [...slots];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const handleMoveRight = (index: number) => {
    if (index === slots.length - 1) return;
    const next = [...slots];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const canAddMore = mode === "multiple" || slots.length === 0;

  return (
    <div
      className={
        mode === "multiple"
          ? "grid grid-cols-2 gap-3 sm:grid-cols-3"
          : "grid grid-cols-1"
      }
    >
      {slots.map((slot, index) => (
        <ImagePreview
          key={slot.kind === "existing" ? slot.publicId : slot.previewUrl}
          src={slotSrc(slot)}
          aspect={aspect}
          progress={slot.kind === "pending" ? (slot.progress ?? null) : null}
          error={slot.kind === "pending" ? (slot.error ?? null) : null}
          badge={mode === "single" ? "Thumbnail" : undefined}
          onRemove={disabled ? undefined : () => handleRemove(index)}
          onReplace={disabled ? undefined : () => handleReplaceClick(index)}
          onMoveLeft={
            disabled || mode === "single" || index === 0
              ? undefined
              : () => handleMoveLeft(index)
          }
          onMoveRight={
            disabled || mode === "single" || index === slots.length - 1
              ? undefined
              : () => handleMoveRight(index)
          }
        />
      ))}

      {canAddMore ? (
        <button
          type="button"
          onClick={handleAddClick}
          disabled={disabled}
          className={`flex ${aspect === "video" ? "aspect-video" : "aspect-square"} w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-subtle bg-surface text-foreground/50 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-60`}
        >
          <ImagePlus className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">{label}</span>
        </button>
      ) : null}

      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        multiple={mode === "multiple"}
        className="hidden"
        onChange={handleAddFileChange}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFileChange}
      />
    </div>
  );
}
