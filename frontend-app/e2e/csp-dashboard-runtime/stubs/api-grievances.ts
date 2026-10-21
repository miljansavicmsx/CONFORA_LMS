/**
 * Vitest-local stub for missing `@/lib/api-grievances`.
 * Production must not ship a shim at `src/lib/api-grievances.ts` (DR4-08).
 * The grievances admin panel test replaces the list fetchers.
 */

export type ComplaintListItem = {
  complaintId: string;
  publicReference: string;
  userId: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AppealListItem = {
  appealId: string;
  publicReference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ComplaintDetail = ComplaintListItem;
export type AppealDetail = AppealListItem;

export async function acknowledgeAppeal(): Promise<void> {
  return undefined;
}

export async function acknowledgeComplaint(): Promise<void> {
  return undefined;
}

export async function fetchAdminComplaints(): Promise<ComplaintListItem[]> {
  return [];
}

export async function fetchAdminAppeals(): Promise<AppealListItem[]> {
  return [];
}

export async function fetchAdminComplaintDetail(): Promise<ComplaintDetail | null> {
  return null;
}

export async function fetchAdminAppealDetail(): Promise<AppealDetail | null> {
  return null;
}

export async function adminAssignComplaint(): Promise<void> {
  return undefined;
}

export async function adminAppealAssign(): Promise<void> {
  return undefined;
}

export async function adminDecideAppeal(): Promise<void> {
  return undefined;
}

export async function voidComplaint(): Promise<void> {
  return undefined;
}

export async function voidAppeal(): Promise<void> {
  return undefined;
}

export async function submitCertificationAppeal(): Promise<{ appealId: string }> {
  return { appealId: 'stub' };
}
