import { refreshOidcSession } from "@/lib/oidc-browser-session";

/**
 * Rotates the server-side OIDC session. The browser never sees the refresh token.
 */
export async function refreshAccessToken(_refreshToken?: string): Promise<string> {
  const refreshed = await refreshOidcSession();
  if (!refreshed) {
    throw new Error("oidc.session.rejected");
  }
  return "";
}
