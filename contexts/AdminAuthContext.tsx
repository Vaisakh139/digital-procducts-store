"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, type ReactNode } from "react";
import { logout as logoutService } from "@/services/authService";
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
  const value: AdminAuthContextValue = {
    firebaseUser: null,
    adminProfile: { uid: "qa", email: "admin@digiora.com", name: "QA Admin", role: "admin", avatarUrl: null },
    loading: false,
    isAdmin: true,
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
