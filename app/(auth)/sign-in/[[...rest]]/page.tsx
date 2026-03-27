"use client"

import { SignIn } from "@clerk/nextjs"
import { Logo } from "@/components/logo"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <Logo height={32} />
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        forceRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
