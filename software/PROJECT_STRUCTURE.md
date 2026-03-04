# Spectron Project Structure

This document outlines the complete project structure for the Spectron modular monitoring kit.

## Project Overview

Spectron is a modular monitoring kit designed for non-technical users. It consists of:
- **Backend**: Go-based API server with PostgreSQL + TimescaleDB
- **Mobile App**: React Native application for iOS and Android
- **Hardware**: ESP32 main controllers with ESP32C3 sensor nodes

## Directory Structure

```
spectron/
├── cmd/
│   └── api/              # Go backend entry point
│       └── main.go
├── internal/             # Go backend internal packages
│   ├── config/          # Configuration management
│   ├── db/              # Database connection
│   └── httpapi/         # HTTP API routes
├── migrations/           # Database migrations
│   └── 001_init.sql     # Initial schema
├── mobile/               # React Native mobile app
│   ├── src/
│   │   ├── config/      # App configuration
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── navigation/  # Navigation setup
│   │   ├── screens/     # Screen components
│   │   │   ├── auth/    # Authentication screens
│   │   │   └── main/    # Main app screens
│   │   ├── services/    # API service layer
│   │   └── types/       # TypeScript types
│   ├── App.tsx          # Root component
│   └── package.json
├── go.mod               # Go module file
└── README.md            # Project documentation
```

## Backend (Go)

### Key Components

1. **API Server** (`cmd/api/main.go`)
   - HTTP server setup
   - Graceful shutdown
   - Configuration loading

2. **Database** (`internal/db/`)
   - PostgreSQL connection pool
   - TimescaleDB integration for time-series data

3. **Configuration** (`internal/config/`)
   - Environment variable management
   - Database URL construction

4. **HTTP API** (`internal/httpapi/`)
   - REST API routes
   - Health check endpoint

### Database Schema

- **accounts**: User accounts
- **users**: User authentication
- **account_memberships**: User-account relationships with roles
- **controllers**: ESP32 main controllers
- **sensors**: Sensor devices
- **sensor_groups**: Sensor groupings for purposes
- **sensor_configs**: Sensor configurations
- **controller_configs**: Controller configurations
- **sensor_readings**: Time-series sensor data (TimescaleDB hypertable)
- **alerts**: System alerts and notifications

## Mobile App (React Native)

### Key Features

1. **Authentication**
   - Sign in / Sign up screens
   - JWT token management
   - Auth context for global state

2. **Controller Management**
   - List all controllers
   - QR code scanning for pairing
   - Controller dashboard

3. **Sensor Configuration**
   - View sensors per controller
   - Configure sensors with AI suggestions
   - Purpose-based configuration

4. **Monitoring**
   - Dashboard view
   - Real-time data (to be implemented)
   - Charts and visualization (to be implemented)

5. **Alerts**
   - View all alerts
   - Acknowledge alerts
   - Filter by type/severity

### Tech Stack

- React Native 0.73.0
- TypeScript
- React Navigation
- React Native Paper (Material Design)
- Axios for API calls
- AsyncStorage for local storage

## Data Flow

### Controller Pairing Flow

1. User signs in to mobile app
2. User scans QR code from ESP32 controller
3. Mobile app sends QR token to backend
4. Backend creates/links controller to user's account
5. Controller appears in controllers list

### Sensor Discovery Flow

1. ESP32 controller detects connected sensors
2. Controller publishes discovery JSON to MQTT
3. MQTT → Kafka bridge forwards to Kafka
4. Backend discovery service processes discovery
5. Sensors appear in controller dashboard

### Configuration Flow

1. User selects sensor to configure
2. User enters purpose description
3. Mobile app requests AI suggestion from backend
4. Backend AI service suggests configuration
5. User reviews/edits and saves configuration
6. Configuration sent to backend
7. Backend sends configuration to controller via MQTT

### Data Monitoring Flow

1. Sensors send readings to controller
2. Controller publishes to MQTT
3. MQTT → Kafka → Backend telemetry service
4. Data stored in TimescaleDB
5. Alert service checks thresholds
6. Alerts created and notifications sent
7. Mobile app displays data and alerts

## Next Steps

### Backend Implementation Needed

1. **Authentication**
   - JWT token generation/validation
   - Password hashing
   - User registration/login endpoints

2. **Controller Endpoints**
   - Pair controller (QR code)
   - List controllers
   - Get controller details
   - Update controller

3. **Sensor Endpoints**
   - List sensors for controller
   - Get sensor details
   - AI suggestion endpoint
   - Save sensor configuration

4. **Kafka Integration**
   - Discovery service consumer
   - Telemetry service consumer
   - Alert service consumer

5. **AI Service Integration**
   - Purpose analysis
   - Configuration suggestion logic

6. **Notification Service**
   - Email notifications
   - SMS notifications
   - Push notifications

### Mobile App Enhancements Needed

1. **Real-time Data**
   - WebSocket connection for live updates
   - Chart visualization
   - Historical data views

2. **Sensor Grouping UI**
   - Create sensor groups
   - Assign purposes to groups
   - Group-based dashboards

3. **Push Notifications**
   - Capacitor push plugin
   - Notification handling
   - Background updates

4. **Offline Support**
   - Cache data locally
   - Queue actions when offline
   - Sync when online

## Development Setup

### Backend

1. Install Go 1.22+
2. Set up PostgreSQL with TimescaleDB
3. Run migrations
4. Configure environment variables
5. Run: `go run ./cmd/api`

### Mobile App

1. Install Node.js 18+
2. Install React Native CLI
3. Install dependencies: `npm install`
4. For iOS: `cd ios && pod install`
5. Run: `npm run ios` or `npm run android`

## API Endpoints (Planned)

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Controllers
- `GET /controllers` - List controllers
- `GET /controllers/:id` - Get controller
- `POST /controllers/pair` - Pair controller
- `PATCH /controllers/:id` - Update controller

### Sensors
- `GET /controllers/:id/sensors` - List sensors
- `GET /sensors/:id` - Get sensor
- `POST /sensors/:id/ai-suggest-config` - Get AI suggestion
- `POST /sensors/:id/config` - Save configuration

### Dashboard
- `GET /dashboard/overview` - Overview dashboard
- `GET /controllers/:id/dashboard` - Controller dashboard
- `GET /sensors/:id/readings` - Sensor readings

### Alerts
- `GET /alerts` - List alerts
- `POST /alerts/:id/ack` - Acknowledge alert

## Notes

- The mobile app is ready for integration once backend endpoints are implemented
- All API service methods are defined and ready to use
- UI components follow Material Design principles
- Code is well-documented and easy to understand
- TypeScript provides type safety throughout
