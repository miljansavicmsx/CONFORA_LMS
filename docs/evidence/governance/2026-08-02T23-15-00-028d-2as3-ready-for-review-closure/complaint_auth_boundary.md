# Complaint / auth boundary

| Claim | Status |
|-------|--------|
| `FormalComplaintDialog` → `submitLearnerComplaint` | Present |
| Listing → `listLearnerComplaints` | Present |
| Auth claim | `CANONICAL_PERSISTED_AUTH_CONTINUITY_VERIFIED` |
| Persist key | `confora-auth` (`state.accessToken` / `state.refreshToken`) |
| Browser-supplied user identity | Absent from submit payload |
| Non-anonymous disclosure | Present (`complaintsFiling.identityDisclosure`) |
| No new storage keys / legacy dual-write in S2R | Affirmed by prior GO re-review |

No operational complaint/auth source was modified by this evidence-only closure.
