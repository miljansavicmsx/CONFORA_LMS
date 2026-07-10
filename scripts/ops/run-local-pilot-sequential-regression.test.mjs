import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  classifyOutput,
  commandStatus,
  computeFinalVerdict,
  summarizeOutput,
} from './run-local-pilot-sequential-regression.mjs';

describe('run-local-pilot-sequential-regression helpers', () => {
  it('classifyOutput detects transient Keycloak 401', () => {
    const r = classifyOutput('D-02-kc-login-pilot.learner@confora.test: status=401');
    assert.equal(r.transient, true);
    assert.equal(r.rbacPrivacy, false);
  });

  it('classifyOutput detects RBAC regression signals', () => {
    const r = classifyOutput('final_verdict: TD_083_NO_GO_RBAC_PRIVACY_OR_PUBLIC_VERIFY_REGRESSION');
    assert.equal(r.rbacPrivacy, true);
  });

  it('commandStatus maps pass/fail/blocked/skipped', () => {
    assert.equal(commandStatus(true, false, false), 'PASS');
    assert.equal(commandStatus(false, false, false), 'FAIL');
    assert.equal(commandStatus(false, true, false), 'BLOCKED');
    assert.equal(commandStatus(false, false, true), 'SKIPPED');
  });

  it('computeFinalVerdict returns BLOCKED when preflight fails', () => {
    assert.equal(
      computeFinalVerdict({ preflightOk: false, results: [], hardStopTriggered: false }),
      'TD_085_BLOCKED_STACK_OR_ENV',
    );
  });

  it('computeFinalVerdict returns GO when all pass', () => {
    const results = [{ status: 'PASS', transientSignal: false, rbacPrivacySignal: false, hardStop: false, pass: true }];
    assert.equal(
      computeFinalVerdict({ preflightOk: true, results, hardStopTriggered: false }),
      'TD_085_GO_LOCAL_BASELINE_CONFIRMED',
    );
  });

  it('computeFinalVerdict returns transient note when only transient fails', () => {
    const results = [
      { status: 'PASS', transientSignal: false, rbacPrivacySignal: false, hardStop: false, pass: true },
      { status: 'FAIL', transientSignal: true, rbacPrivacySignal: false, hardStop: false, pass: false },
    ];
    assert.equal(
      computeFinalVerdict({ preflightOk: true, results, hardStopTriggered: false }),
      'TD_085_GO_WITH_TRANSIENT_INFRA_NOTE',
    );
  });

  it('classifyOutput detects F4-9 local DB invariant drift', () => {
    const r = classifyOutput('[FAIL] F49-DB-INVARIANTS: contactSlaCheckpointCount delta 9 outside allow 5');
    assert.equal(r.transient, true);
  });

  it('summarizeOutput truncates long logs', () => {
    const out = summarizeOutput(Array.from({ length: 20 }, (_, i) => `line${i}`).join('\n'), 5);
    assert.match(out, /more lines/);
  });
});
