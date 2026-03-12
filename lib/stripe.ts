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

export { PLATFORM_FEE_PERCENT };
