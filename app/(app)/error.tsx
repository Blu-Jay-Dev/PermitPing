"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">
        An unexpected error occurred. Your permits are safe — try again or head back to the dashboard.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-blue-600 text-white font-semibold py-3 px-5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
