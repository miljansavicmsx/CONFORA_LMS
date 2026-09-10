# 15 Browser Artifact Cleanup

gitignore: frontend-app/.csp-dashboard-runtime-dist/
Playwright afterAll: rmSync(distRoot, { recursive: true, force: true })
POST_TEST_UNTRACKED_REMEDIATION_ARTIFACT_COUNT = 0 (verified after smoke on impl workspace and clean clone)
