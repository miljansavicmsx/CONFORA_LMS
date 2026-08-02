import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type JSX } from "react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { fetchCertificationDecisions } from "@/lib/api-certification-decisions";

const QUERY_KEY = ["committee", "decisions", "list"] as const;

export default function CommitteeDecisionsListPage(): JSX.Element {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchCertificationDecisions(),
  });

  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-text-primary">Committee Decisions</h1>
        <p className="mt-1 text-sm text-text-secondary">Assigned odluke, COI/quorum status i pending glasovi.</p>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" />
            Učitavanje...
          </div>
        ) : null}
        {isError ? <p className="mt-8 text-sm text-red-400">Ne mogu učitati odluke.</p> : null}

        {!isLoading && !isError ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-secondary/70 text-text-secondary">
                <tr>
                  <th className="px-3 py-2">Decision</th>
                  <th className="px-3 py-2">Application</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">COI</th>
                  <th className="px-3 py-2">Quorum</th>
                  <th className="px-3 py-2 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.decisionId} className="border-t border-border/40">
                    <td className="px-3 py-2 font-mono text-xs">{d.decisionId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{d.applicationId}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline">{d.status}</Badge>
                    </td>
                    <td className="px-3 py-2">{d.coiBlocked ? "BLOCKED" : d.coiComplete ? "CLEAR" : "PENDING"}</td>
                    <td className="px-3 py-2">{d.quorumMet ? "READY" : "PENDING"}</td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        to={`/dashboard/committee/formal-decisions/${encodeURIComponent(d.decisionId)}`}
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        Otvori
                      </Link>
                    </td>
                  </tr>
                ))}
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-text-muted">
                      Nema odluka.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}

