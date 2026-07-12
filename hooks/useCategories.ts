"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/services/storefrontProductService";
import type { Category } from "@/types/storefront";

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
