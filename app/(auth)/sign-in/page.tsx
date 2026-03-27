import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <span className="text-2xl font-bold text-blue-600">PermitJockey</span>
      </div>
      <SignIn />
    </div>
  )
}
