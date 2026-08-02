import axios from "axios";

/** Poruka za korisnika; tehničke greške samo u dev modu. */

/**
 * Backend route ABAC (``route_abac.deny_http_detail``) često vraća
 * FastAPI tijelo `{ detail: { code, reasonCode, resourceType, ... } }`.
 */
type AbacErrorDetail = {
  readonly code?: string;
  readonly reasonCode?: string;
  readonly message?: string;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly violatedPolicies?: readonly unknown[];
  readonly missingRequirements?: readonly unknown[];
  readonly allowedTransitions?: readonly unknown[];
};

function _unwrapDetailPayload(detail: unknown): unknown {
  if (detail !== null && typeof detail === "object") {
    const inner = (detail as { detail?: unknown }).detail;
    if (inner !== null && typeof inner === "object") {
      return inner;
    }
  }
  return detail;
}

function _asAbacDetail(detail: unknown): AbacErrorDetail | null {
  const d = _unwrapDetailPayload(detail);
  if (typeof d !== "object" || d === null || !("code" in d)) {
    return null;
  }
  return d as AbacErrorDetail;
}

function _userMessageForAbacDetail(abac: AbacErrorDetail): string | null {
  const code = (abac.code ?? "").trim();

  if (code === "WORKFLOW_TRANSITION_DENIED") {
    return "Ova promjena statusa nije dozvoljena u trenutnom koraku procesa.";
  }
  const rc = (abac.reasonCode ?? "").trim();

  if (code === "SOD_HARD_BLOCK" || rc === "BLOCKED_BY_SOD") {
    return "Akcija je blokirana pravilima razdvajanja funkcija.";
  }
  if (code === "COMPETENCE_REQUIRED" || rc.includes("COMPETENCE")) {
    return "Nedostaje aktivna kompetencija.";
  }
  if (code === "TENANT_ISOLATION") {
    return "Pristup nije dozvoljen zbog pravila izolacije klijenta.";
  }
  if (rc === "COMMITTEE_SCOPE_REQUIRED" || rc === "RESOURCE_ASSIGNMENT_REQUIRED") {
    return "Prijava nije dodijeljena vašem odboru.";
  }
  if (code === "QUERY_SCOPE_DENIED") {
    return "Ovaj pregled liste nije dostupan za traženi opseg tenant-a.";
  }
  if (code === "PROJECTION_RESTRICTED") {
    return "Podaci su ograničeni radi zaštite povjerljivih informacija.";
  }
  if (code === "ABAC_ACCESS_DENIED") {
    return "Pristup nije dozvoljen za ovu prijavu.";
  }
  return null;
}

function _detailString(data: unknown): string {
  if (typeof data !== "object" || data === null || !("detail" in data)) {
    return "";
  }
  const d = (data as { detail?: unknown }).detail;
  if (typeof d === "string") {
    return d;
  }
  if (d !== null && typeof d === "object" && "code" in d) {
    return JSON.stringify(d);
  }
  return String(d ?? "");
}

export function formatUserFacingError(error: unknown): {
  readonly message: string;
  readonly devDetail: string | null;
} {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const detail = _detailString(data);

    const rawDetail =
      typeof data === "object" && data !== null && "detail" in data
        ? (data as { detail?: unknown }).detail
        : null;
    const abacFromDetail = rawDetail !== null ? _asAbacDetail(rawDetail) : null;

    /** 403/409 uz ABAC / workflow struktura */
    const abacMessage =
      (status === 403 || status === 409) && abacFromDetail
        ? _userMessageForAbacDetail(abacFromDetail)
        : null;

    if (status === 409 && abacFromDetail) {
      const wfCode = (abacFromDetail.code ?? "").trim();
      if (wfCode === "WORKFLOW_TRANSITION_DENIED") {
        const dev =
          import.meta.env.DEV
            ? JSON.stringify({
                workflowType: (abacFromDetail as { workflowType?: string }).workflowType,
                fromStatus: (abacFromDetail as { fromStatus?: string }).fromStatus,
                toStatus: (abacFromDetail as { toStatus?: string }).toStatus,
                action: (abacFromDetail as { action?: string }).action,
                allowedTransitions: abacFromDetail.allowedTransitions,
              })
            : null;
        return {
          message: "Ova promjena statusa nije dozvoljena u trenutnom koraku procesa.",
          devDetail: dev,
        };
      }
      if (abacMessage) {
        return {
          message: abacMessage,
          devDetail:
            import.meta.env.DEV && abacFromDetail
              ? JSON.stringify(abacFromDetail)
              : null,
        };
      }
    }

    /** Legacy oblik SOD (detail.code bez reasonCode ili stariji testovi) */
    if (status === 409 && typeof data === "object" && data !== null && "detail" in data) {
      const d = (data as { detail?: unknown }).detail;
      if (
        d !== null &&
        typeof d === "object" &&
        "code" in d &&
        (d as { code?: string }).code === "SOD_HARD_BLOCK"
      ) {
        return {
          message:
            "Ovu akciju nije moguće izvršiti zbog pravila razdvajanja funkcija.",
          devDetail:
            import.meta.env.DEV && typeof d === "object" && d !== null
              ? JSON.stringify(d)
              : null,
        };
      }
    }

    if (status === 401 || status === 403) {
      if (abacMessage) {
        return {
          message: abacMessage,
          devDetail:
            import.meta.env.DEV && abacFromDetail
              ? JSON.stringify(abacFromDetail)
              : detail || error.message,
        };
      }
      return {
        message: "Nemate ovlast za ovu radnju ili je sesija istekla. Prijavite se ponovo.",
        devDetail: detail || error.message,
      };
    }

    if (status === 404) {
      return {
        message: "Traženi podaci nisu pronađeni.",
        devDetail: detail || error.message,
      };
    }

    if (status && status >= 500) {
      return {
        message: "Došlo je do greške na poslužitelju pri učitavanju podataka. Pokušajte ponovo za nekoliko trenutaka.",
        devDetail: detail || error.message,
      };
    }

    return {
      message: "Došlo je do greške pri učitavanju podataka. Pokušajte ponovo.",
      devDetail: detail || error.message || null,
    };
  }

  if (error instanceof Error && error.message) {
    return {
      message: "Došlo je do neočekivane greške. Pokušajte ponovo.",
      devDetail: error.message,
    };
  }

  return {
    message: "Došlo je do greške pri učitavanju podataka. Pokušajte ponovo.",
    devDetail: null,
  };
}
