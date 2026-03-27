"use client"

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"
import {
  getPermitUrgency,
  URGENCY_COLORS,
  URGENCY_DOTS,
  formatDate,
  daysUntil,
} from "@/lib/utils"
import type { Permit, Job } from "@/lib/supabase/types"

type PermitWithJob = Permit & { job: Job | null }

interface Props {
  permit: PermitWithJob
  onUpdate?: (permit: Permit) => void
}

function getActionLabel(permit: Permit): string | null {
  if (permit.status === "closed" || permit.status === "expired") return null
  if (permit.status === "open" && permit.rough_in_required && !permit.rough_in_called_at)
    return "Mark Rough-In Called ✓"
  if (permit.status === "rough_pending" && !permit.rough_in_passed_at)
    return "Mark Rough-In Passed ✓"
  if (permit.status === "rough_passed" && !permit.final_called_at)
    return "Mark Final Called ✓"
  if (permit.status === "final_pending" && !permit.final_passed_at)
    return "Mark Final Passed ✓"
  if (permit.status === "open" && !permit.rough_in_required && !permit.final_called_at)
    return "Mark Final Called ✓"
  return null
}

function getNextUpdate(permit: Permit): Partial<Permit> {
  if (permit.status === "open" && permit.rough_in_required && !permit.rough_in_called_at)
    return { rough_in_called_at: new Date().toISOString(), status: "rough_pending" }
  if (permit.status === "rough_pending" && !permit.rough_in_passed_at)
    return { rough_in_passed_at: new Date().toISOString(), status: "rough_passed" }
  if (permit.status === "rough_passed" && !permit.final_called_at)
    return { final_called_at: new Date().toISOString(), status: "final_pending" }
  if (permit.status === "final_pending" && !permit.final_passed_at)
    return { final_passed_at: new Date().toISOString(), status: "closed" }
  if (permit.status === "open" && !permit.rough_in_required && !permit.final_called_at)
    return { final_called_at: new Date().toISOString(), status: "final_pending" }
  return {}
}

function getStatusDescription(permit: Permit): string {
  const days = daysUntil(permit.expiration_date)
  const expiresText =
    days < 0
      ? `Expired ${Math.abs(days)} days ago`
      : days === 0
      ? "Expires today"
      : `Expires in ${days} day${days === 1 ? "" : "s"}`

  if (permit.status === "closed") return "Closed ✓"
  if (permit.status === "expired") return "Permit expired"

  if (permit.status === "open" && permit.rough_in_required && !permit.rough_in_called_at) {
    const issued = new Date(permit.issued_date)
    const daysSince = Math.ceil(
      (Date.now() - issued.getTime()) / (1000 * 60 * 60 * 24)
    )
    return `Rough-in not called — ${daysSince} day${daysSince === 1 ? "" : "s"} since issued`
  }
  if (permit.status === "rough_pending") return `Rough-in called — awaiting inspection · ${expiresText}`
  if (permit.status === "rough_passed") return `Rough-in passed — final not called · ${expiresText}`
  if (permit.status === "final_pending") return `Final called — awaiting inspection · ${expiresText}`

  return expiresText
}

export default function PermitCard({ permit, onUpdate }: Props) {
  const [localPermit, setLocalPermit] = useState(permit)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const urgency = getPermitUrgency(localPermit)
  const actionLabel = getActionLabel(localPermit)
  const statusDesc = getStatusDescription(localPermit)
  const address = localPermit.job?.address ?? localPermit.job?.name ?? "Unknown address"

  async function handleAction() {
    const update = getNextUpdate(localPermit)
    if (!update || Object.keys(update).length === 0) return

    // Optimistic update
    const optimistic = { ...localPermit, ...update } as Permit & { job: Job | null }
    setLocalPermit(optimistic)
    setLoading(true)

    try {
      const res = await fetch(`/api/permits/${localPermit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? "Update failed")
      }

      const { permit: data } = await res.json()
      if (data) {
        setLocalPermit({ ...data, job: localPermit.job })
        onUpdate?.(data)
        toast("Updated ✓", "success")
      }
    } catch {
      // Revert on failure
      setLocalPermit(permit)
      toast("Update failed — check your connection", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`rounded-xl border-2 p-4 space-y-3 ${URGENCY_COLORS[urgency]}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">{URGENCY_DOTS[urgency]}</span>
            <h3 className="font-bold text-gray-900 truncate text-base">
              {address}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {localPermit.trade_type.charAt(0).toUpperCase() +
              localPermit.trade_type.slice(1)}{" "}
            · #{localPermit.permit_number}
          </p>
        </div>
        <Link
          href={`/permits/${localPermit.id}`}
          className="text-blue-600 text-xl flex-shrink-0 p-1"
          aria-label="View permit details"
        >
          ›
        </Link>
      </div>

      {/* Status */}
      <p className="text-sm text-gray-700">{statusDesc}</p>

      {/* Expiration date */}
      {localPermit.status !== "closed" && (
        <p className="text-xs text-gray-500">
          Expires {formatDate(localPermit.expiration_date)}
        </p>
      )}

      {/* Action button */}
      {actionLabel && (
        <button
          onClick={handleAction}
          disabled={loading}
          className="w-full bg-white border-2 border-current font-semibold py-3 px-4 rounded-lg text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            text-blue-700 border-blue-400 hover:bg-blue-50"
        >
          {loading ? "Updating..." : actionLabel}
        </button>
      )}
    </div>
  )
}
