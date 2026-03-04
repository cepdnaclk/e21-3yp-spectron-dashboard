# Spectron Mobile App

React Native mobile application for the Spectron modular monitoring kit.

## Features

- **Authentication**: Sign in and sign up
- **Controller Management**: Pair controllers via QR code scanning
- **Sensor Configuration**: Configure sensors with AI-powered suggestions
- **Monitoring Dashboard**: View real-time data and analytics
- **Alerts**: Receive and manage alerts for threshold breaches and sensor failures
- **Modern UI**: Built with React Native Paper for a clean, Material Design interface

## Tech Stack

- **React Native** 0.73.0
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **Axios** for API calls
- **AsyncStorage** for local storage
- **React Native QR Code Scanner** for QR code scanning
- **Date-fns** for date formatting

## Setup

### Prerequisites

- Node.js 18+
- React Native development environment set up
- iOS Simulator (for Mac) or Android Emulator
- Backend API running (see backend README)

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. For iOS (Mac only):

```bash
cd ios && pod install && cd ..
```

3. Configure API URL:

Update `src/config/api.ts` with your backend API URL, or set environment variables.

### Running the App

#### iOS

```bash
npm run ios
# or
yarn ios
```

#### Android

```bash
npm run android
# or
yarn android
```

## Project Structure

```
mobile/
├── src/
│   ├── config/          # Configuration files
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── navigation/     # Navigation setup
│   ├── screens/         # Screen components
│   │   ├── auth/       # Authentication screens
│   │   └── main/       # Main app screens
│   └── services/       # API services
├── App.tsx             # Root component
└── index.js            # Entry point
```

## Key Features Explained

### Authentication Flow

1. User signs in or registers
2. JWT token is stored securely using AsyncStorage
3. Token is automatically included in all API requests
4. Auth context provides user state throughout the app

### Controller Pairing

1. User scans QR code from ESP32 controller
2. QR token is sent to backend
3. Controller is paired with user's account
4. Controller appears in controllers list

### Sensor Configuration

1. User selects a sensor to configure
2. Enters purpose description (natural language)
3. AI suggests configuration based on purpose
4. User can edit and save configuration
5. Configuration is sent to backend and then to controller

### Alerts

- Real-time alerts for threshold breaches
- Sensor offline detection
- Controller offline detection
- Alert acknowledgment

## API Integration

The app communicates with the Go backend API. Make sure the backend is running and accessible. Update the API base URL in `src/config/api.ts`.

## Development Notes

- All API calls are handled through service files in `src/services/`
- Navigation is set up using React Navigation
- UI components use React Native Paper for consistency
- TypeScript is used throughout for type safety

## Future Enhancements

- Real-time data visualization with charts
- Push notifications
- Offline mode support
- Sensor grouping UI
- Advanced analytics dashboard
