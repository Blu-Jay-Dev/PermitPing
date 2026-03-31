import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import BottomNav from "@/components/bottom-nav"
import TrialBanner from "@/components/trial-banner"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = await createServiceClient()
  const { data: contractor } = await supabase
    .from("contractors")
    .select("subscription_status, trial_ends_at")
    .eq("clerk_user_id", userId)
    .single()

  // Cancelled or inactive — hard block, redirect to upgrade
  if (
    contractor?.subscription_status === "cancelled" ||
    contractor?.subscription_status === "inactive"
  ) {
    redirect("/settings?upgrade=true")
  }

  const trialEndsAt = contractor?.trial_ends_at
    ? new Date(contractor.trial_ends_at)
    : null
  const daysLeft = trialEndsAt
    ? Math.max(
        0,
        Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null

  const isPastDue = contractor?.subscription_status === "past_due"
  const isTrialing = contractor?.subscription_status === "trialing"

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Past due banner — shows but doesn't block */}
      {isPastDue && (
        <div className="bg-red-600 text-white text-sm text-center px-4 py-2 font-medium">
          ⚠️ Payment failed — update your billing info to keep reminders active.{" "}
          <a href="/api/checkout" className="underline font-bold">
            Fix now →
          </a>
        </div>
      )}

      {/* Trial banner */}
      {isTrialing && daysLeft !== null && daysLeft <= 7 && (
        <TrialBanner daysLeft={daysLeft} />
      )}

      {/* Content area with bottom padding for nav */}
      <div className="flex-1 pb-20 max-w-md mx-auto w-full">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
