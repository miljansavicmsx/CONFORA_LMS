-- AlterEnum
ALTER TYPE "CertificationExamSessionStatus" ADD VALUE 'READY';

-- CreateEnum
CREATE TYPE "IdentityDocumentType" AS ENUM ('PASSPORT', 'ID_CARD', 'DRIVING_LICENCE', 'RESIDENCE_PERMIT');

-- AlterTable
ALTER TABLE "IdentityCheck" ADD COLUMN "documentType" "IdentityDocumentType";

-- CreateTable
CREATE TABLE "CertificationExamIdentityLink" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "identityCheckId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificationExamIdentityLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CertificationExamIdentityLink_tenantId_id_key" ON "CertificationExamIdentityLink"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationExamIdentityLink_tenantId_sessionId_key" ON "CertificationExamIdentityLink"("tenantId", "sessionId");

-- CreateIndex
CREATE INDEX "CertificationExamIdentityLink_tenantId_identityCheckId_idx" ON "CertificationExamIdentityLink"("tenantId", "identityCheckId");

-- AddForeignKey
ALTER TABLE "CertificationExamIdentityLink" ADD CONSTRAINT "CertificationExamIdentityLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamIdentityLink" ADD CONSTRAINT "CertificationExamIdentityLink_tenantId_sessionId_fkey" FOREIGN KEY ("tenantId", "sessionId") REFERENCES "CertificationExamSession"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamIdentityLink" ADD CONSTRAINT "CertificationExamIdentityLink_tenantId_identityCheckId_fkey" FOREIGN KEY ("tenantId", "identityCheckId") REFERENCES "IdentityCheck"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
