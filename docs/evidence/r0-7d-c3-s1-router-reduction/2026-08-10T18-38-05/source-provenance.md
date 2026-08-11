# Source provenance

## frontend-app/src/App.tsx
- authorized_base_version: d289a2e7a6dd67c143cec3f2b4c71f52ef4a22b5
- reason_for_change: Remove owner-excluded routes, route-only imports, FeedbackWidget, and AppShellFallback while preserving the 29-surface bridge.
- owner_scope_basis: RR-01 and RR-02
- whether_content_was_copied_from_rejected_history: false
- whether_rejected_history_was_used_as_implementation_authority: false
- forward_only_change: true

## frontend-app/src/components/layout/sidebar-sections.tsx
- authorized_base_version: d289a2e7a6dd67c143cec3f2b4c71f52ef4a22b5
- reason_for_change: Remove exactly 53 owner-excluded navigation references while retaining existing role predicates for approved entries.
- owner_scope_basis: RR-03
- whether_content_was_copied_from_rejected_history: false
- whether_rejected_history_was_used_as_implementation_authority: false
- forward_only_change: true

## frontend-app/src/layouts/DashboardLayout.tsx
- authorized_base_version: d289a2e7a6dd67c143cec3f2b4c71f52ef4a22b5
- reason_for_change: Remove three excluded default-mobile navigation entries.
- owner_scope_basis: RR-04
- whether_content_was_copied_from_rejected_history: false
- whether_rejected_history_was_used_as_implementation_authority: false
- forward_only_change: true

## frontend-app/src/lib/nest-auth-pilot.ts
- authorized_base_version: d289a2e7a6dd67c143cec3f2b4c71f52ef4a22b5
- reason_for_change: Remove the contradictory /dashboard/admin/users pilot navigation item without altering blocked-prefix controls.
- owner_scope_basis: RR-05
- whether_content_was_copied_from_rejected_history: false
- whether_rejected_history_was_used_as_implementation_authority: false
- forward_only_change: true
