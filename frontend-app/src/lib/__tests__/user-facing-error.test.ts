import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";

import { formatUserFacingError } from "@/lib/user-facing-error";

function sod409Error() {
  const err = new axios.AxiosError("conflict");
  err.response = {
    status: 409,
    statusText: "Conflict",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data: {
      detail: {
        code: "SOD_HARD_BLOCK",
        message: "Akcija nije dozvoljena zbog pravila razdvajanja funkcija.",
        violations: [{ code: "ITEM_REVIEW_SELF_AUTHOR" }],
      },
    },
  };
  return err;
}

describe("formatUserFacingError", () => {
  it("maps 409 SOD_HARD_BLOCK to SoD user message", () => {
    const { message, devDetail } = formatUserFacingError(sod409Error());
    expect(message).toBe(
      "Akcija je blokirana pravilima razdvajanja funkcija.",
    );
    expect(devDetail).toBeTruthy();
    expect(devDetail).toContain("SOD_HARD_BLOCK");
  });

  it("409 without SOD code uses generic client message", () => {
    const err = new axios.AxiosError("c");
    err.response = {
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: { detail: { reason: "other" } },
    };
    const { message } = formatUserFacingError(err);
    expect(message).toBe("Došlo je do greške pri učitavanju podataka. Pokušajte ponovo.");
  });

  it("maps 403 ABAC COMMITTEE_SCOPE_REQUIRED to committee message", () => {
    const err = new axios.AxiosError("f");
    err.response = {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: {
        detail: {
          code: "ABAC_ACCESS_DENIED",
          reasonCode: "COMMITTEE_SCOPE_REQUIRED",
          message: "x",
          resourceType: "CERTIFICATION_APPLICATION",
          resourceId: "app-1",
          violatedPolicies: [],
          missingRequirements: [],
        },
      },
    };
    expect(formatUserFacingError(err).message).toBe(
      "Prijava nije dodijeljena vašem odboru.",
    );
  });

  it("maps 403 TENANT_ISOLATION to tenant message", () => {
    const err = new axios.AxiosError("f");
    err.response = {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: {
        detail: {
          code: "TENANT_ISOLATION",
          reasonCode: "TENANT_ISOLATION",
          resourceType: "CERTIFICATION_APPLICATION",
          resourceId: "x",
          violatedPolicies: [],
          missingRequirements: [],
        },
      },
    };
    expect(formatUserFacingError(err).message).toBe(
      "Pristup nije dozvoljen zbog pravila izolacije klijenta.",
    );
  });

  it("maps 409 COMPETENCE_REQUIRED to competence message", () => {
    const err = new axios.AxiosError("c");
    err.response = {
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: {
        detail: {
          code: "COMPETENCE_REQUIRED",
          reasonCode: "COMPETENCE_REQUIRED",
          resourceType: "CERTIFICATION_APPLICATION",
          resourceId: "x",
          violatedPolicies: [],
          missingRequirements: [],
        },
      },
    };
    expect(formatUserFacingError(err).message).toBe("Nedostaje aktivna kompetencija.");
  });

  it("maps nested detail.detail ABAC envelope", () => {
    const err = new axios.AxiosError("f");
    err.response = {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: {
        detail: {
          detail: {
            code: "ABAC_ACCESS_DENIED",
            reasonCode: "ABAC_POLICY_BLOCK",
            resourceType: "CERTIFICATION_APPLICATION",
            resourceId: "x",
            violatedPolicies: [],
            missingRequirements: [],
          },
        },
      },
    };
    expect(formatUserFacingError(err).message).toBe(
      "Pristup nije dozvoljen za ovu prijavu.",
    );
  });

  it("maps 403 QUERY_SCOPE_DENIED to query scope message", () => {
    const err = new axios.AxiosError("f");
    err.response = {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: {
        detail: {
          code: "QUERY_SCOPE_DENIED",
          reasonCode: "TENANT_SCOPE_BLOCK",
          resourceType: "RISK_REGISTER_ENTRY",
          resourceId: "query",
          violatedPolicies: [],
          missingRequirements: [],
        },
      },
    };
    expect(formatUserFacingError(err).message).toBe(
      "Ovaj pregled liste nije dostupan za traženi opseg tenant-a.",
    );
  });

  it("404 still uses not-found message", () => {
    const err = new axios.AxiosError("n");
    err.response = {
      status: 404,
      statusText: "Not Found",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: { detail: "missing" },
    };
    expect(formatUserFacingError(err).message).toBe("Traženi podaci nisu pronađeni.");
  });

  it("maps 409 WORKFLOW_TRANSITION_DENIED to workflow user message", () => {
    const err = new axios.AxiosError("w");
    err.response = {
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: {
        detail: {
          code: "WORKFLOW_TRANSITION_DENIED",
          workflowType: "CERTIFICATION_APPLICATION",
          fromStatus: "DRAFT",
          toStatus: "APPROVED",
          action: "x",
          reason: "blocked",
          allowedTransitions: [{ toStatus: "SUBMITTED", action: "submit_application" }],
        },
      },
    };
    expect(formatUserFacingError(err).message).toBe(
      "Ova promjena statusa nije dozvoljena u trenutnom koraku procesa.",
    );
    if (import.meta.env.DEV) {
      const { devDetail } = formatUserFacingError(err);
      expect(devDetail ?? "").toContain("allowedTransitions");
    }
  });
});
