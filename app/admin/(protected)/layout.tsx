"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAdmin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/admin");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" aria-hidden="true" />
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
