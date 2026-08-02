import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GovernanceTopologyMap } from "@/components/digital-twin/GovernanceTopologyMap";
import { buildDigitalTwinBundle } from "@/lib/digital-twin";
import type { DashboardContextPayload } from "@/lib/dashboard-context-api";

function minimalCtx(): DashboardContextPayload {
  return {
    persona: "iso_governance",
    role: "r",
    isoRole: "quality_manager",
    isoRoleLabel: "QM",
    isoGovernance: {
      activeCertificates: 0,
      openAppeals: 0,
      openComplaints: 0,
      openGovernanceCases: 0,
      note: "",
    },
  };
}

describe("GovernanceTopologyMap", () => {
  it("renders twin heading and accessibility summary", () => {
    const bundle = buildDigitalTwinBundle({
      ctx: minimalCtx(),
      committees: [],
      governanceDocumentCount: 3,
      internalAuditRecords: 0,
      openAuditFindings: 0,
    });
    render(<GovernanceTopologyMap bundle={bundle} governanceDocumentCount={3} />);
    expect(screen.getByRole("heading", { name: /digital twin/i })).toBeTruthy();
    expect(screen.getByText(/insights/i)).toBeTruthy();
  });
});
