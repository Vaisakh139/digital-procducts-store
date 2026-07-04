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
  /** Cloudinary secure_url for the business logo, or null if none uploaded. */
  logoUrl: string | null;
  /** Cloudinary public_id for the business logo, or null if none uploaded. */
  logoPublicId: string | null;
  socialLinks: SocialLinks;
  updatedAt: Date;
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "Digiora",
  supportEmail: "support@digiora.com",
  logoUrl: null,
  logoPublicId: null,
  socialLinks: {
    twitter: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    github: "",
  },
  updatedAt: new Date(0),
};
