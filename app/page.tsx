import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="font-bold text-xl text-blue-600">PermitPing</span>
          <Link
            href="/sign-in"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Stop forgetting open permits.
          </h1>
          <p className="text-lg text-gray-600">
            Get reminded before inspection windows close — before your license
            is at risk.
          </p>
          <Link
            href="/sign-up"
            className="inline-block w-full bg-blue-600 text-white text-center font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-lg"
          >
            Start Free Trial →
          </Link>
          <p className="text-sm text-gray-500">
            14 days free · No credit card required
          </p>
        </section>

        {/* Pain points */}
        <section className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-green-500 text-xl flex-shrink-0">✓</span>
            <p className="text-gray-700">
              Permits fall through the cracks when you&apos;re juggling 10 jobs
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-green-500 text-xl flex-shrink-0">✓</span>
            <p className="text-gray-700">
              Missed final inspections block your license renewal
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-green-500 text-xl flex-shrink-0">✓</span>
            <p className="text-gray-700">
              Expired permits mean re-pulling, re-fees, and project delays
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            How it works
          </h2>
          <div className="space-y-3">
            {[
              {
                n: "1",
                title: "Add your open permits",
                desc: "Takes 60 seconds per permit",
              },
              {
                n: "2",
                title: "Get SMS + email reminders",
                desc: "Before key inspection dates and expirations",
              },
              {
                n: "3",
                title: "Tap to confirm — move on",
                desc: "One tap from the reminder link updates your permit",
              },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center space-y-3">
          <div className="text-4xl font-bold text-gray-900">
            $39<span className="text-xl font-normal text-gray-600">/month</span>
          </div>
          <ul className="text-gray-700 space-y-1">
            <li>Unlimited permits · Unlimited jobs</li>
            <li>SMS + email reminders included</li>
            <li>Cancel anytime</li>
          </ul>
          <Link
            href="/sign-up"
            className="inline-block w-full bg-blue-600 text-white text-center font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Start Free Trial →
          </Link>
        </section>

        {/* Trade types */}
        <section className="text-center">
          <p className="text-sm text-gray-500">
            Built for Electricians · HVAC Contractors · Plumbers · General
            Contractors
          </p>
        </section>
      </main>
    </div>
  )
}
