SOURCE=PostgreSQL User.isActive
RULE=tenantId_id match AND isActive==true AND tenantId==actor.tenantId
FAILURE=403 ACCESS_DENIED Access denied. (indistinguishable from tenant failure)
JWT_SUBSTITUTE=false
ACTIVE_USER_CONTRACT=PASS
