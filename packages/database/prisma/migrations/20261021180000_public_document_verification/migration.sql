-- Public EDU/EXM verification ids and holder name consent (OD-PP-30).
ALTER TABLE "EducationCompletionDocument" ADD COLUMN "verificationId" VARCHAR(64);
ALTER TABLE "EducationCompletionDocument" ADD COLUMN "nameConsentAt" TIMESTAMPTZ(3);
UPDATE "EducationCompletionDocument"
SET "verificationId" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE "verificationId" IS NULL;
ALTER TABLE "EducationCompletionDocument" ALTER COLUMN "verificationId" SET NOT NULL;
CREATE UNIQUE INDEX "EducationCompletionDocument_verificationId_key" ON "EducationCompletionDocument"("verificationId");

ALTER TABLE "ExamPassAttestation" ADD COLUMN "verificationId" VARCHAR(64);
ALTER TABLE "ExamPassAttestation" ADD COLUMN "nameConsentAt" TIMESTAMPTZ(3);
UPDATE "ExamPassAttestation"
SET "verificationId" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE "verificationId" IS NULL;
ALTER TABLE "ExamPassAttestation" ALTER COLUMN "verificationId" SET NOT NULL;
CREATE UNIQUE INDEX "ExamPassAttestation_verificationId_key" ON "ExamPassAttestation"("verificationId");

CREATE TABLE "PublicDocumentAccessLog" (
    "id" UUID NOT NULL,
    "tenantId" UUID,
    "verificationKeyHash" CHAR(64) NOT NULL,
    "sourceIp" VARCHAR(64) NOT NULL,
    "outcome" VARCHAR(16) NOT NULL,
    "recordedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "PublicDocumentAccessLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PublicDocumentAccessLog_tenantId_recordedAt_idx" ON "PublicDocumentAccessLog"("tenantId", "recordedAt");
ALTER TABLE "PublicDocumentAccessLog"
ADD CONSTRAINT "PublicDocumentAccessLog_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
