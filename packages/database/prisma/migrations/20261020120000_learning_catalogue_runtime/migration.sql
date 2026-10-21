-- CreateEnum
CREATE TYPE "EnrolmentPaymentState" AS ENUM ('PENDING_PAYMENT', 'NOT_REQUIRED');

-- CreateTable
CREATE TABLE "EnrolmentPaymentIntent" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "enrolmentId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "state" "EnrolmentPaymentState" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrolmentPaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerAnalyticsConsent" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "decidedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "LearnerAnalyticsConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterQuizAttempt" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "enrolmentId" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterQuizAttemptAnswer" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "selectedChoiceKey" VARCHAR(16) NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterQuizAttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnrolmentPaymentIntent_tenantId_state_idx" ON "EnrolmentPaymentIntent"("tenantId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "EnrolmentPaymentIntent_tenantId_id_key" ON "EnrolmentPaymentIntent"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "EnrolmentPaymentIntent_tenantId_enrolmentId_key" ON "EnrolmentPaymentIntent"("tenantId", "enrolmentId");

-- CreateIndex
CREATE INDEX "LearnerAnalyticsConsent_tenantId_idx" ON "LearnerAnalyticsConsent"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerAnalyticsConsent_tenantId_id_key" ON "LearnerAnalyticsConsent"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerAnalyticsConsent_tenantId_userId_key" ON "LearnerAnalyticsConsent"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "ChapterQuizAttempt_tenantId_enrolmentId_quizId_idx" ON "ChapterQuizAttempt"("tenantId", "enrolmentId", "quizId");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterQuizAttempt_tenantId_id_key" ON "ChapterQuizAttempt"("tenantId", "id");

-- CreateIndex
CREATE INDEX "ChapterQuizAttemptAnswer_tenantId_idx" ON "ChapterQuizAttemptAnswer"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterQuizAttemptAnswer_tenantId_id_key" ON "ChapterQuizAttemptAnswer"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterQuizAttemptAnswer_tenantId_attemptId_itemId_key" ON "ChapterQuizAttemptAnswer"("tenantId", "attemptId", "itemId");

-- AddForeignKey
ALTER TABLE "EnrolmentPaymentIntent" ADD CONSTRAINT "EnrolmentPaymentIntent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrolmentPaymentIntent" ADD CONSTRAINT "EnrolmentPaymentIntent_tenantId_enrolmentId_fkey" FOREIGN KEY ("tenantId", "enrolmentId") REFERENCES "Enrolment"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerAnalyticsConsent" ADD CONSTRAINT "LearnerAnalyticsConsent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerAnalyticsConsent" ADD CONSTRAINT "LearnerAnalyticsConsent_tenantId_userId_fkey" FOREIGN KEY ("tenantId", "userId") REFERENCES "User"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterQuizAttempt" ADD CONSTRAINT "ChapterQuizAttempt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterQuizAttempt" ADD CONSTRAINT "ChapterQuizAttempt_tenantId_enrolmentId_fkey" FOREIGN KEY ("tenantId", "enrolmentId") REFERENCES "Enrolment"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterQuizAttempt" ADD CONSTRAINT "ChapterQuizAttempt_tenantId_quizId_fkey" FOREIGN KEY ("tenantId", "quizId") REFERENCES "Quiz"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterQuizAttemptAnswer" ADD CONSTRAINT "ChapterQuizAttemptAnswer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterQuizAttemptAnswer" ADD CONSTRAINT "ChapterQuizAttemptAnswer_tenantId_attemptId_fkey" FOREIGN KEY ("tenantId", "attemptId") REFERENCES "ChapterQuizAttempt"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterQuizAttemptAnswer" ADD CONSTRAINT "ChapterQuizAttemptAnswer_tenantId_itemId_fkey" FOREIGN KEY ("tenantId", "itemId") REFERENCES "AssessmentItem"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

