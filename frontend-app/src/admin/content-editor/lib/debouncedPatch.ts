import { useCallback, useEffect, useRef } from "react";

import type { EditorLesson } from "@/admin/content-editor/types";

const DEFAULT_MS = 400;

/**
 * Debounced patch u Zustand. Cleanup pri promjeni `lessonId` ili unmountu flusha pending.
 */
export function useDebouncedLessonPatch(
  lessonId: string,
  patchLesson: (id: string, patch: Partial<EditorLesson>) => void,
  delayMs = DEFAULT_MS,
): {
  readonly schedule: (patch: Partial<EditorLesson>) => void;
  readonly flushPending: () => void;
  readonly cancelPending: () => void;
} {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Partial<EditorLesson> | null>(null);

  const cancelPending = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
  }, []);

  const flushPending = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const p = pendingRef.current;
    pendingRef.current = null;
    if (p && Object.keys(p).length > 0) {
      patchLesson(lessonId, p);
    }
  }, [lessonId, patchLesson]);

  const schedule = useCallback(
    (patch: Partial<EditorLesson>) => {
      pendingRef.current = { ...pendingRef.current, ...patch };
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const merged = pendingRef.current;
        pendingRef.current = null;
        if (merged && Object.keys(merged).length > 0) {
          patchLesson(lessonId, merged);
        }
      }, delayMs);
    },
    [lessonId, patchLesson, delayMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const p = pendingRef.current;
      pendingRef.current = null;
      if (p && Object.keys(p).length > 0) {
        patchLesson(lessonId, p);
      }
    };
  }, [lessonId, patchLesson]);

  return { schedule, flushPending, cancelPending };
}
