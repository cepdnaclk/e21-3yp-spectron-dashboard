/**
 * API Configuration
 * 
 * This file contains the base URL and configuration for API calls.
 * Update API_BASE_URL to point to your backend server.
 * 
 * IMPORTANT: For physical devices (Expo Go), you need to:
 * 1. Find your computer's IP address:
 *    - Windows: Run `ipconfig` and look for "IPv4 Address"
 *    - Mac/Linux: Run `ifconfig` or `ip addr`
 * 2. Make sure your phone and computer are on the same Wi-Fi network
 * 3. Update the IP_ADDRESS below with your computer's IP
 * 4. Make sure the backend server is running on port 8080
 */

// ============================================
// MOCK DATA MODE - Set to true to use mock data
// ============================================
export const USE_MOCK_DATA = true; // Set to false to use real backend

// TODO: Replace with your computer's IP address when using Expo Go on a physical device
// Found IPs: 10.191.123.149 (likely your Wi-Fi), 192.168.56.1, 172.29.96.1
// If 10.191.123.149 doesn't work, try the others or find your Wi-Fi IP with: ipconfig
const YOUR_COMPUTER_IP = '10.141.69.149'; // CHANGE THIS if needed

// NOTE: Port 8080 is used by a system service, so backend runs on 8081
const BACKEND_PORT = '8081'; // Changed from 8080 to 8081

// For Android emulator, use 'http://10.0.2.2:8081'
// For iOS simulator, use 'http://localhost:8081'
// For physical device (Expo Go), use your computer's IP address
export const API_BASE_URL = __DEV__
  ? `http://${YOUR_COMPUTER_IP}:${BACKEND_PORT}` // Change YOUR_COMPUTER_IP above
  : 'https://api.spectron.com'; // Production URL

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  // Controllers
  CONTROLLERS: {
    LIST: '/controllers',
    GET: (id: string) => `/controllers/${id}`,
    PAIR: '/controllers/pair',
    UPDATE: (id: string) => `/controllers/${id}`,
    SHARE: (id: string) => `/controllers/${id}/share`,
  },
  // Sensors
  SENSORS: {
    LIST: (controllerId: string) => `/controllers/${controllerId}/sensors`,
    GET: (id: string) => `/sensors/${id}`,
    AI_SUGGEST: (id: string) => `/sensors/${id}/ai-suggest-config`,
    CONFIG: (id: string) => `/sensors/${id}/config`,
  },
  // Groups
  GROUPS: {
    LIST: (controllerId: string) => `/controllers/${controllerId}/groups`,
    CREATE: (controllerId: string) => `/controllers/${controllerId}/groups`,
    ADD_SENSOR: (groupId: string) => `/groups/${groupId}/sensors`,
  },
  // Dashboard
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    CONTROLLER: (id: string) => `/controllers/${id}/dashboard`,
  },
  // Readings
  READINGS: {
    GET: (sensorId: string) => `/sensors/${sensorId}/readings`,
  },
  // Alerts
  ALERTS: {
    LIST: '/alerts',
    ACK: (id: string) => `/alerts/${id}/ack`,
  },
};
