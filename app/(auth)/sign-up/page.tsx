import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <span className="text-2xl font-bold text-blue-600">PermitPing</span>
        <p className="text-gray-600 mt-1">14-day free trial · No credit card required</p>
      </div>
      <SignUp />
    </div>
  )
}
