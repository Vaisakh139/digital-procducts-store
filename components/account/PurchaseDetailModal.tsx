"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import type { PurchaseLineItem } from "@/types/purchase";

interface PurchaseDetailModalProps {
  purchase: PurchaseLineItem | null;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default function PurchaseDetailModal({
  purchase,
  onClose,
}: PurchaseDetailModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = Boolean(purchase);

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

  return (
    <AnimatePresence>
      {purchase ? (
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
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-2xl"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close purchase details"
              className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface/90 text-foreground/70 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="overflow-y-auto">
              <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
                {purchase.product.thumbnailUrl ? (
                  <Image
                    src={getOptimizedImageUrl(purchase.product.thumbnailUrl, { width: 800 })}
                    alt={purchase.product.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-foreground/30">
                    <ShoppingBag className="h-10 w-10" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5 p-6 lg:p-8">
                <div>
                  <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                    {purchase.product.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    {purchase.product.description}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-surface-muted p-4 text-sm">
                  <div>
                    <dt className="text-xs text-foreground/50">Purchased on</dt>
                    <dd className="font-medium">
                      {purchase.purchaseDate.toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-foreground/50">Amount paid</dt>
                    <dd className="font-medium">${purchase.amountPaid.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-foreground/50">Order ID</dt>
                    <dd className="truncate font-medium" title={purchase.orderNumber}>
                      {purchase.orderNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-foreground/50">Payment ID</dt>
                    <dd className="truncate font-medium" title={purchase.paymentId ?? undefined}>
                      {purchase.paymentId ?? "—"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-foreground/50">Status</dt>
                    <dd className="font-medium">
                      {STATUS_LABELS[purchase.status] ?? purchase.status}
                    </dd>
                  </div>
                </dl>

                {purchase.status === "PAID" ? (
                  <a
                    // href={purchase.product.downloadUrl}
                    href='/'
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-coral text-sm font-medium text-white shadow-sm transition-colors hover:bg-coral-dark"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download
                  </a>
                ) : (
                  <p className="text-sm text-foreground/60">
                    Downloads unlock once this order shows as paid.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
