# 028D-2aS2 — Manifest-Locked Complaint Support Closure and Functional Filing Form

Implementation slice. Complaint filing only. No pull request.

| Field | Value |
|-------|-------|
| Branch | `feature/028d-2as2-complaint-filing-closure` |
| Base / planning tip | `dd43c8b1830b3d96243d69b639a167bc80af4498` |
| Integration tip | `4090be85a0f8e423d199610f82e3949c899cc90b` |
| Owner authorization | `OPTION_C_DIRECT_SUBMIT_LEARNER_COMPLAINT` |
| Promote ceiling | ≤22 complaint-specific (non-RBAC) |
| Promoted path-checkouts | **16** (from rejected D2 inspect tip) |
| New infrastructure modules | **0** |
| `api-grievances` | **not promoted / not used** |
| Appeals | **not implemented** |
| TD-006 | **OPEN** (unchanged) |
| Pull request | **not opened** |

## Binding outcomes

1. `FormalComplaintDialog` calls tracked `submitLearnerComplaint` directly.
2. Learner list uses `listLearnerComplaints`.
3. Authenticated identity disclosure states the channel is **not anonymous**.
4. Appeal filing UI remains deferred (`APPEAL_UI = NOT_IMPLEMENTED`); “Nova žalba” disabled with TD-006 notice.
5. HTTP token refresh slimmed to storage + legacy Bearer refresh so `authStore` / `nest-auth-pilot` / RBAC access modules are **not** pulled into the complaint graph.
6. Rejected D2/S2 tips are **not** ancestors of this branch.

## Verdict

`COMPLAINT_FILING_SLICE_IMPLEMENTED_AWAITING_INDEPENDENT_REVIEW`
