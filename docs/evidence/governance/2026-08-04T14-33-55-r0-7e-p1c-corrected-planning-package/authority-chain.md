# Authority Chain

## Precedence

1. Approved owner decisions are Level 1 normative authority under
   docs/governance/GOVERNANCE_HIERARCHY.md.
2. docs/governance/CONFORA_CANONICAL_DEVELOPMENT_BASELINE.md is the Level 2
   controlling development baseline, subordinate to approved owner decisions.
3. Level 3 governance, accepted Level 4 ADRs, and Level 5 architecture standards
   govern only within their authority and may not override Levels 1-2.
4. Level 6 module and task specifications define bounded work but may not
   override higher authority.
5. Level 7 planning packages, reviews, and implementation evidence record
   proposals or observed results; they do not establish policy or conformity.

## Evidence distinctions

- Planning evidence describes a proposed boundary and required future proof.
- Review evidence records an independent assessment of an exact Git identity.
- Implementation evidence may support a bounded implementation claim only when
  tied to tracked source, executable tests, and the exact reviewed commit.
- None of these evidence classes is normative by itself.

The R0-7E definition was proposed in tracked Level 7 evidence at
docs/evidence/governance/2026-07-26T20-40-00-r0-7a-ci-reconstruction-plan/proposed_r0-7_sequence.md.
P1C authorization permits correction planning only. OD-R07E-1 through
OD-R07E-8 remain unresolved and unadopted.

R0_7E_PLANNING_SCOPE = OWNER_AUTHORIZED_NON_NORMATIVE_CORRECTION_PROPOSAL
