import axios from "axios";

/** Machine-oriented error code for i18n lookup (no user-facing copy here). */
export type ApiErrorCode =
  | "HTTP_ERROR"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "UNKNOWN";

export type NormalizedApiError = {
  readonly status: number;
  readonly code: ApiErrorCode;
  /** Developer/log message — UI must translate via i18n keys, not display raw when avoidable. */
  readonly message: string;
  readonly details?: readonly string[];
  readonly raw?: unknown;
};

function statusToCode(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status >= 400 && status < 500) return "VALIDATION_ERROR";
  return "HTTP_ERROR";
}

function extractMessageFromBody(body: unknown): { message: string; details?: readonly string[] } {
  if (!body || typeof body !== "object") {
    return { message: "HTTP_ERROR" };
  }
  const o = body as Record<string, unknown>;

  if (typeof o.message === "string" && o.message.trim()) {
    return { message: o.message.trim() };
  }
  if (Array.isArray(o.message)) {
    const details = o.message.filter((x): x is string => typeof x === "string");
    return { message: "VALIDATION_ERROR", details };
  }

  if (typeof o.detail === "string" && o.detail.trim()) {
    return { message: o.detail.trim() };
  }
  if (Array.isArray(o.detail)) {
    const details = o.detail.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "msg" in item) {
        return String((item as { msg: unknown }).msg);
      }
      return JSON.stringify(item);
    });
    return { message: "VALIDATION_ERROR", details };
  }

  if (typeof o.error === "string" && o.error.trim()) {
    return { message: o.error.trim() };
  }

  return { message: "HTTP_ERROR" };
}

export function normalizeApiError(err: unknown): NormalizedApiError {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      const status = err.response.status;
      const parsed = extractMessageFromBody(err.response.data);
      return {
        status,
        code: statusToCode(status),
        message: parsed.message,
        ...(parsed.details ? { details: parsed.details } : {}),
        raw: err.response.data,
      };
    }
    if (err.request) {
      return {
        status: 0,
        code: "NETWORK_ERROR",
        message: err.message || "NETWORK_ERROR",
        raw: err.message,
      };
    }
  }

  if (err instanceof Error) {
    return {
      status: 0,
      code: "UNKNOWN",
      message: err.message,
      raw: err,
    };
  }

  return {
    status: 0,
    code: "UNKNOWN",
    message: "UNKNOWN",
    raw: err,
  };
}

export function isNormalizedApiError(err: unknown): err is NormalizedApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "status" in err &&
    "message" in err
  );
}
