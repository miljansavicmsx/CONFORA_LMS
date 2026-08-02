/**
 * Javni obrazac potvrđitelja (ISO §9.2.2) — bez korisničkog računa, JWT u URL-u.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type FormEvent, type JSX, useMemo, useState } from "react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildApiUrl } from "@/lib/api";

type VerifierContext = {
  applicantName: string;
  schemeName: string;
  verifierName: string;
  responded: boolean;
  confirmed: boolean | null;
};

async function fetchContext(token: string): Promise<VerifierContext> {
  const t = encodeURIComponent(token.trim());
  const res = await fetch(buildApiUrl(`/v1/public/verify-applicant/${t}`), {
    credentials: "omit",
  });
  if (!res.ok) {
    throw new Error(`Učitavanje obrasca nije uspjelo (${res.status})`);
  }
  return res.json() as Promise<VerifierContext>;
}

async function postVerifier(body: {
  token: string;
  confirm: boolean;
  comment: string;
  signature: string;
}): Promise<{ ok: boolean }> {
  const res = await fetch(buildApiUrl("/v1/public/verify-applicant"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = "Slanje nije uspjelo.";
    try {
      const j = (await res.json()) as { message?: string; detail?: unknown };
      msg = j.message ?? (typeof j.detail === "string" ? j.detail : msg);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<{ ok: boolean }>;
}

export default function VerifyApplicantPage(): JSX.Element {
  const { token = "" } = useParams<{ readonly token: string }>();
  const raw = useMemo(() => decodeURIComponent(token.trim()), [token]);

  const q = useQuery({
    queryKey: ["verify-applicant", raw],
    queryFn: () => fetchContext(raw),
    enabled: raw.length > 0,
  });

  const [confirm, setConfirm] = useState(false);
  const [comment, setComment] = useState("");
  const [signature, setSignature] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      postVerifier({
        token: raw,
        confirm,
        comment: comment.trim(),
        signature: signature.trim(),
      }),
    onSuccess: () => setDone(true),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!signature.trim()) {
      return;
    }
    mutation.mutate();
  };

  if (!raw) {
    return <p className="p-8 text-sm text-text-secondary">Nedostaje token u adresi.</p>;
  }

  if (q.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        Učitavanje…
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-lg p-8 text-sm text-red-300">
        Poveznica nije valjana ili je istekla. Zatražite novu od kandidata ili sekretarijata.
      </div>
    );
  }

  if (q.data.responded || done) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8">
        <h1 className="text-xl font-semibold text-text-primary">Hvala — odgovor je zaprimljen</h1>
        <p className="text-sm text-text-secondary">
          Vaš odgovor na potvrdu za {q.data.applicantName} ({q.data.schemeName}) bilježi se u sustavu certifikacijskog tijela.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-8">
      <header className="space-y-2 border-b border-border/40 pb-6">
        <h1 className="text-xl font-semibold text-text-primary">Potvrda kontakta / potvrđitelja</h1>
        <p className="text-sm text-text-secondary">
          Kandidat: <span className="font-medium text-text-primary">{q.data.applicantName}</span>
        </p>
        <p className="text-sm text-text-secondary">
          Shema: <span className="font-medium text-text-primary">{q.data.schemeName}</span>
        </p>
        <p className="text-xs text-text-muted">Pozdrav, {q.data.verifierName}. Ovaj obrazac ne zahtijeva prijavu.</p>
      </header>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-surface-secondary/40 p-4">
          <Checkbox
            id="confirm"
            checked={confirm}
            onCheckedChange={(c) => setConfirm(c === true)}
          />
          <Label htmlFor="confirm" className="cursor-pointer text-sm leading-relaxed text-text-secondary">
            Potvrđujem da su mi poznati podaci o kandidatu u opsegu mog poznavanja i da mogu potvrditi njegovu relevantnost za
            traženu certifikaciju.
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Komentar (opcionalno)</Label>
          <textarea
            id="comment"
            rows={3}
            className="w-full rounded-md border border-border/60 bg-surface-primary/40 px-3 py-2 text-sm text-text-primary"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={4000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sig">Elektronički potpis (puno ime)</Label>
          <Input id="sig" value={signature} onChange={(e) => setSignature(e.target.value)} required />
        </div>

        {mutation.isError ? (
          <p className="text-sm text-red-400" role="alert">
            {mutation.error instanceof Error ? mutation.error.message : "Greška"}
          </p>
        ) : null}

        <Button type="submit" className="bg-brand text-white hover:bg-brand/90" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Šaljem…
            </>
          ) : (
            "Pošalji odgovor"
          )}
        </Button>
        <p className="text-xs text-text-muted">
          Poveznica je jednokratna nakon slanja. Ako ste pogrešno potvrdili, kontaktirajte certifikacijsko tijelo.
        </p>
      </form>
    </div>
  );
}
