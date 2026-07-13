"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { z } from "zod";
import ImagePreview from "@/components/admin/ImagePreview";
import Button from "@/components/ui/Button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import {
  deleteImage,
  uploadImage,
  validateImageFile,
} from "@/services/adminUploadService";
import { updateSettings } from "@/services/adminSettingsService";
import type { AdminSettings } from "@/types/adminSettings";

const settingsSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required."),
  supportEmail: z.string().trim().email("Enter a valid email address."),
  logoUrl: z.string().optional(),
  logoPublicId: z.string().optional(),
  twitter: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
  github: z.string().trim().optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

function toFormValues(settings: AdminSettings): SettingsValues {
  return {
    businessName: settings.businessName,
    supportEmail: settings.supportEmail,
    logoUrl: settings.logoUrl ?? "",
    logoPublicId: settings.logoPublicId ?? "",
    twitter: settings.twitter ?? "",
    facebook: settings.facebook ?? "",
    instagram: settings.instagram ?? "",
    linkedin: settings.linkedin ?? "",
    github: settings.github ?? "",
  };
}

export default function AdminSettingsPage() {
  const { adminProfile } = useAdminAuth();
  const { settings, loading } = useAdminSettings();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [logoProgress, setLogoProgress] = useState<number | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      businessName: "",
      supportEmail: "",
      logoUrl: "",
      logoPublicId: "",
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      github: "",
    },
  });

  useEffect(() => {
    if (!settings) return;
    reset(toFormValues(settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const logoUrl = watch("logoUrl");
  const logoPublicId = watch("logoPublicId");

  const handleLogoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setLogoError(validationError);
      return;
    }

    setLogoError(null);
    setLogoProgress(0);
    const previousPublicId = logoPublicId;

    try {
      const result = await uploadImage(file, setLogoProgress);
      setValue("logoUrl", result.secureUrl, { shouldValidate: true });
      setValue("logoPublicId", result.publicId, { shouldValidate: true });
      if (previousPublicId) {
        deleteImage(previousPublicId).catch(() => {});
      }
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : "Failed to upload logo.");
    } finally {
      setLogoProgress(null);
    }
  };

  const handleLogoRemove = () => {
    if (logoPublicId) {
      deleteImage(logoPublicId).catch(() => {});
    }
    setValue("logoUrl", "", { shouldValidate: true });
    setValue("logoPublicId", "", { shouldValidate: true });
  };

  const onSubmit = async (values: SettingsValues) => {
    setFormError(null);
    setSuccessMessage(null);
    try {
      const updated = await updateSettings({
        businessName: values.businessName,
        supportEmail: values.supportEmail,
        logoUrl: values.logoUrl || null,
        logoPublicId: values.logoPublicId || null,
        twitter: values.twitter || null,
        facebook: values.facebook || null,
        instagram: values.instagram || null,
        linkedin: values.linkedin || null,
        github: values.github || null,
      });
      reset(toFormValues(updated));
      setSuccessMessage("Settings saved successfully.");
    } catch {
      setFormError("Failed to save settings. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border-subtle bg-surface p-6">
        <h2 className="text-sm font-semibold">Admin Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-semibold text-white">
            {(adminProfile?.name ?? "A").charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-medium">{adminProfile?.name}</p>
            <p className="text-xs text-foreground/50">{adminProfile?.email}</p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6 rounded-2xl border border-border-subtle bg-surface p-6"
      >
        <h2 className="text-sm font-semibold">Business Settings</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessName" className="text-sm font-medium text-foreground/80">
              Business Name
            </label>
            <input id="businessName" {...register("businessName")} className={inputClass} />
            {errors.businessName ? (
              <p className="text-xs text-red-500">{errors.businessName.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="supportEmail" className="text-sm font-medium text-foreground/80">
              Support Email
            </label>
            <input
              id="supportEmail"
              type="email"
              {...register("supportEmail")}
              className={inputClass}
            />
            {errors.supportEmail ? (
              <p className="text-xs text-red-500">{errors.supportEmail.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground/80">Logo</span>
          <div className="w-40">
            {logoUrl ? (
              <ImagePreview
                src={logoUrl}
                aspect="square"
                progress={logoProgress}
                error={logoError}
                onRemove={handleLogoRemove}
                onReplace={() => logoInputRef.current?.click()}
              />
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoProgress !== null}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-subtle bg-surface text-foreground/50 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-60"
              >
                {logoProgress !== null ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span className="text-xs">{Math.round(logoProgress)}%</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6" aria-hidden="true" />
                    <span className="text-xs">Upload logo</span>
                  </>
                )}
              </button>
            )}
            {logoError && !logoUrl ? (
              <p className="mt-1 text-xs text-red-500">{logoError}</p>
            ) : null}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoFileChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SocialField
            label="Twitter / X"
            placeholder="https://twitter.com/yourhandle"
            name="twitter"
            register={register}
          />
          <SocialField
            label="Facebook"
            placeholder="https://facebook.com/yourpage"
            name="facebook"
            register={register}
          />
          <SocialField
            label="Instagram"
            placeholder="https://instagram.com/yourhandle"
            name="instagram"
            register={register}
          />
          <SocialField
            label="LinkedIn"
            placeholder="https://linkedin.com/company/you"
            name="linkedin"
            register={register}
          />
          <SocialField
            label="GitHub"
            placeholder="https://github.com/yourorg"
            name="github"
            register={register}
          />
        </div>

        {formError ? (
          <p role="alert" className="text-sm text-red-500">
            {formError}
          </p>
        ) : null}
        {successMessage ? (
          <p role="status" className="text-sm text-emerald-600">
            {successMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-fit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30";

function SocialField({
  label,
  placeholder,
  name,
  register,
}: {
  label: string;
  placeholder: string;
  name: keyof SettingsValues;
  register: UseFormRegister<SettingsValues>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      <input {...register(name)} placeholder={placeholder} className={inputClass} />
    </div>
  );
}
