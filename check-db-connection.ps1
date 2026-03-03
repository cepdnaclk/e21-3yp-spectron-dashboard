# Check Database Connection and Tables
# This script helps verify database setup

Write-Host "Database Connection Check" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

Write-Host "Run these SQL commands in psql to verify database:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Check if tables exist:" -ForegroundColor Yellow
Write-Host "   \dt" -ForegroundColor White
Write-Host ""

Write-Host "2. Check users table structure:" -ForegroundColor Yellow
Write-Host "   \d users" -ForegroundColor White
Write-Host ""

Write-Host "3. Check accounts table structure:" -ForegroundColor Yellow
Write-Host "   \d accounts" -ForegroundColor White
Write-Host ""

Write-Host "4. Check account_memberships table structure:" -ForegroundColor Yellow
Write-Host "   \d account_memberships" -ForegroundColor White
Write-Host ""

Write-Host "5. Try to insert a test record manually:" -ForegroundColor Yellow
Write-Host "   INSERT INTO users (id, email, password_hash, phone)" -ForegroundColor White
Write-Host "   VALUES (gen_random_uuid(), 'test@test.com', 'hash', '+1234567890');" -ForegroundColor White
Write-Host ""

Write-Host "6. Check for any constraints or errors:" -ForegroundColor Yellow
Write-Host "   SELECT constraint_name, constraint_type" -ForegroundColor White
Write-Host "   FROM information_schema.table_constraints" -ForegroundColor White
Write-Host "   WHERE table_name IN ('users', 'accounts', 'account_memberships');" -ForegroundColor White
Write-Host ""

Write-Host "Common Issues:" -ForegroundColor Cyan
Write-Host "- Tables don't exist: Run migrations/001_init.sql" -ForegroundColor White
Write-Host "- Database connection failed: Check DATABASE_URL in backend" -ForegroundColor White
Write-Host "- Constraint violation: Check if email already exists" -ForegroundColor White
Write-Host "- Transaction error: Check database logs" -ForegroundColor White
