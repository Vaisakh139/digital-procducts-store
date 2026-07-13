"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Mail, Receipt, User, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  createPaymentOrder,
  loadRazorpayScript,
  verifyPayment,
} from "@/services/paymentService";
import { getDisplayPrice, type Product } from "@/types/storefront";
import type { RazorpayHandlerResponse } from "@/types/razorpay";

interface CheckoutPreviewModalProps {
  products: Product[];
  onClose: () => void;
}

const guestInfoSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
});

type GuestInfoValues = z.infer<typeof guestInfoSchema>;

type CheckoutStatus = "idle" | "processing" | "success" | "error";

// No tax model exists on the backend yet — this is an honest $0 placeholder
// so the line item is visible (per "GST if applicable") without charging
// anything the backend won't actually collect.
const GST_RATE = 0;

export default function CheckoutPreviewModal({
  products,
  onClose,
}: CheckoutPreviewModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const { showToast } = useToast();
  const { isCustomer, customerProfile } = useCustomerAuth();

  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isOpen = products.length > 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestInfoValues>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset();
      setStatus("idle");
      setErrorMessage(null);
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

  const subtotal = products.reduce((sum, product) => sum + getDisplayPrice(product), 0);
  const gst = subtotal * GST_RATE;
  const grandTotal = subtotal + gst;

  const handlePaymentSuccess = async (response: RazorpayHandlerResponse) => {
    try {
      await verifyPayment(response);
      setStatus("success");
      showToast("success", "Payment successful!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Payment verification failed.";
      setErrorMessage(message);
      setStatus("error");
      showToast("error", message);
    }
  };

  const startCheckout = async (guestInfo?: { name: string; email: string }) => {
    setStatus("processing");
    setErrorMessage(null);

    try {
      const order = await createPaymentOrder({
        customer: guestInfo,
        productIds: products.map((product) => product.id),
      });

      await loadRazorpayScript();

      const razorpay = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: "Elicso",
        description:
          products.length === 1 ? products[0].title : `${products.length} products`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: guestInfo?.name ?? customerProfile?.name,
          email: guestInfo?.email ?? customerProfile?.email,
        },
        theme: { color: "#E8674A" },
        handler: (response) => {
          void handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: () => {
            setStatus((current) => (current === "processing" ? "idle" : current));
          },
        },
      });

      razorpay.open();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setStatus("error");
      showToast("error", message);
    }
  };

  const onGuestSubmit = (values: GuestInfoValues) => {
    void startCheckout(values);
  };

  const isProcessing = status === "processing";

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
              aria-label="Close checkout"
              className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface/90 text-foreground/70 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="overflow-y-auto p-6 lg:p-8">
              {status === "success" ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Payment successful
                  </h2>
                  <p className="max-w-sm text-sm leading-relaxed text-foreground/70">
                    {isCustomer
                      ? "Your purchase is confirmed. You can find your download anytime under Purchases."
                      : "Your purchase is confirmed. Order details will be sent to your email — sign up using the same email later to access your complete purchase history."}
                  </p>
                  <Button variant="primary" size="md" onClick={onClose}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
                      Checkout
                    </h2>
                    <p className="mt-1 text-sm text-foreground/60">
                      Review your order and pay securely with Razorpay.
                    </p>
                  </div>

                  {isCustomer ? (
                    <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm">
                      <User className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                      <span className="text-foreground/70">
                        Paying as{" "}
                        <span className="font-medium text-foreground">
                          {customerProfile?.name}
                        </span>{" "}
                        ({customerProfile?.email})
                      </span>
                    </div>
                  ) : (
                    <section className="flex flex-col gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <User className="h-4 w-4 text-brand-500" aria-hidden="true" />
                        Your details
                      </h3>
                      <form
                        id="checkout-guest-form"
                        onSubmit={handleSubmit(onGuestSubmit)}
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
                            className="h-10 rounded-xl border border-border-subtle bg-background px-3.5 text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
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
                            className="h-10 rounded-xl border border-border-subtle bg-background px-3.5 text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                            {...register("email")}
                          />
                          {errors.email ? (
                            <p id="checkout-email-error" className="text-xs text-red-500">
                              {errors.email.message}
                            </p>
                          ) : null}
                        </div>
                      </form>

                      <p className="flex items-start gap-2 rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-foreground/60">
                        <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        Order details will be sent to your email. Sign up using the
                        same email later to access your complete purchase history.
                      </p>
                    </section>
                  )}

                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold">
                      Products ({products.length})
                    </h3>
                    <ul className="flex max-h-40 flex-col gap-3 overflow-y-auto pr-1">
                      {products.map((product) => (
                        <li key={product.id} className="flex items-center gap-3">
                          {product.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.thumbnailUrl}
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
                              {product.category.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            ${getDisplayPrice(product).toFixed(2)}
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
                      <span>GST ({Math.round(GST_RATE * 100)}%)</span>
                      <span>${gst.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between border-t border-border-subtle pt-2 text-base font-semibold">
                      <span>Total</span>
                      <span className="text-brand-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </section>

                  {errorMessage ? (
                    <p role="alert" className="text-sm text-red-500">
                      {errorMessage}
                    </p>
                  ) : null}

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      disabled={isProcessing}
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type={isCustomer ? "button" : "submit"}
                      form={isCustomer ? undefined : "checkout-guest-form"}
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      disabled={isProcessing}
                      onClick={isCustomer ? () => void startCheckout() : undefined}
                    >
                      {isProcessing ? "Processing…" : `Pay Now — $${grandTotal.toFixed(2)}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
