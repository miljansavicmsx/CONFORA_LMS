import { SHELL_NS, SUPPORTED_LOCALES, type SupportedLocale } from "@confora/i18n";
import { Globe } from "lucide-react";
import { useCallback, type ChangeEvent, type JSX } from "react";
import { useTranslation } from "react-i18next";

import { persistUiLocale } from "@/lib/locale-preference";
import { cn } from "@/lib/utils";

export type LanguageSwitcherProps = {
  readonly className?: string;
  readonly compact?: boolean;
  readonly "data-testid"?: string;
};

export function LanguageSwitcher({
  className,
  compact = false,
  "data-testid": testId = "language-switcher",
}: LanguageSwitcherProps): JSX.Element {
  const { t, i18n } = useTranslation(SHELL_NS);
  const current = (SUPPORTED_LOCALES as readonly string[]).includes(i18n.language)
    ? (i18n.language as SupportedLocale)
    : "en";

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value;
      if (!(SUPPORTED_LOCALES as readonly string[]).includes(next)) {
        return;
      }
      const locale = next as SupportedLocale;
      persistUiLocale(locale);
      void i18n.changeLanguage(locale);
    },
    [i18n],
  );

  return (
    <div className={cn("flex items-center gap-1.5", className)} data-testid={testId}>
      <Globe className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
      <label className="sr-only" htmlFor={`${testId}-select`}>
        {t("language.label")}
      </label>
      <select
        id={`${testId}-select`}
        className={cn(
          "rounded-lg border border-border/60 bg-surface-secondary/50 text-text-primary",
          compact ? "h-8 px-2 text-xs" : "h-9 px-2.5 text-sm",
        )}
        value={current}
        onChange={onChange}
        aria-label={t("language.label")}
        data-testid={`${testId}-select`}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {t(`language.${locale}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
