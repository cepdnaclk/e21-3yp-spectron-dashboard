# Database Verification Script
# This script runs SQL commands to verify the database setup

param(
    [string]$User = "spectron",
    [string]$Database = "spectron",
    [string]$Host = "localhost",
    [int]$Port = 5432
)

Write-Host "Checking Spectron database..." -ForegroundColor Green
Write-Host ""

# Check if psql is available
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "PostgreSQL client found: $psqlVersion" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: psql is not found in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client or add it to PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Connecting to database: $Database on $Host:$Port as user: $User" -ForegroundColor Cyan
Write-Host ""

# Run the verification script
$scriptPath = Join-Path $PSScriptRoot "check-db.sql"

if (Test-Path $scriptPath) {
    Write-Host "Running verification script..." -ForegroundColor Yellow
    Write-Host ""
    
    $env:PGPASSWORD = Read-Host "Enter PostgreSQL password for user '$User'" -AsSecureString
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:PGPASSWORD))
    $env:PGPASSWORD = $plainPassword
    
    psql -U $User -h $Host -p $Port -d $Database -f $scriptPath
    
    $env:PGPASSWORD = $null
} else {
    Write-Host "ERROR: check-db.sql not found at $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
