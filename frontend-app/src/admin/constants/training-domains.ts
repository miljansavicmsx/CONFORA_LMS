/** Oblasti obuke — multi-select u wizardu. */
export const TRAINING_DOMAINS = [
  "Informacijska sigurnost",
  "Upravljanje rizicima",
  "Privatnost i GDPR",
  "Kontinuitet poslovanja",
  "Cloud i DevOps",
  "Rukovođenje i compliance",
  "Tehnička edukacija",
  "Soft skills",
] as const;

export type TrainingDomain = (typeof TRAINING_DOMAINS)[number];

export const TRAINING_DOMAIN_VALUES = [...TRAINING_DOMAINS] as [TrainingDomain, ...TrainingDomain[]];
