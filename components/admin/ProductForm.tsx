"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";
import {
  createProduct,
  generateProductId,
  updateProduct,
} from "@/services/productService";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  type Product,
} from "@/types/product";
import ImageUploader from "./ImageUploader";
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
  thumbnail: z.string().trim().optional(),
  images: z.array(z.string()),
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
    thumbnail: "",
    images: [],
    videoUrl: "",
    downloadFile: "",
    isFeatured: false,
    status: "draft",
    featuresText: "",
    requirementsText: "",
    whatsIncludedText: "",
  };
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
        thumbnail: product.thumbnail,
        images: product.images,
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
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const thumbnail = watch("thumbnail");
  const images = watch("images");
  const downloadFile = watch("downloadFile");

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);
    try {
      const input = {
        title: values.title,
        description: values.description,
        longDescription: values.longDescription || "",
        price: values.price,
        category: values.category,
        thumbnail: values.thumbnail || "",
        images: values.images,
        videoUrl: values.videoUrl || null,
        downloadFile: values.downloadFile || null,
        isFeatured: values.isFeatured,
        status: values.status,
        features: linesToArray(values.featuresText),
        requirements: linesToArray(values.requirementsText),
        whatsIncluded: linesToArray(values.whatsIncludedText),
      };

      if (isEditMode) {
        await updateProduct(productId, input);
      } else {
        await createProduct(productId, input);
      }
      onClose();
    } catch {
      setFormError("Something went wrong while saving. Please try again.");
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
            onClick={onClose}
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
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-surface-muted hover:text-foreground"
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
                          {...register("price", { valueAsNumber: true })}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Category" error={errors.category?.message}>
                        <select {...register("category")} className={inputClass}>
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
                        className={inputClass}
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </Field>

                    <UploadField
                      label="Download File (ZIP / PDF)"
                      accept=".zip,.pdf"
                      storageFolder={`products/${productId}/download`}
                      value={downloadFile || null}
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
                          rows={3}
                          className={inputClass}
                          placeholder={"Responsive layout\nDark mode support"}
                        />
                      </Field>
                      <Field label="Requirements (one per line)">
                        <textarea
                          {...register("requirementsText")}
                          rows={3}
                          className={inputClass}
                          placeholder={"Node.js 18+"}
                        />
                      </Field>
                    </div>

                    <Field label="What's Included (one per line)">
                      <textarea
                        {...register("whatsIncludedText")}
                        rows={3}
                        className={inputClass}
                        placeholder={"Source files\nDocumentation"}
                      />
                    </Field>

                    <div className="flex flex-wrap items-center gap-6">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          {...register("isFeatured")}
                          className="h-4 w-4 rounded border-border-subtle accent-[color:var(--color-brand-500)]"
                        />
                        Featured product
                      </label>
                      <Field label="Status" error={errors.status?.message}>
                        <select
                          {...register("status")}
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
                        storageFolder={`products/${productId}/thumbnail`}
                        value={thumbnail || null}
                        onUploaded={(url) =>
                          setValue("thumbnail", url, { shouldValidate: true })
                        }
                        onRemove={() =>
                          setValue("thumbnail", "", { shouldValidate: true })
                        }
                        aspect="video"
                      />
                    </Field>

                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground/80">
                        Gallery Images
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        {images.map((url, index) => (
                          <ImageUploader
                            key={`${url}-${index}`}
                            storageFolder={`products/${productId}/images`}
                            value={url}
                            onUploaded={() => {}}
                            onRemove={() =>
                              setValue(
                                "images",
                                images.filter((_, i) => i !== index),
                                { shouldValidate: true },
                              )
                            }
                          />
                        ))}
                        <ImageUploader
                          storageFolder={`products/${productId}/images`}
                          value={null}
                          onUploaded={(url) =>
                            setValue("images", [...images, url], {
                              shouldValidate: true,
                            })
                          }
                        />
                      </div>
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
                  onClick={onClose}
                  className="h-10 rounded-full border border-border-subtle px-5 text-sm font-medium transition-colors hover:bg-surface-muted"
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
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30";

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
