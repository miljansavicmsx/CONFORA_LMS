import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type QuizStatePhase = "idle" | "in_progress" | "completed";

export type QuizStoreState = {
  activeQuizId: string | null;
  currentQuestionIndex: number;
  answers: Map<string, unknown>;
  timeRemaining: number | null;
  quizState: QuizStatePhase;
  startQuiz: (quizId: string, options?: { timeLimitSeconds?: number | null }) => void;
  setAnswer: (questionId: string, answer: unknown) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: (deltaSeconds?: number) => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
};

export const useQuizStore = create<QuizStoreState>()(
  immer((set) => ({
    activeQuizId: null,
    currentQuestionIndex: 0,
    answers: new Map(),
    timeRemaining: null,
    quizState: "idle",

    startQuiz: (quizId, options) =>
      set((s) => {
        s.activeQuizId = quizId;
        s.currentQuestionIndex = 0;
        s.answers = new Map();
        s.quizState = "in_progress";
        const limit = options?.timeLimitSeconds;
        s.timeRemaining = limit != null && limit > 0 ? limit : null;
      }),

    setAnswer: (questionId, answer) =>
      set((s) => {
        s.answers.set(questionId, answer);
      }),

    nextQuestion: () =>
      set((s) => {
        s.currentQuestionIndex += 1;
      }),

    prevQuestion: () =>
      set((s) => {
        if (s.currentQuestionIndex > 0) s.currentQuestionIndex -= 1;
      }),

    tickTimer: (deltaSeconds = 1) =>
      set((s) => {
        if (s.timeRemaining == null || s.timeRemaining <= 0) return;
        s.timeRemaining = Math.max(0, s.timeRemaining - deltaSeconds);
      }),

    submitQuiz: () =>
      set((s) => {
        s.quizState = "completed";
        s.timeRemaining = null;
      }),

    resetQuiz: () =>
      set((s) => {
        s.activeQuizId = null;
        s.currentQuestionIndex = 0;
        s.answers = new Map();
        s.timeRemaining = null;
        s.quizState = "idle";
      }),
  })),
);
