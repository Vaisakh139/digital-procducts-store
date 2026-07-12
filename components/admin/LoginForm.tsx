"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";
import {
  getAuthErrorMessage,
  loginWithEmail,
  sendPasswordReset,
} from "@/services/authService";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

const resetSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
});

type ResetValues = z.infer<typeof resetSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isSendingReset },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const onLoginSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const result = await loginWithEmail(values.email, values.password, values.remember);
      onSuccess?.();
      router.push(result.role === "admin" ? "/admin/dashboard" : "/account");
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  };

  const onResetSubmit = async (values: ResetValues) => {
    setFormError(null);
    try {
      await sendPasswordReset(values.email);
      setResetSent(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  };

  const switchToReset = () => {
    setMode("reset");
    setFormError(null);
    setResetSent(false);
  };

  const switchToLogin = () => {
    setMode("login");
    setFormError(null);
    setResetSent(false);
  };

  if (mode === "reset") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Reset your password
          </h2>
          <p className="text-sm text-foreground/60">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {resetSent ? (
          <p
            role="status"
            className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Check your inbox for a link to reset your password.
          </p>
        ) : (
          <form
            onSubmit={handleResetSubmit(onResetSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reset-email"
                className="text-sm font-medium text-foreground/80"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
                  aria-hidden="true"
                />
                <input
                  id="reset-email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(resetErrors.email)}
                  aria-describedby={
                    resetErrors.email ? "reset-email-error" : undefined
                  }
                  className="w-full rounded-xl border border-border-subtle bg-white/60 py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                  {...registerReset("email")}
                />
              </div>
              {resetErrors.email ? (
                <p id="reset-email-error" className="text-xs text-red-500">
                  {resetErrors.email.message}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p role="alert" className="text-sm text-red-500">
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSendingReset}
            >
              {isSendingReset ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={switchToLogin}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleLoginSubmit(onLoginSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-email" className="text-sm font-medium text-foreground/80">
          Email
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
            aria-hidden="true"
          />
          <input
            id="admin-email"
            type="email"
            autoFocus
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(loginErrors.email)}
            aria-describedby={loginErrors.email ? "admin-email-error" : undefined}
            className="w-full rounded-xl border border-border-subtle bg-white/60 py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            {...registerLogin("email")}
          />
        </div>
        {loginErrors.email ? (
          <p id="admin-email-error" className="text-xs text-red-500">
            {loginErrors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="admin-password" className="text-sm font-medium text-foreground/80">
            Password
          </label>
          <button
            type="button"
            onClick={switchToReset}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
            aria-hidden="true"
          />
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(loginErrors.password)}
            aria-describedby={
              loginErrors.password ? "admin-password-error" : undefined
            }
            className="w-full rounded-xl border border-border-subtle bg-white/60 py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            {...registerLogin("password")}
          />
        </div>
        {loginErrors.password ? (
          <p id="admin-password-error" className="text-xs text-red-500">
            {loginErrors.password.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground/70">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border-subtle accent-[color:var(--color-brand-500)]"
          {...registerLogin("remember")}
        />
        Remember me
      </label>

      {formError ? (
        <p role="alert" className="text-sm text-red-500">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-2 w-full"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? "Signing in…" : "Login"}
      </Button>
    </form>
  );
}
