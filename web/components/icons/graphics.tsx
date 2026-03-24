"use client"

interface IconProps {
  className?: string
}

// Organic blob with gradient feel
export function BlobGraphic({ className }: IconProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <path
        d="M47.5,-57.2C59.9,-46.5,67.5,-30.4,71.4,-13.1C75.3,4.2,75.6,22.7,67.8,37.2C60,51.7,44.2,62.2,27.3,68.5C10.4,74.8,-7.6,76.9,-24.2,72C-40.8,67.1,-56,55.2,-65.1,40C-74.2,24.8,-77.2,6.3,-73.6,-10.5C-70,-27.3,-59.8,-42.4,-46.3,-52.9C-32.8,-63.4,-16.4,-69.3,0.5,-69.9C17.4,-70.5,35.1,-67.9,47.5,-57.2Z"
        transform="translate(100 100)"
        fill="currentColor"
      />
    </svg>
  )
}

// Wavy section divider
export function WavyLineGraphic({ className }: IconProps) {
  return (
    <svg viewBox="0 0 1200 120" fill="none" className={className} preserveAspectRatio="none">
      <path 
        d="M0 60C200 100 400 20 600 60C800 100 1000 20 1200 60V120H0V60Z" 
        fill="currentColor"
      />
      <path 
        d="M0 80C200 40 400 100 600 60C800 20 1000 80 1200 40" 
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
    </svg>
  )
}

// Scattered circle pattern
export function CirclePatternGraphic({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="20" cy="20" r="8" fill="currentColor" opacity="0.15" />
      <circle cx="60" cy="15" r="4" fill="currentColor" opacity="0.2" />
      <circle cx="100" cy="25" r="6" fill="currentColor" opacity="0.1" />
      <circle cx="15" cy="60" r="5" fill="currentColor" opacity="0.18" />
      <circle cx="55" cy="55" r="10" fill="currentColor" opacity="0.08" />
      <circle cx="95" cy="65" r="4" fill="currentColor" opacity="0.22" />
      <circle cx="25" cy="100" r="7" fill="currentColor" opacity="0.12" />
      <circle cx="70" cy="95" r="5" fill="currentColor" opacity="0.16" />
      <circle cx="105" cy="105" r="8" fill="currentColor" opacity="0.1" />
      {/* Connecting subtle lines */}
      <path d="M20 20L60 55M60 55L100 25M15 60L55 55L95 65M25 100L55 55" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    </svg>
  )
}

// Musical notes floating graphic
export function MusicNotesGraphic({ className }: IconProps) {
  return (
    <svg viewBox="0 0 160 100" fill="none" className={className}>
      {/* Large double note */}
      <g opacity="0.6">
        <path d="M20 70V25L40 20V65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 25L40 20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="15" cy="72" rx="8" ry="6" fill="currentColor" />
        <ellipse cx="35" cy="67" rx="8" ry="6" fill="currentColor" />
      </g>
      
      {/* Medium single note */}
      <g opacity="0.4">
        <path d="M75 55V25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="71" cy="57" rx="6" ry="5" fill="currentColor" />
        <path d="M75 25C75 25 82 28 82 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      
      {/* Small eighth note */}
      <g opacity="0.3">
        <path d="M110 45V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="107" cy="47" rx="5" ry="4" fill="currentColor" />
        <path d="M110 20C110 20 116 22 116 28C116 34 110 32 110 32" fill="currentColor" />
      </g>
      
      {/* Floating dots as musical dust */}
      <circle cx="55" cy="35" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="95" cy="60" r="1.5" fill="currentColor" opacity="0.25" />
      <circle cx="130" cy="30" r="2.5" fill="currentColor" opacity="0.15" />
      <circle cx="145" cy="55" r="1.5" fill="currentColor" opacity="0.2" />
      <circle cx="50" cy="75" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// Abstract sound wave decoration
export function SoundWaveDecoration({ className }: IconProps) {
  return (
    <svg viewBox="0 0 300 80" fill="none" className={className} preserveAspectRatio="none">
      <path
        d="M0 40C20 30 40 50 60 40C80 30 100 50 120 40C140 30 160 50 180 40C200 30 220 50 240 40C260 30 280 50 300 40"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M0 50C30 35 60 65 90 50C120 35 150 65 180 50C210 35 240 65 270 50C290 40 300 50 300 50"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.2"
      />
      <path
        d="M0 30C25 45 50 25 75 40C100 55 125 35 150 50C175 65 200 45 225 60C250 75 275 55 300 70"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
      />
    </svg>
  )
}

// Confetti/celebration decoration
export function ConfettiDecoration({ className }: IconProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {/* Various shapes */}
      <rect x="20" y="30" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" transform="rotate(15 24 34)" />
      <circle cx="60" cy="50" r="4" fill="currentColor" opacity="0.25" />
      <rect x="100" y="20" width="6" height="12" rx="1" fill="currentColor" opacity="0.2" transform="rotate(-20 103 26)" />
      <circle cx="150" cy="40" r="5" fill="currentColor" opacity="0.35" />
      <rect x="180" y="60" width="10" height="6" rx="1" fill="currentColor" opacity="0.2" transform="rotate(30 185 63)" />
      <circle cx="30" cy="100" r="3" fill="currentColor" opacity="0.3" />
      <rect x="70" y="120" width="8" height="4" rx="1" fill="currentColor" opacity="0.25" transform="rotate(-10 74 122)" />
      <circle cx="120" cy="90" r="6" fill="currentColor" opacity="0.2" />
      <rect x="160" y="110" width="5" height="10" rx="1" fill="currentColor" opacity="0.3" transform="rotate(45 162.5 115)" />
      <circle cx="40" cy="160" r="4" fill="currentColor" opacity="0.25" />
      <rect x="90" y="170" width="12" height="5" rx="1" fill="currentColor" opacity="0.2" transform="rotate(-25 96 172.5)" />
      <circle cx="140" cy="150" r="3" fill="currentColor" opacity="0.35" />
      <rect x="175" y="140" width="6" height="8" rx="1" fill="currentColor" opacity="0.25" transform="rotate(60 178 144)" />
    </svg>
  )
}
