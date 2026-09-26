import type { PaymentProvider } from "@/lib/payments/types";
import { MockPaymentProvider } from "@/lib/payments/mock";

/**
 * Resolves the active payment provider from PAYMENT_PROVIDER. Only "mock"
 * is implemented today. When CLKAi selects a real gateway, add e.g.
 * lib/payments/razorpay.ts implementing PaymentProvider and a case here —
 * no other file in the app needs to change.
 */
export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER ?? "mock";

  switch (configured) {
    case "mock":
      return new MockPaymentProvider();
    default:
      throw new Error(
        `Payment provider "${configured}" is not implemented yet. Only "mock" is available until CLKAi selects and configures a real gateway.`
      );
  }
}
