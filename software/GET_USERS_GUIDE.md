# How to Get Users Through the Backend

## New Endpoint Added

I've added a new endpoint: `GET /users` that returns all users in your account.

## How to Use

### Step 1: Login to Get a Token

First, you need to authenticate to get a JWT token:

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
```

### Step 2: Get Users List

Use the token to call the `/users` endpoint:

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$users = Invoke-RestMethod -Uri "http://localhost:8081/users" `
    -Method GET `
    -Headers $headers

# Display users
$users.users | Format-Table email, role, created_at
```

## Using the Test Script

I've created a test script for you:

```powershell
.\test-get-users.ps1
```

This script will:
1. Login automatically
2. Get the users list
3. Display the results

## Using curl (Alternative)

```bash
# 1. Login
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@spectron.com","password":"test123"}' \
  > login_response.json

# Extract token (on Windows PowerShell)
$token = (Get-Content login_response.json | ConvertFrom-Json).token

# 2. Get users
curl -X GET http://localhost:8081/users \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json"
```

## API Response Format

```json
{
  "users": [
    {
      "id": "uuid-here",
      "email": "test@spectron.com",
      "phone": "+1234567890",
      "created_at": "2026-02-07T19:00:00Z",
      "role": "OWNER"
    }
  ],
  "count": 1
}
```

## From Mobile App

The endpoint is available at:
- URL: `http://10.191.123.149:8081/users`
- Method: `GET`
- Headers: `Authorization: Bearer <token>`

## Important Notes

1. **Authentication Required**: You must be logged in to access this endpoint
2. **Account Scoped**: Only returns users in the same account as the logged-in user
3. **Role Information**: Shows the role of each user in the account (OWNER, ADMIN, VIEWER)

## Troubleshooting

### "401 Unauthorized"
- Make sure you're sending the Authorization header with a valid token
- Token might be expired - login again to get a new token

### "No users found"
- The account might not have any users
- Make sure the test user was created with account membership

### "Network error"
- Check if backend is running: `.\start-backend.ps1`
- Verify backend URL is correct

## Quick Test

```powershell
# One-liner to test (after creating test user)
$token = (Invoke-RestMethod -Uri "http://localhost:8081/auth/login" -Method POST -ContentType "application/json" -Body (@{email="test@spectron.com";password="test123"}|ConvertTo-Json)).token; Invoke-RestMethod -Uri "http://localhost:8081/users" -Method GET -Headers @{Authorization="Bearer $token"}
```
