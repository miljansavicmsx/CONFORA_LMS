import { render, screen } from "@testing-library/react";
import { AlertTriangle } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  EntityActionBar,
  EntityEvidencePanel,
  EntityHeader,
  EntityInsightPanel,
  EntityRelationshipSummary,
  EntityStatusStrip,
  EntitySurfaceShell,
  EntityTraceabilityPanel,
  EntityWorkflowPanel,
} from "@/components/entity-surface";

describe("unified entity surface landmarks", () => {
  it("composes shell with labelled header and regions", () => {
    render(
      <EntitySurfaceShell labelledBy="entity-h">
        <EntityHeader id="entity-h" icon={AlertTriangle} eyebrow="ISO" title="CAPA entitet" description="Opis" />
        <EntityStatusStrip>
          <span className="text-xs">Status A</span>
        </EntityStatusStrip>
        <EntityWorkflowPanel
          stages={[
            { label: "S1", state: "done" },
            { label: "S2", state: "active" },
          ]}
          ariaLabel="Tok obrade"
        />
        <EntityEvidencePanel>
          <p>Dokaz</p>
        </EntityEvidencePanel>
        <EntityTraceabilityPanel>
          <p>Trag</p>
        </EntityTraceabilityPanel>
        <EntityRelationshipSummary>
          <p>Povezano</p>
        </EntityRelationshipSummary>
        <EntityInsightPanel>
          <p>Uvid</p>
        </EntityInsightPanel>
        <EntityActionBar>
          <button type="button">Akcija</button>
        </EntityActionBar>
      </EntitySurfaceShell>,
    );

    expect(document.getElementById("entity-h")).not.toBeNull();
    expect(screen.getByRole("heading", { name: /CAPA entitet/i })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: /Tok obrade/i })).toBeTruthy();
    expect(screen.getByRole("group", { name: /Status traka entiteta/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /Dokazi/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /Tragivost/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /Uvidi/i })).toBeTruthy();
    expect(screen.getByRole("toolbar", { name: /Akcije entiteta/i })).toBeTruthy();
  });
});
