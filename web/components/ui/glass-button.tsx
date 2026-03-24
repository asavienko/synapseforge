"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent"
  size?: "sm" | "md" | "lg"
  accentColor?: "coral" | "lavender" | "sage"
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", size = "md", accentColor = "coral", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-9 px-4 text-xs rounded-lg",
      md: "h-11 px-6 text-sm rounded-xl",
      lg: "h-14 px-8 text-base rounded-2xl",
    }

    const accentBgClasses = {
      coral: "bg-coral group-hover:bg-coral/90",
      lavender: "bg-lavender group-hover:bg-lavender/90",
      sage: "bg-sage group-hover:bg-sage/90",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative font-semibold overflow-hidden transition-all group disabled:opacity-50 disabled:pointer-events-none",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {variant === "primary" && (
          <>
            <div className="absolute inset-0 bg-foreground group-hover:bg-foreground/90 transition-colors" />
            <div className="absolute inset-[1px] rounded-[inherit] border border-background/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-coral/20 to-lavender/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
        
        {variant === "secondary" && (
          <>
            <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
            <div className="absolute inset-[1px] rounded-[inherit] border border-foreground/[0.08]" />
          </>
        )}
        
        {variant === "ghost" && (
          <>
            <div className="absolute inset-0 bg-transparent group-hover:bg-foreground/5 transition-colors" />
          </>
        )}
        
        {variant === "accent" && (
          <>
            <div className={cn("absolute inset-0 transition-colors", accentBgClasses[accentColor])} />
            <div className="absolute inset-[1px] rounded-[inherit] border border-background/10" />
          </>
        )}
        
        <span className={cn(
          "relative z-10 flex items-center justify-center gap-2",
          variant === "primary" && "text-background",
          variant === "secondary" && "text-foreground",
          variant === "ghost" && "text-foreground",
          variant === "accent" && "text-background"
        )}>
          {children}
        </span>
      </button>
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton }
