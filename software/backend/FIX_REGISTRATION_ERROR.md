# Fix Registration Database Error

## Problem
Registration endpoint returns "database error" - generic error message that doesn't help debug.

## Solution Applied

### 1. Improved Error Handling
Updated `internal/httpapi/auth_handler.go` to:
- Log detailed error messages to backend console
- Return specific error messages to client
- Detect duplicate email errors
- Show actual database error messages

### 2. Added Missing Imports
- Added `log` package for error logging
- Added `strings` package for error checking

## How to Debug

### Step 1: Restart Backend
```powershell
.\start-backend.ps1
```

### Step 2: Try Registration Again
```powershell
.\test-registration.ps1
```

### Step 3: Check Backend Console
The backend console will now show detailed error messages like:
- "Failed to begin transaction: ..."
- "Failed to create user: ..."
- "Failed to create account: ..."
- "Failed to create membership: ..."
- "Failed to commit transaction: ..."

### Step 4: Common Issues

#### Issue: "Failed to begin transaction"
- **Cause:** Database connection problem
- **Fix:** Check DATABASE_URL, verify PostgreSQL is running

#### Issue: "email already registered"
- **Cause:** User with that email already exists
- **Fix:** Use a different email or delete existing user

#### Issue: "Failed to create user: ..."
- **Cause:** Database constraint violation or table issue
- **Fix:** 
  - Check if tables exist: `\dt` in psql
  - Verify table structure: `\d users` in psql
  - Check if migrations ran: `SELECT * FROM users LIMIT 1;`

#### Issue: "Failed to create account: ..."
- **Cause:** Accounts table issue
- **Fix:** Check accounts table exists and structure

#### Issue: "Failed to create membership: ..."
- **Cause:** Foreign key constraint or table issue
- **Fix:** Verify account_memberships table exists

## Database Verification

Run these in psql:

```sql
-- Check tables exist
\dt

-- Check users table
\d users

-- Check accounts table
\d accounts

-- Check account_memberships table
\d account_memberships

-- Try manual insert
INSERT INTO users (id, email, password_hash, phone)
VALUES (gen_random_uuid(), 'test@test.com', 'hash', '+1234567890');
```

## Next Steps

1. **Restart backend** to load the improved error handling
2. **Try registration again** - you'll now see specific error messages
3. **Check backend console** for detailed logs
4. **Fix the specific issue** based on the error message

## Expected Behavior

After fix:
- ✅ Detailed error messages in backend console
- ✅ Specific error messages returned to client
- ✅ Duplicate email detection
- ✅ Better debugging information
