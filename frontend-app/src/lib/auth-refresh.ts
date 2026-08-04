import axios from "axios";

import { setAccessToken } from "@/lib/api/auth-token-provider";
import { buildConforaApiUrl } from "@/lib/api/api-provider";

export type RefreshTokenResponse = {
  readonly access_token: string;
  readonly expires_in: number;
  readonly refresh_token?: string;
};

/**
 * 028D-2aS2: legacy Bearer refresh only.
 * Nest-pilot auth-client / nest-auth-pilot branching is excluded so the
 * complaint HTTP stack does not pull RBAC/access overreach modules.
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
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
  setAccessToken(data.access_token);
  return data.access_token;
}
