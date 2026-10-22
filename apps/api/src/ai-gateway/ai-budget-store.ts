import { randomUUID } from 'node:crypto';

import type { Prisma } from '@confora/database';

import { reservationFits } from './ai-pricing';
import {
  DEFAULT_AI_COST_LIMIT_MINOR,
  DEFAULT_AI_UNIT_LIMIT,
  periodKey,
  type AiBudgetRow,
} from './ai-policy';

type BudgetClient = Pick<Prisma.TransactionClient, 'tenantAiBudget'> & {
  $transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
};

export async function loadAiBudget(
  client: Pick<Prisma.TransactionClient, 'tenantAiBudget'>,
  tenantId: string,
  now: Date,
): Promise<AiBudgetRow> {
  const key = periodKey(now);
  const existing = await client.tenantAiBudget.findUnique({
    where: { tenantId_periodKey: { tenantId, periodKey: key } },
  });
  if (existing) {
    return existing;
  }
  return client.tenantAiBudget.create({
    data: {
      id: randomUUID(),
      tenantId,
      periodKey: key,
      unitLimit: DEFAULT_AI_UNIT_LIMIT,
      unitsUsed: 0,
      costLimitMinor: DEFAULT_AI_COST_LIMIT_MINOR,
      costUsedMinor: 0,
    },
  });
}

/**
 * Increments usage only when the row still has room for the whole reservation.
 * The database rechecks the WHERE after taking the row lock, so two callers cannot both pass.
 */
export async function reserveAiBudget(
  client: BudgetClient,
  tenantId: string,
  now: Date,
  units: number,
  costMinor: number,
): Promise<boolean> {
  if (!Number.isInteger(units) || !Number.isInteger(costMinor) || units < 0 || costMinor < 0) {
    return false;
  }
  if (units === 0 && costMinor === 0) {
    return false;
  }
  await loadAiBudget(client, tenantId, now);
  const key = periodKey(now);
  return client.$transaction(async (tx) => {
    const row = await tx.tenantAiBudget.findUnique({
      where: { tenantId_periodKey: { tenantId, periodKey: key } },
    });
    if (!row || !reservationFits(row, units, costMinor)) {
      return false;
    }
    const updated = await tx.tenantAiBudget.updateMany({
      where: {
        tenantId,
        periodKey: key,
        unitsUsed: { lte: row.unitLimit - units },
        costUsedMinor: { lte: row.costLimitMinor - costMinor },
      },
      data: {
        unitsUsed: { increment: units },
        costUsedMinor: { increment: costMinor },
      },
    });
    return updated.count === 1;
  });
}

/** Returns a prior reservation. A zero release is a no-op. */
export async function releaseAiBudget(
  client: BudgetClient,
  tenantId: string,
  now: Date,
  units: number,
  costMinor: number,
): Promise<void> {
  if (units === 0 && costMinor === 0) {
    return;
  }
  const key = periodKey(now);
  await client.$transaction(async (tx) => {
    await tx.tenantAiBudget.updateMany({
      where: {
        tenantId,
        periodKey: key,
        unitsUsed: { gte: units },
        costUsedMinor: { gte: costMinor },
      },
      data: {
        unitsUsed: { decrement: units },
        costUsedMinor: { decrement: costMinor },
      },
    });
  });
}
