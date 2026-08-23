type Status = string | null | undefined;

export const LEARNER_EDUCATION_COMPLETION_BOUNDARY = "Potvrda o završetku edukacije nije certifikat niti odluka o ispunjenosti uslova za certifikaciju.";

export function educationProgressStatusLabel(status: Status): string {
  switch (status) {
    case "COMPLETED": return "Završeno";
    case "IN_PROGRESS": return "U toku";
    case "NOT_STARTED": return "Nije započeto";
    default: return typeof status === "string" && status.trim() ? status : "—";
  }
}

export function educationEnrolmentStatusLabel(status: Status): string {
  switch (status) {
    case "ACTIVE": return "Aktivno";
    case "COMPLETED": return "Završeno";
    case "CANCELLED": return "Otkazano";
    default: return typeof status === "string" && status.trim() ? status : "—";
  }
}

/** Completion requires an explicit server state; absent or malformed progress never completes a course. */
export function isEducationEnrolmentCompleted(enrolment: { readonly enrolmentStatus?: Status; readonly progressStatus?: Status; readonly progressPct?: unknown }): boolean {
  return enrolment.enrolmentStatus === "COMPLETED" || enrolment.progressStatus === "COMPLETED";
}

/** Public verification applies to published credential references only, never education completion records. */
export function shouldShowPublicVerifyLink(publicVerifyUrl: string | null | undefined, verifyHash: string | null | undefined): boolean {
  return typeof publicVerifyUrl === "string" && publicVerifyUrl.startsWith("/verify/") && typeof verifyHash === "string" && /^[0-9a-f]{64}$/iu.test(verifyHash);
}
