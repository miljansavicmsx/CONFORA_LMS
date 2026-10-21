-- CreateEnum
CREATE TYPE "ProfessionalCasePhase" AS ENUM ('ELIGIBILITY', 'DOSSIER', 'COMMITTEE', 'APPROVED_FOR_ISSUANCE', 'ISSUED', 'DENIED');
CREATE TYPE "CertificationJourneyPath" AS ENUM ('CONFORA_EDUCATION', 'DIRECT');
CREATE TYPE "ExperienceCheckMode" AS ENUM ('INDEPENDENT_REFERENCES', 'OTHER_VERIFIABLE_EVIDENCE');
CREATE TYPE "AttestationState" AS ENUM ('PENDING_REVIEW', 'ISSUED');
CREATE TYPE "CaseEvidenceKind" AS ENUM ('EDUCATION', 'QUALIFICATION', 'EXPERIENCE', 'WORK', 'OTHER');
CREATE TYPE "RefereeLinkState" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'EXPIRED');
CREATE TYPE "OutboxStatus" AS ENUM ('QUEUED', 'LOGGED');
CREATE TYPE "CommitteeSlotState" AS ENUM ('PROPOSED', 'CONFIRMED', 'EXCLUDED');
CREATE TYPE "CommitteeBallot" AS ENUM ('GRANT', 'DENY');

-- CreateTable
CREATE TABLE "SchemeLevelCriterion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "rank" INTEGER NOT NULL,
    "minExperienceMonths" INTEGER NOT NULL,
    "requiresExamPass" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchemeLevelCriterion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SchemeDecisionMaker" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "competenceNote" TEXT NOT NULL,
    "authorisedFrom" TIMESTAMPTZ(3) NOT NULL,
    "authorisedUntil" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchemeDecisionMaker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SchemeCaseRule" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "votingQuorum" INTEGER NOT NULL DEFAULT 2,
    "experienceMayFollowExam" BOOLEAN NOT NULL DEFAULT true,
    "experienceMode" "ExperienceCheckMode" NOT NULL DEFAULT 'INDEPENDENT_REFERENCES',
    "referenceCount" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchemeCaseRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProfessionalCase" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "applicantUserId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "certificationApplicationId" UUID NOT NULL,
    "path" "CertificationJourneyPath" NOT NULL,
    "phase" "ProfessionalCasePhase" NOT NULL DEFAULT 'ELIGIBILITY',
    "prerequisitesAcknowledgedAt" TIMESTAMPTZ(3),
    "experienceMonths" INTEGER NOT NULL DEFAULT 0,
    "computedLevelCode" VARCHAR(32),
    "examResultId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "ProfessionalCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EducationCompletionDocument" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "enrolmentId" UUID NOT NULL,
    "holderUserId" UUID NOT NULL,
    "publicUid" VARCHAR(32) NOT NULL,
    "courseTitle" VARCHAR(256) NOT NULL,
    "participationSeconds" INTEGER NOT NULL,
    "statement" TEXT NOT NULL,
    "issuedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EducationCompletionDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExamPassAttestation" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "resultId" UUID NOT NULL,
    "holderUserId" UUID NOT NULL,
    "publicUid" VARCHAR(32) NOT NULL,
    "state" "AttestationState" NOT NULL,
    "examTitle" VARCHAR(256) NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "autoIssued" BOOLEAN NOT NULL,
    "statement" TEXT NOT NULL,
    "issuedAt" TIMESTAMPTZ(3),
    "reviewedByUserId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamPassAttestation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseEvidenceItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "kind" "CaseEvidenceKind" NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "objectKey" VARCHAR(512),
    "summary" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseEvidenceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefereeConfirmation" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "refereeName" VARCHAR(256) NOT NULL,
    "organization" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "state" "RefereeLinkState" NOT NULL DEFAULT 'PENDING',
    "requestedFacts" TEXT NOT NULL,
    "confirmedFacts" TEXT,
    "discrepancies" TEXT,
    "confirmedAt" TIMESTAMPTZ(3),
    "relevanceNote" TEXT,
    "credible" BOOLEAN,
    "assessedByUserId" UUID,
    "assessedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefereeConfirmation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MessageOutbox" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "toAddress" VARCHAR(256) NOT NULL,
    "subject" VARCHAR(256) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'LOGGED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageOutbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommitteeProposal" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "state" "CommitteeSlotState" NOT NULL,
    "exclusionReason" VARCHAR(64),
    "confirmedByUserId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommitteeProposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommitteeAssessment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "memberUserId" UUID NOT NULL,
    "ballot" "CommitteeBallot" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommitteeAssessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IssuanceAuthorization" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "authorisedByUserId" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "authorisedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IssuanceAuthorization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiCaseSuggestion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "purpose" VARCHAR(64) NOT NULL,
    "suggestion" TEXT NOT NULL,
    "model" VARCHAR(64) NOT NULL,
    "promptHash" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiCaseSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchemeLevelCriterion_tenantId_id_key" ON "SchemeLevelCriterion"("tenantId", "id");
CREATE UNIQUE INDEX "SchemeLevelCriterion_tenantId_schemeVersionId_code_key" ON "SchemeLevelCriterion"("tenantId", "schemeVersionId", "code");
CREATE UNIQUE INDEX "SchemeDecisionMaker_tenantId_id_key" ON "SchemeDecisionMaker"("tenantId", "id");
CREATE UNIQUE INDEX "SchemeDecisionMaker_tenantId_schemeVersionId_userId_key" ON "SchemeDecisionMaker"("tenantId", "schemeVersionId", "userId");
CREATE UNIQUE INDEX "SchemeCaseRule_tenantId_id_key" ON "SchemeCaseRule"("tenantId", "id");
CREATE UNIQUE INDEX "SchemeCaseRule_tenantId_schemeVersionId_key" ON "SchemeCaseRule"("tenantId", "schemeVersionId");
CREATE UNIQUE INDEX "ProfessionalCase_tenantId_id_key" ON "ProfessionalCase"("tenantId", "id");
CREATE INDEX "ProfessionalCase_tenantId_applicantUserId_phase_idx" ON "ProfessionalCase"("tenantId", "applicantUserId", "phase");
CREATE UNIQUE INDEX "EducationCompletionDocument_publicUid_key" ON "EducationCompletionDocument"("publicUid");
CREATE UNIQUE INDEX "EducationCompletionDocument_tenantId_id_key" ON "EducationCompletionDocument"("tenantId", "id");
CREATE UNIQUE INDEX "EducationCompletionDocument_tenantId_enrolmentId_key" ON "EducationCompletionDocument"("tenantId", "enrolmentId");
CREATE UNIQUE INDEX "ExamPassAttestation_publicUid_key" ON "ExamPassAttestation"("publicUid");
CREATE UNIQUE INDEX "ExamPassAttestation_tenantId_id_key" ON "ExamPassAttestation"("tenantId", "id");
CREATE UNIQUE INDEX "ExamPassAttestation_tenantId_resultId_key" ON "ExamPassAttestation"("tenantId", "resultId");
CREATE UNIQUE INDEX "CaseEvidenceItem_tenantId_id_key" ON "CaseEvidenceItem"("tenantId", "id");
CREATE INDEX "CaseEvidenceItem_tenantId_caseId_idx" ON "CaseEvidenceItem"("tenantId", "caseId");
CREATE UNIQUE INDEX "RefereeConfirmation_tokenHash_key" ON "RefereeConfirmation"("tokenHash");
CREATE UNIQUE INDEX "RefereeConfirmation_tenantId_id_key" ON "RefereeConfirmation"("tenantId", "id");
CREATE INDEX "RefereeConfirmation_tenantId_caseId_idx" ON "RefereeConfirmation"("tenantId", "caseId");
CREATE UNIQUE INDEX "MessageOutbox_tenantId_id_key" ON "MessageOutbox"("tenantId", "id");
CREATE UNIQUE INDEX "CommitteeProposal_tenantId_id_key" ON "CommitteeProposal"("tenantId", "id");
CREATE UNIQUE INDEX "CommitteeProposal_tenantId_caseId_userId_key" ON "CommitteeProposal"("tenantId", "caseId", "userId");
CREATE UNIQUE INDEX "CommitteeAssessment_tenantId_id_key" ON "CommitteeAssessment"("tenantId", "id");
CREATE UNIQUE INDEX "CommitteeAssessment_tenantId_caseId_memberUserId_key" ON "CommitteeAssessment"("tenantId", "caseId", "memberUserId");
CREATE UNIQUE INDEX "IssuanceAuthorization_tenantId_id_key" ON "IssuanceAuthorization"("tenantId", "id");
CREATE UNIQUE INDEX "IssuanceAuthorization_tenantId_caseId_key" ON "IssuanceAuthorization"("tenantId", "caseId");
CREATE UNIQUE INDEX "AiCaseSuggestion_tenantId_id_key" ON "AiCaseSuggestion"("tenantId", "id");
CREATE INDEX "AiCaseSuggestion_tenantId_caseId_idx" ON "AiCaseSuggestion"("tenantId", "caseId");

-- AddForeignKey
ALTER TABLE "SchemeLevelCriterion" ADD CONSTRAINT "SchemeLevelCriterion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeLevelCriterion" ADD CONSTRAINT "SchemeLevelCriterion_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeDecisionMaker" ADD CONSTRAINT "SchemeDecisionMaker_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeDecisionMaker" ADD CONSTRAINT "SchemeDecisionMaker_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeDecisionMaker" ADD CONSTRAINT "SchemeDecisionMaker_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeCaseRule" ADD CONSTRAINT "SchemeCaseRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeCaseRule" ADD CONSTRAINT "SchemeCaseRule_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalCase" ADD CONSTRAINT "ProfessionalCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalCase" ADD CONSTRAINT "ProfessionalCase_tenantId_applicantUserId_fkey" FOREIGN KEY ("tenantId", "applicantUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalCase" ADD CONSTRAINT "ProfessionalCase_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EducationCompletionDocument" ADD CONSTRAINT "EducationCompletionDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EducationCompletionDocument" ADD CONSTRAINT "EducationCompletionDocument_tenantId_enrolmentId_fkey" FOREIGN KEY ("tenantId", "enrolmentId") REFERENCES "Enrolment"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EducationCompletionDocument" ADD CONSTRAINT "EducationCompletionDocument_tenantId_holderUserId_fkey" FOREIGN KEY ("tenantId", "holderUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamPassAttestation" ADD CONSTRAINT "ExamPassAttestation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamPassAttestation" ADD CONSTRAINT "ExamPassAttestation_tenantId_resultId_fkey" FOREIGN KEY ("tenantId", "resultId") REFERENCES "CertificationExamResult"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamPassAttestation" ADD CONSTRAINT "ExamPassAttestation_tenantId_holderUserId_fkey" FOREIGN KEY ("tenantId", "holderUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CaseEvidenceItem" ADD CONSTRAINT "CaseEvidenceItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CaseEvidenceItem" ADD CONSTRAINT "CaseEvidenceItem_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RefereeConfirmation" ADD CONSTRAINT "RefereeConfirmation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RefereeConfirmation" ADD CONSTRAINT "RefereeConfirmation_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MessageOutbox" ADD CONSTRAINT "MessageOutbox_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeProposal" ADD CONSTRAINT "CommitteeProposal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeProposal" ADD CONSTRAINT "CommitteeProposal_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeProposal" ADD CONSTRAINT "CommitteeProposal_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeAssessment" ADD CONSTRAINT "CommitteeAssessment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeAssessment" ADD CONSTRAINT "CommitteeAssessment_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeAssessment" ADD CONSTRAINT "CommitteeAssessment_tenantId_memberUserId_fkey" FOREIGN KEY ("tenantId", "memberUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IssuanceAuthorization" ADD CONSTRAINT "IssuanceAuthorization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IssuanceAuthorization" ADD CONSTRAINT "IssuanceAuthorization_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IssuanceAuthorization" ADD CONSTRAINT "IssuanceAuthorization_tenantId_authorisedByUserId_fkey" FOREIGN KEY ("tenantId", "authorisedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiCaseSuggestion" ADD CONSTRAINT "AiCaseSuggestion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiCaseSuggestion" ADD CONSTRAINT "AiCaseSuggestion_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
