import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { dispatchAdWebhooks } from "@/lib/webhooks";
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

        // 1. Check if this is a Solo Founder Smoke-Test Pre-Order Reservation
        if (session.metadata?.type === "preorder_reservation") {
          const {
            slug,
            landingPageId,
            experimentId,
            backerName,
            backerEmail,
            backerCompany,
            backerRole,
            depositAmount: depositStr,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term,
            gclid,
            fbclid,
            li_fat_id,
          } = session.metadata;

          const depositAmount =
            parseInt(depositStr || "0", 10) || session.amount_total || 0;
          const email = backerEmail || session.customer_details?.email || "";
          const name = backerName || session.customer_details?.name || "Founding Backer";

          // Find the landing page and workspace
          const page = await prisma.landingPage.findFirst({
            where: landingPageId ? { id: landingPageId } : { slug: slug || "" },
            include: {
              project: { select: { id: true, workspaceId: true } },
              experiment: true,
            },
          });

          const wsId =
            session.metadata.workspaceId || page?.project?.workspaceId || null;

          // Check if a Lead already exists for this session or email + page
          const existingLead = await prisma.lead.findFirst({
            where: {
              OR: [
                { stripeSessionId: session.id },
                ...(email && page ? [{ email, variantId: page.id }] : []),
              ],
            },
          });

          let leadId = existingLead?.id;

          if (existingLead) {
            await prisma.lead.update({
              where: { id: existingLead.id },
              data: {
                isPreorder: true,
                depositAmount,
                stripeSessionId: session.id,
                intentScore: 98,
                status: "preorder_placed",
              },
            });
          } else if (page) {
            leadId = "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
            await prisma.lead.create({
              data: {
                id: leadId,
                email,
                name,
                company: backerCompany || "",
                role: backerRole || "",
                source: utm_source || `/p/${page.slug}`,
                variantId: page.id,
                experimentId: experimentId || page.experimentId || "exp-default",
                intentScore: 98,
                pricingInteraction: true,
                isPreorder: true,
                depositAmount,
                stripeSessionId: session.id,
                status: "preorder_placed",
              },
            });

            // Increment conversions
            await prisma.landingPage.update({
              where: { id: page.id },
              data: {
                conversions: { increment: 1 },
              },
            });

            if (page.experimentId) {
              await prisma.experiment.update({
                where: { id: page.experimentId },
                data: {
                  conversions: { increment: 1 },
                  highIntentActions: { increment: 3 },
                },
              });
            }
          }

          // Create notification for the founder
          if (wsId) {
            await prisma.notification.create({
              data: {
                workspaceId: wsId,
                title: "💳 Verified Pre-Order Payment Received!",
                message: `${name} (${email}) completed a $${(depositAmount / 100).toFixed(
                  2
                )} founding pre-order reservation on "${page?.name || slug}".`,
                type: "preorder",
              },
            });
          }

          // Dispatch outbound conversion webhooks (Meta CAPI, Google Ads, LinkedIn, Zapier)
          await dispatchAdWebhooks(wsId, {
            leadId: leadId || session.id,
            email,
            name,
            company: backerCompany || "",
            role: backerRole || "",
            source: utm_source || "stripe_preorder",
            intentScore: 98,
            isPreorder: true,
            depositAmount,
            stripeSessionId: session.id,
            landingPageName: page?.name || "Smoke Test",
            landingPageSlug: page?.slug || slug || "",
            landingPageUrl: `https://pod.app/p/${page?.slug || slug}`,
            experimentId: experimentId || page?.experimentId || undefined,
            utmSource: utm_source || undefined,
            utmMedium: utm_medium || undefined,
            utmCampaign: utm_campaign || undefined,
            utmContent: utm_content || undefined,
            utmTerm: utm_term || undefined,
            gclid: gclid || undefined,
            fbclid: fbclid || undefined,
            liFatId: li_fat_id || undefined,
            timestamp: Date.now(),
          }).catch((err) => {
            console.warn("Ad webhook dispatch error in Stripe webhook:", err);
          });

          break;
        }

        // 2. Standard Workspace SaaS Subscription Upgrade
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
