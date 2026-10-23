$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..'))
node scripts/local/oidc-local.mjs init-secrets
node scripts/local/oidc-local.mjs render-realm
node scripts/local/oidc-local.mjs write-frontend-env
Write-Host 'Secrets and the realm export are ready.'
Write-Host 'Next: powershell -ExecutionPolicy Bypass -File scripts/local/start.ps1'
Write-Host 'start.ps1 starts compose, migrates, imports the realm, and starts the API and Vite.'
