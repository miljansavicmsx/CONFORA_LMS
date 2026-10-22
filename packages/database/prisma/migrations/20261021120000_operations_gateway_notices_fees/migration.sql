-- CreateEnum
CREATE TYPE "NoticeChannel" AS ENUM ('EMAIL', 'IN_APP');
CREATE TYPE "NoticeJobStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'FAILED', 'BOUNCED', 'COMPLAINT');
CREATE TYPE "NoticeKind" AS ENUM ('CERTIFICATE_EXPIRY', 'RECERTIFICATION', 'EXAM', 'FEE', 'GENERAL');
CREATE TYPE "AnnualFeeKind" AS ENUM ('FIRST_YEAR', 'ANNUAL', 'RECERTIFICATION');
CREATE TYPE "AnnualFeeStatus" AS ENUM ('INCLUDED', 'DUE', 'OPEN_CASE', 'SETTLED');

-- CreateTable
CREATE TABLE "CommitteeConflictDeclaration" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "hasConflict" BOOLEAN NOT NULL,
    "statement" TEXT NOT NULL,
    "signedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommitteeConflictDeclaration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TenantAiBudget" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "periodKey" VARCHAR(7) NOT NULL,
    "unitLimit" INTEGER NOT NULL,
    "unitsUsed" INTEGER NOT NULL DEFAULT 0,
    "costLimitMinor" INTEGER NOT NULL,
    "costUsedMinor" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "TenantAiBudget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NoticeJob" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "recipientUserId" UUID NOT NULL,
    "channel" "NoticeChannel" NOT NULL,
    "kind" "NoticeKind" NOT NULL,
    "referenceId" VARCHAR(64) NOT NULL,
    "toAddress" VARCHAR(256) NOT NULL,
    "subject" VARCHAR(256) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NoticeJobStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextAttemptAt" TIMESTAMPTZ(3) NOT NULL,
    "lastError" VARCHAR(512),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "NoticeJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InAppNotice" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InAppNotice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SchemeAnnualFee" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "annualAmountMinor" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "firstYearIncluded" BOOLEAN NOT NULL DEFAULT true,
    "recertificationSeparate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "SchemeAnnualFee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnnualFeeObligation" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "credentialId" UUID NOT NULL,
    "holderUserId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "kind" "AnnualFeeKind" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "AnnualFeeStatus" NOT NULL,
    "reason" TEXT,
    "openedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "AnnualFeeObligation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeConflictDeclaration_tenantId_id_key" ON "CommitteeConflictDeclaration"("tenantId", "id");
CREATE UNIQUE INDEX "CommitteeConflictDeclaration_tenantId_caseId_userId_key" ON "CommitteeConflictDeclaration"("tenantId", "caseId", "userId");
CREATE UNIQUE INDEX "TenantAiBudget_tenantId_id_key" ON "TenantAiBudget"("tenantId", "id");
CREATE UNIQUE INDEX "TenantAiBudget_tenantId_periodKey_key" ON "TenantAiBudget"("tenantId", "periodKey");
CREATE UNIQUE INDEX "NoticeJob_tenantId_id_key" ON "NoticeJob"("tenantId", "id");
CREATE UNIQUE INDEX "NoticeJob_tenantId_kind_referenceId_channel_key" ON "NoticeJob"("tenantId", "kind", "referenceId", "channel");
CREATE INDEX "NoticeJob_tenantId_status_nextAttemptAt_idx" ON "NoticeJob"("tenantId", "status", "nextAttemptAt");
CREATE UNIQUE INDEX "InAppNotice_tenantId_id_key" ON "InAppNotice"("tenantId", "id");
CREATE UNIQUE INDEX "InAppNotice_tenantId_jobId_key" ON "InAppNotice"("tenantId", "jobId");
CREATE INDEX "InAppNotice_tenantId_userId_createdAt_idx" ON "InAppNotice"("tenantId", "userId", "createdAt");
CREATE UNIQUE INDEX "SchemeAnnualFee_tenantId_id_key" ON "SchemeAnnualFee"("tenantId", "id");
CREATE UNIQUE INDEX "SchemeAnnualFee_tenantId_schemeVersionId_key" ON "SchemeAnnualFee"("tenantId", "schemeVersionId");
CREATE UNIQUE INDEX "AnnualFeeObligation_tenantId_id_key" ON "AnnualFeeObligation"("tenantId", "id");
CREATE UNIQUE INDEX "AnnualFeeObligation_tenantId_credentialId_year_kind_key" ON "AnnualFeeObligation"("tenantId", "credentialId", "year", "kind");
CREATE INDEX "AnnualFeeObligation_tenantId_holderUserId_status_idx" ON "AnnualFeeObligation"("tenantId", "holderUserId", "status");

-- AddForeignKey
ALTER TABLE "CommitteeConflictDeclaration" ADD CONSTRAINT "CommitteeConflictDeclaration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeConflictDeclaration" ADD CONSTRAINT "CommitteeConflictDeclaration_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeConflictDeclaration" ADD CONSTRAINT "CommitteeConflictDeclaration_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TenantAiBudget" ADD CONSTRAINT "TenantAiBudget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NoticeJob" ADD CONSTRAINT "NoticeJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NoticeJob" ADD CONSTRAINT "NoticeJob_tenantId_recipientUserId_fkey" FOREIGN KEY ("tenantId", "recipientUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InAppNotice" ADD CONSTRAINT "InAppNotice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InAppNotice" ADD CONSTRAINT "InAppNotice_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InAppNotice" ADD CONSTRAINT "InAppNotice_tenantId_jobId_fkey" FOREIGN KEY ("tenantId", "jobId") REFERENCES "NoticeJob"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeAnnualFee" ADD CONSTRAINT "SchemeAnnualFee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeAnnualFee" ADD CONSTRAINT "SchemeAnnualFee_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AnnualFeeObligation" ADD CONSTRAINT "AnnualFeeObligation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AnnualFeeObligation" ADD CONSTRAINT "AnnualFeeObligation_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AnnualFeeObligation" ADD CONSTRAINT "AnnualFeeObligation_tenantId_credentialId_fkey" FOREIGN KEY ("tenantId", "credentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AnnualFeeObligation" ADD CONSTRAINT "AnnualFeeObligation_tenantId_holderUserId_fkey" FOREIGN KEY ("tenantId", "holderUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
