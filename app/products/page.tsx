"use client";

import { motion } from "framer-motion";
import { Layers, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import CheckoutPreviewModal from "@/components/products/CheckoutPreviewModal";
import ProductDetailsModal from "@/components/products/ProductDetailsModal";
import ProductFilter from "@/components/products/ProductFilter";
import ProductGrid from "@/components/products/ProductGrid";
import ProductSearch from "@/components/products/ProductSearch";
import SelectedProductsBar from "@/components/products/SelectedProductsBar";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProducts } from "@/hooks/useProducts";
import type { Product, SortOption } from "@/types/storefront";

const PAGE_SIZE = 8;
const FAVORITES_STORAGE_KEY = "elicso:favorite-products";
const DEFAULT_PRICE_BOUNDS: [number, number] = [0, 0];

export default function ProductsPage() {
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [categoryId, setCategoryId] = useState<string | "All">("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>(
    DEFAULT_PRICE_BOUNDS,
  );
  const [page, setPage] = useState(1);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, Product>>(
    new Map(),
  );
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [checkoutProducts, setCheckoutProducts] = useState<Product[]>([]);

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

  // Reset to page 1 whenever a filter changes, without an extra effect —
  // this runs during render, so the fetch below always sees the right page.
  const filterKey = `${debouncedSearch}|${categoryId}|${priceRange[0]}|${priceRange[1]}|${sort}`;
  const [syncedFilterKey, setSyncedFilterKey] = useState(filterKey);
  if (filterKey !== syncedFilterKey) {
    setSyncedFilterKey(filterKey);
    setPage(1);
  }

  const { data, loading, error } = useProducts({
    search: debouncedSearch || undefined,
    categoryId: categoryId === "All" ? undefined : categoryId,
    minPrice: priceRange[0],
    // maxPrice: priceRange[1],
    sort,
    page,
    limit: PAGE_SIZE,
  });

  // Cheap, filter-independent probe so the empty state can tell "no matches"
  // apart from "nothing in the catalog yet".
  const { data: catalogProbe } = useProducts({ page: 1, limit: 1 });
  const hasAnyProducts = (catalogProbe?.total ?? 0) > 0;

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const selectedIds = new Set(selectedProducts.keys());
  const selectedProductsList = Array.from(selectedProducts.values());

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        const product = products.find((item) => item.id === id);
        if (product) next.set(id, product);
      }
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
    setSelectedProducts(new Map());
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("All");
    setSort("newest");
    setPriceRange(DEFAULT_PRICE_BOUNDS);
  };

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-plum py-20 text-cream sm:py-24">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,103,74,0.18),transparent_45%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Tools that fix real frustrations
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-semibold tracking-tight text-balance text-cream sm:text-5xl"
          >
            Find your fix
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg"
          >
            Trackers and templates built around one specific frustration —
            browse, buy once, and get instant access.
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
            categories={categories}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className={`mt-10 ${selectionMode ? "pb-24" : ""}`}>
          <ProductGrid
            products={products}
            loading={loading}
            hasAnyProducts={hasAnyProducts}
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
        selectedProducts={selectedProductsList}
        onCancel={exitSelectionMode}
        onCheckout={() => setCheckoutProducts(selectedProductsList)}
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
