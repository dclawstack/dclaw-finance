"use client";

import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/api";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

export default function FloatingCopilot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const { reply } = await sendChatMessage(text);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn't reach the AI right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform duration-200 hover:scale-105 focus:outline-none"
        style={{ background: "#7030A0" }}
        aria-label={open ? "Close AI Copilot" : "Open AI Copilot"}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: 360,
            height: 480,
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 shrink-0" style={{ background: "#7030A0" }}>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Finance AI Copilot
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="mt-8 text-center text-xs text-slate-400">
                Ask me about invoices, expenses, budgets, or cash flow.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "text-white" : "bg-slate-100 text-slate-800"
                  }`}
                  style={m.role === "user" ? { background: "#7030A0" } : {}}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="flex gap-2 border-t border-slate-100 px-3 py-2 shrink-0">
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: "#7030A0", fontFamily: "'Poppins', sans-serif" }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
