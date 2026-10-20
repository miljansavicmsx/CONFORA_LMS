#!/usr/bin/env node
/**
 * Notify the accessibility channel when the workflow failed.
 * Missing webhook or SMTP configuration is reported and does not invent a sent notice.
 */
const webhook = process.env.SLACK_A11Y_WEBHOOK_URL ?? '';
const email = process.env.A11Y_CHAMPION_EMAIL ?? '';
const runUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : '';
const text = `CONFORA accessibility workflow failed.${runUrl ? ` ${runUrl}` : ''}`;

if (!webhook && !email) {
  console.log(
    'Accessibility failure notification skipped: SLACK_A11Y_WEBHOOK_URL and A11Y_CHAMPION_EMAIL are unset.',
  );
  process.exit(0);
}

if (webhook) {
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    console.error(`Slack accessibility notification failed: HTTP ${response.status}`);
    process.exit(1);
  }
  console.log('Posted accessibility failure notice to Slack.');
}

if (email) {
  if (!process.env.SMTP_HOST) {
    console.error('A11Y_CHAMPION_EMAIL is set but SMTP_HOST is unset. Email was not sent.');
    process.exit(1);
  }
  console.error('SMTP delivery is not implemented in this notifier. Email was not sent.');
  process.exit(1);
}
