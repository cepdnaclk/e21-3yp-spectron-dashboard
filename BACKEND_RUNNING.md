# ✅ Backend Server is Running!

## Current Status

- **Backend is running on port 8081** (port 8080 is used by a system service)
- **Health check endpoint**: `http://localhost:8081/healthz` ✅
- **Status**: `{"status":"ok"}`

## Connection Details

### For Mobile App (Expo Go)
- **API Base URL**: `http://10.191.123.149:8081`
- The mobile app config has been updated to use port 8081
- Make sure your phone and computer are on the same Wi-Fi network

### For Web/Testing
- **Local**: `http://localhost:8081`
- **Network**: `http://10.191.123.149:8081`

## How to Start the Backend

### Option 1: Using the PowerShell Script (Recommended)
```powershell
.\start-backend.ps1
```

### Option 2: Manual Start
```powershell
# Set environment variables
$env:HTTP_PORT="8081"
$env:DATABASE_URL="postgres://spectron:spectron@localhost:5432/spectron?sslmode=disable"

# Run the server
go run cmd\api\main.go
```

### Option 3: Using Different Port
```powershell
$env:HTTP_PORT="8082"  # or any available port
go run cmd\api\main.go
```

## API Endpoints

### Public Endpoints
- `GET /healthz` - Health check (no auth required)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Protected Endpoints (require JWT token)
- `GET /auth/me` - Get current user
- `GET /controllers` - List controllers
- `POST /controllers/pair` - Pair a new controller
- `GET /controllers/{id}` - Get controller details
- `GET /controllers/{id}/sensors` - List sensors for a controller
- `GET /sensors/{id}` - Get sensor details
- `POST /sensors/{id}/ai-suggest-config` - Get AI configuration suggestions
- `POST /sensors/{id}/config` - Save sensor configuration
- `GET /dashboard/overview` - Dashboard overview
- `GET /controllers/{id}/dashboard` - Controller dashboard
- `GET /sensors/{id}/readings` - Get sensor readings
- `GET /alerts` - List alerts
- `POST /alerts/{id}/ack` - Acknowledge alert

## Database Connection

- **Host**: localhost
- **Port**: 5432
- **Database**: spectron
- **User**: spectron
- **Password**: spectron

## Troubleshooting

### Port Already in Use
If you see "bind: address already in use":
1. Check what's using the port: `netstat -ano | findstr :8081`
2. Kill the process: `taskkill /F /PID <process_id>`
3. Or use a different port: `$env:HTTP_PORT="8082"`

### Database Connection Error
If you see "connect db" errors:
1. Make sure PostgreSQL is running
2. Verify database exists: `psql -U spectron -d spectron -c "SELECT 1;"`
3. Check connection string matches your setup

### Mobile App Can't Connect
1. Make sure backend is running: `curl http://localhost:8081/healthz`
2. Check your computer's IP: `ipconfig` (look for IPv4 Address)
3. Update `mobile/src/config/api.ts` with correct IP and port
4. Ensure phone and computer are on same Wi-Fi network
5. Check Windows Firewall allows connections on port 8081

## Next Steps

1. ✅ Backend is running
2. ✅ Mobile app config updated to port 8081
3. 🔄 Test the mobile app connection
4. 🔄 Test authentication endpoints
5. 🔄 Test controller pairing
