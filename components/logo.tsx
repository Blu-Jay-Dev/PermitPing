/**
 * PermitJockey Logo Components
 *
 * <Logo />        — horizontal wordmark (dark on light bg)
 * <Logo white />  — horizontal wordmark (white on dark bg)
 * <LogoIcon />    — circular helmet icon mark only
 *
 * The mark is a jockey helmet (front view):
 *   dome (cubic bezier arc) + amber goggle stripe + brim
 */

interface LogoProps {
  white?: boolean
  className?: string
  height?: number
}

export function Logo({ white = false, className = "", height = 32 }: LogoProps) {
  const fg = white ? "white" : "#1c1917"
  const amber = "#f59e0b"

  // Wordmark viewBox 0 0 300 68
  // Mark: helmet in a 48×54 space, centred vertically in 68px
  // Dome: M 6 46 C 6 8 42 8 42 46 Z  → peaks at y≈17
  // Stripe: rect y=30 h=9, clipped to dome
  // Brim: rect x=2 y=43 w=44 h=11 rx=2
  // Text: x=58, y=46 (baseline), font-size=36

  return (
    <svg
      viewBox="0 0 300 68"
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PermitJockey"
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id="wm-dome">
          <path d="M 7 47 C 7 9 43 9 43 47 Z" />
        </clipPath>
      </defs>

      {/* Helmet dome */}
      <path d="M 7 47 C 7 9 43 9 43 47 Z" fill={fg} />

      {/* Amber goggle stripe — clipped to dome */}
      <rect x="5" y="31" width="40" height="10" fill={amber} clipPath="url(#wm-dome)" />

      {/* Brim */}
      <rect x="2" y="44" width="46" height="13" rx="2.5" fill={fg} />

      {/* Wordmark */}
      <text
        x="58"
        y="49"
        fontFamily="Inter, 'Helvetica Neue', Arial, sans-serif"
        fontSize="36"
        fill={fg}
        letterSpacing="-0.5"
      >
        <tspan fontWeight="400">Permit</tspan>
        <tspan fontWeight="800">Jockey</tspan>
      </text>
    </svg>
  )
}

interface LogoIconProps {
  size?: number
  className?: string
}

export function LogoIcon({ size = 40, className = "" }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PermitJockey"
      className={className}
      style={{ display: "block" }}
    >
      {/* Dark circle */}
      <circle cx="256" cy="256" r="256" fill="#1c1917" />

      <defs>
        <clipPath id="icon-dome">
          <path d="M 97 308 C 97 108 415 108 415 308 Z" />
        </clipPath>
      </defs>

      {/* Dome */}
      <path d="M 97 308 C 97 108 415 108 415 308 Z" fill="white" />

      {/* Amber goggle stripe */}
      <rect x="80" y="210" width="352" height="60" fill="#f59e0b" clipPath="url(#icon-dome)" />

      {/* Brim */}
      <rect x="52" y="295" width="408" height="58" rx="14" fill="white" />
    </svg>
  )
}
