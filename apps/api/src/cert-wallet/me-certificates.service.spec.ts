import { ForbiddenException } from '@nestjs/common';

import { DEFAULT_TENANT_ID } from '@confora/shared-kernel';

import type { ConforaUser } from '../auth/types/confora-user';
import { MeCertificatesService } from './me-certificates.service';

const TENANT_B = '00000000-0000-4000-8000-0000000000bb';
const USER_A = 'a1000000-0000-4000-8000-000000000001';
const USER_B = 'b2000000-0000-4000-8000-000000000002';

function actor(overrides: Partial<ConforaUser> = {}): ConforaUser {
  return {
    sub: 'kc-sub-wallet',
    payload: { sub: 'kc-sub-wallet', tenant_id: DEFAULT_TENANT_ID },
    roles: ['USR_CAND'],
    scope: [],
    mfaVerified: true,
    amr: ['pwd'],
    tenantContext: { tenantId: DEFAULT_TENANT_ID, isPlatformScope: false },
    ...overrides,
  };
}

describe('MeCertificatesService (P1-B2)', () => {
  const certificateFindMany = jest.fn();
  const userFindUnique = jest.fn();
  const presignedGetUrl = jest.fn();
  const auditLog = jest.fn().mockResolvedValue({ id: 'audit-1' });

  let service: MeCertificatesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MeCertificatesService(
      {
        db: {
          user: { findUnique: userFindUnique },
          certificate: { findMany: certificateFindMany },
        },
      } as never,
      { presignedGetUrl, urlTtlSeconds: () => 900 } as never,
      { log: auditLog } as never,
    );

    userFindUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id === USER_A) {
        return Promise.resolve({ id: USER_A, tenantId: DEFAULT_TENANT_ID });
      }
      if (where.email === 'learner@confora.test') {
        return Promise.resolve({ id: USER_A, tenantId: DEFAULT_TENANT_ID });
      }
      return Promise.resolve(null);
    });
  });

  it('returns only certificates for resolved user and tenant', async () => {
    certificateFindMany.mockResolvedValue([
      {
        uid: 'CON-2026-000001',
        type: 'PERSON_CERTIFICATION',
        status: 'ACTIVE',
        issueDate: new Date('2026-01-01'),
        expiryDate: new Date('2031-01-01'),
        scopeText: 'Widget Professional',
        qrUrl: null,
        pdfUrl: null,
        scheme: { name: 'CWP Scheme', revisionSeq: 2 },
      },
    ]);

    const res = await service.listMyCertificates(
      actor({
        payload: { sub: 'kc-sub-wallet', email: 'learner@confora.test', tenant_id: DEFAULT_TENANT_ID },
      }),
    );

    expect(certificateFindMany).toHaveBeenCalledWith({
      where: { tenantId: DEFAULT_TENANT_ID, userId: USER_A },
      include: { scheme: { select: { name: true, revisionSeq: true } } },
      orderBy: { issueDate: 'desc' },
    });
    expect(res.items).toHaveLength(1);
    expect(res.items[0]?.certificateId).toBe('CON-2026-000001');
    expect(res.contractVersion).toBe('1.1.0');
    expect(res.items[0]?.schemeTitle).toBe('CWP Scheme');
    expect(res.items[0]?.recertificationEligible).toBe(true);
    expect(res.items[0]?.cpdEligible).toBe(true);
  });

  it('scopes query by JWT tenantId — excludes other tenant rows at DB filter', async () => {
    userFindUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id === USER_A) {
        return Promise.resolve({ id: USER_A, tenantId: TENANT_B });
      }
      if (where.email === 'learner@confora.test') {
        return Promise.resolve({ id: USER_A, tenantId: TENANT_B });
      }
      return Promise.resolve(null);
    });
    certificateFindMany.mockResolvedValue([]);
    await service.listMyCertificates(
      actor({
        tenantContext: { tenantId: TENANT_B, isPlatformScope: false },
        payload: { sub: 'kc-sub-wallet', email: 'learner@confora.test', tenant_id: TENANT_B },
      }),
    );
    expect(certificateFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: TENANT_B }),
      }),
    );
  });

  it('rejects when JWT tenant does not match user tenant', async () => {
    userFindUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.email === 'learner@confora.test') {
        return Promise.resolve({ id: USER_A, tenantId: DEFAULT_TENANT_ID });
      }
      return Promise.resolve(null);
    });
    await expect(
      service.listMyCertificates(actor({ tenantContext: { tenantId: TENANT_B, isPlatformScope: false } })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(certificateFindMany).not.toHaveBeenCalled();
  });

  it('uses db tenant when JWT tenantContext absent (TenantGuard handles enforce at HTTP layer)', async () => {
    certificateFindMany.mockResolvedValue([]);
    await service.listMyCertificates(
      actor({
        tenantContext: undefined,
        payload: { sub: 'kc-sub-wallet', email: 'learner@confora.test' },
      }),
    );
    expect(certificateFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: DEFAULT_TENANT_ID }),
      }),
    );
  });

  it('maps suspended and expired statuses safely', async () => {
    certificateFindMany.mockResolvedValue([
      {
        uid: 'CON-2026-SUSP',
        type: 'PERSON_CERTIFICATION',
        status: 'SUSPENDED',
        issueDate: new Date('2024-01-01'),
        expiryDate: new Date('2029-01-01'),
        scopeText: 'Scope A',
        qrUrl: null,
        pdfUrl: null,
        scheme: { name: 'Scheme A', revisionSeq: 1 },
      },
      {
        uid: 'CON-2026-EXP',
        type: 'PERSON_CERTIFICATION',
        status: 'EXPIRED',
        issueDate: new Date('2020-01-01'),
        expiryDate: new Date('2021-01-01'),
        scopeText: 'Scope B',
        qrUrl: null,
        pdfUrl: null,
        scheme: { name: 'Scheme B', revisionSeq: 1 },
      },
      {
        uid: 'CON-2026-WD',
        type: 'PERSON_CERTIFICATION',
        status: 'WITHDRAWN',
        issueDate: new Date('2022-01-01'),
        expiryDate: null,
        scopeText: 'Scope C',
        qrUrl: null,
        pdfUrl: null,
        scheme: { name: 'Scheme C', revisionSeq: 1 },
      },
    ]);

    const res = await service.listMyCertificates(
      actor({ payload: { sub: 'kc-sub-wallet', email: 'learner@confora.test', tenant_id: DEFAULT_TENANT_ID } }),
    );

    expect(res.items.map((i) => i.lifecycleStatus)).toEqual(['SUSPENDED', 'EXPIRED', 'WITHDRAWN']);
    expect(JSON.stringify(res)).not.toMatch(/tenantId|userId|applicationId|pdfStorageKey|email/i);
  });

  it('does not expose unsafe pdf URLs', async () => {
    certificateFindMany.mockResolvedValue([
      {
        uid: 'CON-2026-PDF',
        type: 'PERSON_CERTIFICATION',
        status: 'ACTIVE',
        issueDate: new Date('2026-01-01'),
        expiryDate: null,
        scopeText: 'Scope',
        qrUrl: null,
        pdfUrl: 'http://insecure.example/cert.pdf',
        scheme: { name: 'Scheme', revisionSeq: 1 },
      },
    ]);

    const res = await service.listMyCertificates(
      actor({ payload: { sub: 'kc-sub-wallet', email: 'learner@confora.test', tenant_id: DEFAULT_TENANT_ID } }),
    );
    expect(res.items[0]?.pdfUrl).toBeNull();
  });

  it('never queries another userId', async () => {
    certificateFindMany.mockResolvedValue([]);
    await service.listMyCertificates(
      actor({ payload: { sub: 'kc-sub-wallet', email: 'learner@confora.test', tenant_id: DEFAULT_TENANT_ID } }),
    );
    expect(certificateFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: USER_A }),
      }),
    );
    expect(certificateFindMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: USER_B }),
      }),
    );
  });
});
