"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

const TRADE_OPTIONS = [
  { value: "electrician", label: "Electrician" },
  { value: "hvac", label: "HVAC" },
  { value: "plumber", label: "Plumber" },
  { value: "gc", label: "General Contractor" },
  { value: "other", label: "Other" },
]

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
]

export default function SettingsEditPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    company_name: "",
    phone: "",
    trade_type: "",
    state: "",
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/onboarding")
        if (!res.ok) return
        const { contractor } = await res.json()
        if (contractor) {
          setForm({
            company_name: contractor.company_name ?? "",
            phone: contractor.phone ?? "",
            trade_type: contractor.trade_type ?? "",
            state: contractor.state ?? "",
          })
        }
      } catch {
        // silently ignore — form stays blank and user can fill it in
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? "Failed to save")
      }

      toast("Profile saved!", "success")
      setSuccess(true)
      setTimeout(() => router.push("/settings"), 1000)
    } catch (err: any) {
      toast(err.message ?? "Failed to save", "error")
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-blue-600 text-sm font-medium"
        >
          ← Back
        </button>
        <h1 className="font-bold text-lg text-gray-900">Edit Profile</h1>
      </header>

      <form onSubmit={handleSave} className="p-4 space-y-4 max-w-md mx-auto">
        {/* Company name */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Company Name</span>
            <input
              type="text"
              value={form.company_name}
              onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
              placeholder="ABC Electric LLC"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </label>

          {/* Phone */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Phone for SMS Reminders
            </span>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Include country code, e.g. +15551234567. Leave blank to disable SMS.
            </p>
          </label>
        </div>

        {/* Trade type */}
        <div className="bg-white rounded-xl p-4 space-y-2">
          <span className="text-sm font-medium text-gray-700">Your Trade</span>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {TRADE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, trade_type: opt.value }))}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  form.trade_type === opt.value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* State */}
        <div className="bg-white rounded-xl p-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">State</span>
            <select
              value={form.state}
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select state...</option>
              {US_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium">
            ✓ Saved! Redirecting...
          </div>
        )}

        <button
          type="submit"
          disabled={saving || success}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-base hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
