import type {
  Course,
  CourseInstructor,
  CourseLesson,
  CourseModule,
  CourseReview,
  CourseStructurePreviewModule,
} from "@/types/course-detail";

import type { CoursePathwayTier } from "@/lib/course-pathway";
import { pathwayTierFromFlags } from "@/lib/course-pathway";

/** Red iz GET /api/courses ili GET /api/courses/lookup/... (camelCase iz FastAPI). */
export interface CourseListRow {
  readonly courseId: string;
  readonly slug: string;
  readonly title: string;
  readonly domain: string | null;
  /** Kategorija iz API-ja (npr. ISO-27001) — korisno za filtre. */
  readonly categorySlug?: string | null;
  readonly price: number | null;
  readonly level: string;
  readonly durationHours: number;
  readonly thumbnailUrl: string | null;
  readonly isCertifiable: boolean;
  readonly status?: string | null;
  readonly shortSummary?: string | null;
  readonly description?: string | null;
  readonly learningOutcomes?: readonly string[] | null;
  readonly leadsToCertification?: boolean;
  readonly hasFinalExam?: boolean;
  readonly autoIssueExamPassCertificate?: boolean;
  readonly certificationSchemeReference?: string | null;
  readonly moduleCount?: number | null;
  readonly lessonCountTotal?: number | null;
  readonly structurePreview?: readonly { readonly title: string; readonly lessonCount: number }[] | null;
  readonly badges?: readonly string[] | null;
}

type DetailOverride = Partial<{
  description: string;
  promoVideoUrl: string | null;
  learningObjectives: string[];
  examQuestionsCount: number;
  examPassingScore: number;
  examAttemptsAllowed: number;
  examTimeLimitMinutes: number | null;
  enrolled: boolean;
  instructor: CourseInstructor;
  reviews: CourseReview[];
}>;

const OVERRIDES: Record<string, DetailOverride> = {
  "iso-27001-lead-implementer": {
    promoVideoUrl: "https://www.youtube.com/watch?v=5MgBikgcWnY",
    description:
      "Dubinski program za implementaciju ISMS-a prema ISO/IEC 27001:2022. Naučite procjenu rizika, kontrole Annex A, interne audite i pripremu za certifikaciju. Praktični radionički zadaci i predlošci dokumentacije uključeni su u materijale.",
    learningObjectives: [
      "Razumjeti zahtjeve klauzula 4–10 i Annex A ISO 27001:2022.",
      "Provesti procjenu rizika i izraditi Statement of Applicability.",
      "Planirati i voditi interni audit informacijske sigurnosti.",
      "Pripremiti organizaciju za vanjski certifikacijski audit.",
    ],
    examQuestionsCount: 60,
    examPassingScore: 70,
    examAttemptsAllowed: 3,
    examTimeLimitMinutes: 120,
    instructor: {
      name: "Marko Horvat",
      title: "Lead Auditor, CISM",
      bio: "15+ godina u ISMS i compliance projektima u finansijskom i zdravstvenom sektoru.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop",
    },
    reviews: [
      {
        id: "r1",
        author: "Sara M.",
        rating: 5,
        comment: "Izvrsna struktura i jasni primjeri iz prakse.",
        date: "2025-11-02",
      },
    ],
  },
  "ai-governance-eu-ai-act": {
    promoVideoUrl: null,
    description:
      "Usklađivanje AI sustava s EU AI Act-om: klasifikacija rizika, dokumentacija, nadzor i upravljanje životnim ciklusom modela.",
    learningObjectives: [
      "Mapirati AI sustave prema EU taksonomiji rizika.",
      "Implementirati zahtjeve za transparentnost i ljudski nadzor.",
    ],
    examQuestionsCount: 45,
    examPassingScore: 75,
    examAttemptsAllowed: 2,
    examTimeLimitMinutes: 90,
  },
};

function hashSeed(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h << 5) - h + slug.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildModules(slug: string): CourseModule[] {
  const seed = hashSeed(slug);
  const modTitles = [
    "Uvod i kontekst",
    "Ključni zahtjevi",
    "Praksa i case study",
    "Priprema za ispit",
  ];
  const lessonTypes: Array<"video" | "pdf" | "text"> = ["video", "pdf", "text"];
  return modTitles.slice(0, 3).map((title, mi) => {
    const nLessons = 2 + ((seed + mi) % 3);
    const lessons: CourseLesson[] = Array.from({ length: nLessons }, (_, li) => {
      const idx = (seed + mi * 4 + li) % lessonTypes.length;
      const type = lessonTypes[idx] ?? "video";
      return {
        id: `${slug}-m${mi}-l${li}`,
        title:
          type === "video"
            ? `Video lekcija ${li + 1}: ključni koncepti`
            : type === "pdf"
              ? `Čitanje materijala ${li + 1}`
              : `Tekstualni pregled ${li + 1}`,
        durationMinutes: 10 + ((seed + li) % 25) * 2,
        type,
        isFreePreview: mi === 0 && li === 0,
      };
    });
    return {
      id: `${slug}-mod-${mi}`,
      title,
      lessons,
    };
  });
}

function modulesFromStructurePreview(
  slug: string,
  preview: readonly { readonly title: string; readonly lessonCount: number }[],
): CourseModule[] {
  if (!preview.length) {
    return buildModules(slug);
  }
  return preview.map((m, mi) => {
    const n = Math.max(0, Math.min(40, m.lessonCount));
    const lessons: CourseLesson[] = Array.from({ length: n }, (_, li) => ({
      id: `${slug}-pv-${mi}-l${li}`,
      title: `Lekcija ${li + 1}`,
      durationMinutes: 15,
      type: "video" as const,
      isFreePreview: mi === 0 && li === 0,
    }));
    return {
      id: `${slug}-pv-${mi}`,
      title: m.title,
      lessons,
    };
  });
}

const DEFAULT_DESCRIPTION =
  "Ovaj tečaj pruža strukturirani pristup temi kroz video lekcije, materijale za čitanje i praktične zadatke. Pristupite sadržaju u bilo koje vrijeme i učite vlastitim tempom uz podršku instruktora.";

const DESCRIPTION_PREVIEW_LEN = 160;

export function courseRowPathwayFlags(row: CourseListRow): {
  hasFinalExam: boolean;
  autoIssueExamPassCertificate: boolean;
  leadsToCertification: boolean;
} {
  const slug = row.slug;
  if (slug === "cloud-security-essentials") {
    return { hasFinalExam: false, autoIssueExamPassCertificate: false, leadsToCertification: false };
  }
  if (slug === "upravljanje-rizicima-osnove") {
    return { hasFinalExam: true, autoIssueExamPassCertificate: true, leadsToCertification: false };
  }
  if (
    row.hasFinalExam !== undefined &&
    row.autoIssueExamPassCertificate !== undefined &&
    row.leadsToCertification !== undefined
  ) {
    return {
      hasFinalExam: row.hasFinalExam,
      autoIssueExamPassCertificate: row.autoIssueExamPassCertificate,
      leadsToCertification: row.leadsToCertification,
    };
  }
  const leads =
    row.leadsToCertification ??
    Boolean(row.badges?.some((b) => String(b).toLowerCase().includes("certifikac")));
  return {
    hasFinalExam: row.hasFinalExam ?? true,
    autoIssueExamPassCertificate: row.autoIssueExamPassCertificate ?? true,
    leadsToCertification: leads,
  };
}

/** Kratak opis za karticu u katalogu (bez punog `enrich` građenja modula). */
export function getCourseListDescriptionPreview(row: CourseListRow): string {
  const fromApi = row.shortSummary?.trim();
  if (fromApi) {
    const t = fromApi.replace(/\s+/gu, " ").trim();
    return t.length > DESCRIPTION_PREVIEW_LEN
      ? `${t.slice(0, DESCRIPTION_PREVIEW_LEN - 1)}…`
      : t;
  }
  const o = OVERRIDES[row.slug];
  const text = o?.description ?? DEFAULT_DESCRIPTION;
  const t = text.replace(/\s+/gu, " ").trim();
  return t.length > DESCRIPTION_PREVIEW_LEN
    ? `${t.slice(0, DESCRIPTION_PREVIEW_LEN - 1)}…`
    : t;
}

export function enrichCourseFromListRow(row: CourseListRow, opts?: { readonly enrolled?: boolean }): Course {
  const o = OVERRIDES[row.slug] ?? {};
  const thumb = row.thumbnailUrl ?? "";
  const price = row.price ?? 0;
  const domain = row.domain ?? "Općenito";
  const publishedStatus = String(row.status || "published");
  const pf = courseRowPathwayFlags(row);
  const structurePreview: CourseStructurePreviewModule[] = (row.structurePreview ?? []).map((x) => ({
    title: x.title,
    lessonCount: x.lessonCount,
  }));
  const descFromRow = row.description?.trim();
  const description = o.description ?? (descFromRow && descFromRow.length > 0 ? descFromRow : DEFAULT_DESCRIPTION);
  const outcomesFromApi = row.learningOutcomes?.filter((x) => String(x).trim());
  const learningObjectives = (
    o.learningObjectives ??
    (outcomesFromApi && outcomesFromApi.length > 0
      ? [...outcomesFromApi]
      : ["Razumjeti osnovne koncepte i terminologiju.", "Primijeniti stečeno znanje u praktičnim situacijama."])
  ).slice(0, 8);
  const shortSummary =
    row.shortSummary?.trim() ||
    (description.length > 200 ? `${description.slice(0, 200)}…` : description);
  const modCount = row.moduleCount ?? modulesFromStructurePreview(row.slug, row.structurePreview ?? []).length;
  const modules = modulesFromStructurePreview(row.slug, row.structurePreview ?? []);

  return {
    courseId: row.courseId,
    slug: row.slug,
    title: row.title,
    domain,
    thumbnailUrl: thumb,
    level: row.level,
    durationHours: row.durationHours,
    price,
    currency: "EUR",
    isCertifiable: row.isCertifiable,
    publishedStatus,
    hasFinalExam: pf.hasFinalExam,
    autoIssueExamPassCertificate: pf.autoIssueExamPassCertificate,
    leadsToCertification: pf.leadsToCertification,
    certificationSchemeReference: row.certificationSchemeReference?.trim() || null,
    shortSummary,
    moduleCount: modCount,
    lessonCountTotal: row.lessonCountTotal ?? modules.reduce((a, m) => a + m.lessons.length, 0),
    structurePreview,
    description,
    promoVideoUrl: o.promoVideoUrl ?? null,
    learningObjectives,
    examQuestionsCount: o.examQuestionsCount ?? 40,
    examPassingScore: o.examPassingScore ?? 70,
    examAttemptsAllowed: o.examAttemptsAllowed ?? 3,
    examTimeLimitMinutes: o.examTimeLimitMinutes ?? 90,
    enrolled: o.enrolled ?? opts?.enrolled ?? false,
    modules,
    instructor: o.instructor ?? {
      name: "CONFORA tim",
      title: "Certificirani instruktor",
      bio: "Iskusni stručnjaci za edukaciju i certifikaciju.",
    },
    reviews: o.reviews ?? [],
  };
}

export function pathwayTierForCourseRow(row: CourseListRow): CoursePathwayTier {
  const pf = courseRowPathwayFlags(row);
  return pathwayTierFromFlags(pf);
}
