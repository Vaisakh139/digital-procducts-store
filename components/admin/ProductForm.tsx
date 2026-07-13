"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { useCategories } from "@/hooks/useCategories";
import {
  createProduct,
  updateProduct,
  type ProductImageInput,
} from "@/services/adminProductService";
import {
  deleteMultipleImages,
  uploadImage,
  type UploadResult,
} from "@/services/adminUploadService";
import type { Product, ProductStatus } from "@/types/storefront";
import ImageUploader, { revokeSlot, type ImageSlot } from "./ImageUploader";
import UploadField from "./UploadField";

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "PUBLISHED"];

const productFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters.")
    .max(500, "Keep the description under 500 characters."),
  price: z.number().positive("Price must be greater than 0."),
  discountPrice: z
    .string()
    .optional()
    .refine((value) => !value || Number(value) > 0, "Enter a valid discount price."),
  categoryId: z.string().min(1, "Category is required."),
  isFeatured: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

function emptyValues(defaultCategoryId: string): ProductFormValues {
  return {
    title: "",
    description: "",
    price: 0,
    discountPrice: "",
    categoryId: defaultCategoryId,
    isFeatured: false,
    status: "DRAFT",
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
  if (!product?.thumbnailUrl || !product.thumbnailPublicId) return [];
  return [
    { kind: "existing", url: product.thumbnailUrl, publicId: product.thumbnailPublicId },
  ];
}

function galleryToSlots(product: Product | null | undefined): ImageSlot[] {
  if (!product) return [];
  return product.images.map((image) => ({
    kind: "existing" as const,
    url: image.url,
    publicId: image.publicId,
  }));
}

function downloadFileFromProduct(product: Product | null | undefined): UploadResult | null {
  if (!product) return null;
  return { secureUrl: product.downloadUrl, publicId: product.downloadPublicId };
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: Product | null;
}

export default function ProductForm({
  isOpen,
  onClose,
  onSaved,
  product,
}: ProductFormProps) {
  const titleId = useId();
  const isEditMode = Boolean(product);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [thumbnailSlots, setThumbnailSlots] = useState<ImageSlot[]>([]);
  const [gallerySlots, setGallerySlots] = useState<ImageSlot[]>([]);
  const [downloadFile, setDownloadFile] = useState<UploadResult | null>(null);
  const { showToast } = useToast();
  const { categories } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyValues(""),
  });

  const handleClose = () => {
    if (isSubmitting) return;
    thumbnailSlots.forEach(revokeSlot);
    gallerySlots.forEach(revokeSlot);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      reset({
        title: product.title,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice ? String(product.discountPrice) : "",
        categoryId: product.categoryId,
        isFeatured: product.isFeatured,
        status: product.status,
      });
    } else {
      reset(emptyValues(categories[0]?.id ?? ""));
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDownloadFile(downloadFileFromProduct(product));
    setThumbnailSlots(thumbnailToSlots(product));
    setGallerySlots(galleryToSlots(product));
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product, categories]);

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

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);

    const thumbSlot = thumbnailSlots[0];
    if (!thumbSlot) {
      setFormError("A thumbnail image is required.");
      return;
    }
    if (!downloadFile) {
      setFormError("A download file is required.");
      return;
    }

    const newlyUploadedPublicIds: string[] = [];
    let writeSucceeded = false;

    try {
      let thumbnailUrl: string;
      let thumbnailPublicId: string;

      if (thumbSlot.kind === "existing") {
        thumbnailUrl = thumbSlot.url;
        thumbnailPublicId = thumbSlot.publicId;
      } else {
        try {
          const result = await uploadImage(thumbSlot.file, (percent) => {
            setThumbnailSlots((prev) =>
              prev.map((slot, index) => (index === 0 ? withProgress(slot, percent) : slot)),
            );
          });
          thumbnailUrl = result.secureUrl;
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

      const images: ProductImageInput[] = [];

      for (let index = 0; index < gallerySlots.length; index++) {
        const slot = gallerySlots[index];

        if (slot.kind === "existing") {
          images.push({ url: slot.url, publicId: slot.publicId });
          continue;
        }

        try {
          const result = await uploadImage(slot.file, (percent) => {
            setGallerySlots((prev) =>
              prev.map((s, i) => (i === index ? withProgress(s, percent) : s)),
            );
          });
          images.push({ url: result.secureUrl, publicId: result.publicId });
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

      const input = {
        title: values.title,
        description: values.description,
        price: values.price,
        discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
        categoryId: values.categoryId,
        isFeatured: values.isFeatured,
        status: values.status,
        thumbnailUrl,
        thumbnailPublicId,
        downloadUrl: downloadFile.secureUrl,
        downloadPublicId: downloadFile.publicId,
        images,
      };

      try {
        if (isEditMode && product) {
          await updateProduct(product.id, input);
        } else {
          await createProduct(input);
        }
        writeSucceeded = true;
      } catch {
        throw new Error(
          "Something went wrong while saving the product. Please try again.",
        );
      }

      if (isEditMode && product) {
        const keptImagePublicIds = new Set(images.map((image) => image.publicId));
        const removedImagePublicIds = product.images
          .map((image) => image.publicId)
          .filter((id) => !keptImagePublicIds.has(id));
        if (removedImagePublicIds.length > 0) {
          await deleteMultipleImages(removedImagePublicIds);
        }
      }

      showToast(
        "success",
        isEditMode ? "Product updated successfully." : "Product created successfully.",
      );
      thumbnailSlots.forEach(revokeSlot);
      gallerySlots.forEach(revokeSlot);
      onSaved();
    } catch (error) {
      if (!writeSucceeded && newlyUploadedPublicIds.length > 0) {
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

                    <Field label="Description" error={errors.description?.message}>
                      <textarea
                        {...register("description")}
                        disabled={isSubmitting}
                        rows={4}
                        className={inputClass}
                        placeholder="Full description shown on the product page."
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
                      <Field
                        label="Discount Price (optional)"
                        error={errors.discountPrice?.message}
                      >
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isSubmitting}
                          {...register("discountPrice")}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <Field label="Category" error={errors.categoryId?.message}>
                      <select
                        {...register("categoryId")}
                        disabled={isSubmitting}
                        className={inputClass}
                      >
                        {categories.length === 0 ? (
                          <option value="">No categories available</option>
                        ) : null}
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <UploadField
                      label="Download File (ZIP / PDF)"
                      accept=".zip,.pdf"
                      value={downloadFile}
                      disabled={isSubmitting}
                      onUploaded={(result) => setDownloadFile(result)}
                      onRemove={() => setDownloadFile(null)}
                    />

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
                    <Field label="Thumbnail">
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
