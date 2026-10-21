-- One live vote per member per case, and one live vote per composition version.
-- A voided ballot stays in history and does not occupy the live key.
ALTER TABLE "CommitteeAssessment" ADD COLUMN "compositionVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ProfessionalCase" ADD COLUMN "compositionVersion" INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX "CommitteeAssessment_one_live_vote_key"
  ON "CommitteeAssessment" ("tenantId", "caseId", "memberUserId")
  WHERE "voidedAt" IS NULL;

CREATE UNIQUE INDEX "CommitteeAssessment_live_vote_per_version_key"
  ON "CommitteeAssessment" ("tenantId", "caseId", "memberUserId", "compositionVersion")
  WHERE "voidedAt" IS NULL;

-- A new quorum writes a fresh decision. The earlier row is retained and marked superseded.
ALTER TABLE "ExamCertificationDecision" ADD COLUMN "supersededAt" TIMESTAMPTZ(3);
ALTER TABLE "ExamCertificationDecision" ADD COLUMN "supersedeReason" VARCHAR(64);
DROP INDEX "ExamCertificationDecision_tenantId_resultId_key";
CREATE INDEX "ExamCertificationDecision_tenantId_resultId_idx"
  ON "ExamCertificationDecision" ("tenantId", "resultId");
CREATE UNIQUE INDEX "ExamCertificationDecision_live_result_key"
  ON "ExamCertificationDecision" ("tenantId", "resultId")
  WHERE "supersededAt" IS NULL;

CREATE TYPE "SchemeCommitteeAuthorityKind" AS ENUM ('COMMITTEE_CHAIR', 'SCHEME_COMMITTEE_OVERSIGHT', 'CERTIFICATION_BODY_DEPUTY');
CREATE TYPE "CommitteeOfficeSide" AS ENUM ('CHAIR', 'OVERSIGHT');
CREATE TYPE "CompositionRequestStatus" AS ENUM ('PENDING', 'APPLIED');
CREATE TYPE "CertificationReviewStatus" AS ENUM ('OPEN', 'DECIDED');

CREATE TABLE "SchemeCommitteeAuthority" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "kind" "SchemeCommitteeAuthorityKind" NOT NULL,
    "documentRef" TEXT NOT NULL,
    "validFrom" TIMESTAMPTZ(3) NOT NULL,
    "validUntil" TIMESTAMPTZ(3) NOT NULL,
    "grantedByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchemeCommitteeAuthority_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommitteeCompositionRequest" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "proposedByUserId" UUID NOT NULL,
    "proposerSide" "CommitteeOfficeSide" NOT NULL,
    "reason" TEXT NOT NULL,
    "desiredKey" TEXT NOT NULL,
    "status" "CompositionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "grounds" TEXT,
    "recordedCoiReview" TEXT,
    "competenceReview" TEXT,
    "priorVoteImpact" TEXT,
    "approvedByUserId" UUID,
    "approverSide" "CommitteeOfficeSide",
    "proposedAt" TIMESTAMPTZ(3) NOT NULL,
    "approvedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommitteeCompositionRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CertificationBodyReview" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "credentialId" UUID,
    "status" "CertificationReviewStatus" NOT NULL DEFAULT 'OPEN',
    "statement" TEXT NOT NULL,
    "outcome" VARCHAR(64),
    "rationale" TEXT,
    "openedByUserId" UUID NOT NULL,
    "decidedByUserId" UUID,
    "openedAt" TIMESTAMPTZ(3) NOT NULL,
    "decidedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CertificationBodyReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchemeCommitteeAuthority_tenantId_id_key" ON "SchemeCommitteeAuthority"("tenantId", "id");
CREATE INDEX "SchemeCommitteeAuthority_tenantId_schemeId_kind_idx" ON "SchemeCommitteeAuthority"("tenantId", "schemeId", "kind");
CREATE UNIQUE INDEX "CommitteeCompositionRequest_tenantId_id_key" ON "CommitteeCompositionRequest"("tenantId", "id");
CREATE INDEX "CommitteeCompositionRequest_tenantId_caseId_status_idx" ON "CommitteeCompositionRequest"("tenantId", "caseId", "status");
CREATE UNIQUE INDEX "CertificationBodyReview_tenantId_id_key" ON "CertificationBodyReview"("tenantId", "id");
CREATE INDEX "CertificationBodyReview_tenantId_caseId_status_idx" ON "CertificationBodyReview"("tenantId", "caseId", "status");
CREATE UNIQUE INDEX "CertificationBodyReview_one_open_key"
  ON "CertificationBodyReview" ("tenantId", "caseId")
  WHERE "status" = 'OPEN';

ALTER TABLE "SchemeCommitteeAuthority" ADD CONSTRAINT "SchemeCommitteeAuthority_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeCommitteeAuthority" ADD CONSTRAINT "SchemeCommitteeAuthority_tenantId_schemeId_fkey" FOREIGN KEY ("tenantId", "schemeId") REFERENCES "CertificationScheme"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeCommitteeAuthority" ADD CONSTRAINT "SchemeCommitteeAuthority_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchemeCommitteeAuthority" ADD CONSTRAINT "SchemeCommitteeAuthority_tenantId_grantedByUserId_fkey" FOREIGN KEY ("tenantId", "grantedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CommitteeCompositionRequest" ADD CONSTRAINT "CommitteeCompositionRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeCompositionRequest" ADD CONSTRAINT "CommitteeCompositionRequest_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeCompositionRequest" ADD CONSTRAINT "CommitteeCompositionRequest_tenantId_proposedByUserId_fkey" FOREIGN KEY ("tenantId", "proposedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommitteeCompositionRequest" ADD CONSTRAINT "CommitteeCompositionRequest_tenantId_approvedByUserId_fkey" FOREIGN KEY ("tenantId", "approvedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CertificationBodyReview" ADD CONSTRAINT "CertificationBodyReview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CertificationBodyReview" ADD CONSTRAINT "CertificationBodyReview_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "ProfessionalCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CertificationBodyReview" ADD CONSTRAINT "CertificationBodyReview_tenantId_openedByUserId_fkey" FOREIGN KEY ("tenantId", "openedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CertificationBodyReview" ADD CONSTRAINT "CertificationBodyReview_tenantId_decidedByUserId_fkey" FOREIGN KEY ("tenantId", "decidedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
