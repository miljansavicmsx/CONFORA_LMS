# DPO-LEGAL-1 Retention and Deletion Review

**Sources:** F5-5 `F5_5_EVIDENCE_RETENTION_AND_REDACTION_PLAN.md`, F5-6 `F5_6_BACKUP_EVIDENCE_AND_RETENTION_RUNBOOK.md`

| Data category | Current status | Proposed retention (placeholder — DPO confirm) | Deletion / anonymization (placeholder) | Legal/DPO question | External pilot blocker |
|---------------|----------------|-----------------------------------------------|----------------------------------------|-------------------|------------------------|
| Audit events | DOCUMENTED_ONLY | Pilot + min 90d; legal schedule TBD | Archive/purge job not automated | Lawful basis for audit retention length | **Yes** until approved |
| Certification applications | CONFIGURED | Certification scheme rules + [DPO: X years] | Anonymize after retention; conflict with ISO evidence | Erasure vs accreditation retention | **Yes** |
| Exam records | CONFIGURED | [DPO: align with scheme] | Pseudonymize candidate refs | Appeal window interaction | **Yes** |
| Certificates | CONFIGURED | Validity + [DPO: post-expiry X years] | Revoke vs delete public verify record | Public verify after expiry | **Yes** |
| Public verification logs | DOCUMENTED_ONLY | [DPO: verify audit retention] | Salted IP — deletion procedure | Legitimate interest balancing | **Yes** |
| Contact requests | CONFIGURED | [DPO: support ticket retention] | Close + anonymize | Spam/abuse logs | Medium |
| Appeal / complaint | CONFIGURED | [DPO: legal hold rules] | Conflict with erasure requests | Supervisory complaint alignment | **Yes** |
| Identity evidence | PARTIAL | [DPO: verification retention] | Blob deletion on case closure | Special category assessment | **Yes** |
| Report export files | CONFIGURED | Ephemeral — not stored | Auto-discard after download | Staff download audit | Low |
| Smoke / evidence artifacts | CONFIGURED | Git — pilot engineering retention | Redaction rules; no PII | Approve evidence folder retention in repo | Medium |

**Do not treat placeholder periods as final legal retention.**
