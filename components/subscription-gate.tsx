"use client"

// Placeholder client component — gating logic lives in the server layout.
// Kept here for future client-side subscription checks if needed.
export default function SubscriptionGate({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
