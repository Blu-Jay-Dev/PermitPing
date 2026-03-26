import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createServiceClient } from "@/lib/supabase/server"
import { getPermitUrgency } from "@/lib/utils"
import DashboardClient from "./dashboard-client"
import type { Permit, Job } from "@/lib/supabase/types"

export type PermitWithJob = Permit & { job: Job | null }

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = await createServiceClient()

  const { data: contractorData } = await supabase
    .from("contractors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractorData?.id) {
    redirect("/onboarding")
  }

  const { data: permitsData } = await supabase
    .from("permits")
    .select("*, job:jobs(id, name, address, client_name)")
    .eq("contractor_id", contractorData.id)
    .order("created_at", { ascending: false })

  const allPermits: PermitWithJob[] = permitsData ?? []

  // Summary counts
  const critical = allPermits.filter(
    (p) => getPermitUrgency(p) === "critical" && p.status !== "closed"
  ).length
  const warning = allPermits.filter(
    (p) => getPermitUrgency(p) === "warning"
  ).length
  const closed = allPermits.filter((p) => p.status === "closed").length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-blue-600">PermitPing</span>
          <Link
            href="/permits/new"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            + Add Permit
          </Link>
        </div>
      </header>

      {/* Summary strip */}
      {allPermits.length > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex gap-4 text-sm">
            {critical > 0 && (
              <span className="text-red-600 font-semibold">
                🔴 {critical} Need Action
              </span>
            )}
            {warning > 0 && (
              <span className="text-yellow-600 font-semibold">
                🟡 {warning} Watch
              </span>
            )}
            {closed > 0 && (
              <span className="text-gray-500">✅ {closed}</span>
            )}
          </div>
        </div>
      )}

      <DashboardClient permits={allPermits} />
    </div>
  )
}
