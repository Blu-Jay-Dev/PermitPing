import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function sendSms(to: string, body: string) {
  // SMS messages must stay under 160 chars to avoid concatenation fees
  const truncated = body.length > 160 ? body.substring(0, 157) + "..." : body

  return client.messages.create({
    body: truncated,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  })
}
