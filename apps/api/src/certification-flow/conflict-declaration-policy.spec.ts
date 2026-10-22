import {
  decideConflictDeclaration,
  isDesignatedConflictClearer,
  toAssignedCaseListItem,
} from './conflict-declaration-policy';

const subject = '11111111-1111-4111-8111-111111111111';
const second = '22222222-2222-4222-8222-222222222222';
const chair = '33333333-3333-4333-8333-333333333333';

function decide(
  input: Omit<
    Parameters<typeof decideConflictDeclaration>[0],
    'designatedClearer' | 'actorHasConflict'
  > &
    Partial<
      Pick<
        Parameters<typeof decideConflictDeclaration>[0],
        'designatedClearer' | 'actorHasConflict'
      >
    >,
) {
  return decideConflictDeclaration({
    designatedClearer: false,
    actorHasConflict: false,
    ...input,
  });
}

describe('conflict declaration policy', () => {
  it('lets the subject move from no conflict to conflict', () => {
    expect(
      decide({
        actorUserId: subject,
        subjectUserId: subject,
        hasConflict: true,
        latest: { hasConflict: false, recordedByUserId: subject },
      }),
    ).toEqual({ action: 'append', reason: 'conflict' });
  });

  it('refuses to let the subject clear a conflict even with a designated role', () => {
    expect(
      decide({
        actorUserId: subject,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: subject },
        designatedClearer: true,
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_CLEARANCE_REQUIRED' });
  });

  it('refuses a clearance by a second person who is not chair or quality manager', () => {
    expect(isDesignatedConflictClearer(['COM_CERT'])).toBe(false);
    expect(
      decide({
        actorUserId: second,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: subject },
        designatedClearer: isDesignatedConflictClearer(['COM_CERT']),
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_CLEARANCE_REQUIRED' });
  });

  it('lets a committee chair clear when they are not the subject, recorder, or in conflict', () => {
    expect(isDesignatedConflictClearer(['COMMITTEE_CHAIR'])).toBe(true);
    expect(
      decide({
        actorUserId: chair,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: subject },
        designatedClearer: isDesignatedConflictClearer(['COMMITTEE_CHAIR']),
      }),
    ).toEqual({ action: 'append', reason: 'conflict-cleared' });
  });

  it('lets a quality manager clear when they are not the subject, recorder, or in conflict', () => {
    expect(isDesignatedConflictClearer(['COM_CERT', 'QUALITY_MANAGER'])).toBe(true);
    expect(
      decide({
        actorUserId: chair,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: subject },
        designatedClearer: isDesignatedConflictClearer(['QUALITY_MANAGER']),
      }),
    ).toEqual({ action: 'append', reason: 'conflict-cleared' });
  });

  it('refuses a clearance by the person who recorded the conflict', () => {
    expect(
      decide({
        actorUserId: second,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: second },
        designatedClearer: true,
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_CLEARANCE_REQUIRED' });
  });

  it('refuses a designated clearer who has their own conflict on the case', () => {
    expect(
      decide({
        actorUserId: chair,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: subject },
        designatedClearer: true,
        actorHasConflict: true,
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_CLEARANCE_REQUIRED' });
  });

  it('lists only an assigned case and omits the path', () => {
    const hidden = toAssignedCaseListItem({
      id: 'case-hidden',
      phase: 'COMMITTEE',
      path: 'DIRECT',
      actorUserId: subject,
      proposals: [{ userId: subject, state: 'EXCLUDED' }],
    });
    const visible = toAssignedCaseListItem({
      id: 'case-visible',
      phase: 'COMMITTEE',
      path: 'CONFORA_EDUCATION',
      actorUserId: subject,
      proposals: [{ userId: subject, state: 'CONFIRMED' }],
    });
    expect(hidden).toBeNull();
    expect(visible).toEqual({ caseId: 'case-visible', phase: 'COMMITTEE', assigned: true });
    expect(visible && 'path' in visible).toBe(false);
  });
});
