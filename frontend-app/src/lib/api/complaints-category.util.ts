import type { CaseCategory, ComplaintCaseType, ComplaintTargetType } from "./complaints-types";

export function caseCategoryToComplaintType(category: Exclude<CaseCategory, "appeal">): ComplaintCaseType {
  switch (category) {
    case "technical_support":
      return "TECHNICAL_SERVICE_COMPLAINT";
    case "complaint":
      return "PROCESS_COMPLAINT";
    case "improvement_proposal":
    case "training_proposal":
      return "OTHER_COMPLAINT";
    default:
      return "PROCESS_COMPLAINT";
  }
}

export function caseCategoryToComplaintTargetType(category: Exclude<CaseCategory, "appeal">): ComplaintTargetType {
  switch (category) {
    case "technical_support":
      return "TECHNICAL_PLATFORM";
    case "training_proposal":
      return "CERTIFICATION_BODY";
    default:
      return "CERTIFICATION_BODY";
  }
}

/** Legacy alias POST /v1/me/complaints body subjectType. */
export function caseCategoryToLegacySubjectType(category: Exclude<CaseCategory, "appeal">): string {
  switch (category) {
    case "technical_support":
      return "ACCESSIBILITY";
    case "complaint":
      return "PROCESS";
    case "improvement_proposal":
    case "training_proposal":
      return "PROCESS";
    default:
      return "PROCESS";
  }
}

export function buildComplaintSummary(subject: string, description: string): string {
  const s = subject.trim();
  const d = description.trim();
  if (s && d) {
    return `${s}\n\n${d}`.slice(0, 8000);
  }
  return (d || s).slice(0, 8000);
}
