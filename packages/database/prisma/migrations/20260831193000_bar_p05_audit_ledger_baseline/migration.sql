-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM (
  'SUCCESS',
  'DENIED',
  'FAILURE'
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sequence" BIGINT NOT NULL,
    "idempotencyKey" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "eventType" VARCHAR(128) NOT NULL,
    "outcome" "AuditOutcome" NOT NULL,
    "resourceType" VARCHAR(128),
    "resourceId" VARCHAR(128),
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "recordedAt" TIMESTAMPTZ(3) NOT NULL,
    "correlationId" VARCHAR(128),
    "metadata" JSONB,
    "prevHash" CHAR(64) NOT NULL,
    "payloadHash" CHAR(64) NOT NULL,
    "chainHash" CHAR(64) NOT NULL,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditChainHead" (
    "tenantId" UUID NOT NULL,
    "lastSequence" BIGINT NOT NULL,
    "lastHash" CHAR(64) NOT NULL,

    CONSTRAINT "AuditChainHead_pkey" PRIMARY KEY ("tenantId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditEvent_tenantId_sequence_key" ON "AuditEvent"("tenantId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "AuditEvent_tenantId_idempotencyKey_key" ON "AuditEvent"("tenantId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "AuditEvent_tenantId_recordedAt_idx" ON "AuditEvent"("tenantId", "recordedAt");

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_tenantId_actorUserId_fkey" FOREIGN KEY ("tenantId", "actorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditChainHead" ADD CONSTRAINT "AuditChainHead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
