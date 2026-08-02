import type {
  AccreditationPillar,
  DigitalTwinInsight,
  GovernanceMaturityResult,
  ReadinessStatus,
  ResilienceSignal,
  TwinNormalizedInput,
} from "./twin-types";

export function buildDigitalTwinInsights(
  input: TwinNormalizedInput,
  resilience: readonly ResilienceSignal[],
  maturity: GovernanceMaturityResult,
  accreditation: { readonly pillars: readonly AccreditationPillar[]; readonly aggregateStatus: ReadinessStatus },
  capacity: readonly { readonly saturation: number; readonly name: string }[],
): DigitalTwinInsight[] {
  const out: DigitalTwinInsight[] = [];

  const overloaded = capacity.filter((c) => c.saturation >= 0.72).sort((a, b) => b.saturation - a.saturation)[0];
  if (overloaded) {
    out.push({
      id: "ins-committee-load",
      title: `${overloaded.name} pod visokom saturacijom`,
      body: "Kapacitet odbora je blizu limita — razmotrite raspored ili pomoćne revidere.",
      tone: "concern",
    });
  }

  if (input.singleMemberCommittees > 0) {
    out.push({
      id: "ins-single-reviewer",
      title: "Ovisnost o jednom članu",
      body: `${input.singleMemberCommittees} odbor(a) s jednim aktivnim članom — digital twin označava točku jedinstvenog odlučivanja.`,
      tone: "concern",
    });
  }

  const capaDriver = maturity.drivers.find((d) => d.id === "capa");
  if (capaDriver && capaDriver.contribution < 52) {
    out.push({
      id: "ins-capa-discipline",
      title: "Disciplina zatvaranja CAPA slabi",
      body: "Odnos otvorenih i prekoračenih CAPA degradira maturity profil tijela.",
      tone: "concern",
    });
  }

  const impPillar = accreditation.pillars.find((p) => p.id === "impartiality");
  if (impPillar && impPillar.status === "ready" && input.impartialityThreats <= 2) {
    out.push({
      id: "ins-impartiality-up",
      title: "Impartiality governance u pozitivnoj zoni",
      body: "Niski backlog prijetnji i ročnosti pomažu argumentaciju za vanjsku akreditaciju.",
      tone: "positive",
    });
  }

  const tracePillar = accreditation.pillars.find((p) => p.id === "traceability");
  if (tracePillar && tracePillar.score >= 78) {
    out.push({
      id: "ins-trace-high",
      title: "Visoka pokrivenost traceability (proxy)",
      body: "Kvorum i COI signaliziraju da digital evidencije prate odborsku operativu.",
      tone: "positive",
    });
  }

  const topRes = resilience.find((s) => s.severity === "critical");
  if (topRes) {
    out.push({
      id: `ins-res-${topRes.id}`,
      title: topRes.title,
      body: topRes.detail,
      tone: "concern",
    });
  }

  if (out.length < 4) {
    out.push({
      id: "ins-neutral-ops",
      title: "Operativna topologija",
      body: "Model prikazuje veze QM–odbor–žalbe bez teškog grafa; podaci dolaze iz agregata.",
      tone: "neutral",
    });
  }

  return out.slice(0, 10);
}
