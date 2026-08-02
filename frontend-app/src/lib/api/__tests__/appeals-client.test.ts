import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as httpClient from "@/lib/api/http-client";
import {
  acknowledgeAppeal,
  CANONICAL_LEARNER_APPEALS_PATH,
  CANONICAL_STAFF_APPEALS_PATH,
  listLearnerAppeals,
  submitLearnerAppeal,
} from "@/lib/api/appeals-client";
import { buildAppealReason, legacyOutcomeToB14 } from "@/lib/api/appeals-category.util";

const getMock = vi.fn();
const postMock = vi.fn();

describe("appeals-client (F4-8d)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_CONFORA_API_URL", "http://nest.example.test");
    vi.stubEnv("VITE_APPEALS_CANONICAL_ENABLED", "true");
    getMock.mockReset();
    postMock.mockReset();
    vi.spyOn(httpClient, "getHttpClient").mockReturnValue({
      get: getMock,
      post: postMock,
    } as ReturnType<typeof httpClient.getHttpClient>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    httpClient.resetHttpClientForTests();
  });

  it("buildAppealReason combines summary and grounds", () => {
    expect(buildAppealReason("Summary", "Grounds")).toBe("Summary\n\nGrounds");
  });

  it("legacyOutcomeToB14 maps UI outcomes", () => {
    expect(legacyOutcomeToB14("UPHELD")).toBe("APPEAL_UPHELD");
    expect(legacyOutcomeToB14("DISMISSED")).toBe("APPEAL_REJECTED");
  });

  it("submitLearnerAppeal posts canonical B14 body", async () => {
    postMock.mockResolvedValue({
      data: {
        appeal: {
          id: "uuid-1",
          appealType: "CERTIFICATION_DECISION_APPEAL",
          status: "SUBMITTED",
          submittedAt: "2026-06-14T10:00:00.000Z",
          candidateReference: "APL-1",
          appealReason: "Summary\n\nGrounds",
        },
      },
    });

    const row = await submitLearnerAppeal({
      certificationDecisionId: "decision-uuid",
      summary: "Summary",
      grounds: "Grounds",
    });

    expect(postMock).toHaveBeenCalledWith(CANONICAL_LEARNER_APPEALS_PATH, {
      appealType: "CERTIFICATION_DECISION_APPEAL",
      appealReason: "Summary\n\nGrounds",
      relatedCertificationDecisionReviewId: "decision-uuid",
    });
    expect(row.appealId).toBe("uuid-1");
    expect(row.summary).toBe("Summary");
    expect(row.grounds).toBe("Grounds");
  });

  it("listLearnerAppeals uses canonical learner path", async () => {
    getMock.mockResolvedValue({
      data: {
        items: [
          {
            id: "uuid-2",
            appealType: "CERTIFICATION_DECISION_APPEAL",
            status: "ACKNOWLEDGED",
            submittedAt: "2026-06-14T10:00:00.000Z",
            candidateReference: "APL-2",
          },
        ],
      },
    });

    const rows = await listLearnerAppeals();
    expect(getMock).toHaveBeenCalledWith(CANONICAL_LEARNER_APPEALS_PATH);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("ACKNOWLEDGED");
  });

  it("listLearnerAppeals uses legacy alias when flag is false", async () => {
    vi.stubEnv("VITE_APPEALS_CANONICAL_ENABLED", "false");
    getMock.mockResolvedValue({ data: { items: [] } });

    await listLearnerAppeals();
    expect(getMock).toHaveBeenCalledWith("/v1/me/appeals");
  });

  it("acknowledgeAppeal uses staff canonical path", async () => {
    postMock.mockResolvedValue({
      data: {
        appeal: {
          id: "uuid-3",
          appealType: "CERTIFICATION_DECISION_APPEAL",
          status: "ACKNOWLEDGED",
          submittedAt: "2026-06-14T10:00:00.000Z",
          candidateReference: "APL-3",
        },
      },
    });

    const detail = await acknowledgeAppeal("uuid-3");
    expect(postMock).toHaveBeenCalledWith(`${CANONICAL_STAFF_APPEALS_PATH}/uuid-3/acknowledge`, {});
    expect(detail.status).toBe("ACKNOWLEDGED");
  });
});
