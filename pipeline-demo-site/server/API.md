# Sample Packet Data & API Reference

## Backend API Endpoints

### 1. GET /uploads.json
Main endpoint for the frontend demo. Returns the most recent 50 uploads.

**Example Request:**
```bash
curl http://localhost:8080/uploads.json
```

**Example Response:**
```json
[
  {
    "id": 5,
    "device_id": "CTRL-001",
    "ts": 1713990120,
    "received_at": "2025-04-24T14:35:20.123Z",
    "payload_preview": "{\"deviceId\":\"CTRL-001\",\"ts\":1713990120,\"sensors\":[{\"id\":\"sensor-TEMP-42\",\"type\":\"temperature\",\"v\":28.5,\"u\":\"°C\"}],\"location\":\"Greenhouse A\",\"status\":\"ok\"}",
    "status": "received"
  },
  {
    "id": 4,
    "device_id": "CTRL-DEMO-ESP32",
    "ts": 1713990050,
    "received_at": "2025-04-24T14:34:50.456Z",
    "payload_preview": "{\"deviceId\":\"CTRL-DEMO-ESP32\",\"ts\":1713990050,\"sensors\":[{\"id\":\"sensor-HUM-15\",\"type\":\"humidity\",\"v\":65.3,\"u\":\"%\"}],\"location\":\"Warehouse B\",\"status\":\"ok\"}",
    "status": "received"
  }
]
```

### 2. GET /api/packets
Alternative JSON endpoint (same data as /uploads.json but wrapped).

**Example Request:**
```bash
curl http://localhost:8080/api/packets
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "device_id": "CTRL-001",
      ...
    }
  ],
  "count": 5
}
```

### 3. POST /api/packets/generate
Manually trigger the generation of a new simulated packet.

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/packets/generate
```

**Example Response:**
```json
{
  "success": true,
  "packet": {
    "id": 6,
    "device_id": "SENSOR-GATEWAY-01",
    "ts": 1713990180,
    "received_at": "2025-04-24T14:36:20.789Z",
    "payload_preview": "{\"deviceId\":\"SENSOR-GATEWAY-01\",\"ts\":1713990180,\"sensors\":[{\"id\":\"sensor-MOT-08\",\"type\":\"motion\",\"v\":1,\"u\":\"motion\"}],\"location\":\"Lab 1\",\"status\":\"ok\"}",
    "status": "received"
  }
}
```

### 4. DELETE /api/packets
Clear all stored uploads (useful for testing).

**Example Request:**
```bash
curl -X DELETE http://localhost:8080/api/packets
```

**Example Response:**
```json
{
  "success": true,
  "message": "All uploads cleared"
}
```

### 5. GET /health
Health check endpoint.

**Example Request:**
```bash
curl http://localhost:8080/health
```

**Example Response:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "uploadCount": 5,
  "timestamp": "2025-04-24T14:36:30.000Z"
}
```

## Upload Object Structure

Each upload object represents a single packet that was received:

```typescript
{
  id: number;                    // Unique upload ID (incremental)
  device_id: string;             // Device identifier (e.g., "CTRL-001")
  ts: number;                    // Unix timestamp from device (seconds)
  received_at: string;           // ISO 8601 timestamp when received (UTC)
  payload_preview: string;       // JSON stringified sensor payload
  status: "received" | string;   // Status of the upload
}
```

## Payload Format (Inside payload_preview)

The payload_preview field contains a JSON-stringified object matching Spectron's IoT format:

```json
{
  "deviceId": "CTRL-001",
  "ts": 1713990120,
  "sensors": [
    {
      "id": "sensor-TEMP-42",
      "type": "temperature",
      "v": 28.5,
      "u": "°C"
    },
    {
      "id": "sensor-HUM-42",
      "type": "humidity",
      "v": 65.3,
      "u": "%"
    }
  ],
  "location": "Greenhouse A",
  "status": "ok"
}
```

## Simulated Sensor Types

The backend generates realistic data for these sensor types:

| Type | Values | Unit | Range |
|------|--------|------|-------|
| temperature | 5-40 | °C | Random realistic range |
| humidity | 0-100 | % | Random 0-100 |
| motion | 0 or 1 | motion | 70% no motion, 30% motion |
| pressure | 980-1080 | hPa | Realistic atmospheric range |
| light_intensity | 0-100,000 | lux | Random 0-100k |
| soil_moisture | 0-100 | % | Random 0-100 |

## Device IDs

The backend randomly selects from these device IDs:

- `CTRL-001`
- `CTRL-002`
- `CTRL-DEMO-ESP32`
- `SENSOR-GATEWAY-01`

## Locations

Random locations for context:

- Greenhouse A
- Warehouse B
- Lab 1
- Field Zone 3
- Storage Room 2

## Pipeline Stages

Packets animate through these 6 stages:

1. **Device / Sensor** - ESP32/SIM800 assembles payload
2. **Ingest Server** - HTTP upload received
3. **Validation** - Schema and data type checking
4. **Processing / Rules Engine** - Rule evaluation
5. **Storage / Database** - PostgreSQL write
6. **Dashboard / Output** - Real-time display

## Example Full Workflow

### Step 1: Request uploads
```powershell
curl http://localhost:8080/uploads.json | ConvertFrom-Json | ConvertTo-Json
```

### Step 2: Generate a new packet
```powershell
curl -X POST http://localhost:8080/api/packets/generate | ConvertFrom-Json | ConvertTo-Json
```

### Step 3: See the new packet in uploads
```powershell
curl http://localhost:8080/uploads.json | ConvertFrom-Json | Select-Object -First 1 | ConvertTo-Json
```

### Step 4: Parse the payload
```powershell
$uploads = curl http://localhost:8080/uploads.json | ConvertFrom-Json
$payload = $uploads[0].payload_preview | ConvertFrom-Json
$payload | ConvertTo-Json
```

## Environment Variables

Configure the backend with these variables:

```powershell
# Server port (default: 8080)
$env:PORT = "8080"

# Enable/disable auto-generation (default: true)
$env:AUTO_GENERATE = "true"

# Interval between auto-generated packets in ms (default: 5000)
$env:AUTO_GENERATE_INTERVAL = "5000"
```

## Testing with curl

### Windows PowerShell

```powershell
# Get all uploads
curl http://localhost:8080/uploads.json

# Generate a packet
curl -X POST http://localhost:8080/api/packets/generate

# Check health
curl http://localhost:8080/health

# Clear all
curl -X DELETE http://localhost:8080/api/packets
```

### Linux/macOS bash

```bash
# Get all uploads
curl http://localhost:8080/uploads.json

# Generate a packet
curl -X POST http://localhost:8080/api/packets/generate

# Check health
curl http://localhost:8080/health

# Clear all
curl -X DELETE http://localhost:8080/api/packets
```

## Performance Notes

- In-memory storage (data is lost on server restart)
- Max 1000 uploads kept in memory (oldest deleted when exceeded)
- No database required for mock backend
- Frontend polls every 3 seconds (configurable)
- Packets auto-generate every 5 seconds (configurable, disable with `AUTO_GENERATE=false`)

## Future: Real Backend Integration

To integrate with the real Spectron backend:

1. Replace `/uploads.json` endpoint with actual Spectron API
2. Connect to real PostgreSQL database
3. Integrate with real IoT devices instead of mock generation
4. Add authentication/authorization
5. Log to real monitoring systems
