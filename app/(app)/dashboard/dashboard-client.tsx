"use client"

import { useState } from "react"
import Link from "next/link"
import PermitCard from "@/components/permit-card"
import { getPermitUrgency } from "@/lib/utils"
import type { Permit, Job } from "@/lib/supabase/types"

type PermitWithJob = Permit & { job: Job | null }

type FilterTab = "all" | "action" | "expiring" | "closed"

interface Props {
  permits: PermitWithJob[]
}

export default function DashboardClient({ permits }: Props) {
  const [filter, setFilter] = useState<FilterTab>("all")
  const [localPermits, setLocalPermits] = useState(permits)

  const filtered = localPermits.filter((p) => {
    const urgency = getPermitUrgency(p)
    if (filter === "action") return urgency === "critical" && p.status !== "closed"
    if (filter === "expiring") return urgency === "warning"
    if (filter === "closed") return p.status === "closed"
    return true
  })

  // Sort: critical first, then warning, then normal, then closed
  const urgencyOrder = { critical: 0, warning: 1, normal: 2, closed: 3 }
  const sorted = [...filtered].sort(
    (a, b) =>
      urgencyOrder[getPermitUrgency(a)] - urgencyOrder[getPermitUrgency(b)]
  )

  function handlePermitUpdate(updatedPermit: Permit) {
    setLocalPermits((prev) =>
      prev.map((p) => (p.id === updatedPermit.id ? { ...p, ...updatedPermit } : p))
    )
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "action", label: "Action" },
    { key: "expiring", label: "Expiring" },
    { key: "closed", label: "Closed" },
  ]

  if (permits.length === 0) {
    return (
      <div className="px-4 pt-6 pb-4 space-y-6 max-w-md mx-auto">
        {/* CTA */}
        <div className="text-center space-y-2 pt-4">
          <div className="text-4xl">📋</div>
          <h2 className="text-xl font-bold text-gray-900">No permits yet</h2>
          <p className="text-gray-500 text-base">
            Add your open permits and we&apos;ll remind you before key dates.
          </p>
          <Link
            href="/permits/new"
            className="inline-block bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-base mt-2"
          >
            Add Your First Permit →
          </Link>
        </div>

        {/* Sample permit card — shows what they'll see */}
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3 text-center">
            Here&apos;s what your board will look like
          </p>
          <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4 space-y-3 opacity-60 pointer-events-none select-none">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔴</span>
                  <h3 className="font-bold text-gray-900 text-base">123 Oak Ave</h3>
                </div>
                <p className="text-base text-gray-600 mt-0.5">Electrical · #E-2411-24</p>
              </div>
              <span className="text-blue-600 text-xl">›</span>
            </div>
            <p className="text-base text-gray-700">Rough-in not called — 8 days since issued</p>
            <p className="text-sm text-gray-500">Expires Jun 14, 2025</p>
            <div className="w-full bg-white border-2 border-blue-400 text-blue-700 font-semibold py-3 px-4 rounded-lg text-base text-center">
              Mark Rough-In Called ✓
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-3 px-4 text-base font-medium border-b-2 transition-colors ${
                filter === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Permit cards */}
      <div className="p-4 space-y-3">
        {sorted.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No permits in this category.
          </p>
        ) : (
          sorted.map((permit) => (
            <PermitCard
              key={permit.id}
              permit={permit}
              onUpdate={handlePermitUpdate}
            />
          ))
        )}
      </div>
    </div>
  )
}
