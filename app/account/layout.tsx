"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { CustomerAuthProvider, useCustomerAuth } from "@/contexts/CustomerAuthContext";

function ProtectedAccountArea({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isCustomer, loading } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !isCustomer) {
      router.replace("/login");
    }
  }, [loading, isCustomer, router]);

  if (loading || !isCustomer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" aria-hidden="true" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <ProtectedAccountArea>{children}</ProtectedAccountArea>
    </CustomerAuthProvider>
  );
}
