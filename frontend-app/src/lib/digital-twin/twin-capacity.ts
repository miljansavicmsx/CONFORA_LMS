import type { GovernanceCommitteeRow } from "@/lib/api-governance";

import { classifyCommitteeFamily } from "./twin-committees";
import type { CommitteeCapacityRow, ReadinessStatus, TwinNormalizedInput } from "./twin-types";

/** Koncentracija: mali broj članova + veliki proxy opterećenja. */
function concentration(memberCount: number, load: number): ReadinessStatus {
  if (memberCount <= 1 && load > 6) return "critical";
  if (memberCount <= 3 && load > 18) return "warning";
  return "ready";
}

export function computeCommitteeCapacity(
  committees: readonly GovernanceCommitteeRow[],
  input: TwinNormalizedInput,
): CommitteeCapacityRow[] {
  return committees.map((c) => {
    const fam = classifyCommitteeFamily(c);
    let active = 0;
    let overdue = 0;
    let velHint = "Linearna procjena iz dashboard konteksta po tipu odbora.";

    if (fam === "certification_committee") {
      active = Math.round(
        input.certInReview * 0.35 + input.decisionsOpen * 0.45 + (input.certQueue > 0 ? input.certQueue * 0.2 : 0),
      );
      overdue = input.quorumPending + input.coiIncomplete * 2;
      velHint =
        input.decisionsOpen > 12
          ? "Otvorenih odluka puno — očekuj nižu brzinu review-a."
          : "Odbor unutar tipične brzine obrade.";
    } else if (fam === "appeals_committee") {
      active = input.openAppeals + Math.round(input.openComplaints * 0.25);
      overdue = input.openComplaints;
      velHint =
        input.openAppeals > 6 ? "Žalbeni inventar raste — potreban dodatni quorum." : "Žalbena navala umjerena.";
    } else if (fam === "impartiality_committee") {
      active = input.impartialityThreats * 2 + input.impartialityReviewsOverdue;
      overdue = input.impartialityReviewsOverdue;
      velHint =
        input.impartialityThreats > 4 ? "Impartiality backlog traži prioritizaciju." : "Impartiality opterećenje primjereno.";
    } else {
      active = Math.min(40, Math.round(input.certQueue * 0.15));
      overdue = input.quorumPending;
    }

    const members = Math.max(1, c.members.length);
    const saturation = Math.min(1, (active + overdue * 1.8) / (members * 14 + 10));
    const reviewerSpread = Math.min(100, Math.round((members / (1 + saturation * 6)) * 20));

    return {
      committeeId: c.committeeId,
      name: c.name,
      committeeType: c.committeeType,
      activeWorkloadProxy: active,
      overdueLoadProxy: overdue,
      reviewVelocityHint: velHint,
      saturation,
      reviewerSpread,
      concentrationRisk: concentration(members, active + overdue),
    };
  });
}
