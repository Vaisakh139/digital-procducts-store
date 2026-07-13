export interface AdminSettings {
  businessName: string;
  supportEmail: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  twitter: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  github: string | null;
  updatedAt: Date;
}

export type AdminSettingsInput = Omit<AdminSettings, "updatedAt">;
