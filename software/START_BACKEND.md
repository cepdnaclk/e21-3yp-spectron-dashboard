# How to Start the Backend Server

## Prerequisites

1. ✅ PostgreSQL database created (`spectron`)
2. ✅ Database migration run
3. ✅ Go installed

## Step 1: Run Database Migration

If you haven't run the migration yet:

**Option A: From psql (if you're in psql session):**
```sql
\i migrations/001_init.sql
```

**Option B: From PowerShell:**
```powershell
# Find PostgreSQL bin directory (usually):
# C:\Program Files\PostgreSQL\15\bin\psql.exe

& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U spectron -d spectron -f migrations\001_init.sql
```

## Step 2: Start the Backend Server

### Method 1: Using the Script (Easiest)

```powershell
.\start-backend.ps1
```

### Method 2: Manual Command

**If Go is in your PATH:**
```powershell
go run cmd\api\main.go
```

**If Go is NOT in your PATH:**
```powershell
# Add Go to PATH for this session
$env:Path += ";C:\Program Files\Go\bin"

# Then run
go run cmd\api\main.go
```

**Or use full path:**
```powershell
& "C:\Program Files\Go\bin\go.exe" run cmd\api\main.go
```

## Step 3: Verify Server is Running

You should see:
```
API server listening on 0.0.0.0:8080
Mobile app should connect to: http://<your-ip>:8080
```

## Test the Server

Open another terminal and test:
```powershell
curl http://localhost:8080/healthz
```

Should return: `{"status":"ok"}`

## Troubleshooting

### "go: command not found"

1. **Install Go:**
   - Download from: https://go.dev/dl/
   - Install it
   - Restart PowerShell

2. **Or add Go to PATH:**
   ```powershell
   # Find where Go is installed (usually):
   # C:\Program Files\Go\bin
   
   # Add to PATH for this session:
   $env:Path += ";C:\Program Files\Go\bin"
   ```

3. **Or use full path:**
   ```powershell
   & "C:\Program Files\Go\bin\go.exe" run cmd\api\main.go
   ```

### Database Connection Error

Make sure:
- PostgreSQL service is running
- Database `spectron` exists
- User `spectron` exists (or use `postgres` user)
- Check `.env` file or environment variables

### Port Already in Use

If port 8080 is already in use:
- Change `HTTP_PORT` in `.env` file
- Or stop the other service using port 8080

## Stop the Server

Press `Ctrl+C` in the terminal where the server is running.
