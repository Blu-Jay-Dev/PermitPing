import { NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const body = await req.text() // Must be raw text for signature verification
  const sig = req.headers.get("stripe-signature")!

  let event
  try {
    event = getStripeInstance().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = getServiceClient()

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as {
        customer: string
        id: string
        status: string
      }
      await supabase
        .from("contractors")
        .update({
          stripe_subscription_id: sub.id,
          subscription_status: mapStripeStatus(sub.status),
        })
        .eq("stripe_customer_id", sub.customer)
      break
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as { customer: string }
      await supabase
        .from("contractors")
        .update({ subscription_status: "cancelled" })
        .eq("stripe_customer_id", sub.customer)
      break
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as { customer: string }
      await supabase
        .from("contractors")
        .update({ subscription_status: "active" })
        .eq("stripe_customer_id", invoice.customer)
      break
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as { customer: string }
      await supabase
        .from("contractors")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", invoice.customer)
      break
    }
  }

  return NextResponse.json({ received: true })
}

function mapStripeStatus(status: string): string {
  const map: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "cancelled",
    incomplete: "inactive",
    incomplete_expired: "inactive",
    unpaid: "past_due",
    paused: "inactive",
  }
  return map[status] ?? "inactive"
}
