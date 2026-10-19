/**
 * Dotted permission ID-jevi (usklađeno s backend ``core.permissions`` i ``ROLE_PERMISSIONS``).
 * Jedini izvor stringova za `hasPermission` u UI sloju.
 */

export const PERM_CERTIFICATION_APPLICATION_READ = "certification.application.read";
export const PERM_CERTIFICATION_APPLICATION_REVIEW = "certification.application.review";
export const PERM_CERTIFICATION_APPLICATION_ASSIGN = "certification.application.assign";
export const PERM_CERTIFICATION_APPLICATION_APPROVE = "certification.application.approve";
export const PERM_CERTIFICATION_DECISION_VOTE = "certification.decision.vote";
export const PERM_CERTIFICATE_ISSUE = "certificate.issue";

export const PERM_AUDIT_READ = "audit.read";
export const PERM_AUDIT_EXPORT = "audit.export";
export const PERM_AUDIT_STRUCTURE_MANAGE = "audit.structure.manage";

export const PERM_GOVERNANCE_HUB_ACCESS = "governance.hub.access";

export const PERM_RISK_REGISTER_READ = "risk.register.read";
export const PERM_RISK_ACCEPT = "risk.accept";
export const PERM_CAPA_READ = "capa.case.read";
export const PERM_CAPA_WRITE = "capa.case.write";
export const PERM_IMPARTIALITY_READ = "impartiality.threat.read";
export const PERM_IMPARTIALITY_ACCEPT = "impartiality.threat.accept";
export const PERM_MANAGEMENT_REVIEW_READ = "management_review.read";
export const PERM_ISO_REPORT_READ = "iso.report.read";
export const PERM_DOCUMENT_CONTENT_READ = "documents.content.read";
export const PERM_CERTIFICATION_SCHEME_READ = "certification.scheme.read";
export const PERM_APPEAL_READ = "appeal.case.read";
export const PERM_APPEAL_DECISION = "appeal.decision.deliver";
export const PERM_COMPLAINT_MANAGE = "complaint.case.manage";
export const PERM_COMPETENCE_READ = "competence.profile.read";

export const PERM_SYSTEM_CONFIGURE = "system.configure";
export const PERM_TENANT_MANAGE = "tenant.manage";
export const PERM_FINANCE_RECORDS_READ = "finance.records.read";

export type MePermissionsPayload = {
  readonly primaryRole: string;
  readonly isoRole: string;
  readonly isoRoleLabel: string;
  readonly permissions: readonly string[];
  readonly tenantId: string | null;
  readonly blockedPermissions: readonly string[];
  readonly governanceCapabilities: readonly string[];
};

export const ALL_SIDEBAR_RELEVANT_PERMS = [
  PERM_CERTIFICATION_APPLICATION_READ,
  PERM_AUDIT_READ,
  PERM_AUDIT_STRUCTURE_MANAGE,
  PERM_GOVERNANCE_HUB_ACCESS,
  PERM_RISK_REGISTER_READ,
  PERM_CAPA_READ,
  PERM_ISO_REPORT_READ,
  PERM_CERTIFICATION_SCHEME_READ,
  PERM_COMPETENCE_READ,
  PERM_APPEAL_READ,
  PERM_SYSTEM_CONFIGURE,
] as const;
