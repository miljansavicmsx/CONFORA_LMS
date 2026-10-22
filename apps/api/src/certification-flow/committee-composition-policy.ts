/**
 * CONFORA internal control COMMITTEE_COMPOSITION_GOVERNANCE (OWNER_APPROVED).
 * This is not a literal ISO/IEC 17024 requirement.
 *
 * Seat confirmation is not self-service and not peer confirmation. Only a scheme
 * chair, or a quality manager who holds a current scheme-oversight grant, may
 * confirm another person's seat, and that actor cannot confirm themselves.
 * The voting body therefore cannot appoint itself. A certification-body deputy
 * may take a side only when that side has no holder, or every holder of that side
 * is conflicted on the case.
 */

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

export type CompositionPlan = {
  updates: CompositionUpdate[];
  invalidateVotes: boolean;
  reconfirmationRequired: boolean;
};

export type OfficeSide = 'CHAIR' | 'OVERSIGHT';

export type AuthorityKind =
  | 'COMMITTEE_CHAIR'
  | 'SCHEME_COMMITTEE_OVERSIGHT'
  | 'CERTIFICATION_BODY_DEPUTY';

export type CompositionActorDecision =
  | { readonly action: 'allow'; readonly side: OfficeSide }
  | {
      readonly action: 'deny';
      readonly code:
        | 'CONFLICT_UNSIGNED'
        | 'CONFLICT_DECLARED'
        | 'COMPOSITION_AUTHORITY_REQUIRED'
        | 'COMPOSITION_FORBIDDEN'
        | 'DEPUTY_NOT_REQUIRED'
        | 'SIDE_REQUIRED';
    };

export type CompositionApprovalDecision =
  | { readonly action: 'allow' }
  | {
      readonly action: 'deny';
      readonly code:
        | 'COMPOSITION_SELF_APPROVAL'
        | 'COMPOSITION_SAME_SIDE'
        | 'ACTOR_IS_SUBJECT'
        | 'COMPOSITION_REVIEW_REQUIRED';
    };

export type SeatConfirmationDecision =
  | { readonly action: 'allow' }
  | { readonly action: 'deny'; readonly code: 'SELF_CONFIRMATION' | 'CONFIRM_FORBIDDEN' };

const REVIEW_MIN = 12;

/** A side needs a deputy when nobody holds it, or every holder is conflicted. */
export function sideNeedsDeputy(
  offices: readonly { side: OfficeSide; conflicted: boolean }[],
  side: OfficeSide,
): boolean {
  const holders = offices.filter((office) => office.side === side);
  return holders.length === 0 || holders.every((office) => office.conflicted);
}

export type ReviewSideDecision =
  | { readonly action: 'allow' }
  | { readonly action: 'deny'; readonly code: 'REVIEW_SELF_DECISION' | 'REVIEW_SAME_SIDE' };

/** The person who opened a review cannot decide it, and neither can the same side. */
export function decideReviewSide(input: {
  openerUserId: string;
  deciderUserId: string;
  openerSide: OfficeSide | null;
  deciderSide: OfficeSide;
}): ReviewSideDecision {
  if (input.openerUserId === input.deciderUserId) {
    return { action: 'deny', code: 'REVIEW_SELF_DECISION' };
  }
  if (input.openerSide !== null && input.openerSide === input.deciderSide) {
    return { action: 'deny', code: 'REVIEW_SAME_SIDE' };
  }
  return { action: 'allow' };
}

/**
 * Chair office comes from a scheme grant. Oversight requires the grant and the
 * QUALITY_MANAGER role. The role alone is not authority.
 */
export function decideCompositionActor(input: {
  roles: readonly string[];
  grants: readonly { kind: AuthorityKind }[];
  offices: readonly { side: OfficeSide; conflicted: boolean }[];
  signed: boolean;
  hasConflict: boolean;
  requestedSide?: OfficeSide | undefined;
}): CompositionActorDecision {
  if (!input.signed) {
    return { action: 'deny', code: 'CONFLICT_UNSIGNED' };
  }
  if (input.hasConflict) {
    return { action: 'deny', code: 'CONFLICT_DECLARED' };
  }
  if (input.grants.some((grant) => grant.kind === 'COMMITTEE_CHAIR')) {
    return { action: 'allow', side: 'CHAIR' };
  }
  if (
    input.grants.some((grant) => grant.kind === 'SCHEME_COMMITTEE_OVERSIGHT') &&
    input.roles.includes('QUALITY_MANAGER')
  ) {
    return { action: 'allow', side: 'OVERSIGHT' };
  }
  if (input.grants.some((grant) => grant.kind === 'CERTIFICATION_BODY_DEPUTY')) {
    const chairBlocked = sideNeedsDeputy(input.offices, 'CHAIR');
    const oversightBlocked = sideNeedsDeputy(input.offices, 'OVERSIGHT');
    if (!chairBlocked && !oversightBlocked) {
      return { action: 'deny', code: 'DEPUTY_NOT_REQUIRED' };
    }
    if (input.requestedSide === 'CHAIR' && chairBlocked) {
      return { action: 'allow', side: 'CHAIR' };
    }
    if (input.requestedSide === 'OVERSIGHT' && oversightBlocked) {
      return { action: 'allow', side: 'OVERSIGHT' };
    }
    if (!input.requestedSide && chairBlocked !== oversightBlocked) {
      return { action: 'allow', side: chairBlocked ? 'CHAIR' : 'OVERSIGHT' };
    }
    return { action: 'deny', code: 'SIDE_REQUIRED' };
  }
  if (input.roles.includes('QUALITY_MANAGER')) {
    return { action: 'deny', code: 'COMPOSITION_AUTHORITY_REQUIRED' };
  }
  return { action: 'deny', code: 'COMPOSITION_FORBIDDEN' };
}

/** The proposer cannot approve. The other side must record a substantive review. */
export function decideCompositionApproval(input: {
  proposerUserId: string;
  proposerSide: OfficeSide;
  approverUserId: string;
  approverSide: OfficeSide;
  approverIsSubject: boolean;
  grounds: string;
  recordedCoiReview: string;
  competenceReview: string;
  priorVoteImpact: string;
}): CompositionApprovalDecision {
  if (input.approverUserId === input.proposerUserId) {
    return { action: 'deny', code: 'COMPOSITION_SELF_APPROVAL' };
  }
  if (input.approverSide === input.proposerSide) {
    return { action: 'deny', code: 'COMPOSITION_SAME_SIDE' };
  }
  if (input.approverIsSubject) {
    return { action: 'deny', code: 'ACTOR_IS_SUBJECT' };
  }
  const substantive = [
    input.grounds,
    input.recordedCoiReview,
    input.competenceReview,
    input.priorVoteImpact,
  ];
  if (substantive.some((text) => text.trim().length < REVIEW_MIN)) {
    return { action: 'deny', code: 'COMPOSITION_REVIEW_REQUIRED' };
  }
  return { action: 'allow' };
}

export function decideSeatConfirmation(input: {
  actorUserId: string;
  memberUserId: string;
  actorSide: OfficeSide | null;
}): SeatConfirmationDecision {
  if (input.actorUserId === input.memberUserId) {
    return { action: 'deny', code: 'SELF_CONFIRMATION' };
  }
  if (input.actorSide === null) {
    return { action: 'deny', code: 'CONFIRM_FORBIDDEN' };
  }
  return { action: 'allow' };
}

export function compositionTouchesActor(
  actorUserId: string,
  updates: readonly CompositionUpdate[],
): boolean {
  return updates.some((update) => eligibilityChanges(actorUserId, update));
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

export function slotSnapshot(slots: readonly CommitteeSlotView[]): string {
  return [...slots]
    .sort((left, right) => left.userId.localeCompare(right.userId))
    .map((slot) => `${slot.userId}:${slot.state}:${slot.exclusionReason ?? ''}`)
    .join('|');
}
