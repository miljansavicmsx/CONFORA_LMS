/** Stanje tijeka kviza u QuizEngine. */
export type QuizPhase = "loading" | "intro" | "in_progress" | "reviewing" | "completed";

export interface QuizEngineConfig {
  readonly timeLimit?: number;
  readonly shuffleQuestions: boolean;
  readonly showResultsAfter: "immediately" | "end" | "never";
  readonly passingScorePct: number;
}

export interface QuizResult {
  readonly quizId: string;
  readonly courseId: string;
  readonly moduleId: string;
  readonly scoreCorrect: number;
  readonly scoreTotal: number;
  readonly scorePct: number;
  readonly passed: boolean;
  readonly durationSeconds: number;
  readonly answers: readonly QuizAnswerRecord[];
}

export interface QuizAnswerRecord {
  readonly questionId: string;
  readonly correct: boolean;
  readonly userAnswer: unknown;
  readonly correctAnswer: unknown;
}

export interface QuizEngineProps {
  readonly quizId: string;
  readonly moduleId: string;
  readonly courseId: string;
  readonly config: QuizEngineConfig;
  readonly onComplete: (result: QuizResult) => void;
  /** Ako je zadano, prikazuje se „Nastavi na sljedeći modul”. */
  readonly onContinueNextModule?: () => void;
}

export interface QuizOption {
  readonly id: string;
  readonly label: string;
}

export type QuizQuestion =
  | {
      readonly type: "mcq";
      readonly id: string;
      readonly prompt: string;
      readonly options: readonly QuizOption[];
      readonly correctOptionId: string;
      readonly explanation: string;
    }
  | {
      readonly type: "mca";
      readonly id: string;
      readonly prompt: string;
      readonly options: readonly QuizOption[];
      readonly correctOptionIds: readonly string[];
      readonly explanation: string;
    }
  | {
      readonly type: "true_false";
      readonly id: string;
      readonly prompt: string;
      readonly correct: boolean;
      readonly explanation: string;
    }
  | {
      readonly type: "fill_blank";
      readonly id: string;
      readonly prompt: string;
      readonly acceptableAnswers: readonly string[];
      readonly explanation: string;
      readonly caseSensitive?: boolean;
    };

export interface QuizPayload {
  readonly title: string;
  readonly questions: readonly QuizQuestion[];
}
