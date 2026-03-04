# Frontend (Web + Mobile)

This folder contains both clients:
- `web` (React web app)
- `mobile` (Expo React Native app)

## Common Prerequisites

- Node.js 18+ (`node -v`)
- npm (`npm -v`)
- Backend API running from `software/backend`

---

## Web App (`frontend/web`)

### Setup

```powershell
cd web
npm install
```

Create `.env` file in `frontend/web`:

```env
REACT_APP_API_URL=http://localhost:8080
```

### Run (development)

```powershell
npm start
```

### Build

```powershell
npm run build
```

### Capacitor commands (optional)

```powershell
npm run cap:sync
npm run cap:add:android
```

---

## Mobile App (`frontend/mobile`)

### Setup

```powershell
cd ..\mobile
npm install
```

Make sure backend URL in `src/config/api.ts` points to your running backend.

### Run Expo

```powershell
npm start
```

### Run Android

```powershell
npm run android
```

### Run iOS (macOS only)

```powershell
npm run ios
```

## Notes

- Start backend first, then web/mobile.
- If using a physical phone, use your PC LAN IP instead of `localhost`.
