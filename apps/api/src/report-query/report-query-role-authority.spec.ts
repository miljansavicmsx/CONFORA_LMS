import type { RbacRole } from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import { AccessDeniedError } from '../tenant/tenant-errors';
import {
  assertReportQueryAuthorized,
  REPORT_QUERY_ALLOWED_ROLES,
} from './report-query-role-authority';

function actor(
  roles: RbacRole[],
  tenantId = '11111111-1111-4111-8111-111111111111',
): AuthenticatedActor {
  return {
    userId: '22222222-2222-4222-8222-222222222222',
    tenantId,
    issuer: 'https://issuer.test',
    subject: 'sub',
    email: 'a@example.test',
    roles,
    mfaVerified: true,
  };
}

describe('report-query-role-authority', () => {
  it.each(REPORT_QUERY_ALLOWED_ROLES)('P07_TEST_011-014 allows %s', (role) => {
    expect(() => {
      assertReportQueryAuthorized(actor([role]));
    }).not.toThrow();
  });

  it('P07_TEST_015 USR_CAND denied before DB', () => {
    expect(() => {
      assertReportQueryAuthorized(actor(['USR_CAND']));
    }).toThrow(AccessDeniedError);
  });

  it('P07_TEST_016 USR_CERT denied before DB', () => {
    expect(() => {
      assertReportQueryAuthorized(actor(['USR_CERT']));
    }).toThrow(AccessDeniedError);
  });

  it('P07_TEST_017 COM_CERT denied before DB', () => {
    expect(() => {
      assertReportQueryAuthorized(actor(['COM_CERT']));
    }).toThrow(AccessDeniedError);
  });

  it('P07_TEST_018 ISSUANCE_OFFICER denied before DB', () => {
    expect(() => {
      assertReportQueryAuthorized(actor(['ISSUANCE_OFFICER']));
    }).toThrow(AccessDeniedError);
  });

  it('P07_TEST_019 LIFECYCLE_OFFICER denied before DB', () => {
    expect(() => {
      assertReportQueryAuthorized(actor(['LIFECYCLE_OFFICER']));
    }).toThrow(AccessDeniedError);
  });

  it('P07_TEST_020 unknown role denied before DB', () => {
    expect(() => {
      assertReportQueryAuthorized(actor(['NOT_A_ROLE' as RbacRole]));
    }).toThrow(AccessDeniedError);
  });

  it('P07_TEST_021 missing actor denied before DB', () => {
    expect(() => {
      assertReportQueryAuthorized(undefined);
    }).toThrow(AccessDeniedError);
  });

  it('P07_TEST_022 missing actor tenant denied before DB', () => {
    const a = actor(['STAFF_DIR']);
    a.tenantId = '   ';
    expect(() => {
      assertReportQueryAuthorized(a);
    }).toThrow(AccessDeniedError);
  });

  it('P07_TEST_023 role wildcard not accepted', () => {
    expect(() => {
      assertReportQueryAuthorized(actor(['*' as RbacRole]));
    }).toThrow(AccessDeniedError);
  });
});
