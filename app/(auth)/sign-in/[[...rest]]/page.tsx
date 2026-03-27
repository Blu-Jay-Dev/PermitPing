"use client"

import { SignIn } from "@clerk/nextjs"
import { Logo } from "@/components/logo"

// "use client" keeps Clerk's <SignIn /> fully in the browser context.
// Without it, Next.js App Router can treat Clerk's enhanced form actions
// as Server Actions — then when Clerk tries to pass redirect state through
// that mechanism, React throws "Client Functions cannot be passed to Server
// Functions." A client-component page prevents that entirely.
export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <Logo height={32} />
      </div>
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  )
}
