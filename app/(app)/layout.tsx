import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import BottomNav from "@/components/bottom-nav"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Content area with bottom padding for nav */}
      <div className="flex-1 pb-20 max-w-md mx-auto w-full">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
