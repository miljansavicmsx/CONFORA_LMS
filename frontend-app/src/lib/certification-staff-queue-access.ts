/**
 * Usklađeno s backend `require_certification_applications_queue` i
 * `require_certification_decisions_reader` (DynamoDB uloga, bez Cognito prečica).
 */

/** P1-B5-1 staff reviewer queue roles (JWT / Nest profile aliases). */
const NEST_STAFF_QUEUE_ROLE_ALIASES: Readonly<Record<string, string>> = {
  com_cert: "cert_committee",
  staff_dir: "director",
  staff_sysadm: "sys_admin",
};

const QUEUE_FALLBACK =
  "cert_committee,admin,director,sys_admin,appeals_committee,com_cert,staff_dir,staff_sysadm";

const DECISION_READER_FALLBACK = "cert_committee,admin,director,sys_admin,appeals_committee";

function parseCsvEnv(value: string | undefined, fallback: string): Set<string> {
  const raw = (value ?? fallback).trim() || fallback;
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

function queueRoles(): Set<string> {
  return parseCsvEnv(import.meta.env.VITE_CERTIFICATION_QUEUE_ROLES, QUEUE_FALLBACK);
}

function decisionReaderRoles(): Set<string> {
  return parseCsvEnv(import.meta.env.VITE_CERTIFICATION_DECISION_READ_ROLES, DECISION_READER_FALLBACK);
}

export type CertificationStaffRoleInput = {
  readonly roleFromProfile: string | null | undefined;
};

function normRole(role: string | null | undefined): string {
  const raw = String(role ?? "")
    .trim()
    .toLowerCase();
  if (!raw) return "";
  return NEST_STAFF_QUEUE_ROLE_ALIASES[raw] ?? raw;
}

/** GET /api/certification/applications (legacy) | GET /v1/staff/certification/applications (Nest P1-B5-1). */
export function evaluateCertificationApplicationsQueueAccess(input: CertificationStaffRoleInput): boolean {
  const set = queueRoles();
  const r = normRole(input.roleFromProfile);
  return r.length > 0 && set.has(r);
}

/** Pregled formalnih cert odluka (IsoRouteGuard / decisions). */
export function evaluateCertificationDecisionsReaderAccess(input: CertificationStaffRoleInput): boolean {
  const set = decisionReaderRoles();
  const r = normRole(input.roleFromProfile);
  return r.length > 0 && set.has(r);
}
