import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2025-02-24.acme" as never,
    typescript: true,
  });
}

export interface PlanConfig {
  name: string;
  amount: number; // in cents
  currency: string;
  interval?: "month" | "year";
  mode: "subscription" | "payment";
  priceId?: string;
  description: string;
}

export const PRICE_MAP: Record<string, PlanConfig> = {
  "self-serve": {
    name: "Self-Serve",
    amount: 9900, // $99.00/mo
    currency: "usd",
    interval: "month",
    mode: "subscription",
    priceId: process.env.STRIPE_PRICE_SELF_SERVE,
    description: "For founders running their own continuous demand experiments.",
  },
  studio: {
    name: "Startup Studio",
    amount: 99900, // $999.00/mo
    currency: "usd",
    interval: "month",
    mode: "subscription",
    priceId: process.env.STRIPE_PRICE_STUDIO,
    description: "For venture builders validating multiple concepts simultaneously.",
  },
  sprint: {
    name: "Validation Sprint",
    amount: 250000, // $2,500.00 one-time
    currency: "usd",
    mode: "payment",
    priceId: process.env.STRIPE_PRICE_SPRINT,
    description: "Hands-on high-conviction 1-week validation sprint with expert review.",
  },
};
