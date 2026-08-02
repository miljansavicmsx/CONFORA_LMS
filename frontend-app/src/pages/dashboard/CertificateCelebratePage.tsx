import { motion } from "framer-motion";
import { Check, Copy, Linkedin, Loader2, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate, useOutletContext } from "react-router";

import { CourseCard } from "@/components/CourseCard";
import type { CoursePathwayTier } from "@/lib/course-pathway";
import { Button } from "@/components/ui/button";
import type { DashboardCourseCardModel } from "@/lib/dashboard-home-api";
import { cn } from "@/lib/utils";

import type { DashboardOutletContext } from "./dashboard-outlet-context";

const CONFETTI_STORAGE_KEY = "confora_lms_cert_trophy_confetti_v1";

const COURSE_TITLE = "ISO 27001 Lead Implementer";
const SCORE_PCT = 87;
const ISSUED_DATE = new Date(2026, 3, 3);
const DURATION_LABEL = "32h";

function firstName(full: string): string {
  const t = full.trim();
  if (!t) {
    return "Korisniče";
  }
  return t.split(/\s+/)[0] ?? t;
}

function formatDateBs(d: Date): string {
  return new Intl.DateTimeFormat("bs-BA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

const THUMB = (slug: string) =>
  `https://images.unsplash.com/photo-${slug}?w=640&h=360&fit=crop`;

const baseExam = {
  questionsCount: 40,
  passingScore: 70,
  attemptsAllowed: 3,
} as const;

const RELATED_COURSES: readonly (DashboardCourseCardModel & {
  readonly pathwayTier: CoursePathwayTier;
  readonly catalogStatus: string;
  readonly hasFinalExam: boolean;
})[] = [
  {
    courseId: "c-iso-9001",
    slug: "iso-9001-foundation",
    title: "ISO 9001 Foundation",
    thumbnailUrl: THUMB("1504384308090-c894fdcc538d"),
    domain: "Kvalitet",
    level: "Pocetni",
    durationHours: 16,
    modulesCount: 8,
    price: 249,
    currency: "BAM",
    pathwayTier: "education_exam_pass_and_certification",
    catalogStatus: "published",
    hasFinalExam: true,
    badges: ["preporuceno", "novo"],
    examInfo: baseExam,
  },
  {
    courseId: "c-gdpr",
    slug: "gdpr-prakticno",
    title: "GDPR u praksi",
    thumbnailUrl: THUMB("1563986768609-9d536c95f6fb"),
    domain: "Compliance",
    level: "Srednji",
    durationHours: 12,
    modulesCount: 6,
    price: 189,
    currency: "BAM",
    pathwayTier: "education_only",
    catalogStatus: "published",
    hasFinalExam: false,
    badges: ["preporuceno"],
  },
  {
    courseId: "c-isms",
    slug: "isms-internal-audit",
    title: "ISMS interna revizija",
    thumbnailUrl: THUMB("1516321310781-e5f09fb90d82"),
    domain: "ISO 27001",
    level: "Ekspertni",
    durationHours: 24,
    modulesCount: 10,
    price: 399,
    currency: "BAM",
    pathwayTier: "education_exam_pass_proof",
    catalogStatus: "published",
    hasFinalExam: true,
    badges: ["preporuceno", "bestseller"],
    discountPct: 15,
    examInfo: baseExam,
  },
];

function CertificateQrPlaceholder({ seed }: { readonly seed: string }): JSX.Element {
  const cells = useMemo(() => {
    const out: boolean[] = [];
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    }
    for (let i = 0; i < 196; i++) {
      h = (h * 1103515245 + 12345) >>> 0;
      out.push((h & 1) === 1);
    }
    return out;
  }, [seed]);

  return (
    <svg
      viewBox="0 0 84 84"
      className="h-20 w-20 shrink-0 rounded-md border border-slate-200 bg-white"
      aria-hidden
    >
      {cells.map((on, i) => {
        const col = i % 14;
        const row = Math.floor(i / 14);
        if (!on) {
          return null;
        }
        return (
          <rect
            key={i}
            x={3 + col * 5.5}
            y={3 + row * 5.5}
            width={4.5}
            height={4.5}
            fill="#0F172A"
          />
        );
      })}
    </svg>
  );
}

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
} as const;

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

export default function CertificateCelebratePage(): JSX.Element {
  const { user } = useOutletContext<DashboardOutletContext>();
  const navigate = useNavigate();
  const nameFirst = useMemo(() => firstName(user.name), [user.name]);
  const fullNameDisplay = user.name.trim() || "Korisnik";

  const certificateId = useMemo(() => {
    const base = user.email || "confora";
    let h = 0;
    for (let i = 0; i < base.length; i++) {
      h = (h * 31 + base.charCodeAt(i)) >>> 0;
    }
    const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
    return `CONF-LMS-2026-${hex}`;
  }, [user.email]);

  const verificationUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/verify/${encodeURIComponent(certificateId)}`;
  }, [certificateId]);

  const linkedInShareText = useMemo(
    () =>
      `Položio/la sam ${COURSE_TITLE} ispit na @CONFORA platforma! 🎓 #ISO27001 #Certifikacija`,
    [],
  );

  const [pdfPhase, setPdfPhase] = useState<"idle" | "loading" | "ready">("idle");
  const [copyDone, setCopyDone] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (localStorage.getItem(CONFETTI_STORAGE_KEY)) {
      return;
    }
    localStorage.setItem(CONFETTI_STORAGE_KEY, "1");

    let cancelled = false;
    void import("canvas-confetti").then((mod) => {
      if (cancelled) {
        return;
      }
      const confetti = mod.default;
      const colors = ["#0EA5E9", "#FBBF24", "#FCD34D", "#E2E8F0", "#34D399", "#F59E0B"];
      void confetti({
        particleCount: 110,
        spread: 78,
        origin: { y: 0.42 },
        colors,
        ticks: 220,
        gravity: 0.9,
        scalar: 1.05,
      });
      window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        void confetti({
          particleCount: 55,
          angle: 55,
          spread: 50,
          origin: { x: 0.12, y: 0.68 },
          colors,
          ticks: 200,
        });
        void confetti({
          particleCount: 55,
          angle: 125,
          spread: 50,
          origin: { x: 0.88, y: 0.68 },
          colors,
          ticks: 200,
        });
      }, 200);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePdfClick = useCallback(() => {
    if (pdfPhase === "ready") {
      window.print();
      return;
    }
    if (pdfPhase !== "idle") {
      return;
    }
    setPdfPhase("loading");
    window.setTimeout(() => {
      setPdfPhase("ready");
    }, 1900);
  }, [pdfPhase]);

  const handleLinkedIn = useCallback(async () => {
    const payload = { text: linkedInShareText, url: verificationUrl, title: "CONFORA certifikat" };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        /* korisnik otkazao ili share nije podržan za payload */
      }
    }
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
    try {
      await navigator.clipboard.writeText(`${linkedInShareText}\n${verificationUrl}`);
    } catch {
      /* clipboard možda nedostupan */
    }
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  }, [linkedInShareText, verificationUrl]);

  const handleCopyVerify = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  }, [verificationUrl]);

  const goLearn = useCallback(
    (courseId: string) => {
      navigate(`/learn/${encodeURIComponent(courseId)}`);
    },
    [navigate],
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-16 text-text-primary">
      {/* zvjezdani / gradient hero */}
      <div className="relative overflow-hidden border-b border-border/40 bg-surface-primary">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 20% 30%, rgb(148 163 184 / 0.35), transparent),
              radial-gradient(1px 1px at 60% 70%, rgb(14 165 233 / 0.25), transparent),
              radial-gradient(1px 1px at 80% 20%, rgb(248 250 252 / 0.2), transparent)`,
            backgroundSize: "120px 120px, 180px 180px, 200px 200px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-30%,rgba(14,165,233,0.35),transparent_55%)]" />

        <motion.div
          className="relative z-10 mx-auto max-w-3xl px-4 py-14 text-center md:py-20"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={heroItem} className="mb-6 flex justify-center">
            <div className="animate-cf-trophy-sway rounded-full bg-gradient-to-b from-amber-400/25 to-brand/20 p-6 ring-2 ring-amber-400/30 ring-offset-4 ring-offset-surface-primary">
              <Trophy className="h-24 w-24 text-amber-300 drop-shadow-[0_8px_24px_rgba(251,191,36,0.35)]" strokeWidth={1.25} />
            </div>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            <span className="bg-gradient-to-r from-brand via-sky-300 to-amber-200 bg-clip-text text-transparent">
              🎉 Čestitamo, {nameFirst}!
            </span>
          </motion.h1>

          <motion.p variants={heroItem} className="mt-4 text-xl text-text-secondary">
            Položio/la si ispit i stekao/la certifikat!
          </motion.p>

          <motion.div variants={heroItem} className="mt-8 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-5 py-2.5 text-sm font-medium text-emerald-200 shadow-sm">
              <span aria-hidden>📊</span>
              <span>
                Rezultat: {SCORE_PCT}% · {formatDateBs(ISSUED_DATE)} · {COURSE_TITLE}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          id="cf-cert-print-root"
          className="overflow-hidden rounded-2xl border-[6px] border-brand bg-white shadow-elevated ring-2 ring-brand/30 ring-inset"
        >
          <div className="bg-brand px-6 py-5 text-center text-white">
            <p className="text-lg font-bold tracking-wide">CONFORA</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              POTVRDA O ZAVRŠENOJ OBUCI
            </p>
          </div>

          <div className="px-8 pb-8 pt-10 text-slate-800">
            <p className="text-center text-sm text-slate-600">Ovime se potvrđuje da je</p>
            <p className="mt-3 text-center text-3xl font-bold uppercase tracking-wide text-brand">
              {fullNameDisplay}
            </p>
            <p className="mt-4 text-center text-sm text-slate-600">uspješno završio/la obuku:</p>
            <p className="mt-2 text-center text-xl font-bold text-slate-900">{COURSE_TITLE}</p>

            <div className="mt-10 grid grid-cols-1 gap-4 border-y border-slate-200 py-6 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Datum</p>
                <p className="mt-1 font-medium text-slate-900">{formatDateBs(ISSUED_DATE)}</p>
              </div>
              <div className="text-center sm:border-x sm:border-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trajanje</p>
                <p className="mt-1 font-medium text-slate-900">{DURATION_LABEL}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rezultat</p>
                <p className="mt-1 font-medium text-slate-900">{SCORE_PCT}%</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
              <CertificateQrPlaceholder seed={certificateId} />
              <div className="text-center sm:text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Certificate ID
                </p>
                <p className="mt-1 font-mono text-sm text-slate-800">{certificateId}</p>
              </div>
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-double border-brand/50 bg-brand/5 text-center"
                aria-hidden
              >
                <div>
                  <p className="text-[10px] font-bold uppercase leading-tight text-brand">CONFORA</p>
                  <p className="text-[8px] text-slate-500">Verified</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Button
            type="button"
            onClick={() => void handlePdfClick()}
            disabled={pdfPhase === "loading"}
            className={cn(
              "h-12 rounded-xl px-6 font-semibold text-white shadow-lg transition-colors",
              pdfPhase === "ready"
                ? "border-0 bg-emerald-600 hover:bg-emerald-600/90"
                : "border-0 bg-brand hover:bg-brand/90",
            )}
          >
            {pdfPhase === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generišemo PDF...
              </>
            ) : pdfPhase === "ready" ? (
              <>
                <Check className="h-5 w-5" />
                PDF spreman!
              </>
            ) : (
              <>⬇ Preuzmi PDF</>
            )}
          </Button>

          <Button
            type="button"
            className="h-12 rounded-xl border-0 bg-[#0A66C2] px-6 font-semibold text-white hover:bg-[#0A66C2]/90"
            onClick={() => void handleLinkedIn()}
          >
            <Linkedin className="h-5 w-5" />
            📤 Podijeli na LinkedIn
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="h-12 rounded-xl border border-border/50 text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
            onClick={() => void handleCopyVerify()}
          >
            {copyDone ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                ✓ Kopirano!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                🔗 Kopiraj link verifikacije
              </>
            )}
          </Button>
        </motion.div>

        {pdfPhase === "ready" ? (
          <p className="mt-3 text-center text-xs text-text-muted">
            Klikni „PDF spreman!” za štampu / Spremi kao PDF u pregledniku.
          </p>
        ) : null}
      </div>

      <motion.section
        className="mt-16 border-t border-border/40 pt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45 }}
      >
        <h2 className="mb-6 px-4 text-lg font-semibold text-text-primary md:px-8">
          Tvoj sljedeći korak:
        </h2>
        <div className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-4 md:px-8">
          {RELATED_COURSES.map((c, i) => (
            <motion.div
              key={c.courseId}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="w-[min(100%,280px)] shrink-0 sm:w-[300px]"
            >
              <CourseCard {...c} onClick={() => goLearn(c.courseId)} ctaTone="brand" />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
