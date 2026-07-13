"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Layers, Lock, Mail, Phone, ShieldCheck, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { isApiConfigured } from "@/lib/apiClient";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getAuthErrorMessage } from "@/services/authService";
import { signup } from "@/services/customerService";

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

const inputClasses =
  "w-full rounded-xl border border-border-subtle bg-background py-2.5 pr-4 pl-10 text-sm outline-none transition-colors focus:border-coral focus:ring-2 focus:ring-coral/30";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshProfile } = useCustomerAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SignupValues) => {
    setFormError(null);
    try {
      await signup({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      });
      showToast("success", "Account created successfully.");
      await refreshProfile();
      router.push("/account");
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setFormError(message);
      showToast("error", message);
    }
  };

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
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-foreground/60">
            Sign up to track your orders and manage your details.
          </p>
        </div>

        {!isApiConfigured ? (
          <p className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
            The API is not configured. Add NEXT_PUBLIC_API_URL to .env.local
            to enable sign up.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-name" className="text-sm font-medium text-foreground/80">
                Full name
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
                  aria-hidden="true"
                />
                <input
                  id="signup-name"
                  type="text"
                  autoFocus
                  autoComplete="name"
                  placeholder="Jane Doe"
                  aria-invalid={Boolean(errors.name)}
                  className={inputClasses}
                  {...register("name")}
                />
              </div>
              {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-email" className="text-sm font-medium text-foreground/80">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
                  aria-hidden="true"
                />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                  className={inputClasses}
                  {...register("email")}
                />
              </div>
              {errors.email ? <p className="text-xs text-red-500">{errors.email.message}</p> : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-phone" className="text-sm font-medium text-foreground/80">
                Phone (optional)
              </label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
                  aria-hidden="true"
                />
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                  aria-invalid={Boolean(errors.phone)}
                  className={inputClasses}
                  {...register("phone")}
                />
              </div>
              {errors.phone ? <p className="text-xs text-red-500">{errors.phone.message}</p> : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-password" className="text-sm font-medium text-foreground/80">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
                  aria-hidden="true"
                />
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.password)}
                  className={inputClasses}
                  {...register("password")}
                />
              </div>
              {errors.password ? (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signup-confirm-password"
                className="text-sm font-medium text-foreground/80"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
                  aria-hidden="true"
                />
                <input
                  id="signup-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className={inputClasses}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword ? (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            {formError ? <p role="alert" className="text-sm text-red-500">{formError}</p> : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-2 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-foreground/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-coral-dark hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
