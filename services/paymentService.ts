import { apiFetch } from "@/lib/apiClient";

export interface CreatePaymentOrderInput {
  customer?: { name: string; email: string; phone?: string };
  productIds: string[];
}

export interface CreatePaymentOrderResult {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
}

interface RawCreatePaymentOrderResult extends Omit<CreatePaymentOrderResult, "amount"> {
  amount: string;
}

export async function createPaymentOrder(
  input: CreatePaymentOrderInput,
): Promise<CreatePaymentOrderResult> {
  const raw = await apiFetch<RawCreatePaymentOrderResult>("/payment/create-order", {
    method: "POST",
    body: input,
    // Safe for guests too — apiFetch only attaches the Authorization header
    // when a token actually exists in storage.
    auth: true,
  });
  return { ...raw, amount: Number(raw.amount) };
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResult {
  orderNumber: string;
  status: string;
}

export function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  return apiFetch<VerifyPaymentResult>("/payment/verify", {
    method: "POST",
    body: input,
  });
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve();
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load the payment gateway. Please try again."));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}
