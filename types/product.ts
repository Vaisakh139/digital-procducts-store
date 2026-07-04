export const PRODUCT_CATEGORIES = [
  "Templates",
  "Source Code",
  "UI Kits",
  "Ebooks",
  "Courses",
  "Design Assets",
  "Software",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUSES = ["active", "draft"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: ProductCategory;
  price: number;
  /** Cloudinary secure_url for the thumbnail, or "" if none uploaded. */
  thumbnail: string;
  /** Cloudinary public_id for the thumbnail, or null if none uploaded. */
  thumbnailPublicId: string | null;
  /** Cloudinary secure_urls for gallery images, in display order. */
  galleryImages: string[];
  /** Cloudinary public_ids for gallery images — same order as galleryImages. */
  galleryPublicIds: string[];
  videoUrl: string | null;
  /** Firebase Storage download URL for the digital download file (ZIP/PDF). */
  downloadFile: string | null;
  rating: number;
  downloads: number;
  isFeatured: boolean;
  status: ProductStatus;
  features: string[];
  requirements: string[];
  whatsIncluded: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductInput = Omit<
  Product,
  "id" | "rating" | "downloads" | "createdAt" | "updatedAt"
>;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "az", label: "A–Z" },
  { value: "popular", label: "Most Popular" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export interface ProductFilters {
  search: string;
  category: ProductCategory | "All";
  priceRange: [number, number];
  sort: SortOption;
}
