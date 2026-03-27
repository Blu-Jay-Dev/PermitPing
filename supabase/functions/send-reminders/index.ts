// Supabase Edge Function — runs nightly via cron
// Schedule: "0 7 * * *" (7am UTC daily)
// Deploy: supabase functions deploy send-reminders

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Bypasses RLS
)

const APP_URL = Deno.env.get("APP_URL") ?? "https://permitjockey.com"
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!

type ReminderType =
  | "rough_in_due"
  | "rough_in_overdue"
  | "expiration_30day"
  | "expiration_7day"
  | "expiration_1day"
  | "final_overdue"

Deno.serve(async () => {
  const today = new Date().toISOString().split("T")[0]

  const { data: permits, error } = await supabase
    .from("permits")
    .select(`
      *,
      contractor:contractors(id, email, phone, company_name),
      job:jobs(name, address)
    `)
    .not("status", "eq", "closed")
    .not("status", "eq", "expired")

  if (error) {
    console.error("Failed to fetch permits:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let sent = 0
  for (const permit of permits ?? []) {
    const count = await evaluateAndSendReminders(permit, today)
    sent += count
  }

  return new Response(JSON.stringify({ success: true, reminders_sent: sent }), {
    headers: { "Content-Type": "application/json" },
  })
})

async function evaluateAndSendReminders(permit: any, today: string): Promise<number> {
  const remindersToSend: ReminderType[] = []
  const issued = new Date(permit.issued_date)
  const expiration = new Date(permit.expiration_date)
  const now = new Date(today)

  const daysSinceIssued = daysBetween(issued, now)
  const daysUntilExpiration = daysBetween(now, expiration)

  if (permit.rough_in_required && !permit.rough_in_called_at) {
    if (daysSinceIssued >= 3 && daysSinceIssued < 7) remindersToSend.push("rough_in_due")
    if (daysSinceIssued >= 7) remindersToSend.push("rough_in_overdue")
  }

  if (daysUntilExpiration === 30) remindersToSend.push("expiration_30day")
  if (daysUntilExpiration === 7) remindersToSend.push("expiration_7day")
  if (daysUntilExpiration === 1) remindersToSend.push("expiration_1day")

  if (permit.rough_in_passed_at && !permit.final_called_at) {
    const daysSinceRoughPassed = daysBetween(new Date(permit.rough_in_passed_at), now)
    if (daysSinceRoughPassed >= 14) remindersToSend.push("final_overdue")
  }

  let count = 0
  for (const type of remindersToSend) {
    const sent = await sendReminderIfNotAlreadySent(permit, type, today)
    if (sent) count++
  }
  return count
}

async function sendReminderIfNotAlreadySent(
  permit: any,
  type: ReminderType,
  today: string
): Promise<boolean> {
  // Deduplication check
  const { data: existing } = await supabase
    .from("reminders")
    .select("id")
    .eq("permit_id", permit.id)
    .eq("type", type)
    .eq("scheduled_for", today)
    .not("sent_at", "is", null)
    .single()

  if (existing) return false

  // Generate action token
  const action = getActionForReminderType(type)
  const { data: tokenRow } = await supabase
    .from("action_tokens")
    .insert({
      permit_id: permit.id,
      contractor_id: permit.contractor_id,
      action,
    })
    .select("token")
    .single()

  const actionUrl = `${APP_URL}/action/${tokenRow?.token}`
  const msg = buildMessage(permit, type, actionUrl)

  // Send email
  if (permit.contractor?.email) {
    await sendEmail(permit.contractor.email, msg.subject, msg.body)
  }

  // Send SMS
  if (permit.contractor?.phone) {
    await sendSms(permit.contractor.phone, msg.sms)
  }

  // Log reminder
  await supabase.from("reminders").insert({
    permit_id: permit.id,
    contractor_id: permit.contractor_id,
    type,
    channel: "email",
    scheduled_for: today,
    sent_at: new Date().toISOString(),
    action_token: tokenRow?.token ?? null,
  })

  return true
}

function buildMessage(
  permit: any,
  type: ReminderType,
  actionUrl: string
): { subject: string; body: string; sms: string } {
  const address = permit.job?.address ?? permit.job?.name ?? "your job"
  const permitNum = permit.permit_number
  const expDate = new Date(permit.expiration_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  const messages: Record<ReminderType, { subject: string; body: string; sms: string }> = {
    rough_in_due: {
      subject: `Rough-in inspection reminder — ${address}`,
      body: `Your ${permit.trade_type} permit (#${permitNum}) at ${address} was issued ${daysBetween(new Date(permit.issued_date), new Date())} days ago. Have you called for a rough-in inspection yet?\n\nMark it done: ${actionUrl}`,
      sms: `PermitJockey: Rough-in for ${address} (#${permitNum}) — called yet? Exp ${expDate}. Update: ${actionUrl}`,
    },
    rough_in_overdue: {
      subject: `⚠️ Rough-in overdue — ${address}`,
      body: `Your rough-in inspection at ${address} is overdue. Permit expires ${expDate}.\n\nMark called: ${actionUrl}`,
      sms: `⚠️ PermitJockey: Rough-in OVERDUE at ${address}. Exp ${expDate}. Mark called: ${actionUrl}`,
    },
    expiration_30day: {
      subject: `Permit expires in 30 days — ${address}`,
      body: `Your ${permit.trade_type} permit (#${permitNum}) at ${address} expires on ${expDate}. Make sure all inspections are scheduled.\n\nView permit: ${actionUrl}`,
      sms: `PermitJockey: Permit at ${address} expires ${expDate} (30 days). Schedule inspections: ${actionUrl}`,
    },
    expiration_7day: {
      subject: `⚠️ Permit expires in 7 days — ${address}`,
      body: `URGENT: Your permit at ${address} expires ${expDate}. ${!permit.final_called_at ? "Final inspection has not been called." : ""}\n\nTake action: ${actionUrl}`,
      sms: `⚠️ PermitJockey: Permit at ${address} expires in 7 DAYS (${expDate}). Act now: ${actionUrl}`,
    },
    expiration_1day: {
      subject: `🚨 Permit expires TOMORROW — ${address}`,
      body: `Your permit at ${address} expires TOMORROW (${expDate}). Contact your building department immediately.\n\nView: ${actionUrl}`,
      sms: `🚨 PermitJockey: Permit at ${address} expires TOMORROW (${expDate}). Call your building dept NOW.`,
    },
    final_overdue: {
      subject: `Final inspection not called — ${address}`,
      body: `Your rough-in passed at ${address} but no final inspection has been called. Permit expires ${expDate}.\n\nMark final called: ${actionUrl}`,
      sms: `PermitJockey: Final inspection not called at ${address}. Exp ${expDate}. Mark done: ${actionUrl}`,
    },
  }

  return messages[type]
}

async function sendEmail(to: string, subject: string, text: string) {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PermitJockey <reminders@permitjockey.com>",
        to,
        subject,
        text,
      }),
    })
  } catch (e) {
    console.error("Email send failed:", e)
  }
}

async function sendSms(to: string, body: string) {
  // Keep under 160 chars
  const truncated = body.length > 160 ? body.substring(0, 157) + "..." : body
  try {
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    const form = new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER,
      Body: truncated,
    })
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form,
      }
    )
  } catch (e) {
    console.error("SMS send failed:", e)
  }
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function getActionForReminderType(type: ReminderType): string {
  if (type === "rough_in_due" || type === "rough_in_overdue") return "mark_rough_called"
  return "mark_final_called"
}
