import { apiFetch } from "@/lib/apiClient";
import type {
  Purchase,
  PurchaseItemProduct,
  PurchasePaymentStatus,
  PurchaseStatus,
} from "@/types/purchase";

interface RawPurchase {
  id: string;
  orderNumber: string;
  amount: string;
  status: PurchaseStatus;
  createdAt: string;
  items: {
    id: string;
    price: string;
    quantity: number;
    product: PurchaseItemProduct;
  }[];
  payment: {
    id: string;
    razorpayPaymentId: string | null;
    status: PurchasePaymentStatus;
  } | null;
}

function toPurchase(raw: RawPurchase): Purchase {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    amount: Number(raw.amount),
    status: raw.status,
    createdAt: new Date(raw.createdAt),
    items: raw.items.map((item) => ({
      id: item.id,
      price: Number(item.price),
      quantity: item.quantity,
      product: item.product,
    })),
    payment: raw.payment,
  };
}

export async function getMyPurchases(): Promise<Purchase[]> {
  const raw = await apiFetch<RawPurchase[]>("/orders/mine", { auth: true });
  return raw.map(toPurchase);
}
