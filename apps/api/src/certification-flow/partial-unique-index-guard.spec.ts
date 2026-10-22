import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const INDEXES = [
  {
    name: 'CommitteeAssessment_one_live_vote_key',
    predicate: 'WHERE "voidedAt" IS NULL',
  },
  {
    name: 'CommitteeAssessment_live_vote_per_version_key',
    predicate: 'WHERE "voidedAt" IS NULL',
  },
  {
    name: 'ExamCertificationDecision_live_result_key',
    predicate: 'WHERE "supersededAt" IS NULL',
  },
  {
    name: 'CertificationBodyReview_one_open_key',
    predicate: `WHERE "status" = 'OPEN'`,
  },
] as const;

function migrationSql(): string[] {
  const root = join(__dirname, '../../../../packages/database/prisma/migrations');
  return readdirSync(root)
    .map((entry) => join(root, entry, 'migration.sql'))
    .filter((path) => {
      try {
        readFileSync(path, 'utf8');
        return true;
      } catch {
        return false;
      }
    })
    .map((path) => readFileSync(path, 'utf8'));
}

describe('partial unique indexes', () => {
  const migrations = migrationSql();
  const schema = readFileSync(
    join(__dirname, '../../../../packages/database/prisma/schema.prisma'),
    'utf8',
  );

  it.each(INDEXES)('keeps $name in SQL and forbids a later drop', (index) => {
    const creates = migrations.filter(
      (sql) => sql.includes(`CREATE UNIQUE INDEX "${index.name}"`) && sql.includes(index.predicate),
    );
    expect(creates).toHaveLength(1);
    for (const sql of migrations) {
      expect(sql).not.toContain(`DROP INDEX "${index.name}"`);
      expect(sql).not.toContain(`DROP INDEX IF EXISTS "${index.name}"`);
    }
    expect(schema).toContain(index.name);
    expect(schema).toContain(index.predicate);
  });
});
