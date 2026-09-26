import { nanoid } from "nanoid";
import type { PaymentProvider, PaymentIntentResult } from "@/lib/payments/types";

/**
 * Development/demo-only provider — always "succeeds" instantly with no
 * real money movement. Never enable this in production; it exists so the
 * checkout flow can be built and tested before CLKAi signs with a real
 * gateway (Razorpay/Cashfree/PayU/PhonePe).
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createPaymentIntent(input: { orderId: string; amount: number }): Promise<PaymentIntentResult> {
    return {
      providerRefId: `mock_${nanoid(12)}`,
      status: "captured",
    };
  }

  verifyWebhookSignature(): boolean {
    // The mock provider has no real webhooks to verify.
    return true;
  }
}
