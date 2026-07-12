"use client";

import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/storefront";
import EmptyState from "./EmptyState";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  hasAnyProducts: boolean;
  selectionMode: boolean;
  selectedIds: Set<string>;
  favoriteIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (product: Product) => void;
  onPurchase: (product: Product) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

const SKELETON_COUNT = 8;

function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) {
      result.push("ellipsis");
    }
    result.push(p);
  });
  return result;
}

export default function ProductGrid({
  products,
  loading,
  hasAnyProducts,
  selectionMode,
  selectedIds,
  favoriteIds,
  onToggleSelect,
  onToggleFavorite,
  onViewDetails,
  onPurchase,
  page,
  totalPages,
  onPageChange,
  onClearFilters,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return hasAnyProducts ? (
      <EmptyState onClearFilters={onClearFilters} />
    ) : (
      <EmptyState
        title="No Products Found"
        message="There are no products in the catalog yet. Please check back soon."
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              selectionMode={selectionMode}
              isSelected={selectedIds.has(product.id)}
              isFavorite={favoriteIds.has(product.id)}
              onToggleSelect={onToggleSelect}
              onToggleFavorite={onToggleFavorite}
              onViewDetails={onViewDetails}
              onPurchase={onPurchase}
            />
          ))}
        </AnimatePresence>
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Product pagination"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {getPageNumbers(page, totalPages).map((entry, index) =>
            entry === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-foreground/40"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                aria-current={entry === page ? "page" : undefined}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors ${
                  entry === page
                    ? "bg-coral text-white shadow-sm"
                    : "border border-border-subtle hover:bg-surface-muted"
                }`}
              >
                {entry}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
