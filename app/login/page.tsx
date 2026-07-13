"use client";

import { motion } from "framer-motion";
import { Layers, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginForm from "@/components/admin/LoginForm";
import { decodeAuthToken, getAuthToken, isApiConfigured } from "@/lib/apiClient";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const claims = token ? decodeAuthToken(token) : null;
    if (claims?.role === "admin") router.replace("/admin/dashboard");
    else if (claims?.role === "customer") router.replace("/account");
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-coral/20 blur-3xl animate-blob" />
        <div
          className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-gold/20 blur-3xl animate-blob"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl border border-border-subtle bg-surface p-8 shadow-2xl"
      >
        <Link
          href="/"
          aria-label="Close and return home"
          className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface/60 text-foreground/70 transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Link>

        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-plum text-white shadow-lg shadow-plum/30">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-foreground/50" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground/50">Elicso</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-foreground/60">Sign in to your account.</p>
        </div>

        {!isApiConfigured ? (
          <p className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
            The API is not configured. Add NEXT_PUBLIC_API_URL to .env.local
            to enable login.
          </p>
        ) : (
          <div className="mt-6">
            <LoginForm />
          </div>
        )}

        <p className="mt-6 text-center text-sm text-foreground/60">
          New here?{" "}
          <Link href="/signup" className="font-medium text-coral-dark hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
