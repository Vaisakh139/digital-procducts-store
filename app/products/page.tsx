"use client";

import { motion } from "framer-motion";
import { Layers, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import CheckoutPreviewModal from "@/components/products/CheckoutPreviewModal";
import ProductDetailsModal from "@/components/products/ProductDetailsModal";
import ProductFilter from "@/components/products/ProductFilter";
import ProductGrid from "@/components/products/ProductGrid";
import ProductSearch from "@/components/products/ProductSearch";
import SelectedProductsBar from "@/components/products/SelectedProductsBar";
import { useProducts } from "@/hooks/useProducts";
import type { Product, ProductCategory, SortOption } from "@/types/product";

const PAGE_SIZE = 8;
const FAVORITES_STORAGE_KEY = "digiora:favorite-products";
const DEFAULT_PRICE_BOUNDS: [number, number] = [0, 500];

export default function ProductsPage() {
  const { products, loading, error } = useProducts();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>(
    DEFAULT_PRICE_BOUNDS,
  );
  const [page, setPage] = useState(1);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [checkoutProducts, setCheckoutProducts] = useState<Product[]>([]);

  const hasInitializedPriceRange = useRef(false);

  useEffect(() => {
    // One-time read from an external system (localStorage) on mount; this
    // cannot happen during render since it is unavailable during SSR.
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setFavoriteIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      // Ignore malformed storage data.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(Array.from(favoriteIds)),
    );
  }, [favoriteIds]);

  const priceBounds = useMemo<[number, number]>(() => {
    if (products.length === 0) return DEFAULT_PRICE_BOUNDS;
    const prices = products.map((product) => product.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  useEffect(() => {
    if (!hasInitializedPriceRange.current && products.length > 0) {
      setPriceRange(priceBounds);
      hasInitializedPriceRange.current = true;
    }
  }, [products.length, priceBounds]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !term ||
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);
      const matchesCategory = category === "All" || product.category === category;
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "az":
          return a.title.localeCompare(b.title);
        case "popular":
          return b.downloads - a.downloads;
        case "newest":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
  }, [products, search, category, priceRange, sort]);

  const filterKey = `${search}|${category}|${priceRange[0]}|${priceRange[1]}|${sort}`;
  const [syncedFilterKey, setSyncedFilterKey] = useState(filterKey);
  if (filterKey !== syncedFilterKey) {
    setSyncedFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedIds.has(product.id)),
    [products, selectedIds],
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
    setPriceRange(priceBounds);
  };

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 py-20 text-white sm:py-24">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Digital Marketplace
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            Premium Digital Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg"
          >
            Browse our high-quality digital products with instant access
            after purchase.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <ProductSearch value={search} onChange={setSearch} />
          </div>
          {selectionMode ? (
            <Button variant="secondary" size="md" onClick={exitSelectionMode}>
              Exit Selection
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              icon={<Layers className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setSelectionMode(true)}
            >
              Purchase Multiple Products
            </Button>
          )}
        </div>

        <div className="mt-6 border-y border-border-subtle py-6">
          <ProductFilter
            category={category}
            onCategoryChange={setCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            priceBounds={priceBounds}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <div className={`mt-10 ${selectionMode ? "pb-24" : ""}`}>
          <ProductGrid
            products={paginatedProducts}
            loading={loading}
            hasAnyProducts={products.length > 0}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            favoriteIds={favoriteIds}
            onToggleSelect={toggleSelect}
            onToggleFavorite={toggleFavorite}
            onViewDetails={setActiveProduct}
            onPurchase={(product) => setCheckoutProducts([product])}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onClearFilters={clearFilters}
          />
        </div>
      </div>

      <SelectedProductsBar
        selectionMode={selectionMode}
        selectedProducts={selectedProducts}
        onCancel={exitSelectionMode}
        onCheckout={() => setCheckoutProducts(selectedProducts)}
      />

      <ProductDetailsModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onPurchase={(product) => {
          setActiveProduct(null);
          setCheckoutProducts([product]);
        }}
      />

      <CheckoutPreviewModal
        products={checkoutProducts}
        onClose={() => setCheckoutProducts([])}
      />
    </div>
  );
}
