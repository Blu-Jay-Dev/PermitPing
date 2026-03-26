"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

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
      { threshold: 0.5 }
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
  { from: "pp", text: "Mark called: permitping.com/a/x7k2m" },
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
            setTimeout(() => setVisible(v => [...v, i]), i * 600 + 300)
          })
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="bg-stone-900 rounded-3xl p-3 shadow-2xl mx-auto max-w-xs">
      <div className="bg-stone-800 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 text-stone-500 text-[10px]">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-3 h-1.5 bg-stone-500 rounded-sm" />
            <div className="w-3 h-1.5 bg-stone-500 rounded-sm" />
            <div className="w-3 h-1.5 bg-stone-500 rounded-sm" />
          </div>
        </div>
        <div className="px-3 pb-5 space-y-2 min-h-[200px]">
          <div className="text-center text-stone-500 text-[10px] py-1">
            PermitPing · Today 7:04 AM
          </div>
          {SMS_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${
                visible.includes(i)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              } ${msg.from === "user" ? "flex justify-end" : ""}`}
            >
              {msg.from === "pp" ? (
                <div className="bg-blue-600 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                  <p className={`text-xs leading-relaxed ${msg.text.includes("permitping") ? "text-blue-200 underline" : "text-white"}`}>
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
      { threshold: 0.2 }
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
          <button className="w-full bg-white border border-stone-300 text-stone-800 font-semibold text-xs py-2 rounded-lg active:bg-stone-50">
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

      {/* Nav */}
      <header className="bg-[#f8f7f4]/90 backdrop-blur border-b border-stone-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <span className="font-bold text-stone-900 text-lg tracking-tight">PermitPing</span>
          </div>
          <Link href="/sign-in" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-14 pb-10">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Social proof pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-sm">📊</span>
            <span className="text-xs font-medium text-stone-600">
              Orange County FL cut expired permits 91% with reminders
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.75rem] font-black text-stone-900 leading-[1.05] tracking-tight">
            Permit expired.<br />
            <span className="text-red-500">$800 re-pull fee.</span><br />
            Never again.
          </h1>

          <p className="text-stone-500 text-base leading-relaxed">
            PermitPing texts you before rough-in windows close, finals go overdue,
            and permits expire. One tap confirms. No login, no app, no hassle.
          </p>

          {/* SMS Mockup */}
          <SmsThread />

          {/* CTAs */}
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/sign-up"
              className="block w-full bg-amber-400 text-stone-900 text-center font-black py-4 rounded-xl text-lg hover:bg-amber-300 active:bg-amber-500 transition-colors shadow-lg shadow-amber-200"
            >
              Start Free — 14 Days →
            </Link>
            <p className="text-center text-stone-400 text-xs">
              No credit card · No app to install · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stat callout */}
      <section ref={statRef} className="px-6 py-10 bg-blue-600">
        <div className="max-w-lg mx-auto text-center space-y-3">
          <div className="text-6xl font-black text-white">{statCount}%</div>
          <p className="text-blue-100 text-base font-medium leading-snug">
            Fewer expired permits when contractors get reminders.
          </p>
          <p className="text-blue-300 text-sm">
            Orange County FL — 2,500 expired permits dropped to 229 in 9 months
            after a simple alert system was added.
          </p>
        </div>
      </section>

      {/* Pain points */}
      <section className="px-6 py-12">
        <div className="max-w-lg mx-auto space-y-4">
          <p className="text-xs font-bold text-stone-400 tracking-widest uppercase">Sound familiar?</p>
          {[
            { emoji: "💸", text: "Re-pulling an expired permit costs $400–$1,200 and days of your time" },
            { emoji: "🚫", text: "An open permit from 8 months ago blocked your license renewal" },
            { emoji: "😤", text: "Client called asking why the job is still open — you forgot the final" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              <p className="text-sm font-medium text-stone-800">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-10 bg-white border-y border-stone-200">
        <div className="max-w-lg mx-auto space-y-7">
          <h2 className="text-2xl font-black text-stone-900">Three steps. Then forget about it.</h2>
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
              <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center flex-shrink-0 font-bold text-sm text-white">
                {s.n}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-stone-900">{s.title}</p>
                  <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                    {s.tag}
                  </span>
                </div>
                <p className="text-stone-500 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="px-6 py-12">
        <div className="max-w-lg mx-auto space-y-4">
          <h2 className="text-2xl font-black text-stone-900">Your board. Always up to date.</h2>
          <p className="text-stone-500 text-sm">Red needs action now. Yellow is coming up. Green is clear.</p>
          <PermitCards />
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-12 bg-stone-900">
        <div className="max-w-lg mx-auto text-center space-y-5">
          <p className="text-xs font-bold text-stone-500 tracking-widest uppercase">Pricing</p>
          <div className="text-6xl font-black text-white">
            $39<span className="text-2xl font-normal text-stone-400">/mo</span>
          </div>
          <ul className="text-stone-400 text-sm space-y-1">
            <li>Unlimited permits &amp; jobs</li>
            <li>SMS + email — no per-message fees</li>
            <li>No-login action links</li>
            <li>Cancel anytime</li>
          </ul>
          <Link
            href="/sign-up"
            className="inline-block w-full bg-amber-400 text-stone-900 font-black py-4 rounded-xl text-lg hover:bg-amber-300 transition-colors shadow-lg shadow-amber-900/30"
          >
            Start Free Trial →
          </Link>
          <p className="text-stone-600 text-xs">14 days free · No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t border-stone-200 bg-[#f8f7f4]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="font-bold text-stone-700 text-sm">PermitPing</span>
        </div>
        <p className="text-sm text-stone-400">
          Built for Electricians · HVAC Contractors · Plumbers · General Contractors
        </p>
        <p className="mt-2 text-xs text-stone-300">© 2026 PermitPing. All rights reserved.</p>
      </footer>
    </div>
  )
}
