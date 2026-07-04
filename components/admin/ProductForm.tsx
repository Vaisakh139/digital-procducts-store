"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import {
  createProduct,
  generateProductId,
  updateProduct,
} from "@/services/productService";
import { deleteMultipleImages, uploadImage } from "@/services/cloudinaryService";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  type Product,
  type ProductInput,
} from "@/types/product";
import ImageUploader, { revokeSlot, type ImageSlot } from "./ImageUploader";
import UploadField from "./UploadField";

const productFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters.")
    .max(200, "Keep the short description under 200 characters."),
  longDescription: z.string().trim().optional(),
  price: z.number().positive("Price must be greater than 0."),
  category: z.enum(PRODUCT_CATEGORIES),
  videoUrl: z.union([
    z.string().trim().url("Enter a valid video URL."),
    z.literal(""),
  ]),
  downloadFile: z.string().optional(),
  isFeatured: z.boolean(),
  status: z.enum(PRODUCT_STATUSES),
  featuresText: z.string().optional(),
  requirementsText: z.string().optional(),
  whatsIncludedText: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

function linesToArray(text: string | undefined): string[] {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(items: string[]): string {
  return items.join("\n");
}

function emptyValues(): ProductFormValues {
  return {
    title: "",
    description: "",
    longDescription: "",
    price: 0,
    category: PRODUCT_CATEGORIES[0],
    videoUrl: "",
    downloadFile: "",
    isFeatured: false,
    status: "draft",
    featuresText: "",
    requirementsText: "",
    whatsIncludedText: "",
  };
}

function withProgress(slot: ImageSlot, progress: number): ImageSlot {
  return slot.kind === "pending" ? { ...slot, progress, error: null } : slot;
}

function withError(slot: ImageSlot, error: string): ImageSlot {
  return slot.kind === "pending" ? { ...slot, error, progress: null } : slot;
}

function clearProgress(slot: ImageSlot): ImageSlot {
  return slot.kind === "pending" ? { ...slot, progress: null, error: null } : slot;
}

function thumbnailToSlots(product: Product | null | undefined): ImageSlot[] {
  if (!product?.thumbnail || !product.thumbnailPublicId) return [];
  return [{ kind: "existing", url: product.thumbnail, publicId: product.thumbnailPublicId }];
}

function galleryToSlots(product: Product | null | undefined): ImageSlot[] {
  if (!product) return [];
  return product.galleryImages.map((url, index) => ({
    kind: "existing" as const,
    url,
    publicId: product.galleryPublicIds[index] ?? "",
  }));
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function ProductForm({
  isOpen,
  onClose,
  product,
}: ProductFormProps) {
  const titleId = useId();
  const isEditMode = Boolean(product);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [thumbnailSlots, setThumbnailSlots] = useState<ImageSlot[]>([]);
  const [gallerySlots, setGallerySlots] = useState<ImageSlot[]>([]);
  const { showToast } = useToast();

  const productId = useMemo(
    () => product?.id ?? generateProductId(),
    [product],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      reset({
        title: product.title,
        description: product.description,
        longDescription: product.longDescription,
        price: product.price,
        category: product.category,
        videoUrl: product.videoUrl ?? "",
        downloadFile: product.downloadFile ?? "",
        isFeatured: product.isFeatured,
        status: product.status,
        featuresText: arrayToLines(product.features),
        requirementsText: arrayToLines(product.requirements),
        whatsIncludedText: arrayToLines(product.whatsIncluded),
      });
    } else {
      reset(emptyValues());
    }

    setThumbnailSlots(thumbnailToSlots(product));
    setGallerySlots(galleryToSlots(product));
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const downloadFile = watch("downloadFile");

  const handleClose = () => {
    if (isSubmitting) return;
    thumbnailSlots.forEach(revokeSlot);
    gallerySlots.forEach(revokeSlot);
    onClose();
  };

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);
    const newlyUploadedPublicIds: string[] = [];
    let firestoreWriteSucceeded = false;

    try {
      let thumbnailUrl = "";
      let thumbnailPublicId: string | null = null;
      const thumbSlot = thumbnailSlots[0];

      if (thumbSlot?.kind === "existing") {
        thumbnailUrl = thumbSlot.url;
        thumbnailPublicId = thumbSlot.publicId;
      } else if (thumbSlot?.kind === "pending") {
        try {
          const result = await uploadImage(thumbSlot.file, (percent) => {
            setThumbnailSlots((prev) =>
              prev.map((slot, index) => (index === 0 ? withProgress(slot, percent) : slot)),
            );
          });
          thumbnailUrl = result.imageUrl;
          thumbnailPublicId = result.publicId;
          newlyUploadedPublicIds.push(result.publicId);
          setThumbnailSlots((prev) =>
            prev.map((slot, index) => (index === 0 ? clearProgress(slot) : slot)),
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to upload thumbnail.";
          setThumbnailSlots((prev) =>
            prev.map((slot, index) => (index === 0 ? withError(slot, message) : slot)),
          );
          throw new Error(message);
        }
      }

      const galleryUrls: string[] = [];
      const galleryPublicIdsResolved: string[] = [];

      for (let index = 0; index < gallerySlots.length; index++) {
        const slot = gallerySlots[index];

        if (slot.kind === "existing") {
          galleryUrls.push(slot.url);
          galleryPublicIdsResolved.push(slot.publicId);
          continue;
        }

        try {
          const result = await uploadImage(slot.file, (percent) => {
            setGallerySlots((prev) =>
              prev.map((s, i) => (i === index ? withProgress(s, percent) : s)),
            );
          });
          galleryUrls.push(result.imageUrl);
          galleryPublicIdsResolved.push(result.publicId);
          newlyUploadedPublicIds.push(result.publicId);
          setGallerySlots((prev) =>
            prev.map((s, i) => (i === index ? clearProgress(s) : s)),
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to upload image.";
          setGallerySlots((prev) =>
            prev.map((s, i) => (i === index ? withError(s, message) : s)),
          );
          throw new Error(message);
        }
      }

      const input: ProductInput = {
        title: values.title,
        description: values.description,
        longDescription: values.longDescription || "",
        price: values.price,
        category: values.category,
        thumbnail: thumbnailUrl,
        thumbnailPublicId,
        galleryImages: galleryUrls,
        galleryPublicIds: galleryPublicIdsResolved,
        videoUrl: values.videoUrl || null,
        downloadFile: values.downloadFile || null,
        isFeatured: values.isFeatured,
        status: values.status,
        features: linesToArray(values.featuresText),
        requirements: linesToArray(values.requirementsText),
        whatsIncluded: linesToArray(values.whatsIncludedText),
      };

      try {
        if (isEditMode) {
          await updateProduct(productId, input);
        } else {
          await createProduct(productId, input);
        }
        firestoreWriteSucceeded = true;
      } catch {
        throw new Error(
          "Something went wrong while saving the product. Please try again.",
        );
      }

      if (isEditMode && product) {
        const keptPublicIds = new Set([
          ...(thumbnailPublicId ? [thumbnailPublicId] : []),
          ...galleryPublicIdsResolved,
        ]);
        const originalPublicIds = [
          ...(product.thumbnailPublicId ? [product.thumbnailPublicId] : []),
          ...product.galleryPublicIds,
        ];
        const removedPublicIds = originalPublicIds.filter(
          (id) => !keptPublicIds.has(id),
        );
        if (removedPublicIds.length > 0) {
          await deleteMultipleImages(removedPublicIds);
        }
      }

      showToast(
        "success",
        isEditMode ? "Product updated successfully." : "Product created successfully.",
      );
      thumbnailSlots.forEach(revokeSlot);
      gallerySlots.forEach(revokeSlot);
      onClose();
    } catch (error) {
      if (!firestoreWriteSucceeded && newlyUploadedPublicIds.length > 0) {
        await deleteMultipleImages(newlyUploadedPublicIds);
      }
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setFormError(message);
      showToast("error", message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
              <h2 id={titleId} className="text-lg font-semibold">
                {isEditMode ? "Edit Product" : "Add Product"}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="flex flex-col gap-5 lg:col-span-2">
                    <Field label="Title" error={errors.title?.message}>
                      <input
                        {...register("title")}
                        disabled={isSubmitting}
                        className={inputClass}
                        placeholder="Premium Landing Page Kit"
                      />
                    </Field>

                    <Field
                      label="Short Description"
                      error={errors.description?.message}
                    >
                      <textarea
                        {...register("description")}
                        disabled={isSubmitting}
                        rows={2}
                        className={inputClass}
                        placeholder="One or two sentences shown on the product card."
                      />
                    </Field>

                    <Field
                      label="Long Description (optional)"
                      error={errors.longDescription?.message}
                    >
                      <textarea
                        {...register("longDescription")}
                        disabled={isSubmitting}
                        rows={4}
                        className={inputClass}
                        placeholder="Full description shown in the product details modal."
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Price (USD)" error={errors.price?.message}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isSubmitting}
                          {...register("price", { valueAsNumber: true })}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Category" error={errors.category?.message}>
                        <select
                          {...register("category")}
                          disabled={isSubmitting}
                          className={inputClass}
                        >
                          {PRODUCT_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field
                      label="Video URL (optional)"
                      error={errors.videoUrl?.message}
                    >
                      <input
                        {...register("videoUrl")}
                        disabled={isSubmitting}
                        className={inputClass}
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </Field>

                    <UploadField
                      label="Download File (ZIP / PDF)"
                      accept=".zip,.pdf"
                      storageFolder={`products/${productId}/download`}
                      value={downloadFile || null}
                      disabled={isSubmitting}
                      onUploaded={(url) =>
                        setValue("downloadFile", url, { shouldValidate: true })
                      }
                      onRemove={() =>
                        setValue("downloadFile", "", { shouldValidate: true })
                      }
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Features (one per line)">
                        <textarea
                          {...register("featuresText")}
                          disabled={isSubmitting}
                          rows={3}
                          className={inputClass}
                          placeholder={"Responsive layout\nDark mode support"}
                        />
                      </Field>
                      <Field label="Requirements (one per line)">
                        <textarea
                          {...register("requirementsText")}
                          disabled={isSubmitting}
                          rows={3}
                          className={inputClass}
                          placeholder={"Node.js 18+"}
                        />
                      </Field>
                    </div>

                    <Field label="What's Included (one per line)">
                      <textarea
                        {...register("whatsIncludedText")}
                        disabled={isSubmitting}
                        rows={3}
                        className={inputClass}
                        placeholder={"Source files\nDocumentation"}
                      />
                    </Field>

                    <div className="flex flex-wrap items-center gap-6">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          disabled={isSubmitting}
                          {...register("isFeatured")}
                          className="h-4 w-4 rounded border-border-subtle accent-[color:var(--color-brand-500)]"
                        />
                        Featured product
                      </label>
                      <Field label="Status" error={errors.status?.message}>
                        <select
                          {...register("status")}
                          disabled={isSubmitting}
                          className={`${inputClass} w-40 capitalize`}
                        >
                          {PRODUCT_STATUSES.map((status) => (
                            <option key={status} value={status} className="capitalize">
                              {status}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <Field label="Thumbnail (optional)">
                      <ImageUploader
                        mode="single"
                        aspect="video"
                        slots={thumbnailSlots}
                        onChange={setThumbnailSlots}
                        disabled={isSubmitting}
                        label="Upload thumbnail"
                      />
                    </Field>

                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground/80">
                        Gallery Images
                      </span>
                      <ImageUploader
                        mode="multiple"
                        aspect="square"
                        slots={gallerySlots}
                        onChange={setGallerySlots}
                        disabled={isSubmitting}
                        label="Add images"
                      />
                    </div>
                  </div>
                </div>

                {formError ? (
                  <p role="alert" className="mt-4 text-sm text-red-500">
                    {formError}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border-subtle px-6 py-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="h-10 rounded-full border border-border-subtle px-5 text-sm font-medium transition-colors hover:bg-surface-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving…"
                    : isEditMode
                      ? "Save Changes"
                      : "Add Product"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
