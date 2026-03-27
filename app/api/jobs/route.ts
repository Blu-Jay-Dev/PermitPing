import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

// GET /api/jobs — list active jobs for current contractor
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await createServiceClient()

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractor) return NextResponse.json({ jobs: [] })

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, name, address, client_name")
    .eq("contractor_id", contractor.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ jobs: jobs ?? [] })
}

// POST /api/jobs — create a new job
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, address, client_name } = body

  if (!name) return NextResponse.json({ error: "Job name is required" }, { status: 400 })

  const supabase = await createServiceClient()

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("clerk_user_id", userId)
    .single()

  if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 })

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      contractor_id: contractor.id,
      name,
      address: address ?? name,
      client_name: client_name ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ job }, { status: 201 })
}
