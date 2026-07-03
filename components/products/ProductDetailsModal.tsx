"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  PlayCircle,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import type { Product } from "@/types/product";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onPurchase: (product: Product) => void;
}

type ActiveMedia = { type: "image"; index: number } | { type: "video" };

export default function ProductDetailsModal({
  product,
  onClose,
  onPurchase,
}: ProductDetailsModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeMedia, setActiveMedia] = useState<ActiveMedia>({
    type: "image",
    index: 0,
  });
  const [syncedProductId, setSyncedProductId] = useState(product?.id);

  const isOpen = Boolean(product);

  if (product?.id !== syncedProductId) {
    setSyncedProductId(product?.id);
    setActiveMedia({ type: "image", index: 0 });
  }

  const gallery = useMemo(() => {
    if (!product) return [];
    return [product.thumbnail, ...product.images].filter(Boolean);
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
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-surface-muted">
                    {activeMedia.type === "video" && product.videoUrl ? (
                      <iframe
                        src={product.videoUrl}
                        title={`${product.title} video preview`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : gallery.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          gallery[
                            activeMedia.type === "image" ? activeMedia.index : 0
                          ]
                        }
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-foreground/30">
                        <ShoppingCart className="h-12 w-12" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {gallery.length > 1 || product.videoUrl ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {gallery.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setActiveMedia({ type: "image", index })}
                          className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                            activeMedia.type === "image" &&
                            activeMedia.index === index
                              ? "border-brand-500"
                              : "border-transparent"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                      {product.videoUrl ? (
                        <button
                          type="button"
                          onClick={() => setActiveMedia({ type: "video" })}
                          aria-label="Play video preview"
                          className={`relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-black/80 transition-colors ${
                            activeMedia.type === "video"
                              ? "border-brand-500"
                              : "border-transparent"
                          }`}
                        >
                          <PlayCircle
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="w-fit rounded-full bg-surface-muted px-3 py-1 text-xs font-medium tracking-wide text-foreground/60 uppercase">
                      {product.category}
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
                        {product.rating.toFixed(1)} · {product.downloads.toLocaleString()}{" "}
                        downloads
                      </span>
                    </div>
                    <span className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/70">
                    {product.longDescription || product.description}
                  </p>

                  {product.features.length > 0 ? (
                    <DetailList
                      icon={CheckCircle2}
                      title="Features"
                      items={product.features}
                    />
                  ) : null}

                  {product.requirements.length > 0 ? (
                    <DetailList
                      icon={ClipboardList}
                      title="Requirements"
                      items={product.requirements}
                    />
                  ) : null}

                  {product.whatsIncluded.length > 0 ? (
                    <DetailList
                      icon={PackageCheck}
                      title="What's Included"
                      items={product.whatsIncluded}
                    />
                  ) : null}

                  <Button
                    variant="primary"
                    size="lg"
                    className="mt-2 w-full"
                    icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => onPurchase(product)}
                  >
                    Purchase — ${product.price.toFixed(2)}
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

function DetailList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof CheckCircle2;
  title: string;
  items: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-foreground/70"
          >
            <Icon
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
