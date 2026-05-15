import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian Rupees with auto-scaling:
 *   >= ₹1,00,00,000 (1 Cr)  → "₹X.XX Cr"
 *   >= ₹10,00,000   (10 L)  → "₹X.X L"
 *   >= ₹1,00,000    (1 L)   → "₹X.XX L"
 *   < ₹1,00,000             → "₹X,XXX"  (Indian grouping)
 */
export function formatINR(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? "-" : ""

  if (abs >= 1_00_00_000) {
    // 1 crore and above → show in crores
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`
  }
  if (abs >= 10_00_000) {
    // 10 lakhs and above → show in lakhs with 1 decimal
    return `${sign}₹${(abs / 1_00_000).toFixed(1)} L`
  }
  if (abs >= 1_00_000) {
    // 1–9 lakhs → show in lakhs with 2 decimals
    return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`
  }
  // Below 1 lakh → Indian number formatting
  return `${sign}₹${abs.toLocaleString("en-IN")}`
}

/** Y-axis tick formatter for Recharts charts (compact INR) */
export function inrAxisTick(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`
  if (abs >= 1_00_000)    return `₹${(v / 1_00_000).toFixed(0)}L`
  if (abs >= 1_000)       return `₹${(v / 1_000).toFixed(0)}K`
  return `₹${v}`
}
