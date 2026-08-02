/**
 * STAFF_TRAINADM — accommodation decision queue (COM_IMP advisory read-only).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JSX, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decideAccommodation, fetchAccommodationQueue } from "@/lib/api-accommodations";

export default function StaffAccommodationsPage(): JSX.Element {
  const qc = useQueryClient();
  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["admin", "accommodations", "queue"],
    queryFn: fetchAccommodationQueue,
  });

  const [rationale, setRationale] = useState<Record<string, string>>({});
  const [extraPct, setExtraPct] = useState<Record<string, string>>({});

  const decideMutation = useMutation({
    mutationFn: (p: {
      id: string;
      status: "APPROVED" | "REJECTED";
      requestType: string;
    }) =>
      decideAccommodation(p.id, {
        status: p.status,
        decisionRationale: rationale[p.id] ?? "Reviewed per ISO §9.2.2.",
        accommodationsGranted:
          p.status === "APPROVED"
            ? {
                types: [p.requestType],
                extraTimePct: p.requestType === "EXTRA_TIME" ? Number(extraPct[p.id] || 25) : undefined,
              }
            : undefined,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "accommodations", "queue"] }),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Red prilagodbi</h1>
        <p className="text-sm text-text-secondary">Odluke donosi STAFF_TRAINADM; COM_IMP ima savjetodavnu ulogu.</p>
      </header>
      {isLoading ? (
        <p className="text-sm text-text-muted">Učitavanje…</p>
      ) : queue.length === 0 ? (
        <p className="text-sm text-text-muted">Nema otvorenih zahtjeva.</p>
      ) : (
        <ul className="space-y-4">
          {queue.map((r) => (
            <li key={r.id} className="rounded-xl border border-border/50 p-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{r.requestType}</Badge>
                <Badge variant="outline">{r.status}</Badge>
                {r.requester ? (
                  <span>
                    {r.requester.firstName} {r.requester.lastName} ({r.requester.email})
                  </span>
                ) : null}
              </div>
              <p className="mt-2">{r.detailsText}</p>
              {r.requestType === "EXTRA_TIME" ? (
                <div className="mt-2 max-w-xs space-y-1">
                  <Label>Dodatno vrijeme (%)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={100}
                    value={extraPct[r.id] ?? "25"}
                    onChange={(e) => setExtraPct((m) => ({ ...m, [r.id]: e.target.value }))}
                  />
                </div>
              ) : null}
              <div className="mt-3 space-y-1">
                <Label>Racional odluke</Label>
                <Input
                  value={rationale[r.id] ?? ""}
                  onChange={(e) => setRationale((m) => ({ ...m, [r.id]: e.target.value }))}
                />
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    decideMutation.mutate({ id: r.id, status: "APPROVED", requestType: r.requestType })
                  }
                  disabled={decideMutation.isPending}
                >
                  Odobri
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    decideMutation.mutate({ id: r.id, status: "REJECTED", requestType: r.requestType })
                  }
                  disabled={decideMutation.isPending}
                >
                  Odbij
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
