$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..'))
docker compose --env-file .secrets/local.env -f infra/docker/docker-compose.local.yml down
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'nest start' -or $_.CommandLine -match 'vite --host localhost --port 3001' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Write-Host 'Stopped the local compose stack and matching API/frontend processes.'
