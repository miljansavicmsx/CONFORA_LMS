-- CreateEnum
CREATE TYPE "RecertificationReminderKind" AS ENUM ('NINETY_DAYS', 'THIRTY_DAYS', 'ON_EXPIRY');

-- CreateTable
CREATE TABLE "ExamPersonnelCredentialLink" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "credentialId" UUID NOT NULL,
    "examDecisionId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "holderDisplayName" VARCHAR(256) NOT NULL,
    "registryListed" BOOLEAN NOT NULL DEFAULT false,
    "registryConsentAt" TIMESTAMPTZ(3),
    "statusListIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamPersonnelCredentialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecertificationReminder" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "kind" "RecertificationReminderKind" NOT NULL,
    "dueAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecertificationReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CpdRecord" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "holderUserId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "completedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CpdRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamPersonnelCredentialLink_tenantId_id_key" ON "ExamPersonnelCredentialLink"("tenantId", "id");
CREATE UNIQUE INDEX "ExamPersonnelCredentialLink_tenantId_credentialId_key" ON "ExamPersonnelCredentialLink"("tenantId", "credentialId");
CREATE UNIQUE INDEX "ExamPersonnelCredentialLink_tenantId_examDecisionId_key" ON "ExamPersonnelCredentialLink"("tenantId", "examDecisionId");
CREATE UNIQUE INDEX "ExamPersonnelCredentialLink_statusListIndex_key" ON "ExamPersonnelCredentialLink"("statusListIndex");
CREATE INDEX "ExamPersonnelCredentialLink_tenantId_registryListed_idx" ON "ExamPersonnelCredentialLink"("tenantId", "registryListed");

CREATE UNIQUE INDEX "RecertificationReminder_tenantId_id_key" ON "RecertificationReminder"("tenantId", "id");
CREATE UNIQUE INDEX "RecertificationReminder_tenantId_linkId_kind_key" ON "RecertificationReminder"("tenantId", "linkId", "kind");

CREATE UNIQUE INDEX "CpdRecord_tenantId_id_key" ON "CpdRecord"("tenantId", "id");
CREATE INDEX "CpdRecord_tenantId_holderUserId_idx" ON "CpdRecord"("tenantId", "holderUserId");

-- AddForeignKey
ALTER TABLE "ExamPersonnelCredentialLink" ADD CONSTRAINT "ExamPersonnelCredentialLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamPersonnelCredentialLink" ADD CONSTRAINT "ExamPersonnelCredentialLink_tenantId_credentialId_fkey" FOREIGN KEY ("tenantId", "credentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamPersonnelCredentialLink" ADD CONSTRAINT "ExamPersonnelCredentialLink_tenantId_examDecisionId_fkey" FOREIGN KEY ("tenantId", "examDecisionId") REFERENCES "ExamCertificationDecision"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamPersonnelCredentialLink" ADD CONSTRAINT "ExamPersonnelCredentialLink_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RecertificationReminder" ADD CONSTRAINT "RecertificationReminder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecertificationReminder" ADD CONSTRAINT "RecertificationReminder_tenantId_linkId_fkey" FOREIGN KEY ("tenantId", "linkId") REFERENCES "ExamPersonnelCredentialLink"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CpdRecord" ADD CONSTRAINT "CpdRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CpdRecord" ADD CONSTRAINT "CpdRecord_tenantId_linkId_fkey" FOREIGN KEY ("tenantId", "linkId") REFERENCES "ExamPersonnelCredentialLink"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CpdRecord" ADD CONSTRAINT "CpdRecord_tenantId_holderUserId_fkey" FOREIGN KEY ("tenantId", "holderUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
