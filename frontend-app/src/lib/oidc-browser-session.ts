import { getConforaApiConfig } from "@/lib/api/api-config";

export type BrowserSession = {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly string[];
  readonly mfaVerified: boolean;
};

export type SessionLostReason = "expired" | "session";

type SessionLostHandler = (reason: SessionLostReason) => void;

let sessionLostHandler: SessionLostHandler | null = null;

const TOKEN_FIELDS = ["access_token", "refresh_token", "id_token", "accessToken", "refreshToken", "idToken"] as const;

export function setSessionLostHandler(handler: SessionLostHandler): void {
  sessionLostHandler = handler;
}

export function noteSessionLost(reason: SessionLostReason): void {
  sessionLostHandler?.(reason);
}

function nestBase(): string {
  return getConforaApiConfig().nestBaseUrl.replace(/\/$/, "");
}

function lostReason(response: Response): SessionLostReason {
  return response.headers.get("X-Confora-Session") === "expired" ? "expired" : "session";
}

function readSession(value: unknown): BrowserSession | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (TOKEN_FIELDS.some((field) => field in record)) return null;
  const userId = record["userId"];
  const email = record["email"];
  const displayName = record["displayName"];
  const roles = record["roles"];
  const mfaVerified = record["mfaVerified"];
  if (typeof userId !== "string" || typeof email !== "string" || typeof displayName !== "string") return null;
  if (!Array.isArray(roles) || roles.some((role) => typeof role !== "string")) return null;
  if (typeof mfaVerified !== "boolean") return null;
  return { userId, email, displayName, roles, mfaVerified };
}

export async function fetchBrowserSession(): Promise<BrowserSession | SessionLostReason | "anonymous"> {
  const response = await fetch(`${nestBase()}/v1/auth/session`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (response.status === 401) {
    return response.headers.get("X-Confora-Session") === "expired" ? "expired" : "anonymous";
  }
  if (!response.ok) return "anonymous";
  return readSession(await response.json()) ?? "anonymous";
}

export async function refreshOidcSession(): Promise<boolean> {
  const response = await fetch(`${nestBase()}/v1/auth/oidc/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });
  if (response.ok) return true;
  noteSessionLost(lostReason(response));
  return false;
}

export async function logoutBrowserSession(): Promise<string | null> {
  const response = await fetch(`${nestBase()}/v1/auth/oidc/logout`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });
  if (!response.ok) return null;
  const body: unknown = await response.json();
  if (!body || typeof body !== "object") return null;
  const url = (body as { endSessionUrl?: unknown }).endSessionUrl;
  return typeof url === "string" && url.startsWith("http") ? url : null;
}

export function oidcLoginUrl(returnTo: string, promptLogin: boolean): string {
  const url = new URL(`${nestBase()}/v1/auth/oidc/login`);
  url.searchParams.set("return_to", returnTo.startsWith("/") ? returnTo : "/dashboard");
  if (promptLogin) url.searchParams.set("prompt", "login");
  return url.toString();
}
