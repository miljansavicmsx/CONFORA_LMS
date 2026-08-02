import { z } from "zod";

import { TRAINING_DOMAIN_VALUES } from "@/admin/constants/training-domains";

const domainEnum = z.enum(TRAINING_DOMAIN_VALUES);
const courseLevelEnum = z.enum(["Pocetni", "Srednji", "Napredni"]);

function refinePromoVideoUrl(val: string, ctx: z.RefinementCtx): void {
  if (!val || val.trim() === "") {
    return;
  }
  try {
    const u = new URL(val);
    const h = u.hostname.replace(/^www\./, "");
    const ok =
      h === "youtube.com" ||
      h === "youtu.be" ||
      h === "m.youtube.com" ||
      h === "vimeo.com" ||
      h === "player.vimeo.com";
    if (!ok) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Samo YouTube ili Vimeo URL." });
    }
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Neispravan URL." });
  }
}

function plainTextFromHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || "").trim();
}

export const step1BasicInfoSchema = z
  .object({
    name: z.string().min(10, "Naziv: najmanje 10 znakova").max(120, "Najviše 120 znakova"),
    slug: z
      .string()
      .min(3)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: mala slova, brojevi i crtice"),
    domains: z.array(domainEnum).min(1, "Odaberite barem jednu oblast"),
    subtitle: z.string().max(200, "Podnaslov: najviše 200 znakova"),
    description: z.string().superRefine((html, ctx) => {
      const len = plainTextFromHtml(html).length;
      if (len < 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Opis: najmanje 100 znakova (trenutno ${len})`,
        });
      }
    }),
    learningGoals: z
      .array(z.string().min(1, "Cilj ne smije biti prazan"))
      .min(3, "Najmanje 3 cilja učenja")
      .max(10, "Najviše 10 ciljeva"),
    thumbnailDataUrl: z.string(),
    heroBannerDataUrl: z.string(),
    promoVideoUrl: z.string().superRefine(refinePromoVideoUrl),
    level: courseLevelEnum,
    durationHours: z.coerce
      .number()
      .int("Trajanje mora biti cijeli broj sati")
      .min(1, "Najmanje 1 sat")
      .max(10000, "Najviše 10000 sati"),
    price: z.coerce.number().min(0, "Cijena mora biti ≥ 0"),
    currency: z.enum(["EUR", "USD", "BAM"]),
    accessType: z.enum(["lifetime", "yearly", "custom"]),
    customAccessMonths: z.coerce.number().min(1).max(120).optional(),
    certificationType: z.enum(["none", "confora", "external"]),
    examQuestionCount: z.coerce.number().int().min(1).max(500),
    passingScorePct: z.coerce.number().min(1).max(100),
    examAttempts: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5), z.literal("unlimited")]),
    examTimeLimitMinutes: z.coerce.number().int().min(1).max(600).optional(),
    examNoTimeLimit: z.boolean(),
    examCooldown: z.enum(["immediate", "12h", "24h", "48h", "7d"]),
    examRandomOrder: z.boolean(),
    examShowResults: z.boolean(),
    certValidityMonths: z.coerce.number().int().min(1).max(120).optional(),
    certLifetime: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.accessType === "custom") {
      const m = data.customAccessMonths;
      if (m === undefined || Number.isNaN(m) || m < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Za prilagođeni pristup unesite trajanje u mjesecima (1–120).",
          path: ["customAccessMonths"],
        });
      }
    }
    if (data.certificationType !== "none") {
      if (data.passingScorePct < 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Prolaznost ispod 50% nije dozvoljena za certificiranu obuku.",
          path: ["passingScorePct"],
        });
      }
      if (
        !data.certLifetime &&
        (data.certValidityMonths === undefined || Number.isNaN(data.certValidityMonths) || data.certValidityMonths < 1)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Unesite valjanost certifikata u mjesecima ili odaberite Doživotno.",
          path: ["certValidityMonths"],
        });
      }
    }
    if (!data.examNoTimeLimit) {
      const t = data.examTimeLimitMinutes;
      if (t === undefined || Number.isNaN(t) || t < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Unesite vremenski limit ili uključite „Bez limita”.",
          path: ["examTimeLimitMinutes"],
        });
      }
    }
  });

export type Step1BasicInfoFormValues = z.infer<typeof step1BasicInfoSchema>;

export const step1DefaultValues: Step1BasicInfoFormValues = {
  name: "",
  slug: "",
  domains: [],
  subtitle: "",
  description: "<p></p>",
  learningGoals: ["", "", ""],
  thumbnailDataUrl: "",
  heroBannerDataUrl: "",
  promoVideoUrl: "",
  level: "Srednji",
  durationHours: 24,
  price: 0,
  currency: "EUR",
  accessType: "lifetime",
  customAccessMonths: 12,
  certificationType: "none",
  examQuestionCount: 20,
  passingScorePct: 70,
  examAttempts: 3,
  examTimeLimitMinutes: 60,
  examNoTimeLimit: false,
  examCooldown: "24h",
  examRandomOrder: true,
  examShowResults: true,
  certValidityMonths: 24,
  certLifetime: false,
};
