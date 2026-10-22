$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..'))
if (-not (Test-Path '.secrets/local.env')) { throw 'Run scripts/local/setup.ps1 first.' }
Get-Content '.secrets/local.env' | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq '' -or $line.StartsWith('#')) { return }
  $eq = $line.IndexOf('=')
  if ($eq -lt 1) { return }
  Set-Item -Path "Env:$($line.Substring(0, $eq))" -Value $line.Substring($eq + 1)
}
New-Item -ItemType Directory -Force -Path logs | Out-Null
docker compose --env-file .secrets/local.env -f infra/docker/docker-compose.local.yml up -d
$ready = $false
foreach ($i in 1..60) {
  try {
    $response = Invoke-WebRequest -Uri 'http://localhost:18080/realms/master' -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) { $ready = $true; break }
  } catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) { throw 'Keycloak did not become ready.' }
node scripts/local/oidc-local.mjs import-realm
node scripts/local/oidc-local.mjs provision-users
node scripts/local/oidc-local.mjs configure-amr
node scripts/local/oidc-local.mjs migrate-seed
Start-Process -FilePath 'pnpm' -ArgumentList '--filter','@confora/api','exec','nest','start' -RedirectStandardOutput 'logs/api.log' -RedirectStandardError 'logs/api.err.log' -NoNewWindow
Start-Process -FilePath 'pnpm' -ArgumentList '--filter','confora-frontend-app','exec','vite','--host','localhost','--port','3001' -WorkingDirectory (Get-Location) -RedirectStandardOutput 'logs/frontend.log' -RedirectStandardError 'logs/frontend.err.log' -NoNewWindow
Write-Host 'API and frontend are starting. Logs are in logs/.'
