/**
 * ============================================================================
 * STRIPE BILLING & MONETIZATION CONFIGURATION
 * ============================================================================
 *
 * This module configures the official Stripe SDK client and defines pricing
 * tier metadata for Proof of Demand's monetization model.
 *
 * Monetization Architecture:
 * --------------------------
 * PoD supports two distinct billing modes:
 *
 * 1. RECURRING SUBSCRIPTIONS:
 *    - Self-Serve ($99/mo): Continuous demand validation for early-stage founders.
 *    - Startup Studio ($999/mo): Multi-concept command center for venture builders and studios.
 *
 * 2. ONE-TIME FIXED PAYMENTS:
 *    - Validation Sprint ($2,500 one-time): A hands-on, high-conviction 7-day validation
 *      sprint with dedicated human audit and review.
 *
 * Dynamic Price Resolution:
 * -------------------------
 * If custom Stripe Price IDs (`price_...`) are not configured in environment variables,
 * the checkout session creator dynamically creates on-the-fly line items using
 * `price_data` with the predefined amounts and currencies. This enables immediate
 * local testing and staging deployment without pre-creating products in Stripe Dashboard.
 */

import Stripe from "stripe";

/**
 * Initializes and returns a singleton-like Stripe API client instance.
 * Returns `null` if `STRIPE_SECRET_KEY` is not defined in environment variables.
 *
 * @returns {Stripe | null} Configured Stripe client or null
 *
 * @example
 * ```ts
 * const stripe = getStripe();
 * if (!stripe) {
 *   return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
 * }
 * const session = await stripe.checkout.sessions.create({ ... });
 * ```
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2025-02-24.acme" as never,
    typescript: true,
  });
}

/**
 * Configuration and metadata for a PoD billing tier.
 */
export interface PlanConfig {
  /** Display title of the plan */
  name: string;
  /** Cost in smallest currency unit (e.g. 9900 cents = $99.00 USD) */
  amount: number;
  /** ISO 3-letter currency code */
  currency: string;
  /** Billing cadence for recurring subscriptions */
  interval?: "month" | "year";
  /** Checkout mode: "subscription" for recurring, "payment" for one-time */
  mode: "subscription" | "payment";
  /** Optional pre-created Stripe Price ID from the Stripe Dashboard */
  priceId?: string;
  /** User-facing plan description */
  description: string;
}

/**
 * Registry of standard Proof of Demand plan configurations.
 */
export const PRICE_MAP: Record<string, PlanConfig> = {
  "self-serve": {
    name: "Self-Serve",
    amount: 9900, // $99.00/mo
    currency: "usd",
    interval: "month",
    mode: "subscription",
    priceId:
      process.env.STRIPE_PRICE_SELF_SERVE ||
      process.env.STRIPE_PRICE_ID_SELF_SERVE ||
      process.env.STRIPE_PRICE_ID_STARTER ||
      process.env.STRIPE_PRICE_STARTER ||
      process.env.STRIPE_PRICE_ID_GROWTH ||
      process.env.STRIPE_PRICE_GROWTH,
    description: "For founders running their own continuous demand experiments.",
  },
  studio: {
    name: "Startup Studio",
    amount: 99900, // $999.00/mo
    currency: "usd",
    interval: "month",
    mode: "subscription",
    priceId:
      process.env.STRIPE_PRICE_STUDIO ||
      process.env.STRIPE_PRICE_ID_STUDIO ||
      process.env.STRIPE_PRICE_ID_ENTERPRISE ||
      process.env.STRIPE_PRICE_ENTERPRISE,
    description: "For venture builders validating multiple concepts simultaneously.",
  },
  sprint: {
    name: "Validation Sprint",
    amount: 250000, // $2,500.00 one-time
    currency: "usd",
    mode: "payment",
    priceId: process.env.STRIPE_PRICE_SPRINT || process.env.STRIPE_PRICE_ID_SPRINT,
    description: "Hands-on high-conviction 1-week validation sprint with expert review.",
  },
};

// Aliases for SaaS naming convention compatibility
PRICE_MAP["starter"] = PRICE_MAP["self-serve"];
PRICE_MAP["growth"] = PRICE_MAP["self-serve"];
PRICE_MAP["enterprise"] = PRICE_MAP["studio"];

/**
 * Resolves a normalized `PlanConfig` from a user-supplied plan identifier string.
 *
 * @param {string} rawPlan The requested plan key (e.g. "self-serve", "studio", "growth")
 * @returns {PlanConfig | undefined} The matched plan configuration or undefined
 */
export function resolvePlanConfig(rawPlan: string): PlanConfig | undefined {
  const normalized = (rawPlan || "").toLowerCase().trim();
  return PRICE_MAP[normalized];
}
