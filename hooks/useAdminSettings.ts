"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/services/adminSettingsService";
import type { AdminSettings } from "@/types/adminSettings";

interface UseAdminSettingsResult {
  settings: AdminSettings | null;
  loading: boolean;
  error: string | null;
}

export function useAdminSettings(): UseAdminSettingsResult {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getSettings()
      .then((data) => {
        if (cancelled) return;
        setSettings(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading, error };
}
