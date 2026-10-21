import { isDesignatedConflictClearer } from './conflict-declaration-policy';

export type CommitteeSlotState = 'PROPOSED' | 'CONFIRMED' | 'EXCLUDED';

export type CommitteeSlotView = {
  userId: string;
  state: CommitteeSlotState;
  exclusionReason: string | null;
};

export type CompositionUpdate = {
  userId: string;
  fromState: CommitteeSlotState | 'ABSENT';
  toState: CommitteeSlotState;
  exclusionReason: string | null;
  clearConfirmation: boolean;
  create: boolean;
};

export type CompositionAuthority =
  | { readonly action: 'allow' }
  | {
      readonly action: 'deny';
      readonly code:
        | 'COMPOSITION_REASON_REQUIRED'
        | 'COMPOSITION_FORBIDDEN'
        | 'CONFLICT_UNSIGNED'
        | 'CONFLICT_DECLARED'
        | 'ACTOR_IS_SUBJECT';
    };

export type CompositionPlan = {
  updates: CompositionUpdate[];
  invalidateVotes: boolean;
  reconfirmationRequired: boolean;
};

/**
 * Chair or quality manager may change composition.
 * The actor must have a cleared declaration and must not be the person whose eligibility changes.
 */
export function decideCompositionAuthority(input: {
  actorRoles: readonly string[];
  actorSigned: boolean;
  actorHasConflict: boolean;
  actorUserId: string;
  reason: string;
  updates: readonly CompositionUpdate[];
}): CompositionAuthority {
  if (input.reason.trim().length < 3) {
    return { action: 'deny', code: 'COMPOSITION_REASON_REQUIRED' };
  }
  if (!isDesignatedConflictClearer(input.actorRoles)) {
    return { action: 'deny', code: 'COMPOSITION_FORBIDDEN' };
  }
  if (!input.actorSigned) {
    return { action: 'deny', code: 'CONFLICT_UNSIGNED' };
  }
  if (input.actorHasConflict) {
    return { action: 'deny', code: 'CONFLICT_DECLARED' };
  }
  const subject = input.updates.some((update) => eligibilityChanges(input.actorUserId, update));
  if (subject) {
    return { action: 'deny', code: 'ACTOR_IS_SUBJECT' };
  }
  return { action: 'allow' };
}

function eligibilityChanges(actorUserId: string, update: CompositionUpdate): boolean {
  if (update.userId !== actorUserId) {
    return false;
  }
  if (update.fromState === 'ABSENT') {
    return true;
  }
  return (update.fromState === 'EXCLUDED') !== (update.toState === 'EXCLUDED');
}

/**
 * Desired slots come from records. Confirmations stay unless voting has already started,
 * in which case a real eligibility change invalidates the ballot and requires re-confirmation.
 */
export function planComposition(input: {
  existing: readonly CommitteeSlotView[];
  desired: readonly CommitteeSlotView[];
  votingStarted: boolean;
}): CompositionPlan {
  const existingByUser = new Map(input.existing.map((slot) => [slot.userId, slot]));
  const eligibility: {
    userId: string;
    from: CommitteeSlotView | undefined;
    toState: CommitteeSlotState;
    exclusionReason: string | null;
  }[] = [];
  for (const desired of input.desired) {
    const current = existingByUser.get(desired.userId);
    if (!current) {
      eligibility.push({
        userId: desired.userId,
        from: undefined,
        toState: desired.state,
        exclusionReason: desired.exclusionReason,
      });
      continue;
    }
    const excludedNow = current.state === 'EXCLUDED';
    const excludedNext = desired.state === 'EXCLUDED';
    const reasonChanged = (current.exclusionReason ?? null) !== (desired.exclusionReason ?? null);
    if (excludedNow !== excludedNext || (excludedNext && reasonChanged)) {
      eligibility.push({
        userId: desired.userId,
        from: current,
        toState: desired.state,
        exclusionReason: desired.exclusionReason,
      });
    }
  }
  for (const current of input.existing) {
    const stillDesired = input.desired.some((slot) => slot.userId === current.userId);
    if (!stillDesired && current.state !== 'EXCLUDED') {
      eligibility.push({
        userId: current.userId,
        from: current,
        toState: 'EXCLUDED',
        exclusionReason: 'AUTHORISATION',
      });
    }
  }
  const invalidateVotes = input.votingStarted && eligibility.length > 0;
  const updates: CompositionUpdate[] = [];
  const changed = new Set(eligibility.map((change) => change.userId));
  for (const change of eligibility) {
    const fromState = change.from?.state ?? 'ABSENT';
    const toState = invalidateVotes && change.toState !== 'EXCLUDED' ? 'PROPOSED' : change.toState;
    updates.push({
      userId: change.userId,
      fromState,
      toState,
      exclusionReason: toState === 'EXCLUDED' ? change.exclusionReason : null,
      clearConfirmation: fromState === 'CONFIRMED' || toState !== 'CONFIRMED',
      create: change.from === undefined,
    });
  }
  if (invalidateVotes) {
    for (const current of input.existing) {
      if (changed.has(current.userId) || current.state !== 'CONFIRMED') {
        continue;
      }
      updates.push({
        userId: current.userId,
        fromState: 'CONFIRMED',
        toState: 'PROPOSED',
        exclusionReason: null,
        clearConfirmation: true,
        create: false,
      });
    }
  }
  return { updates, invalidateVotes, reconfirmationRequired: invalidateVotes };
}
