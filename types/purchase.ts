export type PurchaseStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
export type PurchasePaymentStatus = "CREATED" | "PAID" | "FAILED";

export interface PurchaseItemProduct {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

export interface PurchaseItem {
  id: string;
  price: number;
  quantity: number;
  product: PurchaseItemProduct;
}

export interface PurchasePayment {
  id: string;
  razorpayPaymentId: string | null;
  status: PurchasePaymentStatus;
}

export interface Purchase {
  id: string;
  orderNumber: string;
  amount: number;
  status: PurchaseStatus;
  items: PurchaseItem[];
  payment: PurchasePayment | null;
  createdAt: Date;
}

/** One purchased product, flattened out of its parent order for display. */
export interface PurchaseLineItem {
  key: string;
  product: PurchaseItemProduct;
  quantity: number;
  amountPaid: number;
  purchaseDate: Date;
  orderNumber: string;
  orderId: string;
  paymentId: string | null;
  status: PurchaseStatus;
}

export function flattenPurchases(purchases: Purchase[]): PurchaseLineItem[] {
  return purchases.flatMap((purchase) =>
    purchase.items.map((item) => ({
      key: `${purchase.id}-${item.id}`,
      product: item.product,
      quantity: item.quantity,
      amountPaid: item.price * item.quantity,
      purchaseDate: purchase.createdAt,
      orderNumber: purchase.orderNumber,
      orderId: purchase.id,
      paymentId: purchase.payment?.razorpayPaymentId ?? null,
      status: purchase.status,
    })),
  );
}
