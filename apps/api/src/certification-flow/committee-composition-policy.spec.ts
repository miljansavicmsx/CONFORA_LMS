import {
  decideCompositionActor,
  decideCompositionApproval,
  decideReviewSide,
  decideSeatConfirmation,
  planComposition,
} from './committee-composition-policy';

const chair = '33333333-3333-4333-8333-333333333333';
const member = '44444444-4444-4444-8444-444444444444';
const colleague = '55555555-5555-4555-8555-555555555555';
const manager = '66666666-6666-4666-8666-666666666666';

describe('committee composition governance', () => {
  it('refuses an ordinary member and a quality manager who has only the system role', () => {
    expect(
      decideCompositionActor({
        roles: ['COM_CERT'],
        grants: [],
        offices: [],
        signed: true,
        hasConflict: false,
      }),
    ).toEqual({ action: 'deny', code: 'COMPOSITION_FORBIDDEN' });
    expect(
      decideCompositionActor({
        roles: ['COM_CERT', 'QUALITY_MANAGER'],
        grants: [],
        offices: [],
        signed: true,
        hasConflict: false,
      }),
    ).toEqual({ action: 'deny', code: 'COMPOSITION_AUTHORITY_REQUIRED' });
  });

  it('refuses a conflicted approver and an unsigned chair', () => {
    expect(
      decideCompositionActor({
        roles: ['COM_CERT', 'QUALITY_MANAGER'],
        grants: [{ kind: 'SCHEME_COMMITTEE_OVERSIGHT' }],
        offices: [],
        signed: true,
        hasConflict: true,
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_DECLARED' });
    expect(
      decideCompositionActor({
        roles: ['COM_CERT'],
        grants: [{ kind: 'COMMITTEE_CHAIR' }],
        offices: [],
        signed: false,
        hasConflict: false,
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_UNSIGNED' });
  });

  it('lets the chair propose and a different oversight manager approve', () => {
    expect(
      decideCompositionActor({
        roles: ['COM_CERT'],
        grants: [{ kind: 'COMMITTEE_CHAIR' }],
        offices: [],
        signed: true,
        hasConflict: false,
      }),
    ).toEqual({ action: 'allow', side: 'CHAIR' });
    expect(
      decideCompositionApproval({
        proposerUserId: chair,
        proposerSide: 'CHAIR',
        approverUserId: manager,
        approverSide: 'OVERSIGHT',
        approverIsSubject: false,
        grounds: 'Sukob je evidentiran u izjavi.',
        recordedCoiReview: 'Izjave o sukobu su pregledane.',
        competenceReview: 'Članovi imaju važeću kompetenciju.',
        priorVoteImpact: 'Raniji glas se poništava i ostaje u istoriji.',
      }),
    ).toEqual({ action: 'allow' });
  });

  it('refuses self-approval, same-side approval, and a thin review', () => {
    expect(
      decideCompositionApproval({
        proposerUserId: chair,
        proposerSide: 'CHAIR',
        approverUserId: chair,
        approverSide: 'OVERSIGHT',
        approverIsSubject: false,
        grounds: 'Sukob je evidentiran u izjavi.',
        recordedCoiReview: 'Izjave o sukobu su pregledane.',
        competenceReview: 'Članovi imaju važeću kompetenciju.',
        priorVoteImpact: 'Raniji glas se poništava i ostaje u istoriji.',
      }),
    ).toEqual({ action: 'deny', code: 'COMPOSITION_SELF_APPROVAL' });
    expect(
      decideCompositionApproval({
        proposerUserId: chair,
        proposerSide: 'CHAIR',
        approverUserId: manager,
        approverSide: 'CHAIR',
        approverIsSubject: false,
        grounds: 'Sukob je evidentiran u izjavi.',
        recordedCoiReview: 'Izjave o sukobu su pregledane.',
        competenceReview: 'Članovi imaju važeću kompetenciju.',
        priorVoteImpact: 'Raniji glas se poništava i ostaje u istoriji.',
      }),
    ).toEqual({ action: 'deny', code: 'COMPOSITION_SAME_SIDE' });
    expect(
      decideCompositionApproval({
        proposerUserId: chair,
        proposerSide: 'CHAIR',
        approverUserId: manager,
        approverSide: 'OVERSIGHT',
        approverIsSubject: true,
        grounds: 'Sukob je evidentiran u izjavi.',
        recordedCoiReview: 'Izjave o sukobu su pregledane.',
        competenceReview: 'Članovi imaju važeću kompetenciju.',
        priorVoteImpact: 'Raniji glas se poništava i ostaje u istoriji.',
      }),
    ).toEqual({ action: 'deny', code: 'ACTOR_IS_SUBJECT' });
    expect(
      decideCompositionApproval({
        proposerUserId: chair,
        proposerSide: 'CHAIR',
        approverUserId: manager,
        approverSide: 'OVERSIGHT',
        approverIsSubject: false,
        grounds: 'kratko',
        recordedCoiReview: 'Izjave o sukobu su pregledane.',
        competenceReview: 'Članovi imaju važeću kompetenciju.',
        priorVoteImpact: 'Raniji glas se poništava i ostaje u istoriji.',
      }),
    ).toEqual({ action: 'deny', code: 'COMPOSITION_REVIEW_REQUIRED' });
  });

  it('allows a deputy when a side is conflicted or has no holder', () => {
    expect(
      decideCompositionActor({
        roles: ['COM_CERT'],
        grants: [{ kind: 'CERTIFICATION_BODY_DEPUTY' }],
        offices: [
          { side: 'CHAIR', conflicted: false },
          { side: 'OVERSIGHT', conflicted: false },
        ],
        signed: true,
        hasConflict: false,
      }),
    ).toEqual({ action: 'deny', code: 'DEPUTY_NOT_REQUIRED' });
    expect(
      decideCompositionActor({
        roles: ['COM_CERT'],
        grants: [{ kind: 'CERTIFICATION_BODY_DEPUTY' }],
        offices: [
          { side: 'CHAIR', conflicted: false },
          { side: 'OVERSIGHT', conflicted: true },
        ],
        signed: true,
        hasConflict: false,
      }),
    ).toEqual({ action: 'allow', side: 'OVERSIGHT' });
    expect(
      decideCompositionActor({
        roles: ['COM_CERT'],
        grants: [{ kind: 'CERTIFICATION_BODY_DEPUTY' }],
        offices: [{ side: 'CHAIR', conflicted: false }],
        signed: true,
        hasConflict: false,
      }),
    ).toEqual({ action: 'allow', side: 'OVERSIGHT' });
  });

  it('does not let one person propose and approve, even with both grants', () => {
    expect(
      decideCompositionActor({
        roles: ['COM_CERT', 'QUALITY_MANAGER'],
        grants: [{ kind: 'COMMITTEE_CHAIR' }, { kind: 'SCHEME_COMMITTEE_OVERSIGHT' }],
        offices: [
          { side: 'CHAIR', conflicted: false },
          { side: 'OVERSIGHT', conflicted: false },
        ],
        signed: true,
        hasConflict: false,
      }),
    ).toEqual({ action: 'allow', side: 'CHAIR' });
    expect(
      decideCompositionApproval({
        proposerUserId: chair,
        proposerSide: 'CHAIR',
        approverUserId: chair,
        approverSide: 'OVERSIGHT',
        approverIsSubject: false,
        grounds: 'Sukob je evidentiran u izjavi.',
        recordedCoiReview: 'Izjave o sukobu su pregledane.',
        competenceReview: 'Članovi imaju važeću kompetenciju.',
        priorVoteImpact: 'Raniji glas se poništava i ostaje u istoriji.',
      }),
    ).toEqual({ action: 'deny', code: 'COMPOSITION_SELF_APPROVAL' });
  });

  it('requires the other side to decide a review', () => {
    expect(
      decideReviewSide({
        openerUserId: chair,
        deciderUserId: chair,
        openerSide: 'OVERSIGHT',
        deciderSide: 'CHAIR',
      }),
    ).toEqual({ action: 'deny', code: 'REVIEW_SELF_DECISION' });
    expect(
      decideReviewSide({
        openerUserId: chair,
        deciderUserId: manager,
        openerSide: 'OVERSIGHT',
        deciderSide: 'OVERSIGHT',
      }),
    ).toEqual({ action: 'deny', code: 'REVIEW_SAME_SIDE' });
    expect(
      decideReviewSide({
        openerUserId: chair,
        deciderUserId: manager,
        openerSide: 'OVERSIGHT',
        deciderSide: 'CHAIR',
      }),
    ).toEqual({ action: 'allow' });
  });

  it('does not let a member confirm themselves or a colleague', () => {
    expect(
      decideSeatConfirmation({ actorUserId: member, memberUserId: member, actorSide: 'CHAIR' }),
    ).toEqual({ action: 'deny', code: 'SELF_CONFIRMATION' });
    expect(
      decideSeatConfirmation({ actorUserId: member, memberUserId: colleague, actorSide: null }),
    ).toEqual({ action: 'deny', code: 'CONFIRM_FORBIDDEN' });
    expect(
      decideSeatConfirmation({
        actorUserId: manager,
        memberUserId: member,
        actorSide: 'OVERSIGHT',
      }),
    ).toEqual({ action: 'allow' });
  });

  it('invalidates an open ballot and requires re-confirmation instead of dropping votes', () => {
    const plan = planComposition({
      votingStarted: true,
      existing: [
        { userId: member, state: 'CONFIRMED', exclusionReason: null },
        { userId: colleague, state: 'PROPOSED', exclusionReason: null },
      ],
      desired: [
        { userId: member, state: 'PROPOSED', exclusionReason: null },
        { userId: colleague, state: 'EXCLUDED', exclusionReason: 'CONFLICT' },
      ],
    });
    expect(plan.invalidateVotes).toBe(true);
    expect(plan.reconfirmationRequired).toBe(true);
    expect(plan.updates.map((update) => update.userId)).toEqual([colleague, member]);
  });

  it('leaves recorded votes in place when composition does not change', () => {
    const plan = planComposition({
      votingStarted: true,
      existing: [
        { userId: member, state: 'CONFIRMED', exclusionReason: null },
        { userId: colleague, state: 'EXCLUDED', exclusionReason: 'CONFLICT' },
      ],
      desired: [
        { userId: member, state: 'PROPOSED', exclusionReason: null },
        { userId: colleague, state: 'EXCLUDED', exclusionReason: 'CONFLICT' },
      ],
    });
    expect(plan.invalidateVotes).toBe(false);
    expect(plan.updates).toEqual([]);
  });
});
