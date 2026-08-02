import {
  buildAppealReason,
  buildLegacyAliasAppealBody,
  b14OutcomeToLegacyDisplay,
  DEFAULT_CERTIFICATION_APPEAL_TYPE,
  legacyOutcomeToB14,
} from "./appeals-category.util";
import { isAppealsCanonicalEnabled } from "./appeals-canonical-flag";
import type { AppealDetail, AppealListItem } from "./appeals-types";
import { type NormalizedApiError } from "./api-error";
import { getHttpClient } from "./http-client";

export const CANONICAL_LEARNER_APPEALS_PATH = "/v1/learner/appeals";
export const CANONICAL_STAFF_APPEALS_PATH = "/v1/staff/appeals";
export const LEGACY_ME_APPEALS_PATH = "/v1/me/appeals";
export const LEGACY_ADMIN_APPEALS_PATH = "/v1/admin/appeals";

type B14Summary = {
  readonly id: string;
  readonly appealType: string;
  readonly status: string;
  readonly submittedAt: string | null;
  readonly acknowledgedAt?: string | null;
  readonly voidedAt?: string | null;
  readonly requestedRemedy?: string | null;
  readonly certificateNumber?: string | null;
  readonly candidateReference: string;
  readonly appealReason?: string;
  readonly submittedEvidenceRefCount?: number;
  readonly relatedCertificationDecisionReviewId?: string | null;
  readonly relatedApplicationId?: string | null;
  readonly voidReason?: string | null;
};

function unwrapListPayload(data: unknown): readonly B14Summary[] {
  if (!data || typeof data !== "object") {
    return [];
  }
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.items)) {
    return o.items as B14Summary[];
  }
  if (Array.isArray(data)) {
    return data as B14Summary[];
  }
  return [];
}

function unwrapCasePayload(data: unknown): B14Summary | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const o = data as Record<string, unknown>;
  if (o.appeal && typeof o.appeal === "object") {
    return o.appeal as B14Summary;
  }
  if ("id" in o && "appealType" in o) {
    return o as B14Summary;
  }
  return null;
}

function splitAppealReason(reason: string): { summary: string; grounds: string } {
  const trimmed = reason.trim();
  if (!trimmed) {
    return { summary: "", grounds: "" };
  }
  const parts = trimmed.split(/\n\n/);
  if (parts.length >= 2) {
    return { summary: parts[0]!.trim(), grounds: parts.slice(1).join("\n\n").trim() };
  }
  const firstLine = trimmed.split("\n")[0]?.trim() ?? trimmed;
  return { summary: firstLine.slice(0, 200), grounds: trimmed };
}

function mapSummaryToListItem(row: B14Summary): AppealListItem {
  const reason = row.appealReason ?? row.requestedRemedy ?? "";
  const { summary, grounds } = splitAppealReason(reason);
  const submitted = row.submittedAt ?? "";
  const decisionRef =
    row.relatedCertificationDecisionReviewId?.trim() ||
    row.candidateReference?.trim() ||
    row.id;
  // Never fall back to raw appealType enum in learner-visible summary.
  const safeSummary = summary || (row.candidateReference ? `Žalba ${row.candidateReference}` : "Žalba");
  return {
    appealId: row.id,
    userId: "",
    certificationDecisionId: decisionRef,
    certificationApplicationId: row.relatedApplicationId ?? null,
    status: row.status,
    summary: safeSummary,
    grounds: grounds || reason,
    createdAt: submitted,
    updatedAt: row.acknowledgedAt ?? row.voidedAt ?? submitted,
    appealType: row.appealType,
    candidateReference: row.candidateReference,
    appealedObjectType: row.appealType,
    appealedObjectId: row.relatedCertificationDecisionReviewId ?? null,
  };
}

function mapCaseToDetail(row: B14Summary): AppealDetail {
  const base = mapSummaryToListItem(row);
  return {
    ...base,
    events: [],
    requestedRemedy: row.requestedRemedy ?? null,
    certificateNumber: row.certificateNumber ?? null,
    relatedCertificationDecisionReviewId: row.relatedCertificationDecisionReviewId ?? null,
  };
}

export async function listLearnerAppeals(): Promise<AppealListItem[]> {
  const client = getHttpClient();
  const path = isAppealsCanonicalEnabled() ? CANONICAL_LEARNER_APPEALS_PATH : LEGACY_ME_APPEALS_PATH;
  const { data } = await client.get<unknown>(path);
  return unwrapListPayload(data).map(mapSummaryToListItem);
}

export async function submitLearnerAppeal(body: {
  readonly certificationDecisionId: string;
  readonly summary: string;
  readonly grounds: string;
  readonly certificationApplicationId?: string;
  readonly appealType?: import("./appeals-types").AppealCaseType;
}): Promise<AppealListItem> {
  const client = getHttpClient();
  const appealType = body.appealType ?? DEFAULT_CERTIFICATION_APPEAL_TYPE;

  if (isAppealsCanonicalEnabled()) {
    const payload: Record<string, unknown> = {
      appealType,
      appealReason: buildAppealReason(body.summary, body.grounds),
    };
    const decisionId = body.certificationDecisionId.trim();
    if (decisionId) {
      payload.relatedCertificationDecisionReviewId = decisionId;
    }
    if (body.certificationApplicationId?.trim()) {
      payload.relatedApplicationId = body.certificationApplicationId.trim();
    }
    if (appealType === "ELIGIBILITY_APPEAL" && body.certificationApplicationId?.trim()) {
      // Eligibility appeals require eligibility review ref when available; application alone may fail standing.
      payload.relatedApplicationId = body.certificationApplicationId.trim();
    }
    const { data } = await client.post<unknown>(CANONICAL_LEARNER_APPEALS_PATH, payload);
    const row = unwrapCasePayload(data);
    if (!row) {
      throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
    }
    return mapSummaryToListItem(row);
  }

  const { data } = await client.post<unknown>(
    LEGACY_ME_APPEALS_PATH,
    buildLegacyAliasAppealBody(body),
  );
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
  }
  return mapSummaryToListItem(row);
}

export async function getLearnerAppeal(id: string): Promise<AppealDetail> {
  const client = getHttpClient();
  const path = isAppealsCanonicalEnabled()
    ? `${CANONICAL_LEARNER_APPEALS_PATH}/${encodeURIComponent(id.trim())}`
    : `${LEGACY_ME_APPEALS_PATH}/${encodeURIComponent(id.trim())}`;
  const { data } = await client.get<unknown>(path);
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 404, code: "NOT_FOUND", message: "NOT_FOUND" } satisfies NormalizedApiError;
  }
  return mapCaseToDetail(row);
}

export async function listStaffAppeals(): Promise<AppealListItem[]> {
  const client = getHttpClient();
  const path = isAppealsCanonicalEnabled() ? CANONICAL_STAFF_APPEALS_PATH : `${LEGACY_ADMIN_APPEALS_PATH}/board`;
  const { data } = await client.get<unknown>(path);
  return unwrapListPayload(data).map(mapSummaryToListItem);
}

export async function getStaffAppeal(id: string): Promise<AppealDetail> {
  const client = getHttpClient();
  const path = isAppealsCanonicalEnabled()
    ? `${CANONICAL_STAFF_APPEALS_PATH}/${encodeURIComponent(id.trim())}`
    : `${LEGACY_ADMIN_APPEALS_PATH}/${encodeURIComponent(id.trim())}`;
  const { data } = await client.get<unknown>(path);
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 404, code: "NOT_FOUND", message: "NOT_FOUND" } satisfies NormalizedApiError;
  }
  return mapCaseToDetail(row);
}

export async function acknowledgeAppeal(id: string): Promise<AppealDetail> {
  if (!isAppealsCanonicalEnabled()) {
    throw {
      status: 410,
      code: "HTTP_ERROR",
      message: "CANONICAL_APPEALS_REQUIRED",
    } satisfies NormalizedApiError;
  }
  const client = getHttpClient();
  const path = `${CANONICAL_STAFF_APPEALS_PATH}/${encodeURIComponent(id.trim())}/acknowledge`;
  const { data } = await client.post<unknown>(path, {});
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
  }
  return mapCaseToDetail(row);
}

export async function voidAppeal(id: string, voidReason: string): Promise<AppealDetail> {
  if (!isAppealsCanonicalEnabled()) {
    throw {
      status: 410,
      code: "HTTP_ERROR",
      message: "CANONICAL_APPEALS_REQUIRED",
    } satisfies NormalizedApiError;
  }
  const client = getHttpClient();
  const path = `${CANONICAL_STAFF_APPEALS_PATH}/${encodeURIComponent(id.trim())}/void`;
  const { data } = await client.post<unknown>(path, { voidReason: voidReason.trim() });
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
  }
  return mapCaseToDetail(row);
}

export async function startAppealDecision(id: string): Promise<void> {
  if (!isAppealsCanonicalEnabled()) {
    throw {
      status: 410,
      code: "HTTP_ERROR",
      message: "CANONICAL_APPEALS_REQUIRED",
    } satisfies NormalizedApiError;
  }
  const client = getHttpClient();
  const path = `${CANONICAL_STAFF_APPEALS_PATH}/${encodeURIComponent(id.trim())}/decision/start`;
  await client.post<unknown>(path, {});
}

export async function recordAppealDecision(
  id: string,
  body: {
    readonly outcome: "UPHELD" | "DISMISSED";
    readonly outcomeComment: string;
  },
): Promise<AppealDetail> {
  if (!isAppealsCanonicalEnabled()) {
    throw {
      status: 410,
      code: "HTTP_ERROR",
      message: "CANONICAL_APPEALS_REQUIRED",
    } satisfies NormalizedApiError;
  }
  const client = getHttpClient();
  const path = `${CANONICAL_STAFF_APPEALS_PATH}/${encodeURIComponent(id.trim())}/decision/outcome`;
  const { data } = await client.post<unknown>(path, {
    outcome: legacyOutcomeToB14(body.outcome),
    decisionReason: body.outcomeComment.trim(),
  });

  if (data && typeof data === "object" && "decisionReview" in (data as object)) {
    const review = (data as { decisionReview?: { outcome?: string; decisionReason?: string | null } })
      .decisionReview;
    const row = unwrapCasePayload(data);
    if (row) {
      const detail = mapCaseToDetail(row);
      return {
        ...detail,
        outcome: b14OutcomeToLegacyDisplay(review?.outcome) ?? review?.outcome ?? detail.outcome,
        outcomeComment: review?.decisionReason ?? body.outcomeComment,
      };
    }
  }

  const refreshed = await getStaffAppeal(id);
  return {
    ...refreshed,
    outcome: body.outcome,
    outcomeComment: body.outcomeComment,
  };
}
