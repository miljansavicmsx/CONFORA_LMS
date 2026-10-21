import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { publicAppOrigin } from '../prisma/certification-flow-store';
import { FlowRuleError } from './certification-flow-rules';

describe('public verification and referee delivery wiring', () => {
  const store = readFileSync(join(__dirname, '../prisma/certification-flow-store.ts'), 'utf8');
  const personnel = readFileSync(
    join(__dirname, '../prisma/personnel-certificate-store.ts'),
    'utf8',
  );
  const previousEnv = process.env['NODE_ENV'];
  const previousOrigin = process.env['PUBLIC_APP_ORIGIN'];

  afterEach(() => {
    if (previousEnv === undefined) {
      delete process.env['NODE_ENV'];
    } else {
      process.env['NODE_ENV'] = previousEnv;
    }
    if (previousOrigin === undefined) {
      delete process.env['PUBLIC_APP_ORIGIN'];
    } else {
      process.env['PUBLIC_APP_ORIGIN'] = previousOrigin;
    }
  });

  it('keeps the referee secret out of the API response and uses one conditional update', () => {
    const request = store.slice(
      store.indexOf('export async function requestReferee'),
      store.indexOf('export async function confirmReferee'),
    );
    const confirm = store.slice(
      store.indexOf('export async function confirmReferee'),
      store.indexOf('export async function assessReferee'),
    );
    expect(request).toContain('sealDelivery(link)');
    expect(request).not.toContain('console.');
    expect(request).not.toMatch(/return \{[^}]*\btoken\b/s);
    expect(confirm).toContain('updateMany');
    expect(confirm).toContain("state: 'PENDING'");
    expect(confirm).toContain('expiresAt: { gt: input.now }');
  });

  it('gates a new certification decision and not the public document fields', () => {
    const vote = store.slice(
      store.indexOf('async function assertRecordedDecisionMaker'),
      store.indexOf('export async function authorizeIssuance'),
    );
    expect(vote).toContain('assertCertificationDecision');
    expect(vote).toContain('examinedCandidate');
    expect(vote).toContain('examinationActorsForApplication');
    expect(vote).toContain('candidateWasExaminedBy');
    const proposal = store.slice(
      store.indexOf('export async function proposeCommittee'),
      store.indexOf('export async function confirmProposal'),
    );
    expect(proposal).toContain('examinationActorsForApplication');
    expect(proposal).toContain('proctorReviewerUserIds');
    const pdf = store.slice(
      store.indexOf('export async function publicDocumentPdf'),
      store.indexOf('export async function setDocumentNameConsent'),
    );
    expect(pdf).not.toContain('participationSeconds');
    expect(pdf).not.toContain('.passed');
    expect(pdf).not.toContain('publicUid');
    expect(pdf).toContain('input.verificationId');
    expect(personnel).toContain('CASE_NOT_ISSUABLE');
  });

  it('allows the loopback origin only for development and test', () => {
    process.env['NODE_ENV'] = 'production';
    delete process.env['PUBLIC_APP_ORIGIN'];
    expect(() => {
      publicAppOrigin();
    }).toThrow(FlowRuleError);
    try {
      publicAppOrigin();
    } catch (error) {
      expect(error).toBeInstanceOf(FlowRuleError);
      expect((error as FlowRuleError).code).toBe('ORIGIN_UNCONFIGURED');
    }
    process.env['NODE_ENV'] = 'test';
    expect(publicAppOrigin()).toBe('http://127.0.0.1:3001');
  });
});
