export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  amount: number;
  paymentId: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
