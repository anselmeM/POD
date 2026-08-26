import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ url: "/dashboard/settings?mock_portal=1", mock: true });
  const origin = req.headers.get("origin") || "http://localhost:3000";
  // Find customer by email for portal — mock if not found
  const customers = await stripe.customers.list({ email: session.user.email!, limit: 1 });
  const customer = customers.data[0];
  if (!customer) return NextResponse.json({ url: "/dashboard/settings", mock: true });
  const portal = await stripe.billingPortal.sessions.create({ customer: customer.id, return_url: `${origin}/dashboard/settings` });
  return NextResponse.json({ url: portal.url });
}
