# Spectron Pipeline Demo - Setup & Run

This directory contains a complete live pipeline demo showing how sensor packets move through the Spectron system in real time.

## What's Included

- **Frontend**: Static site with live pipeline visualization (Vite + Vanilla JS)
- **Backend**: Node.js + Express mock server that generates and serves simulated sensor packets
- **Polling**: Frontend polls backend every 3 seconds for new packets

## Directory Structure

```
pipeline-demo-site/
├── index.html            # Frontend HTML
├── app.js                # Frontend JavaScript (vanilla)
├── styles.css            # Frontend styles (dark theme)
├── start-demo.ps1        # Start frontend dev server
│
├── server/
│   ├── server.js         # Node.js + Express backend
│   └── package.json      # Backend dependencies
│
└── README.md             # This file
```

## Quick Start

### 1. Start the Backend Mock Server

Open a PowerShell terminal in `pipeline-demo-site/server`:

```powershell
cd pipeline-demo-site\server
npm install
npm start
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║  Spectron Pipeline Mock Backend                            ║
║  Server running at http://localhost:8080
│  Auto-generate: ENABLED (every 5000ms)
╚════════════════════════════════════════════════════════════╝
```

### 2. Start the Frontend Dev Server

Open another PowerShell terminal in `pipeline-demo-site`:

```powershell
cd pipeline-demo-site
.\start-demo.ps1
```

The frontend will start on: **http://localhost:4173**

### 3. View the Live Demo

1. Open **http://localhost:4173** in your browser
2. The "Connect Source" button should already show `http://localhost:8080`
3. Click **"Connect Source"** to start polling packets
4. You should see:
   - Stats updating: "Packets Tracked" counter incrementing
   - Pipeline stages animating as packets flow through
   - Latest packet details in the inspector panel
   - Trace history showing all packets

## How It Works

### Data Flow

```
Mock Backend (generates packets every 5s)
    ↓
http://localhost:8080/uploads.json
    ↓
Frontend polls every 3 seconds
    ↓
Detects new packets
    ↓
Animates through pipeline stages
    ↓
Updates stats and inspector
```

### Backend Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/uploads.json` | Main endpoint for frontend polling |
| GET | `/api/packets` | Alternative JSON endpoint |
| POST | `/api/packets/generate` | Manually trigger packet generation |
| DELETE | `/api/packets` | Clear all stored packets |
| GET | `/health` | Health check |

### Frontend Features

- **Connect Source**: Enter custom backend URL (default: http://localhost:8080)
- **Pipeline Visualization**: 4-stage live pipeline + 2 future stages
- **Animated Flow**: Smooth animation as each packet progresses through stages
- **Packet Inspector**: View latest packet details in JSON format
- **Trace History**: See all packets that have been processed
- **Replay Latest**: Re-animate the most recent packet without waiting
- **Clear History**: Reset counters and clear all traces
- **Connection Status**: Shows "Live" or "Offline"

## Packet Format

The backend generates packets matching Spectron's IoT format:

```json
{
  "id": 1,
  "device_id": "CTRL-001",
  "ts": 1713990000,
  "received_at": "2025-04-24T14:30:00.000Z",
  "payload_preview": "{\"deviceId\":\"CTRL-001\",\"ts\":1713990000,\"sensors\":[{\"id\":\"sensor-TEMP-42\",\"type\":\"temperature\",\"v\":28.5,\"u\":\"°C\"}],\"location\":\"Greenhouse A\",\"status\":\"ok\"}",
  "status": "received"
}
```

## Customization

### Change Backend Port

```powershell
$env:PORT=9000
npm start
```

Then in the frontend, change "Connect Source" to `http://localhost:9000`

### Disable Auto-Generate Packets

```powershell
$env:AUTO_GENERATE=false
npm start
```

Then manually generate with: `curl -X POST http://localhost:8080/api/packets/generate`

### Change Generation Interval

```powershell
$env:AUTO_GENERATE_INTERVAL=10000
npm start
```

## Troubleshooting

### "Connection refused" error in frontend

1. Check backend is running: `curl http://localhost:8080/health`
2. Verify backend is on the correct port
3. Check firewall isn't blocking port 8080
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Packets not animating

1. Check frontend console (F12) for JavaScript errors
2. Verify polling is active (should see "Last refreshed at..." updating)
3. Click "Replay Latest Packet" to test animation manually
4. Check that backend is generating packets (look for console output)

### Port already in use

If port 8080 is already in use:

```powershell
# Find process using port 8080
Get-NetTCPConnection -LocalPort 8080

# Use different port
$env:PORT=8090
npm start
```

## Architecture Notes

### Real Integration (Future)

This demo currently uses a mock backend. In production:

1. **Device/Sensor** → Real IoT device sends packet
2. **Ingest Server** → `hardware/iot-ingest` receives via HTTP
3. **Validation** → Backend validates against Spectron schema
4. **Processing/Rules Engine** → Runs alert rules
5. **Storage/Database** → PostgreSQL stores readings
6. **Dashboard/Output** → Main frontend displays analytics

For now, this demo simulates step 1 (packet generation) and pipes directly to the pipeline tracker at step 2.

## Learn More

- **Backend Code**: See `server/server.js` for packet generation logic
- **Frontend Code**: See `app.js` for animation and polling logic
- **Styles**: See `styles.css` for dark theme design
- **Main Project**: See `../software/backend/README.md` for full backend
- **Ingest Server**: See `../hardware/iot-ingest/README.md` for real ingest service

## Development

### Hot Reload Backend

```powershell
cd server
npm install -g nodemon
nodemon server.js
```

### Debug Frontend

1. Open browser DevTools (F12)
2. Check Console for logs
3. Check Network tab to see polling requests
4. Check Application > Local Storage for saved settings

## Next Steps

1. Integrate with the real IoT ingest server (`hardware/iot-ingest`)
2. Connect to the real backend (`software/backend`)
3. Deploy to production with proper error handling and monitoring
