"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

export default function NewJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    address: "",
    client_name: "",
    notes: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.address.trim()) {
      setError("Address is required")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.address.trim(),
          address: form.address.trim(),
          client_name: form.client_name.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to create job")
      }

      const { job } = await res.json()
      toast("Job created!", "success")
      router.push(`/permits/new?job_id=${job.id}`)
    } catch (err: any) {
      toast(err.message ?? "Failed to create job", "error")
      setError(err.message)
      setSaving(false)
    }
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
        <h1 className="font-bold text-lg text-gray-900">New Job</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md mx-auto">
        <div className="bg-white rounded-xl p-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Job Address <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="123 Oak Ave, Anytown FL 32801"
              autoComplete="street-address"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Client Name</span>
            <input
              type="text"
              value={form.client_name}
              onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
              placeholder="Smith Residence (optional)"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Notes</span>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes..."
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-base hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Job & Add Permit →"}
        </button>
      </form>
    </div>
  )
}
