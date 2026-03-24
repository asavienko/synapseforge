"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle"
  accent?: "none" | "coral" | "lavender" | "sage" | "gradient"
  glow?: boolean
  hover?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", accent = "none", glow = false, hover = false, children, ...props }, ref) => {
    const accentClasses = {
      none: "",
      coral: "from-coral/5 via-transparent to-transparent",
      lavender: "from-lavender/5 via-transparent to-transparent",
      sage: "from-sage/5 via-transparent to-transparent",
      gradient: "from-coral/5 via-transparent to-lavender/5",
    }

    const glowClasses = {
      none: "",
      coral: "bg-coral/15",
      lavender: "bg-lavender/15",
      sage: "bg-sage/15",
      gradient: "bg-lavender/10",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl overflow-hidden",
          hover && "transition-all duration-300 hover:scale-[1.02]",
          className
        )}
        {...props}
      >
        {/* Base glass layer */}
        <div className={cn(
          "absolute inset-0 backdrop-blur-2xl",
          variant === "default" && "bg-gradient-to-b from-background/60 to-background/40",
          variant === "elevated" && "bg-gradient-to-b from-background/70 via-background/50 to-background/60 backdrop-blur-3xl",
          variant === "subtle" && "bg-gradient-to-b from-background/50 to-background/30"
        )} />
        
        {/* Accent gradient overlay */}
        {accent !== "none" && (
          <div className={cn("absolute inset-0 bg-gradient-to-br", accentClasses[accent])} />
        )}
        
        {/* Inner border highlight */}
        <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
        
        {/* Outer border */}
        <div className={cn(
          "absolute inset-0 rounded-2xl border border-foreground/[0.06]",
          hover && "group-hover:border-foreground/10 transition-colors"
        )} />
        
        {/* Glow effect */}
        {glow && (
          <div className={cn(
            "absolute -inset-4 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
            glowClasses[accent] || "bg-foreground/5"
          )} />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
