import { useMutation } from "@tanstack/react-query";
import { MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type JSX } from "react";

import { AiDisclosure } from "@/components/ai/AiDisclosure";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function DashboardSupportChat(): JSX.Element {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [disclosureAck, setDisclosureAck] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const invoke = useMutation({
    mutationFn: async (msgs: ChatMsg[]) => {
      const { data } = await api.post<{ content: unknown }>("/v1/ai/invoke", {
        purpose: "chat.support",
        messages: msgs.map((m) => ({ role: m.role, content: m.content })),
        disclosure_shown: true,
        human_oversight_required: true,
      });
      const c = data.content;
      const text = typeof c === "string" ? c : JSON.stringify(c);
      return text;
    },
    onSuccess: (text) => {
      setMessages((m) => [...m, { role: "assistant", content: text }]);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response?: { data?: { message?: unknown } } }).response?.data?.message ?? "")
          : "";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            msg ||
            "Trenutno nije moguće dohvatiti odgovor. Pokušajte općenitije formulirati pitanje.",
        },
      ]);
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open]);

  const onSend = useCallback(() => {
    const t = input.trim();
    if (!t || invoke.isPending) {
      return;
    }
    if (!disclosureAck) {
      return;
    }
    const next: ChatMsg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    invoke.mutate(next);
  }, [disclosureAck, input, invoke, messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {open ? (
        <section
          className="flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface-primary shadow-xl"
          aria-labelledby={panelId}
          role="dialog"
          aria-modal="false"
        >
          <header className="flex items-center justify-between border-b border-border/50 px-3 py-2">
            <h2 id={panelId} className="text-sm font-semibold text-text-primary">
              Podrška (AI)
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
              aria-label="Zatvori chat"
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </header>
          <div ref={listRef} className="max-h-72 space-y-3 overflow-y-auto px-3 py-3" role="log" aria-live="polite">
            {!disclosureAck ? (
              <>
                <AiDisclosure />
                <Button type="button" className="w-full" onClick={() => setDisclosureAck(true)}>
                  Razumijem, nastavi
                </Button>
              </>
            ) : null}
            {disclosureAck && messages.length === 0 ? (
              <p className="text-xs text-text-secondary">Postavite opće pitanje o platformi ili certifikaciji.</p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${String(i)}`}
                className={`rounded-lg px-2.5 py-2 text-xs leading-relaxed ${
                  m.role === "user" ? "ml-6 bg-brand/15 text-text-primary" : "mr-6 bg-surface-secondary text-text-secondary"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border/50 p-2">
            <label className="sr-only" htmlFor="module1-support-input">
              Poruka za AI podršku
            </label>
            <input
              id="module1-support-input"
              className="min-w-0 flex-1 rounded-lg border border-border/60 bg-surface-secondary px-2 py-1.5 text-xs text-text-primary outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
              value={input}
              disabled={!disclosureAck || invoke.isPending}
              placeholder="Vaša poruka…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={!disclosureAck || invoke.isPending || !input.trim()}
              onClick={() => onSend()}
              aria-label="Pošalji poruku"
            >
              <Send className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </section>
      ) : null}
      <Button
        type="button"
        className="h-12 rounded-full px-4 shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <MessageCircle className="mr-2 h-5 w-5" aria-hidden />
        Podrška
      </Button>
    </div>
  );
}
