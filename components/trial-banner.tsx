"use client"

interface Props {
  daysLeft: number
}

export default function TrialBanner({ daysLeft }: Props) {
  if (daysLeft <= 0) return null

  const isUrgent = daysLeft <= 3

  return (
    <div
      className={`text-sm text-center px-4 py-2 font-medium flex items-center justify-center gap-2 ${
        isUrgent
          ? "bg-amber-500 text-white"
          : "bg-amber-50 border-b border-amber-200 text-amber-800"
      }`}
    >
      <span>
        {daysLeft === 1
          ? "Last day of your free trial."
          : `${daysLeft} days left in your free trial.`}
      </span>
      <a
        href="/api/checkout"
        className={`underline font-bold whitespace-nowrap ${
          isUrgent ? "text-white" : "text-amber-900"
        }`}
      >
        Upgrade — $39/mo →
      </a>
    </div>
  )
}
