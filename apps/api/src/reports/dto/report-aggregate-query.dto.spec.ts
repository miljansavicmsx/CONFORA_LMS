import { parseRfc3339ExactInstant, reportAggregateQuerySchema } from './report-aggregate-query.dto';

describe('ReportAggregateQueryDto', () => {
  const validRange = {
    createdFrom: '2026-01-01T00:00:00Z',
    createdTo: '2026-01-02T00:00:00Z',
  };

  describe('valid RFC3339 transport', () => {
    it.each([
      ['2026-01-01T00:00:00Z', 'no fractional'],
      ['2026-01-01T00:00:00.1Z', '.1'],
      ['2026-01-01T00:00:00.12Z', '.12'],
      ['2026-01-01T00:00:00.123Z', '.123'],
      ['2026-01-01T00:00:00+00:00', '+00:00'],
      ['2026-01-01T00:00:00-00:00', '-00:00'],
      ['2026-01-01T01:00:00+01:00', 'positive nonzero offset'],
      ['2026-01-01T01:00:00.123+01:00', 'positive offset with fraction'],
      ['2025-12-31T23:00:00-01:00', 'negative nonzero offset'],
      ['2024-02-29T12:00:00Z', 'Gregorian leap-year Feb 29'],
    ])('accepts %s (%s)', (value) => {
      const parsed = reportAggregateQuerySchema.safeParse({
        createdFrom: value,
        createdTo: '2026-06-01T00:00:00Z',
      });
      expect(parsed.success).toBe(true);
      const instant = parseRfc3339ExactInstant(value);
      expect(instant).not.toBeNull();
      if (instant === null) {
        return;
      }
      expect(Number.isFinite(instant.getTime())).toBe(true);
    });

    it('Z / +00:00 / -00:00 are the same millisecond UTC instant', () => {
      const z = parseRfc3339ExactInstant('2026-01-01T00:00:00Z');
      const p = parseRfc3339ExactInstant('2026-01-01T00:00:00+00:00');
      const n = parseRfc3339ExactInstant('2026-01-01T00:00:00-00:00');
      expect(z).not.toBeNull();
      expect(p).not.toBeNull();
      expect(n).not.toBeNull();
      if (z === null || p === null || n === null) {
        return;
      }
      expect(z.getTime()).toBe(p.getTime());
      expect(z.getTime()).toBe(n.getTime());
    });

    it('preserves exact schemeRef without trim/normalization', () => {
      const parsed = reportAggregateQuerySchema.safeParse({
        ...validRange,
        schemeRef: ' Scheme-A ',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) expect(parsed.data.schemeRef).toBe(' Scheme-A ');
    });

    it('preserves exact status scalar', () => {
      const parsed = reportAggregateQuerySchema.safeParse({
        ...validRange,
        status: 'DRAFT',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) expect(parsed.data.status).toBe('DRAFT');
    });
  });

  describe('invalid RFC3339 transport', () => {
    it.each([
      ['2026-01-01', 'date-only'],
      ['2026-01-01T00:00:00', 'timezone-less'],
      ['2026-01-01T00:00:00z', 'lowercase z'],
      ['2026-01-01T00:00:00.1234Z', '>3 fractional .1234'],
      ['2026-01-01T00:00:00.123456789Z', '>3 fractional long'],
      ['2026-00-01T00:00:00Z', 'month 00'],
      ['2026-13-01T00:00:00Z', 'month 13'],
      ['2026-01-00T00:00:00Z', 'day 00'],
      ['2026-04-31T00:00:00Z', 'April 31'],
      ['2025-02-29T00:00:00Z', 'Feb 29 non-leap'],
      ['2024-02-30T00:00:00Z', 'Feb 30'],
      ['2026-01-01T24:00:00Z', 'hour 24'],
      ['2026-01-01T00:60:00Z', 'minute 60'],
      ['2026-01-01T00:00:60Z', 'second 60 leap second'],
      ['2026-01-01T00:00:00+24:00', 'offset hour >23'],
      ['2026-01-01T00:00:00+01:60', 'offset minute >59'],
      ['2026-01-01T00:00:00+1:00', 'malformed offset'],
      ['2026-01-01T00:00:00Zjunk', 'trailing junk'],
    ])('rejects %s (%s)', (value) => {
      const parsed = reportAggregateQuerySchema.safeParse({
        createdFrom: value,
        createdTo: '2026-06-01T00:00:00Z',
      });
      expect(parsed.success).toBe(false);
      expect(parseRfc3339ExactInstant(value)).toBeNull();
    });

    it('does not truncate or round sub-millisecond input', () => {
      const raw = '2026-01-01T00:00:00.1234Z';
      expect(parseRfc3339ExactInstant(raw)).toBeNull();
      const coerced = new Date(raw);
      expect(Number.isFinite(coerced.getTime())).toBe(true);
      expect(
        reportAggregateQuerySchema.safeParse({ createdFrom: raw, createdTo: validRange.createdTo })
          .success,
      ).toBe(false);
    });
  });

  describe('query allowlist / pollution', () => {
    it('rejects unknown keys (strict)', () => {
      const parsed = reportAggregateQuerySchema.safeParse({
        ...validRange,
        tenantId: 'x',
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.some((i) => i.code === 'unrecognized_keys')).toBe(true);
      }
    });

    it('rejects allowlisted non-string array transport', () => {
      const parsed = reportAggregateQuerySchema.safeParse({
        ...validRange,
        status: ['DRAFT', 'SUBMITTED'],
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        expect(issue.path[0]).toBe('status');
        expect('received' in issue ? issue.received : undefined).toBe('array');
      }
    });

    it('rejects allowlisted nested object transport', () => {
      const parsed = reportAggregateQuerySchema.safeParse({
        ...validRange,
        status: { x: 'DRAFT' },
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        expect(issue.path[0]).toBe('status');
        expect('received' in issue ? issue.received : undefined).toBe('object');
      }
    });

    it('rejects invalid status scalar', () => {
      const parsed = reportAggregateQuerySchema.safeParse({
        ...validRange,
        status: 'draft',
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects empty schemeRef', () => {
      const parsed = reportAggregateQuerySchema.safeParse({
        ...validRange,
        schemeRef: '',
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects schemeRef longer than 128', () => {
      const parsed = reportAggregateQuerySchema.safeParse({
        ...validRange,
        schemeRef: 'x'.repeat(129),
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects forbidden dimension/groupBy keys', () => {
      for (const key of ['dimension', 'groupBy', 'export', 'page', 'limit']) {
        const parsed = reportAggregateQuerySchema.safeParse({
          ...validRange,
          [key]: 'x',
        });
        expect(parsed.success).toBe(false);
      }
    });
  });
});
