"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LogOut, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { changeMyPassword, updateMyProfile } from "@/services/customerService";
import { getAuthErrorMessage } from "@/services/authService";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: z.string().trim().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const inputClasses =
  "w-full rounded-xl border border-border-subtle bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-coral focus:ring-2 focus:ring-coral/30 disabled:cursor-not-allowed disabled:opacity-60";

export default function AccountPage() {
  const router = useRouter();
  const { customerProfile, refreshProfile, logout } = useCustomerAuth();

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isSavingProfile },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: customerProfile?.name ?? "",
      phone: customerProfile?.phone ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onProfileSubmit = async (values: ProfileValues) => {
    setProfileError(null);
    setProfileSuccess(false);
    try {
      await updateMyProfile(values);
      await refreshProfile();
      setProfileSuccess(true);
    } catch (error) {
      setProfileError(getAuthErrorMessage(error));
    }
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await changeMyPassword(values);
      setPasswordSuccess(true);
      resetPasswordForm();
    } catch (error) {
      setPasswordError(getAuthErrorMessage(error));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Manage your profile and password.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          icon={<LogOut className="h-4 w-4" aria-hidden="true" />}
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>

      <form
        onSubmit={handleProfileSubmit(onProfileSubmit)}
        noValidate
        className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-6"
      >
        <h2 className="text-sm font-semibold">Profile</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="account-name" className="text-xs font-medium text-foreground/70">
            Full name
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
              aria-hidden="true"
            />
            <input
              id="account-name"
              type="text"
              aria-invalid={Boolean(profileErrors.name)}
              className={`${inputClasses} pl-10`}
              {...registerProfile("name")}
            />
          </div>
          {profileErrors.name ? (
            <p className="text-xs text-red-500">{profileErrors.name.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="account-email" className="text-xs font-medium text-foreground/70">
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
              aria-hidden="true"
            />
            <input
              id="account-email"
              type="email"
              value={customerProfile?.email ?? ""}
              disabled
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="account-phone" className="text-xs font-medium text-foreground/70">
            Phone (optional)
          </label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
              aria-hidden="true"
            />
            <input
              id="account-phone"
              type="tel"
              className={`${inputClasses} pl-10`}
              {...registerProfile("phone")}
            />
          </div>
        </div>

        {profileError ? <p className="text-sm text-red-500">{profileError}</p> : null}
        {profileSuccess ? (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Profile updated.
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="md" className="w-fit" disabled={isSavingProfile}>
          {isSavingProfile ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <form
        onSubmit={handlePasswordSubmit(onPasswordSubmit)}
        noValidate
        className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-6"
      >
        <h2 className="text-sm font-semibold">Change password</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="current-password" className="text-xs font-medium text-foreground/70">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(passwordErrors.currentPassword)}
            className={inputClasses}
            {...registerPassword("currentPassword")}
          />
          {passwordErrors.currentPassword ? (
            <p className="text-xs text-red-500">{passwordErrors.currentPassword.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-password" className="text-xs font-medium text-foreground/70">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(passwordErrors.newPassword)}
            className={inputClasses}
            {...registerPassword("newPassword")}
          />
          {passwordErrors.newPassword ? (
            <p className="text-xs text-red-500">{passwordErrors.newPassword.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-new-password" className="text-xs font-medium text-foreground/70">
            Confirm new password
          </label>
          <input
            id="confirm-new-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(passwordErrors.confirmNewPassword)}
            className={inputClasses}
            {...registerPassword("confirmNewPassword")}
          />
          {passwordErrors.confirmNewPassword ? (
            <p className="text-xs text-red-500">{passwordErrors.confirmNewPassword.message}</p>
          ) : null}
        </div>

        {passwordError ? <p className="text-sm text-red-500">{passwordError}</p> : null}
        {passwordSuccess ? (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Password updated.
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-fit"
          disabled={isChangingPassword}
        >
          {isChangingPassword ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
