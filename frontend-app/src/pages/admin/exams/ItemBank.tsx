/**
 * Administracija — Item bank (MCQ) za ISO 17024 ispite.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, CheckCircle2, ClipboardList, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";

import { QuestionDialog } from "@/components/exams/QuestionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ItemBankQuestion,
  type QuestionDifficulty,
  approveAiQuestion,
  deleteQuestion,
  fetchItemBank,
  publishQuestionToBank,
  rejectQuestionAiContent,
  retireQuestion,
  submitQuestionForReview,
} from "@/lib/api-item-bank";
import { fetchPublishedCourses } from "@/lib/catalog-api";
import { cn } from "@/lib/utils";

const ITEM_BANK_QUERY_KEY = "itemBank" as const;
const PUBLISHED_COURSES_ITEMBANK_KEY = "publishedCoursesItemBank" as const;

function itemBankErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const base = error.message;
    if (import.meta.env.DEV) {
      const d = error.response?.data;
      let extra = "";
      if (d && typeof d === "object" && "detail" in d) {
        extra = String((d as { detail: unknown }).detail);
      } else if (d !== undefined) {
        try {
          extra = JSON.stringify(d);
        } catch {
          extra = String(d);
        }
      }
      const status = error.response?.status;
      return [base, status ? `HTTP ${status}` : null, extra || null].filter(Boolean).join(" — ");
    }
    return base;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Provjeri API, prijavu i konfiguraciju item banke.";
}

function difficultyBadgeClass(d: QuestionDifficulty): string {
  switch (d) {
    case "EASY":
      return "border-emerald-500/40 bg-emerald-500/15 text-emerald-200";
    case "MEDIUM":
      return "border-amber-500/40 bg-amber-500/15 text-amber-100";
    case "HARD":
      return "border-red-500/40 bg-red-500/15 text-red-200";
    default:
      return "border-border/60 bg-surface-primary/80 text-text-secondary";
  }
}

function difficultyLabel(d: QuestionDifficulty): string {
  switch (d) {
    case "EASY":
      return "Lako";
    case "MEDIUM":
      return "Srednje";
    case "HARD":
      return "Teško";
    default:
      return d;
  }
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max - 1)}…`;
}

function statusLabel(q: ItemBankQuestion): { readonly label: string; readonly className: string } {
  const s = q.status === "DRAFT_AI" ? "AI_SUGGESTED" : q.status;
  switch (s) {
    case "DRAFT":
      return { label: "Nacrt", className: "border-slate-500/40 bg-slate-500/15 text-slate-100" };
    case "AI_SUGGESTED":
      return { label: "AI predložak", className: "border-amber-500/45 bg-amber-500/15 text-amber-100" };
    case "UNDER_REVIEW":
      return { label: "Na pregledu", className: "border-sky-500/40 bg-sky-500/15 text-sky-100" };
    case "APPROVED":
      return { label: "Odobreno (čeka objavu)", className: "border-violet-500/40 bg-violet-500/15 text-violet-100" };
    case "REJECTED":
      return { label: "Odbijeno (AI)", className: "border-red-500/45 bg-red-950/35 text-red-100" };
    case "ACTIVE":
      return { label: "U ispitu", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" };
    case "RETIRED":
    case "ARCHIVED":
      return { label: "Umirovljeno", className: "border-border/50 bg-surface-primary/80 text-text-muted" };
    default:
      return { label: s || "Nepoznato", className: "border-border/50 bg-surface-primary/80 text-text-muted" };
  }
}

export default function ItemBank(): JSX.Element {
  const queryClient = useQueryClient();
  const [courseId, setCourseId] = useState<string>("");
  const [listTab, setListTab] = useState<"active" | "workflow">("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ItemBankQuestion | null>(null);
  const [feedback, setFeedback] = useState<{ readonly type: "ok" | "err"; readonly text: string } | null>(
    null,
  );

  const queryKey = useMemo(() => [ITEM_BANK_QUERY_KEY, courseId] as const, [courseId]);

  const {
    data: catalogCourses = [],
    isLoading: catalogLoading,
    isError: catalogError,
    error: catalogErr,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: [PUBLISHED_COURSES_ITEMBANK_KEY] as const,
    queryFn: fetchPublishedCourses,
  });

  const courseOptions = useMemo(() => {
    const rows = catalogCourses.filter((c) => c.hasFinalExam !== false);
    return rows.map((c) => ({
      id: c.courseId,
      label: `${c.title} (${c.courseId})`,
    }));
  }, [catalogCourses]);

  useEffect(() => {
    const first = courseOptions[0];
    if (!first) {
      return;
    }
    const ids = new Set(courseOptions.map((c) => c.id));
    if (!courseId || !ids.has(courseId)) {
      setCourseId(first.id);
    }
  }, [courseOptions, courseId]);

  const courseReady = courseId.length > 0;

  const {
    data: questions = [],
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchItemBank(courseId),
    enabled: courseReady,
  });

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const deleteMutation = useMutation({
    mutationFn: (qid: string) => deleteQuestion(qid),
    onSuccess: async () => {
      await invalidate();
    },
  });

  const approveMutation = useMutation({
    mutationFn: (qid: string) => approveAiQuestion(qid),
    onSuccess: async () => {
      setFeedback({
        type: "ok",
        text: "Tehničko odobrenje sadržaja zabilježeno (APPROVED). Objavi stavku u banku ako imaš ulogu urednika.",
      });
      await invalidate();
      setListTab("workflow");
    },
    onError: () => {
      setFeedback({
        type: "err",
        text: "Odobrenje nije uspjelo — potrebna uloga tech_committee ili sys_admin, ili pogrešan status.",
      });
    },
  });

  const rejectAiMutation = useMutation({
    mutationFn: (qid: string) => rejectQuestionAiContent(qid),
    onSuccess: async () => {
      setFeedback({
        type: "ok",
        text: "AI prijedlog je označen kao REJECTED (neće ući u aktivnu banku).",
      });
      await invalidate();
      setListTab("workflow");
    },
    onError: () => {
      setFeedback({
        type: "err",
        text: "Odbijanje nije uspjelo — potrebna uloga tech_committee ili sys_admin, ili pogrešan status.",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (qid: string) => publishQuestionToBank(qid),
    onSuccess: async () => {
      setFeedback({ type: "ok", text: "Stavka je objavljena u aktivnu banku ispita." });
      await invalidate();
      setListTab("active");
    },
    onError: () => {
      setFeedback({
        type: "err",
        text: "Objava nije uspjela — potrebno je APPROVED i uloga urednika.",
      });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (qid: string) => submitQuestionForReview(qid),
    onSuccess: async () => {
      setFeedback({ type: "ok", text: "Poslano na tehnički pregled." });
      await invalidate();
    },
    onError: () => setFeedback({ type: "err", text: "Slanje na pregled nije uspjelo." }),
  });

  const retireMutation = useMutation({
    mutationFn: (qid: string) => retireQuestion(qid),
    onSuccess: async () => {
      setFeedback({ type: "ok", text: "Stavka je umirovljena." });
      await invalidate();
    },
    onError: () => setFeedback({ type: "err", text: "Umirovljenje nije uspjelo." }),
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    setDialogMode("create");
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((q: ItemBankQuestion) => {
    setEditing(q);
    setDialogMode("edit");
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (q: ItemBankQuestion) => {
      if (!window.confirm(`Obrisati pitanje?\n\n${truncate(q.questionText, 120)}`)) {
        return;
      }
      deleteMutation.mutate(q.questionId);
    },
    [deleteMutation],
  );

  const workflowStatuses = useMemo(
    () =>
      new Set([
        "DRAFT",
        "AI_SUGGESTED",
        "UNDER_REVIEW",
        "APPROVED",
        "DRAFT_AI",
        "REJECTED",
      ]),
    [],
  );

  const activeQuestions = useMemo(
    () => questions.filter((q) => q.status === "ACTIVE"),
    [questions],
  );
  const workflowQuestions = useMemo(
    () => questions.filter((q) => workflowStatuses.has(q.status)),
    [questions, workflowStatuses],
  );
  const displayedQuestions = listTab === "active" ? activeQuestions : workflowQuestions;

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <ClipboardList className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Item bank</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                Upravljanje bazom pitanja za ISO 17024 ispite (MCQ). Podaci se učitavaju s API-ja po{" "}
                <code className="rounded bg-surface-secondary px-1 font-mono text-xs">courseId</code>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border/60 bg-surface-secondary/80"
              onClick={() => {
                void refetchCatalog();
                void refetch();
              }}
              disabled={catalogLoading || (courseReady && isFetching)}
            >
              {catalogLoading || (courseReady && isFetching) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Osvježi
            </Button>
            <Button
              type="button"
              className="bg-brand text-white hover:bg-brand/90"
              onClick={openCreate}
              disabled={!courseReady}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo pitanje
            </Button>
          </div>
        </header>

        {feedback ? (
          <div
            role="status"
            className={cn(
              "mb-6 rounded-xl border px-4 py-3 text-sm",
              feedback.type === "ok"
                ? "border-emerald-500/35 bg-emerald-950/35 text-emerald-100"
                : "border-red-500/35 bg-red-950/30 text-red-100",
            )}
          >
            {feedback.text}
            <button
              type="button"
              className="ml-3 text-xs underline opacity-80 hover:opacity-100"
              onClick={() => {
                setFeedback(null);
              }}
            >
              Zatvori
            </button>
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <label htmlFor="item-bank-course" className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Kurs
            </label>
            <select
              id="item-bank-course"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
              }}
              disabled={catalogLoading || courseOptions.length === 0}
              className="h-10 w-full max-w-xl rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:w-auto disabled:opacity-60"
            >
              {courseOptions.length === 0 ? (
                <option value="">{catalogLoading ? "Učitavanje kataloga…" : "Nema kurseva u katalogu"}</option>
              ) : (
                courseOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))
              )}
            </select>
            {catalogError ? (
              <p className="mt-1 text-xs text-red-300" role="alert">
                Katalog se nije učitao. {itemBankErrorMessage(catalogErr)}
              </p>
            ) : null}
          </div>
          <div className="flex w-full max-w-md flex-col gap-1 sm:max-w-lg">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Pregled liste</span>
            <div className="flex rounded-xl border border-border/50 bg-surface-primary/50 p-1 ring-1 ring-white/[0.04]">
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  listTab === "active"
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary",
                )}
                onClick={() => {
                  setListTab("active");
                }}
              >
                Aktivna u ispitu
                <span className="ml-1.5 tabular-nums text-xs opacity-90">({activeQuestions.length})</span>
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  listTab === "workflow"
                    ? "bg-amber-600/90 text-white shadow-sm"
                    : "text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary",
                )}
                onClick={() => {
                  setListTab("workflow");
                }}
              >
                Odobrenje i objava
                <span className="ml-1.5 tabular-nums text-xs opacity-90">({workflowQuestions.length})</span>
              </button>
            </div>
          </div>
        </div>

        {catalogLoading && !courseReady ? (
          <div className="flex min-h-[40vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
            <span>Učitavanje kataloga kurseva…</span>
          </div>
        ) : null}

        {!catalogLoading && !catalogError && courseOptions.length === 0 ? (
          <div
            className="rounded-xl border border-border/50 bg-surface-secondary/40 px-4 py-10 text-center text-sm text-text-secondary"
            role="status"
          >
            Nema objavljenih kurseva s ispitom u katalogu. Kada se kurs pojavi u katalogu, ovdje će se ponuditi
            stvarni <code className="rounded bg-surface-primary px-1 font-mono text-xs">courseId</code>.
          </div>
        ) : null}

        {courseReady && isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center gap-2 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
            <span>Učitavanje pitanja…</span>
          </div>
        ) : null}

        {courseReady && isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            <p className="font-medium">Nije moguće učitati item bank.</p>
            <p className="mt-2 text-red-200/90">{itemBankErrorMessage(error)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 border-red-500/40 text-red-100 hover:bg-red-500/20"
              onClick={() => {
                void refetch();
              }}
            >
              Pokušaj ponovo
            </Button>
          </div>
        ) : null}

        {courseReady && !isLoading && !isError ? (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface-secondary/40 ring-1 ring-white/[0.04]">
            {listTab === "workflow" && workflowQuestions.length > 0 ? (
              <div className="flex items-start gap-3 border-b border-amber-500/25 bg-amber-950/35 px-4 py-3 text-sm text-amber-50">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
                <div>
                  <span className="font-semibold">Tijek: nacrt → pregled → tehničko odobrenje → objava.</span>{" "}
                  <span className="text-amber-100/90">
                    AI označena pitanja ne ulaze u ispit dok ih tech_committee ne odobri, a urednik ne objavi kao
                    ACTIVE.
                  </span>
                </div>
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-surface-primary/40 text-xs uppercase tracking-wider text-text-muted">
                    <th className="px-4 py-3 font-semibold">Tekst pitanja</th>
                    <th className="w-36 px-4 py-3 font-semibold">Status</th>
                    <th className="w-28 px-4 py-3 font-semibold">Težina</th>
                    <th className="w-32 px-4 py-3 font-semibold">Kreirano AI</th>
                    <th className="w-52 px-4 py-3 text-right font-semibold">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                        Nema pitanja u item banku za ovaj kurs.
                      </td>
                    </tr>
                  ) : displayedQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                        {listTab === "workflow"
                          ? "Nema stavki u tijeku — sve su aktivne ili umirovljene."
                          : "Nema aktivnih prikaza za ovaj filter."}
                      </td>
                    </tr>
                  ) : (
                    displayedQuestions.map((q) => {
                      const st = statusLabel(q);
                      const aiPending =
                        q.status === "DRAFT_AI" || q.status === "AI_SUGGESTED" || q.isAIGenerated;
                      return (
                      <tr
                        key={q.questionId}
                        className={cn(
                          "border-b border-border/30 transition-colors hover:bg-surface-primary/30",
                          aiPending && "bg-amber-950/15",
                        )}
                      >
                        <td className="max-w-md px-4 py-3 text-text-primary">
                          <div className="flex flex-col gap-2">
                            {q.status === "DRAFT_AI" || q.status === "AI_SUGGESTED" ? (
                              <span className="w-fit rounded-full border border-amber-500/50 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                                AI / tijek odobrenja
                              </span>
                            ) : null}
                            <span title={q.questionText}>{truncate(q.questionText, 96)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("font-semibold", st.className)}>
                            {st.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={cn("font-semibold", difficultyBadgeClass(q.difficulty))}
                          >
                            {difficultyLabel(q.difficulty)}
                          </Badge>
                          <span className="ml-1 font-mono text-[10px] text-text-muted">{q.difficulty}</span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {q.isAIGenerated ? (
                            <span className="text-violet-300">Da</span>
                          ) : (
                            <span className="text-text-muted">Ne</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {(q.status === "AI_SUGGESTED" ||
                              q.status === "UNDER_REVIEW" ||
                              q.status === "DRAFT_AI") ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 border-emerald-500/40 bg-emerald-600 px-2 text-white hover:bg-emerald-500"
                                  disabled={approveMutation.isPending}
                                  title="Zahtijeva tech_committee ili sys_admin"
                                  onClick={() => {
                                    approveMutation.mutate(q.questionId);
                                  }}
                                >
                                  {approveMutation.isPending && approveMutation.variables === q.questionId ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                  <span className="ml-1">Tech odobri</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-red-500/45 px-2 text-red-100 hover:bg-red-500/15"
                                  disabled={rejectAiMutation.isPending}
                                  title="Zahtijeva tech_committee ili sys_admin"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Odbiti AI prijedlog pitanja? Stavka ostaje REJECTED i ne ide u aktivnu banku.",
                                      )
                                    ) {
                                      rejectAiMutation.mutate(q.questionId);
                                    }
                                  }}
                                >
                                  {rejectAiMutation.isPending && rejectAiMutation.variables === q.questionId ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : null}
                                  <span className="ml-1">Tech odbij</span>
                                </Button>
                              </>
                            ) : null}
                            {q.status === "APPROVED" ? (
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 border-brand/50 bg-brand-solid px-2 text-white hover:bg-brand-hover"
                                disabled={publishMutation.isPending}
                                onClick={() => publishMutation.mutate(q.questionId)}
                              >
                                {publishMutation.isPending && publishMutation.variables === q.questionId ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                <span className="ml-1">Objavi</span>
                              </Button>
                            ) : null}
                            {(q.status === "DRAFT" || q.status === "AI_SUGGESTED") ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                disabled={submitReviewMutation.isPending}
                                onClick={() => submitReviewMutation.mutate(q.questionId)}
                              >
                                Na pregled
                              </Button>
                            ) : null}
                            {q.status === "ACTIVE" ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-text-muted"
                                disabled={retireMutation.isPending}
                                onClick={() => {
                                  if (window.confirm("Umiroviti stavku (uklanja iz ispita)?")) {
                                    retireMutation.mutate(q.questionId);
                                  }
                                }}
                              >
                                Umirovli
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 border-border/60 px-2"
                              onClick={() => {
                                openEdit(q);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="sr-only sm:not-sr-only sm:ml-1">Uredi</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 border-red-500/40 px-2 text-red-200 hover:bg-red-500/10"
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                handleDelete(q);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only sm:not-sr-only sm:ml-1">Obriši</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <QuestionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          courseId={courseId}
          mode={dialogMode}
          initialQuestion={editing}
          onSuccess={invalidate}
        />
      </div>
    </div>
  );
}
