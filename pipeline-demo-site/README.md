# Pipeline Demo Site

This is a complete, fully functional demo showing live sensor packet flow through the Spectron pipeline in real time.

## What It Does

- **Real-time Visualization** - Watch packets animate through 6 pipeline stages
- **Mock Backend** - Node.js server generates simulated sensor data every 5 seconds
- **Live Polling** - Frontend polls backend every 3 seconds for new packets
- **Interactive Demo** - Replay packets, clear history, customize source URL
- **Packet Inspector** - View detailed JSON for each captured packet
- **Trace History** - See all packets processed with timing details
- **Dark UI** - Modern, polished dark theme with smooth animations

## Quick Start (5 minutes)

### 1. Start the Backend Server

Open a PowerShell terminal and run:

```powershell
cd pipeline-demo-site\server
npm install
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║  Spectron Pipeline Mock Backend                            ║
║  Server running at http://localhost:8080
│  Auto-generate: ENABLED (every 5000ms)
```

The backend is now generating simulated packets every 5 seconds.

### 2. Start the Frontend Dev Server

Open another PowerShell terminal and run:

```powershell
cd pipeline-demo-site
.\start-demo.ps1
```

Your browser will open at: **http://localhost:4173**

### 3. Connect and Watch

1. The "Connect Source" button shows `http://localhost:8080`
2. Click **"Connect Source"**
3. Watch the stats update:
   - ✓ Connection: **Live**
   - 📊 Packets Tracked: incrementing
   - 📍 Active Stage: animating through pipeline
   - 📱 Latest Device: showing device ID

## File Structure

```
pipeline-demo-site/
├── index.html              # Frontend HTML (static)
├── app.js                  # Frontend JS (vanilla, no build step)
├── styles.css              # Dark theme styles with animations
├── start-demo.ps1          # Start frontend dev server script
│
├── server/
│   ├── server.js           # Node.js + Express mock backend
│   ├── package.json        # Backend dependencies
│   ├── start-backend.ps1   # Start backend server script
│   ├── README.md           # Backend setup guide
│   ├── API.md              # Full API reference & sample data
│   └── .gitignore
│
└── README.md               # This file
```

## How It Works

### Data Flow

```
1. Backend generates sensor packet (every 5s)
   ↓
2. Frontend polls /uploads.json (every 3s)
   ↓
3. Detects new packet
   ↓
4. Starts animation through 6 stages (1.1s per stage)
   ↓
5. Updates stats, inspector, and history
```

### The 6 Pipeline Stages

1. **Device / Sensor** - Device assembles and sends payload
2. **Ingest Server** - HTTP endpoint receives the packet
3. **Validation** - Schema validation and type checking
4. **Processing / Rules Engine** - Alert rules evaluated
5. **Storage / Database** - Written to PostgreSQL
6. **Dashboard / Output** - Appears in real-time displays

### Animation Details

- Each packet moves **1.1 seconds per stage**
- Total animation time: **~6.6 seconds** (6 stages)
- Smooth easing for visual appeal
- Packet token follows a horizontal track
- Stage cards highlight: waiting → active → completed

## Frontend Features

### Connect Source Button
- Enter custom backend URL (default: http://localhost:8080)
- Supports any endpoint returning `/uploads.json` format
- Tests connection before enabling replay/clear

### Live Statistics
- **Connection**: Shows Live/Offline status
- **Packets Tracked**: Session count (resets on clear)
- **Active Stage**: Current stage name or "Idle"
- **Latest Device**: Most recent device ID

### Packet Inspector
- Shows latest packet details:
  - Upload ID
  - Device ID
  - Received timestamp
  - JSON preview of full sensor payload

### Trace History
- List of all packets from this session
- Shows timing for each stage
- Progress bar showing completion
- Badges: "Live" (auto-generated) or "Replay" (manual)

### Action Buttons
- **Connect Source**: Link to backend URL and start polling
- **Replay Latest Packet**: Re-animate the most recent packet
- **Clear History**: Reset counters and clear traces

## Backend Configuration

### Environment Variables

```powershell
# Change port (default 8080)
$env:PORT = "9000"

# Disable auto-generation (default: true)
$env:AUTO_GENERATE = "false"

# Change generation interval (default: 5000ms)
$env:AUTO_GENERATE_INTERVAL = "10000"

npm start
```

### Backend Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/uploads.json` | Main polling endpoint |
| GET | `/api/packets` | Alternative JSON format |
| POST | `/api/packets/generate` | Manually create packet |
| DELETE | `/api/packets` | Clear all uploads |
| GET | `/health` | Health check |

See `server/API.md` for detailed examples.

## Manual Testing

### Generate a Packet
```powershell
curl -X POST http://localhost:8080/api/packets/generate
```

### Get All Uploads
```powershell
curl http://localhost:8080/uploads.json | ConvertFrom-Json | ConvertTo-Json
```

### Clear Data
```powershell
curl -X DELETE http://localhost:8080/api/packets
```

## UI Customization

### Change Animation Speed

Edit `app.js`:
```javascript
const STAGE_ADVANCE_MS = 1100;  // milliseconds per stage (reduce for faster)
```

### Change Poll Interval

Edit `app.js`:
```javascript
const POLL_INTERVAL_MS = 3000;  // milliseconds between polls
```

### Change Colors

Edit `styles.css`:
```css
:root {
  --accent: #27d3c3;              /* Teal pipeline accent */
  --accent-strong: #13b4a5;       /* Darker teal */
  --success: #22c55e;             /* Green for completed */
  --warm: #f59e0b;                /* Orange for future */
}
```

## Troubleshooting

### "Connection refused" in frontend
```powershell
# Check backend is running
curl http://localhost:8080/health

# If error: backend might not be running
# Go to server/ folder and run: npm start
```

### Packets not appearing
```powershell
# Check backend is generating packets
curl http://localhost:8080/uploads.json

# If empty, backend might have auto-generation disabled
# Set: $env:AUTO_GENERATE = "true"
```

### Port already in use
```powershell
# Find what's using the port
Get-NetTCPConnection -LocalPort 8080

# Use different port
$env:PORT = 8090
npm start

# Then in frontend, change Connect Source to http://localhost:8090
```

### Frontend not updating
```powershell
# Clear browser cache (Ctrl+Shift+Delete)
# Open DevTools (F12) and check:
# - Console for JavaScript errors
# - Network tab for polling requests
# - Check "Last poll" timestamp updating

# Try clicking "Replay Latest Packet" to test animation
```

## Demo Workflow

Great demo sequence to show:

1. **Start both servers**
2. **Open frontend** - Shows "Checking..." while connecting
3. **Click Connect Source** - Changes to "Live" when connected
4. **Wait for packet** - Watch animations play
5. **Packets Tracked** increments, stats update
6. **Click Replay Latest** - Packet re-animates without new data
7. **Show inspector** - JSON details of latest packet
8. **Show history** - List of all packets from session
9. **Stop backend** - Connection changes to "Offline"
10. **Restart backend** - Connection returns to "Live"

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Browser (http://localhost:4173)        │
│  ┌─────────────────────────────────────┐│
│  │ Spectron Live Pipeline Tracker      ││
│  │ - Vanilla JS (no build needed)      ││
│  │ - Dark theme UI                      ││
│  │ - Smooth animations                  ││
│  └─────────────────────────────────────┘│
│  Polls every 3 seconds ↓                │
└──────────────────────┬──────────────────┘
                       │ HTTP GET
         ┌─────────────▼────────────────┐
         │ Node.js + Express Backend    │
         │ http://localhost:8080        │
         │ ┌──────────────────────────┐ │
         │ │ Mock Packet Generator    │ │
         │ │ - Generates every 5s     │ │
         │ │ - Realistic sensor data  │ │
         │ │ - 6 device types        │ │
         │ └──────────────────────────┘ │
         │ ┌──────────────────────────┐ │
         │ │ In-Memory Upload Store   │ │
         │ │ - Max 1000 packets       │ │
         │ │ - Newest first           │ │
         │ └──────────────────────────┘ │
         └─────────────────────────────┘
```

## Next Steps

### For Development
- Modify `app.js` for custom logic
- Edit `styles.css` for theme changes
- Enhance packet generation in `server/server.js`

### For Integration
- Connect to real IoT devices instead of mock generation
- Integrate with PostgreSQL backend
- Connect to real Kafka/MQTT infrastructure
- Add WebSocket for real-time (instead of polling)

### For Production
- Deploy backend to cloud (AWS, Azure, etc.)
- Add authentication and HTTPS
- Implement proper error handling and retry logic
- Add monitoring and logging
- Set up CI/CD pipeline

## Support Files

- **server/README.md** - Detailed backend setup
- **server/API.md** - Full API reference with examples
- **server/start-backend.ps1** - Backend startup script
- **start-demo.ps1** - Frontend startup script (in root)

## Notes

- No database required (mock backend uses in-memory storage)
- No build step required for frontend (plain HTML/JS)
- CORS enabled for cross-origin requests
- All data is ephemeral (lost on server restart)
- Perfect for demos, training, and prototyping

Happy demoing! 🚀

