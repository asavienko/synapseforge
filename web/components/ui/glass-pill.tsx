"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  size?: "sm" | "md"
}

const GlassPill = React.forwardRef<HTMLButtonElement, GlassPillProps>(
  ({ className, active = false, size = "md", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-2.5 py-1 text-xs",
      md: "px-3.5 py-2 text-sm",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative rounded-full font-medium overflow-hidden transition-all",
          sizeClasses[size],
          active ? "text-background" : "text-foreground hover:text-foreground",
          className
        )}
        {...props}
      >
        {active ? (
          <>
            <div className="absolute inset-0 bg-foreground" />
            <div className="absolute inset-[1px] rounded-full border border-background/10" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-foreground/5 hover:bg-foreground/10 transition-colors" />
            <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
          </>
        )}
        
        <span className="relative z-10 flex items-center gap-1.5">
          {children}
        </span>
      </button>
    )
  }
)
GlassPill.displayName = "GlassPill"

export { GlassPill }
