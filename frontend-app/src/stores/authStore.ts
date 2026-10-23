import { create } from "zustand";

import { purgePersistedAuthSecrets } from "@/lib/api/auth-token-provider";
import {
  fetchBrowserSession,
  logoutBrowserSession,
  setSessionLostHandler,
  type BrowserSession,
  type SessionLostReason,
} from "@/lib/oidc-browser-session";

export type AuthUser = {
  readonly id?: string;
  readonly userId?: string;
  readonly email?: string;
  readonly name?: string;
  readonly role?: string;
};

type AuthStatus = "unknown" | "authenticated" | "anonymous";

export type AuthState = {
  readonly status: AuthStatus;
  readonly user: AuthUser | null;
  readonly roles: readonly string[];
  readonly cognitoGroups: readonly string[];
  readonly isAuthenticated: boolean;
  readonly lostReason: SessionLostReason | null;
  restore: () => Promise<void>;
  logout: () => Promise<void>;
};

const ANONYMOUS = {
  status: "anonymous" as const,
  user: null,
  roles: [] as readonly string[],
  cognitoGroups: [] as readonly string[],
  isAuthenticated: false,
};

function fromSession(session: BrowserSession): Pick<AuthState, "status" | "user" | "roles" | "cognitoGroups" | "isAuthenticated" | "lostReason"> {
  return {
    status: "authenticated",
    isAuthenticated: true,
    lostReason: null,
    roles: session.roles,
    cognitoGroups: [...session.roles],
    user: {
      id: session.userId,
      userId: session.userId,
      email: session.email,
      name: session.displayName,
      role: session.roles[0]?.toLowerCase() ?? "",
    },
  };
}

purgePersistedAuthSecrets();

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  user: null,
  roles: [],
  cognitoGroups: [],
  isAuthenticated: false,
  lostReason: null,
  restore: async () => {
    const result = await fetchBrowserSession();
    if (result === "expired") {
      set({ ...ANONYMOUS, lostReason: "expired" });
      return;
    }
    if (result === "anonymous" || result === "session") {
      set({ ...ANONYMOUS, lostReason: null });
      return;
    }
    set(fromSession(result));
  },
  logout: async () => {
    const endSessionUrl = await logoutBrowserSession();
    set({ ...ANONYMOUS, lostReason: "session" });
    if (endSessionUrl) {
      window.location.assign(endSessionUrl);
      return;
    }
    window.location.assign("/login?reason=signed-out");
  },
}));

setSessionLostHandler((reason) => {
  useAuthStore.setState({ ...ANONYMOUS, lostReason: reason });
  if (window.location.pathname.startsWith("/dashboard")) {
    window.location.assign(`/login?reason=${reason}`);
  }
});
