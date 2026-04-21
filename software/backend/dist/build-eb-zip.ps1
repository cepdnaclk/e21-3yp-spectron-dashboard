Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$distDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stagingDir = Join-Path $distDir "eb-staging"
$zipPath = Join-Path $distDir "spectron-backend-eb.zip"

if (-not (Test-Path $stagingDir)) {
    throw "Staging directory not found: $stagingDir"
}

$tarCommand = Get-Command tar -ErrorAction SilentlyContinue
if (-not $tarCommand) {
    throw "tar is required to build a Linux-friendly Elastic Beanstalk zip."
}

if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Push-Location $stagingDir
try {
    tar -a -cf $zipPath .
}
finally {
    Pop-Location
}

Write-Host "Created $zipPath"
