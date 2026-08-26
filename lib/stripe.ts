import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acme" as never });
}

export const PRICE_MAP: Record<string, { amount: number; name: string }> = {
  sprint: { amount: 9900, name: "Sprint" },
  "self-serve": { amount: 29900, name: "Self-Serve" },
  studio: { amount: 99900, name: "Studio" },
};
