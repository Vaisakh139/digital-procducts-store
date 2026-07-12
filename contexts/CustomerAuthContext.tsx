"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { decodeAuthToken, getAuthToken, setAuthToken } from "@/lib/apiClient";
import { getMyProfile } from "@/services/customerService";
import type { CustomerProfile } from "@/types/customer";

interface CustomerAuthContextValue {
  customerProfile: CustomerProfile | null;
  loading: boolean;
  isCustomer: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(
  undefined,
);

/** Pure fetch, no side effects — safe to call from an effect or a handler alike. */
async function fetchProfile(): Promise<CustomerProfile | null> {
  const token = getAuthToken();
  const claims = token ? decodeAuthToken(token) : null;
  if (!claims || claims.role !== "customer") return null;

  try {
    return await getMyProfile();
  } catch {
    return null;
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchProfile().then((profile) => {
      if (cancelled) return;
      setCustomerProfile(profile);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await fetchProfile();
    setCustomerProfile(profile);
  }, []);

  const logout = () => {
    setAuthToken(null);
    setCustomerProfile(null);
  };

  const value: CustomerAuthContextValue = {
    customerProfile,
    loading,
    isCustomer: Boolean(customerProfile),
    refreshProfile,
    logout,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
