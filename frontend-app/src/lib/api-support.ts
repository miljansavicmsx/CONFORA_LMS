/**
 * Podrška i kontakt — tiketi (`/api/support`).
 */

import { api } from "@/lib/api";

export type TicketType =
  | "TECHNICAL_SUPPORT"
  | "COMPLAINT"
  | "APPEAL"
  | "SUGGESTION"
  | "IMPROVEMENT_PROPOSAL"
  | "TRAINING_PROPOSAL";

/** API mapira stare statuse (RESOLVED, …) na kanonsku četvorku gdje može */
export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_USER"
  | "CLOSED"
  | "UNDER_REVIEW"
  | "AWAITING_RESPONSE"
  | "RESOLVED"
  | "REJECTED";

export interface SupportTicketTimelineEntry {
  at?: string;
  text?: string;
  kind?: string;
  visibleToUser?: boolean;
}

export interface SupportTicketResponse {
  ticketId: string;
  userId: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  tenantId?: string | null;
  source?: string | null;
  attachmentObjectKey?: string | null;
  type: TicketType | string;
  subject: string;
  message?: string | null;
  status: TicketStatus | string;
  adminResponse?: string | null;
  relatedApplicationId?: string | null;
  createdAt: string;
  updatedAt: string;
  incidentTag?: string | null;
  priority?: string | null;
  owner?: string | null;
  notes?: string | null;
  supportTimeline?: SupportTicketTimelineEntry[];
}

export interface SupportTicketCreatePayload {
  type: TicketType;
  subject: string;
  message: string;
  gdprConsentAccepted: true;
  firstName?: string;
  lastName?: string;
  attachmentObjectKey?: string;
  relatedApplicationId?: string;
}

export async function fetchMyTickets(): Promise<SupportTicketResponse[]> {
  const { data } = await api.get<SupportTicketResponse[]>("/api/support/my-tickets");
  return Array.isArray(data) ? data : [];
}

export type LearnerSupportTicketsResult = {
  readonly tickets: readonly SupportTicketResponse[];
  readonly unavailable: boolean;
};

/** Graceful learner ticket load — empty when none; unavailable flag on API failure. */
export async function fetchLearnerSupportTickets(): Promise<LearnerSupportTicketsResult> {
  try {
    const tickets = await fetchMyTickets();
    return { tickets, unavailable: false };
  } catch {
    return { tickets: [], unavailable: true };
  }
}

export async function fetchMyTicketById(ticketId: string): Promise<SupportTicketResponse> {
  const id = ticketId.trim();
  const { data } = await api.get<SupportTicketResponse>(`/api/support/tickets/${encodeURIComponent(id)}`);
  return data;
}

export async function createTicket(payload: SupportTicketCreatePayload): Promise<SupportTicketResponse> {
  const { data } = await api.post<SupportTicketResponse>("/api/support/tickets", payload);
  return data;
}
