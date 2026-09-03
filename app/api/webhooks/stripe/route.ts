import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  if (stripe && webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error(`⚠️ Stripe webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  } else {
    // If testing or webhook secret is unconfigured, parse payload directly
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId =
          session.client_reference_id ||
          session.metadata?.workspaceId ||
          (session.customer_details?.email
            ? (
                await prisma.user.findUnique({
                  where: { email: session.customer_details.email },
                  include: { memberships: true },
                })
              )?.memberships[0]?.workspaceId
            : null);

        const planKey = session.metadata?.planKey || "self-serve";

        if (workspaceId) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id || null;

          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id || null;

          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              plan: planKey,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            },
          });

          await prisma.activityLog.create({
            data: {
              action: "plan.upgraded",
              entityType: "workspace",
              entityId: workspaceId,
              detail: JSON.stringify({
                plan: planKey,
                amount: session.amount_total,
                currency: session.currency,
                customerId,
                subscriptionId,
              }),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceId = subscription.metadata?.workspaceId;

        // If subscription was canceled
        if (subscription.status === "canceled" || subscription.cancel_at_period_end) {
          const whereClause = workspaceId
            ? { id: workspaceId }
            : { stripeSubscriptionId: subscription.id };

          if (subscription.status === "canceled") {
            await prisma.workspace.updateMany({
              where: whereClause,
              data: { plan: "trial", stripeSubscriptionId: null },
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceId = subscription.metadata?.workspaceId;

        const whereClause = workspaceId
          ? { id: workspaceId }
          : { stripeSubscriptionId: subscription.id };

        await prisma.workspace.updateMany({
          where: whereClause,
          data: { plan: "trial", stripeSubscriptionId: null },
        });

        const updatedWs = await prisma.workspace.findFirst({ where: whereClause });
        if (updatedWs) {
          await prisma.activityLog.create({
            data: {
              action: "plan.canceled",
              entityType: "workspace",
              entityId: updatedWs.id,
              detail: JSON.stringify({ subscriptionId: subscription.id }),
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

        if (customerId) {
          const ws = await prisma.workspace.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (ws) {
            await prisma.notification.create({
              data: {
                workspaceId: ws.id,
                title: "Payment Failed",
                message: "Your recent subscription renewal payment failed. Please update your payment method to avoid interruption.",
                type: "warning",
              },
            });
          }
        }
        break;
      }

      default:
        // Other events ignored
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error processing Stripe webhook event ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
