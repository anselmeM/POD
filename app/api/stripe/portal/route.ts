import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace } from "@/lib/workspace";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const ctx = await getAuthenticatedWorkspace(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  const origin =
    req.headers.get("origin") ||
    req.nextUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  if (!stripe) {
    return NextResponse.json({
      url: `/dashboard/billing?mock_portal=1`,
      mock: true,
      message: "Stripe not configured. Simulating customer portal.",
    });
  }

  try {
    let customerId = ctx.workspace.stripeCustomerId;

    if (!customerId) {
      const customers = await stripe.customers.list({
        email: ctx.user.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      return NextResponse.json({
        url: `/dashboard/billing?no_customer=1`,
        mock: true,
        message: "No active Stripe customer found for this workspace.",
      });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error: any) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}

