-- CreateEnum
CREATE TYPE "SchemeExamItemType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "SchemeExamItemStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'RETIRED');

-- CreateEnum
CREATE TYPE "ExamBlueprintStatus" AS ENUM ('DRAFT', 'APPROVED', 'RETIRED');

-- CreateEnum
CREATE TYPE "StandardSettingMethod" AS ENUM ('ANGOFF');

-- CreateEnum
CREATE TYPE "StandardSettingStatus" AS ENUM ('DRAFT', 'APPROVED');

-- CreateEnum
CREATE TYPE "CertificationExamSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'SUBMITTED', 'SCORED', 'VOID');

-- CreateEnum
CREATE TYPE "IdentityCaptureState" AS ENUM ('NOT_COLLECTED_DPIA_PENDING');

-- CreateEnum
CREATE TYPE "ExamCertificationDecisionOutcome" AS ENUM ('GRANT', 'DENY');

-- CreateEnum
CREATE TYPE "ExamProctorDisposition" AS ENUM ('DISMISSED', 'CONFIRMED_FOR_REVIEW');

-- CreateTable
CREATE TABLE "SchemeExamItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeId" UUID NOT NULL,
    "familyKey" VARCHAR(64) NOT NULL,
    "version" INTEGER NOT NULL,
    "stem" TEXT NOT NULL,
    "itemType" "SchemeExamItemType" NOT NULL,
    "status" "SchemeExamItemStatus" NOT NULL DEFAULT 'DRAFT',
    "authorUserId" UUID NOT NULL,
    "domainCode" VARCHAR(64) NOT NULL,
    "exposureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SchemeExamItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeExamItemChoice" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "choiceKey" VARCHAR(16) NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemeExamItemChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeExamItemCompetence" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "competenceId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemeExamItemCompetence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeExamItemTransition" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "fromStatus" "SchemeExamItemStatus" NOT NULL,
    "toStatus" "SchemeExamItemStatus" NOT NULL,
    "note" TEXT,
    "actedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemeExamItemTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamBlueprint" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "status" "ExamBlueprintStatus" NOT NULL DEFAULT 'DRAFT',
    "retakeWindowDays" INTEGER NOT NULL DEFAULT 90,
    "cutScoreBasisPoints" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExamBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamBlueprintDomain" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "blueprintId" UUID NOT NULL,
    "domainCode" VARCHAR(64) NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "weightBasisPoints" INTEGER NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamBlueprintDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardSettingRecord" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "blueprintId" UUID NOT NULL,
    "method" "StandardSettingMethod" NOT NULL DEFAULT 'ANGOFF',
    "status" "StandardSettingStatus" NOT NULL DEFAULT 'DRAFT',
    "cutScoreBasisPoints" INTEGER,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMPTZ(3),
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandardSettingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardSettingRating" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "recordId" UUID NOT NULL,
    "panelistUserId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "probabilityBasisPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandardSettingRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssembledExamForm" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "blueprintId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "shuffleItems" BOOLEAN NOT NULL DEFAULT true,
    "shuffleChoices" BOOLEAN NOT NULL DEFAULT true,
    "assembledByUserId" UUID NOT NULL,
    "assembledAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssembledExamForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssembledExamFormItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "formId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "domainCode" VARCHAR(64) NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssembledExamFormItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationExamSession" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "formId" UUID NOT NULL,
    "candidateUserId" UUID NOT NULL,
    "certificationApplicationId" UUID NOT NULL,
    "scheduledStartAt" TIMESTAMPTZ(3) NOT NULL,
    "invigilatorUserId" UUID NOT NULL,
    "status" "CertificationExamSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "rulesAcceptedAt" TIMESTAMPTZ(3),
    "ndaAcceptedAt" TIMESTAMPTZ(3),
    "mfaReference" VARCHAR(64),
    "identityCaptureState" "IdentityCaptureState" NOT NULL DEFAULT 'NOT_COLLECTED_DPIA_PENDING',
    "extraTimePercent" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3),
    "submittedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CertificationExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationExamAnswer" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "selectedKeys" TEXT[],
    "savedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CertificationExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationExamResult" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "scoreBasisPoints" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "provisional" BOOLEAN NOT NULL DEFAULT true,
    "domainFeedback" JSONB NOT NULL,
    "scoredAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificationExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamCertificationDecision" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "resultId" UUID NOT NULL,
    "decidedByUserId" UUID NOT NULL,
    "outcome" "ExamCertificationDecisionOutcome" NOT NULL,
    "rationale" TEXT NOT NULL,
    "trainerOfCandidate" BOOLEAN NOT NULL,
    "independentOfTraining" BOOLEAN NOT NULL,
    "decidedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamCertificationDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamProctorFlag" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "source" "ProctorSignalSource" NOT NULL,
    "signalCode" VARCHAR(64) NOT NULL,
    "recordedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamProctorFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamProctorFlagReview" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "flagId" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "disposition" "ExamProctorDisposition" NOT NULL,
    "note" TEXT,
    "reviewedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamProctorFlagReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamItemStatistic" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "formId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "attemptCount" INTEGER NOT NULL,
    "pValue" DECIMAL(8,5) NOT NULL,
    "pointBiserial" DECIMAL(8,5),
    "flagReason" VARCHAR(64),
    "computedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExamItemStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamFormReliability" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "formId" UUID NOT NULL,
    "attemptCount" INTEGER NOT NULL,
    "kr20" DECIMAL(8,5),
    "flagReason" VARCHAR(64),
    "computedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExamFormReliability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchemeExamItem_tenantId_schemeId_status_domainCode_idx" ON "SchemeExamItem"("tenantId", "schemeId", "status", "domainCode");

-- CreateIndex
CREATE INDEX "SchemeExamItem_tenantId_authorUserId_idx" ON "SchemeExamItem"("tenantId", "authorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeExamItem_tenantId_id_key" ON "SchemeExamItem"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeExamItem_tenantId_familyKey_version_key" ON "SchemeExamItem"("tenantId", "familyKey", "version");

-- CreateIndex
CREATE INDEX "SchemeExamItemChoice_tenantId_idx" ON "SchemeExamItemChoice"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeExamItemChoice_tenantId_id_key" ON "SchemeExamItemChoice"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeExamItemChoice_tenantId_itemId_choiceKey_key" ON "SchemeExamItemChoice"("tenantId", "itemId", "choiceKey");

-- CreateIndex
CREATE INDEX "SchemeExamItemCompetence_tenantId_competenceId_idx" ON "SchemeExamItemCompetence"("tenantId", "competenceId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeExamItemCompetence_tenantId_id_key" ON "SchemeExamItemCompetence"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeExamItemCompetence_tenantId_itemId_competenceId_key" ON "SchemeExamItemCompetence"("tenantId", "itemId", "competenceId");

-- CreateIndex
CREATE INDEX "SchemeExamItemTransition_tenantId_itemId_actedAt_idx" ON "SchemeExamItemTransition"("tenantId", "itemId", "actedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeExamItemTransition_tenantId_id_key" ON "SchemeExamItemTransition"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ExamBlueprint_tenantId_schemeVersionId_status_idx" ON "ExamBlueprint"("tenantId", "schemeVersionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExamBlueprint_tenantId_id_key" ON "ExamBlueprint"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ExamBlueprintDomain_tenantId_idx" ON "ExamBlueprintDomain"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamBlueprintDomain_tenantId_id_key" ON "ExamBlueprintDomain"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamBlueprintDomain_tenantId_blueprintId_domainCode_key" ON "ExamBlueprintDomain"("tenantId", "blueprintId", "domainCode");

-- CreateIndex
CREATE INDEX "StandardSettingRecord_tenantId_blueprintId_status_idx" ON "StandardSettingRecord"("tenantId", "blueprintId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StandardSettingRecord_tenantId_id_key" ON "StandardSettingRecord"("tenantId", "id");

-- CreateIndex
CREATE INDEX "StandardSettingRating_tenantId_itemId_idx" ON "StandardSettingRating"("tenantId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "StandardSettingRating_tenantId_id_key" ON "StandardSettingRating"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "StandardSettingRating_tenantId_recordId_panelistUserId_item_key" ON "StandardSettingRating"("tenantId", "recordId", "panelistUserId", "itemId");

-- CreateIndex
CREATE INDEX "AssembledExamForm_tenantId_blueprintId_idx" ON "AssembledExamForm"("tenantId", "blueprintId");

-- CreateIndex
CREATE UNIQUE INDEX "AssembledExamForm_tenantId_id_key" ON "AssembledExamForm"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AssembledExamFormItem_tenantId_id_key" ON "AssembledExamFormItem"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AssembledExamFormItem_tenantId_formId_itemId_key" ON "AssembledExamFormItem"("tenantId", "formId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "AssembledExamFormItem_tenantId_formId_sequence_key" ON "AssembledExamFormItem"("tenantId", "formId", "sequence");

-- CreateIndex
CREATE INDEX "CertificationExamSession_tenantId_candidateUserId_status_idx" ON "CertificationExamSession"("tenantId", "candidateUserId", "status");

-- CreateIndex
CREATE INDEX "CertificationExamSession_tenantId_certificationApplicationI_idx" ON "CertificationExamSession"("tenantId", "certificationApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationExamSession_tenantId_id_key" ON "CertificationExamSession"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationExamAnswer_tenantId_id_key" ON "CertificationExamAnswer"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationExamAnswer_tenantId_sessionId_itemId_key" ON "CertificationExamAnswer"("tenantId", "sessionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationExamResult_tenantId_id_key" ON "CertificationExamResult"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationExamResult_tenantId_sessionId_key" ON "CertificationExamResult"("tenantId", "sessionId");

-- CreateIndex
CREATE INDEX "ExamCertificationDecision_tenantId_decidedByUserId_idx" ON "ExamCertificationDecision"("tenantId", "decidedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamCertificationDecision_tenantId_id_key" ON "ExamCertificationDecision"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamCertificationDecision_tenantId_resultId_key" ON "ExamCertificationDecision"("tenantId", "resultId");

-- CreateIndex
CREATE INDEX "ExamProctorFlag_tenantId_sessionId_recordedAt_idx" ON "ExamProctorFlag"("tenantId", "sessionId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExamProctorFlag_tenantId_id_key" ON "ExamProctorFlag"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ExamProctorFlagReview_tenantId_flagId_idx" ON "ExamProctorFlagReview"("tenantId", "flagId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamProctorFlagReview_tenantId_id_key" ON "ExamProctorFlagReview"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ExamItemStatistic_tenantId_flagReason_idx" ON "ExamItemStatistic"("tenantId", "flagReason");

-- CreateIndex
CREATE UNIQUE INDEX "ExamItemStatistic_tenantId_id_key" ON "ExamItemStatistic"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamItemStatistic_tenantId_formId_itemId_key" ON "ExamItemStatistic"("tenantId", "formId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormReliability_tenantId_id_key" ON "ExamFormReliability"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormReliability_tenantId_formId_key" ON "ExamFormReliability"("tenantId", "formId");

-- AddForeignKey
ALTER TABLE "SchemeExamItem" ADD CONSTRAINT "SchemeExamItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItem" ADD CONSTRAINT "SchemeExamItem_tenantId_schemeId_fkey" FOREIGN KEY ("tenantId", "schemeId") REFERENCES "CertificationScheme"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItem" ADD CONSTRAINT "SchemeExamItem_tenantId_authorUserId_fkey" FOREIGN KEY ("tenantId", "authorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItemChoice" ADD CONSTRAINT "SchemeExamItemChoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItemChoice" ADD CONSTRAINT "SchemeExamItemChoice_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "SchemeExamItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItemCompetence" ADD CONSTRAINT "SchemeExamItemCompetence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItemCompetence" ADD CONSTRAINT "SchemeExamItemCompetence_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "SchemeExamItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItemCompetence" ADD CONSTRAINT "SchemeExamItemCompetence_tenantId_competenceId_fkey" FOREIGN KEY ("tenantId", "competenceId") REFERENCES "Competence"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItemTransition" ADD CONSTRAINT "SchemeExamItemTransition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItemTransition" ADD CONSTRAINT "SchemeExamItemTransition_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "SchemeExamItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeExamItemTransition" ADD CONSTRAINT "SchemeExamItemTransition_tenantId_actorUserId_fkey" FOREIGN KEY ("tenantId", "actorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamBlueprint" ADD CONSTRAINT "ExamBlueprint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamBlueprint" ADD CONSTRAINT "ExamBlueprint_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamBlueprintDomain" ADD CONSTRAINT "ExamBlueprintDomain_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamBlueprintDomain" ADD CONSTRAINT "ExamBlueprintDomain_tenantId_blueprintId_fkey" FOREIGN KEY ("tenantId", "blueprintId") REFERENCES "ExamBlueprint"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardSettingRecord" ADD CONSTRAINT "StandardSettingRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardSettingRecord" ADD CONSTRAINT "StandardSettingRecord_tenantId_blueprintId_fkey" FOREIGN KEY ("tenantId", "blueprintId") REFERENCES "ExamBlueprint"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardSettingRecord" ADD CONSTRAINT "StandardSettingRecord_tenantId_approvedByUserId_fkey" FOREIGN KEY ("tenantId", "approvedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardSettingRating" ADD CONSTRAINT "StandardSettingRating_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardSettingRating" ADD CONSTRAINT "StandardSettingRating_tenantId_recordId_fkey" FOREIGN KEY ("tenantId", "recordId") REFERENCES "StandardSettingRecord"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardSettingRating" ADD CONSTRAINT "StandardSettingRating_tenantId_panelistUserId_fkey" FOREIGN KEY ("tenantId", "panelistUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardSettingRating" ADD CONSTRAINT "StandardSettingRating_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "SchemeExamItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssembledExamForm" ADD CONSTRAINT "AssembledExamForm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssembledExamForm" ADD CONSTRAINT "AssembledExamForm_tenantId_blueprintId_fkey" FOREIGN KEY ("tenantId", "blueprintId") REFERENCES "ExamBlueprint"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssembledExamForm" ADD CONSTRAINT "AssembledExamForm_tenantId_assembledByUserId_fkey" FOREIGN KEY ("tenantId", "assembledByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssembledExamFormItem" ADD CONSTRAINT "AssembledExamFormItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssembledExamFormItem" ADD CONSTRAINT "AssembledExamFormItem_tenantId_formId_fkey" FOREIGN KEY ("tenantId", "formId") REFERENCES "AssembledExamForm"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssembledExamFormItem" ADD CONSTRAINT "AssembledExamFormItem_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "SchemeExamItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamSession" ADD CONSTRAINT "CertificationExamSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamSession" ADD CONSTRAINT "CertificationExamSession_tenantId_formId_fkey" FOREIGN KEY ("tenantId", "formId") REFERENCES "AssembledExamForm"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamSession" ADD CONSTRAINT "CertificationExamSession_tenantId_candidateUserId_fkey" FOREIGN KEY ("tenantId", "candidateUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamSession" ADD CONSTRAINT "CertificationExamSession_tenantId_invigilatorUserId_fkey" FOREIGN KEY ("tenantId", "invigilatorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamAnswer" ADD CONSTRAINT "CertificationExamAnswer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamAnswer" ADD CONSTRAINT "CertificationExamAnswer_tenantId_sessionId_fkey" FOREIGN KEY ("tenantId", "sessionId") REFERENCES "CertificationExamSession"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamAnswer" ADD CONSTRAINT "CertificationExamAnswer_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "SchemeExamItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamResult" ADD CONSTRAINT "CertificationExamResult_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationExamResult" ADD CONSTRAINT "CertificationExamResult_tenantId_sessionId_fkey" FOREIGN KEY ("tenantId", "sessionId") REFERENCES "CertificationExamSession"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamCertificationDecision" ADD CONSTRAINT "ExamCertificationDecision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamCertificationDecision" ADD CONSTRAINT "ExamCertificationDecision_tenantId_resultId_fkey" FOREIGN KEY ("tenantId", "resultId") REFERENCES "CertificationExamResult"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamCertificationDecision" ADD CONSTRAINT "ExamCertificationDecision_tenantId_decidedByUserId_fkey" FOREIGN KEY ("tenantId", "decidedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamProctorFlag" ADD CONSTRAINT "ExamProctorFlag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamProctorFlag" ADD CONSTRAINT "ExamProctorFlag_tenantId_sessionId_fkey" FOREIGN KEY ("tenantId", "sessionId") REFERENCES "CertificationExamSession"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamProctorFlagReview" ADD CONSTRAINT "ExamProctorFlagReview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamProctorFlagReview" ADD CONSTRAINT "ExamProctorFlagReview_tenantId_flagId_fkey" FOREIGN KEY ("tenantId", "flagId") REFERENCES "ExamProctorFlag"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamProctorFlagReview" ADD CONSTRAINT "ExamProctorFlagReview_tenantId_reviewerUserId_fkey" FOREIGN KEY ("tenantId", "reviewerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamItemStatistic" ADD CONSTRAINT "ExamItemStatistic_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamItemStatistic" ADD CONSTRAINT "ExamItemStatistic_tenantId_formId_fkey" FOREIGN KEY ("tenantId", "formId") REFERENCES "AssembledExamForm"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamItemStatistic" ADD CONSTRAINT "ExamItemStatistic_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "SchemeExamItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormReliability" ADD CONSTRAINT "ExamFormReliability_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormReliability" ADD CONSTRAINT "ExamFormReliability_tenantId_formId_fkey" FOREIGN KEY ("tenantId", "formId") REFERENCES "AssembledExamForm"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

