/**
 * Aktivna AI Roleplay sesija — chat + evaluacija.
 */

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router";

import { EvaluationResultDialog } from "@/components/roleplay/EvaluationResultDialog";
import { Button } from "@/components/ui/button";
import {
  evaluateSession,
  loadRoleplaySessionMeta,
  streamChatMessage,
  type RoleplayEvaluateResponse,
  type RoleplayTranscriptTurn,
} from "@/lib/api-roleplay";
import { cn } from "@/lib/utils";

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RoleplaySession(): JSX.Element {
  const { sessionId: sessionIdParam } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const sessionId = sessionIdParam ?? "";

  const meta = useMemo(() => (sessionId ? loadRoleplaySessionMeta(sessionId) : null), [sessionId]);

  const [transcript, setTranscript] = useState<RoleplayTranscriptTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [evalOpen, setEvalOpen] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<RoleplayEvaluateResponse | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - t0) / 1000));
    }, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, streaming]);

  const evaluateMutation = useMutation({
    mutationFn: () => evaluateSession(sessionId),
    onMutate: () => {
      setEvalLoading(true);
      setEvalError(null);
      setEvalResult(null);
      setEvalOpen(true);
    },
    onSuccess: (data) => {
      setEvalResult(data);
      setEvalLoading(false);
    },
    onError: (e: unknown) => {
      setEvalLoading(false);
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as { detail?: unknown } | undefined;
        const detail = d?.detail;
        setEvalError(
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((x) => String(x)).join(", ")
              : e.message,
        );
        return;
      }
      setEvalError(e instanceof Error ? e.message : "Evaluacija nije uspjela.");
    },
  });

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || !sessionId || streaming) {
      return;
    }
    setDraft("");
    setStreamError(null);
    setTranscript((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);

    try {
      await streamChatMessage(
        sessionId,
        text,
        (chunk) => {
          setTranscript((prev) => {
            const base = [...prev];
            const last = base[base.length - 1];
            if (last?.role === "assistant") {
              base[base.length - 1] = { role: "assistant", content: last.content + chunk };
              return base;
            }
            return [...base, { role: "assistant", content: chunk }];
          });
        },
        () => {
          setStreaming(false);
        },
        (err) => {
          setStreamError(err.message);
        },
      );
    } catch {
      setStreaming(false);
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content.trim()) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setStreaming(false);
    }
  }, [draft, sessionId, streaming]);

  const handleEvaluate = useCallback(() => {
    if (!sessionId || streaming || evaluateMutation.isPending) {
      return;
    }
    evaluateMutation.mutate();
  }, [sessionId, streaming, evaluateMutation]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  if (!sessionId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center text-text-secondary">
        <p>Nedostaje ID sesije.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/dashboard/admin/roleplay">Natrag na katalog</Link>
        </Button>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-text-secondary">
          Nema spremljenih podataka o sesiji. Pokrenite simulaciju iz kataloga roleplaya.
        </p>
        <Button asChild className="mt-4 bg-brand text-white hover:bg-brand/90">
          <Link to="/dashboard/admin/roleplay">Otvori katalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface-primary/30">
      <header className="shrink-0 border-b border-border/40 bg-surface-secondary/80 px-4 py-4 backdrop-blur-sm lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Button asChild variant="ghost" size="icon" className="shrink-0 text-text-muted">
              <Link to="/dashboard/admin/roleplay" aria-label="Natrag">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold leading-tight text-text-primary sm:text-xl">
                {meta.scenarioTitle}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Persona: <span className="font-medium text-text-primary">{meta.aiPersonaName}</span> ·{" "}
                {meta.aiPersonaRole}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
            <div className="rounded-lg border border-border/50 bg-surface-primary/60 px-3 py-1.5 font-mono text-sm tabular-nums text-text-primary">
              {formatElapsed(elapsed)}
            </div>
            <p className="text-xs text-text-muted">Trajanje sesije</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {transcript.length === 0 && !streaming ? (
            <p className="rounded-xl border border-dashed border-border/40 bg-surface-secondary/30 p-8 text-center text-sm text-text-muted">
              Započnite razgovor kao Lead Auditor. AI odgovara u ulozi &quot;{meta.aiPersonaName}&quot;.
            </p>
          ) : null}

          {transcript.map((turn, i) => (
            <div
              key={`${turn.role}-${i}-${turn.content.slice(0, 12)}`}
              className={cn(
                "flex",
                turn.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ring-1",
                  turn.role === "user"
                    ? "bg-brand/25 text-text-primary ring-brand/30"
                    : "bg-surface-secondary text-text-secondary ring-border/40",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{turn.content}</p>
              </div>
            </div>
          ))}

          {streaming && transcript[transcript.length - 1]?.role === "user" ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-surface-secondary/80 px-4 py-3 text-sm text-text-muted">
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
                Tarik razmišlja…
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>

      {streamError ? (
        <div className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-center text-xs text-red-200 lg:px-8">
          {streamError}
        </div>
      ) : null}

      <div className="shrink-0 border-t border-border/40 bg-surface-secondary/90 px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
              }}
              onKeyDown={onKeyDown}
              disabled={streaming}
              rows={3}
              placeholder="Vaša poruka auditoru… (Enter šalje, Shift+Enter novi red)"
              className={cn(
                "min-h-[88px] flex-1 resize-y rounded-xl border border-border/60 bg-surface-primary px-4 py-3 text-sm text-text-primary",
                "placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                streaming && "cursor-not-allowed opacity-60",
              )}
            />
            <Button
              type="button"
              className="h-11 shrink-0 bg-brand text-white hover:bg-brand/90 sm:h-[88px] sm:w-28"
              disabled={streaming || !draft.trim()}
              onClick={() => {
                void handleSend();
              }}
            >
              {streaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Pošalji
                </>
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20"
            disabled={streaming || evaluateMutation.isPending}
            onClick={handleEvaluate}
          >
            Završi audit i ocijeni
          </Button>
        </div>
      </div>

      <EvaluationResultDialog
        open={evalOpen}
        onOpenChange={setEvalOpen}
        loading={evalLoading}
        result={evalResult}
        error={evalError}
        onBackToCatalog={() => {
          setEvalOpen(false);
          void navigate("/dashboard/admin/roleplay");
        }}
      />
    </div>
  );
}
