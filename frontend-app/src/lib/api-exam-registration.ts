import { api } from "@/lib/api";

import { getConforaApiConfig } from "@/lib/api/api-config";



export type LearnerExamRegistrationEligibilityStatus =

  | "ELIGIBLE_TO_REGISTER"

  | "ALREADY_REGISTERED"

  | "ALREADY_PASSED"

  | "BLOCKED_EDUCATION_NOT_COMPLETED"

  | "BLOCKED_NO_ACTIVE_EXAM"

  | "BLOCKED_NO_AVAILABLE_SESSION"

  | "BLOCKED_IDENTITY_VERIFICATION_REQUIRED"

  | "BLOCKED_PAYMENT_REQUIRED"

  | "NOT_APPLICABLE";



export type LearnerExamRegistrationAvailableItem = {

  readonly courseId: string;

  readonly courseTitle: string;

  readonly examId: string;

  readonly examTitle: string;

  readonly examType: string | null;

  readonly language: string | null;

  readonly deliveryMode: string | null;

  readonly canRegister: boolean;

  readonly eligibilityStatus: LearnerExamRegistrationEligibilityStatus;

  readonly learnerLabel: string;

  readonly nextStep: string;

  readonly availableSessions: ReadonlyArray<{

    readonly sessionId: string;

    readonly startsAt: string | null;

    readonly deliveryMode: string;

    readonly location: string | null;

    readonly capacityAvailable: boolean;

  }>;

};



export type LearnerExamRegistrationItem = {

  readonly registrationId: string;

  readonly examTitle: string;

  readonly courseTitle: string;

  readonly courseId: string;

  readonly examId: string;

  readonly status: string;

  readonly learnerLabel: string;

  readonly registeredAt: string | null;

  readonly scheduledAt: string | null;

  readonly deliveryMode: string | null;

  readonly location: string | null;

  readonly nextStep: string;

};



export type LearnerExamRegistrationBlockedItem = {

  readonly courseId: string;

  readonly courseTitle: string;

  readonly examId: string | null;

  readonly examTitle: string | null;

  readonly eligibilityStatus: LearnerExamRegistrationEligibilityStatus;

  readonly learnerLabel: string;

  readonly reason: string;

  readonly nextStep: string;

};



export type LearnerExamRegistrationOptionsResponse = {

  readonly contractVersion: string;

  readonly available: readonly LearnerExamRegistrationAvailableItem[];

  readonly registrations: readonly LearnerExamRegistrationItem[];

  readonly blocked: readonly LearnerExamRegistrationBlockedItem[];

};



export type CreateExamRegistrationResponse = {

  readonly contractVersion: string;

  readonly registration: LearnerExamRegistrationItem;

  readonly created: boolean;

  readonly message: string;

};



function usesNestExamRegistration(): boolean {

  const provider = getConforaApiConfig().provider;

  return provider === "nest" || provider === "hybrid";

}



export async function fetchExamRegistrationOptions(): Promise<LearnerExamRegistrationOptionsResponse> {

  if (!usesNestExamRegistration()) {

    return { contractVersion: "0", available: [], registrations: [], blocked: [] };

  }

  const { data } = await api.get<LearnerExamRegistrationOptionsResponse>("/v1/me/exams/registration-options");

  return data;

}



export async function fetchMyExamRegistrations(): Promise<readonly LearnerExamRegistrationItem[]> {

  if (!usesNestExamRegistration()) {

    return [];

  }

  const { data } = await api.get<{ items: readonly LearnerExamRegistrationItem[] }>(

    "/v1/me/exams/registrations",

  );

  return data.items ?? [];

}



export async function createExamRegistration(input: {

  courseId: string;

  examId?: string;

}): Promise<CreateExamRegistrationResponse> {

  const { data } = await api.post<CreateExamRegistrationResponse>("/v1/me/exams/registrations", input);

  return data;

}

