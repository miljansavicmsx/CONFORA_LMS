# Auth / MFA / Assurance

Global flow unchanged:
ClientTenantRejectionMiddleware -> JwtAuthGuard -> ActiveAssuranceGuard -> MfaAssuranceGuard

P08 route-scoped:
@UseGuards(ReportsRolesGuard, ThrottlerGuard)

Unauthenticated -> 401 (P08_TEST_009)
MFA failure for privileged -> 403 MFA_REQUIRED (P08_TEST_050/051/052)
