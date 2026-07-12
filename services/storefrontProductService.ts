import { apiFetch, buildQueryString } from "@/lib/apiClient";
import type {
  Category,
  PaginatedProducts,
  Product,
  ProductFilters,
} from "@/types/storefront";

interface RawProduct extends Omit<Product, "createdAt" | "updatedAt"> {
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

function toProduct(raw: RawProduct): Product {
  return {
    ...raw,
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
