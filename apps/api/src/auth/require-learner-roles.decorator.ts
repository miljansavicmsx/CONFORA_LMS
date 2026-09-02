import { SetMetadata } from '@nestjs/common';

export const REQUIRE_LEARNER_ROLES_KEY = 'requireLearnerRoles' as const;

/** Route-level learner role allowlist (BAR-P06). */
export const RequireLearnerRoles = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(REQUIRE_LEARNER_ROLES_KEY, true);
