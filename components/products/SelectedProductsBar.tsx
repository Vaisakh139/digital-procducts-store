"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { getDisplayPrice, type Product } from "@/types/storefront";

interface SelectedProductsBarProps {
  selectionMode: boolean;
  selectedProducts: Product[];
  onCancel: () => void;
  onCheckout: () => void;
}

export default function SelectedProductsBar({
  selectionMode,
  selectedProducts,
  onCancel,
  onCheckout,
}: SelectedProductsBarProps) {
  const totalPrice = selectedProducts.reduce(
    (sum, product) => sum + getDisplayPrice(product),
    0,
  );

  const names = selectedProducts.map((product) => product.title);
  const displayNames =
    names.length === 0
      ? "No products selected yet"
      : names.length <= 2
        ? names.join(", ")
        : `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;

  return (
    <AnimatePresence>
      {selectionMode ? (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {selectedProducts.length} product
                  {selectedProducts.length === 1 ? "" : "s"} selected
                </span>
                <span className="line-clamp-1 max-w-xs text-xs text-foreground/60 sm:max-w-sm">
                  {displayNames}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className="text-lg font-semibold text-brand-600">
                ${totalPrice.toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onCancel}
                  icon={<X className="h-4 w-4" aria-hidden="true" />}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onCheckout}
                  disabled={selectedProducts.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
