import { randomUUID } from 'node:crypto';
import type { Prisma } from '@confora/database';

import {
  assertProgressIncrement,
  isoDurationSeconds,
  lessonMeetsMinimumTime,
  scoreChapterQuiz,
  XAPI_VERB,
} from '../learning/learning-rules';

export class LearningNotFoundError extends Error {
  constructor() {
    super('LEARNING_NOT_FOUND');
    this.name = 'LearningNotFoundError';
  }
}

type Tx = Prisma.TransactionClient;

export type LearningClient = {
  $transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
} & Pick<
  Tx,
  | 'course'
  | 'enrolment'
  | 'enrolmentPaymentIntent'
  | 'learnerAnalyticsConsent'
  | 'lessonProgress'
  | 'learningActivityRecord'
  | 'chapterQuizAttempt'
  | 'chapterQuizAttemptAnswer'
  | 'courseLesson'
  | 'courseChapter'
  | 'quiz'
>;

export type PublishedCourseView = {
  id: string;
  code: string;
  title: string;
  description: string;
  areaCode: string;
  imageObjectKey: string | null;
  language: string;
  priceAmount: string;
  priceCurrency: string;
  typicalLearningTimeMinutes: number | null;
  learningObjectives: string | null;
  educationalLevel: string | null;
  targetAudience: string | null;
  requiresCertification: boolean;
};

export type CatalogueView = {
  areas: readonly { code: string }[];
  courses: readonly PublishedCourseView[];
};

export type EnrolmentView = {
  enrolmentId: string;
  courseId: string;
  courseTitle: string;
  areaCode: string;
  enrolledAt: string;
  progressPercent: number;
  completedAt: string | null;
  paymentState: 'PENDING_PAYMENT' | 'NOT_REQUIRED';
  amount: string;
  currency: string;
  alreadyEnrolled: boolean;
};

export type PlayerBlockView = {
  id: string;
  sequence: number;
  kind: 'PDF' | 'VIDEO' | 'TEXT';
  title: string | null;
  textBody: string | null;
  objectKey: string | null;
};

export type PlayerView = {
  enrolmentId: string;
  paymentState: 'PENDING_PAYMENT' | 'NOT_REQUIRED';
  course: {
    id: string;
    title: string;
    description: string;
    areaCode: string;
    imageObjectKey: string | null;
    minimumTimeSeconds: number;
    progressPercent: number;
    completedAt: string | null;
  };
  chapters: readonly {
    id: string;
    sequence: number;
    title: string;
    minimumTimeSeconds: number;
    timeSpentSeconds: number;
    lessons: readonly {
      id: string;
      sequence: number;
      title: string;
      minimumTimeSeconds: number;
      timeSpentSeconds: number;
      completed: boolean;
      blocks: readonly PlayerBlockView[];
    }[];
    quiz: null | {
      id: string;
      title: string;
      passMarkPercent: number;
      passed: boolean;
      latestScorePercent: number | null;
      items: readonly {
        id: string;
        sequence: number;
        stem: string;
        choices: readonly { choiceKey: string; text: string }[];
      }[];
    };
  }[];
};

export type ProgressView = {
  lessonId: string;
  timeSpentSeconds: number;
  completed: boolean;
  progressPercent: number;
  statementId: string;
  analyticsConsent: boolean;
  duplicate: boolean;
};

export type QuizAttemptView = {
  attemptId: string;
  quizId: string;
  scorePercent: number;
  passed: boolean;
  statementId: string;
  analyticsConsent: boolean;
  duplicate: boolean;
  results: readonly { itemId: string; selectedChoiceKey: string; correct: boolean }[];
};

export type StatisticsView = {
  analyticsConsent: boolean;
  enrolments: readonly {
    enrolmentId: string;
    courseId: string;
    courseTitle: string;
    areaCode: string;
    progressPercent: number;
    completedAt: string | null;
    paymentState: 'PENDING_PAYMENT' | 'NOT_REQUIRED';
  }[];
  quizResults: readonly {
    attemptId: string;
    quizId: string;
    quizTitle: string;
    courseTitle: string;
    scorePercent: number;
    passed: boolean;
    submittedAt: string;
  }[];
};

function money(value: { toFixed: (digits: number) => string }): string {
  return value.toFixed(2);
}

function courseSelect() {
  return {
    id: true,
    code: true,
    title: true,
    description: true,
    areaCode: true,
    imageObjectKey: true,
    language: true,
    priceAmount: true,
    priceCurrency: true,
    typicalLearningTimeMinutes: true,
    learningObjectives: true,
    educationalLevel: true,
    targetAudience: true,
    requiresCertification: true,
  } as const;
}

function toCourse(row: {
  id: string;
  code: string;
  title: string;
  description: string;
  areaCode: string;
  imageObjectKey: string | null;
  language: string;
  priceAmount: { toFixed: (digits: number) => string };
  priceCurrency: string;
  typicalLearningTimeMinutes: number | null;
  learningObjectives: string | null;
  educationalLevel: string | null;
  targetAudience: string | null;
  requiresCertification: boolean;
}): PublishedCourseView {
  return { ...row, priceAmount: money(row.priceAmount) };
}

function activityStatement(input: {
  tenantId: string;
  userId: string;
  verbIri: string;
  objectKind: 'COURSE' | 'LESSON' | 'QUIZ';
  objectId: string;
  storedAt: Date;
  result: Record<string, string | number | boolean | null>;
}): Prisma.InputJsonValue {
  return {
    actor: {
      objectType: 'Agent',
      account: {
        homePage: `https://confora.local/tenants/${input.tenantId}`,
        name: input.userId,
      },
    },
    verb: { id: input.verbIri },
    object: { id: `urn:confora:${input.objectKind.toLowerCase()}:${input.objectId}` },
    result: input.result,
    timestamp: input.storedAt.toISOString(),
  };
}

async function readConsent(tx: Tx, tenantId: string, userId: string): Promise<boolean> {
  const row = await tx.learnerAnalyticsConsent.findUnique({
    where: { tenantId_userId: { tenantId, userId } },
    select: { granted: true },
  });
  return row?.granted ?? false;
}

async function writeConsent(
  tx: Tx,
  tenantId: string,
  userId: string,
  granted: boolean,
  decidedAt: Date,
): Promise<void> {
  await tx.learnerAnalyticsConsent.upsert({
    where: { tenantId_userId: { tenantId, userId } },
    create: { tenantId, userId, granted, decidedAt },
    update: { granted, decidedAt },
  });
}

async function recomputeEnrolment(
  tx: Tx,
  tenantId: string,
  enrolmentId: string,
  courseId: string,
  now: Date,
): Promise<number> {
  const lessons = await tx.courseLesson.findMany({
    where: { tenantId, chapter: { tenantId, courseId } },
    select: { id: true, chapterId: true },
  });
  const progressRows = await tx.lessonProgress.findMany({
    where: { tenantId, enrolmentId },
    select: { lessonId: true, timeSpentSeconds: true, completedAt: true },
  });
  const progressByLesson = new Map(progressRows.map((row) => [row.lessonId, row]));
  const completedLessons = lessons.filter((lesson) => progressByLesson.get(lesson.id)?.completedAt);
  const chapters = await tx.courseChapter.findMany({
    where: { tenantId, courseId },
    select: { id: true, minimumTimeSeconds: true },
  });
  const chaptersReady = chapters.every((chapter) => {
    const inChapter = lessons.filter((lesson) => lesson.chapterId === chapter.id);
    const spent = inChapter.reduce(
      (sum, lesson) => sum + (progressByLesson.get(lesson.id)?.timeSpentSeconds ?? 0),
      0,
    );
    const lessonsDone = inChapter.every((lesson) => progressByLesson.get(lesson.id)?.completedAt);
    return lessonsDone && spent >= chapter.minimumTimeSeconds;
  });
  const quizzes = await tx.quiz.findMany({
    where: { tenantId, chapter: { tenantId, courseId } },
    select: { id: true },
  });
  const passes = await tx.chapterQuizAttempt.findMany({
    where: { tenantId, enrolmentId, passed: true },
    select: { quizId: true },
  });
  const passedIds = new Set(passes.map((row) => row.quizId));
  const quizzesDone = quizzes.every((quiz) => passedIds.has(quiz.id));
  const progressPercent =
    lessons.length === 0 ? 0 : Math.round((completedLessons.length / lessons.length) * 100);
  const complete = lessons.length > 0 && chaptersReady && quizzesDone;
  await tx.enrolment.update({
    where: { tenantId_id: { tenantId, id: enrolmentId } },
    data: {
      progressPercent,
      completedAt: complete ? now : null,
    },
  });
  return progressPercent;
}

export async function listPublishedCourses(
  db: LearningClient,
  tenantId: string,
  areaCode?: string,
): Promise<CatalogueView> {
  const [areas, courses] = await Promise.all([
    db.course.findMany({
      where: { tenantId, lifecycle: 'PUBLISHED' },
      distinct: ['areaCode'],
      select: { areaCode: true },
      orderBy: { areaCode: 'asc' },
    }),
    db.course.findMany({
      where: {
        tenantId,
        lifecycle: 'PUBLISHED',
        ...(areaCode ? { areaCode } : {}),
      },
      select: courseSelect(),
      orderBy: [{ areaCode: 'asc' }, { title: 'asc' }],
    }),
  ]);
  return {
    areas: areas.map((row) => ({ code: row.areaCode })),
    courses: courses.map(toCourse),
  };
}

export async function getPublishedCourse(
  db: LearningClient,
  tenantId: string,
  courseId: string,
): Promise<PublishedCourseView> {
  const row = await db.course.findFirst({
    where: { tenantId, id: courseId, lifecycle: 'PUBLISHED' },
    select: courseSelect(),
  });
  if (!row) {
    throw new LearningNotFoundError();
  }
  return toCourse(row);
}

export type PublicProgramView = {
  courseId: string;
  code: string;
  title: string;
  description: string;
  areaCode: string;
  language: string;
  typicalLearningTimeMinutes: number | null;
  learningObjectives: string | null;
  educationalLevel: string | null;
  targetAudience: string | null;
};

const publicProgramSelect = {
  id: true,
  code: true,
  title: true,
  description: true,
  areaCode: true,
  language: true,
  typicalLearningTimeMinutes: true,
  learningObjectives: true,
  educationalLevel: true,
  targetAudience: true,
} as const;

function toPublicProgram(row: {
  id: string;
  code: string;
  title: string;
  description: string;
  areaCode: string;
  language: string;
  typicalLearningTimeMinutes: number | null;
  learningObjectives: string | null;
  educationalLevel: string | null;
  targetAudience: string | null;
}): PublicProgramView {
  return {
    courseId: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    areaCode: row.areaCode,
    language: row.language,
    typicalLearningTimeMinutes: row.typicalLearningTimeMinutes,
    learningObjectives: row.learningObjectives,
    educationalLevel: row.educationalLevel,
    targetAudience: row.targetAudience,
  };
}

const PUBLIC_CATALOG_TENANT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Organizations whose published programmes may appear to anonymous readers.
 * Unset, blank, `*`, and non-UUID tokens produce an empty list. That list
 * fails closed: the catalogue is empty and a course id is not found.
 * The request cannot supply this list.
 */
export function publicCatalogTenantIds(
  raw: string | undefined = process.env['PUBLIC_CATALOG_TENANT_IDS'],
): readonly string[] {
  if (!raw?.trim()) {
    return [];
  }
  const ids: string[] = [];
  for (const part of raw.split(',')) {
    const token = part.trim().toLowerCase();
    if (PUBLIC_CATALOG_TENANT_ID.test(token) && !ids.includes(token)) {
      ids.push(token);
    }
  }
  return ids;
}

/**
 * Published programme metadata for the server allowlist only.
 * An empty allowlist returns no rows. The caller cannot select an organisation.
 * People, enrolments, prices and storage keys are omitted.
 */
export async function listPublicPublishedPrograms(
  db: LearningClient,
  tenantIds: readonly string[],
  areaCode?: string,
): Promise<{ courses: readonly PublicProgramView[] }> {
  if (tenantIds.length === 0) {
    return { courses: [] };
  }
  const courses = await db.course.findMany({
    where: {
      lifecycle: 'PUBLISHED',
      tenantId: { in: [...tenantIds] },
      ...(areaCode ? { areaCode } : {}),
    },
    select: publicProgramSelect,
    orderBy: [{ areaCode: 'asc' }, { title: 'asc' }],
  });
  return { courses: courses.map(toPublicProgram) };
}

export async function getPublicPublishedProgram(
  db: LearningClient,
  tenantIds: readonly string[],
  courseId: string,
): Promise<PublicProgramView> {
  if (tenantIds.length === 0) {
    throw new LearningNotFoundError();
  }
  const row = await db.course.findFirst({
    where: {
      id: courseId,
      lifecycle: 'PUBLISHED',
      tenantId: { in: [...tenantIds] },
    },
    select: publicProgramSelect,
  });
  if (!row) {
    throw new LearningNotFoundError();
  }
  return toPublicProgram(row);
}

async function enrolmentView(
  tx: Tx,
  tenantId: string,
  enrolmentId: string,
  alreadyEnrolled: boolean,
): Promise<EnrolmentView> {
  const row = await tx.enrolment.findFirst({
    where: { tenantId, id: enrolmentId },
    include: {
      course: { select: { id: true, title: true, areaCode: true } },
      paymentIntent: true,
    },
  });
  if (!row || !row.paymentIntent) {
    throw new LearningNotFoundError();
  }
  return {
    enrolmentId: row.id,
    courseId: row.course.id,
    courseTitle: row.course.title,
    areaCode: row.course.areaCode,
    enrolledAt: row.enrolledAt.toISOString(),
    progressPercent: row.progressPercent,
    completedAt: row.completedAt?.toISOString() ?? null,
    paymentState: row.paymentIntent.state,
    amount: money(row.paymentIntent.amount),
    currency: row.paymentIntent.currency,
    alreadyEnrolled,
  };
}

export async function enrolInCourse(
  db: LearningClient,
  input: { tenantId: string; userId: string; courseId: string; now: Date },
): Promise<EnrolmentView & { statementId: string; analyticsConsent: boolean }> {
  return db.$transaction(async (tx) => {
    const course = await tx.course.findFirst({
      where: { tenantId: input.tenantId, id: input.courseId, lifecycle: 'PUBLISHED' },
      select: { id: true, priceAmount: true, priceCurrency: true },
    });
    if (!course) {
      throw new LearningNotFoundError();
    }
    const existing = await tx.enrolment.findFirst({
      where: { tenantId: input.tenantId, userId: input.userId, courseId: course.id },
      select: { id: true },
    });
    if (existing) {
      const view = await enrolmentView(tx, input.tenantId, existing.id, true);
      return { ...view, statementId: existing.id, analyticsConsent: false };
    }
    const price = Number(course.priceAmount);
    const state = price > 0 ? 'PENDING_PAYMENT' : 'NOT_REQUIRED';
    const enrolment = await tx.enrolment.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        courseId: course.id,
        enrolledAt: input.now,
      },
    });
    await tx.enrolmentPaymentIntent.create({
      data: {
        tenantId: input.tenantId,
        enrolmentId: enrolment.id,
        amount: course.priceAmount,
        currency: course.priceCurrency,
        state,
      },
    });
    const analyticsConsent = await readConsent(tx, input.tenantId, input.userId);
    const statementId = randomUUID();
    await tx.learningActivityRecord.create({
      data: {
        tenantId: input.tenantId,
        statementId,
        actorUserId: input.userId,
        verbIri: XAPI_VERB.registered,
        objectKind: 'COURSE',
        objectId: course.id,
        storedAt: input.now,
        analyticsConsent,
        rawStatement: activityStatement({
          tenantId: input.tenantId,
          userId: input.userId,
          verbIri: XAPI_VERB.registered,
          objectKind: 'COURSE',
          objectId: course.id,
          storedAt: input.now,
          result: { completion: false },
        }),
      },
    });
    const view = await enrolmentView(tx, input.tenantId, enrolment.id, false);
    return { ...view, statementId, analyticsConsent };
  });
}

export async function listMyEnrolments(
  db: LearningClient,
  tenantId: string,
  userId: string,
): Promise<readonly EnrolmentView[]> {
  const rows = await db.enrolment.findMany({
    where: { tenantId, userId },
    orderBy: { enrolledAt: 'desc' },
    include: {
      course: { select: { id: true, title: true, areaCode: true, priceCurrency: true } },
      paymentIntent: true,
    },
  });
  return rows.map((row) => ({
    enrolmentId: row.id,
    courseId: row.course.id,
    courseTitle: row.course.title,
    areaCode: row.course.areaCode,
    enrolledAt: row.enrolledAt.toISOString(),
    progressPercent: row.progressPercent,
    completedAt: row.completedAt?.toISOString() ?? null,
    paymentState: row.paymentIntent?.state ?? 'NOT_REQUIRED',
    amount: row.paymentIntent ? money(row.paymentIntent.amount) : '0.00',
    currency: row.paymentIntent?.currency ?? row.course.priceCurrency,
    alreadyEnrolled: true,
  }));
}

type PlayerRow = {
  id: string;
  progressPercent: number;
  completedAt: Date | null;
  paymentIntent: { state: 'PENDING_PAYMENT' | 'NOT_REQUIRED' } | null;
  lessonProgress: readonly {
    lessonId: string;
    timeSpentSeconds: number;
    completedAt: Date | null;
  }[];
  quizAttempts: readonly {
    quizId: string;
    scorePercent: number;
    passed: boolean;
    submittedAt: Date;
  }[];
  course: {
    id: string;
    title: string;
    description: string;
    areaCode: string;
    imageObjectKey: string | null;
    minimumTimeSeconds: number;
    chapters: readonly {
      id: string;
      sequence: number;
      title: string;
      minimumTimeSeconds: number;
      lessons: readonly {
        id: string;
        sequence: number;
        title: string;
        minimumTimeSeconds: number;
        blocks: readonly PlayerBlockView[];
      }[];
      quizzes: readonly {
        id: string;
        title: string;
        passMarkPercent: number;
        items: readonly {
          sequence: number;
          item: {
            id: string;
            stem: string;
            correctChoiceKey: string;
            choices: readonly { choiceKey: string; text: string }[];
          };
        }[];
      }[];
    }[];
  };
};

/** Drops correctChoiceKey before the player payload leaves the server. */
export function toPlayerView(row: PlayerRow): PlayerView {
  const progress = new Map(row.lessonProgress.map((item) => [item.lessonId, item]));
  const latestQuiz = new Map<string, { scorePercent: number; passed: boolean }>();
  const attempts = [...row.quizAttempts].sort(
    (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
  );
  for (const attempt of attempts) {
    if (!latestQuiz.has(attempt.quizId)) {
      latestQuiz.set(attempt.quizId, {
        scorePercent: attempt.scorePercent,
        passed: attempt.passed,
      });
    }
  }
  return {
    enrolmentId: row.id,
    paymentState: row.paymentIntent?.state ?? 'NOT_REQUIRED',
    course: {
      id: row.course.id,
      title: row.course.title,
      description: row.course.description,
      areaCode: row.course.areaCode,
      imageObjectKey: row.course.imageObjectKey,
      minimumTimeSeconds: row.course.minimumTimeSeconds,
      progressPercent: row.progressPercent,
      completedAt: row.completedAt?.toISOString() ?? null,
    },
    chapters: row.course.chapters.map((chapter) => {
      const lessons = chapter.lessons.map((lesson) => {
        const state = progress.get(lesson.id);
        return {
          id: lesson.id,
          sequence: lesson.sequence,
          title: lesson.title,
          minimumTimeSeconds: lesson.minimumTimeSeconds,
          timeSpentSeconds: state?.timeSpentSeconds ?? 0,
          completed: Boolean(state?.completedAt),
          blocks: lesson.blocks,
        };
      });
      const quiz = chapter.quizzes[0];
      const latest = quiz ? latestQuiz.get(quiz.id) : undefined;
      return {
        id: chapter.id,
        sequence: chapter.sequence,
        title: chapter.title,
        minimumTimeSeconds: chapter.minimumTimeSeconds,
        timeSpentSeconds: lessons.reduce((sum, lesson) => sum + lesson.timeSpentSeconds, 0),
        lessons,
        quiz: quiz
          ? {
              id: quiz.id,
              title: quiz.title,
              passMarkPercent: quiz.passMarkPercent,
              passed: latest?.passed ?? false,
              latestScorePercent: latest?.scorePercent ?? null,
              items: quiz.items.map((link) => ({
                id: link.item.id,
                sequence: link.sequence,
                stem: link.item.stem,
                choices: link.item.choices.map((choice) => ({
                  choiceKey: choice.choiceKey,
                  text: choice.text,
                })),
              })),
            }
          : null,
      };
    }),
  };
}

export async function getPlayer(
  db: LearningClient,
  tenantId: string,
  userId: string,
  enrolmentId: string,
): Promise<PlayerView> {
  const row = await db.enrolment.findFirst({
    where: { tenantId, id: enrolmentId, userId },
    include: {
      paymentIntent: { select: { state: true } },
      lessonProgress: { select: { lessonId: true, timeSpentSeconds: true, completedAt: true } },
      quizAttempts: {
        select: { quizId: true, scorePercent: true, passed: true, submittedAt: true },
      },
      course: {
        include: {
          chapters: {
            orderBy: { sequence: 'asc' },
            include: {
              lessons: {
                orderBy: { sequence: 'asc' },
                include: { blocks: { orderBy: { sequence: 'asc' } } },
              },
              quizzes: {
                orderBy: { createdAt: 'asc' },
                include: {
                  items: {
                    orderBy: { sequence: 'asc' },
                    include: {
                      item: {
                        include: { choices: { orderBy: { choiceKey: 'asc' } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!row) {
    throw new LearningNotFoundError();
  }
  return toPlayerView(row);
}

export async function recordLessonProgress(
  db: LearningClient,
  input: {
    tenantId: string;
    userId: string;
    enrolmentId: string;
    lessonId: string;
    additionalSeconds: number;
    statementId: string;
    analyticsConsent?: boolean;
    now: Date;
  },
): Promise<ProgressView> {
  assertProgressIncrement(input.additionalSeconds);
  return db.$transaction(async (tx) => {
    const existing = await tx.learningActivityRecord.findUnique({
      where: { statementId: input.statementId },
      select: { actorUserId: true, tenantId: true },
    });
    if (existing) {
      if (existing.actorUserId !== input.userId || existing.tenantId !== input.tenantId) {
        throw new LearningNotFoundError();
      }
      const current = await tx.lessonProgress.findFirst({
        where: {
          tenantId: input.tenantId,
          enrolmentId: input.enrolmentId,
          lessonId: input.lessonId,
        },
      });
      const enrolment = await tx.enrolment.findFirst({
        where: { tenantId: input.tenantId, id: input.enrolmentId, userId: input.userId },
        select: { progressPercent: true },
      });
      if (!enrolment || !current) {
        throw new LearningNotFoundError();
      }
      return {
        lessonId: input.lessonId,
        timeSpentSeconds: current.timeSpentSeconds,
        completed: current.completedAt !== null,
        progressPercent: enrolment.progressPercent,
        statementId: input.statementId,
        analyticsConsent: await readConsent(tx, input.tenantId, input.userId),
        duplicate: true,
      };
    }
    const enrolment = await tx.enrolment.findFirst({
      where: { tenantId: input.tenantId, id: input.enrolmentId, userId: input.userId },
      select: { id: true, courseId: true },
    });
    if (!enrolment) {
      throw new LearningNotFoundError();
    }
    const lesson = await tx.courseLesson.findFirst({
      where: {
        tenantId: input.tenantId,
        id: input.lessonId,
        chapter: { tenantId: input.tenantId, courseId: enrolment.courseId },
      },
      select: { id: true, minimumTimeSeconds: true },
    });
    if (!lesson) {
      throw new LearningNotFoundError();
    }
    if (input.analyticsConsent !== undefined) {
      await writeConsent(tx, input.tenantId, input.userId, input.analyticsConsent, input.now);
    }
    const analyticsConsent = await readConsent(tx, input.tenantId, input.userId);
    const prior = await tx.lessonProgress.findUnique({
      where: {
        tenantId_enrolmentId_lessonId: {
          tenantId: input.tenantId,
          enrolmentId: enrolment.id,
          lessonId: lesson.id,
        },
      },
    });
    const timeSpentSeconds = (prior?.timeSpentSeconds ?? 0) + input.additionalSeconds;
    const completed = lessonMeetsMinimumTime(timeSpentSeconds, lesson.minimumTimeSeconds);
    const completedAt = completed ? (prior?.completedAt ?? input.now) : null;
    if (prior) {
      await tx.lessonProgress.update({
        where: { tenantId_id: { tenantId: input.tenantId, id: prior.id } },
        data: { timeSpentSeconds, completedAt },
      });
    } else {
      await tx.lessonProgress.create({
        data: {
          tenantId: input.tenantId,
          enrolmentId: enrolment.id,
          lessonId: lesson.id,
          timeSpentSeconds,
          completedAt,
        },
      });
    }
    const progressPercent = await recomputeEnrolment(
      tx,
      input.tenantId,
      enrolment.id,
      enrolment.courseId,
      input.now,
    );
    const verbIri = completed ? XAPI_VERB.completed : XAPI_VERB.progressed;
    await tx.learningActivityRecord.create({
      data: {
        tenantId: input.tenantId,
        statementId: input.statementId,
        actorUserId: input.userId,
        verbIri,
        objectKind: 'LESSON',
        objectId: lesson.id,
        resultSuccess: completed,
        resultDurationIso: isoDurationSeconds(timeSpentSeconds),
        storedAt: input.now,
        analyticsConsent,
        rawStatement: activityStatement({
          tenantId: input.tenantId,
          userId: input.userId,
          verbIri,
          objectKind: 'LESSON',
          objectId: lesson.id,
          storedAt: input.now,
          result: { completion: completed, duration: isoDurationSeconds(timeSpentSeconds) },
        }),
      },
    });
    return {
      lessonId: lesson.id,
      timeSpentSeconds,
      completed,
      progressPercent,
      statementId: input.statementId,
      analyticsConsent,
      duplicate: false,
    };
  });
}

export async function submitChapterQuiz(
  db: LearningClient,
  input: {
    tenantId: string;
    userId: string;
    enrolmentId: string;
    quizId: string;
    statementId: string;
    answers: readonly { itemId: string; choiceKey: string }[];
    analyticsConsent?: boolean;
    now: Date;
  },
): Promise<QuizAttemptView> {
  return db.$transaction(async (tx) => {
    const existing = await tx.learningActivityRecord.findUnique({
      where: { statementId: input.statementId },
      select: { id: true, actorUserId: true, tenantId: true, objectId: true },
    });
    if (existing) {
      if (existing.actorUserId !== input.userId || existing.tenantId !== input.tenantId) {
        throw new LearningNotFoundError();
      }
      const attempt = await tx.chapterQuizAttempt.findFirst({
        where: { tenantId: input.tenantId, enrolmentId: input.enrolmentId, quizId: input.quizId },
        orderBy: { submittedAt: 'desc' },
        include: { answers: true },
      });
      if (!attempt) {
        throw new LearningNotFoundError();
      }
      return {
        attemptId: attempt.id,
        quizId: attempt.quizId,
        scorePercent: attempt.scorePercent,
        passed: attempt.passed,
        statementId: input.statementId,
        analyticsConsent: await readConsent(tx, input.tenantId, input.userId),
        duplicate: true,
        results: attempt.answers.map((answer) => ({
          itemId: answer.itemId,
          selectedChoiceKey: answer.selectedChoiceKey,
          correct: answer.correct,
        })),
      };
    }
    const enrolment = await tx.enrolment.findFirst({
      where: { tenantId: input.tenantId, id: input.enrolmentId, userId: input.userId },
      select: { id: true, courseId: true },
    });
    if (!enrolment) {
      throw new LearningNotFoundError();
    }
    const quiz = await tx.quiz.findFirst({
      where: {
        tenantId: input.tenantId,
        id: input.quizId,
        chapter: { tenantId: input.tenantId, courseId: enrolment.courseId },
      },
      include: {
        items: {
          orderBy: { sequence: 'asc' },
          include: { item: { include: { choices: true } } },
        },
      },
    });
    if (!quiz) {
      throw new LearningNotFoundError();
    }
    const scored = scoreChapterQuiz({
      passMarkPercent: quiz.passMarkPercent,
      items: quiz.items.map((link) => ({
        itemId: link.item.id,
        correctChoiceKey: link.item.correctChoiceKey,
        choiceKeys: link.item.choices.map((choice) => choice.choiceKey),
      })),
      answers: input.answers,
    });
    if (input.analyticsConsent !== undefined) {
      await writeConsent(tx, input.tenantId, input.userId, input.analyticsConsent, input.now);
    }
    const analyticsConsent = await readConsent(tx, input.tenantId, input.userId);
    const attempt = await tx.chapterQuizAttempt.create({
      data: {
        tenantId: input.tenantId,
        enrolmentId: enrolment.id,
        quizId: quiz.id,
        scorePercent: scored.scorePercent,
        passed: scored.passed,
        submittedAt: input.now,
      },
    });
    await tx.chapterQuizAttemptAnswer.createMany({
      data: scored.results.map((result) => ({
        tenantId: input.tenantId,
        attemptId: attempt.id,
        itemId: result.itemId,
        selectedChoiceKey: result.selectedChoiceKey,
        correct: result.correct,
      })),
    });
    await recomputeEnrolment(tx, input.tenantId, enrolment.id, enrolment.courseId, input.now);
    const verbIri = scored.passed ? XAPI_VERB.passed : XAPI_VERB.failed;
    await tx.learningActivityRecord.create({
      data: {
        tenantId: input.tenantId,
        statementId: input.statementId,
        actorUserId: input.userId,
        verbIri,
        objectKind: 'QUIZ',
        objectId: quiz.id,
        resultScoreScaled: scored.scorePercent / 100,
        resultSuccess: scored.passed,
        storedAt: input.now,
        analyticsConsent,
        rawStatement: activityStatement({
          tenantId: input.tenantId,
          userId: input.userId,
          verbIri,
          objectKind: 'QUIZ',
          objectId: quiz.id,
          storedAt: input.now,
          result: { success: scored.passed, scoreScaled: scored.scorePercent / 100 },
        }),
      },
    });
    return {
      attemptId: attempt.id,
      quizId: quiz.id,
      scorePercent: scored.scorePercent,
      passed: scored.passed,
      statementId: input.statementId,
      analyticsConsent,
      duplicate: false,
      results: scored.results,
    };
  });
}

export async function getLearningStatistics(
  db: LearningClient,
  tenantId: string,
  userId: string,
): Promise<StatisticsView> {
  const [consent, enrolments, attempts] = await Promise.all([
    db.learnerAnalyticsConsent.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
      select: { granted: true },
    }),
    db.enrolment.findMany({
      where: { tenantId, userId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: { select: { id: true, title: true, areaCode: true } },
        paymentIntent: { select: { state: true } },
      },
    }),
    db.chapterQuizAttempt.findMany({
      where: { tenantId, enrolment: { tenantId, userId } },
      orderBy: { submittedAt: 'desc' },
      include: {
        quiz: {
          select: { title: true, chapter: { select: { course: { select: { title: true } } } } },
        },
      },
    }),
  ]);
  return {
    analyticsConsent: consent?.granted ?? false,
    enrolments: enrolments.map((row) => ({
      enrolmentId: row.id,
      courseId: row.course.id,
      courseTitle: row.course.title,
      areaCode: row.course.areaCode,
      progressPercent: row.progressPercent,
      completedAt: row.completedAt?.toISOString() ?? null,
      paymentState: row.paymentIntent?.state ?? 'NOT_REQUIRED',
    })),
    quizResults: attempts.map((row) => ({
      attemptId: row.id,
      quizId: row.quizId,
      quizTitle: row.quiz.title,
      courseTitle: row.quiz.chapter.course.title,
      scorePercent: row.scorePercent,
      passed: row.passed,
      submittedAt: row.submittedAt.toISOString(),
    })),
  };
}

export async function getAnalyticsConsent(
  db: LearningClient,
  tenantId: string,
  userId: string,
): Promise<{ granted: boolean }> {
  const row = await db.learnerAnalyticsConsent.findUnique({
    where: { tenantId_userId: { tenantId, userId } },
    select: { granted: true },
  });
  return { granted: row?.granted ?? false };
}

export async function setAnalyticsConsent(
  db: LearningClient,
  input: { tenantId: string; userId: string; granted: boolean; now: Date },
): Promise<{ granted: boolean }> {
  await db.learnerAnalyticsConsent.upsert({
    where: { tenantId_userId: { tenantId: input.tenantId, userId: input.userId } },
    create: {
      tenantId: input.tenantId,
      userId: input.userId,
      granted: input.granted,
      decidedAt: input.now,
    },
    update: { granted: input.granted, decidedAt: input.now },
  });
  return { granted: input.granted };
}
