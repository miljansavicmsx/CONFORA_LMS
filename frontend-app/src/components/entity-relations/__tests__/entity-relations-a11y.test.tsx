import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EntityRelationshipPanel } from "@/components/entity-relations/EntityRelationshipPanel";
import { EntityKind, buildTrustNavigationExplainerEdges } from "@/lib/entity-relationships";

describe("EntityRelationshipPanel a11y smoke", () => {
  it("exposes landmark and expand control", () => {
    render(
      <EntityRelationshipPanel
        centerId="c"
        centerType={EntityKind.PROCESS}
        edges={buildTrustNavigationExplainerEdges()}
        defaultCollapsed
      />,
    );
    expect(screen.getByRole("button", { name: /prikaži povezanost/i })).toBeTruthy();
  });
});
