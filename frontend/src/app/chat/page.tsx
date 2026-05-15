"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendChatMessage, getChatHistory, type ChatMessage } from "@/lib/api";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getChatHistory()
      .then(setMessages)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res = await sendChatMessage(userMsg.content);
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "What did I spend on software last quarter?",
    "What's my total revenue this year?",
    "Show me my top expenses this month",
    "What's my current net profit?",
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Ask AI</h1>
      <p className="text-sm text-slate-500">
        Ask questions about your finances — the AI has access to your real transaction data.
      </p>

      <Card className="flex flex-col" style={{ height: "60vh" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Financial Q&A</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading && <div className="text-slate-400 text-sm">Loading history…</div>}
            {!loading && messages.length === 0 && (
              <div className="text-slate-400 text-sm">
                No messages yet. Try one of the suggestions below.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2 text-sm lg:max-w-md ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 0 && !loading && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Ask about your finances…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={sending || !input.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
