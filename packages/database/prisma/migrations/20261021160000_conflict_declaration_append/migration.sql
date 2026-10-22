-- Append-only conflict history. Clearing a conflict is a later row by a second person.
ALTER TABLE "CommitteeConflictDeclaration" ADD COLUMN "recordedByUserId" UUID;
UPDATE "CommitteeConflictDeclaration" SET "recordedByUserId" = "userId";
ALTER TABLE "CommitteeConflictDeclaration" ALTER COLUMN "recordedByUserId" SET NOT NULL;

DROP INDEX "CommitteeConflictDeclaration_tenantId_caseId_userId_key";
CREATE INDEX "CommitteeConflictDeclaration_tenantId_caseId_userId_signedAt_idx" ON "CommitteeConflictDeclaration"("tenantId", "caseId", "userId", "signedAt");

ALTER TABLE "CommitteeConflictDeclaration" ADD CONSTRAINT "CommitteeConflictDeclaration_tenantId_recordedByUserId_fkey" FOREIGN KEY ("tenantId", "recordedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
