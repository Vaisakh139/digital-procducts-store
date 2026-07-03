import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order, OrderItem, OrderStatus } from "@/types/order";

const ORDERS_COLLECTION = "orders";

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

function toOrderItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      productId: typeof item.productId === "string" ? item.productId : "",
      title: typeof item.title === "string" ? item.title : "",
      price: typeof item.price === "number" ? item.price : 0,
      quantity: typeof item.quantity === "number" ? item.quantity : 1,
    }));
}

const orderConverter: FirestoreDataConverter<Order> = {
  toFirestore(order: Order): DocumentData {
    const { id: _id, ...rest } = order;
    void _id;
    return rest;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Order {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      customerName:
        typeof data.customerName === "string" ? data.customerName : "",
      customerEmail:
        typeof data.customerEmail === "string" ? data.customerEmail : "",
      items: toOrderItems(data.items),
      amount: typeof data.amount === "number" ? data.amount : 0,
      paymentId: typeof data.paymentId === "string" ? data.paymentId : null,
      status: (data.status as OrderStatus) ?? "pending",
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

const ordersRef = collection(db, ORDERS_COLLECTION).withConverter(
  orderConverter,
);

export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError: (error: Error) => void,
): () => void {
  const ordersQuery = query(ordersRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    ordersQuery,
    (snapshot) => onData(snapshot.docs.map((docSnapshot) => docSnapshot.data())),
    (error) => onError(error),
  );
}

const ACTIVE_REVENUE_STATUSES: OrderStatus[] = ["paid", "fulfilled"];

export function isRevenueCountingStatus(status: OrderStatus): boolean {
  return ACTIVE_REVENUE_STATUSES.includes(status);
}

export interface MonthlySalesPoint {
  month: string;
  total: number;
}

/** Buckets order revenue into the trailing N months, ending this month. */
export function getMonthlySales(
  orders: Order[],
  monthsBack = 6,
): MonthlySalesPoint[] {
  const now = new Date();
  const buckets: MonthlySalesPoint[] = Array.from(
    { length: monthsBack },
    (_, i) => {
      const bucketDate = new Date(
        now.getFullYear(),
        now.getMonth() - (monthsBack - 1 - i),
        1,
      );
      return {
        month: bucketDate.toLocaleString("en-US", { month: "short" }),
        total: 0,
      };
    },
  );

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
export function getProductSales(
  orders: Order[],
  limit = 6,
): ProductSalesPoint[] {
  const totals = new Map<string, number>();

  orders.forEach((order) => {
    if (!isRevenueCountingStatus(order.status)) return;
    order.items.forEach((item) => {
      const current = totals.get(item.title) ?? 0;
      totals.set(item.title, current + item.price * item.quantity);
    });
  });

  return Array.from(totals.entries())
    .map(([title, total]) => ({ title, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function getTotalRevenue(orders: Order[]): number {
  return orders
    .filter((order) => isRevenueCountingStatus(order.status))
    .reduce((sum, order) => sum + order.amount, 0);
}
