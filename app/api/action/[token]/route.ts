import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Service client — bypasses RLS, no auth cookie required
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ACTION_UPDATES: Record<string, Record<string, unknown>> = {
  mark_rough_called: {
    rough_in_called_at: new Date().toISOString(),
    status: "rough_pending",
  },
  mark_rough_passed: {
    rough_in_passed_at: new Date().toISOString(),
    status: "rough_passed",
  },
  mark_final_called: {
    final_called_at: new Date().toISOString(),
    status: "final_pending",
  },
  mark_final_passed: {
    final_passed_at: new Date().toISOString(),
    status: "closed",
  },
}

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const supabase = getServiceClient()

  // Validate token
  const { data: tokenRow, error } = await supabase
    .from("action_tokens")
    .select("*")
    .eq("token", params.token)
    .single()

  if (error || !tokenRow) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  }

  if (tokenRow.used_at) {
    return NextResponse.json({ error: "Token already used" }, { status: 410 })
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 })
  }

  const update = ACTION_UPDATES[tokenRow.action]
  if (!update) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }

  // Update the permit
  const { error: permitError } = await supabase
    .from("permits")
    .update(update)
    .eq("id", tokenRow.permit_id)

  if (permitError) {
    return NextResponse.json({ error: permitError.message }, { status: 500 })
  }

  // Mark token as used
  await supabase
    .from("action_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenRow.id)

  // Redirect to the no-login success page
  return NextResponse.redirect(
    new URL(
      `/action/${params.token}?success=true&action=${tokenRow.action}`,
      process.env.NEXT_PUBLIC_APP_URL!
    )
  )
}
