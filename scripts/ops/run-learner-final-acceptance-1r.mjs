#!/usr/bin/env node
/** LEARNER-FINAL-ACCEPTANCE-1R — recovery run wrapper. */
process.env.RUN_LEARNER_ACCEPTANCE_VARIANT = '1r';
await import('./run-learner-final-acceptance-1.mjs');
