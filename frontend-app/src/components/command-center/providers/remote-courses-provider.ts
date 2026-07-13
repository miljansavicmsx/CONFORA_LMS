import { BookOpen } from "lucide-react";

import { api } from "@/lib/api";

import type { CommandEntity } from "../command-entity-types";
import { inferResultBucket } from "../command-navigation";

type CourseRow = {
  readonly courseId: string;
  readonly slug: string;
  readonly title: string;
  readonly domain?: string | null;
  readonly level?: string;
};

/**
 * Agregacija postojećeg GET /api/courses — kratki timeout, bez blokiranja UI.
 * Pri grešci ili timeoutu vraća prazno (mock-safe fallback).
 */
export async function fetchRemoteCourseEntities(signal: AbortSignal): Promise<CommandEntity[]> {
  try {
    const { data } = await api.get<CourseRow[]>("/api/courses", {
      signal,
      timeout: 420,
    });
    if (!Array.isArray(data)) return [];
    return data.slice(0, 14).map((c) => ({
      id: `remote:course:${c.courseId}`,
      entityType: "course" as const,
      title: c.title,
      subtitle: [c.domain, c.level].filter(Boolean).join(" · ") || "Kurs",
      workspace: "learning",
      route: `/learn/${encodeURIComponent(c.courseId)}`,
      icon: BookOpen,
      tags: ["course", "remote", c.slug],
      source: "remote",
      resultBucket: inferResultBucket({
        route: `/learn/${c.courseId}`,
        entityType: "course",
        workspace: "learning",
      }),
    }));
  } catch {
    return [];
  }
}
