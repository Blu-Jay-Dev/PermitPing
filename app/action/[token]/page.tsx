import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ACTION_LABELS: Record<string, string> = {
  mark_rough_called: "Rough-In Called",
  mark_rough_passed: "Rough-In Passed",
  mark_final_called: "Final Inspection Called",
  mark_final_passed: "Final Inspection Passed",
}

export default async function ActionPage({
  params,
  searchParams,
}: {
  params: { token: string }
  searchParams: { success?: string; action?: string }
}) {
  const supabase = getServiceClient()

  // Look up the token to show permit info
  const { data: tokenRow } = await supabase
    .from("action_tokens")
    .select(`*, permit:permits(*, job:jobs(address, name))`)
    .eq("token", params.token)
    .single()

  const isSuccess = searchParams.success === "true"
  const actionLabel = ACTION_LABELS[searchParams.action ?? tokenRow?.action ?? ""] ?? "Update"

  const permit = tokenRow?.permit as ({ permit_number: string; job: { address: string | null; name: string } | null }) | null

  const address = permit?.job?.address ?? permit?.job?.name ?? "your permit"

  if (!tokenRow && !isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Link Not Found</h1>
        <p className="text-gray-600">
          This reminder link is invalid or has expired.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 text-blue-600 font-medium"
        >
          Open PermitJockey →
        </Link>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Done!</h1>
        <p className="text-lg text-gray-700 mb-1">{actionLabel}</p>
        <p className="text-gray-500">{address}</p>
        <div className="mt-8 space-y-3 w-full">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors text-center"
          >
            Open PermitJockey
          </Link>
          <p className="text-sm text-gray-500">
            We&apos;ll keep tracking this permit and remind you when needed.
          </p>
        </div>
      </div>
    )
  }

  // Show confirmation page before action
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="text-5xl mb-4">📋</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{address}</h1>
      {permit && (
        <p className="text-gray-500 mb-2">
          Permit #{permit.permit_number}
        </p>
      )}
      <p className="text-gray-700 mb-8">
        Confirm: <strong>{actionLabel}</strong>
      </p>
      <form action={`/api/action/${params.token}`} method="GET" className="w-full">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-5 px-6 rounded-2xl text-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Confirm ✓
        </button>
      </form>
      <Link
        href="/dashboard"
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        Open full app →
      </Link>
    </div>
  )
}
