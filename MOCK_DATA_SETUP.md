# Mock Data Setup - Frontend Testing

## ✅ Mock Data System Implemented

I've set up a complete mock data system for the frontend so you can test the app without needing the backend.

## How It Works

### 1. Toggle Mock Data Mode

**File:** `mobile/src/config/api.ts`

```typescript
export const USE_MOCK_DATA = true; // Set to false to use real backend
```

- **`true`** = Use mock data (no backend needed)
- **`false`** = Use real backend API

### 2. Mock Data Included

The mock system includes:

- ✅ **3 Controllers** (Garbage Bin Monitor, Temperature Monitor, Air Quality Monitor)
- ✅ **6 Sensors** (Ultrasonic, Load Cell, Gas, Temperature, Humidity, Air Quality)
- ✅ **3 Alerts** (Threshold breach, Sensor offline, Acknowledged alert)
- ✅ **User Data** (Test user with account)
- ✅ **Dashboard Data** (Overview stats, controller dashboards)
- ✅ **Sensor Readings** (Generated realistic time-series data)
- ✅ **AI Suggestions** (Mock AI configuration suggestions)

### 3. Features

- **Realistic Data**: Mock data matches real API response format
- **Network Delays**: Simulates real API delays (300ms - 2s)
- **Token Management**: Mock authentication tokens
- **State Persistence**: Mock data persists during app session
- **Error Handling**: Works with existing error handling

## Mock Data Details

### Controllers
1. **Garbage Bin Monitor - Main Entrance** (ONLINE)
   - 3 sensors: Ultrasonic, Load Cell, Gas Sensor
2. **Temperature Monitor - Office** (ONLINE)
   - 2 sensors: Temperature, Humidity
3. **Air Quality Monitor - Warehouse** (OFFLINE)
   - 1 sensor: Air Quality

### Alerts
- Garbage bin 85% full (WARN, unacknowledged)
- Air quality sensor offline (CRITICAL, unacknowledged)
- Odor levels elevated (INFO, acknowledged)

### User
- Email: `test@spectron.com`
- Phone: `+1234567890`
- Role: OWNER

## Testing the App

### Step 1: Enable Mock Data
```typescript
// mobile/src/config/api.ts
export const USE_MOCK_DATA = true;
```

### Step 2: Start the App
```powershell
cd mobile
npx expo start
```

### Step 3: Test Features

**Login:**
- Use any email/password (e.g., `test@test.com` / `password123`)
- Mock system accepts any credentials

**Controllers:**
- View list of 3 controllers
- See online/offline status
- Click to view controller dashboard

**Sensors:**
- View sensors for each controller
- Configure sensors
- Get AI suggestions

**Alerts:**
- View 3 alerts
- Acknowledge alerts
- Filter by type/severity

**Dashboard:**
- View overview stats
- See controller dashboards
- View sensor readings (50 data points)

## Switching to Real Backend

When ready to test with real backend:

1. **Set mock mode to false:**
   ```typescript
   export const USE_MOCK_DATA = false;
   ```

2. **Start backend:**
   ```powershell
   .\start-backend.ps1
   ```

3. **Update API URL** (if needed):
   ```typescript
   const YOUR_COMPUTER_IP = '10.191.123.149';
   ```

4. **Restart Expo:**
   ```powershell
   npx expo start --clear
   ```

## Files Created

1. **`mobile/src/config/api.ts`** - Added `USE_MOCK_DATA` flag
2. **`mobile/src/data/mockData.ts`** - All mock data definitions
3. **`mobile/src/services/mockApi.ts`** - Mock API implementations
4. **`mobile/src/services/dashboardService.ts`** - Dashboard service with mock support

## Files Updated

1. **`mobile/src/services/authService.ts`** - Added mock support
2. **`mobile/src/services/controllerService.ts`** - Added mock support
3. **`mobile/src/services/sensorService.ts`** - Added mock support
4. **`mobile/src/services/alertService.ts`** - Added mock support

## Benefits

✅ **No Backend Required** - Test frontend independently
✅ **Fast Development** - No need to wait for backend
✅ **Consistent Data** - Same data every time
✅ **Easy Testing** - Test all features without setup
✅ **Quick Switch** - Toggle between mock and real API

## Next Steps

1. ✅ Mock data is enabled by default
2. ✅ Test the app in Expo Go
3. ✅ Verify all screens work
4. ✅ Test all features
5. 🔄 When ready, switch to real backend

The app is now ready to test with mock data! 🎉
