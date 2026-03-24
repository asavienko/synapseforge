"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "search"
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-foreground/[0.08] bg-foreground/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all",
          "focus:outline-none focus:border-foreground/20 focus:bg-foreground/[0.07]",
          variant === "search" && "pl-10",
          className
        )}
        {...props}
      />
    )
  }
)
GlassInput.displayName = "GlassInput"

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none rounded-xl border border-foreground/[0.08] bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all",
          "focus:outline-none focus:border-foreground/20 focus:bg-foreground/[0.07]",
          className
        )}
        {...props}
      />
    )
  }
)
GlassTextarea.displayName = "GlassTextarea"

export { GlassInput, GlassTextarea }
