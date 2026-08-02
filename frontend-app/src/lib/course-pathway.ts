/**
 * Jasna razlika: obrazovanje / potvrda prolaska ispita / formalni certifikacijski put.
 */

export type CoursePathwayTier =
  | "education_only"
  | "education_exam_pass_proof"
  | "education_exam_pass_and_certification";

export function pathwayTierFromFlags(p: {
  readonly hasFinalExam: boolean;
  readonly autoIssueExamPassCertificate: boolean;
  readonly leadsToCertification: boolean;
}): CoursePathwayTier {
  if (p.leadsToCertification) {
    return "education_exam_pass_and_certification";
  }
  if (p.hasFinalExam && p.autoIssueExamPassCertificate) {
    return "education_exam_pass_proof";
  }
  return "education_only";
}

export function pathwayTierLabelHr(tier: CoursePathwayTier): string {
  switch (tier) {
    case "education_only":
      return "Samo obrazovanje";
    case "education_exam_pass_proof":
      return "Obrazovanje + potvrda prolaska ispita";
    case "education_exam_pass_and_certification":
      return "Obrazovanje + ispit + formalni certifikacijski put";
    default:
      return "Program";
  }
}

export function pathwayTierShortHr(tier: CoursePathwayTier): string {
  switch (tier) {
    case "education_only":
      return "Obrazovanje";
    case "education_exam_pass_proof":
      return "Obrazovanje + potvrda ispita";
    case "education_exam_pass_and_certification":
      return "Obrazovanje + certifikacija";
    default:
      return "Program";
  }
}

export function catalogStatusLabelHr(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === "published" || s === "live" || s === "public" || s === "") {
    return "Objavljeno";
  }
  if (s === "draft") {
    return "Nacrt";
  }
  return status.trim() || "Nepoznato";
}
