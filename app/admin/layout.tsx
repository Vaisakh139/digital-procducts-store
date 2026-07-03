import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

export const metadata: Metadata = {
  title: "Admin — Digiora",
  description: "Digiora admin dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
