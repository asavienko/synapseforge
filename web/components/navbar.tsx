"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MenuIcon, CloseIcon } from "@/components/icons"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/learn", label: "Languages" },
    { href: "/library", label: "Library" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 mt-4">
        <nav 
          className="mx-auto max-w-fit bg-background/40 backdrop-blur-2xl border border-foreground/10 rounded-full px-6 sm:px-8 py-2.5 shadow-2xl shadow-foreground/5 hover:shadow-2xl hover:shadow-foreground/10 transition-all duration-300"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-center gap-1 sm:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-2 sm:mr-4">
              <Logo size="sm" className="h-7 w-7 sm:h-8 sm:w-8" />
              <span className="hidden sm:inline text-sm font-semibold text-foreground tracking-tight">
                LyricLingo
              </span>
            </Link>

            {/* Divider */}
            <div className="hidden sm:block w-px h-4 bg-border/30" />

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5 rounded-full"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-4 bg-border/30" />

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full px-3 h-8"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/get-started">
                <Button 
                  size="sm" 
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-4 h-8 text-xs font-medium transition-all"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-1.5 text-foreground hover:bg-foreground/10 rounded-full transition-colors focus-glass"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div 
              id="mobile-menu" 
              className="md:hidden mt-3 pt-3 border-t border-foreground/10 animate-slide-down" 
              role="menu"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors active:bg-foreground/10"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-2 border-t border-foreground/10">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg justify-start"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/get-started" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      size="sm" 
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-lg w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
