import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  angoffCutScoreBasisPoints,
  assertApplicationEligible,
  assertItemTransition,
  assertNonImageIdentity,
  assertRetakeWindowDays,
  assertStaffAction,
  domainFeedbackForCandidate,
  ExamRuleError,
  formReviewFlag,
  itemIsCorrect,
  itemReviewFlag,
  retakeWindowAnchor,
  kr20,
  pointBiserial,
  pValue,
  scoreBasisPoints,
  selectItemsForBlueprint,
  shuffleStable,
  toCandidateItem,
} from './exam-rules';

describe('exam rules', () => {
  it('keeps training and membership out of eligibility', () => {
    const source = readFileSync(join(__dirname, 'exam-rules.ts'), 'utf8');
    const eligibility = source.slice(
      source.indexOf('export function assertApplicationEligible'),
      source.indexOf('export function assertRetakeWindow'),
    );
    expect(eligibility).not.toMatch(/enrolment|amf|membership|training/i);
    expect(() => {
      assertApplicationEligible(
        { status: 'APPROVED', schemeRef: 'ISMS', applicantUserId: 'cand' },
        'cand',
        'ISMS',
      );
    }).not.toThrow();
    expect(() => {
      assertApplicationEligible(
        { status: 'SUBMITTED', schemeRef: 'ISMS', applicantUserId: 'cand' },
        'cand',
        'ISMS',
      );
    }).toThrow(ExamRuleError);
  });

  it('rejects self-approval and allows a different technical committee member', () => {
    expect(() => {
      assertItemTransition({
        from: 'REVIEW',
        to: 'APPROVED',
        actorUserId: 'author',
        authorUserId: 'author',
        roles: ['COM_TECH'],
      });
    }).toThrow('AUTHOR_CANNOT_APPROVE');
    expect(() => {
      assertItemTransition({
        from: 'REVIEW',
        to: 'APPROVED',
        actorUserId: 'reviewer',
        authorUserId: 'author',
        roles: ['SME'],
      });
    }).toThrow('ROLE_SEPARATION');
    expect(() => {
      assertItemTransition({
        from: 'REVIEW',
        to: 'APPROVED',
        actorUserId: 'reviewer',
        authorUserId: 'author',
        roles: ['COM_TECH'],
      });
    }).not.toThrow();
  });

  it('scores single and multiple choice and hides domain feedback after a pass', () => {
    expect(itemIsCorrect('SINGLE_CHOICE', ['A'], ['A'])).toBe(true);
    expect(itemIsCorrect('SINGLE_CHOICE', ['A'], ['A', 'B'])).toBe(false);
    expect(itemIsCorrect('MULTIPLE_CHOICE', ['A', 'C'], ['C', 'A'])).toBe(true);
    expect(itemIsCorrect('MULTIPLE_CHOICE', ['A', 'C'], ['A'])).toBe(false);
    expect(itemIsCorrect('MULTIPLE_CHOICE', ['A', 'C'], ['A', 'C', 'B'])).toBe(false);
    expect(scoreBasisPoints(7, 10)).toBe(7000);
    const domains = [{ domainCode: 'D1', correct: 1, total: 2 }];
    expect(domainFeedbackForCandidate(true, domains)).toEqual([]);
    expect(domainFeedbackForCandidate(false, domains)).toEqual(domains);
  });

  it('draws the least exposed approved items per domain', () => {
    const selected = selectItemsForBlueprint(
      [
        { domainCode: 'B', title: 'B', weightBasisPoints: 4000, itemCount: 1 },
        { domainCode: 'A', title: 'A', weightBasisPoints: 6000, itemCount: 2 },
      ],
      [
        { id: 'a-high', domainCode: 'A', exposureCount: 5, status: 'APPROVED' },
        { id: 'a-low', domainCode: 'A', exposureCount: 1, status: 'APPROVED' },
        { id: 'a-mid', domainCode: 'A', exposureCount: 3, status: 'APPROVED' },
        { id: 'a-draft', domainCode: 'A', exposureCount: 0, status: 'DRAFT' },
        { id: 'b-only', domainCode: 'B', exposureCount: 0, status: 'APPROVED' },
      ],
    );
    expect(selected.map((row) => row.itemId)).toEqual(['a-low', 'a-mid', 'b-only']);
  });

  it('computes an Angoff cut from panel means', () => {
    expect(
      angoffCutScoreBasisPoints([
        { itemId: 'a', panelistUserId: 'p1', probabilityBasisPoints: 6000 },
        { itemId: 'a', panelistUserId: 'p2', probabilityBasisPoints: 8000 },
        { itemId: 'b', panelistUserId: 'p1', probabilityBasisPoints: 4000 },
        { itemId: 'b', panelistUserId: 'p2', probabilityBasisPoints: 6000 },
      ]),
    ).toBe(6000);
    expect(() => {
      assertRetakeWindowDays(90);
    }).not.toThrow();
    expect(() => {
      assertRetakeWindowDays(30);
    }).toThrow('RETAKE_WINDOW_TOO_SHORT');
    const failedAt = new Date('2026-01-01T00:00:00.000Z');
    expect(retakeWindowAnchor({ submittedAt: failedAt, passed: false })).toEqual(failedAt);
    expect(retakeWindowAnchor({ submittedAt: failedAt, passed: true })).toBeNull();
    expect(retakeWindowAnchor(null)).toBeNull();
  });

  it('keeps the system administrator out of the item bank and certification decisions', () => {
    expect(() => {
      assertStaffAction(['STAFF_SYSADM'], 'ITEM_WRITE');
    }).toThrow('ROLE_SEPARATION');
    expect(() => {
      assertStaffAction(['STAFF_SYSADM'], 'ITEM_APPROVE');
    }).toThrow('ROLE_SEPARATION');
    expect(() => {
      assertStaffAction(['STAFF_SYSADM'], 'DECIDE');
    }).toThrow('ROLE_SEPARATION');
    expect(() => {
      assertStaffAction(['STAFF_SYSADM'], 'IDENTITY_CONFIRM');
    }).toThrow('ROLE_SEPARATION');
  });

  it('requires a non-image identity record before a session can be ready', () => {
    const checkedAt = new Date('2026-10-20T09:00:00.000Z');
    expect(() => {
      assertNonImageIdentity({
        documentType: 'PASSPORT',
        method: 'HUMAN_VISUAL',
        outcome: 'VERIFIED',
        reviewerUserId: 'invigilator',
        subjectUserId: 'candidate',
        candidateUserId: 'candidate',
        checkedAt,
        hasImage: false,
      });
    }).not.toThrow();
    expect(() => {
      assertNonImageIdentity({
        documentType: 'PASSPORT',
        method: 'HUMAN_VISUAL',
        outcome: 'VERIFIED',
        reviewerUserId: 'invigilator',
        subjectUserId: 'candidate',
        candidateUserId: 'candidate',
        checkedAt,
        hasImage: true,
      });
    }).toThrow('IDENTITY_IMAGE_FORBIDDEN');
    expect(() => {
      assertNonImageIdentity({
        documentType: '',
        method: 'HUMAN_VISUAL',
        outcome: 'VERIFIED',
        reviewerUserId: 'invigilator',
        subjectUserId: 'candidate',
        candidateUserId: 'candidate',
        checkedAt,
        hasImage: false,
      });
    }).toThrow('IDENTITY_DOCUMENT_TYPE');
  });

  it('computes p-value, point-biserial and KR-20', () => {
    expect(pValue(2, 3)).toBeCloseTo(2 / 3);
    const totals = [2, 1, 0];
    const item = [1, 1, 0];
    expect(pointBiserial(item, totals)).toBeCloseTo(1.5 * Math.sqrt(2 / 9));
    const matrix = [
      [1, 1],
      [1, 1],
      [0, 0],
      [0, 0],
    ];
    expect(kr20(matrix)).toBeCloseTo(1.25);
    expect(itemReviewFlag(0.1, 0.05)).toBe('P_VALUE,DISCRIMINATION');
    expect(itemReviewFlag(0.5, 0.4)).toBeNull();
    expect(formReviewFlag(0.69)).toBe('KR20');
    expect(formReviewFlag(0.8)).toBeNull();
    expect(formReviewFlag(null)).toBe('INSUFFICIENT_DATA');
  });

  it('strips correct keys from the candidate item view', () => {
    const view = toCandidateItem({
      id: 'item',
      domainCode: 'A',
      stem: 'Stem',
      itemType: 'SINGLE_CHOICE',
      choices: [
        { choiceKey: 'A', text: 'Yes', isCorrect: true },
        { choiceKey: 'B', text: 'No', isCorrect: false },
      ],
    });
    expect(view.choices).toEqual([
      { choiceKey: 'A', text: 'Yes' },
      { choiceKey: 'B', text: 'No' },
    ]);
    expect(JSON.stringify(view)).not.toContain('isCorrect');
    const first = shuffleStable(['a', 'b', 'c', 'd'], 42);
    expect(shuffleStable(['a', 'b', 'c', 'd'], 42)).toEqual(first);
  });
});
