import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

// PATCH /api/permits/:id — update permit status fields
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  // Allow only specific field updates (status machine fields)
  const ALLOWED_FIELDS = [
    "rough_in_called_at",
    "rough_in_passed_at",
    "final_called_at",
    "final_passed_at",
    "status",
    "notes",
  ]

  const update: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Verify this permit belongs to the requesting contractor
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractor) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 })
  }

  const { data: permit, error } = await supabase
    .from("permits")
    .update(update)
    .eq("id", params.id)
    .eq("contractor_id", contractor.id) // RLS-equivalent ownership check
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!permit) return NextResponse.json({ error: "Permit not found" }, { status: 404 })

  return NextResponse.json({ permit })
}
