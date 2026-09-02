-- CreateEnum
CREATE TYPE "CertificationApplicationStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED'
);

-- CreateTable
CREATE TABLE "CertificationApplication" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "applicantUserId" UUID NOT NULL,
    "status" "CertificationApplicationStatus" NOT NULL,
    "schemeRef" VARCHAR(128) NOT NULL,
    "submittedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CertificationApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CertificationApplication_tenantId_applicantUserId_createdAt_id_idx" ON "CertificationApplication"("tenantId", "applicantUserId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "CertificationApplication_tenantId_applicantUserId_status_idx" ON "CertificationApplication"("tenantId", "applicantUserId", "status");

-- AddForeignKey
ALTER TABLE "CertificationApplication" ADD CONSTRAINT "CertificationApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationApplication" ADD CONSTRAINT "CertificationApplication_tenantId_applicantUserId_fkey" FOREIGN KEY ("tenantId", "applicantUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
