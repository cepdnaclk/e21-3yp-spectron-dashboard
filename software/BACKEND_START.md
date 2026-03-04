# Backend Server Setup Guide

## Quick Start

### 1. Start PostgreSQL Database

Make sure PostgreSQL is running with TimescaleDB extension.

**Windows:**
```powershell
# If using a service, it should already be running
# Or start manually if installed as a service
```

**Create database (if not exists):**
```sql
CREATE DATABASE spectron;
\c spectron
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

### 2. Run Database Migrations

```bash
psql -U spectron -d spectron -f migrations/001_init.sql
```

Or if using default settings:
```bash
psql -U spectron -d spectron -f migrations/001_init.sql
```

### 3. Configure Environment (Optional)

Create a `.env` file in the project root (optional, defaults are provided):

```env
HTTP_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=spectron
DB_PASSWORD=spectron
DB_NAME=spectron
```

### 4. Start the Backend Server

```bash
go run cmd/api/main.go
```

You should see:
```
API server listening on 0.0.0.0:8080
Mobile app should connect to: http://<your-ip>:8080
```

### 5. Test the Connection

Open in browser or use curl:
```bash
curl http://localhost:8080/healthz
```

Should return: `{"status":"ok"}`

## Mobile App Connection

### For Physical Device (Expo Go):

1. **Find your computer's IP address:**
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. **Update mobile app config:**
   - Edit `mobile/src/config/api.ts`
   - Change `YOUR_COMPUTER_IP` to your computer's IP
   - Example: `const YOUR_COMPUTER_IP = '10.191.123.149';`

3. **Make sure:**
   - Phone and computer are on the **same Wi-Fi network**
   - Backend server is running
   - Firewall allows connections on port 8080

### For Android Emulator:

The app is already configured to use `http://10.0.2.2:8080`

### For iOS Simulator:

Change `YOUR_COMPUTER_IP` to `localhost` in the config.

## Troubleshooting

### "Unable to connect to server"

1. **Check if backend is running:**
   ```bash
   curl http://localhost:8080/healthz
   ```

2. **Check firewall:**
   - Windows: Allow port 8080 in Windows Firewall
   - Make sure backend is listening on `0.0.0.0:8080` (not just `localhost`)

3. **Verify IP address:**
   - Make sure you're using the correct IP from `ipconfig`
   - Try the other IP addresses if one doesn't work

4. **Check network:**
   - Phone and computer must be on the same Wi-Fi network
   - Some corporate networks block device-to-device communication

5. **Test connection from phone:**
   - Open browser on phone
   - Go to: `http://<your-computer-ip>:8080/healthz`
   - Should see: `{"status":"ok"}`

## Default Configuration

- **Port:** 8080
- **Database:** PostgreSQL on localhost:5432
- **Database Name:** spectron
- **Database User:** spectron
- **Database Password:** spectron**

Change these in `.env` file or environment variables.
