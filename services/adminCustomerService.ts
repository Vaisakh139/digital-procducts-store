import { apiFetch, buildQueryString } from "@/lib/apiClient";
import type { AdminCustomer } from "@/types/adminCustomer";

interface RawCustomer extends Omit<AdminCustomer, "createdAt"> {
  createdAt: string;
}

interface RawPaginatedCustomers {
  items: RawCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function toCustomer(raw: RawCustomer): AdminCustomer {
  return { ...raw, createdAt: new Date(raw.createdAt) };
}

export async function listCustomers(): Promise<AdminCustomer[]> {
  const query = buildQueryString({ page: 1, limit: 1000 });
  const result = await apiFetch<RawPaginatedCustomers>(`/customers${query}`, { auth: true });
  return result.items.map(toCustomer);
}
