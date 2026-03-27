import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import { UserButton } from "@clerk/nextjs"
import type { Contractor } from "@/lib/supabase/types"

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = await createServiceClient()

  const { data: contractorData } = await supabase
    .from("contractors")
    .select("*")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractorData) redirect("/onboarding")

  const contractor = contractorData as Contractor

  const trialEnds = contractor.trial_ends_at
    ? new Date(contractor.trial_ends_at)
    : null
  const daysLeft = trialEnds
    ? Math.max(
        0,
        Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <h1 className="font-bold text-lg text-gray-900">Settings</h1>
      </header>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Trial banner */}
        {contractor.subscription_status === "trialing" && daysLeft > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            {daysLeft} day{daysLeft === 1 ? "" : "s"} left in your free trial.
          </div>
        )}

        {/* Profile */}
        <section className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-base">Profile</h2>
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="text-sm text-gray-600">
              <p>{contractor.email}</p>
              {contractor.company_name && (
                <p className="text-gray-500">{contractor.company_name}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Trade</p>
              <p className="text-sm font-medium capitalize">
                {contractor.trade_type ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">State</p>
              <p className="text-sm font-medium">
                {contractor.state ?? "Not set"}
              </p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-base">Notifications</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Email reminders — {contractor.email}</span>
            </div>
            {contractor.phone ? (
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>SMS reminders — {contractor.phone}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">○</span>
                <span className="text-gray-500">
                  No phone set — add one for SMS reminders
                </span>
              </div>
            )}
          </div>
          <a
            href="/settings/edit"
            className="inline-block text-sm text-blue-600 font-medium"
          >
            Edit contact info →
          </a>
        </section>

        {/* Billing */}
        <section className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-base">Billing</h2>
          <div className="text-sm text-gray-700">
            <p className="font-medium">
              PermitJockey —{" "}
              {contractor.subscription_status === "trialing"
                ? "Free Trial"
                : contractor.subscription_status === "active"
                ? "$39/month"
                : contractor.subscription_status}
            </p>
          </div>
          {contractor.subscription_status === "trialing" && (
            <a
              href="/api/checkout"
              className="inline-block w-full text-center bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              Upgrade to Pro — $39/month
            </a>
          )}
        </section>

        {/* Data export */}
        <section className="bg-white rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 text-base mb-3">Data</h2>
          <a
            href="/api/export/permits"
            className="inline-block text-sm text-blue-600 font-medium"
          >
            Export Open Permits as CSV →
          </a>
        </section>
      </div>
    </div>
  )
}
