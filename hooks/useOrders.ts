"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToOrders } from "@/services/orderService";
import type { Order } from "@/types/order";

interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured ? null : "Firebase is not configured.",
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load orders.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { orders, loading, error };
}
