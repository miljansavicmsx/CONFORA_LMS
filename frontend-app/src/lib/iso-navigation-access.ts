/**
 * ISO/IEC 17024 — vidljivost navigacije i guardova po ulogama (DynamoDB `role` + Cognito grupe).
 * Uloge su snake_case kao u backend profilu.
 * Za akcije na pojedinačnim resursima (read-only, tooltip, strogi odbor) koristi ``@/lib/abac`` uz isti permissions snapshot.
 */

import { evaluateAppealsCommitteeAccess } from "@/lib/appeals-committee-access";
import {
  evaluateCertificationApplicationsQueueAccess,
  evaluateCertificationDecisionsReaderAccess,
} from "@/lib/certification-staff-queue-access";
import { evaluateCertificationDashboardAccess } from "@/lib/certification-committee-access";
import { evaluateCurriculumItemBankAccess } from "@/lib/content-editor-access";
import { evaluateGovernanceAccess } from "@/lib/governance-access";
import { hasPermission } from "@/lib/authorization";
import type { MePermissionsPayload } from "@/lib/permissions";
import {
  PERM_AUDIT_READ,
  PERM_CERTIFICATION_SCHEME_READ,
  PERM_CAPA_READ,
  PERM_COMPETENCE_READ,
  PERM_GOVERNANCE_HUB_ACCESS,
  PERM_ISO_REPORT_READ,
  PERM_RISK_REGISTER_READ,
  PERM_SYSTEM_CONFIGURE,
} from "@/lib/permissions";
import { evaluateSysAdminAccess } from "@/lib/sys-admin-access";

export type IsoNavContext = {
  readonly role: string;
  readonly cognitoGroups: readonly string[];
  /** Snapshot iz ``GET /api/auth/me/permissions`` (opcionalno; kad postoji ima prednost za governance polja). */
  readonly permissionsSnapshot?: MePermissionsPayload | null;
};

function normRole(role: string | null | undefined): string {
  return String(role ?? "")
    .trim()
    .toLowerCase();
}

/** Kandidat za certifikaciju (learner u katalogu). */
export function isCertificationCandidate(ctx: IsoNavContext): boolean {
  const r = normRole(ctx.role);
  return r === "learner" || r === "candidate";
}

export function isTrainingAdmin(ctx: IsoNavContext): boolean {
  return evaluateCurriculumItemBankAccess({
    cognitoGroups: ctx.cognitoGroups,
    roleFromProfile: ctx.role,
  });
}

/** Operativna certifikacija: odbor + uprava (bez čistog kurikuluma ako nije i cert). */
export function isCertificationOperator(ctx: IsoNavContext): boolean {
  return evaluateCertificationDashboardAccess({
    cognitoGroups: ctx.cognitoGroups,
    roleFromProfile: ctx.role,
  });
}

function hasRole(ctx: IsoNavContext, ...roles: string[]): boolean {
  const r = normRole(ctx.role);
  return roles.includes(r);
}

export function isTechnicalCommitteeMember(ctx: IsoNavContext): boolean {
  return hasRole(ctx, "tech_committee");
}

export function isCertificationCommitteeMember(ctx: IsoNavContext): boolean {
  return hasRole(ctx, "cert_committee");
}

export function isAppealsCommitteeMember(ctx: IsoNavContext): boolean {
  return evaluateAppealsCommitteeAccess({ roleFromProfile: ctx.role });
}

export function isImpartialityCommitteeMember(ctx: IsoNavContext): boolean {
  return hasRole(ctx, "impartiality_committee");
}

export function isAuditor(ctx: IsoNavContext): boolean {
  return hasRole(ctx, "auditor");
}

export function isDirector(ctx: IsoNavContext): boolean {
  return hasRole(ctx, "director");
}

export function isSysAdmin(ctx: IsoNavContext): boolean {
  const fb = evaluateSysAdminAccess({ roleFromProfile: ctx.role });
  return hasPermission(ctx.permissionsSnapshot, PERM_SYSTEM_CONFIGURE, fb);
}

export function isPlatformAdmin(ctx: IsoNavContext): boolean {
  return hasRole(ctx, "admin");
}

export function isQualityManager(ctx: IsoNavContext): boolean {
  return hasRole(ctx, "quality_manager");
}

/** Certifikacijske sheme — tehnički + certifikacijski odbor i uprava. */
export function canAccessCertificationSchemes(ctx: IsoNavContext): boolean {
  const legacy =
    isQualityManager(ctx) ||
    isSysAdmin(ctx) ||
    isPlatformAdmin(ctx) ||
    isDirector(ctx) ||
    isTechnicalCommitteeMember(ctx) ||
    isCertificationCommitteeMember(ctx) ||
    (isCertificationOperator(ctx) && !isCertificationCandidate(ctx));
  return hasPermission(ctx.permissionsSnapshot, PERM_CERTIFICATION_SCHEME_READ, legacy);
}

/**
 * Staff red prijava (GET `/api/certification/applications`) — kao backend `require_certification_applications_queue`.
 * Kandidat vidi vlastiti tijek (/certification).
 */
export function canAccessCertificationApplicationsNav(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx)) {
    return true;
  }
  return evaluateCertificationApplicationsQueueAccess({ roleFromProfile: ctx.role });
}

/**
 * Formalne cert odluke (čitanje) — kao `require_certification_decisions_reader` (bez tech_committee).
 */
export function canAccessCertificationDecisions(ctx: IsoNavContext): boolean {
  if (isTechnicalCommitteeMember(ctx)) {
    return false;
  }
  return evaluateCertificationDecisionsReaderAccess({ roleFromProfile: ctx.role });
}

/**
 * Registar izdanih certifikata / izdavanje — kao `_CERTIFICATE_ISSUER_ROLES` + Cognito bypass u `require_certificate_issuer`.
 */
export function canAccessCertificatesRegistry(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx)) {
    return false;
  }
  if (isTechnicalCommitteeMember(ctx)) {
    return false;
  }
  if (isDirector(ctx)) {
    return true;
  }
  return evaluateCertificationDashboardAccess({
    cognitoGroups: ctx.cognitoGroups,
    roleFromProfile: ctx.role,
  });
}

/** Žalbe na odluke — odbor za žalbe; uprava i sustav za nadzor (AppealsCommitteeGuard ostaje izvor istine za API). */
export function canAccessAppealsDomain(ctx: IsoNavContext): boolean {
  if (isSysAdmin(ctx) || isPlatformAdmin(ctx) || isDirector(ctx)) {
    return true;
  }
  return isAppealsCommitteeMember(ctx);
}

/** Pritužbe (proces / usluga) — širi krug + kandidat (podnošenje). */
export function canAccessComplaintsDomain(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx)) {
    return true;
  }
  if (isSysAdmin(ctx) || isPlatformAdmin(ctx) || isDirector(ctx)) {
    return true;
  }
  if (isAppealsCommitteeMember(ctx)) {
    return true;
  }
  if (isTrainingAdmin(ctx)) {
    return true;
  }
  if (isAuditor(ctx)) {
    return true;
  }
  if (isQualityManager(ctx)) {
    return true;
  }
  return false;
}

/** Governance / rizici — postojeći guard + nezavisnost + uprava. */
export function canAccessGovernanceDomain(ctx: IsoNavContext): boolean {
  const legacy =
    isQualityManager(ctx) ||
    isImpartialityCommitteeMember(ctx) ||
    isDirector(ctx) ||
    evaluateGovernanceAccess({
      cognitoGroups: ctx.cognitoGroups,
      roleFromProfile: ctx.role,
    });
  return hasPermission(ctx.permissionsSnapshot, PERM_GOVERNANCE_HUB_ACCESS, legacy);
}

/** Izvještaji i metrike — uprava, revizija, odbori (ne čisti kandidat). */
export function canAccessReportsDomain(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx)) {
    return false;
  }
  const legacy =
    isSysAdmin(ctx) ||
    isPlatformAdmin(ctx) ||
    isDirector(ctx) ||
    isAuditor(ctx) ||
    isTrainingAdmin(ctx) ||
    isCertificationCommitteeMember(ctx) ||
    isTechnicalCommitteeMember(ctx) ||
    isImpartialityCommitteeMember(ctx) ||
    isAppealsCommitteeMember(ctx) ||
    isQualityManager(ctx);
  return hasPermission(ctx.permissionsSnapshot, PERM_ISO_REPORT_READ, legacy);
}

/** ISO 17024 — CAPA / neusaglašenosti (interne ISO uloge + certification_manager + impartiality). */
export function canAccessCapaManagement(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx)) {
    return false;
  }
  const legacy =
    isSysAdmin(ctx) ||
    isDirector(ctx) ||
    isAuditor(ctx) ||
    isQualityManager(ctx) ||
    isPlatformAdmin(ctx) ||
    isImpartialityCommitteeMember(ctx) ||
    normRole(ctx.role) === "certification_manager";
  return hasPermission(ctx.permissionsSnapshot, PERM_CAPA_READ, legacy);
}

/** ISO 17024 — formalni registar rizika (isti krug kao CAPA čitanje + certification_manager). */
export function canAccessRiskManagement(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx)) {
    return false;
  }
  const legacy =
    isSysAdmin(ctx) ||
    isDirector(ctx) ||
    isAuditor(ctx) ||
    isQualityManager(ctx) ||
    isPlatformAdmin(ctx) ||
    isImpartialityCommitteeMember(ctx) ||
    normRole(ctx.role) === "certification_manager";
  return hasPermission(ctx.permissionsSnapshot, PERM_RISK_REGISTER_READ, legacy);
}

/** ISO 17024 — upravljanje kompetencijama (QM, certification_manager, interni auditor pregled). */
export function canAccessCompetenceManagement(ctx: IsoNavContext): boolean {
  const legacy = isQualityManager(ctx) || isPlatformAdmin(ctx) || isAuditor(ctx);
  return hasPermission(ctx.permissionsSnapshot, PERM_COMPETENCE_READ, legacy);
}

/** ISO 17024 — strukturirani audit trail (`/api/admin/audit`). */
export function canAccessIsoAudit(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx)) {
    return false;
  }
  const legacy =
    isSysAdmin(ctx) ||
    isDirector(ctx) ||
    isAuditor(ctx) ||
    isQualityManager(ctx) ||
    isPlatformAdmin(ctx) ||
    normRole(ctx.role) === "certification_manager";
  return hasPermission(ctx.permissionsSnapshot, PERM_AUDIT_READ, legacy);
}

/** Accreditation / compliance OS — orchestration workspace (ne pravni motor). */
export function canAccessComplianceWorkspace(ctx: IsoNavContext): boolean {
  if (isCertificationCandidate(ctx)) {
    return false;
  }
  const legacy =
    isQualityManager(ctx) ||
    isDirector(ctx) ||
    isAuditor(ctx) ||
    isSysAdmin(ctx) ||
    isPlatformAdmin(ctx) ||
    isCertificationCommitteeMember(ctx) ||
    isImpartialityCommitteeMember(ctx) ||
    normRole(ctx.role) === "certification_manager";
  return hasPermission(ctx.permissionsSnapshot, PERM_GOVERNANCE_HUB_ACCESS, legacy);
}

/** Standards / knowledge intelligence workspace — ista politika pristupa kao Compliance OS (orchestracija, ne motor). */
export function canAccessKnowledgeWorkspace(ctx: IsoNavContext): boolean {
  return canAccessComplianceWorkspace(ctx);
}

/** Ima li korisnik barem jednu stavku u ISO 17024 izborniku. */
export function hasAnyIsoNavVisibility(ctx: IsoNavContext): boolean {
  return (
    canAccessCertificationSchemes(ctx) ||
    canAccessCertificationApplicationsNav(ctx) ||
    canAccessCertificationDecisions(ctx) ||
    canAccessCertificatesRegistry(ctx) ||
    canAccessAppealsDomain(ctx) ||
    canAccessComplaintsDomain(ctx) ||
    canAccessGovernanceDomain(ctx) ||
    canAccessComplianceWorkspace(ctx) ||
    canAccessKnowledgeWorkspace(ctx) ||
    canAccessReportsDomain(ctx) ||
    canAccessCompetenceManagement(ctx) ||
    canAccessCapaManagement(ctx) ||
    canAccessIsoAudit(ctx)
  );
}
