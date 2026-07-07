import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
  title: "Admin — Elicso",
  description: "Elicso admin dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AdminAuthProvider>
  );
}
