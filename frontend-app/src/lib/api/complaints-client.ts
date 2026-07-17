import {
  buildComplaintSummary,
  caseCategoryToComplaintTargetType,
  caseCategoryToComplaintType,
  caseCategoryToLegacySubjectType,
} from "./complaints-category.util";
import { isComplaintsCanonicalEnabled } from "./complaints-canonical-flag";
import type {
  CaseCategory,
  ComplaintDetail,
  ComplaintListItem,
  PublicComplaintStatusResult,
  PublicComplaintSubmitResult,
} from "./complaints-types";
import { normalizeApiError, type NormalizedApiError } from "./api-error";
import { buildConforaApiUrl } from "./api-provider";
import { getHttpClient } from "./http-client";

export const CANONICAL_PUBLIC_COMPLAINTS_PATH = "/v1/public/complaints";
export const CANONICAL_LEARNER_COMPLAINTS_PATH = "/v1/learner/complaints";
export const CANONICAL_STAFF_COMPLAINTS_PATH = "/v1/staff/complaints";
export const LEGACY_ME_COMPLAINTS_PATH = "/v1/me/complaints";
export const LEGACY_ADMIN_COMPLAINTS_PATH = "/v1/admin/complaints";

type B15Summary = {
  readonly id: string;
  readonly publicReference: string;
  readonly complaintType: string;
  readonly complaintTargetType: string;
  readonly status: string;
  readonly submittedAt: string | null;
  readonly acknowledgedAt?: string | null;
  readonly voidedAt?: string | null;
  readonly requestedAction?: string | null;
  readonly certificateNumber?: string | null;
  readonly submittedEvidenceRefCount?: number;
  readonly intakeChannel?: string;
  readonly complaintSummary?: string;
  readonly isAnonymous?: boolean;
};

const PUBLIC_STATUS_KEYS = new Set(["publicReference", "status", "submittedAt", "nextStep"]);
const PUBLIC_SUBMIT_KEYS = new Set(["publicReference", "status"]);

function pickFields(data: unknown, allowed: ReadonlySet<string>): Record<string, unknown> {
  if (!data || typeof data !== "object") {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in (data as Record<string, unknown>)) {
      out[key] = (data as Record<string, unknown>)[key];
    }
  }
  return out;
}

function unwrapListPayload(data: unknown): readonly B15Summary[] {
  if (!data || typeof data !== "object") {
    return [];
  }
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.items)) {
    return o.items as B15Summary[];
  }
  if (Array.isArray(data)) {
    return data as B15Summary[];
  }
  return [];
}

function unwrapCasePayload(data: unknown): B15Summary | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const o = data as Record<string, unknown>;
  if (o.complaint && typeof o.complaint === "object") {
    return o.complaint as B15Summary;
  }
  if ("id" in o && "publicReference" in o) {
    return o as B15Summary;
  }
  return null;
}

function isRawComplaintEnumLabel(value: string): boolean {
  const v = value.trim().toUpperCase();
  return (
    v === "PROCESS_COMPLAINT" ||
    v === "TECHNICAL_SERVICE_COMPLAINT" ||
    v === "STAFF_CONDUCT_COMPLAINT" ||
    v === "OTHER_COMPLAINT" ||
    v === "COMPLAINT_SUBMITTED" ||
    /^[A-Z][A-Z0-9_]+_COMPLAINT$/.test(v)
  );
}

function mapSummaryToListItem(row: B15Summary): ComplaintListItem {
  const summary = row.complaintSummary ?? "";
  const fromSummary = summary.split("\n")[0]?.trim().slice(0, 120) ?? "";
  const fromAction = row.requestedAction?.trim()?.slice(0, 120) ?? "";
  // Prefer human complaintSummary subject. Never surface raw complaintType / enum-like requestedAction.
  const candidates = [fromSummary, fromAction].filter((v) => v && !isRawComplaintEnumLabel(v));
  const subject =
    candidates[0] ||
    (row.publicReference ? `Prigovor ${row.publicReference}` : "Prigovor");
  const submitted = row.submittedAt ?? "";
  return {
    complaintId: row.id,
    publicReference: row.publicReference,
    userId: "",
    category: row.complaintType,
    subject,
    description: summary,
    status: row.status,
    complaintType: row.complaintType,
    complaintTargetType: row.complaintTargetType,
    createdAt: submitted,
    updatedAt: row.acknowledgedAt ?? row.voidedAt ?? submitted,
  };
}

function mapCaseToDetail(row: B15Summary): ComplaintDetail {
  const base = mapSummaryToListItem(row);
  return {
    ...base,
    events: [],
    intakeChannel: row.intakeChannel ?? null,
    isAnonymous: row.isAnonymous,
  };
}

async function readFetchError(res: Response): Promise<NormalizedApiError> {
  let normalized: NormalizedApiError = {
    status: res.status,
    code: res.status === 404 ? "NOT_FOUND" : res.status === 409 ? "VALIDATION_ERROR" : "HTTP_ERROR",
    message: res.statusText || "HTTP_ERROR",
  };
  try {
    const body: unknown = await res.json();
    normalized = normalizeApiError({
      response: { status: res.status, data: body },
      isAxiosError: true,
    });
  } catch {
    /* non-JSON */
  }
  return normalized;
}

function publicHeaders(): HeadersInit {
  return { Accept: "application/json", "Content-Type": "application/json" };
}

export async function submitPublicComplaint(input: {
  readonly category: Exclude<CaseCategory, "appeal">;
  readonly subject: string;
  readonly description: string;
  readonly submitterName: string;
  readonly submitterEmail: string;
  readonly isAnonymous?: boolean;
}): Promise<PublicComplaintSubmitResult> {
  const body = {
    complaintType: caseCategoryToComplaintType(input.category),
    complaintTargetType: caseCategoryToComplaintTargetType(input.category),
    complaintSummary: buildComplaintSummary(input.subject, input.description),
    isAnonymous: input.isAnonymous ?? false,
    complainantName: input.isAnonymous ? undefined : input.submitterName.trim() || undefined,
    complainantContact: input.isAnonymous ? undefined : input.submitterEmail.trim() || undefined,
  };

  const res = await fetch(buildConforaApiUrl(CANONICAL_PUBLIC_COMPLAINTS_PATH), {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify(body),
    credentials: "omit",
  });

  if (!res.ok) {
    throw await readFetchError(res);
  }

  const data = pickFields(await res.json(), PUBLIC_SUBMIT_KEYS);
  const publicReference = typeof data.publicReference === "string" ? data.publicReference.trim() : "";
  if (!publicReference) {
    throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
  }
  return {
    publicReference,
    status: typeof data.status === "string" ? data.status : "SUBMITTED",
  };
}

export async function getPublicComplaintStatus(publicReference: string): Promise<PublicComplaintStatusResult> {
  const ref = publicReference.trim();
  if (!ref) {
    throw { status: 400, code: "VALIDATION_ERROR", message: "REFERENCE_REQUIRED" } satisfies NormalizedApiError;
  }

  const path = `${CANONICAL_PUBLIC_COMPLAINTS_PATH}/${encodeURIComponent(ref)}`;
  const res = await fetch(buildConforaApiUrl(path), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "omit",
  });

  if (res.status === 404) {
    throw { status: 404, code: "NOT_FOUND", message: "NOT_FOUND" } satisfies NormalizedApiError;
  }
  if (!res.ok) {
    throw await readFetchError(res);
  }

  const data = pickFields(await res.json(), PUBLIC_STATUS_KEYS);
  const outRef = typeof data.publicReference === "string" ? data.publicReference.trim() : "";
  if (!outRef) {
    throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
  }
  return {
    publicReference: outRef,
    status: typeof data.status === "string" ? data.status : "UNKNOWN",
    submittedAt: typeof data.submittedAt === "string" ? data.submittedAt : null,
    nextStep: typeof data.nextStep === "string" ? data.nextStep : "",
  };
}

export async function listLearnerComplaints(): Promise<ComplaintListItem[]> {
  const client = getHttpClient();
  const path = isComplaintsCanonicalEnabled() ? CANONICAL_LEARNER_COMPLAINTS_PATH : LEGACY_ME_COMPLAINTS_PATH;
  const { data } = await client.get<unknown>(path);
  return unwrapListPayload(data).map(mapSummaryToListItem);
}

export async function submitLearnerComplaint(body: {
  readonly category: Exclude<CaseCategory, "appeal">;
  readonly subject: string;
  readonly description: string;
  readonly certificationApplicationId?: string;
  readonly certificationDecisionId?: string;
  readonly certificateId?: string;
}): Promise<ComplaintListItem> {
  const client = getHttpClient();

  if (isComplaintsCanonicalEnabled()) {
    const payload: Record<string, unknown> = {
      complaintType: caseCategoryToComplaintType(body.category),
      complaintTargetType: caseCategoryToComplaintTargetType(body.category),
      complaintSummary: buildComplaintSummary(body.subject, body.description),
    };
    if (body.certificationApplicationId?.trim()) {
      payload.relatedApplicationId = body.certificationApplicationId.trim();
    }
    if (body.certificateId?.trim()) {
      payload.relatedCertificateId = body.certificateId.trim();
    }
    const { data } = await client.post<unknown>(CANONICAL_LEARNER_COMPLAINTS_PATH, payload);
    const row = unwrapCasePayload(data);
    if (!row) {
      throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
    }
    return mapSummaryToListItem(row);
  }

  const { data } = await client.post<unknown>(LEGACY_ME_COMPLAINTS_PATH, {
    subjectLine: body.subject.trim(),
    description: body.description.trim(),
    subjectType: caseCategoryToLegacySubjectType(body.category),
  });
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
  }
  return mapSummaryToListItem(row);
}

export async function getLearnerComplaint(id: string): Promise<ComplaintDetail> {
  const client = getHttpClient();
  const path = isComplaintsCanonicalEnabled()
    ? `${CANONICAL_LEARNER_COMPLAINTS_PATH}/${encodeURIComponent(id.trim())}`
    : `${LEGACY_ME_COMPLAINTS_PATH}/${encodeURIComponent(id.trim())}`;
  const { data } = await client.get<unknown>(path);
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 404, code: "NOT_FOUND", message: "NOT_FOUND" } satisfies NormalizedApiError;
  }
  return mapCaseToDetail(row);
}

export async function listStaffComplaints(): Promise<ComplaintListItem[]> {
  const client = getHttpClient();
  const path = isComplaintsCanonicalEnabled() ? CANONICAL_STAFF_COMPLAINTS_PATH : LEGACY_ADMIN_COMPLAINTS_PATH;
  const { data } = await client.get<unknown>(path);
  return unwrapListPayload(data).map(mapSummaryToListItem);
}

export async function getStaffComplaint(id: string): Promise<ComplaintDetail> {
  const client = getHttpClient();
  const path = isComplaintsCanonicalEnabled()
    ? `${CANONICAL_STAFF_COMPLAINTS_PATH}/${encodeURIComponent(id.trim())}`
    : `${LEGACY_ADMIN_COMPLAINTS_PATH}/${encodeURIComponent(id.trim())}`;
  const { data } = await client.get<unknown>(path);
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 404, code: "NOT_FOUND", message: "NOT_FOUND" } satisfies NormalizedApiError;
  }
  return mapCaseToDetail(row);
}

export async function acknowledgeComplaint(id: string): Promise<ComplaintDetail> {
  if (!isComplaintsCanonicalEnabled()) {
    throw {
      status: 410,
      code: "HTTP_ERROR",
      message: "CANONICAL_COMPLAINTS_REQUIRED",
    } satisfies NormalizedApiError;
  }
  const client = getHttpClient();
  const path = `${CANONICAL_STAFF_COMPLAINTS_PATH}/${encodeURIComponent(id.trim())}/acknowledge`;
  const { data } = await client.post<unknown>(path, {});
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
  }
  return mapCaseToDetail(row);
}

export async function voidComplaint(id: string, voidReason: string): Promise<ComplaintDetail> {
  if (!isComplaintsCanonicalEnabled()) {
    throw {
      status: 410,
      code: "HTTP_ERROR",
      message: "CANONICAL_COMPLAINTS_REQUIRED",
    } satisfies NormalizedApiError;
  }
  const client = getHttpClient();
  const path = `${CANONICAL_STAFF_COMPLAINTS_PATH}/${encodeURIComponent(id.trim())}/void`;
  const { data } = await client.post<unknown>(path, { voidReason: voidReason.trim() });
  const row = unwrapCasePayload(data);
  if (!row) {
    throw { status: 502, code: "HTTP_ERROR", message: "INVALID_RESPONSE" } satisfies NormalizedApiError;
  }
  return mapCaseToDetail(row);
}
