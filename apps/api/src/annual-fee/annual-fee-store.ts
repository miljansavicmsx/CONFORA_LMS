import { randomUUID } from 'node:crypto';

import type { Prisma } from '@confora/database';

import {
  assertLifecycleUntouched,
  obligationForIssuance,
  PROPOSED_ANNUAL_FEE_CURRENCY,
  PROPOSED_ANNUAL_FEE_MINOR,
  type FeeSchedule,
} from './fee-policy';

export class FeeRuleError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'FeeRuleError';
  }
}

export class FeeNotFoundError extends Error {
  constructor() {
    super('FEE_NOT_FOUND');
    this.name = 'FeeNotFoundError';
  }
}

type FeeClient = Pick<
  Prisma.TransactionClient,
  'schemeAnnualFee' | 'annualFeeObligation' | 'credential' | 'examPersonnelCredentialLink'
>;

type Actor = { userId: string; roles: readonly string[] };

export type FeeScheduleView = FeeSchedule & { schemeVersionId: string };

export type ObligationView = {
  obligationId: string;
  credentialId: string;
  year: number;
  kind: string;
  amountMinor: number;
  currency: string;
  status: string;
  lifecycle: string;
  withdrawn: false;
};

function assertRole(roles: readonly string[], required: string): void {
  if (!roles.includes(required)) {
    throw new FeeRuleError('ROLE_SEPARATION');
  }
}

export async function includeFirstYear(
  client: Pick<FeeClient, 'schemeAnnualFee' | 'annualFeeObligation'>,
  input: {
    tenantId: string;
    credentialId: string;
    holderUserId: string;
    schemeVersionId: string;
    year: number;
  },
): Promise<void> {
  const fee = await ensureProposedFee(client, input.tenantId, input.schemeVersionId);
  const planned = obligationForIssuance(fee);
  const existing = await client.annualFeeObligation.findUnique({
    where: {
      tenantId_credentialId_year_kind: {
        tenantId: input.tenantId,
        credentialId: input.credentialId,
        year: input.year,
        kind: 'FIRST_YEAR',
      },
    },
  });
  if (existing) {
    return;
  }
  await client.annualFeeObligation.create({
    data: {
      id: randomUUID(),
      tenantId: input.tenantId,
      schemeVersionId: input.schemeVersionId,
      credentialId: input.credentialId,
      holderUserId: input.holderUserId,
      year: input.year,
      kind: 'FIRST_YEAR',
      amountMinor: planned.amountMinor,
      currency: planned.currency,
      status: planned.status,
    },
  });
}

export async function saveSchemeFee(
  client: FeeClient,
  input: {
    tenantId: string;
    actor: Actor;
    schemeVersionId: string;
    annualAmountMinor: number;
    currency: string;
    firstYearIncluded: boolean;
    recertificationSeparate: boolean;
  },
): Promise<FeeScheduleView> {
  assertRole(input.actor.roles, 'COM_TECH');
  const saved = await client.schemeAnnualFee.upsert({
    where: {
      tenantId_schemeVersionId: {
        tenantId: input.tenantId,
        schemeVersionId: input.schemeVersionId,
      },
    },
    create: {
      id: randomUUID(),
      tenantId: input.tenantId,
      schemeVersionId: input.schemeVersionId,
      annualAmountMinor: input.annualAmountMinor,
      currency: input.currency,
      firstYearIncluded: input.firstYearIncluded,
      recertificationSeparate: input.recertificationSeparate,
    },
    update: {
      annualAmountMinor: input.annualAmountMinor,
      currency: input.currency,
      firstYearIncluded: input.firstYearIncluded,
      recertificationSeparate: input.recertificationSeparate,
    },
  });
  return presentFee(saved);
}

export async function readSchemeFee(
  client: FeeClient,
  input: { tenantId: string; actor: Actor; schemeVersionId: string },
): Promise<FeeScheduleView> {
  assertRole(input.actor.roles, 'COM_TECH');
  const row = await client.schemeAnnualFee.findUnique({
    where: {
      tenantId_schemeVersionId: {
        tenantId: input.tenantId,
        schemeVersionId: input.schemeVersionId,
      },
    },
  });
  if (!row) {
    throw new FeeNotFoundError();
  }
  return presentFee(row);
}

export async function listHolderFees(client: FeeClient, tenantId: string, userId: string) {
  const rows = await client.annualFeeObligation.findMany({
    where: { tenantId, holderUserId: userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => ({
    obligationId: row.id,
    credentialId: row.credentialId,
    year: row.year,
    kind: row.kind,
    amountMinor: row.amountMinor,
    currency: row.currency,
    status: row.status,
  }));
}

export async function openNonPaymentCase(
  client: FeeClient,
  input: {
    tenantId: string;
    actor: Actor;
    credentialId: string;
    year: number;
    reason: string;
    now: Date;
  },
): Promise<ObligationView> {
  assertRole(input.actor.roles, 'COM_CERT');
  const context = await loadCredential(client, input.tenantId, input.credentialId);
  const fee = await ensureProposedFee(client, input.tenantId, context.schemeVersionId);
  const existing = await client.annualFeeObligation.findUnique({
    where: {
      tenantId_credentialId_year_kind: {
        tenantId: input.tenantId,
        credentialId: input.credentialId,
        year: input.year,
        kind: 'ANNUAL',
      },
    },
  });
  if (existing?.status === 'SETTLED') {
    throw new FeeRuleError('ALREADY_SETTLED');
  }
  const saved = existing
    ? await client.annualFeeObligation.update({
        where: { tenantId_id: { tenantId: input.tenantId, id: existing.id } },
        data: { status: 'OPEN_CASE', reason: input.reason, openedAt: input.now },
      })
    : await client.annualFeeObligation.create({
        data: {
          id: randomUUID(),
          tenantId: input.tenantId,
          schemeVersionId: context.schemeVersionId,
          credentialId: input.credentialId,
          holderUserId: context.holderUserId,
          year: input.year,
          kind: 'ANNUAL',
          amountMinor: fee.annualAmountMinor,
          currency: fee.currency,
          status: 'OPEN_CASE',
          reason: input.reason,
          openedAt: input.now,
        },
      });
  const after = await client.credential.findFirst({
    where: { tenantId: input.tenantId, id: input.credentialId },
    select: { lifecycle: true },
  });
  assertLifecycleUntouched(context.lifecycle, after?.lifecycle ?? '');
  return {
    obligationId: saved.id,
    credentialId: input.credentialId,
    year: input.year,
    kind: saved.kind,
    amountMinor: saved.amountMinor,
    currency: saved.currency,
    status: saved.status,
    lifecycle: context.lifecycle,
    withdrawn: false,
  };
}

export async function chargeRecertification(
  client: FeeClient,
  input: { tenantId: string; actor: Actor; credentialId: string; year: number },
): Promise<ObligationView> {
  assertRole(input.actor.roles, 'COM_CERT');
  const context = await loadCredential(client, input.tenantId, input.credentialId);
  const fee = await ensureProposedFee(client, input.tenantId, context.schemeVersionId);
  if (!fee.recertificationSeparate) {
    throw new FeeRuleError('NOT_SEPARATE');
  }
  const existing = await client.annualFeeObligation.findUnique({
    where: {
      tenantId_credentialId_year_kind: {
        tenantId: input.tenantId,
        credentialId: input.credentialId,
        year: input.year,
        kind: 'RECERTIFICATION',
      },
    },
  });
  const saved =
    existing ??
    (await client.annualFeeObligation.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        schemeVersionId: context.schemeVersionId,
        credentialId: input.credentialId,
        holderUserId: context.holderUserId,
        year: input.year,
        kind: 'RECERTIFICATION',
        amountMinor: fee.annualAmountMinor,
        currency: fee.currency,
        status: 'DUE',
      },
    }));
  const after = await client.credential.findFirst({
    where: { tenantId: input.tenantId, id: input.credentialId },
    select: { lifecycle: true },
  });
  assertLifecycleUntouched(context.lifecycle, after?.lifecycle ?? '');
  return {
    obligationId: saved.id,
    credentialId: input.credentialId,
    year: saved.year,
    kind: saved.kind,
    amountMinor: saved.amountMinor,
    currency: saved.currency,
    status: saved.status,
    lifecycle: context.lifecycle,
    withdrawn: false,
  };
}

async function ensureProposedFee(
  client: Pick<FeeClient, 'schemeAnnualFee'>,
  tenantId: string,
  schemeVersionId: string,
): Promise<FeeScheduleView> {
  const existing = await client.schemeAnnualFee.findUnique({
    where: { tenantId_schemeVersionId: { tenantId, schemeVersionId } },
  });
  if (existing) {
    return presentFee(existing);
  }
  const created = await client.schemeAnnualFee.create({
    data: {
      id: randomUUID(),
      tenantId,
      schemeVersionId,
      annualAmountMinor: PROPOSED_ANNUAL_FEE_MINOR,
      currency: PROPOSED_ANNUAL_FEE_CURRENCY,
      firstYearIncluded: true,
      recertificationSeparate: true,
    },
  });
  return presentFee(created);
}

async function loadCredential(client: FeeClient, tenantId: string, credentialId: string) {
  const credential = await client.credential.findFirst({
    where: { tenantId, id: credentialId },
    select: { id: true, lifecycle: true, holderUserId: true },
  });
  const link = await client.examPersonnelCredentialLink.findFirst({
    where: { tenantId, credentialId },
    select: { schemeVersionId: true },
  });
  if (!credential || !link) {
    throw new FeeNotFoundError();
  }
  return {
    holderUserId: credential.holderUserId,
    lifecycle: credential.lifecycle,
    schemeVersionId: link.schemeVersionId,
  };
}

function presentFee(row: {
  schemeVersionId: string;
  annualAmountMinor: number;
  currency: string;
  firstYearIncluded: boolean;
  recertificationSeparate: boolean;
}): FeeScheduleView {
  return {
    schemeVersionId: row.schemeVersionId,
    annualAmountMinor: row.annualAmountMinor,
    currency: row.currency,
    firstYearIncluded: row.firstYearIncluded,
    recertificationSeparate: row.recertificationSeparate,
  };
}
