# Audit

| Event | Source |
|-------|--------|
| APPEAL_SUBMITTED | cert-appeals audit mapper |
| COMPLAINT_SUBMITTED | cert-complaints audit mapper |
| CONTACT_REQUEST_SUBMITTED | contact-requests (separate) |

Audit payloads remain id/type/ref oriented — no password/token fields; appealReason/complaint body excluded from submitted audit value by design.
