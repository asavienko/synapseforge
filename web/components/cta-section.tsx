"use client"

import Link from "next/link"
import { ArrowIcon, BlobGraphic, PlayIcon } from "@/components/icons"

const quickLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Browse Languages", href: "/learn" },
  { label: "View Pricing", href: "/pricing" },
  { label: "Read FAQ", href: "/faq" },
]

export function CTASection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <BlobGraphic className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] text-lavender opacity-20" />
      
      {/* Accent glows */}
      <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-coral/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-lavender/10 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
        {/* Glass card container */}
        <div className="relative max-w-3xl mx-auto rounded-3xl overflow-hidden">
          {/* Glass layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/50 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-lavender/5" />
          <div className="absolute inset-[1px] rounded-3xl border border-background/80" />
          <div className="absolute inset-0 rounded-3xl border border-foreground/[0.06]" />
          
          <div className="relative z-10 py-16 px-8 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-foreground">
              Ready to learn through music?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
              Generate your first song free. No account required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Primary button */}
              <Link href="/get-started" className="relative h-12 px-8 rounded-full overflow-hidden font-semibold transition-all group flex items-center">
                <div className="absolute inset-0 bg-foreground group-hover:bg-foreground/90 transition-colors" />
                <div className="absolute inset-[1px] rounded-full border border-background/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-coral/20 to-lavender/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center text-background">
                  Start Learning Free
                  <ArrowIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              
              {/* Secondary button */}
              <Link href="/library" className="relative h-12 px-8 rounded-full overflow-hidden font-semibold transition-all group flex items-center">
                <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
                <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
                <span className="relative z-10 flex items-center text-foreground">
                  <PlayIcon className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Browse Songs
                </span>
              </Link>
            </div>
            
            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-foreground/[0.06]">
              <p className="text-xs text-muted-foreground mb-3">Learn more about LyricLingo</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                {quickLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
