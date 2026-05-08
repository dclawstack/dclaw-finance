import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ children, defaultValue, className }: { children: React.ReactNode; defaultValue?: string; className?: string }) => {
  const [active, setActive] = React.useState(defaultValue)
  return (
    <div className={className} data-active={active} data-set-active={setActive}>
      {children}
    </div>
  )
}

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500", className)} {...props} />
))
TabsList.displayName = "TabsList"

const TabsTrigger = ({ value, className, ...props }: { value: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm", className)} {...props} />
}

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-2 ring-offset-white focus-visible:outline-none", className)} {...props} />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
