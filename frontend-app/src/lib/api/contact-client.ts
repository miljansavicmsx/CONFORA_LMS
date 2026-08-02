import {
  buildContactMessageSummary,
  resolveContactRequestType,
  type ContactRequestType,
} from "./contact-category.util";
import { isContactCanonicalEnabled } from "./contact-canonical-flag";
import { normalizeApiError, type NormalizedApiError } from "./api-error";
import { authorizationHeaderValue } from "./auth-token-provider";
import { buildConforaApiUrl } from "./api-provider";

export const CANONICAL_CONTACT_SUBMIT_PATH = "/v1/public/contact-requests";
export const LEGACY_CONTACT_SUBMIT_PATH = "/v1/public/contact";

/** @deprecated Use CANONICAL_CONTACT_SUBMIT_PATH — kept for tests and legacy fallback. */
export const CONTACT_SUBMIT_PATH = CANONICAL_CONTACT_SUBMIT_PATH;

export type PublicContactFormInput = {
  readonly category: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly subject: string;
  readonly body: string;
  readonly decisionType?: string;
  readonly decisionRef?: string;
  readonly isAnonymousComplaint: boolean;
  readonly captchaToken: string;
  readonly attachments?: FileList | null;
};

export type PublicContactSubmitResult = {
  readonly publicReference: string;
  readonly status: string;
  readonly submittedAt?: string | null;
  readonly nextStep?: string;
};

export type PublicContactStatusResult = {
  readonly publicReference: string;
  readonly status: string;
  readonly submittedAt: string | null;
  readonly nextStep: string;
};

export type CanonicalContactRequestBody = {
  readonly requestType: ContactRequestType;
  readonly subject: string;
  readonly messageSummary: string;
  readonly isAnonymous?: boolean;
  readonly requesterName?: string;
  readonly requesterContact?: string;
};

const SAFE_SUBMIT_KEYS = new Set(["publicReference", "status", "submittedAt", "nextStep", "message"]);
const SAFE_STATUS_KEYS = new Set(["publicReference", "status", "submittedAt", "nextStep"]);

function pickSafeFields(
  data: unknown,
  allowed: ReadonlySet<string>,
): Record<string, unknown> {
  if (!data || typeof data !== "object") {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in (data as Record<string, unknown>)) {
      out[key] = (data as Record<string, unknown>)[key];
    }
  }
  return out;
}

export function buildCanonicalContactRequestBody(input: PublicContactFormInput): CanonicalContactRequestBody {
  const isAnonymous = input.category === "complaint" && input.isAnonymousComplaint;
  const messageSummary = buildContactMessageSummary({
    body: input.body,
    ...(input.phone.trim() ? { phone: input.phone } : {}),
    ...(input.decisionType?.trim() ? { decisionType: input.decisionType } : {}),
    ...(input.decisionRef?.trim() ? { decisionRef: input.decisionRef } : {}),
  });

  const result: CanonicalContactRequestBody = {
    requestType: resolveContactRequestType(input.category),
    subject: input.subject.trim(),
    messageSummary,
    isAnonymous,
  };

  if (!isAnonymous) {
    const name = input.name.trim();
    const email = input.email.trim();
    return {
      ...result,
      ...(name ? { requesterName: name } : {}),
      ...(email ? { requesterContact: email } : {}),
    };
  }

  return result;
}

function parseSubmitResponse(data: unknown): PublicContactSubmitResult {
  const safe = pickSafeFields(data, SAFE_SUBMIT_KEYS);
  const publicReference =
    typeof safe.publicReference === "string"
      ? safe.publicReference
      : typeof (data as { ticketNumber?: string })?.ticketNumber === "string"
        ? (data as { ticketNumber: string }).ticketNumber
        : "";
  if (!publicReference.trim()) {
    throw {
      status: 502,
      code: "HTTP_ERROR",
      message: "INVALID_RESPONSE",
    } satisfies NormalizedApiError;
  }
  const result: PublicContactSubmitResult = {
    publicReference: publicReference.trim(),
    status: typeof safe.status === "string" ? safe.status : "SUBMITTED",
    submittedAt: typeof safe.submittedAt === "string" ? safe.submittedAt : null,
  };
  if (typeof safe.nextStep === "string" && safe.nextStep.trim()) {
    return { ...result, nextStep: safe.nextStep.trim() };
  }
  return result;
}

function parseStatusResponse(data: unknown): PublicContactStatusResult {
  const safe = pickSafeFields(data, SAFE_STATUS_KEYS);
  const publicReference = typeof safe.publicReference === "string" ? safe.publicReference.trim() : "";
  if (!publicReference) {
    throw {
      status: 502,
      code: "HTTP_ERROR",
      message: "INVALID_RESPONSE",
    } satisfies NormalizedApiError;
  }
  return {
    publicReference,
    status: typeof safe.status === "string" ? safe.status : "UNKNOWN",
    submittedAt: typeof safe.submittedAt === "string" ? safe.submittedAt : null,
    nextStep: typeof safe.nextStep === "string" ? safe.nextStep : "",
  };
}

async function readApiError(res: Response): Promise<NormalizedApiError> {
  let normalized: NormalizedApiError = {
    status: res.status,
    code: "HTTP_ERROR",
    message: res.statusText || "HTTP_ERROR",
  };
  try {
    const body: unknown = await res.json();
    normalized = normalizeApiError({
      response: { status: res.status, data: body },
      isAxiosError: true,
    });
  } catch {
    /* non-JSON error body */
  }
  return normalized;
}

function publicFetchHeaders(includeAuth: boolean): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (includeAuth) {
    const auth = authorizationHeaderValue();
    if (auth) {
      (headers as Record<string, string>).Authorization = auth;
    }
  }
  return headers;
}

/** Canonical public contact submit — JSON POST /v1/public/contact-requests. */
export async function submitContactRequest(
  input: PublicContactFormInput,
): Promise<PublicContactSubmitResult> {
  if (input.attachments && input.attachments.length > 0) {
    throw {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "ATTACHMENTS_NOT_SUPPORTED",
    } satisfies NormalizedApiError;
  }

  const res = await fetch(buildConforaApiUrl(CANONICAL_CONTACT_SUBMIT_PATH), {
    method: "POST",
    headers: {
      ...publicFetchHeaders(true),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildCanonicalContactRequestBody(input)),
    credentials: "omit",
  });

  if (!res.ok) {
    throw await readApiError(res);
  }

  const data: unknown = await res.json();
  return parseSubmitResponse(data);
}

/** Legacy compatibility alias — multipart POST /v1/public/contact (explicit fallback only). */
export async function submitLegacyPublicContact(
  input: PublicContactFormInput,
): Promise<PublicContactSubmitResult> {
  const fd = new FormData();
  fd.set("category", input.category);
  fd.set("name", input.name.trim());
  fd.set("email", input.email.trim());
  fd.set("phone", input.phone.trim());
  fd.set("subject", input.subject.trim());
  fd.set("body", input.body.trim());
  fd.set("captchaToken", input.captchaToken.trim());
  if (input.category === "complaint" && input.isAnonymousComplaint) {
    fd.set("isAnonymousComplaint", "true");
  }
  if (input.category === "appeal") {
    fd.set("decisionType", (input.decisionType ?? "").trim());
    fd.set("decisionRef", (input.decisionRef ?? "").trim());
  }
  if (input.attachments) {
    for (let i = 0; i < input.attachments.length; i += 1) {
      const f = input.attachments.item(i);
      if (f) {
        fd.append("attachments", f);
      }
    }
  }

  const headers: HeadersInit = {};
  const auth = authorizationHeaderValue();
  if (auth) {
    headers.Authorization = auth;
  }

  const res = await fetch(buildConforaApiUrl(LEGACY_CONTACT_SUBMIT_PATH), {
    method: "POST",
    body: fd,
    headers,
    credentials: "omit",
  });

  if (!res.ok) {
    throw await readApiError(res);
  }

  const data: unknown = await res.json();
  return parseSubmitResponse(data);
}

/**
 * Public contact submit — canonical by default (F4-8b).
 * Legacy alias only when VITE_CONTACT_CANONICAL_ENABLED=false.
 */
export async function submitPublicContact(
  input: PublicContactFormInput,
): Promise<PublicContactSubmitResult> {
  if (isContactCanonicalEnabled()) {
    return submitContactRequest(input);
  }
  return submitLegacyPublicContact(input);
}

/** GET /v1/public/contact-requests/:publicReference — minimal public status. */
export async function getPublicContactRequestStatus(
  publicReference: string,
): Promise<PublicContactStatusResult> {
  const ref = publicReference.trim();
  if (!ref) {
    throw {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "REFERENCE_REQUIRED",
    } satisfies NormalizedApiError;
  }

  const path = `${CANONICAL_CONTACT_SUBMIT_PATH}/${encodeURIComponent(ref)}`;
  const res = await fetch(buildConforaApiUrl(path), {
    method: "GET",
    headers: publicFetchHeaders(false),
    credentials: "omit",
  });

  if (res.status === 404) {
    throw {
      status: 404,
      code: "NOT_FOUND",
      message: "NOT_FOUND",
    } satisfies NormalizedApiError;
  }

  if (!res.ok) {
    throw await readApiError(res);
  }

  const data: unknown = await res.json();
  return parseStatusResponse(data);
}
