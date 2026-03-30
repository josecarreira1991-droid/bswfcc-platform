import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBillingPortalSession, isStripeConfigured } from "@/lib/services/stripe";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("email", user.email!)
    .single();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("member_id", member.id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  try {
    const session = await createBillingPortalSession(
      sub.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing`
    );
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Portal] Error:", err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
