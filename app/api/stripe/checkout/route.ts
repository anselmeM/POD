import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { getStripe, PRICE_MAP } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const key = String(body.plan || "self-serve").toLowerCase();
  const planConfig = PRICE_MAP[key];

  if (!planConfig) {
    return NextResponse.json({ error: `Invalid plan: "${key}"` }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    // Development fallback when Stripe API keys are unconfigured
    return NextResponse.json({
      url: `/dashboard/settings?mock_checkout=${key}`,
      mock: true,
      message: "Stripe keys not configured. Simulating checkout for development.",
    });
  }

  try {
    const origin = req.headers.get("origin") || req.nextUrl.origin || "https://pod-blue-nine.vercel.app";

    // Re-use or retrieve Stripe customer
    let customerId = ctx.workspace.stripeCustomerId || undefined;

    if (!customerId) {
      const existingCustomers = await stripe.customers.list({
        email: ctx.user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: ctx.user.email,
          name: ctx.user.name || undefined,
          metadata: {
            workspaceId: ctx.workspace.id,
            userId: ctx.user.id,
          },
        });
        customerId = newCustomer.id;
      }

      // Save customer ID on workspace
      await prisma.workspace.update({
        where: { id: ctx.workspace.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const line_items: any[] = planConfig.priceId
      ? [{ price: planConfig.priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: planConfig.currency,
              product_data: {
                name: `Proof of Demand — ${planConfig.name}`,
                description: planConfig.description,
              },
              unit_amount: planConfig.amount,
              ...(planConfig.mode === "subscription"
                ? { recurring: { interval: planConfig.interval || "month" } }
                : {}),
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: planConfig.mode,
      customer: customerId,
      client_reference_id: ctx.workspace.id,
      metadata: {
        workspaceId: ctx.workspace.id,
        userId: ctx.user.id,
        planKey: key,
      },
      subscription_data:
        planConfig.mode === "subscription"
          ? {
              metadata: {
                workspaceId: ctx.workspace.id,
                userId: ctx.user.id,
                planKey: key,
              },
            }
          : undefined,
      line_items,
      success_url: `${origin}/dashboard/settings?billing_success=1&plan=${key}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
