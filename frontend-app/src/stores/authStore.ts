import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { evaluateContentEditorAccess } from "@/lib/content-editor-access";
import { extractCognitoGroupsFromToken } from "@/lib/jwt-payload";
import type { User } from "@/types/lms-stores";

export type AuthTokens = {
  readonly access_token: string;
  readonly refresh_token: string;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** Grupе iz JWT (`cognito:groups`); ažurira se pri loginu i refreshu. */
  cognitoGroups: readonly string[];
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  /** Nakon uspješnog /auth/refresh (refresh token ostaje isti). */
  setAccessToken: (accessToken: string) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      cognitoGroups: [],
      isAuthenticated: false,

      login: (tokens) =>
        set((s) => {
          s.accessToken = tokens.access_token;
          s.refreshToken = tokens.refresh_token;
          s.isAuthenticated = true;
          s.cognitoGroups = extractCognitoGroupsFromToken(tokens.access_token);
        }),

      logout: () =>
        set((s) => {
          s.user = null;
          s.accessToken = null;
          s.refreshToken = null;
          s.cognitoGroups = [];
          s.isAuthenticated = false;
        }),

      setUser: (user) =>
        set((s) => {
          s.user = user;
        }),

      setAccessToken: (accessToken) =>
        set((s) => {
          s.accessToken = accessToken;
          s.isAuthenticated = Boolean(accessToken);
          s.cognitoGroups = extractCognitoGroupsFromToken(accessToken);
        }),
    })),
    {
      name: "confora-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      /**
       * Zustand merge: `{ ...current, ...persisted }` — stari snimak s diska može završiti
       * *nakon* `login()` i prepisati token `null`. In-memory token uvijek ima prednost.
       */
      merge: (persistedState, currentState) => {
        const p = (persistedState ?? {}) as Partial<AuthState>;
        const c = currentState as AuthState;
        const base = { ...c, ...p };
        if (c.accessToken) {
          const merged = {
            ...base,
            accessToken: c.accessToken,
            refreshToken: c.refreshToken ?? base.refreshToken ?? null,
            isAuthenticated: true,
          } as AuthState;
          merged.cognitoGroups = extractCognitoGroupsFromToken(merged.accessToken);
          return merged;
        }
        const out = base as AuthState;
        out.cognitoGroups = extractCognitoGroupsFromToken(out.accessToken);
        return out;
      },
    },
  ),
);

/**
 * Curriculum / content admin pristup (JWT `cognito:groups` + opcionalno `user.role` iz storea).
 * Za ulogu iz dashboard konteksta proslijedi `roleOverride` (npr. `/auth/me`).
 */
export function isContentEditor(roleOverride?: string | null): boolean {
  const s = useAuthStore.getState();
  return evaluateContentEditorAccess({
    cognitoGroups: s.cognitoGroups,
    roleFromProfile: roleOverride ?? s.user?.role,
  });
}

/** Isto što i `isContentEditor` — “admin” u smislu zaštite admin ruta u ovom LMS-u. */
export function isAdmin(roleOverride?: string | null): boolean {
  return isContentEditor(roleOverride);
}
