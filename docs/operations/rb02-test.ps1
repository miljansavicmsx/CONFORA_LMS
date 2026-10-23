#Requires -Version 5.1
<#
.SYNOPSIS
  RB-02 local preview for Windows PowerShell 5.1.

  Target is fixed at http://localhost:4000. The script aborts unless that
  development API answers /v1/health and the demo seed course is readable.
  Session cookies are read with Read-Host -AsSecureString, converted with
  SecureStringToBSTR only for the request, and the unmanaged buffer is cleared
  with ZeroFreeBSTR. Cookies and CSRF tokens are never written to a file,
  a transcript, a log, or the output. This script does not call
  Start-Transcript and does not call curl.
#>
$ErrorActionPreference = 'Stop'

$Rb02BaseUrl = 'http://localhost:4000'
$Rb02DemoTenantId = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a'
$Rb02SeedCourseId = 'c1c1c1c1-c1c1-4c1c-8c1c-c1c1c1c1c1c1'
$Rb02SeedCourseCode = 'DIGCOMP-EDU'
$Rb02DemoEmailSuffix = '@demo.confora.test'

function Write-Rb02Safe {
  param([Parameter(Mandatory = $true)][string]$Line)
  if ($Line -match 'confora_sid' -or $Line -match 'csrf' -or $Line -match 'X-CSRF' -or $Line -match 'Cookie' -or $Line -match 'Set-Cookie') {
    throw 'Refusing to write a secret to output.'
  }
  Write-Host $Line
}

function Get-Rb02RepoRoot {
  if ([string]::IsNullOrWhiteSpace($PSScriptRoot)) {
    throw 'Run this file with powershell.exe -File. PSScriptRoot is empty.'
  }
  $docs = Split-Path -Parent $PSScriptRoot
  return (Split-Path -Parent $docs)
}

function Assert-Rb02TempOutsideRepo {
  param([Parameter(Mandatory = $true)][string]$Path)
  $tempFull = [System.IO.Path]::GetFullPath($Path)
  $repoFull = [System.IO.Path]::GetFullPath((Get-Rb02RepoRoot))
  $prefix = $repoFull.TrimEnd('\', '/')
  $withSeparator = $prefix + [System.IO.Path]::DirectorySeparatorChar
  $inside = $tempFull.Equals($prefix, [System.StringComparison]::OrdinalIgnoreCase) -or $tempFull.StartsWith($withSeparator, [System.StringComparison]::OrdinalIgnoreCase)
  if ($inside) {
    throw 'Temporary directory must be outside the repository.'
  }
}

function Assert-Rb02LocalDevelopment {
  param([Parameter(Mandatory = $true)][string]$BaseUrl)
  $uri = $null
  $parsed = [Uri]::TryCreate($BaseUrl, [System.UriKind]::Absolute, [ref]$uri)
  if (-not $parsed -or $null -eq $uri) {
    throw 'Refusing a target that is not an absolute URL.'
  }
  if (-not [string]::IsNullOrEmpty($uri.UserInfo)) {
    throw 'Refusing a non-local target.'
  }
  if ($uri.Scheme -ne 'http') {
    throw 'Refusing a non-development target.'
  }
  if ($uri.Host -ne 'localhost') {
    throw 'Refusing a non-local target.'
  }
  if ($uri.Port -ne 4000) {
    throw 'Refusing a non-development target.'
  }
  if ($uri.AbsolutePath -ne '/' -and -not [string]::IsNullOrEmpty($uri.AbsolutePath)) {
    throw 'Refusing a non-development target.'
  }
  if (-not [string]::IsNullOrEmpty($uri.Query) -or -not [string]::IsNullOrEmpty($uri.Fragment)) {
    throw 'Refusing a non-development target.'
  }
}

function Invoke-Rb02Http {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [string]$Body,
    [string]$CookieValue,
    [string]$CsrfToken
  )
  $request = [System.Net.HttpWebRequest][System.Net.WebRequest]::Create($Uri)
  $request.Method = $Method
  $request.Accept = 'application/json'
  $request.AllowAutoRedirect = $false
  $request.KeepAlive = $false
  $request.Timeout = 30000
  if (-not [string]::IsNullOrEmpty($CookieValue)) {
    try {
      $cookie = New-Object System.Net.Cookie('confora_sid', $CookieValue, '/')
      $container = New-Object System.Net.CookieContainer
      $container.Add((New-Object System.Uri($Uri)), $cookie)
      $request.CookieContainer = $container
    } catch {
      throw 'Session cookie could not be applied to the request.'
    }
  }
  if (-not [string]::IsNullOrEmpty($CsrfToken)) {
    $request.Headers.Add('X-CSRF-Token', $CsrfToken)
    $request.Headers.Add('Origin', 'http://localhost:3001')
  }
  if ($null -ne $Body) {
    $utf8 = New-Object System.Text.UTF8Encoding $false
    $bytes = $utf8.GetBytes($Body)
    $request.ContentType = 'application/json'
    $request.ContentLength = $bytes.Length
    $outStream = $request.GetRequestStream()
    try {
      $outStream.Write($bytes, 0, $bytes.Length)
    } finally {
      $outStream.Close()
    }
  }
  $response = $null
  try {
    try {
      $response = $request.GetResponse()
    } catch [System.Net.WebException] {
      if ($null -ne $_.Exception.Response) {
        $response = $_.Exception.Response
      } else {
        throw
      }
    }
    $status = [int]$response.StatusCode
    $text = ''
    $stream = $response.GetResponseStream()
    if ($null -ne $stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      try {
        $text = $reader.ReadToEnd()
      } finally {
        $reader.Close()
      }
    }
    return @{ Status = $status; Text = $text }
  } finally {
    if ($null -ne $response) {
      $response.Close()
    }
  }
}

function Convert-Rb02Json {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) {
    throw 'Response body was empty.'
  }
  return ($Text | ConvertFrom-Json)
}

function Get-Rb02SafeCode {
  param($Parsed)
  $code = $null
  if ($null -ne $Parsed.result -and -not [string]::IsNullOrWhiteSpace([string]$Parsed.result)) {
    $code = [string]$Parsed.result
  } elseif ($null -ne $Parsed.message -and -not [string]::IsNullOrWhiteSpace([string]$Parsed.message)) {
    $code = [string]$Parsed.message
  }
  if ($code -and $code -match '^[A-Za-z0-9_]+$') {
    return $code
  }
  return $null
}

function Write-Rb02Result {
  param(
    [Parameter(Mandatory = $true)][string]$Label,
    [Parameter(Mandatory = $true)]$Response,
    [string[]]$Expected
  )
  $parsed = $null
  $code = $null
  try {
    $parsed = Convert-Rb02Json -Text $Response.Text
    $code = Get-Rb02SafeCode -Parsed $parsed
  } catch {
    $parsed = $null
  }
  if ([int]$Response.Status -ne 200) {
    if ($code) {
      throw ($Label + ' failed with status ' + [string]$Response.Status + ' code ' + $code)
    }
    throw ($Label + ' failed with status ' + [string]$Response.Status)
  }
  if ($null -eq $parsed) {
    throw ($Label + ' response was not JSON.')
  }
  $matched = $false
  foreach ($item in $Expected) {
    if ($code -eq $item) {
      $matched = $true
    }
  }
  if (-not $matched) {
    throw ($Label + ' returned an unexpected result.')
  }
  $line = $Label + ' result=' + $code
  if ($null -ne $parsed.status -and -not [string]::IsNullOrWhiteSpace([string]$parsed.status)) {
    $statusText = [string]$parsed.status
    if ($statusText -match '^[A-Za-z0-9_]+$') {
      $line = $line + ' status=' + $statusText
    }
  }
  if ($null -ne $parsed.verifierRole -and -not [string]::IsNullOrWhiteSpace([string]$parsed.verifierRole)) {
    $roleText = [string]$parsed.verifierRole
    if ($roleText -match '^[A-Z0-9_]+$') {
      $line = $line + ' verifierRole=' + $roleText
    }
  }
  Write-Rb02Safe $line
  return $parsed
}

function Read-Rb02CookieValue {
  param([Parameter(Mandatory = $true)][string]$Prompt)
  # The cookie stays in a SecureString until this conversion. SecureStringToBSTR
  # copies it to unmanaged memory, PtrToStringBSTR copies that into a .NET string
  # for the request only, and ZeroFreeBSTR clears the unmanaged copy in finally.
  $secure = Read-Host -AsSecureString -Prompt $Prompt
  $bstr = [System.IntPtr]::Zero
  try {
    if ($null -eq $secure -or $secure.Length -lt 1) {
      throw 'Session cookie was empty.'
    }
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $value = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    $prefix = 'confora_sid='
    if ($value.StartsWith($prefix)) {
      $value = $value.Substring($prefix.Length)
    }
    if ([string]::IsNullOrWhiteSpace($value)) {
      throw 'Session cookie was empty.'
    }
    return $value
  } finally {
    if ($bstr -ne [System.IntPtr]::Zero) {
      [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
      $bstr = [System.IntPtr]::Zero
    }
    if ($null -ne $secure) {
      $secure.Dispose()
      $secure = $null
    }
    $value = $null
  }
}

function Get-Rb02CatalogUser {
  param($Catalog, [Parameter(Mandatory = $true)][string]$Username)
  foreach ($user in @($Catalog.users)) {
    if ([string]$user.username -eq $Username) {
      return $user
    }
  }
  throw 'Synthetic catalog is missing the required demo user.'
}

function Assert-Rb02Catalog {
  param($Catalog)
  if ([string]$Catalog.tenantId -ne $Rb02DemoTenantId) {
    throw 'Catalog tenant is not the demo organization. Aborting.'
  }
  foreach ($user in @($Catalog.users)) {
    $email = [string]$user.email
    if (-not $email.EndsWith($Rb02DemoEmailSuffix)) {
      throw 'Catalog contains an account outside the demo organization. Aborting.'
    }
  }
}

function Assert-Rb02Session {
  param($Session, $CatalogUser)
  $userId = [string]$Session.userId
  $email = [string]$Session.email
  if ($userId -ne [string]$CatalogUser.dbUserId) {
    throw 'Session user is not the synthetic catalog user. Aborting.'
  }
  if ($email -ne [string]$CatalogUser.email -or -not $email.EndsWith($Rb02DemoEmailSuffix)) {
    throw 'Session email is not the demo organization user. Aborting.'
  }
  $have = @($Session.roles)
  foreach ($role in @($CatalogUser.roles)) {
    $found = $false
    foreach ($item in $have) {
      if ([string]$item -eq [string]$role) {
        $found = $true
      }
    }
    if (-not $found) {
      throw 'Session is missing a synthetic catalog role. Aborting.'
    }
  }
  if ($null -eq $Session.csrfToken -or [string]::IsNullOrWhiteSpace([string]$Session.csrfToken)) {
    throw 'Session did not include a CSRF token.'
  }
}

function Write-Rb02BodyFile {
  param(
    [Parameter(Mandatory = $true)][string]$Directory,
    [Parameter(Mandatory = $true)][string]$Json
  )
  if ($Json -match 'confora_sid' -or $Json -match 'csrf' -or $Json -match 'X-CSRF' -or $Json -match 'Cookie') {
    throw 'Refusing to write a secret into a temporary file.'
  }
  $name = 'rb02-' + [guid]::NewGuid().ToString('N') + '.json'
  $path = Join-Path $Directory $name
  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($path, $Json, $utf8)
  return [System.IO.File]::ReadAllText($path)
}

function Get-Rb02Session {
  param(
    [Parameter(Mandatory = $true)][string]$BaseUrl,
    [Parameter(Mandatory = $true)][string]$CookieValue,
    $CatalogUser
  )
  $response = Invoke-Rb02Http -Method 'GET' -Uri ($BaseUrl + '/v1/auth/session') -CookieValue $CookieValue
  if ([int]$response.Status -ne 200) {
    throw ('Session check failed with status ' + [string]$response.Status)
  }
  $session = Convert-Rb02Json -Text $response.Text
  Assert-Rb02Session -Session $session -CatalogUser $CatalogUser
  return $session
}

$tempRoot = $null
$cookieValue = $null
$csrf = $null
try {
  Assert-Rb02LocalDevelopment -BaseUrl $Rb02BaseUrl
  if ([string]::IsNullOrWhiteSpace($env:TEMP)) {
    throw 'TEMP is not set.'
  }
  $tempRoot = Join-Path $env:TEMP ('rb02-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $tempRoot | Out-Null
  Assert-Rb02TempOutsideRepo -Path $tempRoot

  $health = Invoke-Rb02Http -Method 'GET' -Uri ($Rb02BaseUrl + '/v1/health')
  if ([int]$health.Status -ne 200) {
    throw ('Health check failed with status ' + [string]$health.Status + '. Aborting.')
  }
  $healthBody = Convert-Rb02Json -Text $health.Text
  if ([string]$healthBody.status -ne 'ok') {
    throw 'Health check did not report status ok. Aborting.'
  }
  Write-Rb02Safe 'preflight health ok'

  $repoRoot = Get-Rb02RepoRoot
  $catalogPath = Join-Path $repoRoot 'infra'
  $catalogPath = Join-Path $catalogPath 'keycloak'
  $catalogPath = Join-Path $catalogPath 'synthetic-users.json'
  $catalog = Get-Content -LiteralPath $catalogPath -Raw | ConvertFrom-Json
  Assert-Rb02Catalog -Catalog $catalog
  $holder = Get-Rb02CatalogUser -Catalog $catalog -Username 'exam-candidate'
  $admin = Get-Rb02CatalogUser -Catalog $catalog -Username 'exam-admin'
  $director = Get-Rb02CatalogUser -Catalog $catalog -Username 'exam-director'
  Write-Rb02Safe 'preflight catalog tenant is the demo organization'

  $seedUri = $Rb02BaseUrl + '/v1/public/catalog/courses/' + $Rb02SeedCourseId
  $seed = Invoke-Rb02Http -Method 'GET' -Uri $seedUri
  if ([int]$seed.Status -ne 200) {
    throw 'Demo seed course was not readable. Aborting because the database did not show the synthetic seed.'
  }
  $seedCourse = Convert-Rb02Json -Text $seed.Text
  if ([string]$seedCourse.courseId -ne $Rb02SeedCourseId -or [string]$seedCourse.code -ne $Rb02SeedCourseCode) {
    throw 'Demo seed marker did not match. Aborting.'
  }
  Write-Rb02Safe 'preflight synthetic seed course ok'

  $credentialId = Read-Host -Prompt 'certificateId from the holder wallet'
  if ($credentialId -notmatch '^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$') {
    throw 'certificateId is not a UUID.'
  }
  $verifyToken = Read-Host -Prompt 'token from the holder verification link'
  if ($verifyToken -notmatch '^[A-Za-z0-9_-]{16,128}$') {
    throw 'Verification token was not accepted.'
  }

  $receivedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fff', [System.Globalization.CultureInfo]::InvariantCulture) + 'Z'
  $requestJson = @{
    holderUserId = [string]$holder.dbUserId
    channel = 'EMAIL'
    receivedAt = $receivedAt
  } | ConvertTo-Json -Compress
  $requestBody = Write-Rb02BodyFile -Directory $tempRoot -Json $requestJson

  $cookieValue = Read-Rb02CookieValue -Prompt 'confora_sid for exam-admin (request)'
  $session = Get-Rb02Session -BaseUrl $Rb02BaseUrl -CookieValue $cookieValue -CatalogUser $admin
  $csrf = [string]$session.csrfToken
  $session = $null
  $opened = Invoke-Rb02Http -Method 'POST' -Uri ($Rb02BaseUrl + '/v1/staff/certificates/' + $credentialId + '/directory-consent-requests') -Body $requestBody -CookieValue $cookieValue -CsrfToken $csrf
  $null = Write-Rb02Result -Label 'request' -Response $opened -Expected @('REQUESTED')
  $cookieValue = $null
  $csrf = $null

  $verificationJson = @{
    verificationMethod = 'IN_PERSON_DOCUMENT_SIGHT'
    evidenceRef = 'RB02-SIGHTING-001'
  } | ConvertTo-Json -Compress
  $verificationBody = Write-Rb02BodyFile -Directory $tempRoot -Json $verificationJson
  $cookieValue = Read-Rb02CookieValue -Prompt 'confora_sid for exam-director (verify)'
  $session = Get-Rb02Session -BaseUrl $Rb02BaseUrl -CookieValue $cookieValue -CatalogUser $director
  $csrf = [string]$session.csrfToken
  $session = $null
  $verified = Invoke-Rb02Http -Method 'POST' -Uri ($Rb02BaseUrl + '/v1/staff/certificates/' + $credentialId + '/directory-consent-verifications') -Body $verificationBody -CookieValue $cookieValue -CsrfToken $csrf
  $verifiedBody = Write-Rb02Result -Label 'verification' -Response $verified -Expected @('VERIFIED')
  if ([string]$verifiedBody.verifierRole -ne 'STAFF_DIR') {
    throw 'Verification did not record STAFF_DIR.'
  }
  $cookieValue = $null
  $csrf = $null

  $withdrawalBody = Write-Rb02BodyFile -Directory $tempRoot -Json '{}'
  $cookieValue = Read-Rb02CookieValue -Prompt 'confora_sid for exam-admin (execute)'
  $session = Get-Rb02Session -BaseUrl $Rb02BaseUrl -CookieValue $cookieValue -CatalogUser $admin
  $csrf = [string]$session.csrfToken
  $session = $null
  $withdrawalUri = $Rb02BaseUrl + '/v1/staff/certificates/' + $credentialId + '/directory-consent-withdrawal'
  $withdrawn = Invoke-Rb02Http -Method 'POST' -Uri $withdrawalUri -Body $withdrawalBody -CookieValue $cookieValue -CsrfToken $csrf
  $withdrawnBody = Write-Rb02Result -Label 'withdrawal' -Response $withdrawn -Expected @('WITHDRAWN')
  if ([string]$withdrawnBody.status -ne 'VALID') {
    throw 'Withdrawal did not leave the certificate VALID.'
  }
  $repeated = Invoke-Rb02Http -Method 'POST' -Uri $withdrawalUri -Body $withdrawalBody -CookieValue $cookieValue -CsrfToken $csrf
  $null = Write-Rb02Result -Label 'withdrawal-repeat' -Response $repeated -Expected @('ALREADY_WITHDRAWN')

  $searchUri = $Rb02BaseUrl + '/v1/public/certificates?name=Demo'
  $search = Invoke-Rb02Http -Method 'GET' -Uri $searchUri -CookieValue $cookieValue
  if ([int]$search.Status -ne 200) {
    throw ('Signed-in search failed with status ' + [string]$search.Status)
  }
  $holderName = [string]$holder.givenName + ' ' + [string]$holder.familyName
  if (([string]$search.Text).Contains($holderName)) {
    throw 'Signed-in search still contains the holder name.'
  }
  Write-Rb02Safe 'signed-in search holder name present=false'
  $cookieValue = $null
  $csrf = $null

  $publicUri = $Rb02BaseUrl + '/v1/public/certificates/' + [Uri]::EscapeDataString($verifyToken)
  $public = Invoke-Rb02Http -Method 'GET' -Uri $publicUri
  if ([int]$public.Status -ne 200) {
    throw ('Public verification failed with status ' + [string]$public.Status)
  }
  $publicBody = Convert-Rb02Json -Text $public.Text
  if ($null -ne $publicBody.holderName) {
    throw 'Public verification still returned a holder name.'
  }
  if ([string]$publicBody.status -ne 'VALID') {
    throw 'Public verification did not report VALID.'
  }
  Write-Rb02Safe 'public status=VALID holderName=null'
  Write-Rb02Safe 'RB-02 local preview completed.'
} finally {
  $cookieValue = $null
  $csrf = $null
  if ($null -ne $tempRoot -and (Test-Path -LiteralPath $tempRoot)) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
  }
  Remove-Variable cookieValue, csrf, session, requestBody, verificationBody, withdrawalBody -ErrorAction SilentlyContinue
}
