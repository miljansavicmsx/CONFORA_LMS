export type EditorContentType = "text" | "video" | "pdf" | "quiz";

export type QuizQuestionType = "multiple_choice" | "true_false";

export interface EditorQuizAnswer {
  readonly id: string;
  readonly label: string;
}

export interface EditorQuizQuestion {
  readonly id: string;
  readonly type: QuizQuestionType;
  readonly prompt: string;
  readonly answers: readonly EditorQuizAnswer[];
  readonly correctAnswerId: string | null;
}

export interface EditorQuizConfig {
  readonly title: string;
  readonly questionCountTarget: number;
  readonly passingScorePct: number;
  readonly timeLimitMinutes: number;
  readonly maxAttempts: number;
  readonly questions: readonly EditorQuizQuestion[];
}

export interface EditorEmbedCaptionAttestation {
  readonly attestedAt: string | null;
  readonly attestedBy: string | null;
  readonly attestationExpiresAt: string | null;
  readonly captionLanguages: readonly string[];
}

export interface EditorLesson {
  readonly id: string;
  readonly moduleId: string;
  readonly title: string;
  readonly contentType: EditorContentType;
  /** Automatski iz sadržaja + ručni override. */
  readonly durationMinutes: number;
  readonly durationManual: boolean;
  readonly visible: boolean;
  readonly required: boolean;
  readonly htmlBody: string;
  readonly videoUrl: string;
  readonly videoFileName: string | null;
  readonly videoFileSizeLabel: string | null;
  readonly captionsUrl: string;
  readonly captionsInline: string;
  readonly transcriptUrl: string;
  readonly transcriptInline: string;
  readonly transcriptIsAiGenerated: boolean;
  readonly embedCaptionAttestation: EditorEmbedCaptionAttestation | null;
  readonly pdfUrl: string;
  readonly pdfFileName: string | null;
  readonly chapters: readonly { readonly timeSeconds: number; readonly title: string }[];
  readonly quiz: EditorQuizConfig;
  readonly resources: readonly { readonly id: string; readonly name: string }[];
}

export interface EditorModule {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly lessons: readonly EditorLesson[];
}

export interface ExamConfigState {
  readonly questionsCount: number;
  readonly passingScorePct: number;
  readonly attemptsAllowed: number;
  readonly durationMinutes: number;
  readonly hasFinalExam: boolean;
  /** Nakon koliko sati ponovni pokušaj (Dynamo examCooldownHours). */
  readonly cooldownHours: number;
  readonly identityCheckRequired: boolean;
  readonly requireMfa: boolean;
  readonly randomOrder: boolean;
  readonly showResults: boolean;
}

export type CertificatePdfFieldMappingState = {
  readonly fullName: string;
  readonly courseName: string;
  readonly certificateNumber: string;
  readonly qrCode: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
};

/** AcroForm imena za exam-pass šablon (odvojeno od osobne certifikacije). */
export type ExamPassPdfFieldMappingState = {
  readonly documentTitle: string;
  readonly fullName: string;
  readonly courseName: string;
  readonly examDate: string;
  readonly issueDate: string;
  readonly score: string;
  readonly certificateNumber: string;
  readonly qrCode: string;
  readonly digitalSignatureHash: string;
};

/** AcroForm imena za certifikat osobe (ISO / odluka komiteta). */
export type PersonCertificationPdfFieldMappingState = {
  readonly fullName: string;
  readonly certificationScheme: string;
  readonly certificationLevel: string;
  readonly issueDate: string;
  readonly expiryDate: string;
  readonly certificateNumber: string;
  readonly qrCode: string;
  readonly digitalSignatureHash: string;
};

export type CertificationLevelTemplateState = {
  readonly certificateTemplatePdfUrl: string;
  readonly pdfFieldMapping: PersonCertificationPdfFieldMappingState;
};

export interface CertificateConfigState {
  readonly certTitle: string;
  readonly certStatement: string;
  readonly authorityName: string;
  readonly authorityTitle: string;
  readonly validityYears: number;
  /** Prefiks ID certifikata (npr. ISO27); prazno = CON. */
  readonly certificateNumberPrefix: string;
  /** Globalni fallback PDF (naslijeđe); exam/osoba imaju zasebne URL-e u designerima. */
  readonly certificateTemplatePdfUrl: string;
  readonly pdfFieldMapping: CertificatePdfFieldMappingState;
  /** Override javnog URL-a za QR (inače CERTIFICATE_VERIFY_BASE_URL / postavke okruženja). */
  readonly verificationBaseUrl: string;
  readonly examPassCertificateDesigner: {
    readonly includeScore: boolean;
    readonly certificateTemplatePdfUrl: string;
    readonly pdfFieldMapping: ExamPassPdfFieldMappingState;
  };
  readonly personCertificationCertificateDesigner: {
    readonly schemeDisplayLabel: string;
    readonly certificateTemplatePdfUrl: string;
    readonly pdfFieldMapping: PersonCertificationPdfFieldMappingState;
    /** Ključ razine (npr. FOUNDATION) → opcionalni URL šablona i mapiranje. */
    readonly levelTemplates: Record<string, CertificationLevelTemplateState>;
  };
}
