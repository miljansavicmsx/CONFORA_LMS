import type { LucideIcon } from "lucide-react";

import type { AppWorkspaceId } from "@/lib/app-workspace";

/** Registry of discoverable entities for the global command center (nav + optional API rows). */
export type CommandEntityType =
  | "course"
  | "lesson"
  | "quiz"
  | "certificate"
  | "application"
  | "decision"
  | "risk"
  | "capa"
  | "complaint"
  | "appeal"
  | "management_review"
  | "scheme"
  | "audit_event"
  | "user"
  | "tenant"
  | "workflow"
  | "report"
  | "clause";

/** High-level buckets for grouped UI (not persisted). */
export type CommandResultBucket =
  | "learning"
  | "certification"
  | "governance"
  | "knowledge"
  | "operations"
  | "recent"
  | "pinned"
  | "ai"
  | "quick_actions"
  | "continuity";

export type CommandEntity = {
  readonly id: string;
  readonly entityType: CommandEntityType;
  readonly title: string;
  readonly subtitle?: string;
  readonly status?: string;
  readonly workspace: AppWorkspaceId;
  readonly route: string;
  readonly icon?: LucideIcon;
  readonly severity?: string;
  readonly tags?: readonly string[];
  readonly aiHint?: string;
  readonly updatedAt?: string;
  /** Grouping for enterprise result sections. */
  readonly resultBucket?: CommandResultBucket;
  /** Trust / provenance — static routes use "nav". */
  readonly source?: "nav" | "quick_action" | "recent" | "pinned" | "remote" | "semantic" | "continuity";
};

export type PersistedCommandEntity = Omit<CommandEntity, "icon">;
