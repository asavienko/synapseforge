import Link from "next/link"
import { MusicNotesGraphic, WavyLineGraphic, GlobeIcon, HeadphonesIcon } from "@/components/icons"
import { Logo } from "@/components/logo"

const footerLinks = {
  product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ],
  learn: [
    { label: "All Languages", href: "/learn" },
    { label: "Spanish", href: "/learn/spanish" },
    { label: "French", href: "/learn/french" },
    { label: "Japanese", href: "/learn/japanese" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "Song Library", href: "/library" },
    { label: "Topics", href: "/topics" },
    { label: "Genres", href: "/genres" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Legal", href: "/legal" },
  ],
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Glass top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      
      {/* Background glass effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/60 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-lavender/3 via-transparent to-coral/3" />
      
      {/* Decorative elements */}
      <WavyLineGraphic className="absolute top-0 left-0 right-0 h-12 text-foreground/5 rotate-180" />
      <MusicNotesGraphic className="absolute top-8 right-12 w-28 h-20 text-foreground/5 hidden lg:block" />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2 sm:gap-2.5 group">
              <Logo size="lg" className="h-8 w-8 sm:h-10 sm:w-10 transition-transform group-hover:scale-105" />
              <span className="text-lg sm:text-xl font-semibold text-foreground">LyricLingo</span>
            </Link>
            <p className="mt-3 sm:mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Learn languages through AI-generated music. Actually remember what you learn.
            </p>
            
            {/* Mini features - glass pills */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-foreground/5" />
                <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
                <GlobeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-coral relative z-10" />
                <span className="relative z-10">100+ languages</span>
              </div>
              <div className="relative flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-foreground/5" />
                <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
                <HeadphonesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-lavender relative z-10" />
                <span className="relative z-10">50K+ songs</span>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="sm:col-span-2 lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div>
              <h3 className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider mb-3 sm:mb-4">Product</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider mb-3 sm:mb-4">Learn</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.learn.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider mb-3 sm:mb-4">Resources</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-foreground/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground order-2 sm:order-1">
            {new Date().getFullYear()} LyricLingo. All rights reserved.
          </p>
          <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Accepts:</span>
            <div className="flex gap-1.5 sm:gap-2">
              {['BTC', 'ETH', 'SOL'].map((crypto) => (
                <span key={crypto} className="relative font-mono text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-foreground overflow-hidden">
                  <div className="absolute inset-0 bg-foreground/5" />
                  <div className="absolute inset-[1px] rounded-md sm:rounded-lg border border-foreground/[0.08]" />
                  <span className="relative z-10">{crypto}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
