# APPEALS-COMPLAINTS-FINAL — Route Matrix

## Frontend routes

| Actor | Path | Purpose | Confirmed by |
|-------|------|---------|--------------|
| Learner | `/dashboard/appeals-complaints` | Intake + own cases (Žalbe / Prigovori tabs) | 1, 1R |
| Learner | `/dashboard/support` | Contact / support (not appeal/complaint) | 1, 1R |
| Staff | `/dashboard/admin/appeals-complaints` | Staff resolution UX (primary) | 2, 2R |
| Staff | `/dashboard/iso/appeals` | Staff UX entry (Žalbe default) | 2, 2R |
| Staff | `/dashboard/iso/complaints` | Staff UX entry (**Prigovori** tab) | 2, 2R |
| Staff | `/dashboard/admin/support` | Contact registry (separate module) | 2, 2R |
| Learner | `/dashboard/admin/appeals-complaints` | **Denied** → `/unauthorized` | 2R |

## Nest auth pilot allowlist (2R fix)

Staff appeals/complaints paths are on the Nest pilot staff allowlist so local pilot auth does not redirect them to `/dashboard`:

- `/dashboard/admin/appeals-complaints`
- `/dashboard/admin/support`
- `/dashboard/iso/appeals`
- `/dashboard/iso/complaints`

RBAC (`StaffAppealsComplaintsGuard`) still denies learners.

## API surfaces (from slice evidence)

| Surface | Routes | Notes |
|---------|--------|-------|
| Learner appeals | `GET/POST /v1/learner/appeals` (+ `/v1/me/appeals` aliases) | Own cases |
| Learner complaints | `GET/POST /v1/learner/complaints` (+ `/v1/me/complaints` aliases) | Own cases |
| Contact | `GET/POST /v1/learner/contact-requests` | Separate from appeals/complaints |
| Staff appeals | `/v1/staff/appeals` (canonical) | Queue + acknowledge/void |
| Staff complaints | `/v1/staff/complaints` (and admin alias where present) | Separate queue |

## UI labels (no raw enums)

Learner and staff UIs use mapped labels (e.g. Žalbe / Prigovori, Podneseno / Zaprimljeno). Browser slices assert forbidden raw enum strings are not shown.
