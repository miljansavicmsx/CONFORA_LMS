/**
 * Local certification-exam demo only.
 * Refuses to run unless EXAM_DEMO_SEED=1 and NODE_ENV is not production.
 * Not part of migrations. The ready session does not issue a credential.
 * A separate historical pass is already decided and issued for the public registry.
 */
import { PrismaClient } from '@prisma/client';

import { signPersonnelCredential } from '../../apps/api/src/personnel/personnel-vc';

if (process.env.EXAM_DEMO_SEED !== '1' || process.env.NODE_ENV === 'production') {
  console.error('Refusing exam demo seed. Set EXAM_DEMO_SEED=1 outside production.');
  process.exit(1);
}

const prisma = new PrismaClient();
const tenantId = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const authorId = '1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a1a';
const approverId = '1b1b1b1b-1b1b-4b1b-8b1b-1b1b1b1b1b1b';
const candidateId = '1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c';
const invigilatorId = '1d1d1d1d-1d1d-4d1d-8d1d-1d1d1d1d1d1d';
const schemeId = '2a2a2a2a-2a2a-4a2a-8a2a-2a2a2a2a2a2a';
const versionId = '2b2b2b2b-2b2b-4b2b-8b2b-2b2b2b2b2b2b';
const itemA = '3a3a3a3a-3a3a-4a3a-8a3a-3a3a3a3a3a3a';
const itemB = '3b3b3b3b-3b3b-4b3b-8b3b-3b3b3b3b3b3b';
const blueprintId = '4a4a4a4a-4a4a-4a4a-8a4a-4a4a4a4a4a4a';
const domainA = '4b4b4b4b-4b4b-4b4b-8b4b-4b4b4b4b4b4b';
const domainB = '4c4c4c4c-4c4c-4c4c-8c4c-4c4c4c4c4c4c';
const recordId = '5a5a5a5a-5a5a-4a5a-8a5a-5a5a5a5a5a5a';
const formId = '6a6a6a6a-6a6a-4a6a-8a6a-6a6a6a6a6a6a';
const applicationId = '7a7a7a7a-7a7a-4a7a-8a7a-7a7a7a7a7a7a';
const sessionId = '8a8a8a8a-8a8a-4a8a-8a8a-8a8a8a8a8a8a';
const identityCheckId = '9a9a9a9a-9a9a-4a9a-8a9a-9a9a9a9a9a9a';
const identityLinkId = '9b9b9b9b-9b9b-4b9b-8b9b-9b9b9b9b9b9b';
const deciderId = '1e1e1e1e-1e1e-4e1e-8e1e-1e1e1e1e1e1e';
const issuedSessionId = '8b8b8b8b-8b8b-4b8b-8b8b-8b8b8b8b8b8b';
const issuedResultId = '8c8c8c8c-8c8c-4c8c-8c8c-8c8c8c8c8c8c';
const issuedDecisionId = '8d8d8d8d-8d8d-4d8d-8d8d-8d8d8d8d8d8d';
const credentialId = '8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e8e';
const personnelLinkId = '8f8f8f8f-8f8f-4f8f-8f8f-8f8f8f8f8f8f';
const pendingSessionId = '7d7d7d7d-7d7d-4d7d-8d7d-7d7d7d7d7d7d';
const pendingResultId = '7e7e7e7e-7e7e-4e7e-8e7e-7e7e7e7e7e7e';
const pendingDecisionId = '7f7f7f7f-7f7f-4f7f-8f7f-7f7f7f7f7f7f';
const queueSessionId = '6d6d6d6d-6d6d-4d6d-8d6d-6d6d6d6d6d6d';
const queueResultId = '6e6e6e6e-6e6e-4e6e-8e6e-6e6e6e6e6e6e';
const publicUid = 'CON-2026-0001';

async function user(id: string, email: string): Promise<void> {
  await prisma.user.upsert({
    where: { tenantId_id: { tenantId, id } },
    create: { id, tenantId, email, isActive: true },
    update: { isActive: true },
  });
}

async function item(id: string, domainCode: string, stem: string): Promise<void> {
  await prisma.schemeExamItem.upsert({
    where: { tenantId_id: { tenantId, id } },
    create: {
      id,
      tenantId,
      schemeId,
      familyKey: id,
      version: 1,
      stem,
      itemType: 'SINGLE_CHOICE',
      status: 'APPROVED',
      authorUserId: authorId,
      domainCode,
      exposureCount: 0,
    },
    update: { status: 'APPROVED', stem },
  });
  await prisma.schemeExamItemChoice.upsert({
    where: { id: `${id.slice(0, 8)}-0000-4000-8000-00000000000a` },
    create: {
      id: `${id.slice(0, 8)}-0000-4000-8000-00000000000a`,
      tenantId,
      itemId: id,
      choiceKey: 'A',
      text: 'Tačan odgovor za lokalni demo.',
      isCorrect: true,
    },
    update: { isCorrect: true },
  });
  await prisma.schemeExamItemChoice.upsert({
    where: { id: `${id.slice(0, 8)}-0000-4000-8000-00000000000b` },
    create: {
      id: `${id.slice(0, 8)}-0000-4000-8000-00000000000b`,
      tenantId,
      itemId: id,
      choiceKey: 'B',
      text: 'Netačan odgovor za lokalni demo.',
      isCorrect: false,
    },
    update: { isCorrect: false },
  });
}

async function main(): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: tenantId },
    create: { id: tenantId, isActive: true },
    update: { isActive: true },
  });
  await user(authorId, 'exam-author@demo.confora.test');
  await user(approverId, 'exam-approver@demo.confora.test');
  await user(candidateId, 'exam-candidate@demo.confora.test');
  await user(invigilatorId, 'exam-invigilator@demo.confora.test');
  await user(deciderId, 'exam-committee@demo.confora.test');
  await prisma.certificationScheme.upsert({
    where: { tenantId_id: { tenantId, id: schemeId } },
    create: {
      id: schemeId,
      tenantId,
      code: 'DIGCOMP-CERT',
      title: 'Digitalna kompetencija — osoba',
    },
    update: { title: 'Digitalna kompetencija — osoba' },
  });
  await prisma.certificationSchemeVersion.upsert({
    where: { tenantId_id: { tenantId, id: versionId } },
    create: {
      id: versionId,
      tenantId,
      schemeId,
      versionLabel: '1.0',
      scopeDescription: 'Osnove digitalne kompetencije za certifikaciju osobe.',
      jobDescription: 'Primjena digitalnih vještina u radnom okruženju.',
      experienceRequirement: 'Nije uslov za ovaj demo.',
      prerequisites: 'Odobrena prijava. Obuka nije uslov.',
      abilitiesSummary: 'Pretraga, sigurnost i sadržaj.',
      publicProcessSummary: 'Prijava, ispit, odluka odbora.',
      lifecycle: 'PUBLISHED',
    },
    update: { lifecycle: 'PUBLISHED' },
  });
  await item(itemA, 'PRETRAGA', 'Demo stavka domene pretrage. Nije za produkciju.');
  await item(itemB, 'SIGURNOST', 'Demo stavka domene sigurnosti. Nije za produkciju.');
  await prisma.examBlueprint.upsert({
    where: { tenantId_id: { tenantId, id: blueprintId } },
    create: {
      id: blueprintId,
      tenantId,
      schemeVersionId: versionId,
      title: 'Demo obrazac DIGCOMP-CERT',
      durationSeconds: 3600,
      status: 'APPROVED',
      retakeWindowDays: 90,
      cutScoreBasisPoints: 6000,
    },
    update: { status: 'APPROVED', cutScoreBasisPoints: 6000 },
  });
  await prisma.examBlueprintDomain.upsert({
    where: { tenantId_id: { tenantId, id: domainA } },
    create: {
      id: domainA,
      tenantId,
      blueprintId,
      domainCode: 'PRETRAGA',
      title: 'Pretraga',
      weightBasisPoints: 5000,
      itemCount: 1,
    },
    update: { itemCount: 1 },
  });
  await prisma.examBlueprintDomain.upsert({
    where: { tenantId_id: { tenantId, id: domainB } },
    create: {
      id: domainB,
      tenantId,
      blueprintId,
      domainCode: 'SIGURNOST',
      title: 'Sigurnost',
      weightBasisPoints: 5000,
      itemCount: 1,
    },
    update: { itemCount: 1 },
  });
  await prisma.standardSettingRecord.upsert({
    where: { tenantId_id: { tenantId, id: recordId } },
    create: {
      id: recordId,
      tenantId,
      blueprintId,
      method: 'ANGOFF',
      status: 'APPROVED',
      cutScoreBasisPoints: 6000,
      approvedByUserId: approverId,
      approvedAt: new Date('2026-10-20T10:00:00.000Z'),
      note: 'Demo panel. Autor i odobravatelj su različite osobe.',
    },
    update: { status: 'APPROVED', cutScoreBasisPoints: 6000 },
  });
  for (const [ratingId, panelistUserId, ratedItemId, probability] of [
    ['5b5b5b5b-5b5b-4b5b-8b5b-5b5b5b5b5b5b', authorId, itemA, 7000],
    ['5c5c5c5c-5c5c-4c5c-8c5c-5c5c5c5c5c5c', approverId, itemA, 7000],
    ['5d5d5d5d-5d5d-4d5d-8d5d-5d5d5d5d5d5d', authorId, itemB, 5000],
    ['5e5e5e5e-5e5e-4e5e-8e5e-5e5e5e5e5e5e', approverId, itemB, 5000],
  ] as const) {
    await prisma.standardSettingRating.upsert({
      where: { tenantId_id: { tenantId, id: ratingId } },
      create: {
        id: ratingId,
        tenantId,
        recordId,
        panelistUserId,
        itemId: ratedItemId,
        probabilityBasisPoints: probability,
      },
      update: { probabilityBasisPoints: probability },
    });
  }
  await prisma.assembledExamForm.upsert({
    where: { tenantId_id: { tenantId, id: formId } },
    create: {
      id: formId,
      tenantId,
      blueprintId,
      title: 'Demo obrazac DIGCOMP-CERT',
      shuffleItems: true,
      shuffleChoices: true,
      assembledByUserId: approverId,
      assembledAt: new Date('2026-10-20T10:05:00.000Z'),
    },
    update: { title: 'Demo obrazac DIGCOMP-CERT' },
  });
  await prisma.assembledExamFormItem.upsert({
    where: { tenantId_id: { tenantId, id: '6b6b6b6b-6b6b-4b6b-8b6b-6b6b6b6b6b6b' } },
    create: {
      id: '6b6b6b6b-6b6b-4b6b-8b6b-6b6b6b6b6b6b',
      tenantId,
      formId,
      itemId: itemA,
      domainCode: 'PRETRAGA',
      sequence: 1,
    },
    update: { sequence: 1 },
  });
  await prisma.assembledExamFormItem.upsert({
    where: { tenantId_id: { tenantId, id: '6c6c6c6c-6c6c-4c6c-8c6c-6c6c6c6c6c6c' } },
    create: {
      id: '6c6c6c6c-6c6c-4c6c-8c6c-6c6c6c6c6c6c',
      tenantId,
      formId,
      itemId: itemB,
      domainCode: 'SIGURNOST',
      sequence: 2,
    },
    update: { sequence: 2 },
  });
  await prisma.certificationApplication.upsert({
    where: { id: applicationId },
    create: {
      id: applicationId,
      tenantId,
      applicantUserId: candidateId,
      status: 'APPROVED',
      schemeRef: 'DIGCOMP-CERT',
      submittedAt: new Date('2026-10-01T00:00:00.000Z'),
    },
    update: { status: 'APPROVED', schemeRef: 'DIGCOMP-CERT' },
  });
  await prisma.certificationExamSession.upsert({
    where: { tenantId_id: { tenantId, id: sessionId } },
    create: {
      id: sessionId,
      tenantId,
      formId,
      candidateUserId: candidateId,
      certificationApplicationId: applicationId,
      scheduledStartAt: new Date('2026-10-21T09:00:00.000Z'),
      invigilatorUserId: invigilatorId,
      status: 'READY',
      identityCaptureState: 'NOT_COLLECTED_DPIA_PENDING',
    },
    update: { status: 'READY', identityCaptureState: 'NOT_COLLECTED_DPIA_PENDING' },
  });
  await prisma.identityCheck.upsert({
    where: { tenantId_id: { tenantId, id: identityCheckId } },
    create: {
      id: identityCheckId,
      tenantId,
      subjectUserId: candidateId,
      reviewerUserId: invigilatorId,
      method: 'HUMAN_VISUAL',
      outcome: 'VERIFIED',
      documentType: 'PASSPORT',
      checkedAt: new Date('2026-10-20T12:00:00.000Z'),
    },
    update: {
      documentType: 'PASSPORT',
      outcome: 'VERIFIED',
      method: 'HUMAN_VISUAL',
    },
  });
  await prisma.certificationExamIdentityLink.upsert({
    where: { tenantId_id: { tenantId, id: identityLinkId } },
    create: {
      id: identityLinkId,
      tenantId,
      sessionId,
      identityCheckId,
    },
    update: { identityCheckId },
  });
  await seedIssuedPersonnelCertificate();
  await seedPendingGrant();
  await seedUndecidedResult();
  await seedOidcLinks();
  console.log(
    'Exam demo seed stored a ready session without images, issued CON-2026-0001, and left one GRANT unissued.',
  );
}

async function scoredSession(id: string, submittedAt: Date): Promise<void> {
  await prisma.certificationExamSession.upsert({
    where: { tenantId_id: { tenantId, id } },
    create: {
      id,
      tenantId,
      formId,
      candidateUserId: candidateId,
      certificationApplicationId: applicationId,
      scheduledStartAt: submittedAt,
      invigilatorUserId: invigilatorId,
      status: 'SCORED',
      identityCaptureState: 'NOT_COLLECTED_DPIA_PENDING',
      rulesAcceptedAt: submittedAt,
      ndaAcceptedAt: submittedAt,
      startedAt: submittedAt,
      submittedAt,
    },
    update: { status: 'SCORED', submittedAt },
  });
}

async function seedIssuedPersonnelCertificate(): Promise<void> {
  const issuedAt = new Date('2026-10-20T10:00:00.000Z');
  const expiresAt = new Date('2029-10-20T10:00:00.000Z');
  await scoredSession(issuedSessionId, new Date('2026-10-18T10:00:00.000Z'));
  await prisma.certificationExamResult.upsert({
    where: { tenantId_id: { tenantId, id: issuedResultId } },
    create: {
      id: issuedResultId,
      tenantId,
      sessionId: issuedSessionId,
      scoreBasisPoints: 8000,
      passed: true,
      provisional: false,
      domainFeedback: [{ domainCode: 'PRETRAGA', correct: 1, total: 1 }],
      scoredAt: new Date('2026-10-18T11:00:00.000Z'),
    },
    update: { passed: true, provisional: false },
  });
  await prisma.examCertificationDecision.upsert({
    where: { tenantId_id: { tenantId, id: issuedDecisionId } },
    create: {
      id: issuedDecisionId,
      tenantId,
      resultId: issuedResultId,
      decidedByUserId: deciderId,
      outcome: 'GRANT',
      rationale: 'Demo odluka komiteta za već izdat certifikat.',
      trainerOfCandidate: false,
      independentOfTraining: true,
      decidedAt: new Date('2026-10-19T09:00:00.000Z'),
    },
    update: { outcome: 'GRANT' },
  });
  const signed = signPersonnelCredential({
    certificateNumber: publicUid,
    holderName: 'Demo Kandidat',
    scheme: 'Digitalna kompetencija — osoba',
    schemeVersion: '1.0',
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    statusListIndex: 0,
    statusListUrl: 'http://127.0.0.1:4000/v1/public/certificates/status-list',
  });
  await prisma.credential.upsert({
    where: { id: credentialId },
    create: {
      id: credentialId,
      tenantId,
      holderUserId: candidateId,
      credentialType: 'PERSONNEL',
      lifecycle: 'ACTIVE',
      publicUid,
      payloadHash: signed.payloadHash,
      signature: signed.jwt,
      qrVerifyToken: 'demo-personnel-qr-con-2026-0001',
      scopeText: 'Osnove digitalne kompetencije za certifikaciju osobe.',
      cbName: 'CONFORA',
      cbIdentifier: 'CONFORA-CB',
      issuedAt,
      expiresAt,
    },
    update: {
      lifecycle: 'ACTIVE',
      payloadHash: signed.payloadHash,
      signature: signed.jwt,
      expiresAt,
    },
  });
  await prisma.achievementRecord.upsert({
    where: { tenantId_id: { tenantId, id: '8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e01' } },
    create: {
      id: '8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e01',
      tenantId,
      credentialId,
      achievementTitle: 'Digitalna kompetencija — osoba',
      holderName: 'Demo Kandidat',
      awardingBodyName: 'CONFORA',
      awardingBodyIdentifier: 'CONFORA-CB',
      awardedAt: issuedAt,
      expiresAt,
      resultLabel: 'GRANT',
      criteriaSummary: 'Odluka komiteta nakon ispita.',
      language: 'bs',
    },
    update: { holderName: 'Demo Kandidat' },
  });
  await prisma.credentialLifecycleEvent.upsert({
    where: { tenantId_id: { tenantId, id: '8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e02' } },
    create: {
      id: '8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e02',
      tenantId,
      credentialId,
      toLifecycle: 'ACTIVE',
      reason: 'Izdavanje nakon odluke komiteta.',
      actorUserId: deciderId,
      effectiveAt: issuedAt,
    },
    update: { reason: 'Izdavanje nakon odluke komiteta.' },
  });
  await prisma.examPersonnelCredentialLink.upsert({
    where: { tenantId_id: { tenantId, id: personnelLinkId } },
    create: {
      id: personnelLinkId,
      tenantId,
      credentialId,
      examDecisionId: issuedDecisionId,
      schemeVersionId: versionId,
      holderDisplayName: 'Demo Kandidat',
      registryListed: true,
      registryConsentAt: issuedAt,
      statusListIndex: 0,
    },
    update: { registryListed: true, holderDisplayName: 'Demo Kandidat' },
  });
  const reminders = [
    ['8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e11', 'NINETY_DAYS', new Date('2029-07-22T10:00:00.000Z')],
    ['8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e12', 'THIRTY_DAYS', new Date('2029-09-20T10:00:00.000Z')],
    ['8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e13', 'ON_EXPIRY', expiresAt],
  ] as const;
  for (const [id, kind, dueAt] of reminders) {
    await prisma.recertificationReminder.upsert({
      where: { tenantId_id: { tenantId, id } },
      create: { id, tenantId, linkId: personnelLinkId, kind, dueAt },
      update: { dueAt },
    });
  }
  await prisma.cpdRecord.upsert({
    where: { tenantId_id: { tenantId, id: '8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e21' } },
    create: {
      id: '8e8e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e21',
      tenantId,
      linkId: personnelLinkId,
      holderUserId: candidateId,
      title: 'Stručni skup (demo)',
      hours: 2,
      completedAt: new Date('2026-09-01T00:00:00.000Z'),
    },
    update: { title: 'Stručni skup (demo)' },
  });
}

async function seedPendingGrant(): Promise<void> {
  await scoredSession(pendingSessionId, new Date('2026-10-17T10:00:00.000Z'));
  await prisma.certificationExamResult.upsert({
    where: { tenantId_id: { tenantId, id: pendingResultId } },
    create: {
      id: pendingResultId,
      tenantId,
      sessionId: pendingSessionId,
      scoreBasisPoints: 7600,
      passed: true,
      provisional: false,
      domainFeedback: [{ domainCode: 'SIGURNOST', correct: 1, total: 1 }],
      scoredAt: new Date('2026-10-17T11:00:00.000Z'),
    },
    update: { passed: true },
  });
  await prisma.examCertificationDecision.upsert({
    where: { tenantId_id: { tenantId, id: pendingDecisionId } },
    create: {
      id: pendingDecisionId,
      tenantId,
      resultId: pendingResultId,
      decidedByUserId: deciderId,
      outcome: 'GRANT',
      rationale: 'Demo odluka koja još nema izdat certifikat.',
      trainerOfCandidate: false,
      independentOfTraining: true,
      decidedAt: new Date('2026-10-19T12:00:00.000Z'),
    },
    update: { outcome: 'GRANT' },
  });
}

async function seedUndecidedResult(): Promise<void> {
  await scoredSession(queueSessionId, new Date('2026-10-16T10:00:00.000Z'));
  await prisma.certificationExamResult.upsert({
    where: { tenantId_id: { tenantId, id: queueResultId } },
    create: {
      id: queueResultId,
      tenantId,
      sessionId: queueSessionId,
      scoreBasisPoints: 7200,
      passed: true,
      provisional: true,
      domainFeedback: [{ domainCode: 'PRETRAGA', correct: 1, total: 1 }],
      scoredAt: new Date('2026-10-16T11:00:00.000Z'),
    },
    update: { provisional: true, passed: true },
  });
}

async function seedOidcLinks(): Promise<void> {
  const issuer = process.env['EXAM_DEMO_OIDC_ISSUER'];
  if (!issuer) {
    return;
  }
  const links = [
    ['a11a11a1-a11a-411a-811a-a11a11a11a11', candidateId, 'exam-candidate'],
    ['a22a22a2-a22a-422a-822a-a22a22a22a22', deciderId, 'exam-committee'],
  ] as const;
  for (const [id, userId, subject] of links) {
    await prisma.externalIdentityLink.upsert({
      where: { tenantId_issuer_subject: { tenantId, issuer, subject } },
      create: { id, tenantId, userId, issuer, subject },
      update: { userId },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
