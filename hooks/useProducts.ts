"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToProducts } from "@/services/productService";
import type { Product } from "@/types/product";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured
      ? null
      : "Firebase is not configured. Add your project credentials to .env.local to load products.",
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load products. Please try again.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}
