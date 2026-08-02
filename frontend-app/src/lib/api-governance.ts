/**
 * ISO 17024 — Certification & Governance API (FastAPI).
 * Koristi autenticirani Axios instance (`api`).
 */

import { getConforaApiConfig } from "@/lib/api/api-config";
import { resolveOwnerForPath } from "@/lib/api/endpoint-registry";
import { formatApiErrorMessage } from "@/lib/format-api-error";
import { api } from "@/lib/api";

/** Canonical Nest learner application reads (P1-B3-2). */
const NEST_APPLICATIONS_LIST_PATH = "/v1/me/certification/applications";
const NEST_APPLICATIONS_DETAIL_PATH = "/v1/me/certification/applications";
const NEST_APPLICATIONS_WRITE_PATH = "/v1/me/certification/applications";
/** Canonical Nest staff application reads (P1-B5-1). */
const NEST_STAFF_APPLICATIONS_PATH = "/v1/staff/certification/applications";
const LEGACY_APPLICATIONS_LIST_PATH = "/api/certification/my-applications";
const LEGACY_APPLICATIONS_DETAIL_PREFIX = "/api/certification/applications";
const LEGACY_STAFF_APPLICATIONS_PATH = "/api/certification/applications";
const LEGACY_DRAFT_CREATE_PATH = "/api/certification/draft";

type LearnerCertApplicationNextAction =
  | "COMPLETE_DRAFT"
  | "AWAIT_STAFF_REVIEW"
  | "AWAIT_VERIFIERS"
  | "AWAIT_COMMITTEE"
  | "PROVIDE_ADDITIONAL_INFO"
  | "VIEW_CERTIFICATE"
  | "FILE_APPEAL"
  | "NONE_TERMINAL"
  | "NONE_WITHDRAWN";

type LearnerCertApplicationReadItem = {
  readonly applicationId: string;
  readonly courseId: string | null;
  readonly schemeTitle: string;
  readonly status: ApplicationStatus;
  readonly submittedAt: string | null;
  readonly updatedAt: string;
  readonly nextAction: LearnerCertApplicationNextAction;
  readonly evidenceSummary: {
    readonly biographyProvided: boolean;
    readonly diplomaProvided: boolean;
    readonly publicWorksCount: number;
  };
  readonly eligibilitySummary: {
    readonly desiredScopeProvided: boolean;
    readonly overviewAcknowledged: boolean;
    readonly verifiersRecorded: number;
  };
  readonly publicVerifyPath: string | null;
};

type LearnerCertApplicationDetailItem = LearnerCertApplicationReadItem & {
  readonly desiredScopeText: string | null;
  readonly workExperience: string;
  readonly bioUrl: string | null;
  readonly diplomaUrl: string | null;
  readonly publicWorks: readonly string[];
  readonly referencePerson1: CertificationReferencePersonItem | null;
  readonly referencePerson2: CertificationReferencePersonItem | null;
  readonly editLocked: boolean;
  readonly overviewAcknowledgedAt: string | null;
};

type StaffCertApplicationReviewSegment =
  | "INBOX"
  | "IN_PROGRESS"
  | "COMMITTEE"
  | "CLOSED"
  | "OTHER";

type StaffCertApplicationQueueItem = {
  readonly applicationId: string;
  readonly schemeId: string;
  readonly schemeTitle: string;
  readonly courseId: string | null;
  readonly status: ApplicationStatus;
  readonly submittedAt: string | null;
  readonly updatedAt: string;
  readonly candidateReference: string;
  readonly reviewSegment: StaffCertApplicationReviewSegment;
  readonly scopeSummaryPreview: string | null;
  readonly evidenceSummary: {
    readonly biographyProvided: boolean;
    readonly diplomaProvided: boolean;
    readonly publicWorksCount: number;
  };
  readonly eligibilitySummary: {
    readonly desiredScopeProvided: boolean;
    readonly overviewAcknowledged: boolean;
    readonly verifiersRecorded: number;
  };
};

type StaffCertApplicationDetailItem = Omit<StaffCertApplicationQueueItem, "scopeSummaryPreview"> & {
  readonly desiredScopeText: string | null;
  readonly workExperience: string;
  readonly bioUrl: string | null;
  readonly diplomaUrl: string | null;
  readonly publicWorks: readonly string[];
  readonly referencePerson1: CertificationReferencePersonItem | null;
  readonly referencePerson2: CertificationReferencePersonItem | null;
  readonly overviewAcknowledgedAt: string | null;
  readonly decisionAt: string | null;
  readonly decisionRationale: string | null;
  readonly accommodationRequested: boolean;
};

export type StaffCertificationApplicationsListQuery = {
  readonly status?: string;
  readonly scheme?: string;
  readonly submitted_after?: string;
  readonly submitted_before?: string;
};

function resolveApplicationsListPath(): string {
  const provider = getConforaApiConfig().provider;
  if (provider === "legacy") return LEGACY_APPLICATIONS_LIST_PATH;
  if (provider === "nest") return NEST_APPLICATIONS_LIST_PATH;
  return resolveOwnerForPath(NEST_APPLICATIONS_LIST_PATH, "hybrid") === "nest"
    ? NEST_APPLICATIONS_LIST_PATH
    : LEGACY_APPLICATIONS_LIST_PATH;
}

function resolveApplicationDetailPath(applicationId: string): string {
  const id = encodeURIComponent(applicationId.trim());
  const provider = getConforaApiConfig().provider;
  if (provider === "legacy") {
    return `${LEGACY_APPLICATIONS_DETAIL_PREFIX}/${id}`;
  }
  if (provider === "nest") {
    return `${NEST_APPLICATIONS_DETAIL_PATH}/${id}`;
  }
  const nestPath = `${NEST_APPLICATIONS_DETAIL_PATH}/${id}`;
  return resolveOwnerForPath(nestPath, "hybrid") === "nest"
    ? nestPath
    : `${LEGACY_APPLICATIONS_DETAIL_PREFIX}/${id}`;
}

function resolveApplicationDraftCreatePath(): string {
  const provider = getConforaApiConfig().provider;
  if (provider === "legacy") return LEGACY_DRAFT_CREATE_PATH;
  if (provider === "nest") return NEST_APPLICATIONS_WRITE_PATH;
  return resolveOwnerForPath(NEST_APPLICATIONS_WRITE_PATH, "hybrid") === "nest"
    ? NEST_APPLICATIONS_WRITE_PATH
    : LEGACY_DRAFT_CREATE_PATH;
}

function resolveApplicationDraftPatchPath(applicationId: string): string {
  const id = encodeURIComponent(applicationId.trim());
  const provider = getConforaApiConfig().provider;
  if (provider === "legacy") {
    return `${LEGACY_APPLICATIONS_DETAIL_PREFIX}/${id}`;
  }
  if (provider === "nest") {
    return `${NEST_APPLICATIONS_WRITE_PATH}/${id}`;
  }
  const nestPath = `${NEST_APPLICATIONS_WRITE_PATH}/${id}`;
  return resolveOwnerForPath(nestPath, "hybrid") === "nest"
    ? nestPath
    : `${LEGACY_APPLICATIONS_DETAIL_PREFIX}/${id}`;
}

function resolveApplicationSubmitPath(applicationId: string): string {
  const id = encodeURIComponent(applicationId.trim());
  const provider = getConforaApiConfig().provider;
  const nestPath = `${NEST_APPLICATIONS_WRITE_PATH}/${id}/submit`;
  const legacyPath = `${LEGACY_APPLICATIONS_DETAIL_PREFIX}/${id}/submit`;
  if (provider === "legacy") return legacyPath;
  if (provider === "nest") return nestPath;
  return resolveOwnerForPath(nestPath, "hybrid") === "nest" ? nestPath : legacyPath;
}

function usesNestApplicationReads(path: string): boolean {
  return path.startsWith("/v1/me/certification/applications");
}

function usesNestApplicationWrites(path: string): boolean {
  return path.startsWith("/v1/me/certification/applications");
}

function resolveStaffApplicationsListPath(): string {
  const provider = getConforaApiConfig().provider;
  if (provider === "legacy") return LEGACY_STAFF_APPLICATIONS_PATH;
  if (provider === "nest") return NEST_STAFF_APPLICATIONS_PATH;
  return resolveOwnerForPath(NEST_STAFF_APPLICATIONS_PATH, "hybrid") === "nest"
    ? NEST_STAFF_APPLICATIONS_PATH
    : LEGACY_STAFF_APPLICATIONS_PATH;
}

function resolveStaffApplicationDetailPath(applicationId: string): string {
  const id = encodeURIComponent(applicationId.trim());
  const provider = getConforaApiConfig().provider;
  if (provider === "legacy") {
    return `${LEGACY_STAFF_APPLICATIONS_PATH}/${id}`;
  }
  if (provider === "nest") {
    return `${NEST_STAFF_APPLICATIONS_PATH}/${id}`;
  }
  const nestPath = `${NEST_STAFF_APPLICATIONS_PATH}/${id}`;
  return resolveOwnerForPath(nestPath, "hybrid") === "nest"
    ? nestPath
    : `${LEGACY_STAFF_APPLICATIONS_PATH}/${id}`;
}

function usesNestStaffApplicationReads(path: string): boolean {
  return path.startsWith("/v1/staff/certification/applications");
}

function buildStaffEvidenceEducationSummary(item: {
  readonly evidenceSummary: StaffCertApplicationQueueItem["evidenceSummary"];
}): string | null {
  const parts: string[] = [];
  if (item.evidenceSummary.biographyProvided) {
    parts.push("Biografija dostavljena");
  }
  if (item.evidenceSummary.diplomaProvided) {
    parts.push("Diploma dostavljena");
  }
  if (item.evidenceSummary.publicWorksCount > 0) {
    parts.push(`Javni radovi: ${item.evidenceSummary.publicWorksCount}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function mapNestStaffQueueItemToLegacy(
  item: StaffCertApplicationQueueItem,
): CertificationApplicationItem {
  return {
    applicationId: item.applicationId,
    userId: "",
    candidateReference: item.candidateReference,
    courseId: item.courseId ?? "",
    certificationSchemeId: item.schemeId,
    schemeTitle: item.schemeTitle,
    status: item.status,
    workExperience: item.scopeSummaryPreview ?? "",
    desiredScopeText: item.scopeSummaryPreview,
    updatedAt: item.updatedAt,
    reviewSegment: item.reviewSegment,
    accommodationRequested: false,
    educationSummary: buildStaffEvidenceEducationSummary(item),
  };
}

export function mapNestStaffDetailToLegacy(
  item: StaffCertApplicationDetailItem,
): CertificationApplicationItem {
  const base = mapNestStaffQueueItemToLegacy({
    ...item,
    scopeSummaryPreview: item.desiredScopeText?.trim()
      ? item.desiredScopeText.length > 120
        ? `${item.desiredScopeText.slice(0, 117)}...`
        : item.desiredScopeText
      : null,
  });
  return {
    ...base,
    workExperience: item.workExperience,
    desiredScopeText: item.desiredScopeText,
    bioUrl: item.bioUrl,
    diplomaUrl: item.diplomaUrl,
    biographyOrCv: item.bioUrl,
    publicWorks: [...item.publicWorks],
    publicProfileLinks: item.publicWorks.length > 0 ? item.publicWorks.join("\n") : null,
    referencePerson1: item.referencePerson1,
    referencePerson2: item.referencePerson2,
    overviewAcknowledgedAt: item.overviewAcknowledgedAt,
    additionalNotes: item.decisionRationale,
    accommodationRequested: item.accommodationRequested,
    educationSummary: buildStaffEvidenceEducationSummary(item),
    updatedAt: item.updatedAt,
  };
}

function mapNestDetailToLegacy(item: LearnerCertApplicationDetailItem): CertificationApplicationItem {
  const base = mapNestReadItemToLegacy(item);
  return {
    ...base,
    workExperience: item.workExperience,
    biographyOrCv: item.bioUrl,
    bioUrl: item.bioUrl,
    diplomaUrl: item.diplomaUrl,
    publicWorks: [...item.publicWorks],
    publicProfileLinks: item.publicWorks.length > 0 ? item.publicWorks.join("\n") : null,
    referencePerson1: item.referencePerson1,
    referencePerson2: item.referencePerson2,
    desiredScopeText: item.desiredScopeText,
    overviewAcknowledgedAt: item.overviewAcknowledgedAt,
    editLocked: item.editLocked,
  };
}

function isLearnerEditableApplicationStatus(status: string): boolean {
  const normalized = status.toUpperCase();
  return normalized === "DRAFT" || normalized === "ADDITIONAL_INFO_REQUIRED";
}

function mapNestReadItemToLegacy(item: LearnerCertApplicationReadItem): CertificationApplicationItem {
  return {
    applicationId: item.applicationId,
    userId: "",
    courseId: item.courseId ?? "",
    status: item.status,
    workExperience: "",
    editLocked: !isLearnerEditableApplicationStatus(item.status),
    updatedAt: item.updatedAt,
    desiredScopeText: item.eligibilitySummary.desiredScopeProvided ? item.schemeTitle : null,
  };
}

/** Usklađeno s backend ``ApplicationStatus`` (ISO 17024 prijava). */
export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "SCREENING"
  | "PENDING_REVIEW"
  | "UNDER_REVIEW"
  | "VERIFIERS_CONFIRMED"
  | "SENT_TO_COMMITTEE"
  | "AWAITING_MORE_INFO"
  | "REQUEST_INFO"
  | "RETURNED_FOR_MORE_INFO"
  | "APPROVED_FOR_DECISION"
  | "ELIGIBLE_FOR_DECISION"
  | "APPROVED"
  | "REJECTED_AT_APPLICATION_STAGE"
  | "WITHDRAWN"
  | "ARCHIVED"
  | "INELIGIBLE"
  | "REJECTED_AFTER_DECISION"
  | "REJECTED"
  | "APPEALED";

export type CommitteeDecision = "APPROVED" | "REJECTED";

/** Potvrđitelji iskustva (obrazac prijave). */
export interface CertificationReferencePersonItem {
  readonly fullName?: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly email: string;
  readonly relationship: string;
}

export interface CertificationApplicationItem {
  readonly applicationId: string;
  readonly userId: string;
  /** Pseudonymous staff queue reference (Nest P1-B5-1); replaces raw userId in staff UI. */
  readonly candidateReference?: string | null;
  readonly courseId: string;
  readonly tenantId?: string | null;
  readonly status: ApplicationStatus;
  readonly schemeTitle?: string | null;
  readonly reviewSegment?: StaffCertApplicationReviewSegment | null;
  /** Accommodation request indicator only — no free-text accommodation payload. */
  readonly accommodationRequested?: boolean | null;
  readonly applicantFullName?: string | null;
  readonly applicantEmail?: string | null;
  readonly phone?: string | null;
  readonly nationalId?: string | null;
  readonly jobTitle?: string | null;
  readonly company?: string | null;
  readonly yearsOfExperience?: number | null;
  readonly experienceSummary?: string | null;
  readonly candidateDeclarationAccepted?: boolean | null;
  readonly certificationAppealSubmittedAt?: string | null;
  readonly examPassCertificateId?: string | null;
  /** Izdani ISO 17024 certifikat osobe nakon odobrene odluke odbora. */
  readonly certificateId?: string | null;
  readonly certificationSchemeId?: string | null;
  readonly workExperience: string;
  readonly biographyOrCv?: string | null;
  readonly educationSummary?: string | null;
  readonly competencies?: string | null;
  readonly publicProfileLinks?: string | null;
  readonly supportingEvidenceKeys?: readonly string[] | null;
  readonly referencePerson1?: CertificationReferencePersonItem | null;
  readonly referencePerson2?: CertificationReferencePersonItem | null;
  readonly additionalNotes?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly decidedBy?: string | null;
  readonly decidedAt?: string | null;
  readonly coiCheck?: boolean | null;
  readonly decisionComment?: string | null;
  readonly editLocked?: boolean;
  readonly eligibilityComment?: string | null;
  readonly eligibilityDecision?: string | null;
  /** Postoji formalna odluka odbora (žalba ide na ``certificationDecisionId``). */
  readonly certificationDecisionId?: string | null;
  /** Backend postavlja nakon nepovoljne odluke — kandidat može podnijeti žalbu. */
  readonly appealEligible?: boolean | null;
  /** ISO §9.2 — audit-style timeline from API (Nest certification module). */
  readonly timeline?: readonly {
    readonly at: string;
    readonly fromStatus?: string;
    readonly toStatus: string;
    readonly label?: string;
    readonly actorSub?: string;
  }[];
  readonly desiredScopeText?: string | null;
  readonly overviewAcknowledgedAt?: string | null;
  readonly complianceSignature?: string | null;
  readonly bioUrl?: string | null;
  readonly diplomaUrl?: string | null;
  readonly publicWorks?: readonly string[] | null;
}

export interface CertificationDecidePayload {
  readonly coiCheck: boolean;
  readonly decision: CommitteeDecision;
  readonly comment: string;
}

export interface CertificationDecideResponse {
  readonly applicationId: string;
  readonly status: ApplicationStatus;
  readonly updatedAt: string;
}

export async function fetchStaffCertificationApplications(
  query?: StaffCertificationApplicationsListQuery,
): Promise<CertificationApplicationItem[]> {
  const path = resolveStaffApplicationsListPath();
  const params = query
    ? {
        ...(query.status ? { status: query.status } : {}),
        ...(query.scheme ? { scheme: query.scheme } : {}),
        ...(query.submitted_after ? { submitted_after: query.submitted_after } : {}),
        ...(query.submitted_before ? { submitted_before: query.submitted_before } : {}),
      }
    : undefined;

  if (usesNestStaffApplicationReads(path)) {
    const { data } = await api.get<{
      readonly contractVersion?: string;
      readonly items?: readonly StaffCertApplicationQueueItem[];
    }>(path, { params });
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.map(mapNestStaffQueueItemToLegacy);
  }

  const { data } = await api.get<CertificationApplicationItem[]>(path, { params });
  return Array.isArray(data) ? data : [];
}

export async function fetchStaffCertificationApplicationDetail(
  applicationId: string,
): Promise<CertificationApplicationItem> {
  const path = resolveStaffApplicationDetailPath(applicationId);
  if (usesNestStaffApplicationReads(path)) {
    const { data } = await api.get<{
      readonly contractVersion?: string;
      readonly item?: StaffCertApplicationDetailItem;
    }>(path);
    if (!data?.item) {
      throw new Error("Application not found");
    }
    return mapNestStaffDetailToLegacy(data.item);
  }
  const { data } = await api.get<CertificationApplicationItem>(path);
  return data;
}

/** Staff certification application queue (legacy FastAPI | Nest P1-B5-1). */
export async function fetchApplications(): Promise<CertificationApplicationItem[]> {
  return fetchStaffCertificationApplications();
}

/** Prijave prijavljenog kandidata (GET ``/api/certification/my-applications`` legacy | Nest B3-2 read). */
export async function fetchMyCertificationApplications(): Promise<CertificationApplicationItem[]> {
  const path = resolveApplicationsListPath();
  if (usesNestApplicationReads(path)) {
    const { data } = await api.get<{
      readonly contractVersion?: string;
      readonly items?: readonly LearnerCertApplicationReadItem[];
    }>(path);
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.map(mapNestReadItemToLegacy);
  }
  const { data } = await api.get<CertificationApplicationItem[]>(path);
  return Array.isArray(data) ? data : [];
}

export async function fetchCertificationApplication(applicationId: string): Promise<CertificationApplicationItem> {
  const path = resolveApplicationDetailPath(applicationId);
  if (usesNestApplicationReads(path)) {
    const { data } = await api.get<{
      readonly contractVersion?: string;
      readonly item?: LearnerCertApplicationDetailItem;
    }>(path);
    if (!data?.item) {
      throw new Error("Application not found");
    }
    return mapNestDetailToLegacy(data.item);
  }
  const { data } = await api.get<CertificationApplicationItem>(path);
  return data;
}

export async function patchCertificationApplication(
  applicationId: string,
  payload: Record<string, unknown>,
): Promise<CertificationApplicationItem> {
  const path = resolveApplicationDraftPatchPath(applicationId);
  if (usesNestApplicationWrites(path)) {
    const { data } = await api.patch<{
      readonly contractVersion?: string;
      readonly item?: LearnerCertApplicationDetailItem;
    }>(path, payload);
    if (!data?.item) {
      throw new Error("Application not found");
    }
    return mapNestDetailToLegacy(data.item);
  }
  const { data } = await api.patch<CertificationApplicationItem>(path, payload);
  return data;
}

export interface CertificationDraftPayload {
  readonly courseId: string;
  readonly workExperience: string;
  readonly biographyOrCv?: string | null;
  readonly educationSummary?: string | null;
  readonly competencies?: string | null;
  readonly publicProfileLinks?: string | null;
  readonly additionalNotes?: string | null;
  readonly applicationId?: string | null;
  /** ISO §9.2.1 — candidate confirmed overview before opening draft (Nest API). */
  readonly overviewAcknowledged?: boolean;
}

export interface CertificationDraftResponse {
  readonly applicationId: string;
  readonly status: ApplicationStatus;
  readonly createdAt: string;
}

function buildCertificationDraftRequestBody(
  payload: CertificationDraftPayload,
): Record<string, unknown> {
  return {
    courseId: payload.courseId.trim(),
    workExperience: payload.workExperience.trim(),
    biographyOrCv: payload.biographyOrCv?.trim() || undefined,
    educationSummary: payload.educationSummary ?? undefined,
    competencies: payload.competencies?.trim() || undefined,
    publicProfileLinks: payload.publicProfileLinks?.trim() || undefined,
    additionalNotes: payload.additionalNotes?.trim() || undefined,
    applicationId: payload.applicationId?.trim() || undefined,
    overviewAcknowledged: payload.overviewAcknowledged === true,
  };
}

/** Create or upsert learner draft (legacy POST /api/certification/draft | Nest B3-3b). */
export async function postCertificationDraft(
  payload: CertificationDraftPayload,
): Promise<CertificationDraftResponse> {
  const path = resolveApplicationDraftCreatePath();
  const body = buildCertificationDraftRequestBody(payload);
  if (usesNestApplicationWrites(path)) {
    const { data } = await api.post<{
      readonly contractVersion?: string;
      readonly item?: LearnerCertApplicationDetailItem;
    }>(path, body);
    if (!data?.item) {
      throw new Error("Draft create failed");
    }
    return {
      applicationId: data.item.applicationId,
      status: data.item.status,
      createdAt: data.item.updatedAt,
    };
  }
  const { data } = await api.post<CertificationDraftResponse>(path, body);
  return data;
}

export interface CertificationSubmitDraftResponse {
  readonly applicationId: string;
  readonly status: ApplicationStatus;
  readonly createdAt: string;
}

function buildCertificationSubmitRequestBody(
  usesNest: boolean,
  candidateDeclarationAccepted: boolean,
  complianceSignature?: string,
): Record<string, unknown> {
  const signature = complianceSignature?.trim() ?? "";
  if (usesNest) {
    return {
      candidateDeclarationAccepted: candidateDeclarationAccepted === true,
      complianceSignature: signature,
    };
  }
  return {
    submit: true,
    candidateDeclarationAccepted,
    ...(signature ? { complianceSignature: signature } : {}),
  };
}

function mapNestSubmitResponse(item: LearnerCertApplicationDetailItem): CertificationSubmitDraftResponse {
  return {
    applicationId: item.applicationId,
    status: item.status,
    createdAt: item.updatedAt,
  };
}

function rethrowSubmitClientError(err: unknown): never {
  throw new Error(formatApiErrorMessage(err));
}

/** Submit learner application (legacy POST …/submit | Nest P1-B4-b). */
export async function submitCertificationApplicationDraft(
  applicationId: string,
  candidateDeclarationAccepted: boolean,
  complianceSignature?: string,
): Promise<CertificationSubmitDraftResponse> {
  const path = resolveApplicationSubmitPath(applicationId);
  const usesNest = usesNestApplicationWrites(path);
  const body = buildCertificationSubmitRequestBody(
    usesNest,
    candidateDeclarationAccepted,
    complianceSignature,
  );

  try {
    if (usesNest) {
      const { data } = await api.post<{
        readonly contractVersion?: string;
        readonly item?: LearnerCertApplicationDetailItem;
      }>(path, body);
      if (!data?.item) {
        throw new Error("Submit failed");
      }
      return mapNestSubmitResponse(data.item);
    }

    const { data } = await api.post<CertificationSubmitDraftResponse>(path, body);
    return data;
  } catch (err) {
    rethrowSubmitClientError(err);
  }
}

export async function submitDecision(
  applicationId: string,
  payload: CertificationDecidePayload,
): Promise<CertificationDecideResponse> {
  const { data } = await api.post<CertificationDecideResponse>(
    `/api/certification/${encodeURIComponent(applicationId)}/decide`,
    {
      coiCheck: payload.coiCheck,
      decision: payload.decision,
      comment: payload.comment,
    },
  );
  return data;
}

// --- Governance ---

export type GovernanceLogType = "complaint" | "appeal" | "whistleblowing";

export type GovernanceLogStatus = "OPEN" | "IN_REVIEW" | "IN_PROGRESS" | "CLOSED";

export interface GovernanceLogSubmitPayload {
  readonly type: GovernanceLogType;
  readonly title: string;
  readonly description: string;
  readonly relatedCourseId?: string | null;
  readonly contactReference?: string | null;
}

export interface GovernanceLogCreateResponse {
  readonly logId: string;
  readonly type: GovernanceLogType;
  readonly status: GovernanceLogStatus;
  readonly createdAt: string;
}

/** Puni zapis iz GET /api/governance/logs */
export interface GovernanceLogListItem {
  readonly logId: string;
  readonly type: GovernanceLogType;
  readonly status: GovernanceLogStatus;
  readonly userId: string;
  readonly title: string;
  readonly description: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly relatedCourseId?: string | null;
  readonly contactReference?: string | null;
}

export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH";

export type RiskAiReviewStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type RiskAiReviewDecision = "approve" | "reject";

export interface GovernanceOrganizationRow {
  readonly organizationId: string;
  readonly legalName: string;
  readonly registrationNumber?: string | null;
  readonly country?: string | null;
  readonly createdAt?: string | null;
}

export interface GovernanceCommitteeMemberRow {
  readonly userId: string;
  readonly roleInCommittee: string;
  readonly active?: boolean;
  readonly appointedAt?: string | null;
}

export interface GovernanceCommitteeRow {
  readonly committeeId: string;
  readonly committeeType: string;
  readonly name: string;
  readonly status: string;
  readonly members: readonly GovernanceCommitteeMemberRow[];
  readonly createdAt?: string | null;
}

export interface RiskRegisterItem {
  readonly riskId: string;
  readonly status?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly owner?: string | null;
  readonly mitigationSummary?: string | null;
  readonly updatedAt?: string | null;
  /** AI-predložena stavka (čeka ljudski pregled prije konačnog prihvaćanja). */
  readonly isAiSuggested?: boolean;
  readonly aiReviewStatus?: RiskAiReviewStatus;
  /** 1 (niska) – 3 (visoka) */
  readonly likelihood: number;
  /** 1 (nizak) – 3 (visok) */
  readonly impact: number;
  /** likelihood × impact */
  readonly riskScore: number;
  readonly severity: RiskSeverity;
}

export interface RiskRegisterCreatePayload {
  readonly title: string;
  readonly description?: string | null;
  readonly likelihood: number;
  readonly impact: number;
  readonly status?: string | null;
  readonly category?: string | null;
  readonly owner?: string | null;
  readonly mitigationSummary?: string | null;
  /** Označava da je rizik predložen AI-jem — automatski ide u PENDING pregled. */
  readonly isAiSuggested?: boolean;
}

export interface RiskRegisterUpdatePayload {
  readonly title?: string;
  readonly description?: string | null;
  readonly likelihood?: number;
  readonly impact?: number;
  readonly status?: string | null;
  readonly category?: string | null;
  readonly owner?: string | null;
  readonly mitigationSummary?: string | null;
  readonly isAiSuggested?: boolean;
  readonly aiReviewStatus?: RiskAiReviewStatus;
}

export interface RiskRegisterListResponse {
  readonly risks: RiskRegisterItem[];
}

export async function fetchGovernanceDirectoryOrganizations(): Promise<readonly GovernanceOrganizationRow[]> {
  const { data } = await api.get<{ items: GovernanceOrganizationRow[] }>(
    "/api/governance/directory/organizations",
  );
  return data.items ?? [];
}

export async function fetchGovernanceDirectoryCommittees(): Promise<readonly GovernanceCommitteeRow[]> {
  const { data } = await api.get<{ items: GovernanceCommitteeRow[] }>(
    "/api/governance/directory/committees",
  );
  return data.items ?? [];
}

export async function fetchRisks(): Promise<RiskRegisterItem[]> {
  const { data } = await api.get<RiskRegisterListResponse>("/api/governance/risks");
  return data.risks ?? [];
}

export async function createRisk(payload: RiskRegisterCreatePayload): Promise<RiskRegisterItem> {
  const body: Record<string, string | number | boolean> = {
    title: payload.title,
    likelihood: payload.likelihood,
    impact: payload.impact,
  };
  if (payload.description?.trim()) body.description = payload.description.trim();
  if (payload.status?.trim()) body.status = payload.status.trim();
  if (payload.category?.trim()) body.category = payload.category.trim();
  if (payload.owner?.trim()) body.owner = payload.owner.trim();
  if (payload.mitigationSummary?.trim()) body.mitigationSummary = payload.mitigationSummary.trim();
  if (payload.isAiSuggested === true) body.isAiSuggested = true;
  const { data } = await api.post<RiskRegisterItem>("/api/governance/risks", body);
  return data;
}

export async function updateRisk(
  riskId: string,
  payload: RiskRegisterUpdatePayload,
): Promise<RiskRegisterItem> {
  const body: Record<string, string | number | boolean> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.description !== undefined) {
    if (payload.description?.trim()) body.description = payload.description.trim();
    else body.description = "";
  }
  if (payload.likelihood !== undefined) body.likelihood = payload.likelihood;
  if (payload.impact !== undefined) body.impact = payload.impact;
  if (payload.status !== undefined) {
    if (payload.status?.trim()) body.status = payload.status.trim();
  }
  if (payload.category !== undefined) {
    if (payload.category?.trim()) body.category = payload.category.trim();
  }
  if (payload.owner !== undefined) {
    if (payload.owner?.trim()) body.owner = payload.owner.trim();
  }
  if (payload.mitigationSummary !== undefined) {
    if (payload.mitigationSummary?.trim()) body.mitigationSummary = payload.mitigationSummary.trim();
  }
  if (payload.isAiSuggested !== undefined) body.isAiSuggested = payload.isAiSuggested;
  if (payload.aiReviewStatus !== undefined) body.aiReviewStatus = payload.aiReviewStatus;
  const { data } = await api.put<RiskRegisterItem>(
    `/api/governance/risks/${encodeURIComponent(riskId)}`,
    body,
  );
  return data;
}

export async function reviewRiskAiSuggestion(
  riskId: string,
  payload: { readonly decision: RiskAiReviewDecision; readonly note?: string | null },
): Promise<RiskRegisterItem> {
  const { data } = await api.post<RiskRegisterItem>(
    `/api/governance/risks/${encodeURIComponent(riskId)}/ai-review`,
    {
      decision: payload.decision,
      ...(payload.note?.trim() ? { note: payload.note.trim() } : {}),
    },
  );
  return data;
}

export async function fetchGovernanceLogs(): Promise<GovernanceLogListItem[]> {
  const { data } = await api.get<GovernanceLogListItem[]>("/api/governance/logs");
  return Array.isArray(data) ? data : [];
}

export async function submitGovernanceLog(
  payload: GovernanceLogSubmitPayload,
): Promise<GovernanceLogCreateResponse> {
  const body: Record<string, string> = {
    type: payload.type,
    title: payload.title,
    description: payload.description,
  };
  if (payload.relatedCourseId?.trim()) {
    body.relatedCourseId = payload.relatedCourseId.trim();
  }
  if (payload.contactReference?.trim()) {
    body.contactReference = payload.contactReference.trim();
  }
  const { data } = await api.post<GovernanceLogCreateResponse>("/api/governance/logs", body);
  return data;
}
