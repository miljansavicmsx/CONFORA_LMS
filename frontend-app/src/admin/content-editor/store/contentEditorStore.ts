import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";

import {
  adminApiToEditorState,
  defaultCertificateConfig,
  editorStateToCurriculumPut,
} from "@/admin/content-editor/curriculum-io";
import { generateId } from "@/admin/content-editor/generateId";
import type { CourseMetaWire } from "@/admin/content-editor/curriculum-api-types";
import {
  fetchCourseStructure,
  getCurriculumApiErrorMessage,
  saveCourseStructure,
} from "@/lib/admin-curriculum-api";
import type {
  CertificateConfigState,
  EditorContentType,
  EditorLesson,
  EditorModule,
  EditorQuizConfig,
  EditorQuizQuestion,
  ExamConfigState,
} from "@/admin/content-editor/types";

export { generateId };

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

function createLesson(moduleId: string, title = "Nova lekcija"): EditorLesson {
  return {
    id: generateId(),
    moduleId,
    title,
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

function initialModules(): EditorModule[] {
  const m1 = generateId();
  const m2 = generateId();
  const l1 = createLesson(m1, "Uvod u standard");
  const l2 = createLesson(m1, "Video demonstracija");
  const l2b: EditorLesson = {
    ...l2,
    id: generateId(),
    title: "Video demonstracija",
    contentType: "video",
    htmlBody: "",
    videoUrl: "",
  };
  const l3 = createLesson(m2, "Završni kviz");
  const l3b: EditorLesson = {
    ...l3,
    id: generateId(),
    title: "Završni kviz",
    contentType: "quiz",
    quiz: {
      ...emptyQuiz(),
      questions: [
        {
          id: generateId(),
          type: "multiple_choice",
          prompt: "Što je primarni cilj ISMS-a?",
          answers: [
            { id: generateId(), label: "Smanjiti troškove IT-a" },
            { id: generateId(), label: "Zaštititi informacije" },
            { id: generateId(), label: "Ubrzati mrežu" },
          ],
          correctAnswerId: null,
        },
      ],
    },
  };
  return [
    {
      id: m1,
      order: 1,
      title: "Modul 1 — Osnove",
      lessons: [l1, l2b],
    },
    {
      id: m2,
      order: 2,
      title: "Modul 2 — Evaluacija",
      lessons: [l3b],
    },
  ];
}

function mapModules(
  modules: readonly EditorModule[],
  fn: (m: EditorModule) => EditorModule,
): EditorModule[] {
  return modules.map(fn);
}

function findLesson(
  modules: readonly EditorModule[],
  lessonId: string,
): { module: EditorModule; lesson: EditorLesson; mIdx: number; lIdx: number } | null {
  for (let mIdx = 0; mIdx < modules.length; mIdx++) {
    const module = modules[mIdx];
    if (!module) {
      continue;
    }
    const lIdx = module.lessons.findIndex((l) => l.id === lessonId);
    if (lIdx >= 0) {
      const lesson = module.lessons[lIdx];
      if (lesson) {
        return { module, lesson, mIdx, lIdx };
      }
    }
  }
  return null;
}

export type CurriculumLoadStatus = "idle" | "loading" | "ready" | "error";
export type CurriculumSaveStatus = "idle" | "saving" | "error";

export interface ContentEditorState {
  readonly courseTitle: string;
  readonly activeCourseId: string | null;
  readonly courseMeta: CourseMetaWire | null;
  readonly courseCertifiable: boolean;
  readonly examConfig: ExamConfigState;
  readonly certificateConfig: CertificateConfigState;
  readonly modules: EditorModule[];
  readonly selectedLessonId: string | null;
  readonly lastSavedLabel: string | null;
  readonly curriculumLoadStatus: CurriculumLoadStatus;
  readonly curriculumSaveStatus: CurriculumSaveStatus;
  readonly curriculumLoadError: string | null;
  readonly curriculumSaveError: string | null;
  setCourseTitle: (title: string) => void;
  touchSave: () => void;
  loadCurriculum: (courseId: string) => Promise<void>;
  saveCurriculum: (courseId: string) => Promise<void>;
  clearCurriculumSaveError: () => void;
  selectLesson: (lessonId: string | null) => void;
  addModule: () => void;
  addLesson: (moduleId: string) => void;
  duplicateLesson: (lessonId: string) => void;
  deleteLesson: (lessonId: string) => void;
  deleteModule: (moduleId: string) => void;
  updateModuleTitle: (moduleId: string, title: string) => void;
  updateLessonTitle: (lessonId: string, title: string) => void;
  patchLesson: (lessonId: string, patch: Partial<EditorLesson>) => void;
  setLessonContentType: (lessonId: string, t: EditorContentType) => void;
  reorderModules: (activeModuleId: string, overModuleId: string) => void;
  reorderLessons: (activeLessonId: string, overLessonId: string) => void;
  patchExamConfig: (patch: Partial<ExamConfigState>) => void;
  patchCertificateConfig: (patch: Partial<CertificateConfigState>) => void;
  replaceLessonQuiz: (lessonId: string, quiz: EditorQuizConfig) => void;
  addQuizQuestion: (lessonId: string) => void;
  reorderQuizQuestions: (lessonId: string, activeId: string, overId: string) => void;
}

function formatSaveTime(d: Date): string {
  return d.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" });
}

const _initialMods = initialModules();
const _firstLesson = _initialMods[0]?.lessons[0]?.id ?? null;

/** Sprječava da stariji GET prepiše stanje nakon brze promjene courseId. */
let _curriculumLoadGeneration = 0;

export const useContentEditorStore = create<ContentEditorState>((set, get) => ({
  courseTitle: "ISO 27001 — Lead Implementer",
  activeCourseId: null,
  courseMeta: null,
  courseCertifiable: true,
  examConfig: {
    questionsCount: 40,
    passingScorePct: 70,
    attemptsAllowed: 3,
    durationMinutes: 90,
    hasFinalExam: true,
    cooldownHours: 24,
    identityCheckRequired: true,
    requireMfa: false,
    randomOrder: true,
    showResults: true,
  },
  certificateConfig: defaultCertificateConfig(),
  modules: _initialMods,
  selectedLessonId: _firstLesson,
  lastSavedLabel: formatSaveTime(new Date()),

  curriculumLoadStatus: "idle",
  curriculumSaveStatus: "idle",
  curriculumLoadError: null,
  curriculumSaveError: null,

  clearCurriculumSaveError: () => set({ curriculumSaveError: null, curriculumSaveStatus: "idle" }),

  loadCurriculum: async (courseId) => {
    const gen = ++_curriculumLoadGeneration;
    set({ curriculumLoadStatus: "loading", curriculumLoadError: null });
    try {
      const raw = await fetchCourseStructure(courseId);
      if (gen !== _curriculumLoadGeneration) {
        return;
      }
      const st = adminApiToEditorState(raw);
      set({
        activeCourseId: courseId,
        courseTitle: st.courseTitle,
        courseMeta: raw.courseMeta ?? null,
        modules: st.modules,
        selectedLessonId: st.selectedLessonId,
        certificateConfig: st.certificateConfig,
        courseCertifiable: st.courseCertifiable,
        examConfig: st.examConfig,
        lastSavedLabel: null,
        curriculumLoadStatus: "ready",
        curriculumLoadError: null,
      });
    } catch (e) {
      if (gen !== _curriculumLoadGeneration) {
        return;
      }
      set({
        curriculumLoadStatus: "error",
        curriculumLoadError: getCurriculumApiErrorMessage(e),
      });
    }
  },

  saveCurriculum: async (courseId) => {
    set({ curriculumSaveStatus: "saving", curriculumSaveError: null });
    try {
      const { courseTitle, modules, certificateConfig } = get();
      await saveCourseStructure(courseId, editorStateToCurriculumPut(courseTitle, modules, certificateConfig));
      set({
        curriculumSaveStatus: "idle",
        curriculumSaveError: null,
        lastSavedLabel: formatSaveTime(new Date()),
      });
    } catch (e) {
      set({
        curriculumSaveStatus: "error",
        curriculumSaveError: getCurriculumApiErrorMessage(e),
      });
    }
  },

  setCourseTitle: (title) => set({ courseTitle: title }),

  touchSave: () => set({ lastSavedLabel: formatSaveTime(new Date()) }),

  selectLesson: (lessonId) => set({ selectedLessonId: lessonId }),

  addModule: () =>
    set((s) => {
      const nextOrder = s.modules.length + 1;
      const id = generateId();
      const lesson = createLesson(id);
      return {
        modules: [
          ...s.modules,
          { id, order: nextOrder, title: `Modul ${nextOrder}`, lessons: [lesson] },
        ],
        selectedLessonId: lesson.id,
      };
    }),

  addLesson: (moduleId) =>
    set((s) => {
      const lesson = createLesson(moduleId);
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m,
        ),
        selectedLessonId: lesson.id,
      };
    }),

  duplicateLesson: (lessonId) =>
    set((s) => {
      const hit = findLesson(s.modules, lessonId);
      if (!hit) {
        return s;
      }
      const copyQuestions = hit.lesson.quiz.questions.map((q) => ({
        ...q,
        id: generateId(),
        answers: q.answers.map((a) => ({ ...a, id: generateId() })),
        correctAnswerId: null,
      }));
      const dup: EditorLesson = {
        ...hit.lesson,
        id: generateId(),
        title: `${hit.lesson.title} (kopija)`,
        quiz: { ...hit.lesson.quiz, questions: copyQuestions },
      };
      const lessons = [...hit.module.lessons];
      lessons.splice(hit.lIdx + 1, 0, dup);
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === hit.module.id ? { ...m, lessons } : m,
        ),
        selectedLessonId: dup.id,
      };
    }),

  deleteLesson: (lessonId) =>
    set((s) => {
      const hit = findLesson(s.modules, lessonId);
      if (!hit || hit.module.lessons.length <= 1) {
        return s;
      }
      const lessons = hit.module.lessons.filter((l) => l.id !== lessonId);
      const nextSel = lessons[hit.lIdx]?.id ?? lessons[hit.lIdx - 1]?.id ?? null;
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === hit.module.id ? { ...m, lessons } : m,
        ),
        selectedLessonId: nextSel,
      };
    }),

  deleteModule: (moduleId) =>
    set((s) => {
      if (s.modules.length <= 1) {
        return s;
      }
      const modules = s.modules.filter((m) => m.id !== moduleId);
      const firstLesson = modules[0]?.lessons[0]?.id ?? null;
      return {
        modules: modules.map((m, i) => ({ ...m, order: i + 1 })),
        selectedLessonId: s.selectedLessonId && findLesson(modules, s.selectedLessonId)
          ? s.selectedLessonId
          : firstLesson,
      };
    }),

  updateModuleTitle: (moduleId, title) =>
    set((s) => ({
      modules: mapModules(s.modules, (m) => (m.id === moduleId ? { ...m, title } : m)),
    })),

  updateLessonTitle: (lessonId, title) =>
    set((s) => {
      const hit = findLesson(s.modules, lessonId);
      if (!hit) {
        return s;
      }
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === hit.module.id
            ? {
                ...m,
                lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, title } : l)),
              }
            : m,
        ),
      };
    }),

  patchLesson: (lessonId, patch) =>
    set((s) => {
      const hit = findLesson(s.modules, lessonId);
      if (!hit) {
        return s;
      }
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === hit.module.id
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId ? { ...l, ...patch } : l,
                ),
              }
            : m,
        ),
      };
    }),

  setLessonContentType: (lessonId, t) =>
    set((s) => {
      const hit = findLesson(s.modules, lessonId);
      if (!hit) {
        return s;
      }
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === hit.module.id
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId ? { ...l, contentType: t } : l,
                ),
              }
            : m,
        ),
      };
    }),

  reorderModules: (activeModuleId, overModuleId) =>
    set((s) => {
      const oldI = s.modules.findIndex((m) => m.id === activeModuleId);
      const newI = s.modules.findIndex((m) => m.id === overModuleId);
      if (oldI < 0 || newI < 0) {
        return s;
      }
      const modules = arrayMove([...s.modules], oldI, newI).map((m, i) => ({
        ...m,
        order: i + 1,
      }));
      return { modules };
    }),

  reorderLessons: (activeLessonId, overLessonId) =>
    set((s) => {
      const a = findLesson(s.modules, activeLessonId);
      const b = findLesson(s.modules, overLessonId);
      if (!a || !b || a.module.id !== b.module.id) {
        return s;
      }
      const lessons = [...a.module.lessons];
      const oldI = lessons.findIndex((l) => l.id === activeLessonId);
      const newI = lessons.findIndex((l) => l.id === overLessonId);
      if (oldI < 0 || newI < 0) {
        return s;
      }
      const next = arrayMove(lessons, oldI, newI);
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === a.module.id ? { ...m, lessons: next } : m,
        ),
      };
    }),

  patchExamConfig: (patch) =>
    set((s) => ({
      examConfig: { ...s.examConfig, ...patch },
    })),

  patchCertificateConfig: (patch) =>
    set((s) => {
      const base = s.certificateConfig;
      const pm =
        patch.pdfFieldMapping !== undefined
          ? { ...base.pdfFieldMapping, ...patch.pdfFieldMapping }
          : base.pdfFieldMapping;
      const ep0 = base.examPassCertificateDesigner;
      const epIn = patch.examPassCertificateDesigner;
      const examPassCertificateDesigner = epIn
        ? {
            ...ep0,
            ...epIn,
            pdfFieldMapping:
              epIn.pdfFieldMapping !== undefined
                ? { ...ep0.pdfFieldMapping, ...epIn.pdfFieldMapping }
                : ep0.pdfFieldMapping,
          }
        : ep0;
      const pc0 = base.personCertificationCertificateDesigner;
      const pcIn = patch.personCertificationCertificateDesigner;
      const personCertificationCertificateDesigner = pcIn
        ? {
            ...pc0,
            ...pcIn,
            pdfFieldMapping:
              pcIn.pdfFieldMapping !== undefined
                ? { ...pc0.pdfFieldMapping, ...pcIn.pdfFieldMapping }
                : pc0.pdfFieldMapping,
            levelTemplates:
              pcIn.levelTemplates !== undefined ? { ...pc0.levelTemplates, ...pcIn.levelTemplates } : pc0.levelTemplates,
          }
        : pc0;
      const { pdfFieldMapping: _p0, examPassCertificateDesigner: _e0, personCertificationCertificateDesigner: _c0, ...rest } =
        patch;
      return {
        certificateConfig: {
          ...base,
          ...rest,
          pdfFieldMapping: pm,
          examPassCertificateDesigner,
          personCertificationCertificateDesigner,
        },
      };
    }),

  replaceLessonQuiz: (lessonId, quiz) =>
    set((s) => {
      const hit = findLesson(s.modules, lessonId);
      if (!hit) {
        return s;
      }
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === hit.module.id
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId ? { ...l, quiz } : l,
                ),
              }
            : m,
        ),
      };
    }),

  addQuizQuestion: (lessonId) =>
    set((s) => {
      const hit = findLesson(s.modules, lessonId);
      if (!hit) {
        return s;
      }
      const q: EditorQuizQuestion = {
        id: generateId(),
        type: "multiple_choice",
        prompt: "",
        answers: [
          { id: generateId(), label: "Odgovor A" },
          { id: generateId(), label: "Odgovor B" },
        ],
        correctAnswerId: null,
      };
      const quiz: EditorQuizConfig = {
        ...hit.lesson.quiz,
        questions: [...hit.lesson.quiz.questions, q],
      };
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === hit.module.id
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId ? { ...l, quiz } : l,
                ),
              }
            : m,
        ),
      };
    }),

  reorderQuizQuestions: (lessonId, activeId, overId) =>
    set((s) => {
      const hit = findLesson(s.modules, lessonId);
      if (!hit) {
        return s;
      }
      const qs = [...hit.lesson.quiz.questions];
      const oi = qs.findIndex((q) => q.id === activeId);
      const ni = qs.findIndex((q) => q.id === overId);
      if (oi < 0 || ni < 0) {
        return s;
      }
      const questions = arrayMove(qs, oi, ni);
      const quiz = { ...hit.lesson.quiz, questions };
      return {
        modules: mapModules(s.modules, (m) =>
          m.id === hit.module.id
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId ? { ...l, quiz } : l,
                ),
              }
            : m,
        ),
      };
    }),
}));

/** Pomoć za komponente izvan store-a. */
export function findLessonInStore(
  modules: readonly EditorModule[],
  lessonId: string | null,
): EditorLesson | null {
  if (!lessonId) {
    return null;
  }
  return findLesson(modules, lessonId)?.lesson ?? null;
}
