# Setup & Installation Guide

Complete step-by-step guide to get the Spectron Pipeline Demo running locally.

## Prerequisites

Ensure you have these installed:

- **Node.js 18+** - Download from https://nodejs.org/
- **npm** - Included with Node.js
- **PowerShell** - Windows 7+ or PowerShell Core (Mac/Linux)
- **Git** (optional, for cloning)

### Verify Installation

```powershell
node --version    # Should show v18.0.0 or higher
npm --version     # Should show 9.0.0 or higher
```

## Installation Steps

### Step 1: Navigate to the Demo Directory

```powershell
cd d:\3Yp\e21-3yp-spectron-dashboard\pipeline-demo-site
```

### Step 2: Install Backend Dependencies

```powershell
cd server
npm install
```

This downloads Express, CORS, and UUID packages (~150MB).

Expected output:
```
added 50 packages, and audited 51 packages in 10s
found 0 vulnerabilities
```

### Step 3: Return to Root and Verify Frontend Files

```powershell
cd ..
ls
```

You should see:
- `index.html`
- `app.js`
- `styles.css`
- `start-demo.ps1`
- `server/` folder

No installation needed for frontend (it's plain HTML/JS/CSS).

## Running the Demo

### Terminal 1: Start the Backend Server

```powershell
cd pipeline-demo-site\server
npm start
```

Wait for this output:
```
╔════════════════════════════════════════════════════════════╗
║  Spectron Pipeline Mock Backend                            ║
║  Server running at http://localhost:8080
│  Auto-generate: ENABLED (every 5000ms)
```

✅ Backend is ready. Keep this terminal open.

### Terminal 2: Start the Frontend Dev Server

```powershell
cd pipeline-demo-site
.\start-demo.ps1
```

Wait for output like:
```
VITE v4.4.x ready in 234 ms

➜  Local:   http://localhost:4173/
```

✅ Frontend is ready. Keep this terminal open.

### Terminal 3: Verify Backend Connectivity

```powershell
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"ok","uptime":123.456,"uploadCount":5,"timestamp":"2025-04-24T14:36:30.000Z"}
```

✅ Backend is responding correctly.

## Using the Demo

### 1. Open in Browser

Visit: **http://localhost:4173**

You should see:
- Dark theme interface
- "Spectron Live Pipeline Tracker" title
- Stats showing "Connection: Checking..."
- Source URL input: `http://localhost:8080`

### 2. Connect to Backend

1. Click **"Connect Source"** button
2. Wait 1-2 seconds for connection
3. Stats should change to:
   - **Connection**: Live ✓
   - **Packets Tracked**: 1+ (incrementing)
   - **Active Stage**: Animating through stages

### 3. Watch Packets Flow

- **First packet** appears after 5 seconds (when backend generates one)
- **Animation** shows packet moving through 6 stages smoothly
- **Stats update** as each packet arrives
- **Inspector panel** shows latest packet details

### 4. Try Features

#### Replay Latest Packet
```
1. Wait for a packet to arrive
2. Click "Replay Latest Packet"
3. Watch it animate again without waiting for new data
```

#### Clear History
```
1. Click "Clear History"
2. Counters reset to 0
3. History list clears
```

#### Custom Backend URL
```
1. Change URL from http://localhost:8080 to custom URL
2. Click "Connect Source"
3. Demo switches to custom backend
```

## Troubleshooting

### Backend won't start

```powershell
# Check Node.js is installed
node --version

# Try manually in the server directory
cd pipeline-demo-site\server
npm install
npm start
```

If still fails, check:
- Port 8080 not in use: `Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue`
- Node cache: `npm cache clean --force` then `npm install`

### Frontend shows "Connection refused"

```powershell
# Verify backend is running
curl http://localhost:8080/health

# Check backend console shows "Auto-generate: ENABLED"
# If not, packets won't appear even if connected
```

### Port 8080 already in use

```powershell
# Find what's using it
Get-NetTCPConnection -LocalPort 8080 | Select OwningProcess
Get-Process -Id <PID>

# Kill the process or use different port
$env:PORT = 8090
npm start

# Then update frontend to http://localhost:8090
```

### No packets appearing

```powershell
# 1. Check backend is generating packets
curl http://localhost:8080/uploads.json

# 2. If empty, backend might not be auto-generating
#    Set this before starting backend:
$env:AUTO_GENERATE = "true"

# 3. Manually generate a packet
curl -X POST http://localhost:8080/api/packets/generate

# 4. Check frontend console (F12) for JavaScript errors
```

### "ENOENT" error on npm start

```powershell
# Missing node_modules
cd server
rm -Recurse node_modules
npm install
npm start
```

### Frontend not updating / stuck on "Checking..."

```powershell
# 1. Close browser tab
# 2. Clear browser cache (Ctrl+Shift+Delete)
# 3. Open http://localhost:4173 in new tab
# 4. Check DevTools console (F12) for errors

# 5. If still failing, restart both servers:
#    - Kill terminal 1 (Ctrl+C)
#    - Kill terminal 2 (Ctrl+C)
#    - Start backend again
#    - Start frontend again
```

## Configuration

### Change Backend Port

```powershell
# Before running npm start:
$env:PORT = 9000
npm start

# Then update frontend connection to http://localhost:9000
```

### Disable Auto-Generation

```powershell
# Backend will only generate when you manually POST
$env:AUTO_GENERATE = "false"
npm start

# Then manually generate packets:
curl -X POST http://localhost:8080/api/packets/generate
```

### Change Generation Speed

```powershell
# Generate packet every 10 seconds instead of 5
$env:AUTO_GENERATE_INTERVAL = "10000"
npm start
```

### Change Animation Speed

Edit `app.js` line 2:
```javascript
const STAGE_ADVANCE_MS = 1100;  // Change to 500 for faster, 2000 for slower
```

Reload browser to apply changes.

## File Reference

### Backend Files
- `server/server.js` - Main Express application
- `server/package.json` - Dependencies (express, cors, uuid)
- `server/start-backend.ps1` - Startup script

### Frontend Files
- `index.html` - Main HTML structure
- `app.js` - JavaScript logic (vanilla, no build)
- `styles.css` - Dark theme styling
- `start-demo.ps1` - Startup script

### Documentation
- `README.md` - Quick overview
- `SETUP.md` - This file
- `server/README.md` - Backend details
- `server/API.md` - API reference

## Performance

### Expected Behavior

- **Startup**: 3-5 seconds total for both servers
- **First poll**: 1-2 seconds after frontend loads
- **Packet arrival**: Every 5 seconds from auto-generation
- **Animation**: 6.6 seconds per packet (1.1s per stage)
- **Memory**: ~50MB for backend + ~100MB for node processes
- **CPU**: <5% during idle, <10% while animating

### If Slow

1. **More RAM** - Minimum 4GB, recommend 8GB+
2. **Disable auto-generate** - Reduces backend CPU
3. **Increase poll interval** - `POLL_INTERVAL_MS` in app.js
4. **Close other apps** - Free up system resources

## Next Steps

### After Getting It Running

1. **Explore the code** - Read `app.js` and `server/server.js`
2. **Customize colors** - Edit CSS variables in `styles.css`
3. **Change animation speed** - Modify `STAGE_ADVANCE_MS` in `app.js`
4. **Generate custom packets** - See `server/API.md`

### For Production

1. **Add authentication** - Secure the /api endpoints
2. **Add database** - Store packets in PostgreSQL instead of memory
3. **Add monitoring** - Log to Datadog, CloudWatch, etc.
4. **Deploy** - Use Docker, Kubernetes, or AWS/Azure
5. **HTTPS** - Set up SSL certificates

### For Integration

1. **Connect to real IoT** - Replace mock generation with real devices
2. **Use real backend** - Point to `software/backend` instead of mock
3. **Add WebSocket** - Use socket.io instead of polling
4. **Kafka integration** - Stream packets through Kafka

## Getting Help

### Check These Files
1. `README.md` - Quick overview
2. `server/README.md` - Backend setup
3. `server/API.md` - API examples
4. Browser DevTools (F12) - JavaScript console

### Common Issues
- Port in use? Use `$env:PORT = 9000`
- No packets? Check `AUTO_GENERATE=true`
- Connection refused? Check `http://localhost:8080/health`

## Summary

**You're all set!** 🎉

- ✅ Backend running on `http://localhost:8080`
- ✅ Frontend running on `http://localhost:4173`
- ✅ Packets auto-generating every 5 seconds
- ✅ Frontend polling every 3 seconds
- ✅ Animations playing smoothly
- ✅ Stats updating in real-time

**Enjoy the demo!** 🚀
