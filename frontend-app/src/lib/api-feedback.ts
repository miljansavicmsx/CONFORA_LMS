import { api } from "@/lib/api";

export interface FeedbackItem {
  id: string;
  tenantId?: string | null;
  userId?: string | null;
  title?: string | null;
  category: string;
  message: string;
  page?: string | null;
  severity: string;
  priority?: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  assignedTo?: string | null;
  resolutionNote?: string | null;
  assignmentNote?: string | null;
  internalNote?: string | null;
}

export async function submitFeedback(payload: {
  title?: string;
  category: string;
  message: string;
  page?: string;
  severity: string;
  priority?: string;
}): Promise<FeedbackItem> {
  const { data } = await api.post<FeedbackItem>("/api/feedback", payload);
  return data;
}

export async function fetchAdminFeedback(filters?: {
  category?: string;
  status?: string;
  severity?: string;
  page?: string;
}): Promise<FeedbackItem[]> {
  const { data } = await api.get<FeedbackItem[]>("/api/admin/feedback", { params: filters });
  return Array.isArray(data) ? data : [];
}

export async function updateFeedbackStatus(
  id: string,
  status: string,
  internalNote?: string,
): Promise<FeedbackItem> {
  const { data } = await api.put<FeedbackItem>(`/api/admin/feedback/${encodeURIComponent(id)}/status`, {
    status,
    ...(internalNote !== undefined && internalNote.trim() ? { internalNote: internalNote.trim() } : {}),
  });
  return data;
}

export async function assignFeedback(id: string, assignedTo: string, note?: string): Promise<FeedbackItem> {
  const { data } = await api.put<FeedbackItem>(`/api/admin/feedback/${encodeURIComponent(id)}/assign`, {
    assignedTo,
    note,
  });
  return data;
}

export async function resolveFeedback(id: string, resolutionNote: string): Promise<FeedbackItem> {
  const { data } = await api.put<FeedbackItem>(`/api/admin/feedback/${encodeURIComponent(id)}/resolve`, {
    resolutionNote,
  });
  return data;
}
