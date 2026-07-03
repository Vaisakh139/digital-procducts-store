"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  SORT_OPTIONS,
  type ProductCategory,
  type SortOption,
} from "@/types/product";

interface ProductFilterProps {
  category: ProductCategory | "All";
  onCategoryChange: (category: ProductCategory | "All") => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  priceBounds: [number, number];
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const CATEGORY_OPTIONS: (ProductCategory | "All")[] = [
  "All",
  ...PRODUCT_CATEGORIES,
];

export default function ProductFilter({
  category,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  priceBounds,
  sort,
  onSortChange,
}: ProductFilterProps) {
  const handleMinChange = (raw: string) => {
    const next = raw === "" ? priceBounds[0] : Number(raw);
    onPriceRangeChange([Math.min(next, priceRange[1]), priceRange[1]]);
  };

  const handleMaxChange = (raw: string) => {
    const next = raw === "" ? priceBounds[1] : Number(raw);
    onPriceRangeChange([priceRange[0], Math.max(next, priceRange[0])]);
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter by category"
      >
        {CATEGORY_OPTIONS.map((option) => {
          const isActive = option === category;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onCategoryChange(option)}
              aria-pressed={isActive}
              className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {isActive ? (
                <motion.span
                  layoutId="active-category-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 shadow-sm"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              ) : null}
              <span
                className={`relative z-10 ${
                  isActive ? "text-white" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground/60">
            Price Range
          </span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-foreground/40">
                $
              </span>
              <input
                type="number"
                min={priceBounds[0]}
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(event) => handleMinChange(event.target.value)}
                aria-label="Minimum price"
                className="h-10 w-24 rounded-full border border-border-subtle bg-surface pr-2 pl-6 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <span className="text-sm text-foreground/40">to</span>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-foreground/40">
                $
              </span>
              <input
                type="number"
                min={priceRange[0]}
                max={priceBounds[1]}
                value={priceRange[1]}
                onChange={(event) => handleMaxChange(event.target.value)}
                aria-label="Maximum price"
                className="h-10 w-24 rounded-full border border-border-subtle bg-surface pr-2 pl-6 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="product-sort"
            className="text-xs font-medium text-foreground/60"
          >
            Sort By
          </label>
          <div className="relative">
            <select
              id="product-sort"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortOption)}
              className="h-10 w-full min-w-[190px] appearance-none rounded-full border border-border-subtle bg-surface pr-9 pl-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
