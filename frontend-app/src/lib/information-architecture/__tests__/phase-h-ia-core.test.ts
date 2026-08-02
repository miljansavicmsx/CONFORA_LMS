import { afterEach, describe, expect, it, vi } from "vitest";

import {
  compareInformationPriority,
  disclosureStepIndex,
  filterNoise,
  maxPriority,
  nextDisclosureLevel,
  priorityFromSeverity,
  severityForPriority,
  sortPanelsByPriority,
} from "@/lib/information-architecture";
import {
  confidenceBandFromScore01,
  mapHealthToSeverity,
  normalizeSeverityLabel,
  observabilityCompositeScore,
  unifiedReadinessNarration,
} from "@/lib/observability-model";
import { densityProseClass } from "@/lib/data-density";
import {
  clearInvestigationSnapshot,
  continueInvestigationHint,
  readInvestigationSnapshot,
  recordInvestigationJump,
  relatedWorkspaceJumps,
} from "@/lib/workspace-continuity";

describe("information hierarchy & noise", () => {
  it("orders CRITICAL before BACKGROUND", () => {
    expect(compareInformationPriority("CRITICAL", "BACKGROUND")).toBeLessThan(0);
    expect(maxPriority("NORMAL", "HIGH")).toBe("HIGH");
  });

  it("sorts panels by priority", () => {
    const sorted = sortPanelsByPriority([
      { id: "b", priority: "BACKGROUND" },
      { id: "a", priority: "CRITICAL" },
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["a", "b"]);
  });

  it("suppresses BACKGROUND when executive-style cap requested", () => {
    const out = filterNoise(
      [
        { id: "a", priority: "CRITICAL" },
        { id: "b", priority: "BACKGROUND" },
      ],
      true,
    );
    expect(out.map((x) => x.id)).toEqual(["a"]);
  });

  it("maps severity and priority bidirectionally for main cases", () => {
    expect(priorityFromSeverity("danger")).toBe("CRITICAL");
    expect(severityForPriority("CRITICAL")).toBe("danger");
  });

  it("walks disclosure ladder", () => {
    expect(disclosureStepIndex("SUMMARY")).toBe(0);
    expect(nextDisclosureLevel("EVIDENCE")).toBe("AUDIT_LINEAGE");
    expect(nextDisclosureLevel("AUDIT_LINEAGE")).toBeNull();
  });
});

describe("observability normalization", () => {
  it("normalizes severity and readiness labels", () => {
    expect(normalizeSeverityLabel("danger")).toMatch(/krit/i);
    expect(unifiedReadinessNarration("audit_ready")).toMatch(/spremno/i);
  });

  it("maps health band to severity", () => {
    expect(mapHealthToSeverity("healthy")).toBe("success");
    expect(mapHealthToSeverity("critical")).toBe("danger");
  });

  it("computes confidence bands and composite score", () => {
    expect(confidenceBandFromScore01(0.8)).toBe("high");
    expect(observabilityCompositeScore([{ weight: 1, score01: 0.5 }])).toBe(50);
  });
});

describe("adaptive data density", () => {
  it("selects different prose classes per density mode", () => {
    const modes = ["compact", "comfortable", "analytical"] as const;
    const classes = modes.map((m) => densityProseClass(m));
    expect(new Set(classes).size).toBe(3);
  });
});

describe("investigation continuity", () => {
  const store: Record<string, string> = {};

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it("records and reads snapshot for cross-workspace memory", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });

    recordInvestigationJump({
      workspace: "governance",
      route: "/dashboard/governance",
      title: "Audit trag",
      subtitle: "Pregled",
    });
    const snap = readInvestigationSnapshot();
    expect(snap?.title).toBe("Audit trag");
    expect(continueInvestigationHint(snap)?.label).toMatch(/Nastavi/i);
    expect(relatedWorkspaceJumps(snap).length).toBeGreaterThan(0);
    clearInvestigationSnapshot();
    expect(readInvestigationSnapshot()).toBeNull();
  });
});
