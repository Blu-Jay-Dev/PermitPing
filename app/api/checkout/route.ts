import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { createCheckoutSession, createBillingPortalSession, getStripeInstance } from "@/lib/stripe"

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url))

  const supabase = await createServiceClient()
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id, stripe_customer_id, stripe_subscription_id, subscription_status, email, company_name")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractor) return NextResponse.redirect(new URL("/onboarding", req.url))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const returnUrl = `${appUrl}/settings`

  // If already active, send to billing portal instead
  if (
    contractor.subscription_status === "active" &&
    contractor.stripe_customer_id
  ) {
    const portal = await createBillingPortalSession(
      contractor.stripe_customer_id,
      returnUrl
    )
    return NextResponse.redirect(portal.url)
  }

  // Create Stripe customer if we don't have one yet
  let customerId = contractor.stripe_customer_id
  if (!customerId) {
    const stripe = getStripeInstance()
    const customer = await stripe.customers.create({
      email: contractor.email,
      name: contractor.company_name ?? undefined,
      metadata: { contractor_id: contractor.id, clerk_user_id: userId },
    })
    customerId = customer.id

    await supabase
      .from("contractors")
      .update({ stripe_customer_id: customerId })
      .eq("id", contractor.id)
  }

  const session = await createCheckoutSession(customerId, returnUrl)
  return NextResponse.redirect(session.url!)
}
