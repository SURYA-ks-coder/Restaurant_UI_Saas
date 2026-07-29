"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Modal } from "antd";
import { ArrowUpRight, Send, Sparkles } from "lucide-react";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { API, postAction } from "@/lib/API";

const SUGGESTIONS = [
  "How were sales today?",
  "What's low on stock right now?",
  "Who are my top performers this month?",
];

export default function AiChatModal({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Modal mounts its content fresh each open — focus once the entrance animation settles.
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = useCallback(
    async (text) => {
      const trimmed = (text ?? input).trim();
      if (!trimmed || sending) return;

      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      setSending(true);

      try {
        const res = await postAction(API.AI_CHAT, {
          message: trimmed,
          conversationId: conversationId || undefined,
        });
        if (res?.statusCode === 200) {
          setConversationId(res.data.conversationId);
          setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
        } else {
          message.error(res?.message || "The assistant couldn't reply — try again.");
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Sorry, something went wrong on my end." },
          ]);
        }
      } catch {
        message.error("The assistant couldn't reply — try again.");
      } finally {
        setSending(false);
      }
    },
    [input, sending, conversationId],
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={440}
      destroyOnHidden
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
      }
      styles={{
        content: { padding: 0 },
        header: { padding: "16px 20px", marginBottom: 0 },
        body: { padding: 0 },
      }}
    >
      <div className="flex h-[420px] flex-col border-t border-border">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="max-w-xs text-xs text-muted-foreground">
                Ask about sales, stock or staff — grounded in your live data.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-1.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <Link
          href="/dashboard/ai-assistant"
          onClick={onClose}
          className="flex items-center justify-center gap-1 border-t border-border py-2 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          Open full assistant &amp; insights
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </Modal>
  );
}
