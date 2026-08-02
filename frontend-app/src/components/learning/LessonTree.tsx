import type { JSX } from "react";

import { CourseTOC } from "@/components/CourseTOC";
import type { ModuleNode } from "@/types/course-player";

/**
 * Semantički alias za CourseTOC — navigacija poglavlja/lekcija u playeru.
 */
export function LessonTree(
  props: {
    readonly modules: readonly ModuleNode[];
    readonly currentLessonId: string | null;
    readonly onSelectLesson: (moduleId: string, lessonId: string) => void;
    readonly className?: string;
    readonly immersive?: boolean;
  },
): JSX.Element {
  return <CourseTOC {...props} />;
}
