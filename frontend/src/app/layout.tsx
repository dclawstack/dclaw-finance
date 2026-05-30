import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import FloatingCopilot from "@/components/FloatingCopilot";

export const metadata: Metadata = {
  title: "DClaw Finance",
  description: "DClaw vertical SaaS application",
};

const navLinks = [
  { href: "/dashboard",  label: "Dashboard" },
  { href: "/invoices",   label: "Invoices" },
  { href: "/expenses",   label: "Expenses" },
  { href: "/cash-flow",  label: "Cash Flow" },
  { href: "/forecast",   label: "Forecast" },
  { href: "/reports",    label: "Reports" },
  { href: "/budgets",    label: "Budgets" },
  { href: "/clients",    label: "Clients" },
  { href: "/testsprite", label: "TestSprite" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f7f7] text-[#444444]">

        {/* ── Navbar ── */}
        <nav
          className="bg-white border-b border-[#ededed]"
          style={{ boxShadow: "0 2px 15px rgba(0,0,0,0.06)" }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-1 py-4">
              <span
                className="text-xl font-extrabold tracking-tight"
                style={{ fontFamily: "'Raleway', sans-serif", color: "#7030A0" }}
              >
                DClaw
              </span>
              <span
                className="text-xl font-semibold text-[#444444]"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                &nbsp;Finance
              </span>
            </Link>

            {/* Nav links */}
            <div
              className="hidden md:flex items-center"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-5 text-sm font-medium text-[#545454] border-b-2 border-transparent hover:text-[#7030A0] hover:border-[#7030A0] transition-all duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Ask AI CTA button */}
            <Link
              href="/chat"
              className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:opacity-90"
              style={{
                fontFamily: "'Poppins', sans-serif",
                background: "#7030A0",
              }}
            >
              Ask AI
            </Link>

          </div>
        </nav>

        {/* ── Page content ── */}
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

        {/* ── Floating AI Copilot — accessible from every page ── */}
        <FloatingCopilot />

      </body>
    </html>
  );
}
