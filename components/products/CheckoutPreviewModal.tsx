"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Receipt, User, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";
import type { Product } from "@/types/product";

interface CheckoutPreviewModalProps {
  products: Product[];
  onClose: () => void;
}

const customerInfoSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  notes: z.string().trim().optional(),
});

type CustomerInfoValues = z.infer<typeof customerInfoSchema>;

const TAX_RATE = 0.08;

export default function CheckoutPreviewModal({
  products,
  onClose,
}: CheckoutPreviewModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const isOpen = products.length > 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: { name: "", email: "", notes: "" },
  });

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset();
      setIsConfirmed(false);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(
      () => closeButtonRef.current?.focus(),
      50,
    );

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const subtotal = products.reduce((sum, product) => sum + product.price, 0);
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;

  const onSubmit = () => {
    setIsConfirmed(true);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-2xl"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close checkout preview"
              className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface/90 text-foreground/70 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="overflow-y-auto p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                <div>
                  <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
                    Checkout Preview
                  </h2>
                  <p className="mt-1 text-sm text-foreground/60">
                    Review your order details below. No payment will be
                    processed yet.
                  </p>
                </div>

                <section className="flex flex-col gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4 text-brand-500" aria-hidden="true" />
                    Customer Information
                  </h3>
                  <form
                    id="checkout-preview-form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="checkout-name"
                        className="text-xs font-medium text-foreground/70"
                      >
                        Full Name
                      </label>
                      <input
                        id="checkout-name"
                        type="text"
                        placeholder="Jane Doe"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                          errors.name ? "checkout-name-error" : undefined
                        }
                        className="h-10 rounded-xl border border-border-subtle bg-background px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                        {...register("name")}
                      />
                      {errors.name ? (
                        <p id="checkout-name-error" className="text-xs text-red-500">
                          {errors.name.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="checkout-email"
                        className="text-xs font-medium text-foreground/70"
                      >
                        Email
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        placeholder="you@company.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? "checkout-email-error" : undefined
                        }
                        className="h-10 rounded-xl border border-border-subtle bg-background px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                        {...register("email")}
                      />
                      {errors.email ? (
                        <p id="checkout-email-error" className="text-xs text-red-500">
                          {errors.email.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label
                        htmlFor="checkout-notes"
                        className="text-xs font-medium text-foreground/70"
                      >
                        Notes (optional)
                      </label>
                      <textarea
                        id="checkout-notes"
                        rows={2}
                        placeholder="Anything we should know?"
                        className="resize-none rounded-xl border border-border-subtle bg-background px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                        {...register("notes")}
                      />
                    </div>
                  </form>
                </section>

                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">
                    Selected Products ({products.length})
                  </h3>
                  <ul className="flex max-h-48 flex-col gap-3 overflow-y-auto pr-1">
                    {products.map((product) => (
                      <li key={product.id} className="flex items-center gap-3">
                        {product.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.thumbnail}
                            alt=""
                            aria-hidden="true"
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-lg bg-surface-muted" />
                        )}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="line-clamp-1 text-sm font-medium">
                            {product.title}
                          </span>
                          <span className="text-xs text-foreground/50">
                            {product.category}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          ${product.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Receipt className="h-4 w-4 text-brand-500" aria-hidden="true" />
                    Price Breakdown
                  </h3>
                  <div className="flex items-center justify-between text-sm text-foreground/70">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-foreground/70">
                    <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-border-subtle pt-2 text-base font-semibold">
                    <span>Grand Total</span>
                    <span className="text-brand-600 dark:text-brand-400">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </section>

                {isConfirmed ? (
                  <p
                    role="status"
                    className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Order summary saved. Payment integration is coming soon —
                    we&apos;ll follow up by email.
                  </p>
                ) : (
                  <Button
                    type="submit"
                    form="checkout-preview-form"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
