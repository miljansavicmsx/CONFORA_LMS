'use client';

import { SkipToMainLink } from '@confora/ui';

type SkipToMainLinkBaseProps = Parameters<typeof SkipToMainLink>[0];
import { useMemo, type ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';

import { createConforaI18n, type CreateConforaI18nOptions } from './create-i18n.js';
import { A11Y_NS, AUTH_NS, CANDIDATE_PORTAL_NS, CERTIFICATION_STAFF_NS, SHELL_NS, type SupportedLocale } from './keys.js';

export type ConforaI18nProviderProps = {
  readonly children: ReactNode;
  readonly lng?: SupportedLocale;
  readonly fallbackLng?: SupportedLocale;
};

/** Provides i18next (a11y, certificationStaff, candidatePortal namespaces) to the React tree. */
export function ConforaI18nProvider({
  children,
  lng,
  fallbackLng,
}: ConforaI18nProviderProps): ReactNode {
  const i18n = useMemo(
    () =>
      createConforaI18n({
        ...(lng !== undefined ? { lng } : {}),
        ...(fallbackLng !== undefined ? { fallbackLng } : {}),
      }),
    [lng, fallbackLng],
  );

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export type A11ySkipToMainLinkProps = Omit<SkipToMainLinkBaseProps, 'label' | 'children'> & {
  /** Override translated label (tenant / app specific). */
  readonly label?: string;
};

/** WCAG 2.4.1 skip link with `a11y:skip_to_main` unless `label` is passed. */
export function A11ySkipToMainLink({ label, ...rest }: A11ySkipToMainLinkProps): ReactNode {
  const { t } = useTranslation(A11Y_NS);
  return <SkipToMainLink label={label ?? t('skip_to_main')} {...rest} />;
}
