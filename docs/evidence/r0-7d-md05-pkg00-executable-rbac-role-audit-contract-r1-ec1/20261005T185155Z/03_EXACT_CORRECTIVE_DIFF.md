# 03 — Exact corrective diff

Diff base: `c32b423088c57b40635ef400e185392a5de350e3`.
This file records the implementation and test diff only.
The evidence files in this directory are additional commit paths and are not duplicated inside this diff.

Unified diffs represent an empty context line as a single space.
Those lines, and any other trailing whitespace, are written with the suffix `<BLANK_OR_TRAILING_WS>` so this evidence file passes `git diff --check`.
WHITESPACE_LINES_MARKED = 3
The source diff itself passes `git diff --check` before this transcription.

```diff
diff --git a/packages/shared-types/src/md05-pkg00-rbac-role-audit.spec.ts b/packages/shared-types/src/md05-pkg00-rbac-role-audit.spec.ts
index 0b0e9b3..fc3d4a7 100644
--- a/packages/shared-types/src/md05-pkg00-rbac-role-audit.spec.ts
+++ b/packages/shared-types/src/md05-pkg00-rbac-role-audit.spec.ts
@@ -455,7 +455,6 @@ test('EC1-T13 identical grant initiator and approver rejected', () => {
     contract({ approverUserId: INITIATOR, approverExternalSubjectId: 'approver-subject' }),
   );
   assert.equal(sameUser.success, false);
-  if (sameUser.success) return;
   assert.ok(
     sameUser.error.issues.some(
       (issue) => issue.message === 'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER',
@@ -475,20 +474,16 @@ test('EC1-T14 grant actor equal to target rejected', () => {
     contract({ targetUserId: INITIATOR, targetExternalSubjectId: 'target-subject' }),
   );
   assert.equal(initiatorIsTarget.success, false);
-  if (!initiatorIsTarget.success) {
-    assert.ok(
-      initiatorIsTarget.error.issues.some((issue) => issue.message === 'SELF_ASSIGNMENT_FORBIDDEN'),
-    );
-  }
+  assert.ok(
+    initiatorIsTarget.error.issues.some((issue) => issue.message === 'SELF_ASSIGNMENT_FORBIDDEN'),
+  );
   const approverIsTarget = roleAdministrationContractSchema.safeParse(
     contract({ targetUserId: APPROVER, targetExternalSubjectId: 'target-subject' }),
   );
   assert.equal(approverIsTarget.success, false);
-  if (!approverIsTarget.success) {
-    assert.ok(
-      approverIsTarget.error.issues.some((issue) => issue.message === 'TARGET_CANNOT_BE_APPROVER'),
-    );
-  }
+  assert.ok(
+    approverIsTarget.error.issues.some((issue) => issue.message === 'TARGET_CANNOT_BE_APPROVER'),
+  );
 });
 <BLANK_OR_TRAILING_WS>
 test('EC1-T15 revoke actor STAFF_ROLEADM accepted', () => {
@@ -553,11 +548,9 @@ test('EC1-T19 identical revoke actor and reviewer rejected', () => {
     }),
   );
   assert.equal(parsed.success, false);
-  if (!parsed.success) {
-    assert.ok(
-      parsed.error.issues.some((issue) => issue.message === 'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER'),
-    );
-  }
+  assert.ok(
+    parsed.error.issues.some((issue) => issue.message === 'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER'),
+  );
   const sameSubject = roleAdministrationContractSchema.safeParse(
     reviewedRevoke({ reviewerExternalSubjectId: 'initiator-subject' }),
   );
@@ -573,9 +566,7 @@ test('EC1-T20 revoke actor equal to target rejected', () => {
     }),
   );
   assert.equal(parsed.success, false);
-  if (!parsed.success) {
-    assert.ok(parsed.error.issues.some((issue) => issue.message === 'SELF_REVOCATION_FORBIDDEN'));
-  }
+  assert.ok(parsed.error.issues.some((issue) => issue.message === 'SELF_REVOCATION_FORBIDDEN'));
   const reviewerIsTarget = roleAdministrationContractSchema.safeParse(
     reviewedRevoke({
       targetUserId: REVIEWER,
@@ -589,11 +580,9 @@ test('EC1-T21 cross-tenant grant rejected', () => {
   for (const field of ['initiatorTenantId', 'approverTenantId', 'targetTenantId'] as const) {
     const parsed = roleAdministrationContractSchema.safeParse(contract({ [field]: OTHER_TENANT }));
     assert.equal(parsed.success, false);
-    if (!parsed.success) {
-      assert.ok(
-        parsed.error.issues.some((issue) => issue.message === 'CROSS_TENANT_ASSIGNMENT_FORBIDDEN'),
-      );
-    }
+    assert.ok(
+      parsed.error.issues.some((issue) => issue.message === 'CROSS_TENANT_ASSIGNMENT_FORBIDDEN'),
+    );
   }
 });
 <BLANK_OR_TRAILING_WS>
@@ -603,11 +592,9 @@ test('EC1-T22 cross-tenant revoke rejected', () => {
       revokeContract({ [field]: OTHER_TENANT }),
     );
     assert.equal(parsed.success, false);
-    if (!parsed.success) {
-      assert.ok(
-        parsed.error.issues.some((issue) => issue.message === 'CROSS_TENANT_REVOCATION_FORBIDDEN'),
-      );
-    }
+    assert.ok(
+      parsed.error.issues.some((issue) => issue.message === 'CROSS_TENANT_REVOCATION_FORBIDDEN'),
+    );
   }
 });
 <BLANK_OR_TRAILING_WS>
@@ -622,11 +609,9 @@ test('EC1-T35 PT24H remains enforced', () => {
     revokeContract({ reviewDueAt: '2026-10-06T09:00:00.000Z' }),
   );
   assert.equal(early.success, false);
-  if (!early.success) {
-    assert.ok(
-      early.error.issues.some((issue) => issue.message === 'REVOKE_POST_REVIEW_DUE_PERIOD_INVALID'),
-    );
-  }
+  assert.ok(
+    early.error.issues.some((issue) => issue.message === 'REVOKE_POST_REVIEW_DUE_PERIOD_INVALID'),
+  );
   const missing = roleAdministrationContractSchema.safeParse(
     revokeContract({ reviewDueAt: undefined }),
   );
```
