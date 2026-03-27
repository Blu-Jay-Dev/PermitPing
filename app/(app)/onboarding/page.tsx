"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Logo } from "@/components/logo"

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]

const TRADES = [
  { value: "electrician", label: "Electrician", emoji: "⚡" },
  { value: "hvac", label: "HVAC", emoji: "❄️" },
  { value: "plumber", label: "Plumber", emoji: "🔧" },
  { value: "gc", label: "General Contractor", emoji: "🏗️" },
  { value: "other", label: "Other", emoji: "📋" },
]

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [trade, setTrade] = useState("")
  const [state, setState] = useState("")
  const [phone, setPhone] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trade || !state) {
      setError("Please select your trade and state.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade_type: trade,
          state,
          phone: phone || null,
          company_name: companyName || null,
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Setup failed")
      }

      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto space-y-8">
        <div className="space-y-3">
          <Logo height={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome aboard</h1>
            <p className="text-gray-600 mt-1">
              Let&apos;s set up your account so we can send the right reminders.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trade type */}
          <div className="space-y-3">
            <label className="block font-semibold text-gray-900">
              What&apos;s your trade?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRADES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTrade(t.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    trade === t.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl">{t.emoji}</div>
                  <div className="font-medium text-gray-900 mt-1">
                    {t.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-900" htmlFor="state">
              What state do you work in?
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-4 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">Select state...</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Company name */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-900" htmlFor="company">
              Company name{" "}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Smith Electric LLC"
              className="w-full border border-gray-300 rounded-xl p-4 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-900" htmlFor="phone">
              Phone for SMS reminders{" "}
              <span className="font-normal text-gray-500">(recommended)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 555-5555"
              className="w-full border border-gray-300 rounded-xl p-4 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p className="text-sm text-gray-500">
              SMS is the most reliable way to get reminded on the job site.
            </p>
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
            {loading ? "Setting up..." : "Set Up My Account →"}
          </button>
        </form>
      </div>
    </div>
  )
}
