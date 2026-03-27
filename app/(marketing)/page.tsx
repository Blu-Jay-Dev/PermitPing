"use client"

import Link from "next/link"
import React, { useEffect, useRef, useState } from "react"
import { Logo } from "@/components/logo"

// ─── Count-up hook ───────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return { count, ref }
}

// ─── SMS typing animation ────────────────────────────────────────────────────
const SMS_MESSAGES = [
  { from: "pp", text: "⚠️ Rough-in overdue — 123 Oak Ave (#E-2411). Permit expires Jun 14." },
  { from: "pp", text: "Mark called: permitjockey.com/a/x7k2m" },
  { from: "user", text: "Called ✓" },
  { from: "pp", text: "Got it — updated. Rough-in pending. 🟡" },
]

function SmsThread() {
  const [visible, setVisible] = useState<number[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          SMS_MESSAGES.forEach((_, i) => {
            setTimeout(() => setVisible(v => [...v, i]), i * 600 + 200)
          })
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="bg-stone-900 rounded-3xl p-4 shadow-2xl w-full max-w-sm mx-auto lg:max-w-none">
      <div className="bg-stone-800 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 text-stone-500 text-[10px]">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-3 h-1.5 bg-stone-500 rounded-sm" />
            <div className="w-3 h-1.5 bg-stone-500 rounded-sm" />
            <div className="w-3 h-1.5 bg-stone-500 rounded-sm" />
          </div>
        </div>
        <div className="px-4 pb-8 space-y-3 min-h-[260px]">
          <div className="text-center text-stone-500 text-[10px] py-1">
            PermitJockey · Today 7:04 AM
          </div>
          {SMS_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${
                visible.includes(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              } ${msg.from === "user" ? "flex justify-end" : ""}`}
            >
              {msg.from === "pp" ? (
                <div className="bg-blue-600 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                  <p className={`text-xs leading-relaxed ${msg.text.includes("permitjockey") ? "text-blue-200 underline" : "text-white"}`}>
                    {msg.text}
                  </p>
                </div>
              ) : (
                <div className="bg-stone-700 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[70%]">
                  <p className="text-white text-xs">{msg.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Animated permit cards ────────────────────────────────────────────────────
const PERMIT_CARDS = [
  {
    color: "border-red-400 bg-red-50",
    dot: "🔴",
    address: "123 Oak Ave",
    trade: "Electrical · #E-2411",
    status: "Rough-in not called — 8 days since issued",
    action: "Mark Rough-In Called ✓",
    delay: 0,
  },
  {
    color: "border-yellow-400 bg-yellow-50",
    dot: "🟡",
    address: "456 Maple Dr",
    trade: "HVAC · #H-0891",
    status: "Final not called · Expires in 12 days",
    action: "Mark Final Called ✓",
    delay: 120,
  },
  {
    color: "border-green-400 bg-green-50",
    dot: "🟢",
    address: "789 Pine Ct",
    trade: "Plumbing · #P-1203",
    status: "Rough-in passed · Expires in 47 days",
    action: "Mark Final Called ✓",
    delay: 240,
  },
]

function PermitCards() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="space-y-2">
      {PERMIT_CARDS.map((card, i) => (
        <div
          key={i}
          className={`rounded-xl border-2 p-4 transition-all duration-500 ${card.color} ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: visible ? `${card.delay}ms` : "0ms" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{card.dot}</span>
            <span className="font-bold text-stone-900 text-sm">{card.address}</span>
          </div>
          <p className="text-xs text-stone-500 mb-2">{card.trade}</p>
          <p className="text-xs text-stone-700 mb-3">{card.status}</p>
          <button className="w-full bg-white border border-stone-300 text-stone-800 font-semibold text-xs py-2 rounded-lg">
            {card.action}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { count: statCount, ref: statRef } = useCountUp(91)

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="bg-[#f8f7f4]/90 backdrop-blur border-b border-stone-200 px-6 py-5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo height={44} />
          <div className="flex items-center gap-6">
            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm text-stone-500">
              <a href="#how-it-works" className="hover:text-stone-900 transition-colors">How it works</a>
              <a href="#pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
            </nav>
            <Link
              href="/sign-in"
              className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
            >
              Sign in →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="px-6 pt-14 pb-12 lg:pt-20 lg:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

            {/* Left — copy */}
            <div className="space-y-5">
              {/* Social proof pill */}
              <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-sm">📊</span>
                <span className="text-xs font-medium text-stone-600">
                  Orange County FL cut expired permits 91% with reminders
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[2.75rem] lg:text-[3.5rem] font-black text-stone-900 leading-[1.05] tracking-tight">
                Permit expired.<br />
                <span className="text-red-500">$800 re-pull fee.</span><br />
                Never again.
              </h1>

              <p className="text-stone-500 text-base lg:text-lg leading-relaxed max-w-md">
                PermitJockey texts you before rough-in windows close, finals go overdue,
                and permits expire. One tap confirms. No login, no app, no hassle.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href="/sign-up"
                  className="block bg-amber-400 text-stone-900 text-center font-black py-4 px-8 rounded-xl text-lg hover:bg-amber-300 active:bg-amber-500 transition-colors shadow-lg shadow-amber-200 whitespace-nowrap"
                >
                  Start Free — 14 Days →
                </Link>
              </div>
              <p className="text-stone-400 text-sm">
                No credit card · No app to install · Cancel anytime
              </p>

              {/* Desktop trade tags */}
              <p className="hidden lg:block text-xs text-stone-400">
                Electricians · HVAC · Plumbers · General Contractors
              </p>
            </div>

            {/* Right — SMS mockup (shown inline on mobile, right column on desktop) */}
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <SmsThread />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat callout ────────────────────────────────────────────────────── */}
      <section ref={statRef} className="px-6 py-12 lg:py-16 bg-blue-600">
        <div className="max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-3 lg:gap-12 lg:items-center text-center lg:text-left">
            <div className="lg:col-span-1">
              <div className="text-7xl lg:text-8xl font-black text-white">{statCount}%</div>
            </div>
            <div className="mt-4 lg:mt-0 lg:col-span-2 space-y-2">
              <p className="text-blue-100 text-xl lg:text-2xl font-bold leading-snug">
                Fewer expired permits when contractors get reminders.
              </p>
              <p className="text-blue-300 text-sm lg:text-base">
                Orange County FL — 2,500 expired permits dropped to 229 in 9 months
                after a simple alert system was added. A text message solved a $2M+/year problem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain points ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <p className="text-xs font-bold text-stone-400 tracking-widest uppercase text-center lg:text-left">
            Sound familiar?
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { emoji: "💸", text: "Re-pulling an expired permit costs $400–$1,200 and days of your time" },
              { emoji: "🚫", text: "An open permit from 8 months ago blocked your license renewal" },
              { emoji: "😤", text: "Client called asking why the job is still open — you forgot the final" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 bg-white rounded-xl border border-stone-200 shadow-sm">
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <p className="text-base font-medium text-stone-800 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-12 lg:py-16 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto space-y-8 lg:space-y-10">
          <h2 className="text-2xl lg:text-3xl font-black text-stone-900 text-center lg:text-left">
            Three steps. Then forget about it.
          </h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                n: "1",
                title: "Add your open permits",
                desc: "60 seconds each. Permit number, trade, issue date. We auto-calculate the expiration.",
                tag: "Takes 60 seconds",
              },
              {
                n: "2",
                title: "We watch every deadline",
                desc: "Rough-in due, final overdue, expiring in 30 / 7 / 1 days. SMS first, email backup.",
                tag: "Automatic",
              },
              {
                n: "3",
                title: "Tap to confirm from the text",
                desc: "One link, no login. Permit updates instantly. Works on spotty job-site wifi.",
                tag: "No login required",
              },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center flex-shrink-0 font-bold text-sm text-white">
                  {s.n}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-stone-900 text-base">{s.title}</p>
                    <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {s.tag}
                    </span>
                  </div>
                  <p className="text-stone-500 text-base leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ───────────────────────────────────────────────── */}
      <section className="px-6 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

            {/* Copy — left on desktop */}
            <div className="space-y-4 mb-8 lg:mb-0">
              <h2 className="text-2xl lg:text-3xl font-black text-stone-900">
                Your board. Always up to date.
              </h2>
              <p className="text-stone-500 text-base leading-relaxed">
                Every permit ranked by urgency. Red needs action today.
                Yellow is coming up. Green is clear. One glance before you
                start the day — then get back to the job.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  "Rough-in inspection tracking",
                  "Final inspection tracking",
                  "30 / 7 / 1 day expiration warnings",
                  "One-tap status updates from SMS",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-base text-stone-700">
                    <span className="text-green-500 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <Link
                  href="/sign-up"
                  className="inline-block bg-amber-400 text-stone-900 font-black py-3 px-6 rounded-xl text-sm hover:bg-amber-300 transition-colors"
                >
                  Try it free →
                </Link>
              </div>
            </div>

            {/* Permit cards — right on desktop */}
            <div className="max-w-sm mx-auto lg:mx-0 lg:max-w-none">
              <PermitCards />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-12 lg:py-16 bg-stone-900">
        <div className="max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

            {/* Left — price */}
            <div className="text-center lg:text-left space-y-4">
              <p className="text-xs font-bold text-stone-500 tracking-widest uppercase">Pricing</p>
              <div className="text-7xl font-black text-white">
                $39<span className="text-3xl font-normal text-stone-400">/mo</span>
              </div>
              <p className="text-stone-400 text-base">
                One flat price. No seat fees, no per-SMS charges, no surprises.
              </p>
              <Link
                href="/sign-up"
                className="inline-block w-full lg:w-auto bg-amber-400 text-stone-900 font-black py-4 px-10 rounded-xl text-lg hover:bg-amber-300 transition-colors shadow-lg shadow-amber-900/30 text-center"
              >
                Start Free Trial →
              </Link>
              <p className="text-stone-500 text-sm">14 days free · No credit card required</p>
            </div>

            {/* Right — features */}
            <div className="mt-10 lg:mt-0">
              <ul className="space-y-4">
                {(
                  [
                    { icon: "📋", text: "Unlimited permits & jobs" },
                    { icon: "📱", text: "SMS + email reminders — no per-message fees" },
                    { icon: "🔗", text: "No-login action links from every reminder" },
                    { icon: "⚡", text: "Nightly deadline check, 7am reminder delivery" },
                    { icon: "📊", text: "CSV export of all open permits" },
                    {
                      icon: (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold leading-none flex-shrink-0">
                          ✕
                        </span>
                      ),
                      text: "Cancel anytime, no contracts",
                    },
                  ] as { icon: React.ReactNode; text: string }[]
                ).map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-lg leading-none flex-shrink-0">{f.icon}</span>
                    <span className="text-stone-300 text-base">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-10 border-t border-stone-200 bg-[#f8f7f4]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Brand */}
            <Logo height={28} />

            {/* Trades */}
            <p className="text-sm text-stone-400">
              Electricians · HVAC Contractors · Plumbers · General Contractors
            </p>

            {/* Legal */}
            <p className="text-xs text-stone-300">© 2026 PermitJockey. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
