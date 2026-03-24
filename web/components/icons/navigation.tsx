"use client"

interface IconProps {
  className?: string
}

// Menu icon with staggered lines
export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M6 8H26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 16H26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 24H22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// Close icon with smooth X
export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M8 8L24 24M8 24L24 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// Chevron left with curve
export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M20 6L10 16L20 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Chevron right with curve
export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M12 6L22 16L12 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Illustrated arrow with motion lines
export function ArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Motion lines */}
      <path d="M4 16H8M6 12H10M6 20H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      {/* Main arrow */}
      <path d="M12 16H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 10L26 16L20 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Home/Dashboard icon with musical note accent
export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* House shape */}
      <path d="M4 14L16 4L28 14V26C28 27.1 27.1 28 26 28H6C4.9 28 4 27.1 4 26V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Door */}
      <path d="M12 28V18H20V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Musical note accent */}
      <circle cx="24" cy="8" r="2" fill="currentColor" opacity="0.4" />
      <path d="M24 8V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

// Search icon with music wave
export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Magnifying glass */}
      <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20L27 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sound wave inside */}
      <path d="M11 14V14M14 12V16M17 13V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// Settings icon - gear with sound wave
export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Gear teeth */}
      <path d="M16 4L17.5 7H14.5L16 4Z" fill="currentColor" />
      <path d="M16 28L14.5 25H17.5L16 28Z" fill="currentColor" />
      <path d="M4 16L7 14.5V17.5L4 16Z" fill="currentColor" />
      <path d="M28 16L25 17.5V14.5L28 16Z" fill="currentColor" />
      <path d="M7.5 7.5L10 9L8.5 10.5L7.5 7.5Z" fill="currentColor" />
      <path d="M24.5 24.5L22 23L23.5 21.5L24.5 24.5Z" fill="currentColor" />
      <path d="M7.5 24.5L10 23L8.5 21.5L7.5 24.5Z" fill="currentColor" />
      <path d="M24.5 7.5L22 9L23.5 10.5L24.5 7.5Z" fill="currentColor" />
      {/* Outer circle */}
      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2" />
      {/* Inner circle */}
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

// Logout/Exit icon
export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Door frame */}
      <path d="M12 4H6C4.89543 4 4 4.89543 4 6V26C4 27.1046 4.89543 28 6 28H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arrow */}
      <path d="M12 16H28M28 16L22 10M28 16L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Expand/Fullscreen icon
export function ExpandIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M4 12V4H12M20 4H28V12M28 20V28H20M12 28H4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Collapse/Exit fullscreen icon
export function CollapseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M12 4V12H4M28 12H20V4M20 28V20H28M4 20H12V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
