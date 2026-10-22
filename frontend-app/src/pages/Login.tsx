import { AUTH_NS } from "@confora/i18n";
import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ConforaLogo } from "@/components/ui/ConforaLogo";
import { oidcLoginUrl } from "@/lib/oidc-browser-session";

export default function Login(): JSX.Element {
  const { t } = useTranslation(AUTH_NS);
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  const message =
    reason === "expired"
      ? t("login.errors.expired")
      : reason === "denied"
        ? t("login.errors.denied")
        : reason === "signed-out"
          ? t("login.errors.signedOut")
          : reason === "session"
            ? t("login.errors.sessionInvalid")
            : null;

  function startLogin(): void {
    const returnTo = searchParams.get("return_to") ?? "/dashboard";
    window.location.assign(oidcLoginUrl(returnTo, reason === "expired" || reason === "signed-out"));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <ConforaLogo />
            <LanguageSwitcher />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{t("login.title")}</h1>
            <CardDescription>{t("login.description")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <p className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary" role="status" data-testid="session-notice">
              {message}
            </p>
          ) : null}
          <Button type="button" className="w-full" data-testid="keycloak-login" onClick={startLogin}>
            {t("login.submit")}
          </Button>
          <p className="text-sm text-text-muted">{t("login.keycloakHint")}</p>
        </CardContent>
      </Card>
    </main>
  );
}
