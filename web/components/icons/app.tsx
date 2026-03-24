"use client"

interface IconProps {
  className?: string
}

// Modern logo blending musical note and speech bubble for language learning
export function LogoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      {/* Outer rounded square background */}
      <rect x="2" y="2" width="36" height="36" rx="10" className="fill-foreground" />
      
      {/* Left musical note stem */}
      <path d="M14 28V10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="stroke-background" />
      
      {/* Left note head (oval) */}
      <ellipse cx="14" cy="28" rx="3.5" ry="3" className="fill-background" />
      
      {/* Connecting beam arc */}
      <path d="M14 10Q22 8 28 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="stroke-background" />
      
      {/* Right musical note stem */}
      <path d="M28 20V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="stroke-background" />
      
      {/* Right note head (oval) */}
      <ellipse cx="28" cy="20" rx="3.5" ry="3" className="fill-background" />
      
      {/* Speech bubble tail - language indicator */}
      <path d="M18 30Q16 32 14 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="stroke-coral" opacity="0.8" />
      
      {/* Decorative accent - language waves */}
      <circle cx="10" cy="15" r="1.5" className="fill-lavender" opacity="0.7" />
      <circle cx="32" cy="25" r="1.5" className="fill-lavender" opacity="0.7" />
    </svg>
  )
}

// Illustrated double music note with decorative elements
export function SongIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Beam connecting notes */}
      <path d="M10 8L24 4V6L10 10V8Z" fill="currentColor" opacity="0.3" />
      {/* Left note stem */}
      <path d="M10 8V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right note stem */}
      <path d="M24 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left note head */}
      <ellipse cx="7" cy="25" rx="4" ry="3" fill="currentColor" />
      {/* Right note head */}
      <ellipse cx="21" cy="21" rx="4" ry="3" fill="currentColor" />
      {/* Decorative sparkle */}
      <circle cx="27" cy="8" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="29" cy="12" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// Illustrated crosshair target with pulse rings
export function TargetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Outer ring */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
      {/* Middle ring */}
      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      {/* Inner ring */}
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
      {/* Center dot */}
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      {/* Crosshair lines */}
      <path d="M16 2V8M16 24V30M2 16H8M24 16H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// Illustrated brain with neural connections
export function BrainIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Left hemisphere */}
      <path 
        d="M16 6C12 6 8 8 8 12C6 12 4 14 4 17C4 20 6 22 8 22C8 25 11 28 16 28" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right hemisphere */}
      <path 
        d="M16 6C20 6 24 8 24 12C26 12 28 14 28 17C28 20 26 22 24 22C24 25 21 28 16 28" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Neural connections */}
      <circle cx="12" cy="13" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="13" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="10" cy="19" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="22" cy="19" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      {/* Connection lines */}
      <path d="M12 13L16 16L20 13M10 19L16 16L22 19" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

// Illustrated group of people
export function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Back person */}
      <circle cx="22" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M16 28C16 23 18 20 22 20C26 20 28 23 28 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Middle person */}
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <path d="M4 28C4 23 6 20 10 20C14 20 16 23 16 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {/* Front person */}
      <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 30C8 24.4772 11.5817 20 16 20C20.4183 20 24 24.4772 24 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Illustrated sparkle/magic icon
export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Main star */}
      <path 
        d="M16 4L18 12L26 14L18 16L16 24L14 16L6 14L14 12L16 4Z" 
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Small sparkles */}
      <circle cx="26" cy="6" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="6" cy="24" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="28" cy="24" r="1" fill="currentColor" opacity="0.3" />
      {/* Rays */}
      <path d="M16 1V3M16 25V27M29 14H27M5 14H3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

// Illustrated checkmark with celebration
export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Circle */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
      {/* Checkmark */}
      <path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Celebration sparkles */}
      <circle cx="26" cy="6" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="6" cy="8" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="28" cy="20" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// Illustrated quote marks
export function QuoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Left quote */}
      <path 
        d="M6 20C6 16 8 12 14 12V14C10 14 10 16 10 18H14V24H6V20Z" 
        fill="currentColor"
      />
      {/* Right quote */}
      <path 
        d="M18 20C18 16 20 12 26 12V14C22 14 22 16 22 18H26V24H18V20Z" 
        fill="currentColor"
      />
      {/* Decorative dots */}
      <circle cx="4" cy="10" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="28" cy="26" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// Animated loader spinner
export function LoaderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M16 4C9.373 4 4 9.373 4 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

// My Songs icon - vinyl record with note
export function MySongsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Outer vinyl */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
      {/* Groove rings */}
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Center label */}
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      {/* Spindle hole */}
      <circle cx="16" cy="16" r="1" fill="currentColor" className="fill-background" />
      {/* Decorative note */}
      <path d="M27 7V4L29 3.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="26" cy="7.5" rx="1.5" ry="1" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

// Vocabulary/Book icon with letters
export function VocabIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Open book */}
      <path d="M16 8C16 8 12 6 6 6V24C12 24 16 26 16 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8C16 8 20 6 26 6V24C20 24 16 26 16 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Spine */}
      <path d="M16 8V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Letters */}
      <text x="9" y="16" fill="currentColor" fontSize="6" fontWeight="bold" opacity="0.5">A</text>
      <text x="20" y="16" fill="currentColor" fontSize="6" fontWeight="bold" opacity="0.5">Z</text>
    </svg>
  )
}

// Streak/Fire icon
export function StreakIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Flame outer */}
      <path 
        d="M16 4C16 4 8 12 8 20C8 24.4183 11.5817 28 16 28C20.4183 28 24 24.4183 24 20C24 12 16 4 16 4Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Inner flame */}
      <path 
        d="M16 14C16 14 12 18 12 22C12 24.2091 13.7909 26 16 26C18.2091 26 20 24.2091 20 22C20 18 16 14 16 14Z" 
        fill="currentColor"
        opacity="0.3"
      />
      {/* Sparkle */}
      <circle cx="18" cy="10" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

// Clock/Time icon with music note
export function PracticeTimeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Clock face */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
      {/* Hour markers */}
      <path d="M16 6V8M16 24V26M6 16H8M24 16H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Clock hands */}
      <path d="M16 16V10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 16L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      {/* Musical accent */}
      <circle cx="26" cy="6" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

// Trophy/Achievement icon
export function TrophyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Cup body */}
      <path d="M8 6H24V14C24 18.4183 20.4183 22 16 22C11.5817 22 8 18.4183 8 14V6Z" stroke="currentColor" strokeWidth="2" />
      {/* Handles */}
      <path d="M8 8H6C4.89543 8 4 8.89543 4 10V11C4 12.6569 5.34315 14 7 14H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 8H26C27.1046 8 28 8.89543 28 10V11C28 12.6569 26.6569 14 25 14H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Base */}
      <path d="M16 22V25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 28H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 25H20V28H12V25Z" fill="currentColor" opacity="0.3" />
      {/* Star decoration */}
      <path d="M16 10L17 12.5L19.5 12.5L17.5 14L18.5 16.5L16 15L13.5 16.5L14.5 14L12.5 12.5L15 12.5L16 10Z" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

// Heart/Likes icon with pulse
export function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Heart shape */}
      <path 
        d="M16 28L14.55 26.7C7.4 20.36 3 16.28 3 11.5C3 7.42 6.42 4 10.5 4C12.74 4 14.87 5.01 16 6.69C17.13 5.01 19.26 4 21.5 4C25.58 4 29 7.42 29 11.5C29 16.28 24.6 20.36 17.45 26.7L16 28Z" 
        fill="currentColor"
      />
      {/* Pulse lines */}
      <path d="M8 14H11L13 11L15 17L17 14H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-background" opacity="0.6" />
    </svg>
  )
}

// Plus/Add icon with sparkle
export function AddIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Plus shape */}
      <path d="M16 6V26M6 16H26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx="26" cy="6" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="6" cy="26" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// Globe/language icon
export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Outer circle */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
      {/* Vertical arc */}
      <ellipse cx="16" cy="16" rx="6" ry="12" stroke="currentColor" strokeWidth="1.5" />
      {/* Horizontal lines */}
      <path d="M4 16H28M6 10H26M6 22H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

// Star/rating icon
export function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path 
        d="M16 4L19.5 12L28 13L22 19L23.5 28L16 24L8.5 28L10 19L4 13L12.5 12L16 4Z" 
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Eye icon (for password visibility)
export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Eye outline */}
      <path d="M2 16C2 16 7 6 16 6C25 6 30 16 30 16C30 16 25 26 16 26C7 26 2 16 2 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Iris */}
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
      {/* Pupil */}
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  )
}

// Eye off icon (for password visibility)
export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Eye outline */}
      <path d="M4 8C4 8 8 14 16 14C18 14 19.5 13.5 21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 24C28 24 24 18 16 18C14 18 12.5 18.5 11 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Strike through */}
      <path d="M6 26L26 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
