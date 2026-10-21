export const XAPI_VERB = {
  registered: 'http://adlnet.gov/expapi/verbs/registered',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
} as const;

export const MAX_PROGRESS_INCREMENT_SECONDS = 86_400;

export type LearningRuleCode =
  | 'EMPTY_QUIZ'
  | 'ANSWER_COUNT'
  | 'DUPLICATE_ANSWER'
  | 'MISSING_ITEM'
  | 'UNKNOWN_CHOICE'
  | 'NEGATIVE_TIME'
  | 'TIME_TOO_LARGE';

export class LearningRuleError extends Error {
  constructor(readonly code: LearningRuleCode) {
    super(code);
    this.name = 'LearningRuleError';
  }
}

export function lessonMeetsMinimumTime(
  timeSpentSeconds: number,
  minimumTimeSeconds: number,
): boolean {
  return timeSpentSeconds >= minimumTimeSeconds;
}

export function assertProgressIncrement(additionalSeconds: number): void {
  if (!Number.isInteger(additionalSeconds) || additionalSeconds < 0) {
    throw new LearningRuleError('NEGATIVE_TIME');
  }
  if (additionalSeconds > MAX_PROGRESS_INCREMENT_SECONDS) {
    throw new LearningRuleError('TIME_TOO_LARGE');
  }
}

export type QuizScoreItem = {
  itemId: string;
  correctChoiceKey: string;
  choiceKeys: readonly string[];
};

export type QuizScoreResult = {
  scorePercent: number;
  passed: boolean;
  results: readonly { itemId: string; selectedChoiceKey: string; correct: boolean }[];
};

/** Server-side scoring. The correct key never needs to leave this function's input. */
export function scoreChapterQuiz(input: {
  passMarkPercent: number;
  items: readonly QuizScoreItem[];
  answers: readonly { itemId: string; choiceKey: string }[];
}): QuizScoreResult {
  if (input.items.length === 0) {
    throw new LearningRuleError('EMPTY_QUIZ');
  }
  if (input.answers.length !== input.items.length) {
    throw new LearningRuleError('ANSWER_COUNT');
  }
  const byId = new Map<string, string>();
  for (const answer of input.answers) {
    if (byId.has(answer.itemId)) {
      throw new LearningRuleError('DUPLICATE_ANSWER');
    }
    byId.set(answer.itemId, answer.choiceKey);
  }
  const results = input.items.map((item) => {
    const selected = byId.get(item.itemId);
    if (selected === undefined) {
      throw new LearningRuleError('MISSING_ITEM');
    }
    if (!item.choiceKeys.includes(selected)) {
      throw new LearningRuleError('UNKNOWN_CHOICE');
    }
    return {
      itemId: item.itemId,
      selectedChoiceKey: selected,
      correct: selected === item.correctChoiceKey,
    };
  });
  const correctCount = results.filter((row) => row.correct).length;
  const scorePercent = Math.round((correctCount / input.items.length) * 100);
  return {
    scorePercent,
    passed: scorePercent >= input.passMarkPercent,
    results,
  };
}

export function isoDurationSeconds(seconds: number): string {
  return `PT${String(seconds)}S`;
}

export function paymentStateForPrice(
  priceAmount: { greaterThan: (n: number) => boolean } | number,
): 'PENDING_PAYMENT' | 'NOT_REQUIRED' {
  if (typeof priceAmount === 'number') {
    return priceAmount > 0 ? 'PENDING_PAYMENT' : 'NOT_REQUIRED';
  }
  return priceAmount.greaterThan(0) ? 'PENDING_PAYMENT' : 'NOT_REQUIRED';
}
