import type {
  AdminCourseStructureResponse,
  CertificateConfigWire,
  CurriculumPutBody,
  CourseStructureQuizQuestionJson,
} from "@/admin/content-editor/curriculum-api-types";
import { normalizeCurriculumContentType } from "@/admin/content-editor/curriculum-api-types";
import type {
  CertificateConfigState,
  CertificatePdfFieldMappingState,
  CertificationLevelTemplateState,
  EditorContentType,
  ExamConfigState,
  ExamPassPdfFieldMappingState,
  EditorLesson,
  EditorModule,
  EditorQuizAnswer,
  EditorQuizConfig,
  EditorQuizQuestion,
  PersonCertificationPdfFieldMappingState,
} from "@/admin/content-editor/types";
import { generateId } from "@/admin/content-editor/generateId";

function emptyQuiz(): EditorQuizConfig {
  return {
    title: "Kviz znanja",
    questionCountTarget: 10,
    passingScorePct: 70,
    timeLimitMinutes: 30,
    maxAttempts: 3,
    questions: [],
  };
}

function normalizeEditorContentType(raw: string): EditorContentType {
  return normalizeCurriculumContentType(raw);
}

const emptyPdfMapping = (): CertificatePdfFieldMappingState => ({
  fullName: "",
  courseName: "",
  certificateNumber: "",
  qrCode: "",
  issuedAt: "",
  expiresAt: "",
});

const emptyExamPdfMapping = (): ExamPassPdfFieldMappingState => ({
  documentTitle: "",
  fullName: "",
  courseName: "",
  examDate: "",
  issueDate: "",
  score: "",
  certificateNumber: "",
  qrCode: "",
  digitalSignatureHash: "",
});

const emptyPersonPdfMapping = (): PersonCertificationPdfFieldMappingState => ({
  fullName: "",
  certificationScheme: "",
  certificationLevel: "",
  issueDate: "",
  expiryDate: "",
  certificateNumber: "",
  qrCode: "",
  digitalSignatureHash: "",
});

export function defaultCertificateConfig(): CertificateConfigState {
  return {
    certTitle: "",
    certStatement: "",
    authorityName: "",
    authorityTitle: "",
    validityYears: 3,
    certificateNumberPrefix: "",
    certificateTemplatePdfUrl: "",
    pdfFieldMapping: emptyPdfMapping(),
    verificationBaseUrl: "",
    examPassCertificateDesigner: {
      includeScore: true,
      certificateTemplatePdfUrl: "",
      pdfFieldMapping: emptyExamPdfMapping(),
    },
    personCertificationCertificateDesigner: {
      schemeDisplayLabel: "",
      certificateTemplatePdfUrl: "",
      pdfFieldMapping: emptyPersonPdfMapping(),
      levelTemplates: {},
    },
  };
}

function normalizePdfMappingWire(raw: CertificateConfigWire["pdfFieldMapping"]): CertificatePdfFieldMappingState {
  const r = raw ?? {};
  return {
    fullName: String(r.fullName ?? "").trim(),
    courseName: String(r.courseName ?? "").trim(),
    certificateNumber: String(r.certificateNumber ?? "").trim(),
    qrCode: String(r.qrCode ?? "").trim(),
    issuedAt: String(r.issuedAt ?? "").trim(),
    expiresAt: String(r.expiresAt ?? "").trim(),
  };
}

function normalizeExamPdfMappingWire(
  raw: NonNullable<CertificateConfigWire["examPassCertificateDesigner"]>["pdfFieldMapping"],
): ExamPassPdfFieldMappingState {
  const r = raw ?? {};
  return {
    documentTitle: String(r.documentTitle ?? "").trim(),
    fullName: String(r.fullName ?? "").trim(),
    courseName: String(r.courseName ?? "").trim(),
    examDate: String(r.examDate ?? "").trim(),
    issueDate: String(r.issueDate ?? "").trim(),
    score: String(r.score ?? "").trim(),
    certificateNumber: String(r.certificateNumber ?? "").trim(),
    qrCode: String(r.qrCode ?? "").trim(),
    digitalSignatureHash: String(r.digitalSignatureHash ?? "").trim(),
  };
}

function normalizePersonPdfMappingWire(
  raw: NonNullable<CertificateConfigWire["personCertificationCertificateDesigner"]>["pdfFieldMapping"],
): PersonCertificationPdfFieldMappingState {
  const r = raw ?? {};
  return {
    fullName: String(r.fullName ?? "").trim(),
    certificationScheme: String(r.certificationScheme ?? "").trim(),
    certificationLevel: String(r.certificationLevel ?? "").trim(),
    issueDate: String(r.issueDate ?? "").trim(),
    expiryDate: String(r.expiryDate ?? "").trim(),
    certificateNumber: String(r.certificateNumber ?? "").trim(),
    qrCode: String(r.qrCode ?? "").trim(),
    digitalSignatureHash: String(r.digitalSignatureHash ?? "").trim(),
  };
}

function normalizeLevelTemplatesWire(
  raw: NonNullable<CertificateConfigWire["personCertificationCertificateDesigner"]>["levelTemplates"],
): Record<string, CertificationLevelTemplateState> {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const out: Record<string, CertificationLevelTemplateState> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim();
    if (!key || !v || typeof v !== "object") {
      continue;
    }
    out[key] = {
      certificateTemplatePdfUrl: String(
        (v as { certificateTemplatePdfUrl?: string }).certificateTemplatePdfUrl ?? "",
      ).trim(),
      pdfFieldMapping: normalizePersonPdfMappingWire(
        (v as { pdfFieldMapping?: PersonCertificationPdfFieldMappingState }).pdfFieldMapping,
      ),
    };
  }
  return out;
}

function normalizeCertificateConfig(raw: CertificateConfigWire | null | undefined): CertificateConfigState {
  if (!raw) {
    return defaultCertificateConfig();
  }
  const y = Number(raw.validityYears);
  const ep = raw.examPassCertificateDesigner;
  const pc = raw.personCertificationCertificateDesigner;
  return {
    certTitle: raw.certTitle?.trim() ?? "",
    certStatement: raw.certStatement?.trim() ?? "",
    authorityName: raw.authorityName?.trim() ?? "",
    authorityTitle: raw.authorityTitle?.trim() ?? "",
    validityYears: Number.isFinite(y) && y >= 1 ? Math.min(100, Math.floor(y)) : 3,
    certificateNumberPrefix: String(
      raw.certificateNumberPrefix ?? (raw as { certificate_number_prefix?: string }).certificate_number_prefix ?? "",
    ).trim(),
    certificateTemplatePdfUrl: String(raw.certificateTemplatePdfUrl ?? "").trim(),
    pdfFieldMapping: normalizePdfMappingWire(raw.pdfFieldMapping),
    verificationBaseUrl: String(raw.verificationBaseUrl ?? "").trim(),
    examPassCertificateDesigner: {
      includeScore: ep?.includeScore !== false,
      certificateTemplatePdfUrl: String(ep?.certificateTemplatePdfUrl ?? "").trim(),
      pdfFieldMapping: normalizeExamPdfMappingWire(ep?.pdfFieldMapping),
    },
    personCertificationCertificateDesigner: {
      schemeDisplayLabel: String(pc?.schemeDisplayLabel ?? "").trim(),
      certificateTemplatePdfUrl: String(pc?.certificateTemplatePdfUrl ?? "").trim(),
      pdfFieldMapping: normalizePersonPdfMappingWire(pc?.pdfFieldMapping),
      levelTemplates: normalizeLevelTemplatesWire(pc?.levelTemplates),
    },
  };
}

/** @deprecated Use AdminCourseStructureResponse */
export type AdminCourseStructurePayload = AdminCourseStructureResponse;

function mapQuizQuestions(questions: readonly CourseStructureQuizQuestionJson[] | undefined): EditorQuizConfig {
  const base = emptyQuiz();
  if (!questions?.length) {
    return base;
  }
  const mapped: EditorQuizQuestion[] = questions.map((q) => {
    const answers: EditorQuizAnswer[] = (q.answers ?? []).map((a) => ({
      id: a.id?.trim() || generateId(),
      label: a.label ?? "",
    }));
    const qtype = String(q.type || "multiple_choice").toLowerCase();
    return {
      id: q.id?.trim() || generateId(),
      type: qtype === "true_false" ? "true_false" : "multiple_choice",
      prompt: q.prompt ?? "",
      answers: answers.length ? answers : [{ id: generateId(), label: "A" }, { id: generateId(), label: "B" }],
      correctAnswerId: q.correctAnswerId ?? null,
    };
  });
  return { ...base, questions: mapped };
}

function mapEmbedAttestation(
  raw: CourseStructureLessonJson["embedCaptionAttestation"],
): EditorLesson["embedCaptionAttestation"] {
  if (!raw) return null;
  return {
    attestedAt: raw.attestedAt ?? null,
    attestedBy: raw.attestedBy ?? null,
    attestationExpiresAt: raw.attestationExpiresAt ?? null,
    captionLanguages: raw.captionLanguages ?? [],
  };
}

function mapLesson(modId: string, les: AdminCourseStructureResponse["modules"][number]["lessons"][number]): EditorLesson {
  const ct = normalizeEditorContentType(les.contentType ?? "text");
  const url = les.contentUrl?.trim() ?? "";
  const html = les.htmlBody ?? "";
  return {
    id: les.lessonId,
    moduleId: modId,
    title: les.title?.trim() || "Lekcija",
    contentType: ct,
    durationMinutes: Math.max(0, Number(les.estimatedMinutes) || 0),
    durationManual: false,
    visible: true,
    required: Boolean(les.isMandatory),
    htmlBody: ct === "text" ? html : ct === "quiz" ? "" : html,
    videoUrl: ct === "video" ? url : "",
    videoFileName: null,
    videoFileSizeLabel: null,
    captionsUrl: les.captionsUrl?.trim() ?? "",
    captionsInline: les.captionsInline?.trim() ?? "",
    transcriptUrl: les.transcriptUrl?.trim() ?? "",
    transcriptInline: les.transcriptInline?.trim() ?? "",
    transcriptIsAiGenerated: Boolean(les.transcriptIsAiGenerated),
    embedCaptionAttestation: mapEmbedAttestation(les.embedCaptionAttestation),
    pdfUrl: ct === "pdf" ? url : "",
    pdfFileName: null,
    chapters: [],
    quiz: ct === "quiz" ? mapQuizQuestions(les.quiz?.questions) : emptyQuiz(),
    resources: [],
  };
}

/** Pretvara odgovor GET /api/admin/courses/{id}/structure u početno stanje editora. */
export function adminApiToEditorState(data: AdminCourseStructureResponse): {
  courseTitle: string;
  modules: EditorModule[];
  selectedLessonId: string | null;
  certificateConfig: CertificateConfigState;
  courseCertifiable: boolean;
  examConfig: ExamConfigState;
} {
  const mods = [...(data.modules ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const modules: EditorModule[] = mods.map((m, idx) => {
    const lessonsRaw = [...(m.lessons ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const lessons = lessonsRaw.map((l) => mapLesson(m.moduleId, l));
    return {
      id: m.moduleId,
      order: m.orderIndex ?? idx + 1,
      title: m.title?.trim() || `Modul ${idx + 1}`,
      lessons: lessons.length ? lessons : [createFallbackLesson(m.moduleId)],
    };
  });
  const withLessons =
    modules.length > 0
      ? modules
      : (() => {
          const mid = generateId();
          return [{ id: mid, order: 1, title: "Modul 1", lessons: [createFallbackLesson(mid)] }];
        })();
  const firstLesson = withLessons[0]?.lessons[0]?.id ?? null;
  const meta = data.courseMeta;
  const cd = meta?.examCooldownHours;
  const rawCd =
    cd !== undefined && cd !== null && Number.isFinite(Number(cd)) ? Math.max(0, Math.floor(Number(cd))) : 24;
  const allowedCd = new Set([0, 12, 24, 48, 168]);
  const cooldownHours = allowedCd.has(rawCd) ? rawCd : 24;
  const examConfig: ExamConfigState = {
    questionsCount: Math.max(1, Number(meta?.examQuestionCount) || 40),
    passingScorePct: Math.max(1, Math.min(100, Number(meta?.passingScorePct) || 70)),
    attemptsAllowed: Math.max(1, Number(meta?.examAttemptsAllowed) || 3),
    durationMinutes: Math.max(1, Number(meta?.examTimeLimitMinutes) || 90),
    hasFinalExam: meta?.hasFinalExam !== false,
    cooldownHours,
    identityCheckRequired: meta?.examIdentityCheckRequired !== false,
    requireMfa: meta?.examRequireMfa === true,
    randomOrder: meta?.examRandomOrder !== false,
    showResults: meta?.examShowResults !== false,
  };
  return {
    courseTitle: data.title?.trim() || "Kurs",
    modules: withLessons,
    selectedLessonId: firstLesson,
    certificateConfig: normalizeCertificateConfig(data.certificateConfig),
    courseCertifiable: meta?.isCertifiable !== false,
    examConfig,
  };
}

function createFallbackLesson(moduleId: string): EditorLesson {
  return {
    id: generateId(),
    moduleId,
    title: "Nova lekcija",
    contentType: "text",
    durationMinutes: 10,
    durationManual: false,
    visible: true,
    required: false,
    htmlBody: "<p>Započni pisanje sadržaja lekcije…</p>",
    videoUrl: "",
    videoFileName: null,
    videoFileSizeLabel: null,
    captionsUrl: "",
    captionsInline: "",
    transcriptUrl: "",
    transcriptInline: "",
    transcriptIsAiGenerated: false,
    embedCaptionAttestation: null,
    pdfUrl: "",
    pdfFileName: null,
    chapters: [],
    quiz: emptyQuiz(),
    resources: [],
  };
}

/** Konfiguracija certifikata za API (curriculum PUT / admin PATCH). */
export function certificateConfigToWire(certificateConfig: CertificateConfigState): CertificateConfigWire {
  return {
    certTitle: certificateConfig.certTitle,
    certStatement: certificateConfig.certStatement,
    authorityName: certificateConfig.authorityName,
    authorityTitle: certificateConfig.authorityTitle,
    validityYears: certificateConfig.validityYears,
    certificateNumberPrefix: certificateConfig.certificateNumberPrefix.trim().slice(0, 12),
    ...(certificateConfig.certificateTemplatePdfUrl?.trim()
      ? { certificateTemplatePdfUrl: certificateConfig.certificateTemplatePdfUrl.trim() }
      : {}),
    ...(certificateConfig.verificationBaseUrl?.trim()
      ? { verificationBaseUrl: certificateConfig.verificationBaseUrl.trim() }
      : {}),
    pdfFieldMapping: {
      fullName: certificateConfig.pdfFieldMapping.fullName,
      courseName: certificateConfig.pdfFieldMapping.courseName,
      certificateNumber: certificateConfig.pdfFieldMapping.certificateNumber,
      qrCode: certificateConfig.pdfFieldMapping.qrCode,
      issuedAt: certificateConfig.pdfFieldMapping.issuedAt,
      expiresAt: certificateConfig.pdfFieldMapping.expiresAt,
    },
    examPassCertificateDesigner: {
      includeScore: certificateConfig.examPassCertificateDesigner.includeScore,
      ...(certificateConfig.examPassCertificateDesigner.certificateTemplatePdfUrl?.trim()
        ? {
            certificateTemplatePdfUrl: certificateConfig.examPassCertificateDesigner.certificateTemplatePdfUrl.trim(),
          }
        : {}),
      pdfFieldMapping: {
        documentTitle: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.documentTitle,
        fullName: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.fullName,
        courseName: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.courseName,
        examDate: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.examDate,
        issueDate: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.issueDate,
        score: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.score,
        certificateNumber: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.certificateNumber,
        qrCode: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.qrCode,
        digitalSignatureHash: certificateConfig.examPassCertificateDesigner.pdfFieldMapping.digitalSignatureHash,
      },
    },
    personCertificationCertificateDesigner: {
      schemeDisplayLabel: certificateConfig.personCertificationCertificateDesigner.schemeDisplayLabel,
      ...(certificateConfig.personCertificationCertificateDesigner.certificateTemplatePdfUrl?.trim()
        ? {
            certificateTemplatePdfUrl:
              certificateConfig.personCertificationCertificateDesigner.certificateTemplatePdfUrl.trim(),
          }
        : {}),
      pdfFieldMapping: {
        fullName: certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping.fullName,
        certificationScheme: certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping.certificationScheme,
        certificationLevel: certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping.certificationLevel,
        issueDate: certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping.issueDate,
        expiryDate: certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping.expiryDate,
        certificateNumber: certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping.certificateNumber,
        qrCode: certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping.qrCode,
        digitalSignatureHash:
          certificateConfig.personCertificationCertificateDesigner.pdfFieldMapping.digitalSignatureHash,
      },
      levelTemplates: Object.fromEntries(
        Object.entries(certificateConfig.personCertificationCertificateDesigner.levelTemplates).map(([k, v]) => [
          k,
          {
            ...(v.certificateTemplatePdfUrl?.trim()
              ? { certificateTemplatePdfUrl: v.certificateTemplatePdfUrl.trim() }
              : {}),
            pdfFieldMapping: {
              fullName: v.pdfFieldMapping.fullName,
              certificationScheme: v.pdfFieldMapping.certificationScheme,
              certificationLevel: v.pdfFieldMapping.certificationLevel,
              issueDate: v.pdfFieldMapping.issueDate,
              expiryDate: v.pdfFieldMapping.expiryDate,
              certificateNumber: v.pdfFieldMapping.certificateNumber,
              qrCode: v.pdfFieldMapping.qrCode,
              digitalSignatureHash: v.pdfFieldMapping.digitalSignatureHash,
            },
          },
        ]),
      ),
    },
  };
}

/** Tijelo za PUT /api/admin/courses/{id}/curriculum */
export function editorStateToCurriculumPut(
  courseTitle: string,
  modules: readonly EditorModule[],
  certificateConfig: CertificateConfigState,
): CurriculumPutBody {
  return {
    courseTitle,
    certificateConfig: certificateConfigToWire(certificateConfig),
    modules: modules.map((m) => ({
      id: m.id,
      order: m.order,
      title: m.title,
      lessons: m.lessons.map((l) => {
        const base: CurriculumPutBody["modules"][number]["lessons"][number] = {
          id: l.id,
          moduleId: m.id,
          title: l.title,
          contentType: l.contentType,
          durationMinutes: l.durationMinutes,
          required: l.required,
          htmlBody: l.htmlBody,
          videoUrl: l.videoUrl,
          pdfUrl: l.pdfUrl,
          ...(l.contentType === "video"
            ? {
                captionsUrl: l.captionsUrl,
                captionsInline: l.captionsInline,
                transcriptUrl: l.transcriptUrl,
                transcriptInline: l.transcriptInline,
                transcriptIsAiGenerated: l.transcriptIsAiGenerated,
                embedCaptionAttestation: l.embedCaptionAttestation,
              }
            : {}),
        };
        if (l.contentType === "quiz") {
          base.quiz = {
            questions: l.quiz.questions.map((q) => ({
              id: q.id,
              type: q.type,
              prompt: q.prompt,
              answers: q.answers.map((a) => ({ id: a.id, label: a.label })),
              correctAnswerId: q.correctAnswerId,
            })),
          };
        }
        return base;
      }),
    })),
  };
}
