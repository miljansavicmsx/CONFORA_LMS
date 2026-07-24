import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveNotificationSubject } from './subjects.js';

test('en subject resolves without fallback', () => {
  const r = resolveNotificationSubject('exam.passed', 'en');
  assert.equal(r.resolvedLocale, 'en');
  assert.equal(r.usedFallback, false);
  assert.equal(r.fallbackFrom, null);
  assert.equal(r.subjectLocalized, true);
  assert.equal(r.subject.includes('Exam passed'), true);
});

test('hr subject uses explicit EN fallback metadata', () => {
  const r = resolveNotificationSubject('certificate.issued', 'hr');
  assert.equal(r.resolvedLocale, 'en');
  assert.equal(r.usedFallback, true);
  assert.equal(r.fallbackFrom, 'en');
  assert.equal(r.subjectLocalized, false);
  assert.equal(r.requestedLocale, 'hr');
});

test('unknown locale falls back to EN with auditable flags', () => {
  const r = resolveNotificationSubject('appeal.received', 'de');
  assert.equal(r.resolvedLocale, 'en');
  assert.equal(r.usedFallback, true);
  assert.equal(r.fallbackFrom, 'en');
  assert.equal(r.subjectLocalized, false);
});

test('event boundary subjects remain distinct (no exam=cert / decision=issuance / appeal=complaint)', () => {
  const exam = resolveNotificationSubject('exam.passed', 'en').subject;
  const decision = resolveNotificationSubject('application.decision.approved', 'en').subject;
  const issued = resolveNotificationSubject('certificate.issued', 'en').subject;
  const appeal = resolveNotificationSubject('appeal.received', 'en').subject;
  const complaint = resolveNotificationSubject('complaint.received', 'en').subject;
  const enrollment = resolveNotificationSubject('enrollment.completed', 'en').subject;
  const recert = resolveNotificationSubject('certificate.recertification.window_opened', 'en').subject;
  const expired = resolveNotificationSubject('certificate.expired', 'en').subject;

  assert.notEqual(exam, decision);
  assert.notEqual(decision, issued);
  assert.notEqual(exam, issued);
  assert.notEqual(appeal, complaint);
  assert.notEqual(enrollment, issued);
  assert.notEqual(expired, recert);
  assert.equal(exam.toLowerCase().includes('certified'), false);
  assert.equal(issued.toLowerCase().includes('active'), false);
});
