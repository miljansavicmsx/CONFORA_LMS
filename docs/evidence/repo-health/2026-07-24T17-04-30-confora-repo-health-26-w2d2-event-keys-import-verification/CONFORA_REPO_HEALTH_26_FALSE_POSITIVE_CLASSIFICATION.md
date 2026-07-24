# CONFORA-REPO-HEALTH-26 — False Positive Classification

| Match | Classification | Allowed? |
|-------|----------------|----------|
| Comment: `Browser-safe: no Node builtins...` | Documentation only — not runtime browser/DOM code | **yes** |
| Event key `user.password_reset_required` | Semantic event identifier — not a password/credential value | **yes** |
| Event key `complaint.subject_notified` | Complaint workflow event key — not an email subject template string | **yes** |

**`manual_scan_false_positives`:** Browser-safe comment; `user.password_reset_required`; `complaint.subject_notified`

**Blocking secret/network hits after classification:** **0**
