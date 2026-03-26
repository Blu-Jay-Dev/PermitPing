import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Permit duration defaults by trade type (in days)
export const DEFAULT_PERMIT_DURATION_DAYS: Record<string, number> = {
  electrical: 180,
  hvac: 180,
  plumbing: 180,
  building: 365,
  other: 180,
}

export function calculateExpirationDate(
  issuedDate: Date,
  tradeType: string
): Date {
  const days = DEFAULT_PERMIT_DURATION_DAYS[tradeType] ?? 180
  const expiration = new Date(issuedDate)
  expiration.setDate(expiration.getDate() + days)
  return expiration
}

export type UrgencyLevel = "critical" | "warning" | "normal" | "closed"

export interface PermitForUrgency {
  status: string
  expiration_date: string
  issued_date: string
  rough_in_required: boolean
  rough_in_called_at: string | null
}

export function getPermitUrgency(permit: PermitForUrgency): UrgencyLevel {
  if (permit.status === "closed") return "closed"

  const today = new Date()
  const expiration = new Date(permit.expiration_date)
  const daysUntilExpiration = Math.ceil(
    (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilExpiration < 0) return "critical"
  if (daysUntilExpiration <= 7) return "critical"
  if (daysUntilExpiration <= 30) return "warning"

  if (permit.rough_in_required && !permit.rough_in_called_at) {
    const issuedDate = new Date(permit.issued_date)
    const daysSinceIssued = Math.ceil(
      (today.getTime() - issuedDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceIssued > 7) return "critical"
    if (daysSinceIssued > 3) return "warning"
  }

  return "normal"
}

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  critical: "border-red-500 bg-red-50",
  warning: "border-yellow-500 bg-yellow-50",
  normal: "border-green-500 bg-green-50",
  closed: "border-gray-300 bg-gray-50",
}

export const URGENCY_DOTS: Record<UrgencyLevel, string> = {
  critical: "🔴",
  warning: "🟡",
  normal: "🟢",
  closed: "⚫",
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
