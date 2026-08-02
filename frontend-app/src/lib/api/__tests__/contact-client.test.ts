import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCanonicalContactRequestBody,
  CANONICAL_CONTACT_SUBMIT_PATH,
  getPublicContactRequestStatus,
  LEGACY_CONTACT_SUBMIT_PATH,
  submitContactRequest,
  submitLegacyPublicContact,
  submitPublicContact,
} from "../contact-client";
import { legacyCategoryToRequestType } from "../contact-category.util";

describe("contact-client (F4-8b)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_API_PROVIDER", "nest");
    vi.stubEnv("VITE_CONTACT_CANONICAL_ENABLED", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("maps legacy categories to canonical request types", () => {
    expect(legacyCategoryToRequestType("complaint")).toBe("ROUTE_TO_COMPLAINT_REVIEW");
    expect(legacyCategoryToRequestType("appeal")).toBe("ROUTE_TO_APPEAL_REVIEW");
    expect(legacyCategoryToRequestType("tech_support")).toBe("TECHNICAL_SUPPORT");
  });

  it("buildCanonicalContactRequestBody omits PII when anonymous complaint", () => {
    const body = buildCanonicalContactRequestBody({
      category: "complaint",
      name: "Test User",
      email: "test@example.com",
      phone: "",
      subject: "Subject",
      body: "Message body",
      isAnonymousComplaint: true,
      captchaToken: "tok",
    });
    expect(body.requestType).toBe("ROUTE_TO_COMPLAINT_REVIEW");
    expect(body.isAnonymous).toBe(true);
    expect(body).not.toHaveProperty("requesterName");
    expect(body).not.toHaveProperty("requesterContact");
  });

  it("submitContactRequest posts JSON to canonical path", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ publicReference: "CNT-2026-abc", status: "SUBMITTED" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await submitContactRequest({
      category: "general",
      name: "Ana",
      email: "ana@example.com",
      phone: "",
      subject: "Pitanje",
      body: "Poruka",
      isAnonymousComplaint: false,
      captchaToken: "captcha",
    });

    expect(result.publicReference).toBe("CNT-2026-abc");
    expect(result.status).toBe("SUBMITTED");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`http://nest.example.test${CANONICAL_CONTACT_SUBMIT_PATH}`);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload.requestType).toBe("GENERAL_INQUIRY");
    expect(payload).not.toHaveProperty("tenantId");
    expect(payload).not.toHaveProperty("id");
  });

  it("submitPublicContact uses legacy alias when canonical flag is false", async () => {
    vi.stubEnv("VITE_CONTACT_CANONICAL_ENABLED", "false");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ticketNumber: "CNT-legacy-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await submitPublicContact({
      category: "general",
      name: "Ana",
      email: "ana@example.com",
      phone: "",
      subject: "Pitanje",
      body: "Poruka",
      isAnonymousComplaint: false,
      captchaToken: "captcha",
    });

    expect(result.publicReference).toBe("CNT-legacy-1");
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe(`http://nest.example.test${LEGACY_CONTACT_SUBMIT_PATH}`);
  });

  it("getPublicContactRequestStatus returns safe fields only", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          publicReference: "CNT-2026-xyz",
          status: "ACKNOWLEDGED",
          submittedAt: "2026-06-14T10:00:00.000Z",
          nextStep: "Your contact request has been acknowledged.",
          tenantId: "secret",
          id: "uuid",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await getPublicContactRequestStatus("CNT-2026-xyz");
    expect(result.publicReference).toBe("CNT-2026-xyz");
    expect(result.status).toBe("ACKNOWLEDGED");
    expect(result.nextStep).toContain("acknowledged");
    expect(result).not.toHaveProperty("tenantId");
    expect(result).not.toHaveProperty("id");
  });

  it("getPublicContactRequestStatus maps 404 to NOT_FOUND", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Not found", { status: 404 }));

    await expect(getPublicContactRequestStatus("CNT-missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
  });

  it("submitLegacyPublicContact sends multipart to legacy path", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ticketNumber: "CNT-L-1" }), { status: 201 }),
    );

    await submitLegacyPublicContact({
      category: "general",
      name: "Ana",
      email: "ana@example.com",
      phone: "123",
      subject: "Subj",
      body: "Body",
      isAnonymousComplaint: false,
      captchaToken: "tok",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(LEGACY_CONTACT_SUBMIT_PATH);
    expect(init.body).toBeInstanceOf(FormData);
  });
});

describe("contact-category.util", () => {
  it("appends phone and decision metadata to messageSummary", async () => {
    const { buildContactMessageSummary } = await import("../contact-category.util");
    const summary = buildContactMessageSummary({
      body: "Hello",
      phone: "+385 1 234",
      decisionType: "cert",
      decisionRef: "DEC-1",
    });
    expect(summary).toContain("Hello");
    expect(summary).toContain("Phone:");
    expect(summary).toContain("Decision type:");
  });
});
