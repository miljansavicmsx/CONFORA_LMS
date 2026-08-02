/**
 * Admin / odbor — pregled i obrada support tiketa (ISO 17024).
 */

import { api } from "@/lib/api";
import {
  type SupportTicketResponse,
  type TicketStatus,
} from "@/lib/api-support";

export type { SupportTicketResponse, TicketStatus };

export type SupportTicketResolvePayload = {
  status: TicketStatus;
  adminResponse: string;
  incidentTag?: string;
  priority?: string;
  owner?: string;
  notes?: string;
  timelineEntry?: string;
};

export async function fetchAllTickets(status?: string, ticketType?: string): Promise<SupportTicketResponse[]> {
  const params: Record<string, string> = {};
  if (status !== undefined && status.trim() !== "" && status !== "ALL") {
    params.status = status.trim().toUpperCase();
  }
  if (ticketType?.trim()) {
    params.type = ticketType.trim().toUpperCase();
  }
  const { data } = await api.get<SupportTicketResponse[]>("/api/admin/support/tickets", {
    params: Object.keys(params).length ? params : undefined,
  });
  return Array.isArray(data) ? data : [];
}

export async function resolveTicket(
  ticketId: string,
  payload: SupportTicketResolvePayload,
): Promise<SupportTicketResponse> {
  const { data } = await api.put<SupportTicketResponse>(
    `/api/admin/support/tickets/${encodeURIComponent(ticketId)}`,
    {
      status: payload.status,
      adminResponse: payload.adminResponse,
      incidentTag: payload.incidentTag,
      priority: payload.priority,
      owner: payload.owner,
      notes: payload.notes,
      timelineEntry: payload.timelineEntry,
    },
  );
  return data;
}
