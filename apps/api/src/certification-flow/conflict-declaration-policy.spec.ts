import { decideConflictDeclaration, toAssignedCaseListItem } from './conflict-declaration-policy';

const subject = '11111111-1111-4111-8111-111111111111';
const second = '22222222-2222-4222-8222-222222222222';

describe('conflict declaration policy', () => {
  it('lets the subject move from no conflict to conflict', () => {
    expect(
      decideConflictDeclaration({
        actorUserId: subject,
        subjectUserId: subject,
        hasConflict: true,
        latest: { hasConflict: false, recordedByUserId: subject },
      }),
    ).toEqual({ action: 'append', reason: 'conflict' });
  });

  it('refuses to let the subject clear a conflict', () => {
    expect(
      decideConflictDeclaration({
        actorUserId: subject,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: subject },
      }),
    ).toEqual({ action: 'deny', code: 'CONFLICT_CLEARANCE_REQUIRED' });
  });

  it('lets a second person clear a conflict', () => {
    expect(
      decideConflictDeclaration({
        actorUserId: second,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: subject },
      }),
    ).toEqual({ action: 'append', reason: 'conflict-cleared' });
  });

  it('refuses a clearance by the person who recorded the conflict', () => {
    expect(
      decideConflictDeclaration({
        actorUserId: second,
        subjectUserId: subject,
        hasConflict: false,
        latest: { hasConflict: true, recordedByUserId: second },
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
