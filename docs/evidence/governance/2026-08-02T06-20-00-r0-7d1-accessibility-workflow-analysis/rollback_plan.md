# Rollback plan

If a future R0-7D2 change misbehaves:

1. Revert the R0-7D2 merge on the integration branch.
2. Accessibility.yml returns to tip `4090be85a0f8e423d199610f82e3949c899cc90b` behavior (known failing contrast step).
3. Do not reintroduce repository mutation helpers.
4. Do not promote additional untracked trees during rollback.
