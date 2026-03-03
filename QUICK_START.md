# Quick Start Guide - Create Test User

## Fastest Method: SQL Script

If you have PostgreSQL access, this is the quickest way:

```powershell
# Replace 'your_user' with your PostgreSQL username
psql -U your_user -d spectron -f migrations\002_create_test_user.sql
```

**Credentials created:**
- Email: `test@spectron.com`
- Password: `test123`

## Alternative: Go Script

If you prefer using the Go script:

1. **Set your database credentials:**
   ```powershell
   $env:DATABASE_URL="postgres://your_user:your_password@localhost:5432/spectron?sslmode=disable"
   ```

2. **Run the script:**
   ```powershell
   .\create-test-user.ps1
   ```

## Verify the User Was Created

```powershell
# Connect to database
psql -U your_user -d spectron

# Check if user exists
SELECT email, phone FROM users WHERE email = 'test@spectron.com';

# Check account membership
SELECT u.email, am.role, a.name 
FROM users u
JOIN account_memberships am ON u.id = am.user_id
JOIN accounts a ON am.account_id = a.id
WHERE u.email = 'test@spectron.com';
```

## Use the Credentials

### In Mobile App:
- Email: `test@spectron.com`
- Password: `test123`

### Via API:
```powershell
$body = @{
    email = "test@spectron.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8081/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$token = $response.token
```

## Troubleshooting

### "password authentication failed"
- Make sure you're using the correct PostgreSQL username and password
- Check if the database exists: `psql -U your_user -l`

### "User already exists"
- The user was already created
- You can either delete it or use different credentials:
  ```sql
  DELETE FROM account_memberships WHERE user_id = (SELECT id FROM users WHERE email = 'test@spectron.com');
  DELETE FROM accounts WHERE id NOT IN (SELECT account_id FROM account_memberships);
  DELETE FROM users WHERE email = 'test@spectron.com';
  ```

### "database does not exist"
- Create the database first:
  ```sql
  CREATE DATABASE spectron;
  ```
- Then run the migrations:
  ```powershell
  psql -U your_user -d spectron -f migrations\001_init.sql
  ```
