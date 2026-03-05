# Database Verification Script
# This script runs SQL commands to verify the database setup

param(
    [string]$User = "spectron",
    [string]$Database = "spectron",
    [string]$Host = "localhost",
    [int]$Port = 5432
)

function Import-DotEnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            return
        }

        $parts = $line.Split('=', 2)
        if ($parts.Count -ne 2) {
            return
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        if ($key) {
            [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

$envFilePath = Join-Path $PSScriptRoot ".env"
Import-DotEnvFile -Path $envFilePath

if ($User -eq "spectron" -and $env:DB_USER) {
    $User = $env:DB_USER
}
if ($Database -eq "spectron" -and $env:DB_NAME) {
    $Database = $env:DB_NAME
}
if ($Host -eq "localhost" -and $env:DB_HOST) {
    $Host = $env:DB_HOST
}
if ($Port -eq 5432 -and $env:DB_PORT) {
    $Port = [int]$env:DB_PORT
}

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

    if ($env:DB_PASSWORD) {
        $env:PGPASSWORD = $env:DB_PASSWORD
    } else {
        $securePassword = Read-Host "Enter PostgreSQL password for user '$User'" -AsSecureString
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
        $env:PGPASSWORD = $plainPassword
    }
    
    psql -U $User -h $Host -p $Port -d $Database -f $scriptPath
    
    $env:PGPASSWORD = $null
} else {
    Write-Host "ERROR: check-db.sql not found at $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
