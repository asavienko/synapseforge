"use client"

interface IconProps {
  className?: string
}

// Illustrated play button with gradient feel
export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Outer circle */}
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
      {/* Inner glow circle */}
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      {/* Play triangle */}
      <path d="M13 10L23 16L13 22V10Z" fill="currentColor" />
    </svg>
  )
}

// Pause icon
export function PauseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="8" y="6" width="5" height="20" rx="1" fill="currentColor" />
      <rect x="19" y="6" width="5" height="20" rx="1" fill="currentColor" />
    </svg>
  )
}

// Skip/Next icon
export function SkipIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Play triangle */}
      <path d="M6 6L18 16L6 26V6Z" fill="currentColor" />
      {/* Skip bar */}
      <path d="M24 6V26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// Previous icon
export function PreviousIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Play triangle reversed */}
      <path d="M26 6L14 16L26 26V6Z" fill="currentColor" />
      {/* Skip bar */}
      <path d="M8 6V26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// Repeat/Loop icon
export function RepeatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Loop arrows */}
      <path d="M4 12C4 7.58172 7.58172 4 12 4H20C24.4183 4 28 7.58172 28 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 20C28 24.4183 24.4183 28 20 28H12C7.58172 28 4 24.4183 4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arrow heads */}
      <path d="M24 8L28 12L24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16L4 20L8 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Volume icon with waves
export function VolumeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Speaker cone */}
      <path d="M6 12H10L16 6V26L10 20H6C4.89543 20 4 19.1046 4 18V14C4 12.8954 4.89543 12 6 12Z" fill="currentColor" />
      {/* Sound waves */}
      <path d="M20 10C21.5 12 22 14 22 16C22 18 21.5 20 20 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M24 6C26.5 9 28 12.5 28 16C28 19.5 26.5 23 24 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

// Animated waveform with varied heights
export function WaveformIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 28" fill="none" className={className}>
      <rect x="2" y="10" width="4" height="8" rx="2" fill="currentColor" opacity="0.6">
        <animate attributeName="height" values="8;14;8" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="10;7;10" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect x="10" y="6" width="4" height="16" rx="2" fill="currentColor" opacity="0.8">
        <animate attributeName="height" values="16;8;16" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" values="6;10;6" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="18" y="2" width="4" height="24" rx="2" fill="currentColor">
        <animate attributeName="height" values="24;12;24" dur="0.7s" repeatCount="indefinite" />
        <animate attributeName="y" values="2;8;2" dur="0.7s" repeatCount="indefinite" />
      </rect>
      <rect x="26" y="4" width="4" height="20" rx="2" fill="currentColor" opacity="0.9">
        <animate attributeName="height" values="20;10;20" dur="0.5s" repeatCount="indefinite" />
        <animate attributeName="y" values="4;9;4" dur="0.5s" repeatCount="indefinite" />
      </rect>
      <rect x="34" y="8" width="4" height="12" rx="2" fill="currentColor" opacity="0.7">
        <animate attributeName="height" values="12;20;12" dur="0.65s" repeatCount="indefinite" />
        <animate attributeName="y" values="8;4;8" dur="0.65s" repeatCount="indefinite" />
      </rect>
      <rect x="42" y="6" width="4" height="16" rx="2" fill="currentColor" opacity="0.85">
        <animate attributeName="height" values="16;6;16" dur="0.75s" repeatCount="indefinite" />
        <animate attributeName="y" values="6;11;6" dur="0.75s" repeatCount="indefinite" />
      </rect>
      <rect x="50" y="10" width="4" height="8" rx="2" fill="currentColor" opacity="0.5">
        <animate attributeName="height" values="8;18;8" dur="0.55s" repeatCount="indefinite" />
        <animate attributeName="y" values="10;5;10" dur="0.55s" repeatCount="indefinite" />
      </rect>
      <rect x="58" y="11" width="4" height="6" rx="2" fill="currentColor" opacity="0.4">
        <animate attributeName="height" values="6;12;6" dur="0.9s" repeatCount="indefinite" />
        <animate attributeName="y" values="11;8;11" dur="0.9s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

// Illustrated headphones icon
export function HeadphonesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Headband */}
      <path d="M6 18C6 12 10 6 16 6C22 6 26 12 26 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left ear cup */}
      <rect x="2" y="16" width="6" height="10" rx="3" fill="currentColor" />
      <rect x="3" y="17" width="4" height="8" rx="2" fill="currentColor" opacity="0.5" />
      {/* Right ear cup */}
      <rect x="24" y="16" width="6" height="10" rx="3" fill="currentColor" />
      <rect x="25" y="17" width="4" height="8" rx="2" fill="currentColor" opacity="0.5" />
      {/* Sound waves */}
      <path d="M12 21C13 20 14 20 14 21C14 22 13 22 12 21" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M20 21C19 20 18 20 18 21C18 22 19 22 20 21" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

// Illustrated vintage microphone
export function MicrophoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Mic head */}
      <rect x="10" y="4" width="12" height="16" rx="6" stroke="currentColor" strokeWidth="2" />
      {/* Grille lines */}
      <path d="M12 8H20M12 12H20M12 16H20" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      {/* Stand arc */}
      <path d="M6 16C6 21.5228 10.4772 26 16 26C21.5228 26 26 21.5228 26 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Stand */}
      <path d="M16 26V30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Base */}
      <path d="M11 30H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sound waves */}
      <path d="M28 10C29 11 30 13 30 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M2 16C2 13 3 11 4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}
