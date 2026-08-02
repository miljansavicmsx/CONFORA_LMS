import axios from "axios";

import { refresh as authClientRefresh } from "@/lib/api/auth-client";
import { setAccessToken, setTokens } from "@/lib/api/auth-token-provider";
import { buildConforaApiUrl } from "@/lib/api/api-provider";
import { isNestAuthPilotActive } from "@/lib/nest-auth-pilot";

export type RefreshTokenResponse = {
  readonly access_token: string;
  readonly expires_in: number;
  readonly refresh_token?: string;
};

/**
 * POST /auth/refresh — legacy Bearer transport, or auth-client JSON body when Nest pilot is active.
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  if (isNestAuthPilotActive()) {
    const result = await authClientRefresh(refreshToken);
    if (result.kind === "error") {
      throw new Error(result.normalized.message);
    }
    const { access_token, refresh_token: rotated } = result.data;
    if (typeof rotated === "string" && rotated.trim().length > 0 && rotated !== refreshToken) {
      setTokens({ accessToken: access_token, refreshToken: rotated });
    } else {
      setAccessToken(access_token);
    }
    return access_token;
  }

  const { data } = await axios.post<RefreshTokenResponse>(
    buildConforaApiUrl("/auth/refresh"),
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  return data.access_token;
}
