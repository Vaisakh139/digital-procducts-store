"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import { getDisplayPrice, type Product } from "@/types/storefront";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onPurchase: (product: Product) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onPurchase,
}: ProductDetailsModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [syncedProductId, setSyncedProductId] = useState(product?.id);

  const isOpen = Boolean(product);

  if (product?.id !== syncedProductId) {
    setSyncedProductId(product?.id);
    setActiveIndex(0);
  }

  const gallery = useMemo(() => {
    if (!product) return [];
    return [product.thumbnailUrl, ...product.images.map((image) => image.url)].filter(
      Boolean,
    );
  }, [product]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(
      () => closeButtonRef.current?.focus(),
      50,
    );

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const displayPrice = product ? getDisplayPrice(product) : 0;
  const hasDiscount = product?.discountPrice !== null && product?.discountPrice !== undefined;

  return (
    <AnimatePresence>
      {product ? (
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
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-2xl"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close product details"
              className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface/90 text-foreground/70 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="overflow-y-auto">
              <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:p-8">
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-muted">
                    {gallery.length > 0 ? (
                      <Image
                        src={getOptimizedImageUrl(gallery[activeIndex] ?? gallery[0], {
                          width: 1000,
                        })}
                        alt={product.title}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-foreground/30">
                        <ShoppingCart className="h-12 w-12" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {gallery.length > 1 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {gallery.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                            activeIndex === index
                              ? "border-brand-500"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            src={getOptimizedImageUrl(image, {
                              width: 200,
                              height: 150,
                              crop: "fill",
                            })}
                            alt=""
                            aria-hidden="true"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="w-fit rounded-full bg-surface-muted px-3 py-1 text-xs font-medium tracking-wide text-foreground/60 uppercase">
                      {product.category.name}
                    </span>
                    <h2
                      id={titleId}
                      className="text-2xl font-semibold tracking-tight text-balance"
                    >
                      {product.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center gap-0.5"
                        role="img"
                        aria-label={`Rated ${product.rating} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < Math.round(product.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-transparent text-foreground/20"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-foreground/50">
                        {product.rating.toFixed(1)} ·{" "}
                        {product.downloadsCount.toLocaleString()} downloads
                      </span>
                    </div>
                    <span className="flex items-center gap-2">
                      <span className="text-2xl font-semibold text-brand-600">
                        ${displayPrice.toFixed(2)}
                      </span>
                      {hasDiscount ? (
                        <span className="text-sm text-foreground/40 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/70">
                    {product.description}
                  </p>

                  <Button
                    variant="primary"
                    size="lg"
                    className="mt-2 w-full"
                    icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => onPurchase(product)}
                  >
                    Purchase — ${displayPrice.toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
