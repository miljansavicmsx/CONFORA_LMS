export type ModuleProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | string | null | undefined;

/** A display-only mapping. Unknown or unavailable progress is never presented as completed. */
export function moduleProgressLabel(status: ModuleProgressStatus): string {
  switch (status) {
    case "COMPLETED": return "Završeno";
    case "IN_PROGRESS": return "U toku";
    case "NOT_STARTED": return "Nije započeto";
    default: return "Status nije dostupan";
  }
}
