import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">
        This page doesn&apos;t exist. Head back to your dashboard to check your permits.
      </p>
      <Link
        href="/dashboard"
        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
