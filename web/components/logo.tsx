import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  /** Use the detailed logo with letters and music notes (auto-enabled for lg/xl) */
  detailed?: boolean
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
}

export function Logo({ className, size = "md", detailed }: LogoProps) {
  const dimensions = sizeMap[size]
  
  // Use detailed logo for larger sizes by default, or when explicitly requested
  const useDetailed = detailed ?? (size === "lg" || size === "xl")
  const logoSrc = useDetailed ? "/images/logo-detailed.webp" : "/images/logo.png"
  
  return (
    <Image
      src={logoSrc}
      alt="LyricLingo Logo"
      width={dimensions.width}
      height={dimensions.height}
      className={cn("object-contain", className)}
      priority
    />
  )
}
