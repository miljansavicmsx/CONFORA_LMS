import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type JSX } from "react";
import { Link, useParams } from "react-router";
import { DASHBOARD_NS } from "@confora/i18n";
import { useTranslation } from "react-i18next";

import { fetchCoursePlayer, recordLessonProgress, submitChapterQuiz, type Player } from "@/lib/learning-api";

type Selection =
  | { readonly kind: "lesson"; readonly chapterId: string; readonly lessonId: string }
  | { readonly kind: "quiz"; readonly chapterId: string; readonly quizId: string };

function firstSelection(player: Player): Selection | null {
  const chapter = player.chapters[0];
  const lesson = chapter?.lessons[0];
  if (chapter && lesson) return { kind: "lesson", chapterId: chapter.id, lessonId: lesson.id };
  if (chapter?.quiz) return { kind: "quiz", chapterId: chapter.id, quizId: chapter.quiz.id };
  return null;
}

export default function CoursePlayerPage(): JSX.Element {
  const { t } = useTranslation(DASHBOARD_NS);
  const { enrolmentId = "" } = useParams();
  const queryClient = useQueryClient();
  const playerQuery = useQuery({
    queryKey: ["learning", "player", enrolmentId],
    queryFn: () => fetchCoursePlayer(enrolmentId),
    enabled: enrolmentId.length > 0,
  });
  const player = playerQuery.data;
  const [selection, setSelection] = useState<Selection | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizMessage, setQuizMessage] = useState<string | null>(null);
  const active = selection ?? (player ? firstSelection(player) : null);

  const lesson = useMemo(() => {
    if (!player || active?.kind !== "lesson") return null;
    return player.chapters.find((chapter) => chapter.id === active.chapterId)?.lessons.find((item) => item.id === active.lessonId) ?? null;
  }, [player, active]);
  const quiz = useMemo(() => {
    if (!player || active?.kind !== "quiz") return null;
    return player.chapters.find((chapter) => chapter.id === active.chapterId)?.quiz ?? null;
  }, [player, active]);

  const progress = useMutation({
    mutationFn: (lessonId: string) =>
      recordLessonProgress(enrolmentId, lessonId, {
        additionalSeconds: lesson?.minimumTimeSeconds && lesson.timeSpentSeconds < lesson.minimumTimeSeconds ? lesson.minimumTimeSeconds - lesson.timeSpentSeconds : 1,
        statementId: crypto.randomUUID(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "player", enrolmentId] });
    },
  });
  const attempt = useMutation({
    mutationFn: () => {
      if (!quiz) throw new Error("missing quiz");
      return submitChapterQuiz(enrolmentId, quiz.id, {
        statementId: crypto.randomUUID(),
        answers: quiz.items.map((item) => ({ itemId: item.id, choiceKey: answers[item.id] ?? "" })),
      });
    },
    onSuccess: async (result) => {
      setQuizMessage(result.passed ? t("learning.passed", { score: result.scorePercent }) : t("learning.failed", { score: result.scorePercent }));
      await queryClient.invalidateQueries({ queryKey: ["learning", "player", enrolmentId] });
    },
  });

  if (playerQuery.isError) {
    return <p role="alert" className="p-8 text-red-300">{t("learning.loadError")}</p>;
  }
  if (!player) {
    return <p className="p-8" role="status">{t("loading")}</p>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-text-primary lg:grid-cols-[18rem_1fr]">
      <nav aria-labelledby="player-chapters" className="rounded-xl border border-white/10 bg-surface-secondary p-4">
        <h1 id="player-chapters" className="text-lg font-semibold">{player.course.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{player.course.progressPercent}%</p>
        {player.paymentState === "PENDING_PAYMENT" ? <p className="mt-2 text-sm">{t("learning.pendingPayment")}</p> : null}
        <ol className="mt-4 space-y-4">
          {player.chapters.map((chapter) => (
            <li key={chapter.id}>
              <p className="font-medium">{chapter.title}</p>
              <ul className="mt-2 space-y-1">
                {chapter.lessons.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={active?.kind === "lesson" && active.lessonId === item.id ? "page" : undefined}
                      className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
                      onClick={() => setSelection({ kind: "lesson", chapterId: chapter.id, lessonId: item.id })}
                    >
                      <span>{item.title}</span>
                      <span className="text-xs">{item.completed ? t("learning.completed") : t("learning.notCompleted")}</span>
                    </button>
                  </li>
                ))}
                {chapter.quiz ? (
                  <li>
                    <button
                      type="button"
                      aria-current={active?.kind === "quiz" && active.quizId === chapter.quiz.id ? "page" : undefined}
                      className="w-full rounded px-2 py-1 text-left hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
                      onClick={() => setSelection({ kind: "quiz", chapterId: chapter.id, quizId: chapter.quiz!.id })}
                    >
                      {chapter.quiz.title}
                      {chapter.quiz.passed ? ` · ${t("learning.completed")}` : ""}
                    </button>
                  </li>
                ) : null}
              </ul>
            </li>
          ))}
        </ol>
        <Link className="mt-4 inline-flex text-[#0EA5E9] underline-offset-4 hover:underline" to="/dashboard">{t("learning.backToDashboard")}</Link>
      </nav>

      <section aria-labelledby="player-content" className="space-y-4">
        <h2 id="player-content" className="sr-only">{t("learning.playerHeading")}</h2>
        {lesson ? (
          <article className="space-y-4">
            <h3 className="text-2xl font-semibold">{lesson.title}</h3>
            <p className="text-sm text-text-secondary">{t("learning.minTime", { seconds: lesson.minimumTimeSeconds, spent: lesson.timeSpentSeconds })}</p>
            {lesson.blocks.map((block) => (
              <section key={block.id} aria-label={block.title ?? block.kind} className="rounded-xl border border-white/10 p-4">
                {block.kind === "TEXT" ? <p>{block.textBody}</p> : null}
                {block.kind === "VIDEO" && block.objectKey ? (
                  <video controls className="w-full" src={block.objectKey}>
                    <track kind="captions" />
                  </video>
                ) : null}
                {block.kind === "PDF" && block.objectKey ? (
                  <a className="text-[#0EA5E9] underline-offset-4 hover:underline" href={block.objectKey}>{block.title ?? t("learning.pdfBlock")}</a>
                ) : null}
              </section>
            ))}
            <button
              type="button"
              className="inline-flex h-11 items-center rounded-md bg-[#0EA5E9] px-4 font-semibold text-white hover:bg-[#0284C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
              onClick={() => progress.mutate(lesson.id)}
            >
              {t("learning.markProgress")}
            </button>
          </article>
        ) : null}
        {quiz ? (
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              attempt.mutate();
            }}
          >
            <h3 className="text-2xl font-semibold">{quiz.title}</h3>
            {quiz.items.map((item) => (
              <fieldset key={item.id} className="space-y-2 rounded-xl border border-white/10 p-4">
                <legend className="font-medium">{item.stem}</legend>
                {item.choices.map((choice) => (
                  <label key={choice.choiceKey} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={item.id}
                      value={choice.choiceKey}
                      checked={answers[item.id] === choice.choiceKey}
                      onChange={() => setAnswers((current) => ({ ...current, [item.id]: choice.choiceKey }))}
                    />
                    {choice.text}
                  </label>
                ))}
              </fieldset>
            ))}
            <button type="submit" className="inline-flex h-11 items-center rounded-md bg-[#0EA5E9] px-4 font-semibold text-white hover:bg-[#0284C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]">
              {t("learning.submitQuiz")}
            </button>
            {quizMessage ? <p role="status">{quizMessage}</p> : null}
          </form>
        ) : null}
        <aside role="note" className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-text-secondary">
          <h3 className="font-semibold text-text-primary">{t("learning.aiPlaceholderTitle")}</h3>
          <p className="mt-1">{t("learning.aiPlaceholderBody")}</p>
        </aside>
      </section>
    </div>
  );
}
