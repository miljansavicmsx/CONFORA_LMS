import type { CourseListRow } from "@/lib/enrich-course-detail";

export type DashboardCategoryId =
  | "all"
  | "informacijska-sigurnost"
  | "kvalitet"
  | "upravljanje-rizikom"
  | "cloud";

export const DASHBOARD_CATEGORY_FILTERS: readonly {
  readonly id: DashboardCategoryId;
  readonly label: string;
}[] = [
  { id: "all", label: "Sve oblasti" },
  { id: "informacijska-sigurnost", label: "Informacijska sigurnost" },
  { id: "kvalitet", label: "Kvalitet" },
  { id: "upravljanje-rizikom", label: "Upravljanje rizikom" },
  { id: "cloud", label: "Cloud" },
] as const;

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** Određuje pripada li red kataloga odabranoj oblasti (osim „Sve oblasti”). */
export function courseMatchesDashboardCategory(
  row: CourseListRow,
  categoryId: DashboardCategoryId,
): boolean {
  if (categoryId === "all") {
    return true;
  }
  const domain = norm(row.domain ?? "");
  const title = norm(row.title);
  const slug = norm(row.categorySlug ?? "");

  switch (categoryId) {
    case "informacijska-sigurnost":
      return (
        domain.includes("sigurnost") ||
        domain.includes("isms") ||
        domain.includes("cyber") ||
        domain.includes("informacijsk") ||
        title.includes("27001") ||
        slug.includes("27001") ||
        slug.includes("cyber")
      );
    case "kvalitet":
      return (
        domain.includes("kvalitet") ||
        title.includes("9001") ||
        slug.includes("9001") ||
        domain.includes("upravljanje kvalitetom")
      );
    case "upravljanje-rizikom":
      return (
        domain.includes("rizik") ||
        domain.includes("risk") ||
        title.includes("rizik") ||
        slug.includes("rizic") ||
        slug.includes("risk")
      );
    case "cloud":
      return (
        domain.includes("cloud") ||
        title.includes("cloud") ||
        slug.includes("cloud")
      );
    default:
      return true;
  }
}
