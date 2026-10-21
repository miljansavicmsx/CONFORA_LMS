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

describe('exam confidentiality boundary', () => {
  const dir = join(__dirname);

  it('does not capture images or expose the bank to an AI tutor', () => {
    const violations: string[] = [];
    for (const file of files(dir)) {
      const text = readFileSync(file, 'utf8');
      if (/webcam|idImage|jmbg|nationalId|AiTutor|ai-tutor|correctChoiceKey/i.test(text)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it('keeps candidate routes on the learner guard and strips answer keys in the projection', () => {
    const controller = readFileSync(join(dir, 'exam.controller.ts'), 'utf8');
    expect(controller).toContain("@Controller('me/exams')");
    expect(controller).toContain('@RequireLearnerRoles()');
    expect(controller).toContain('@RequireMfa()');
    expect(controller).not.toContain('isCorrect');
    const rules = readFileSync(join(dir, 'exam-rules.ts'), 'utf8');
    const projection = rules.slice(rules.indexOf('export function toCandidateItem'));
    expect(projection).not.toContain('isCorrect: choice.isCorrect');
  });
});
