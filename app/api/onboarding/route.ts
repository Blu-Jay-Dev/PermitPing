import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { trade_type, state, phone, company_name, email } = body

  if (!trade_type || !state || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Upsert contractor record
  const { error } = await supabase.from("contractors").upsert(
    {
      clerk_user_id: userId,
      email,
      trade_type,
      state,
      phone: phone ?? null,
      company_name: company_name ?? null,
    },
    { onConflict: "clerk_user_id" }
  )

  if (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
