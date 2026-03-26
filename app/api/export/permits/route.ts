import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { daysUntil } from "@/lib/utils"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await createClient()

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractor) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: permits } = await supabase
    .from("permits")
    .select(`*, job:jobs(address, name)`)
    .eq("contractor_id", contractor.id)
    .neq("status", "closed")
    .order("expiration_date", { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((permits ?? []) as any[]).map((p: any) => {
    const job = p.job as { address: string | null; name: string } | null
    return [
      p.permit_number,
      job?.address ?? job?.name ?? "",
      p.trade_type,
      p.issued_date,
      p.expiration_date,
      p.status,
      daysUntil(p.expiration_date),
    ].join(",")
  })

  const csv = [
    "permit_number,address,trade_type,issued_date,expiration_date,status,days_until_expiration",
    ...rows,
  ].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="open-permits-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
