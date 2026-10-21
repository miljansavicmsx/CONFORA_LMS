export const AI_DATA_CATEGORIES = [
  'dossier_facts',
  'case_summary',
  'experience_notes',
  'committee_slate',
  'notice_draft',
] as const;

export type AiDataCategory = (typeof AI_DATA_CATEGORIES)[number];

export const DEFAULT_AI_UNIT_LIMIT = 100_000;
export const DEFAULT_AI_COST_LIMIT_MINOR = 5_000;

export type AiBudgetRow = {
  unitLimit: number;
  unitsUsed: number;
  costLimitMinor: number;
  costUsedMinor: number;
};

export function isAiDataCategory(value: string): value is AiDataCategory {
  return (AI_DATA_CATEGORIES as readonly string[]).includes(value);
}

export function periodKey(now: Date): string {
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${String(now.getUTCFullYear())}-${month}`;
}

/** A period that has already reached either cap cannot start another use. */
export function budgetAllows(row: AiBudgetRow): boolean {
  return row.unitsUsed < row.unitLimit && row.costUsedMinor < row.costLimitMinor;
}
