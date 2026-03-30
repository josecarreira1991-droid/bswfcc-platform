import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCustomer, createCheckoutSession, isStripeConfigured } from "@/lib/services/stripe";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("id, full_name, email")
    .eq("email", user.email!)
    .single();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const body = await request.json();
  const { priceId } = body;

  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  try {
    // Check if member already has a Stripe customer
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("member_id", member.id)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await createCustomer(member.email, member.full_name, member.id);
      customerId = customer.id;
    }

    const session = await createCheckoutSession({
      customerId,
      priceId,
      memberId: member.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Checkout] Error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
