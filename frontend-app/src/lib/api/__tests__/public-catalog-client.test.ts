import axios, { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveApiBaseUrl } from "../api-provider";
import {
  fetchPublicCatalogCourseByIdentifier,
  fetchPublicCatalogCourses,
} from "../public-catalog-client";

const sampleRow = {
  courseId: "00000000-0000-4000-8000-000000000099",
  slug: "security-basics",
  title: "Security Basics",
  domain: "Information Security",
  price: 1200,
  level: "Napredni",
};

describe("public catalog client", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_API_PROVIDER", "hybrid");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses Nest base URL in hybrid mode for GET /api/courses", () => {
    expect(resolveApiBaseUrl("/api/courses")).toBe("http://nest.example.test");
  });

  it("fetchPublicCatalogCourses does not send tenant_id", async () => {
    const getSpy = vi.spyOn(axios, "get").mockResolvedValue({
      data: [sampleRow],
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    await fetchPublicCatalogCourses();

    expect(getSpy).toHaveBeenCalledWith(
      "http://nest.example.test/api/courses",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    const config = getSpy.mock.calls[0]?.[1];
    expect(config).not.toHaveProperty("params");
  });

  it("fetchPublicCatalogCourseByIdentifier normalizes not found", async () => {
    const err = new AxiosError("Not Found");
    err.response = { status: 404, data: {}, statusText: "Not Found", headers: {}, config: {} as never };
    vi.spyOn(axios, "get").mockRejectedValue(err);

    const result = await fetchPublicCatalogCourseByIdentifier("missing-slug");
    expect(result.kind).toBe("not_found");
  });

  it("preserves legacy-compatible response fields", async () => {
    vi.spyOn(axios, "get").mockResolvedValue({
      data: sampleRow,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} },
    });

    const result = await fetchPublicCatalogCourseByIdentifier("security-basics");
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") {
      expect(result.data.courseId).toBe(sampleRow.courseId);
      expect(result.data.slug).toBe("security-basics");
      expect(result.data.title).toBe("Security Basics");
    }
  });
});
