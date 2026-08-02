import { Bot, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export default function DashboardAiTutorPage(): JSX.Element {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
          <Bot className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">AI Tutor</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Edukativni asistent dostupan je unutar playera kursa, u kontekstu lekcije i modula koji učite.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-6">
        <div className="flex items-start gap-3 text-violet-100">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-text-primary">Gdje se koristi</p>
            <p className="mt-1 text-sm text-text-secondary">
              Otvorite upisani kurs i koristite plutajuće dugme u donjem desnom uglu. AI Tutor pomaže sa objašnjenjem
              lekcije, pojmova, ponavljanjem slabijih oblasti i pripremom za učenje.
            </p>
          </div>
        </div>
        <Button asChild className="mt-6 bg-violet-600 text-white hover:bg-violet-500">
          <Link to="/dashboard/courses">Otvori moje kurseve</Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">AI smije pomagati u učenju</h2>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-text-secondary">
                <li>objasniti lekciju ili pojam iz kursa</li>
                <li>predložiti šta ponoviti nakon slabog kviza</li>
                <li>sažeti gradivo i dati primjere za vježbu</li>
                <li>pomoći autorima pri nacrtu sadržaja koji ide na ljudski pregled</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">AI ne donosi certifikacijske odluke</h2>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-text-secondary">
                <li>ne odobrava ili odbija prijavu kandidata</li>
                <li>ne mijenja status certifikata</li>
                <li>ne izdaje konačan certifikat bez ljudske kontrole</li>
                <li>ne zamjenjuje certifikacijski ili žalbeni komitet</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <p className="rounded-xl border border-border/50 bg-surface-secondary/30 px-4 py-3 text-sm text-text-secondary">
        Disclaimer: AI daje edukativnu pomoć i prijedloge. Službene odluke o certifikaciji, žalbama, statusima i
        izdavanju certifikata donose se samo kroz formalne ljudske procese u CONFORA platformi.
      </p>
    </div>
  );
}
