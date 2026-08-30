import type { RbacRole } from '@confora/shared-types';

/**
 * Exact BAR-P03 authenticated actor contract (OD-20).
 * Seven fields only. Sole PII field is email.
 * Never retains raw access token, Authorization header, or full JWT payload.
 */
export interface AuthenticatedActor {
  userId: string;
  tenantId: string;
  issuer: string;
  subject: string;
  email: string;
  roles: RbacRole[];
  mfaVerified: boolean;
}

export const REQUEST_PRINCIPAL_KEY = 'conforaAuthenticatedActor' as const;

export type RequestWithPrincipal = {
  user?: AuthenticatedActor;
  [REQUEST_PRINCIPAL_KEY]?: AuthenticatedActor;
};

export function getRequestPrincipal(request: RequestWithPrincipal): AuthenticatedActor | undefined {
  return request.user ?? request[REQUEST_PRINCIPAL_KEY];
}
