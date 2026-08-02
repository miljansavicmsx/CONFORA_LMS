import { describe, expect, it } from "vitest";

import {
  buildCapaNonconformityRelationships,
  buildCertificateWalletRelationships,
  buildHorizontalLineageLayout,
  buildPublicVerifyRelationships,
  buildRegistryCertificateRelationships,
  buildTrustNavigationExplainerEdges,
} from "@/lib/entity-relationships";
import { resolveEntityNavigation } from "@/lib/entity-relationships/relationship-navigation";

describe("relationship builders", () => {
  it("builds wallet edges for verification hash", () => {
    const edges = buildCertificateWalletRelationships({
      certificateId: "c1",
      certificateKind: "X",
      credentialWalletCategory: "certification",
      documentTypeLabel: "Cert",
      title: "T",
      courseName: null,
      certificationLevel: null,
      certificateNumber: "n",
      issueDate: null,
      expiryDate: null,
      lifecycleStatus: "ACTIVE",
      qrHash: "a".repeat(64),
      pdfUrl: null,
      learnerVerifyPath: "/verify/abc",
      publicVerificationUrl: null,
      supersededByCertificateId: null,
    });
    expect(edges.some((e) => e.targetType === "VERIFICATION_HASH")).toBe(true);
  });

  it("maps CAPA source reference to complaint target type", () => {
    const edges = buildCapaNonconformityRelationships(
      {
        nonconformityId: "ncr1",
        sourceType: "COMPLAINT",
        sourceReferenceId: "cmp1",
        title: "Issue",
      },
      [{ capaId: "capa1", actionType: "CORRECTIVE", status: "OPEN" }],
    );
    expect(edges.find((e) => e.relationshipType === "TRIGGERED")?.sourceType).toBe("COMPLAINT");
  });

  it("builds registry edges for application + hash", () => {
    const edges = buildRegistryCertificateRelationships({
      certificateId: "c1",
      holderName: "Alice",
      certificateType: "PERSON",
      status: "ACTIVE",
      issuedAt: null,
      expiresAt: null,
      verificationHash: "ab",
      linkedApplicationId: "app9",
      learnerVerifyPath: "/x",
      publicVerificationUrl: null,
    });
    expect(edges.length).toBeGreaterThanOrEqual(2);
  });

  it("builds public verify edges", () => {
    const edges = buildPublicVerifyRelationships(
      {
        certificateId: "c1",
        fullName: "Bob",
        courseName: "ISO",
        issueDate: null,
        expiryDate: null,
        status: "ACTIVE",
      },
      "h".repeat(64),
    );
    expect(edges.some((e) => e.relationshipType === "EVIDENCE_FOR")).toBe(true);
  });

  it("provides trust explainer graph", () => {
    expect(buildTrustNavigationExplainerEdges().length).toBeGreaterThanOrEqual(2);
  });
});

describe("relationship graph layout", () => {
  it("truncates large trees", () => {
    const edges = buildTrustNavigationExplainerEdges();
    const layout = buildHorizontalLineageLayout(
      { id: "learner", type: "PROCESS", label: "Learner" },
      edges,
      { maxNodes: 3 },
    );
    expect(layout.truncated || layout.nodes.length <= 3).toBe(true);
  });
});

describe("navigation", () => {
  it("resolves internal CAPA route", () => {
    const n = resolveEntityNavigation("CAPA", "x");
    expect(n.kind).toBe("internal");
  });
});
