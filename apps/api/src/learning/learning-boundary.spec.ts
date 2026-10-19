import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function files(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full));
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

describe('learning boundary', () => {
  const dir = join(__dirname);

  it('does not import PrismaService or complaint modules', () => {
    const violations: string[] = [];
    for (const file of files(dir)) {
      const text = readFileSync(file, 'utf8');
      if (
        /\bPrismaClient\b|(?<![A-Za-z])PrismaService\b|cert-complaints|cert-appeals|ComplaintCase|AppealCase/.test(
          text,
        )
      ) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it('keeps learner routes behind the learner role guard', () => {
    const controller = readFileSync(join(dir, 'learning.controller.ts'), 'utf8');
    expect(controller).toContain('@RequireLearnerRoles()');
    expect(controller).toContain("@Controller('me/learning')");
    expect(controller).not.toContain('correctChoiceKey');
  });
});
