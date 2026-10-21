import { decideCompositionAuthority, planComposition } from './committee-composition-policy';

const chair = '33333333-3333-4333-8333-333333333333';
const member = '44444444-4444-4444-8444-444444444444';
const colleague = '55555555-5555-4555-8555-555555555555';

describe('committee composition policy', () => {
  it('refuses an ordinary member, a conflicted chair, and the subject of the change', () => {
    const updates = [
      {
        userId: colleague,
        fromState: 'PROPOSED' as const,
        toState: 'EXCLUDED' as const,
        exclusionReason: 'CONFLICT',
        clearConfirmation: true,
        create: false,
      },
    ];
    expect(
      decideCompositionAuthority({
        actorRoles: ['COM_CERT'],
        actorSigned: true,
        actorHasConflict: false,
        actorUserId: member,
        reason: 'Sukob je evidentiran.',
        updates,
      }),
    ).toEqual({ action: 'deny', code: 'COMPOSITION_FORBIDDEN' });
    expect(
      decideCompositionAuthority({
        actorRoles: ['COM_CERT', 'QUALITY_MANAGER'],
        actorSigned: false,
        actorHasConflict: false,
        actorUserId: chair,
        reason: 'Sukob je evidentiran.',
        updates,
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_UNSIGNED' });
    expect(
      decideCompositionAuthority({
        actorRoles: ['COMMITTEE_CHAIR'],
        actorSigned: true,
        actorHasConflict: true,
        actorUserId: chair,
        reason: 'Sukob je evidentiran.',
        updates,
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_DECLARED' });
    expect(
      decideCompositionAuthority({
        actorRoles: ['COM_CERT', 'QUALITY_MANAGER'],
        actorSigned: true,
        actorHasConflict: false,
        actorUserId: colleague,
        reason: 'Sukob je evidentiran.',
        updates,
      }),
    ).toEqual({ action: 'deny', code: 'ACTOR_IS_SUBJECT' });
    expect(
      decideCompositionAuthority({
        actorRoles: ['COM_CERT', 'QUALITY_MANAGER'],
        actorSigned: true,
        actorHasConflict: false,
        actorUserId: chair,
        reason: '  ',
        updates,
      }),
    ).toEqual({ action: 'deny', code: 'COMPOSITION_REASON_REQUIRED' });
  });

  it('lets a cleared quality manager apply a recorded exclusion without touching confirmations', () => {
    const decision = decideCompositionAuthority({
      actorRoles: ['COM_CERT', 'QUALITY_MANAGER'],
      actorSigned: true,
      actorHasConflict: false,
      actorUserId: chair,
      reason: 'Sukob je evidentiran u izjavi.',
      updates: [
        {
          userId: colleague,
          fromState: 'PROPOSED',
          toState: 'EXCLUDED',
          exclusionReason: 'CONFLICT',
          clearConfirmation: true,
          create: false,
        },
      ],
    });
    expect(decision).toEqual({ action: 'allow' });
    const plan = planComposition({
      votingStarted: false,
      existing: [
        { userId: member, state: 'CONFIRMED', exclusionReason: null },
        { userId: colleague, state: 'PROPOSED', exclusionReason: null },
      ],
      desired: [
        { userId: member, state: 'PROPOSED', exclusionReason: null },
        { userId: colleague, state: 'EXCLUDED', exclusionReason: 'CONFLICT' },
      ],
    });
    expect(plan.invalidateVotes).toBe(false);
    expect(plan.updates).toEqual([
      {
        userId: colleague,
        fromState: 'PROPOSED',
        toState: 'EXCLUDED',
        exclusionReason: 'CONFLICT',
        clearConfirmation: true,
        create: false,
      },
    ]);
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
    expect(plan.updates).toEqual([
      {
        userId: colleague,
        fromState: 'PROPOSED',
        toState: 'EXCLUDED',
        exclusionReason: 'CONFLICT',
        clearConfirmation: true,
        create: false,
      },
      {
        userId: member,
        fromState: 'CONFIRMED',
        toState: 'PROPOSED',
        exclusionReason: null,
        clearConfirmation: true,
        create: false,
      },
    ]);
    const reconfirmOnly = plan.updates.find((update) => update.userId === member);
    expect(
      decideCompositionAuthority({
        actorRoles: ['COM_CERT', 'QUALITY_MANAGER'],
        actorSigned: true,
        actorHasConflict: false,
        actorUserId: member,
        reason: 'Sukob kolege je evidentiran.',
        updates: plan.updates,
      }).action,
    ).toBe('allow');
    expect(reconfirmOnly?.toState).toBe('PROPOSED');
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
    expect(plan).toEqual({
      updates: [],
      invalidateVotes: false,
      reconfirmationRequired: false,
    });
  });
});
