import { api } from "@/lib/api";

export interface SubscriptionItem {
  id: string;
  tenantId: string;
  planId: string;
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | string;
  seats: number;
  priceMonthly: number;
  currency: string;
  billingCycle: string;
  renewAt?: string | null;
  /** Stripe / naplata: live | config_blocker */
  providerStatus?: string;
  providerReason?: string | null;
  storageStatus?: "ok" | "unavailable" | string;
  storageMessage?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  invoiceReference?: string | null;
}

export async function fetchMySubscription(): Promise<SubscriptionItem> {
  const { data } = await api.get<SubscriptionItem>("/api/billing/my-subscription");
  return data;
}

export async function changePlan(planId: string): Promise<SubscriptionItem> {
  const { data } = await api.post<SubscriptionItem>("/api/billing/change-plan", { planId });
  return data;
}

export async function cancelSubscription(): Promise<SubscriptionItem> {
  const { data } = await api.post<SubscriptionItem>("/api/billing/cancel");
  return data;
}

export async function requestInvoice(planId: string): Promise<{ invoiceId: string; status: string }> {
  const { data } = await api.post<{ invoiceId: string; status: string }>("/api/billing/request-invoice", {
    planId,
    message: "Invoice requested from billing page",
  });
  return data;
}

export async function manualActivateTenant(payload: {
  tenantId: string;
  planId: string;
  seats: number;
  priceMonthly: number;
  billingCycle?: string;
  activationReason?: string;
  approvedBy?: string;
  invoiceReference?: string;
  validFrom?: string;
  validUntil?: string;
  note?: string;
}): Promise<SubscriptionItem> {
  const { data } = await api.post<SubscriptionItem>("/api/billing/manual-activate", payload);
  return data;
}

