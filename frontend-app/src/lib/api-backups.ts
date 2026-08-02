import { api } from "@/lib/api";

export interface BackupStatus {
  enabled: boolean;
  provider: string;
  lastBackupAt: string | null;
  lastRestoreSmoke?: Record<string, unknown> | null;
  retentionDays: number;
  rpoHours: number;
  rtoHours: number;
}

export async function fetchBackupStatus(): Promise<BackupStatus> {
  const { data } = await api.get<BackupStatus>("/api/admin/backups/status");
  return data;
}

export async function runRestoreSmoke(): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>("/api/admin/backups/restore-smoke");
  return data ?? {};
}

