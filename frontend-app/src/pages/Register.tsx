import { zodResolver } from "@hookform/resolvers/zod";
import axios, { type AxiosError } from "axios";
import { Eye, EyeOff, Globe, Loader2, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConforaLogo } from "@/components/ui/ConforaLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// --- API tipovi ---

export interface EmailAvailabilityResponse {
  readonly available: boolean;
}

export interface RegisterApiResponse {
  readonly message: string;
}

export interface LinkedInInitResponse {
  readonly url: string;
}

export interface GoogleInitResponse {
  readonly url: string;
}

// --- Forma ---

const registerSchema = z
  .object({
    given_name: z.string().min(1, "Ime je obavezno."),
    family_name: z.string().min(1, "Prezime je obavezno."),
    email: z.string().min(1, "Email je obavezan.").email("Neispravan format emaila."),
    password: z
      .string()
      .min(8, "Lozinka mora imati najmanje 8 znakova.")
      .refine((v) => /[A-Z]/.test(v), {
        message: "Najmanje jedno veliko slovo.",
      })
      .refine((v) => /\d/.test(v), {
        message: "Najmanje jedna cifra.",
      }),
    gdpr: z.boolean(),
  })
  .refine((data) => data.gdpr === true, {
    message: "Morate prihvatiti uvjete.",
    path: ["gdpr"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

type EmailCheckState = "idle" | "checking" | "available" | "taken" | "error";

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

function getPasswordStrength4(password: string): { level: StrengthLevel; label: string } {
  if (!password) {
    return { level: 0, label: "" };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const len = password.length;
  if (len < 6) {
    return { level: 1, label: "Slab" };
  }
  if (len < 8 || !hasUpper || !hasDigit) {
    return { level: 2, label: "Srednji" };
  }
  if (len < 12 && !hasSpecial) {
    return { level: 3, label: "Jak" };
  }
  return { level: 4, label: "Odličan" };
}

function strengthSegmentClass(level: StrengthLevel, index: number): string {
  if (level === 0 || index >= level) {
    return "bg-slate-600/50";
  }
  if (level === 1) {
    return "bg-red-500";
  }
  if (level === 2) {
    return "bg-amber-500";
  }
  /* level 3 i 4: svi popunjeni segmenti emerald */
  return "bg-emerald-500";
}

const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputDark =
  "border-border/50 bg-surface-tertiary/60 text-text-primary placeholder:text-text-muted focus-visible:border-brand focus-visible:ring-brand/25";

function GoogleLogo(): JSX.Element {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LinkedInLogo(): JSX.Element {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function StarRow(): JSX.Element {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function SuccessCheckmark(): JSX.Element {
  return (
    <div className="relative mx-auto h-20 w-20" aria-hidden>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-emerald-400/90"
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
      <svg className="absolute inset-0 h-full w-full text-emerald-400" viewBox="0 0 64 64" fill="none">
        <motion.path
          d="M18 34l10 10 18-22"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

export default function Register(): JSX.Element {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailCheck, setEmailCheck] = useState<EmailCheckState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [redirectSeconds, setRedirectSeconds] = useState<number>(5);
  const [passwordShakeKey, setPasswordShakeKey] = useState<number>(0);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    trigger,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      given_name: "",
      family_name: "",
      email: "",
      password: "",
      gdpr: false,
    },
  });

  const emailValue: string = useWatch({ control, name: "email" }) ?? "";
  const passwordValue: string = useWatch({ control, name: "password" }) ?? "";

  const emailTrimmed: string = emailValue.trim();
  const emailLooksValid: boolean = useMemo(
    () => emailFormatRegex.test(emailTrimmed),
    [emailTrimmed],
  );

  const strength4 = useMemo(() => getPasswordStrength4(passwordValue), [passwordValue]);

  useEffect(() => {
    if (!emailLooksValid || emailTrimmed.length === 0) {
      setEmailCheck("idle");
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setEmailCheck("checking");
        try {
          const response = await api.get<EmailAvailabilityResponse>("/auth/check-email", {
            params: { email: emailTrimmed },
          });
          if (cancelled) {
            return;
          }
          if (response.status === 200 && response.data) {
            setEmailCheck(response.data.available ? "available" : "taken");
          } else {
            setEmailCheck("error");
          }
        } catch (e: unknown) {
          if (cancelled || axios.isCancel(e)) {
            return;
          }
          setEmailCheck("error");
        }
      })();
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [emailTrimmed, emailLooksValid]);

  const emailBlockingSubmit: boolean =
    emailLooksValid &&
    (emailCheck === "checking" || emailCheck === "taken" || emailCheck === "error");

  const canSubmit: boolean =
    isValid && !emailBlockingSubmit && emailCheck === "available" && !isSubmitting;

  const onBlurValidate = useCallback(
    async (field: keyof RegisterFormValues) => {
      await trigger(field);
    },
    [trigger],
  );

  const bumpPasswordShake = useCallback(() => {
    setPasswordShakeKey((k) => k + 1);
  }, []);

  const handleGoogleClick = (): void => {
    void (async () => {
      try {
        const { data } = await api.get<GoogleInitResponse>("/auth/google/init");
        window.location.assign(data.url);
      } catch {
        setSubmitError("Google prijava trenutno nije dostupna.");
      }
    })();
  };

  const handleLinkedInClick = (): void => {
    void (async () => {
      try {
        const { data } = await api.get<LinkedInInitResponse>("/auth/linkedin/init");
        window.location.assign(data.url);
      } catch {
        setSubmitError("LinkedIn prijava trenutno nije dostupna.");
      }
    })();
  };

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    setSubmitError(null);
    if (emailCheck !== "available") {
      return;
    }
    try {
      await api.post<RegisterApiResponse>("/auth/register", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        given_name: data.given_name.trim(),
        family_name: data.family_name.trim(),
      });
      setShowSuccessModal(true);
    } catch (e: unknown) {
      const err = e as AxiosError<{ detail?: string }>;
      const msg =
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Registracija nije uspjela. Pokušajte ponovo.";
      setSubmitError(msg);
      if (/lozink|password|credentials/i.test(msg)) {
        bumpPasswordShake();
      }
    }
  };

  useEffect(() => {
    if (!showSuccessModal) {
      return;
    }
    setRedirectSeconds(5);
    let seconds = 5;
    const intervalId = window.setInterval(() => {
      seconds -= 1;
      setRedirectSeconds(Math.max(0, seconds));
      if (seconds <= 0) {
        window.clearInterval(intervalId);
        navigate("/login");
      }
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [showSuccessModal, navigate]);

  return (
    <div className="flex min-h-screen w-full bg-surface-secondary text-text-primary">
      {/* Lijevo — brand (desktop) */}
      <aside className="relative hidden w-1/2 flex-col overflow-hidden border-r border-border/40 bg-surface-primary md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgb(148 163 184 / 0.22) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-[18%] h-[min(52vw,420px)] w-[min(52vw,420px)] -translate-x-1/2 rounded-full bg-brand/25 blur-3xl" />
        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 py-16 lg:px-16">
          <div className="mb-10">
            <ConforaLogo size="lg" mode="full" className="max-w-[min(100%,280px)]" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">LMS</p>
          </div>
          <p className="max-w-md text-lg font-medium leading-snug text-text-secondary lg:text-xl">
            Dobrodošli na platformu koja certificira profesionalce
          </p>
          <ul className="mt-10 max-w-md space-y-5">
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-lg">
                🏆
              </span>
              <div>
                <p className="font-medium text-text-primary">ISO/IEC 17024 Akreditovana certifikacija</p>
                <p className="mt-0.5 text-sm text-text-muted">Međunarodni standard za osobnu certifikaciju</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                <Target className="h-5 w-5 text-brand" aria-hidden />
              </span>
              <div>
                <p className="font-medium text-text-primary">AI Tutor prilagođen vašoj industriji</p>
                <p className="mt-0.5 text-sm text-text-muted">Učenje usmjereno na vašu ulogu</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                <Globe className="h-5 w-5 text-brand" aria-hidden />
              </span>
              <div>
                <p className="font-medium text-text-primary">Međunarodno priznati certifikati</p>
                <p className="mt-0.5 text-sm text-text-muted">Priznata vrijednost u industriji</p>
              </div>
            </li>
          </ul>
          <div className="mt-auto max-w-md pt-16">
            <StarRow />
            <blockquote className="mt-3 text-sm leading-relaxed text-text-secondary">
              „CONFORA je ubrzala našu putanju do ISO certifikacije — jasna struktura i podrška na svakom koraku.”
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border/50 bg-surface-tertiary">
                <AvatarFallback className="bg-surface-tertiary text-sm font-medium text-brand">
                  AK
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-text-primary">Ana K.</p>
                <p className="text-xs text-text-muted">ISO 27001 Lead Auditor</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Desno — forma */}
      <section
        aria-labelledby="register-heading"
        className="flex w-full flex-1 items-center justify-center py-12 md:w-1/2"
      >
        <div className="w-full max-w-sm px-8">
          <div className="mb-8 flex flex-col items-center text-center md:hidden">
            <ConforaLogo size="md" className="mx-auto max-w-[220px]" />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-text-muted">LMS</p>
          </div>

          <h1 id="register-heading" className="text-2xl font-bold tracking-tight text-text-primary">
            Kreiraj nalog
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Ili{" "}
            <Link to="/login" className="font-medium text-brand underline-offset-4 hover:underline">
              Prijavi se
            </Link>{" "}
            ako već imaš nalog
          </p>

          <div className="mb-6 mt-6 flex flex-col gap-3">
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-border/60 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                onClick={handleGoogleClick}
              >
                <GoogleLogo />
                Nastavi s Google-om
              </Button>
            </motion.div>
            <Button
              type="button"
              className="h-11 w-full rounded-xl border-0 bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90"
              onClick={handleLinkedInClick}
            >
              <LinkedInLogo />
              Nastavi s LinkedIn-om
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-secondary px-3 text-text-secondary">ili nastavi s emailom</span>
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) =>
              void handleSubmit(onSubmit, (errs) => {
                if (errs.password) {
                  bumpPasswordShake();
                }
              })(e)
            }
            noValidate
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="given_name" className="text-text-secondary">
                  Ime
                </Label>
                <Input
                  id="given_name"
                  autoComplete="given-name"
                  className={cn(
                    inputDark,
                    errors.given_name && "border-red-500 focus-visible:ring-red-500/30",
                  )}
                  {...register("given_name")}
                  onBlur={() => void onBlurValidate("given_name")}
                  aria-invalid={errors.given_name ? true : undefined}
                />
                {errors.given_name ? (
                  <p className="text-sm text-red-400" role="alert">
                    {errors.given_name.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="family_name" className="text-text-secondary">
                  Prezime
                </Label>
                <Input
                  id="family_name"
                  autoComplete="family-name"
                  className={cn(
                    inputDark,
                    errors.family_name && "border-red-500 focus-visible:ring-red-500/30",
                  )}
                  {...register("family_name")}
                  onBlur={() => void onBlurValidate("family_name")}
                  aria-invalid={errors.family_name ? true : undefined}
                />
                {errors.family_name ? (
                  <p className="text-sm text-red-400" role="alert">
                    {errors.family_name.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-secondary">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className={cn(
                  inputDark,
                  errors.email && "border-red-500 focus-visible:ring-red-500/30",
                  emailCheck === "taken" && "border-red-500",
                )}
                {...register("email")}
                onBlur={() => void onBlurValidate("email")}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby="email-hint email-status"
              />
              {errors.email ? (
                <p className="text-sm text-red-400" role="alert" id="email-hint">
                  {errors.email.message}
                </p>
              ) : null}
              {emailCheck === "checking" && emailLooksValid ? (
                <div className="space-y-2 pt-1" aria-live="polite">
                  <Skeleton className="h-4 w-full max-w-xs bg-surface-tertiary" />
                  <Skeleton className="h-3 w-2/3 max-w-[12rem] bg-surface-tertiary" />
                </div>
              ) : null}
              {emailLooksValid && !errors.email ? (
                <p className="text-sm" id="email-status">
                  {emailCheck === "available" ? (
                    <span className="text-emerald-400">Email je dostupan.</span>
                  ) : null}
                  {emailCheck === "taken" ? (
                    <span className="text-red-400">Ovaj email je već registriran.</span>
                  ) : null}
                  {emailCheck === "error" ? (
                    <span className="text-amber-400">
                      Provjera dostupnosti nije uspjela. Pokušajte ponovo.
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-secondary">
                Lozinka
              </Label>
              <motion.div
                key={passwordShakeKey}
                initial={{ x: 0 }}
                animate={
                  passwordShakeKey > 0
                    ? { x: [0, -8, 8, -8, 8, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.45, ease: "easeInOut" }}
              >
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={cn(
                      "pr-10",
                      inputDark,
                      errors.password && "border-red-500 focus-visible:ring-red-500/30",
                    )}
                    {...register("password")}
                    onBlur={() => void onBlurValidate("password")}
                    aria-invalid={errors.password ? true : undefined}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-muted hover:bg-surface-tertiary hover:text-text-primary"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
              {errors.password ? (
                <p className="text-sm text-red-400" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
              {passwordValue.length > 0 ? (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex gap-1.5">
                    {([0, 1, 2, 3] as const).map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors duration-200",
                          strengthSegmentClass(strength4.level, i),
                        )}
                      />
                    ))}
                  </div>
                  {strength4.label ? (
                    <p className="text-xs text-text-muted">
                      Jačina: <span className="font-medium text-text-secondary">{strength4.label}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Controller
                name="gdpr"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="gdpr"
                    className="mt-0.5 border-border/70 data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-surface-primary"
                    checked={field.value}
                    onCheckedChange={(c) => {
                      const v = c === true;
                      field.onChange(v);
                      void trigger("gdpr");
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <div className="grid gap-1.5 leading-snug">
                <Label htmlFor="gdpr" className="cursor-pointer text-sm font-normal text-text-secondary">
                  Prihvatam{" "}
                  <a href="/terms" className="text-brand underline underline-offset-2 hover:text-brand/90">
                    Uvjete korištenja
                  </a>{" "}
                  i{" "}
                  <a href="/privacy" className="text-brand underline underline-offset-2 hover:text-brand/90">
                    Politiku privatnosti
                  </a>
                </Label>
                {errors.gdpr ? (
                  <p className="text-sm text-red-400" role="alert">
                    {errors.gdpr.message}
                  </p>
                ) : null}
              </div>
            </div>

            {submitError ? (
              <p className="text-sm text-red-400" role="alert">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "mt-2 h-11 w-full rounded-xl border-0 bg-brand font-semibold text-surface-primary shadow-none hover:bg-brand/90",
                !canSubmit && !isSubmitting && "pointer-events-none opacity-50",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kreiramo nalog...
                </>
              ) : (
                "Kreiraj nalog"
              )}
            </Button>
          </form>
        </div>
      </section>

      {showSuccessModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-2xl border border-border/50 bg-surface-secondary p-10 text-center shadow-2xl"
          >
            <SuccessCheckmark />
            <h2 id="success-title" className="mt-6 text-xl font-semibold text-text-primary">
              Nalog kreiran!
            </h2>
            <p className="mt-2 text-sm text-text-secondary">Provjeri inbox.</p>
            <p className="mt-6 text-sm text-text-muted">
              Preusmjeravanje na prijavu za{" "}
              <span className="font-semibold tabular-nums text-brand">{redirectSeconds}</span> s…
            </p>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
