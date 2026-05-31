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

            {/* Right-side actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* GitHub repo link */}
              <a
                href="https://github.com/dclawstack/dclaw-finance"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-[#545454] border border-[#ededed] hover:text-[#7030A0] hover:border-[#7030A0] transition-all duration-200"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>

              {/* Ask AI CTA button */}
              <Link
                href="/chat"
                className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:opacity-90"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  background: "#7030A0",
                }}
              >
                Ask AI
              </Link>
            </div>

          </div>
        </nav>

        {/* ── Page content ── */}
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

        {/* ── Floating AI Copilot ── */}
        <FloatingCopilot />

      </body>
    </html>
  );
}
