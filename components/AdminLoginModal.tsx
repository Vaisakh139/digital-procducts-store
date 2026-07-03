"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { useEffect, useId } from "react";
import LoginForm from "./admin/LoginForm";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
}: AdminLoginModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/5"
          >
            <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close login dialog"
              className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface/60 text-foreground/70 transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="relative flex flex-col gap-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/30">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
                  Admin Login
                </h2>
                <p className="text-sm text-foreground/60">
                  Sign in to manage products, orders, and customers.
                </p>
              </div>

              <LoginForm onSuccess={onClose} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
