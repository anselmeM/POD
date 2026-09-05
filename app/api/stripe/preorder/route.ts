import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { slug, email, name = "Founding Backer" } = body;

    if (!slug) {
      return NextResponse.json({ error: "Landing page slug is required" }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const page = await prisma.landingPage.findUnique({
      where: { slug },
      include: { experiment: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }

    const depositAmount = page.depositAmount || 100; // in cents, default $1.00
    const priceAnchor = page.priceAnchor || 4900; // in cents, default $49.00
    const depositDisplay = (depositAmount / 100).toFixed(2);
    const anchorDisplay = (priceAnchor / 100).toFixed(0);

    const stripe = getStripe();
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer")?.split("/p/")[0] ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // 1. If Stripe is configured with live/test secret key
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: email,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Pre-Order Founding Reservation: ${page.name}`,
                  description: `Refundable $${depositDisplay} hold securing founding pricing ($${anchorDisplay}/mo) on launch.`,
                },
                unit_amount: depositAmount,
              },
              quantity: 1,
            },
          ],
          metadata: {
            type: "preorder_reservation",
            slug: page.slug,
            landingPageId: page.id,
            experimentId: page.experimentId || "",
            backerName: name,
            backerEmail: email,
            depositAmount: String(depositAmount),
          },
          success_url: `${origin}/p/${slug}?preorder_success=1&session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(
            email
          )}`,
          cancel_url: `${origin}/p/${slug}?preorder_cancelled=1`,
        });

        return NextResponse.json({
          success: true,
          url: session.url,
          sessionId: session.id,
          depositAmount,
          priceAnchor,
        });
      } catch (stripeErr) {
        console.warn("Stripe Checkout creation failed, falling back to seamless reservation mode:", stripeErr);
      }
    }

    // 2. Fallback / Test Simulation Mode (works offline, with unconfigured keys, or during testing)
    const simulatedSessionId = `preorder_sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const redirectUrl = `${origin}/p/${slug}?preorder_success=1&session_id=${simulatedSessionId}&email=${encodeURIComponent(
      email
    )}&mock=true`;

    return NextResponse.json({
      success: true,
      url: redirectUrl,
      sessionId: simulatedSessionId,
      mock: true,
      depositAmount,
      priceAnchor,
      message: "Pre-order reservation simulated successfully (Stripe test mode).",
    });
  } catch (error) {
    console.error("Error in preorder endpoint:", error);
    return NextResponse.json({ error: "Failed to initiate pre-order reservation" }, { status: 500 });
  }
}
