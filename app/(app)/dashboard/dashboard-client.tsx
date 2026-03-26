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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No permits yet</h2>
        <p className="text-gray-600 mb-6">
          Add your open permits and we&apos;ll remind you before key dates.
        </p>
        <Link
          href="/permits/new"
          className="bg-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-lg"
        >
          Add Your First Permit →
        </Link>
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
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
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
