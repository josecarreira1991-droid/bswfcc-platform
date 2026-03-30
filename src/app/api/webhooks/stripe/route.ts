import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { constructWebhookEvent } from "@/lib/services/stripe";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = await constructWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const memberId = session.metadata?.member_id;
        if (!memberId) break;

        if (session.subscription) {
          // Fetch the subscription from Stripe to get the price ID
          let tierId = null;
          try {
            const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${session.subscription}`, {
              headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
            });
            const subData = await subRes.json();
            const priceId = subData.items?.data?.[0]?.price?.id;
            if (priceId) {
              const { data: tier } = await supabase
                .from("membership_tiers")
                .select("id")
                .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
                .single();
              tierId = tier?.id || null;
            }
          } catch {
            // If we can't resolve the tier, still save the subscription
          }

          await supabase.from("subscriptions").upsert({
            member_id: memberId,
            tier_id: tierId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: "active",
            current_period_start: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "member_id" });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find member by stripe_customer_id
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("member_id, id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          await supabase.from("payments").insert({
            member_id: sub.member_id,
            subscription_id: sub.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: invoice.payment_intent,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "succeeded",
            description: `Invoice ${invoice.number || invoice.id}`,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("member_id, id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          await supabase.from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("id", sub.id);

          await supabase.from("payments").insert({
            member_id: sub.member_id,
            subscription_id: sub.id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: "failed",
            description: `Failed: Invoice ${invoice.number || invoice.id}`,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await supabase.from("subscriptions")
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await supabase.from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Processing error:", err);
  }

  return NextResponse.json({ received: true });
}
