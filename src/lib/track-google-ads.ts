const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GA_CONVERSION_LABEL_PURCHASE;

interface PurchaseParams {
  value: number;
  currency: string;
  transactionId: string;
}

export function trackGoogleAdsPurchase({
  value,
  currency,
  transactionId,
}: PurchaseParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  if (!GA_MEASUREMENT_ID || !GA_CONVERSION_LABEL) return;

  window.gtag("event", "conversion", {
    send_to: `${GA_MEASUREMENT_ID}/${GA_CONVERSION_LABEL}`,
    value,
    currency,
    transaction_id: transactionId,
  });
}
