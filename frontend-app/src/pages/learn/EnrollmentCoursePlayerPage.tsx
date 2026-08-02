import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type JSX } from "react";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  fetchPlayerState,
  postLessonComplete,
  postLessonHeartbeat,
  postLessonQuiz,
} from "@/lib/lms-learner-api";

function contentPreview(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2).slice(0, 8000);
  } catch {
    return String(content);
  }
}

export default function EnrollmentCoursePlayerPage(): JSX.Element {
  const { enrollmentId = "", chapterId = "", lessonId = "" } = useParams<{
    enrollmentId: string;
    chapterId: string;
    lessonId: string;
  }>();
  const qc = useQueryClient();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQ, setAiQ] = useState("");
  const [aiOut, setAiOut] = useState("");

  const playerQ = useQuery({
    queryKey: ["player", enrollmentId],
    queryFn: () => fetchPlayerState(enrollmentId),
    enabled: Boolean(enrollmentId),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!enrollmentId || !lessonId) {
      return;
    }
    const id = window.setInterval(() => {
      void postLessonHeartbeat(enrollmentId, lessonId, 30).then(() => {
        void qc.invalidateQueries({ queryKey: ["player", enrollmentId] });
      });
    }, 30_000);
    return () => window.clearInterval(id);
  }, [enrollmentId, lessonId, qc]);

  const completeM = useMutation({
    mutationFn: () => postLessonComplete(enrollmentId, lessonId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["player", enrollmentId] }),
  });

  const quizM = useMutation({
    mutationFn: () => postLessonQuiz(enrollmentId, lessonId, { ok: true }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["player", enrollmentId] }),
  });

  const lesson = playerQ.data?.chapters
    .flatMap((c) => c.lessons.map((l) => ({ chapterId: c.id, lesson: l })))
    .find((x) => x.lesson.id === lessonId)?.lesson;

  const aiSend = useMutation({
    mutationFn: async () => {
      const courseId = playerQ.data?.courseId;
      if (!courseId) {
        throw new Error("no course");
      }
      const { data } = await api.post<{ content: unknown }>("/v1/ai/invoke", {
        purpose: "chat.educational",
        disclosure_shown: true,
        human_oversight_required: true,
        messages: [{ role: "user", content: aiQ }],
        input: { course_id: courseId },
      });
      return typeof data.content === "string" ? data.content : JSON.stringify(data.content);
    },
    onSuccess: (t) => setAiOut(t),
  });

  const jump = useCallback(
    (ch: string, les: string) => {
      window.location.href = `/learn/${encodeURIComponent(enrollmentId)}/${encodeURIComponent(ch)}/${encodeURIComponent(les)}`;
    },
    [enrollmentId],
  );

  if (playerQ.isPending || !playerQ.data) {
    return <div className="p-8 text-text-secondary">Učitavanje tečaja…</div>;
  }

  const p = playerQ.data;

  return (
    <div className="flex min-h-svh bg-surface-primary text-text-primary">
      <aside className="hidden w-72 shrink-0 border-r border-border/50 p-3 md:block" aria-label="Pregled lekcija">
        <p className="text-xs font-semibold text-text-muted">{p.courseTitle}</p>
        <p className="mt-1 text-xs text-text-secondary">{Math.round(p.progressPct)}% · Ispit: {p.examReady ? "spreman" : "nisu ispunjeni uvjeti"}</p>
        <nav aria-label="Sadržaj kursa" className="mt-4 space-y-3 text-sm">
          {p.chapters.map((ch) => (
            <div key={ch.id}>
              <p className={`text-xs font-medium ${ch.id === chapterId ? "text-brand" : "text-text-muted"}`}>{ch.title}</p>
              <ul className="mt-1 space-y-1">
                {ch.lessons.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className={`w-full rounded px-2 py-1 text-left text-xs hover:bg-surface-secondary ${l.id === lessonId ? "bg-brand/15" : ""}`}
                      onClick={() => jump(ch.id, l.id)}
                    >
                      {l.completedAt ? "✓ " : ""}
                      {l.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <section aria-labelledby="enrollment-lesson-heading" className="min-w-0 flex-1 p-4 md:p-8">
        <Link to={`/courses/${encodeURIComponent(p.courseId)}`} className="text-xs text-brand hover:underline">
          Natrag na detalj tečaja
        </Link>
        <h1 id="enrollment-lesson-heading" className="mt-4 text-xl font-bold">
          {lesson?.title ?? "Lekcija"}
        </h1>
        <p className="mt-2 text-xs text-text-muted">
          Minimalno vrijeme: {lesson?.minTimeSec ?? 0}s · Provedeno: {lesson?.timeSpentSec ?? 0}s
        </p>
        <pre className="mt-4 max-h-[50vh] overflow-auto rounded-lg border border-border/50 bg-surface-secondary/40 p-4 text-xs whitespace-pre-wrap">
          {contentPreview(lesson?.content)}
        </pre>
        {lesson?.hasCheckpointQuiz ? (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <p className="font-medium">Mini-kviz</p>
            <Button type="button" size="sm" className="mt-2" disabled={quizM.isPending || lesson.quizPassed} onClick={() => quizM.mutate()}>
              {lesson.quizPassed ? "Prođeno" : "Predaj kviz (demo)"}
            </Button>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" disabled={completeM.isPending || Boolean(lesson?.completedAt)} onClick={() => completeM.mutate()}>
            Završi lekciju
          </Button>
          {p.examReady ? (
            <Button type="button" variant="secondary" asChild>
              <Link to={`/dashboard/exams`}>Na ispit</Link>
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => setAiOpen((v) => !v)}>
            AI tutor (RAG)
          </Button>
        </div>
        {aiOpen ? (
          <section className="mt-6 rounded-xl border border-border/50 bg-surface-secondary/30 p-4" aria-label="AI tutor">
            <textarea
              className="mt-2 w-full rounded border border-border/60 bg-surface-primary p-2 text-sm"
              rows={3}
              value={aiQ}
              onChange={(e) => setAiQ(e.target.value)}
              placeholder="Pitanje o gradivu (ne smije reproducirati ispitna pitanja)…"
            />
            <Button
              type="button"
              className="mt-2"
              disabled={!aiQ.trim() || aiSend.isPending}
              onClick={() => aiSend.mutate()}
            >
              Pošalji
            </Button>
            {aiOut ? <p className="mt-3 text-xs text-text-secondary whitespace-pre-wrap">{aiOut}</p> : null}
          </section>
        ) : null}
      </section>
    </div>
  );
}
