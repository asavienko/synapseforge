"use client"

import * as React from "react"
import { useTheme } from "next-themes"

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4 12H2m20 0h-2m-2.93-7.07l-1.41 1.41m-9.32 9.32l-1.41 1.41m0-12.14l1.41 1.41m9.32 9.32l1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    } else {
      setTheme(theme === "dark" ? "light" : "dark")
    }
  }

  if (!mounted) {
    return (
      <button
        className="relative w-8 h-8 rounded-full overflow-hidden transition-all"
        aria-label="Toggle theme"
      >
        <div className="absolute inset-0 bg-foreground/5" />
        <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className="relative w-8 h-8 rounded-full overflow-hidden transition-all group"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
      <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {isDark ? (
          <SunIcon className="w-4 h-4 text-foreground transition-transform group-hover:rotate-45" />
        ) : (
          <MoonIcon className="w-4 h-4 text-foreground transition-transform group-hover:-rotate-12" />
        )}
      </div>
    </button>
  )
}
