"use client";

import { useEffect, useState } from "react";
import {
  fetchProducts,
  type ListProductsParams,
} from "@/services/storefrontProductService";
import type { PaginatedProducts } from "@/types/storefront";

interface UseProductsResult {
  data: PaginatedProducts | null;
  loading: boolean;
  error: string | null;
}

interface ProductsState {
  paramsKey: string;
  data: PaginatedProducts | null;
  error: string | null;
}

const INITIAL_STATE: ProductsState = { paramsKey: "", data: null, error: null };

export function useProducts(params: ListProductsParams): UseProductsResult {
  const [state, setState] = useState<ProductsState>(INITIAL_STATE);

  // Filters are passed as a fresh object every render, so stringify them into
  // a stable dependency instead of re-fetching on every render.
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;

    fetchProducts(params)
      .then((result) => {
        if (cancelled) return;
        setState({ paramsKey, data: result, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          paramsKey,
          data: null,
          error: err instanceof Error ? err.message : "Failed to load products.",
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  // While state.paramsKey hasn't caught up to the current params, a fetch for
  // them is in flight (or about to start) — derive "loading" instead of
  // toggling it imperatively inside the effect.
  const loading = state.paramsKey !== paramsKey;

  return { data: state.data, loading, error: state.error };
}
