import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const TabsContext = React.createContext<{
  active: string | undefined
  setActive: (v: string) => void
}>({ active: undefined, setActive: () => {} })

const Tabs = ({ children, defaultValue, value, onValueChange, className }: TabsProps) => {
  const [internal, setInternal] = React.useState(defaultValue)
  const controlled = value !== undefined
  const active = controlled ? value : internal
  const setActive = React.useCallback((v: string) => {
    if (!controlled) setInternal(v)
    onValueChange?.(v)
  }, [controlled, onValueChange])

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500", className)}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

const TabsTrigger = ({ value, className, children, ...props }: { value: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { active, setActive } = React.useContext(TabsContext)
  const isActive = active === value
  return (
    <button
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm",
        className
      )}
      onClick={() => setActive(value)}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const { active } = React.useContext(TabsContext)
  if (active !== value) return null
  return (
    <div
      ref={ref}
      className={cn("mt-2 ring-offset-white focus-visible:outline-none", className)}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
