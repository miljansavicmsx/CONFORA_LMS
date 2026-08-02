import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PublicSupportTrustBanner } from "@/components/support/PublicSupportTrustBanner";
import ContactPage from "@/pages/public/ContactPage";
import {
  PUBLIC_SUPPORT_CATEGORIES,
  PUBLIC_SUPPORT_NO_CERT_APPROVAL_MESSAGE,
  PUBLIC_SUPPORT_DATA_MINIMIZATION_MESSAGE,
  SUPPORT_PROHIBITED_FIELD_NAMES,
  isSupportProhibitedFieldName,
  publicCategoryToRequestType,
} from "@/lib/support-contact-labels";

vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: () => null,
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (sel: (s: { user: null }) => unknown) => sel({ user: null }),
}));

describe("support-contact-labels (SUPPORT-CONTACT-1)", () => {
  it("maps public categories to canonical request types", () => {
    expect(publicCategoryToRequestType("general")).toBe("GENERAL_INQUIRY");
    expect(publicCategoryToRequestType("education_programme")).toBe("GENERAL_INQUIRY");
    expect(publicCategoryToRequestType("cert_application")).toBe("APPLICATION_SUPPORT");
    expect(publicCategoryToRequestType("cert_verification")).toBe("CERTIFICATE_VERIFICATION_SUPPORT");
    expect(publicCategoryToRequestType("tech_support")).toBe("TECHNICAL_SUPPORT");
  });

  it("exposes five public support categories", () => {
    expect(PUBLIC_SUPPORT_CATEGORIES).toHaveLength(5);
  });

  it("flags prohibited ID/biometric field names", () => {
    for (const name of SUPPORT_PROHIBITED_FIELD_NAMES) {
      expect(isSupportProhibitedFieldName(name)).toBe(true);
    }
    expect(isSupportProhibitedFieldName("email")).toBe(false);
  });

  it("renders data minimization and no-cert-approval messages", () => {
    const { container } = render(<PublicSupportTrustBanner />);
    const text = container.textContent ?? "";
    expect(text).toContain(PUBLIC_SUPPORT_DATA_MINIMIZATION_MESSAGE);
    expect(text).toContain(PUBLIC_SUPPORT_NO_CERT_APPROVAL_MESSAGE);
  });

  it("renders public support form without ID/biometric fields", () => {
    const { container } = render(<ContactPage />);
    expect(container.querySelector('[data-testid="public-support-form"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="public-support-trust-banner"]')).not.toBeNull();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    for (const name of SUPPORT_PROHIBITED_FIELD_NAMES) {
      expect(container.querySelector(`[name="${name}"]`)).toBeNull();
    }
  });

  it("does not imply support can approve certification", () => {
    const { container } = render(<ContactPage />);
    const text = container.textContent ?? "";
    expect(text).toContain(PUBLIC_SUPPORT_NO_CERT_APPROVAL_MESSAGE);
    expect(text).toMatch(/ne donosi odluke o certifikaciji/i);
  });
});
