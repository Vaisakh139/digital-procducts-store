"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToMessages } from "@/services/messageService";
import type { ContactMessage } from "@/types/message";

interface UseMessagesResult {
  messages: ContactMessage[];
  loading: boolean;
  error: string | null;
}

export function useMessages(): UseMessagesResult {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured ? null : "Firebase is not configured.",
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToMessages(
      (data) => {
        setMessages(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load messages.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { messages, loading, error };
}
