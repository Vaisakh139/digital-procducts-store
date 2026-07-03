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
  thumbnail: string;
  images: string[];
  videoUrl: string | null;
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
