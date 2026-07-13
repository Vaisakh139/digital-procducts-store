"use client";

import { useCallback, useEffect, useState } from "react";
import { listCustomers } from "@/services/adminCustomerService";
import type { AdminCustomer } from "@/types/adminCustomer";

interface UseAdminCustomersResult {
  customers: AdminCustomer[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAdminCustomers(): UseAdminCustomersResult {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState(-1);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    listCustomers()
      .then((data) => {
        if (cancelled) return;
        setCustomers(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load customers.");
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(reloadKey);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { customers, loading: loadedKey !== reloadKey, error, refresh };
}
