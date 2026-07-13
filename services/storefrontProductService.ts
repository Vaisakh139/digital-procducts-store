import { apiFetch, buildQueryString } from "@/lib/apiClient";
import type {
  Category,
  PaginatedProducts,
  Product,
  ProductFilters,
} from "@/types/storefront";

// Prisma's Decimal fields serialize as strings over JSON (not numbers) —
// these three plus the two dates need converting before use.
export interface RawProduct
  extends Omit<Product, "price" | "discountPrice" | "rating" | "createdAt" | "updatedAt"> {
  price: string;
  discountPrice: string | null;
  rating: string;
  createdAt: string;
  updatedAt: string;
}

interface RawPaginatedProducts {
  items: RawProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toProduct(raw: RawProduct): Product {
  return {
    ...raw,
    price: Number(raw.price),
    discountPrice: raw.discountPrice !== null ? Number(raw.discountPrice) : null,
    rating: Number(raw.rating),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

export interface ListProductsParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: ProductFilters["sort"];
  page?: number;
  limit?: number;
}

export async function fetchProducts(
  params: ListProductsParams = {},
): Promise<PaginatedProducts> {
  const query = buildQueryString({ ...params });
  const result = await apiFetch<RawPaginatedProducts>(`/products${query}`);
  return { ...result, items: result.items.map(toProduct) };
}

export async function fetchProductById(id: string): Promise<Product> {
  const raw = await apiFetch<RawProduct>(`/products/${id}`);
  return toProduct(raw);
}

export function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/products/categories");
}
