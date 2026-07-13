import { apiFetch, buildQueryString } from "@/lib/apiClient";
import type { AdminOrder, AdminOrderItem, OrderStatus } from "@/types/adminOrder";

interface RawOrderItem extends Omit<AdminOrderItem, "price"> {
  price: string;
}

interface RawOrder extends Omit<AdminOrder, "amount" | "items" | "createdAt"> {
  amount: string;
  items: RawOrderItem[];
  createdAt: string;
}

interface RawPaginatedOrders {
  items: RawOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function toOrder(raw: RawOrder): AdminOrder {
  return {
    ...raw,
    amount: Number(raw.amount),
    createdAt: new Date(raw.createdAt),
    items: raw.items.map((item) => ({ ...item, price: Number(item.price) })),
  };
}

export async function listOrders(): Promise<AdminOrder[]> {
  const query = buildQueryString({ page: 1, limit: 1000 });
  const result = await apiFetch<RawPaginatedOrders>(`/orders${query}`, { auth: true });
  return result.items.map(toOrder);
}

const REVENUE_COUNTING_STATUSES: OrderStatus[] = ["PAID"];

export function isRevenueCountingStatus(status: OrderStatus): boolean {
  return REVENUE_COUNTING_STATUSES.includes(status);
}

export interface MonthlySalesPoint {
  month: string;
  total: number;
}

/** Buckets order revenue into the trailing N months, ending this month. */
export function getMonthlySales(orders: AdminOrder[], monthsBack = 6): MonthlySalesPoint[] {
  const now = new Date();
  const buckets: MonthlySalesPoint[] = Array.from({ length: monthsBack }, (_, i) => {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
    return { month: bucketDate.toLocaleString("en-US", { month: "short" }), total: 0 };
  });

  orders.forEach((order) => {
    if (!isRevenueCountingStatus(order.status)) return;
    const monthsAgo =
      (now.getFullYear() - order.createdAt.getFullYear()) * 12 +
      (now.getMonth() - order.createdAt.getMonth());
    if (monthsAgo < 0 || monthsAgo >= monthsBack) return;
    const bucket = buckets[monthsBack - 1 - monthsAgo];
    if (bucket) bucket.total += order.amount;
  });

  return buckets;
}

export interface ProductSalesPoint {
  title: string;
  total: number;
}

/** Aggregates revenue per product across all orders, highest first. */
export function getProductSales(orders: AdminOrder[], limit = 6): ProductSalesPoint[] {
  const totals = new Map<string, number>();

  orders.forEach((order) => {
    if (!isRevenueCountingStatus(order.status)) return;
    order.items.forEach((item) => {
      const current = totals.get(item.product.title) ?? 0;
      totals.set(item.product.title, current + item.price * item.quantity);
    });
  });

  return Array.from(totals.entries())
    .map(([title, total]) => ({ title, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function getTotalRevenue(orders: AdminOrder[]): number {
  return orders
    .filter((order) => isRevenueCountingStatus(order.status))
    .reduce((sum, order) => sum + order.amount, 0);
}
