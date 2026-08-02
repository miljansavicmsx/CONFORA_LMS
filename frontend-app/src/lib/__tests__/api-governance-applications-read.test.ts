import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";



import { ENDPOINT_DEFINITIONS } from "@/lib/api/endpoint-registry";



const apiGet = vi.fn();

const apiPatch = vi.fn();

const apiPost = vi.fn();



vi.mock("@/lib/api", () => ({

  api: {

    get: (...args: unknown[]) => apiGet(...args),

    patch: (...args: unknown[]) => apiPatch(...args),

    post: (...args: unknown[]) => apiPost(...args),

  },

}));



const NEST_DETAIL_ITEM = {

  applicationId: "a3200001-0000-4000-8000-000000000001",

  courseId: "c3200001-0000-4000-8000-000000000001",

  schemeTitle: "Certified Widget Professional",

  status: "DRAFT",

  submittedAt: null,

  updatedAt: "2026-03-01T10:00:00.000Z",

  nextAction: "COMPLETE_DRAFT",

  evidenceSummary: {

    biographyProvided: false,

    diplomaProvided: false,

    publicWorksCount: 0,

  },

  eligibilitySummary: {

    desiredScopeProvided: false,

    overviewAcknowledged: false,

    verifiersRecorded: 0,

  },

  publicVerifyPath: null,

  desiredScopeText: null,

  workExperience: "Experience text",

  bioUrl: null,

  diplomaUrl: null,

  publicWorks: [],

  referencePerson1: null,

  referencePerson2: null,

  editLocked: false,

  overviewAcknowledgedAt: null,

} as const;



describe("certification application hybrid routing (P1-B3-2 reads, P1-B3-3c writes, P1-B4-b submit)", () => {

  beforeEach(() => {

    vi.resetModules();

    apiGet.mockReset();

    apiPatch.mockReset();

    apiPost.mockReset();

    vi.stubEnv("VITE_API_PROVIDER", "hybrid");

    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");

    vi.stubEnv("VITE_LEGACY_API_URL", "http://legacy.example.test");

  });



  afterEach(() => {

    vi.unstubAllEnvs();

  });



  it("fetchMyCertificationApplications uses Nest read path in hybrid mode", async () => {

    apiGet.mockResolvedValue({

      data: {

        contractVersion: "1.0.0",

        items: [

          {

            applicationId: "a3200001-0000-4000-8000-000000000001",

            courseId: "c3200001-0000-4000-8000-000000000001",

            schemeTitle: "Certified Widget Professional",

            status: "SUBMITTED",

            submittedAt: "2026-03-01T10:00:00.000Z",

            updatedAt: "2026-03-01T10:00:00.000Z",

            nextAction: "AWAIT_STAFF_REVIEW",

            evidenceSummary: {

              biographyProvided: true,

              diplomaProvided: true,

              publicWorksCount: 1,

            },

            eligibilitySummary: {

              desiredScopeProvided: true,

              overviewAcknowledged: true,

              verifiersRecorded: 2,

            },

            publicVerifyPath: null,

          },

        ],

      },

    });



    const { fetchMyCertificationApplications } = await import("@/lib/api-governance");

    const rows = await fetchMyCertificationApplications();



    expect(apiGet).toHaveBeenCalledWith("/v1/me/certification/applications");

    expect(rows).toHaveLength(1);

    expect(rows[0]?.applicationId).toBe("a3200001-0000-4000-8000-000000000001");

  });



  it("fetchMyCertificationApplications uses legacy path in legacy mode", async () => {

    vi.stubEnv("VITE_API_PROVIDER", "legacy");

    apiGet.mockResolvedValue({

      data: [

        {

          applicationId: "legacy-app-1",

          userId: "u1",

          courseId: "c1",

          status: "DRAFT",

          workExperience: "x",

        },

      ],

    });



    const { fetchMyCertificationApplications } = await import("@/lib/api-governance");

    await fetchMyCertificationApplications();



    expect(apiGet).toHaveBeenCalledWith("/api/certification/my-applications");

  });



  it("fetchCertificationApplication uses Nest detail path in hybrid mode", async () => {

    apiGet.mockResolvedValue({

      data: {

        contractVersion: "1.0.0",

        item: NEST_DETAIL_ITEM,

      },

    });



    const { fetchCertificationApplication } = await import("@/lib/api-governance");

    const app = await fetchCertificationApplication("a3200001-0000-4000-8000-000000000001");



    expect(apiGet).toHaveBeenCalledWith(

      "/v1/me/certification/applications/a3200001-0000-4000-8000-000000000001",

    );

    expect(app.workExperience).toBe("Experience text");

  });



  it("postCertificationDraft uses Nest create path in hybrid mode", async () => {

    apiPost.mockResolvedValue({

      data: {

        contractVersion: "1.0.0",

        item: NEST_DETAIL_ITEM,

      },

    });



    const { postCertificationDraft } = await import("@/lib/api-governance");

    const result = await postCertificationDraft({

      courseId: "c3200001-0000-4000-8000-000000000001",

      workExperience: "Ten years",

    });



    expect(apiPost).toHaveBeenCalledWith("/v1/me/certification/applications", {

      courseId: "c3200001-0000-4000-8000-000000000001",

      workExperience: "Ten years",

      overviewAcknowledged: false,

    });

    expect(apiPost).not.toHaveBeenCalledWith("/api/certification/draft", expect.anything());

    expect(result.applicationId).toBe("a3200001-0000-4000-8000-000000000001");

    expect(result.status).toBe("DRAFT");

  });



  it("postCertificationDraft uses legacy path in legacy mode", async () => {

    vi.stubEnv("VITE_API_PROVIDER", "legacy");

    apiPost.mockResolvedValue({

      data: {

        applicationId: "legacy-app-1",

        status: "DRAFT",

        createdAt: "2026-03-01T10:00:00.000Z",

      },

    });



    const { postCertificationDraft } = await import("@/lib/api-governance");

    await postCertificationDraft({

      courseId: "c1",

      workExperience: "Experience",

    });



    expect(apiPost).toHaveBeenCalledWith("/api/certification/draft", expect.objectContaining({

      courseId: "c1",

      workExperience: "Experience",

    }));

  });



  it("postCertificationDraft re-export uses Nest path in hybrid mode", async () => {

    apiPost.mockResolvedValue({

      data: {

        contractVersion: "1.0.0",

        item: NEST_DETAIL_ITEM,

      },

    });



    const { postCertificationDraft } = await import("@/lib/api-certification-entry");

    await postCertificationDraft({

      courseId: "c3200001-0000-4000-8000-000000000001",

      workExperience: "Ten years",

    });



    expect(apiPost).toHaveBeenCalledWith("/v1/me/certification/applications", expect.any(Object));

  });



  it("patchCertificationApplication uses Nest patch path in hybrid mode", async () => {

    apiPatch.mockResolvedValue({

      data: {

        contractVersion: "1.0.0",

        item: { ...NEST_DETAIL_ITEM, workExperience: "patched" },

      },

    });



    const { patchCertificationApplication } = await import("@/lib/api-governance");

    const app = await patchCertificationApplication("a3200001-0000-4000-8000-000000000001", {

      workExperience: "patched",

    });



    expect(apiPatch).toHaveBeenCalledWith(

      "/v1/me/certification/applications/a3200001-0000-4000-8000-000000000001",

      { workExperience: "patched" },

    );

    expect(app.workExperience).toBe("patched");

  });



  it("patchCertificationApplication uses legacy path in legacy mode", async () => {

    vi.stubEnv("VITE_API_PROVIDER", "legacy");

    apiPatch.mockResolvedValue({

      data: {

        applicationId: "a1",

        userId: "u1",

        courseId: "c1",

        status: "DRAFT",

        workExperience: "patched",

      },

    });



    const { patchCertificationApplication } = await import("@/lib/api-governance");

    await patchCertificationApplication("a1", { workExperience: "patched" });



    expect(apiPatch).toHaveBeenCalledWith("/api/certification/applications/a1", {

      workExperience: "patched",

    });

  });



  it("submitCertificationApplicationDraft uses Nest submit path in hybrid mode", async () => {
    apiPost.mockResolvedValue({
      data: {
        contractVersion: "1.0.0",
        item: { ...NEST_DETAIL_ITEM, status: "SUBMITTED", submittedAt: "2026-03-01T10:00:00.000Z" },
      },
    });

    const { submitCertificationApplicationDraft } = await import("@/lib/api-governance");
    const result = await submitCertificationApplicationDraft("a1", true, "Signer Name");

    expect(apiPost).toHaveBeenCalledWith("/v1/me/certification/applications/a1/submit", {
      candidateDeclarationAccepted: true,
      complianceSignature: "Signer Name",
    });
    expect(apiPost).not.toHaveBeenCalledWith(
      "/api/certification/applications/a1/submit",
      expect.anything(),
    );
    expect(result.applicationId).toBe("a3200001-0000-4000-8000-000000000001");
    expect(result.status).toBe("SUBMITTED");
    expect(result.createdAt).toBe("2026-03-01T10:00:00.000Z");
  });

  it("submitCertificationApplicationDraft uses legacy path in legacy mode", async () => {
    vi.stubEnv("VITE_API_PROVIDER", "legacy");

    apiPost.mockResolvedValue({
      data: {
        applicationId: "a1",
        status: "SUBMITTED",
        createdAt: "2026-03-01T10:00:00.000Z",
      },
    });

    const { submitCertificationApplicationDraft } = await import("@/lib/api-governance");
    await submitCertificationApplicationDraft("a1", true, "Signer Name");

    expect(apiPost).toHaveBeenCalledWith(
      "/api/certification/applications/a1/submit",
      expect.objectContaining({ submit: true, candidateDeclarationAccepted: true }),
    );
    expect(apiPost).not.toHaveBeenCalledWith(
      expect.stringContaining("/v1/me/certification/applications"),
      expect.anything(),
    );
  });

  it("submitCertificationApplicationDraft maps Nest detail response to submit shape", async () => {
    apiPost.mockResolvedValue({
      data: {
        contractVersion: "1.0.0",
        item: {
          ...NEST_DETAIL_ITEM,
          status: "SUBMITTED",
          submittedAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-01T12:00:00.000Z",
        },
      },
    });

    const { submitCertificationApplicationDraft } = await import("@/lib/api-governance");
    const result = await submitCertificationApplicationDraft("a3200001-0000-4000-8000-000000000001", true, "Jane Learner");

    expect(result).toEqual({
      applicationId: "a3200001-0000-4000-8000-000000000001",
      status: "SUBMITTED",
      createdAt: "2026-06-01T12:00:00.000Z",
    });
  });

  it("submitCertificationApplicationDraft surfaces 409 as client error message", async () => {
    const axios = await import("axios");
    const conflict = new axios.default.AxiosError("Conflict");
    conflict.response = {
      status: 409,
      data: { message: "Application cannot be submitted in its current status" },
      statusText: "Conflict",
      headers: {},
      config: {} as never,
    };

    apiPost.mockRejectedValue(conflict);

    const { submitCertificationApplicationDraft } = await import("@/lib/api-governance");

    await expect(submitCertificationApplicationDraft("a1", true, "Signer Name")).rejects.toThrow(
      /Application cannot be submitted|Podaci trenutno nisu dostupni|Došlo je do greške/i,
    );
  });

  it("submitCertificationApplicationDraft rollback uses legacy path when provider is legacy", async () => {
    vi.stubEnv("VITE_API_PROVIDER", "legacy");

    apiPost.mockResolvedValue({
      data: {
        applicationId: "rollback-app",
        status: "SUBMITTED",
        createdAt: "2026-03-01T10:00:00.000Z",
      },
    });

    const { submitCertificationApplicationDraft } = await import("@/lib/api-governance");
    await submitCertificationApplicationDraft("rollback-app", true, "Rollback Signer");

    expect(apiPost).toHaveBeenCalledWith(
      "/api/certification/applications/rollback-app/submit",
      expect.objectContaining({ submit: true }),
    );
  });

  it("endpoint registry marks draft writes and submit as Nest in hybrid", () => {
    const createDraft = ENDPOINT_DEFINITIONS.find((e) => e.id === "certification.applications.write.createDraft");
    const patchDraft = ENDPOINT_DEFINITIONS.find((e) => e.id === "certification.applications.write.patchDraft");
    const submit = ENDPOINT_DEFINITIONS.find((e) => e.id === "certification.applications.write.submit");

    expect(createDraft?.hybridOwner).toBe("nest");
    expect(createDraft?.nestPath).toBe("/v1/me/certification/applications");
    expect(patchDraft?.hybridOwner).toBe("nest");
    expect(submit?.hybridOwner).toBe("nest");
    expect(submit?.nestPath).toBe("/v1/me/certification/applications");
    expect(submit?.legacyPath).toBe("/api/certification/applications");
  });
});

