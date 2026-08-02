"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { useAiTutorPlayerStore } from "@/store/aiTutorPlayerStore";
import { cn } from "@/lib/utils";

function TypingDots(): JSX.Element {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <span className="text-text-muted" aria-hidden>
        …
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1 px-1 py-0.5" aria-label="AI piše">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-text-muted"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function AiTutorFloating(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const panelOpen = useAiTutorPlayerStore((s) => s.panelOpen);
  const hasUnread = useAiTutorPlayerStore((s) => s.hasUnread);
  const messages = useAiTutorPlayerStore((s) => s.messages);
  const isTyping = useAiTutorPlayerStore((s) => s.isTyping);
  const lastError = useAiTutorPlayerStore((s) => s.lastError);
  const playerContext = useAiTutorPlayerStore((s) => s.playerContext);
  const togglePanel = useAiTutorPlayerStore((s) => s.togglePanel);
  const closePanel = useAiTutorPlayerStore((s) => s.closePanel);
  const sendMessage = useAiTutorPlayerStore((s) => s.sendMessage);
  const retryLastMessage = useAiTutorPlayerStore((s) => s.retryLastMessage);

  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const moduleTitle = playerContext?.moduleTitle ?? "";
  const lessonTitle = playerContext?.lessonTitle ?? "";

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping, panelOpen]);

  const onSend = useCallback(() => {
    const t = draft.trim();
    if (!t || isTyping) {
      return;
    }
    void sendMessage(t);
    setDraft("");
  }, [draft, isTyping, sendMessage]);

  return (
    <>
      <AnimatePresence>
        {panelOpen ? (
            <motion.div
            key="panel"
            data-testid="ai-tutor-panel"
            initial={reduceMotion ? false : { opacity: 0, x: 48 }}
            animate={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 48 }}
            transition={
              reduceMotion
                ? { duration: 0.12 }
                : { type: "spring", stiffness: 320, damping: 32 }
            }
            className={cn(
              "fixed bottom-0 right-0 z-[80] flex w-full max-w-md flex-col rounded-tl-2xl border border-violet-500/30 bg-surface-secondary shadow-2xl max-xl:bottom-[4.5rem]",
              "h-[min(60vh,520px)] sm:max-w-sm lg:h-[60vh] lg:max-w-96",
            )}
            role="dialog"
            aria-modal="true"
            aria-label="AI Tutor"
          >
            <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" aria-hidden />
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-text-primary">AI Tutor</span>
                  <span className="text-[11px] text-text-muted">
                    Podrška za učenje — nije službeni certifikacijski odbor
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-muted hover:bg-white/5 hover:text-text-primary"
                aria-label="Zatvori"
                onClick={() => closePanel()}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="border-b border-violet-500/15 bg-violet-500/10 px-4 py-2 text-xs text-violet-100">
              <div className="flex flex-col gap-0.5">
                <span>
                  Modul:
                  {" "}
                  <span className="font-medium text-white">
                    {moduleTitle || "—"}
                  </span>
                </span>
                <span>
                  Lekcija:
                  {" "}
                  <span className="font-medium text-white">
                    {lessonTitle || "—"}
                  </span>
                </span>
              </div>
            </div>

            {lastError ? (
              <div className="flex items-start gap-2 border-b border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="leading-snug">{lastError}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-7 gap-1 px-2 text-xs text-white hover:bg-white/10"
                    onClick={() => retryLastMessage()}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Pokušaj ponovo
                  </Button>
                </div>
              </div>
            ) : null}

            <div
              ref={listRef}
              data-testid="ai-tutor-messages"
              className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3"
              aria-live="polite"
              aria-relevant="additions text"
              aria-atomic="false"
            >
              {messages.length === 0 && !isTyping ? (
                <p className="text-sm text-text-muted">
                  Pitaj o lekciji, ključnim pojmovima ili pripremi za ispit. Neću davati tačne odgovore na
                  aktivna pitanja ni odluke o certifikaciji.
                </p>
              ) : null}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-brand/25 text-text-primary"
                      : "mr-auto bg-surface-tertiary/80 text-text-secondary",
                  )}
                  role={m.role === "assistant" ? "article" : undefined}
                  aria-label={m.role === "assistant" ? "Odgovor AI tutora" : undefined}
                >
                  {m.role === "assistant" && m.aiGenerated ? (
                    <span className="mb-1 block text-[10px] uppercase tracking-wide text-text-muted">
                      AI · generisani odgovor
                    </span>
                  ) : null}
                  {m.role === "assistant" && !m.text && isTyping ? (
                    <TypingDots />
                  ) : (
                    m.text
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-border/30 p-3">
              <p className="mb-2 text-[10px] leading-snug text-text-muted">
                AI sadržaj je informativan; certifikaciju i pravila sheme određuju isključivo formalni procesi u
                sustavu — ne ovaj chat.
              </p>
              <div className="flex items-center gap-2 rounded-full border border-border/50 bg-surface-primary px-3 py-1.5">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  placeholder="Poruka…"
                  disabled={isTyping}
                  className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
                  aria-label="Poruka za AI Tutora"
                />
                <Button
                  type="button"
                  size="icon"
                  disabled={isTyping}
                  className="h-9 w-9 shrink-0 rounded-full bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40"
                  aria-label="Pošalji"
                  onClick={onSend}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!panelOpen ? (
        <motion.button
          type="button"
          data-testid="ai-tutor-toggle"
          initial={false}
          animate={
            reduceMotion
              ? { scale: 1 }
              : hasUnread
                ? {
                    scale: [1, 1.06, 1],
                    boxShadow: [
                      "0 10px 25px rgba(0,0,0,0.35)",
                      "0 0 0 6px rgba(139,92,246,0.25)",
                      "0 10px 25px rgba(0,0,0,0.35)",
                    ],
                  }
                : { scale: 1 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 1.6, repeat: hasUnread ? Infinity : 0, ease: "easeInOut" }
          }
          className={cn(
            "fixed bottom-6 right-6 z-[75] flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg max-xl:bottom-24",
            "hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary",
          )}
          aria-label="Otvori AI Tutor"
          onClick={() => togglePanel()}
        >
          {hasUnread ? (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-violet-600" />
          ) : null}
          <Sparkles className="h-6 w-6" aria-hidden />
        </motion.button>
      ) : null}
    </>
  );
}
