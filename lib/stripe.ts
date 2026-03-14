import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
  typescript: true,
});

const PLATFORM_FEE_PERCENT = parseFloat(
  process.env.STRIPE_PLATFORM_FEE_PERCENT || "15"
);

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// Crear cuenta Express para traductor
export async function createConnectAccount(
  email: string,
  name: string
): Promise<{ accountId: string; onboardingUrl: string }> {
  const account = await stripe.accounts.create({
    type: "express",
    country: "ES",
    email,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { platform: "mitraductorjurado" },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/translator/payments?stripe=refresh`,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/translator/payments?stripe=success`,
    type: "account_onboarding",
  });

  return { accountId: account.id, onboardingUrl: accountLink.url };
}

// Obtener enlace de onboarding si no completó
export async function getOnboardingLink(
  accountId: string
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/translator/payments?stripe=refresh`,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/translator/payments?stripe=success`,
    type: "account_onboarding",
  });
  return accountLink.url;
}

// Verificar si la cuenta Express está lista
export async function checkAccountStatus(
  accountId: string
): Promise<{ ready: boolean; details: string }> {
  const account = await stripe.accounts.retrieve(accountId);
  const ready =
    account.charges_enabled === true && account.payouts_enabled === true;
  const details = ready
    ? "Cuenta activa"
    : "Verificación pendiente en Stripe";
  return { ready, details };
}

// Crear PaymentIntent con split Connect
export async function createPaymentIntent(opts: {
  amount: number; // en euros
  translatorStripeAccountId: string;
  orderId: string;
  customerEmail: string;
}): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  platformFee: number;
  translatorAmount: number;
}> {
  const amountCents = Math.round(opts.amount * 100);
  const platformFeeCents = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
  const translatorAmountCents = amountCents - platformFeeCents;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "eur",
    application_fee_amount: platformFeeCents,
    transfer_data: {
      destination: opts.translatorStripeAccountId,
    },
    metadata: {
      orderId: opts.orderId,
      platform: "mitraductorjurado",
    },
    receipt_email: opts.customerEmail,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    platformFee: platformFeeCents / 100,
    translatorAmount: translatorAmountCents / 100,
  };
}

// Obtener dashboard link para traductor
export async function getStripeDashboardLink(
  accountId: string
): Promise<string> {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

// ─── SUSCRIPCIONES (Billing) ─────────────────────────────────────────────────

/**
 * Crea o reutiliza un Stripe Customer para el traductor.
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { platform: "mitraductorjurado" },
  });

  return customer.id;
}

/**
 * Crea una suscripción al plan fundador.
 * Devuelve clientSecret para Stripe Elements (si requiere pago inmediato)
 * o la suscripción activa si el pago ya se procesó.
 */
export async function createSubscription(opts: {
  customerId: string;
  priceId: string;
}): Promise<{
  subscriptionId: string;
  clientSecret: string | null;
  status: string;
}> {
  const subscription = await stripe.subscriptions.create({
    customer: opts.customerId,
    items: [{ price: opts.priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription",
    },
    expand: ["latest_invoice.payment_intent"],
    metadata: { platform: "mitraductorjurado" },
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent | null;

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent?.client_secret || null,
    status: subscription.status,
  };
}

/**
 * Cancela la suscripción al final del período actual.
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ status: string; cancelAt: Date | null }> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return {
    status: subscription.status,
    cancelAt: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000)
      : null,
  };
}

/**
 * Genera un enlace al Customer Portal de Stripe para autoservicio.
 */
export async function getCustomerPortalLink(
  customerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID || undefined,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/translator/payments`,
  });
  return session.url;
}

export { PLATFORM_FEE_PERCENT };
