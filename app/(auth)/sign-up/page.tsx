import { SignUp } from "@clerk/nextjs"
import { Logo } from "@/components/logo"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center flex flex-col items-center gap-2">
        <Logo height={32} />
        <p className="text-gray-600 text-sm">14-day free trial · No credit card required</p>
      </div>
      <SignUp />
    </div>
  )
}
