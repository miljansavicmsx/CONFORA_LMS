import bsA11y from '../locales/bs/a11y.json' with { type: 'json' };

import bsAuth from '../locales/bs/auth.json' with { type: 'json' };

import bsCandidatePortal from '../locales/bs/candidatePortal.json' with { type: 'json' };

import bsCertificationStaff from '../locales/bs/certificationStaff.json' with { type: 'json' };

import bsShell from '../locales/bs/shell.json' with { type: 'json' };

import enA11y from '../locales/en/a11y.json' with { type: 'json' };

import enAuth from '../locales/en/auth.json' with { type: 'json' };

import enCandidatePortal from '../locales/en/candidatePortal.json' with { type: 'json' };

import enCertificationStaff from '../locales/en/certificationStaff.json' with { type: 'json' };

import enShell from '../locales/en/shell.json' with { type: 'json' };

import hrA11y from '../locales/hr/a11y.json' with { type: 'json' };

import hrAuth from '../locales/hr/auth.json' with { type: 'json' };

import hrCandidatePortal from '../locales/hr/candidatePortal.json' with { type: 'json' };

import hrCertificationStaff from '../locales/hr/certificationStaff.json' with { type: 'json' };

import hrShell from '../locales/hr/shell.json' with { type: 'json' };

import slA11y from '../locales/sl/a11y.json' with { type: 'json' };

import slAuth from '../locales/sl/auth.json' with { type: 'json' };

import slCandidatePortal from '../locales/sl/candidatePortal.json' with { type: 'json' };

import slCertificationStaff from '../locales/sl/certificationStaff.json' with { type: 'json' };

import slShell from '../locales/sl/shell.json' with { type: 'json' };

import srA11y from '../locales/sr/a11y.json' with { type: 'json' };

import srAuth from '../locales/sr/auth.json' with { type: 'json' };

import srCandidatePortal from '../locales/sr/candidatePortal.json' with { type: 'json' };

import srCertificationStaff from '../locales/sr/certificationStaff.json' with { type: 'json' };

import srShell from '../locales/sr/shell.json' with { type: 'json' };



import {

  A11Y_NS,

  AUTH_NS,

  CANDIDATE_PORTAL_NS,

  CERTIFICATION_STAFF_NS,

  SHELL_NS,

  type A11yMessages,

  type SupportedLocale,

} from './keys.js';



type LocaleBundle = {

  readonly a11y: A11yMessages;

  readonly auth: typeof enAuth;

  readonly shell: typeof enShell;

  readonly certificationStaff: typeof enCertificationStaff;

  readonly candidatePortal: typeof enCandidatePortal;

};



const localeBundles: Record<SupportedLocale, LocaleBundle> = {

  en: {

    a11y: enA11y as A11yMessages,

    auth: enAuth,

    shell: enShell,

    certificationStaff: enCertificationStaff,

    candidatePortal: enCandidatePortal,

  },

  bs: {

    a11y: bsA11y as A11yMessages,

    auth: bsAuth,

    shell: bsShell,

    certificationStaff: bsCertificationStaff,

    candidatePortal: bsCandidatePortal,

  },

  sr: {

    a11y: srA11y as A11yMessages,

    auth: srAuth,

    shell: srShell,

    certificationStaff: srCertificationStaff,

    candidatePortal: srCandidatePortal,

  },

  hr: {

    a11y: hrA11y as A11yMessages,

    auth: hrAuth,

    shell: hrShell,

    certificationStaff: hrCertificationStaff,

    candidatePortal: hrCandidatePortal,

  },

  sl: {

    a11y: slA11y as A11yMessages,

    auth: slAuth,

    shell: slShell,

    certificationStaff: slCertificationStaff,

    candidatePortal: slCandidatePortal,

  },

};



/** i18next `resources` map for bundled namespaces. */

export const conforaI18nResources = Object.fromEntries(

  (Object.entries(localeBundles) as [SupportedLocale, LocaleBundle][]).map(([lng, messages]) => [

    lng,

    {

      [A11Y_NS]: messages.a11y,

      [AUTH_NS]: messages.auth,

      [SHELL_NS]: messages.shell,

      [CERTIFICATION_STAFF_NS]: messages.certificationStaff,

      [CANDIDATE_PORTAL_NS]: messages.candidatePortal,

    },

  ]),

) as Record<

  SupportedLocale,

  {

    readonly [A11Y_NS]: A11yMessages;

    readonly [AUTH_NS]: typeof enAuth;

    readonly [SHELL_NS]: typeof enShell;

    readonly [CERTIFICATION_STAFF_NS]: typeof enCertificationStaff;

    readonly [CANDIDATE_PORTAL_NS]: typeof enCandidatePortal;

  }

>;



/** @deprecated Use `conforaI18nResources` — kept for backward compatibility. */

export const a11yResources = Object.fromEntries(

  (Object.entries(localeBundles) as [SupportedLocale, LocaleBundle][]).map(([lng, messages]) => [

    lng,

    { [A11Y_NS]: messages.a11y },

  ]),

) as Record<SupportedLocale, { readonly [A11Y_NS]: A11yMessages }>;


