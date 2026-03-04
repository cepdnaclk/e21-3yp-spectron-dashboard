# Create Mock Controller + Sensors for Pairing Tests
# This script seeds one mock controller and 3 sensors in backend DB.

Write-Host "Creating mock controller and sensors..." -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = "postgres://spectron:spectron@localhost:5432/spectron?sslmode=disable"
}

try {
    go run .\cmd\mock-controller\main.go
    if ($LASTEXITCODE -eq 0) {
        Write-Host "" 
        Write-Host "Done. Use QR ID CTRL-MOCK-001 in the web scanner." -ForegroundColor Cyan
    } else {
        Write-Host "Failed to create mock controller." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
