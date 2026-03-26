import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createServiceClient } from "@/lib/supabase/server"
import StatusBadge from "@/components/status-badge"
import { formatDate } from "@/lib/utils"
import type { Permit, Job, PermitStatus } from "@/lib/supabase/types"

type PermitWithJob = Permit & { job: Job | null }

export default async function PermitDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = await createServiceClient()

  const { data: permitData } = await supabase
    .from("permits")
    .select("*, job:jobs(id, name, address, client_name)")
    .eq("id", params.id)
    .single()

  if (!permitData) notFound()

  const permit = permitData as PermitWithJob
  const address = permit.job?.address ?? permit.job?.name ?? "Unknown address"

  const timeline = [
    {
      label: "Permit Issued",
      date: permit.issued_date,
      done: true,
    },
    permit.rough_in_required
      ? {
          label: "Rough-In Called",
          date: permit.rough_in_called_at,
          done: !!permit.rough_in_called_at,
        }
      : null,
    permit.rough_in_required
      ? {
          label: "Rough-In Passed",
          date: permit.rough_in_passed_at,
          done: !!permit.rough_in_passed_at,
        }
      : null,
    {
      label: "Final Called",
      date: permit.final_called_at,
      done: !!permit.final_called_at,
    },
    {
      label: "Final Passed / Closed",
      date: permit.final_passed_at,
      done: !!permit.final_passed_at,
    },
  ].filter(Boolean) as { label: string; date: string | null; done: boolean }[]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-blue-600 font-medium text-sm">
          ← Dashboard
        </Link>
        <h1 className="font-bold text-lg text-gray-900 truncate">
          Permit Detail
        </h1>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Summary */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">{address}</h2>
          {permit.job?.client_name && (
            <p className="text-gray-600">{permit.job.client_name}</p>
          )}
          <div className="flex items-center gap-2">
            <StatusBadge status={permit.status as PermitStatus} />
            <span className="text-sm text-gray-600">
              {permit.trade_type.charAt(0).toUpperCase() + permit.trade_type.slice(1)} ·{" "}
              #{permit.permit_number}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Issued</span>
            <span className="font-medium text-gray-900">
              {formatDate(permit.issued_date)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expires</span>
            <span className="font-medium text-gray-900">
              {formatDate(permit.expiration_date)}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
          <div className="space-y-3">
            {timeline.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    step.done ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  {step.done && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      step.done ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-gray-500">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {permit.notes && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Notes</h3>
            <p className="text-sm text-gray-700">{permit.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
