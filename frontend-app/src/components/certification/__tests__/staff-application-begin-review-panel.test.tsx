import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConforaI18n } from "@confora/i18n";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StaffApplicationBeginReviewPanel } from "@/components/certification/StaffApplicationBeginReviewPanel";

const startApplicationReview = vi.fn();

vi.mock("@/lib/api-staff-cert-begin-review", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-staff-cert-begin-review")>();
  return {
    ...actual,
    startApplicationReview: (...args: unknown[]) => startApplicationReview(...args),
  };
});

const APP_ID = "a5100001-0000-4000-8000-000000000001";
const REVIEWER_ID = "b5200000-0000-4000-8000-000000000020";

const NOT_STARTED_REVIEW = {
  contractVersion: "1.0.0",
  applicationId: APP_ID,
  applicationStatus: "SUBMITTED",
  reviewState: "NOT_STARTED" as const,
  assignmentStatus: "ACCEPTED" as const,
  assigneeReference: "rev-b5200000",
  reviewStartedAt: null,
};

const ACCEPTED_ASSIGNMENT = {
  contractVersion: "1.0.0",
  applicationId: APP_ID,
  applicationStatus: "SUBMITTED",
  current: {
    assignmentId: "assign-1",
    applicationId: APP_ID,
    status: "ACCEPTED" as const,
    assigneeReference: "rev-b5200000",
    assignmentType: "MANUAL",
    rationale: null,
    declineReason: null,
    assignedAt: "2026-03-02T10:00:00.000Z",
    updatedAt: "2026-03-02T10:00:00.000Z",
  },
  history: [],
};

describe("StaffApplicationBeginReviewPanel (P1-B5-3b)", () => {
  const i18n = createConforaI18n({ lng: "en", fallbackLng: "en" });

  beforeEach(() => {
    startApplicationReview.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  function wrap(ui: ReactNode) {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
      <QueryClientProvider client={qc}>
        <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
      </QueryClientProvider>
    );
  }

  it("renders review status NOT_STARTED and assignment ACCEPTED separately", () => {
    render(
      wrap(
        <StaffApplicationBeginReviewPanel
          applicationId={APP_ID}
          applicationStatus="SUBMITTED"
          reviewStatus={NOT_STARTED_REVIEW}
          assignment={ACCEPTED_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["STAFF_DIR"]}
          currentUserId={null}
        />,
      ),
    );

    expect(screen.getByText(/Application review/i)).toBeTruthy();
    expect(screen.getByText(/Not started/i)).toBeTruthy();
    expect(screen.getByText(/SUBMITTED/)).toBeTruthy();
    expect(screen.getByText(/Accepted/i)).toBeTruthy();
  });

  it("shows reviewStartedAt when IN_PROGRESS", () => {
    render(
      wrap(
        <StaffApplicationBeginReviewPanel
          applicationId={APP_ID}
          applicationStatus="UNDER_REVIEW"
          reviewStatus={{
            ...NOT_STARTED_REVIEW,
            applicationStatus: "UNDER_REVIEW",
            reviewState: "IN_PROGRESS",
            assignmentStatus: "IN_REVIEW",
            reviewStartedAt: "2026-03-02T12:00:00.000Z",
          }}
          assignment={{
            ...ACCEPTED_ASSIGNMENT,
            current: { ...ACCEPTED_ASSIGNMENT.current!, status: "IN_REVIEW" },
          }}
          isLoading={false}
          isError={false}
          nestRoles={["STAFF_DIR"]}
          currentUserId={null}
        />,
      ),
    );

    expect(screen.getByText(/In progress/i)).toBeTruthy();
    expect(screen.getByText(/UNDER_REVIEW/)).toBeTruthy();
    expect(screen.getByText(/In review/i)).toBeTruthy();
    expect(screen.getByText(/Review started on/i)).toBeTruthy();
  });

  it("shows Start Review for assigned reviewer with ACCEPTED assignment", () => {
    render(
      wrap(
        <StaffApplicationBeginReviewPanel
          applicationId={APP_ID}
          applicationStatus="SUBMITTED"
          reviewStatus={NOT_STARTED_REVIEW}
          assignment={ACCEPTED_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["STAFF_TRAINADM"]}
          currentUserId={REVIEWER_ID}
        />,
      ),
    );

    expect(screen.getByRole("button", { name: /Start review/i })).toBeTruthy();
  });

  it("hides Start Review for COM_CERT-only and non-assignee", () => {
    const { rerender } = render(
      wrap(
        <StaffApplicationBeginReviewPanel
          applicationId={APP_ID}
          applicationStatus="SUBMITTED"
          reviewStatus={NOT_STARTED_REVIEW}
          assignment={ACCEPTED_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["COM_CERT"]}
          currentUserId={REVIEWER_ID}
        />,
      ),
    );

    expect(screen.queryByRole("button", { name: /Start review/i })).toBeNull();

    rerender(
      wrap(
        <StaffApplicationBeginReviewPanel
          applicationId={APP_ID}
          applicationStatus="SUBMITTED"
          reviewStatus={NOT_STARTED_REVIEW}
          assignment={ACCEPTED_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["STAFF_TRAINADM"]}
          currentUserId="other-user"
        />,
      ),
    );

    expect(screen.queryByRole("button", { name: /Start review/i })).toBeNull();
  });

  it("refreshes queries and shows success on start review", async () => {
    startApplicationReview.mockResolvedValue({
      ...NOT_STARTED_REVIEW,
      applicationStatus: "UNDER_REVIEW",
      reviewState: "IN_PROGRESS",
      assignmentStatus: "IN_REVIEW",
      reviewStartedAt: "2026-03-02T12:00:00.000Z",
    });

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    render(
      <QueryClientProvider client={qc}>
        <I18nextProvider i18n={i18n}>
          <StaffApplicationBeginReviewPanel
            applicationId={APP_ID}
            applicationStatus="SUBMITTED"
            reviewStatus={NOT_STARTED_REVIEW}
            assignment={ACCEPTED_ASSIGNMENT}
            isLoading={false}
            isError={false}
            nestRoles={["SME"]}
            currentUserId={REVIEWER_ID}
          />
        </I18nextProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Start review/i }));

    await waitFor(() => {
      expect(startApplicationReview).toHaveBeenCalledWith(APP_ID);
    });

    expect(await screen.findByText(/Review started/i)).toBeTruthy();
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("maps start review error to i18n message", async () => {
    const axios = await import("axios");
    startApplicationReview.mockRejectedValue(
      new axios.default.AxiosError("Forbidden", undefined, undefined, undefined, {
        status: 403,
        data: { message: "Insufficient role" },
        statusText: "Forbidden",
        headers: {},
        config: {} as never,
      }),
    );

    render(
      wrap(
        <StaffApplicationBeginReviewPanel
          applicationId={APP_ID}
          applicationStatus="SUBMITTED"
          reviewStatus={NOT_STARTED_REVIEW}
          assignment={ACCEPTED_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["SME"]}
          currentUserId={REVIEWER_ID}
        />,
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: /Start review/i }));

    expect(
      await screen.findByText(/You do not have permission to start this review/i),
    ).toBeTruthy();
  });
});
