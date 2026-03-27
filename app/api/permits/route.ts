import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

// POST /api/permits — create a new permit
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    job_id,
    permit_number,
    trade_type,
    issued_date,
    expiration_date,
    rough_in_required,
    notes,
    // Inline job creation fields
    new_job_address,
  } = body

  if (!permit_number || !trade_type || !issued_date || !expiration_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!job_id && !new_job_address) {
    return NextResponse.json({ error: "Must provide job_id or new_job_address" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractor) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 })
  }

  let resolvedJobId = job_id

  // Inline job creation
  if (!job_id && new_job_address) {
    const { data: newJob, error: jobError } = await supabase
      .from("jobs")
      .insert({
        contractor_id: contractor.id,
        name: new_job_address,
        address: new_job_address,
      })
      .select("id")
      .single()

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }
    resolvedJobId = newJob.id
  }

  const { data: permit, error: permitError } = await supabase
    .from("permits")
    .insert({
      job_id: resolvedJobId,
      contractor_id: contractor.id,
      permit_number,
      trade_type,
      issued_date,
      expiration_date,
      rough_in_required: rough_in_required ?? true,
      notes: notes ?? null,
      status: "open",
    })
    .select("id")
    .single()

  if (permitError) {
    return NextResponse.json({ error: permitError.message }, { status: 500 })
  }

  return NextResponse.json({ permit }, { status: 201 })
}
