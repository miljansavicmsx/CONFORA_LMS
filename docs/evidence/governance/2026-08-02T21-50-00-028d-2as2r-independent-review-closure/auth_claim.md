# Auth claim — CANONICAL_PERSISTED_AUTH_CONTINUITY_VERIFIED

The complaint HTTP token provider:

- reads the existing Zustand persistence envelope `confora-auth`;
- extracts `state.accessToken` and `state.refreshToken`;
- introduces zero new storage keys;
- introduces zero new token-write targets (refresh/clear update the same envelope);
- performs zero legacy token-key reads or writes;
- imports zero `authStore`, Zustand, `nest-auth-pilot`, or RBAC/access modules.

Qualified description:

> S2R added a canonical persisted-state read bridge and preserved the existing
> bounded refresh/clear operations against the same `confora-auth` envelope.
