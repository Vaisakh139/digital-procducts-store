"use client";

import { motion } from "framer-motion";
import { Layers, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginForm from "@/components/admin/LoginForm";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-background to-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl animate-blob" />
        <div
          className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent-400/25 blur-3xl animate-blob"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl border border-border-subtle bg-surface p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-plum text-white shadow-lg shadow-plum/30">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-foreground/50" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground/50">
              Elicso Admin
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-foreground/60">
            Sign in to manage products, orders, and customers.
          </p>
        </div>

        {!isFirebaseConfigured ? (
          <p className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
            Firebase is not configured. Add your project credentials to
            .env.local to enable admin login.
          </p>
        ) : (
          <div className="mt-6">
            <LoginForm />
          </div>
        )}
      </motion.div>
    </div>
  );
}
