-- Case version is checked inside the issuance transaction.
ALTER TABLE "ProfessionalCase" ADD COLUMN "caseVersion" INTEGER NOT NULL DEFAULT 1;

-- A confirmation belongs to the composition version that was current when it was recorded.
ALTER TABLE "CommitteeProposal" ADD COLUMN "compositionVersion" INTEGER NOT NULL DEFAULT 1;

-- The side that opened an issued-certificate or set-aside review.
ALTER TABLE "CertificationBodyReview" ADD COLUMN "openedSide" "CommitteeOfficeSide";
