/**
 * Pre-flight: pristanak, snimak lica, snimak dokumenta (ISO 17024 proctoring MVP).
 */

import { Camera, Check, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { verifyExamAttempt } from "@/lib/api-exam-engine";
import { loadExamSession } from "@/lib/exam-session-storage";
import { setExamVerified } from "@/lib/exam-verification-storage";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { ExamPlayerLocationState } from "@/pages/learner/ExamPlayer";

const devSkipAuthGuard =
  import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH_GUARD === "true";

function isExamPlayerState(x: unknown): x is ExamPlayerLocationState {
  if (!x || typeof x !== "object") {
    return false;
  }
  const o = x as Record<string, unknown>;
  const bulk = Array.isArray(o.questions) && o.questions.length > 0;
  const sequential =
    o.sequentialDelivery === true &&
    typeof o.answerSignSecret === "string" &&
    typeof o.totalQuestions === "number" &&
    o.totalQuestions > 0;
  return (
    (bulk || sequential) && typeof o.startTime === "string" && typeof o.courseId === "string"
  );
}


function dataUrlToRawBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(",");
  return i >= 0 ? dataUrl.slice(i + 1).trim() : dataUrl.trim();
}

export default function ExamVerification(): JSX.Element | null {
  const { attemptId: rawId } = useParams<{ attemptId: string }>();
  const attemptId = rawId ? decodeURIComponent(rawId) : "";
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  useEffect(() => {
    if (authHydrated) {
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true);
    }
    return unsub;
  }, [authHydrated]);

  useEffect(() => {
    if (!authHydrated || devSkipAuthGuard) {
      return;
    }
    if (!useAuthStore.getState().accessToken) {
      void navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [authHydrated, navigate, location.pathname]);

  const session = useMemo(() => {
    if (!attemptId) {
      return null;
    }
    const fromNav = location.state;
    if (isExamPlayerState(fromNav)) {
      return fromNav;
    }
    return loadExamSession(attemptId);
  }, [attemptId, location.state]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [consent, setConsent] = useState(false);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceBase64, setFaceBase64] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [idBase64, setIdBase64] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      for (const t of s.getTracks()) {
        t.stop();
      }
      streamRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Kamera nije podržana u ovom pregledniku.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const el = videoRef.current;
      if (el) {
        el.srcObject = stream;
        await el.play().catch(() => undefined);
      }
    } catch {
      setCameraError("Nije moguće pristupiti kameri. Provjeri dozvole u pregledniku.");
    }
  }, [stopCamera]);

  useEffect(() => {
    if (step >= 2) {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, startCamera, stopCamera]);

  const captureFrame = useCallback(
    (kind: "face" | "id") => {
      const video = videoRef.current;
      if (!video || video.videoWidth < 2 || video.videoHeight < 2) {
        setCameraError("Sačekaj da se prikaz kamere učita, zatim pokušaj ponovo.");
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      const raw = dataUrlToRawBase64(dataUrl);
      if (kind === "face") {
        setFacePreview(dataUrl);
        setFaceBase64(raw);
      } else {
        setIdPreview(dataUrl);
        setIdBase64(raw);
      }
      setCameraError(null);
    },
    [],
  );

  const canSubmit = consent && faceBase64 && idBase64 && faceBase64.length >= 200 && idBase64.length >= 200;

  const onConfirm = useCallback(async () => {
    if (!attemptId || !canSubmit || !faceBase64 || !idBase64) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await verifyExamAttempt(attemptId, {
        faceImageBase64: faceBase64,
        idDocumentBase64: idBase64,
        consentAccepted: true,
      });
      setExamVerified(attemptId);
      if (session) {
        void navigate(`/exam-player/${encodeURIComponent(attemptId)}`, {
          replace: true,
          state: session,
        });
      } else {
        void navigate(`/exam-player/${encodeURIComponent(attemptId)}`, { replace: true });
      }
    } catch {
      setSubmitError("Verifikacija nije uspjela. Provjeri podatke i pokušaj ponovo.");
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, canSubmit, faceBase64, idBase64, navigate, session]);

  if (!authHydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface-primary text-text-primary">
        <Loader2 className="h-10 w-10 animate-spin text-brand" aria-label="Učitavanje" />
      </div>
    );
  }

  if (!devSkipAuthGuard && !useAuthStore.getState().accessToken) {
    return null;
  }

  if (!attemptId) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-primary px-6 text-center">
        <p className="text-text-secondary">Nedostaje identifikator pokušaja.</p>
        <Button asChild variant="outline" className="border-border/60">
          <Link to="/dashboard/exams">Nazad</Link>
        </Button>
      </div>
    );
  }

  if (!session?.questions?.length) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface-primary px-6 text-center">
        <p className="max-w-md text-text-secondary">
          Nema podataka za ovaj pokušaj. Vrati se na listu ispita i započni ispit ponovo.
        </p>
        <Button asChild className="bg-brand text-white hover:bg-brand/90">
          <Link to="/dashboard/exams">Na listu ispita</Link>
        </Button>
      </div>
    );
  }

  const steps = [
    { n: 1 as const, label: "Pristanak" },
    { n: 2 as const, label: "Lice" },
    { n: 3 as const, label: "Dokument" },
  ];

  return (
    <div className="flex min-h-svh flex-col bg-[#07080c] text-text-primary">
      <header className="border-b border-white/10 bg-surface-secondary/40 px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/20 ring-1 ring-brand/30">
              <ShieldCheck className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Sigurnosna kontrola</p>
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">Provjera identiteta</h1>
            </div>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-text-muted sm:text-right">
            ISO 17024 ispitni režim. Snimci se u MVP-u ne šalju na vanjsku analizu; potvrđujemo samo pristanak i prisutnost
            snimaka.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8">
        <nav className="mb-10 flex items-center justify-between gap-2" aria-label="Koraci verifikacije">
          {steps.map((s, idx) => (
            <div key={s.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors",
                    step === s.n
                      ? "bg-brand text-white ring-2 ring-brand/40"
                      : step > s.n
                        ? "bg-emerald-600/30 text-emerald-200 ring-1 ring-emerald-500/40"
                        : "bg-white/5 text-text-muted ring-1 ring-white/10",
                  )}
                >
                  {step > s.n ? <Check className="h-5 w-5" /> : s.n}
                </div>
                <span className="hidden text-center text-xs font-medium text-text-secondary sm:block">{s.label}</span>
              </div>
              {idx < steps.length - 1 ? (
                <ChevronRight className="mx-1 h-5 w-5 shrink-0 text-white/20 sm:mx-2" aria-hidden />
              ) : null}
            </div>
          ))}
        </nav>

        <div className="rounded-2xl border border-white/10 bg-surface-secondary/30 p-6 ring-1 ring-white/[0.04] sm:p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">1. Pristanak na uslove</h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                Pokretanjem verifikacije potvrđuješ da prihvataš privremeno snimanje lica i identifikacionog dokumenta u
                svrhu provjere identiteta, te da razumiješ da se tokom ispita očekuje fokus na jednoj kartici / prozoru
                preglednika (MVP: bez hardverskog zaključavanja tabova).
              </p>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                <Checkbox
                  id="consent-exam"
                  checked={consent}
                  onCheckedChange={(v) => {
                    setConsent(v === true);
                  }}
                  className="mt-0.5 border-white/30 data-[state=checked]:bg-brand data-[state=checked]:text-white"
                />
                <Label htmlFor="consent-exam" className="cursor-pointer text-sm leading-relaxed text-text-primary">
                  Pročitao/la sam i prihvatam uslove snimanja i nadzora tokom ovog certifikacijskog ispita.
                </Label>
              </div>
              <Button
                type="button"
                className="bg-brand text-white hover:bg-brand/90"
                disabled={!consent}
                onClick={() => {
                  setStep(2);
                }}
              >
                Nastavi na snimanje lica
              </Button>
            </div>
          ) : null}

          {step === 2 || step === 3 ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">
                {step === 2 ? "2. Slikanje lica" : "3. Slikanje dokumenta"}
              </h2>
              <p className="text-sm text-text-secondary">
                {step === 2
                  ? "Pozicioniraj lice u okviru. Pobrini se za dovoljno svjetla, zatim uslikaš kadar."
                  : "Drži ličnu kartu ili pasoš pred kameru tako da su tekst i fotografija čitljivi."}
              </p>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
              </div>
              {cameraError ? <p className="text-sm text-amber-200">{cameraError}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => {
                    void startCamera();
                  }}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Ponovo učitaj kameru
                </Button>
                <Button
                  type="button"
                  className="bg-brand text-white hover:bg-brand/90"
                  onClick={() => {
                    captureFrame(step === 2 ? "face" : "id");
                  }}
                >
                  {step === 2 ? "Uslikaj" : "Uslikaj dokument"}
                </Button>
              </div>
              {step === 2 && facePreview ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Pregled snimka lica</p>
                  <img
                    src={facePreview}
                    alt="Snimak lica"
                    className="max-h-48 rounded-lg border border-white/10 object-contain"
                  />
                </div>
              ) : null}
              {step === 3 && idPreview ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Pregled dokumenta</p>
                  <img
                    src={idPreview}
                    alt="Snimak dokumenta"
                    className="max-h-48 rounded-lg border border-white/10 object-contain"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {step === 2 ? (
                  <>
                    <Button type="button" variant="ghost" className="text-text-secondary" onClick={() => setStep(1)}>
                      Nazad
                    </Button>
                    <Button
                      type="button"
                      className="bg-white/10 text-white hover:bg-white/15"
                      disabled={!faceBase64}
                      onClick={() => setStep(3)}
                    >
                      Nastavi na dokument
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="ghost" className="text-text-secondary" onClick={() => setStep(2)}>
                    Nazad
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-white/10 bg-[#07080c]/95 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {submitError ? <p className="text-sm text-red-300">{submitError}</p> : <span className="text-sm text-text-muted" />}
          <Button
            type="button"
            size="lg"
            className="w-full shrink-0 bg-emerald-600 text-white hover:bg-emerald-600/90 sm:w-auto"
            disabled={!canSubmit || submitting || step !== 3}
            onClick={() => {
              void onConfirm();
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Šaljem…
              </>
            ) : (
              "Potvrdi identitet i započni ispit"
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
