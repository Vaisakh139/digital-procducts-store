"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, decodeAuthToken, getAuthToken, setAuthToken } from "@/lib/apiClient";
import type { AdminProfile } from "@/types/admin";

interface AdminAuthContextValue {
  adminProfile: AdminProfile | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

interface AdminProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const token = getAuthToken();
    const claims = token ? decodeAuthToken(token) : null;

    if (!claims || claims.role !== "admin") {
      // One-time read of a token already sitting in storage at mount, not a
      // subscription — nothing external to await before resolving.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminProfile(null);
      setLoading(false);
      return;
    }

    // The decoded claims are enough to know "this looks like an admin
    // token", but the profile fetch is what actually confirms the token is
    // still valid (not expired/revoked) against the backend.
    apiFetch<AdminProfileResponse>("/admin/profile", { auth: true })
      .then((profile) => {
        if (cancelled) return;
        setAdminProfile({
          uid: profile.id,
          email: profile.email,
          name: profile.name,
          role: "admin",
          avatarUrl: null,
        });
      })
      .catch(() => {
        if (!cancelled) setAdminProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    setAuthToken(null);
    setAdminProfile(null);
  };

  const value: AdminAuthContextValue = {
    adminProfile,
    loading,
    isAdmin: Boolean(adminProfile),
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
