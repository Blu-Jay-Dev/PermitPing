import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ToastProvider } from "@/components/ui/toast"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://permitjockey.com"),
  title: "PermitJockey — Stop forgetting open permits",
  description:
    "Get SMS + email reminders before inspection windows close and permits expire. Built for electricians, HVAC, plumbers, and GCs.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PermitJockey",
  },
  openGraph: {
    title: "PermitJockey — Stop forgetting open permits",
    description:
      "Get SMS + email reminders before inspection windows close and permits expire. Built for electricians, HVAC, plumbers, and GCs.",
    url: "https://permitjockey.com",
    siteName: "PermitJockey",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fbbf24",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en">
        <body className={inter.className}>
          <ToastProvider>
            {children}
          </ToastProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
