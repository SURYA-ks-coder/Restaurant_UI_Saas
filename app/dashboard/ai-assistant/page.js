"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "antd";
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  Send,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { API, getAction, postAction } from "@/lib/API";
import Heading from "@/components/ui/Heading";

const SUGGESTIONS = [
  "How were sales this week compared to last week?",
  "What's low on stock right now?",
  "Who are my top performing staff this month?",
  "What are my best and worst selling menu items?",
];

function InsightCard({ icon: Icon, tone, title, narrative, generatedAt, loading, onRefresh }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} className="mt-3" />
      ) : (
        <>
          <p className="mt-2 text-sm text-foreground">{narrative}</p>
          {generatedAt && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Updated {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function AiAssistantPage() {
  const [lowStock, setLowStock] = useState(null);
  const [demand, setDemand] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const loadInsights = useCallback(async (force = false) => {
    setInsightsLoading(true);
    try {
      const [lowStockRes, demandRes] = await Promise.all([
        getAction(`${API.GET_AI_LOW_STOCK_FORECAST}${force ? "?force=true" : ""}`),
        getAction(`${API.GET_AI_DEMAND_PATTERN}${force ? "?force=true" : ""}`),
      ]);
      if (lowStockRes?.statusCode === 200) setLowStock(lowStockRes.data);
      if (demandRes?.statusCode === 200) setDemand(demandRes.data);
      if (lowStockRes?.statusCode !== 200 && demandRes?.statusCode !== 200) {
        message.error("Couldn't load AI insights");
      }
    } catch {
      message.error("Couldn't load AI insights");
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

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
          setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong on my end." }]);
        }
      } catch {
        message.error("The assistant couldn't reply — try again.");
      } finally {
        setSending(false);
      }
    },
    [input, sending, conversationId],
  );

  const newChat = () => {
    setMessages([]);
    setConversationId(null);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex items-center justify-between">
        <Heading
          title="AI Assistant"
          description="Ask about sales, inventory or staff performance — every number here comes from your live data, never guessed."
        />
        {messages.length > 0 && (
          <button
            type="button"
            onClick={newChat}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            New chat
          </button>
        )}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <InsightCard
          icon={TriangleAlert}
          tone={lowStock?.items?.some((i) => i.riskLevel === "critical") ? "warning" : "default"}
          title="Stock outlook"
          narrative={lowStock?.narrative}
          generatedAt={lowStock?.generatedAt}
          loading={insightsLoading}
          onRefresh={() => loadInsights(true)}
        />
        <InsightCard
          icon={Sparkles}
          tone="default"
          title="Demand pattern"
          narrative={demand?.narrative}
          generatedAt={demand?.generatedAt}
          loading={insightsLoading}
          onRefresh={() => loadInsights(true)}
        />
      </div>

      <div className="flex h-[60vh] flex-col rounded-xl border border-border bg-card">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Ask a question about your restaurant, or try one of these:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
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
                  "max-w-[80%] rounded-xl px-3.5 py-2 text-sm leading-relaxed",
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
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5">
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sales, stock, staff…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <AlertTriangle className="h-3 w-3" />
        Answers are grounded in your reports data — if the assistant isn't configured server-side yet, chat will show an error until ANTHROPIC_API_KEY is set.
      </p>
    </div>
  );
}
