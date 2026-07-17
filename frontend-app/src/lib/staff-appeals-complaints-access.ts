/**
 * APPEALS-COMPLAINTS-2 — Staff access to appeals & complaints resolution UX.
 * Learners / candidates must never access the staff route.
 */

export type StaffAppealsComplaintsAccessInput = {
  readonly roleFromProfile: string | null | undefined;
};

const STAFF_ROLES = new Set([
  "appeals_committee",
  "sys_admin",
  "admin",
  "director",
  "auditor",
  "quality_manager",
  "training_admin",
  "staff_dir",
  "staff_sysadm",
  "com_app",
  "com_imp",
  "com_cert",
]);

const LEARNER_ROLES = new Set(["candidate", "learner", "usr_cand", "usr_cert", "certified"]);

export function evaluateStaffAppealsComplaintsAccess(input: StaffAppealsComplaintsAccessInput): boolean {
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  if (!r || LEARNER_ROLES.has(r)) {
    return false;
  }
  return STAFF_ROLES.has(r);
}

export function isLearnerDeniedStaffAppealsComplaintsRoute(
  input: StaffAppealsComplaintsAccessInput,
): boolean {
  return !evaluateStaffAppealsComplaintsAccess(input);
}
