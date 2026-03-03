# Troubleshooting Login Issues

## Problem: Login returns "invalid credentials"

### Step 1: Verify Test User Exists

Run this in psql:
```sql
-- Check if user exists
SELECT id, email, phone, created_at FROM users WHERE email = 'test@spectron.com';

-- Check account membership
SELECT 
    u.email,
    a.name as account_name,
    am.role,
    am.account_id,
    am.user_id
FROM users u
JOIN account_memberships am ON u.id = am.user_id
JOIN accounts a ON am.account_id = a.id
WHERE u.email = 'test@spectron.com';
```

**Expected Result:**
- User should exist with email `test@spectron.com`
- Should have an account membership with role `OWNER`
- Should be linked to an account

### Step 2: Create Test User (if missing)

If the user doesn't exist, run:

```sql
-- In psql, run:
\i migrations/002_create_test_user.sql

-- Or copy-paste the SQL from the file
```

### Step 3: Test Backend Login Directly

From PowerShell:
```powershell
.\test-login.ps1
```

Or manually:
```powershell
$body = @{
    email = "test@spectron.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Step 4: Check Mobile App Configuration

Verify the mobile app is pointing to the correct backend:

**File: `mobile/src/config/api.ts`**
```typescript
const YOUR_COMPUTER_IP = '10.191.123.149'; // Your computer's IP
const BACKEND_PORT = '8081'; // Backend port
```

**Check:**
1. Is `YOUR_COMPUTER_IP` correct? (Run `ipconfig` to find your IP)
2. Is `BACKEND_PORT` set to `8081`?
3. Are your phone and computer on the same Wi-Fi network?

### Step 5: Test Mobile App Connection

1. **Check if backend is accessible from your network:**
   ```powershell
   # From your phone's browser or another device on same network:
   # http://10.191.123.149:8081/healthz
   # Should return: {"status":"ok"}
   ```

2. **Check Windows Firewall:**
   - Make sure port 8081 is allowed through Windows Firewall
   - Or temporarily disable firewall to test

3. **Check backend is running:**
   ```powershell
   netstat -ano | findstr :8081
   # Should show LISTENING
   ```

### Step 6: Common Issues

#### Issue: "Unable to connect to server"
- **Cause:** Mobile app can't reach backend
- **Fix:** 
  - Verify IP address in `mobile/src/config/api.ts`
  - Check Windows Firewall
  - Ensure same Wi-Fi network

#### Issue: "invalid credentials"
- **Cause:** User doesn't exist or password hash is wrong
- **Fix:**
  - Create test user: `psql -U your_user -d spectron -f migrations\002_create_test_user.sql`
  - Verify user exists in database

#### Issue: "Network error" or timeout
- **Cause:** Backend not running or unreachable
- **Fix:**
  - Start backend: `.\start-backend.ps1`
  - Check backend logs for errors

### Step 7: Debug Mobile App

Add console logs to see what's happening:

**In `mobile/src/services/authService.ts`:**
```typescript
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  console.log('Login attempt:', credentials.email);
  console.log('API URL:', API_BASE_URL + API_ENDPOINTS.AUTH.LOGIN);
  
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    credentials,
  );
  
  console.log('Login response:', response);
  await setToken(response.token);
  return response;
};
```

Check Expo Go console for these logs.

### Step 8: Verify Database Connection

Make sure backend can connect to database:
```powershell
# Backend should show no database errors when starting
# Check backend logs for: "connect db: ..."
```

## Quick Fix Checklist

- [ ] Test user exists in database
- [ ] User has account membership with role 'OWNER'
- [ ] Backend is running on port 8081
- [ ] Backend health check works: `http://localhost:8081/healthz`
- [ ] Mobile app API config has correct IP and port
- [ ] Phone and computer on same Wi-Fi network
- [ ] Windows Firewall allows port 8081
- [ ] Backend login works from PowerShell test script

## Still Not Working?

1. Check backend logs for detailed error messages
2. Try registering a new user through the mobile app
3. Test with curl or Postman to isolate the issue
4. Verify database credentials in backend config
