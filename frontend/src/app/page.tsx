"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DemoControls from "@/components/DemoControls";

/* ─── Data ─────────────────────────────────────────────────────────── */

const aiFeatures = [
  {
    n: "01", icon: "🏷️", title: "Expense Auto-Categorisation",
    desc: "Type a vendor name — Claude Haiku-4-5 classifies it into one of 6 categories with a confidence score in under 600 ms. No manual tagging, ever.",
    tag: "claude-haiku-4-5", trigger: "600 ms debounce",
  },
  {
    n: "02", icon: "📸", title: "Receipt OCR",
    desc: "Drag-and-drop a receipt image. Vision AI extracts vendor, amount, date and description, then pre-fills the entire expense form instantly.",
    tag: "claude-haiku-4-5 · vision", trigger: "File upload",
  },
  {
    n: "03", icon: "✉️", title: "Payment Reminder Drafts",
    desc: "One click on any overdue invoice opens an AI-written, editable payment reminder email — ready to copy or send.",
    tag: "claude-sonnet-4-6", trigger: "Button click",
  },
  {
    n: "04", icon: "💡", title: "Invoice Line-Item Suggestions",
    desc: "Type your first line item — the AI studies your client history and suggests 3 additional items as clickable chips.",
    tag: "claude-haiku-4-5", trigger: "First item typed",
  },
  {
    n: "05", icon: "🔍", title: "Anomaly Detection",
    desc: "Statistical z-score outlier detection across every expense category. Each flagged item gets a one-sentence AI explanation you actually understand.",
    tag: "claude-haiku-4-5 · batched", trigger: "Tab load · cached 1 h",
  },
  {
    n: "06", icon: "📊", title: "Monthly Financial Report",
    desc: "Pick a month, click Generate. Claude Sonnet-4-6 returns a plain-English executive summary: revenue, top cost drivers, profit trend, 3 actions.",
    tag: "claude-sonnet-4-6", trigger: "On demand",
  },
  {
    n: "07", icon: "⚠️", title: "Budget Breach Guardrails",
    desc: "Set category budgets. When spend hits 80 %, an AI card surfaces one specific cost-cutting action — not generic advice.",
    tag: "claude-haiku-4-5", trigger: "≥ 80 % utilisation",
  },
  {
    n: "08", icon: "🏆", title: "Client Profitability Scoring",
    desc: "Every client scored by revenue (70 %) and outstanding balance (30 %). Expand any row for an AI insight sentence on that relationship.",
    tag: "claude-haiku-4-5 · cached 24 h", trigger: "Page load",
  },
  {
    n: "09", icon: "💬", title: "Natural Language Q&A",
    desc: "Ask your finances anything in plain English. The agent uses real DB tools — get_expense_summary, get_revenue_summary — and answers with live data.",
    tag: "claude-sonnet-4-6 · tool-use", trigger: "Chat send",
  },
  {
    n: "10", icon: "📈", title: "Cash Flow Forecast",
    desc: "3-month forward projection via 6-month trailing exponential smoothing (α = 0.3). Revenue, expenses, profit — with a shaded confidence band.",
    tag: "Statistical · no LLM", trigger: "Real-time",
  },
  {
    n: "11", icon: "📉", title: "Spend Trend Chart",
    desc: "12-month Revenue vs Expenses line chart backed by real DB aggregation. Watch your trajectory at a glance every time you open the dashboard.",
    tag: "Statistical · no LLM", trigger: "Real-time",
  },
];

const stack = [
  "Next.js 14", "FastAPI", "PostgreSQL 16", "SQLAlchemy 2.0",
  "Claude Haiku-4-5", "Claude Sonnet-4-6", "OpenRouter", "Anthropic SDK",
  "Tailwind CSS", "Recharts", "Alembic", "Docker", "Helm / Kubernetes",
  "Pydantic v2", "pytest-asyncio", "shadcn/ui",
];

const footerLinks = {
  "App": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Invoices", href: "/invoices" },
    { label: "Expenses", href: "/expenses" },
    { label: "Forecast", href: "/forecast" },
    { label: "Reports", href: "/reports" },
    { label: "Budgets", href: "/budgets" },
    { label: "Clients", href: "/clients" },
    { label: "Ask AI", href: "/chat" },
  ],
  "Features": [
    { label: "Expense Categorisation", href: "/expenses/new" },
    { label: "Receipt OCR", href: "/expenses/new" },
    { label: "Anomaly Detection", href: "/expenses" },
    { label: "AI Reports", href: "/reports" },
    { label: "Cash Flow Forecast", href: "/forecast" },
    { label: "Budget Guardrails", href: "/budgets" },
    { label: "Client Scoring", href: "/clients" },
    { label: "NL Chat", href: "/chat" },
  ],
  "GitHub": [
    { label: "Repository", href: "https://github.com/dclawstack/dclaw-finance" },
    { label: "Frontend", href: "https://github.com/dclawstack/dclaw-finance/tree/main/frontend" },
    { label: "Backend", href: "https://github.com/dclawstack/dclaw-finance/tree/main/backend" },
    { label: "Helm Chart", href: "https://github.com/dclawstack/dclaw-finance/tree/main/helm" },
    { label: "Issues", href: "https://github.com/dclawstack/dclaw-finance/issues" },
    { label: "Pull Requests", href: "https://github.com/dclawstack/dclaw-finance/pulls" },
    { label: "Releases", href: "https://github.com/dclawstack/dclaw-finance/releases" },
    { label: "PLAN v1.3", href: "https://github.com/dclawstack/dclaw-finance/blob/main/PLAN-v1.3.md" },
  ],
  "Docs": [
    { label: "README", href: "https://github.com/dclawstack/dclaw-finance/blob/main/README.md" },
    { label: "Product Spec", href: "https://github.com/dclawstack/dclaw-finance/blob/main/PRODUCT-SPEC.md" },
    { label: "Run Locally", href: "https://github.com/dclawstack/dclaw-finance/blob/main/RUN.md" },
    { label: "Deployment", href: "https://github.com/dclawstack/dclaw-finance/blob/main/DEPLOY.md" },
    { label: "Changelog", href: "https://github.com/dclawstack/dclaw-finance/blob/main/CHANGES-v1.2.md" },
    { label: "Roadmap (v1.3)", href: "https://github.com/dclawstack/dclaw-finance/blob/main/PLAN-v1.3.md" },
    { label: "Roadmap (v1.4)", href: "https://github.com/dclawstack/dclaw-finance/blob/main/PLAN-v1.4.md" },
    { label: "Demo Data", href: "https://github.com/dclawstack/dclaw-finance/blob/main/DEMO-DATA.md" },
  ],
};

const rotatingWords = [
  "Indian SaaS founders.",
  "finance teams.",
  "solo CFOs.",
  "bootstrapped startups.",
];

/* ─── Hooks ─────────────────────────────────────────────────────────── */

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FeatureCard({ f, idx }: { f: typeof aiFeatures[0]; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(50px)",
        transition: `opacity 0.6s ease ${(idx % 3) * 120}ms, transform 0.6s ease ${(idx % 3) * 120}ms`,
      }}
      className="group relative bg-white border border-[#ece6f5] rounded-2xl p-7 hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f3e8ff] to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <span className="text-3xl">{f.icon}</span>
          <span className="text-xs font-mono text-[#9d6dc7] bg-[#f3e8ff] px-2 py-1 rounded-full">{f.n}</span>
        </div>
        <h3 className="text-lg font-bold text-[#1a0a2e] mb-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
          {f.title}
        </h3>
        <p className="text-sm text-[#666] leading-relaxed mb-4">{f.desc}</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] bg-[#1a0a2e] text-white px-2.5 py-1 rounded-full font-mono">{f.tag}</span>
          <span className="text-[10px] border border-[#e2d4f0] text-[#7030A0] px-2.5 py-1 rounded-full font-mono">{f.trigger}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % rotatingWords.length);
        setWordVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(cycle);
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #c084fc, #7030A0, #e879f9, #7030A0, #c084fc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .float-card { animation: float 5s ease-in-out infinite; }
        .marquee-track { animation: marquee 30s linear infinite; }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(160,100,220,0.25) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <div className="bg-white text-[#1a0a2e] overflow-x-hidden">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative min-h-screen bg-[#0d0618] dot-grid flex flex-col justify-center overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#7030A0] opacity-20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#c084fc] opacity-15 rounded-full blur-[120px]" />

          <div className="relative mx-auto max-w-7xl px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c084fc] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c084fc]" />
                </span>
                <span className="text-xs text-white/70 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  v1.2 · 11 AI features · Open source
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
                <span className="text-white">The AI</span>
                <br />
                <span className="shimmer-text">Finance OS</span>
                <br />
                <span className="text-white/60 text-3xl md:text-4xl font-semibold mt-2 block">built for</span>
                <span
                  className="text-white text-3xl md:text-4xl font-semibold"
                  style={{
                    display: "inline-block",
                    opacity: wordVisible ? 1 : 0,
                    transform: wordVisible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                  }}
                >
                  {rotatingWords[wordIdx]}
                </span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Invoicing, expense management, cash flow forecasting and natural language Q&A —
                all AI-native, all INR-first, all open source.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-900"
                  style={{ background: "#7030A0", fontFamily: "'Poppins', sans-serif" }}
                >
                  Open App →
                </Link>
                <a
                  href="https://github.com/dclawstack/dclaw-finance"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  ⭐ GitHub
                </a>
              </div>

              <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/10">
                {[["11", "AI Features"], ["9", "Screens"], ["₹ INR", "Native"], ["100%", "Open Source"]].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-black text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>{val}</div>
                    <div className="text-xs text-white/40 mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating mock */}
            <div className="float-card hidden lg:block">
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: "'Raleway', sans-serif" }}>Dashboard · May 2026</span>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <span className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Revenue", val: "₹2.4 Cr", delta: "+18%", up: true },
                    { label: "Outstanding", val: "₹34.2 L", delta: "-5%", up: false },
                    { label: "Expenses", val: "₹1.1 Cr", delta: "+3%", up: false },
                    { label: "Net Profit", val: "₹1.3 Cr", delta: "+28%", up: true },
                  ].map(k => (
                    <div key={k.label} className="bg-white/8 rounded-xl p-3 border border-white/10">
                      <div className="text-white/40 text-[10px] mb-1">{k.label}</div>
                      <div className="text-white font-bold text-base" style={{ fontFamily: "'Raleway', sans-serif" }}>{k.val}</div>
                      <div className={`text-[10px] mt-0.5 ${k.up ? "text-green-400" : "text-red-400"}`}>{k.delta}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="text-white/40 text-[10px] mb-3">Revenue vs Expenses · 12 months</div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 55, 45, 70, 65, 80, 60, 75, 85, 72, 90, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                        <div className="w-full bg-[#7030A0] rounded-sm" style={{ height: `${h * 0.6}%` }} />
                        <div className="w-full bg-[#c084fc] rounded-sm opacity-50" style={{ height: `${h * 0.4}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 bg-[#7030A0]/30 border border-[#7030A0]/40 rounded-full px-3 py-1.5">
                  <span className="text-[10px] text-[#c084fc]">✦ AI Insight</span>
                  <span className="text-[10px] text-white/70">Travel spend is 2.3× above median — review Q2 trips</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 20C480 40 240 10 0 30L0 60Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* DEMO CONTROLS — remove this block + the import to drop the demo feature */}
        <DemoControls />
        {/* END DEMO CONTROLS */}

        {/* ── MARQUEE ─────────────────────────────────────────────────── */}
        <section className="py-6 border-y border-[#f0e8fa] bg-[#faf6ff] overflow-hidden">
          <div className="flex whitespace-nowrap">
            <div className="marquee-track flex gap-10 pr-10">
              {[...aiFeatures, ...aiFeatures].map((f, i) => (
                <span key={i} className="flex items-center gap-2 text-sm font-semibold text-[#7030A0]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <span>{f.icon}</span>
                  <span>{f.title}</span>
                  <span className="text-[#c084fc] mx-2">·</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI FEATURES ─────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-white relative overflow-hidden">
          <div
            className="absolute top-8 right-0 text-[20rem] font-black text-[#f3e8ff] select-none leading-none pointer-events-none"
            style={{ fontFamily: "'Raleway', sans-serif" }}
          >
            11
          </div>
          <div className="relative mx-auto max-w-7xl">
            <FadeUp className="text-center mb-20">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#7030A0] bg-[#f3e8ff] px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                AI Features
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Every feature is<br />
                <span className="shimmer-text">AI-native.</span>
              </h2>
              <p className="text-[#666] text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Not bolted on. Not a chatbot wrapper. Claude Haiku-4-5 and Sonnet-4-6 are woven into
                every workflow — categorisation, OCR, drafting, anomaly detection, forecasting, Q&A.
              </p>
            </FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((f, i) => <FeatureCard key={f.n} f={f} idx={i} />)}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-[#0d0618] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7030A0] opacity-15 blur-[100px] rounded-full" />
          <div className="relative mx-auto max-w-5xl text-center">
            <FadeUp>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#c084fc] bg-white/10 px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                How It Works
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-20 text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Zero friction.<br /><span className="shimmer-text">Infinite insight.</span>
              </h2>
            </FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#7030A0] via-[#c084fc] to-[#7030A0]" />
              {[
                { step: "01", title: "Connect your data", body: "Add invoices and expenses — or drag a receipt image. The AI auto-fills everything.", icon: "📥" },
                { step: "02", title: "AI does the work", body: "Categorisation, anomaly detection, client scoring and cash-flow forecasting run automatically.", icon: "⚡" },
                { step: "03", title: "Ask anything", body: "Open the chat and ask in plain English. The agent queries your real data and answers instantly.", icon: "💬" },
              ].map((s, i) => (
                <FadeUp key={s.step} delay={i * 150}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#7030A0]/30 border border-[#7030A0]/50 flex items-center justify-center text-xl mb-6 mx-auto">{s.icon}</div>
                    <div className="text-[#c084fc] text-xs font-mono mb-3">{s.step}</div>
                    <h3 className="text-white font-bold text-lg mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>{s.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.body}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9 SCREENS ───────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-white">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="text-center mb-20">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#7030A0] bg-[#f3e8ff] px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                9 Screens
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                A complete <span className="shimmer-text">finance OS.</span>
              </h2>
              <p className="text-[#666] text-lg max-w-xl mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Every screen your finance team needs — invoicing to forecasting, budgets to NL chat.
              </p>
            </FadeUp>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { href: "/dashboard", icon: "🏠", title: "Dashboard", desc: "KPI cards, 12-month trend chart, overdue invoices — your full financial picture at a glance." },
                { href: "/invoices", icon: "🧾", title: "Invoices", desc: "Create, track and search invoices. AI suggests line items and drafts payment reminders automatically." },
                { href: "/expenses", icon: "💳", title: "Expenses", desc: "Receipt OCR, AI categorisation, and a dedicated Anomalies tab for statistical outlier detection." },
                { href: "/forecast", icon: "🔮", title: "Forecast", desc: "3-month cash flow projection with exponential smoothing and a shaded confidence band." },
                { href: "/reports", icon: "📄", title: "Reports", desc: "One-click AI executive summary: revenue, cost drivers, profit trend, and 3 actionable recommendations." },
                { href: "/budgets", icon: "🎯", title: "Budgets", desc: "Set category limits. Get AI suggestions the moment spend hits 80 % — not after it's too late." },
                { href: "/clients", icon: "🤝", title: "Clients", desc: "Ranked profitability table. Expand any row for an AI insight on that client relationship." },
                { href: "/chat", icon: "🤖", title: "Ask AI", desc: "Natural language Q&A over your real DB. Ask about expenses, revenue, or trends in plain English." },
                { href: "/expenses/new", icon: "✨", title: "New Expense", desc: "Drag a receipt → AI fills every field. Type a vendor → category is suggested before you finish typing." },
              ].map((s, i) => (
                <FadeUp key={s.href} delay={(i % 3) * 100}>
                  <Link href={s.href} className="group block bg-[#faf6ff] border border-[#ece6f5] rounded-2xl p-6 hover:bg-[#f3e8ff] hover:border-[#c084fc] hover:shadow-md transition-all duration-200">
                    <span className="text-2xl mb-4 block">{s.icon}</span>
                    <h3 className="font-bold text-[#1a0a2e] mb-2 group-hover:text-[#7030A0] transition-colors" style={{ fontFamily: "'Raleway', sans-serif" }}>{s.title}</h3>
                    <p className="text-sm text-[#666] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.desc}</p>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── INDIA FIRST ─────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-gradient-to-br from-[#1a0a2e] via-[#2d0a4e] to-[#1a0a2e] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="relative mx-auto max-w-5xl text-center">
            <FadeUp>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#c084fc] bg-white/10 px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                India-First
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-6 mb-6 text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Built for INR.<br />
                <span className="shimmer-text">Ready for GST.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto mb-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Every rupee displayed in crores and lakhs. GSTR-1 generation, GSTR-2B reconciliation
                and IRN e-invoice support are coming in v1.3 — built for the real compliance burden
                Indian founders face every month.
              </p>
            </FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "₹", title: "INR Native", body: "All amounts in ₹ Cr / ₹ L. Smart formatting: ₹2.4 Cr, ₹34.2 L — no manual conversion." },
                { icon: "📋", title: "GSTR-1 Export", body: "v1.3: Auto-generate GSTR-1 JSON ready to upload to the GST portal. Zero manual work." },
                { icon: "🔗", title: "GSTR-2B Reconcile", body: "v1.3: Upload GSTR-2B and AI flags every ITC mismatch with a plain-English explanation." },
              ].map((c, i) => (
                <FadeUp key={c.title} delay={i * 150}>
                  <div className="bg-white/8 border border-white/15 rounded-2xl p-8 text-left hover:bg-white/12 transition-colors">
                    <div className="text-3xl font-black text-[#c084fc] mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>{c.icon}</div>
                    <h3 className="text-white font-bold text-lg mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>{c.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.body}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK ──────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-white">
          <div className="mx-auto max-w-5xl text-center">
            <FadeUp>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#7030A0] bg-[#f3e8ff] px-4 py-2 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Tech Stack
              </span>
              <h2 className="text-5xl font-black mt-6 mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Modern. <span className="shimmer-text">Production-grade.</span>
              </h2>
              <p className="text-[#666] text-lg mb-14" style={{ fontFamily: "'Poppins', sans-serif" }}>
                FastAPI + Next.js 14 + PostgreSQL 16 — async all the way down, repository pattern, Alembic migrations, Docker + Helm.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {stack.map(s => (
                  <span key={s} className="px-4 py-2 bg-[#faf6ff] border border-[#ece6f5] text-[#1a0a2e] rounded-full text-sm font-semibold hover:bg-[#f3e8ff] hover:border-[#c084fc] transition-colors cursor-default" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {s}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── OPEN SOURCE CTA ─────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-[#0d0618] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#7030A0] opacity-20 blur-[120px] rounded-full" />
          <FadeUp className="relative mx-auto max-w-3xl text-center">
            <div className="text-6xl mb-8">⭐</div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6" style={{ fontFamily: "'Raleway', sans-serif" }}>
              100% <span className="shimmer-text">Open Source.</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Fork it, extend it, self-host it. Full FastAPI backend, Next.js frontend, Helm chart —
              every line is on GitHub. PRs welcome.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://github.com/dclawstack/dclaw-finance"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm transition-all hover:scale-105"
                style={{ background: "#7030A0", fontFamily: "'Poppins', sans-serif" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
              <a
                href="https://github.com/dclawstack/dclaw-finance/blob/main/PLAN-v1.3.md"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Read the v1.3 Roadmap →
              </a>
            </div>
          </FadeUp>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <footer className="bg-[#080410] border-t border-white/10 px-6 pt-20 pb-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between gap-10 mb-16">
              <div className="max-w-xs">
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-2xl font-black text-[#7030A0]" style={{ fontFamily: "'Raleway', sans-serif" }}>DClaw</span>
                  <span className="text-2xl font-semibold text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>&nbsp;Finance</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  The AI finance OS for Indian SaaS companies. Invoicing, expenses, forecasting
                  and natural language Q&A — all open source.
                </p>
                <a href="https://github.com/dclawstack/dclaw-finance" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/8 border border-white/15 inline-flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Object.entries(footerLinks).map(([col, links]) => (
                  <div key={col}>
                    <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{col}</h4>
                    <ul className="space-y-2.5">
                      {links.map(l => (
                        <li key={l.label}>
                          {l.href.startsWith("http") ? (
                            <a href={l.href} target="_blank" rel="noopener noreferrer"
                              className="text-white/40 hover:text-white/80 text-sm transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {l.label}
                            </a>
                          ) : (
                            <Link href={l.href}
                              className="text-white/40 hover:text-white/80 text-sm transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {l.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/30 text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
                © 2026 DClaw Finance · Built on the DClaw Stack · MIT License
              </p>
              <div className="flex gap-6">
                {[
                  { label: "v1.3 Roadmap", href: "https://github.com/dclawstack/dclaw-finance/blob/main/PLAN-v1.3.md" },
                  { label: "Product Spec", href: "https://github.com/dclawstack/dclaw-finance/blob/main/PRODUCT-SPEC.md" },
                  { label: "Issues", href: "https://github.com/dclawstack/dclaw-finance/issues" },
                ].map(l => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                    className="text-white/30 hover:text-white/60 text-xs transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
