/**
 * Wire JSON types aligned with FastAPI/Pydantic:
 * - GET  /api/admin/courses/{courseId}/structure  → CourseStructureResponse + optional quiz on lessons
 * - PUT  /api/admin/courses/{courseId}/curriculum → CurriculumPutBody
 *
 * Note: Public learner GET uses the same structure shape at /api/courses/{id}/structure with enrollment checks.
 */

/** Values persisted in DynamoDB / returned by API (typically lowercase). */
export type CurriculumContentTypeWire = "text" | "video" | "pdf" | "quiz" | string;

/** Normalized editor union (matches EditorContentType). */
export type CurriculumContentTypeNormalized = "text" | "video" | "pdf" | "quiz";

/** Parity view (A3): uppercase enum + collapsed body/URL — derived from wire, not sent to API as-is. */
export type LessonContentTypeParity = "TEXT" | "VIDEO" | "PDF" | "QUIZ";

/** A3 lesson shape (UI parity); map from {@link CourseStructureLessonJson} via {@link lessonJsonToParity}. */
export interface LessonParity {
  lessonId: string;
  title: string;
  orderIndex: number;
  contentType: LessonContentTypeParity;
  contentBody: string | null;
  mediaUrl: string | null;
}

/** A3 module parity (GET-shaped). PUT koristi {@link CurriculumPutModule}. */
export interface ModuleParity {
  moduleId: string;
  title: string;
  orderIndex: number;
  lessons: LessonParity[];
}

export type CourseStructureQuizAnswerJson = {
  readonly id: string;
  readonly label: string;
};

export type CourseStructureQuizQuestionJson = {
  readonly id: string;
  readonly type?: string;
  readonly prompt?: string;
  readonly answers?: readonly CourseStructureQuizAnswerJson[];
  readonly correctAnswerId?: string | null;
};

export type CourseStructureQuizJson = {
  readonly questions?: readonly CourseStructureQuizQuestionJson[];
};

/**
 * Lesson row as returned by GET structure (LessonOut) plus optional `quiz` injected by admin route.
 */
export type CourseStructureLessonJson = {
  readonly lessonId: string;
  readonly title: string;
  readonly contentType: string;
  readonly orderIndex: number;
  readonly isMandatory?: boolean;
  readonly estimatedMinutes?: number;
  readonly contentUrl?: string | null;
  readonly htmlBody?: string | null;
  readonly thumbnailUrl?: string | null;
  readonly isAIGenerated?: boolean;
  readonly aiContentApproved?: boolean;
  readonly pendingAiReview?: boolean;
  readonly quiz?: CourseStructureQuizJson | null;
  readonly captionsUrl?: string | null;
  readonly captionsInline?: string | null;
  readonly transcriptUrl?: string | null;
  readonly transcriptInline?: string | null;
  readonly transcriptIsAiGenerated?: boolean;
  readonly embedCaptionAttestation?: {
    readonly attestedAt?: string | null;
    readonly attestedBy?: string | null;
    readonly attestationExpiresAt?: string | null;
    readonly captionLanguages?: readonly string[];
  } | null;
};

export type CourseStructureModuleJson = {
  readonly moduleId: string;
  readonly title: string;
  readonly orderIndex: number;
  readonly hasQuiz?: boolean;
  readonly lessons: readonly CourseStructureLessonJson[];
};

/** Opcionalna konfiguracija certifikata (Dynamo course zapis). */
export type CertificatePdfFieldMappingWire = {
  readonly fullName?: string;
  readonly courseName?: string;
  readonly certificateNumber?: string;
  readonly qrCode?: string;
  readonly issuedAt?: string;
  readonly expiresAt?: string;
};

export type ExamPassPdfFieldMappingWire = {
  readonly documentTitle?: string;
  readonly fullName?: string;
  readonly courseName?: string;
  readonly examDate?: string;
  readonly issueDate?: string;
  readonly score?: string;
  readonly certificateNumber?: string;
  readonly qrCode?: string;
  readonly digitalSignatureHash?: string;
};

export type PersonCertificationPdfFieldMappingWire = {
  readonly fullName?: string;
  readonly certificationScheme?: string;
  readonly certificationLevel?: string;
  readonly issueDate?: string;
  readonly expiryDate?: string;
  readonly certificateNumber?: string;
  readonly qrCode?: string;
  readonly digitalSignatureHash?: string;
};

export type CertificationLevelTemplateWire = {
  readonly certificateTemplatePdfUrl?: string;
  readonly pdfFieldMapping?: PersonCertificationPdfFieldMappingWire | null;
};

export type CertificateConfigWire = {
  readonly certTitle?: string;
  readonly certStatement?: string;
  readonly authorityName?: string;
  readonly authorityTitle?: string;
  readonly validityYears?: number;
  readonly certificateNumberPrefix?: string;
  readonly certificateTemplatePdfUrl?: string;
  readonly pdfFieldMapping?: CertificatePdfFieldMappingWire | null;
  readonly verificationBaseUrl?: string;
  readonly examPassCertificateDesigner?: {
    readonly includeScore?: boolean;
    readonly certificateTemplatePdfUrl?: string;
    readonly pdfFieldMapping?: ExamPassPdfFieldMappingWire | null;
  } | null;
  readonly personCertificationCertificateDesigner?: {
    readonly schemeDisplayLabel?: string;
    readonly certificateTemplatePdfUrl?: string;
    readonly pdfFieldMapping?: PersonCertificationPdfFieldMappingWire | null;
    readonly levelTemplates?: Record<string, CertificationLevelTemplateWire> | null;
  } | null;
};

/** Proširenje GET strukture — polja iz courses tabele (admin). */
export type CourseMetaWire = {
  readonly slug?: string;
  readonly domain?: string | null;
  readonly categorySlug?: string | null;
  readonly price?: number;
  readonly currency?: string;
  readonly level?: string;
  readonly thumbnailUrl?: string | null;
  readonly heroBannerUrl?: string | null;
  readonly description?: string | null;
  readonly subtitle?: string | null;
  readonly status?: string;
  readonly isCertifiable?: boolean;
  readonly leadsToCertification?: boolean;
  readonly autoIssueExamPassCertificate?: boolean;
  readonly hasFinalExam?: boolean;
  readonly learningGoals?: readonly string[];
  readonly examQuestionCount?: number | null;
  readonly passingScorePct?: number | null;
  readonly examAttemptsAllowed?: number | null;
  readonly examTimeLimitMinutes?: number | null;
  readonly examCooldownHours?: number | null;
  readonly examIdentityCheckRequired?: boolean;
  readonly examRequireMfa?: boolean;
  readonly examRandomOrder?: boolean;
  readonly examShowResults?: boolean;
  readonly certificationSchemeReference?: string | null;
  readonly certificationLevelsEnabled?: readonly string[];
  readonly committeeDecisionRequired?: boolean;
  readonly courseRecertificationCycleMonths?: number | null;
  readonly technicalCommitteeValidated?: boolean;
  readonly technicalCommitteeValidatedAt?: string | null;
  readonly technicalCommitteeValidatedBy?: string | null;
  readonly technicalCommitteeValidationNotes?: string | null;
};

/** GET /api/admin/courses/{courseId}/structure */
export type AdminCourseStructureResponse = {
  readonly courseId: string;
  readonly title: string;
  readonly modules: readonly CourseStructureModuleJson[];
  readonly certificateConfig?: CertificateConfigWire | null;
  readonly courseMeta?: CourseMetaWire | null;
};

/* ——— PUT body (CurriculumPutBody + nested) ——— */

export type CurriculumPutQuizAnswer = {
  id: string;
  label: string;
};

export type CurriculumPutQuizQuestion = {
  id: string;
  type?: string;
  prompt?: string;
  answers: CurriculumPutQuizAnswer[];
  correctAnswerId?: string | null;
};

export type CurriculumPutQuiz = {
  questions: CurriculumPutQuizQuestion[];
};

export type CurriculumPutLesson = {
  id: string;
  moduleId: string;
  title: string;
  contentType: string;
  durationMinutes: number;
  required: boolean;
  htmlBody: string;
  videoUrl: string;
  pdfUrl: string;
  captionsUrl?: string;
  captionsInline?: string;
  transcriptUrl?: string;
  transcriptInline?: string;
  transcriptIsAiGenerated?: boolean;
  embedCaptionAttestation?: {
    attestedAt?: string | null;
    attestedBy?: string | null;
    attestationExpiresAt?: string | null;
    captionLanguages?: string[];
  } | null;
  quiz?: CurriculumPutQuiz;
};

export type CurriculumPutModule = {
  id: string;
  order: number;
  title: string;
  lessons: CurriculumPutLesson[];
};

/** PUT /api/admin/courses/{courseId}/curriculum */
export type CurriculumPutBody = {
  courseTitle?: string | null;
  modules: CurriculumPutModule[];
  certificateConfig?: CertificateConfigWire | null;
};

export function normalizeCurriculumContentType(raw: string): CurriculumContentTypeNormalized {
  const t = String(raw || "text").toLowerCase();
  if (t === "video") {
    return "video";
  }
  if (t === "pdf") {
    return "pdf";
  }
  if (t === "quiz") {
    return "quiz";
  }
  return "text";
}

function toParityType(ct: CurriculumContentTypeNormalized): LessonContentTypeParity {
  switch (ct) {
    case "video":
      return "VIDEO";
    case "pdf":
      return "PDF";
    case "quiz":
      return "QUIZ";
    default:
      return "TEXT";
  }
}

/** Maps API lesson JSON to the A3 parity shape (single body + media URL). */
export function lessonJsonToParity(les: CourseStructureLessonJson): LessonParity {
  const ct = normalizeCurriculumContentType(les.contentType);
  const html = les.htmlBody?.trim() ? les.htmlBody : null;
  const url = les.contentUrl?.trim() ? les.contentUrl : null;
  if (ct === "text" || ct === "quiz") {
    return {
      lessonId: les.lessonId,
      title: les.title,
      orderIndex: les.orderIndex,
      contentType: toParityType(ct),
      contentBody: html,
      mediaUrl: ct === "quiz" ? null : url,
    };
  }
  return {
    lessonId: les.lessonId,
    title: les.title,
    orderIndex: les.orderIndex,
    contentType: toParityType(ct),
    contentBody: html,
    mediaUrl: url,
  };
}

export function moduleJsonToParity(mod: CourseStructureModuleJson): ModuleParity {
  const lessons = [...mod.lessons].sort((a, b) => a.orderIndex - b.orderIndex).map(lessonJsonToParity);
  return {
    moduleId: mod.moduleId,
    title: mod.title,
    orderIndex: mod.orderIndex,
    lessons,
  };
}
