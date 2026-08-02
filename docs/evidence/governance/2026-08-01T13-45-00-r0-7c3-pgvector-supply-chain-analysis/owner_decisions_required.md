# Owner decisions required

1. **Digest strategy:** Option A (index `sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`), Option B (amd64 `sha256:84a355869251af1a3379cfc9fa7b4dbf962c03f642a4bb7b339a203925071c43`), or temporary Option C.
2. **Whether R0-7C4 may run `CREATE EXTENSION vector`** in ephemeral CI DB, or only query availability.
3. **Whether to also migrate tag** from floating `pg16` to a versioned tag (e.g. upstream `0.8.x-pg16`) **in addition to** digest pin.
4. **Signed-image / attestation enforcement** now vs later maturity phase.
5. Authorization to start **R0-7C4 implementation** after this planning package.

R0-7C4 must not start until these decisions are recorded.


## R0-7C3A status

Owner decisions for digest Option A (`sha256:a36250871de0833b8757561c72f2477ef1ddd1101afa4e617fb552e0de514c6b`) and expected amd64 version
**`0.8.6`** are now recorded in `OWNER_DECISION_UPDATE.md`.
R0-7C4 may resume after this correction commit is inspectable.
