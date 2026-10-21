import { LearningRuleError, lessonMeetsMinimumTime, scoreChapterQuiz } from './learning-rules';

const items = [
  { itemId: '11111111-1111-4111-8111-111111111111', correctChoiceKey: 'A', choiceKeys: ['A', 'B'] },
  { itemId: '22222222-2222-4222-8222-222222222222', correctChoiceKey: 'B', choiceKeys: ['A', 'B'] },
] as const;

describe('learning rules', () => {
  it('marks a lesson complete only after the minimum time', () => {
    expect(lessonMeetsMinimumTime(59, 60)).toBe(false);
    expect(lessonMeetsMinimumTime(60, 60)).toBe(true);
    expect(lessonMeetsMinimumTime(0, 0)).toBe(true);
  });

  it('scores a chapter quiz without treating a partial answer as a pass', () => {
    const scored = scoreChapterQuiz({
      passMarkPercent: 70,
      items,
      answers: [
        { itemId: items[0].itemId, choiceKey: 'A' },
        { itemId: items[1].itemId, choiceKey: 'A' },
      ],
    });
    expect(scored.scorePercent).toBe(50);
    expect(scored.passed).toBe(false);
    expect(scored.results.map((row) => row.correct)).toEqual([true, false]);
  });

  it('passes when the score meets the mark', () => {
    const scored = scoreChapterQuiz({
      passMarkPercent: 50,
      items,
      answers: [
        { itemId: items[1].itemId, choiceKey: 'B' },
        { itemId: items[0].itemId, choiceKey: 'A' },
      ],
    });
    expect(scored.passed).toBe(true);
    expect(scored.scorePercent).toBe(100);
  });

  it('rejects an unknown choice and a short answer list', () => {
    expect(() =>
      scoreChapterQuiz({
        passMarkPercent: 50,
        items,
        answers: [{ itemId: items[0].itemId, choiceKey: 'Z' }],
      }),
    ).toThrow(LearningRuleError);
    expect(() =>
      scoreChapterQuiz({
        passMarkPercent: 50,
        items,
        answers: [
          { itemId: items[0].itemId, choiceKey: 'Z' },
          { itemId: items[1].itemId, choiceKey: 'B' },
        ],
      }),
    ).toThrow(LearningRuleError);
  });
});
