import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmation, sendSubscriptionPaymentFailed } from "@/lib/email";
import Stripe from "stripe";

// Desactivar body parsing — Stripe necesita el raw body
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.orderId;

      if (orderId) {
        // Actualizar Payment a succeeded
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data: { status: "succeeded" },
        });

        // Mover pedido a in_progress automáticamente
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: "in_progress" },
          include: { client: true, payment: true },
        });

        // Enviar confirmación de pago al cliente
        if (order.client.email && order.payment) {
          await sendPaymentConfirmation(
            order.client.email,
            order.client.name || "Cliente",
            orderId,
            Number(order.payment.amount)
          );
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { status: "failed" },
      });
      break;
    }

    case "account.updated": {
      // Actualizar estado de onboarding del traductor
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.payouts_enabled) {
        await prisma.translatorProfile.updateMany({
          where: { stripeAccountId: account.id },
          data: { stripeOnboarded: true },
        });
      }
      break;
    }

    // ─── Checkout Session (suscripción completada) ───
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;

      if (checkoutSession.mode === "subscription" && checkoutSession.subscription) {
        const subId = typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription.id;
        const customerId = typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : (checkoutSession.customer as Stripe.Customer)?.id || "";
        const translatorProfileId = checkoutSession.metadata?.translatorProfileId;

        if (translatorProfileId) {
          const stripeSub = await stripe.subscriptions.retrieve(subId);
          const priceId = stripeSub.items.data[0]?.price.id || "";

          await prisma.subscription.upsert({
            where: { translatorId: translatorProfileId },
            create: {
              translatorId: translatorProfileId,
              stripeSubscriptionId: subId,
              stripeCustomerId: customerId,
              priceId,
              status: "active",
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
            update: {
              stripeSubscriptionId: subId,
              stripeCustomerId: customerId,
              priceId,
              status: "active",
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
              cancelledAt: null,
            },
          });
        }
      }
      break;
    }

    // ─── Suscripciones ───
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelledAt: sub.canceled_at
            ? new Date(sub.canceled_at * 1000)
            : null,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: "canceled",
          cancelledAt: new Date(),
        },
      });
      break;
    }

    // ─── Pago de factura fallido ───
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription.id;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "past_due" },
        });

        // Enviar email de aviso
        const custId = typeof invoice.customer === "string"
          ? invoice.customer
          : (invoice.customer as Stripe.Customer)?.id || "";
        try {
          const customer = await stripe.customers.retrieve(custId);
          if (customer && !customer.deleted && customer.email) {
            await sendSubscriptionPaymentFailed(
              customer.email,
              customer.name || "Traductor"
            );
          }
        } catch {
          // Email sending failure shouldn't break webhook
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
