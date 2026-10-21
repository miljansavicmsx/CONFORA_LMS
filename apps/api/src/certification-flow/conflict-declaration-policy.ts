export type ConflictDeclarationState = {
  readonly hasConflict: boolean;
  readonly recordedByUserId: string;
};

export type ConflictDeclarationDecision =
  | { readonly action: 'append'; readonly reason: 'no-conflict' | 'conflict' | 'conflict-cleared' }
  | { readonly action: 'unchanged' }
  | { readonly action: 'deny'; readonly code: 'CONFLICT_CLEARANCE_REQUIRED' };

/**
 * Declarations are append-only.
 * The subject may move from no conflict to conflict.
 * Clearing a conflict requires a different person from both the subject and the recorder.
 */
export function decideConflictDeclaration(input: {
  readonly actorUserId: string;
  readonly subjectUserId: string;
  readonly hasConflict: boolean;
  readonly latest: ConflictDeclarationState | null;
}): ConflictDeclarationDecision {
  const self = input.actorUserId === input.subjectUserId;
  const latest = input.latest;
  if (!latest) {
    if (!self) {
      return { action: 'deny', code: 'CONFLICT_CLEARANCE_REQUIRED' };
    }
    return { action: 'append', reason: input.hasConflict ? 'conflict' : 'no-conflict' };
  }
  if (self && latest.hasConflict === input.hasConflict) {
    return { action: 'unchanged' };
  }
  if (self && !latest.hasConflict && input.hasConflict) {
    return { action: 'append', reason: 'conflict' };
  }
  const clearing = latest.hasConflict && !input.hasConflict;
  const secondPerson =
    input.actorUserId !== input.subjectUserId && input.actorUserId !== latest.recordedByUserId;
  if (clearing && secondPerson) {
    return { action: 'append', reason: 'conflict-cleared' };
  }
  return { action: 'deny', code: 'CONFLICT_CLEARANCE_REQUIRED' };
}

/** List rows are assigned work only. Path stays off this payload until a cleared declaration. */
export function toAssignedCaseListItem(row: {
  readonly id: string;
  readonly phase: string;
  readonly path: string;
  readonly proposals: readonly { readonly userId: string; readonly state: string }[];
  readonly actorUserId: string;
}): { readonly caseId: string; readonly phase: string; readonly assigned: true } | null {
  const assigned = row.proposals.some(
    (proposal) => proposal.userId === row.actorUserId && proposal.state !== 'EXCLUDED',
  );
  if (!assigned) {
    return null;
  }
  return { caseId: row.id, phase: row.phase, assigned: true };
}
