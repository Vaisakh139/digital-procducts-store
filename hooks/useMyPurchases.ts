"use client";

import { useEffect, useState } from "react";
import { getMyPurchases } from "@/services/purchaseService";
import type { Purchase } from "@/types/purchase";

interface UseMyPurchasesResult {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
}

export function useMyPurchases(): UseMyPurchasesResult {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMyPurchases()
      .then((data) => {
        if (!cancelled) setPurchases(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load purchases.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { purchases, loading, error };
}
