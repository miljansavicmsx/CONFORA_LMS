import { api } from "@/lib/api";
import { normalizeApiError } from "@/lib/api/api-error";

export type PasswordLoginResponse = { readonly access_token: string; readonly refresh_token: string; readonly expires_in?: number };
export type PasswordLoginResult = { readonly kind: "ok"; readonly data: PasswordLoginResponse } | { readonly kind: "error"; readonly normalized: ReturnType<typeof normalizeApiError> };

export async function loginWithPassword(email: string, password: string): Promise<PasswordLoginResult> {
  try { const { data } = await api.post<PasswordLoginResponse>("/auth/login", { email, password }); return { kind: "ok", data }; }
  catch (error) { return { kind: "error", normalized: normalizeApiError(error) }; }
}
