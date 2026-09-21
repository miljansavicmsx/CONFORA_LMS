# Approved prospective map

DEFINITION_ORIGIN = PROSPECTIVE_OWNER_DEFINITION_2026
MAPPING_RULE = H1_H2_PLUS_INVENTORY_ORDER_WITHIN_FUNCTIONAL_GROUP

Rule meaning, as compared to recovery document 11:

- H1: the eight still-missing original MB_E source files are the eight
  unresolved Model D items.
- H2: group those files as education (3), identity-review (2), leftover
  APIs (3), matching Part E cluster sizes.
- Inventory order within each functional group: C3-S2
  `model-d-post-target-inventory.txt` order assigns IDs inside the group.

| Group | Inventory order | Frozen MD_ID | PRIMARY_PATH |
|-------|-----------------|--------------|--------------|
| Education | 1 | MD02 | frontend-app/src/components/education/EducationCharts.tsx |
| Education | 2 | MD03 | frontend-app/src/lib/admin-education-api.ts |
| Education | 3 | MD10 | frontend-app/src/pages/dashboard/AdminEducationGuard.tsx |
| Identity review | 1 | MD06 | frontend-app/src/pages/admin/IdentityReviewPage.tsx |
| Identity review | 2 | MD07 | frontend-app/src/pages/dashboard/IdentityReviewGuard.tsx |
| Leftover APIs | 1 | MD05 | frontend-app/src/lib/api-grievances.ts |
| Leftover APIs | 2 | MD09 | frontend-app/src/lib/api-recertification.ts |
| Leftover APIs | 3 | MD12 | frontend-app/src/lib/api-staff-cert-registry.ts |

ADDITIONAL_PATH_COUNT = 0 for every row.

HISTORICAL_MAPPING_RECOVERED = false
HISTORICAL_MAPPING_CLAIMED = false
ORIGINAL_DEFINITION_AUTHORITY_FOUND = false
