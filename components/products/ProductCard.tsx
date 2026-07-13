"use client";

import { motion } from "framer-motion";
import { Check, Eye, Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import { getDisplayPrice, type Product } from "@/types/storefront";

interface ProductCardProps {
  product: Product;
  index: number;
  selectionMode: boolean;
  isSelected: boolean;
  isFavorite: boolean;
  onToggleSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (product: Product) => void;
  onPurchase: (product: Product) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      delay: Math.min(index, 8) * 0.05,
    },
  }),
};

export default function ProductCard({
  product,
  index,
  selectionMode,
  isSelected,
  isFavorite,
  onToggleSelect,
  onToggleFavorite,
  onViewDetails,
  onPurchase,
}: ProductCardProps) {
  const handleCardClick = () => {
    if (selectionMode) onToggleSelect(product.id);
  };

  const displayPrice = getDisplayPrice(product);
  const hasDiscount = product.discountPrice !== null;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      layout
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-500/10 ${
        selectionMode ? "cursor-pointer" : ""
      } ${
        selectionMode && isSelected
          ? "border-brand-500 ring-2 ring-brand-500/40"
          : "border-border-subtle"
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
        {product.thumbnailUrl ? (
          <Image
            src={getOptimizedImageUrl(product.thumbnailUrl, { width: 640 })}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground/30">
            <ShoppingCart className="h-10 w-10" aria-hidden="true" />
          </div>
        )}

        {selectionMode ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleSelect(product.id);
            }}
            aria-pressed={isSelected}
            aria-label={
              isSelected
                ? `Deselect ${product.title}`
                : `Select ${product.title}`
            }
            className={`absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-md border-2 shadow-sm transition-colors ${
              isSelected
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-white bg-white/70 text-transparent backdrop-blur-sm"
            }`}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(product.id);
          }}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${product.title} from favorites`
              : `Add ${product.title} to favorites`
          }
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-red-500 text-red-500" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="w-fit rounded-full bg-surface-muted px-2.5 py-1 text-[0.7rem] font-medium tracking-wide text-foreground/60 uppercase">
          {product.category.name}
        </span>

        <h3 className="line-clamp-1 text-base font-semibold">
          {product.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-foreground/60">
          {product.description}
        </p>

        <div className="flex items-center gap-1.5 pt-1">
          <div
            className="flex items-center gap-0.5"
            role="img"
            aria-label={`Rated ${product.rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <Star
                key={starIndex}
                className={`h-3.5 w-3.5 ${
                  starIndex < Math.round(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-foreground/20"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-xs text-foreground/50">
            {product.rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-lg font-semibold text-brand-600">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount ? (
              <span className="text-xs text-foreground/40 line-through">
                ${product.price.toFixed(2)}
              </span>
            ) : null}
          </span>
          <span className="text-xs text-foreground/45">
            {product.downloadsCount.toLocaleString()} downloads
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onViewDetails(product);
            }}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border-subtle text-xs font-medium transition-colors hover:bg-surface-muted"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            View Details
          </button>
          <button
            disabled = {true}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPurchase(product);
            }}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-coral text-xs font-medium text-white shadow-sm transition-all hover:bg-coral-dark hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            {/* Purchase */}
            coming soon...
          </button>
        </div>
      </div>
    </motion.div>
  );
}
