import type { AppWorkspaceId } from "@/lib/app-workspace";

import { expandKnowledgeQueryTokens } from "@/lib/knowledge/knowledge-search";

import type { CommandEntity, CommandResultBucket } from "./command-entity-types";
import { inferResultBucket } from "./command-navigation";

export type ParsedCommandQuery = {
  readonly raw: string;
  readonly text: string;
  readonly shortcut?: {
    readonly kind:
      | "course"
      | "cert"
      | "risk"
      | "capa"
      | "user"
      | "clause"
      | "standard"
      | "requirement"
      | "evidence"
      | "audit";
    readonly rest: string;
  };
};

const SEMANTIC_EXPANSIONS: ReadonlyArray<{ readonly phrases: readonly string[]; readonly inject: readonly string[] }> = [
  { phrases: ["expired certificates", "istekli certifikati", "istekao certifikat"], inject: ["certificate", "expired", "recertification"] },
  { phrases: ["high risks", "visoki rizik", "kritični rizik"], inject: ["risk", "high", "severe"] },
  { phrases: ["applications waiting review", "prijave na pregledu", "pending applications"], inject: ["application", "pending", "review"] },
  { phrases: ["iso 17024", "17024"], inject: ["iso", "17024", "scheme"] },
  { phrases: ["ai generated questions", "ai pitanja", "ispitna pitanja ai"], inject: ["quiz", "ai", "item-bank", "roleplay"] },
  { phrases: ["pending approvals", "čekaju odobrenje", "na odobrenje"], inject: ["decision", "committee", "pending"] },
  { phrases: ["expiring certificates", "certifikati na isteku"], inject: ["certificate", "recertification", "expiring"] },
  { phrases: ["audit trail", "revizijski trag"], inject: ["audit", "structured"] },
];

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/gu, " ");
}

export function parseCommandQuery(raw: string): ParsedCommandQuery {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("course:")) {
    return { raw, text: normalize(trimmed.slice("course:".length)), shortcut: { kind: "course", rest: normalize(trimmed.slice("course:".length)) } };
  }
  if (lower.startsWith("cert:")) {
    return {
      raw,
      text: normalize(trimmed.slice("cert:".length)),
      shortcut: { kind: "cert", rest: normalize(trimmed.slice("cert:".length)) },
    };
  }
  if (lower.startsWith("risk:")) {
    return { raw, text: normalize(trimmed.slice("risk:".length)), shortcut: { kind: "risk", rest: normalize(trimmed.slice("risk:".length)) } };
  }
  if (lower.startsWith("capa:")) {
    return { raw, text: normalize(trimmed.slice("capa:".length)), shortcut: { kind: "capa", rest: normalize(trimmed.slice("capa:".length)) } };
  }
  if (lower.startsWith("user:")) {
    return { raw, text: normalize(trimmed.slice("user:".length)), shortcut: { kind: "user", rest: normalize(trimmed.slice("user:".length)) } };
  }
  const sc = (kind: NonNullable<ParsedCommandQuery["shortcut"]>["kind"], prefix: string) => {
    const pl = prefix.length;
    return { raw, text: normalize(trimmed.slice(pl)), shortcut: { kind, rest: normalize(trimmed.slice(pl)) } };
  };
  if (lower.startsWith("clause:")) return sc("clause", "clause:");
  if (lower.startsWith("standard:")) return sc("standard", "standard:");
  if (lower.startsWith("requirement:")) return sc("requirement", "requirement:");
  if (lower.startsWith("evidence:")) return sc("evidence", "evidence:");
  if (lower.startsWith("audit:")) return sc("audit", "audit:");
  return { raw, text: normalize(trimmed) };
}

function expandSemanticTokens(text: string): string[] {
  const base = normalize(text);
  if (!base) return [];
  const bag = new Set(base.split(" ").filter(Boolean));
  for (const rule of SEMANTIC_EXPANSIONS) {
    if (rule.phrases.some((p) => base.includes(p))) {
      for (const t of rule.inject) {
        bag.add(t);
      }
    }
  }
  for (const t of expandKnowledgeQueryTokens(base)) {
    bag.add(t);
  }
  return [...bag];
}

function workspacePriorityBonus(workspace: AppWorkspaceId, entity: CommandEntity): number {
  const bucket = entity.resultBucket ?? inferResultBucket(entity);
  if (bucket === "continuity") {
    if (workspace === "knowledge" || workspace === "governance") return 26;
    return 12;
  }
  if (workspace === "learning") {
    if (bucket === "learning") return 18;
    if (bucket === "certification") return 6;
  }
  if (workspace === "governance") {
    if (bucket === "governance") return 20;
    if (bucket === "certification") return 12;
    if (bucket === "knowledge") return 14;
    if (bucket === "learning") return 4;
  }
  if (workspace === "knowledge") {
    if (bucket === "knowledge") return 24;
    if (bucket === "governance") return 14;
    if (bucket === "certification") return 10;
    if (bucket === "operations") return 5;
    if (bucket === "learning") return 2;
  }
  if (workspace === "system") {
    if (bucket === "operations") return 22;
    if (bucket === "governance") return 8;
    if (bucket === "learning") return 3;
  }
  return 0;
}

function matchesShortcut(entity: CommandEntity, pq: ParsedCommandQuery): boolean {
  if (!pq.shortcut) return true;
  const r = pq.shortcut.rest;
  switch (pq.shortcut.kind) {
    case "course":
      if (!(entity.entityType === "course" || entity.route.includes("/courses"))) return false;
      return !r || entity.title.toLowerCase().includes(r) || entity.route.toLowerCase().includes(r);
    case "cert":
      if (
        !(
          entity.entityType === "certificate" ||
          entity.entityType === "application" ||
          entity.entityType === "scheme" ||
          entity.route.includes("certif") ||
          entity.route.includes("certificate") ||
          entity.route.includes("committee")
        )
      ) {
        return false;
      }
      return !r || entity.title.toLowerCase().includes(r) || entity.route.toLowerCase().includes(r);
    case "risk":
      if (!(entity.entityType === "risk" || entity.route.includes("/risks"))) return false;
      return !r || entity.title.toLowerCase().includes(r) || Boolean(entity.tags?.some((t) => t.toLowerCase().includes(r)));
    case "capa":
      if (!(entity.entityType === "capa" || entity.route.includes("/capa"))) return false;
      return !r || entity.title.toLowerCase().includes(r);
    case "user":
      if (!(entity.entityType === "user" || entity.route.includes("/users"))) return false;
      return !r || entity.title.toLowerCase().includes(r);
    case "clause":
    case "standard":
    case "requirement":
      if (entity.entityType !== "clause" && !entity.route.includes("/dashboard/knowledge")) return false;
      return (
        !r ||
        entity.title.toLowerCase().includes(r) ||
        entity.subtitle?.toLowerCase().includes(r) ||
        Boolean(entity.tags?.some((t) => t.toLowerCase().includes(r)))
      );
    case "evidence":
      if (!(entity.tags?.some((t) => t.includes("evidence")) || entity.route.includes("/knowledge"))) return false;
      return !r || entity.title.toLowerCase().includes(r);
    case "audit":
      if (!(entity.entityType === "audit_event" || entity.route.includes("/audit"))) return false;
      return !r || entity.title.toLowerCase().includes(r) || entity.route.toLowerCase().includes(r);
    default:
      return true;
  }
}

function textScore(entity: CommandEntity, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const hay = `${entity.title} ${entity.subtitle ?? ""} ${entity.route} ${(entity.tags ?? []).join(" ")} ${entity.entityType}`.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (t.length < 2) continue;
    if (hay.includes(t)) {
      score += t.length >= 4 ? 8 : 5;
    }
    if (entity.title.toLowerCase().startsWith(t)) {
      score += 6;
    }
  }
  return score;
}

export type RankedCommandEntity = {
  readonly entity: CommandEntity;
  readonly score: number;
};

export function rankCommandEntities(
  entities: readonly CommandEntity[],
  workspace: AppWorkspaceId,
  parsed: ParsedCommandQuery,
): RankedCommandEntity[] {
  const tokens = expandSemanticTokens(parsed.text);
  const shortcutScoped = parsed.shortcut ? entities.filter((e) => matchesShortcut(e, parsed)) : entities;
  const pool =
    parsed.shortcut && shortcutScoped.length === 0 ? entities : shortcutScoped.length ? shortcutScoped : entities;

  const ranked = pool.map((entity) => {
    const shortcutBoost = parsed.shortcut ? 25 : 0;
    const wsBonus = workspacePriorityBonus(workspace, entity);
    const ts = textScore(entity, parsed.shortcut ? expandSemanticTokens(parsed.shortcut.rest) : tokens);
    const statusBoost = entity.status ? 2 : 0;
    const score = ts + wsBonus + shortcutBoost + statusBoost;
    return { entity, score };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

export const GROUP_ORDER: CommandResultBucket[] = [
  "quick_actions",
  "continuity",
  "pinned",
  "recent",
  "ai",
  "learning",
  "certification",
  "governance",
  "knowledge",
  "operations",
];

export const GROUP_LABELS: Record<CommandResultBucket, string> = {
  quick_actions: "Brze akcije",
  continuity: "IA kontinuitet",
  pinned: "Prikvačeno",
  recent: "Nedavno",
  ai: "AI prijedlozi",
  learning: "Learning",
  certification: "Certifikacija",
  governance: "Governance",
  knowledge: "Standards / znanje",
  operations: "Operativno / sustav",
};

export function bucketRank(bucket: CommandResultBucket): number {
  const ix = GROUP_ORDER.indexOf(bucket);
  return ix >= 0 ? ix : GROUP_ORDER.length;
}

export function groupRankedResults(
  ranked: readonly RankedCommandEntity[],
  minScore: number,
): Map<CommandResultBucket, CommandEntity[]> {
  const map = new Map<CommandResultBucket, CommandEntity[]>();
  for (const { entity, score } of ranked) {
    if (score < minScore) continue;
    const bucket = entity.resultBucket ?? inferResultBucket(entity);
    const arr = map.get(bucket) ?? [];
    arr.push(entity);
    map.set(bucket, arr);
  }
  return map;
}

export function dedupeEntities(entities: readonly CommandEntity[]): CommandEntity[] {
  const seen = new Set<string>();
  const out: CommandEntity[] = [];
  for (const e of entities) {
    const k = `${e.entityType}::${e.route}::${e.title}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}

/** Jedinstveni redci po ruti — pinned/recent imaju prednost. */
export function mergeByRoutePreference(lists: readonly (readonly CommandEntity[])[]): CommandEntity[] {
  const seen = new Set<string>();
  const out: CommandEntity[] = [];
  for (const list of lists) {
    for (const e of list) {
      const r = e.route;
      if (seen.has(r)) continue;
      seen.add(r);
      out.push(e);
    }
  }
  return out;
}

export type CommandGroupModel = {
  readonly bucket: CommandResultBucket;
  readonly label: string;
  readonly entities: readonly CommandEntity[];
};

const LIMIT_EMPTY: Partial<Record<CommandResultBucket, number>> = {
  quick_actions: 14,
  continuity: 6,
  pinned: 12,
  recent: 12,
  learning: 10,
  certification: 10,
  governance: 10,
  knowledge: 12,
  operations: 12,
  ai: 6,
};

export function buildCommandGroups(
  queryDebounced: string,
  workspace: AppWorkspaceId,
  baseIndex: readonly CommandEntity[],
  recent: readonly CommandEntity[],
  pinned: readonly CommandEntity[],
  remote: readonly CommandEntity[],
): CommandGroupModel[] {
  const q = normalize(queryDebounced);
  if (!q) {
    const pool = mergeByRoutePreference([pinned, recent, dedupeEntities([...baseIndex, ...remote])]);
    const byBucket = new Map<CommandResultBucket, CommandEntity[]>();
    for (const e of pool) {
      const b = e.resultBucket ?? inferResultBucket(e);
      const list = byBucket.get(b) ?? [];
      list.push(e);
      byBucket.set(b, list);
    }
    return GROUP_ORDER.map((bucket) => {
      const lim = LIMIT_EMPTY[bucket] ?? 10;
      const entities = (byBucket.get(bucket) ?? []).slice(0, lim);
      return { bucket, label: GROUP_LABELS[bucket], entities };
    }).filter((g) => g.entities.length > 0);
  }

  const pool = dedupeEntities([...baseIndex, ...remote, ...recent, ...pinned]);
  const parsed = parseCommandQuery(queryDebounced);
  const ranked = rankCommandEntities(pool, workspace, parsed);
  const minScore = parsed.shortcut ? 1 : 5;
  const map = groupRankedResults(ranked, minScore);
  return GROUP_ORDER.map((bucket) => ({
    bucket,
    label: GROUP_LABELS[bucket],
    entities: map.get(bucket) ?? [],
  })).filter((g) => g.entities.length > 0);
}
