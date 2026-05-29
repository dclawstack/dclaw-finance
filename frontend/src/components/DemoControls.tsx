"use client";

/* Removable demo feature. To drop it: delete this file and remove the
   <DemoControls /> block (and its import) from src/app/page.tsx. */

import { useEffect, useState } from "react";

type DemoStatus = {
  enabled: boolean;
  seeded: boolean;
  counts: Record<string, number>;
};

type Phase = "loading" | "ready" | "unavailable";

export default function DemoControls() {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/v1/demo/status", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const s: DemoStatus = await res.json();
      setStatus(s);
      setPhase(s.enabled ? "ready" : "unavailable");
    } catch {
      setStatus(null);
      setPhase("unavailable");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function call(method: "POST" | "DELETE", path: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, { method });
      if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
      const s: DemoStatus = await res.json();
      setStatus(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  const seed = () => call("POST", "/api/v1/demo/seed");
  const reset = () => call("DELETE", "/api/v1/demo/reset");

  return (
    <section className="border-y border-[#2d0a4e] bg-[#0d0618] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#c084fc]">
              ✦ Try the demo
            </span>
            <h2
              className="mt-4 text-3xl font-black text-white md:text-4xl"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            >
              Seed a sample finance dataset in one click.
            </h2>
            <p
              className="mt-3 max-w-2xl text-white/60"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Spins up demo invoices (including overdue ones), categorised
              expenses across every category, and monthly budgets — all prefixed{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#c084fc]">
                DEMO-
              </code>{" "}
              so Clear removes only what was seeded.
            </p>

            {phase === "ready" && status?.seeded && (
              <p className="mt-4 text-sm text-white/70">
                <strong className="text-white">Seeded:</strong>{" "}
                {Object.entries(status.counts)
                  .map(([k, v]) => `${v} ${k}`)
                  .join(" · ")}
              </p>
            )}

            {phase === "unavailable" && (
              <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white/60">
                Demo mode is off for this deploy (the API returns{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">
                  enabled:false
                </code>{" "}
                when{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">
                  ENABLE_DEMO_MODE
                </code>{" "}
                is not set, or the backend is not reachable from this build).
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            {phase === "loading" && (
              <div className="text-xs text-white/40">Checking demo backend…</div>
            )}

            {phase === "ready" && !status?.seeded && (
              <button
                type="button"
                onClick={seed}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7030A0] px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {busy ? "Seeding…" : "Seed demo data"}
              </button>
            )}

            {phase === "ready" && status?.seeded && (
              <>
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7030A0] px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Open the dashboard →
                </a>
                <button
                  type="button"
                  onClick={seed}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {busy ? "Re-seeding…" : "Re-seed"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/40 px-6 py-3 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Clear demo data
                </button>
              </>
            )}

            {phase === "unavailable" && (
              <a
                href="https://github.com/dclawstack/dclaw-finance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7030A0] px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                ⭐ Clone the repo
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
