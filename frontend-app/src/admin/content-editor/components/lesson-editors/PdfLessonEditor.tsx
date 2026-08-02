"use client";

import { useEffect, useRef, useState, type JSX } from "react";

import { useDebouncedLessonPatch } from "@/admin/content-editor/lib/debouncedPatch";
import { useContentEditorStore } from "@/admin/content-editor/store/contentEditorStore";
import type { EditorLesson } from "@/admin/content-editor/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PdfLessonEditor({ lesson }: { readonly lesson: EditorLesson }): JSX.Element {
  const patchLesson = useContentEditorStore((s) => s.patchLesson);
  const { schedule, flushPending } = useDebouncedLessonPatch(lesson.id, patchLesson);
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;
  const flushRef = useRef(flushPending);
  flushRef.current = flushPending;
  const [draft, setDraft] = useState(lesson.pdfUrl);

  useEffect(() => {
    setDraft(lesson.pdfUrl);
  }, [lesson.id, lesson.pdfUrl]);

  return (
    <div className="space-y-2">
      <Label htmlFor={`pdf-url-${lesson.id}`} className="text-text-muted">
        URL PDF dokumenta
      </Label>
      <Input
        id={`pdf-url-${lesson.id}`}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          scheduleRef.current({ pdfUrl: v });
        }}
        onBlur={() => {
          flushRef.current();
        }}
        placeholder="https://…"
        className="mt-1 border-border/40 bg-surface-secondary text-text-primary"
      />
      <p className="text-xs text-text-muted">
        Kasnije se može dodati učitavanje datoteke; za sada je dovoljan javni HTTPS link.
      </p>
    </div>
  );
}
