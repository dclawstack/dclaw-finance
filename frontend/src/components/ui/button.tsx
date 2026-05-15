import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default:     "bg-[#7030A0] text-white hover:bg-[#B180F8] shadow-sm",
      destructive: "bg-[#ed3c0d] text-white hover:bg-[#e6573f] shadow-sm",
      outline:     "border-2 border-[#7030A0] text-[#7030A0] bg-white hover:bg-[#7030A0] hover:text-white",
      secondary:   "bg-[#f7f7f7] text-[#444444] hover:bg-[#ededed]",
      ghost:       "text-[#7030A0] hover:bg-purple-50 hover:text-[#682899]",
      link:        "text-[#7030A0] underline-offset-4 hover:underline hover:text-[#682899]",
    }
    const sizes = {
      default: "h-10 px-6 py-2 text-sm",
      sm:      "h-8 px-4 text-xs",
      lg:      "h-12 px-8 text-base",
      icon:    "h-10 w-10",
    }
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7030A0] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
