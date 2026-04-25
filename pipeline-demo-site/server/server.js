const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for the demo site
app.use(cors());
app.use(express.json());

// In-memory storage for uploads (simulating the ingest server)
let uploads = [];
let uploadCounter = 0;

// Simulated device IDs and sensor types for realistic demo data
const DEVICE_IDS = ['CTRL-001', 'CTRL-002', 'CTRL-DEMO-ESP32', 'SENSOR-GATEWAY-01'];
const SENSOR_TYPES = ['temperature', 'humidity', 'motion', 'pressure', 'light_intensity', 'soil_moisture'];
const LOCATIONS = ['Greenhouse A', 'Warehouse B', 'Lab 1', 'Field Zone 3', 'Storage Room 2'];
const UNITS = ['°C', '%', 'motion', 'hPa', 'lux', '%'];

/**
 * Generate a realistic sensor reading packet
 */
function generatePacket() {
  const deviceId = DEVICE_IDS[Math.floor(Math.random() * DEVICE_IDS.length)];
  const sensorType = SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)];
  const unitIndex = SENSOR_TYPES.indexOf(sensorType);
  const unit = UNITS[unitIndex];
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

  // Generate realistic values based on sensor type
  let value;
  switch (sensorType) {
    case 'temperature':
      value = (Math.random() * 35 + 5).toFixed(1); // 5-40°C
      break;
    case 'humidity':
      value = (Math.random() * 100).toFixed(1); // 0-100%
      break;
    case 'motion':
      value = Math.random() > 0.7 ? 1 : 0; // 70% chance no motion
      break;
    case 'pressure':
      value = (Math.random() * 100 + 980).toFixed(1); // 980-1080 hPa
      break;
    case 'light_intensity':
      value = (Math.random() * 100000).toFixed(0); // 0-100k lux
      break;
    case 'soil_moisture':
      value = (Math.random() * 100).toFixed(1); // 0-100%
      break;
    default:
      value = Math.random() * 100;
  }

  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000); // Unix timestamp in seconds

  // Create payload that matches Spectron's expected format
  const payload = {
    deviceId,
    ts: timestamp,
    sensors: [
      {
        id: `sensor-${sensorType.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 99) + 1}`,
        type: sensorType,
        v: parseFloat(value),
        u: unit,
      },
    ],
    location,
    status: 'ok',
  };

  uploadCounter++;
  const uploadId = uploadCounter;

  return {
    id: uploadId,
    device_id: deviceId,
    ts: timestamp,
    received_at: now.toISOString(),
    payload_preview: JSON.stringify(payload),
    status: 'received',
  };
}

/**
 * GET /uploads.json
 * Returns the most recent uploads (newest first)
 */
app.get('/uploads.json', (req, res) => {
  res.json(uploads.slice(0, 50)); // Return max 50 recent uploads
});

/**
 * GET /api/packets
 * Alternative endpoint, returns same data as /uploads.json
 */
app.get('/api/packets', (req, res) => {
  res.json({
    success: true,
    data: uploads.slice(0, 50),
    count: uploads.length,
  });
});

/**
 * POST /api/packets/generate
 * Generate a new simulated packet
 */
app.post('/api/packets/generate', (req, res) => {
  const packet = generatePacket();
  uploads.unshift(packet); // Add to front of array (newest first)
  if (uploads.length > 1000) {
    uploads = uploads.slice(0, 1000); // Keep max 1000 uploads in memory
  }
  res.json({
    success: true,
    packet,
  });
});

/**
 * DELETE /api/packets
 * Clear all uploads
 */
app.delete('/api/packets', (req, res) => {
  uploads = [];
  uploadCounter = 0;
  res.json({
    success: true,
    message: 'All uploads cleared',
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    uploadCount: uploads.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /
 * Welcome message
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Spectron Pipeline Mock Backend',
    endpoints: {
      'GET /uploads.json': 'Get recent uploads (newest first, max 50)',
      'GET /api/packets': 'Alternative endpoint returning uploads',
      'POST /api/packets/generate': 'Generate a new simulated packet',
      'DELETE /api/packets': 'Clear all uploads',
      'GET /health': 'Health check',
    },
    note: 'The frontend at http://localhost:4173 will connect to this server and poll for packets.',
  });
});

// Auto-generate packets every 5 seconds (optional for demo)
const AUTO_GENERATE_INTERVAL = process.env.AUTO_GENERATE_INTERVAL || 5000;
const AUTO_GENERATE = process.env.AUTO_GENERATE !== 'false';

if (AUTO_GENERATE) {
  setInterval(() => {
    const packet = generatePacket();
    uploads.unshift(packet);
    if (uploads.length > 1000) {
      uploads = uploads.slice(0, 1000);
    }
    console.log(`[${new Date().toISOString()}] Generated packet: ${packet.device_id}`);
  }, AUTO_GENERATE_INTERVAL);
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Spectron Pipeline Mock Backend                            ║
╠════════════════════════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}                      
║  
║  Endpoints:                                                ║
║    GET  /uploads.json              (for the demo frontend)  ║
║    GET  /api/packets               (JSON endpoint)          ║
║    POST /api/packets/generate      (create new packet)      ║
║    DELETE /api/packets             (clear all)              ║
║    GET  /health                    (health check)           ║
║                                                              ║
║  Auto-generate: ${AUTO_GENERATE ? 'ENABLED (every ' + AUTO_GENERATE_INTERVAL + 'ms)' : 'DISABLED'}             
║                                                              ║
║  Connect the frontend:                                      ║
║    http://localhost:4173                                    ║
║    Enter: http://localhost:${PORT}                                
║                                                              ║
╚════════════════════════════════════════════════════════════╝
  `);
});
