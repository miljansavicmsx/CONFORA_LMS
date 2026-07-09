import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { ConforaUser } from '../auth/types/confora-user';
import { resolveActorDbAccess } from '../auth/actor-db-access';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { PrismaService } from '../prisma/prisma.service';
import { computeRecertificationWindow } from '../cert-recertification/staff-recertification.rules';

/** §9.6 — requires at least one substantive assessment flag beyond self_declaration. */
const SUBSTANTIVE_INPUT_KEYS = [
  'exam_passed',
  'cpd_hours_recorded',
  'on_site_assessment',
  'structured_interview',
  'work_experience_review',
  'physical_capability',
] as const;

@Injectable()
export class RecertificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationEventsService,
  ) {}

  private async resolveHolderUserId(user: ConforaUser): Promise<string> {
    const access = await resolveActorDbAccess(this.prisma.db, user);
    return access.userId;
  }

  private async findHolderCertificate(user: ConforaUser, certificateRef: string) {
    const ref = certificateRef.trim();
    if (!ref) {
      return null;
    }
    const holderUserId = await this.resolveHolderUserId(user);
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ref);
    return this.prisma.db.certificate.findFirst({
      where: {
        userId: holderUserId,
        status: 'ACTIVE',
        ...(isUuid ? { OR: [{ id: ref }, { uid: ref }] } : { uid: ref }),
      },
      include: { scheme: true },
    });
  }

  async getOrCreateCase(user: ConforaUser, certificateId: string) {
    const holderUserId = await this.resolveHolderUserId(user);
    const cert = await this.findHolderCertificate(user, certificateId);
    if (!cert) throw new NotFoundException('Certificate not found');
    const validUntil = cert.validUntil ?? cert.expiryDate;
    if (!validUntil) {
      throw new BadRequestException('Certificate has no expiry — recertification N/A');
    }

    const existing = await this.prisma.db.recertificationCase.findFirst({
      where: { certificateId: cert.id, candidateId: holderUserId, status: { in: ['OPEN', 'SUBMITTED'] } },
    });
    const schemeRecertification = cert.scheme.recertification;
    if (existing) {
      return { ...existing, schemeRecertification };
    }

    const days = Math.ceil((validUntil.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (days > 90) {
      throw new ForbiddenException('Recertification window opens at T-90 days before expiry');
    }

    const window = computeRecertificationWindow({ validUntil });
    const now = new Date();
    const created = await this.prisma.db.recertificationCase.create({
      data: {
        tenantId: cert.tenantId,
        certificateId: cert.id,
        candidateId: holderUserId,
        schemeId: cert.schemeId,
        status: 'OPEN',
        openedAt: now,
        currentCertificateValidUntil: validUntil,
        recertificationOpenAt: window.recertificationOpenAt,
        recertificationDueAt: window.recertificationDueAt,
        gracePeriodUntil: window.gracePeriodUntil,
        createdBy: holderUserId,
        inputs: {},
      },
    });
    return { ...created, schemeRecertification };
  }

  async patchInputs(user: ConforaUser, certificateId: string, inputs: Record<string, unknown>) {
    const holderUserId = await this.resolveHolderUserId(user);
    const cert = await this.findHolderCertificate(user, certificateId);
    if (!cert) throw new NotFoundException('Certificate not found');
    const row = await this.prisma.db.recertificationCase.findFirst({
      where: { certificateId: cert.id, candidateId: holderUserId },
    });
    if (!row) throw new NotFoundException('Recertification case not found — open the flow first');
    const merged = { ...(row.inputs as object), ...inputs };
    return this.prisma.db.recertificationCase.update({
      where: { id: row.id },
      data: {
        inputs: merged,
      },
    });
  }

  async submit(user: ConforaUser, certificateId: string) {
    const holderUserId = await this.resolveHolderUserId(user);
    const cert = await this.findHolderCertificate(user, certificateId);
    if (!cert) throw new NotFoundException('Certificate not found');
    const row = await this.prisma.db.recertificationCase.findFirst({
      where: { certificateId: cert.id, candidateId: holderUserId },
    });
    if (!row) throw new NotFoundException('Recertification case not found');
    const inputs = row.inputs as Record<string, unknown>;
    const selfOnly = inputs['self_declaration'] === true || inputs['self_declaration'] === 'true';
    const substantive = SUBSTANTIVE_INPUT_KEYS.some((k) => {
      const v = inputs[k];
      if (v === true) return true;
      if (typeof v === 'number' && v > 0 && k === 'cpd_hours_recorded') return true;
      if (typeof v === 'string' && v.length > 0) return true;
      return false;
    });
    if (!substantive) {
      throw new BadRequestException(
        'Self-declaration alone cannot complete recertification — provide at least one substantive assessment input (§9.6).',
      );
    }
    if (selfOnly && Object.keys(inputs).length <= 1) {
      throw new BadRequestException('Additional evidence beyond self-declaration is required');
    }

    return this.prisma.db.recertificationCase.update({
      where: { id: row.id },
      data: { status: 'SUBMITTED', submittedAt: new Date(), submittedBy: holderUserId },
    });
  }

  emitExpiryReminders(daysBefore: number): Promise<void> {
    const now = new Date();
    const target = new Date(now.getTime() + daysBefore * 86400000);
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    return (async () => {
      const certs = await this.prisma.db.certificate.findMany({
        where: {
          status: 'ACTIVE',
          expiryDate: { gte: start, lte: end },
        },
        select: { id: true, userId: true, uid: true },
        take: 500,
      });
      for (const c of certs) {
        void this.notifications
          .emit({
            idempotencyKey: `recert.reminder.${String(daysBefore)}.${c.id}`,
            eventKey: 'certificate.recert.reminder',
            userId: c.userId,
            variables: {
              heading: `Recertification reminder (T-${String(daysBefore)})`,
              bodyText: `Certificate ${c.uid} — window and requirements are available in your dashboard.`,
            },
          })
          .catch(() => undefined);
      }
    })();
  }
}
