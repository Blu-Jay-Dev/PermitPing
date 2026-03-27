import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function JobsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = await createServiceClient()

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractor) redirect("/onboarding")

  const { data: jobs } = await supabase
    .from("jobs")
    .select(`
      id,
      name,
      address,
      client_name,
      is_archived,
      created_at,
      permits(id, status, expiration_date)
    `)
    .eq("contractor_id", contractor.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })

  const activeJobs = jobs ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg text-gray-900">Jobs</h1>
        <Link
          href="/jobs/new"
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg active:bg-blue-700"
        >
          + New Job
        </Link>
      </header>

      <div className="p-4 space-y-3 max-w-md mx-auto">
        {activeJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="text-5xl mb-4">🏗️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No jobs yet</h2>
            <p className="text-gray-500 text-sm mb-6">
              Jobs group your permits by project. Add your first job or it&apos;ll be
              created automatically when you add a permit.
            </p>
            <Link
              href="/jobs/new"
              className="bg-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Create a Job →
            </Link>
          </div>
        ) : (
          activeJobs.map((job: any) => {
            const permits = (job.permits as any[]) ?? []
            const openCount = permits.filter(
              (p) => p.status !== "closed" && p.status !== "expired"
            ).length
            const closedCount = permits.filter((p) => p.status === "closed").length
            const hasExpiring = permits.some((p) => {
              if (p.status === "closed" || p.status === "expired") return false
              const days = Math.ceil(
                (new Date(p.expiration_date).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
              return days <= 30
            })

            return (
              <div
                key={job.id}
                className={`bg-white rounded-xl border-2 p-4 space-y-2 ${
                  hasExpiring ? "border-yellow-300" : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">
                      {job.address ?? job.name}
                    </h3>
                    {job.client_name && (
                      <p className="text-sm text-gray-500">{job.client_name}</p>
                    )}
                  </div>
                  {hasExpiring && (
                    <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Expiring soon
                    </span>
                  )}
                </div>

                <div className="flex gap-3 text-xs text-gray-500">
                  <span>{permits.length} permit{permits.length !== 1 ? "s" : ""}</span>
                  {openCount > 0 && (
                    <span className="text-blue-600 font-medium">{openCount} open</span>
                  )}
                  {closedCount > 0 && (
                    <span className="text-green-600">{closedCount} closed</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/permits/new?job_id=${job.id}`}
                    className="flex-1 text-center text-sm font-medium text-blue-600 border border-blue-200 rounded-lg py-2 active:bg-blue-50"
                  >
                    + Add Permit
                  </Link>
                  <Link
                    href={`/dashboard?job=${job.id}`}
                    className="flex-1 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-lg py-2 active:bg-gray-50"
                  >
                    View Permits →
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
