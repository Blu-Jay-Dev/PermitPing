"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { calculateExpirationDate } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

const TRADE_OPTIONS = [
  { value: "electrical", label: "Electrical", emoji: "⚡" },
  { value: "hvac", label: "HVAC", emoji: "❄️" },
  { value: "plumbing", label: "Plumbing", emoji: "🔧" },
  { value: "building", label: "Building", emoji: "🏗️" },
  { value: "other", label: "Other", emoji: "📋" },
]

interface Job {
  id: string
  name: string
  address: string | null
  client_name: string | null
}

export default function NewPermitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [jobs, setJobs] = useState<Job[]>([])
  const [jobId, setJobId] = useState(searchParams.get("job_id") ?? "")
  const [createNewJob, setCreateNewJob] = useState(false)
  const [newJobAddress, setNewJobAddress] = useState("")

  const [permitNumber, setPermitNumber] = useState("")
  const [tradeType, setTradeType] = useState("")
  const [issuedDate, setIssuedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [expirationDate, setExpirationDate] = useState("")
  const [roughInRequired, setRoughInRequired] = useState(true)
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => setJobs(data.jobs ?? []))
      .catch(() => {})
  }, [])

  // Auto-calculate expiration when trade or issued date changes
  useEffect(() => {
    if (tradeType && issuedDate) {
      const expDate = calculateExpirationDate(new Date(issuedDate), tradeType)
      setExpirationDate(expDate.toISOString().split("T")[0])
    }
  }, [tradeType, issuedDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!permitNumber || !tradeType || !issuedDate || !expirationDate) {
      setError("Please fill in all required fields.")
      return
    }

    if (!jobId && !createNewJob) {
      setError("Please select a job or create a new one.")
      return
    }

    if (createNewJob && !newJobAddress) {
      setError("Please enter an address for the new job.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: createNewJob ? undefined : jobId,
          new_job_address: createNewJob ? newJobAddress : undefined,
          permit_number: permitNumber,
          trade_type: tradeType,
          issued_date: issuedDate,
          expiration_date: expirationDate,
          rough_in_required: roughInRequired,
          notes: notes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to add permit")
      }

      toast("Permit added! Reminders are set.", "success")
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add permit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-blue-600 font-medium text-sm"
        >
          ← Back
        </button>
        <h1 className="font-bold text-lg text-gray-900">Add Permit</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-md mx-auto">
        {/* Job selection */}
        <div className="space-y-3">
          <label className="block font-semibold text-gray-900">Job</label>

          {!createNewJob && jobs.length > 0 && (
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select a job...</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.address ?? j.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => {
              setCreateNewJob(!createNewJob)
              setJobId("")
            }}
            className="text-sm text-blue-600 font-medium"
          >
            {createNewJob ? "← Select existing job" : "+ Create new job"}
          </button>

          {createNewJob && (
            <input
              type="text"
              value={newJobAddress}
              onChange={(e) => setNewJobAddress(e.target.value)}
              placeholder="123 Oak Ave, Anytown FL"
              className="w-full border border-gray-300 rounded-xl p-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
          )}
        </div>

        {/* Permit number */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-900" htmlFor="permitNumber">
            Permit Number <span className="text-red-500">*</span>
          </label>
          <input
            id="permitNumber"
            type="text"
            inputMode="numeric"
            value={permitNumber}
            onChange={(e) => setPermitNumber(e.target.value)}
            placeholder="E-2411-24"
            className="w-full border border-gray-300 rounded-xl p-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        {/* Trade type */}
        <div className="space-y-3">
          <label className="block font-semibold text-gray-900">
            Trade Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TRADE_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTradeType(t.value)}
                className={`p-3 rounded-xl border-2 text-center transition-colors ${
                  tradeType === t.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-xl">{t.emoji}</div>
                <div className="text-xs font-medium text-gray-900 mt-1">
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Issued date */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-900" htmlFor="issuedDate">
            Issued Date <span className="text-red-500">*</span>
          </label>
          <input
            id="issuedDate"
            type="date"
            value={issuedDate}
            onChange={(e) => setIssuedDate(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        {/* Expiration date */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-900" htmlFor="expirationDate">
            Expiration Date <span className="text-red-500">*</span>
            <span className="font-normal text-gray-500 text-sm ml-1">
              (auto-calculated, editable)
            </span>
          </label>
          <input
            id="expirationDate"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        {/* Rough-in required toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-semibold text-gray-900">Rough-in inspection required?</p>
            <p className="text-sm text-gray-500">Most trade permits require this</p>
          </div>
          <button
            type="button"
            onClick={() => setRoughInRequired(!roughInRequired)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
              roughInRequired ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                roughInRequired ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Notes (collapsed by default) */}
        <div>
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-sm text-blue-600 font-medium"
          >
            {showNotes ? "− Hide notes" : "+ Add notes (optional)"}
          </button>
          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this permit..."
              rows={3}
              className="mt-2 w-full border border-gray-300 rounded-xl p-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? "Adding Permit..." : "Add Permit"}
        </button>

        <p className="text-center text-sm text-gray-500 pb-2">
          You&apos;ll get reminders before key dates automatically.
        </p>
      </form>
    </div>
  )
}
