# Create Test User Script
# This script creates a temporary test user account in the database

Write-Host "Creating test user account..." -ForegroundColor Green

# Navigate to project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Default credentials
$email = "test@spectron.com"
$password = "test123"
$phone = "+1234567890"
$name = "Test Account"

# Allow override via environment variables
if ($env:TEST_EMAIL) { $email = $env:TEST_EMAIL }
if ($env:TEST_PASSWORD) { $password = $env:TEST_PASSWORD }
if ($env:TEST_PHONE) { $phone = $env:TEST_PHONE }
if ($env:TEST_NAME) { $name = $env:TEST_NAME }

Write-Host ""
Write-Host "Creating user with:" -ForegroundColor Cyan
Write-Host "  Email:    $email" -ForegroundColor White
Write-Host "  Password: $password" -ForegroundColor White
Write-Host "  Phone:    $phone" -ForegroundColor White
Write-Host "  Name:     $name" -ForegroundColor White
Write-Host ""

# Set database URL if not already set
if (-not $env:DATABASE_URL) {
    Write-Host ""
    Write-Host "Database connection not configured." -ForegroundColor Yellow
    Write-Host "Please provide your PostgreSQL credentials:" -ForegroundColor Yellow
    Write-Host ""
    
    $dbUser = Read-Host "Database User (default: spectron)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "spectron" }
    
    $dbPass = Read-Host "Database Password" -AsSecureString
    $dbPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass))
    
    $dbName = Read-Host "Database Name (default: spectron)"
    if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "spectron" }
    
    $dbHost = Read-Host "Database Host (default: localhost)"
    if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
    
    $dbPort = Read-Host "Database Port (default: 5432)"
    if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
    
    $env:DATABASE_URL = "postgres://${dbUser}:${dbPassPlain}@${dbHost}:${dbPort}/${dbName}?sslmode=disable"
    Write-Host ""
}

# Run the Go script
go run cmd\create-test-user\main.go

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Test user created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now log in to the mobile app with:" -ForegroundColor Yellow
    Write-Host "  Email:    $email" -ForegroundColor White
    Write-Host "  Password: $password" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Failed to create test user" -ForegroundColor Red
    exit 1
}
