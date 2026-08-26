import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe, PRICE_MAP } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { plan } = await req.json().catch(() => ({}));
  const key = String(plan || "self-serve").toLowerCase();
  if (!PRICE_MAP[key]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const stripe = getStripe();
  if (!stripe) {
    // Mock checkout for dev without keys
    return NextResponse.json({ url: `/dashboard/settings?mock_checkout=${key}`, mock: true });
  }

  const origin = req.headers.get("origin") || "http://localhost:3000";
  const price = PRICE_MAP[key];
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price_data: { currency: "usd", product_data: { name: `PoD Engine — ${price.name}` }, unit_amount: price.amount }, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?success=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    customer_email: session.user.email || undefined,
  });
  return NextResponse.json({ url: checkout.url });
}
