# Verify Test User in Database
# This script helps verify if the test user was created correctly

param(
    [string]$DbUser = "spectron",
    [string]$Database = "spectron",
    [string]$DbHost = "localhost",
    [int]$Port = 5432
)

Write-Host "Verifying Test User in Database" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""

$email = "test@spectron.com"

Write-Host "Checking for user: $email" -ForegroundColor Cyan
Write-Host ""

# SQL query to check user
$sql = @"
SELECT 
    u.id,
    u.email,
    u.phone,
    u.created_at,
    a.name as account_name,
    a.id as account_id,
    am.role
FROM users u
LEFT JOIN account_memberships am ON u.id = am.user_id
LEFT JOIN accounts a ON am.account_id = a.id
WHERE u.email = '$email';
"@

Write-Host "Run this SQL query in psql:" -ForegroundColor Yellow
Write-Host ""
Write-Host $sql -ForegroundColor White
Write-Host ""

Write-Host "Or use this one-liner:" -ForegroundColor Yellow
Write-Host "psql -U $DbUser -d $Database -c `"SELECT u.email, a.name as account, am.role FROM users u LEFT JOIN account_memberships am ON u.id = am.user_id LEFT JOIN accounts a ON am.account_id = a.id WHERE u.email = '$email';`"" -ForegroundColor White
Write-Host ""

Write-Host "Expected Result:" -ForegroundColor Cyan
Write-Host "  email: test@spectron.com" -ForegroundColor White
Write-Host "  account: Test Account" -ForegroundColor White
Write-Host "  role: OWNER" -ForegroundColor White
Write-Host ""

Write-Host "If user doesn't exist, create it with:" -ForegroundColor Yellow
Write-Host "  psql -U $DbUser -d $Database -f migrations\002_create_test_user.sql" -ForegroundColor White
Write-Host ""
