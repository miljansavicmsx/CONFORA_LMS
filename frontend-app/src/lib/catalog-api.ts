import { api } from "@/lib/api";
import {
  fetchPublicCatalogCourses,
  type PublicCatalogCourseRow,
} from "@/lib/api/public-catalog-client";

/** Red iz GET /api/courses (camelCase, usklađeno s CoursePublic). */
export type PublishedCourseDto = PublicCatalogCourseRow;

export async function fetchPublishedCourses(): Promise<PublishedCourseDto[]> {
  const result = await fetchPublicCatalogCourses();
  if (result.kind === "ok") {
    return result.data;
  }
  return [];
}

export interface CreateCheckoutSessionResponse {
  readonly checkoutUrl: string;
}

export type CheckoutSessionBody = {
  readonly courseId?: string;
  readonly courseIds?: readonly string[];
};

/**
 * Stripe Checkout — zahtijeva prijavljenog korisnika (Bearer).
 * Backend: POST /payments/create-session, body { courseId } i/ili { courseIds }.
 */
export async function createCheckoutSession(
  input: string | CheckoutSessionBody,
): Promise<string> {
  const body: Record<string, unknown> =
    typeof input === "string" ? { courseId: input } : { ...input };
  const { data } = await api.post<CreateCheckoutSessionResponse>("/payments/create-session", body);
  const url = data?.checkoutUrl?.trim();
  if (!url) {
    throw new Error("checkout_url_missing");
  }
  return url;
}
