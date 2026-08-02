import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConforaI18n } from "@confora/i18n";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StaffApplicationAssignmentPanel } from "@/components/certification/StaffApplicationAssignmentPanel";

const assignApplicationReviewer = vi.fn();
const acceptApplicationAssignment = vi.fn();
const declineApplicationAssignment = vi.fn();

vi.mock("@/lib/api-staff-cert-assignment", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-staff-cert-assignment")>();
  return {
    ...actual,
    assignApplicationReviewer: (...args: unknown[]) => assignApplicationReviewer(...args),
    acceptApplicationAssignment: (...args: unknown[]) => acceptApplicationAssignment(...args),
    declineApplicationAssignment: (...args: unknown[]) => declineApplicationAssignment(...args),
  };
});

const APP_ID = "a5100001-0000-4000-8000-000000000001";
const REVIEWER_ID = "b5200000-0000-4000-8000-000000000020";

const BASE_ASSIGNMENT = {
  contractVersion: "1.0.0",
  applicationId: APP_ID,
  applicationStatus: "SUBMITTED",
  current: {
    assignmentId: "assign-1",
    applicationId: APP_ID,
    status: "ASSIGNED" as const,
    assigneeReference: "rev-b5200000",
    assignmentType: "MANUAL",
    rationale: null,
    declineReason: null,
    assignedAt: "2026-03-02T10:00:00.000Z",
    updatedAt: "2026-03-02T10:00:00.000Z",
  },
  history: [],
};

describe("StaffApplicationAssignmentPanel (P1-B5-2b)", () => {
  const i18n = createConforaI18n({ lng: "en", fallbackLng: "en" });

  beforeEach(() => {
    assignApplicationReviewer.mockReset();
    acceptApplicationAssignment.mockReset();
    declineApplicationAssignment.mockReset();
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

  it("renders assignment status and assignee reference", () => {
    render(
      wrap(
        <StaffApplicationAssignmentPanel
          applicationId={APP_ID}
          assignment={BASE_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["STAFF_DIR"]}
          currentUserId={null}
        />,
      ),
    );

    expect(screen.getByText(/Reviewer assignment/i)).toBeTruthy();
    expect(screen.getByText(/Assigned — pending acceptance/i)).toBeTruthy();
    expect(screen.getByText(/rev-b5200000/)).toBeTruthy();
  });

  it("shows assign action for STAFF_DIR and hides for COM_CERT-only", () => {
    const { rerender } = render(
      wrap(
        <StaffApplicationAssignmentPanel
          applicationId={APP_ID}
          assignment={{ ...BASE_ASSIGNMENT, current: null }}
          isLoading={false}
          isError={false}
          nestRoles={["STAFF_DIR"]}
          currentUserId={null}
        />,
      ),
    );

    expect(screen.getByRole("button", { name: /Assign reviewer/i })).toBeTruthy();

    rerender(
      wrap(
        <StaffApplicationAssignmentPanel
          applicationId={APP_ID}
          assignment={{ ...BASE_ASSIGNMENT, current: null }}
          isLoading={false}
          isError={false}
          nestRoles={["COM_CERT"]}
          currentUserId={null}
        />,
      ),
    );

    expect(screen.queryByRole("button", { name: /Assign reviewer/i })).toBeNull();
  });

  it("shows accept/decline for assigned reviewer", () => {
    render(
      wrap(
        <StaffApplicationAssignmentPanel
          applicationId={APP_ID}
          assignment={BASE_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["STAFF_TRAINADM"]}
          currentUserId={REVIEWER_ID}
        />,
      ),
    );

    expect(screen.getByRole("button", { name: /Accept assignment/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Decline assignment/i })).toBeTruthy();
  });

  it("requires decline reason before submit", async () => {
    render(
      wrap(
        <StaffApplicationAssignmentPanel
          applicationId={APP_ID}
          assignment={BASE_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["SME"]}
          currentUserId={REVIEWER_ID}
        />,
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: /Decline assignment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Submit decline/i }));

    expect(await screen.findByText(/decline reason is required/i)).toBeTruthy();
    expect(declineApplicationAssignment).not.toHaveBeenCalled();
  });

  it("calls acceptApplicationAssignment when COI checked", async () => {
    acceptApplicationAssignment.mockResolvedValue({
      ...BASE_ASSIGNMENT,
      current: { ...BASE_ASSIGNMENT.current, status: "ACCEPTED" },
    });

    render(
      wrap(
        <StaffApplicationAssignmentPanel
          applicationId={APP_ID}
          assignment={BASE_ASSIGNMENT}
          isLoading={false}
          isError={false}
          nestRoles={["STAFF_TRAINADM"]}
          currentUserId={REVIEWER_ID}
        />,
      ),
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /no conflict of interest/i }));
    fireEvent.click(screen.getByRole("button", { name: /Accept assignment/i }));

    await waitFor(() => {
      expect(acceptApplicationAssignment).toHaveBeenCalledWith(APP_ID);
    });
  });
});
