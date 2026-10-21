import { api } from "@/lib/api";

export type ExamChoice = {
  readonly choiceKey: string;
  readonly text: string;
  readonly isCorrect?: boolean;
};

export type SchemeExamItem = {
  readonly id: string;
  readonly schemeId: string;
  readonly version: number;
  readonly stem: string;
  readonly itemType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  readonly status: "DRAFT" | "REVIEW" | "APPROVED" | "RETIRED";
  readonly domainCode: string;
  readonly exposureCount: number;
  readonly choices: readonly ExamChoice[];
};

export type ExamBlueprint = {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly schemeCode: string;
  readonly durationSeconds: number;
  readonly retakeWindowDays: number;
  readonly cutScoreBasisPoints: number | null;
  readonly domains: readonly {
    readonly domainCode: string;
    readonly title: string;
    readonly weightBasisPoints: number;
    readonly itemCount: number;
  }[];
};

export type CandidateSessionSummary = {
  readonly sessionId: string;
  readonly title: string;
  readonly status: string;
  readonly scheduledStartAt: string;
  readonly provisional: boolean | null;
  readonly passed: boolean | null;
  readonly decided: boolean;
};

export type CandidateExamItem = {
  readonly id: string;
  readonly domainCode: string;
  readonly stem: string;
  readonly itemType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  readonly choices: readonly { readonly choiceKey: string; readonly text: string }[];
  readonly selectedKeys: readonly string[];
};

export type CandidateExamSession = {
  readonly sessionId: string;
  readonly status: string;
  readonly remainingSeconds: number;
  readonly items: readonly CandidateExamItem[];
};

export type ExamResultView = {
  readonly sessionId: string;
  readonly passed: boolean;
  readonly provisional: boolean;
  readonly scoreBasisPoints: number;
  readonly domains: readonly { readonly domainCode: string; readonly correct: number; readonly total: number }[];
  readonly certificateIssued: boolean;
};

export type DecisionQueueItem = {
  readonly resultId: string;
  readonly sessionId: string;
  readonly schemeCode: string;
  readonly passed: boolean;
  readonly provisional: boolean;
  readonly scoreBasisPoints: number;
  readonly scoredAt: string;
};

export async function fetchSchemeItems(schemeId: string): Promise<readonly SchemeExamItem[]> {
  const { data } = await api.get<readonly SchemeExamItem[]>("/v1/staff/exams/items", {
    params: schemeId ? { schemeId } : {},
  });
  return data;
}

export async function createSchemeItem(body: {
  schemeId: string;
  stem: string;
  itemType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  domainCode: string;
  choices: readonly { choiceKey: string; text: string; isCorrect: boolean }[];
  competenceIds: readonly string[];
}): Promise<{ itemId: string }> {
  const { data } = await api.post<{ itemId: string }>("/v1/staff/exams/items", body);
  return data;
}

export async function transitionSchemeItem(itemId: string, toStatus: SchemeExamItem["status"]): Promise<void> {
  await api.post(`/v1/staff/exams/items/${itemId}/transitions`, { toStatus });
}

export async function fetchBlueprints(): Promise<readonly ExamBlueprint[]> {
  const { data } = await api.get<readonly ExamBlueprint[]>("/v1/staff/exams/blueprints");
  return data;
}

export async function createBlueprint(body: {
  schemeVersionId: string;
  title: string;
  durationSeconds: number;
  retakeWindowDays: number;
}): Promise<{ blueprintId: string }> {
  const { data } = await api.post<{ blueprintId: string }>("/v1/staff/exams/blueprints", body);
  return data;
}

export async function setBlueprintDomains(
  blueprintId: string,
  domains: ExamBlueprint["domains"],
): Promise<void> {
  await api.post(`/v1/staff/exams/blueprints/${blueprintId}/domains`, { domains });
}

export async function openStandardSetting(blueprintId: string, note: string): Promise<{ recordId: string }> {
  const { data } = await api.post<{ recordId: string }>(
    `/v1/staff/exams/blueprints/${blueprintId}/standard-setting`,
    { note },
  );
  return data;
}

export async function fetchMyExamSessions(): Promise<readonly CandidateSessionSummary[]> {
  const { data } = await api.get<readonly CandidateSessionSummary[]>("/v1/me/exams/sessions");
  return data;
}

export async function startExamSession(sessionId: string): Promise<void> {
  await api.post(`/v1/me/exams/sessions/${sessionId}/start`, { rulesAccepted: true, ndaAccepted: true });
}

export async function fetchExamSession(sessionId: string): Promise<CandidateExamSession> {
  const { data } = await api.get<CandidateExamSession>(`/v1/me/exams/sessions/${sessionId}`);
  return data;
}

export async function saveExamAnswers(
  sessionId: string,
  answers: readonly { itemId: string; selectedKeys: readonly string[] }[],
): Promise<void> {
  await api.put(`/v1/me/exams/sessions/${sessionId}/answers`, { answers });
}

export async function submitExamSession(sessionId: string): Promise<ExamResultView> {
  const { data } = await api.post<ExamResultView>(`/v1/me/exams/sessions/${sessionId}/submit`);
  return data;
}

export async function fetchExamResult(sessionId: string): Promise<ExamResultView> {
  const { data } = await api.get<ExamResultView>(`/v1/me/exams/sessions/${sessionId}/result`);
  return data;
}

export async function fetchDecisionQueue(): Promise<readonly DecisionQueueItem[]> {
  const { data } = await api.get<readonly DecisionQueueItem[]>("/v1/committee/exams/queue");
  return data;
}

export async function recordExamDecision(body: {
  resultId: string;
  outcome: "GRANT" | "DENY";
  rationale: string;
}): Promise<{ certificateIssued: boolean }> {
  const { data } = await api.post<{ certificateIssued: boolean }>("/v1/committee/exams/decisions", body);
  return data;
}
