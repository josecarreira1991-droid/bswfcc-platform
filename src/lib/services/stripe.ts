/**
 * Stripe Billing Service for BSWFCC
 *
 * NOTE: BSWFCC is a 501(c)(6) nonprofit. The Stripe account must be
 * created by the chamber's diretoria, NOT by Quantrex. This code
 * works in test mode until the official account is ready.
 *
 * Env vars required:
 * - STRIPE_SECRET_KEY (sk_test_... or sk_live_...)
 * - STRIPE_WEBHOOK_SECRET (whsec_...)
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_... or pk_live_...)
 */

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";

async function stripeRequest(endpoint: string, method = "GET", body?: Record<string, unknown>) {
  if (!STRIPE_KEY) throw new Error("Stripe not configured");

  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(flattenObject(body)).toString() : undefined,
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

// ─── Customers ───

export async function createCustomer(email: string, name: string, memberId: string) {
  return stripeRequest("/customers", "POST", {
    email,
    name,
    metadata: { member_id: memberId, platform: "bswfcc" },
  });
}

export async function getCustomer(customerId: string) {
  return stripeRequest(`/customers/${customerId}`);
}

// ─── Checkout Sessions ───

export async function createCheckoutSession(options: {
  customerId: string;
  priceId: string;
  memberId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripeRequest("/checkout/sessions", "POST", {
    customer: options.customerId,
    "line_items[0][price]": options.priceId,
    "line_items[0][quantity]": "1",
    mode: "subscription",
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    "metadata[member_id]": options.memberId,
    allow_promotion_codes: "true",
  });
}

// ─── Billing Portal ───

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripeRequest("/billing_portal/sessions", "POST", {
    customer: customerId,
    return_url: returnUrl,
  });
}

// ─── Subscriptions ───

export async function getSubscription(subscriptionId: string) {
  return stripeRequest(`/subscriptions/${subscriptionId}`);
}

export async function cancelSubscription(subscriptionId: string, atPeriodEnd = true) {
  if (atPeriodEnd) {
    return stripeRequest(`/subscriptions/${subscriptionId}`, "POST", {
      cancel_at_period_end: "true",
    });
  }
  return stripeRequest(`/subscriptions/${subscriptionId}`, "DELETE");
}

// ─── Invoices ───

export async function getInvoices(customerId: string, limit = 10) {
  return stripeRequest(`/invoices?customer=${customerId}&limit=${limit}`);
}

// ─── Webhook Verification ───

export async function constructWebhookEvent(payload: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Webhook secret not configured");

  // Simple HMAC verification using Web Crypto API
  const encoder = new TextEncoder();
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1Sig = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestamp || !v1Sig) throw new Error("Invalid signature");

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected !== v1Sig) throw new Error("Signature mismatch");

  return JSON.parse(payload);
}

// ─── Helpers ───

export function isStripeConfigured(): boolean {
  return !!STRIPE_KEY;
}

export function formatCurrency(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}
