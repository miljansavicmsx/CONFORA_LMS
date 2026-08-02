import type { CertificateRegistryRow, MyCertificateItem, VerifiedCertificatePublic } from "@/lib/api-certificates";

import type { EntityRelationship } from "./relationship-types";
import { EntityKind } from "./relationship-types";
import { dedupeEdges, mergeEdges } from "./relationship-utils";
import { transitionsFromStatus } from "./workflow-registry-client";

function mapCapaSourceToTargetType(sourceType: string): string {
  const u = sourceType.toUpperCase();
  if (u.includes("COMPLAINT")) return EntityKind.COMPLAINT;
  if (u.includes("RISK")) return EntityKind.RISK;
  if (u.includes("AUDIT") || u.includes("INSPECTION")) return EntityKind.AUDIT_EVENT;
  if (u.includes("MANAGEMENT") && u.includes("REVIEW")) return EntityKind.MANAGEMENT_REVIEW;
  if (u.includes("APPEAL")) return EntityKind.APPEAL;
  if (u.includes("IMPARTIALITY")) return EntityKind.IMPARTIALITY;
  return EntityKind.PROCESS;
}

/** Learner wallet — uses only fields already returned by `/api/certificates/my`. */
export function buildCertificateWalletRelationships(cert: MyCertificateItem): EntityRelationship[] {
  const rels: EntityRelationship[] = [];

  if (cert.qrHash) {
    rels.push({
      sourceId: cert.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: cert.qrHash,
      targetType: EntityKind.VERIFICATION_HASH,
      relationshipType: "EVIDENCE_FOR",
      label: "Javna provjera (hash)",
    });
  } else if (cert.learnerVerifyPath?.includes("/verify/")) {
    const h =
      cert.learnerVerifyPath
        .split("/verify/")[1]
        ?.split(/[/?#]/)[0]
        ?.trim() ?? "";
    if (h) {
      rels.push({
        sourceId: cert.certificateId,
        sourceType: EntityKind.CERTIFICATE,
        targetId: h,
        targetType: EntityKind.VERIFICATION_HASH,
        relationshipType: "GENERATED",
        label: "Learner verify ruta",
        metadata: { path: cert.learnerVerifyPath },
      });
    }
  }

  if (cert.courseName?.trim()) {
    const label = cert.courseName.trim();
    rels.push({
      sourceId: cert.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: label,
      targetType: EntityKind.COURSE,
      relationshipType: "RESULTED_IN",
      label: cert.credentialWalletCategory === "exam_pass" ? "Obuka / ispitni niz" : "Shema / obuka (meta)",
    });
  }

  if (cert.supersededByCertificateId) {
    rels.push({
      sourceId: cert.supersededByCertificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: cert.certificateId,
      targetType: EntityKind.CERTIFICATE,
      relationshipType: "SUPERSEDES",
      label: "Novi dokument zamjenjuje prethodni",
    });
  }

  const ls = cert.lifecycleStatus.toUpperCase();
  if (ls === "RECERTIFICATION_DUE" || ls === "UNDER_RECERTIFICATION_REVIEW") {
    rels.push({
      sourceId: cert.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: "recertification",
      targetType: EntityKind.PROCESS,
      relationshipType: "PART_OF",
      label: "Recertifikacijski ciklus",
      workflowState: ls,
    });
  }

  if (ls === "RENEWED") {
    rels.push({
      sourceId: cert.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: "renewal",
      targetType: EntityKind.PROCESS,
      relationshipType: "RENEWS",
      label: "Obnova valjanosti (novi dokument u novčaniku)",
    });
  }

  return dedupeEdges(rels);
}

export function buildRegistryCertificateRelationships(row: CertificateRegistryRow): EntityRelationship[] {
  const rels: EntityRelationship[] = [];

  if (row.linkedApplicationId?.trim()) {
    rels.push({
      sourceId: row.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: row.linkedApplicationId.trim(),
      targetType: EntityKind.APPLICATION,
      relationshipType: "CREATED_FROM",
      label: "Prijava / odluka",
    });
  }

  if (row.verificationHash?.trim()) {
    rels.push({
      sourceId: row.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: row.verificationHash.trim(),
      targetType: EntityKind.VERIFICATION_HASH,
      relationshipType: "GENERATED",
      label: "Javni verify hash",
    });
  }

  return dedupeEdges(rels);
}

export function buildPublicVerifyRelationships(
  data: VerifiedCertificatePublic,
  verificationHash: string,
): EntityRelationship[] {
  const rels: EntityRelationship[] = [];
  const hash = verificationHash.trim();
  if (hash) {
    rels.push({
      sourceId: data.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: hash,
      targetType: EntityKind.VERIFICATION_HASH,
      relationshipType: "EVIDENCE_FOR",
      label: "Digitalni trag ove javne provjere",
    });
  }
  if (data.courseName?.trim()) {
    rels.push({
      sourceId: data.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: data.courseName.trim(),
      targetType: EntityKind.COURSE,
      relationshipType: "RELATED_TO",
      label: "Povezana obuka / shema (meta-naziv)",
    });
  }
  const st = (data.effectiveStatus ?? data.status ?? "").toUpperCase();
  if (st) {
    rels.push({
      sourceId: data.certificateId,
      sourceType: EntityKind.CERTIFICATE,
      targetId: st,
      targetType: EntityKind.PROCESS,
      relationshipType: "PART_OF",
      label: "Životni ciklus u registru",
      workflowState: st,
    });
  }
  return dedupeEdges(rels);
}

export type CapaNonconformityInput = {
  nonconformityId: string;
  sourceType: string;
  sourceReferenceId?: string | null;
  title?: string;
  severity?: string;
};

export function buildCapaNonconformityRelationships(
  n: CapaNonconformityInput,
  actions?: readonly { capaId: string; actionType: string; status: string }[],
): EntityRelationship[] {
  const rels: EntityRelationship[] = [];
  const ref = n.sourceReferenceId?.trim();
  if (ref) {
    rels.push({
      sourceId: ref,
      sourceType: mapCapaSourceToTargetType(n.sourceType),
      targetId: n.nonconformityId,
      targetType: EntityKind.NONCONFORMITY,
      relationshipType: "TRIGGERED",
      ...(n.title ? { label: n.title } : {}),
      ...(n.severity ? { severity: n.severity } : {}),
      metadata: { capaSourceType: n.sourceType },
    });
  }

  for (const a of actions ?? []) {
    rels.push({
      sourceId: n.nonconformityId,
      sourceType: EntityKind.NONCONFORMITY,
      targetId: a.capaId,
      targetType: EntityKind.CAPA,
      relationshipType: "RESULTED_IN",
      label: `${a.actionType} · ${a.status}`,
    });
  }

  return dedupeEdges(rels);
}

export type IsoRiskInput = {
  riskId: string;
  title?: string;
  sourceType?: string;
  sourceReferenceId?: string | null;
  linkedCapaIds?: readonly string[] | null;
  linkedAuditEventIds?: readonly string[] | null;
};

export function buildRiskGovernanceRelationships(r: IsoRiskInput): EntityRelationship[] {
  const rels: EntityRelationship[] = [];
  const ref = r.sourceReferenceId?.trim();
  if (ref) {
    rels.push({
      sourceId: ref,
      sourceType: mapCapaSourceToTargetType(r.sourceType ?? "MANUAL"),
      targetId: r.riskId,
      targetType: EntityKind.RISK,
      relationshipType: "CREATED_FROM",
      ...(r.title ? { label: r.title } : {}),
    });
  }

  for (const capaId of r.linkedCapaIds ?? []) {
    const id = String(capaId).trim();
    if (!id) continue;
    rels.push({
      sourceId: r.riskId,
      sourceType: EntityKind.RISK,
      targetId: id,
      targetType: EntityKind.CAPA,
      relationshipType: "MITIGATES",
      label: "Povezan CAPA",
    });
  }

  for (const ev of r.linkedAuditEventIds ?? []) {
    const id = String(ev).trim();
    if (!id) continue;
    rels.push({
      sourceId: id,
      sourceType: EntityKind.AUDIT_EVENT,
      targetId: r.riskId,
      targetType: EntityKind.RISK,
      relationshipType: "EVIDENCE_FOR",
      label: "Audit referenca",
    });
  }

  return dedupeEdges(rels);
}

export type ManagementReviewInput = {
  reviewId: string;
  title?: string;
  status?: string;
  linkedCapaIds?: readonly string[] | null | undefined;
  linkedRiskIds?: readonly string[] | null | undefined;
};

export type ReviewInputRow = { inputId: string; title: string; inputType: string };
export type ReviewActionRow = { actionId: string; title: string; status: string };

export function buildManagementReviewTraceabilityRelationships(
  review: ManagementReviewInput,
  inputs?: readonly ReviewInputRow[],
  actions?: readonly ReviewActionRow[],
): EntityRelationship[] {
  const rels: EntityRelationship[] = [];

  for (const capaId of review.linkedCapaIds ?? []) {
    const id = String(capaId).trim();
    if (!id) continue;
    rels.push({
      sourceId: review.reviewId,
      sourceType: EntityKind.MANAGEMENT_REVIEW,
      targetId: id,
      targetType: EntityKind.CAPA,
      relationshipType: "REVIEWED_IN",
      label: "CAPA u opsegu pregleda",
    });
  }

  for (const riskId of review.linkedRiskIds ?? []) {
    const id = String(riskId).trim();
    if (!id) continue;
    rels.push({
      sourceId: review.reviewId,
      sourceType: EntityKind.MANAGEMENT_REVIEW,
      targetId: id,
      targetType: EntityKind.RISK,
      relationshipType: "REVIEWED_IN",
      label: "Rizik u opsegu pregleda",
    });
  }

  for (const i of inputs ?? []) {
    rels.push({
      sourceId: i.inputId,
      sourceType: EntityKind.REVIEW_INPUT,
      targetId: review.reviewId,
      targetType: EntityKind.MANAGEMENT_REVIEW,
      relationshipType: "PART_OF",
      label: `${i.inputType}: ${i.title}`,
    });
  }

  for (const a of actions ?? []) {
    rels.push({
      sourceId: review.reviewId,
      sourceType: EntityKind.MANAGEMENT_REVIEW,
      targetId: a.actionId,
      targetType: EntityKind.MANAGEMENT_ACTION,
      relationshipType: "RESULTED_IN",
      label: `${a.title} · ${a.status}`,
    });
  }

  if (review.status) {
    rels.push({
      sourceId: review.reviewId,
      sourceType: EntityKind.MANAGEMENT_REVIEW,
      targetId: review.status,
      targetType: EntityKind.WORKFLOW_STATE,
      relationshipType: "PART_OF",
      label: "Workflow status",
      workflowState: review.status,
    });
  }

  return dedupeEdges(rels);
}

export type ImpartialityRecordInput = {
  threatId: string;
  sourceReferenceId?: string | null;
  linkedRiskIds?: readonly string[] | null;
  linkedCapaIds?: readonly string[] | null;
  linkedAuditEventIds?: readonly string[] | null;
};

export function buildImpartialityRelationships(rec: ImpartialityRecordInput): EntityRelationship[] {
  const rels: EntityRelationship[] = [];
  const ref = rec.sourceReferenceId?.trim();
  if (ref) {
    rels.push({
      sourceId: ref,
      sourceType: EntityKind.PROCESS,
      targetId: rec.threatId,
      targetType: EntityKind.IMPARTIALITY,
      relationshipType: "ESCALATED_TO",
      label: "Izvor (referenca)",
    });
  }
  for (const rid of rec.linkedRiskIds ?? []) {
    const id = String(rid).trim();
    if (!id) continue;
    rels.push({
      sourceId: rec.threatId,
      sourceType: EntityKind.IMPARTIALITY,
      targetId: id,
      targetType: EntityKind.RISK,
      relationshipType: "RELATED_TO",
      label: "COI ↔ rizik",
    });
  }
  for (const cid of rec.linkedCapaIds ?? []) {
    const id = String(cid).trim();
    if (!id) continue;
    rels.push({
      sourceId: rec.threatId,
      sourceType: EntityKind.IMPARTIALITY,
      targetId: id,
      targetType: EntityKind.CAPA,
      relationshipType: "LINKED_TO",
      label: "COI ↔ CAPA",
    });
  }
  for (const eid of rec.linkedAuditEventIds ?? []) {
    const id = String(eid).trim();
    if (!id) continue;
    rels.push({
      sourceId: id,
      sourceType: EntityKind.AUDIT_EVENT,
      targetId: rec.threatId,
      targetType: EntityKind.IMPARTIALITY,
      relationshipType: "EVIDENCE_FOR",
    });
  }
  return dedupeEdges(rels);
}

export function buildAuditEvidenceChainRelationships(
  focal: { resourceId: string; resourceType: string },
  chain: readonly { eventId: string; action: string }[],
): EntityRelationship[] {
  const rels: EntityRelationship[] = [];
  for (const ev of chain) {
    rels.push({
      sourceId: ev.eventId,
      sourceType: EntityKind.AUDIT_EVENT,
      targetId: focal.resourceId,
      targetType: focal.resourceType,
      relationshipType: "EVIDENCE_FOR",
      label: ev.action,
    });
  }
  return dedupeEdges(rels);
}

export function buildWorkflowTransitionRelationships(
  resourceId: string,
  resourceEntityType: string,
  workflowType: string,
  currentStatus: string,
): EntityRelationship[] {
  const trs = transitionsFromStatus(workflowType, currentStatus);
  return trs.map(
    (tr): EntityRelationship => ({
      sourceId: resourceId,
      sourceType: resourceEntityType,
      targetId: `${workflowType}→${tr.to}::${tr.action}`,
      targetType: EntityKind.WORKFLOW_STATE,
      relationshipType: "PART_OF",
      label: `${tr.action}: ${tr.from} → ${tr.to}`,
      workflowState: tr.to,
      metadata: {
        workflowType,
        action: tr.action,
        businessCritical: tr.businessCritical,
        requiresSod: tr.requiresSod,
        reversible: tr.reversible,
        auditAction: tr.auditAction,
      },
    }),
  );
}

/** Aggregate NCR list for CAPA overview — bounded for performance. */
export function buildCapaModuleGraphEdges(
  ncrs: readonly CapaNonconformityInput[],
  actionsByNcr: Readonly<Record<string, readonly { capaId: string; actionType: string; status: string }[]>>,
  options?: { maxNcrs?: number },
): EntityRelationship[] {
  const max = options?.maxNcrs ?? 25;
  const slice = ncrs.slice(0, max);
  const groups = slice.map((n) => buildCapaNonconformityRelationships(n, actionsByNcr[n.nonconformityId]));
  return mergeEdges(...groups);
}

/** Explainer edges for `/verify` landing (trust UX, no payload). */
export function buildTrustNavigationExplainerEdges(): EntityRelationship[] {
  return [
    {
      sourceId: "learner",
      sourceType: EntityKind.PROCESS,
      targetId: "exam-pass",
      targetType: EntityKind.COURSE,
      relationshipType: "RESULTED_IN",
      label: "EXAM_PASS potvrda nakon ispita",
    },
    {
      sourceId: "committee",
      sourceType: EntityKind.PROCESS,
      targetId: "person-cert",
      targetType: EntityKind.CERTIFICATE,
      relationshipType: "APPROVED_BY",
      label: "PERSON_CERTIFICATION nakon odluke",
    },
    {
      sourceId: "person-cert",
      sourceType: EntityKind.CERTIFICATE,
      targetId: "verify-hash",
      targetType: EntityKind.VERIFICATION_HASH,
      relationshipType: "GENERATED",
      label: "Javni hash u /verify/{hash}",
    },
  ];
}
