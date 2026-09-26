/**
 * Gateway-agnostic payment interface. CLKAi hasn't picked a provider
 * yet, so nothing here talks to a real gateway — swap MockPaymentProvider
 * for a RazorpayPaymentProvider (or Cashfree/PayU/PhonePe) implementing
 * this same interface once a merchant account exists, and no caller code
 * changes. Never have an implementation accept or store raw card/UPI
 * credentials — every real gateway integration must use its hosted
 * checkout / tokenized flow.
 */
export interface PaymentIntentResult {
  providerRefId: string;
  status: "authorized" | "captured" | "failed";
  checkoutUrl?: string; // where to redirect the customer for hosted checkout, if applicable
}

export interface PaymentProvider {
  readonly name: string;
  createPaymentIntent(input: { orderId: string; amount: number; currency: "INR" }): Promise<PaymentIntentResult>;
  verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean;
}
