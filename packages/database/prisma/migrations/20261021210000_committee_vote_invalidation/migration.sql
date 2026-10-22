-- A composition change keeps the ballot row and marks it invalid.
-- A later vote is a new row, so the unique member ballot is an index.
ALTER TABLE "CommitteeAssessment" ADD COLUMN "voidedAt" TIMESTAMPTZ(3);
ALTER TABLE "CommitteeAssessment" ADD COLUMN "voidReason" VARCHAR(64);

DROP INDEX "CommitteeAssessment_tenantId_caseId_memberUserId_key";
CREATE INDEX "CommitteeAssessment_tenantId_caseId_memberUserId_idx" ON "CommitteeAssessment"("tenantId", "caseId", "memberUserId");
