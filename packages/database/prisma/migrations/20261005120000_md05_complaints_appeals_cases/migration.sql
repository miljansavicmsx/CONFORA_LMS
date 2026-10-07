-- CreateTable
CREATE TABLE "ComplaintCase" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "internalCaseId" VARCHAR(128) NOT NULL,
    "complainantUserId" UUID NOT NULL,

    CONSTRAINT "ComplaintCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealCase" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "internalCaseId" VARCHAR(128) NOT NULL,
    "appellantUserId" UUID NOT NULL,
    "certificationDecisionReference" VARCHAR(128) NOT NULL,
    "originalDecisionMakerUserId" UUID NOT NULL,
    "committeeIdentifier" VARCHAR(128),

    CONSTRAINT "AppealCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintCase_tenantId_internalCaseId_key" ON "ComplaintCase"("tenantId", "internalCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "AppealCase_tenantId_internalCaseId_key" ON "AppealCase"("tenantId", "internalCaseId");

-- AddForeignKey
ALTER TABLE "ComplaintCase" ADD CONSTRAINT "ComplaintCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintCase" ADD CONSTRAINT "ComplaintCase_tenantId_complainantUserId_fkey" FOREIGN KEY ("tenantId", "complainantUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealCase" ADD CONSTRAINT "AppealCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealCase" ADD CONSTRAINT "AppealCase_tenantId_appellantUserId_fkey" FOREIGN KEY ("tenantId", "appellantUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealCase" ADD CONSTRAINT "AppealCase_tenantId_originalDecisionMakerUserId_fkey" FOREIGN KEY ("tenantId", "originalDecisionMakerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- MANUAL REVIEWED REVERSE PROCEDURE — NOT EXECUTED BY FORWARD MIGRATION
-- Prisma migrate deploy remains forward-only.
-- This reverse procedure is not an automatic production rollback.
-- It is not executed by the forward migration.
-- Dependency-safe order:
-- DROP TABLE "AppealCase";
-- DROP TABLE "ComplaintCase";
