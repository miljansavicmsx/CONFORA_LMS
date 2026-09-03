# Threat Mapping

Threats addressed by P08 controls:

- unauthenticated report access (JWT)
- privilege escalation via learner/COM_CERT/issuance/lifecycle roles
- client tenant selector injection
- cross-tenant aggregate leakage
- query parameter pollution / unknown filters
- malformed date coercion attacks
- small-cell reconstruction via totals
- shared caching of private aggregates
- throttle budget exhaustion by denied roles
- raw SQL / write / export expansion
