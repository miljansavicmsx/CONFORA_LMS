import { describe, expect, it } from "vitest";

import {
  ARCHITECTURE_ALLOWED_DEPENDENCY_EDGES,
  FRONTEND_BOUNDARIES,
  ORCHESTRATION_SURFACES,
} from "@/architecture";

describe("architecture governance module", () => {
  it("exports non-empty boundary and orchestration metadata", () => {
    expect(FRONTEND_BOUNDARIES.length).toBeGreaterThanOrEqual(8);
    expect(ORCHESTRATION_SURFACES.length).toBeGreaterThanOrEqual(3);
    expect(ARCHITECTURE_ALLOWED_DEPENDENCY_EDGES.length).toBeGreaterThan(0);
  });
});
