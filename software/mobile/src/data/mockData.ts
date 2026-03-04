/**
 * Mock Data
 * 
 * This file contains mock data for testing the frontend without a backend.
 * Set USE_MOCK_DATA = true in config/api.ts to use this data.
 */

// Mock user data
export const mockUser = {
  id: 'user-1',
  email: 'test@spectron.com',
  phone: '+1234567890',
  accounts: [
    {
      id: 'account-1',
      name: 'Test Account',
      role: 'OWNER' as const,
    },
  ],
};

// Mock controllers
export const mockControllers = [
  {
    id: 'controller-1',
    account_id: 'account-1',
    hw_id: 'ESP32-001',
    name: 'Garbage Bin Monitor - Main Entrance',
    purpose: 'Monitor garbage bin levels and odor',
    location: 'Main Entrance',
    status: 'ONLINE' as const,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'controller-2',
    account_id: 'account-1',
    hw_id: 'ESP32-002',
    name: 'Temperature Monitor - Office',
    purpose: 'Monitor office temperature and humidity',
    location: 'Office Room 101',
    status: 'ONLINE' as const,
    last_seen: new Date().toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'controller-3',
    account_id: 'account-1',
    hw_id: 'ESP32-003',
    name: 'Air Quality Monitor - Warehouse',
    purpose: 'Monitor air quality in warehouse',
    location: 'Warehouse',
    status: 'OFFLINE' as const,
    last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock sensors for controller-1
export const mockSensorsController1 = [
  {
    id: 'sensor-1',
    controller_id: 'controller-1',
    hw_id: 'ULTRASONIC-001',
    type: 'ultrasonic',
    name: 'Distance Sensor',
    purpose: 'Measure garbage bin fill level',
    unit: 'cm',
    status: 'OK' as const,
    last_seen: new Date().toISOString(),
  },
  {
    id: 'sensor-2',
    controller_id: 'controller-1',
    hw_id: 'LOAD-001',
    type: 'load_cell',
    name: 'Weight Sensor',
    purpose: 'Measure garbage bin weight',
    unit: 'kg',
    status: 'OK' as const,
    last_seen: new Date().toISOString(),
  },
  {
    id: 'sensor-3',
    controller_id: 'controller-1',
    hw_id: 'GAS-001',
    type: 'gas_sensor',
    name: 'Odor Sensor',
    purpose: 'Detect garbage odor levels',
    unit: 'ppm',
    status: 'OK' as const,
    last_seen: new Date().toISOString(),
  },
];

// Mock sensors for controller-2
export const mockSensorsController2 = [
  {
    id: 'sensor-4',
    controller_id: 'controller-2',
    hw_id: 'TEMP-001',
    type: 'temperature',
    name: 'Temperature Sensor',
    purpose: 'Monitor room temperature',
    unit: '°C',
    status: 'OK' as const,
    last_seen: new Date().toISOString(),
  },
  {
    id: 'sensor-5',
    controller_id: 'controller-2',
    hw_id: 'HUMID-001',
    type: 'humidity',
    name: 'Humidity Sensor',
    purpose: 'Monitor room humidity',
    unit: '%',
    status: 'OK' as const,
    last_seen: new Date().toISOString(),
  },
];

// Mock sensors for controller-3
export const mockSensorsController3 = [
  {
    id: 'sensor-6',
    controller_id: 'controller-3',
    hw_id: 'AIR-001',
    type: 'air_quality',
    name: 'Air Quality Sensor',
    purpose: 'Monitor air quality',
    unit: 'AQI',
    status: 'OFFLINE' as const,
    last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// All mock sensors
export const mockSensors = [
  ...mockSensorsController1,
  ...mockSensorsController2,
  ...mockSensorsController3,
];

// Mock alerts
export const mockAlerts = [
  {
    id: 'alert-1',
    account_id: 'account-1',
    controller_id: 'controller-1',
    sensor_id: 'sensor-1',
    type: 'THRESHOLD_BREACH' as const,
    severity: 'WARN' as const,
    message: 'Garbage bin is 85% full',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledged_at: undefined,
  },
  {
    id: 'alert-2',
    account_id: 'account-1',
    controller_id: 'controller-3',
    sensor_id: 'sensor-6',
    type: 'SENSOR_OFFLINE' as const,
    severity: 'CRITICAL' as const,
    message: 'Air quality sensor has been offline for 2 hours',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    acknowledged_at: undefined,
  },
  {
    id: 'alert-3',
    account_id: 'account-1',
    controller_id: 'controller-1',
    sensor_id: 'sensor-3',
    type: 'THRESHOLD_BREACH' as const,
    severity: 'INFO' as const,
    message: 'Odor levels slightly elevated',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    acknowledged_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

// Mock dashboard overview
export const mockDashboardOverview = {
  controllers: 3,
  sensors: 6,
  alerts: 2, // Unacknowledged alerts
};

// Mock controller dashboard
export const mockControllerDashboard = {
  controller_id: 'controller-1',
  sensor_count: 3,
  recent_readings: 150,
};

// Mock sensor readings
export const generateMockReadings = (sensorId: string, count: number = 50) => {
  const readings = [];
  const now = Date.now();
  
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * 60 * 60 * 1000); // One reading per hour
    
    // Generate realistic values based on sensor type
    const sensor = mockSensors.find(s => s.id === sensorId);
    let value: number;
    
    if (sensor?.type === 'ultrasonic') {
      value = 20 + Math.random() * 80; // 20-100 cm
    } else if (sensor?.type === 'load_cell') {
      value = 5 + Math.random() * 45; // 5-50 kg
    } else if (sensor?.type === 'gas_sensor') {
      value = 10 + Math.random() * 90; // 10-100 ppm
    } else if (sensor?.type === 'temperature') {
      value = 18 + Math.random() * 10; // 18-28°C
    } else if (sensor?.type === 'humidity') {
      value = 40 + Math.random() * 30; // 40-70%
    } else {
      value = 50 + Math.random() * 50; // Generic 50-100
    }
    
    readings.push({
      time: time.toISOString(),
      value: Math.round(value * 100) / 100,
      meta: {
        sensor_type: sensor?.type,
      },
    });
  }
  
  return readings;
};

// Mock AI suggest response
export const mockAISuggestResponse = {
  suggested_config: {
    friendly_name: 'Garbage Level Monitor',
    thresholds: {
      min: 0,
      max: 100,
      warning_min: 70,
      warning_max: 95,
    },
    report_interval_per_day: 24,
    power_management: {
      battery_life_days: 30,
      sampling_frequency: 1,
    },
  },
  explanation: 'Based on the purpose "Measure garbage bin fill level", I suggest monitoring the distance every hour. Set warning threshold at 70% and critical at 95% to ensure timely garbage collection.',
};

// Helper to simulate network delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
