import { zodResolver } from "@hookform/resolvers/zod";
import { AUTH_NS } from "@confora/i18n";
import { type AxiosError } from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type JSX } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConforaLogo } from "@/components/ui/ConforaLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { loginWithPassword } from "@/lib/api/auth-client";
import { isNestAuthPilotActive } from "@/lib/nest-auth-pilot";
import { useAuthStore } from "@/stores/authStore";

/** Bez stroge Zod `.email()` — mora biti usklađeno s backend `EmailStr` (npr. @*.local ne prolazi). */
function buildLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z
      .string()
      .min(1, t("login.validation.emailRequired"))
      .max(320)
      .refine(
        (v) => /^[^\s@]+@[^\s@]+(\.[^\s@]+)+$/.test(v.trim()),
        t("login.validation.emailInvalid"),
      ),
    password: z.string().min(1, t("login.validation.passwordRequired")),
  });
}

type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>;

interface LoginApiResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
}

function formatLoginApiError(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined;
    if (first && typeof first.msg === "string") {
      return first.msg;
    }
  }
  return null;
}

export default function Login(): JSX.Element {
  const { t } = useTranslation(AUTH_NS);
  const loginSchema = useMemo(() => buildLoginSchema(t), [t]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dashboardUrl, setDashboardUrl] = useState<string>("");

  useEffect(() => {
    setDashboardUrl(`${window.location.origin}/dashboard`);
  }, []);

  useEffect(() => {
    if (searchParams.get("reason") === "session") {
      setSubmitError(t("login.errors.sessionInvalid"));
    }
  }, [searchParams, t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    setSubmitError(null);
    const email = data.email.trim().toLowerCase();

    if (isNestAuthPilotActive()) {
      try {
        const result = await loginWithPassword(email, data.password);
        if (result.kind === "error") {
          setSubmitError(result.normalized.message || t("login.errors.failed"));
          return;
        }
        const tokens = result.data;
        if (!tokens.refresh_token?.trim()) {
          setSubmitError("Nest auth pilot: refresh token missing from login response.");
          return;
        }
        useAuthStore.getState().login({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        });
        const next = searchParams.get("next");
        const target =
          next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
        navigate(target, { replace: true });
      } catch {
        setSubmitError(
          t("login.errors.nestConnectionFailed"),
        );
      }
      return;
    }

    try {
      const { data: res } = await api.post<LoginApiResponse>("/auth/login", {
        email,
        password: data.password,
      });
      useAuthStore.getState().login({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      });
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      navigate(target, { replace: true });
    } catch (e: unknown) {
      const err = e as AxiosError<{ detail?: string }>;
      if (err.response == null) {
        setSubmitError(t("login.errors.connectionFailed"));
        return;
      }
      const status = err.response.status;
      const detail = formatLoginApiError(err.response.data?.detail);
      if (status === 503) {
        const d503 = formatLoginApiError(err.response.data?.detail);
        setSubmitError(
          d503 ??
            "Prijava nije dostupna: postavi Cognito na API-ju ili lokalni način (backend/.env: ENVIRONMENT=development, DEV_LOCAL_AUTH=true, DEV_LOCAL_JWT_SECRET ≥16 znakova, COGNITO_USER_POOL_ID i COGNITO_CLIENT_ID prazni). Zadani nalog: dev@example.com / devlocal123.",
        );
        return;
      }
      setSubmitError(detail ?? t("login.errors.failed"));
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher data-testid="login-language-switcher" />
      </div>
      <div className="mb-10 flex flex-col items-center text-center">
        <ConforaLogo size="lg" className="mx-auto max-w-[min(100%,320px)]" />
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          LMS
        </p>
      </div>
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl">{t("login.title")}</CardTitle>
          <p className="text-sm font-medium text-text-primary">{t("login.subtitle")}</p>
          <CardDescription>{t("login.description")}</CardDescription>
          {import.meta.env.DEV ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-950">
              <span className="font-semibold">Pilot seed (Dynamo):</span>{" "}
              <code className="rounded bg-white px-1">admin@pilot.example.com</code> ili{" "}
              <code className="rounded bg-white px-1">learner@pilot.example.com</code> + lozinka{" "}
              <code className="rounded bg-white px-1">DEV_LOCAL_PASSWORD</code> iz{" "}
              <code className="rounded bg-white px-1">backend/.env</code>. Adrese{" "}
              <code className="rounded bg-white px-1">@*.local</code> ne rade (API odbija).
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="login-email">{t("login.email")}</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                {...register("email")}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "login-email-err" : undefined}
              />
              {errors.email ? (
                <p id="login-email-err" className="text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">{t("login.password")}</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10"
                  {...register("password")}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? "login-password-err" : undefined}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p id="login-password-err" className="text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {submitError ? (
              <p id="login-submit-err" className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting} aria-describedby={submitError ? "login-submit-err" : undefined}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("login.submitting")}
                </>
              ) : (
                t("login.submit")
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {t("login.noAccount")}{" "}
            <Link to="/register" className="font-medium text-[#1F4E79] underline underline-offset-2">
              {t("login.register")}
            </Link>
          </p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-3 text-left text-xs leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-800">{t("login.afterLogin.title")}</p>
            <p className="mt-1">
              {t("login.afterLogin.description")}{" "}
              <Link
                to="/dashboard"
                className="font-medium text-[#1F4E79] underline underline-offset-2"
              >
                {t("login.afterLogin.dashboard")}
              </Link>{" "}
              (<code className="rounded bg-white px-1 py-0.5 text-[11px] text-slate-800">/dashboard</code>
              ).
            </p>
            {dashboardUrl ? (
              <p className="mt-2 break-all font-mono text-[11px] text-slate-700">{dashboardUrl}</p>
            ) : null}
            {import.meta.env.DEV ? (
              <p className="mt-2 border-t border-slate-200 pt-2 text-slate-500">
                Bez Cognita: u <code className="text-[11px]">backend/.env</code> uključi{" "}
                <code className="text-[11px]">DEV_LOCAL_AUTH</code> (vidi{" "}
                <code className="text-[11px]">.env.example</code>) — zadano{" "}
                <code className="text-[11px]">dev@example.com</code> /{" "}
                <code className="text-[11px]">devlocal123</code>. Samo UI bez API-ja:{" "}
                <code className="text-[11px]">VITE_SKIP_AUTH_GUARD=true</code> u{" "}
                <code className="text-[11px]">frontend-app/.env.local</code>.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
