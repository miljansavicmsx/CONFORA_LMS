import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveApiBaseUrl } from "../api-provider";
import {
  verifyPublicCertificateByHash,
  verifyPublicCertificateByReference,
} from "../public-verification-client";

describe("public verification client", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses Nest base URL in hybrid mode for public verify GET", () => {
    const hash = "a".repeat(64);
    expect(resolveApiBaseUrl(`/api/public/verify/${hash}`)).toBe("http://nest.example.test");
  });

  it("verifyPublicCertificateByHash does not send tenant_id in request", async () => {
    const hash = "b".repeat(64);
    const getSpy = vi.spyOn(axios, "get").mockResolvedValue({
      data: { valid: false },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    await verifyPublicCertificateByHash(hash);

    expect(getSpy).toHaveBeenCalledWith(
      `http://nest.example.test/api/public/verify/${hash}`,
      expect.objectContaining({
        headers: { Accept: "application/json" },
      }),
    );
    const config = getSpy.mock.calls[0]?.[1];
    expect(config).not.toHaveProperty("params");
  });

  it("verifyPublicCertificateByReference normalizes not found", async () => {
    vi.spyOn(axios, "post").mockResolvedValue({
      data: { valid: false },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    const result = await verifyPublicCertificateByReference("CON-2099-999999");
    expect(result.kind).toBe("not_found");
  });

  it("verifyPublicCertificateByReference POST body contains reference only", async () => {
    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: { valid: true, certId: "CON-2026-000001", verificationResult: "VALID" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    await verifyPublicCertificateByReference("CON-2026-000001");

    expect(postSpy).toHaveBeenCalledWith(
      "http://nest.example.test/api/public/certificates/verify",
      { reference: "CON-2026-000001" },
      expect.any(Object),
    );
    const body = postSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(body).not.toHaveProperty("tenant_id");
    expect(body).not.toHaveProperty("tenantId");
  });

  it("maps suspended legacy response with metadata as ok (not not_found)", async () => {
    vi.spyOn(axios, "get").mockResolvedValue({
      data: {
        valid: false,
        verificationResult: "SUSPENDED",
        effectiveStatus: "SUSPENDED",
        certId: "CON-2026-000099",
        certificateKind: "PERSON_CERTIFICATION",
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    const result = await verifyPublicCertificateByHash("c".repeat(64));
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") {
      expect(result.data.valid).toBe(false);
      expect(result.data.verificationResult).toBe("SUSPENDED");
    }
  });
});
