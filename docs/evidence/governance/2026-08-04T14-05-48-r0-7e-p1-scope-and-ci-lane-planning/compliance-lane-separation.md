# Compliance Lane Separation

## governance-policy-validation

May validate required tracked governance files, declared architecture status,
standards-reference policy, prohibited claims, evidence structure, workflow
permission rules, and internal consistency. It must report document authority
and must not infer runtime implementation.

## implementation-compliance-validation

Requires complete tracked implementation authority, executable tests,
deterministic dependencies, and evidence tied to the exact commit. When inputs
are absent, the lane must block or skip with an explicit reason, or be narrowly
scoped to an honestly named implemented control.

Prohibited:

- an unqualified ISO compliant status;
- a green implementation claim based only on document presence;
- presenting policy validation as product conformity;
- reproducing copyrighted standards text in source, logs, or artifacts.

IMPLEMENTATION_COMPLIANCE = NOT_CLAIMED
ISO_CONFORMITY = NOT_CLAIMED
