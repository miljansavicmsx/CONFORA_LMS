/**
 * Označava da je lokalni pre-flight (kamera + dokument) završen za pokušaj —
 * u skladu sa backend `verificationStatus` nakon uspješnog POST verify.
 */

const key = (attemptId: string): string => `confora_exam_verified_${attemptId}`;

export function setExamVerified(attemptId: string): void {
  try {
    sessionStorage.setItem(key(attemptId), "1");
  } catch {
    /* ignore */
  }
}

export function isExamVerified(attemptId: string): boolean {
  try {
    return sessionStorage.getItem(key(attemptId)) === "1";
  } catch {
    return false;
  }
}

export function clearExamVerified(attemptId: string): void {
  try {
    sessionStorage.removeItem(key(attemptId));
  } catch {
    /* ignore */
  }
}
