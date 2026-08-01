# Stop conditions (R0-7C2)

Stop and escalate if:

1. Image pull failure or unsupported architecture.
2. Mutable-image ambiguity without owner digest decision when required.
3. Secret/credential exposure requiring redesign beyond ephemeral CI.
4. Untracked init-script dependency appears necessary for boot.
5. Schema/migration dependency required merely to start postgres.
6. Production endpoint reference appears in service config.
7. Pressure to promote `packages/database` to complete boot (should not be needed).
8. Broader workflow redesign beyond quoting/digest/extension check.
