import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import {
  AppealsCommitteePanel,
  IsoGovernancePanel,
  TechnicalCommitteePanel,
} from "@/components/dashboard/DashboardRolePanels";
import { TooltipProvider } from "@/components/ui/tooltip";

function renderWithRouter(ui: ReactElement) {
  return render(
    <TooltipProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </TooltipProvider>,
  );
}

describe("role cockpit shells", () => {
  it("renders technical committee cockpit title", () => {
    renderWithRouter(
      <TechnicalCommitteePanel
        d={{
          coursesPendingValidation: 1,
          itemBankDraftAi: 0,
          itemBankTotalSampled: 10,
          coiReminder: "Test COI",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: /Content validation center/i })).toBeTruthy();
  });

  it("renders appeals cockpit title", () => {
    renderWithRouter(
      <AppealsCommitteePanel
        d={{
          openAppeals: 0,
          openComplaints: 0,
          oldestOpenAppealDays: 0,
          oldestOpenComplaintDays: 0,
          agingSamples: [],
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: /Dispute resolution center/i })).toBeTruthy();
  });

  it("maps auditor governance variant shell copy", () => {
    renderWithRouter(
      <IsoGovernancePanel
        governanceRole="auditor"
        d={{
          activeCertificates: 0,
          openAppeals: 0,
          openComplaints: 0,
          openGovernanceCases: 0,
          note: "",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: /Audit & compliance intelligence/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /Governance audit insights/i })).toBeTruthy();
  });
});
