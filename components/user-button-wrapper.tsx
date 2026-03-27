"use client"

import { UserButton } from "@clerk/nextjs"

// Thin client wrapper — keeps UserButton inside a "use client" boundary
// so Clerk's internal state management never touches server component context.
export default function UserButtonWrapper() {
  return <UserButton />
}
