import axios from "axios";

/** Poruka za korisnika — u produkciji bez sirovog HTTP teksta. */
export function formatApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (import.meta.env.DEV) {
      const base = error.message;
      const d = error.response?.data;
      let extra = "";
      if (d && typeof d === "object" && "detail" in d) {
        extra = String((d as { detail: unknown }).detail);
      } else if (d !== undefined) {
        try {
          extra = JSON.stringify(d);
        } catch {
          extra = String(d);
        }
      }
      const status = error.response?.status;
      return [base, status ? `HTTP ${status}` : null, extra || null].filter(Boolean).join(" — ");
    }
    return "Podaci trenutno nisu dostupni. Pokušajte ponovo za trenutak.";
  }
  if (error instanceof Error) {
    return import.meta.env.DEV ? error.message : "Došlo je do greške.";
  }
  return "Došlo je do nepoznate greške.";
}
