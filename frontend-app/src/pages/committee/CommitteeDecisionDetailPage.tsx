import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState, type JSX } from "react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  castCommitteeVote,
  closeCommitteeDecision,
  getCommitteeReview,
  type CommitteeVote,
} from "@/lib/api-committee-review";

export default function CommitteeDecisionDetailPage(): JSX.Element {
  const params = useParams();
  const queryClient = useQueryClient();
  const applicationId = useMemo(() => String(params.applicationId ?? "").trim(), [params.applicationId]);
  const [comment, setComment] = useState("");
  const [rationale, setRationale] = useState("");

  const q = useQuery({
    queryKey: ["committee", "detail", applicationId] as const,
    queryFn: () => getCommitteeReview(applicationId),
    enabled: applicationId.length > 0,
  });

  const voteMutation = useMutation({
    mutationFn: (vote: CommitteeVote) => castCommitteeVote(String((q.data as any)?.decisionId || ""), { vote, comment }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["committee", "detail", applicationId] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closeCommitteeDecision(String((q.data as any)?.decisionId || ""), { rationale }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["committee", "detail", applicationId] });
    },
  });

  if (q.isLoading) {
    return (
      <div className="p-8 text-text-secondary">
        <Loader2 className="inline h-5 w-5 animate-spin" /> Učitavanje...
      </div>
    );
  }
  if (q.isError || !q.data) {
    return <div className="p-8 text-red-400">Ne mogu učitati committee decision detalje.</div>;
  }

  const d = q.data;
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Committee Decision Detail</h1>

        <section className="rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Candidate/Application</h2>
          <p className="mt-2 text-sm text-text-secondary">Candidate: {d.candidateSummary.candidateId}</p>
          <p className="text-sm text-text-secondary">Application: {d.applicationSummary.applicationId}</p>
          <p className="text-sm text-text-secondary">Scheme: {d.certificationSchemeSummary.name ?? "—"}</p>
          <p className="text-sm text-text-secondary">Status: {d.decisionStatus}</p>
        </section>

        <section className="rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">COI / Quorum</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Can vote: {d.allowedActions.canCurrentUserVote ? "YES" : "NO"} {d.allowedActions.voteBlockedReason ?? ""}
          </p>
          <p className="text-sm text-text-secondary">
            Quorum: {d.quorumStatus.votesCast}/{d.quorumStatus.quorumRequired}
          </p>
          {d.blockers.blockedMembers.length > 0 ? (
            <p className="mt-2 text-sm text-red-300">Glasanje blokirano zbog sukoba interesa.</p>
          ) : null}
          {d.blockers.pendingDeclarations.length > 0 ? (
            <p className="mt-1 text-sm text-amber-300">Potrebna COI izjava prije glasanja.</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Voting panel</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2 w-full rounded-md border border-border/60 bg-surface-primary p-2 text-sm"
            placeholder="Comment"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => voteMutation.mutate("APPROVE")} disabled={!d.allowedActions.canCurrentUserVote}>
              Approve
            </Button>
            <Button onClick={() => voteMutation.mutate("REJECT")} disabled={!d.allowedActions.canCurrentUserVote} variant="outline">
              Reject
            </Button>
            <Button onClick={() => voteMutation.mutate("ABSTAIN")} disabled={!d.allowedActions.canCurrentUserVote} variant="outline">
              Abstain
            </Button>
            <Button
              onClick={() =>
                castCommitteeVote(String((q.data as any)?.decisionId || ""), {
                  vote: "ABSTAIN",
                  comment,
                  conflictDeclared: true,
                  conflictReason: comment || "Declared conflict",
                })
              }
              variant="ghost"
            >
              Declare Conflict
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-border/50 p-4">
          <h2 className="font-semibold text-text-primary">Close decision</h2>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            className="mt-2 w-full rounded-md border border-border/60 bg-surface-primary p-2 text-sm"
            placeholder="Rationale"
          />
          <div className="mt-3">
            <Button onClick={() => closeMutation.mutate()} disabled={!d.allowedActions.canClose}>
              Close Decision
            </Button>
            {!d.allowedActions.canClose ? (
              <p className="mt-2 text-sm text-amber-300">Odluka se ne može zatvoriti jer kvorum nije ispunjen ili postoje COI blockeri.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

