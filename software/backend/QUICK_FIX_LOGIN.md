# Quick Fix: Login Not Working

## The Problem
Login returns "invalid credentials" - this usually means the test user doesn't exist in the database.

## Solution: Create the Test User

### Step 1: Connect to Database
```powershell
psql -U your_postgres_user -d spectron
```

### Step 2: Run the SQL Script
In psql, run:
```sql
\i migrations/002_create_test_user.sql
```

Or if you're in a different directory:
```sql
\i C:/Users/dell/OneDrive/Documents/spectron/migrations/002_create_test_user.sql
```

### Step 3: Verify User Was Created
```sql
SELECT u.email, a.name as account, am.role 
FROM users u
JOIN account_memberships am ON u.id = am.user_id
JOIN accounts a ON am.account_id = a.id
WHERE u.email = 'test@spectron.com';
```

**Expected output:**
```
      email       | account_name | role  
------------------+--------------+-------
 test@spectron.com| Test Account | OWNER
```

### Step 4: Test Login
```powershell
.\test-login.ps1
```

Should show: ✅ Login successful!

### Step 5: Try Mobile App Again
- Email: `test@spectron.com`
- Password: `test123`

## If Still Not Working

### Check Mobile App Configuration
**File:** `mobile/src/config/api.ts`

Make sure:
1. `YOUR_COMPUTER_IP` is your actual computer IP (run `ipconfig` to find it)
2. `BACKEND_PORT` is `8081`
3. Backend is running: `.\start-backend.ps1`

### Check Network Connection
1. Phone and computer must be on same Wi-Fi network
2. Test backend from phone browser: `http://YOUR_IP:8081/healthz`
3. Should return: `{"status":"ok"}`

### Check Backend Logs
When you try to login, check the terminal where backend is running for any error messages.

## Test Credentials
- **Email:** `test@spectron.com`
- **Password:** `test123`
