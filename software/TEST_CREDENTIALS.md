# Test Credentials

## Default Test User

A test user has been created with the following credentials:

- **Email**: `test@spectron.com`
- **Password**: `test123`
- **Phone**: `+1234567890`
- **Account Name**: `Test Account`

## How to Create Test User

### Option 1: Using SQL Script (Easiest - No Go Required)
```powershell
# Connect to your database and run:
psql -U your_user -d spectron -f migrations\002_create_test_user.sql

# Or if you're already in psql:
\i migrations/002_create_test_user.sql
```

### Option 2: Using PowerShell Script (Requires Database Access)
```powershell
# First, set your database credentials:
$env:DB_USER="your_postgres_user"
$env:DB_PASSWORD="your_postgres_password"
$env:DB_NAME="spectron"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"

# Or set the full connection string:
$env:DATABASE_URL="postgres://user:pass@localhost:5432/spectron?sslmode=disable"

# Then run:
.\create-test-user.ps1
```

### Option 3: Using Go Directly
```powershell
$env:DATABASE_URL="postgres://user:pass@localhost:5432/spectron?sslmode=disable"
go run cmd\create-test-user\main.go
```

### Option 4: Custom Credentials
```powershell
$env:TEST_EMAIL="your@email.com"
$env:TEST_PASSWORD="yourpassword"
$env:TEST_PHONE="+1234567890"
$env:TEST_NAME="Your Name"
$env:DATABASE_URL="postgres://user:pass@localhost:5432/spectron?sslmode=disable"
.\create-test-user.ps1
```

## Using the Credentials

### In Mobile App (Expo Go)
1. Open the mobile app
2. Go to Sign In screen
3. Enter:
   - Email: `test@spectron.com`
   - Password: `test123`
4. Tap "Sign In"

### Via API (for testing)
```powershell
# Login
$body = @{
    email = "test@spectron.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8081/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$token = $response.token
Write-Host "Token: $token"
```

## Notes

- The test user has **OWNER** role, so they have full access
- The password is hashed using bcrypt
- If you try to create a user with an existing email, the script will fail
- You can create multiple test users with different emails

## Security Warning

⚠️ **These are temporary test credentials for development only!**
- Do NOT use these credentials in production
- Change the password if deploying to a shared environment
- Delete test users before going to production
