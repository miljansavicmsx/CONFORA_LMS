-- CreateEnum
CREATE TYPE "CourseLifecycle" AS ENUM ('DRAFT', 'IN_TC_REVIEW', 'APPROVED', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "ContentBlockKind" AS ENUM ('PDF', 'VIDEO', 'TEXT');

-- CreateEnum
CREATE TYPE "CourseApprovalCapacity" AS ENUM ('TECHNICAL_COMMITTEE', 'DIRECTOR');

-- CreateEnum
CREATE TYPE "ItemReviewState" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ItemReviewOutcome" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LearningObjectKind" AS ENUM ('COURSE', 'LESSON', 'QUIZ', 'EXAM', 'ITEM');

-- CreateEnum
CREATE TYPE "ExamFormLifecycle" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "IdentityVerificationState" AS ENUM ('UNVERIFIED', 'VERIFIED', 'REJECTED', 'ADDITIONAL_EVIDENCE_REQUESTED');

-- CreateEnum
CREATE TYPE "IdentityCheckMethod" AS ENUM ('HUMAN_VISUAL');

-- CreateEnum
CREATE TYPE "ExamDutyKind" AS ENUM ('EXAMINER', 'INVIGILATOR');

-- CreateEnum
CREATE TYPE "ExamAttemptLifecycle" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'INTERRUPTED', 'VOID');

-- CreateEnum
CREATE TYPE "ProctorSignalSource" AS ENUM ('HUMAN', 'AI');

-- CreateEnum
CREATE TYPE "ProctorSignalDisposition" AS ENUM ('DISMISSED', 'CONFIRMED_BY_INVIGILATOR');

-- CreateEnum
CREATE TYPE "CertificationPathway" AS ENUM ('CONFORA_TRAINING', 'EXTERNAL_EQUIVALENT');

-- CreateEnum
CREATE TYPE "SchemeVersionLifecycle" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "DecisionOutcome" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('ATTENDANCE', 'PERSONNEL');

-- CreateEnum
CREATE TYPE "CredentialLifecycle" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'WITHDRAWN', 'SCOPE_REDUCED');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'WITHDRAWN', 'SCOPE_REDUCED', 'NOT_FOUND');

-- CreateEnum
CREATE TYPE "RecertificationLifecycle" AS ENUM ('REQUESTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentLifecycle" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MembershipLifecycle" AS ENUM ('DUE', 'PAID', 'PROPOSAL_PENDING', 'SUSPENDED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SuspensionProposalLifecycle" AS ENUM ('PROPOSED', 'CONFIRMED', 'REJECTED', 'WITHDRAWN_AFTER_DEADLINE');

-- CreateEnum
CREATE TYPE "DocumentLifecycle" AS ENUM ('DRAFT', 'APPROVED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "RiskBand" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "InternalAuditLifecycle" AS ENUM ('PLANNED', 'IN_PROGRESS', 'REPORTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CorrectiveActionLifecycle" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "AiSuggestionLifecycle" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AiReviewOutcome" AS ENUM ('ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StaffDeclarationKind" AS ENUM ('CONFIDENTIALITY', 'IMPARTIALITY');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "givenName" VARCHAR(128) NOT NULL,
    "familyName" VARCHAR(128) NOT NULL,
    "nationalIdNumber" VARCHAR(32),
    "phone" VARCHAR(32),
    "jobTitle" VARCHAR(128),
    "organizationName" VARCHAR(256),
    "educationLevel" VARCHAR(128),
    "identityVerificationState" "IdentityVerificationState" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccessibilityNeed" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "needCode" VARCHAR(64) NOT NULL,
    "extraTimePercent" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserAccessibilityNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeMembership" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "canonicalCode" VARCHAR(64) NOT NULL,
    "committeeCode" VARCHAR(64) NOT NULL,
    "activeFrom" TIMESTAMPTZ(3) NOT NULL,
    "activeUntil" TIMESTAMPTZ(3),
    "appointedByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CommitteeMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakGlassAccess" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "scopeLabel" VARCHAR(128) NOT NULL,
    "ticketRef" VARCHAR(128) NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "endedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreakGlassAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffDeclaration" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "kind" "StaffDeclarationKind" NOT NULL,
    "signedAt" TIMESTAMPTZ(3) NOT NULL,
    "documentVersionRef" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competence" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "statement" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Competence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProficiencyLevel" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "competenceId" UUID NOT NULL,
    "levelCode" VARCHAR(32) NOT NULL,
    "descriptor" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProficiencyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "description" TEXT NOT NULL,
    "areaCode" VARCHAR(64) NOT NULL,
    "imageObjectKey" VARCHAR(512),
    "language" VARCHAR(16) NOT NULL,
    "educationalLevel" VARCHAR(64),
    "targetAudience" TEXT,
    "typicalLearningTimeMinutes" INTEGER,
    "learningObjectives" TEXT,
    "standardReference" VARCHAR(128),
    "priceAmount" DECIMAL(12,2) NOT NULL,
    "priceCurrency" CHAR(3) NOT NULL,
    "requiresCertification" BOOLEAN NOT NULL DEFAULT false,
    "minimumTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "lifecycle" "CourseLifecycle" NOT NULL DEFAULT 'DRAFT',
    "authorUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseChapter" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "minimumTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CourseChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLesson" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "chapterId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "minimumTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "kind" "ContentBlockKind" NOT NULL,
    "title" VARCHAR(256),
    "textBody" TEXT,
    "objectKey" VARCHAR(512),
    "accessibilityFeatures" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseApproval" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "approverUserId" UUID NOT NULL,
    "capacity" "CourseApprovalCapacity" NOT NULL,
    "approvedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrolment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "enrolledAt" TIMESTAMPTZ(3) NOT NULL,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Enrolment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrolmentTrainer" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "enrolmentId" UUID NOT NULL,
    "trainerUserId" UUID NOT NULL,
    "assignedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrolmentTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "enrolmentId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningActivityRecord" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "statementId" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "verbIri" VARCHAR(256) NOT NULL,
    "objectKind" "LearningObjectKind" NOT NULL,
    "objectId" UUID NOT NULL,
    "resultScoreScaled" DECIMAL(6,5),
    "resultSuccess" BOOLEAN,
    "resultDurationIso" VARCHAR(32),
    "storedAt" TIMESTAMPTZ(3) NOT NULL,
    "rawStatement" JSONB NOT NULL,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningActivityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemScenarioGroup" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "narrative" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ItemScenarioGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemScenarioMembership" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemScenarioMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "stem" TEXT NOT NULL,
    "correctChoiceKey" VARCHAR(16) NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,
    "reviewState" "ItemReviewState" NOT NULL DEFAULT 'DRAFT',
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AssessmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentItemChoice" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "choiceKey" VARCHAR(16) NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AssessmentItemChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentItemCompetence" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "competenceId" UUID NOT NULL,
    "proficiencyLevelId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentItemCompetence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemReview" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "outcome" "ItemReviewOutcome" NOT NULL,
    "note" TEXT,
    "reviewedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "chapterId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "passMarkPercent" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamForm" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "shuffleItems" BOOLEAN NOT NULL DEFAULT true,
    "shuffleChoices" BOOLEAN NOT NULL DEFAULT true,
    "durationSeconds" INTEGER NOT NULL,
    "retakeWindowDays" INTEGER NOT NULL DEFAULT 90,
    "lifecycle" "ExamFormLifecycle" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExamForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamFormItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examFormId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamFormItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamFormCourse" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examFormId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamFormCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamFormScheme" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examFormId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamFormScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityCheck" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "subjectUserId" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "method" "IdentityCheckMethod" NOT NULL DEFAULT 'HUMAN_VISUAL',
    "outcome" "IdentityVerificationState" NOT NULL,
    "idImageObjectKey" VARCHAR(512),
    "candidateImageObjectKey" VARCHAR(512),
    "dpiaReference" VARCHAR(128),
    "checkedAt" TIMESTAMPTZ(3) NOT NULL,
    "retainUntil" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSession" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examFormId" UUID NOT NULL,
    "candidateUserId" UUID NOT NULL,
    "invigilatorUserId" UUID NOT NULL,
    "identityCheckId" UUID NOT NULL,
    "rulesAcceptedAt" TIMESTAMPTZ(3) NOT NULL,
    "ndaAcceptedAt" TIMESTAMPTZ(3) NOT NULL,
    "mfaReference" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamDutyAssignment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "duty" "ExamDutyKind" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamDutyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "lifecycle" "ExamAttemptLifecycle" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "submittedAt" TIMESTAMPTZ(3),
    "scorePercent" INTEGER,
    "passed" BOOLEAN,
    "nextEligibleAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttemptAnswer" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "selectedChoiceKey" VARCHAR(16) NOT NULL,
    "answeredAt" TIMESTAMPTZ(3) NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamAttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProctorSignal" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "source" "ProctorSignalSource" NOT NULL,
    "signalCode" VARCHAR(64) NOT NULL,
    "recordedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProctorSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProctorSignalReview" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "signalId" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "disposition" "ProctorSignalDisposition" NOT NULL,
    "reviewedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProctorSignalReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationScheme" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CertificationScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationSchemeVersion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeId" UUID NOT NULL,
    "versionLabel" VARCHAR(32) NOT NULL,
    "scopeDescription" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "experienceRequirement" TEXT NOT NULL,
    "prerequisites" TEXT NOT NULL,
    "abilitiesSummary" TEXT NOT NULL,
    "ethicsCodeRef" VARCHAR(128),
    "refereeCount" INTEGER NOT NULL DEFAULT 2,
    "publicProcessSummary" TEXT NOT NULL,
    "surveillanceSummary" TEXT,
    "recertificationSummary" TEXT,
    "limitationsTemplate" TEXT,
    "lifecycle" "SchemeVersionLifecycle" NOT NULL DEFAULT 'DRAFT',
    "validFrom" TIMESTAMPTZ(3),
    "nextReviewAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CertificationSchemeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeCompetenceRequirement" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "competenceId" UUID NOT NULL,
    "proficiencyLevelId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemeCompetenceRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationApplicationDetail" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "certificationApplicationId" UUID NOT NULL,
    "applicantUserId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "pathway" "CertificationPathway" NOT NULL,
    "biography" TEXT,
    "experienceSummary" TEXT,
    "publicWorksUrl" VARCHAR(512),
    "externalEvidenceObjectKey" VARCHAR(512),
    "rulesAcceptedAt" TIMESTAMPTZ(3),
    "contractAcceptedAt" TIMESTAMPTZ(3),
    "markUseAcceptedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CertificationApplicationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationExperience" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "detailId" UUID NOT NULL,
    "organizationName" VARCHAR(256) NOT NULL,
    "jobTitle" VARCHAR(128) NOT NULL,
    "startedOn" DATE NOT NULL,
    "endedOn" DATE,
    "summary" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationReferee" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "detailId" UUID NOT NULL,
    "givenName" VARCHAR(128) NOT NULL,
    "familyName" VARCHAR(128) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "invitedAt" TIMESTAMPTZ(3),
    "confirmedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationReferee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationDecision" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "detailId" UUID NOT NULL,
    "outcome" "DecisionOutcome" NOT NULL,
    "rationale" TEXT NOT NULL,
    "coiCleared" BOOLEAN NOT NULL,
    "decidedAt" TIMESTAMPTZ(3) NOT NULL,
    "chairUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificationDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionParticipant" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "decisionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "declaredConflict" BOOLEAN NOT NULL,
    "trainerOfCandidate" BOOLEAN NOT NULL,
    "examinesOwnTrainee" BOOLEAN NOT NULL,
    "cleared" BOOLEAN NOT NULL,
    "checkedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "holderUserId" UUID NOT NULL,
    "credentialType" "CredentialType" NOT NULL,
    "lifecycle" "CredentialLifecycle" NOT NULL DEFAULT 'ACTIVE',
    "publicUid" VARCHAR(32) NOT NULL,
    "payloadHash" CHAR(64) NOT NULL,
    "signature" TEXT,
    "qrVerifyToken" VARCHAR(128) NOT NULL,
    "scopeText" TEXT,
    "limitationsText" TEXT,
    "cbName" VARCHAR(256) NOT NULL,
    "cbIdentifier" VARCHAR(128) NOT NULL,
    "issuedAt" TIMESTAMPTZ(3) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceCredentialLink" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "credentialId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "enrolmentId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceCredentialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonnelCredentialLink" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "credentialId" UUID NOT NULL,
    "decisionId" UUID NOT NULL,
    "schemeVersionId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonnelCredentialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementRecord" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "credentialId" UUID NOT NULL,
    "achievementTitle" VARCHAR(256) NOT NULL,
    "holderName" VARCHAR(256) NOT NULL,
    "awardingBodyName" VARCHAR(256) NOT NULL,
    "awardingBodyIdentifier" VARCHAR(128) NOT NULL,
    "awardedAt" TIMESTAMPTZ(3) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3),
    "resultLabel" VARCHAR(128),
    "criteriaSummary" TEXT,
    "creditValue" DECIMAL(8,2),
    "language" VARCHAR(16) NOT NULL,
    "supplement" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AchievementRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialLifecycleEvent" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "credentialId" UUID NOT NULL,
    "fromLifecycle" "CredentialLifecycle",
    "toLifecycle" "CredentialLifecycle" NOT NULL,
    "reason" TEXT NOT NULL,
    "actorUserId" UUID NOT NULL,
    "effectiveAt" TIMESTAMPTZ(3) NOT NULL,
    "suspensionEndsAt" TIMESTAMPTZ(3),
    "withdrawalDueAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CredentialLifecycleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "credentialId" UUID NOT NULL,
    "publicUid" VARCHAR(32) NOT NULL,
    "sourceIp" VARCHAR(64) NOT NULL,
    "verifiedAt" TIMESTAMPTZ(3) NOT NULL,
    "result" "VerificationResult" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecertificationCase" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "credentialId" UUID NOT NULL,
    "applicantUserId" UUID NOT NULL,
    "lifecycle" "RecertificationLifecycle" NOT NULL DEFAULT 'REQUESTED',
    "requestedAt" TIMESTAMPTZ(3) NOT NULL,
    "requirementSummary" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RecertificationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecertificationOutcome" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "successorCredentialId" UUID NOT NULL,
    "completedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecertificationOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "number" VARCHAR(64) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "issuedAt" TIMESTAMPTZ(3) NOT NULL,
    "dueAt" TIMESTAMPTZ(3),
    "objectKey" VARCHAR(512),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "provider" VARCHAR(64) NOT NULL,
    "providerReference" VARCHAR(128) NOT NULL,
    "lifecycle" "PaymentLifecycle" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmfMembership" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "lifecycle" "MembershipLifecycle" NOT NULL DEFAULT 'DUE',
    "paidUntil" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AmfMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmfSuspensionProposal" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "membershipId" UUID NOT NULL,
    "proposedByUserId" UUID NOT NULL,
    "proposedAt" TIMESTAMPTZ(3) NOT NULL,
    "reasonCode" VARCHAR(64) NOT NULL,
    "lifecycle" "SuspensionProposalLifecycle" NOT NULL DEFAULT 'PROPOSED',
    "suspensionEndsAt" TIMESTAMPTZ(3),
    "withdrawalDueAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AmfSuspensionProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmfSuspensionConfirmation" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "confirmedByUserId" UUID NOT NULL,
    "confirmedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmfSuspensionConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlledDocument" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "documentKind" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ControlledDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "versionLabel" VARCHAR(32) NOT NULL,
    "objectKey" VARCHAR(512),
    "body" TEXT,
    "lifecycle" "DocumentLifecycle" NOT NULL DEFAULT 'DRAFT',
    "nextReviewAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentApproval" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "approvedByUserId" UUID NOT NULL,
    "approvedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskRecord" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "band" "RiskBand" NOT NULL,
    "mitigation" TEXT,
    "ownerUserId" UUID NOT NULL,
    "nextReviewAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RiskRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalAudit" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "scheduledAt" TIMESTAMPTZ(3) NOT NULL,
    "lifecycle" "InternalAuditLifecycle" NOT NULL DEFAULT 'PLANNED',
    "leadUserId" UUID NOT NULL,
    "reportObjectKey" VARCHAR(512),
    "minutesObjectKey" VARCHAR(512),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "InternalAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "requestText" TEXT NOT NULL,
    "rootCause" TEXT,
    "actionText" TEXT,
    "reportText" TEXT,
    "raisedByUserId" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "lifecycle" "CorrectiveActionLifecycle" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagementReview" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "heldAt" TIMESTAMPTZ(3) NOT NULL,
    "chairUserId" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "minutesObjectKey" VARCHAR(512),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ManagementReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpartialityReport" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "submittedAt" TIMESTAMPTZ(3) NOT NULL,
    "followUpTokenHash" CHAR(64),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpartialityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSystem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "purpose" TEXT NOT NULL,
    "modelIdentifier" VARCHAR(128) NOT NULL,
    "humanOversightRequired" BOOLEAN NOT NULL DEFAULT true,
    "aiiaReference" VARCHAR(128),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AiSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSuggestion" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "aiSystemId" UUID NOT NULL,
    "targetType" VARCHAR(64) NOT NULL,
    "targetId" UUID NOT NULL,
    "promptHash" CHAR(64) NOT NULL,
    "outputHash" CHAR(64) NOT NULL,
    "modelIdentifier" VARCHAR(128) NOT NULL,
    "lifecycle" "AiSuggestionLifecycle" NOT NULL DEFAULT 'PENDING',
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AiSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSuggestionReview" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "suggestionId" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "outcome" "AiReviewOutcome" NOT NULL,
    "reviewedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSuggestionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAuditRecord" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "aiSystemId" UUID NOT NULL,
    "actorUserId" UUID NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "modelIdentifier" VARCHAR(128) NOT NULL,
    "promptHash" CHAR(64) NOT NULL,
    "inputReference" VARCHAR(256) NOT NULL,
    "outputHash" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDisclosureAcknowledgement" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "aiSystemId" UUID NOT NULL,
    "noticeVersion" VARCHAR(32) NOT NULL,
    "acknowledgedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiDisclosureAcknowledgement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserProfile_tenantId_idx" ON "UserProfile"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_tenantId_id_key" ON "UserProfile"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_tenantId_userId_key" ON "UserProfile"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_tenantId_nationalIdNumber_key" ON "UserProfile"("tenantId", "nationalIdNumber");

-- CreateIndex
CREATE INDEX "UserAccessibilityNeed_tenantId_idx" ON "UserAccessibilityNeed"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccessibilityNeed_tenantId_id_key" ON "UserAccessibilityNeed"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccessibilityNeed_tenantId_userId_needCode_key" ON "UserAccessibilityNeed"("tenantId", "userId", "needCode");

-- CreateIndex
CREATE INDEX "CommitteeMembership_tenantId_canonicalCode_idx" ON "CommitteeMembership"("tenantId", "canonicalCode");

-- CreateIndex
CREATE INDEX "CommitteeMembership_tenantId_userId_idx" ON "CommitteeMembership"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMembership_tenantId_id_key" ON "CommitteeMembership"("tenantId", "id");

-- CreateIndex
CREATE INDEX "BreakGlassAccess_tenantId_actorUserId_startedAt_idx" ON "BreakGlassAccess"("tenantId", "actorUserId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BreakGlassAccess_tenantId_id_key" ON "BreakGlassAccess"("tenantId", "id");

-- CreateIndex
CREATE INDEX "StaffDeclaration_tenantId_userId_kind_idx" ON "StaffDeclaration"("tenantId", "userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "StaffDeclaration_tenantId_id_key" ON "StaffDeclaration"("tenantId", "id");

-- CreateIndex
CREATE INDEX "Competence_tenantId_idx" ON "Competence"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Competence_tenantId_id_key" ON "Competence"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Competence_tenantId_code_key" ON "Competence"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ProficiencyLevel_tenantId_idx" ON "ProficiencyLevel"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProficiencyLevel_tenantId_id_key" ON "ProficiencyLevel"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ProficiencyLevel_tenantId_competenceId_levelCode_key" ON "ProficiencyLevel"("tenantId", "competenceId", "levelCode");

-- CreateIndex
CREATE INDEX "Course_tenantId_areaCode_lifecycle_idx" ON "Course"("tenantId", "areaCode", "lifecycle");

-- CreateIndex
CREATE UNIQUE INDEX "Course_tenantId_id_key" ON "Course"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_tenantId_code_key" ON "Course"("tenantId", "code");

-- CreateIndex
CREATE INDEX "CourseChapter_tenantId_courseId_idx" ON "CourseChapter"("tenantId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseChapter_tenantId_id_key" ON "CourseChapter"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseChapter_tenantId_courseId_sequence_key" ON "CourseChapter"("tenantId", "courseId", "sequence");

-- CreateIndex
CREATE INDEX "CourseLesson_tenantId_chapterId_idx" ON "CourseLesson"("tenantId", "chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLesson_tenantId_id_key" ON "CourseLesson"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLesson_tenantId_chapterId_sequence_key" ON "CourseLesson"("tenantId", "chapterId", "sequence");

-- CreateIndex
CREATE INDEX "ContentBlock_tenantId_lessonId_idx" ON "ContentBlock"("tenantId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_tenantId_id_key" ON "ContentBlock"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_tenantId_lessonId_sequence_key" ON "ContentBlock"("tenantId", "lessonId", "sequence");

-- CreateIndex
CREATE INDEX "CourseApproval_tenantId_courseId_capacity_idx" ON "CourseApproval"("tenantId", "courseId", "capacity");

-- CreateIndex
CREATE UNIQUE INDEX "CourseApproval_tenantId_id_key" ON "CourseApproval"("tenantId", "id");

-- CreateIndex
CREATE INDEX "Enrolment_tenantId_userId_idx" ON "Enrolment"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrolment_tenantId_id_key" ON "Enrolment"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Enrolment_tenantId_userId_courseId_key" ON "Enrolment"("tenantId", "userId", "courseId");

-- CreateIndex
CREATE INDEX "EnrolmentTrainer_tenantId_trainerUserId_idx" ON "EnrolmentTrainer"("tenantId", "trainerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrolmentTrainer_tenantId_id_key" ON "EnrolmentTrainer"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "EnrolmentTrainer_tenantId_enrolmentId_key" ON "EnrolmentTrainer"("tenantId", "enrolmentId");

-- CreateIndex
CREATE INDEX "LessonProgress_tenantId_idx" ON "LessonProgress"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_tenantId_id_key" ON "LessonProgress"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_tenantId_enrolmentId_lessonId_key" ON "LessonProgress"("tenantId", "enrolmentId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningActivityRecord_statementId_key" ON "LearningActivityRecord"("statementId");

-- CreateIndex
CREATE INDEX "LearningActivityRecord_tenantId_actorUserId_storedAt_idx" ON "LearningActivityRecord"("tenantId", "actorUserId", "storedAt");

-- CreateIndex
CREATE INDEX "LearningActivityRecord_tenantId_objectKind_objectId_idx" ON "LearningActivityRecord"("tenantId", "objectKind", "objectId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningActivityRecord_tenantId_id_key" ON "LearningActivityRecord"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ItemScenarioGroup_tenantId_courseId_idx" ON "ItemScenarioGroup"("tenantId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemScenarioGroup_tenantId_id_key" ON "ItemScenarioGroup"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ItemScenarioMembership_tenantId_groupId_idx" ON "ItemScenarioMembership"("tenantId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemScenarioMembership_tenantId_id_key" ON "ItemScenarioMembership"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ItemScenarioMembership_tenantId_itemId_key" ON "ItemScenarioMembership"("tenantId", "itemId");

-- CreateIndex
CREATE INDEX "AssessmentItem_tenantId_courseId_reviewState_idx" ON "AssessmentItem"("tenantId", "courseId", "reviewState");

-- CreateIndex
CREATE INDEX "AssessmentItem_tenantId_isAiGenerated_idx" ON "AssessmentItem"("tenantId", "isAiGenerated");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentItem_tenantId_id_key" ON "AssessmentItem"("tenantId", "id");

-- CreateIndex
CREATE INDEX "AssessmentItemChoice_tenantId_idx" ON "AssessmentItemChoice"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentItemChoice_tenantId_id_key" ON "AssessmentItemChoice"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentItemChoice_tenantId_itemId_choiceKey_key" ON "AssessmentItemChoice"("tenantId", "itemId", "choiceKey");

-- CreateIndex
CREATE INDEX "AssessmentItemCompetence_tenantId_competenceId_idx" ON "AssessmentItemCompetence"("tenantId", "competenceId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentItemCompetence_tenantId_id_key" ON "AssessmentItemCompetence"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentItemCompetence_tenantId_itemId_competenceId_key" ON "AssessmentItemCompetence"("tenantId", "itemId", "competenceId");

-- CreateIndex
CREATE INDEX "ItemReview_tenantId_itemId_idx" ON "ItemReview"("tenantId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemReview_tenantId_id_key" ON "ItemReview"("tenantId", "id");

-- CreateIndex
CREATE INDEX "Quiz_tenantId_chapterId_idx" ON "Quiz"("tenantId", "chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_tenantId_id_key" ON "Quiz"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "QuizItem_tenantId_id_key" ON "QuizItem"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "QuizItem_tenantId_quizId_itemId_key" ON "QuizItem"("tenantId", "quizId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizItem_tenantId_quizId_sequence_key" ON "QuizItem"("tenantId", "quizId", "sequence");

-- CreateIndex
CREATE INDEX "ExamForm_tenantId_lifecycle_idx" ON "ExamForm"("tenantId", "lifecycle");

-- CreateIndex
CREATE UNIQUE INDEX "ExamForm_tenantId_id_key" ON "ExamForm"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormItem_tenantId_id_key" ON "ExamFormItem"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormItem_tenantId_examFormId_itemId_key" ON "ExamFormItem"("tenantId", "examFormId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormItem_tenantId_examFormId_sequence_key" ON "ExamFormItem"("tenantId", "examFormId", "sequence");

-- CreateIndex
CREATE INDEX "ExamFormCourse_tenantId_courseId_idx" ON "ExamFormCourse"("tenantId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormCourse_tenantId_id_key" ON "ExamFormCourse"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormCourse_tenantId_examFormId_key" ON "ExamFormCourse"("tenantId", "examFormId");

-- CreateIndex
CREATE INDEX "ExamFormScheme_tenantId_schemeVersionId_idx" ON "ExamFormScheme"("tenantId", "schemeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormScheme_tenantId_id_key" ON "ExamFormScheme"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamFormScheme_tenantId_examFormId_key" ON "ExamFormScheme"("tenantId", "examFormId");

-- CreateIndex
CREATE INDEX "IdentityCheck_tenantId_subjectUserId_idx" ON "IdentityCheck"("tenantId", "subjectUserId");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityCheck_tenantId_id_key" ON "IdentityCheck"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ExamSession_tenantId_candidateUserId_idx" ON "ExamSession"("tenantId", "candidateUserId");

-- CreateIndex
CREATE INDEX "ExamSession_tenantId_invigilatorUserId_idx" ON "ExamSession"("tenantId", "invigilatorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSession_tenantId_id_key" ON "ExamSession"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ExamDutyAssignment_tenantId_userId_duty_idx" ON "ExamDutyAssignment"("tenantId", "userId", "duty");

-- CreateIndex
CREATE UNIQUE INDEX "ExamDutyAssignment_tenantId_id_key" ON "ExamDutyAssignment"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamDutyAssignment_tenantId_sessionId_userId_duty_key" ON "ExamDutyAssignment"("tenantId", "sessionId", "userId", "duty");

-- CreateIndex
CREATE INDEX "ExamAttempt_tenantId_sessionId_idx" ON "ExamAttempt"("tenantId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAttempt_tenantId_id_key" ON "ExamAttempt"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAttemptAnswer_tenantId_id_key" ON "ExamAttemptAnswer"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAttemptAnswer_tenantId_attemptId_itemId_key" ON "ExamAttemptAnswer"("tenantId", "attemptId", "itemId");

-- CreateIndex
CREATE INDEX "ProctorSignal_tenantId_sessionId_recordedAt_idx" ON "ProctorSignal"("tenantId", "sessionId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProctorSignal_tenantId_id_key" ON "ProctorSignal"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ProctorSignalReview_tenantId_signalId_idx" ON "ProctorSignalReview"("tenantId", "signalId");

-- CreateIndex
CREATE UNIQUE INDEX "ProctorSignalReview_tenantId_id_key" ON "ProctorSignalReview"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationScheme_tenantId_id_key" ON "CertificationScheme"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationScheme_tenantId_code_key" ON "CertificationScheme"("tenantId", "code");

-- CreateIndex
CREATE INDEX "CertificationSchemeVersion_tenantId_lifecycle_idx" ON "CertificationSchemeVersion"("tenantId", "lifecycle");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationSchemeVersion_tenantId_id_key" ON "CertificationSchemeVersion"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationSchemeVersion_tenantId_schemeId_versionLabel_key" ON "CertificationSchemeVersion"("tenantId", "schemeId", "versionLabel");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeCompetenceRequirement_tenantId_id_key" ON "SchemeCompetenceRequirement"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeCompetenceRequirement_tenantId_schemeVersionId_compet_key" ON "SchemeCompetenceRequirement"("tenantId", "schemeVersionId", "competenceId");

-- CreateIndex
CREATE INDEX "CertificationApplicationDetail_tenantId_applicantUserId_idx" ON "CertificationApplicationDetail"("tenantId", "applicantUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationApplicationDetail_tenantId_id_key" ON "CertificationApplicationDetail"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationApplicationDetail_tenantId_certificationApplic_key" ON "CertificationApplicationDetail"("tenantId", "certificationApplicationId");

-- CreateIndex
CREATE INDEX "ApplicationExperience_tenantId_detailId_idx" ON "ApplicationExperience"("tenantId", "detailId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationExperience_tenantId_id_key" ON "ApplicationExperience"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ApplicationReferee_tenantId_detailId_idx" ON "ApplicationReferee"("tenantId", "detailId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationReferee_tenantId_id_key" ON "ApplicationReferee"("tenantId", "id");

-- CreateIndex
CREATE INDEX "CertificationDecision_tenantId_detailId_idx" ON "CertificationDecision"("tenantId", "detailId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationDecision_tenantId_id_key" ON "CertificationDecision"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionParticipant_tenantId_id_key" ON "DecisionParticipant"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionParticipant_tenantId_decisionId_userId_key" ON "DecisionParticipant"("tenantId", "decisionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_publicUid_key" ON "Credential"("publicUid");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_qrVerifyToken_key" ON "Credential"("qrVerifyToken");

-- CreateIndex
CREATE INDEX "Credential_tenantId_holderUserId_lifecycle_idx" ON "Credential"("tenantId", "holderUserId", "lifecycle");

-- CreateIndex
CREATE INDEX "Credential_tenantId_credentialType_idx" ON "Credential"("tenantId", "credentialType");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_tenantId_id_key" ON "Credential"("tenantId", "id");

-- CreateIndex
CREATE INDEX "AttendanceCredentialLink_tenantId_courseId_idx" ON "AttendanceCredentialLink"("tenantId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceCredentialLink_tenantId_id_key" ON "AttendanceCredentialLink"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceCredentialLink_tenantId_credentialId_key" ON "AttendanceCredentialLink"("tenantId", "credentialId");

-- CreateIndex
CREATE INDEX "PersonnelCredentialLink_tenantId_decisionId_idx" ON "PersonnelCredentialLink"("tenantId", "decisionId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonnelCredentialLink_tenantId_id_key" ON "PersonnelCredentialLink"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PersonnelCredentialLink_tenantId_credentialId_key" ON "PersonnelCredentialLink"("tenantId", "credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementRecord_tenantId_id_key" ON "AchievementRecord"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementRecord_tenantId_credentialId_key" ON "AchievementRecord"("tenantId", "credentialId");

-- CreateIndex
CREATE INDEX "CredentialLifecycleEvent_tenantId_credentialId_effectiveAt_idx" ON "CredentialLifecycleEvent"("tenantId", "credentialId", "effectiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "CredentialLifecycleEvent_tenantId_id_key" ON "CredentialLifecycleEvent"("tenantId", "id");

-- CreateIndex
CREATE INDEX "VerificationLog_tenantId_publicUid_verifiedAt_idx" ON "VerificationLog"("tenantId", "publicUid", "verifiedAt");

-- CreateIndex
CREATE INDEX "VerificationLog_tenantId_credentialId_idx" ON "VerificationLog"("tenantId", "credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationLog_tenantId_id_key" ON "VerificationLog"("tenantId", "id");

-- CreateIndex
CREATE INDEX "RecertificationCase_tenantId_credentialId_idx" ON "RecertificationCase"("tenantId", "credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "RecertificationCase_tenantId_id_key" ON "RecertificationCase"("tenantId", "id");

-- CreateIndex
CREATE INDEX "RecertificationOutcome_tenantId_successorCredentialId_idx" ON "RecertificationOutcome"("tenantId", "successorCredentialId");

-- CreateIndex
CREATE UNIQUE INDEX "RecertificationOutcome_tenantId_id_key" ON "RecertificationOutcome"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "RecertificationOutcome_tenantId_caseId_key" ON "RecertificationOutcome"("tenantId", "caseId");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_userId_idx" ON "Invoice"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_tenantId_id_key" ON "Invoice"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_tenantId_number_key" ON "Invoice"("tenantId", "number");

-- CreateIndex
CREATE INDEX "Payment_tenantId_invoiceId_idx" ON "Payment"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_provider_providerReference_idx" ON "Payment"("tenantId", "provider", "providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_tenantId_id_key" ON "Payment"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AmfMembership_tenantId_id_key" ON "AmfMembership"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AmfMembership_tenantId_userId_periodYear_key" ON "AmfMembership"("tenantId", "userId", "periodYear");

-- CreateIndex
CREATE INDEX "AmfSuspensionProposal_tenantId_membershipId_idx" ON "AmfSuspensionProposal"("tenantId", "membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "AmfSuspensionProposal_tenantId_id_key" ON "AmfSuspensionProposal"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AmfSuspensionConfirmation_tenantId_id_key" ON "AmfSuspensionConfirmation"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AmfSuspensionConfirmation_tenantId_proposalId_key" ON "AmfSuspensionConfirmation"("tenantId", "proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "ControlledDocument_tenantId_id_key" ON "ControlledDocument"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ControlledDocument_tenantId_code_key" ON "ControlledDocument"("tenantId", "code");

-- CreateIndex
CREATE INDEX "DocumentVersion_tenantId_nextReviewAt_idx" ON "DocumentVersion"("tenantId", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_tenantId_id_key" ON "DocumentVersion"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_tenantId_documentId_versionLabel_key" ON "DocumentVersion"("tenantId", "documentId", "versionLabel");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentApproval_tenantId_id_key" ON "DocumentApproval"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentApproval_tenantId_versionId_key" ON "DocumentApproval"("tenantId", "versionId");

-- CreateIndex
CREATE INDEX "RiskRecord_tenantId_band_idx" ON "RiskRecord"("tenantId", "band");

-- CreateIndex
CREATE UNIQUE INDEX "RiskRecord_tenantId_id_key" ON "RiskRecord"("tenantId", "id");

-- CreateIndex
CREATE INDEX "InternalAudit_tenantId_scheduledAt_idx" ON "InternalAudit"("tenantId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "InternalAudit_tenantId_id_key" ON "InternalAudit"("tenantId", "id");

-- CreateIndex
CREATE INDEX "CorrectiveAction_tenantId_lifecycle_idx" ON "CorrectiveAction"("tenantId", "lifecycle");

-- CreateIndex
CREATE UNIQUE INDEX "CorrectiveAction_tenantId_id_key" ON "CorrectiveAction"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ManagementReview_tenantId_heldAt_idx" ON "ManagementReview"("tenantId", "heldAt");

-- CreateIndex
CREATE UNIQUE INDEX "ManagementReview_tenantId_id_key" ON "ManagementReview"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ImpartialityReport_tenantId_submittedAt_idx" ON "ImpartialityReport"("tenantId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImpartialityReport_tenantId_id_key" ON "ImpartialityReport"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AiSystem_tenantId_id_key" ON "AiSystem"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AiSystem_tenantId_code_key" ON "AiSystem"("tenantId", "code");

-- CreateIndex
CREATE INDEX "AiSuggestion_tenantId_targetType_targetId_idx" ON "AiSuggestion"("tenantId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "AiSuggestion_tenantId_isAiGenerated_idx" ON "AiSuggestion"("tenantId", "isAiGenerated");

-- CreateIndex
CREATE UNIQUE INDEX "AiSuggestion_tenantId_id_key" ON "AiSuggestion"("tenantId", "id");

-- CreateIndex
CREATE INDEX "AiSuggestionReview_tenantId_suggestionId_idx" ON "AiSuggestionReview"("tenantId", "suggestionId");

-- CreateIndex
CREATE UNIQUE INDEX "AiSuggestionReview_tenantId_id_key" ON "AiSuggestionReview"("tenantId", "id");

-- CreateIndex
CREATE INDEX "AiAuditRecord_tenantId_occurredAt_idx" ON "AiAuditRecord"("tenantId", "occurredAt");

-- CreateIndex
CREATE INDEX "AiAuditRecord_tenantId_aiSystemId_idx" ON "AiAuditRecord"("tenantId", "aiSystemId");

-- CreateIndex
CREATE UNIQUE INDEX "AiAuditRecord_tenantId_id_key" ON "AiAuditRecord"("tenantId", "id");

-- CreateIndex
CREATE INDEX "AiDisclosureAcknowledgement_tenantId_userId_idx" ON "AiDisclosureAcknowledgement"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AiDisclosureAcknowledgement_tenantId_id_key" ON "AiDisclosureAcknowledgement"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AiDisclosureAcknowledgement_tenantId_userId_aiSystemId_noti_key" ON "AiDisclosureAcknowledgement"("tenantId", "userId", "aiSystemId", "noticeVersion");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccessibilityNeed" ADD CONSTRAINT "UserAccessibilityNeed_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccessibilityNeed" ADD CONSTRAINT "UserAccessibilityNeed_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_tenantId_appointedByUserId_fkey" FOREIGN KEY ("tenantId", "appointedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakGlassAccess" ADD CONSTRAINT "BreakGlassAccess_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakGlassAccess" ADD CONSTRAINT "BreakGlassAccess_tenantId_actorUserId_fkey" FOREIGN KEY ("tenantId", "actorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDeclaration" ADD CONSTRAINT "StaffDeclaration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDeclaration" ADD CONSTRAINT "StaffDeclaration_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competence" ADD CONSTRAINT "Competence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProficiencyLevel" ADD CONSTRAINT "ProficiencyLevel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProficiencyLevel" ADD CONSTRAINT "ProficiencyLevel_tenantId_competenceId_fkey" FOREIGN KEY ("tenantId", "competenceId") REFERENCES "Competence"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_tenantId_authorUserId_fkey" FOREIGN KEY ("tenantId", "authorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChapter" ADD CONSTRAINT "CourseChapter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChapter" ADD CONSTRAINT "CourseChapter_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "Course"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_tenantId_chapterId_fkey" FOREIGN KEY ("tenantId", "chapterId") REFERENCES "CourseChapter"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_tenantId_lessonId_fkey" FOREIGN KEY ("tenantId", "lessonId") REFERENCES "CourseLesson"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseApproval" ADD CONSTRAINT "CourseApproval_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseApproval" ADD CONSTRAINT "CourseApproval_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "Course"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseApproval" ADD CONSTRAINT "CourseApproval_tenantId_approverUserId_fkey" FOREIGN KEY ("tenantId", "approverUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "Course"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrolmentTrainer" ADD CONSTRAINT "EnrolmentTrainer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrolmentTrainer" ADD CONSTRAINT "EnrolmentTrainer_tenantId_enrolmentId_fkey" FOREIGN KEY ("tenantId", "enrolmentId") REFERENCES "Enrolment"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrolmentTrainer" ADD CONSTRAINT "EnrolmentTrainer_tenantId_trainerUserId_fkey" FOREIGN KEY ("tenantId", "trainerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_tenantId_enrolmentId_fkey" FOREIGN KEY ("tenantId", "enrolmentId") REFERENCES "Enrolment"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_tenantId_lessonId_fkey" FOREIGN KEY ("tenantId", "lessonId") REFERENCES "CourseLesson"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningActivityRecord" ADD CONSTRAINT "LearningActivityRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningActivityRecord" ADD CONSTRAINT "LearningActivityRecord_tenantId_actorUserId_fkey" FOREIGN KEY ("tenantId", "actorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemScenarioGroup" ADD CONSTRAINT "ItemScenarioGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemScenarioGroup" ADD CONSTRAINT "ItemScenarioGroup_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "Course"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemScenarioMembership" ADD CONSTRAINT "ItemScenarioMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemScenarioMembership" ADD CONSTRAINT "ItemScenarioMembership_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "AssessmentItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemScenarioMembership" ADD CONSTRAINT "ItemScenarioMembership_tenantId_groupId_fkey" FOREIGN KEY ("tenantId", "groupId") REFERENCES "ItemScenarioGroup"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItem" ADD CONSTRAINT "AssessmentItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItem" ADD CONSTRAINT "AssessmentItem_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "Course"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItemChoice" ADD CONSTRAINT "AssessmentItemChoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItemChoice" ADD CONSTRAINT "AssessmentItemChoice_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "AssessmentItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItemCompetence" ADD CONSTRAINT "AssessmentItemCompetence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItemCompetence" ADD CONSTRAINT "AssessmentItemCompetence_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "AssessmentItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItemCompetence" ADD CONSTRAINT "AssessmentItemCompetence_tenantId_competenceId_fkey" FOREIGN KEY ("tenantId", "competenceId") REFERENCES "Competence"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentItemCompetence" ADD CONSTRAINT "AssessmentItemCompetence_tenantId_proficiencyLevelId_fkey" FOREIGN KEY ("tenantId", "proficiencyLevelId") REFERENCES "ProficiencyLevel"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemReview" ADD CONSTRAINT "ItemReview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemReview" ADD CONSTRAINT "ItemReview_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "AssessmentItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemReview" ADD CONSTRAINT "ItemReview_tenantId_reviewerUserId_fkey" FOREIGN KEY ("tenantId", "reviewerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_tenantId_chapterId_fkey" FOREIGN KEY ("tenantId", "chapterId") REFERENCES "CourseChapter"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizItem" ADD CONSTRAINT "QuizItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizItem" ADD CONSTRAINT "QuizItem_tenantId_quizId_fkey" FOREIGN KEY ("tenantId", "quizId") REFERENCES "Quiz"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizItem" ADD CONSTRAINT "QuizItem_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "AssessmentItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamForm" ADD CONSTRAINT "ExamForm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormItem" ADD CONSTRAINT "ExamFormItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormItem" ADD CONSTRAINT "ExamFormItem_tenantId_examFormId_fkey" FOREIGN KEY ("tenantId", "examFormId") REFERENCES "ExamForm"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormItem" ADD CONSTRAINT "ExamFormItem_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "AssessmentItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormCourse" ADD CONSTRAINT "ExamFormCourse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormCourse" ADD CONSTRAINT "ExamFormCourse_tenantId_examFormId_fkey" FOREIGN KEY ("tenantId", "examFormId") REFERENCES "ExamForm"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormCourse" ADD CONSTRAINT "ExamFormCourse_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "Course"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormScheme" ADD CONSTRAINT "ExamFormScheme_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormScheme" ADD CONSTRAINT "ExamFormScheme_tenantId_examFormId_fkey" FOREIGN KEY ("tenantId", "examFormId") REFERENCES "ExamForm"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamFormScheme" ADD CONSTRAINT "ExamFormScheme_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityCheck" ADD CONSTRAINT "IdentityCheck_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityCheck" ADD CONSTRAINT "IdentityCheck_tenantId_subjectUserId_fkey" FOREIGN KEY ("tenantId", "subjectUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityCheck" ADD CONSTRAINT "IdentityCheck_tenantId_reviewerUserId_fkey" FOREIGN KEY ("tenantId", "reviewerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_tenantId_examFormId_fkey" FOREIGN KEY ("tenantId", "examFormId") REFERENCES "ExamForm"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_tenantId_candidateUserId_fkey" FOREIGN KEY ("tenantId", "candidateUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_tenantId_invigilatorUserId_fkey" FOREIGN KEY ("tenantId", "invigilatorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_tenantId_identityCheckId_fkey" FOREIGN KEY ("tenantId", "identityCheckId") REFERENCES "IdentityCheck"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamDutyAssignment" ADD CONSTRAINT "ExamDutyAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamDutyAssignment" ADD CONSTRAINT "ExamDutyAssignment_tenantId_sessionId_fkey" FOREIGN KEY ("tenantId", "sessionId") REFERENCES "ExamSession"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamDutyAssignment" ADD CONSTRAINT "ExamDutyAssignment_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_tenantId_sessionId_fkey" FOREIGN KEY ("tenantId", "sessionId") REFERENCES "ExamSession"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttemptAnswer" ADD CONSTRAINT "ExamAttemptAnswer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttemptAnswer" ADD CONSTRAINT "ExamAttemptAnswer_tenantId_attemptId_fkey" FOREIGN KEY ("tenantId", "attemptId") REFERENCES "ExamAttempt"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttemptAnswer" ADD CONSTRAINT "ExamAttemptAnswer_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "AssessmentItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctorSignal" ADD CONSTRAINT "ProctorSignal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctorSignal" ADD CONSTRAINT "ProctorSignal_tenantId_sessionId_fkey" FOREIGN KEY ("tenantId", "sessionId") REFERENCES "ExamSession"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctorSignalReview" ADD CONSTRAINT "ProctorSignalReview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctorSignalReview" ADD CONSTRAINT "ProctorSignalReview_tenantId_signalId_fkey" FOREIGN KEY ("tenantId", "signalId") REFERENCES "ProctorSignal"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctorSignalReview" ADD CONSTRAINT "ProctorSignalReview_tenantId_reviewerUserId_fkey" FOREIGN KEY ("tenantId", "reviewerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationScheme" ADD CONSTRAINT "CertificationScheme_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationSchemeVersion" ADD CONSTRAINT "CertificationSchemeVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationSchemeVersion" ADD CONSTRAINT "CertificationSchemeVersion_tenantId_schemeId_fkey" FOREIGN KEY ("tenantId", "schemeId") REFERENCES "CertificationScheme"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCompetenceRequirement" ADD CONSTRAINT "SchemeCompetenceRequirement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCompetenceRequirement" ADD CONSTRAINT "SchemeCompetenceRequirement_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCompetenceRequirement" ADD CONSTRAINT "SchemeCompetenceRequirement_tenantId_competenceId_fkey" FOREIGN KEY ("tenantId", "competenceId") REFERENCES "Competence"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeCompetenceRequirement" ADD CONSTRAINT "SchemeCompetenceRequirement_tenantId_proficiencyLevelId_fkey" FOREIGN KEY ("tenantId", "proficiencyLevelId") REFERENCES "ProficiencyLevel"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationApplicationDetail" ADD CONSTRAINT "CertificationApplicationDetail_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationApplicationDetail" ADD CONSTRAINT "CertificationApplicationDetail_tenantId_applicantUserId_fkey" FOREIGN KEY ("tenantId", "applicantUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationApplicationDetail" ADD CONSTRAINT "CertificationApplicationDetail_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationExperience" ADD CONSTRAINT "ApplicationExperience_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationExperience" ADD CONSTRAINT "ApplicationExperience_tenantId_detailId_fkey" FOREIGN KEY ("tenantId", "detailId") REFERENCES "CertificationApplicationDetail"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationReferee" ADD CONSTRAINT "ApplicationReferee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationReferee" ADD CONSTRAINT "ApplicationReferee_tenantId_detailId_fkey" FOREIGN KEY ("tenantId", "detailId") REFERENCES "CertificationApplicationDetail"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationDecision" ADD CONSTRAINT "CertificationDecision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationDecision" ADD CONSTRAINT "CertificationDecision_tenantId_detailId_fkey" FOREIGN KEY ("tenantId", "detailId") REFERENCES "CertificationApplicationDetail"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationDecision" ADD CONSTRAINT "CertificationDecision_tenantId_chairUserId_fkey" FOREIGN KEY ("tenantId", "chairUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionParticipant" ADD CONSTRAINT "DecisionParticipant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionParticipant" ADD CONSTRAINT "DecisionParticipant_tenantId_decisionId_fkey" FOREIGN KEY ("tenantId", "decisionId") REFERENCES "CertificationDecision"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionParticipant" ADD CONSTRAINT "DecisionParticipant_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_tenantId_holderUserId_fkey" FOREIGN KEY ("tenantId", "holderUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCredentialLink" ADD CONSTRAINT "AttendanceCredentialLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCredentialLink" ADD CONSTRAINT "AttendanceCredentialLink_tenantId_credentialId_fkey" FOREIGN KEY ("tenantId", "credentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCredentialLink" ADD CONSTRAINT "AttendanceCredentialLink_tenantId_courseId_fkey" FOREIGN KEY ("tenantId", "courseId") REFERENCES "Course"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCredentialLink" ADD CONSTRAINT "AttendanceCredentialLink_tenantId_enrolmentId_fkey" FOREIGN KEY ("tenantId", "enrolmentId") REFERENCES "Enrolment"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelCredentialLink" ADD CONSTRAINT "PersonnelCredentialLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelCredentialLink" ADD CONSTRAINT "PersonnelCredentialLink_tenantId_credentialId_fkey" FOREIGN KEY ("tenantId", "credentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelCredentialLink" ADD CONSTRAINT "PersonnelCredentialLink_tenantId_decisionId_fkey" FOREIGN KEY ("tenantId", "decisionId") REFERENCES "CertificationDecision"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelCredentialLink" ADD CONSTRAINT "PersonnelCredentialLink_tenantId_schemeVersionId_fkey" FOREIGN KEY ("tenantId", "schemeVersionId") REFERENCES "CertificationSchemeVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementRecord" ADD CONSTRAINT "AchievementRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementRecord" ADD CONSTRAINT "AchievementRecord_tenantId_credentialId_fkey" FOREIGN KEY ("tenantId", "credentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialLifecycleEvent" ADD CONSTRAINT "CredentialLifecycleEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialLifecycleEvent" ADD CONSTRAINT "CredentialLifecycleEvent_tenantId_credentialId_fkey" FOREIGN KEY ("tenantId", "credentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialLifecycleEvent" ADD CONSTRAINT "CredentialLifecycleEvent_tenantId_actorUserId_fkey" FOREIGN KEY ("tenantId", "actorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_tenantId_credentialId_fkey" FOREIGN KEY ("tenantId", "credentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecertificationCase" ADD CONSTRAINT "RecertificationCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecertificationCase" ADD CONSTRAINT "RecertificationCase_tenantId_credentialId_fkey" FOREIGN KEY ("tenantId", "credentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecertificationCase" ADD CONSTRAINT "RecertificationCase_tenantId_applicantUserId_fkey" FOREIGN KEY ("tenantId", "applicantUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecertificationOutcome" ADD CONSTRAINT "RecertificationOutcome_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecertificationOutcome" ADD CONSTRAINT "RecertificationOutcome_tenantId_caseId_fkey" FOREIGN KEY ("tenantId", "caseId") REFERENCES "RecertificationCase"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecertificationOutcome" ADD CONSTRAINT "RecertificationOutcome_tenantId_successorCredentialId_fkey" FOREIGN KEY ("tenantId", "successorCredentialId") REFERENCES "Credential"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_invoiceId_fkey" FOREIGN KEY ("tenantId", "invoiceId") REFERENCES "Invoice"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmfMembership" ADD CONSTRAINT "AmfMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmfMembership" ADD CONSTRAINT "AmfMembership_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmfSuspensionProposal" ADD CONSTRAINT "AmfSuspensionProposal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmfSuspensionProposal" ADD CONSTRAINT "AmfSuspensionProposal_tenantId_membershipId_fkey" FOREIGN KEY ("tenantId", "membershipId") REFERENCES "AmfMembership"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmfSuspensionProposal" ADD CONSTRAINT "AmfSuspensionProposal_tenantId_proposedByUserId_fkey" FOREIGN KEY ("tenantId", "proposedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmfSuspensionConfirmation" ADD CONSTRAINT "AmfSuspensionConfirmation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmfSuspensionConfirmation" ADD CONSTRAINT "AmfSuspensionConfirmation_tenantId_proposalId_fkey" FOREIGN KEY ("tenantId", "proposalId") REFERENCES "AmfSuspensionProposal"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmfSuspensionConfirmation" ADD CONSTRAINT "AmfSuspensionConfirmation_tenantId_confirmedByUserId_fkey" FOREIGN KEY ("tenantId", "confirmedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlledDocument" ADD CONSTRAINT "ControlledDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_tenantId_documentId_fkey" FOREIGN KEY ("tenantId", "documentId") REFERENCES "ControlledDocument"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApproval" ADD CONSTRAINT "DocumentApproval_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApproval" ADD CONSTRAINT "DocumentApproval_tenantId_versionId_fkey" FOREIGN KEY ("tenantId", "versionId") REFERENCES "DocumentVersion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApproval" ADD CONSTRAINT "DocumentApproval_tenantId_approvedByUserId_fkey" FOREIGN KEY ("tenantId", "approvedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskRecord" ADD CONSTRAINT "RiskRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskRecord" ADD CONSTRAINT "RiskRecord_tenantId_ownerUserId_fkey" FOREIGN KEY ("tenantId", "ownerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalAudit" ADD CONSTRAINT "InternalAudit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalAudit" ADD CONSTRAINT "InternalAudit_tenantId_leadUserId_fkey" FOREIGN KEY ("tenantId", "leadUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_tenantId_raisedByUserId_fkey" FOREIGN KEY ("tenantId", "raisedByUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_tenantId_ownerUserId_fkey" FOREIGN KEY ("tenantId", "ownerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReview" ADD CONSTRAINT "ManagementReview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReview" ADD CONSTRAINT "ManagementReview_tenantId_chairUserId_fkey" FOREIGN KEY ("tenantId", "chairUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpartialityReport" ADD CONSTRAINT "ImpartialityReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSystem" ADD CONSTRAINT "AiSystem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_tenantId_aiSystemId_fkey" FOREIGN KEY ("tenantId", "aiSystemId") REFERENCES "AiSystem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestionReview" ADD CONSTRAINT "AiSuggestionReview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestionReview" ADD CONSTRAINT "AiSuggestionReview_tenantId_suggestionId_fkey" FOREIGN KEY ("tenantId", "suggestionId") REFERENCES "AiSuggestion"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestionReview" ADD CONSTRAINT "AiSuggestionReview_tenantId_reviewerUserId_fkey" FOREIGN KEY ("tenantId", "reviewerUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAuditRecord" ADD CONSTRAINT "AiAuditRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAuditRecord" ADD CONSTRAINT "AiAuditRecord_tenantId_aiSystemId_fkey" FOREIGN KEY ("tenantId", "aiSystemId") REFERENCES "AiSystem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAuditRecord" ADD CONSTRAINT "AiAuditRecord_tenantId_actorUserId_fkey" FOREIGN KEY ("tenantId", "actorUserId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiDisclosureAcknowledgement" ADD CONSTRAINT "AiDisclosureAcknowledgement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiDisclosureAcknowledgement" ADD CONSTRAINT "AiDisclosureAcknowledgement_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiDisclosureAcknowledgement" ADD CONSTRAINT "AiDisclosureAcknowledgement_tenantId_aiSystemId_fkey" FOREIGN KEY ("tenantId", "aiSystemId") REFERENCES "AiSystem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "CertificationApplication_tenantId_applicantUserId_createdAt_id_" RENAME TO "CertificationApplication_tenantId_applicantUserId_createdAt_idx";

