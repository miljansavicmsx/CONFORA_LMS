import {
  assertFourEyes,
  computeEligibleLevel,
  EDUCATION_STATEMENT,
  examEligibility,
  examPassDisposition,
  exclusionReason,
  EXAM_PASS_STATEMENT,
  INVALID_PUBLIC_VERIFICATION,
  levelChosenByCommittee,
  presentPublicVerification,
  publicVerificationPdfLines,
  requirementsSatisfiedByReferee,
  voteResult,
} from './certification-flow-rules';

const levels = [
  { code: 'PRACTITIONER', rank: 1, minExperienceMonths: 0, requiresExamPass: true },
  { code: 'LEAD', rank: 2, minExperienceMonths: 36, requiresExamPass: true },
];

describe('case workflow rules', () => {
  it('keeps the three document statements distinct', () => {
    expect(EDUCATION_STATEMENT).toContain('nije profesionalni certifikat');
    expect(EDUCATION_STATEMENT).toContain('učešća');
    expect(EXAM_PASS_STATEMENT).toContain('NIJE profesionalna certifikacija');
    expect(EDUCATION_STATEMENT).not.toBe(EXAM_PASS_STATEMENT);
  });

  it('treats path B as equal to path A and never gates on training', () => {
    const direct = examEligibility({
      schemePublished: true,
      prerequisitesAcknowledged: true,
      path: 'DIRECT',
      trainingCompleted: false,
    });
    const educated = examEligibility({
      schemePublished: true,
      prerequisitesAcknowledged: true,
      path: 'CONFORA_EDUCATION',
      trainingCompleted: true,
    });
    expect(direct).toEqual({ eligible: true, trainingGates: false, path: 'DIRECT' });
    expect(educated.trainingGates).toBe(false);
    expect(educated.eligible).toBe(true);
    expect(
      examEligibility({
        schemePublished: false,
        prerequisitesAcknowledged: true,
        path: 'DIRECT',
        trainingCompleted: true,
      }).eligible,
    ).toBe(false);
  });

  it('auto-issues only an objective pass with no open irregularity', () => {
    expect(
      examPassDisposition({
        passed: true,
        itemTypes: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'],
        openIrregularity: false,
      }),
    ).toBe('AUTO');
    expect(
      examPassDisposition({
        passed: true,
        itemTypes: ['SINGLE_CHOICE'],
        openIrregularity: true,
      }),
    ).toBe('REVIEW');
    expect(
      examPassDisposition({ passed: false, itemTypes: ['SINGLE_CHOICE'], openIrregularity: false }),
    ).toBe('NONE');
  });

  it('excludes trainers and examiners from the certification decision', () => {
    expect(requirementsSatisfiedByReferee()).toBe(false);
    expect(
      exclusionReason({
        userId: 'trainer',
        candidateUserId: 'candidate',
        trainerUserIds: ['trainer'],
        examinerUserIds: ['examiner'],
        conflictUserIds: [],
        authorised: true,
      }),
    ).toBe('TRAINER');
    expect(
      exclusionReason({
        userId: 'examiner',
        candidateUserId: 'candidate',
        trainerUserIds: ['trainer'],
        examinerUserIds: ['examiner'],
        conflictUserIds: [],
        authorised: true,
      }),
    ).toBe('EXAMINER');
    expect(
      exclusionReason({
        userId: 'candidate',
        candidateUserId: 'candidate',
        trainerUserIds: [],
        examinerUserIds: [],
        conflictUserIds: [],
        authorised: true,
      }),
    ).toBe('CANDIDATE');
    expect(
      exclusionReason({
        userId: 'member',
        candidateUserId: 'candidate',
        trainerUserIds: [],
        examinerUserIds: [],
        conflictUserIds: ['member'],
        authorised: true,
      }),
    ).toBe('CONFLICT');
    expect(
      exclusionReason({
        userId: 'member',
        candidateUserId: 'candidate',
        trainerUserIds: [],
        examinerUserIds: [],
        conflictUserIds: [],
        authorised: false,
      }),
    ).toBe('AUTHORISATION');
  });

  it('computes the level from scheme criteria and ignores a free committee choice', () => {
    expect(computeEligibleLevel({ experienceMonths: 40, examPassed: true, criteria: levels })).toBe(
      'LEAD',
    );
    expect(computeEligibleLevel({ experienceMonths: 6, examPassed: true, criteria: levels })).toBe(
      'PRACTITIONER',
    );
    expect(
      computeEligibleLevel({ experienceMonths: 40, examPassed: false, criteria: levels }),
    ).toBeNull();
    expect(levelChosenByCommittee('PRACTITIONER')).toBe('PRACTITIONER');
    expect(voteResult({ grants: 2, denies: 1, quorum: 2 })).toBe('GRANT');
    expect(voteResult({ grants: 1, denies: 1, quorum: 2 })).toBe('PENDING');
    expect(voteResult({ grants: 0, denies: 2, quorum: 2 })).toBe('DENY');
  });

  it('shows a public document without a name until consent, and consent does not change validity', () => {
    const issuedAt = new Date('2026-10-21T15:04:00.000Z');
    const hidden = presentPublicVerification({
      documentType: 'EXAM_PASS',
      issuedAt,
      nameConsentAt: null,
      holderName: 'Demo Kandidat',
    });
    expect(hidden).toEqual({
      status: 'VALID',
      documentType: 'EXAM_PASS',
      issuedAt: '2026-10-21',
      holderName: null,
    });
    expect(publicVerificationPdfLines(hidden).join(' ')).not.toContain('Demo');
    const shown = presentPublicVerification({
      documentType: 'EDUCATION_COMPLETION',
      issuedAt,
      nameConsentAt: issuedAt,
      holderName: 'Demo Kandidat',
    });
    expect(shown.holderName).toBe('Demo Kandidat');
    expect(shown.status).toBe('VALID');
    const revoked = presentPublicVerification({
      documentType: 'EDUCATION_COMPLETION',
      issuedAt,
      nameConsentAt: null,
      holderName: 'Demo Kandidat',
    });
    expect(revoked.status).toBe('VALID');
    expect(revoked.holderName).toBeNull();
    expect(
      presentPublicVerification({
        documentType: 'EXAM_PASS',
        issuedAt: null,
        nameConsentAt: issuedAt,
        holderName: 'Demo Kandidat',
      }),
    ).toEqual(INVALID_PUBLIC_VERIFICATION);
    expect(publicVerificationPdfLines(INVALID_PUBLIC_VERIFICATION)).toEqual(['Status: INVALID']);
    expect(publicVerificationPdfLines(shown).join('\n')).not.toMatch(/položio|passed|sekund/i);
  });

  it('blocks a decision participant from authorising issuance', () => {
    expect(() => {
      assertFourEyes('issuer', ['decider']);
    }).not.toThrow();
    expect(() => {
      assertFourEyes('decider', ['decider', 'voter']);
    }).toThrow('FOUR_EYES');
  });
});
