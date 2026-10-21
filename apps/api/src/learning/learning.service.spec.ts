import type { AuthenticatedActor } from '../auth/request-principal';
import { LearningNotFoundError, toPlayerView } from '../prisma/learning-tenant-store';
import { LearningService } from './learning.service';

const actor: AuthenticatedActor = {
  userId: '22222222-2222-4222-8222-222222222222',
  tenantId: '11111111-1111-4111-8111-111111111111',
  issuer: 'https://idp.example',
  subject: 'subject',
  email: 'learner@example.com',
  roles: ['USR_CAND'],
  mfaVerified: false,
};

describe('LearningService', () => {
  const learning = {
    listPublishedCourses: jest.fn(),
    enrol: jest.fn(),
    recordLessonProgress: jest.fn(),
    submitChapterQuiz: jest.fn(),
    statistics: jest.fn(),
  };
  const audit = { append: jest.fn() };
  const flow = { noteEducation: jest.fn().mockResolvedValue(null) };
  const service = new LearningService({ learning, flow } as never, audit as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists only through the tenant facade and keeps the area filter', async () => {
    learning.listPublishedCourses.mockResolvedValue({ areas: [], courses: [] });
    await service.listCourses('ISMS');
    expect(learning.listPublishedCourses).toHaveBeenCalledWith('ISMS');
  });

  it('audits a new enrolment and records the pending payment state', async () => {
    learning.enrol.mockResolvedValue({
      enrolmentId: '33333333-3333-4333-8333-333333333333',
      courseId: '44444444-4444-4444-8444-444444444444',
      paymentState: 'PENDING_PAYMENT',
      statementId: '55555555-5555-4555-8555-555555555555',
      analyticsConsent: false,
      alreadyEnrolled: false,
    });
    audit.append.mockResolvedValue({ id: 'audit' });
    const result = await service.enrol(actor, '44444444-4444-4444-8444-444444444444');
    expect(result.paymentState).toBe('PENDING_PAYMENT');
    const calls = audit.append.mock.calls as unknown as Array<
      [
        AuthenticatedActor,
        { eventType: string; idempotencyKey: string; metadata: Record<string, unknown> },
      ]
    >;
    const recorded = calls[0]?.[1];
    expect(recorded?.eventType).toBe('LEARNING_COURSE_ENROLLED');
    expect(recorded?.idempotencyKey).toBe('55555555-5555-4555-8555-555555555555');
    expect(recorded?.metadata['paymentState']).toBe('PENDING_PAYMENT');
    expect(recorded?.metadata['analyticsConsent']).toBe(false);
    expect(recorded?.metadata['email']).toBeUndefined();
    expect(JSON.stringify(recorded?.metadata)).not.toContain(actor.email);
  });

  it('does not append a second enrolment audit when the learner is already enrolled', async () => {
    learning.enrol.mockResolvedValue({ alreadyEnrolled: true, statementId: actor.userId });
    await service.enrol(actor, '44444444-4444-4444-8444-444444444444');
    expect(audit.append).not.toHaveBeenCalled();
  });

  it('writes a lesson activity audit after progress', async () => {
    learning.recordLessonProgress.mockResolvedValue({
      lessonId: '66666666-6666-4666-8666-666666666666',
      statementId: '77777777-7777-4777-8777-777777777777',
      analyticsConsent: true,
    });
    audit.append.mockResolvedValue({ id: 'audit' });
    await service.recordProgress(
      actor,
      '33333333-3333-4333-8333-333333333333',
      '66666666-6666-4666-8666-666666666666',
      {
        additionalSeconds: 60,
        statementId: '77777777-7777-4777-8777-777777777777',
        analyticsConsent: true,
      },
    );
    expect(learning.recordLessonProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: actor.userId,
        analyticsConsent: true,
        additionalSeconds: 60,
      }),
    );
    expect(audit.append).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({ eventType: 'LEARNING_LESSON_PROGRESS_RECORDED' }),
    );
  });

  it('maps a missing course to NotFound and still scores through the facade', async () => {
    learning.submitChapterQuiz.mockRejectedValue(new LearningNotFoundError());
    await expect(
      service.submitQuiz(
        actor,
        '33333333-3333-4333-8333-333333333333',
        '88888888-8888-4888-8888-888888888888',
        {
          statementId: '99999999-9999-4999-8999-999999999999',
          answers: [],
        },
      ),
    ).rejects.toThrow('Not Found');
    expect(audit.append).not.toHaveBeenCalled();
  });

  it('statistics stay scoped to the actor', async () => {
    learning.statistics.mockResolvedValue({
      analyticsConsent: false,
      enrolments: [],
      quizResults: [],
    });
    await service.statistics(actor);
    expect(learning.statistics).toHaveBeenCalledWith(actor.userId);
  });
});

describe('toPlayerView', () => {
  it('omits the correct choice key from the player payload', () => {
    const view = toPlayerView({
      id: 'enrolment',
      progressPercent: 0,
      completedAt: null,
      paymentIntent: { state: 'PENDING_PAYMENT' },
      lessonProgress: [],
      quizAttempts: [],
      course: {
        id: 'course',
        title: 'Course',
        description: 'Description',
        areaCode: 'DIGCOMP',
        imageObjectKey: null,
        minimumTimeSeconds: 0,
        chapters: [
          {
            id: 'chapter',
            sequence: 1,
            title: 'Chapter',
            minimumTimeSeconds: 0,
            lessons: [],
            quizzes: [
              {
                id: 'quiz',
                title: 'Quiz',
                passMarkPercent: 70,
                items: [
                  {
                    sequence: 1,
                    item: {
                      id: 'item',
                      stem: 'Stem',
                      correctChoiceKey: 'SECRET',
                      choices: [{ choiceKey: 'A', text: 'One' }],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    expect(JSON.stringify(view)).not.toContain('SECRET');
    expect(view.chapters[0]?.quiz?.items[0]?.choices).toEqual([{ choiceKey: 'A', text: 'One' }]);
    expect(view.paymentState).toBe('PENDING_PAYMENT');
  });
});
