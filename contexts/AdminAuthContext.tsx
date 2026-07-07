"use client";

import type { User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAdminProfile,
  logout as logoutService,
  onAuthChange,
} from "@/services/authService";
import type { AdminProfile } from "@/types/admin";

interface AdminAuthContextValue {
  firebaseUser: User | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthChange(async (user) => {
      if (cancelled) return;

      if (!user) {
        setFirebaseUser(null);
        setAdminProfile(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(user);

      try {
        const profile = await fetchAdminProfile(user.uid);
        if (cancelled) return;

        if (!profile) {
          // Signed-in user has no admins/{uid} doc (or role != "admin") —
          // not authorized, so don't leave a half-signed-in session around.
          await logoutService();
          setAdminProfile(null);
        } else {
          setAdminProfile(profile);
        }
      } catch {
        if (!cancelled) setAdminProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value: AdminAuthContextValue = {
    firebaseUser,
    adminProfile,
    loading,
    isAdmin: Boolean(adminProfile),
    logout: logoutService,
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
