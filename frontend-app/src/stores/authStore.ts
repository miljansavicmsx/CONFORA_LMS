import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = { readonly id?: string; readonly userId?: string; readonly email?: string; readonly name?: string; readonly role?: string };
export type AuthState = {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly user: AuthUser | null;
  readonly cognitoGroups: readonly string[];
  readonly isAuthenticated: boolean;
  login: (tokens: { readonly access_token: string; readonly refresh_token: string }, user?: AuthUser, cognitoGroups?: readonly string[]) => void;
  logout: () => void;
};

const EMPTY_STATE = { accessToken: null, refreshToken: null, user: null, cognitoGroups: [], isAuthenticated: false } as const;

/** Owner-authorized existing `confora-auth` persistence; client state never substitutes server authorization. */
export const useAuthStore = create<AuthState>()(persist((set) => ({
  ...EMPTY_STATE,
  login: (tokens, user, cognitoGroups = []) => {
    const accessToken = tokens.access_token.trim();
    const refreshToken = tokens.refresh_token.trim();
    if (!accessToken || !refreshToken) { set(EMPTY_STATE); return; }
    set({ accessToken, refreshToken, user: user ?? null, cognitoGroups: [...cognitoGroups], isAuthenticated: true });
  },
  logout: () => set(EMPTY_STATE),
}), {
  name: "confora-auth",
  partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken, user: state.user, cognitoGroups: state.cognitoGroups, isAuthenticated: Boolean(state.accessToken && state.refreshToken) }),
  merge: (persistedState, currentState) => {
    const persisted = persistedState as Partial<AuthState> | null;
    const accessToken = typeof persisted?.accessToken === "string" && persisted.accessToken.trim() ? persisted.accessToken.trim() : null;
    const refreshToken = typeof persisted?.refreshToken === "string" && persisted.refreshToken.trim() ? persisted.refreshToken.trim() : null;
    if (!accessToken || !refreshToken) return { ...currentState, ...EMPTY_STATE };
    return { ...currentState, ...persisted, accessToken, refreshToken, isAuthenticated: true, cognitoGroups: Array.isArray(persisted?.cognitoGroups) ? persisted.cognitoGroups : [] };
  },
}));
