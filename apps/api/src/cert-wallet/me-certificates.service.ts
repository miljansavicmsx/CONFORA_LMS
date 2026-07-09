import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { auditActorFromUser } from '../audit/audit-actor.util';
import { AuditLedgerService } from '../audit/audit-ledger.service';
import type { ConforaUser } from '../auth/types/confora-user';
import { resolveActorDbAccess } from '../auth/actor-db-access';
import { PdfS3StorageService } from '../pdf/pdf-s3-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { mapCertificateToWalletItem } from './cert-wallet.mapper';
import {
  LEARNER_CERT_PDF_URL_CONTRACT_VERSION,
  type LearnerCertificatePdfUrlResponse,
} from './dto/learner-certificate-pdf-url-response.dto';
import {
  LEARNER_CERT_WALLET_CONTRACT_VERSION,
  type LearnerCertWalletResponse,
} from './dto/me-certificates-response.dto';

type WalletAccess = {
  tenantId: string;
  userId: string;
};

@Injectable()
export class MeCertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: PdfS3StorageService,
    private readonly audit: AuditLedgerService,
  ) {}

  async listMyCertificates(actor: ConforaUser): Promise<LearnerCertWalletResponse> {
    const { tenantId, userId } = await this.resolveWalletAccess(actor);

    const rows = await this.prisma.db.certificate.findMany({
      where: {
        tenantId,
        userId,
      },
      include: {
        scheme: { select: { name: true, revisionSeq: true } },
      },
      orderBy: { issueDate: 'desc' },
    });

    return {
      contractVersion: LEARNER_CERT_WALLET_CONTRACT_VERSION,
      items: rows.map((row) => mapCertificateToWalletItem(row)),
    };
  }

  async getCertificatePdfDownloadUrl(
    actor: ConforaUser,
    certificateUid: string,
  ): Promise<LearnerCertificatePdfUrlResponse> {
    const uid = certificateUid.trim();
    if (!uid) {
      throw new NotFoundException('Certificate not found.');
    }

    const { tenantId, userId } = await this.resolveWalletAccess(actor);

    const row = await this.prisma.db.certificate.findFirst({
      where: {
        uid,
        tenantId,
        userId,
      },
      select: {
        uid: true,
        pdfStorageKey: true,
      },
    });

    if (!row?.pdfStorageKey?.trim()) {
      throw new NotFoundException('Certificate PDF is not available.');
    }

    const storageKey = row.pdfStorageKey.trim();
    const ttlSeconds = this.s3.urlTtlSeconds();
    const pdfUrl = await this.s3.presignedGetUrl(storageKey);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const auditActor = auditActorFromUser(actor);
    void this.audit
      .log({
        ...(auditActor ? { actor: auditActor } : {}),
        action: 'CERTIFICATE_PDF_DOWNLOAD_URL_ISSUED',
        resourceType: 'Certificate',
        resourceId: row.uid,
        tenantId,
        tenantScoped: true,
        newValue: {
          certificateUid: row.uid,
          accessMode: 'PRESIGNED_URL',
        },
      })
      .catch(() => undefined);

    return {
      contractVersion: LEARNER_CERT_PDF_URL_CONTRACT_VERSION,
      certificateId: row.uid,
      pdfUrl,
      expiresAt,
      accessMode: 'PRESIGNED_URL',
    };
  }

  private async resolveWalletAccess(actor: ConforaUser): Promise<WalletAccess> {
    return resolveActorDbAccess(this.prisma.db, actor);
  }
}
