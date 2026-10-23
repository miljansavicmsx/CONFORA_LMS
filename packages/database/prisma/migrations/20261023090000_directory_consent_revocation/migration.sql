-- OD-DIR-33. Withdrawal keeps the registry row and the original consent timestamp.
-- A null revocation timestamp means the consent record has not been withdrawn.
ALTER TABLE "ExamPersonnelCredentialLink"
ADD COLUMN "registryConsentRevokedAt" TIMESTAMPTZ(3);
