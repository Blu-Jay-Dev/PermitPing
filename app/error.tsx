"use client"

import { useEffect } from "react"

export default function GlobalError({
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">
        An unexpected error occurred. Your permits and data are safe — try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
