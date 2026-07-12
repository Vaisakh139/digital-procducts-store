export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  position: number;
}

export type ProductStatus = "DRAFT" | "PUBLISHED";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  isFeatured: boolean;
  status: ProductStatus;
  rating: number;
  downloadsCount: number;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  downloadUrl: string;
  downloadPublicId: string;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

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
  categoryId: string | "All";
  priceRange: [number, number];
  sort: SortOption;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** The price to charge/display — the discount price when one is set. */
export function getDisplayPrice(product: Product): number {
  return product.discountPrice ?? product.price;
}
