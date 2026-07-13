export const ORDER_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface AdminOrderCustomer {
  id: string;
  name: string;
  email: string;
}

export interface AdminOrderProduct {
  id: string;
  title: string;
}

export interface AdminOrderItem {
  id: string;
  price: number;
  quantity: number;
  product: AdminOrderProduct;
}

export interface AdminOrderPayment {
  id: string;
  razorpayPaymentId: string | null;
  status: "CREATED" | "PAID" | "FAILED";
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  amount: number;
  status: OrderStatus;
  customer: AdminOrderCustomer;
  items: AdminOrderItem[];
  payment: AdminOrderPayment | null;
  createdAt: Date;
}
