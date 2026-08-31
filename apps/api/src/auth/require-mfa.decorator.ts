import { SetMetadata } from '@nestjs/common';

export const REQUIRE_MFA_KEY = 'requireMfa' as const;

/** Explicit metadata for route-level MFA assurance (OD-P04-16). */
export const RequireMfa = (): ReturnType<typeof SetMetadata> => SetMetadata(REQUIRE_MFA_KEY, true);
