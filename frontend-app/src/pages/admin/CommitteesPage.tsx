/**
 * SysAdmin — §11.1 Committee management (create committees, assign members).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, UserPlus, Users2 } from "lucide-react";
import { useState, type JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addCommitteeMember,
  createCommittee,
  fetchCommittees,
  removeCommitteeMember,
  type CommitteeRow,
  type CommitteeType,
} from "@/lib/api-committees";
const Q = ["admin", "committees"] as const;

const TYPE_LABELS: Record<CommitteeType, string> = {
  technical_committee: "Tehnički komitet",
  certification_committee: "Komitet za certifikaciju",
  appeals_committee: "Komitet za žalbe",
  impartiality_committee: "Komitet za nepristrasnost",
};

export default function CommitteesPage(): JSX.Element {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState<CommitteeType>("technical_committee");
  const [newName, setNewName] = useState("");
  const [addTo, setAddTo] = useState<CommitteeRow | null>(null);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState("član");

  const listQ = useQuery({ queryKey: Q, queryFn: fetchCommittees });
  const items = listQ.data ?? [];

  const createM = useMutation({
    mutationFn: () => createCommittee({ committeeType: newType, name: newName.trim() }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: Q });
      setShowCreate(false);
      setNewName("");
    },
  });

  const addMemberM = useMutation({
    mutationFn: () =>
      addCommitteeMember(addTo!.committeeId, {
        userId: memberUserId.trim(),
        roleInCommittee: memberRole.trim(),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: Q });
      setAddTo(null);
      setMemberUserId("");
      setMemberRole("član");
    },
  });

  const removeMemberM = useMutation({
    mutationFn: ({ cid, uid }: { cid: string; uid: string }) => removeCommitteeMember(cid, uid),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: Q });
    },
  });

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/25">
              <Users2 className="h-6 w-6 text-brand" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Komiteti</h1>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                §11.1 — organizaciona struktura i imenovanje članova komiteta.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Novi komitet
          </Button>
        </header>

        {listQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-brand" aria-hidden />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/50 py-16 text-center text-sm text-text-muted">
            Nema kreiranih komiteta.
          </p>
        ) : (
          <div className="space-y-6">
            {items.map((c) => (
              <section
                key={c.committeeId}
                className="rounded-2xl border border-border/50 bg-surface-secondary/40 p-6 ring-1 ring-white/[0.04]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">{c.name}</h2>
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
                      {TYPE_LABELS[c.committeeType] ?? c.committeeType}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setAddTo(c)}>
                    <UserPlus className="mr-1 h-4 w-4" aria-hidden />
                    Dodaj člana
                  </Button>
                </div>

                <div className="mt-4">
                  {c.members.filter((m) => m.active).length === 0 ? (
                    <p className="text-xs text-text-muted">Nema aktivnih članova.</p>
                  ) : (
                    <ul className="space-y-2">
                      {c.members
                        .filter((m) => m.active)
                        .map((m) => (
                          <li
                            key={m.userId}
                            className="flex items-center justify-between rounded-lg border border-border/30 bg-surface-primary/30 px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="font-mono text-xs text-brand">{m.userId}</span>
                              <span className="mx-2 text-text-muted">·</span>
                              <span className="text-text-secondary">{m.roleInCommittee}</span>
                              {m.appointedAt ? (
                                <span className="ml-2 text-xs text-text-muted">od {m.appointedAt.slice(0, 10)}</span>
                              ) : null}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              disabled={removeMemberM.isPending}
                              onClick={() => void removeMemberM.mutateAsync({ cid: c.committeeId, uid: m.userId })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novi komitet</DialogTitle>
            <DialogDescription>Odaberite tip i unesite naziv.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Tip</Label>
              <select
                className="h-10 w-full rounded-md border border-border/60 bg-surface-primary px-3 text-sm text-text-primary"
                value={newType}
                onChange={(e) => setNewType(e.target.value as CommitteeType)}
              >
                {(Object.keys(TYPE_LABELS) as CommitteeType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-name">Naziv</Label>
              <Input id="c-name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Otkaži
            </Button>
            <Button disabled={createM.isPending || !newName.trim()} onClick={() => void createM.mutateAsync()}>
              {createM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kreiraj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addTo !== null} onOpenChange={(o) => !o && setAddTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj člana u: {addTo?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="m-uid">User ID</Label>
              <Input id="m-uid" value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)} placeholder="UUID korisnika iz registra" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-role">Uloga u komitetu</Label>
              <Input id="m-role" value={memberRole} onChange={(e) => setMemberRole(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTo(null)}>
              Otkaži
            </Button>
            <Button disabled={addMemberM.isPending || !memberUserId.trim()} onClick={() => void addMemberM.mutateAsync()}>
              {addMemberM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dodaj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
