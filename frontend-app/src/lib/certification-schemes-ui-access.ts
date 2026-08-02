/**
 * Usklađeno s backend `deps.require_certification_scheme_*` (CONFORA primarna uloga).
 * `admin` je certifikacijski menadžer (certification_manager) u ISO mapiranju.
 */

import type { CertificationSchemeStatusApi } from "@/lib/api-certification-schemes";

function norm(role: string): string {
  return String(role ?? "")
    .trim()
    .toLowerCase();
}

export function canReadCertificationSchemes(role: string): boolean {
  const r = norm(role);
  return (
    r === "cert_committee" ||
    r === "admin" ||
    r === "sys_admin" ||
    r === "director" ||
    r === "impartiality_committee" ||
    r === "quality_manager"
  );
}

/** Nacrt / izmjene / slanje na pregled. */
export function canDraftEditCertificationScheme(role: string): boolean {
  const r = norm(role);
  return r === "admin" || r === "quality_manager";
}

/** Formalno odobrenje dokumenta (certifikacijski odbor). */
export function canCommitteeApproveCertificationScheme(role: string): boolean {
  return norm(role) === "cert_committee";
}

/** Aktivacija u produkciju — top management (director) ili certification_manager (admin). */
export function canActivateCertificationScheme(role: string): boolean {
  const r = norm(role);
  return r === "director" || r === "admin";
}

export function canSuspendCertificationScheme(role: string): boolean {
  const r = norm(role);
  return r === "director" || r === "admin";
}

export function canArchiveCertificationScheme(role: string): boolean {
  return norm(role) === "director";
}

export function showSubmitReviewAction(role: string, status: CertificationSchemeStatusApi): boolean {
  return canDraftEditCertificationScheme(role) && status === "DRAFT";
}

export function showApproveAction(role: string, status: CertificationSchemeStatusApi): boolean {
  return canCommitteeApproveCertificationScheme(role) && status === "REVIEW";
}

export function showActivateAction(role: string, status: CertificationSchemeStatusApi): boolean {
  return canActivateCertificationScheme(role) && status === "APPROVED";
}

export function showArchiveAction(role: string, status: CertificationSchemeStatusApi): boolean {
  return canArchiveCertificationScheme(role) && status !== "ARCHIVED";
}

export function showEditForm(role: string, status: CertificationSchemeStatusApi): boolean {
  return canDraftEditCertificationScheme(role) && (status === "DRAFT" || status === "REVIEW");
}

/** sys_admin: pregled shema, bez poslovnih mutacija odobrenja/aktivacije. */
export function isSysAdminReadOnlyOnSchemes(role: string): boolean {
  return norm(role) === "sys_admin";
}
