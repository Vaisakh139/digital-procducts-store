export interface SocialLinks {
  twitter: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  github: string;
}

export interface BusinessSettings {
  businessName: string;
  supportEmail: string;
  logoUrl: string | null;
  socialLinks: SocialLinks;
  updatedAt: Date;
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "Digiora",
  supportEmail: "support@digiora.com",
  logoUrl: null,
  socialLinks: {
    twitter: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    github: "",
  },
  updatedAt: new Date(0),
};
