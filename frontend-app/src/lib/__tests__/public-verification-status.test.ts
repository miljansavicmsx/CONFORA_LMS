import { describe, expect, it } from "vitest";

import {
  filterPublicVerificationPayload,
  normalizePublicVerificationStatus,
  presentPublicVerificationStatus,
  PUBLIC_VERIFICATION_PRIVATE_FIELD_KEYS,
} from "../public-verification-status";

describe("public-verification-status", () => {
  it("maps registry statuses to human-readable labels", () => {
    expect(presentPublicVerificationStatus("ACTIVE").label).toBe("Aktivan");
    expect(presentPublicVerificationStatus("ISSUED").label).toBe("Izdano");
    expect(presentPublicVerificationStatus("SUSPENDED").label).toBe("Suspendiran");
    expect(presentPublicVerificationStatus("REVOKED").label).toBe("Opozvan");
    expect(presentPublicVerificationStatus("EXPIRED").label).toBe("Istekao");
    expect(presentPublicVerificationStatus("REPLACED").label).toBe("Zamijenjen");
  });

  it("normalizes legacy aliases", () => {
    expect(normalizePublicVerificationStatus("VALIDAN")).toBe("VALID");
    expect(normalizePublicVerificationStatus("ISTEKAO")).toBe("EXPIRED");
  });

  it("filters private dossier fields from public payload", () => {
    const filtered = filterPublicVerificationPayload({
      fullName: "Test User",
      reviewerNotes: "secret",
      committeeDeliberation: "internal",
      identityDocument: "scan",
      certificateKind: "PERSON_CERTIFICATION",
    });
    expect(filtered.fullName).toBe("Test User");
    expect(filtered.certificateKind).toBe("PERSON_CERTIFICATION");
    expect(filtered).not.toHaveProperty("reviewerNotes");
    expect(filtered).not.toHaveProperty("committeeDeliberation");
    expect(filtered).not.toHaveProperty("identityDocument");
    expect(PUBLIC_VERIFICATION_PRIVATE_FIELD_KEYS.length).toBeGreaterThan(0);
  });
});
