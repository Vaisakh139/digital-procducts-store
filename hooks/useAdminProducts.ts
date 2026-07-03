"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToAllProductsAdmin } from "@/services/productService";
import type { Product } from "@/types/product";

interface UseAdminProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useAdminProducts(): UseAdminProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured ? null : "Firebase is not configured.",
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToAllProductsAdmin(
      (data) => {
        setProducts(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load products.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}
