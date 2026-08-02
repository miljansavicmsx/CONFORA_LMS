"use client";

import type { JSX } from "react";

import { PdfLessonEditor } from "@/admin/content-editor/components/lesson-editors/PdfLessonEditor";
import { TextLessonEditor } from "@/admin/content-editor/components/lesson-editors/TextLessonEditor";
import { VideoLessonEditor } from "@/admin/content-editor/components/lesson-editors/VideoLessonEditor";
import {
  findLessonInStore,
  useContentEditorStore,
} from "@/admin/content-editor/store/contentEditorStore";
import type { EditorLesson } from "@/admin/content-editor/types";

type LessonEditorWorkspaceProps = {
  /** Ako nije zadano, čita selektiranu lekciju iz store-a. */
  readonly lesson?: EditorLesson | null;
};

/**
 * Glavni radni prostor za tip lekcije: tekst (TipTap), video (URL + pregled), PDF (URL).
 * Tip `quiz` ostaje izvan (npr. QuizLessonPanel u roditelju).
 */
export function LessonEditorWorkspace({ lesson: lessonProp }: LessonEditorWorkspaceProps): JSX.Element | null {
  const modules = useContentEditorStore((s) => s.modules);
  const selectedLessonId = useContentEditorStore((s) => s.selectedLessonId);
  const activeCourseId = useContentEditorStore((s) => s.activeCourseId);
  const fromStore = findLessonInStore(modules, selectedLessonId);
  const lesson = lessonProp ?? fromStore;

  if (!lesson) {
    return null;
  }

  switch (lesson.contentType) {
    case "text":
      return <TextLessonEditor key={lesson.id} lesson={lesson} />;
    case "video":
      return (
        <VideoLessonEditor
          key={lesson.id}
          lesson={lesson}
          courseId={activeCourseId ?? undefined}
        />
      );
    case "pdf":
      return <PdfLessonEditor key={lesson.id} lesson={lesson} />;
    case "quiz":
      return null;
  }
}
