import type { AuthenticatedActor } from '../auth/request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { ExamRuleError } from './exam-rules';
import { ExamService } from './exam.service';

describe('ExamService audit and role mapping', () => {
  const actor: AuthenticatedActor = {
    userId: '11111111-1111-4111-8111-111111111111',
    tenantId: '22222222-2222-4222-8222-222222222222',
    issuer: 'https://issuer.example',
    subject: 'subject',
    email: 'tech@example.test',
    roles: ['COM_TECH'],
    mfaVerified: true,
  };

  function service(exam: Record<string, jest.Mock>, append: jest.Mock) {
    return new ExamService({ exam } as never, { append } as never);
  }

  it('records item approval on the audit chain and skips other transitions', async () => {
    const append = jest.fn().mockResolvedValue({ id: 'audit' });
    const transition = jest.fn().mockResolvedValue({
      itemId: '33333333-3333-4333-8333-333333333333',
      fromStatus: 'REVIEW',
      toStatus: 'APPROVED',
    });
    const exams = service({ transition }, append);
    await exams.transition(actor, '33333333-3333-4333-8333-333333333333', { toStatus: 'APPROVED' });
    expect(append).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({ eventType: 'EXAM_ITEM_APPROVED', resourceType: 'SchemeExamItem' }),
    );
    append.mockClear();
    transition.mockResolvedValue({
      itemId: '33333333-3333-4333-8333-333333333333',
      fromStatus: 'DRAFT',
      toStatus: 'REVIEW',
    });
    await exams.transition(actor, '33333333-3333-4333-8333-333333333333', { toStatus: 'REVIEW' });
    expect(append).not.toHaveBeenCalled();
  });

  it('does not audit a rejected self-approval', async () => {
    const append = jest.fn();
    const exams = service(
      {
        transition: jest.fn().mockRejectedValue(new ExamRuleError('AUTHOR_CANNOT_APPROVE')),
      },
      append,
    );
    await expect(
      exams.transition(actor, '33333333-3333-4333-8333-333333333333', { toStatus: 'APPROVED' }),
    ).rejects.toBeInstanceOf(AccessDeniedError);
    expect(append).not.toHaveBeenCalled();
  });

  it('records submit and score without returning item content', async () => {
    const append = jest.fn().mockResolvedValue({ id: 'audit' });
    const exams = service(
      {
        submit: jest.fn().mockResolvedValue({
          sessionId: '44444444-4444-4444-8444-444444444444',
          resultId: '55555555-5555-4555-8555-555555555555',
          statementId: '66666666-6666-4666-8666-666666666666',
          passed: false,
          provisional: true,
          scoreBasisPoints: 4000,
          domains: [{ domainCode: 'A', correct: 1, total: 3 }],
          certificateIssued: false,
        }),
      },
      append,
    );
    const view = await exams.submit(actor, '44444444-4444-4444-8444-444444444444');
    expect(view).not.toHaveProperty('resultId');
    expect(JSON.stringify(view)).not.toContain('isCorrect');
    const calls = append.mock.calls as [unknown, { eventType: string }][];
    expect(calls.map((call) => call[1].eventType)).toEqual(['EXAM_SUBMITTED', 'EXAM_SCORED']);
  });
});
