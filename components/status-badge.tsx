import type { PermitStatus } from "@/lib/supabase/types"

const STATUS_STYLES: Record<PermitStatus, string> = {
  open: "bg-blue-100 text-blue-800",
  rough_pending: "bg-yellow-100 text-yellow-800",
  rough_passed: "bg-green-100 text-green-800",
  final_pending: "bg-orange-100 text-orange-800",
  closed: "bg-gray-100 text-gray-600",
  expired: "bg-red-100 text-red-800",
}

const STATUS_LABELS: Record<PermitStatus, string> = {
  open: "Open",
  rough_pending: "Rough Pending",
  rough_passed: "Rough Passed",
  final_pending: "Final Pending",
  closed: "Closed",
  expired: "Expired",
}

interface Props {
  status: PermitStatus
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
