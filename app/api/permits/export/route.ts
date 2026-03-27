import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

// GET /api/permits/export — download all permits as CSV
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await createServiceClient()

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 })

  const { data: permits, error } = await supabase
    .from("permits")
    .select("*, job:jobs(name, address, client_name)")
    .eq("contractor_id", contractor.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const fmt = (val: string | null | undefined) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`

  const fmtDate = (val: string | null | undefined) => {
    if (!val) return '""'
    return `"${new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}"`
  }

  const headers = [
    "Permit Number",
    "Address",
    "Client",
    "Trade",
    "Status",
    "Issued Date",
    "Expiration Date",
    "Rough-In Due Date",
    "Rough-In Called",
    "Rough-In Passed",
    "Final Called",
    "Final Passed",
    "Notes",
  ]

  const rows = (permits ?? []).map((p: any) => [
    fmt(p.permit_number),
    fmt(p.job?.address ?? p.job?.name),
    fmt(p.job?.client_name),
    fmt(p.trade_type),
    fmt(p.status),
    fmtDate(p.issued_date),
    fmtDate(p.expiration_date),
    fmtDate(p.rough_in_due_date),
    fmtDate(p.rough_in_called_at),
    fmtDate(p.rough_in_passed_at),
    fmtDate(p.final_called_at),
    fmtDate(p.final_passed_at),
    fmt(p.notes),
  ].join(","))

  const csv = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n")
  const today = new Date().toISOString().split("T")[0]

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="permits-${today}.csv"`,
    },
  })
}
