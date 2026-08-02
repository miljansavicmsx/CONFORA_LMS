import { api } from "@/lib/api";

/** In-app row from Nest `GET /v1/notifications/me/in-app`. */
export interface NotificationItem {
  id: string;
  userId: string;
  eventKey: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
  payload?: unknown;
}

export interface NotificationPreferences {
  userId: string;
  locale: string;
  channels: Record<string, { email?: boolean; inApp?: boolean; sms?: boolean }>;
}

export interface NotificationTemplateRow {
  id: string;
  eventKey: string;
  locale: string;
  version: number;
  subject: string;
  mjmlBody: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchMyNotifications(): Promise<NotificationItem[]> {
  const { data } = await api.get<NotificationItem[]>("/v1/notifications/me/in-app");
  return Array.isArray(data) ? data : [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/v1/notifications/me/in-app/${encodeURIComponent(id)}/read`);
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await api.get<NotificationPreferences>("/v1/notifications/me/preferences");
  return data;
}

export async function updateNotificationPreferences(
  body: Partial<Pick<NotificationPreferences, "locale" | "channels">>,
): Promise<NotificationPreferences> {
  const { data } = await api.put<NotificationPreferences>("/v1/notifications/me/preferences", body);
  return data;
}

export async function fetchAdminNotificationTemplates(): Promise<NotificationTemplateRow[]> {
  const { data } = await api.get<NotificationTemplateRow[]>("/v1/notifications/admin/templates");
  return Array.isArray(data) ? data : [];
}

export async function createNotificationTemplateDraft(body: {
  eventKey: string;
  locale: string;
  subject: string;
  mjmlBody: string;
}): Promise<NotificationTemplateRow> {
  const { data } = await api.post<NotificationTemplateRow>("/v1/notifications/admin/templates", body);
  return data;
}

export async function submitNotificationTemplate(id: string): Promise<{ id: string; status: string }> {
  const { data } = await api.post<{ id: string; status: string }>(
    `/v1/notifications/admin/templates/${encodeURIComponent(id)}/submit`,
  );
  return data;
}

export async function publishNotificationTemplate(id: string): Promise<{ id: string; status: string } | { error: string }> {
  const { data } = await api.post<{ id: string; status: string } | { error: string }>(
    `/v1/notifications/admin/templates/${encodeURIComponent(id)}/publish`,
  );
  return data;
}
