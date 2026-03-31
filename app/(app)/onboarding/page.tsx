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
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-5 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <Logo height={28} />
          <div>
            <h1 className="text-2xl font-bold text-stone-900 leading-tight">
              Welcome aboard
            </h1>
            <p className="text-stone-500 mt-1 text-base">
              Set up your account so we can send the right reminders.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Trade type */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 tracking-widest uppercase">
              Your Trade
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {TRADES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTrade(t.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    trade === t.value
                      ? "border-amber-400 bg-amber-50 shadow-sm"
                      : "border-stone-200 bg-white hover:border-stone-300 shadow-sm"
                  }`}
                >
                  <div className="text-2xl">{t.emoji}</div>
                  <div className={`font-semibold mt-1.5 text-sm ${trade === t.value ? "text-stone-900" : "text-stone-700"}`}>
                    {t.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 tracking-widest uppercase">
              State You Work In
            </p>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-stone-200 bg-white rounded-2xl p-4 text-stone-900 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
            >
              <option value="">Select state…</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Company name */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 tracking-widest uppercase">
              Company Name{" "}
              <span className="normal-case font-normal text-stone-400">(optional)</span>
            </p>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Smith Electric LLC"
              className="w-full border border-stone-200 bg-white rounded-2xl p-4 text-stone-900 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
            />
          </div>

          {/* Phone */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 tracking-widest uppercase">
              Phone for SMS Reminders{" "}
              <span className="normal-case font-normal text-stone-400">(recommended)</span>
            </p>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 555-5555"
              className="w-full border border-stone-200 bg-white rounded-2xl p-4 text-stone-900 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
            />
            <p className="text-sm text-stone-500 flex items-center gap-1.5">
              <span>📱</span>
              SMS is the most reliable way to get reminded on the job site.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-stone-900 font-bold py-4 px-6 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
          >
            {loading ? "Setting up…" : "Set Up My Account →"}
          </button>

        </form>
      </div>
    </div>
  )
}
