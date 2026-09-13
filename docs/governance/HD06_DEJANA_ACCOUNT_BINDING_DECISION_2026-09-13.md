# HD06 — Dejana Taušan account binding decision

Source: owner-supplied decision in this task, dated 2026-09-13. Transcribed by the AI assistant with Markdown escape normalization. This record is not account-binding evidence or proof of an electronic signature. Baseline §4.6 names Keycloak OIDC as the canonical architecture; the actual identity provider and account state remain unverified.

```text
HD06_DEJANA_ACCOUNT_BINDING_DECISION = DEFER

HD06_DECISION_REASON =
Dejana Taušan’s current account existence, identity-provider assignment, immutable account identifier, tenant binding, role assignment and binding evidence have not yet been verified. Approval or rejection of the account binding would therefore be unsupported.

IDENTITY_PROVIDER = NOT_VERIFIED
DEJANA_ACCOUNT_EXISTS = NOT_VERIFIED
DEJANA_ACCOUNT_STATUS = NOT_VERIFIED
DEJANA_IMMUTABLE_ACCOUNT_ID = NOT_AVAILABLE_DUE_TO_UNVERIFIED_ACCOUNT_STATE
DEJANA_LOGIN_OR_VERIFIED_EMAIL = NOT_RECORDED_PENDING_IDENTITY_VERIFICATION
TENANT_OR_ORGANIZATION_BINDING = NOT_ESTABLISHED
CURRENT_ROLE_ASSIGNMENT = NOT_VERIFIED
PROSPECTIVE_ALLOWED_ROLE = COMPLIANCE_DPO_ONLY

PROHIBITED_ROLE_SET =
REPOSITORY_OWNER;
ARCHITECTURE_LEAD;
CERTIFICATION_DECISION_MAKER;
DATABASE_ADMINISTRATOR;
SYSTEM_ADMINISTRATOR;
USER_AND_ROLE_ADMINISTRATOR

ACCOUNT_BINDING_EVIDENCE_REFERENCE = NONE
ACCOUNT_BINDING_EVIDENCE_STATUS = NOT_AVAILABLE
OWNER_APPROVER = Miljan Savić
OWNER_AUTHORITY = Repository Owner
OWNER_DECISION_DATE = 2026-09-13

OWNER_ATTESTATION =
I, Miljan Savić, acting as Repository Owner, defer approval of the Dejana Taušan account binding until the actual identity provider, account ownership, immutable account identifier, tenant binding, role assignment and attributable binding evidence are independently verifiable. No access, mandate effectiveness or electronic attestation authority is granted by this deferred decision.

HD06_CONDITIONS =
1. Identify and record the actual canonical identity provider.
2. Locate or provision one unique account attributable to Dejana Taušan.
3. Verify account ownership using an approved identity-verification channel.
4. Record the immutable account subject identifier and verified notification address.
5. Establish the exact tenant or organization binding.
6. Assign only the approved Compliance/DPO capability.
7. Confirm that all prohibited roles and capabilities are absent.
8. Complete HD07 authentication-control verification.
9. Produce a verifiable account-binding evidence reference.
10. Obtain independent verification before changing HD06 to APPROVE.

HD06_FINDINGS =
ACCOUNT_EXISTENCE_NOT_VERIFIED;
IDENTITY_PROVIDER_NOT_VERIFIED;
IMMUTABLE_ACCOUNT_ID_NOT_AVAILABLE;
TENANT_BINDING_NOT_ESTABLISHED;
ROLE_ASSIGNMENT_NOT_VERIFIED;
ACCOUNT_BINDING_EVIDENCE_NOT_AVAILABLE

HD06_BINDING_APPROVED = false
DEJANA_ACCOUNT_BINDING_VERIFIED = false
HD06_STATUS = DEFERRED_PENDING_ACCOUNT_BINDING_EVIDENCE
HD07_AUTHENTICATION_CONTROL_VERIFICATION_READY = false
DPO_MANDATE_EFFECTIVENESS_PROVEN = false
04B_ELECTRONIC_ATTESTATION_AUTHORIZED = false
AD1C_STATUS = STOPPED_BLOCKED
IMPLEMENTATION_AUTHORIZATION = false
NEXT_ACTION = ESTABLISH_AND_VERIFY_DEJANA_ACCOUNT_BINDING_BEFORE_HD07
```
