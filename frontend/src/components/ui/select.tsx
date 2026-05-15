"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

interface CtxType {
  val: string
  open: boolean
  toggle: () => void
  pick: (value: string, label: string) => void
  labelOf: (value: string) => string
  register: (value: string, label: string) => void
}

const Ctx = React.createContext<CtxType>({
  val: "", open: false,
  toggle: () => {}, pick: () => {}, labelOf: () => "", register: () => {},
})

interface SelectProps {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  required?: boolean
}

const Select = ({ children, value, defaultValue, onValueChange }: SelectProps) => {
  const [internal, setInternal] = React.useState(defaultValue ?? "")
  const [open, setOpen] = React.useState(false)
  const labels = React.useRef<Map<string, string>>(new Map())
  const ref = React.useRef<HTMLDivElement>(null)

  const controlled = value !== undefined
  const current = controlled ? value : internal

  const pick = (v: string, lbl: string) => {
    if (!controlled) setInternal(v)
    labels.current.set(v, lbl)
    onValueChange?.(v)
    setOpen(false)
  }

  const register = (v: string, lbl: string) => {
    labels.current.set(v, lbl)
  }

  const labelOf = (v: string) =>
    labels.current.get(v) || (v ? v.charAt(0).toUpperCase() + v.slice(1) : "")

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <Ctx.Provider value={{ val: current, open, toggle: () => setOpen(o => !o), pick, labelOf, register }}>
      <div ref={ref} className="relative">{children}</div>
    </Ctx.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, toggle } = React.useContext(Ctx)
    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-[#ededed] bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#7030A0] focus:border-[#7030A0] transition-colors",
          className
        )}
        {...props}
      >
        {children}
        <svg
          className={cn("ml-2 h-4 w-4 shrink-0 text-[#777] transition-transform duration-200", open && "rotate-180")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { val, labelOf } = React.useContext(Ctx)
  return (
    <span className={cn("text-sm truncate", !val && "text-[#999]")}>
      {val ? labelOf(val) : placeholder}
    </span>
  )
}
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(Ctx)
    if (!open) return null
    return (
      <div
        ref={ref}
        className={cn("absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-[#ededed] bg-white py-1", className)}
        style={{ boxShadow: "0px 4px 16px rgba(0,0,0,0.12)" }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const { val, pick, register } = React.useContext(Ctx)
  const isSelected = val === value
  const label = typeof children === "string" ? children : value

  // Register label mapping on mount
  React.useLayoutEffect(() => { register(value, label) }, [value, label])

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      onClick={() => pick(value, label)}
      className={cn(
        "cursor-pointer px-3 py-2 text-sm transition-colors",
        "hover:bg-[#f7f7f7] hover:text-[#7030A0]",
        isSelected && "bg-purple-50 text-[#7030A0] font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
