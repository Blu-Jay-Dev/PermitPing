/**
 * PermitJockey Logo Components
 *
 * <Logo />          — horizontal wordmark (dark, for light backgrounds)
 * <Logo white />    — horizontal wordmark (white, for dark backgrounds)
 * <LogoIcon />      — circular icon mark only (always dark bg + white/amber)
 */

interface LogoProps {
  white?: boolean
  className?: string
  height?: number
}

export function Logo({ white = false, className = "", height = 32 }: LogoProps) {
  const fg = white ? "white" : "#1c1917"
  const amber = "#f59e0b"

  return (
    <svg
      viewBox="0 0 320 80"
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PermitJockey"
      className={className}
      style={{ display: "block" }}
    >
      {/* Stem */}
      <rect x="0" y="8" width="14" height="64" rx="3" fill={fg} />

      {/* Helmet dome (bowl of P) */}
      <path d="M 14 8 A 25 18 0 0 1 14 44 L 14 8 Z" fill={fg} />

      {/* Visor / peak */}
      <path d="M 38 20 L 57 26 L 38 32 Z" fill={amber} />

      {/* Chin strap */}
      <path
        d="M 14 44 Q 26 60 40 63"
        stroke={amber}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Wordmark */}
      <text
        x="68"
        y="54"
        fontFamily="Inter, 'Helvetica Neue', Arial, sans-serif"
        fontSize="38"
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

      {/* Stem */}
      <rect x="180" y="155" width="46" height="205" rx="10" fill="white" />

      {/* Helmet dome */}
      <path d="M 226 155 A 80 57 0 0 1 226 269 L 226 155 Z" fill="white" />

      {/* Visor */}
      <path d="M 303 205 L 350 212 L 303 221 Z" fill="#f59e0b" />

      {/* Chin strap */}
      <path
        d="M 226 269 Q 262 315 295 318"
        stroke="#f59e0b"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
