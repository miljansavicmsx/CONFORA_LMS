import { useEffect, useState, type JSX } from "react";

import { EmbedHostedVideo } from "@/components/EmbedHostedVideo";
import { HtmlRenderer } from "@/components/HtmlRenderer";
import { PdfViewer } from "@/components/PdfViewer";
import { QuizEngine } from "@/components/QuizEngine";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getVideoEmbedUrl } from "@/lib/videoEmbedUrl";
import type { LessonNode } from "@/types/course-player";
import type { QuizResult } from "@/types/quiz";
import { cn } from "@/lib/utils";

function LessonSkeleton(): JSX.Element {
  return (
    <div className="animate-pulse space-y-4 p-2" aria-busy aria-label="Učitavanje lekcije">
      <div className="h-48 w-full rounded-lg bg-[hsl(var(--muted))]" />
      <div className="h-4 w-3/4 rounded bg-[hsl(var(--muted))]" />
      <div className="h-4 w-full rounded bg-[hsl(var(--muted))]" />
      <div className="h-4 w-5/6 rounded bg-[hsl(var(--muted))]" />
    </div>
  );
}

export function LessonContent({
  lesson,
  className,
  onVideoProgress,
  onVideoComplete,
  playerContext,
  onQuizComplete,
  onQuizContinueNext,
  immersive = false,
}: {
  readonly lesson: LessonNode | null;
  readonly className?: string;
  readonly onVideoProgress?: (positionSeconds: number, watchedPct: number) => void;
  readonly onVideoComplete?: () => void;
  readonly playerContext?: { readonly courseId: string; readonly moduleId: string };
  readonly onQuizComplete?: (result: QuizResult) => void;
  readonly onQuizContinueNext?: () => void;
  readonly immersive?: boolean;
}): JSX.Element {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lesson) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-12 text-sm",
          immersive ? "text-text-muted" : "text-[hsl(var(--muted-foreground))]",
          className,
        )}
      >
        Odaberite lekciju iz sadržaja.
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("max-w-4xl", className)}>
        <LessonSkeleton />
      </div>
    );
  }

  if (lesson.pendingAiReview) {
    return (
      <div
        className={cn(
          "max-w-4xl space-y-3 rounded-xl border border-amber-500/35 bg-amber-950/30 p-6 text-sm",
          immersive ? "text-amber-50" : "text-[hsl(var(--foreground))]",
          className,
        )}
        role="status"
      >
        <p className="font-semibold text-amber-100">AI sadržaj na governance pregledu</p>
        <p className={immersive ? "text-amber-100/90" : "text-[hsl(var(--muted-foreground))]"}>
          Ova lekcija je označena kao AI-generirana i još nije odobrena. Sadržaj nije prikazan učeniku dok
          tehničko povjerenstvo ne odobri objavu.
        </p>
      </div>
    );
  }

  const hostedEmbedSrc =
    lesson.contentType === "video" && lesson.contentUrl
      ? getVideoEmbedUrl(lesson.contentUrl)
      : null;

  return (
    <div
      className={cn(
        immersive ? "mx-auto w-full max-w-4xl space-y-8 py-4" : "max-w-4xl space-y-6",
        className,
      )}
    >
      {lesson.contentType === "video" && lesson.contentUrl && hostedEmbedSrc ? (
        <EmbedHostedVideo
          key={lesson.id}
          src={hostedEmbedSrc}
          title={lesson.title}
          immersive={immersive}
          {...(lesson.transcriptUrl !== undefined ? { transcriptUrl: lesson.transcriptUrl } : {})}
        />
      ) : null}
      {lesson.contentType === "video" && lesson.contentUrl && !hostedEmbedSrc ? (
        <VideoPlayer
          key={lesson.id}
          videoUrl={lesson.contentUrl}
          thumbnailUrl={lesson.thumbnailUrl ?? ""}
          completionThresholdPct={lesson.videoCompletionThresholdPct ?? 90}
          lessonId={lesson.id}
          onProgress={onVideoProgress ?? (() => {})}
          onComplete={onVideoComplete ?? (() => {})}
          immersive={immersive}
          hideChapterButtons={immersive}
          {...(lesson.chapters !== undefined ? { chapters: lesson.chapters } : {})}
          {...(lesson.subtitles !== undefined ? { subtitles: lesson.subtitles } : {})}
          {...(lesson.transcriptUrl !== undefined ? { transcriptUrl: lesson.transcriptUrl } : {})}
          {...(lesson.lastPositionSeconds !== undefined ? { lastPositionSeconds: lesson.lastPositionSeconds } : {})}
        />
      ) : null}
      {lesson.contentType === "video" && !lesson.contentUrl ? (
        <p className={cn("text-sm", immersive ? "text-text-muted" : "text-[hsl(var(--muted-foreground))]")}>
          Nedostaje URL videa.
        </p>
      ) : null}

      {lesson.contentType === "pdf" && lesson.contentUrl ? (
        <PdfViewer src={lesson.contentUrl} title={lesson.title} immersive={immersive} />
      ) : null}
      {lesson.contentType === "pdf" && !lesson.contentUrl ? (
        <p className={cn("text-sm", immersive ? "text-text-muted" : "text-[hsl(var(--muted-foreground))]")}>
          Nedostaje URL PDF-a.
        </p>
      ) : null}

      {lesson.contentType === "text" ? (
        <HtmlRenderer html={lesson.htmlBody ?? "<p>Nema sadržaja.</p>"} immersive={immersive} />
      ) : null}

      {lesson.contentType === "quiz" ? (
        <QuizEngine
          quizId={lesson.id}
          moduleId={playerContext?.moduleId ?? "_"}
          courseId={playerContext?.courseId ?? ""}
          config={{
            timeLimit: 180,
            shuffleQuestions: true,
            showResultsAfter: "end",
            passingScorePct: 70,
          }}
          onComplete={(result) => onQuizComplete?.(result)}
          {...(onQuizContinueNext !== undefined ? { onContinueNextModule: onQuizContinueNext } : {})}
        />
      ) : null}
    </div>
  );
}
