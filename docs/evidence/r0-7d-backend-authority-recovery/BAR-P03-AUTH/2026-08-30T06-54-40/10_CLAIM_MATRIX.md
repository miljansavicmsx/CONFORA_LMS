iss=required exact OIDC_ISSUER_URL
sub=required opaque string
exp=required numeric
nbf=validated when present
aud=required contains OIDC_CLIENT_ID
tenant_id=required UUID
realm_access.roles=parsed to RbacRole[] via parseRolesFromPayload
amr/mfa_verified=deriveMfaVerified evidence only
