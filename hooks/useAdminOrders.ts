"use client";

import { useCallback, useEffect, useState } from "react";
import { listOrders } from "@/services/adminOrderService";
import type { AdminOrder } from "@/types/adminOrder";

interface UseAdminOrdersResult {
  orders: AdminOrder[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAdminOrders(): UseAdminOrdersResult {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState(-1);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    listOrders()
      .then((data) => {
        if (cancelled) return;
        setOrders(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load orders.");
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(reloadKey);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { orders, loading: loadedKey !== reloadKey, error, refresh };
}
