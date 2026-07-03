"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToSettings } from "@/services/settingsService";
import { DEFAULT_BUSINESS_SETTINGS, type BusinessSettings } from "@/types/settings";

interface UseSettingsResult {
  settings: BusinessSettings;
  loading: boolean;
  error: string | null;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<BusinessSettings>(
    DEFAULT_BUSINESS_SETTINGS,
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured ? null : "Firebase is not configured.",
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToSettings(
      (data) => {
        setSettings(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load settings.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading, error };
}
