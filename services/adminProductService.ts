import { apiFetch } from "@/lib/apiClient";
import { toProduct, type RawProduct } from "@/services/storefrontProductService";
import type { Product } from "@/types/storefront";

export interface ProductImageInput {
  url: string;
  publicId: string;
}

export interface ProductInput {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED";
  thumbnailUrl: string;
  thumbnailPublicId: string;
  downloadUrl: string;
  downloadPublicId: string;
  images: ProductImageInput[];
}

export async function listAllProducts(): Promise<Product[]> {
  const raw = await apiFetch<RawProduct[]>("/products/admin/all", { auth: true });
  return raw.map(toProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const raw = await apiFetch<RawProduct>("/products", {
    method: "POST",
    body: input,
    auth: true,
  });
  return toProduct(raw);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const raw = await apiFetch<RawProduct>(`/products/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
  return toProduct(raw);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<null>(`/products/${id}`, { method: "DELETE", auth: true });
}
